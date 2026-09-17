import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Star,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  X,
  Search,
  AlertCircle,
  Warehouse,
  ArrowUpDown,
} from 'lucide-react';
import { ShippingBranch } from '../../types';
import { branchService } from '../../services/branchService';
import { useLanguage } from '../../contexts/LanguageContext';

interface BranchManagementProps {
  storeId?: string;
  onShowNotification: (msg: string) => void;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({
  storeId = 'store-andhika',
  onShowNotification,
}) => {
  const { t } = useLanguage();
  const [branches, setBranches] = useState<ShippingBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<ShippingBranch | null>(null);

  // Form State
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

  const loadBranches = async () => {
    setIsLoading(true);
    try {
      const data = await branchService.getBranches(storeId);
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [storeId]);

  const resetForm = () => {
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
    setFormError('');
    setEditingBranch(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: ShippingBranch) => {
    setEditingBranch(branch);
    setBranchName(branch.branchName);
    setPicName(branch.picName);
    setPicPhone(branch.picPhone);
    setAddress(branch.address);
    setSubdistrict(branch.subdistrict || '');
    setCity(branch.city);
    setProvince(branch.province);
    setPostalCode(branch.postalCode);
    setIsDefault(branch.isDefault);
    setIsActive(branch.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

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
        onShowNotification(t('branch_updated_success', `Cabang "${branchName}" berhasil diperbarui.`));
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
        onShowNotification(t('branch_created_success', `Cabang baru "${branchName}" berhasil ditambahkan.`));
      }

      setIsModalOpen(false);
      resetForm();
      await loadBranches();
    } catch (err: any) {
      setFormError(err.message || t('branch_status_error', 'Gagal menyimpan data cabang'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (branch: ShippingBranch) => {
    try {
      await branchService.setDefaultBranch(branch.id, storeId);
      onShowNotification(
        t('branch_default_updated', '"{name}" sekarang menjadi cabang utama.').replace('{name}', branch.branchName)
      );
      await loadBranches();
    } catch (err: any) {
      onShowNotification(err.message || t('branch_default_error', 'Gagal mengubah cabang utama'));
    }
  };

  const handleToggleActive = async (branch: ShippingBranch) => {
    try {
      await branchService.toggleActiveBranch(branch.id);
      onShowNotification(t('branch_status_updated', 'Status cabang berhasil diperbarui.'));
      await loadBranches();
    } catch (err: any) {
      onShowNotification(err.message || t('branch_status_error', 'Gagal mengubah status cabang'));
    }
  };

  const handleDelete = async (branch: ShippingBranch) => {
    if (branch.isDefault) {
      alert('Cabang utama tidak dapat dihapus. Silakan jadikan cabang lain sebagai cabang utama terlebih dahulu.');
      return;
    }

    const confirmMsg = t('branch_delete_confirm', 'Apakah Anda yakin ingin menghapus cabang "{name}"?').replace('{name}', branch.branchName);
    if (confirm(confirmMsg)) {
      try {
        await branchService.deleteBranch(branch.id);
        onShowNotification(
          t('branch_deleted_success', 'Cabang "{name}" berhasil dihapus.').replace('{name}', branch.branchName)
        );
        await loadBranches();
      } catch (err: any) {
        alert(err.message || t('branch_delete_error', 'Gagal menghapus cabang'));
      }
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.postalCode.includes(searchQuery)
  );

  return (
    <div className="space-y-4 font-poppins text-left">
      {/* Compact Top Toolbar: Search + Count + Add Branch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('branch_search_placeholder', 'Cari nama gudang, kota, nama PIC, atau kode pos...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 sm:py-2.5 bg-white rounded-xl border border-[#EAEAEA] text-xs text-[#1F1F1F] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602] shadow-2xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#555555] p-1 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
          <div className="px-3 py-2 bg-white rounded-xl border border-[#EAEAEA] text-xs font-semibold text-[#555555] shadow-2xs whitespace-nowrap">
            {filteredBranches.length} {t('branch_count_label', 'Cabang')}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-gradient-to-r from-[#9A0602] to-[#B91C1C] hover:brightness-110 text-white font-semibold text-xs transition shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{t('branch_add_button', 'Tambah Cabang')}</span>
          </button>
        </div>
      </div>

      {/* Branch List */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#EAEAEA] text-xs text-[#777777]">
          {t('branch_loading', 'Memuat data cabang gudang...')}
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#CCCCCC] text-xs text-[#777777] space-y-2">
          <Warehouse className="w-8 h-8 text-[#CCCCCC] mx-auto" />
          <p className="font-semibold text-[#1F1F1F]">
            {t('branch_empty_title', 'Tidak ada cabang yang cocok dengan pencarian')}
          </p>
          <p>{t('branch_empty_desc', 'Tambahkan cabang baru untuk mengaktifkan titik penjemputan logistik.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all bg-white relative flex flex-col justify-between gap-2.5 ${
                branch.isDefault
                  ? 'border-[#9A0602]/50 shadow-xs ring-1 ring-[#9A0602]/15 bg-gradient-to-b from-[#FFFDFD] to-white'
                  : 'border-[#EAEAEA] hover:border-[#D5CEC9] shadow-2xs'
              }`}
            >
              {/* Header Card: Name, PIC & Status */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        branch.isDefault
                          ? 'bg-[#FFF1F0] text-[#9A0602]'
                          : 'bg-[#F5F5F5] text-[#555555]'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-[#1F1F1F] leading-tight truncate">
                          {branch.branchName}
                        </h4>
                        {branch.isDefault && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FFF1F0] text-[#9A0602] border border-[#FECDCA] text-[10px] font-bold shrink-0">
                            <Star className="w-2.5 h-2.5 fill-[#9A0602]" />
                            {t('branch_default_badge', 'Cabang Utama')}
                          </span>
                        )}
                      </div>

                      {/* PIC & Phone */}
                      <div className="flex items-center gap-2 text-[11px] text-[#666666] mt-1 flex-wrap">
                        <span className="truncate">
                          <strong className="font-medium text-[#333333]">{t('branch_pic_label', 'PIC')}:</strong> {branch.picName}
                        </span>
                        <span className="text-[#D0D0D0] shrink-0">•</span>
                        <a
                          href={`tel:${branch.picPhone}`}
                          className="inline-flex items-center gap-1 text-[#555555] hover:text-[#9A0602] transition shrink-0"
                        >
                          <Phone className="w-2.5 h-2.5 text-[#888888]" />
                          <span>{branch.picPhone}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 border ${
                      branch.isActive
                        ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                        : 'bg-[#F2F4F7] text-[#475467] border-[#EAECF0]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        branch.isActive ? 'bg-[#12B76A]' : 'bg-[#98A2B3]'
                      }`}
                    ></span>
                    <span>{branch.isActive ? t('branch_active', 'Aktif') : t('branch_inactive', 'Nonaktif')}</span>
                  </span>
                </div>

                {/* Compact Address Box */}
                <div className="mt-2.5 bg-[#FAF9F9] rounded-xl p-2.5 border border-[#F0EDED] text-xs text-[#555555] flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#9A0602] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 text-[11px] leading-relaxed">
                    <p className="line-clamp-1 text-[#241A1A] font-medium">{branch.address}</p>
                    <p className="text-[#777777] text-[10.5px] truncate mt-0.5">
                      {branch.subdistrict ? `${branch.subdistrict}, ` : ''}
                      {branch.city}, {branch.province}
                      <span className="ml-1.5 font-mono text-[10px] text-[#444444] bg-white px-1.5 py-0.5 rounded border border-[#E5E0DD] font-medium">
                        {branch.postalCode}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-[#F2F0EF] flex items-center justify-between gap-2">
                <div>
                  {branch.isDefault ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A0602]">
                      <Star className="w-3 h-3 fill-[#9A0602]" />
                      <span>{t('branch_main_origin', 'Gudang Utama')}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(branch)}
                      className="text-[11px] font-semibold text-[#666666] hover:text-[#9A0602] hover:bg-[#FFF1F0] px-2 py-1 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3 h-3" />
                      <span>{t('branch_set_default', 'Jadikan Utama')}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(branch)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                      branch.isActive
                        ? 'border-[#EAEAEA] text-[#555555] hover:bg-[#F7F7F7]'
                        : 'border-[#ABEFC6] text-[#027A48] bg-[#ECFDF3] hover:bg-[#D1FADF]'
                    }`}
                  >
                    {branch.isActive ? t('branch_deactivate', 'Nonaktifkan') : t('branch_activate', 'Aktifkan')}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(branch)}
                    className="p-1.5 rounded-lg border border-[#EAEAEA] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
                    title={t('branch_edit', 'Ubah Cabang')}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {!branch.isDefault && (
                    <button
                      onClick={() => handleDelete(branch)}
                      className="p-1.5 rounded-lg border border-[#FECDCA] text-[#D92D20] hover:bg-[#FEF3F2] transition cursor-pointer"
                      title={t('branch_delete', 'Hapus Cabang')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* MODAL FORM TAMBAH / EDIT CABANG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs font-poppins">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-[#EAEAEA] shrink-0">
              <div className="flex items-center gap-2 text-[#1F1F1F] font-bold text-base">
                <Building2 className="w-5 h-5 text-[#9A0602]" />
                <span>
                  {editingBranch
                    ? t('branch_modal_edit_title', 'Edit Cabang / Gudang')
                    : t('branch_modal_add_title', 'Tambah Cabang / Gudang Asal')}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs font-medium text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
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
                  className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs font-mono font-bold text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
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
                    className="w-4 h-4 rounded text-[#9A0602] focus:ring-[#9A0602] border-[#CCCCCC]"
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
                    className="w-4 h-4 rounded text-[#9A0602] focus:ring-[#9A0602] border-[#CCCCCC]"
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
              <div className="pt-3 border-t border-[#EAEAEA] grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#EAEAEA] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] font-semibold text-xs transition cursor-pointer text-center"
                >
                  {t('branch_form_cancel', 'Batal')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 min-h-[40px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50 text-center"
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
      )}
    </div>
  );
};
