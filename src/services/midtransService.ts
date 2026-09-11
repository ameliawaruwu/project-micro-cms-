// Service to communicate with Midtrans Snap API and Popup

interface SnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

interface SnapResult {
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
    return import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-8Yp9X1v2wQzL4a7k';
  }

  private getEnvironment(): 'sandbox' | 'production' {
    return (import.meta.env.VITE_MIDTRANS_ENV as 'sandbox' | 'production') || 'sandbox';
  }

  async loadSnapScript(): Promise<void> {
    if (this.isScriptLoaded && window.snap) return;

    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('midtrans-snap-script');
      if (existingScript) {
        this.isScriptLoaded = true;
        resolve();
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
        reject(new Error('Gagal memuat script Midtrans Snap SDK'));
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

    const { token } = await this.createSnapToken(params);

    if (!window.snap) {
      throw new Error('Midtrans Snap tidak tersedia di window');
    }

    window.snap.pay(token, {
      onSuccess: (result) => callbacks.onSuccess(result),
      onPending: (result) => (callbacks.onPending ? callbacks.onPending(result) : callbacks.onSuccess(result)),
      onError: (result) => (callbacks.onError ? callbacks.onError(result) : alert('Pembayaran gagal atau dibatalkan')),
      onClose: () => {
        if (callbacks.onClose) callbacks.onClose();
      },
    });
  }
}

export const midtransService = new MidtransService();
