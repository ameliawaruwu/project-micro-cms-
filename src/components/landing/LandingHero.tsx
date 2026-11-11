import React from 'react';
import { motion } from 'motion/react';
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
import { fadeUp, stagger } from './landingMotion';

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

interface FloatingCardProps {
  position: React.CSSProperties;
  delay: number;
  icon: LucideIcon;
  iconBg?: string;
  title: string;
  width?: number;
  children: React.ReactNode;
}

/** Kartu ekosistem yang "muncul" lalu melayang pelan di sekitar etalase. */
const FloatingCard: React.FC<FloatingCardProps> = ({
  position,
  delay,
  icon: Icon,
  iconBg = 'bg-[#800C19]',
  title,
  width = 130,
  children,
}) => (
  <motion.div
    className="absolute z-20"
    style={position}
    initial={{ opacity: 0, scale: 0.6, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 220, damping: 18, delay }}
  >
    <div className="animate-float-subtle" style={{ animationDelay: `${delay}s` }}>
      <motion.div
        whileHover={{ y: -4, scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative bg-white rounded-2xl p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] hover:shadow-xl transition-shadow"
        style={{ width }}
      >
        <div className={`absolute -top-2.5 -left-2.5 z-30 w-6 h-6 ${iconBg} rounded-full flex items-center justify-center shadow-md border-2 border-white`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <p className="text-[10px] font-extrabold text-[#241A1A] ml-4 mb-1.5 truncate">{title}</p>
        {children}
      </motion.div>
    </div>
  </motion.div>
);

export const LandingHero: React.FC<LandingHeroProps> = ({
  onNavigateRegister,
  onScrollToHowItWorks,
}) => {
  const { t } = useLanguage();

  const chips = [
    { icon: QrCode, label: t('hero_chip_qris', 'Bayar QRIS') },
    { icon: Truck, label: t('hero_chip_shipping', 'Ongkir otomatis') },
    { icon: Package, label: t('hero_chip_tracking', 'Lacak resi') },
  ];

  return (
    <section
      id="hero"
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
            variants={stagger(0.12, 0.1)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DDDE] text-[#66000E] text-xs font-medium shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('hero_umkm_badge', 'Solusi Toko Online UMKM')}</span>
            </motion.div>

            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-[52px] text-[#241A1A] tracking-tight leading-[1.15]">
              <motion.span variants={fadeUp} className="block">
                {t('hero_title_p1', 'Bikin Toko Online,')}
              </motion.span>
              <motion.span variants={fadeUp} className="block">
                <span className="text-[#66000E] relative inline-block italic">
                  {t('hero_title_highlight', 'Semudah Mengelola')}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#66000E]/25" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden>
                    <motion.path
                      d="M0,6 Q50,12 100,2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, delay: 0.7, ease: 'easeOut' }}
                    />
                  </svg>
                </span>
              </motion.span>
              <motion.span variants={fadeUp} className="block">
                {t('hero_title_p2', 'Toko Sendiri')}
              </motion.span>
            </h1>

            <motion.p variants={fadeUp} className="text-[15px] lg:text-base text-[#5F5652] max-w-[400px] mx-auto lg:mx-0 leading-relaxed">
              {t('hero_subtitle', 'Kelola produk, pesanan, dan pembayaran otomatis dalam satu aplikasi.')}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <motion.button
                type="button"
                onClick={onNavigateRegister}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 lg:h-13 px-8 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-[#66000E]/25 transition-colors cursor-pointer"
              >
                <span>{t('hero_cta_primary', 'Mulai Gratis')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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

            <motion.ul variants={fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs font-medium text-[#5F5652]">
              {chips.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  {label}
                </li>
              ))}
            </motion.ul>
          </motion.div>


          {/* ═══════ KANAN: etalase 3D & ekosistem ═══════ */}
          <div className="lg:col-span-7 relative flex justify-center items-center min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] w-full select-none" aria-hidden>

            {/* Skala diperkecil di layar sempit */}
            <div className="relative w-full max-w-[560px] h-[440px] sm:h-[480px] flex items-center justify-center scale-[0.72] sm:scale-[0.82] lg:scale-[0.88] origin-center">

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#66000E]/[0.04] blur-[70px] pointer-events-none" />

              {/* Garis jaringan + denyut cahaya */}
              <motion.svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
                viewBox="0 0 660 600"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
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
                  {NETWORK_PATHS.map((d) => (
                    <path key={d} d={d} />
                  ))}
                </g>

                <g stroke="url(#rose-pulse)" strokeWidth="3" strokeLinecap="round" filter="url(#node-glow)">
                  {NETWORK_PATHS.slice(0, 6).map((d, i) => (
                    <path key={d} className="synapse-pulse" style={{ animationDelay: `${i * 0.6}s` }} d={d} />
                  ))}
                </g>
              </motion.svg>


              {/* Etalase tengah */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.2 }}
              >
                <div
                  className="relative transition-transform duration-500 hover:scale-[1.02]"
                  style={{ width: 290, transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)' }}
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
                          {['kraft_pouch', 'green_mug', 'blue_bottle', 'cardboard_box'].map((name) => (
                            <div key={name} className="bg-white rounded-lg p-1 border border-[#EADBDB] flex items-center justify-center h-10 shadow-2xs overflow-hidden">
                              <img src={`/assets/3d/${name}.png`} alt="" className="h-8 w-full object-contain drop-shadow-xs" />
                            </div>
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
                                transition={{ duration: 0.5, delay: 0.8 + i * 0.08, ease: 'easeOut' }}
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
                  <div className="absolute -bottom-7 right-0 z-20 animate-bounce-gentle">
                    <img src="/assets/3d/cardboard_box.png" alt="" className="w-12 h-12 object-contain drop-shadow-xl" />
                  </div>
                </div>
              </motion.div>


              {/* Kartu ekosistem di sekeliling etalase */}
              <FloatingCard position={{ top: '4%', left: '2%' }} delay={0.5} icon={ShoppingBag} title="Katalog Produk">
                <div className="flex items-end justify-center gap-1 bg-[#FAF7F7] rounded-xl p-1 border border-[#F0EAEB] h-10 overflow-hidden">
                  <img src="/assets/3d/kraft_pouch.png" alt="" className="h-8 object-contain" />
                  <img src="/assets/3d/green_mug.png" alt="" className="h-8 object-contain" />
                </div>
              </FloatingCard>

              <FloatingCard position={{ top: '0%', left: '38%' }} delay={0.6} icon={Bell} title="Pesanan Masuk" width={135}>
                <span className="absolute -top-1 left-2.5 z-40 flex w-2.5 h-2.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                </span>
                <div className="space-y-1.5">
                  {[
                    { img: 'kraft_pouch', w1: 'w-full', w2: 'w-2/3' },
                    { img: 'green_mug', w1: 'w-3/4', w2: 'w-1/2' },
                  ].map((row) => (
                    <div key={row.img} className="flex items-center gap-2 bg-[#FAF7F7] rounded-lg p-1.5 border border-[#F0EAEB]">
                      <img src={`/assets/3d/${row.img}.png`} alt="" className="w-5 h-6 object-contain shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className={`h-1 bg-[#D8CECE] rounded-full ${row.w1}`} />
                        <div className={`h-1 bg-[#EDE7E7] rounded-full ${row.w2}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </FloatingCard>

              <FloatingCard position={{ top: '6%', right: '2%' }} delay={0.7} icon={CreditCard} iconBg="bg-[#1E75C0]" title="Pembayaran">
                <div className="flex items-center gap-2 bg-[#E8F5E9] rounded-xl p-2 border border-emerald-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-[8px] font-extrabold text-emerald-800 leading-tight">Pembayaran<br />Berhasil</p>
                </div>
              </FloatingCard>

              <FloatingCard position={{ top: '40%', left: '-2%' }} delay={0.8} icon={BarChart3} title="Laporan Penjualan" width={135}>
                <div className="flex items-end justify-between h-11 px-1 bg-[#FAF7F7] rounded-xl p-1.5 border border-[#F0EAEB]">
                  {SALES_BARS.map((bar, i) => (
                    <motion.div
                      key={bar}
                      className={`w-3 rounded-t-xs origin-bottom ${bar}`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: 1.1 + i * 0.08, ease: 'easeOut' }}
                    />
                  ))}
                </div>
              </FloatingCard>

              <FloatingCard position={{ top: '40%', right: '-2%' }} delay={0.9} icon={Truck} title="Pengiriman">
                <div className="flex flex-col items-center bg-[#FAF7F7] rounded-xl p-2 border border-[#F0EAEB]">
                  <img src="/assets/3d/cardboard_box.png" alt="" className="w-8 h-8 object-contain mb-1" />
                  <p className="text-[7px] font-semibold text-[#706866] mb-1">Dalam Pengiriman</p>
                  <div className="w-full h-1.5 bg-[#EADBDB] rounded-full relative">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-[#800C19] rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '66%' }}
                      transition={{ duration: 1.2, delay: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard position={{ bottom: '2%', left: '4%' }} delay={1.0} icon={Users} title="Pelanggan">
                <div className="flex items-center justify-between bg-[#FAF7F7] p-1.5 rounded-xl border border-[#F0EAEB]">
                  <div className="flex items-center -space-x-1.5">
                    {CUSTOMER_INITIALS.map(({ letter, color }) => (
                      <div
                        key={letter}
                        className="w-5 h-5 rounded-full border-2 border-white shadow-2xs flex items-center justify-center text-[8px] font-bold text-[#241A1A]"
                        style={{ backgroundColor: color }}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="w-4 h-4 rounded-full bg-white border border-[#D8CECE] flex items-center justify-center text-[9px] font-bold text-[#706866]">
                    +
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard position={{ bottom: '2%', right: '4%' }} delay={1.1} icon={Package} title="Stok" width={135}>
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
          </div>

        </div>
      </div>
    </section>
  );
};
