import React, { useState, useEffect } from 'react';
import { Building2, X, AlertCircle } from 'lucide-react';
import { ShippingBranch } from '../../types';
import { branchService } from '../../services/branchService';
import { wilayahService, type WilayahItem, type PostalCodeItem } from '../../services/wilayahService';
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
  const { t, isEn } = useLanguage();

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

  // Pilihan wilayah berjenjang (Provinsi -> Kota/Kab -> Kecamatan -> Kode Pos).
  const [provinces, setProvinces] = useState<WilayahItem[]>([]);
  const [regencies, setRegencies] = useState<WilayahItem[]>([]);
  const [districts, setDistricts] = useState<WilayahItem[]>([]);
  const [postalCodes, setPostalCodes] = useState<PostalCodeItem[]>([]);
  const [provinceId, setProvinceId] = useState('');
  const [regencyId, setRegencyId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [loadingRegion, setLoadingRegion] = useState<'' | 'province' | 'regency' | 'district' | 'postal'>('');

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

  // Muat provinsi saat modal dibuka; untuk edit, cocokkan nama tersimpan ke pilihan wilayah.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setProvinceId('');
    setRegencyId('');
    setDistrictId('');
    setRegencies([]);
    setDistricts([]);
    setPostalCodes([]);

    (async () => {
      setLoadingRegion('province');
      const provs = await wilayahService.getProvinces();
      if (cancelled) return;
      setProvinces(provs);
      setLoadingRegion('');
      if (!editingBranch) return;

      const prov = findByName(provs, editingBranch.province);
      if (!prov) return;
      setProvinceId(prov.id);
      setLoadingRegion('regency');
      const regs = await wilayahService.getRegencies(prov.id);
      if (cancelled) return;
      setRegencies(regs);
      setLoadingRegion('');

      const reg = findByName(regs, editingBranch.city);
      if (!reg) return;
      setRegencyId(reg.id);
      setLoadingRegion('district');
      const dists = await wilayahService.getDistricts(reg.id);
      if (cancelled) return;
      setDistricts(dists);
      setLoadingRegion('');

      const dist = findByName(dists, editingBranch.subdistrict || '');
      if (!dist) return;
      setDistrictId(dist.id);
      await loadPostalCodes(dist.name, reg.name, () => cancelled);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingBranch, isOpen]);

  if (!isOpen) return null;

  async function loadPostalCodes(districtName: string, regencyName: string, isCancelled: () => boolean = () => false) {
    setLoadingRegion('postal');
    try {
      const codes = await wilayahService.getPostalCodes('', districtName, regencyName);
      // Hanya kode pos milik kecamatan yang dipilih.
      const target = normalizeRegion(districtName);
      const inDistrict = codes.filter((c) => !c.district || normalizeRegion(c.district) === target);
      if (!isCancelled()) setPostalCodes(inDistrict);
    } catch {
      if (!isCancelled()) setPostalCodes([]);
    } finally {
      if (!isCancelled()) setLoadingRegion('');
    }
  }

  const handleProvinceChange = async (id: string) => {
    const prov = provinces.find((p) => p.id === id);
    setProvinceId(id);
    setProvince(prov ? toTitle(prov.name) : '');
    setRegencyId('');
    setDistrictId('');
    setCity('');
    setSubdistrict('');
    setPostalCode('');
    setRegencies([]);
    setDistricts([]);
    setPostalCodes([]);
    if (!id) return;
    setLoadingRegion('regency');
    setRegencies(await wilayahService.getRegencies(id));
    setLoadingRegion('');
  };

  const handleRegencyChange = async (id: string) => {
    const reg = regencies.find((r) => r.id === id);
    setRegencyId(id);
    setCity(reg ? toTitle(reg.name) : '');
    setDistrictId('');
    setSubdistrict('');
    setPostalCode('');
    setDistricts([]);
    setPostalCodes([]);
    if (!id) return;
    setLoadingRegion('district');
    setDistricts(await wilayahService.getDistricts(id));
    setLoadingRegion('');
  };

  const handleDistrictChange = async (id: string) => {
    const dist = districts.find((d) => d.id === id);
    const reg = regencies.find((r) => r.id === regencyId);
    setDistrictId(id);
    setSubdistrict(dist ? toTitle(dist.name) : '');
    setPostalCode('');
    setPostalCodes([]);
    if (dist && reg) await loadPostalCodes(dist.name, reg.name);
  };

  const loadingText = isEn ? 'Loading...' : 'Memuat...';

  const labelClass = 'block text-xs font-semibold text-[#3D3535] mb-1.5';
  const inputClass =
    'w-full h-10 px-3 rounded-xl border border-[#E5E0DD] bg-white text-xs text-[#1F1F1F] placeholder:text-[#A39C99] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!branchName.trim() || !picName.trim() || !picPhone.trim() || !address.trim() || !province.trim() || !city.trim() || !subdistrict.trim() || !postalCode.trim()) {
      setFormError(isEn ? 'Please fill in all required fields (*).' : 'Mohon lengkapi semua kolom wajib (*).');
      return;
    }

    if (!/^(0|62)8\d{7,12}$/.test(picPhone.trim())) {
      setFormError(
        isEn
          ? 'Enter a valid mobile number (digits only, e.g. 081234567890).'
          : 'Masukkan nomor HP yang valid (angka saja, contoh: 081234567890).'
      );
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
          storeId: storeId || editingBranch.storeId,
          branchName: branchName.trim(),
          picName: picName.trim(),
          picPhone: picPhone.trim(),
          address: address.trim(),
          subdistrict: subdistrict.trim(),
          city: city.trim(),
          province: province.trim(),
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
          province: province.trim(),
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-left">
          {formError && (
            <div className="p-3 bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA] rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Nama Cabang */}
          <div>
            <label className={labelClass}>
              {t('branch_form_name', 'Nama Cabang')} <span className="text-[#B42318]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t('branch_form_name_placeholder', 'Contoh: Gudang Bandung')}
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* PIC Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                {t('branch_form_pic', 'Nama PIC')} <span className="text-[#B42318]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('branch_form_pic_placeholder', 'Penanggung jawab')}
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t('branch_form_phone', 'No. HP PIC')} <span className="text-[#B42318]">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="tel"
                maxLength={15}
                required
                placeholder={t('branch_form_phone_placeholder', '0812xxxxxxxx')}
                value={picPhone}
                onChange={(e) => setPicPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Alamat */}
          <div>
            <label className={labelClass}>
              {t('branch_form_address', 'Alamat')} <span className="text-[#B42318]">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder={t('branch_form_address_placeholder', 'Jalan, nomor, RT/RW')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${inputClass} h-auto py-2.5 resize-none`}
            />
          </div>

          {/* Wilayah (berjenjang dari API wilayah) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                {t('branch_form_province', 'Provinsi')} <span className="text-[#B42318]">*</span>
              </label>
              <select
                required
                value={provinceId}
                onChange={(e) => void handleProvinceChange(e.target.value)}
                disabled={loadingRegion === 'province'}
                className={`${inputClass} cursor-pointer disabled:bg-[#F7F7F7] disabled:cursor-not-allowed`}
              >
                <option value="">
                  {loadingRegion === 'province' ? loadingText : isEn ? 'Select province' : 'Pilih provinsi'}
                </option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>{toTitle(p.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t('branch_form_city', 'Kota / Kab')} <span className="text-[#B42318]">*</span>
              </label>
              <select
                required
                value={regencyId}
                onChange={(e) => void handleRegencyChange(e.target.value)}
                disabled={!provinceId || loadingRegion === 'regency'}
                className={`${inputClass} cursor-pointer disabled:bg-[#F7F7F7] disabled:cursor-not-allowed`}
              >
                <option value="">
                  {loadingRegion === 'regency'
                    ? loadingText
                    : !provinceId
                    ? isEn ? 'Select a province first' : 'Pilih provinsi dulu'
                    : isEn ? 'Select city / regency' : 'Pilih kota / kabupaten'}
                </option>
                {regencies.map((r) => (
                  <option key={r.id} value={r.id}>{toTitle(r.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t('branch_form_subdistrict', 'Kecamatan')} <span className="text-[#B42318]">*</span>
              </label>
              <select
                required
                value={districtId}
                onChange={(e) => void handleDistrictChange(e.target.value)}
                disabled={!regencyId || loadingRegion === 'district'}
                className={`${inputClass} cursor-pointer disabled:bg-[#F7F7F7] disabled:cursor-not-allowed`}
              >
                <option value="">
                  {loadingRegion === 'district'
                    ? loadingText
                    : !regencyId
                    ? isEn ? 'Select a city first' : 'Pilih kota dulu'
                    : isEn ? 'Select district' : 'Pilih kecamatan'}
                </option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{toTitle(d.name)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t('branch_form_postal_code', 'Kode Pos')} <span className="text-[#B42318]">*</span>
              </label>
              {postalCodes.length > 0 ? (
                <select
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">{isEn ? 'Select postal code' : 'Pilih kode pos'}</option>
                  {postalCode && !postalCodes.some((p) => p.code === postalCode) && (
                    <option value={postalCode}>{postalCode}</option>
                  )}
                  {uniqueCodes(postalCodes).map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code}{p.village ? ` (${toTitle(p.village)})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  required
                  disabled={loadingRegion === 'postal'}
                  placeholder={loadingRegion === 'postal' ? loadingText : '12730'}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className={`${inputClass} disabled:bg-[#F7F7F7]`}
                />
              )}
              {districtId && loadingRegion !== 'postal' && postalCodes.length === 0 && (
                <p className="text-[11px] text-[#777777] mt-1">
                  {isEn
                    ? 'Postal code list unavailable, please type it manually.'
                    : 'Daftar kode pos tidak tersedia, silakan ketik manual.'}
                </p>
              )}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E5E0DD] cursor-pointer select-none hover:bg-[#FAF7F7] transition">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 rounded accent-[#66000E] cursor-pointer"
              />
              <span>
                <span className="block font-semibold text-xs text-[#1F1F1F]">
                  {t('branch_form_default_checkbox', 'Cabang utama')}
                </span>
                <span className="block text-[11px] text-[#777777] mt-0.5">
                  {t('branch_form_default_hint', 'Asal pengiriman default saat checkout')}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-[#E5E0DD] cursor-pointer select-none hover:bg-[#FAF7F7] transition">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 rounded accent-[#66000E] cursor-pointer"
              />
              <span>
                <span className="block font-semibold text-xs text-[#1F1F1F]">
                  {t('branch_form_active_checkbox', 'Aktif')}
                </span>
                <span className="block text-[11px] text-[#777777] mt-0.5">
                  {t('branch_form_active_hint', 'Bisa dipakai untuk pengiriman & pickup')}
                </span>
              </span>
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

/** "KOTA BANDUNG" -> "Kota Bandung" (nama dari API wilayah berhuruf kapital). */
function toTitle(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    .replace(/\bDki\b/g, 'DKI')
    .replace(/\bDi\b/g, 'DI');
}

const normalizeRegion = (s: string) =>
  (s || '')
    .toLowerCase()
    .replace(/^(provinsi|kabupaten|kab\.?|kota|kecamatan|kec\.?)\s+/, '')
    .replace(/[^a-z0-9]/g, '');

/** Cocokkan nama tersimpan (mis. "Bandung") ke item API (mis. "KOTA BANDUNG"). */
function findByName(items: WilayahItem[], saved: string): WilayahItem | undefined {
  const target = normalizeRegion(saved);
  if (!target) return undefined;
  const exact = items.find((i) => i.name.toLowerCase() === saved.trim().toLowerCase());
  return exact || items.find((i) => normalizeRegion(i.name) === target);
}

/** Satu baris per kode pos (beberapa kelurahan bisa berbagi kode). */
function uniqueCodes(items: PostalCodeItem[]): PostalCodeItem[] {
  const seen = new Set<string>();
  return items.filter((p) => (seen.has(p.code) ? false : (seen.add(p.code), true)));
}
