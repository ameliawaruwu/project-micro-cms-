import type { Order } from '../types';
import { isCodMethod } from './orderFlow';

/**
 * Pesanan non-COD yang belum dibayar wajib dibayar dalam 24 jam sejak checkout.
 * Batas ini ditegakkan server (`app_private.expire_unpaid_orders`); fungsi di sini hanya untuk tampilan.
 */
export const PAYMENT_WINDOW_HOURS = 24;
const PAYMENT_WINDOW_MS = PAYMENT_WINDOW_HOURS * 60 * 60 * 1000;

/** Batas bayar bila pesanan masih menunggu pembayaran pembeli; null bila tidak berlaku. */
export function getPaymentDeadline(order: Pick<Order, 'createdAt' | 'paymentMethod' | 'paymentStatus' | 'paymentConfirmedAt' | 'shippingStatus'>): Date | null {
  if (isCodMethod(order.paymentMethod)) return null;
  if (order.paymentStatus !== 'Belum Dibayar' || order.paymentConfirmedAt) return null;
  if (order.shippingStatus !== 'Baru') return null;
  const created = new Date(order.createdAt).getTime();
  if (!Number.isFinite(created)) return null;
  return new Date(created + PAYMENT_WINDOW_MS);
}
