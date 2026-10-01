// Service to communicate with Duitku Payment Gateway (API & POP)
import { supabase } from './supabaseClient';
import { getApiEndpoint } from '../utils/apiConfig';

export interface DuitkuItemDetail {
  name: string;
  price: number;
  quantity: number;
}

export interface DuitkuTransactionParams {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  productDetails?: string;
  paymentMethod?: string;
  items?: Array<{
    id?: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface DuitkuCallbackResult {
  resultCode: string;
  merchantOrderId: string;
  reference: string;
  statusMessage?: string;
}

export interface DuitkuPaymentMethod {
  paymentMethod: string;
  paymentName: string;
  paymentImage: string;
  totalFee: string;
}

declare global {
  interface Window {
    checkout?: {
      process: (
        duitkuReference: string,
        options: {
          defaultLanguage?: 'id' | 'en';
          currency?: string;
          successEvent?: (result: DuitkuCallbackResult) => void;
          pendingEvent?: (result: DuitkuCallbackResult) => void;
          errorEvent?: (result: DuitkuCallbackResult) => void;
          closeEvent?: (result: DuitkuCallbackResult) => void;
        }
      ) => void;
    };
  }
}

class DuitkuService {
  private isScriptLoaded = false;

  private getEnvironment(): 'sandbox' | 'production' {
    return (import.meta.env.VITE_DUITKU_ENV as 'sandbox' | 'production') || 'sandbox';
  }

  /**
   * Load Duitku POP JavaScript Library
   */
  async loadPopScript(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (window.checkout && typeof window.checkout.process === 'function') {
      this.isScriptLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('duitku-pop-script') as HTMLScriptElement | null;
      if (existingScript) {
        if (window.checkout && typeof window.checkout.process === 'function') {
          this.isScriptLoaded = true;
          resolve();
          return;
        }
        existingScript.addEventListener('load', () => {
          this.isScriptLoaded = true;
          resolve();
        });
        existingScript.addEventListener('error', () => {
          reject(new Error('Gagal memuat script Duitku POP'));
        });
        setTimeout(() => {
          this.isScriptLoaded = true;
          resolve();
        }, 1500);
        return;
      }

      const env = this.getEnvironment();
      const scriptUrl =
        env === 'production'
          ? 'https://app-prod.duitku.com/lib/js/duitku.js'
          : 'https://app-sandbox.duitku.com/lib/js/duitku.js';

      const script = document.createElement('script');
      script.id = 'duitku-pop-script';
      script.src = scriptUrl;
      script.async = true;

      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        console.warn('Gagal memuat Duitku POP script dari CDN, akan menggunakan direct paymentUrl.');
        resolve();
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Fetch active payment channels from Duitku (QRIS, VA BCA, Mandiri, E-Wallet, dll.)
   */
  async getPaymentMethods(amount: number): Promise<DuitkuPaymentMethod[]> {
    try {
      const endpoint = getApiEndpoint('/api/duitku/payment-methods');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(amount) }),
      });

      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.paymentFee) ? data.paymentFee : [];
    } catch {
      return [];
    }
  }

  /**
   * Create Duitku Invoice on backend (generates HMAC-SHA256 signature securely)
   */
  async createInvoice(params: DuitkuTransactionParams): Promise<{
    reference: string;
    paymentUrl: string;
    vaNumber?: string;
    qrString?: string;
    statusCode: string;
    statusMessage: string;
  }> {
    let lastErrorMsg = 'Gagal membuat invoice Duitku';
    const primaryEndpoint = getApiEndpoint('/api/duitku/create-invoice');
    const fallbackEndpoint = 'https://kroomify.kroombox.com/api/duitku/create-invoice';
    const endpointsToTry = [primaryEndpoint];
    if (primaryEndpoint !== fallbackEndpoint) {
      endpointsToTry.push(fallbackEndpoint);
    }

    const payload = JSON.stringify({
      orderId: params.orderId,
      grossAmount: params.grossAmount,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      productDetails: params.productDetails,
      paymentMethod: params.paymentMethod || 'SP',
      items: params.items || [],
    });

    for (const url of endpointsToTry) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
        });

        const rawText = await response.text();
        let resData: any = {};
        try {
          resData = JSON.parse(rawText);
        } catch {
          lastErrorMsg = `Respon server dari ${url} tidak berformat JSON (HTTP ${response.status}).`;
          continue;
        }

        if (response.ok && resData.reference) {
          return {
            reference: resData.reference,
            paymentUrl: resData.paymentUrl || '',
            vaNumber: resData.vaNumber,
            qrString: resData.qrString,
            statusCode: resData.statusCode || '00',
            statusMessage: resData.statusMessage || 'SUCCESS',
          };
        }

        if (resData.message) {
          lastErrorMsg = resData.message;
        }
      } catch (err: any) {
        lastErrorMsg = err.message || lastErrorMsg;
      }
    }

    throw new Error(lastErrorMsg);
  }

  /**
   * Open official Duitku Payment popup (POP) or redirect to official Duitku payment page
   */
  async payWithDuitku(
    params: DuitkuTransactionParams,
    callbacks: {
      onSuccess?: (result: DuitkuCallbackResult) => void;
      onPending?: (result: DuitkuCallbackResult) => void;
      onError?: (result: DuitkuCallbackResult) => void;
      onClose?: () => void;
    }
  ): Promise<void> {
    await this.loadPopScript();

    const invoice = await this.createInvoice(params);

    // 1. Prioritaskan Duitku POP resmi (window.checkout.process)
    if (window.checkout && typeof window.checkout.process === 'function') {
      try {
        window.checkout.process(invoice.reference, {
          defaultLanguage: 'id',
          successEvent: (result: any) => {
            callbacks.onSuccess?.({
              resultCode: result?.resultCode || '00',
              merchantOrderId: result?.merchantOrderId || params.orderId,
              reference: result?.reference || invoice.reference,
              statusMessage: result?.statusMessage || 'SUCCESS',
            });
          },
          pendingEvent: (result: any) => {
            callbacks.onPending?.({
              resultCode: result?.resultCode || '01',
              merchantOrderId: result?.merchantOrderId || params.orderId,
              reference: result?.reference || invoice.reference,
              statusMessage: result?.statusMessage || 'PENDING',
            });
          },
          errorEvent: (result: any) => {
            callbacks.onError?.({
              resultCode: result?.resultCode || '02',
              merchantOrderId: result?.merchantOrderId || params.orderId,
              reference: result?.reference || invoice.reference,
              statusMessage: result?.statusMessage || 'Gagal memproses pembayaran Duitku',
            });
          },
          closeEvent: () => {
            callbacks.onClose?.();
          },
        });
        return;
      } catch (popErr) {
        console.warn('[Duitku POP Error, redirecting to paymentUrl]:', popErr);
      }
    }

    // 2. Jika POP script tidak aktif atau pop-up diblokir browser, arahkan langsung ke halaman pembayaran resmi Duitku
    if (invoice.paymentUrl) {
      window.location.href = invoice.paymentUrl;
      return;
    }

    throw new Error('Duitku tidak mengembalikan referensi atau paymentUrl yang valid.');
  }

  /**
   * Check Transaction Status on Duitku
   */
  async checkTransactionStatus(merchantOrderId: string): Promise<{
    statusCode: string;
    statusMessage: string;
    isPaid: boolean;
  }> {
    try {
      const endpoint = getApiEndpoint('/api/duitku/check-status');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantOrderId }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          statusCode: data.statusCode || '01',
          statusMessage: data.statusMessage || 'Pending',
          isPaid: data.statusCode === '00',
        };
      }
    } catch {
      // Fallback check directly in Supabase orders table
    }

    try {
      const { data } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('order_number', merchantOrderId)
        .maybeSingle();

      if (data && data.payment_status === 'paid') {
        return { statusCode: '00', statusMessage: 'SUCCESS', isPaid: true };
      }
    } catch {
      // Ignore
    }

    return { statusCode: '01', statusMessage: 'Pending', isPaid: false };
  }
}

export const duitkuService = new DuitkuService();
