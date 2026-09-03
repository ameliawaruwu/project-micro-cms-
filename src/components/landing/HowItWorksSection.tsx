import React, { useState } from 'react';
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

interface HowItWorksSectionProps {
  onNavigateRegister: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onNavigateRegister,
}) => {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      id: 1,
      num: '01',
      title: t('how_step_1_title', 'Buat Toko'),
      desc: t('how_step_1_desc', 'Atur nama usaha dan nomor WhatsApp toko Anda dalam hitungan menit.'),
      icon: Store,
      badge: t('how_step_1_badge', 'Cukup 1 Menit'),
    },
    {
      id: 2,
      num: '02',
      title: t('how_step_2_title', 'Tambah Produk'),
      desc: t('how_step_2_desc', 'Upload foto dari HP, tentukan harga, dan atur varian barang.'),
      icon: PackagePlus,
      badge: t('how_step_2_badge', 'Langsung dari Kamera HP'),
    },
    {
      id: 3,
      num: '03',
      title: t('how_step_3_title', 'Terima Pesanan'),
      desc: t('how_step_3_desc', 'Bagikan link toko, terima pembayaran otomatis lewat QRIS & Bank.'),
      icon: ShoppingBag,
      badge: t('how_step_3_badge', 'QRIS & Resi Otomatis'),
    },
  ];

  return (
    <section 
      id="cara-kerja" 
      className="min-h-[calc(100svh-124px)] min-h-[calc(100dvh-124px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center py-10 sm:py-14 lg:py-20 bg-white border-b border-[#E8DDDE] scroll-mt-16 sm:scroll-mt-20 font-sans relative"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-medium mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#66000E]" />
            <span>{t('how_section_badge', 'Alur Praktis')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#241A1A] tracking-tight leading-snug mb-1.5">
            {t('how_section_title', 'Mulai Jualan dalam 3 Langkah')}
          </h2>
          <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal max-w-md mx-auto">
            {t('how_section_desc', 'Sederhana dan langsung siap pakai tanpa perlu keahlian teknis.')}
          </p>
        </div>

        {/* Mobile Step Selector Tabs (Only on Mobile < lg) */}
        <div className="lg:hidden grid grid-cols-3 gap-1.5 mb-3.5">
          {steps.map((s) => {
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStep(s.id)}
                className={`py-2 px-1.5 rounded-xl text-center transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#66000E] text-white border-[#66000E] shadow-xs'
                    : 'bg-[#FAF7F7] text-[#5F5652] border-[#E8DDDE]'
                }`}
              >
                <div className="text-[10px] font-medium opacity-85">{t('how_step_label', 'Langkah')} {s.num}</div>
                <div className="text-xs font-medium truncate mt-0.5">{s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}</div>
              </button>
            );
          })}
        </div>

        {/* 2-Column Interactive Steps + Dynamic Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Left Column: Interactive Step Buttons (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-2.5 sm:space-y-3">
            <div className="space-y-2.5 sm:space-y-3">
              {steps.map((s) => {
                const Icon = s.icon;
                const isActive = activeStep === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveStep(s.id)}
                    className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                      isActive
                        ? 'bg-[#FAF7F7] border-[#66000E] shadow-sm ring-1 ring-[#66000E]'
                        : 'bg-white border-[#E8DDDE] hover:bg-[#FAF7F7] hover:border-[#66000E]/40'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#66000E] text-white shadow-xs'
                          : 'bg-[#F5E8EA] text-[#66000E]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5 sm:mb-1">
                        <span className={`text-xs font-bold font-mono ${isActive ? 'text-[#66000E]' : 'text-[#857C76]'}`}>
                          {t('how_step_label', 'Langkah')} {s.num}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#66000E] border border-[#E8DDDE]">
                          {s.badge}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#241A1A]">
                        {s.title}
                      </h3>
                      <p className="text-xs text-[#5F5652] leading-relaxed mt-0.5">
                        {s.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Register Action */}
            <div className="pt-1 sm:pt-2">
              <button
                onClick={onNavigateRegister}
                className="w-full inline-flex items-center justify-center gap-2 h-[46px] sm:h-[48px] px-6 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-sm shadow-xs transition cursor-pointer active:scale-[0.98]"
              >
                <span>{t('how_cta_register', 'Buat Toko Sekarang — Gratis')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Live Preview Screen for the Selected Step */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-[#FAF7F7] border border-[#E8DDDE] shadow-md w-full flex flex-col justify-between relative overflow-hidden text-[#241A1A]">
              
              {/* Dynamic Step 1 Preview: Store Setup */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DDDE]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <span className="font-bold text-sm">{t('store_information', 'Pengaturan Informasi Toko')}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      {t('how_preview_instant', 'Aktif Instan')}
                    </span>
                  </div>

                  <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E8DDDE]">
                    <div>
                      <span className="text-[10px] font-bold text-[#857C76] uppercase tracking-wider">{t('how_preview_biz_name', 'Nama Usaha Anda')}</span>
                      <p className="font-bold text-sm text-[#241A1A] mt-0.5">Batik Nusantara Heritage</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#857C76] uppercase tracking-wider">{t('how_preview_store_link', 'Tautan Toko Online')}</span>
                      <div className="flex items-center justify-between p-2 mt-1 rounded-lg bg-[#FAF7F7] border border-[#E8DDDE] text-xs font-mono text-[#66000E] font-semibold">
                        <span>kroombox.id/batiknusantara</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#66000E]" />
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#857C76] uppercase tracking-wider">{t('how_preview_store_wa', 'Nomor WhatsApp Usaha')}</span>
                      <p className="font-semibold text-xs text-[#241A1A] mt-0.5">0812-3456-7890 ({t('how_preview_wa_note', 'Aktif untuk notifikasi')})</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#E8DDDE] flex items-center gap-2 text-xs text-[#5F5652]">
                    <CheckCircle2 className="w-4 h-4 text-[#66000E] shrink-0" />
                    <span>{t('how_preview_dns_note', 'Domain & server langsung aktif tanpa perlu setting DNS atau hosting')}</span>
                  </div>
                </div>
              )}

              {/* Dynamic Step 2 Preview: Product Upload */}
              {activeStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DDDE]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <span className="font-bold text-sm">{t('how_step_2_title', 'Upload Produk')}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] text-[10px] font-bold border border-[#E8DDDE]">
                      {t('how_step_2_badge', 'Kamera & Galeri')}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#E8DDDE] flex items-center gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=140&auto=format&fit=crop&q=80"
                      alt="Batik Parang"
                      className="w-16 h-16 rounded-xl object-cover border border-[#E8DDDE] shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-sm text-[#241A1A] truncate">Batik Parang Tulis Solo</p>
                      <p className="text-xs font-bold text-[#66000E]">Rp 175.000</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FAF7F7] border border-[#E8DDDE] text-[#5F5652]">
                          Varian: M, L, XL
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {t('stock', 'Stok')}: 24
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#E8DDDE] space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-[#241A1A]">
                      <CheckCircle2 className="w-4 h-4 text-[#66000E] shrink-0" />
                      <span>{t('how_preview_shipping_calc', 'Otomatis hitung ongkir kurir berdasarkan berat (gram)')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#241A1A]">
                      <CheckCircle2 className="w-4 h-4 text-[#66000E] shrink-0" />
                      <span>{t('how_preview_multi_img', 'Bisa tambah foto detail produk hingga 5 gambar')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Step 3 Preview: Orders & QRIS Payment */}
              {activeStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DDDE]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <span className="font-bold text-sm">{t('how_step_3_title', 'Pesanan Masuk')}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      QRIS
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#E8DDDE] flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#857C76]">#INV-2026-092</span>
                      <p className="font-bold text-xs sm:text-sm text-[#241A1A]">Dina Rahayu (2 items)</p>
                      <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                        <span>✓ {t('how_preview_qris_paid', 'Pembayaran QRIS Berhasil')}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#857C76]">{t('total_payment', 'Total')}</span>
                      <p className="font-bold text-sm sm:text-base text-[#66000E]">Rp 350.000</p>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE]">
                        {t('hero_dash_ready_ship', 'Siap Kirim')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#E8DDDE] flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[#5F5652]">
                      <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('how_preview_wa_alert', 'Notifikasi order otomatis terkirim ke WhatsApp Anda & pembeli')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer Indicator */}
              <div className="pt-3 border-t border-[#E8DDDE] flex items-center justify-between text-xs text-[#5F5652]">
                <span>{t('how_step_label', 'Langkah')} {activeStep} / 3</span>
                <span className="text-[#66000E] font-semibold">{t('how_footer_ready', 'Toko siap dalam 5 menit')}</span>
              </div>

            </div>

            {/* Mobile CTA Button (Only on Mobile < lg) */}
            <div className="pt-3 lg:hidden">
              <button
                onClick={onNavigateRegister}
                className="w-full inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer active:scale-[0.98]"
              >
                <span>{t('how_cta_register', 'Buat Toko Sekarang — Gratis')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};



