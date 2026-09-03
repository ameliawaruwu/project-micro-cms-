import { PaymentMethod } from '../types';

export interface PaymentOption {
  id: PaymentMethod;
  name: string;
  category: 'qris' | 'va' | 'card' | 'cod';
  logo: string;
  instructions: string[];
  adminFee: number;
  badge?: string;
}

export const paymentOptions: PaymentOption[] = [
  {
    id: 'QRIS',
    name: 'QRIS (BCA, GoPay, OVO, ShopeePay, Dana)',
    category: 'qris',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&auto=format&fit=crop&q=80',
    instructions: [
      'Buka aplikasi e-wallet atau mobile banking favorit Anda.',
      'Pilih menu Scan QR / Bayar QRIS.',
      'Arahkan kamera ke QR Code yang muncul di layar.',
      'Periksa nominal pembayaran dan konfirmasi.',
    ],
    adminFee: 0,
    badge: 'Paling Populer & Instan',
  },
  {
    id: 'BCA_VA',
    name: 'BCA Virtual Account',
    category: 'va',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    instructions: [
      'Buka BCA mobile > m-Transfer > BCA Virtual Account.',
      'Masukkan nomor VA: 8099 2198 4401 2291',
      'Pastikan nama toko dan nominal tagihan sesuai.',
      'Masukkan PIN m-BCA dan simpan bukti transfer.',
    ],
    adminFee: 2000,
  },
  {
    id: 'MANDIRI_VA',
    name: 'Mandiri Virtual Account (Livin)',
    category: 'va',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    instructions: [
      'Buka Livin by Mandiri > Bayar > Cari penyedia jasa.',
      'Masukkan nomor VA: 8870 0821 9912 3441',
      'Periksa total tagihan lalu klik Lanjut Bayar.',
    ],
    adminFee: 2000,
  },
  {
    id: 'STRIPE',
    name: 'Kartu Kredit / Debit (Visa, Mastercard)',
    category: 'card',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=100&auto=format&fit=crop&q=80',
    instructions: [
      'Masukkan nomor kartu 16 digit, masa berlaku (MM/YY), dan CVC.',
      'Masukkan kode OTP yang dikirimkan bank penerbit via SMS.',
    ],
    adminFee: 3500,
  },
  {
    id: 'COD',
    name: 'Bayar di Tempat (COD Kurir)',
    category: 'cod',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=80',
    instructions: [
      'Siapkan uang pas saat kurir tiba di alamat Anda.',
      'Periksa paket di depan kurir sebelum membayarkan tagihan.',
    ],
    adminFee: 2500,
  },
];

export const paymentService = {
  getPaymentOptions(): PaymentOption[] {
    return paymentOptions;
  },

  async simulatePayment(_orderId: string, _method: PaymentMethod): Promise<{ success: boolean; transactionId: string }> {
    await new Promise((res) => setTimeout(res, 800));
    return {
      success: true,
      transactionId: `TRX-${Date.now()}`,
    };
  },
};
