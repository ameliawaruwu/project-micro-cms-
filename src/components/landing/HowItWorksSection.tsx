import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Store, PackagePlus, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_SMOOTH, Reveal, RevealGroup, RevealItem } from './landingMotion';

interface HowItWorksSectionProps {
  onNavigateRegister: () => void;
}

/**
 * Tiga langkah mulai jualan dalam kartu bernomor berwarna (kuning, merah muda, marun),
 * masing-masing dengan objek 3D yang melayang pelan.
 */
const STEP_STYLES = [
  {
    card: 'bg-[#F7C948] text-[#1A1414]',
    num: 'text-[#1A1414]/15',
    chip: 'bg-white/70 text-[#66000E]',
    desc: 'text-[#1A1414]/70',
    image: 'mini_storefront',
    icon: Store,
  },
  {
    card: 'bg-[#FFC2D1] text-[#1A1414]',
    num: 'text-[#66000E]/15',
    chip: 'bg-white/70 text-[#66000E]',
    desc: 'text-[#1A1414]/70',
    image: 'kraft_pouch',
    icon: PackagePlus,
  },
  {
    card: 'bg-[#66000E] text-white',
    num: 'text-white/15',
    chip: 'bg-white/15 text-white',
    desc: 'text-white/75',
    image: 'red_bags',
    icon: ShoppingBag,
  },
] as const;

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onNavigateRegister }) => {
  const { t } = useLanguage();

  const steps = [
    {
      title: t('how_step_1_title', 'Buat Toko'),
      desc: t('how_step_1_desc', 'Atur nama usaha dan nomor WhatsApp toko Anda dalam hitungan menit.'),
      badge: t('how_step_1_badge', 'Cukup 1 Menit'),
    },
    {
      title: t('how_step_2_title', 'Tambah Produk'),
      desc: t('how_step_2_desc', 'Upload foto dari HP, tentukan harga, dan atur varian barang.'),
      badge: t('how_step_2_badge', 'Langsung dari Kamera HP'),
    },
    {
      title: t('how_step_3_title', 'Terima Pesanan'),
      desc: t('how_step_3_desc', 'Bagikan link toko, terima pembayaran otomatis lewat QRIS & Bank.'),
      badge: t('how_step_3_badge', 'QRIS & Resi Otomatis'),
    },
  ];

  return (
    <section
      id="cara-kerja"
      className="relative bg-white py-16 sm:py-20 lg:py-24 scroll-mt-16 sm:scroll-mt-20 font-sans"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#800C19]">
            {t('how_section_badge', 'Alur Praktis')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl lg:text-[44px] font-medium tracking-tight leading-[1.1] text-[#1A1414]">
            {t('how_section_title', 'Mulai Jualan dalam 3 Langkah')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5F5652]">
            {t('how_section_desc', 'Sederhana dan langsung siap pakai tanpa perlu keahlian teknis.')}
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step, idx) => {
            const style = STEP_STYLES[idx];
            const Icon = style.icon;
            return (
              <RevealItem key={step.title}>
                <motion.article
                  whileHover={{ y: -6, rotate: idx === 1 ? 0 : idx === 0 ? -1 : 1 }}
                  transition={{ duration: 0.35, ease: EASE_SMOOTH }}
                  className={`group relative h-full min-h-[300px] sm:min-h-[340px] rounded-[28px] p-6 sm:p-7 overflow-hidden flex flex-col ${style.card}`}
                >
                  {/* Nomor langkah besar sebagai latar */}
                  <span
                    aria-hidden="true"
                    className={`absolute -top-4 right-4 text-[120px] sm:text-[140px] font-semibold leading-none tracking-tighter select-none ${style.num}`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="relative flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${style.chip}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${style.chip}`}>
                      {step.badge}
                    </span>
                  </div>

                  {/* Objek 3D melayang */}
                  <motion.img
                    src={`/assets/3d/clean/${style.image}.webp`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    animate={{ y: [0, -8, 0], rotate: [0, idx === 1 ? 3 : -3, 0] }}
                    transition={{ duration: 5 + idx, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative mx-auto my-4 w-32 sm:w-36 h-28 sm:h-32 object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="relative mt-auto">
                    <h3 className="text-xl sm:text-2xl font-medium tracking-tight">{step.title}</h3>
                    <p className={`mt-1.5 text-sm leading-relaxed ${style.desc}`}>{step.desc}</p>
                  </div>
                </motion.article>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal className="mt-10 flex justify-center" delay={0.1}>
          <motion.button
            type="button"
            onClick={onNavigateRegister}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#66000E] hover:bg-[#800C19] text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <span>{t('how_cta_register', 'Buat Toko Sekarang — Gratis')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </Reveal>
      </div>
    </section>
  );
};
