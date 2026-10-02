import React, { useState, useEffect, useRef } from 'react';
import {
  Store as StoreIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
  Loader2,
  Package,
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
  const { t, language } = useLanguage();
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
      // Tetap lanjutkan ke langkah klaim agar user tidak terblokir
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
      // Fallback: update store locally and complete
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
      className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-200"
      // Prevent outside click dismissal for mandatory onboarding
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-[#66000E] via-red-600 to-amber-500 w-full" />

        {/* Header & Step Indicator */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#66000E]/10 text-[#66000E]">
                {currentStep === 'store_info'
                  ? isEn ? 'Step 1 of 2' : 'Langkah 1 dari 2'
                  : isEn ? 'Step 2 of 2' : 'Langkah 2 dari 2'}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {currentStep === 'store_info'
                  ? isEn ? 'Store Information' : 'Informasi Toko'
                  : isEn ? 'Package Activation' : 'Aktivasi Paket'}
              </span>
            </div>

            {/* Segmented Progress Indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className={`h-1.5 w-7 rounded-full transition-colors duration-300 ${
                  currentStep === 'store_info' || currentStep === 'claim_free_plan'
                    ? 'bg-[#66000E]'
                    : 'bg-gray-200'
                }`}
              />
              <div
                className={`h-1.5 w-7 rounded-full transition-colors duration-300 ${
                  currentStep === 'claim_free_plan' ? 'bg-[#66000E]' : 'bg-gray-200'
                }`}
              />
            </div>
          </div>

          <h2 className="text-base font-bold text-gray-900 leading-tight">
            {currentStep === 'store_info'
              ? isEn ? 'Set Up Your Online Store' : 'Atur Profil Toko Online Anda'
              : isEn ? 'Claim Free Subscription' : 'Klaim Paket Berlangganan Gratis'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {currentStep === 'store_info'
              ? isEn
                ? 'Complete your basic business details. You can also edit these anytime later.'
                : 'Lengkapi identitas dasar toko Anda. Data ini dapat Anda ubah kapan saja dari dashboard.'
              : isEn
                ? 'Activate your free package to start managing products and accessing all dashboard features.'
                : 'Aktifkan paket Free untuk mulai mengelola katalog dan mengakses seluruh fitur dashboard.'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: STORE INFORMATION FORM (SKIPPABLE)                               */}
        {/* ========================================================================= */}
        {currentStep === 'store_info' && (
          <form onSubmit={handleSaveStoreInfo} className="p-6 space-y-4">
            {/* Store Name & Slug */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                {isEn ? 'Store Name' : 'Nama Toko Online'} <span className="text-[#66000E]">*</span>
              </label>
              <div className="relative">
                <StoreIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={isEn ? 'e.g. Nusantara Roastery, Batik Sekar' : 'Contoh: Dapur Nusantara, Batik Sekar'}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 transition"
                />
              </div>
              {storeName && (
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  Link toko: <span className="text-[#66000E] font-semibold">{storeSlug || 'toko-saya'}</span>.kroombox.com
                </p>
              )}
            </div>

            {/* Category & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  {isEn ? 'Business Category' : 'Kategori Usaha'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 transition cursor-pointer"
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
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  {isEn ? 'WhatsApp Phone' : 'Nomor WhatsApp'}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phoneWhatsApp}
                    onChange={(e) => setPhoneWhatsApp(e.target.value.replace(/\D/g, ''))}
                    placeholder="081234567890"
                    className="w-full pl-8 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 transition"
                  />
                </div>
              </div>
            </div>

            {/* Short Tagline */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                {isEn ? 'Short Tagline' : 'Tagline Singkat'}
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder={isEn ? 'e.g. Authentic homemade culinary flavors' : 'Contoh: Cita rasa autentik khas nusantara'}
                className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 transition"
              />
            </div>

            {/* Store Description */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                {isEn ? 'Store Description' : 'Deskripsi Singkat Toko'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isEn
                    ? 'Write a brief summary of your products and services...'
                    : 'Tuliskan deskripsi singkat mengenai produk dan keunggulan toko Anda...'
                }
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/15 transition resize-none"
              />
            </div>

            {/* Actions for Step 1 */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkipStoreInfo}
                disabled={isSavingStore}
                className="px-4 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                {isEn ? 'Skip for now' : 'Lewati untuk sekarang'}
              </button>

              <button
                type="submit"
                disabled={isSavingStore || !storeName.trim()}
                className="px-5 py-2.5 bg-[#66000E] hover:bg-[#801010] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
          <div className="p-6 space-y-5">
            {/* Free Plan SaaS Card */}
            <div className="rounded-xl border-2 border-[#66000E]/20 bg-gradient-to-b from-[#66000E]/[0.02] to-transparent p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-gray-900">
                      {isEn ? 'Free Plan' : 'Paket Free'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                      {isEn ? 'Free Forever' : 'Gratis Selamanya'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isEn
                      ? 'Essential starter toolkit to launch your digital catalog.'
                      : 'Solusi awal untuk mulai membangun dan mengelola katalog produk digital Anda.'}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-[#66000E]">
                    Rp 0
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {isEn ? '/ 1 year validity' : '/ 1 tahun aktif'}
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                {[
                  isEn ? 'Free store preview subdomain (yourstore.kroombox.com)' : 'Subdomain pratinjau toko gratis (namatoko.kroombox.com)',
                  isEn ? 'Basic product catalog up to 10 items' : 'Katalog produk dasar hingga 10 item produk',
                  isEn ? 'Full access to Kroomify CMS Dashboard' : 'Akses penuh ke Dashboard CMS Kroomify',
                  isEn ? 'Direct order management and product organization' : 'Manajemen pesanan langsung dan pengaturan produk',
                  isEn ? 'Upgradeable to Pro plans anytime' : 'Dapat di-upgrade ke paket berbayar kapan saja',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Reassurance Notice */}
            <div className="flex items-center gap-2.5 text-[11px] text-gray-500 bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isEn
                  ? 'No credit card or payment required. Immediate activation upon claim.'
                  : 'Tanpa kartu kredit atau biaya apapun. Paket langsung aktif seketika setelah diklaim.'}
              </span>
            </div>

            {/* Mandatory Action Button (NO SKIP BUTTON) */}
            <button
              type="button"
              onClick={handleClaimFreePlan}
              disabled={isClaimingPlan}
              className="w-full py-3.5 bg-[#66000E] hover:bg-[#801010] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#66000E]/20 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isClaimingPlan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEn ? 'Activating Package...' : 'Mengaktifkan Paket Free...'}</span>
                </>
              ) : (
                <>
                  <span>{isEn ? 'Claim Free Package & Open Dashboard' : 'Klaim Paket Gratis & Buka Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
