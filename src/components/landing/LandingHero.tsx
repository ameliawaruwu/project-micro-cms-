import React, { useId, useRef, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight, Store } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_SMOOTH, WordReveal, fadeUp, stagger, usePointerParallax } from './landingMotion';

interface LandingHeroProps {
  onNavigateRegister: () => void;
  /** Membuka halaman daftar dengan nama toko yang sudah diketik pengunjung. */
  onRegisterWithStoreName?: (storeName: string) => void;
  onNavigateLogin: () => void;
  onLaunchDemo: () => void;
  onScrollToHowItWorks: () => void;
  isAuthenticated?: boolean;
}

/** Domain induk toko merchant. */
const STORE_DOMAIN = 'lapakq.com';
/** Panjang maksimal nama toko yang boleh diketik di hero. */
const STORE_NAME_MAX = 60;

/** Ilustrasi 3D hero: laptop berisi toko LapakQ, ikon fitur, tas belanja, dan kardus. */
const HERO_ILLUSTRATION = '/assets/hero/hero-laptop.webp';
/** Ukuran asli gambar, dipakai agar ruangnya sudah dipesan sebelum gambar termuat. */
const HERO_ILLUSTRATION_SIZE = { width: 961, height: 729 } as const;
/** Pinggir gambar dipudarkan agar menyatu dengan latar hero. */
const EDGE_FADE_MASK =
  'linear-gradient(to bottom, transparent 0%, #000 7%, #000 88%, transparent 100%), ' +
  'linear-gradient(to right, transparent 0%, #000 4%, #000 96%, transparent 100%)';

/** Sama dengan aturan slug otomatis di modal pengaturan toko: huruf kecil, angka, dan tanda hubung. */
const toStoreSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

/** Ilustrasi yang melayang pelan dan sedikit bergeser mengikuti kursor. */
const HeroIllustration: React.FC<{ pointerX: MotionValue<number>; pointerY: MotionValue<number> }> = ({
  pointerX,
  pointerY,
}) => {
  const x = useTransform(pointerX, (v) => v * 10);
  const y = useTransform(pointerY, (v) => v * 10);
  return (
    <motion.div style={{ x, y }} className="relative w-full max-w-[640px] mx-auto select-none">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src={HERO_ILLUSTRATION}
          width={HERO_ILLUSTRATION_SIZE.width}
          height={HERO_ILLUSTRATION_SIZE.height}
          alt=""
          aria-hidden="true"
          draggable={false}
          fetchPriority="high"
          className="w-full h-auto"
          style={{ maskImage: EDGE_FADE_MASK, WebkitMaskImage: EDGE_FADE_MASK, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }}
        />
      </motion.div>
    </motion.div>
  );
};

/* ─────────────── Hero ─────────────── */

export const LandingHero: React.FC<LandingHeroProps> = ({
  onNavigateRegister,
  onRegisterWithStoreName,
  onScrollToHowItWorks,
}) => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const inputId = useId();
  const hintId = useId();
  const pointer = usePointerParallax();

  const [storeName, setStoreName] = useState('');
  const slug = toStoreSlug(storeName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = storeName.trim();
    if (name && onRegisterWithStoreName) onRegisterWithStoreName(name);
    else onNavigateRegister();
  };

  // Saat hero digulir, teks dan ilustrasi bergeser pelan dengan kecepatan berbeda.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      {...pointer.handlers}
      // Navbar landing berposisi fixed (tinggi 64–72px), jadi jarak atas sudah memperhitungkannya.
      className="relative overflow-hidden bg-gradient-to-b from-white via-white to-[#FDF6F7] pt-[104px] sm:pt-[124px] lg:pt-[132px] pb-14 sm:pb-20 font-sans"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-6">
        {/* ═══════ Kiri: judul & isian nama toko ═══════ */}
        <motion.div
          className="relative z-10 lg:col-span-6 text-center lg:text-left"
          style={{ y: textY }}
          variants={stagger(0.1, 0.05)}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-[#F5E8EA] px-3 py-1.5 text-xs font-semibold text-[#800C19]"
          >
            <Store className="w-3.5 h-3.5" />
            {t('hero_umkm_badge', 'Solusi Toko Online UMKM')}
          </motion.span>

          <motion.h1
            variants={stagger(0.06)}
            className="mt-5 font-medium text-[36px] leading-[1.08] sm:text-5xl lg:text-[64px] text-[#1A1414] tracking-[-0.035em] text-balance"
          >
            <WordReveal text={t('hero_claim_title_p1', 'Daftarkan')} />{' '}
            <WordReveal text={t('hero_claim_title_highlight', 'nama tokomu')} className="text-[#800C19]" />{' '}
            <WordReveal text={t('hero_claim_title_p2', 'sekarang!')} />
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-[15px] sm:text-base text-[#5F5652] max-w-md mx-auto lg:mx-0 leading-relaxed"
          >
            {t(
              'hero_claim_subtitle',
              'Dengan LapakQ, siapa pun bisa punya toko online sendiri. Ketik nama usahamu dan lihat alamat tokomu langsung jadi.',
            )}
          </motion.p>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="mt-7 max-w-lg mx-auto lg:mx-0">
            <label htmlFor={inputId} className="sr-only">
              {t('hero_store_input_label', 'Nama toko')}
            </label>
            <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-5 border border-[#E4DCDC] shadow-[0_18px_40px_-20px_rgba(102,0,14,0.35)] focus-within:border-[#800C19] focus-within:ring-4 focus-within:ring-[#800C19]/10 transition-all">
              <Store className="hidden sm:block w-4 h-4 shrink-0 text-[#B5A9A6]" aria-hidden="true" />
              <input
                id={inputId}
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value.slice(0, STORE_NAME_MAX))}
                maxLength={STORE_NAME_MAX}
                autoComplete="organization"
                aria-describedby={hintId}
                placeholder={t('hero_store_input_placeholder', 'Contoh: Toko Sari Jaya')}
                className="min-w-0 flex-1 bg-transparent text-sm sm:text-base text-[#1A1414] placeholder:text-[#B5A9A6] focus:outline-none"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.96 }}
                className="group shrink-0 inline-flex items-center gap-1.5 h-11 px-4 sm:px-6 rounded-full bg-[#800C19] hover:bg-[#66000E] text-white text-sm font-medium transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">{t('hero_store_submit', 'Buat Toko')}</span>
                <span className="sm:hidden">{t('hero_store_submit_short', 'Mulai')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
            <p id={hintId} className="mt-3 text-xs text-[#5F5652]">
              {t('hero_store_hint', 'Daftar gratis. Alamat tokomu nanti:')}{' '}
              <span className="font-medium text-[#1A1414] break-all">
                {slug || t('hero_store_slug_example', 'tokomu')}.{STORE_DOMAIN}
              </span>
            </p>
          </motion.form>

          <motion.div variants={fadeUp} className="mt-6">
            <button
              type="button"
              onClick={onScrollToHowItWorks}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#1A1414] hover:text-[#800C19] transition-colors cursor-pointer"
            >
              {t('hero_cta_how', 'Lihat Cara Kerja')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </motion.div>

        {/* ═══════ Kanan: ilustrasi laptop toko 3D ═══════ */}
        <motion.div className="relative lg:col-span-6" style={{ y: sceneY }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_SMOOTH, delay: 0.2 }}
          >
            <HeroIllustration pointerX={pointer.x} pointerY={pointer.y} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
