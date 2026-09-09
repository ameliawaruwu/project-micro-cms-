import React, { useState, useEffect } from 'react';
import {
  Store,
  StoreLayoutSettings,
} from '../../types';
import {
  STORE_TEMPLATES,
  StoreTemplate,
} from '../../utils/layoutConstants';
import {
  Store as StoreIcon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Tag,
  Check,
  Layout,
  MessageCircle,
  X,
} from 'lucide-react';

interface StoreLayoutSetupWizardProps {
  currentStore: Store;
  onComplete: (data: {
    storeUpdates: Partial<Store>;
    layoutSettings: StoreLayoutSettings;
  }) => void;
  onCancel?: () => void;
}

const BUSINESS_CATEGORIES = [
  { id: 'Kuliner & Minuman', label: 'Kuliner & Minuman', icon: '🥘' },
  { id: 'Fashion & Pakaian', label: 'Fashion & Pakaian', icon: '👗' },
  { id: 'Elektronik & Gadget', label: 'Elektronik & Gadget', icon: '⚡' },
  { id: 'Kriya & Kerajinan', label: 'Kriya & Kerajinan', icon: '🎋' },
  { id: 'Kecantikan & Skincare', label: 'Kecantikan & Skincare', icon: '🌸' },
  { id: 'Pertanian & Sembako', label: 'Pertanian & Sembako', icon: '🌾' },
  { id: 'Jasa & Konsultasi', label: 'Jasa & Konsultasi', icon: '💼' },
  { id: 'Lainnya', label: 'Lainnya', icon: '🛍️' },
];

