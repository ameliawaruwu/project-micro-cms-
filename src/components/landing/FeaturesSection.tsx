import React, { useState } from 'react';
import {
  Package,
  ClipboardList,
  CreditCard,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Printer,
  Share2,
  Truck,
  QrCode,
  Smartphone,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();
  const [activeFeature, setActiveFeature] = useState<'produk' | 'pesanan' | 'pembayaran' | 'toko'>('produk');

  const featureTabs = [
    {
      id: 'produk' as const,
      title: t('features_tab_product_title', 'Produk'),
      subtitle: t('features_tab_product_sub', 'Atur harga dan stok dengan mudah.'),
      icon: Package,
      badge: t('features_tab_product_badge', 'Katalog Cepat'),
    },
    {
      id: 'pesanan' as const,
      title: t('features_tab_order_title', 'Pesanan'),
      subtitle: t('features_tab_order_sub', 'Proses order dan cetak resi otomatis.'),
      icon: ClipboardList,
      badge: t('features_tab_order_badge', 'Auto Resi'),
    },
    {
      id: 'pembayaran' as const,
      title: t('features_tab_pay_title', 'Pembayaran'),
      subtitle: t('features_tab_pay_sub', 'Terima QRIS dan transfer bank langsung.'),
      icon: CreditCard,
      badge: t('features_tab_pay_badge', 'QRIS & Bank'),
    },
    {
      id: 'toko' as const,
      title: t('features_tab_store_title', 'Toko Online'),
      subtitle: t('features_tab_store_sub', 'Etalase toko modern siap disebar ke WhatsApp.'),
      icon: Store,
      badge: t('features_tab_store_badge', 'Link Bio Siap'),
    },
  ];

  return (
    <section 
      id="fitur" 
      className="min-h-[calc(100svh-124px)] min-h-[calc(100dvh-124px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center py-10 sm:py-14 lg:py-20 bg-[#FAF7F7] scroll-mt-16 sm:scroll-mt-20 border-b border-[#E8DDDE] font-sans relative"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-medium mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#66000E]" />
            <span>{t('features_section_badge', 'Fitur Lengkap')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#241A1A] tracking-tight leading-snug mb-1.5">
            {t('features_section_title', 'Semua yang Dibutuhkan untuk Jualan')}
          </h2>
          <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal max-w-md mx-auto">
            {t('features_section_desc', 'Satu dashboard terpadu untuk mengelola seluruh operasional toko.')}
          </p>
        </div>

        {/* Mobile Feature Selector Tabs (Only on Mobile < lg) */}
        <div className="lg:hidden grid grid-cols-2 gap-2 mb-3.5">
          {featureTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeFeature === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveFeature(item.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#66000E] text-white border-[#66000E] shadow-xs'
                    : 'bg-white text-[#241A1A] border-[#E8DDDE]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F5E8EA] text-[#66000E]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs truncate leading-tight">{item.title}</p>
                  <p className={`text-[10px] truncate ${isActive ? 'text-white/80' : 'text-[#857C76]'}`}>{item.badge}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 2-Column: Left feature selector + Right live UI view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-10 items-center max-w-6xl mx-auto">
          
          {/* Left Column: 4 Feature Switcher Cards (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 space-y-2.5">
            {featureTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeFeature === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveFeature(item.id)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-white border-[#66000E] shadow-sm ring-1 ring-[#66000E]'
                      : 'bg-white/60 border-[#E8DDDE] hover:bg-white hover:border-[#66000E]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-[#66000E] text-white shadow-xs'
                          : 'bg-[#F5E8EA] text-[#66000E]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-[#241A1A]">
                          {item.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#FAF7F7] text-[#66000E] border border-[#E8DDDE]">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#5F5652] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-[#66000E] translate-x-0.5' : 'text-[#857C76]'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Single Interactive Visual Display based on active feature */}
          <div className="lg:col-span-7">
            <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white border border-[#E8DDDE] shadow-md min-h-[320px] sm:min-h-[380px] flex flex-col justify-between text-[#241A1A]">
              
              {/* Feature 1: Produk */}
              {activeFeature === 'produk' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DDDE]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center font-bold text-xs">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">{t('features_prod_card_title', 'Katalog & Stok Otomatis')}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#66000E]">{t('features_prod_sync_tag', 'Sinkron Real-time')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE]">
                      <span className="text-[10px] text-[#857C76]">{t('features_prod_best_seller', 'Produk Terlaris')}</span>
                      <p className="font-bold text-xs sm:text-sm text-[#241A1A] mt-0.5">Batik Parang Pekalongan</p>
                      <p className="text-xs font-bold text-[#66000E] mt-0.5">Rp 350.000</p>
                      <span className="text-[9px] text-emerald-800 font-semibold mt-1 inline-block">
                        {t('features_prod_sold_week', '✓ 42 terjual minggu ini')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE]">
                      <span className="text-[10px] text-[#857C76]">{t('features_prod_stock_alert', 'Peringatan Stok')}</span>
                      <p className="font-bold text-xs sm:text-sm text-[#241A1A] mt-0.5">Kemeja Tenun Solo</p>
                      <p className="text-xs font-bold text-[#66000E] mt-0.5">Rp 225.000</p>
                      <span className="text-[9px] text-amber-800 font-semibold mt-1 inline-block">
                        {t('features_prod_stock_warning', '⚠️ Sisa 3 pcs (Segera restok)')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] space-y-1.5 text-xs text-[#5F5652]">
                    <p className="font-bold text-[#241A1A]">{t('features_prod_bullet_title', 'Keunggulan Manajemen Produk:')}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#66000E] shrink-0" />
                      <span>{t('features_prod_bullet_1', 'Atur variasi ukuran (S, M, L, XL), warna, dan diskon promo')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#66000E] shrink-0" />
                      <span>{t('features_prod_bullet_2', 'Stok berkurang otomatis saat pembeli selesai membayar')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 2: Pesanan */}
              {activeFeature === 'pesanan' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DDDE]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center font-bold text-xs">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">{t('features_ord_card_title', 'Pesanan & Resi Pengiriman')}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {t('hero_dash_ready_ship', 'Siap Kirim')}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-[#857C76]">#ORD-9821</span>
                        <p className="font-bold text-sm text-[#241A1A]">Dina Rahayu (Batik Parang x2)</p>
                      </div>
                      <span className="font-bold text-sm text-[#66000E]">Rp 350.000</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#5F5652] pt-1">
                      <Truck className="w-3.5 h-3.5 text-[#66000E]" />
                      <span>{t('courier', 'Kurir')}: JNE Regular (Resi: <span className="font-mono font-semibold text-[#241A1A]">JNE-88291039</span>)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E8DDDE] flex items-center justify-center gap-1.5 text-xs font-semibold text-[#241A1A]">
                      <Printer className="w-3.5 h-3.5 text-[#66000E]" />
                      <span>{t('features_ord_print_label', 'Cetak Label Alamat 1-Klik')}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800">
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('features_ord_auto_wa', 'Auto Kirim Resi ke WhatsApp')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature 3: Pembayaran */}
              {activeFeature === 'pembayaran' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DDDE]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center font-bold text-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">{t('features_pay_card_title', 'Pembayaran Otomatis & QRIS')}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-800">{t('features_pay_instant_paid', 'Lunas Instan')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-center space-y-1.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DDDE] flex items-center justify-center mx-auto text-[#66000E]">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-xs text-[#241A1A]">{t('features_pay_qris_nat', 'QRIS Nasional')}</p>
                      <p className="text-[10px] text-[#857C76]">BCA, Mandiri, BRI, GoPay, OVO, ShopeePay</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-center space-y-1.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DDDE] flex items-center justify-center mx-auto text-[#66000E]">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-xs text-[#241A1A]">{t('features_pay_va', 'Virtual Account')}</p>
                      <p className="text-[10px] text-[#857C76]">{t('features_pay_va_desc', 'Transfer bank resmi otomatis terverifikasi')}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex items-center justify-between text-xs">
                    <span className="text-[#5F5652]">{t('features_pay_wallet_disb', 'Pencairan Dana Dompet:')}</span>
                    <span className="font-bold text-[#66000E]">{t('features_pay_disb_anytime', 'Tarik Kapan Saja ke Rekening Bank')}</span>
                  </div>
                </div>
              )}

              {/* Feature 4: Toko Online */}
              {activeFeature === 'toko' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8DDDE]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center font-bold text-xs">
                        <Store className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm">{t('features_store_card_title', 'Etalase Toko Siap Pakai')}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-800">{t('features_store_online_24', 'Online 24 Jam')}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs">
                          K
                        </div>
                        <span className="font-bold text-xs text-[#241A1A]">Toko Batik Nusantara</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        {t('features_store_open_badge', 'Buka')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E8DDDE] text-xs font-mono text-[#66000E]">
                      <span>kroombox.id/tokobatik</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#66000E]" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#E8DDDE] flex items-center gap-2 text-xs text-[#5F5652]">
                    <Smartphone className="w-4 h-4 text-[#66000E] shrink-0" />
                    <span>{t('features_store_mobile_note', 'Tampilan ringan dan cepat dibuka dari browser smartphone pembeli tanpa install aplikasi')}</span>
                  </div>
                </div>
              )}

              {/* Bottom Feature Footer */}
              <div className="pt-3 mt-3 border-t border-[#E8DDDE] flex items-center justify-between text-xs text-[#5F5652]">
                <span>{t('features_integrated_footer', 'Fitur Terintegrasi Kroombox')}</span>
                <span className="text-[#66000E] font-semibold">{t('features_free_plan_footer', 'Gratis Tanpa Biaya Langganan Bulanan')}</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};



