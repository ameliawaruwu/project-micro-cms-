import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  CreditCard,
  Package,
  QrCode,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_SMOOTH, RevealWord, WordReveal, fadeUp, stagger, usePointerParallax } from './landingMotion';

interface LandingHeroProps {
  onNavigateRegister: () => void;
  onNavigateLogin: () => void;
  onLaunchDemo: () => void;
  onScrollToHowItWorks: () => void;
  isAuthenticated?: boolean;
}

/* Garis penghubung dari etalase tengah ke tiap kartu (koordinat viewBox 660×600). */
const NETWORK_PATHS = [
  'M 330,290 C 240,210 160,150 120,110',
  'M 330,260 C 330,170 330,110 330,70',
  'M 330,290 C 420,210 500,150 540,110',
  'M 280,310 C 180,310 120,310 80,310',
  'M 380,310 C 480,310 540,310 580,310',
  'M 310,340 C 230,420 170,470 130,510',
  'M 350,340 C 430,420 490,470 530,510',
];

const SALES_BARS = ['h-[25%] bg-[#E8C5C8]', 'h-[45%] bg-[#D89B9E]', 'h-[65%] bg-[#B54B55]', 'h-[85%] bg-[#9A222E]', 'h-full bg-[#800C19]'];

const CUSTOMER_INITIALS = [
  { letter: 'A', color: '#93C5FD' },
  { letter: 'R', color: '#FCD34D' },
  { letter: 'S', color: '#6EE7B7' },
  { letter: 'D', color: '#C4B5FD' },
];

const ORDER_ITEMS = [
  { img: 'kraft_pouch', w1: 'w-full', w2: 'w-2/3' },
  { img: 'green_mug', w1: 'w-3/4', w2: 'w-1/2' },
  { img: 'blue_bottle', w1: 'w-5/6', w2: 'w-1/3' },
  { img: 'cardboard_box', w1: 'w-2/3', w2: 'w-1/2' },
];

