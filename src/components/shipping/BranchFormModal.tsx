import React, { useState, useEffect } from 'react';
import { Building2, X, AlertCircle } from 'lucide-react';
import { ShippingBranch } from '../../types';
import { branchService } from '../../services/branchService';
import { useLanguage } from '../../contexts/LanguageContext';

interface BranchFormModalProps {
  isOpen: boolean;
  storeId: string;
  editingBranch: ShippingBranch | null;
  onClose: () => void;
  onSuccess: (branchName: string, isEdit: boolean) => void;
}

export const BranchFormModal: React.FC<BranchFormModalProps> = ({
  isOpen,
  storeId,
  editingBranch,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();

  const [branchName, setBranchName] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [address, setAddress] = useState('');
  const [subdistrict, setSubdistrict] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingBranch) {
      setBranchName(editingBranch.branchName);
      setPicName(editingBranch.picName);
      setPicPhone(editingBranch.picPhone);
      setAddress(editingBranch.address);
      setSubdistrict(editingBranch.subdistrict || '');
      setCity(editingBranch.city);
      setProvince(editingBranch.province);
      setPostalCode(editingBranch.postalCode);
      setIsDefault(editingBranch.isDefault);
      setIsActive(editingBranch.isActive);
    } else {
      setBranchName('');
      setPicName('');
      setPicPhone('');
      setAddress('');
      setSubdistrict('');
      setCity('');
      setProvince('');
      setPostalCode('');
      setIsDefault(false);
      setIsActive(true);
    }
    setFormError('');
  }, [editingBranch, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!branchName.trim() || !picName.trim() || !picPhone.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      setFormError('Mohon lengkapi semua kolom wajib (*).');
      return;
    }

    // Validate postal code format
    if (!/^\d{5}$/.test(postalCode.trim())) {
      setFormError(t('branch_postal_required', 'Kode pos harus berupa 5 digit angka.'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch.id, {
          branchName: branchName.trim(),
          picName: picName.trim(),
          picPhone: picPhone.trim(),
          address: address.trim(),
          subdistrict: subdistrict.trim(),
          city: city.trim(),
          province: province.trim() || 'DKI Jakarta',
          postalCode: postalCode.trim(),
          isDefault,
          isActive,
        });
        onSuccess(branchName.trim(), true);
      } else {
        await branchService.createBranch({
          storeId,
          branchName: branchName.trim(),
          picName: picName.trim(),
          picPhone: picPhone.trim(),
          address: address.trim(),
          subdistrict: subdistrict.trim(),
          city: city.trim(),
          province: province.trim() || 'DKI Jakarta',
          postalCode: postalCode.trim(),
          isDefault,
          isActive,
        });
        onSuccess(branchName.trim(), false);
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || t('branch_status_error', 'Gagal menyimpan data cabang'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs font-poppins">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-xl border border-[#E5E0DD] animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-[#E5E0DD] shrink-0">
          <div className="flex items-center gap-2 text-[#1F1F1F] font-bold text-base">
            <Building2 className="w-5 h-5 text-[#66000E]" />
            <span>
              {editingBranch
                ? t('branch_modal_edit_title', 'Edit Cabang / Gudang')
                : t('branch_modal_add_title', 'Tambah Cabang / Gudang Asal')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 text-xs text-left">
          {formError && (
            <div className="p-3 bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Nama Cabang */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555555] mb-1">
              {t('branch_form_name', 'Nama Cabang / Gudang')} *
            </label>
            <input
              type="text"
              required
              placeholder={t('branch_form_name_placeholder', 'Contoh: Gudang Pusat Jakarta, Cabang Bandung')}
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs font-medium text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
            />
          </div>

          {/* PIC Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555555] mb-1">
                {t('branch_form_pic', 'Nama Penanggung Jawab (PIC)')} *
              </label>
              <input
                type="text"
                required
                placeholder={t('branch_form_pic_placeholder', 'Nama PIC penyerahan paket')}
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555555] mb-1">
                {t('branch_form_phone', 'No. Handphone PIC')} *
              </label>
              <input
                type="tel"
                required
                placeholder={t('branch_form_phone_placeholder', '0812xxxxxxxx (untuk kurir)')}
                value={picPhone}
                onChange={(e) => setPicPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
              />
            </div>
          </div>

          {/* Alamat Lengkap */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555555] mb-1">
              {t('branch_form_address', 'Alamat Lengkap Gudang')} *
            </label>
            <textarea
              rows={2}
              required
              placeholder={t('branch_form_address_placeholder', 'Nama jalan, nomor gudang/ruko, RT/RW, patokan lokasi...')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
            />
          </div>

          {/* Wilayah: Subdistrict & Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555555] mb-1">
                {t('branch_form_subdistrict', 'Kecamatan')}
              </label>
              <input
                type="text"
                placeholder="Mampang Prapatan"
                value={subdistrict}
                onChange={(e) => setSubdistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555555] mb-1">
                {t('branch_form_city', 'Kota / Kab')} *
              </label>
              <input
                type="text"
                required
                placeholder="Jakarta Selatan"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
              />
            </div>
          </div>

          {/* Provinsi & Kode Pos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555555] mb-1">
                {t('branch_form_province', 'Provinsi')}
              </label>
              <input
                type="text"
                placeholder="DKI Jakarta"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#555555] mb-1">
                {t('branch_form_postal_code', 'Kode Pos')} *
              </label>
              <input
                type="text"
                maxLength={5}
                required
                placeholder="12730"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs font-mono font-bold text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
              />
            </div>
          </div>

          {/* Toggles: Jadikan Cabang Utama & Status Aktif */}
          <div className="pt-2 border-t border-[#F0F0F0] space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-[#66000E] focus:ring-[#66000E] border-[#CCCCCC]"
              />
              <div>
                <span className="font-semibold text-xs text-[#1F1F1F]">
                  {t('branch_form_default_checkbox', 'Jadikan Cabang Utama')}
                </span>
                <p className="text-[11px] text-[#777777]">
                  {t('branch_form_default_hint', 'Cabang utama otomatis terpilih sebagai origin saat checkout dan perhitungan ongkir pembeli.')}
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#66000E] focus:ring-[#66000E] border-[#CCCCCC]"
              />
              <div>
                <span className="font-semibold text-xs text-[#1F1F1F]">
                  {t('branch_form_active_checkbox', 'Status Aktif')}
                </span>
                <p className="text-[11px] text-[#777777]">
                  {t('branch_form_active_hint', 'Cabang aktif dapat digunakan untuk proses booking pengiriman dan penjemputan paket.')}
                </p>
              </div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#E5E0DD] grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#E5E0DD] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] font-semibold text-xs transition cursor-pointer text-center"
            >
              {t('branch_form_cancel', 'Batal')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 min-h-[40px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50 text-center"
            >
              {isSubmitting
                ? t('branch_form_saving', 'Menyimpan...')
                : editingBranch
                ? t('branch_form_submit_edit', 'Perbarui Cabang')
                : t('branch_form_submit_add', 'Simpan Cabang')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
