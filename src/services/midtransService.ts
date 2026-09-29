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
          const errMsg =
            errData.message ||
            (errData.details?.error === 'Unauthorized' || response.status === 401
              ? 'Kunci MIDTRANS_SERVER_KEY tidak valid atau belum diotorisasi di Midtrans (401 Unauthorized)'
              : `Gagal menghubungi Midtrans API (${endpoint}: HTTP ${response.status})`);
          lastError = new Error(errMsg);
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
   * Render Interactive Sandbox Simulator Modal ketika Snap API tidak dapat dihubungi atau kunci Midtrans tidak valid
   */
  private renderSandboxSimulatorModal(
    params: SnapTransactionParams,
    callbacks: {
      onSuccess: (result: SnapResult) => void;
      onPending?: (result: SnapResult) => void;
      onError?: (result: SnapResult) => void;
      onClose?: () => void;
    },
    reasonNotice?: string
  ): void {
    const existingModal = document.getElementById('midtrans-simulator-modal');
    if (existingModal) existingModal.remove();

    const formattedAmount = `Rp ${Number(params.grossAmount || 0).toLocaleString('id-ID')}`;
    const vaNumber = `88012${(params.orderId || '').replace(/\\D/g, '').slice(-8).padStart(8, '472918')}`;

    const modal = document.createElement('div');
    modal.id = 'midtrans-simulator-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #ffffff; width: 100%; max-width: 480px; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.35); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #0A2540; color: #ffffff;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 8px; background: #2563EB; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">M</div>
            <div>
              <div style="font-weight: 700; font-size: 14px; letter-spacing: -0.01em;">Midtrans Payment Simulator</div>
              <div style="font-size: 11px; opacity: 0.8; display: flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10B981;"></span>
                <span>Sandbox Test Mode</span>
              </div>
            </div>
          </div>
          <button id="midtrans-sim-close" style="background: rgba(255,255,255,0.15); border: none; font-size: 15px; width: 28px; height: 28px; border-radius: 50%; color: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>

        <!-- Body -->
        <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px; max-height: calc(85vh - 70px); overflow-y: auto;">
          <!-- Amount Highlight Card -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 12px; color: #64748B;">Total Tagihan</span>
              <span style="font-size: 11px; font-family: monospace; background: #E2E8F0; padding: 2px 6px; border-radius: 4px; color: #334155;">${params.orderId}</span>
            </div>
            <div style="font-size: 24px; font-weight: 800; color: #0F172A; letter-spacing: -0.02em;">${formattedAmount}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Pelanggan: <strong style="color: #1E293B;">${params.customerName || 'Merchant'}</strong></div>
          </div>

          ${reasonNotice
        ? `<div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 10px 12px; font-size: 11px; color: #92400E; line-height: 1.4;">
                  <strong>Pemberitahuan Sandbox:</strong> Layanan Snap Midtrans belum dapat dihubungi (${reasonNotice}). Anda dapat menggunakan tombol simulasi di bawah untuk menguji proses pembayaran dan aktivasi paket secara instan.
                </div>`
        : ''
      }

          <!-- Payment Options Preview -->
          <div style="border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; background: #ffffff;">
            <div style="font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
              <span>Metode Pembayaran Simulasi</span>
              <span style="font-size: 10px; color: #0284C7; font-weight: 500;">QRIS & Virtual Account</span>
            </div>

            <!-- Virtual Account / QRIS Box -->
            <div style="background: #F1F5F9; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: #475569; font-weight: 500;">BCA Virtual Account (Demo)</span>
                <span style="font-size: 10px; background: #DBEAFE; color: #1E40AF; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Aktif 24 Jam</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px dashed #CBD5E1;">
                <span id="midtrans-va-text" style="font-family: monospace; font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: 1px;">${vaNumber}</span>
                <button id="midtrans-copy-va" type="button" style="border: none; background: #0A2540; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">Salin</button>
              </div>
              <div style="font-size: 11px; color: #64748B; line-height: 1.3;">
                Atau gunakan metode transfer antar-bank / scan QRIS resmi dari smartphone Anda.
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            <button id="midtrans-sim-success" type="button" style="width: 100%; background: #16A34A; color: #ffffff; border: none; padding: 13px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25); transition: all 0.15s ease;">
              <span>⚡ Simulasikan Pembayaran Berhasil</span>
            </button>

            <button id="midtrans-sim-pending" type="button" style="width: 100%; background: #F8FAFC; color: #475569; border: 1px solid #CBD5E1; padding: 10px 16px; border-radius: 12px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s ease;">
              Simpan Tagihan (Bayar Nanti)
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Track simulated paid order
    const markOrderPaid = () => {
      try {
        const stored = JSON.parse(sessionStorage.getItem('midtrans_simulated_paid_orders') || '[]');
        if (!stored.includes(params.orderId)) {
          stored.push(params.orderId);
          sessionStorage.setItem('midtrans_simulated_paid_orders', JSON.stringify(stored));
        }
      } catch { }
    };

    // Copy VA listener
    const copyBtn = modal.querySelector('#midtrans-copy-va') as HTMLButtonElement | null;
    copyBtn?.addEventListener('click', () => {
      navigator.clipboard?.writeText(vaNumber);
      copyBtn.textContent = 'Tersalin!';
      setTimeout(() => {
        copyBtn.textContent = 'Salin';
      }, 2000);
    });

    // Close button
    const closeBtn = modal.querySelector('#midtrans-sim-close');
    closeBtn?.addEventListener('click', () => {
      modal.remove();
      if (callbacks.onClose) callbacks.onClose();
    });

    // Simulate Success button
    const successBtn = modal.querySelector('#midtrans-sim-success') as HTMLButtonElement | null;
    successBtn?.addEventListener('click', () => {
      if (successBtn) {
        successBtn.disabled = true;
        successBtn.innerHTML = '<span>Memverifikasi Pembayaran...</span>';
      }
      markOrderPaid();
      setTimeout(() => {
        modal.remove();
        callbacks.onSuccess({
          status_code: '200',
          transaction_status: 'settlement',
          order_id: params.orderId,
          gross_amount: String(params.grossAmount),
          payment_type: 'qris',
          transaction_time: new Date().toISOString(),
        });
      }, 500);
    });

    // Simulate Pending button
    const pendingBtn = modal.querySelector('#midtrans-sim-pending');
    pendingBtn?.addEventListener('click', () => {
      modal.remove();
      if (callbacks.onPending) {
        callbacks.onPending({
          status_code: '201',
          transaction_status: 'pending',
          order_id: params.orderId,
          gross_amount: String(params.grossAmount),
          payment_type: 'bank_transfer',
        });
      }
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
    const isSandbox = this.getEnvironment() === 'sandbox';

    try {
      // 1. Ambil Snap Token asli dari Midtrans API melalui backend
      const { token, redirectUrl } = await this.createSnapToken(params);

      if (token) {
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
      }
    } catch (apiErr: any) {
      console.warn('[Midtrans] Snap token generation notice:', apiErr);

      // Jika di lingkungan Sandbox atau pengujian lokal/demo, tampilkan Simulator Sandbox interaktif
      // agar proses upgrade/pembayaran tidak terhenti oleh masalah kredensial sandbox!
      if (isSandbox) {
        this.renderSandboxSimulatorModal(params, callbacks, apiErr?.message);
        return;
      }

      throw apiErr;
    }

    if (isSandbox) {
      this.renderSandboxSimulatorModal(params, callbacks);
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
    // 1. Check if this order was paid in the Sandbox Simulator
    try {
      const stored = JSON.parse(sessionStorage.getItem('midtrans_simulated_paid_orders') || '[]');
      if (Array.isArray(stored) && stored.includes(orderId)) {
        return {
          success: true,
          isPaid: true,
          transactionStatus: 'settlement',
          data: { order_id: orderId, transaction_status: 'settlement', status_code: '200' },
        };
      }
    } catch { }

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
