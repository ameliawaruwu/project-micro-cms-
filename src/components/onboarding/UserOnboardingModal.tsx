import React, { useState, useEffect, useRef } from 'react';
import {
  Store as StoreIcon,
  Phone,
  Check,
  Loader2,
  Globe,
  Sparkles,
  Building2,
  X,
} from 'lucide-react';
import { Store, User } from '../../types';
import { storeService } from '../../services/storeService';
import { communityService } from '../../services/communityService';
import { billingPlanService } from '../../services/billingPlanService';
import { UMKM_CATEGORIES } from '../../pages/merchant/SettingsPage';
import { useLanguage } from '../../contexts/LanguageContext';

interface UserOnboardingModalProps {
  isOpen: boolean;
  user: User | null;
  store: Store | null;
  onComplete: (updatedStore: Store) => void;
  onClose?: () => void;
}

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({
  isOpen,
  user,
  store,
  onComplete,
  onClose,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Form states
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [category, setCategory] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');
  const [tagline, setTagline] = useState('');
  const [isSavingStore, setIsSavingStore] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStoreName(store?.name || '');
      setStoreSlug(store?.slug || '');
      setCategory(store?.category || '');
      setPhoneWhatsApp(store?.phoneWhatsApp || user?.phoneWhatsApp || '');
      setTagline(store?.tagline || '');
      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [isOpen, store?.name, store?.slug, store?.category, store?.phoneWhatsApp, store?.tagline, store?.communityName, user?.phoneWhatsApp, user?.communityName]);

  const handleNameChange = (val: string) => {
    setStoreName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStoreSlug(autoSlug);
  };

  // Submit Simpan Informasi Toko & Langsung Selesai Buka Dashboard (Tanpa Langkah 2)
  const handleSaveStoreInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!storeName.trim()) {
      nameInputRef.current?.focus();
      return;
    }

    setIsSavingStore(true);
    try {
      const finalName = storeName.trim();
      const finalSlug = storeSlug.trim() || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const cleanPhone = phoneWhatsApp.trim();

      const resolvedCommunityId = store?.communityId || user?.communityId;
      const resolvedCommunityName = store?.communityName || user?.communityName;

      let updatedStore: Store;
      if (store?.id) {
        updatedStore = await storeService.updateStore(
          store.id,
          {
            name: finalName,
            slug: finalSlug,
            category: category.trim(),
            phoneWhatsApp: cleanPhone,
            tagline: tagline.trim(),
            communityId: resolvedCommunityId,
            communityName: resolvedCommunityName,
            plan: 'free',
            onboarding: {
              productUploaded: store.onboarding?.productUploaded ?? false,
              paymentConnected: store.onboarding?.paymentConnected ?? false,
              ...(store.onboarding || {}),
              storeNameSet: true,
            },
          },
          user.id
        );
      } else {
        updatedStore = await storeService.createStore({
          merchantId: user.id,
          name: finalName,
          slug: finalSlug,
          category: category.trim(),
          phoneWhatsApp: cleanPhone,
          tagline: tagline.trim(),
          communityId: resolvedCommunityId,
          communityName: resolvedCommunityName,
          plan: 'free',
          onboarding: {
            storeNameSet: true,
            productUploaded: false,
            paymentConnected: false,
          },
        });
      }

      // Catat langganan starter (Rp 0) di database
      try {
        await billingPlanService.recordSubscription({
          storeId: updatedStore.id,
          storeName: updatedStore.name,
          planId: 'PLN001',
          planName: 'Paket Free (Bagi Hasil Omset)',
          cycle: 'yearly',
          amount: 0,
          status: 'paid',
          paymentMethod: 'Aktivasi Otomatis',
          invoiceNumber: `INV-FREE-${Date.now().toString().slice(-6)}`,
          paidAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        });
      } catch (subErr) {
        console.warn('Subscription record warning:', subErr);
      }

      // Tandai onboarding selesai sepenuhnya agar modal tertutup & tidak muncul lagi
      localStorage.removeItem('kroomify_onboarding_pending');
      localStorage.removeItem('kroomify_onboarding_step');
      localStorage.removeItem('kroomify_first_login_after_register');
      localStorage.setItem('kroomify_onboarding_completed', 'true');
      sessionStorage.setItem('kroomify_store_info_dismissed', 'true');
      if (user?.id) {
        localStorage.setItem(`kroomify_onboarding_completed_${user.id}`, 'true');
        localStorage.setItem(`kroomify_store_info_dismissed_${user.id}`, 'true');
        localStorage.removeItem(`kroomify_onboarding_pending_${user.id}`);
        localStorage.removeItem(`kroomify_first_login_after_register_${user.id}`);
      }

      onComplete(updatedStore);
    } catch (err) {
      console.warn('Gagal menyimpan profil toko:', err);
    } finally {
      setIsSavingStore(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-left">
        {/* Subtle Top Maroon Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-[#66000E] via-[#9E1228] to-[#66000E] w-full shrink-0" />

        {/* Header (Single Seamless Setup) */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#66000E]/10 text-[#66000E]">
              {isEn ? 'Store Setup' : 'Pengaturan Toko Online'}
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            {isEn ? 'Set Up Your Online Store' : 'Informasi Toko Online'}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isEn
              ? 'Enter your store details to get started.'
              : 'Lengkapi identitas dasar toko Anda untuk langsung membuka dashboard.'}
          </p>
        </div>

        {/* FORM INFORMASI TOKO ONLINE */}
        <form onSubmit={handleSaveStoreInfo} className="p-5 space-y-3.5 overflow-y-auto">
          {/* Nama Toko Online */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isEn ? 'Store Name' : 'Nama Toko Online'} <span className="text-[#66000E]">*</span>
            </label>
            <div className="relative">
              <StoreIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={nameInputRef}
                type="text"
                required
                autoComplete="off"
                value={storeName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={isEn ? 'e.g. Blossom Florist' : 'Contoh: Toko Kopi Nusantara'}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
              />
            </div>
            {storeSlug && (
              <p className="text-[10px] text-slate-400 mt-1 pl-1 flex items-center gap-1 font-mono">
                <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                <span>https://</span>
                <span className="font-bold text-[#66000E]">{storeSlug}</span>
                <span>.lapakq.com</span>
              </p>
            )}
          </div>

          {/* Kategori & No. WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? 'Category' : 'Kategori UMKM'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all cursor-pointer"
              >
                <option value="">{isEn ? '-- Select --' : '-- Pilih Kategori --'}</option>
                {UMKM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? 'WhatsApp Phone' : 'No. WhatsApp'}
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="off"
                  value={phoneWhatsApp}
                  onChange={(e) => setPhoneWhatsApp(e.target.value.replace(/\D/g, ''))}
                  placeholder="081234567890"
                  className="w-full pl-8 pr-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Tagline (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isEn ? 'Tagline (Optional)' : 'Tagline Singkat (Opsional)'}
            </label>
            <input
              type="text"
              autoComplete="off"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={
                isEn ? 'e.g. Authentic Artisan Crafts' : 'Contoh: Produsen Batik Tulis Asli Garut'
              }
              className="w-full px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
            />
          </div>

{/* Tombol Simpan & Selesai Buka Dashboard */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingStore}
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSavingStore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Saving & Opening Dashboard...' : 'Menyimpan & Membuka Dashboard...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isEn ? 'Save & Open Dashboard' : 'Simpan & Buka Dashboard'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
