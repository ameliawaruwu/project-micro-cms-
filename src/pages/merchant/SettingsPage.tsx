import React, { useState } from 'react';
import { Save, Phone, MapPin, Settings as SettingsIcon } from 'lucide-react';
import { Store } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

interface SettingsPageProps {
  store: Store;
  onUpdateStore: (updated: Store) => void;
  onOpenWithdraw?: () => void;
  onOpenShareModal?: () => void;
  onNavigateBilling?: () => void;
  onShowNotification: (msg: string) => void;
  onNavigateDashboard?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  store,
  onUpdateStore,
  onShowNotification,
  onNavigateDashboard,
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
    <div className="space-y-4 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 w-full text-left">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: t('settings_title', 'Pengaturan'), isActive: true },
        ]}
      />

      <div className="pb-3 border-b border-[#E5E0DD]">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-5 h-5 text-[#66000E]" />
          <span>{t('settings_title', 'Pengaturan')}</span>
        </h1>
      </div>

      <div className="w-full">
        {/* Store Profile Edit Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAEAEA] shadow-xs space-y-5">
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
                    kroomify.id/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3.5 py-2.5 rounded-r-xl border border-[#EAEAEA] text-xs font-semibold text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                Tagline Singkat
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Misal: Toko Resmi Toko Kopi Nusantara"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                Deskripsi Toko
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tuliskan deskripsi singkat mengenai toko Anda..."
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
                    value={formData.phoneWhatsApp}
                    onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#EAEAEA] text-xs text-[#1F1F1F] bg-white focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1.5">
                  Kota / Wilayah Asal Toko
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
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
                className="px-6 py-2.5 min-h-[44px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
