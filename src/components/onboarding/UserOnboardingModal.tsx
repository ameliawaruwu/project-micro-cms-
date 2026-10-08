import React, { useState, useEffect, useRef } from 'react';
import {
  Store as StoreIcon,
  ArrowRight,
  Loader2,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Store, User } from '../../types';
import { storeService } from '../../services/storeService';
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

  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [category, setCategory] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');
  const [tagline, setTagline] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStoreName('');
      setStoreSlug('');

      if (store) {
        setCategory(store.category && store.category !== 'Bisnis UMKM' ? store.category : '');
        setPhoneWhatsApp(store.phoneWhatsApp || user?.phoneWhatsApp || '');
        setTagline(store.tagline || '');
      } else if (user) {
        setPhoneWhatsApp(user.phoneWhatsApp || '');
      }

      setTimeout(() => nameInputRef.current?.focus(), 150);
    }
  }, [isOpen, store?.id, user?.id]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setStoreName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStoreSlug(autoSlug);
  };

  const handleSaveStoreInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!storeName.trim()) {
      nameInputRef.current?.focus();
      return;
    }

    setIsSaving(true);
    try {
      const finalName = storeName.trim();
      const finalSlug = storeSlug.trim() || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const cleanPhone = phoneWhatsApp.trim();

      let savedStore: Store;
      if (store?.id) {
        savedStore = await storeService.updateStore(
          store.id,
          {
            name: finalName,
            slug: finalSlug,
            category: category.trim(),
            phoneWhatsApp: cleanPhone,
            tagline: tagline.trim(),
            plan: store.plan || 'free',
            onboarding: {
              ...(store.onboarding || {}),
              storeNameSet: true,
              productUploaded: store.onboarding?.productUploaded || false,
              paymentConnected: store.onboarding?.paymentConnected || false,
            },
          },
          user.id
        );
      } else {
        savedStore = await storeService.createStore({
          merchantId: user.id,
          name: finalName,
          slug: finalSlug,
          category: category.trim(),
          phoneWhatsApp: cleanPhone,
          tagline: tagline.trim(),
          plan: 'free',
          onboarding: {
            storeNameSet: true,
            productUploaded: false,
            paymentConnected: false,
          },
        });
      }

      // Record free subscription if store does not have any active subscription
      try {
        const subInfo = await billingPlanService.getActiveSubscriptionForStore(savedStore.id);
        if (!subInfo.hasActivePaidPlan) {
          const now = new Date();
          const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          await billingPlanService.recordSubscription({
            storeId: savedStore.id,
            storeName: savedStore.name,
            planId: 'PLN001',
            planName: 'Paket Free',
            cycle: 'yearly',
            amount: 0,
            status: 'paid',
            paymentMethod: 'Aktivasi Toko Baru',
            invoiceNumber: `INV-FREE-${Date.now().toString().slice(-6)}`,
            paidAt: now.toISOString(),
            expiresAt: expires.toISOString(),
          });
        }
      } catch (e) {
        console.warn('Subscription auto-record notice:', e);
      }

      // Clear pending onboarding flags so popup never opens again
      localStorage.removeItem('kroomify_onboarding_pending');
      localStorage.removeItem('kroomify_onboarding_step');
      sessionStorage.removeItem('kroomify_store_info_dismissed');
      if (user?.id) {
        localStorage.removeItem(`kroomify_store_info_dismissed_${user.id}`);
        localStorage.removeItem(`kroomify_onboarding_pending_${user.id}`);
      }

      onComplete(savedStore);
    } catch (err) {
      console.warn('Gagal menyimpan profil toko:', err);
      const fallback = {
        ...(store || {}),
        name: storeName.trim(),
        slug: storeSlug.trim() || storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: category.trim(),
        phoneWhatsApp: phoneWhatsApp.trim(),
        onboarding: { storeNameSet: true },
      } as Store;
      localStorage.removeItem('kroomify_onboarding_pending');
      if (user?.id) {
        localStorage.removeItem(`kroomify_onboarding_pending_${user.id}`);
      }
      onComplete(fallback);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans select-none animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Maroon Stripe */}
        <div className="h-1 bg-gradient-to-r from-[#66000E] via-[#9E1228] to-[#66000E] w-full shrink-0" />

        {/* Compact Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {isEn ? 'Set Up Your Store' : 'Informasi Toko Online'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isEn ? 'Enter your store details to get started.' : 'Lengkapi informasi dasar toko Anda untuk memulai.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body - Compact & Responsive */}
        <form onSubmit={handleSaveStoreInfo} className="p-5 space-y-3 overflow-y-auto">

          {/* Store Name */}
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
                value={storeName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={isEn ? 'e.g. Dapur Nusantara, Batik Sekar' : 'Contoh: Dapur Nusantara, Batik Sekar'}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
              />
            </div>

            {/* Subdomain Preview */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 mt-1.5 rounded-lg bg-slate-100/80 text-[11px] font-mono text-slate-500">
              <Globe className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-slate-400 truncate">https://</span>
              <span className="font-semibold text-[#66000E] truncate">{storeSlug || 'toko-anda'}</span>
              <span className="text-slate-400 truncate">.kroombox.com</span>
            </div>
          </div>

          {/* Business Category & WhatsApp Phone (2 columns on sm) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? 'Category' : 'Kategori Usaha'}
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
              <input
                type="tel"
                inputMode="numeric"
                value={phoneWhatsApp}
                onChange={(e) => setPhoneWhatsApp(e.target.value.replace(/\D/g, ''))}
                placeholder="081234567890"
                className="w-full px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isEn ? 'Tagline (Optional)' : 'Tagline Singkat (Opsional)'}
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={isEn ? 'e.g. Authentic handmade flavors' : 'Contoh: Cita rasa autentik khas nusantara'}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
            />
          </div>

          <p className="text-[10.5px] text-slate-400 leading-tight pt-0.5">
            {isEn
              ? 'Store information can be changed anytime in Settings.'
              : 'Informasi toko dapat diubah kapan saja melalui menu Pengaturan.'}
          </p>

          {/* Footer Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || !storeName.trim()}
              className="w-full py-2.5 bg-[#66000E] hover:bg-[#7D0012] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
                </>
              ) : (
                <>
                  <span>{isEn ? 'Save & Start' : 'Simpan & Mulai'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
