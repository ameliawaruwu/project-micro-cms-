import React from 'react';
import { Order, Store as StoreType } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import { useLanguage } from '../../../contexts/LanguageContext';
import { BarcodeSvg } from './BarcodeSvg';
import { useStoreBaseDomain } from '../../../utils/storeDomain';
import { buyerNote, displayAddress, formatWeight, storeAddressLine } from './receiptData';

interface ShippingLabelViewProps {
  order: Order;
  store: StoreType;
  courierName: string;
  courierService: string;
  resiNumber: string;
  isCOD: boolean;
  /** Total berat dari tabel products (gram); null selama dimuat. */
  weightGrams: number | null;
}

export const ShippingLabelView: React.FC<ShippingLabelViewProps> = ({
  order,
  store,
  courierName,
  courierService,
  resiNumber,
  isCOD,
  weightGrams,
}) => {
  const { domain: storeBaseDomain } = useStoreBaseDomain(store);
  const { isEn } = useLanguage();
  const senderAddress = storeAddressLine(store);
  const note = buyerNote(order);
  const formatOrderDate = (value: string | undefined | null): string => {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    } catch {
      return value;
    }
  };
  return (
    <div
      id="printable-receipt"
      className="format-shipping-label w-full max-w-[100mm] bg-white text-[#000000] font-sans shadow-md rounded-md p-0 overflow-hidden border-2 border-black"
    >
      {/* Courier Header Bar */}
      <div className="bg-black text-white p-2.5 flex items-center justify-between border-b-2 border-black">
        <div className="flex items-center gap-2">
          <span className="text-base font-black tracking-wider uppercase">{courierName}</span>
          {courierService && (
            <span className="text-[11px] font-semibold bg-white/20 px-1.5 py-0.5 rounded tracking-wide">
              {courierService}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
            isCOD ? 'bg-amber-400 text-black' : 'bg-white text-black'
          }`}>
            {isCOD ? `COD: ${formatRupiah(order.grandTotal)}` : 'NON-COD'}
          </span>
          {order.shippingMethod && (
            <span className="text-[9px] font-bold bg-white/20 px-1.5 py-0.5 rounded uppercase">
              {order.shippingMethod === 'pickup' ? 'PICK-UP' : 'DROP-OFF'}
            </span>
          )}
        </div>
      </div>

      {/* Barcode & Resi Box */}
      <div className="p-3 border-b-2 border-black text-center bg-white space-y-1">
        <BarcodeSvg code={resiNumber || order.orderNumber} />
        <div className="font-mono font-black text-base sm:text-lg tracking-widest text-black">
          {resiNumber || `#${order.orderNumber}`}
        </div>
        {!resiNumber && (
          <div className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
            {isEn ? 'Tracking number not issued yet' : 'Nomor resi belum terbit'}
          </div>
        )}
        <div className="flex items-center justify-between text-[10px] font-semibold text-gray-700 px-1 pt-1 border-t border-dashed border-gray-300">
          <span>{isEn ? 'Order No.' : 'No. Pesanan'}: #{order.orderNumber}</span>
          <span>{formatOrderDate(order.createdAt)}</span>
        </div>
      </div>

      {/* Shipper & Consignee 2-Column Grid */}
      <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black text-[11px] leading-tight">
        {/* Consignee / Penerima */}
        <div className="p-2.5 space-y-1 bg-white">
          <div className="text-[9px] font-black uppercase tracking-wider text-gray-600">
            {isEn ? 'RECIPIENT (TO):' : 'PENERIMA (KEPADA):'}
          </div>
          <div className="font-extrabold text-sm text-black">{order.customerName}</div>
          <div className="font-mono font-bold text-black text-[11px]">{order.customerPhone}</div>
          <div className="text-gray-800 text-[10px] leading-snug pt-0.5">
            {displayAddress(order.customerAddress)}
          </div>
          <div className="font-bold text-black text-[10px]">
            {order.customerDistrict ? `${order.customerDistrict}, ` : ''}{order.customerCity} {order.customerPostalCode || ''}
          </div>
        </div>

        {/* Shipper / Pengirim */}
        <div className="p-2.5 space-y-1 bg-white">
          <div className="text-[9px] font-black uppercase tracking-wider text-gray-600">
            {isEn ? 'SENDER (FROM):' : 'PENGIRIM (DARI):'}
          </div>
          <div className="font-extrabold text-xs text-black">{store.name}</div>
          {store.phoneWhatsApp && (
            <div className="font-mono text-black text-[10px]">{store.phoneWhatsApp}</div>
          )}
          {senderAddress && (
            <div className="text-gray-800 text-[10px] leading-snug">{senderAddress}</div>
          )}
          <div className="text-[9px] text-gray-500 font-mono">
            {store.customDomain || `${store.slug}.${storeBaseDomain}`}
          </div>
        </div>
      </div>

      {/* Shipping Notes (if provided) */}
      {note && (
        <div className="p-2 border-b-2 border-black bg-gray-50 text-[10px] leading-snug">
          <span className="font-bold text-black uppercase">{isEn ? 'Buyer Note: ' : 'Catatan Pembeli: '}</span>
          <span className="italic text-gray-800">"{note}"</span>
        </div>
      )}

      {/* Package Content & Specs */}
      <div className="p-2.5 border-b-2 border-black space-y-1.5 text-[10px] leading-tight">
        <div className="flex items-center justify-between font-bold border-b border-gray-200 pb-1">
          <span>{isEn ? 'Weight' : 'Berat'}: {weightGrams === null ? '…' : formatWeight(weightGrams, isEn)}</span>
          <span>{isEn ? 'Items' : 'Jml Barang'}: {order.items.reduce((acc, i) => acc + i.quantity, 0)} pcs</span>
          <span>{isEn ? 'Shipping' : 'Ongkir'}: {formatRupiah(order.shippingCost)}</span>
        </div>
        <div>
          <span className="font-bold uppercase text-gray-600 block mb-0.5 text-[9px]">{isEn ? 'Item List:' : 'Daftar Barang:'}</span>
          <div className="space-y-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-gray-900">
                <span className="font-medium pr-2">
                  {item.quantity}x {item.productName} {item.variantName ? `(${item.variantName})` : ''}
                </span>
                <span className="font-semibold shrink-0">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Total */}
      <div className="p-2 bg-black text-white flex items-center justify-between text-xs font-bold">
        <span>{isEn ? 'TOTAL PAID' : 'TOTAL DIBAYAR'}</span>
        <span className="text-sm tracking-wide">{formatRupiah(order.grandTotal)}</span>
      </div>

      {/* Scissors cutting guide for standard A4 paper prints */}
      <div className="text-center py-2 text-[9px] font-mono text-gray-500 border-t border-dashed border-gray-400 bg-white print:block">
        {isEn ? '✂ ---------------- Package Label Cut Line ---------------- ✂' : '✂ ---------------- Garis Potong Label Paket ---------------- ✂'}
      </div>
    </div>
  );
};
