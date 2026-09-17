import React from 'react';
import {
  Store as StoreIcon,
  TrendingUp,
  DollarSign,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Store, WithdrawalRequest, AdminPlatformStats } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import { AdminTab } from '../types';

interface AdminOverviewTabProps {
  stats: AdminPlatformStats;
  platformSettings: { platformFeePercent: number };
  withdrawals: WithdrawalRequest[];
  stores: Store[];
  setActiveTab: (tab: AdminTab) => void;
  language: string;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  platformSettings,
  withdrawals,
  stores,
  setActiveTab,
  language,
}) => {
  return (
    <div className="space-y-5">
      {/* 4 Compact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Stores */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium">{language === 'en' ? 'Registered Stores' : 'Toko Terdaftar'}</span>
            <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{stats.totalStores}</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
              {stats.activeStores} {language === 'en' ? 'Active' : 'Aktif'}
            </span>
          </div>
        </div>

        {/* Total GMV */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium">Total GMV</span>
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">{formatRupiah(stats.totalGmv)}</span>
          </div>
        </div>

        {/* Platform Fee Revenue */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium">{language === 'en' ? 'Platform Revenue' : 'Revenue Platform'}</span>
            <DollarSign className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-red-600">{formatRupiah(stats.totalRevenueFee)}</span>
            <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
              {platformSettings.platformFeePercent}% Fee
            </span>
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1.5">
            <span className="text-xs font-medium">{language === 'en' ? 'Payout Queue' : 'Antrean Payout'}</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">{stats.pendingWithdrawalsCount}</span>
            <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
              {formatRupiah(stats.pendingWithdrawalsAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Grid 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Payouts */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {language === 'en' ? 'Recent Payout Requests' : 'Permintaan Pencairan Terbaru'}
            </h3>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className="text-xs font-medium text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {language === 'en' ? 'View All' : 'Lihat Semua'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {withdrawals.slice(0, 3).map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-2.5 rounded-md bg-gray-50/70 border border-gray-100"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center font-bold text-[11px] text-gray-700">
                    {w.bankName}
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-gray-900 leading-tight">{w.storeName}</p>
                    <span className="text-[10px] text-gray-400">
                      {w.accountNumber} a.n {w.accountHolder}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-xs text-gray-900 block">{formatRupiah(w.amount)}</span>
                  <span className={`text-[10px] font-medium capitalize ${
                    w.status === 'pending'
                      ? 'text-amber-600'
                      : w.status === 'approved'
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}>
                    {w.status === 'pending'
                      ? (language === 'en' ? 'Pending' : 'Menunggu')
                      : w.status === 'approved'
                      ? (language === 'en' ? 'Approved' : 'Disetujui')
                      : w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {language === 'en' ? 'Subscription Distribution' : 'Distribusi Paket Langganan'}
            </h3>
            <button
              onClick={() => setActiveTab('plans')}
              className="text-xs font-medium text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {language === 'en' ? 'Manage Plans' : 'Atur Kuota'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="p-3 rounded-md bg-gray-50 border border-gray-200">
              <span className="text-[10px] font-semibold text-gray-500 uppercase block">
                {language === 'en' ? 'Free' : 'Gratis'}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {stores.filter((s) => !s.plan || s.plan === 'free').length}
              </span>
              <span className="text-[10px] text-gray-400 block">
                {language === 'en' ? 'Stores' : 'Toko'}
              </span>
            </div>

            <div className="p-3 rounded-md bg-red-50/60 border border-red-100">
              <span className="text-[10px] font-semibold text-red-700 uppercase block">Pro</span>
              <span className="text-lg font-bold text-red-600">
                {stores.filter((s) => s.plan === 'premium' || s.plan === 'starter').length}
              </span>
              <span className="text-[10px] text-red-500 block">
                {language === 'en' ? 'Stores' : 'Toko'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
