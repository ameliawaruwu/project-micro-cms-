import React from 'react';
import { Order, Store as StoreType } from '../../../types';
import { formatRupiah, formatDateIndo } from '../../../utils/formatters';

interface ThermalReceiptViewProps {
  order: Order;
  store: StoreType;
  courierName: string;
  resiNumber: string;
}

export const ThermalReceiptView: React.FC<ThermalReceiptViewProps> = ({
  order,
  store,
  courierName,
  resiNumber,
}) => {
  return (
    <div
      id="printable-receipt"
      className="format-thermal-receipt w-full max-w-[76mm] bg-white text-black font-mono text-[11px] shadow-md rounded-md p-3.5 space-y-2 border border-dashed border-gray-300 leading-snug"
    >
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black space-y-0.5">
        <h2 className="text-sm font-bold tracking-tight text-black">{store.name}</h2>
        <p className="text-[10px] text-gray-600">{store.city}</p>
        <p className="text-[10px] text-gray-600">WA: {store.phoneWhatsApp || '-'}</p>
      </div>

      {/* Order Info */}
      <div className="text-[10px] space-y-0.5 py-1 border-b border-dashed border-black">
        <div className="flex justify-between">
          <span>No: #{order.orderNumber}</span>
          <span>{formatDateIndo(order.createdAt).slice(0, 11)}</span>
        </div>
        <div>Plg: {order.customerName} ({order.customerPhone})</div>
        <div>Kurir: {courierName} - {resiNumber}</div>
      </div>

      {/* Items */}
      <div className="py-1 border-b border-dashed border-black space-y-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start text-[10px]">
            <div className="flex-1 pr-1">
              <div>{item.quantity}x {item.productName}</div>
              {item.variantName && <div className="text-[9px] text-gray-500">({item.variantName})</div>}
            </div>
            <span className="font-bold">{formatRupiah(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="py-1 border-b border-dashed border-black space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatRupiah(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Ongkir</span>
          <span>{formatRupiah(order.shippingCost)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Diskon</span>
            <span>-{formatRupiah(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
          <span>TOTAL</span>
          <span>{formatRupiah(order.grandTotal)}</span>
        </div>
        <div className="text-center text-[9px] font-bold text-green-700 pt-0.5">
          LUNAS ({order.paymentMethod})
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 text-[9px] text-gray-500 space-y-0.5">
        <p>Terima kasih telah berbelanja!</p>
        <p>{store.customDomain || `${store.slug}.kroombox.com`}</p>
      </div>
    </div>
  );
};
