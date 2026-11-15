import React from 'react';
import { Order, ShippingBranch } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { buyerNote } from '../orders/receipt/receiptData';

interface ShipmentThermalLabelProps {
  order: Order;
  dynamicCourierName: string;
  dynamicServiceName: string;
  deliveryType: 'drop_off' | 'pickup';
  trackingNumber: string;
  selectedBranch: ShippingBranch | null;
}

export const ShipmentThermalLabel: React.FC<ShipmentThermalLabelProps> = ({
  order,
  dynamicCourierName,
  dynamicServiceName,
  deliveryType,
  trackingNumber,
  selectedBranch,
}) => {
  const { isEn } = useLanguage();
  const labelDate = (() => {
    const raw = order.createdAt || new Date().toISOString();
    try {
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(raw));
    } catch {
      return raw;
    }
  })();
  return (
    <div
      id="printable-shipping-label"
      className="bg-white border-2 border-zinc-900 rounded-2xl p-4 sm:p-5 text-zinc-900 space-y-3 font-sans shadow-xs print:border-none print:p-0 print:m-0"
    >
      {/* Header Label: Kurir & Layanan */}
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-zinc-900 text-white font-black text-sm tracking-wider uppercase rounded-md">
            {dynamicCourierName}
          </div>
          <span className="font-extrabold text-sm sm:text-base text-zinc-900 tracking-wide uppercase">
            {dynamicServiceName}
          </span>
        </div>
        <div className="text-right">
          <span className="inline-block px-2.5 py-0.5 border border-zinc-900 font-bold text-[10px] uppercase tracking-wider rounded">
            {deliveryType === 'pickup' ? 'PICK-UP' : 'DROP-OFF'}
          </span>
          <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
            {labelDate}
          </p>
        </div>
      </div>

      {/* Mock Barcode & Nomor Resi */}
      <div className="text-center py-2.5 border-b-2 border-zinc-900 space-y-1">
        <div className="flex items-center justify-center gap-0.5 h-12 py-1">
          {[2, 4, 1, 3, 2, 4, 1, 3, 4, 2, 1, 3, 2, 4, 3, 1, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 2, 1, 3, 2].map(
            (w, idx) => (
              <div
                key={idx}
                className={`bg-zinc-900 h-full ${
                  w === 1 ? 'w-0.5' : w === 2 ? 'w-1' : w === 3 ? 'w-1.5' : 'w-2'
                }`}
              />
            )
          )}
        </div>
        <div className="font-mono font-black text-lg sm:text-xl tracking-widest text-zinc-900">
          {trackingNumber}
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">
          {isEn ? 'Order No.' : 'No. Pesanan'}: #{order.orderNumber}
        </div>
      </div>

      {/* Pengirim & Penerima (Shipper & Consignee) */}
      <div className="grid grid-cols-2 gap-3 border-b-2 border-zinc-900 pb-3 text-[11px] leading-tight">
        {/* Shipper */}
        <div className="pr-2 border-r border-zinc-300 space-y-1">
          <div className="font-bold uppercase text-[9px] tracking-wider text-zinc-500">
            {isEn ? 'Shipper:' : 'Pengirim (Shipper):'}
          </div>
          <div className="font-bold text-zinc-900 text-xs">
            {selectedBranch?.branchName || (isEn ? 'Main Warehouse' : 'Gudang Utama')}
          </div>
          <div className="text-zinc-700">
            {selectedBranch?.picName || (isEn ? 'Warehouse Admin' : 'Admin Gudang')} • {selectedBranch?.picPhone || '-'}
          </div>
          <div className="text-zinc-600 text-[10px]">
            {selectedBranch?.address || (isEn ? 'Warehouse Origin Address' : 'Alamat Asal Gudang')}
          </div>
          <div className="font-semibold text-zinc-800 text-[10px]">
            {selectedBranch?.city} {selectedBranch?.postalCode || ''}
          </div>
        </div>

        {/* Consignee */}
        <div className="pl-1 space-y-1">
          <div className="font-bold uppercase text-[9px] tracking-wider text-zinc-500">
            {isEn ? 'Consignee:' : 'Penerima (Consignee):'}
          </div>
          <div className="font-bold text-zinc-900 text-xs">
            {order.customerName}
          </div>
          <div className="text-zinc-700 font-mono text-[10px]">
            {order.customerPhone}
          </div>
          <div className="text-zinc-600 text-[10px]">
            {order.customerAddress}
          </div>
          <div className="font-semibold text-zinc-800 text-[10px]">
            {order.customerCity} {order.customerPostalCode || ''}
          </div>
        </div>
      </div>

      {/* Spesifikasi Paket & Barang */}
      <div className="space-y-1.5 text-[11px] leading-tight border-b-2 border-zinc-900 pb-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-zinc-600">{isEn ? 'Parcel Weight:' : 'Berat Paket:'}</span>
          <span className="font-bold font-mono text-zinc-900">{isEn ? '1.0 Kg (Standard)' : '1.0 Kg (Standar)'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-zinc-600">{isEn ? 'Payment Method:' : 'Metode Bayar:'}</span>
          <span className="font-bold text-zinc-900">
            {order.paymentMethod === 'COD'
              ? (isEn ? 'COD (Cash on Delivery)' : 'COD (Bayar di Tempat)')
              : (isEn ? 'NON-COD (Paid)' : 'NON-COD (Lunas)')}
          </span>
        </div>
        {order.items && order.items.length > 0 && (
          <div className="pt-1">
            <span className="font-semibold text-[10px] text-zinc-500 block">{isEn ? 'Item Details:' : 'Rincian Barang:'}</span>
            <p className="text-[10px] text-zinc-800 line-clamp-2">
              {order.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
            </p>
          </div>
        )}
        {buyerNote(order) && (
          <div className="text-[10px] text-zinc-500 italic">
            {isEn ? 'Notes' : 'Catatan'}: {buyerNote(order)}
          </div>
        )}
      </div>

      {/* Footer Label Thermal */}
      <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-0.5 font-mono">
        <span>Biteship Logistics Aggregator</span>
        <span>{isEn ? 'A6 Thermal Format (10x15 cm)' : 'Format Thermal A6 (10x15 cm)'}</span>
      </div>
    </div>
  );
};
