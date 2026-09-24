import React from 'react';
import { Receipt } from 'lucide-react';
import { Order } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import { getPaymentStatusLabel } from '../utils';

import { Breadcrumb } from '../../../components/common/Breadcrumb';

interface AdminTransactionsTabProps {
  orders: Order[];
  isEn: boolean;
  onNavigateOverview?: () => void;
}

export const AdminTransactionsTab: React.FC<AdminTransactionsTabProps> = ({
  orders,
  isEn,
  onNavigateOverview,
}) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: isEn ? 'Dashboard' : 'Beranda', onClick: onNavigateOverview },
          { label: isEn ? 'Transaction Logs' : 'Log Transaksi', isActive: true },
        ]}
      />

      {/* Page Header */}
      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-[#66000E]" />
            <span>{isEn ? 'Transaction Logs' : 'Log Transaksi'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEn
              ? 'Audit trail of customer payments processed across all merchant stores.'
              : 'Catatan audit riwayat transaksi pembayaran lintas toko merchant.'}
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-800 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 self-start sm:self-auto">
          {orders.length} {isEn ? 'Transactions' : 'Transaksi'}
        </span>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">Order ID</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Customer' : 'Pembeli'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Method' : 'Metode'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Grand Total' : 'Total Belanja'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Platform Fee' : 'Fee Platform'}</th>
                <th className="py-2.5 px-3.5">{isEn ? 'Status' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold text-gray-700">{isEn ? 'No transactions yet' : 'Belum ada transaksi'}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {isEn ? 'Order transactions from database will appear here.' : 'Catatan transaksi pesanan dari database akan tampil di sini.'}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                const fee = Math.round(ord.grandTotal * 0.015);
                return (
                  <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-gray-900">
                      {ord.orderNumber || ord.id.slice(0, 8)}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <p className="font-semibold text-gray-900 leading-tight">{ord.customerName}</p>
                      <span className="text-[10px] text-gray-400">{ord.customerPhone}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-gray-600">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-gray-900">
                      {formatRupiah(ord.grandTotal)}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-emerald-700">
                      +{formatRupiah(fee)}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold capitalize ${
                        ord.paymentStatus === 'Sudah Dibayar'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {getPaymentStatusLabel(ord.paymentStatus, isEn)}
                      </span>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
