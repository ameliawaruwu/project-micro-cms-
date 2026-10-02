import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Check,
  Loader2,
  Globe,
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
}

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({
  isOpen,
  user,
  store,
  onComplete,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Step 1: 'store_info' (skippable)
  // Step 2: 'claim_free_plan' (mandatory / not skippable)
  const [currentStep, setCurrentStep] = useState<'store_info' | 'claim_free_plan'>('store_info');

  // Form state for store information
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [storeSlug, setStoreSlug] = useState('');

  // Loading states
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [isClaimingPlan, setIsClaimingPlan] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Initialize or restore state when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedStep = localStorage.getItem('kroomify_onboarding_step');
      if (savedStep === 'claim_free_plan') {
        setCurrentStep('claim_free_plan');
      } else {
        setCurrentStep('store_info');
      }

      if (store) {
        const isPlaceholder = !store.name || store.name.startsWith('Toko usr_') || store.name.startsWith('Toko ');
        setStoreName(isPlaceholder ? (store.name || '') : store.name);
        setCategory(store.category || '');
        setPhoneWhatsApp(store.phoneWhatsApp || user?.phoneWhatsApp || '');
        setTagline(store.tagline || '');
        setDescription(store.description || '');
        setStoreSlug(store.slug || (store.name ? store.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''));
      } else if (user) {
        setStoreName(`Toko ${user.name}`);
        setStoreSlug(`toko-${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
        setPhoneWhatsApp(user.phoneWhatsApp || '');
      }

      if (currentStep === 'store_info') {
        setTimeout(() => nameInputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, store?.id, user?.id]);

  const handleNameChange = (val: string) => {
    setStoreName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStoreSlug(autoSlug || 'toko-saya');
  };

  // Skip Step 1 -> Go to Step 2
  const handleSkipStoreInfo = () => {
    localStorage.setItem('kroomify_onboarding_step', 'claim_free_plan');
    setCurrentStep('claim_free_plan');
  };

  // Submit Step 1 -> Save store info and advance to Step 2
  const handleSaveStoreInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSavingStore(true);
    try {
      const finalName = storeName.trim() || store?.name || `Toko ${user?.name || 'UMKM'}`;
      const finalSlug = storeSlug.trim() || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      if (store?.id) {
        await storeService.updateStore(
          store.id,
          {
            name: finalName,
            slug: finalSlug,
            category: category.trim(),
            phoneWhatsApp: phoneWhatsApp.trim(),
            tagline: tagline.trim(),
            description: description.trim(),
            onboarding: {
              ...store.onboarding,
              storeNameSet: true,
            },
          },
          user?.id
        );
      } else {
        await storeService.createStore({
          merchantId: user.id,
          name: finalName,
          slug: finalSlug,
          category: category.trim(),
          phoneWhatsApp: phoneWhatsApp.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          plan: '',
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
      localStorage.setItem('kroomify_onboarding_step', 'claim_free_plan');
      setCurrentStep('claim_free_plan');
    } finally {
      setIsSavingStore(false);
    }
  };

  // Step 2: Claim Free Package (Mandatory)
  const handleClaimFreePlan = async () => {
    if (!user?.id) return;

    setIsClaimingPlan(true);
    try {
      let activeStore = store;
      if (!activeStore?.id) {
        const finalName = storeName.trim() || `Toko ${user.name || 'UMKM'}`;
        const finalSlug = storeSlug.trim() || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        activeStore = await storeService.createStore({
          merchantId: user.id,
          name: finalName,
          slug: finalSlug,
          category: category.trim(),
          phoneWhatsApp: phoneWhatsApp.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          plan: 'free',
          onboarding: {
            storeNameSet: true,
            productUploaded: false,
            paymentConnected: false,
          },
        });
      }

      const now = new Date();
      const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      const invoiceNumber = `INV-FREE-${Date.now().toString().slice(-6)}`;

      // 1. Record free subscription in database
      await billingPlanService.recordSubscription({
        storeId: activeStore.id,
        storeName: activeStore.name || storeName || `Toko ${user?.name || 'UMKM'}`,
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

      // 2. Update store record to active free plan
      const updated = await storeService.updateStore(
        activeStore.id,
        {
          plan: 'free',
          onboarding: {
            ...activeStore.onboarding,
            storeNameSet: true,
          },
        },
        user?.id
      );

      // 3. Clear onboarding flags
      localStorage.removeItem('kroomify_onboarding_pending');
      localStorage.removeItem('kroomify_onboarding_step');

      // 4. Complete flow
      onComplete(updated);
    } catch (err) {
      console.error('Error claiming free plan:', err);
      const fallbackStore = { ...(store || {}), plan: 'free' } as Store;
      localStorage.removeItem('kroomify_onboarding_pending');
      localStorage.removeItem('kroomify_onboarding_step');
      onComplete(fallbackStore);
    } finally {
      setIsClaimingPlan(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[95] bg-black/50 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Accent */}
        <div className="h-1 bg-gradient-to-r from-[#66000E] via-[#9E1228] to-[#66000E] w-full" />

        {/* Clean Minimal Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#66000E]/8 text-[#66000E]">
              {currentStep === 'store_info'
                ? isEn ? 'Step 1 of 2' : 'Langkah 1 dari 2'
                : isEn ? 'Step 2 of 2' : 'Langkah 2 dari 2'}
            </span>

            {/* Micro 2-Segment Indicator */}
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

          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {currentStep === 'store_info'
              ? isEn ? 'Set Up Your Store' : 'Informasi Toko Online'
              : isEn ? 'Activate Free Plan' : 'Klaim Paket Berlangganan'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentStep === 'store_info'
              ? isEn
                ? 'Fill in your basic store details. You can edit this anytime.'
                : 'Lengkapi profil dasar toko Anda. Data ini dapat diubah kapan saja.'
              : isEn
                ? 'Claim your free plan to unlock the dashboard and start selling.'
                : 'Aktifkan paket Free untuk mulai mengelola katalog dan pesanan.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: STORE INFORMATION FORM (SKIPPABLE)                               */}
        {/* ========================================================================= */}
        {currentStep === 'store_info' && (
          <form onSubmit={handleSaveStoreInfo} className="p-6 space-y-3.5">
            {/* Store Name & Link Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? 'Store Name' : 'Nama Toko'} <span className="text-[#66000E]">*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                required
                value={storeName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={isEn ? 'e.g. Nusantara Roastery, Batik Sekar' : 'Contoh: Dapur Nusantara, Batik Sekar'}
                className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-4 focus:ring-[#66000E]/10 transition-all"
              />

              {/* Integrated SaaS URL Preview */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-lg bg-slate-100/70 text-[11px] font-mono text-slate-500">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-400 truncate">https://</span>
                <span className="font-semibold text-[#66000E] truncate">{storeSlug || 'toko-saya'}</span>
                <span className="text-slate-400 truncate">.kroombox.com</span>
              </div>
            </div>

            {/* Category & WhatsApp (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isEn ? 'Business Category' : 'Kategori Usaha'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-4 focus:ring-[#66000E]/10 transition-all cursor-pointer"
                >
                  <option value="">{isEn ? '-- Select Category --' : '-- Pilih Kategori --'}</option>
                  {UMKM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isEn ? 'WhatsApp Phone' : 'Nomor WhatsApp'}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneWhatsApp}
                  onChange={(e) => setPhoneWhatsApp(e.target.value.replace(/\D/g, ''))}
                  placeholder="081234567890"
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-4 focus:ring-[#66000E]/10 transition-all"
                />
              </div>
            </div>

            {/* Short Tagline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? 'Tagline' : 'Tagline Singkat'}
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder={isEn ? 'e.g. Authentic homemade culinary flavors' : 'Contoh: Cita rasa autentik khas nusantara'}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-4 focus:ring-[#66000E]/10 transition-all"
              />
            </div>

            {/* Store Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isEn ? 'Description' : 'Deskripsi Toko'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isEn
                    ? 'Write a brief summary of your products and services...'
                    : 'Tuliskan ringkasan produk atau keunggulan usaha Anda...'
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-4 focus:ring-[#66000E]/10 transition-all resize-none"
              />
            </div>

            {/* Actions for Step 1 */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkipStoreInfo}
                disabled={isSavingStore}
                className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                {isEn ? 'Skip for now' : 'Lewati untuk sekarang'}
              </button>

              <button
                type="submit"
                disabled={isSavingStore || !storeName.trim()}
                className="px-5 py-2.5 bg-[#66000E] hover:bg-[#7D0012] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        {/* STEP 2: CLAIM FREE PACKAGE (MANDATORY / NOT SKIPPABLE)                    */}
        {/* ========================================================================= */}
        {currentStep === 'claim_free_plan' && (
          <div className="p-6 space-y-4">
            {/* Elevated Free Plan Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/70 to-white p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
                      {isEn ? 'Free Plan' : 'Paket Free'}
                    </span>
                    <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {isEn ? 'Free Forever' : 'Gratis Selamanya'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isEn
                      ? 'Essential starter tools to launch and manage your digital store.'
                      : 'Layanan awal untuk mengelola katalog produk dan operasional toko.'}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-[#66000E] tracking-tight">
                    Rp 0
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {isEn ? '/ 1 year' : '/ tahun'}
                  </div>
                </div>
              </div>

              {/* Minimal Clean Feature List */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                {[
                  isEn ? 'Store subdomain (namatoko.kroombox.com)' : 'Subdomain toko resmi (namatoko.kroombox.com)',
                  isEn ? 'Product catalog up to 10 items' : 'Kapasitas katalog hingga 10 produk',
                  isEn ? 'Full access to CMS & order management' : 'Akses penuh dashboard & manajemen pesanan',
                  isEn ? 'Upgradeable to custom domain anytime' : 'Bebas upgrade ke domain sendiri kapan saja',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro Reassurance */}
            <p className="text-center text-[11px] text-slate-400">
              {isEn
                ? 'No credit card or payment required. Immediate activation.'
                : 'Tanpa biaya & tanpa kartu kredit. Aktif langsung setelah diklaim.'}
            </p>

            {/* Primary Action Button (Mandatory) */}
            <button
              type="button"
              onClick={handleClaimFreePlan}
              disabled={isClaimingPlan}
              className="w-full py-3 bg-[#66000E] hover:bg-[#7D0012] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        )}
      </div>
    </div>
  );
};
