import React from 'react';
import {
  Truck,
  X,
  Store as StoreIcon,
  MapPin,
  Phone,
  Copy,
  ExternalLink,
  Package,
} from 'lucide-react';
import { Order, Store } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';

interface AdminOrderDetailModalProps {
  selectedAdminOrder: Order | null;
  onClose: () => void;
  stores: Store[];
  handleCopyResi: (resi: string) => void;
  getShippingStatusBadgeStyle: (status?: string) => string;
  getShippingStatusLabel: (status?: string) => string;
  getPaymentStatusLabel: (status?: string) => string;
  isEn: boolean;
}

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  selectedAdminOrder,
  onClose,
  stores,
  handleCopyResi,
  getShippingStatusBadgeStyle,
  getShippingStatusLabel,
  getPaymentStatusLabel,
  isEn,
}) => {
  if (!selectedAdminOrder) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight">
                {isEn ? 'Order Details #' : 'Detail Pesanan #'}{selectedAdminOrder.orderNumber || selectedAdminOrder.id}
              </h3>
              <p className="text-[11px] text-gray-500">
                {isEn ? 'Transaction Time: ' : 'Waktu Transaksi: '}{new Date(selectedAdminOrder.createdAt).toLocaleString(isEn ? 'en-US' : 'id-ID')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store & Status Bar */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StoreIcon className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-900">
              {isEn ? 'Store: ' : 'Toko: '}{stores.find((s) => s.id === selectedAdminOrder.storeId)?.name || selectedAdminOrder.storeId}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              (ID: {selectedAdminOrder.storeId})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getShippingStatusBadgeStyle(selectedAdminOrder.shippingStatus)}`}>
              {isEn ? 'Shipping: ' : 'Kirim: '}{getShippingStatusLabel(selectedAdminOrder.shippingStatus)}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              selectedAdminOrder.paymentStatus === 'Sudah Dibayar'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isEn ? 'Payment: ' : 'Bayar: '}{getPaymentStatusLabel(selectedAdminOrder.paymentStatus)}
            </span>
          </div>
        </div>

        {/* Grid 2 Columns: Penerima & Logistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Penerima */}
          <div className="border border-gray-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>{isEn ? 'Recipient Information' : 'Informasi Penerima'}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{selectedAdminOrder.customerName}</p>
              <p className="text-gray-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-gray-400" />
                <span>{selectedAdminOrder.customerPhone}</span>
              </p>
              <p className="text-gray-500 mt-1 leading-relaxed text-[11px]">
                {selectedAdminOrder.customerAddress}, {selectedAdminOrder.customerCity} {selectedAdminOrder.customerPostalCode || ''}
              </p>
            </div>
          </div>

          {/* Ekspedisi */}
          <div className="border border-gray-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEn ? 'Courier & Tracking' : 'Ekspedisi & Nomor Resi'}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[11px]">{isEn ? 'Courier & Service:' : 'Kurir & Layanan:'}</span>
                <span className="font-bold text-gray-900">
                  {selectedAdminOrder.courier || (isEn ? 'Courier' : 'Kurir')} {selectedAdminOrder.courierService ? `(${selectedAdminOrder.courierService})` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[11px]">{isEn ? 'Tracking Number:' : 'Nomor Resi:'}</span>
                <span className="font-mono font-bold text-gray-900">
                  {selectedAdminOrder.resiNumber || selectedAdminOrder.trackingNumber || '-'}
                </span>
              </div>

              {(selectedAdminOrder.resiNumber || selectedAdminOrder.trackingNumber) && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyResi(selectedAdminOrder.resiNumber || selectedAdminOrder.trackingNumber || '')}
                    className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{isEn ? 'Copy Tracking' : 'Salin Resi'}</span>
                  </button>
                  {selectedAdminOrder.shippingLabelUrl && (
                    <a
                      href={selectedAdminOrder.shippingLabelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium flex items-center gap-1 transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{isEn ? 'Track on Biteship' : 'Buka Tracking Biteship'}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50/80 px-3.5 py-2 border-b border-gray-200 font-semibold text-[11px] text-gray-600 flex items-center justify-between">
            <span>{isEn ? 'Ordered Products List' : 'Daftar Produk yang Dipesan'}</span>
            <span>{selectedAdminOrder.items?.length || 0} {isEn ? 'Items' : 'Item'}</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {selectedAdminOrder.items && selectedAdminOrder.items.length > 0 ? (
              selectedAdminOrder.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.quantity}x {formatRupiah(item.price)}
                        {item.variantName ? ` • ${isEn ? 'Variant' : 'Varian'}: ${item.variantName}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    {formatRupiah(item.subtotal || item.price * item.quantity)}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400 text-xs">{isEn ? 'No item details available' : 'Tidak ada data rincian item'}</div>
            )}
          </div>
        </div>

        {/* Financial Calculation breakdown */}
        <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>{isEn ? 'Product Subtotal' : 'Subtotal Produk'}</span>
            <span>{formatRupiah(selectedAdminOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{isEn ? 'Shipping Fee (Ongkir)' : 'Biaya Pengiriman (Ongkir)'}</span>
            <span>{formatRupiah(selectedAdminOrder.shippingCost || 0)}</span>
          </div>
          {selectedAdminOrder.discount ? (
            <div className="flex justify-between text-emerald-600">
              <span>{isEn ? 'Promo Discount' : 'Diskon Promo'}</span>
              <span>-{formatRupiah(selectedAdminOrder.discount)}</span>
            </div>
          ) : null}
          <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-bold text-sm text-gray-900">
            <span>{isEn ? 'Grand Total Payment' : 'Grand Total Pembayaran'}</span>
            <span className="text-red-600">{formatRupiah(selectedAdminOrder.grandTotal)}</span>
          </div>
          <div className="pt-1 text-[11px] text-gray-500 flex justify-between">
            <span>{isEn ? 'Payment Method' : 'Metode Pembayaran'}</span>
            <span className="font-semibold text-gray-800">{selectedAdminOrder.paymentMethod}</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
