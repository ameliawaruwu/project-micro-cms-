import React from 'react';
import {
  Crown,
  Plus,
  CheckCircle2,
  Receipt,
  Store as StoreIcon,
  Check,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
} from 'lucide-react';
import { BillingPlan, BillingSubscription, Store } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';
import { PlanFormState } from '../types';
import { AdminPlanModal } from '../components/AdminPlanModal';

import { Breadcrumb } from '../../../components/common/Breadcrumb';

interface AdminPlansTabProps {
  isEn: boolean;
  planSubTab: 'plans' | 'invoices';
  setPlanSubTab: (tab: 'plans' | 'invoices') => void;
  billingPlans: BillingPlan[];
  billingSubscriptions: BillingSubscription[];
  stores: Store[];
  handleOpenCreatePlan: () => void;
  handleOpenEditPlan: (plan: BillingPlan) => void;
  handleTogglePlanActive: (id: string) => void;
  handleDeletePlan: (id: string, name: string) => void;
  isPlanModalOpen: boolean;
  setIsPlanModalOpen: (open: boolean) => void;
  editingPlan: BillingPlan | null;
  planForm: PlanFormState;
  setPlanForm: React.Dispatch<React.SetStateAction<PlanFormState>>;
  handleSavePlan: (e: React.FormEvent) => void;
  onNavigateOverview?: () => void;
}

