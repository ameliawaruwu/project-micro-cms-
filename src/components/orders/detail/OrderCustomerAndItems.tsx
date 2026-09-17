import React from 'react';
import { User, Phone, MapPin, Package } from 'lucide-react';
import { Order } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';

interface OrderCustomerAndItemsProps {
  order: Order;
}

export const OrderCustomerAndItems: React.FC<OrderCustomerAndItemsProps> = ({ order }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
      {/* Left: Customer Info */}
      <div className="space-y-3 p-4 rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA]">
        <h5 className="font-bold text-[#1F1F1F] flex items-center gap-1.5">
          <User className="w-4 h-4 text-[#9A0602]" />
          <span>Informasi Pembeli & Alamat</span>
        </h5>
        <div className="space-y-1.5 text-[#555555]">
          <p className="font-bold text-[#1F1F1F] text-sm">{order.customerName}</p>
          <p className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#777777]" />
            <span className="font-mono font-semibold text-[#1F1F1F]">{order.customerPhone}</span>
          </p>
          <p className="flex items-start gap-1.5 pt-1">
            <MapPin className="w-3.5 h-3.5 text-[#9A0602] shrink-0 mt-0.5" />
            <span className="leading-snug">
              {order.customerAddress}, {order.customerCity} {order.customerPostalCode || ''}
            </span>
          </p>
          {order.notes && (
            <div className="p-2.5 rounded-xl bg-white border border-[#EAEAEA] text-[#555555] text-[11px] mt-2">
              <span className="font-bold text-[#1F1F1F]">Catatan:</span> "{order.notes}"
            </div>
          )}
        </div>
      </div>

      {/* Right: Ordered Products & Total Breakdown */}
      <div className="space-y-3">
        <h5 className="font-bold text-[#1F1F1F] flex items-center gap-1.5">
          <Package className="w-4 h-4 text-[#9A0602]" />
          <span>Daftar Barang Belanja</span>
        </h5>
        <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#EAEAEA]">
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
                  {item.variantName && ` • ${item.variantName}`}
                </p>
              </div>
              <span className="font-bold text-[#1F1F1F]">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {/* Price Calculations */}
        <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] space-y-1.5 text-[11px]">
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
          <div className="flex justify-between font-bold text-sm text-[#1F1F1F] pt-2 border-t border-[#EAEAEA]">
            <span>Total Tagihan</span>
            <span>{formatRupiah(order.grandTotal)}</span>
          </div>
          <div className="flex justify-between text-[#777777] pt-0.5 text-[10px]">
            <span>Metode Pembayaran</span>
            <span className="font-bold text-[#1F1F1F]">{order.paymentMethod}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
