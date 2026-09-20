import React, { useState, useEffect } from 'react';
import { Save, Phone, MapPin, Store as StoreIcon, ExternalLink, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Store } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { wilayahService, WilayahItem, PostalCodeItem } from '../../services/wilayahService';
import { StoreLocationPickerMap } from '../../components/merchant/StoreLocationPickerMap';

interface SettingsPageProps {
  store: Store;
  onUpdateStore: (updated: Store) => void;
  onCreateStore?: (data: Partial<Store>) => void;
  onPublishStore?: () => void;
  onOpenWithdraw?: () => void;
  onOpenShareModal?: () => void;
  onNavigateBilling?: () => void;
  onShowNotification: (msg: string) => void;
  onNavigateDashboard?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  store,
  onUpdateStore,
  onCreateStore,
  onPublishStore,
  onShowNotification,
  onNavigateDashboard,
}) => {
  const { t } = useLanguage();
  const isNewStore = !store.id;
  const storeUrl = store.slug ? `${window.location.origin}/?toko=${store.slug}` : null;

  const [formData, setFormData] = useState({
    name: isNewStore ? '' : store.name,
    slug: isNewStore ? '' : store.slug,
    tagline: store.tagline || '',
    description: store.description || '',
    phoneWhatsApp: store.phoneWhatsApp || '',
    address: store.address || '',
    addressDetail: store.addressDetail || '',
    village: store.village || store.subdistrict || '',
    subdistrict: store.subdistrict || store.village || '',
    district: store.district || '',
    city: store.city || '',
    province: store.province || '',
    postalCode: store.postalCode || '',
    latitude: store.latitude,
    longitude: store.longitude,
    logoUrl: store.logoUrl || '',
    bannerUrl: store.bannerUrl || '',
  });

  // State Wilayah Indonesia Cascade Dropdown
  const [provinces, setProvinces] = useState<WilayahItem[]>([]);
  const [regencies, setRegencies] = useState<WilayahItem[]>([]);
  const [districts, setDistricts] = useState<WilayahItem[]>([]);
  const [villages, setVillages] = useState<WilayahItem[]>([]);
  const [postalCodes, setPostalCodes] = useState<PostalCodeItem[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [loadingPostalCodes, setLoadingPostalCodes] = useState(false);

  // Inisialisasi daftar Provinsi & sinkronisasi data toko yang sudah ada
  useEffect(() => {
    let isMounted = true;
    const initWilayah = async () => {
      setLoadingProvinces(true);
      try {
        const provs = await wilayahService.getProvinces();
        if (!isMounted) return;
        setProvinces(provs);

        // Jika toko sudah punya data provinsi, cari ID yang cocok
        if (formData.province) {
          const matchedProv = provs.find(
            (p) => p.name.toLowerCase() === formData.province.toLowerCase() ||
                   formData.province.toLowerCase().includes(p.name.toLowerCase())
          );
          if (matchedProv) {
            setSelectedProvinceId(matchedProv.id);
            setLoadingRegencies(true);
            const regs = await wilayahService.getRegencies(matchedProv.id);
            if (!isMounted) return;
            setRegencies(regs);

            // Cocokkan Kabupaten / Kota
            if (formData.city) {
              const matchedReg = regs.find(
                (r) => r.name.toLowerCase() === formData.city.toLowerCase() ||
                       formData.city.toLowerCase().includes(r.name.toLowerCase())
              );
              if (matchedReg) {
                setSelectedRegencyId(matchedReg.id);
                setLoadingDistricts(true);
                const dists = await wilayahService.getDistricts(matchedReg.id);
                if (!isMounted) return;
                setDistricts(dists);

                // Cocokkan Kecamatan
                if (formData.district) {
                  const matchedDist = dists.find(
                    (d) => d.name.toLowerCase() === formData.district.toLowerCase() ||
                           formData.district.toLowerCase().includes(d.name.toLowerCase())
                  );
                  if (matchedDist) {
                    setSelectedDistrictId(matchedDist.id);
                    setLoadingVillages(true);
                    const vills = await wilayahService.getVillages(matchedDist.id);
                    if (!isMounted) return;
                    setVillages(vills);

                    // Cocokkan Desa/Kelurahan
                    const currentVill = formData.village || formData.subdistrict;
                    if (currentVill) {
                      const matchedVill = vills.find(
                        (v) => v.name.toLowerCase() === currentVill.toLowerCase() ||
                               currentVill.toLowerCase().includes(v.name.toLowerCase())
                      );
                      if (matchedVill) {
                        setSelectedVillageId(matchedVill.id);
                        // Muat opsi daftar kode pos untuk dropdown
                        setLoadingPostalCodes(true);
                        const codes = await wilayahService.getPostalCodes(
                          matchedVill.name,
                          matchedDist.name,
                          matchedReg.name
                        );
                        if (isMounted) setPostalCodes(codes);
                        setLoadingPostalCodes(false);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error loading initial wilayah:', err);
      } finally {
        if (isMounted) {
          setLoadingProvinces(false);
          setLoadingRegencies(false);
          setLoadingDistricts(false);
          setLoadingVillages(false);
        }
      }
    };

    initWilayah();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler pergantian Provinsi
  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provId = e.target.value;
    setSelectedProvinceId(provId);
    setSelectedRegencyId('');
    setSelectedDistrictId('');
    setSelectedVillageId('');
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    setPostalCodes([]);

    const foundProv = provinces.find((p) => p.id === provId);
    const provName = foundProv ? foundProv.name : '';
    setFormData((prev) => ({
      ...prev,
      province: provName,
      city: '',
      district: '',
      subdistrict: '',
      village: '',
      postalCode: '',
    }));

    if (provId) {
      setLoadingRegencies(true);
      const regs = await wilayahService.getRegencies(provId);
      setRegencies(regs);
      setLoadingRegencies(false);
    }
  };

  // Handler pergantian Kabupaten / Kota
  const handleRegencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regId = e.target.value;
    setSelectedRegencyId(regId);
    setSelectedDistrictId('');
    setSelectedVillageId('');
    setDistricts([]);
    setVillages([]);
    setPostalCodes([]);

    const foundReg = regencies.find((r) => r.id === regId);
    const regName = foundReg ? foundReg.name : '';
    setFormData((prev) => ({
      ...prev,
      city: regName,
      district: '',
      subdistrict: '',
      village: '',
      postalCode: '',
    }));

    if (regId) {
      setLoadingDistricts(true);
      const dists = await wilayahService.getDistricts(regId);
      setDistricts(dists);
      setLoadingDistricts(false);
    }
  };

  // Handler pergantian Kecamatan
  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = e.target.value;
    setSelectedDistrictId(distId);
    setSelectedVillageId('');
    setVillages([]);
    setPostalCodes([]);

    const foundDist = districts.find((d) => d.id === distId);
    const distName = foundDist ? foundDist.name : '';
    setFormData((prev) => ({
      ...prev,
      district: distName,
      subdistrict: '',
      village: '',
      postalCode: '',
    }));

    if (distId) {
      setLoadingVillages(true);
      const vills = await wilayahService.getVillages(distId);
      setVillages(vills);
      setLoadingVillages(false);
    }
  };

  // Handler pergantian Desa / Kelurahan & Memuat Pilihan Kode Pos untuk Dropdown
  const handleVillageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const villId = e.target.value;
    setSelectedVillageId(villId);
    setPostalCodes([]);

    const foundVill = villages.find((v) => v.id === villId);
    const villName = foundVill ? foundVill.name : '';
    setFormData((prev) => ({
      ...prev,
      village: villName,
      subdistrict: villName,
      postalCode: '', // Tidak langsung terisi, menunggu dipilih oleh merchant dari dropdown
    }));

    if (villName) {
      setLoadingPostalCodes(true);
      try {
        const foundDist = districts.find((d) => d.id === selectedDistrictId);
        const foundReg = regencies.find((r) => r.id === selectedRegencyId);
        const codes = await wilayahService.getPostalCodes(
          villName,
          foundDist ? foundDist.name : formData.district,
          foundReg ? foundReg.name : formData.city
        );
        setPostalCodes(codes);
      } catch (err) {
        console.warn('[SettingsPage] Gagal memuat daftar kode pos:', err);
      } finally {
        setLoadingPostalCodes(false);
      }
    }
  };

  // Handler saat merchant memilih kode pos dari dropdown
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const codeVal = e.target.value;
    const selectedItem = postalCodes.find((p) => p.code === codeVal);
    setFormData((prev) => ({
      ...prev,
      postalCode: codeVal,
      latitude: prev.latitude ?? selectedItem?.latitude,
      longitude: prev.longitude ?? selectedItem?.longitude,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const autoSlug = (store.slug && store.slug.trim()) || formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `toko-${Date.now()}`;

    if (isNewStore && onCreateStore) {
      onCreateStore({
        name: formData.name.trim(),
        slug: autoSlug,
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        phoneWhatsApp: formData.phoneWhatsApp.trim(),
        address: formData.address.trim(),
        addressDetail: formData.addressDetail.trim(),
        village: formData.village.trim(),
        subdistrict: formData.subdistrict.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      onShowNotification('🎉 Toko berhasil dibuat!');
    } else {
      const updated: Store = {
        ...store,
        name: formData.name.trim(),
        slug: autoSlug,
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        phoneWhatsApp: formData.phoneWhatsApp.trim(),
        address: formData.address.trim(),
        addressDetail: formData.addressDetail.trim(),
        village: formData.village.trim(),
        subdistrict: formData.subdistrict.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        logoUrl: formData.logoUrl.trim(),
        bannerUrl: formData.bannerUrl.trim(),
      };
      onUpdateStore(updated);
      onShowNotification(t('settings_saved_notif', 'Pengaturan toko berhasil disimpan!'));
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 w-full text-left">
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: t('nav_settings', 'Pengaturan Toko'), isActive: true },
        ]}
      />

      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
          <StoreIcon className="w-5 h-5 text-[#66000E]" />
          <span>{isNewStore ? 'Buat Toko Online' : t('nav_settings', 'Pengaturan Toko')}</span>
        </h1>
        {!isNewStore && storeUrl && (store.isPublished || store.domainStatus === 'connected') && (
          <a
            href={store.customDomain ? `https://${store.customDomain}` : storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Toko di Browser</span>
          </a>
        )}
      </div>

      <div className="w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAEAEA] shadow-xs space-y-6">
          <div className="pb-3 border-b border-[#EAEAEA] flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-[#1F1F1F]">
                {isNewStore ? 'Isi Data Toko Anda' : 'Informasi Toko Online'}
              </h2>
              <p className="text-xs text-[#777777] mt-0.5">
                Lengkapi identitas toko dan alamat lengkap operasional usaha Anda
              </p>
            </div>
            {!isNewStore && (
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                store.isPublished || store.domainStatus === 'connected'
                  ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {store.isPublished || store.domainStatus === 'connected' ? 'Etalase Aktif' : 'Draf'}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: PROFIL & KONTAK TOKO */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Nama Toko UMKM <span className="text-[#66000E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama toko online Anda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs font-semibold text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Tagline Singkat
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Misal: Toko Resmi Oleh-oleh Khas Nusantara"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Deskripsi Toko
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tuliskan deskripsi singkat mengenai produk dan keunggulan toko Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Nomor WhatsApp Toko <span className="text-[#66000E]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={formData.phoneWhatsApp}
                    onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: HIERARKI ALAMAT TOKO (MENGERUCUT DARI PROVINSI HINGGA DETAIL) */}
            <div className="pt-4 border-t border-[#E5E0DD] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#66000E]" />
                  <h3 className="text-sm font-bold text-[#1F1F1F] uppercase tracking-wide">
                    Alamat Lengkap Operasional Toko
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-gray-500 hidden sm:inline-block">
                  Pilih berurutan: Provinsi ➔ Kabupaten ➔ Kecamatan ➔ Desa
                </span>
              </div>

              {/* Provinsi & Kabupaten/Kota (Cascade) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dropdown Provinsi */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center justify-between">
                    <span>Provinsi <span className="text-[#66000E]">*</span></span>
                    {loadingProvinces && <Loader2 className="w-3 h-3 animate-spin text-[#66000E]" />}
                  </label>
                  <select
                    required
                    value={selectedProvinceId}
                    onChange={handleProvinceChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs font-medium text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] cursor-pointer"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {formData.province && !provinces.some((p) => p.id === selectedProvinceId) && (
                      <option value="custom-prov">{formData.province}</option>
                    )}
                  </select>
                </div>

                {/* Dropdown Kabupaten / Kota */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center justify-between">
                    <span>Kabupaten / Kota <span className="text-[#66000E]">*</span></span>
                    {loadingRegencies && <Loader2 className="w-3 h-3 animate-spin text-[#66000E]" />}
                  </label>
                  <select
                    required
                    disabled={!selectedProvinceId && regencies.length === 0}
                    value={selectedRegencyId}
                    onChange={handleRegencyChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs font-medium text-[#1F1F1F] bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] cursor-pointer"
                  >
                    <option value="">
                      {!selectedProvinceId ? '-- Pilih Provinsi Terlebih Dahulu --' : '-- Pilih Kabupaten / Kota --'}
                    </option>
                    {regencies.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                    {formData.city && !regencies.some((r) => r.id === selectedRegencyId) && (
                      <option value="custom-city">{formData.city}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Kecamatan & Desa / Kelurahan (Cascade) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dropdown Kecamatan */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center justify-between">
                    <span>Kecamatan <span className="text-[#66000E]">*</span></span>
                    {loadingDistricts && <Loader2 className="w-3 h-3 animate-spin text-[#66000E]" />}
                  </label>
                  <select
                    required
                    disabled={!selectedRegencyId && districts.length === 0}
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs font-medium text-[#1F1F1F] bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] cursor-pointer"
                  >
                    <option value="">
                      {!selectedRegencyId ? '-- Pilih Kabupaten Dahulu --' : '-- Pilih Kecamatan --'}
                    </option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                    {formData.district && !districts.some((d) => d.id === selectedDistrictId) && (
                      <option value="custom-dist">{formData.district}</option>
                    )}
                  </select>
                </div>

                {/* Dropdown Desa / Kelurahan */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center justify-between">
                    <span>Desa / Kelurahan <span className="text-[#66000E]">*</span></span>
                    {loadingVillages && <Loader2 className="w-3 h-3 animate-spin text-[#66000E]" />}
                  </label>
                  <select
                    required
                    disabled={!selectedDistrictId && villages.length === 0}
                    value={selectedVillageId}
                    onChange={handleVillageChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs font-medium text-[#1F1F1F] bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] cursor-pointer"
                  >
                    <option value="">
                      {!selectedDistrictId ? '-- Pilih Kecamatan Dahulu --' : '-- Pilih Desa / Kelurahan --'}
                    </option>
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                    {(formData.village || formData.subdistrict) && !villages.some((v) => v.id === selectedVillageId) && (
                      <option value="custom-vill">{formData.village || formData.subdistrict}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Kode Pos (Dropdown Pilihan) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center gap-1.5">
                  <span>Kode Pos <span className="text-[#66000E]">*</span></span>
                  {loadingPostalCodes && (
                    <Loader2 className="w-3 h-3 animate-spin text-[#66000E]" />
                  )}
                </label>

                <select
                  required
                  disabled={!selectedVillageId && postalCodes.length === 0}
                  value={formData.postalCode}
                  onChange={handlePostalCodeChange}
                  className="w-full sm:max-w-xs px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs font-medium text-[#1F1F1F] bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] cursor-pointer"
                >
                  <option value="">
                    {!selectedVillageId
                      ? '-- Pilih Kelurahan Terlebih Dahulu --'
                      : loadingPostalCodes
                      ? '-- Memuat Pilihan Kode Pos... --'
                      : postalCodes.length === 0
                      ? '-- Kode Pos Tidak Tersedia --'
                      : '-- Pilih Kode Pos --'}
                  </option>
                  {postalCodes.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.code}
                    </option>
                  ))}
                  {formData.postalCode && !postalCodes.some((p) => p.code === formData.postalCode) && (
                    <option value={formData.postalCode}>{formData.postalCode}</option>
                  )}
                </select>
                <p className="text-[11px] text-[#777777] mt-1 sm:max-w-xs">
                  Pilih kode pos dari dropdown sesuai kelurahan yang Anda tentukan.
                </p>
              </div>

              {/* Alamat Jalan / Utama */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Alamat (Nama Jalan, No. Bangunan, RT/RW) <span className="text-[#66000E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Riau No. 112, RT 03/RW 02"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                />
              </div>

              {/* Detail Alamat (Patokan / Blok / Gedung) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Detail Alamat (Patokan / Blok / Gedung / Unit)
                </label>
                <input
                  type="text"
                  value={formData.addressDetail}
                  onChange={(e) => setFormData({ ...formData, addressDetail: e.target.value })}
                  placeholder="Contoh: Ruko Sentra Niaga Blok B-12, Seberang Taman Fotografi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                />
              </div>

              {/* PETA TITIK KEAKURATAN LOKASI TOKO (MAPS + GPS) */}
              <div className="pt-2">
                <StoreLocationPickerMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  fullAddressString={[
                    formData.address,
                    formData.village,
                    formData.district,
                    formData.city,
                    formData.province,
                  ].filter(Boolean).join(', ')}
                  onChangeCoordinates={(lat, lng) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAEAEA] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 min-h-[44px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isNewStore ? 'Buat Toko Sekarang' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
