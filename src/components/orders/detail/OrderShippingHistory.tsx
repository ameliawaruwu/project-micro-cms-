import React from 'react';
import { Clock } from 'lucide-react';
import { Order, Store as StoreType } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getPaymentDeadline } from '../../../utils/orderPaymentDeadline';
import { isCodMethod } from '../../../utils/orderFlow';

interface OrderShippingHistoryProps {
  order: Order;
  store?: StoreType | null;
  vehicleType?: 'motor' | 'mobil';
  isInstant?: boolean;
  destinationLandmark?: string;
  destinationCityClean?: string;
  originCity?: string;
}

interface HistoryEvent {
  key: string;
  at?: string;
  title: string;
  detail?: string;
  tone: 'done' | 'cancel' | 'waiting';
}

/**
 * Riwayat status pesanan dari data asli database (waktu checkout, konfirmasi bayar, lunas,
 * pengiriman, selesai, batal). Ikut berubah otomatis karena data pesanan disinkron realtime.
 */
export const OrderShippingHistory: React.FC<OrderShippingHistoryProps> = ({ order }) => {
  const { isEn } = useLanguage();

  const formatDateTime = (value: string | undefined | null): string => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(isEn ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const isCod = isCodMethod(order.paymentMethod);
  const isCancelled = order.shippingStatus === 'Dibatalkan';
  const isShipped = order.shippingStatus === 'Dikirim' || order.shippingStatus === 'Selesai';
  const isCompleted = order.shippingStatus === 'Selesai';
  const isPaid = order.paymentStatus === 'Sudah Dibayar';
  const resi = order.trackingNumber || order.resiNumber;
  const courierLabel = [order.courier, order.courierService].filter(Boolean).join(' ');

  const events: HistoryEvent[] = [];

  events.push({
    key: 'created',
    at: order.createdAt,
    title: isEn ? 'Order placed' : 'Pesanan dibuat',
    detail: isEn
      ? `${order.customerName} checked out using ${order.paymentMethod}.`
      : `${order.customerName} melakukan checkout dengan ${order.paymentMethod}.`,
    tone: 'done',
  });

  if (order.paymentConfirmedAt) {
    events.push({
      key: 'confirmed',
      at: order.paymentConfirmedAt,
      title: order.paymentProofUrl
        ? (isEn ? 'Buyer sent payment proof' : 'Pembeli mengirim bukti pembayaran')
        : (isEn ? 'Buyer confirmed payment' : 'Pembeli konfirmasi sudah bayar'),
      detail: isEn ? 'Waiting for the seller to check the transfer.' : 'Menunggu penjual mengecek transfer.',
      tone: 'done',
    });
  }

  if (isPaid) {
    events.push({
      key: 'paid',
      at: order.paidAt,
      title: isEn ? 'Payment received' : 'Pembayaran diterima (lunas)',
      tone: 'done',
    });
  }

  if (order.pickupTime && !isCancelled) {
    events.push({
      key: 'pickup',
      at: order.pickupTime,
      title: isEn ? 'Courier pickup scheduled' : 'Jadwal penjemputan kurir',
      detail: courierLabel || undefined,
      tone: 'done',
    });
  }

  if (isShipped) {
    events.push({
      key: 'shipped',
      at: order.shippedAt,
      title: isEn ? 'Package shipped' : 'Paket dikirim',
      detail: [courierLabel, resi ? (isEn ? `Tracking no. ${resi}` : `No. resi ${resi}`) : '']
        .filter(Boolean)
        .join(' · ') || undefined,
      tone: 'done',
    });
  }

  if (isCompleted) {
    events.push({
      key: 'completed',
      at: order.updatedAt,
      title: isEn ? 'Order completed' : 'Pesanan selesai',
      tone: 'done',
    });
  }

  if (isCancelled) {
    const byLabel =
      order.cancelledBy === 'buyer'
        ? (isEn ? 'Cancelled by the buyer' : 'Dibatalkan oleh pembeli')
        : order.cancelledBy === 'merchant'
        ? (isEn ? 'Cancelled by the seller' : 'Dibatalkan oleh penjual')
        : order.cancelledBy === 'system'
        ? (isEn ? 'Cancelled automatically: 24-hour payment deadline passed' : 'Dibatalkan otomatis: batas bayar 24 jam habis')
        : (isEn ? 'Order cancelled' : 'Pesanan dibatalkan');
    events.push({
      key: 'cancelled',
      at: order.cancelledAt || order.updatedAt,
      title: byLabel,
      detail: order.cancelledBy !== 'system' && order.cancelReason
        ? (isEn ? `Reason: ${order.cancelReason}` : `Alasan: ${order.cancelReason}`)
        : undefined,
      tone: 'cancel',
    });
  }

  // Urutkan dari yang terbaru; peristiwa tanpa waktu mengikuti urutan alurnya.
  let lastT = 0;
  const timed = events.map((e, i) => {
    const raw = e.at ? new Date(e.at).getTime() : NaN;
    lastT = Number.isFinite(raw) ? Math.max(raw, lastT) : lastT;
    return { e, i, t: lastT };
  });
  timed.sort((a, b) => (a.t !== b.t ? b.t - a.t : b.i - a.i));
  const history = timed.map((x) => x.e);

  // Langkah berikutnya yang sedang ditunggu (bukan peristiwa, tanpa waktu).
  let waiting: HistoryEvent | null = null;
  if (!isCancelled && !isCompleted) {
    const deadline = getPaymentDeadline(order);
    if (deadline) {
      waiting = {
        key: 'waiting',
        title: isEn ? 'Waiting for buyer payment' : 'Menunggu pembayaran pembeli',
        detail: isEn
          ? `Pay before ${formatDateTime(deadline.toISOString())}, or the order is cancelled automatically.`
          : `Bayar sebelum ${formatDateTime(deadline.toISOString())}, lewat dari itu pesanan batal otomatis.`,
        tone: 'waiting',
      };
    } else if (order.paymentConfirmedAt && !isPaid && !isCod) {
      waiting = {
        key: 'waiting',
        title: isEn ? 'Waiting for seller verification' : 'Menunggu verifikasi penjual',
        tone: 'waiting',
      };
    } else if (!isShipped) {
      waiting = {
        key: 'waiting',
        title: isEn ? 'Waiting to be shipped' : 'Menunggu dikirim penjual',
        tone: 'waiting',
      };
    } else {
      waiting = {
        key: 'waiting',
        title: isEn ? 'On the way to the buyer' : 'Dalam perjalanan ke pembeli',
        detail: resi
          ? (isEn ? 'Check the courier tracking for the latest position.' : 'Cek pelacakan kurir untuk posisi terbaru.')
          : undefined,
        tone: 'waiting',
      };
    }
  }

  const rows = waiting ? [waiting, ...history] : history;

  return (
    <div className="p-3.5 sm:p-4 bg-white border-t border-[#E5E0DD] space-y-3 font-poppins">
      <div className="flex items-center justify-between">
        <span className="font-bold text-xs text-[#1F1F1F] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#66000E]" />
          <span>{isEn ? 'Order Status History' : 'Riwayat Status Pesanan'}</span>
        </span>
        <span className="text-[10px] text-[#777777]">{isEn ? 'Updates automatically' : 'Diperbarui otomatis'}</span>
      </div>

      <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E0DD]">
        {rows.map((ev, idx) => {
          const isLatest = idx === 0;
          const dot =
            ev.tone === 'cancel'
              ? 'bg-[#B42318] ring-4 ring-[#FEE4E2]'
              : ev.tone === 'waiting'
              ? 'bg-white border-2 border-dashed border-[#66000E]'
              : isLatest
              ? 'bg-[#66000E] ring-4 ring-[#F5E8EA]'
              : 'bg-[#EAEAEA] border-2 border-white';
          return (
            <div key={ev.key} className="relative">
              <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${dot}`}>
                {ev.tone === 'done' && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-white' : 'bg-[#777777]'}`} />
                )}
              </div>
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-xs ${isLatest ? 'font-bold' : 'font-semibold'} ${
                      ev.tone === 'cancel' ? 'text-[#B42318]' : 'text-[#1F1F1F]'
                    }`}
                  >
                    {ev.title}
                  </span>
                  {ev.at && (
                    <span className="text-[10px] text-[#777777] shrink-0 text-right">{formatDateTime(ev.at)}</span>
                  )}
                </div>
                {ev.detail && (
                  <p className={`text-[11px] mt-0.5 break-words ${isLatest ? 'text-[#555555]' : 'text-[#777777]'}`}>
                    {ev.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
