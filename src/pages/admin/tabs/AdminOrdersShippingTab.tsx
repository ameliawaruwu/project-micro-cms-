import React from 'react';
import {
  Truck,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Wallet,
  Search,
  X,
  Package,
  Store as StoreIcon,
  Copy,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Order, Store } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import {
  getCourierBadgeStyle,
  getShippingStatusBadgeStyle,
  getShippingStatusLabel,
  getPaymentStatusLabel,
} from '../utils';

interface AdminOrdersShippingTabProps {
  isEn: boolean;
  loadData: () => void;
  showToast: (msg: string) => void;
  totalOrdersCount: number;
  processingOrdersCount: number;
  shippedOrdersCount: number;
  completedOrdersCount: number;
  totalShippingFeePlatform: number;
  orderSearchQuery: string;
  setOrderSearchQuery: (query: string) => void;
  orderFilterStatus: string;
  setOrderFilterStatus: (status: string) => void;
  orderFilterCourier: string;
  setOrderFilterCourier: (courier: string) => void;
  orderFilterStore: string;
  setOrderFilterStore: (store: string) => void;
  filteredAdminOrders: Order[];
  stores: Store[];
  handleCopyResi: (resi: string) => void;
  setSelectedAdminOrder: (order: Order) => void;
}

export const AdminOrdersShippingTab: React.FC<AdminOrdersShippingTabProps> = ({
  isEn,
  loadData,
  showToast,
  totalOrdersCount,
  processingOrdersCount,
  shippedOrdersCount,
  completedOrdersCount,
  totalShippingFeePlatform,
  orderSearchQuery,
  setOrderSearchQuery,
  orderFilterStatus,
  setOrderFilterStatus,
  orderFilterCourier,
  setOrderFilterCourier,
  orderFilterStore,
  setOrderFilterStore,
  filteredAdminOrders,
  stores,
  handleCopyResi,
  setSelectedAdminOrder,
}) => {
  return (
    <div className="space-y-4">
      {/* Header section with Actions */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-red-600" />
            <span>{isEn ? 'Global Orders & Shipping Monitoring' : 'Monitoring Pesanan & Pengiriman Global'}</span>
          </h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {isEn
              ? 'Track all store order transactions, courier logistics statuses, and tracking numbers in real-time.'
              : 'Pantau seluruh transaksi pesanan, status kurir logistik, dan pelacakan nomor resi lintas toko secara real-time.'}
          </p>
        </div>
        <button
          onClick={() => {
            loadData();
            showToast(isEn ? 'Orders and shipping data refreshed' : 'Data pesanan dan pengiriman diperbarui');
          }}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          <span>{isEn ? 'Refresh Data' : 'Segarkan Data'}</span>
        </button>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Orders */}
        <div className="bg-white rounded-lg p-3.5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium">{isEn ? 'Total Orders' : 'Total Pesanan'}</span>
            <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-gray-900">{totalOrdersCount}</span>
            <span className="text-[10px] text-gray-500">{isEn ? 'orders' : 'transaksi'}</span>
          </div>
        </div>

        {/* Perlu Diproses / Siap Kirim */}
        <div className="bg-white rounded-lg p-3.5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium">{isEn ? 'Processing / Ready to Ship' : 'Diproses / Siap Kirim'}</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-amber-600">{processingOrdersCount}</span>
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
              {isEn ? 'Queued' : 'Antrean'}
            </span>
          </div>
        </div>

        {/* Sedang Dikirim */}
        <div className="bg-white rounded-lg p-3.5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium">{isEn ? 'In Shipping' : 'Dalam Pengiriman'}</span>
            <Truck className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-blue-600">{shippedOrdersCount}</span>
            <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
              {isEn ? 'Transit' : 'Transit'}
            </span>
          </div>
        </div>

        {/* Selesai / Terkirim */}
        <div className="bg-white rounded-lg p-3.5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium">{isEn ? 'Delivered / Completed' : 'Terkirim / Selesai'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-600">{completedOrdersCount}</span>
            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
              {isEn ? 'Success' : 'Sukses'}
            </span>
          </div>
        </div>

        {/* Total Ongkir Platform */}
        <div className="col-span-2 lg:col-span-1 bg-white rounded-lg p-3.5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-medium">{isEn ? 'Shipping Volume' : 'Volume Ongkir'}</span>
            <Wallet className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-purple-700 truncate">
              {formatRupiah(totalShippingFeePlatform)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isEn ? 'Search order no, tracking, customer, store...' : 'Cari no. order, resi, pembeli, toko...'}
            value={orderSearchQuery}
            onChange={(e) => setOrderSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600"
          />
          {orderSearchQuery && (
            <button
              onClick={() => setOrderSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Group */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Kirim Filter */}
          <select
            value={orderFilterStatus}
            onChange={(e) => setOrderFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
          >
            <option value="all">{isEn ? 'All Shipping Status' : 'Semua Status Kirim'}</option>
            <option value="Baru">{isEn ? 'New Orders' : 'Pesanan Baru'}</option>
            <option value="Diproses">{isEn ? 'Processing / Ready to Ship' : 'Diproses / Siap Kirim'}</option>
            <option value="Dikirim">{isEn ? 'In Shipping' : 'Dalam Pengiriman'}</option>
            <option value="Selesai">{isEn ? 'Delivered / Completed' : 'Terkirim / Selesai'}</option>
            <option value="Dibatalkan">{isEn ? 'Cancelled' : 'Dibatalkan'}</option>
          </select>

          {/* Kurir Filter */}
          <select
            value={orderFilterCourier}
            onChange={(e) => setOrderFilterCourier(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
          >
            <option value="all">{isEn ? 'All Couriers' : 'Semua Kurir'}</option>
            <option value="J&T">J&T Express</option>
            <option value="SiCepat">SiCepat</option>
            <option value="JNE">JNE</option>
            <option value="GoSend">GoSend</option>
          </select>

          {/* Toko Filter */}
          <select
            value={orderFilterStore}
            onChange={(e) => setOrderFilterStore(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-600 max-w-[150px] truncate cursor-pointer"
          >
            <option value="all">{isEn ? 'All Stores' : 'Semua Toko'}</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Reset Filter Button */}
          {(orderSearchQuery || orderFilterStatus !== 'all' || orderFilterCourier !== 'all' || orderFilterStore !== 'all') && (
            <button
              onClick={() => {
                setOrderSearchQuery('');
                setOrderFilterStatus('all');
                setOrderFilterCourier('all');
                setOrderFilterStore('all');
              }}
              className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition font-medium cursor-pointer"
            >
              {isEn ? 'Reset Filter' : 'Reset Filter'}
            </button>
          )}
        </div>
      </div>

      {/* Global Orders & Shipping Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {isEn ? 'Store Logistics & Shipping List' : 'Daftar Logistik & Pengiriman Toko'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-semibold">
              {filteredAdminOrders.length} {isEn ? 'Found' : 'Ditemukan'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">{isEn ? 'Order & Date' : 'Order & Tanggal'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Origin Store' : 'Toko Pengirim'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Recipient & Address' : 'Penerima & Alamat'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Courier & Shipping Fee' : 'Ekspedisi & Ongkir'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Tracking Number' : 'Nomor Resi'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Shipping Status' : 'Status Pengiriman'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Grand Total' : 'Total Belanja'}</th>
                <th className="py-2.5 px-3.5 text-right">{isEn ? 'Action' : 'Aksi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdminOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-700">{isEn ? 'No orders found' : 'Tidak ada pesanan ditemukan'}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {isEn ? 'Try adjusting your search keywords or shipping status filters.' : 'Coba sesuaikan kata kunci pencarian atau filter status pengiriman.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdminOrders.map((ord) => {
                  const store = stores.find((s) => s.id === ord.storeId);
                  const storeName = store?.name || (isEn ? 'Store ' : 'Toko ') + ord.storeId;
                  const resi = ord.resiNumber || ord.trackingNumber;

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                      {/* Order & Date */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-mono font-bold text-gray-900 leading-tight">
                          {ord.orderNumber || ord.id.slice(0, 8)}
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Store */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                            {store?.logoUrl ? (
                              <img src={store.logoUrl} alt={storeName} className="w-full h-full object-cover" />
                            ) : (
                              <StoreIcon className="w-3.5 h-3.5 text-gray-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[130px] leading-tight">
                              {storeName}
                            </p>
                            <span className="text-[10px] text-gray-400 font-mono">
                              /{store?.slug || ord.storeId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="py-3 px-3.5 align-top">
                        <p className="font-semibold text-gray-900 leading-tight">{ord.customerName}</p>
                        <span className="text-[11px] text-gray-500 block truncate max-w-[150px]">
                          {ord.customerCity || ord.customerAddress}
                        </span>
                        <span className="text-[10px] text-gray-400 block">{ord.customerPhone}</span>
                      </td>

                      {/* Courier & Shipping Cost */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getCourierBadgeStyle(ord.courier)}`}>
                            {ord.courier || (isEn ? 'Courier' : 'Kurir')}
                          </span>
                          {ord.courierService && (
                            <span className="text-[10px] text-gray-500">
                              {ord.courierService}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-gray-700 block mt-1">
                          {formatRupiah(ord.shippingCost || 0)}
                        </span>
                      </td>

                      {/* Resi Number */}
                      <td className="py-3 px-3.5 align-top">
                        {resi ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                {resi}
                              </span>
                              <button
                                onClick={() => handleCopyResi(resi)}
                                title={isEn ? 'Copy Tracking' : 'Salin Resi'}
                                className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {ord.shippingLabelUrl && (
                              <a
                                href={ord.shippingLabelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-medium"
                              >
                                <span>Biteship Tracking</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            {isEn ? 'No tracking yet' : 'Belum ada resi'}
                          </span>
                        )}
                      </td>

                      {/* Shipping & Payment Status */}
                      <td className="py-3 px-3.5 align-top">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border block w-max ${getShippingStatusBadgeStyle(ord.shippingStatus)}`}>
                          {getShippingStatusLabel(ord.shippingStatus, isEn)}
                        </span>
                        <span className={`text-[10px] font-medium block mt-1 ${
                          ord.paymentStatus === 'Sudah Dibayar' ? 'text-emerald-700' : 'text-amber-600'
                        }`}>
                          ● {getPaymentStatusLabel(ord.paymentStatus, isEn)} ({ord.paymentMethod})
                        </span>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-bold text-gray-900">
                          {formatRupiah(ord.grandTotal)}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {ord.items?.length || 1} {isEn ? 'item' : 'item'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 align-top text-right">
                        <button
                          onClick={() => setSelectedAdminOrder(ord)}
                          className="px-2.5 py-1 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-xs shadow-2xs transition cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                          <span>{isEn ? 'Detail' : 'Detail'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