export const AdminPlansTab: React.FC<AdminPlansTabProps> = ({
  isEn,
  planSubTab,
  setPlanSubTab,
  billingPlans,
  billingSubscriptions,
  stores,
  handleOpenCreatePlan,
  handleOpenEditPlan,
  handleTogglePlanActive,
  handleDeletePlan,
  isPlanModalOpen,
  setIsPlanModalOpen,
  editingPlan,
  planForm,
  setPlanForm,
  handleSavePlan,
  onNavigateOverview,
}) => {
  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: isEn ? 'Dashboard' : 'Beranda', onClick: onNavigateOverview },
          { label: isEn ? 'Billing Plans' : 'Paket Langganan', isActive: true },
        ]}
      />

      {/* Page Header */}
      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-[#66000E]" />
            <span>{isEn ? 'Billing Plans Management' : 'Paket Langganan'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEn
              ? 'Manage store subscription tiers, monthly & yearly pricing, features, and platform billing history.'
              : 'Kelola paket langganan toko, harga bulanan & tahunan, fitur, dan riwayat tagihan platform.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap self-start sm:self-auto shrink-0">
          <div className="flex bg-gray-100 p-1 rounded-md text-xs font-semibold border border-gray-200">
            <button
              type="button"
              onClick={() => setPlanSubTab('plans')}
              className={`px-3 py-1 rounded transition cursor-pointer ${
                planSubTab === 'plans'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isEn ? 'Plans List' : 'Daftar Paket'} ({billingPlans.length})
            </button>
            <button
              type="button"
              onClick={() => setPlanSubTab('invoices')}
              className={`px-3 py-1 rounded transition cursor-pointer ${
                planSubTab === 'invoices'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isEn ? 'Subscription Invoices' : 'Riwayat Langganan'} ({billingSubscriptions.length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreatePlan}
            className="px-3 py-1.5 rounded-md bg-[#66000E] hover:bg-[#52000B] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isEn ? 'Add New Plan' : 'Tambah Paket Baru'}</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500">
              {isEn ? 'Active Plans' : 'Total Paket Aktif'}
            </span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {billingPlans.filter((p) => p.isActive).length} / {billingPlans.length} {isEn ? 'Plans' : 'Paket'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500">
              {isEn ? 'Paid Subscribed Stores' : 'Toko Berlangganan Berbayar'}
            </span>
            <p className="text-lg font-bold text-red-600 mt-0.5">
              {stores.filter((s) => s.plan && s.plan !== 'free').length} {isEn ? 'Stores' : 'Toko'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <StoreIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500">
              {isEn ? 'Total Subscription Revenue' : 'Total Pemasukan Paket'}
            </span>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {formatRupiah(billingSubscriptions.reduce((acc, sub) => acc + sub.amount, 0))}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Subtab 1: Plans CRUD Cards */}
      {planSubTab === 'plans' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {billingPlans.map((plan) => {
            const storeCount = stores.filter((s) => s.plan === plan.slug).length;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl p-4 border transition duration-150 flex flex-col justify-between relative shadow-2xs ${
                  plan.isActive ? 'border-gray-200 hover:border-gray-300' : 'border-dashed border-gray-300 bg-gray-50/50 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-gray-900">{plan.name}</h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                          {plan.slug}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 min-h-[32px]">
                        {plan.tagline || (isEn ? 'No description available' : 'Tidak ada deskripsi')}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        plan.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {plan.isActive ? (isEn ? 'Active' : 'Aktif') : (isEn ? 'Inactive' : 'Nonaktif')}
                    </span>
                  </div>

                  {/* Pricing Box */}
                  <div className="bg-gray-50 rounded-lg p-2.5 my-3 border border-gray-100 space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-gray-500">{isEn ? 'Monthly:' : 'Bulanan:'}</span>
                      <span className="font-extrabold text-gray-900">
                        {plan.priceMonthly === 0 ? (isEn ? 'Free' : 'Gratis') : `${formatRupiah(plan.priceMonthly)} ${isEn ? '/ mo' : '/ bln'}`}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-gray-500">{isEn ? 'Yearly:' : 'Tahunan:'}</span>
                      <span className="font-extrabold text-gray-900">
                        {plan.priceYearly === 0 ? (isEn ? 'Free' : 'Gratis') : `${formatRupiah(plan.priceYearly)} ${isEn ? '/ yr' : '/ thn'}`}
                      </span>
                    </div>
                  </div>

                  {/* Features preview */}
                  <div className="space-y-1.5 text-xs text-gray-700 pb-3">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1">
                      {isEn ? 'Key Features:' : 'Fitur Utama:'}
                    </span>
                    {plan.features.slice(0, 5).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] leading-snug">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                    {plan.features.length > 5 && (
                      <p className="text-[10px] text-gray-400 pl-4.5">
                        +{plan.features.length - 5} {isEn ? 'other features' : 'fitur lainnya'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Users Count & Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                    <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>{storeCount} {isEn ? 'Stores' : 'Toko'}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePlanActive(plan.id)}
                      title={plan.isActive ? (isEn ? 'Deactivate plan' : 'Nonaktifkan paket') : (isEn ? 'Activate plan' : 'Aktifkan paket')}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                    >
                      {plan.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditPlan(plan)}
                      title={isEn ? 'Edit plan' : 'Edit paket'}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                      title={isEn ? 'Delete plan' : 'Hapus paket'}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Subtab 2: Invoices Log Table */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Log Riwayat Langganan Toko
              </h3>
              <p className="text-[11px] text-gray-500">
                Catatan transaksi langganan merchant yang telah diproses platform
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {billingSubscriptions.length} Transaksi Tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Invoice</th>
                  <th className="py-2.5 px-3.5">Nama Toko</th>
                  <th className="py-2.5 px-3.5">Paket</th>
                  <th className="py-2.5 px-3.5">Siklus</th>
                  <th className="py-2.5 px-3.5">Nominal</th>
                  <th className="py-2.5 px-3.5">Metode</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {billingSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="font-semibold text-gray-700">{isEn ? 'No subscriptions yet' : 'Belum ada riwayat langganan'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {isEn ? 'Store subscription invoice records from database will be displayed here.' : 'Catatan invoice langganan toko dari database akan ditampilkan di sini.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  billingSubscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-gray-900">
                      {sub.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-gray-900">
                      {sub.storeName || sub.storeId}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-red-700">
                      {sub.planName}
                    </td>
                    <td className="py-2.5 px-3.5 text-gray-600 capitalize">
                      {sub.cycle === 'yearly' ? 'Tahunan' : 'Bulanan'}
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-gray-900">
                      {sub.amount === 0 ? 'Gratis' : formatRupiah(sub.amount)}
                    </td>
                    <td className="py-2.5 px-3.5 text-gray-600">
                      {sub.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-gray-500 text-[11px]">
                      {new Date(sub.paidAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Paket */}
      <AdminPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        editingPlan={editingPlan}
        planForm={planForm}
        setPlanForm={setPlanForm}
        handleSavePlan={handleSavePlan}
      />
    </div>
  );
};
