import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  Package,
  CreditCard,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LandingHeroProps {
  onNavigateRegister: () => void;
  onNavigateLogin: () => void;
  onLaunchDemo: () => void;
  onScrollToHowItWorks: () => void;
  isAuthenticated?: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onNavigateRegister,
  onNavigateLogin,
  onLaunchDemo,
  onScrollToHowItWorks,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');

  const daysOfWeek = language === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'];

  return (
    <section 
      id="hero" 
      className="relative min-h-[calc(100svh-64px)] min-h-[calc(100dvh-64px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center pt-4 pb-20 sm:py-8 lg:py-16 overflow-hidden bg-white scroll-mt-16 sm:scroll-mt-20"
    >
      {/* Subtle Warm Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#66000E]/4 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* Left Column: Headline & Quick Actions */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-center lg:text-left">
            
            {/* Small UMKM Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E8EA] border border-[#E8DDDE] text-[#66000E] text-xs font-medium shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#66000E]" />
              <span>{t('hero_umkm_badge', 'Solusi Toko Online UMKM')}</span>
            </div>

            {/* Main Headline - Balanced Size & Weight */}
            <h1 className="font-semibold text-xl sm:text-3xl lg:text-4xl text-[#241A1A] tracking-tight leading-snug max-w-[540px] mx-auto lg:mx-0">
              {t('hero_title_p1', 'Bikin Toko Online,')}{' '}
              <span className="text-[#66000E]">
                {t('hero_title_highlight', 'Semudah Mengelola')}
              </span>{' '}
              {t('hero_title_p2', 'Toko Sendiri')}
            </h1>

            {/* Short Concise Description */}
            <p className="text-xs sm:text-sm lg:text-base text-[#5F5652] max-w-[460px] mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('hero_subtitle', 'Kelola produk, pesanan, dan pembayaran otomatis dalam satu aplikasi.')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-2.5 pt-1">
              <button
                onClick={onNavigateRegister}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-6 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-medium text-xs sm:text-sm shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t('hero_cta_primary', 'Mulai Gratis')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onScrollToHowItWorks}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-11 sm:h-12 px-4.5 rounded-xl bg-[#FAF7F7] hover:bg-[#F5E8EA] text-[#66000E] font-medium text-xs sm:text-sm border border-[#E8DDDE] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{t('hero_cta_how', 'Lihat Cara Kerja')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#857C76]" />
              </button>
            </div>

            {/* 3 Small Trust Indicators */}
            <div className="pt-1.5 flex flex-wrap items-center justify-center lg:justify-start gap-y-1.5 gap-x-4 sm:gap-x-5 text-xs font-normal text-[#706866]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66000E] shrink-0" />
                <span>{t('hero_trust_easy', 'Mudah digunakan')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66000E] shrink-0" />
                <span>{t('hero_trust_hasslefree', 'Tanpa ribet')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66000E] shrink-0" />
                <span>{t('hero_trust_umkm', 'Siap untuk UMKM')}</span>
              </div>
            </div>

            {/* Mobile Quick Highlight Badge */}
            <div className="pt-2 lg:hidden flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-[11px] text-[#5F5652] font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('hero_active_stores', '10.000+ Toko Aktif')}</span>
                <span className="text-[#857C76]">•</span>
                <span>{t('hero_setup_time', 'Setup 5 Menit')}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Visually Dominant Dashboard Mockup (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-6 relative mt-4 lg:mt-0">
            
            {/* FLOATING BADGE 1: +8 Pesanan Baru (Top Left) */}
            <div className="absolute -top-3.5 -left-3 z-20 bg-white rounded-2xl p-2.5 sm:p-3 shadow-md border border-[#E8DDDE] flex items-center gap-2.5 hidden sm:flex animate-bounce-gentle">
              <div className="w-8 h-8 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#241A1A]">{t('hero_badge_new_orders', '+8 Pesanan Baru')}</p>
                <p className="text-[10px] text-[#857C76] font-normal">{t('hero_badge_ready_process', 'Siap diproses')}</p>
              </div>
            </div>

            {/* FLOATING BADGE 2: Penjualan Hari Ini (Bottom Left) */}
            <div className="absolute -bottom-4 -left-2 z-20 bg-white rounded-2xl p-2.5 sm:p-3 shadow-md border border-[#E8DDDE] flex items-center gap-2.5 hidden sm:flex">
              <div className="w-8 h-8 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-[#857C76] font-normal">{t('hero_dash_sales_today', 'Penjualan Hari Ini')}</p>
                <p className="text-xs sm:text-sm font-bold text-[#66000E]">Rp 8.638.000</p>
              </div>
            </div>

            {/* FLOATING BADGE 3: Pembayaran Berhasil (Top Right) */}
            <div className="absolute top-4 -right-3 z-20 bg-white text-[#241A1A] rounded-2xl p-2.5 sm:p-3 shadow-md border border-[#E8DDDE] flex items-center gap-2 hidden sm:flex">
              <div className="w-6 h-6 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-[#241A1A]">{t('hero_badge_payment_success', 'Pembayaran Berhasil')}</p>
                <p className="text-[10px] text-[#857C76] font-normal">{t('hero_badge_qris_bank', 'QRIS & Bank')}</p>
              </div>
            </div>

            {/* MAIN DASHBOARD MOCKUP CONTAINER */}
            <div className="relative rounded-2xl bg-white p-4 sm:p-5 shadow-xl border border-[#E8DDDE] overflow-hidden">
              
              {/* Mockup Header */}
              <div className="bg-[#FAF7F7] rounded-xl p-3 mb-3 flex items-center justify-between border border-[#E8DDDE]">
                <div className="flex items-center gap-2.5">
                  <img src="/Logo.png" alt="Kroomify" className="h-7.5 w-auto object-contain shrink-0 drop-shadow-2xs" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#241A1A] tracking-tight">{t('hero_dash_title', 'Kroomify Dashboard')}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                        {t('hero_dash_status_online', 'Online')}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#857C76] font-normal">Toko Batik Nusantara</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-[#66000E] text-white font-semibold'
                        : 'text-[#5F5652] hover:bg-white'
                    }`}
                  >
                    {t('hero_dash_tab_overview', 'Ringkasan')}
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-[#66000E] text-white font-semibold'
                        : 'text-[#5F5652] hover:bg-white'
                    }`}
                  >
                    {t('hero_dash_tab_orders', 'Pesanan')}
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                      activeTab === 'products'
                        ? 'bg-[#66000E] text-white font-semibold'
                        : 'text-[#5F5652] hover:bg-white'
                    }`}
                  >
                    {t('hero_dash_tab_products', 'Produk')}
                  </button>
                </div>
              </div>

              {/* Dynamic Mockup Body */}
              <div className="space-y-3">
                
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE]">
                    <p className="text-[10px] text-[#857C76] font-normal">{t('hero_dash_sales_today', 'Penjualan Hari Ini')}</p>
                    <p className="text-xs sm:text-sm font-bold text-[#66000E] mt-0.5">Rp 8.638.000</p>
                    <span className="text-[8px] sm:text-[9px] font-medium text-emerald-800 mt-0.5 inline-block">
                      {t('hero_dash_growth_week', '↑ 24% minggu ini')}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE]">
                    <p className="text-[10px] text-[#857C76] font-normal">{t('hero_dash_orders_in', 'Pesanan Masuk')}</p>
                    <p className="text-xs sm:text-sm font-bold text-[#241A1A] mt-0.5">8 {t('hero_dash_tab_orders', 'Pesanan')}</p>
                    <span className="text-[8px] sm:text-[9px] font-medium text-[#66000E] mt-0.5 inline-block">
                      {t('hero_dash_ready_ship', '3 siap kirim')}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE]">
                    <p className="text-[10px] text-[#857C76] font-normal">{t('hero_dash_active_catalog', 'Katalog Aktif')}</p>
                    <p className="text-xs sm:text-sm font-bold text-[#241A1A] mt-0.5">18 {t('hero_dash_tab_products', 'Produk')}</p>
                    <span className="text-[8px] sm:text-[9px] font-medium text-[#857C76] mt-0.5 inline-block">
                      {t('hero_dash_low_stock_notice', '3 stok menipis')}
                    </span>
                  </div>
                </div>

                {activeTab === 'overview' && (
                  <>
                    {/* Sales Activity Bar Chart */}
                    <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-[#241A1A]">{t('hero_dash_sales_act', 'Aktivitas Penjualan')}</span>
                        <span className="text-[10px] text-[#66000E] font-semibold">{t('hero_dash_today_plus', '+Rp 1.450.000 hari ini')}</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1.5 items-end h-14 pt-1">
                        {[35, 45, 60, 40, 75, 90, 100].map((height, i) => (
                          <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
                            <div
                              style={{ height: `${height}%` }}
                              className={`w-full rounded-t-sm transition-all ${
                                i === 6
                                    ? 'bg-[#66000E]'
                                  : 'bg-[#E8DDDE] hover:bg-[#66000E]/30'
                              }`}
                            />
                            <span className="text-[8px] text-[#857C76]">
                              {daysOfWeek[i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Order Preview */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8DDDE]">
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-[#FAF7F7] text-[11px]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[#F5E8EA] text-[#66000E] text-[9px] font-bold flex items-center justify-center border border-[#E8DDDE]">
                            BK
                          </div>
                          <div>
                            <p className="font-medium text-[#241A1A] leading-tight">Batik Parang Premium (2 pcs)</p>
                            <p className="text-[9px] text-[#857C76]">Dina R. • Jakarta</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#241A1A]">Rp 350.000</p>
                          <span className="text-[8px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {t('hero_dash_paid_ship', 'Lunas • Kirim')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#F5E8EA] text-[#66000E] text-[9px] font-bold flex items-center justify-center">
                          #01
                        </div>
                        <div>
                          <p className="font-semibold text-[#241A1A]">Dina Rahayu (2 items)</p>
                          <p className="text-[9px] text-[#857C76]">JNE Reguler • {t('hero_dash_auto_receipt', 'Resi Otomatis')}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {t('hero_dash_ready_ship', 'Siap Kirim')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#E8DDDE]/60 text-[#5F5652] text-[9px] font-bold flex items-center justify-center">
                          #02
                        </div>
                        <div>
                          <p className="font-semibold text-[#241A1A]">Budi Santoso (1 item)</p>
                          <p className="text-[9px] text-[#857C76]">QRIS • {t('hero_dash_tab_orders', 'Pembayaran Masuk')}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-[#66000E] bg-[#F5E8EA] px-2 py-0.5 rounded border border-[#E8DDDE]">
                        {t('hero_dash_need_process', 'Perlu Diproses')}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-150">
                    <div className="p-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-[11px]">
                      <p className="font-bold text-[#241A1A] truncate">Batik Parang Tulis</p>
                      <p className="text-[10px] text-[#66000E] font-semibold mt-0.5">Rp 175.000</p>
                      <span className="text-[8px] text-[#857C76]">{t('stock', 'Stok')}: 24 pcs</span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-[11px]">
                      <p className="font-bold text-[#241A1A] truncate">Kemeja Tenun Solo</p>
                      <p className="text-[10px] text-[#66000E] font-semibold mt-0.5">Rp 225.000</p>
                      <span className="text-[8px] text-amber-700 font-medium">{t('stock', 'Stok')}: 3 pcs ({t('product_status_low', 'Menipis')})</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};



