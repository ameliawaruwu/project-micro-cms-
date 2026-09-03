import React, { useState } from 'react';
import { Wallet, Save, Share2, Phone, MapPin } from 'lucide-react';
import { Store } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';

interface SettingsPageProps {
  store: Store;
  onUpdateStore: (updated: Store) => void;
  onOpenWithdraw: () => void;
  onOpenShareModal: () => void;
  onShowNotification: (msg: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  store,
  onUpdateStore,
  onOpenWithdraw,
  onOpenShareModal,
  onShowNotification,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: store.name,
    slug: store.slug,
    tagline: store.tagline || '',
    description: store.description || '',
    phoneWhatsApp: store.phoneWhatsApp,
    city: store.city,
    logoUrl: store.logoUrl || '',
    bannerUrl: store.bannerUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Store = {
      ...store,
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      phoneWhatsApp: formData.phoneWhatsApp.trim(),
      city: formData.city.trim(),
      logoUrl: formData.logoUrl.trim(),
      bannerUrl: formData.bannerUrl.trim(),
    };

    onUpdateStore(updated);
    onShowNotification(t('settings_saved_notif', 'Pengaturan toko berhasil disimpan!'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F] tracking-tight">{t('settings_title', 'Pengaturan')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Store Profile Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-[#EAEAEA] shadow-xs space-y-5">
          <div className="pb-3 border-b border-[#EAEAEA] flex items-center justify-between">
            <h2 className="font-bold text-base text-[#1F1F1F]">Informasi Toko Online</h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
              Etalase Live
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Nama Toko UMKM <span className="text-[#9A0602]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] text-xs font-semibold text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Tautan Toko (Link Slug) <span className="text-[#9A0602]">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-[#F7F7F7] border border-r-0 border-[#EAEAEA] rounded-l-xl text-xs text-[#777777] font-mono">
                    kroombox.id/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3.5 py-2.5 rounded-r-xl border border-[#EAEAEA] text-xs font-mono text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                Slogan / Tagline Singkat
              </label>
              <input
                type="text"
                placeholder="Contoh: Batik Tulis Asli Pekalongan dengan Motif Khas Klasik"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                Deskripsi Toko
              </label>
              <textarea
                rows={3}
                placeholder="Ceritakan sejarah dan dedikasi produk toko Anda..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Nomor WhatsApp Toko <span className="text-[#9A0602]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={formData.phoneWhatsApp}
                    onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAEAEA] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Kota / Kabupaten Asal Toko
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Pekalongan, Jawa Tengah"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAEAEA] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAEAEA] flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 min-h-[44px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Wallet & QR Code */}
        <div className="space-y-6">
          {/* Wallet Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#1F1F1F] font-bold text-base">
              <Wallet className="w-5 h-5 text-[#9A0602]" />
              <span>Dompet Saldo UMKM</span>
            </div>

            <div className="p-4 bg-[#F7F7F7] rounded-2xl border border-[#EAEAEA] space-y-1">
              <span className="text-xs text-[#777777] font-semibold block">Saldo Aktif Siap Ditarik</span>
              <span className="text-2xl font-bold text-[#1F1F1F] block">
                {formatRupiah(store.balance)}
              </span>
              <p className="text-[11px] text-[#555555]">
                Pencairan otomatis ke rekening BCA, Mandiri, BRI, atau Bank Jago.
              </p>
            </div>

            <button
              onClick={onOpenWithdraw}
              className="w-full py-3 min-h-[44px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              Tarik Dana ke Rekening Bank
            </button>
          </div>

          {/* Store QR Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAEAEA] shadow-xs text-center space-y-3">
            <h3 className="font-semibold text-xs text-[#777777] uppercase tracking-wider">
              QR Code Etalase Toko
            </h3>
            <div className="w-32 h-32 mx-auto bg-[#F7F7F7] p-2.5 rounded-2xl border border-[#EAEAEA] flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(`https://kroombox.id/${store.slug}`)}&color=9a0602`}
                alt="QR Code Toko"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={onOpenShareModal}
              className="text-xs font-semibold text-[#9A0602] hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Link & QR Toko</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

