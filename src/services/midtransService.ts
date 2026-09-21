// Service to communicate with real Midtrans Snap API and Popup
import { supabase } from './supabaseClient';

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
    return import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-6qHzXwHC6yMvkJ9J';
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

  /**
   * Request real Snap Token from backend (Supabase Edge Function or Local Express Proxy)
   */
  async createSnapToken(params: SnapTransactionParams): Promise<{ token: string; redirectUrl?: string }> {
    // 1. Prioritas utama: Panggil Backend Serverless Supabase Edge Function 'midtrans-snap'
    try {
      const { data, error } = await supabase.functions.invoke('midtrans-snap', {
        body: params,
      });

      if (!error && data?.token) {
        return {
          token: data.token,
          redirectUrl: data.redirectUrl,
        };
      }
      if (error) {
        console.warn('[Midtrans] Edge Function invoke failed, trying fallback endpoints:', error);
      }
    } catch (edgeErr) {
      console.warn('[Midtrans] Supabase Edge Function notice:', edgeErr);
    }

    // 2. Fallback direct HTTP fetch ke Edge Function atau Backend Server lokal (/api/midtrans/snap-token)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kaveesimezonkgvhcbln.supabase.co';
    const endpoints = [
      `${supabaseUrl}/functions/v1/midtrans-snap`,
      '/api/midtrans/snap-token',
    ];

    let lastError: any = null;
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.token) {
            return json;
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = new Error(errData.message || `Gagal menghubungi Midtrans API (${endpoint}: HTTP ${response.status})`);
        }
      } catch (networkErr: any) {
        lastError = networkErr;
      }
    }

    throw lastError || new Error('Gagal membuat sesi transaksi Midtrans. Periksa koneksi internet Anda.');
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
      <div style="background: #ffffff; width: 100%; max-width: 500px; height: 720px; max-height: 92vh; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid #e2e8f0; background: #0A2540; color: #ffffff;">
          <div style="font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <span>Pembayaran Resmi Midtrans</span>
          </div>
          <button id="midtrans-inpage-close" style="background: rgba(255,255,255,0.15); border: none; font-size: 16px; width: 28px; height: 28px; border-radius: 50%; color: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>
        <iframe src="${redirectUrl}" style="flex: 1; width: 100%; border: none;" allow="payment"></iframe>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('#midtrans-inpage-close');
    closeBtn?.addEventListener('click', () => {
      modal.remove();
      if (callbacks.onClose) callbacks.onClose();
    });
  }

  /**
   * Buka popup resmi Midtrans Snap
   */
  async payWithSnap(
    params: SnapTransactionParams,
    callbacks: {
      onSuccess: (result: SnapResult) => void;
      onPending?: (result: SnapResult) => void;
      onError?: (result: SnapResult) => void;
      onClose?: () => void;
    }
  ): Promise<void> {
    // 1. Ambil Snap Token asli dari Midtrans API melalui backend
    const { token, redirectUrl } = await this.createSnapToken(params);

    if (!token) {
      throw new Error('Gagal mendapatkan token transaksi Midtrans.');
    }

    // 2. Muat SDK resmi Midtrans Snap
    await this.loadSnapScript();

    // 3. Jika window.snap tersedia, panggil Snap Popup resmi
    if (window.snap && typeof window.snap.pay === 'function') {
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
      return;
    }

    // 4. Fallback jika window.snap diblokir browser: gunakan iframe modal atau buka redirectUrl
    if (redirectUrl) {
      this.renderInPagePaymentFrame(redirectUrl, callbacks);
      return;
    }

    throw new Error('Midtrans Snap tidak tersedia di window browser.');
  }

  /**
   * Cek status pembayaran riil langsung dari Midtrans API via backend
   */
  async checkTransactionStatus(orderId: string): Promise<{
    success: boolean;
    isPaid: boolean;
    transactionStatus?: string;
    isTimeout?: boolean;
    data?: any;
    error?: string;
  }> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kaveesimezonkgvhcbln.supabase.co';
    const endpoints = [
      `${supabaseUrl}/functions/v1/midtrans-snap?orderId=${encodeURIComponent(orderId)}`,
      `/api/midtrans/status?orderId=${encodeURIComponent(orderId)}`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const status = (data.transaction_status || data.transactionStatus || '').toLowerCase();
          const isPaid = status === 'settlement' || status === 'capture';
          return {
            success: true,
            isPaid,
            transactionStatus: status,
            data,
          };
        }
      } catch (err) {
        console.warn(`Failed to query Midtrans status from ${endpoint}:`, err);
      }
    }

    return {
      success: false,
      isPaid: false,
      error: 'Tidak dapat memeriksa status transaksi ke server Midtrans.',
    };
  }
}

export const midtransService = new MidtransService();
