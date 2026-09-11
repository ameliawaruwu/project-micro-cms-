import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order, Store as StoreType } from '../../types';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';

interface ReceiptModalProps {
  order: Order | null;
  store: StoreType;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  store,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="modal-receipt" className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAEAEA] my-6 animate-in fade-in zoom-in duration-200">
        {/* Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA] print:hidden">
          <div className="flex items-center gap-2 text-[#1F1F1F] font-bold text-base">
            <Printer className="w-5 h-5 text-[#9A0602]" />
            <span>Label Pengiriman & Struk</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area (Thermal 80mm style) */}
        <div id="printable-receipt" className="py-4 my-2 font-mono text-xs text-[#1F1F1F] border-2 border-dashed border-[#CCCCCC] p-4 rounded-xl bg-[#F7F7F7]/50">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-[#CCCCCC]">
            <h2 className="text-base font-bold tracking-tight text-[#1F1F1F]">{store.name}</h2>
            <p className="text-[10px] text-[#777777]">{store.city}</p>
            <p className="text-[10px] text-[#777777]">WA: {store.phoneWhatsApp}</p>
          </div>

          {/* Shipping badge */}
          <div className="py-2.5 my-2 bg-white rounded-lg text-center font-bold text-xs uppercase tracking-wider flex items-center justify-between px-3 border border-[#EAEAEA]">
            <span className="text-[#9A0602]">{order.courier} EXPRESS</span>
            <span className="text-[#1F1F1F]">{order.resiNumber ? `RESI: ${order.resiNumber}` : 'AUTO PICK-UP'}</span>
          </div>

          {/* Recipient info */}
          <div className="py-2 border-b border-dashed border-[#CCCCCC] space-y-1">
            <div className="text-[11px] font-bold text-[#1F1F1F]">PENERIMA:</div>
            <div className="font-bold text-sm text-[#1F1F1F]">{order.customerName}</div>
            <div className="text-[11px] text-[#555555]">Telp: {order.customerPhone}</div>
            <div className="text-[11px] text-[#555555] leading-tight">
              {order.customerAddress}, {order.customerCity}
            </div>
            {order.notes && (
              <div className="text-[10px] italic bg-white p-1.5 rounded border border-[#EAEAEA] text-[#555555]">
                Catatan: "{order.notes}"
              </div>
            )}
          </div>

          {/* Order Details */}
          <div className="py-2.5 border-b border-dashed border-[#CCCCCC]">
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-[#1F1F1F]">
              <span>No. Order: {order.orderNumber}</span>
              <span>{formatDateIndo(order.createdAt).slice(0, 11)}</span>
            </div>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex-1 pr-2">
                    <span className="text-[#1F1F1F]">{item.quantity}x {item.productName}</span>
                    {item.variantName && <span className="block text-[10px] text-[#777777]">({item.variantName})</span>}
                  </div>
                  <span className="font-bold text-[#1F1F1F]">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial summary */}
          <div className="py-2 border-b border-dashed border-[#CCCCCC] space-y-1 text-[11px]">
            <div className="flex justify-between text-[#555555]">
              <span>Subtotal Produk</span>
              <span>{formatRupiah(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#555555]">
              <span>Ongkos Kirim ({order.courier})</span>
              <span>{formatRupiah(order.shippingCost)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#027A48] font-bold">
                <span>Diskon Kupon</span>
                <span>-{formatRupiah(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-[#1F1F1F] pt-1">
              <span>TOTAL DIBAYAR</span>
              <span>{formatRupiah(order.grandTotal)}</span>
            </div>
            <div className="text-center pt-1 text-[10px] font-semibold text-[#027A48]">
              Status: {order.paymentStatus} ({order.paymentMethod})
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-3 text-[10px] text-[#777777] space-y-0.5">
            <p>Terima kasih telah berbelanja di {store.name}</p>
            <p className="font-mono">kroombox.id/{store.slug}</p>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-3 flex items-center gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 min-h-[40px] rounded-xl border border-[#EAEAEA] text-[#555555] hover:text-[#1F1F1F] font-semibold text-xs hover:bg-[#F7F7F7] transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 min-h-[40px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk Thermal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