/** Daftar "pesanan masuk" yang bergeser: pesanan baru muncul di atas, yang lama turun lalu hilang. */
const OrderFeed: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(1);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 3200);
    return () => window.clearInterval(id);
  }, [reduceMotion, inView]);

  return (
    <div ref={ref} className="relative h-[78px] overflow-hidden">
      <AnimatePresence initial={false} mode="popLayout">
        {[tick, tick - 1].map((n) => {
          const row = ORDER_ITEMS[n % ORDER_ITEMS.length];
          return (
            <motion.div
              key={n}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="flex items-center gap-2 bg-[#FAF7F7] rounded-lg p-1.5 border border-[#F0EAEB] mb-1.5"
            >
              <img src={`/assets/3d/${row.img}.png`} alt="" className="w-5 h-6 object-contain shrink-0" />
              <div className="flex-1 space-y-1">
                <div className={`h-1 bg-[#D8CECE] rounded-full ${row.w1}`} />
                <div className={`h-1 bg-[#EDE7E7] rounded-full ${row.w2}`} />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface FloatingCardProps {
  position: React.CSSProperties;
  delay: number;
  icon: LucideIcon;
  iconBg?: string;
  title: string;
  width?: number;
  /** Seberapa jauh kartu bergeser mengikuti kursor (px); kartu "dekat" bergerak lebih jauh. */
  depth: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  children: React.ReactNode;
}

/** Kartu ekosistem: muncul menajam, melayang dengan ritmenya sendiri, dan ikut parallax kursor. */
const FloatingCard: React.FC<FloatingCardProps> = ({
  position,
  delay,
  icon: Icon,
  iconBg = 'bg-[#800C19]',
  title,
  width = 130,
  depth,
  pointerX,
  pointerY,
  children,
}) => {
  const x = useTransform(pointerX, (v) => v * depth);
  const y = useTransform(pointerY, (v) => v * depth);
  // Durasi berbeda per kartu agar gerak melayangnya tidak serempak.
  const floatDuration = 4.2 + ((delay * 10) % 4) * 0.45;

  return (
    <motion.div
      className="absolute z-20"
      style={position}
      initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, ease: EASE_SMOOTH, delay }}
    >
      <motion.div style={{ x, y }}>
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.9 }}
        >
          <motion.div
            whileHover={{ y: -5, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative bg-white rounded-2xl p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] hover:shadow-xl transition-shadow duration-300"
            style={{ width }}
          >
            <div className={`absolute -top-2.5 -left-2.5 z-30 w-6 h-6 ${iconBg} rounded-full flex items-center justify-center shadow-md border-2 border-white`}>
              <Icon className="w-3 h-3 text-white" />
            </div>
            <p className="text-[10px] font-extrabold text-[#241A1A] ml-4 mb-1.5 truncate">{title}</p>
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const LandingHero: React.FC<LandingHeroProps> = ({
  onNavigateRegister,
  onScrollToHowItWorks,
}) => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const pointer = usePointerParallax();
  const cardMotion = { pointerX: pointer.x, pointerY: pointer.y };

  // Parallax scroll: teks dan ilustrasi bergeser dengan kecepatan berbeda saat hero digulir.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.3]);

  // Etalase miring mengikuti kursor, dari sudut dasarnya (-8°, 4°).
  const tiltY = useTransform(pointer.x, (v) => -8 + v * 7);
  const tiltX = useTransform(pointer.y, (v) => 4 - v * 6);
  const networkX = useTransform(pointer.x, (v) => v * 6);
  const networkY = useTransform(pointer.y, (v) => v * 6);

  // Judul sorotan: hanya kata terakhir yang bergaris bawah, agar garis tidak melebar saat judul terbungkus.
  const highlightWords = t('hero_title_highlight', 'Semudah Mengelola').split(' ');
  const highlightLast = highlightWords.pop() ?? '';
  const highlightLead = highlightWords.join(' ');

  const chips = [
    { icon: QrCode, label: t('hero_chip_qris', 'Bayar QRIS') },
    { icon: Truck, label: t('hero_chip_shipping', 'Ongkir otomatis') },
    { icon: Package, label: t('hero_chip_tracking', 'Lacak resi') },
  ];

  return (
    <section
      ref={sectionRef}
      id="hero"
      {...pointer.handlers}
      className="relative min-h-[calc(100svh-64px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center pt-8 pb-20 sm:py-12 lg:py-16 overflow-hidden bg-[#FAFAFA] font-sans"
    >
      {/* Latar: dua bias warna lembut yang bergerak perlahan */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#66000E]/[0.06] blur-[90px] pointer-events-none"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 right-0 w-[480px] h-[480px] rounded-full bg-[#F5E8EA] blur-[100px] pointer-events-none"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0 items-center">

          {/* ═══════ KIRI: judul, satu kalimat, tombol ═══════ */}
          <motion.div
            className="lg:col-span-5 space-y-6 text-center lg:text-left z-20 py-10"
            style={{ y: textY, opacity: heroFade }}
            variants={stagger(0.12, 0.1)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DDDE] text-[#66000E] text-xs font-medium shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero_umkm_badge', 'Solusi Toko Online UMKM')}</span>
            </motion.div>

            <motion.h1
              variants={stagger(0.07)}
              className="font-extrabold text-4xl sm:text-5xl lg:text-[52px] text-[#241A1A] tracking-tight leading-[1.15]"
            >
              <span className="block">
                <WordReveal text={t('hero_title_p1', 'Bikin Toko Online,')} />
              </span>
              <span className="block text-[#66000E] italic">
                {highlightLead && <WordReveal text={highlightLead} />}
                {highlightLead && ' '}
                <RevealWord className="relative">
                  {highlightLast}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#66000E]/30" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden>
                    <motion.path
                      d="M2,8 Q50,13 98,3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 1.1, ease: EASE_SMOOTH }}
                    />
                  </svg>
                </RevealWord>
              </span>
              <span className="block">
                <WordReveal text={t('hero_title_p2', 'Toko Sendiri')} />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[15px] lg:text-base text-[#5F5652] max-w-[400px] mx-auto lg:mx-0 leading-relaxed">
              {t('hero_subtitle', 'Kelola produk, pesanan, dan pembayaran otomatis dalam satu aplikasi.')}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <motion.button
                type="button"
                onClick={onNavigateRegister}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 lg:h-13 px-8 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-[#66000E]/25 transition-colors cursor-pointer"
              >
                {/* Kilau yang menyapu tombol sesekali */}
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1/3 -skew-x-12 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)' }}
                  initial={{ x: '-150%' }}
                  animate={{ x: '450%' }}
                  transition={{ duration: 1.3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4, delay: 1.8 }}
                />
                <span className="relative">{t('hero_cta_primary', 'Mulai Gratis')}</span>
                <ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <motion.button
                type="button"
                onClick={onScrollToHowItWorks}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 lg:h-13 px-8 rounded-full bg-white hover:bg-[#FAF7F7] text-[#241A1A] font-semibold text-sm border border-[#E8DDDE] shadow-sm transition-colors cursor-pointer"
              >
                {t('hero_cta_how', 'Lihat Cara Kerja')}
              </motion.button>
            </motion.div>

            <motion.ul variants={stagger(0.1)} className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs font-medium text-[#5F5652]">
              {chips.map(({ icon: Icon, label }) => (
                <motion.li key={label} variants={fadeUp} className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  {label}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>


          {/* ═══════ KANAN: etalase 3D & ekosistem ═══════ */}
          <motion.div
            className="lg:col-span-7 relative flex justify-center items-center min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] w-full select-none"
            style={{ y: visualY }}
            aria-hidden
          >

            {/* Skala diperkecil di layar sempit */}
            <div className="relative w-full max-w-[560px] h-[440px] sm:h-[480px] flex items-center justify-center scale-[0.72] sm:scale-[0.82] lg:scale-[0.88] origin-center">

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#66000E]/[0.04] blur-[70px] pointer-events-none" />

              {/* Garis jaringan (tergambar bertahap) + denyut cahaya */}
              <motion.svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
                style={{ x: networkX, y: networkY }}
                viewBox="0 0 660 600"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.6, ease: EASE_SMOOTH }}
              >
                <defs>
                  <linearGradient id="rose-pulse" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#800C19" stopOpacity="0" />
                    <stop offset="50%" stopColor="#800C19" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#800C19" stopOpacity="0" />
                  </linearGradient>
                  <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <style>
                  {`
                    .synapse-pulse {
                      stroke-dasharray: 50 350;
                      animation: synapse-flow 4s linear infinite;
                    }
                    @keyframes synapse-flow {
                      0% { stroke-dashoffset: 400; opacity: 0; }
                      20% { opacity: 1; }
                      80% { opacity: 1; }
                      100% { stroke-dashoffset: 0; opacity: 0; }
                    }
                    @media (prefers-reduced-motion: reduce) {
                      .synapse-pulse { animation: none; opacity: 0; }
                    }
                  `}
                </style>

                <g stroke="#E8C5C8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3">
                  {NETWORK_PATHS.map((d, i) => (
                    <motion.path
                      key={d}
                      d={d}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.1, delay: 0.5 + i * 0.07, ease: EASE_SMOOTH }}
                    />
                  ))}
                </g>

                <g stroke="url(#rose-pulse)" strokeWidth="3" strokeLinecap="round" filter="url(#node-glow)">
                  {NETWORK_PATHS.slice(0, 6).map((d, i) => (
                    <path key={d} className="synapse-pulse" style={{ animationDelay: `${i * 0.6}s` }} d={d} />
                  ))}
                </g>
              </motion.svg>


              {/* Etalase tengah: muncul menajam, melayang pelan, dan miring mengikuti kursor */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 40, scale: 0.92, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, ease: EASE_SMOOTH, delay: 0.2 }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.3 }}
                >
                  <motion.div
                    className="relative"
                    style={{ width: 290, rotateX: tiltX, rotateY: tiltY, transformPerspective: 1000 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  >
                    <div className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(128,12,25,0.2)] border border-[#EADBDB] overflow-hidden flex flex-col" style={{ height: 220 }}>

                      <div className="bg-[#800C19] px-3.5 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                        </div>
                        <span className="text-[10px] font-bold text-white/80 flex items-center gap-1">
                          <Store className="w-3 h-3 text-white" /> Toko Saya
                        </span>
                      </div>

                      {/* Kanopi bergaris */}
                      <div className="h-4 w-full flex shadow-inner">
                        {Array.from({ length: 18 }, (_, i) => (
                          <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#800C19]' : 'bg-white'}`} />
                        ))}
                      </div>

                      <div className="flex-1 bg-[#FAF7F7] p-3 flex gap-2.5">
                        <div className="w-7 flex flex-col items-center gap-2.5 pt-1 border-r border-[#EADBDB] pr-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#800C19]" />
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>

                        <div className="flex-1 grid grid-cols-12 gap-2">
                          <div className="col-span-7 grid grid-cols-2 gap-1.5">
                            {['kraft_pouch', 'green_mug', 'blue_bottle', 'cardboard_box'].map((name, i) => (
                              <motion.div
                                key={name}
                                className="bg-white rounded-lg p-1 border border-[#EADBDB] flex items-center justify-center h-10 shadow-2xs overflow-hidden"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.7 + i * 0.08 }}
                              >
                                <img src={`/assets/3d/${name}.png`} alt="" className="h-8 w-full object-contain drop-shadow-xs" />
                              </motion.div>
                            ))}
                          </div>

                          <div className="col-span-5 bg-white rounded-xl p-2 border border-[#EADBDB] shadow-2xs flex flex-col justify-between">
                            <div>
                              <p className="text-[7px] font-semibold text-[#706866]">Total Penjualan</p>
                              <div className="h-2.5 bg-[#241A1A]/20 rounded-full w-full my-1.5" />
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <div className="h-1.5 bg-emerald-500/30 rounded-full w-8" />
                              </div>
                            </div>
                            <div className="flex items-end gap-0.5 h-7 pt-1">
                              {['h-[30%] bg-[#F5E2E4]', 'h-[50%] bg-[#E8C5C8]', 'h-[40%] bg-[#D89B9E]', 'h-[70%] bg-[#B54B55]', 'h-[95%] bg-[#800C19]'].map((bar, i) => (
                                <motion.div
                                  key={bar}
                                  className={`flex-1 rounded-t-xs origin-bottom ${bar}`}
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.9 + i * 0.08 }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aksesori 3D */}
                    <div className="absolute -bottom-8 -left-10 z-20 transition-transform hover:scale-105">
                      <img src="/assets/3d/red_bags.png" alt="" className="w-14 h-14 object-contain drop-shadow-xl" />
                    </div>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-30 transition-transform hover:scale-105">
                      <img src="/assets/3d/mini_storefront.png" alt="" className="w-20 h-20 object-contain drop-shadow-2xl" />
                    </div>
                    <motion.div
                      className="absolute -bottom-7 right-0 z-20"
                      animate={{ y: [0, -6, 0], rotate: [0, -4, 0] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <img src="/assets/3d/cardboard_box.png" alt="" className="w-12 h-12 object-contain drop-shadow-xl" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>


              {/* Kartu ekosistem di sekeliling etalase (depth = jarak parallax kursor) */}
              <FloatingCard position={{ top: '4%', left: '2%' }} delay={0.5} depth={18} {...cardMotion} icon={ShoppingBag} title="Katalog Produk">
                <div className="flex items-end justify-center gap-1 bg-[#FAF7F7] rounded-xl p-1 border border-[#F0EAEB] h-10 overflow-hidden">
                  <img src="/assets/3d/kraft_pouch.png" alt="" className="h-8 object-contain" />
                  <img src="/assets/3d/green_mug.png" alt="" className="h-8 object-contain" />
                </div>
              </FloatingCard>

              <FloatingCard position={{ top: '0%', left: '38%' }} delay={0.6} depth={12} {...cardMotion} icon={Bell} title="Pesanan Masuk" width={135}>
                <span className="absolute -top-1 left-2.5 z-40 flex w-2.5 h-2.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                </span>
                <OrderFeed />
              </FloatingCard>

              <FloatingCard position={{ top: '6%', right: '2%' }} delay={0.7} depth={20} {...cardMotion} icon={CreditCard} iconBg="bg-[#1E75C0]" title="Pembayaran">
                <div className="flex items-center gap-2 bg-[#E8F5E9] rounded-xl p-2 border border-emerald-200">
                  <div className="relative w-5 h-5 shrink-0">
                    {!reduceMotion && (
                      <motion.span
                        className="absolute inset-0 rounded-full bg-emerald-400"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 1.6 }}
                      />
                    )}
                    <div className="relative w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  <p className="text-[8px] font-extrabold text-emerald-800 leading-tight">Pembayaran<br />Berhasil</p>
                </div>
              </FloatingCard>

              <FloatingCard position={{ top: '40%', left: '-2%' }} delay={0.8} depth={24} {...cardMotion} icon={BarChart3} title="Laporan Penjualan" width={135}>
                <div className="flex items-end justify-between h-11 px-1 bg-[#FAF7F7] rounded-xl p-1.5 border border-[#F0EAEB]">
                  {SALES_BARS.map((bar, i) => (
                    <motion.div
                      key={bar}
                      className={`w-3 rounded-t-xs origin-bottom ${bar}`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 1.2 + i * 0.08 }}
                    />
                  ))}
                </div>
              </FloatingCard>

              <FloatingCard position={{ top: '40%', right: '-2%' }} delay={0.9} depth={22} {...cardMotion} icon={Truck} title="Pengiriman">
                <div className="flex flex-col items-center bg-[#FAF7F7] rounded-xl p-2 border border-[#F0EAEB]">
                  <img src="/assets/3d/cardboard_box.png" alt="" className="w-8 h-8 object-contain mb-1" />
                  <p className="text-[7px] font-semibold text-[#706866] mb-1">Dalam Pengiriman</p>
                  <div className="w-full h-1.5 bg-[#EADBDB] rounded-full relative">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-[#800C19] rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '66%' }}
                      transition={{ duration: 1.6, delay: 1.3, ease: EASE_SMOOTH }}
                    />
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard position={{ bottom: '2%', left: '4%' }} delay={1.0} depth={16} {...cardMotion} icon={Users} title="Pelanggan">
                <div className="flex items-center justify-between bg-[#FAF7F7] p-1.5 rounded-xl border border-[#F0EAEB]">
                  <div className="flex items-center -space-x-1.5">
                    {CUSTOMER_INITIALS.map(({ letter, color }, i) => (
                      <motion.div
                        key={letter}
                        className="w-5 h-5 rounded-full border-2 border-white shadow-2xs flex items-center justify-center text-[8px] font-bold text-[#241A1A]"
                        style={{ backgroundColor: color }}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: EASE_SMOOTH, delay: 1.3 + i * 0.08 }}
                      >
                        {letter}
                      </motion.div>
                    ))}
                  </div>
                  <div className="w-4 h-4 rounded-full bg-white border border-[#D8CECE] flex items-center justify-center text-[9px] font-bold text-[#706866]">
                    +
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard position={{ bottom: '2%', right: '4%' }} delay={1.1} depth={14} {...cardMotion} icon={Package} title="Stok" width={135}>
                <div className="grid grid-cols-3 gap-1 bg-[#FAF7F7] p-1.5 rounded-xl border border-[#F0EAEB] items-end">
                  {[
                    { img: 'green_mug', dot: 'bg-emerald-500' },
                    { img: 'kraft_pouch', dot: 'bg-red-500' },
                    { img: 'blue_bottle', dot: 'bg-sky-500' },
                  ].map((item) => (
                    <div key={item.img} className="flex flex-col items-center">
                      <img src={`/assets/3d/${item.img}.png`} alt="" className="w-6 h-7 object-contain mb-0.5" />
                      <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                    </div>
                  ))}
                </div>
              </FloatingCard>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
