import React from 'react';
import { Order } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import { getPaymentStatusLabel } from '../utils';

interface AdminTransactionsTabProps {
  orders: Order[];
  isEn: boolean;
}

export const AdminTransactionsTab: React.FC<AdminTransactionsTabProps> = ({
  orders,
  isEn,
}) => {
  return (
    <div className="space-y-3.5">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {isEn ? 'Global Transaction History' : 'Riwayat Transaksi Global'}
            </h3>
            <p className="text-[11px] text-gray-400">
              {isEn ? 'All customer orders processed through payment gateways' : 'Semua pesanan pembeli yang diproses melalui gateway'}
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-800">
            {orders.length} {isEn ? 'Transactions' : 'Transaksi'}
          </span>
        </div>

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
              {orders.map((ord) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
