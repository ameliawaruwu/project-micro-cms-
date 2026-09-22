import React from 'react';
import { Crown, X } from 'lucide-react';
import { BillingPlan } from '../../../types';
import { PlanFormState } from '../types';

interface AdminPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPlan: BillingPlan | null;
  planForm: PlanFormState;
  setPlanForm: React.Dispatch<React.SetStateAction<PlanFormState>>;
  handleSavePlan: (e: React.FormEvent) => void;
}

export const AdminPlanModal: React.FC<AdminPlanModalProps> = ({
  isOpen,
  onClose,
  editingPlan,
  planForm,
  setPlanForm,
  handleSavePlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl p-5 border border-gray-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-base text-gray-900">
              {editingPlan ? 'Edit Paket Langganan' : 'Tambah Paket Langganan Baru'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nama Paket *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Pro UMKM"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Slug / Kode Paket *</label>
              <input
                type="text"
                required
                placeholder="Contoh: premium / pro"
                value={planForm.slug}
                onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Tagline / Deskripsi</label>
            <input
              type="text"
              placeholder="Deskripsi singkat target pengguna paket"
              value={planForm.tagline}
              onChange={(e) => setPlanForm({ ...planForm, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Harga Bulanan (Rp) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={planForm.priceMonthly}
                onChange={(e) => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Harga Tahunan (Rp) *</label>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={planForm.priceYearly}
                onChange={(e) => setPlanForm({ ...planForm, priceYearly: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Urutan Tampil</label>
              <input
                type="number"
                min="1"
                value={planForm.sortOrder}
                onChange={(e) => setPlanForm({ ...planForm, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isActivePlan"
                checked={planForm.isActive}
                onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
              <label htmlFor="isActivePlan" className="font-semibold text-gray-800 cursor-pointer">
                Paket Aktif & Tampil
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Daftar Fitur (1 baris = 1 fitur)
            </label>
            <textarea
              rows={4}
              placeholder="Katalog produk hingga 100 item&#10;Metode pembayaran Midtrans&#10;Bebas watermark"
              value={planForm.featuresText}
              onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs font-sans leading-relaxed"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-xs cursor-pointer"
            >
              {editingPlan ? 'Simpan Perubahan' : 'Tambah Paket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
