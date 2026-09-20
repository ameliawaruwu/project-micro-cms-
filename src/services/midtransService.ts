// Service to communicate with Midtrans Snap API and Popup

export interface SnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  enabledPayments?: string[];
  items?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export interface SnapResult {
  status_code?: string;
  status_message?: string;
  transaction_id?: string;
  order_id?: string;
  gross_amount?: string;
  payment_type?: string;
  transaction_time?: string;
  transaction_status?: string;
}

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: SnapResult) => void;
          onPending?: (result: SnapResult) => void;
          onError?: (result: SnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

class MidtransService {
  private isScriptLoaded = false;

  private getClientKey(): string {
    return import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
  }

  private getEnvironment(): 'sandbox' | 'production' {
    return (import.meta.env.VITE_MIDTRANS_ENV as 'sandbox' | 'production') || 'sandbox';
  }

  async loadSnapScript(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (window.snap && typeof window.snap.pay === 'function') {
      this.isScriptLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('midtrans-snap-script') as HTMLScriptElement | null;
      if (existingScript) {
        if (window.snap && typeof window.snap.pay === 'function') {
          this.isScriptLoaded = true;
          resolve();
          return;
        }
        existingScript.addEventListener('load', () => {
          this.isScriptLoaded = true;
          resolve();
        });
        existingScript.addEventListener('error', () => {
          reject(new Error('Gagal memuat script Midtrans Snap SDK'));
        });
        // Set timeout in case neither fires
        setTimeout(() => {
          if (window.snap) {
            this.isScriptLoaded = true;
            resolve();
          } else {
            resolve();
          }
        }, 1500);
        return;
      }

      const env = this.getEnvironment();
      const clientKey = this.getClientKey();
      const scriptUrl =
        env === 'production'
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js';

      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      script.src = scriptUrl;
      script.setAttribute('data-client-key', clientKey);
      script.async = true;

      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Gagal memuat Midtrans Snap SDK. Pastikan AdBlock tidak memblokir script Midtrans.'));
      };

      document.body.appendChild(script);
    });
  }

  async createSnapToken(params: SnapTransactionParams): Promise<{ token: string; redirectUrl?: string }> {
    const response = await fetch('/api/midtrans/snap-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal membuat sesi transaksi Midtrans');
    }

    return response.json();
  }

  private renderInPagePaymentFrame(
    redirectUrl: string,
    callbacks: {
      onSuccess: (result: SnapResult) => void;
      onError?: (result: SnapResult) => void;
      onClose?: () => void;
    }
  ): void {
    const existingModal = document.getElementById('midtrans-inpage-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'midtrans-inpage-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    `;

    modal.innerHTML = `
      <div style="background: #ffffff; width: 100%; max-width: 480px; height: 680px; max-height: 90vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
          <div style="font-weight: 600; font-size: 14px; color: #1e293b;">Pembayaran Midtrans (Dalam Tab Ini)</div>
          <button id="midtrans-inpage-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b;">✕</button>
        </div>
        <iframe src="${redirectUrl}" style="flex: 1; width: 100%; border: none;"></iframe>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#midtrans-inpage-close');
    closeBtn?.addEventListener('click', () => {
      modal.remove();
      if (callbacks.onClose) callbacks.onClose();
    });
  }

  async payWithSnap(
    params: SnapTransactionParams,
    callbacks: {
      onSuccess: (result: SnapResult) => void;
      onPending?: (result: SnapResult) => void;
      onError?: (result: SnapResult) => void;
      onClose?: () => void;
    }
  ): Promise<void> {
    await this.loadSnapScript();

    const { token, redirectUrl } = await this.createSnapToken(params);

    if (!window.snap || typeof window.snap.pay !== 'function') {
      if (redirectUrl) {
        this.renderInPagePaymentFrame(redirectUrl, callbacks);
        return;
      }
      throw new Error('Midtrans Snap tidak tersedia di window browser.');
    }

    window.snap.pay(token, {
      onSuccess: (result) => callbacks.onSuccess(result),
      onPending: (result) => {
        if (callbacks.onPending) callbacks.onPending(result);
      },
      onError: (result) => {
        if (callbacks.onError) {
          callbacks.onError(result);
        } else {
          alert('Pembayaran Midtrans gagal atau dibatalkan.');
        }
      },
      onClose: () => {
        if (callbacks.onClose) callbacks.onClose();
      },
    });
  }

  /**
   * Check payment status from Midtrans API via backend proxy
   */
  async checkTransactionStatus(orderId: string): Promise<{
    success: boolean;
    isPaid: boolean;
    transactionStatus?: string;
    isTimeout?: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/midtrans/status?orderId=${encodeURIComponent(orderId)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          isPaid: false,
          error: errorData.error || `HTTP error ${response.status}`,
        };
      }
      return await response.json();
    } catch (err: any) {
      console.warn('Failed to query Midtrans status:', err);
      return {
        success: false,
        isPaid: false,
        error: err.message || 'Network error',
      };
    }
  }
}

export const midtransService = new MidtransService();
