import React, { useState } from 'react';
import {
  Send,
  Printer,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Package,
  Eye,
} from 'lucide-react';
import { Order } from '../../types';
import { formatRupiah, formatDateIndo, generateTrackingLink } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';

interface OrderCardProps {
  order: Order;
  onProcessShipping: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onMarkCompleted?: (orderId: string) => void;
  onSelectOrder?: (order: Order) => void;
  onShowNotification: (msg: string) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onProcessShipping,
  onPrintReceipt,
  onMarkCompleted,
  onSelectOrder,
  onShowNotification,
}) => {
  const { t, language } = useLanguage();
  const [copiedResi, setCopiedResi] = useState(false);

  const handleCopyResi = () => {
    if (!order.resiNumber) return;
    navigator.clipboard.writeText(order.resiNumber);
    setCopiedResi(true);
    onShowNotification(`Nomor Resi ${order.resiNumber} berhasil disalin!`);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Baru':
        return t('filter_new', 'Baru');
      case 'Diproses':
        return t('filter_processing', 'Diproses');
      case 'Dikirim':
        return t('filter_shipped', 'Dikirim');
      case 'Selesai':
        return t('filter_completed', 'Selesai');
      case 'Dibatalkan':
        return t('filter_cancelled', 'Dibatalkan');
      case 'ready_to_ship':
        return language === 'en' ? 'Ready to Ship' : 'Siap Dikirim';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Baru':
        return 'bg-[#F5E8EA] text-[#66000E] border-[#E8DDDE]';
      case 'Diproses':
        return 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]';
      case 'Dikirim':
        return 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]';
      case 'Selesai':
        return 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]';
      case 'Dibatalkan':
        return 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
      default:
        return 'bg-[#FAF7F7] text-[#706866] border-[#E5E0DD]';
    }
  };

  const formattedDate = language === 'en'
    ? new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : formatDateIndo(order.createdAt);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0DD] shadow-2xs hover:border-[#66000E]/30 transition-all p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-4 font-sans">
      {/* Top row: Order Number, Customer, Date, Status */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#E5E0DD]">
        <div
          onClick={() => onSelectOrder && onSelectOrder(order)}
          className={`flex items-center gap-1.5 sm:gap-2 min-w-0 ${onSelectOrder ? 'cursor-pointer group' : ''}`}
          title={onSelectOrder ? 'Klik untuk melihat detail lengkap & tracking pesanan' : undefined}
        >
          <span className="font-bold text-xs sm:text-base text-[#241A1A] tracking-tight group-hover:text-[#66000E] transition shrink-0">
            #{order.orderNumber}
          </span>
          <span className="text-[#706866] shrink-0">•</span>
          <span className="font-semibold text-xs sm:text-sm text-[#706866] group-hover:text-[#241A1A] transition truncate">
            {order.customerName}
          </span>
          {onSelectOrder && (
            <span className="text-[10px] text-[#706866] bg-[#FAF7F7] px-2 py-0.5 rounded-lg border border-[#E5E0DD] group-hover:border-[#E8DDDE] group-hover:text-[#66000E] group-hover:bg-[#F5E8EA] transition hidden sm:inline-flex items-center gap-1 shrink-0">
              <Eye className="w-3 h-3" />
              <span>{t('detail_short', 'Detail')}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-[#777777] hidden sm:inline">
            {formattedDate}
          </span>
          <span className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.shippingStatus)} shrink-0`}>
            {getStatusLabel(order.shippingStatus)}
          </span>
        </div>
      </div>

      {/* Middle row: Items Snapshot & Delivery Address */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
        {/* Items */}
        <div className="md:col-span-2 space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-[#EAEAEA] overflow-hidden shrink-0">
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
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#777777] mt-0.5">
                  <span className="font-medium text-[#555555]">{item.quantity}x</span>
                  {item.variantName && (
                    <span className="bg-[#F0F0F0] text-[#555555] px-1.5 py-0.2 rounded text-[10px] font-medium">
                      {item.variantName}
                    </span>
                  )}
                  {item.quantity > 1 && (
                    <span className="text-[#999999] hidden sm:inline">(@ {formatRupiah(item.price)})</span>
                  )}
                </div>
              </div>
              <span className="font-bold text-xs sm:text-sm text-[#1F1F1F] shrink-0 text-right">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}

          {order.notes && (
            <div className="text-[11px] sm:text-xs text-[#555555] bg-[#F9F9F9] px-2.5 py-1.5 rounded-lg border border-[#EAEAEA] mt-1 flex items-start gap-1.5">
              <span className="font-semibold text-[#1F1F1F] shrink-0">{t('buyer_note', 'Catatan:')}</span>
              <span className="line-clamp-2">{order.notes}</span>
            </div>
          )}
        </div>

        {/* Customer Address & Courier */}
        <div className="bg-[#F9F9F9] rounded-xl px-2.5 py-2 sm:p-3.5 border border-[#E5E0DD] text-xs space-y-1 sm:space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-[#1F1F1F] text-[11px] sm:text-xs truncate">
                <MapPin className="w-3.5 h-3.5 text-[#66000E] shrink-0" />
                <span className="truncate">{order.customerCity}</span>
                <span className="text-[#CCCCCC] hidden sm:inline">•</span>
                <span className="text-[#555555] font-normal hidden sm:inline">{order.courier}</span>
              </div>
              <span className="font-semibold text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6] px-1.5 sm:px-2 py-0.5 rounded text-[10px] shrink-0 sm:hidden">
                {order.paymentStatus === 'Sudah Dibayar' ? t('order_paid', 'Lunas') : order.paymentStatus}
              </span>
            </div>
            <p className="text-[11px] text-[#555555] mt-0.5 line-clamp-1 sm:line-clamp-2">{order.customerAddress}</p>
            <p className="text-[11px] text-[#777777] font-mono mt-0.5 hidden sm:block">WA: {order.customerPhone}</p>
          </div>

          <div className="pt-2 border-t border-[#E5E0DD] hidden sm:flex items-center justify-between">
            <span className="font-semibold text-[#1F1F1F]">{t('courier_colon', 'Kurir:')} {order.courier}</span>
            <span className="font-semibold text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6] px-2 py-0.5 rounded-md text-[10px]">
              {order.paymentStatus === 'Sudah Dibayar' ? t('order_paid', 'Sudah Dibayar') : (order.paymentStatus === 'Belum Dibayar' ? t('order_unpaid', 'Belum Dibayar') : order.paymentStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Resi Box if shipped */}
      {order.resiNumber && (
        <div className="p-2 sm:p-3 bg-[#F9F9F9] rounded-xl border border-[#E5E0DD] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Package className="w-3.5 h-3.5 text-[#66000E]" />
            <span className="font-semibold text-[#1F1F1F] text-[11px] sm:text-xs">{t('resi_colon', 'Resi')} {order.courier}:</span>
            <span className="font-mono font-bold text-[#1F1F1F] bg-white px-2 py-0.5 rounded border border-[#E5E0DD] text-[11px]">
              {order.resiNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyResi}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#E5E0DD] hover:bg-[#FAF7F7] text-[#241A1A] font-semibold text-[10px] sm:text-[11px] transition cursor-pointer"
            >
              {copiedResi ? <Check className="w-3 h-3 text-[#027A48]" /> : <Copy className="w-3 h-3 text-[#706866]" />}
              <span>{copiedResi ? t('copied', 'Tersalin') : t('copy_resi', 'Salin')}</span>
            </button>
            <a
              href={generateTrackingLink(order.courier, order.resiNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-[10px] sm:text-[11px] transition cursor-pointer active:scale-98"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{t('check_tracking', 'Lacak')}</span>
            </a>
          </div>
        </div>
      )}

      {/* Bottom Bar: Total & Actions */}
      <div className="pt-2 sm:pt-3 border-t border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div className="flex items-center justify-between sm:block">
          <div>
            <span className="text-[10px] sm:text-[11px] text-[#706866] block font-medium leading-tight">{t('total_payment', 'Total Pembayaran')}</span>
            <span className="font-bold text-sm sm:text-lg text-[#241A1A] block">
              {formatRupiah(order.grandTotal)}
            </span>
          </div>

          {/* Mobile Quick Action Icons (Print) */}
          <div className="flex sm:hidden items-center gap-1.5">
            {order.shippingLabelUrl ? (
              <a
                href={
                  order.shippingLabelUrl.includes('labels.biteship.com')
                    ? `https://biteship.com/id/tracking/${order.resiNumber || order.trackingNumber || ''}`
                    : order.shippingLabelUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-[#E8DDDE] bg-[#F5E8EA] text-[#66000E] hover:bg-[#F9EDEF] transition cursor-pointer"
                title="Cetak Label Pengiriman"
              >
                <Printer className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={() => onPrintReceipt(order)}
                className="p-2 rounded-xl border border-[#E5E0DD] bg-white text-[#706866] hover:bg-[#FAF7F7] transition cursor-pointer"
                title="Cetak Struk"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* Desktop Print Button */}
          <div className="hidden sm:block">
            {order.shippingLabelUrl ? (
              <a
                href={
                  order.shippingLabelUrl.includes('labels.biteship.com')
                    ? `https://biteship.com/id/tracking/${order.resiNumber || order.trackingNumber || ''}`
                    : order.shippingLabelUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 min-h-[38px] rounded-xl border border-[#E8DDDE] bg-[#F5E8EA] text-[#66000E] hover:bg-[#F9EDEF] font-semibold text-xs transition cursor-pointer"
                title="Cetak Label Pengiriman PDF (Biteship)"
              >
                <Printer className="w-4 h-4" />
                <span>{t('label_pdf', 'Label PDF')}</span>
              </a>
            ) : (
              <button
                onClick={() => onPrintReceipt(order)}
                className="p-2.5 rounded-xl border border-[#E5E0DD] text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer"
                title="Cetak Struk Thermal / Label"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Detail & Lacak Button */}
          {onSelectOrder && (
            <button
              onClick={() => onSelectOrder(order)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[36px] sm:min-h-[38px] rounded-xl bg-white hover:bg-[#FAF7F7] text-[#241A1A] font-semibold text-xs border border-[#E5E0DD] transition cursor-pointer shadow-2xs"
              title="Lihat Detail Lengkap & Tracking"
            >
              <Eye className="w-3.5 h-3.5 text-[#706866]" />
              <span>{t('detail_and_track', 'Detail & Lacak')}</span>
            </button>
          )}

          {/* Primary Action Button */}
          {order.shippingStatus === 'Baru' || order.shippingStatus === 'Diproses' ? (
            <button
              onClick={() => onProcessShipping(order)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[36px] sm:min-h-[38px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs shadow-2xs transition cursor-pointer active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('arrange_shipping', 'Atur Pengiriman')}</span>
            </button>
          ) : (order.shippingStatus === 'Dikirim' || order.shippingStatus === 'ready_to_ship') && onMarkCompleted ? (
            <button
              onClick={() => onMarkCompleted(order.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 min-h-[36px] sm:min-h-[38px] rounded-xl bg-[#027A48] hover:bg-[#026038] text-white font-semibold text-xs shadow-2xs transition cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('mark_completed', 'Tandai Selesai')}</span>
            </button>
          ) : (
            <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-[#027A48] bg-[#ECFDF3] px-2.5 py-2 min-h-[36px] sm:min-h-[38px] rounded-xl border border-[#ABEFC6]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('order_completed', 'Selesai')}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

