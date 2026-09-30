// Service to communicate with Duitku Payment Gateway (API & POP)
import { supabase } from './supabaseClient';

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
      const res = await fetch('/api/duitku/payment-methods', {
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
    statusCode: string;
    statusMessage: string;
  }> {
    let lastErrorMsg = 'Gagal membuat invoice Duitku';

    try {
      const response = await fetch('/api/duitku/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: params.orderId,
          grossAmount: params.grossAmount,
          customerName: params.customerName,
          customerEmail: params.customerEmail,
          customerPhone: params.customerPhone,
          productDetails: params.productDetails,
          paymentMethod: params.paymentMethod || '',
          items: params.items || [],
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.reference) {
        return {
          reference: resData.reference,
          paymentUrl: resData.paymentUrl || '',
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

    throw new Error(lastErrorMsg);
  }

  /**
   * Open Duitku Payment popup or fallback to smart sandbox simulator
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
    try {
      await this.loadPopScript();

      const invoice = await this.createInvoice(params);

      // 1. Prioritaskan Duitku POP resmi (window.checkout.process)
      if (window.checkout && typeof window.checkout.process === 'function') {
        window.checkout.process(invoice.reference, {
          defaultLanguage: 'id',
          successEvent: (result) => {
            callbacks.onSuccess?.(result);
          },
          pendingEvent: (result) => {
            callbacks.onPending?.(result);
          },
          errorEvent: (result) => {
            callbacks.onError?.(result);
          },
          closeEvent: (result) => {
            callbacks.onClose?.();
          },
        });
        return;
      }

      // 2. Jika POP script diblokir browser, arahkan ke paymentUrl resmi Duitku
      if (invoice.paymentUrl) {
        window.location.href = invoice.paymentUrl;
        return;
      }

      throw new Error('Duitku tidak mengembalikan referensi atau paymentUrl yang valid.');
    } catch (err: any) {
      console.error('Duitku Official Error:', err);
      callbacks.onError?.({
        resultCode: '02',
        merchantOrderId: params.orderId,
        reference: '',
        statusMessage: err.message || 'Gagal memproses pembayaran Duitku resmi',
      });
      alert(`[Duitku Official Gateway]\n${err.message || 'Gagal memproses transaksi.'}\n\nPastikan Merchant Code dan API Key Duitku yang baru sudah diisi.`);
    }
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
      const res = await fetch('/api/duitku/check-status', {
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

  /**
   * Smart Sandbox Payment Simulator Modal
   * Resilient fallback so users & merchants can test transactions smoothly
   */
  private renderSandboxSimulator(
    params: DuitkuTransactionParams,
    callbacks: {
      onSuccess?: (result: DuitkuCallbackResult) => void;
      onPending?: (result: DuitkuCallbackResult) => void;
      onError?: (result: DuitkuCallbackResult) => void;
      onClose?: () => void;
    },
    hintError?: string
  ): void {
    if (typeof document === 'undefined') return;

    const existingModal = document.getElementById('duitku-simulator-modal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'duitku-simulator-modal';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const formattedAmount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(params.grossAmount);

    overlay.innerHTML = `
      <div style="background: white; border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); overflow: hidden; animation: popIn 0.2s ease-out;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 18px 20px; color: white; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="background: white; color: #0284c7; font-weight: 900; font-size: 11px; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.5px;">
              DUITKU POP
            </div>
            <span style="font-size: 13px; font-weight: 600; opacity: 0.95;">Sandbox Payment Simulator</span>
          </div>
          <button id="sim-close-btn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; line-height: 1; padding: 4px; border-radius: 4px;">&times;</button>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          ${
            hintError
              ? `
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; margin-bottom: 16px; font-size: 11px; color: #1e40af; line-height: 1.4;">
              <strong>Info Koneksi:</strong> Kredensial Duitku Sandbox siap dihubungkan. Anda dapat mensimulasikan pembayaran instan di bawah ini.
            </div>
          `
              : ''
          }

          <div style="text-align: center; margin-bottom: 20px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Total Tagihan</span>
            <div style="font-size: 26px; font-weight: 800; color: #0f172a;">${formattedAmount}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Order ID: <code style="font-weight: 600; color: #0284c7;">${params.orderId}</code></div>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Pilih Metode Bayar Duitku</label>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              <button class="sim-method-btn" data-method="QRIS" style="padding: 10px 6px; border: 2px solid #0284c7; background: #f0f9ff; border-radius: 8px; cursor: pointer; text-align: center; font-size: 11px; font-weight: 700; color: #0369a1;">
                QRIS
              </button>
              <button class="sim-method-btn" data-method="BCA VA" style="padding: 10px 6px; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; text-align: center; font-size: 11px; font-weight: 700; color: #475569;">
                BCA VA
              </button>
              <button class="sim-method-btn" data-method="MANDIRI VA" style="padding: 10px 6px; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; text-align: center; font-size: 11px; font-weight: 700; color: #475569;">
                MANDIRI
              </button>
              <button class="sim-method-btn" data-method="BRI VA" style="padding: 10px 6px; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; text-align: center; font-size: 11px; font-weight: 700; color: #475569;">
                BRI VA
              </button>
              <button class="sim-method-btn" data-method="SHOPEEPAY" style="padding: 10px 6px; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; text-align: center; font-size: 11px; font-weight: 700; color: #475569;">
                SHOPEEPAY
              </button>
              <button class="sim-method-btn" data-method="OVO" style="padding: 10px 6px; border: 1px solid #e2e8f0; background: white; border-radius: 8px; cursor: pointer; text-align: center; font-size: 11px; font-weight: 700; color: #475569;">
                OVO
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
            <button id="sim-pay-success" style="width: 100%; padding: 12px; background: #0284c7; color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.25); display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>Bayar Sukses (Simulasi Duitku 00)</span>
            </button>
            <div style="display: flex; gap: 8px;">
              <button id="sim-pay-pending" style="flex: 1; padding: 9px; background: #f8fafc; border: 1px solid #cbd5e1; color: #475569; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
                Pending (01)
              </button>
              <button id="sim-pay-failed" style="flex: 1; padding: 9px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
                Gagal / Batal (02)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    let selectedMethod = 'QRIS';
    const methodBtns = overlay.querySelectorAll('.sim-method-btn');
    methodBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        methodBtns.forEach((b: any) => {
          b.style.border = '1px solid #e2e8f0';
          b.style.background = 'white';
          b.style.color = '#475569';
        });
        const target = btn as HTMLElement;
        target.style.border = '2px solid #0284c7';
        target.style.background = '#f0f9ff';
        target.style.color = '#0369a1';
        selectedMethod = target.getAttribute('data-method') || 'QRIS';
      });
    });

    const cleanup = () => {
      overlay.remove();
    };

    overlay.querySelector('#sim-close-btn')?.addEventListener('click', () => {
      cleanup();
      callbacks.onClose?.();
    });

    overlay.querySelector('#sim-pay-success')?.addEventListener('click', () => {
      cleanup();
      const mockResult: DuitkuCallbackResult = {
        resultCode: '00',
        merchantOrderId: params.orderId,
        reference: `DUITKU-${Date.now()}-${selectedMethod}`,
        statusMessage: 'SUCCESS',
      };
      callbacks.onSuccess?.(mockResult);
    });

    overlay.querySelector('#sim-pay-pending')?.addEventListener('click', () => {
      cleanup();
      const mockResult: DuitkuCallbackResult = {
        resultCode: '01',
        merchantOrderId: params.orderId,
        reference: `DUITKU-${Date.now()}-${selectedMethod}`,
        statusMessage: 'PENDING',
      };
      callbacks.onPending?.(mockResult);
    });

    overlay.querySelector('#sim-pay-failed')?.addEventListener('click', () => {
      cleanup();
      const mockResult: DuitkuCallbackResult = {
        resultCode: '02',
        merchantOrderId: params.orderId,
        reference: `DUITKU-${Date.now()}-${selectedMethod}`,
        statusMessage: 'CANCELED',
      };
      callbacks.onError?.(mockResult);
    });
  }
}

export const duitkuService = new DuitkuService();
