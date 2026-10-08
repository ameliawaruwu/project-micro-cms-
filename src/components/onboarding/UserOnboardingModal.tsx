import React, { useState, useEffect, useRef } from 'react';
import {
  Store as StoreIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
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
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Step 1: 'store_info' (mandatori)
  // Step 2: 'claim_free_plan' (konfirmasi paket gratis)
  const [currentStep, setCurrentStep] = useState<'store_info' | 'claim_free_plan'>('store_info');

  // Form state
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [category, setCategory] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');
  const [tagline, setTagline] = useState('');

  // Loading states
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [isClaimingPlan, setIsClaimingPlan] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const savedStep = localStorage.getItem('kroomify_onboarding_step');
      if (savedStep === 'claim_free_plan') {
        setCurrentStep('claim_free_plan');
      } else {
        setCurrentStep('store_info');
      }

      // Jangan menawarkan nama toko otomatis: mulai dengan input kosong
      setStoreName('');
      setStoreSlug('');

      if (store) {
        setCategory(store.category && store.category !== 'Bisnis UMKM' ? store.category : '');
        setPhoneWhatsApp(store.phoneWhatsApp || user?.phoneWhatsApp || '');
        setTagline(store.tagline || '');
      } else if (user) {
        setPhoneWhatsApp(user.phoneWhatsApp || '');
      }

      if (currentStep === 'store_info') {
        setTimeout(() => nameInputRef.current?.focus(), 150);
      }
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

  // Submit Langkah 1: Simpan Informasi Toko & Lanjut ke Langkah 2 Konfirmasi Paket
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

      if (store?.id) {
        await storeService.updateStore(
          store.id,
          {
            name: finalName,
            slug: finalSlug,
            category: category.trim(),
            phoneWhatsApp: cleanPhone,
            tagline: tagline.trim(),
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
        await storeService.createStore({
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

      localStorage.setItem('kroomify_onboarding_step', 'claim_free_plan');
      setCurrentStep('claim_free_plan');
    } catch (err) {
      console.warn('Gagal menyimpan profil toko:', err);
      // Lanjut ke langkah klaim agar user tidak terblokir
      localStorage.setItem('kroomify_onboarding_step', 'claim_free_plan');
      setCurrentStep('claim_free_plan');
    } finally {
      setIsSavingStore(false);
    }
  };

  // Submit Langkah 2: Konfirmasi / Klaim Paket Utama Gratis
  const handleClaimFreePlan = async () => {
    const targetStoreId = store?.id;
    if (!targetStoreId && !user?.id) return;

    setIsClaimingPlan(true);
    try {
      const currentStoreRecord = store?.id ? store : await storeService.getActiveStore(user?.id);
      const storeIdToUse = currentStoreRecord?.id || targetStoreId || '';
      const storeNameToUse = currentStoreRecord?.name || storeName || `Toko ${user?.name || 'UMKM'}`;

      const now = new Date();
      const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      const invoiceNumber = `INV-FREE-${Date.now().toString().slice(-6)}`;

      // 1. Catat langganan paket gratis di database
      await billingPlanService.recordSubscription({
        storeId: storeIdToUse,
        storeName: storeNameToUse,
        planId: 'PLN001',
        planName: 'Paket Free',
        cycle: 'yearly',
        amount: 0,
        status: 'paid',
        paymentMethod: 'Aktivasi Gratis',
        invoiceNumber,
        paidAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      });

      // 2. Perbarui data toko menjadi paket free aktif
      let updatedStore: Store;
      if (storeIdToUse) {
        updatedStore = await storeService.updateStore(
          storeIdToUse,
          {
            plan: 'free',
            onboarding: {
              productUploaded: currentStoreRecord?.onboarding?.productUploaded ?? false,
              paymentConnected: false,
              ...(currentStoreRecord?.onboarding || {}),
              storeNameSet: true,
            },
          },
          user?.id
        );
      } else {
        updatedStore = {
          ...(store || {}),
          name: storeName.trim(),
          plan: 'free',
          onboarding: {
            storeNameSet: true,
            productUploaded: Boolean(store?.onboarding?.productUploaded),
            paymentConnected: false,
          },
        } as Store;
      }

      // 3. Bersihkan flag onboarding agar tidak muncul lagi
      localStorage.removeItem('kroomify_onboarding_pending');
      localStorage.removeItem('kroomify_onboarding_step');
      sessionStorage.removeItem('kroomify_store_info_dismissed');
      if (user?.id) {
        localStorage.removeItem(`kroomify_store_info_dismissed_${user.id}`);
        localStorage.removeItem(`kroomify_onboarding_pending_${user.id}`);
      }

      // 4. Selesaikan proses
      onComplete(updatedStore);
    } catch (err) {
      console.error('Error claiming free plan:', err);
      const fallback = {
        ...(store || {}),
        name: storeName.trim() || store?.name,
        plan: 'free',
        onboarding: {
          storeNameSet: true,
          productUploaded: Boolean(store?.onboarding?.productUploaded),
          paymentConnected: false,
        },
      } as Store;
      localStorage.removeItem('kroomify_onboarding_pending');
      localStorage.removeItem('kroomify_onboarding_step');
      if (user?.id) {
        localStorage.removeItem(`kroomify_onboarding_pending_${user.id}`);
      }
      onComplete(fallback);
    } finally {
      setIsClaimingPlan(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-sans select-none animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Maroon Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-[#66000E] via-[#9E1228] to-[#66000E] w-full shrink-0" />

        {/* Header & Step Indicator */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#66000E]/10 text-[#66000E]">
                {currentStep === 'store_info'
                  ? isEn ? 'Step 1 of 2' : 'Langkah 1 dari 2'
                  : isEn ? 'Step 2 of 2' : 'Langkah 2 dari 2'}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentStep === 'store_info'
                  ? isEn ? 'Store Information' : 'Informasi Toko'
                  : isEn ? 'Plan Confirmation' : 'Konfirmasi Paket'}
              </span>
            </div>

            {/* Segmented Progress Indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
                  currentStep === 'store_info' || currentStep === 'claim_free_plan'
                    ? 'bg-[#66000E]'
                    : 'bg-slate-200'
                }`}
              />
              <div
                className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
                  currentStep === 'claim_free_plan' ? 'bg-[#66000E]' : 'bg-slate-200'
                }`}
              />
            </div>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            {currentStep === 'store_info'
              ? isEn ? 'Set Up Your Online Store' : 'Informasi Toko Online'
              : isEn ? 'Confirm Free Main Plan' : 'Konfirmasi Paket Utama Gratis'}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {currentStep === 'store_info'
              ? isEn
                ? 'Enter your store details to get started.'
                : 'Lengkapi identitas dasar toko Anda untuk memulai.'
              : isEn
                ? 'Confirm your free package to activate and access your store catalog.'
                : 'Konfirmasi paket gratis ini untuk langsung mengaktifkan dan mengelola toko Anda.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* LANGKAH 1: FORM INFORMASI TOKO ONLINE (MANDATORI / TANPA TOMBOL LEWATI)   */}
        {/* ========================================================================= */}
        {currentStep === 'store_info' && (
          <form onSubmit={handleSaveStoreInfo} className="p-5 space-y-3 overflow-y-auto">
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

            {/* Kategori Usaha & WhatsApp Phone */}
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
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneWhatsApp}
                    onChange={(e) => setPhoneWhatsApp(e.target.value.replace(/\D/g, ''))}
                    placeholder="081234567890"
                    className="w-full pl-8 pr-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
                  />
                </div>
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

            {/* Footer Action Button (Tanpa Tombol Lewati) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingStore || !storeName.trim()}
                className="w-full py-2.5 bg-[#66000E] hover:bg-[#7D0012] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSavingStore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isEn ? 'Save & Continue' : 'Simpan & Lanjutkan'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 2: KONFIRMASI PAKET UTAMA GRATIS (FREE PLAN CONFIRMATION)         */}
        {/* ========================================================================= */}
        {currentStep === 'claim_free_plan' && (
          <div className="p-5 space-y-4 overflow-y-auto">
            {/* Free Plan Card */}
            <div className="rounded-xl border border-[#66000E]/20 bg-gradient-to-b from-[#66000E]/[0.03] to-slate-50/50 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {isEn ? 'Free Plan' : 'Paket Free'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                      {isEn ? 'Free Forever' : 'Gratis Selamanya'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {isEn
                      ? 'Essential starter toolkit to launch your digital catalog.'
                      : 'Solusi awal untuk mulai membangun dan mengelola katalog produk digital Anda.'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-[#66000E]">
                    Rp 0
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {isEn ? '/ 1 year validity' : '/ 1 tahun aktif'}
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {[
                  isEn ? 'Free store preview subdomain (.kroombox.com)' : 'Subdomain toko gratis (.kroombox.com)',
                  isEn ? 'Basic product catalog management' : 'Pengelolaan katalog dan produk toko',
                  isEn ? 'Full access to Kroomify CMS Dashboard' : 'Akses penuh ke Dashboard CMS Kroomify',
                  isEn ? 'Direct order and operational management' : 'Manajemen pesanan dan operasional toko',
                  isEn ? 'Upgradeable to Pro plans anytime' : 'Dapat di-upgrade ke paket berbayar kapan saja',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[11.5px]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reassurance Notice */}
            <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isEn
                  ? 'No credit card or payment required. Immediate activation upon claim.'
                  : 'Tanpa biaya atau kartu kredit. Paket langsung aktif setelah dikonfirmasi.'}
              </span>
            </div>

            {/* Mandatory Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleClaimFreePlan}
                disabled={isClaimingPlan}
                className="w-full py-2.5 bg-[#66000E] hover:bg-[#7D0012] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isClaimingPlan ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isEn ? 'Activating Package...' : 'Mengaktifkan Paket Free...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isEn ? 'Claim Free Package & Open Dashboard' : 'Klaim Paket Gratis & Buka Dashboard'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
