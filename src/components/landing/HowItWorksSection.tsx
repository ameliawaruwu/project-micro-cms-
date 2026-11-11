import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Store,
  PackagePlus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Reveal, swapPanel, useAutoAdvance } from './landingMotion';

interface HowItWorksSectionProps {
  onNavigateRegister: () => void;
}

const STEP_IDS = [1, 2, 3] as const;
type StepId = (typeof STEP_IDS)[number];

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onNavigateRegister,
}) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const autoplay = useAutoAdvance(STEP_IDS, activeStep, setActiveStep);

  const pickStep = (id: StepId) => {
    autoplay.stop();
    setActiveStep(id);
  };

  const steps = [
    {
      id: 1 as const,
      num: '01',
      title: t('how_step_1_title', 'Buat Toko'),
      desc: t('how_step_1_desc', 'Atur nama usaha dan nomor WhatsApp toko Anda dalam hitungan menit.'),
      icon: Store,
    },
    {
      id: 2 as const,
      num: '02',
      title: t('how_step_2_title', 'Tambah Produk'),
      desc: t('how_step_2_desc', 'Upload foto dari HP, tentukan harga, dan atur varian barang.'),
      icon: PackagePlus,
    },
    {
      id: 3 as const,
      num: '03',
      title: t('how_step_3_title', 'Terima Pesanan'),
      desc: t('how_step_3_desc', 'Bagikan link toko, terima pembayaran otomatis lewat QRIS & Bank.'),
      icon: ShoppingBag,
    },
  ];

  const registerButton = (className: string) => (
    <motion.button
      type="button"
      onClick={onNavigateRegister}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`group w-full inline-flex items-center justify-center gap-2 px-5 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer ${className}`}
    >
      <span>{t('how_cta_register', 'Buat Toko Sekarang — Gratis')}</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </motion.button>
  );

  return (
    <section
      id="cara-kerja"
      ref={autoplay.ref}
      className="min-h-[calc(100svh-124px)] min-h-[calc(100dvh-124px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center py-6 sm:py-8 lg:py-4 xl:py-8 bg-white border-b border-[#E8DDDE] scroll-mt-16 sm:scroll-mt-20 font-sans relative"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Section Header */}
        <Reveal className="text-center max-w-2xl mx-auto mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-medium mb-1.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#66000E]" />
            <span>{t('how_section_badge', 'Alur Praktis')}</span>
          </div>
          <h2 className="text-lg sm:text-2xl lg:text-2xl font-semibold text-[#241A1A] tracking-tight leading-snug">
            {t('how_section_title', 'Mulai Jualan dalam 3 Langkah')}
          </h2>
        </Reveal>

        {/* Mobile Step Selector Tabs (Only on Mobile < lg) */}
        <div className="lg:hidden grid grid-cols-3 gap-1.5 mb-3">
          {steps.map((s) => {
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => pickStep(s.id)}
                className={`py-2 px-1.5 rounded-xl text-center transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#66000E] text-white border-[#66000E] shadow-xs'
                    : 'bg-[#FAF7F7] text-[#5F5652] border-[#E8DDDE]'
                }`}
              >
                <div className="text-[10px] font-medium opacity-85">{t('how_step_label', 'Langkah')} {s.num}</div>
                <div className="text-xs font-medium truncate mt-0.5">{s.title}</div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-stretch max-w-[1100px] xl:max-w-6xl mx-auto">

          {/* Left Column: Interactive Step Buttons (Desktop Only) */}
          <Reveal className="hidden lg:flex lg:col-span-5 flex-col justify-between gap-2.5">
            <div className="space-y-2.5">
              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = activeStep === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickStep(s.id)}
                    className={`relative w-full p-3 xl:p-3.5 rounded-2xl border text-left transition-colors duration-200 cursor-pointer flex items-start gap-3 overflow-hidden ${
                      isActive
                        ? 'bg-[#FAF7F7] border-[#66000E] shadow-sm'
                        : 'bg-white border-[#E8DDDE] hover:bg-[#FAF7F7] hover:border-[#66000E]/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 xl:w-10 xl:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-[#66000E] text-white shadow-xs' : 'bg-[#F5E8EA] text-[#66000E]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={`text-[11px] font-bold font-mono ${isActive ? 'text-[#66000E]' : 'text-[#857C76]'}`}>
                        {t('how_step_label', 'Langkah')} {s.num}
                      </span>
                      <h3 className="text-sm xl:text-base font-bold text-[#241A1A]">{s.title}</h3>
                      <p className="text-xs text-[#5F5652] leading-relaxed mt-0.5">{s.desc}</p>
                    </div>

                    {/* Bilah waktu putar-otomatis pada langkah aktif */}
                    {isActive && autoplay.running && (
                      <motion.span
                        key={`timer-${s.id}`}
                        className="absolute bottom-0 left-0 h-0.5 bg-[#66000E]"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {registerButton('h-11')}
          </Reveal>

          {/* Right Column: Live Preview for the Selected Step */}
          <Reveal className="lg:col-span-7 flex flex-col justify-between" delay={0.15}>
            <div className="p-3.5 sm:p-4 xl:p-5 rounded-2xl bg-[#FAF7F7] border border-[#E8DDDE] shadow-md w-full flex flex-col justify-between gap-3 relative overflow-hidden text-[#241A1A] min-h-[250px]">

              <AnimatePresence mode="wait" initial={false}>
                {activeStep === 1 && (
                  <motion.div key="step-1" {...swapPanel} className="space-y-2.5 sm:space-y-3">
                    <PreviewHeader num={1} title={t('store_information', 'Pengaturan Informasi Toko')}>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        {t('how_preview_instant', 'Aktif Instan')}
                      </span>
                    </PreviewHeader>

                    <div className="space-y-2 bg-white p-2.5 sm:p-3 rounded-xl border border-[#E8DDDE]">
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#857C76] uppercase tracking-wider">{t('how_preview_biz_name', 'Nama Usaha Anda')}</span>
                        <p className="font-bold text-xs sm:text-sm text-[#241A1A] mt-0.5">Batik Nusantara Heritage</p>
                      </div>
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#857C76] uppercase tracking-wider">{t('how_preview_store_link', 'Tautan Toko Online')}</span>
                        <div className="flex items-center justify-between p-1.5 sm:p-2 mt-0.5 rounded-lg bg-[#FAF7F7] border border-[#E8DDDE] text-[11px] sm:text-xs font-mono text-[#66000E] font-semibold">
                          <span>batiknusantara.lapakq.com</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#66000E]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div key="step-2" {...swapPanel} className="space-y-2.5 sm:space-y-3">
                    <PreviewHeader num={2} title={t('how_step_2_title', 'Tambah Produk')} />

                    <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#E8DDDE] flex items-center gap-3 sm:gap-4">
                      <img
                        src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=140&auto=format&fit=crop&q=80"
                        alt="Batik Parang"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[#E8DDDE] shrink-0"
                      />
                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <p className="font-bold text-xs sm:text-sm text-[#241A1A] truncate">Batik Parang Tulis Solo</p>
                        <p className="text-xs font-bold text-[#66000E]">Rp 175.000</p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F7] border border-[#E8DDDE] text-[#5F5652]">
                            M, L, XL
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {t('stock', 'Stok')}: 24
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#E8DDDE] flex items-center gap-2 text-[11px] sm:text-xs text-[#241A1A]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#66000E] shrink-0" />
                      <span>{t('how_preview_shipping_calc', 'Otomatis hitung ongkir kurir berdasarkan berat (gram)')}</span>
                    </div>
                  </motion.div>
                )}

                {activeStep === 3 && (
                  <motion.div key="step-3" {...swapPanel} className="space-y-2.5 sm:space-y-3">
                    <PreviewHeader num={3} title={t('how_step_3_title', 'Terima Pesanan')}>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        QRIS
                      </span>
                    </PreviewHeader>

                    <div className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#E8DDDE] flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#857C76]">#INV-2026-092</span>
                        <p className="font-bold text-xs sm:text-sm text-[#241A1A]">Dina Rahayu (2 items)</p>
                        <p className="text-[10px] sm:text-[11px] text-emerald-800 font-semibold">
                          ✓ {t('how_preview_qris_paid', 'Pembayaran QRIS Berhasil')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] sm:text-[10px] text-[#857C76]">{t('total_payment', 'Total')}</span>
                        <p className="font-bold text-xs sm:text-sm text-[#66000E]">Rp 350.000</p>
                      </div>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-white border border-[#E8DDDE] flex items-center gap-2 text-[11px] sm:text-xs text-[#5F5652]">
                      <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{t('how_preview_wa_alert', 'Notifikasi order otomatis terkirim ke WhatsApp Anda & pembeli')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Indikator langkah */}
              <div className="pt-2 border-t border-[#E8DDDE] flex items-center gap-3 text-[11px] sm:text-xs text-[#5F5652]">
                <span className="shrink-0">{t('how_step_label', 'Langkah')} {activeStep} / 3</span>
                <div className="flex-1 h-1 rounded-full bg-[#E8DDDE] overflow-hidden">
                  <motion.div
                    className="h-full bg-[#66000E] rounded-full"
                    animate={{ width: `${(activeStep / STEP_IDS.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile CTA Button (Only on Mobile < lg) */}
            <div className="pt-3 lg:hidden">{registerButton('h-[46px]')}</div>
          </Reveal>

        </div>
      </div>
    </section>
  );
};

/** Judul kartu pratinjau: nomor langkah, judul, dan lencana opsional di kanan. */
const PreviewHeader: React.FC<{ num: number; title: string; children?: React.ReactNode }> = ({
  num,
  title,
  children,
}) => (
  <div className="flex items-center justify-between pb-2 border-b border-[#E8DDDE]">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs">
        {num}
      </div>
      <span className="font-bold text-xs sm:text-sm">{title}</span>
    </div>
    {children}
  </div>
);