export const StoreLayoutSetupWizard: React.FC<StoreLayoutSetupWizardProps> = ({
  currentStore,
  onComplete,
  onCancel,
}) => {
  // Step State: 1 = Identity, 2 = Template, 3 = Generating
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 Form Data
  const [storeName, setStoreName] = useState(currentStore.name || '');
  const [storeSlug, setStoreSlug] = useState(currentStore.slug || '');
  const [category, setCategory] = useState(currentStore.category || 'Kuliner & Minuman');
  const [tagline, setTagline] = useState(currentStore.tagline || 'Katalog resmi dan pemesanan praktis via WhatsApp.');
  const [phoneWhatsApp, setPhoneWhatsApp] = useState(currentStore.phoneWhatsApp || '081234567890');

  // Step 2 Template Selection
  const [selectedTemplate, setSelectedTemplate] = useState<StoreTemplate>(STORE_TEMPLATES[0]);

  // Step 3 Generation Progress
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState(0);

  // Auto-generate slug when storeName changes (if user hasn't typed custom slug)
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStoreSlug(autoSlug || 'toko-saya');
  };

  // Generation Simulator Effect
  useEffect(() => {
    if (currentStep !== 3) return;

    setGenerationProgress(10);
    setGenerationStage(0);

    const timer1 = setTimeout(() => {
      setGenerationProgress(35);
      setGenerationStage(1);
    }, 600);

    const timer2 = setTimeout(() => {
      setGenerationProgress(70);
      setGenerationStage(2);
    }, 1300);

    const timer3 = setTimeout(() => {
      setGenerationProgress(90);
      setGenerationStage(3);
    }, 2000);

    const timer4 = setTimeout(() => {
      setGenerationProgress(100);
      setGenerationStage(4);
    }, 2600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [currentStep]);

  const handleFinishAndEnterEditor = () => {
    const layoutSettings: StoreLayoutSettings = {
      sections: selectedTemplate.sections,
      themeStyle: 'minimal',
      primaryAccent: selectedTemplate.primaryAccent,
    };

    const storeUpdates: Partial<Store> = {
      name: storeName.trim() || currentStore.name,
      slug: storeSlug.trim() || currentStore.slug,
      category,
      tagline: tagline.trim() || selectedTemplate.tagline,
      phoneWhatsApp: phoneWhatsApp.trim() || currentStore.phoneWhatsApp,
      bannerUrl: selectedTemplate.bannerUrl,
      layoutSettings,
    };

    onComplete({ storeUpdates, layoutSettings });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* WIZARD HEADER */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                {currentStep === 1 && 'Langkah 1: Identitas & Informasi Toko'}
                {currentStep === 2 && 'Langkah 2: Pilih Template Desain Toko'}
                {currentStep === 3 && 'Langkah 3: Men-generate Website Toko'}
              </h2>
              <p className="text-xs text-gray-500">
                {currentStep === 1 && 'Atur nama, kategori, dan kontak resmi toko online UMKM Anda.'}
                {currentStep === 2 && 'Pilih gaya tampilan visual yang sesuai dengan bidang usaha Anda.'}
                {currentStep === 3 && 'Sistem sedang menyiapkan struktur, tema, dan katalog website Anda.'}
              </p>
            </div>
          </div>

          {onCancel && currentStep !== 3 && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              title="Batal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </span>
              <span className="hidden sm:inline">Nama & Info</span>
            </div>
            <div className={`h-0.5 flex-1 ${currentStep >= 2 ? 'bg-red-600' : 'bg-gray-200'}`} />

            <div className={`flex items-center gap-1.5 text-xs font-semibold ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </span>
              <span className="hidden sm:inline">Pilih Template</span>
            </div>
            <div className={`h-0.5 flex-1 ${currentStep >= 3 ? 'bg-red-600' : 'bg-gray-200'}`} />

            <div className={`flex items-center gap-1.5 text-xs font-semibold ${currentStep === 3 ? 'text-red-600' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === 3 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </span>
              <span className="hidden sm:inline">Generate Web</span>
            </div>
          </div>
        </div>

        {/* STEP CONTENT CONTAINER (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* ========================================================================= */}
          {/* STEP 1: IDENTITAS TOKO FORM                                               */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Nama Toko Online <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <StoreIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={handleStoreNameChange}
                    placeholder="Contoh: Dapur Nusantara, Batik Sekar, Toko Kopi Senja"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-900 font-medium focus:bg-white focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-500/10 transition"
                  />
                </div>
              </div>

              {/* URL Domain Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Alamat Web Toko (Domain Slug)
                </label>
                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden text-xs">
                  <span className="px-3 py-2.5 text-gray-500 bg-gray-100/80 border-r border-gray-200 font-mono font-medium select-none">
                    kroombox.id/
                  </span>
                  <input
                    type="text"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="nama-toko-anda"
                    className="flex-1 px-3 py-2.5 bg-transparent text-sm font-mono text-gray-900 font-semibold focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Tautan ini yang akan dibagikan ke pembeli di WhatsApp & media sosial.
                </p>
              </div>

              {/* Kategori Bisnis */}
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Kategori Usaha
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition cursor-pointer text-left ${
                        category === cat.id
                          ? 'border-red-600 bg-red-50 text-red-700 font-semibold ring-1 ring-red-600'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slogan & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                    Slogan / Tagline Toko
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Slogan atau deskripsi singkat..."
                      className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp Toko
                  </label>
                  <div className="relative">
                    <MessageCircle className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phoneWhatsApp}
                      onChange={(e) => setPhoneWhatsApp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PILIH TEMPLATE TOKO GRID                                          */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Pilihan Template Siap Pakai
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Setiap template sudah dilengkapi susunan section, banner tematik, dan tombol pesan instan.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {STORE_TEMPLATES.length} Template
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STORE_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`group relative rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col ${
                        isSelected
                          ? 'border-red-600 ring-2 ring-red-600/30 shadow-md bg-red-50/20'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-16/9 w-full bg-gray-100 overflow-hidden">
                        <img
                          src={tmpl.previewImage}
                          alt={tmpl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-white/95 backdrop-blur-xs text-[10px] font-bold text-gray-900 shadow-xs">
                            {tmpl.badge}
                          </span>
                        </div>

                        {/* Selected Checkmark Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Accent Color Dot */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-white text-[11px] font-medium">
                          <span
                            className="w-3 h-3 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: tmpl.primaryAccent }}
                          />
                          <span className="drop-shadow-xs">{tmpl.category}</span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 leading-tight">
                            {tmpl.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {tmpl.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          <span className="text-gray-500 font-medium">
                            {tmpl.sections.length} Section Bawaan
                          </span>
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              isSelected ? 'text-red-600 font-bold' : 'text-gray-600 group-hover:text-red-600'
                            }`}
                          >
                            {isSelected ? 'Terpilih ✓' : 'Pilih Template'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: GENERATE WEB ANIMATION                                            */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="max-w-md mx-auto py-6 flex flex-col items-center text-center space-y-6">
              
              {/* Spinner & Ready Icon */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-red-100 border-t-red-600 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center text-red-600">
                  {generationProgress >= 100 ? (
                    <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-in zoom-in" />
                  ) : (
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {generationProgress >= 100
                    ? '🎉 Website Toko Berhasil Dibuat!'
                    : 'Sedang Membuat Website Toko Anda...'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Template <span className="font-semibold text-gray-800">{selectedTemplate.name}</span> siap dipasang untuk <span className="font-semibold text-gray-800">{storeName || 'Toko Anda'}</span>.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-gray-600">
                  <span>Proses Pembuatan</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>

              {/* Stages Checklist */}
              <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100 text-left space-y-2.5 text-xs">
                <div className={`flex items-center gap-2.5 transition-colors ${generationStage >= 1 ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStage >= 1 ? 'text-emerald-600' : 'text-gray-300'}`} />
                  <span>Membangun struktur layout responsif (Mobile & Desktop)</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${generationStage >= 2 ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStage >= 2 ? 'text-emerald-600' : 'text-gray-300'}`} />
                  <span>Menerapkan warna aksen ({selectedTemplate.primaryAccent}) & banner cover</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${generationStage >= 3 ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStage >= 3 ? 'text-emerald-600' : 'text-gray-300'}`} />
                  <span>Menyinkronkan katalog produk & tombol checkout WhatsApp</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${generationStage >= 4 ? 'text-emerald-700 font-semibold' : 'text-gray-400'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${generationStage >= 4 ? 'text-emerald-600' : 'text-gray-300'}`} />
                  <span>Website toko aktif dan siap diatur di Editor Layout</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* WIZARD FOOTER CONTROLS */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Info Toko</span>
              </button>
            )}
            {currentStep === 1 && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Batal
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => {
                  if (!storeName.trim()) {
                    alert('Mohon isi nama toko Anda terlebih dahulu.');
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <span>Lanjut Pilih Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Web Toko Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                disabled={generationProgress < 100}
                onClick={handleFinishAndEnterEditor}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                  generationProgress >= 100
                    ? 'bg-red-600 hover:bg-red-700 text-white active:scale-98'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>Masuk ke Editor Layout Toko</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
