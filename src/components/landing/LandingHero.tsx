import React, { useId, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight, Bell, CheckCircle2, Globe, QrCode, Store, type LucideIcon } from 'lucide-react';
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

interface PointerProps {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}

/** Domain induk toko merchant. */
const STORE_DOMAIN = 'lapakq.com';
/** Panjang maksimal nama toko yang boleh diketik di hero. */
const STORE_NAME_MAX = 60;

/** Aset 3D yang bayangan lantainya sudah dibersihkan (WebP 512px). */
const asset3d = (name: string) => `/assets/3d/clean/${name}.webp`;

/** Sama dengan aturan slug otomatis di modal pengaturan toko: huruf kecil, angka, dan tanda hubung. */
const toStoreSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

/** Elemen ilustrasi yang ikut bergeser mengikuti kursor; `depth` = jarak geser (px). */
const Parallax: React.FC<PointerProps & { depth: number; className?: string; children: React.ReactNode }> = ({
  pointerX,
  pointerY,
  depth,
  className,
  children,
}) => {
  const x = useTransform(pointerX, (v) => v * depth);
  const y = useTransform(pointerY, (v) => v * depth);
  return (
    <motion.div className={`absolute ${className ?? ''}`} style={{ x, y }}>
      {children}
    </motion.div>
  );
};

/** Gerak melayang naik-turun (dan sedikit berputar) dengan ritme masing-masing. */
const Float: React.FC<{ duration: number; y?: number; rotate?: number; delay?: number; children: React.ReactNode }> = ({
  duration,
  y = 10,
  rotate = 0,
  delay = 0,
  children,
}) => (
  <motion.div
    animate={{ y: [0, -y, 0], rotate: [0, rotate, 0] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
  >
    {children}
  </motion.div>
);

/** Muncul menajam saat halaman dibuka. */
const popIn = (delay: number) => ({
  initial: { opacity: 0, scale: 0.7, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  transition: { duration: 0.9, ease: EASE_SMOOTH, delay },
});

/**
 * Ikon garis yang "diekstrusi" jadi 3D: salinan ikon ditumpuk bergeser diagonal dengan warna sisi,
 * lalu muka depan di atasnya. Ukuran mengikuti lebar induk.
 */
const ExtrudedIcon: React.FC<{ icon: LucideIcon; face: string; side: string; layers?: number }> = ({
  icon: Icon,
  face,
  side,
  layers = 8,
}) => (
  <div className="relative w-full aspect-square">
    {Array.from({ length: layers }, (_, i) => (
      <Icon
        key={i}
        aria-hidden
        className="absolute inset-0 w-full h-full"
        style={{ color: side, transform: `translate(${(layers - i) * 0.7}%, ${(layers - i) * 0.7}%)` }}
        strokeWidth={2.4}
      />
    ))}
    <Icon aria-hidden className="absolute inset-0 w-full h-full" style={{ color: face }} strokeWidth={2.4} />
  </div>
);

/** Pil keterangan putih kecil (disembunyikan di layar sempit agar tidak berdesakan). */
const InfoPill: React.FC<PointerProps & { className: string; depth: number; delay: number; children: React.ReactNode }> = ({
  className,
  depth,
  delay,
  children,
  ...pointer
}) => (
  <Parallax {...pointer} depth={depth} className={`hidden sm:block ${className}`}>
    <motion.div {...popIn(delay)}>
      <Float duration={5} y={6} delay={delay * 0.4}>
        <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-[0_14px_30px_-12px_rgba(102,0,14,0.35)]">
          {children}
        </div>
      </Float>
    </motion.div>
  </Parallax>
);

/* ─────────────── Ilustrasi 3D: toko, ban berjalan, koin ─────────────── */

/** Kardus yang berjalan di ban berjalan menuju toko, berurutan dengan jeda. */
const CONVEYOR_BOXES = [0, 2.2, 4.4];
const CONVEYOR_DURATION = 6.6;

const Conveyor: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const boxClass =
    'absolute bottom-[30%] left-0 w-[24%] -rotate-[20deg] drop-shadow-[0_10px_10px_rgba(0,0,0,0.18)]';
  return (
    // Ban berjalan menurun dari kiri atas menuju sisi toko.
    <div className="absolute left-[-2%] top-[8%] w-[46%] h-[16%] rotate-[20deg] origin-left">
      <div
        className="absolute inset-x-0 bottom-0 h-[38%] rounded-full bg-white border border-[#E4DCDC] shadow-[inset_0_-6px_0_#EBD9DC,0_18px_24px_-12px_rgba(102,0,14,0.35)]"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(102,0,14,0.07) 0 2px, transparent 2px 20px)',
        }}
      />
      {reduceMotion ? (
        <img src={asset3d('cardboard_box')} alt="" draggable={false} className={`${boxClass} left-[45%]`} />
      ) : (
        CONVEYOR_BOXES.map((delay) => (
          <motion.img
            key={delay}
            src={asset3d('cardboard_box')}
            alt=""
            draggable={false}
            className={boxClass}
            initial={{ x: '-30%', opacity: 0 }}
            animate={{ x: ['-30%', '310%'], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: CONVEYOR_DURATION,
              times: [0, 0.12, 0.85, 1],
              repeat: Infinity,
              ease: 'linear',
              delay,
            }}
          />
        ))
      )}
    </div>
  );
};

