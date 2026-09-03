import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Package,
  ShoppingBag,
  TrendingUp,
  Store,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FinalCTASectionProps {
  onNavigateRegister: () => void;
  onLaunchDemo?: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({
  onNavigateRegister,
}) => {
  const { t } = useLanguage();
  const [activeMetricHover, setActiveMetricHover] = useState<'katalog' | 'pesanan' | null>(null);

  const trustPoints = [
    { label: t('cta_trust_no_cost', 'Tanpa biaya awal') },
    { label: t('cta_trust_ready_order', 'Siap terima order') },
    { label: t('cta_trust_umkm_guide', 'Panduan UMKM') },
  ];

  return (
    <section 
      id="cta" 
      className="min-h-[calc(100svh-124px)] min-h-[calc(100dvh-124px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center py-10 sm:py-14 lg:py-20 bg-white font-sans overflow-hidden scroll-mt-16 sm:scroll-mt-20 relative"
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating Premium CTA Card with Subtle Shadow */}
        <div 
          className="rounded-[24px] bg-[#66000E] text-white p-7 sm:p-10 lg:p-14 xl:p-16 relative overflow-hidden transition-all duration-300"
          style={{
            boxShadow: '0 20px 50px rgba(102, 0, 14, 0.14)',
          }}
        >
          {/* Subtle Background Depth Elements - Very Low Opacity */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#801010]/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 bg-white/[0.02] rounded-full blur-xl pointer-events-none" />

          {/* 2-Column Responsive Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-center">
            
            {/* LEFT COLUMN: CTA Copy & Actions */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-5">
              
              {/* Small Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium backdrop-blur-xs shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('cta_section_badge', 'Daftar Gratis')}</span>
              </div>

              {/* Headline */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-snug text-white max-w-xl">
                {t('cta_section_title', 'Mulai Buka Toko Online')} <br className="hidden sm:inline" />
                {t('cta_section_title_sub', 'Anda Sekarang')}
              </h2>

              {/* Description */}
              <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-normal max-w-md">
                {t('cta_section_desc', 'Jualan online praktis dan siap digunakan dalam hitungan menit.')}
              </p>

              {/* Action Buttons */}
              <div className="w-full pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
                
                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-6 rounded-xl bg-white text-[#66000E] hover:bg-white/95 font-medium text-xs sm:text-sm shadow-xs active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  <span>{t('cta_btn_open_free', 'Buka Toko Gratis')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#66000E] group-hover:translate-x-0.5 transition-transform duration-150" />
                </button>

                {/* WhatsApp Secondary Button */}
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Kroombox,%20saya%20tertarik%20buka%20toko%20online"
                  target="_blank"
                  rel="noreferrer"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-normal text-xs sm:text-sm border border-white/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white/90 group-hover:text-emerald-300 transition-colors" />
                  <span>{t('cta_btn_whatsapp_consult', 'Konsultasi WhatsApp')}</span>
                </a>

              </div>

              {/* Trust Indicators (Desktop & Mobile) */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {trustPoints.map((item, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors text-xs font-medium text-white/90 cursor-default"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Product Preview Card */}
            <div className="lg:col-span-5 w-full flex flex-col items-center justify-center relative mt-2 lg:mt-0">
              
              <div className="relative w-full max-w-[340px] sm:max-w-[360px]">
                
                {/* FLOATING NOTIFICATION (Top Right) */}
                <div 
                  className="absolute -top-3.5 -right-2 sm:-right-4 z-20 bg-white text-[#241A1A] rounded-xl px-3 py-2 shadow-lg border border-[#E6DDDA] flex items-center gap-2.5 text-xs animate-bounce-gentle"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-bold text-[11px] leading-tight text-[#241A1A]">{t('cta_preview_new_order', 'Pesanan Baru')}</p>
                    <p className="text-[10px] text-[#6B6260] font-normal">{t('cta_preview_order_detail', 'Pesanan #1024 • Rp 350.000')}</p>
                  </div>
                </div>

                {/* MAIN DASHBOARD PREVIEW CARD */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-white/50 text-[#241A1A] transition-transform duration-300 hover:-translate-y-0.5">
                  
                  {/* Card Header: Store Identity */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#E6DDDA]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-xs sm:text-sm text-[#241A1A] leading-tight">{t('cta_preview_your_store', 'Toko Anda')}</h4>
                        <span className="text-[10px] text-[#6B6260] block">kroombox.id/toko-anda</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t('cta_preview_online_status', 'Online')}
                    </span>
                  </div>

                  {/* Card Body: Sales Revenue */}
                  <div className="py-3.5 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#6B6260] font-medium">{t('cta_preview_today_sales', 'Penjualan Hari Ini')}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <TrendingUp className="w-3 h-3" /> +18.4%
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-[#66000E] tracking-tight">
                      Rp 8.638.000
                    </p>
                  </div>

                  {/* 2 Metric Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    
                    {/* 12 Produk */}
                    <div
                      className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E6DDDA] hover:border-[#66000E]/30 transition-colors text-left"
                      onMouseEnter={() => setActiveMetricHover('katalog')}
                      onMouseLeave={() => setActiveMetricHover(null)}
                    >
                      <div className="flex items-center gap-1.5 text-[#6B6260] text-[10px] sm:text-[11px] mb-0.5">
                        <Package className="w-3.5 h-3.5 text-[#66000E]" />
                        <span>{t('cta_preview_catalog', 'Katalog')}</span>
                      </div>
                      <p className="font-bold text-xs sm:text-sm text-[#241A1A]">{t('cta_preview_12_products', '12 Produk')}</p>
                    </div>

                    {/* 8 Pesanan */}
                    <div
                      className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E6DDDA] hover:border-[#66000E]/30 transition-colors text-left"
                      onMouseEnter={() => setActiveMetricHover('pesanan')}
                      onMouseLeave={() => setActiveMetricHover(null)}
                    >
                      <div className="flex items-center gap-1.5 text-[#6B6260] text-[10px] sm:text-[11px] mb-0.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#66000E]" />
                        <span>{t('cta_preview_orders', 'Pesanan')}</span>
                      </div>
                      <p className="font-bold text-xs sm:text-sm text-[#241A1A]">{t('cta_preview_8_orders', '8 Pesanan')}</p>
                    </div>

                  </div>

                  {/* Card Bottom Status */}
                  <div className="mt-3 pt-2.5 border-t border-[#E6DDDA] flex items-center justify-between text-[10px] text-[#6B6260]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-medium text-[#241A1A]">{t('cta_preview_active_store', 'Toko Online Aktif')}</span>
                    </div>
                    <span className="text-[#66000E] font-semibold">{t('cta_preview_qris_ready', 'QRIS & Bank Siap')}</span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

