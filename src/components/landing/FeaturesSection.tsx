import React from 'react';
import { motion } from 'motion/react';
import {
  Package,
  ClipboardList,
  CreditCard,
  Store,
  TrendingUp,
  Truck,
  QrCode,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_SMOOTH, Reveal, RevealGroup, RevealItem } from './landingMotion';

/** Tinggi batang grafik pesanan mingguan (persen), murni ilustrasi. */
const ORDER_BARS = [38, 55, 46, 72, 60, 88, 100];

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="fitur"
      className="relative bg-[#FAF7F7] py-16 sm:py-20 lg:py-24 scroll-mt-16 sm:scroll-mt-20 font-sans"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#800C19]">
            {t('features_section_badge', 'Fitur Lengkap')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl lg:text-[44px] font-medium tracking-tight leading-[1.1] text-[#1A1414]">
            {t('features_section_title', 'Semua yang Dibutuhkan untuk Jualan')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5F5652]">
            {t('features_section_desc', 'Satu dashboard terpadu untuk mengelola seluruh operasional toko.')}
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Produk: kotak statistik berwarna */}
          <RevealItem className="lg:col-span-7">
            <FeatureCard
              icon={Package}
              title={t('features_tab_products', 'Produk')}
              desc={t('features_tab_products_sub', 'Atur harga dan stok dengan mudah.')}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#F7C948] p-4 text-[#1A1414]">
                  <p className="text-[11px] font-medium text-[#1A1414]/65">{t('features_top_seller', 'Produk Terlaris')}</p>
                  <p className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight">+42</p>
                  <p className="mt-1 text-xs text-[#1A1414]/70">{t('features_sold_count', 'terjual minggu ini')}</p>
                </div>
                <div className="rounded-2xl bg-[#FFC2D1] p-4 text-[#1A1414]">
                  <p className="text-[11px] font-medium text-[#1A1414]/65">{t('features_stock_warning', 'Peringatan Stok')}</p>
                  <p className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight">3 pcs</p>
                  <p className="mt-1 text-xs text-[#1A1414]/70">{t('features_restock_soon', 'Segera restok')}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#E4DCDC] p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1A1414] truncate">Batik Parang Pekalongan</p>
                  <p className="text-xs text-[#5F5652]">{t('features_sync_realtime', 'Sinkron Real-time')}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#800C19]">Rp 350.000</span>
              </div>
            </FeatureCard>
          </RevealItem>

          {/* Pesanan: grafik batang mingguan */}
          <RevealItem className="lg:col-span-5">
            <FeatureCard
              icon={ClipboardList}
              title={t('features_tab_orders', 'Pesanan')}
              desc={t('features_tab_orders_sub', 'Proses order dan cetak resi otomatis.')}
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1A1414]">128</p>
                  <p className="text-xs text-[#5F5652]">{t('features_tab_orders', 'Pesanan')} / 7 hari</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <TrendingUp className="w-3 h-3" /> +62%
                </span>
              </div>
              <div className="mt-4 flex h-24 items-end gap-2" aria-hidden="true">
                {ORDER_BARS.map((height, i) => (
                  <motion.span
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.06, ease: EASE_SMOOTH }}
                    className={`flex-1 rounded-md ${i === ORDER_BARS.length - 1 ? 'bg-[#800C19]' : 'bg-[#F0E4E5]'}`}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#5F5652]">
                <Truck className="w-3.5 h-3.5 shrink-0 text-[#800C19]" />
                <span>{t('features_whatsapp_tracking', 'Auto Kirim Resi ke WhatsApp')}</span>
              </div>
            </FeatureCard>
          </RevealItem>

          {/* Pembayaran */}
          <RevealItem className="lg:col-span-5">
            <FeatureCard
              icon={CreditCard}
              title={t('features_tab_payments', 'Pembayaran')}
              desc={t('features_tab_payments_sub', 'Terima QRIS dan transfer bank langsung.')}
            >
              <div className="flex items-center gap-4 rounded-2xl bg-[#66000E] p-4 text-white">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-[#66000E]">
                  <QrCode className="w-8 h-8" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">QRIS &amp; Virtual Account</p>
                  <p className="text-xs text-white/70">GoPay, OVO, Dana, BCA, Mandiri</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#5F5652]">{t('features_payout_label', 'Pencairan Dana Dompet:')}</span>
                <span className="font-semibold text-[#800C19] text-right">
                  {t('features_payout_anytime', 'Tarik Kapan Saja ke Rekening Bank')}
                </span>
              </div>
            </FeatureCard>
          </RevealItem>

          {/* Toko Online */}
          <RevealItem className="lg:col-span-7">
            <FeatureCard
              icon={Store}
              title={t('features_tab_store', 'Toko Online')}
              desc={t('features_tab_store_sub', 'Etalase toko modern siap disebar ke WhatsApp.')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E4DCDC] px-3 py-2.5 font-mono text-xs text-[#800C19]">
                    <span className="truncate">tokobatik.lapakq.com</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#5F5652]">
                    <Smartphone className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#800C19]" />
                    <span>{t('features_mobile_optimized', 'Tampilan ringan dan cepat dibuka dari browser smartphone pembeli tanpa install aplikasi')}</span>
                  </div>
                </div>
                <motion.img
                  src="/assets/3d/clean/mini_storefront.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="hidden sm:block w-28 h-24 object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.2)]"
                />
              </div>
            </FeatureCard>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
};

/** Kartu fitur putih: ikon, judul, deskripsi singkat, lalu visual di bawahnya. */
const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  desc: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, desc, children }) => (
  <motion.article
    whileHover={{ y: -4 }}
    transition={{ duration: 0.3, ease: EASE_SMOOTH }}
    className="h-full rounded-[28px] border border-[#E4DCDC] bg-white p-5 sm:p-6 flex flex-col gap-5"
  >
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5E8EA] text-[#800C19]">
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <h3 className="text-lg font-medium tracking-tight text-[#1A1414]">{title}</h3>
        <p className="text-sm text-[#5F5652]">{desc}</p>
      </div>
    </div>
    <div className="mt-auto">{children}</div>
  </motion.article>
);