/** Koin Rupiah yang menggelinding masuk lalu berhenti di depan toko. */
const RollingCoin: React.FC = () => (
  <motion.div
    className="absolute right-[4%] bottom-[14%] w-[13%] aspect-square"
    initial={{ x: '140%', rotate: 220, opacity: 0 }}
    animate={{ x: '0%', rotate: 0, opacity: 1 }}
    transition={{ duration: 1.6, ease: EASE_SMOOTH, delay: 0.9 }}
  >
    <Float duration={4} y={6} rotate={-6} delay={2.4}>
      <div className="relative w-full aspect-square rounded-full bg-[#D9A21C] shadow-[0_16px_20px_-10px_rgba(102,0,14,0.45)]">
        <div className="absolute inset-0 -translate-x-[7%] rounded-full bg-gradient-to-br from-[#FFE9A8] via-[#F7C948] to-[#E3A92A] flex items-center justify-center">
          <div className="absolute inset-[12%] rounded-full border-2 border-[#C98A12]/40" />
          <span className="text-[clamp(10px,2.2vw,22px)] font-bold text-[#8A5A00]">Rp</span>
        </div>
      </div>
    </Float>
  </motion.div>
);

const HeroScene: React.FC<PointerProps & { slug: string; t: (key: string, fallback: string) => string }> = ({
  slug,
  t,
  ...pointer
}) => (
  // Rasio 1:1 lewat style, bukan kelas `aspect-square`: CSS global memaksa `.aspect-square img` jadi 100%.
  <div className="relative w-full max-w-[560px] mx-auto select-none" style={{ aspectRatio: '1 / 1' }} aria-hidden="true">
    {/* Lingkaran latar lembut */}
    <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#FFE3EA_0%,#FFF1F4_45%,rgba(255,255,255,0)_72%)]" />

    <Parallax {...pointer} depth={8} className="inset-0">
      <Conveyor />
    </Parallax>

    {/* Lantai/panggung toko */}
    <Parallax {...pointer} depth={10} className="left-[22%] right-[6%] bottom-[10%] h-[22%]">
      <motion.div
        className="w-full h-full rounded-[50%] bg-gradient-to-b from-[#F5E8EA] to-[#EBD9DC] shadow-[0_30px_40px_-24px_rgba(102,0,14,0.45)]"
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1, ease: EASE_SMOOTH, delay: 0.2 }}
      />
    </Parallax>

    {/* Toko utama */}
    <Parallax {...pointer} depth={14} className="left-[26%] right-[8%] top-[18%]">
      <motion.div {...popIn(0.3)}>
        <Float duration={6} y={8}>
          <img
            src={asset3d('mini_storefront')}
            alt=""
            draggable={false}
            className="w-full object-contain drop-shadow-[0_26px_30px_rgba(102,0,14,0.3)]"
          />
        </Float>
      </motion.div>
    </Parallax>

    {/* Alamat toko yang ikut berubah saat nama diketik */}
    <Parallax {...pointer} depth={22} className="left-[30%] top-[6%] max-w-[66%]">
      <motion.div {...popIn(0.55)}>
        <Float duration={5.2} y={6}>
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_14px_30px_-12px_rgba(102,0,14,0.4)]">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#800C19]" />
            <span className="truncate text-[11px] sm:text-sm font-medium text-[#1A1414]">
              <span className="text-[#800C19]">{slug || t('hero_store_slug_example', 'tokomu')}</span>.{STORE_DOMAIN}
            </span>
          </div>
        </Float>
      </motion.div>
    </Parallax>

    <Parallax {...pointer} depth={26} className="right-[2%] top-[22%] w-[11%]">
      <motion.div {...popIn(0.7)}>
        <Float duration={3.8} y={10} rotate={8} delay={0.4}>
          <div className="rotate-12">
            <ExtrudedIcon icon={QrCode} face="#800C19" side="#3F0009" />
          </div>
        </Float>
      </motion.div>
    </Parallax>

    <Parallax {...pointer} depth={20} className="left-[6%] bottom-[12%] w-[18%]">
      <motion.div {...popIn(0.8)}>
        <Float duration={5} y={9} rotate={-6} delay={0.3}>
          <img
            src={asset3d('red_bags')}
            alt=""
            draggable={false}
            className="w-full object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.25)]"
          />
        </Float>
      </motion.div>
    </Parallax>

    <RollingCoin />

    <InfoPill {...pointer} depth={18} delay={1} className="left-[4%] top-[48%]">
      <span className="relative flex w-6 h-6 items-center justify-center rounded-full bg-[#800C19] text-white">
        <Bell className="w-3.5 h-3.5" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F7C948] animate-ping" />
      </span>
      <span className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
        {t('hero_badge_new_orders', '+8 Pesanan Baru')}
      </span>
    </InfoPill>

    <InfoPill {...pointer} depth={24} delay={1.15} className="right-[12%] bottom-[2%]">
      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      <div className="leading-tight">
        <p className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
          {t('hero_badge_payment_success', 'Pembayaran Berhasil')}
        </p>
        <p className="text-[10px] text-[#706866]">{t('hero_badge_qris_bank', 'QRIS & Bank')}</p>
      </div>
    </InfoPill>
  </div>
);

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
  const pointerProps: PointerProps = { pointerX: pointer.x, pointerY: pointer.y };

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
                placeholder={t('hero_store_input_placeholder', 'Contoh: Kue Bu Sari')}
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

        {/* ═══════ Kanan: ilustrasi toko 3D ═══════ */}
        <motion.div className="relative lg:col-span-6" style={{ y: sceneY }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_SMOOTH, delay: 0.2 }}
          >
            <HeroScene {...pointerProps} slug={slug} t={t} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
