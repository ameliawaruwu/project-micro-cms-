import React from 'react';
import { Order, Store as StoreType } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useStoreBaseDomain } from '../../../utils/storeDomain';

interface InvoiceA4ViewProps {
  order: Order;
  store: StoreType;
  courierName: string;
  courierService: string;
  resiNumber: string;
}

export const InvoiceA4View: React.FC<InvoiceA4ViewProps> = ({
  order,
  store,
  courierName,
  courierService,
  resiNumber,
}) => {
  const { domain: storeBaseDomain } = useStoreBaseDomain(store);
  const { isEn } = useLanguage();
  const formatOrderDate = (value: string | undefined | null): string => {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    } catch {
      return value;
    }
  };
  const paymentStatusLabel = (status: string): string => {
    if (!isEn) return status;
    if (status === 'Sudah Dibayar') return 'Paid';
    if (status === 'Belum Dibayar') return 'Unpaid';
    if (status === 'Gagal') return 'Failed';
    return status;
  };
  return (
    <div
      id="printable-receipt"
      className="format-invoice-a4 w-full max-w-[195mm] bg-white text-black font-poppins shadow-md rounded-md p-6 sm:p-8 space-y-6 border border-gray-200"
    >
      {/* Invoice Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black uppercase">
            {store.name}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">{store.city || 'Indonesia'}</p>
          <p className="text-xs text-gray-600 font-mono">WA: {store.phoneWhatsApp || '-'}</p>
          <p className="text-xs text-gray-500 font-mono">{store.customDomain || `${store.slug}.${storeBaseDomain}`}</p>
        </div>

        <div className="text-right">
          <div className="text-lg sm:text-xl font-black tracking-wider text-[#66000E]">
            {isEn ? 'SALES INVOICE' : 'FAKTUR PENJUALAN'}
          </div>
          <div className="text-xs font-mono font-bold text-gray-800 mt-1">
            NO: INV/{order.orderNumber}
          </div>
          <div className="text-xs text-gray-600">
            {isEn ? 'Date' : 'Tanggal'}: {formatOrderDate(order.createdAt)}
          </div>
          <div className="inline-block mt-2 px-2.5 py-0.5 text-[11px] font-bold uppercase rounded border border-green-600 bg-green-50 text-green-700">
            STATUS: {paymentStatusLabel(order.paymentStatus)} ({order.paymentMethod})
          </div>
        </div>
      </div>

      {/* Billing & Shipping Grid */}
      <div className="grid grid-cols-2 gap-4 border border-gray-200 rounded-lg p-3.5 bg-gray-50/50 text-xs">
        <div>
          <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">
            {isEn ? 'Billed To:' : 'Ditagihkan Kepada:'}
          </div>
          <div className="font-extrabold text-sm text-black">{order.customerName}</div>
          <div className="text-gray-700 font-mono">{order.customerPhone}</div>
          <div className="text-gray-700 mt-1 leading-snug">{order.customerAddress}</div>
          <div className="font-semibold text-gray-800">
            {order.customerDistrict ? `${order.customerDistrict}, ` : ''}{order.customerCity} {order.customerPostalCode || ''}
          </div>
        </div>

        <div>
          <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">
            {isEn ? 'Shipping Details:' : 'Detail Pengiriman:'}
          </div>
          <div className="font-bold text-black">
            {courierName} ({courierService})
          </div>
          <div className="font-mono text-xs font-semibold text-black mt-0.5">
            {isEn ? 'Tracking No.' : 'No. Resi'}: {resiNumber}
          </div>
          <div className="text-gray-700 mt-1">
            {isEn ? 'Method' : 'Metode'}: {order.shippingMethod === 'pickup' ? (isEn ? 'Courier Pick-up' : 'Pick-up Kurir') : 'Drop-off Counter'}
          </div>
          {order.notes && (
            <div className="text-[11px] italic text-gray-600 mt-1 bg-white p-1 rounded border border-gray-200">
              {isEn ? 'Notes' : 'Catatan'}: "{order.notes}"
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-gray-100 text-gray-800 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3 w-10">No</th>
              <th className="py-2.5 px-3">{isEn ? 'Product Description' : 'Deskripsi Produk'}</th>
              <th className="py-2.5 px-3 text-right">{isEn ? 'Unit Price' : 'Harga Satuan'}</th>
              <th className="py-2.5 px-3 text-center w-16">Qty</th>
              <th className="py-2.5 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="py-2 px-3 font-mono text-gray-500">{idx + 1}</td>
                <td className="py-2 px-3">
                  <div className="font-bold text-black">{item.productName}</div>
                  {item.variantName && (
                    <div className="text-[10px] text-gray-500">{isEn ? 'Variant' : 'Varian'}: {item.variantName}</div>
                  )}
                </td>
                <td className="py-2 px-3 text-right font-mono">{formatRupiah(item.price)}</td>
                <td className="py-2 px-3 text-center font-bold font-mono">{item.quantity}</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-black">
                  {formatRupiah(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculation Breakdown & Stamp */}
      <div className="flex justify-between items-start pt-2 border-t-2 border-black">
        {/* Store Note & Authorized Stamp */}
        <div className="w-1/2 pr-4 space-y-2 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 text-[11px] leading-relaxed">
            <p className="font-bold text-gray-800">{isEn ? 'Store Terms & Conditions:' : 'Syarat & Ketentuan Toko:'}</p>
            <p>{isEn ? 'Purchased items are covered by a return guarantee for manufacturing defects reported within 2x24 hours of receiving the package.' : 'Barang yang telah dibeli dilindungi jaminan retur jika ditemukan cacat produksi maksimal 2x24 jam sejak paket diterima.'}</p>
          </div>
          <p className="text-[10px] text-gray-500 italic">
            {isEn
              ? `This document is valid proof of transaction, issued electronically by ${store.name}.`
              : `Dokumen ini merupakan bukti transaksi yang sah dan diterbitkan secara elektronik oleh ${store.name}.`}
          </p>
        </div>

        {/* Financial Summary */}
        <div className="w-1/2 pl-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>{isEn ? 'Product Subtotal' : 'Subtotal Produk'}</span>
            <span className="font-mono font-semibold">{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{isEn ? 'Shipping Cost' : 'Ongkos Kirim'} ({courierName})</span>
            <span className="font-mono font-semibold">{formatRupiah(order.shippingCost)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700 font-semibold">
              <span>{isEn ? 'Promo Discount' : 'Diskon Promosi'}</span>
              <span className="font-mono">-{formatRupiah(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black border-t-2 border-black pt-2 text-black">
            <span>{isEn ? 'TOTAL DUE' : 'TOTAL TAGIHAN'}</span>
            <span className="font-mono">{formatRupiah(order.grandTotal)}</span>
          </div>
          <div className="text-right text-[10px] text-gray-500 pt-0.5">
            {isEn ? 'Payment Method' : 'Metode Pembayaran'}: <span className="font-bold text-black">{order.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Invoice Footer */}
      <div className="pt-6 border-t border-dashed border-gray-300 text-center text-xs text-gray-500">
        {isEn ? 'Thank you for your order at' : 'Terima kasih atas pesanan Anda di'} <strong>{store.name}</strong> • Powered by LapakQ
      </div>
    </div>
  );
};
