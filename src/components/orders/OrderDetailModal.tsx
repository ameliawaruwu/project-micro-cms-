import React, { useState } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Printer,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Package,
  User,
  Phone,
  Truck,
} from 'lucide-react';
import { Order } from '../../types';
import {
  formatRupiah,
  formatDateIndo,
  generateWhatsAppLink,
  generateTrackingLink,
} from '../../utils/formatters';

interface OrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onProcessShipping: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onMarkCompleted?: (orderId: string) => void;
  onShowNotification?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  order,
  onClose,
  onProcessShipping,
  onPrintReceipt,
  onMarkCompleted,
  onShowNotification,
}) => {
  const [copiedResi, setCopiedResi] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyResi = () => {
    if (!order.resiNumber) return;
    navigator.clipboard.writeText(order.resiNumber);
    setCopiedResi(true);
    if (onShowNotification) onShowNotification('Nomor resi berhasil disalin!');
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const steps = [
    { title: 'Pesanan Dibuat', completed: true, date: formatDateIndo(order.createdAt) },
    {
      title: 'Pembayaran Diterima',
      completed: order.paymentStatus === 'Sudah Dibayar',
      date: order.paymentStatus === 'Sudah Dibayar' ? 'Lunas otomatis' : 'Menunggu',
    },
    {
      title: 'Sedang Diproses',
      completed: order.shippingStatus !== 'Baru',
      date: order.shippingStatus !== 'Baru' ? 'Dipacking toko' : 'Belum diproses',
    },
    {
      title: 'Dalam Pengiriman',
      completed: order.shippingStatus === 'Dikirim' || order.shippingStatus === 'Selesai',
      date: order.resiNumber ? `Resi: ${order.resiNumber}` : 'Menunggu kurir',
    },
    {
      title: 'Pesanan Selesai',
      completed: order.shippingStatus === 'Selesai',
      date: order.shippingStatus === 'Selesai' ? 'Diterima pembeli' : '-',
    },
  ];

  const waMessage = `Halo Kak ${order.customerName}, informasi pesanan #${order.orderNumber} dari toko kami:\nTotal: ${formatRupiah(order.grandTotal)}\nStatus: ${order.shippingStatus}${order.resiNumber ? `\nNo Resi: ${order.resiNumber}` : ''}\n\nTerima kasih!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-[#EAEAEA] my-8 animate-in fade-in zoom-in duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base sm:text-lg text-[#1F1F1F]">
                #{order.orderNumber}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-[#FFF1F0] text-[#9A0602] border-[#FECDCA]">
                {order.shippingStatus}
              </span>
            </div>
            <p className="text-xs text-[#777777] mt-0.5">Dibuat pada {formatDateIndo(order.createdAt)}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Status Stepper */}
        <div className="py-5 border-b border-[#EAEAEA]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#777777] mb-3">
            Status Perjalanan Pesanan
          </h4>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-[#EAEAEA] -z-0" />
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step.completed
                      ? 'bg-[#9A0602] text-white ring-4 ring-[#FFF1F0]'
                      : 'bg-[#F7F7F7] text-[#777777] border border-[#EAEAEA] ring-4 ring-white'
                  }`}
                >
                  {step.completed ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1.5 max-w-[70px] leading-tight ${
                    step.completed ? 'text-[#1F1F1F]' : 'text-[#777777]'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Details: Items + Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-5 border-b border-[#EAEAEA] text-xs">
          {/* Left: Customer & Delivery Info */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA]">
            <h5 className="font-semibold text-[#1F1F1F] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#9A0602]" />
              <span>Informasi Pembeli</span>
            </h5>
            <div className="space-y-1.5 text-[#555555]">
              <p className="font-semibold text-[#1F1F1F]">{order.customerName}</p>
              <p className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#777777]" />
                <span className="font-mono">{order.customerPhone}</span>
              </p>
              <p className="flex items-start gap-1 pt-1">
                <MapPin className="w-3 h-3 text-[#777777] shrink-0 mt-0.5" />
                <span>
                  {order.customerAddress}, {order.customerCity}
                </span>
              </p>
              {order.notes && (
                <div className="p-2 rounded-lg bg-white border border-[#EAEAEA] text-[#555555] text-[11px] mt-2">
                  <span className="font-semibold text-[#1F1F1F]">Catatan:</span> {order.notes}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#EAEAEA]">
              <h5 className="font-semibold text-[#1F1F1F] mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#9A0602]" />
                <span>Ekspedisi & Pengiriman</span>
              </h5>
              <p className="text-[#555555]">
                Kurir: <span className="font-semibold text-[#1F1F1F]">{order.courier}</span> ({order.courierService || 'Reguler'})
              </p>
              {order.resiNumber ? (
                <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded-lg border border-[#EAEAEA]">
                  <span className="font-mono font-bold text-[#1F1F1F]">{order.resiNumber}</span>
                  <button
                    onClick={handleCopyResi}
                    className="p-1 text-[#777777] hover:text-[#1F1F1F] cursor-pointer"
                    title="Salin Resi"
                  >
                    {copiedResi ? <Check className="w-3.5 h-3.5 text-[#027A48]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={generateTrackingLink(order.courier, order.resiNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-[#9A0602] underline flex items-center gap-0.5 ml-auto"
                  >
                    <span>Lacak</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-[11px] text-[#777777] font-medium mt-1">Resi belum dibuat</p>
              )}
            </div>
          </div>

          {/* Right: Ordered Products & Total Breakdown */}
          <div className="space-y-3">
            <h5 className="font-semibold text-[#1F1F1F] flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#9A0602]" />
              <span>Daftar Barang Belanja</span>
            </h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#EAEAEA]">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-10 h-10 rounded-lg object-cover border border-[#EAEAEA] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1F1F1F] truncate">{item.productName}</p>
                    <p className="text-[10px] text-[#777777]">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-[#1F1F1F]">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="p-3 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#555555]">
                <span>Subtotal Produk</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#555555]">
                <span>Ongkos Kirim ({order.courier})</span>
                <span>{formatRupiah(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1F1F1F] pt-1.5 border-t border-[#EAEAEA]">
                <span>Total Tagihan</span>
                <span>{formatRupiah(order.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-[#777777] pt-1 text-[10px]">
                <span>Metode Pembayaran</span>
                <span className="font-semibold text-[#1F1F1F]">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintReceipt(order)}
              className="px-3.5 py-2 min-h-[38px] rounded-xl border border-[#EAEAEA] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>

            <a
              href={generateWhatsAppLink(order.customerPhone, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 min-h-[38px] rounded-xl bg-white hover:bg-[#F7F7F7] text-[#027A48] border border-[#ABEFC6] font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {order.shippingStatus === 'Baru' || order.shippingStatus === 'Diproses' ? (
              <button
                onClick={() => {
                  onClose();
                  onProcessShipping(order);
                }}
                className="px-5 py-2.5 min-h-[38px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Proses Pengiriman</span>
              </button>
            ) : order.shippingStatus === 'Dikirim' && onMarkCompleted ? (
              <button
                onClick={() => {
                  onMarkCompleted(order.id);
                  onClose();
                }}
                className="px-4 py-2.5 min-h-[38px] rounded-xl bg-[#027A48] hover:bg-[#026038] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tandai Selesai</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

