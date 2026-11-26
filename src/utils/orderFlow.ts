// Aturan alur pesanan di sisi merchant:
// - QRIS / Transfer (dan metode non-COD lain): pesanan baru boleh dikirim setelah ditandai lunas.
// - COD: merchant konfirmasi pesanan dulu (Baru -> Diproses), baru diatur pengirimannya.
//   Pembayaran COD otomatis lunas saat pesanan ditandai selesai (uang diterima saat barang tiba).
import type { Order } from '../types';

/** Pesanan dibayar tunai saat barang tiba (Bayar di Tempat / COD). */
export function isCodMethod(paymentMethod?: string | null): boolean {
  return /\bCOD\b/i.test(paymentMethod || '');
}

export type MerchantOrderAction =
  | 'verify_payment' // tunggu / tandai lunas dulu
  | 'confirm_cod' // konfirmasi pesanan COD dulu
  | 'ship' // siap diatur pengirimannya
  | 'complete' // sedang dikirim, bisa ditandai selesai
  | 'none'; // selesai atau dibatalkan

type OrderFlowFields = Pick<Order, 'paymentMethod' | 'paymentStatus' | 'shippingStatus'>;

/** Langkah berikutnya yang boleh dilakukan merchant pada sebuah pesanan. */
export function getMerchantOrderAction(order: OrderFlowFields): MerchantOrderAction {
  const status = order.shippingStatus;
  if (status === 'Dikirim' || status === 'ready_to_ship') return 'complete';
  if (status !== 'Baru' && status !== 'Diproses') return 'none';

  if (isCodMethod(order.paymentMethod)) {
    return status === 'Baru' ? 'confirm_cod' : 'ship';
  }
  return order.paymentStatus === 'Sudah Dibayar' ? 'ship' : 'verify_payment';
}

/** Pesan penjelasan bila pengiriman belum boleh diatur, atau null bila boleh. */
export function getShippingBlockReason(order: OrderFlowFields): string | null {
  switch (getMerchantOrderAction(order)) {
    case 'verify_payment':
      return 'Tandai pembayaran lunas terlebih dahulu sebelum mengatur pengiriman.';
    case 'confirm_cod':
      return 'Konfirmasi pesanan COD terlebih dahulu sebelum mengatur pengiriman.';
    default:
      return null;
  }
}
