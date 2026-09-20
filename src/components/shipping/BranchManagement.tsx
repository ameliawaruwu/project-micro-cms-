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
import { BranchFormModal } from './BranchFormModal';

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

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: ShippingBranch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleFormSuccess = (name: string, isEdit: boolean) => {
    if (isEdit) {
      onShowNotification(t('branch_updated_success', `Cabang "${name}" berhasil diperbarui.`));
    } else {
      onShowNotification(t('branch_created_success', `Cabang baru "${name}" berhasil ditambahkan.`));
    }
    loadBranches();
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
            className="w-full pl-9 pr-8 py-2 sm:py-2.5 bg-white rounded-xl border border-[#E5E0DD] text-xs text-[#1F1F1F] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] shadow-2xs transition"
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
          <div className="px-3 py-2 bg-white rounded-xl border border-[#E5E0DD] text-xs font-semibold text-[#555555] shadow-2xs whitespace-nowrap">
            {filteredBranches.length} {t('branch_count_label', 'Cabang')}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl bg-gradient-to-r from-[#66000E] to-[#801010] hover:brightness-110 text-white font-semibold text-xs transition shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{t('branch_add_button', 'Tambah Cabang')}</span>
          </button>
        </div>
      </div>

      {/* Branch List */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E0DD] text-xs text-[#777777]">
          {t('branch_loading', 'Memuat data cabang gudang...')}
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="p-8 sm:p-10 text-center bg-white rounded-2xl border border-dashed border-[#CCCCCC] text-xs text-[#777777] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
            <Warehouse className="w-6 h-6" />
          </div>
          <p className="font-bold text-sm text-[#1F1F1F]">
            {searchQuery ? t('branch_empty_title', 'Tidak ada cabang yang cocok dengan pencarian') : 'Belum Ada Cabang atau Gudang Pengiriman'}
          </p>
          <p className="max-w-md mx-auto text-[#666666]">
            {searchQuery
              ? t('branch_empty_search_desc', 'Coba kata kunci pencarian lain atau bersihkan kotak pencarian.')
              : 'Tambahkan lokasi gudang atau toko fisik Anda sebagai titik penjemputan paket oleh kurir ekspedisi.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAddModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#66000E] to-[#801010] hover:brightness-110 text-white font-semibold text-xs shadow-xs transition cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Cabang / Gudang Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all bg-white relative flex flex-col justify-between gap-2.5 ${
                branch.isDefault
                  ? 'border-[#66000E]/50 shadow-xs ring-1 ring-[#66000E]/15 bg-gradient-to-b from-[#FFFDFD] to-white'
                  : 'border-[#E5E0DD] hover:border-[#D5CEC9] shadow-2xs'
              }`}
            >
              {/* Header Card: Name, PIC & Status */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        branch.isDefault
                          ? 'bg-[#F5E8EA] text-[#66000E]'
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
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-[10px] font-bold shrink-0">
                            <Star className="w-2.5 h-2.5 fill-[#66000E]" />
                            {t('branch_default_badge', 'Cabang Utama')}
                          </span>
                        )}
                      </div>

                      {/* PIC & Phone */}
                      <div className="flex items-center gap-2 text-[11px] text-[#66000E] mt-1 flex-wrap">
                        <span className="truncate">
                          <strong className="font-medium text-[#333333]">{t('branch_pic_label', 'PIC')}:</strong> {branch.picName}
                        </span>
                        <span className="text-[#D0D0D0] shrink-0">•</span>
                        <a
                          href={`tel:${branch.picPhone}`}
                          className="inline-flex items-center gap-1 text-[#555555] hover:text-[#66000E] transition shrink-0"
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
                  <MapPin className="w-3.5 h-3.5 text-[#66000E] shrink-0 mt-0.5" />
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#66000E]">
                      <Star className="w-3 h-3 fill-[#66000E]" />
                      <span>{t('branch_main_origin', 'Gudang Utama')}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(branch)}
                      className="text-[11px] font-semibold text-[#66000E] hover:text-[#52000B] hover:bg-[#F5E8EA] px-2 py-1 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
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
                        ? 'border-[#E5E0DD] text-[#555555] hover:bg-[#F7F7F7]'
                        : 'border-[#ABEFC6] text-[#027A48] bg-[#ECFDF3] hover:bg-[#D1FADF]'
                    }`}
                  >
                    {branch.isActive ? t('branch_deactivate', 'Nonaktifkan') : t('branch_activate', 'Aktifkan')}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(branch)}
                    className="p-1.5 rounded-lg border border-[#E5E0DD] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
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
      <BranchFormModal
        isOpen={isModalOpen}
        storeId={storeId}
        editingBranch={editingBranch}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};
