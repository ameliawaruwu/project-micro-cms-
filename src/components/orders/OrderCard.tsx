import React, { useState } from 'react';
import {
  Send,
  MessageCircle,
  Printer,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { Order } from '../../types';
import { formatRupiah, formatDateIndo, generateWhatsAppLink, generateTrackingLink } from '../../utils/formatters';

interface OrderCardProps {
  order: Order;
  onProcessShipping: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onMarkCompleted?: (orderId: string) => void;
  onShowNotification: (msg: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onProcessShipping,
  onPrintReceipt,
  onMarkCompleted,
  onShowNotification,
}) => {
  const [copiedResi, setCopiedResi] = useState(false);

  const handleCopyResi = () => {
    if (!order.resiNumber) return;
    navigator.clipboard.writeText(order.resiNumber);
    setCopiedResi(true);
    onShowNotification(`Nomor Resi ${order.resiNumber} berhasil disalin!`);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Baru':
        return 'bg-[#FFF1F0] text-[#9A0602] border-[#FECDCA]';
      case 'Diproses':
        return 'bg-[#F7F7F7] text-[#1F1F1F] border-[#EAEAEA]';
      case 'Dikirim':
        return 'bg-[#FFF1F0] text-[#9A0602] border-[#FECDCA]';
      case 'Selesai':
        return 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]';
      case 'Dibatalkan':
        return 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
      default:
        return 'bg-[#F7F7F7] text-[#555555] border-[#EAEAEA]';
    }
  };

  const waMessage = `Halo Kak ${order.customerName}, konfirmasi pesanan (${order.orderNumber}):\nTotal: ${formatRupiah(order.grandTotal)}\nStatus: ${order.shippingStatus}${order.resiNumber ? `\nNo. Resi: ${order.resiNumber}` : ''}\n\nTerima kasih sudah belanja di toko kami! 🙏`;

  return (
    <div className="bg-white rounded-2xl border border-[#EAEAEA] shadow-xs hover:border-[#CCCCCC] transition-all p-4 sm:p-5 flex flex-col gap-4 font-sans">
      {/* Top row: Order Number, Customer, Date, Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAEAEA]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm sm:text-base text-[#1F1F1F] tracking-tight">
            #{order.orderNumber}
          </span>
          <span className="text-[#EAEAEA]">•</span>
          <span className="font-semibold text-xs sm:text-sm text-[#555555]">
            {order.customerName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#777777] hidden sm:inline">
            {formatDateIndo(order.createdAt)}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.shippingStatus)}`}>
            {order.shippingStatus}
          </span>
        </div>
      </div>

      {/* Middle row: Items Snapshot & Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Items */}
        <div className="md:col-span-2 space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#EAEAEA] overflow-hidden shrink-0">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=100'}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-semibold text-xs sm:text-sm text-[#1F1F1F] truncate">
                  {item.productName}
                </h5>
                <div className="flex items-center gap-2 text-xs text-[#777777] mt-0.5">
                  <span className="font-medium text-[#555555]">{item.quantity} produk</span>
                  {item.variantName && <span>({item.variantName})</span>}
                  <span>•</span>
                  <span>{formatRupiah(item.price)}</span>
                </div>
              </div>
              <span className="font-bold text-xs sm:text-sm text-[#1F1F1F] shrink-0">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}

          {order.notes && (
            <div className="text-xs text-[#555555] bg-[#F7F7F7] p-2.5 rounded-xl border border-[#EAEAEA] mt-2">
              <span className="font-semibold text-[#1F1F1F]">Catatan Pembeli:</span> {order.notes}
            </div>
          )}
        </div>

        {/* Customer Address & Courier */}
        <div className="bg-[#F7F7F7] rounded-xl p-3.5 border border-[#EAEAEA] text-xs space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-[#1F1F1F]">
              <MapPin className="w-3.5 h-3.5 text-[#9A0602]" />
              <span>{order.customerCity}</span>
            </div>
            <p className="text-[11px] text-[#555555] mt-1 line-clamp-2">{order.customerAddress}</p>
            <p className="text-[11px] text-[#777777] font-mono mt-0.5">WA: {order.customerPhone}</p>
          </div>

          <div className="pt-2 border-t border-[#EAEAEA] flex items-center justify-between">
            <span className="font-semibold text-[#1F1F1F]">Kurir: {order.courier}</span>
            <span className="font-semibold text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6] px-2 py-0.5 rounded-md text-[10px]">
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Resi Box if shipped */}
      {order.resiNumber && (
        <div className="p-3 bg-[#F7F7F7] rounded-xl border border-[#EAEAEA] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#9A0602]" />
            <span className="font-semibold text-[#1F1F1F]">Resi {order.courier}:</span>
            <span className="font-mono font-bold text-[#1F1F1F] bg-white px-2 py-0.5 rounded border border-[#EAEAEA]">
              {order.resiNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyResi}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#EAEAEA] hover:bg-[#F7F7F7] text-[#1F1F1F] font-semibold text-[11px] transition cursor-pointer"
            >
              {copiedResi ? <Check className="w-3 h-3 text-[#027A48]" /> : <Copy className="w-3 h-3 text-[#777777]" />}
              <span>{copiedResi ? 'Tersalin' : 'Salin Resi'}</span>
            </button>
            <a
              href={generateTrackingLink(order.courier, order.resiNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-[11px] transition"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Cek Tracking</span>
            </a>
          </div>
        </div>
      )}

      {/* Bottom Bar: Total & Actions */}
      <div className="pt-3 border-t border-[#EAEAEA] flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-[#777777] block font-medium">Total Pembayaran</span>
          <span className="font-bold text-base sm:text-lg text-[#1F1F1F]">
            {formatRupiah(order.grandTotal)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Print Thermal Receipt or Shipping Label */}
          {order.shippingLabelUrl ? (
            <a
              href={order.shippingLabelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-2 min-h-[40px] rounded-xl border border-[#FECDCA] bg-[#FFF1F0] text-[#9A0602] hover:bg-[#FEE4E2] font-semibold text-xs transition cursor-pointer"
              title="Cetak Label Pengiriman PDF (Biteship)"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Label PDF</span>
            </a>
          ) : (
            <button
              onClick={() => onPrintReceipt(order)}
              className="p-2.5 rounded-xl border border-[#EAEAEA] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
              title="Cetak Struk Thermal / Label"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          {/* Contact Buyer WhatsApp */}
          <a
            href={generateWhatsAppLink(order.customerPhone, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl bg-white hover:bg-[#F7F7F7] text-[#027A48] font-semibold text-xs border border-[#ABEFC6] transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Hubungi Pembeli</span>
          </a>

          {/* Primary Action Button */}
          {order.shippingStatus === 'Baru' || order.shippingStatus === 'Diproses' ? (
            <button
              onClick={() => onProcessShipping(order)}
              className="flex items-center gap-1.5 px-4 py-2.5 min-h-[40px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Atur Pengiriman</span>
            </button>
          ) : (order.shippingStatus === 'Dikirim' || order.shippingStatus === 'ready_to_ship') && onMarkCompleted ? (
            <button
              onClick={() => onMarkCompleted(order.id)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[40px] rounded-xl bg-[#027A48] hover:bg-[#026038] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tandai Selesai</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#027A48] bg-[#ECFDF3] px-3 py-2 min-h-[40px] rounded-xl border border-[#ABEFC6]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pesanan Selesai</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

