import React, { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ArrowRight, Bell, CheckCircle2, QrCode, ShoppingBag, Sparkle, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_SMOOTH, WordReveal, fadeUp, stagger, usePointerParallax } from './landingMotion';

interface LandingHeroProps {
  onNavigateRegister: () => void;
  onNavigateLogin: () => void;
  onLaunchDemo: () => void;
  onScrollToHowItWorks: () => void;
  isAuthenticated?: boolean;
}

interface PointerProps {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}

/** Elemen ilustrasi yang ikut bergeser mengikuti kursor; `depth` = jarak geser (px). */
const Parallax: React.FC<PointerProps & { depth: number; className?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({
  pointerX,
  pointerY,
  depth,
  className,
  style,
  children,
}) => {
  const x = useTransform(pointerX, (v) => v * depth);
  const y = useTransform(pointerY, (v) => v * depth);
  return (
    <motion.div className={`absolute ${className ?? ''}`} style={{ ...style, x, y }}>
      {children}
    </motion.div>
  );
};

/**
 * Ikon garis yang "diekstrusi" jadi 3D: salinan ikon ditumpuk bergeser diagonal dengan warna sisi,
 * lalu muka depan di atasnya. Ukuran mengikuti lebar induk, jadi ikut mengecil di layar sempit.
 */
const ExtrudedIcon: React.FC<{ icon: LucideIcon; face: string; side: string; layers?: number; strokeWidth?: number }> = ({
  icon: Icon,
  face,
  side,
  layers = 10,
  strokeWidth = 2.6,
}) => (
  <div className="relative w-full aspect-square">
    {Array.from({ length: layers }, (_, i) => (
      <Icon
        key={i}
        aria-hidden
        className="absolute inset-0 w-full h-full"
        style={{ color: side, transform: `translate(${(layers - i) * 0.7}%, ${(layers - i) * 0.7}%)` }}
        strokeWidth={strokeWidth}
      />
    ))}
    <Icon aria-hidden className="absolute inset-0 w-full h-full" style={{ color: face }} strokeWidth={strokeWidth} />
  </div>
);

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

/** Muncul menajam setelah kartu utama mendarat. */
const popIn = (delay: number) => ({
  initial: { opacity: 0, scale: 0.6, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  transition: { duration: 0.9, ease: EASE_SMOOTH, delay },
});

const FLOATING_PRODUCTS = [
  // Di layar sempit kartu lebih tinggi, jadi sebagian produk disembunyikan agar tidak berdesakan.
  { img: 'kraft_pouch', className: 'hidden sm:block left-[4%] top-[12%] w-[7%]', depth: 26, duration: 5.2, rotate: -8 },
  { img: 'green_mug', className: 'left-[40%] bottom-[8%] w-[6.5%]', depth: 20, duration: 4.6, rotate: 6 },
  { img: 'blue_bottle', className: 'hidden sm:block right-[6%] bottom-[8%] w-[5%]', depth: 30, duration: 5.8, rotate: 10 },
  { img: 'cardboard_box', className: 'right-[5%] top-[40%] w-[7%]', depth: 16, duration: 4.2, rotate: -6 },
];

const SPARKLES = [
  { className: 'left-[36%] top-[18%] w-[2.2%]', delay: 0 },
  { className: 'left-[12%] bottom-[16%] w-[1.6%]', delay: 1.1 },
  { className: 'right-[16%] top-[42%] w-[1.8%]', delay: 2.2 },
];

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigateRegister, onScrollToHowItWorks }) => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const pointer = usePointerParallax();
  const pointerProps: PointerProps = { pointerX: pointer.x, pointerY: pointer.y };

  // Saat hero digulir, tumpukan kartu meluruskan diri dan sedikit membesar.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const frontRotate = useTransform(scrollYProgress, [0, 0.6], [-2.5, 0]);
  const frontScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.04]);
  const pinkRotate = useTransform(scrollYProgress, [0, 0.6], [-6, -9]);
  const yellowRotate = useTransform(scrollYProgress, [0, 0.6], [-1, 2.5]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      {...pointer.handlers}
      // Navbar landing berposisi fixed (tinggi 64–72px), jadi jarak atas sudah memperhitungkannya.
      className="relative overflow-hidden bg-white pt-[112px] sm:pt-[132px] lg:pt-[150px] pb-16 sm:pb-20 font-sans"
    >
      {/* ═══════ Judul & tombol (terpusat) ═══════ */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center"
        style={{ y: textY }}
        variants={stagger(0.1, 0.05)}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={stagger(0.06)}
          className="font-medium text-[34px] leading-[1.12] sm:text-5xl lg:text-[60px] text-[#1A1414] tracking-[-0.03em] text-balance"
        >
          <WordReveal text={t('hero_title_p1', 'Bikin Toko Online,')} />{' '}
          <WordReveal text={t('hero_title_highlight', 'Semudah Mengelola')} className="text-[#800C19]" />{' '}
          <WordReveal text={t('hero_title_p2', 'Toko Sendiri')} />
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-5 text-[15px] sm:text-base text-[#5F5652] max-w-md mx-auto leading-relaxed">
          {t('hero_subtitle', 'Kelola produk, pesanan, dan pembayaran otomatis dalam satu aplikasi.')}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.button
            type="button"
            onClick={onNavigateRegister}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-[#800C19] hover:bg-[#66000E] text-white font-medium text-sm shadow-[0_8px_20px_-8px_rgba(128,12,25,0.6)] transition-colors cursor-pointer"
          >
            {t('hero_cta_primary', 'Mulai Gratis')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
          <motion.button
            type="button"
            onClick={onScrollToHowItWorks}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto inline-flex items-center justify-center h-11 px-6 rounded-lg bg-white hover:bg-[#FAF7F7] text-[#1A1414] font-medium text-sm border border-[#E4DCDC] transition-colors cursor-pointer"
          >
            {t('hero_cta_how', 'Lihat Cara Kerja')}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ═══════ Tumpukan kartu berwarna dengan ilustrasi toko ═══════ */}
      <motion.div
        aria-hidden
        className="relative mt-14 sm:mt-16 lg:mt-20 max-w-[1120px] mx-auto px-4 sm:px-8 select-none"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE_SMOOTH, delay: 0.35 }}
      >
        <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/7.5]">
          {/* Kartu belakang: kuning lalu merah muda */}
          <motion.div
            className="absolute inset-0 -translate-y-[5%] rounded-[24px] sm:rounded-[40px] bg-[#F7C948]"
            style={{ rotate: yellowRotate }}
          />
          <motion.div
            className="absolute inset-0 -translate-y-[2%] -translate-x-[1%] rounded-[24px] sm:rounded-[40px] bg-[#F28CA6]"
            style={{ rotate: pinkRotate }}
          />

          {/* Kartu depan */}
          <motion.div
            className="absolute inset-0 rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(102,0,14,0.55)]"
            style={{
              rotate: frontRotate,
              scale: frontScale,
              background: 'radial-gradient(120% 90% at 20% 30%, #A3182A 0%, #800C19 45%, #5A0510 100%)',
            }}
          >
            {/* Tekstur titik halus */}
            <div
              className="absolute inset-0 opacity-[0.12]"
              style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '14px 14px' }}
            />

            {/* Garis lengkung putih yang tergambar */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 470" preserveAspectRatio="none" fill="none">
              <motion.path
                d="M 380,330 C 470,300 560,320 640,280 S 820,180 980,210"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: EASE_SMOOTH, delay: 1 }}
              />
              <motion.path
                d="M 520,0 L 520,120"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: EASE_SMOOTH, delay: 1.2 }}
              />
            </svg>

            {/* Orbit: etalase toko di tengah, dua titik (pesanan & pembayaran) beredar */}
            <Parallax {...pointerProps} depth={12} className="left-[8%] top-[14%] w-[34%] aspect-square">
              <motion.div className="relative w-full h-full" {...popIn(0.9)}>
                <div className="absolute inset-0 rounded-full border border-white/25" />
                <div className="absolute inset-[16%] rounded-full border border-white/20" />
                <motion.div
                  className="absolute inset-0"
                  animate={reduceMotion ? undefined : { rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                >
                  <span className="absolute left-1/2 -top-[2.5%] w-[5%] aspect-square -translate-x-1/2 rounded-full bg-[#F7C948] shadow-[0_0_12px_rgba(247,201,72,0.8)]" />
                </motion.div>
                <motion.div
                  className="absolute inset-[16%]"
                  animate={reduceMotion ? undefined : { rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                >
                  <span className="absolute left-1/2 -bottom-[3%] w-[6%] aspect-square -translate-x-1/2 rounded-full bg-[#F28CA6]" />
                </motion.div>
                <div className="absolute inset-[24%] rounded-full bg-white/10 backdrop-blur-[2px]" />
                <div className="absolute inset-[18%] flex items-center justify-center">
                  <Float duration={5} y={8}>
                    <img src="/assets/3d/mini_storefront.png" alt="" className="w-full h-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]" />
                  </Float>
                </div>
              </motion.div>
            </Parallax>

            {/* Tas belanja 3D: ikon utama */}
            <Parallax {...pointerProps} depth={24} className="left-[52%] top-[16%] w-[25%]">
              <motion.div {...popIn(1.1)}>
                <Float duration={4.4} y={14} rotate={-5}>
                  <div className="-rotate-12">
                    <ExtrudedIcon icon={ShoppingBag} face="#FFC2D1" side="#E8573C" layers={12} />
                  </div>
                </Float>
              </motion.div>
            </Parallax>

            {/* Kode QRIS 3D kecil */}
            <Parallax {...pointerProps} depth={32} className="right-[6%] top-[10%] w-[12%]">
              <motion.div {...popIn(1.3)}>
                <Float duration={3.8} y={10} rotate={8} delay={0.4}>
                  <div className="rotate-12">
                    <ExtrudedIcon icon={QrCode} face="#FFE08A" side="#D9861C" layers={8} strokeWidth={2.4} />
                  </div>
                </Float>
              </motion.div>
            </Parallax>

            {/* Notifikasi pesanan baru */}
            <Parallax {...pointerProps} depth={18} className="left-[38%] top-[8%] hidden sm:block">
              <motion.div {...popIn(1.5)}>
                <Float duration={5.5} y={6} delay={0.8}>
                  <div className="flex items-center gap-2 rounded-full bg-white/95 pl-1.5 pr-3.5 py-1.5 shadow-lg">
                    <span className="relative flex w-6 h-6 items-center justify-center rounded-full bg-[#800C19] text-white">
                      <Bell className="w-3.5 h-3.5" />
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F7C948] animate-ping" />
                    </span>
                    <span className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
                      {t('hero_badge_new_orders', '+8 Pesanan Baru')}
                    </span>
                  </div>
                </Float>
              </motion.div>
            </Parallax>

            {/* Pembayaran berhasil */}
            <Parallax {...pointerProps} depth={22} className="right-[14%] bottom-[12%] hidden sm:block">
              <motion.div {...popIn(1.7)}>
                <Float duration={4.8} y={7} delay={1.2}>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div className="leading-tight">
                      <p className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
                        {t('hero_badge_payment_success', 'Pembayaran Berhasil')}
                      </p>
                      <p className="text-[10px] text-[#706866]">{t('hero_badge_qris_bank', 'QRIS & Bank')}</p>
                    </div>
                  </div>
                </Float>
              </motion.div>
            </Parallax>

            {/* Produk 3D yang melayang */}
            {FLOATING_PRODUCTS.map((p, i) => (
              <Parallax key={p.img} {...pointerProps} depth={p.depth} className={p.className}>
                <motion.div {...popIn(1.2 + i * 0.12)}>
                  <Float duration={p.duration} y={9} rotate={p.rotate} delay={i * 0.3}>
                    <img src={`/assets/3d/${p.img}.png`} alt="" className="w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.3)]" />
                  </Float>
                </motion.div>
              </Parallax>
            ))}

            {/* Kilau kecil */}
            {SPARKLES.map((s) => (
              <motion.div
                key={s.className}
                className={`absolute text-white ${s.className}`}
                animate={reduceMotion ? undefined : { scale: [0.6, 1.1, 0.6], opacity: [0.4, 1, 0.4], rotate: [0, 45, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
              >
                <Sparkle className="w-full h-full fill-current" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
