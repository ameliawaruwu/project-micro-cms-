import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Pencil, Plus, RefreshCw, TicketPercent, Trash2, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { formatRupiah } from '../../utils/formatters';
import {
  voucherService,
  describeVoucher,
  normalizeVoucherCode,
  VOUCHER_CODE_RE,
  type StoreVoucher,
  type VoucherInput,
} from '../../services/voucherService';

interface VoucherPageProps {
  storeId?: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateDashboard?: () => void;
}

interface FormState {
  code: string;
  title: string;
  discountType: 'percent' | 'fixed';
  discountValue: string;
  maxDiscount: string;
  minPurchase: string;
  quota: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isPublic: boolean;
}

const EMPTY_FORM: FormState = {
  code: '',
  title: '',
  discountType: 'percent',
  discountValue: '',
  maxDiscount: '',
  minPurchase: '',
  quota: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
  isPublic: true,
};

/** ISO → nilai input datetime-local (waktu lokal). */
const toLocalInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : undefined);
const digits = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 10);

/** Kelola voucher promo toko yang bisa ditukar pembeli di checkout. */
export const VoucherPage: React.FC<VoucherPageProps> = ({ storeId, onShowToast, onNavigateDashboard }) => {
  const { t, isEn } = useLanguage();
  const [vouchers, setVouchers] = useState<StoreVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!storeId) {
      setVouchers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      setVouchers(await voucherService.listForStore(storeId));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (v: StoreVoucher) => {
    setEditingId(v.id);
    setForm({
      code: v.code,
      title: v.title || '',
      discountType: v.discountType,
      discountValue: String(v.discountValue),
      maxDiscount: v.maxDiscount ? String(v.maxDiscount) : '',
      minPurchase: v.minPurchase ? String(v.minPurchase) : '',
      quota: v.quota ? String(v.quota) : '',
      startsAt: toLocalInput(v.startsAt),
      endsAt: toLocalInput(v.endsAt),
      isActive: v.isActive,
      isPublic: v.isPublic,
    });
    setFormError('');
    setShowForm(true);
  };

  const validate = (): VoucherInput | null => {
    const code = normalizeVoucherCode(form.code);
    if (!VOUCHER_CODE_RE.test(code)) {
      setFormError(
        isEn
          ? 'Code must be 3–32 characters: letters, numbers, - or _.'
          : 'Kode harus 3–32 karakter: huruf, angka, - atau _.'
      );
      return null;
    }
    const value = Number(form.discountValue);
    if (!value || value <= 0 || (form.discountType === 'percent' && value > 100) || value > 100000000) {
      setFormError(
        form.discountType === 'percent'
          ? isEn ? 'Discount percentage must be 1–100.' : 'Persentase diskon harus 1–100.'
          : isEn ? 'Enter a valid discount amount.' : 'Isi nominal potongan yang valid.'
      );
      return null;
    }
    const startsAt = fromLocalInput(form.startsAt);
    const endsAt = fromLocalInput(form.endsAt);
    if (startsAt && endsAt && endsAt <= startsAt) {
      setFormError(isEn ? 'The end date must be after the start date.' : 'Tanggal berakhir harus setelah tanggal mulai.');
      return null;
    }
    return {
      code,
      title: form.title.trim().slice(0, 120) || undefined,
      discountType: form.discountType,
      discountValue: value,
      maxDiscount: form.discountType === 'percent' && Number(form.maxDiscount) > 0 ? Number(form.maxDiscount) : undefined,
      minPurchase: Number(form.minPurchase) || 0,
      quota: Number(form.quota) > 0 ? Number(form.quota) : undefined,
      startsAt,
      endsAt,
      isActive: form.isActive,
      isPublic: form.isPublic,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    const input = validate();
    if (!input) return;
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        const updated = await voucherService.update(editingId, input);
        setVouchers((list) => list.map((v) => (v.id === editingId ? updated : v)));
        onShowToast(isEn ? 'Voucher updated.' : 'Voucher diperbarui.');
      } else {
        const created = await voucherService.create(storeId, input);
        setVouchers((list) => [created, ...list]);
        onShowToast(isEn ? 'Voucher created.' : 'Voucher dibuat.');
      }
      setShowForm(false);
    } catch (err: any) {
      const duplicate = err?.code === '23505';
      setFormError(
        duplicate
          ? isEn ? 'This code is already used by another voucher in your store.' : 'Kode ini sudah dipakai voucher lain di toko Anda.'
          : isEn ? 'Failed to save the voucher. Please try again.' : 'Gagal menyimpan voucher. Silakan coba lagi.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (v: StoreVoucher) => {
    setBusyId(v.id);
    try {
      await voucherService.setActive(v.id, !v.isActive);
      setVouchers((list) => list.map((x) => (x.id === v.id ? { ...x, isActive: !v.isActive } : x)));
    } catch {
      onShowToast(isEn ? 'Failed to update the voucher status.' : 'Gagal mengubah status voucher.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (v: StoreVoucher) => {
    if (confirmDeleteId !== v.id) {
      setConfirmDeleteId(v.id);
      return;
    }
    setBusyId(v.id);
    try {
      await voucherService.remove(v.id);
      setVouchers((list) => list.filter((x) => x.id !== v.id));
      onShowToast(isEn ? 'Voucher deleted.' : 'Voucher dihapus.');
    } catch {
      onShowToast(isEn ? 'Failed to delete the voucher.' : 'Gagal menghapus voucher.', 'error');
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      onShowToast(isEn ? `Code ${code} copied.` : `Kode ${code} disalin.`, 'info');
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const statusOf = (v: StoreVoucher): { label: string; cls: string } => {
    const now = new Date().toISOString();
    if (!v.isActive) return { label: isEn ? 'Inactive' : 'Nonaktif', cls: 'bg-gray-100 text-gray-600' };
    if (v.endsAt && v.endsAt <= now) return { label: isEn ? 'Expired' : 'Berakhir', cls: 'bg-gray-100 text-gray-600' };
    if (v.quota && v.usedCount >= v.quota) return { label: isEn ? 'Fully used' : 'Kuota habis', cls: 'bg-amber-50 text-amber-700' };
    if (v.startsAt && v.startsAt > now) return { label: isEn ? 'Scheduled' : 'Terjadwal', cls: 'bg-blue-50 text-blue-700' };
    return { label: isEn ? 'Active' : 'Aktif', cls: 'bg-emerald-50 text-emerald-700' };
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const pageTitle = t('nav_vouchers', 'Voucher Promo');
  const inputCls =
    'w-full px-3 py-2 text-sm rounded-xl border border-[#E5E0DD] bg-white focus:outline-none focus:border-[#66000E]';
  const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-poppins pb-24 lg:pb-8 text-left w-full">
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: pageTitle, isActive: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <TicketPercent className="w-5 h-5 text-[#66000E]" />
            <span>{pageTitle}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEn
              ? 'Create voucher codes buyers can redeem at checkout. Public vouchers are shown on your store’s Promo section.'
              : 'Buat kode voucher yang bisa ditukar pembeli saat checkout. Voucher publik tampil di bagian Promo toko Anda.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-[#E5E0DD] text-gray-600 hover:text-[#66000E] transition cursor-pointer disabled:opacity-50"
            title={isEn ? 'Refresh' : 'Muat ulang'}
            aria-label={isEn ? 'Refresh' : 'Muat ulang'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#66000E] hover:bg-[#4D000A] text-white text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isEn ? 'Add Voucher' : 'Tambah Voucher'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-[#E5E0DD] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1F1F1F]">
              {editingId ? (isEn ? 'Edit Voucher' : 'Ubah Voucher') : isEn ? 'New Voucher' : 'Voucher Baru'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              aria-label={isEn ? 'Close' : 'Tutup'}
              title={isEn ? 'Close' : 'Tutup'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{isEn ? 'Voucher code *' : 'Kode voucher *'}</label>
              <input
                className={`${inputCls} font-mono uppercase`}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: normalizeVoucherCode(e.target.value).slice(0, 32) })}
                placeholder={isEn ? 'e.g. HEMAT10' : 'mis. HEMAT10'}
                required
              />
            </div>
            <div>
              <label className={labelCls}>{isEn ? 'Title (optional)' : 'Judul (opsional)'}</label>
              <input
                className={inputCls}
                value={form.title}
                maxLength={120}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={isEn ? 'e.g. Payday sale' : 'mis. Promo gajian'}
              />
            </div>
            <div>
              <label className={labelCls}>{isEn ? 'Discount type' : 'Jenis potongan'}</label>
              <select
                className={inputCls}
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as FormState['discountType'] })}
              >
                <option value="percent">{isEn ? 'Percentage (%)' : 'Persentase (%)'}</option>
                <option value="fixed">{isEn ? 'Fixed amount (Rp)' : 'Nominal tetap (Rp)'}</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                {form.discountType === 'percent' ? (isEn ? 'Discount (%) *' : 'Diskon (%) *') : isEn ? 'Discount (Rp) *' : 'Potongan (Rp) *'}
              </label>
              <input
                className={inputCls}
                inputMode="numeric"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: digits(e.target.value) })}
                placeholder={form.discountType === 'percent' ? '10' : '15000'}
                required
              />
            </div>
            {form.discountType === 'percent' && (
              <div>
                <label className={labelCls}>{isEn ? 'Max discount (Rp, optional)' : 'Maks. potongan (Rp, opsional)'}</label>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: digits(e.target.value) })}
                  placeholder="20000"
                />
              </div>
            )}
            <div>
              <label className={labelCls}>{isEn ? 'Minimum spend (Rp)' : 'Minimal belanja (Rp)'}</label>
              <input
                className={inputCls}
                inputMode="numeric"
                value={form.minPurchase}
                onChange={(e) => setForm({ ...form, minPurchase: digits(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelCls}>{isEn ? 'Usage quota (optional)' : 'Kuota pemakaian (opsional)'}</label>
              <input
                className={inputCls}
                inputMode="numeric"
                value={form.quota}
                onChange={(e) => setForm({ ...form, quota: digits(e.target.value).slice(0, 7) })}
                placeholder={isEn ? 'Unlimited' : 'Tanpa batas'}
              />
            </div>
            <div>
              <label className={labelCls}>{isEn ? 'Starts (optional)' : 'Mulai berlaku (opsional)'}</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>{isEn ? 'Ends (optional)' : 'Berakhir (opsional)'}</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 text-xs text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              {isEn ? 'Active (can be redeemed)' : 'Aktif (bisa ditukar)'}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} />
              {isEn ? 'Show on the store’s Promo section' : 'Tampilkan di bagian Promo toko'}
            </label>
          </div>

          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-[#E5E0DD] text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#66000E] hover:bg-[#4D000A] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {saving ? (isEn ? 'Saving…' : 'Menyimpan…') : isEn ? 'Save Voucher' : 'Simpan Voucher'}
            </button>
          </div>
        </form>
      )}

      {loading && vouchers.length === 0 ? (
        <div className="bg-white border border-[#E5E0DD] rounded-2xl p-8 text-center text-sm text-gray-500">
          {isEn ? 'Loading vouchers…' : 'Memuat voucher…'}
        </div>
      ) : loadError ? (
        <div className="bg-white border border-[#E5E0DD] rounded-2xl p-8 text-center text-sm text-red-600">
          {isEn ? 'Failed to load vouchers. Please try again.' : 'Gagal memuat voucher. Silakan coba lagi.'}
        </div>
      ) : vouchers.length === 0 ? (
        <div className="bg-white border border-[#E5E0DD] rounded-2xl p-10 text-center space-y-2">
          <TicketPercent className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-medium text-gray-700">{isEn ? 'No vouchers yet.' : 'Belum ada voucher.'}</p>
          <p className="text-xs text-gray-500">
            {isEn
              ? 'Create your first voucher so buyers get a discount at checkout.'
              : 'Buat voucher pertama agar pembeli mendapat potongan saat checkout.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {vouchers.map((v) => {
            const status = statusOf(v);
            return (
              <li key={v.id} className="bg-white border border-[#E5E0DD] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#66000E] text-sm">{v.code}</span>
                      <button
                        type="button"
                        onClick={() => void copyCode(v.code)}
                        className="p-1 rounded-md text-gray-400 hover:text-[#66000E] cursor-pointer"
                        aria-label={isEn ? 'Copy code' : 'Salin kode'}
                        title={isEn ? 'Copy code' : 'Salin kode'}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>{status.label}</span>
                      {!v.isPublic && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {isEn ? 'Hidden' : 'Tersembunyi'}
                        </span>
                      )}
                    </div>
                    {v.title && <p className="text-xs text-gray-700 mt-0.5 truncate">{v.title}</p>}
                    <p className="text-xs text-gray-500 mt-1">{describeVoucher(v, isEn, formatRupiah)}</p>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                  <span>
                    {isEn ? 'Used' : 'Terpakai'}: {v.usedCount}
                    {v.quota ? ` / ${v.quota}` : ''}
                  </span>
                  {(v.startsAt || v.endsAt) && (
                    <span>
                      {formatDate(v.startsAt) || (isEn ? 'Now' : 'Sekarang')} – {formatDate(v.endsAt) || (isEn ? 'No end date' : 'Tanpa batas')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0EBEA]">
                  <button
                    type="button"
                    disabled={busyId === v.id}
                    onClick={() => void toggleActive(v)}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E0DD] text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                  >
                    {v.isActive ? (isEn ? 'Deactivate' : 'Nonaktifkan') : isEn ? 'Activate' : 'Aktifkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(v)}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E0DD] text-xs font-semibold text-gray-700 hover:text-[#66000E] cursor-pointer flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {isEn ? 'Edit' : 'Ubah'}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === v.id}
                    onClick={() => void handleDelete(v)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 disabled:opacity-50 ${
                      confirmDeleteId === v.id ? 'bg-red-600 text-white' : 'border border-[#E5E0DD] text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {confirmDeleteId === v.id ? (isEn ? 'Confirm delete' : 'Yakin hapus') : isEn ? 'Delete' : 'Hapus'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
