import React, { useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type PanInfo,
} from 'motion/react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Package,
  QrCode,
  ShoppingBag,
  Sparkle,
  TrendingUp,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_SMOOTH, WordReveal, fadeUp, stagger, useAutoAdvance, usePointerParallax } from './landingMotion';

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

/** Aset 3D yang bayangan lantainya sudah dibersihkan (WebP 512px). */
const asset3d = (name: string) => `/assets/3d/clean/${name}.webp`;

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

/** Muncul menajam setiap kali kartu tampil di depan. */
const popIn = (delay: number) => ({
  initial: { opacity: 0, scale: 0.6, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  transition: { duration: 0.8, ease: EASE_SMOOTH, delay },
});

/** Produk 3D melayang dengan parallax. */
const FloatingProduct: React.FC<
  PointerProps & { img: string; className: string; depth: number; duration: number; rotate: number; delay: number }
> = ({ img, className, depth, duration, rotate, delay, ...pointer }) => (
  <Parallax {...pointer} depth={depth} className={className}>
    <motion.div {...popIn(delay)}>
      <Float duration={duration} y={9} rotate={rotate} delay={delay * 0.5}>
        <img src={asset3d(img)} alt="" draggable={false} className="w-full object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.3)]" />
      </Float>
    </motion.div>
  </Parallax>
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
        <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-lg">{children}</div>
      </Float>
    </motion.div>
  </Parallax>
);

const Sparkles: React.FC<{ color: string; items: { className: string; delay: number }[] }> = ({ color, items }) => {
  const reduceMotion = useReducedMotion();
  return (
    <>
      {items.map((s) => (
        <motion.div
          key={s.className}
          className={`absolute ${s.className}`}
          style={{ color }}
          animate={reduceMotion ? undefined : { scale: [0.6, 1.1, 0.6], opacity: [0.4, 1, 0.4], rotate: [0, 45, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
        >
          <Sparkle className="w-full h-full fill-current" />
        </motion.div>
      ))}
    </>
  );
};

/** Tekstur titik halus di atas latar kartu. */
const DotTexture: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <div
    className="absolute inset-0"
    style={{ opacity, backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '14px 14px' }}
  />
);

/** Garis lengkung yang tergambar perlahan di latar kartu. */
const DrawnCurve: React.FC<{ d: string; color: string }> = ({ d, color }) => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 470" preserveAspectRatio="none" fill="none">
    <motion.path
      d={d}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.6, ease: EASE_SMOOTH, delay: 0.3 }}
    />
  </svg>
);

/* ─────────────── Isi tiap kartu ─────────────── */

type SceneProps = PointerProps & { t: (key: string, fallback: string) => string };

/** Kartu 1 (marun): etalase toko dengan orbit, pesanan masuk, dan pembayaran. */
const StoreScene: React.FC<SceneProps> = ({ t, ...pointer }) => {
  const reduceMotion = useReducedMotion();
  return (
    <>
      <DotTexture color="rgba(255,255,255,0.9)" opacity={0.12} />
      <DrawnCurve d="M 380,330 C 470,300 560,320 640,280 S 820,180 980,210" color="rgba(255,255,255,0.55)" />

      <Parallax {...pointer} depth={12} className="left-[8%] top-[14%] w-[34%] aspect-square">
        <motion.div className="relative w-full h-full" {...popIn(0.15)}>
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
          <div className="absolute inset-[14%] flex items-center justify-center">
            <Float duration={5} y={8}>
              <img
                src={asset3d('mini_storefront')}
                alt=""
                draggable={false}
                className="w-full h-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]"
              />
            </Float>
          </div>
        </motion.div>
      </Parallax>

      <Parallax {...pointer} depth={24} className="left-[52%] top-[16%] w-[25%]">
        <motion.div {...popIn(0.3)}>
          <Float duration={4.4} y={14} rotate={-5}>
            <div className="-rotate-12">
              <ExtrudedIcon icon={ShoppingBag} face="#FFC2D1" side="#E8573C" layers={12} />
            </div>
          </Float>
        </motion.div>
      </Parallax>

      <Parallax {...pointer} depth={32} className="right-[6%] top-[12%] w-[12%]">
        <motion.div {...popIn(0.45)}>
          <Float duration={3.8} y={10} rotate={8} delay={0.4}>
            <div className="rotate-12">
              <ExtrudedIcon icon={QrCode} face="#FFE08A" side="#D9861C" layers={8} strokeWidth={2.4} />
            </div>
          </Float>
        </motion.div>
      </Parallax>

      <InfoPill {...pointer} depth={18} delay={0.6} className="left-[38%] top-[8%]">
        <span className="relative flex w-6 h-6 items-center justify-center rounded-full bg-[#800C19] text-white">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F7C948] animate-ping" />
        </span>
        <span className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
          {t('hero_badge_new_orders', '+8 Pesanan Baru')}
        </span>
      </InfoPill>

      <InfoPill {...pointer} depth={22} delay={0.75} className="right-[14%] bottom-[12%]">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <div className="leading-tight">
          <p className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
            {t('hero_badge_payment_success', 'Pembayaran Berhasil')}
          </p>
          <p className="text-[10px] text-[#706866]">{t('hero_badge_qris_bank', 'QRIS & Bank')}</p>
        </div>
      </InfoPill>

      <FloatingProduct {...pointer} img="green_mug" className="left-[40%] bottom-[8%] w-[9%] sm:w-[7.5%]" depth={20} duration={4.6} rotate={6} delay={0.5} />
      <FloatingProduct {...pointer} img="blue_bottle" className="hidden sm:block right-[5%] bottom-[10%] w-[6%]" depth={30} duration={5.8} rotate={10} delay={0.6} />
      <FloatingProduct {...pointer} img="cardboard_box" className="right-[6%] top-[42%] w-[10%] sm:w-[8%]" depth={16} duration={4.2} rotate={-6} delay={0.7} />

      <Sparkles
        color="#FFFFFF"
        items={[
          { className: 'left-[36%] top-[18%] w-[2.2%]', delay: 0 },
          { className: 'left-[12%] bottom-[16%] w-[1.6%]', delay: 1.1 },
          { className: 'right-[16%] top-[44%] w-[1.8%]', delay: 2.2 },
        ]}
      />
    </>
  );
};

/** Kartu 2 (merah muda): katalog produk berjajar dengan label harga. */
const PRODUCT_SHELF = [
  { img: 'kraft_pouch', price: 'Rp 45.000', className: 'left-[30%] top-[18%] w-[16%]', delay: 0.2, rotate: -6 },
  { img: 'blue_bottle', price: 'Rp 89.000', className: 'left-[50%] top-[24%] w-[13%]', delay: 0.32, rotate: 6 },
  { img: 'green_mug', price: 'Rp 65.000', className: 'left-[67%] top-[20%] w-[16%]', delay: 0.44, rotate: -4 },
];

const ProductsScene: React.FC<SceneProps> = ({ t, ...pointer }) => (
  <>
    <DotTexture color="rgba(102,0,14,0.7)" opacity={0.1} />
    <DrawnCurve d="M 0,380 C 160,340 300,400 470,360 S 760,300 1000,330" color="rgba(255,255,255,0.7)" />

    <Parallax {...pointer} depth={20} className="left-[6%] top-[22%] w-[19%]">
      <motion.div {...popIn(0.1)}>
        <Float duration={4.6} y={12} rotate={-5}>
          <div className="-rotate-6">
            <ExtrudedIcon icon={Package} face="#FFFFFF" side="#B83A5A" layers={12} />
          </div>
        </Float>
      </motion.div>
    </Parallax>

    {PRODUCT_SHELF.map((item) => (
      <Parallax key={item.img} {...pointer} depth={14} className={item.className}>
        <motion.div className="flex flex-col items-center" {...popIn(item.delay)}>
          <Float duration={4.8 + item.delay} y={8} rotate={item.rotate}>
            <img
              src={asset3d(item.img)}
              alt=""
              draggable={false}
              className="w-full object-contain drop-shadow-[0_16px_18px_rgba(102,0,14,0.35)]"
            />
          </Float>
          <span className="mt-2 hidden sm:inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#66000E] shadow-md whitespace-nowrap">
            {item.price}
          </span>
        </motion.div>
      </Parallax>
    ))}

    <FloatingProduct {...pointer} img="cardboard_box" className="right-[5%] bottom-[10%] w-[11%] sm:w-[9%]" depth={26} duration={4.2} rotate={-8} delay={0.55} />

    <InfoPill {...pointer} depth={18} delay={0.6} className="left-[7%] bottom-[12%]">
      <span className="flex w-6 h-6 items-center justify-center rounded-full bg-emerald-500 text-white">
        <TrendingUp className="w-3.5 h-3.5" />
      </span>
      <span className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
        +42 {t('features_sold_count', 'terjual minggu ini')}
      </span>
    </InfoPill>

    <InfoPill {...pointer} depth={24} delay={0.75} className="right-[6%] top-[10%]">
      <span className="flex w-6 h-6 items-center justify-center rounded-full bg-[#F7C948] text-[#66000E] text-[10px] font-bold">
        3
      </span>
      <span className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
        {t('features_stock_warning', 'Peringatan Stok')}
      </span>
    </InfoPill>

    <Sparkles
      color="#FFFFFF"
      items={[
        { className: 'left-[28%] top-[12%] w-[2%]', delay: 0.3 },
        { className: 'right-[22%] bottom-[22%] w-[1.8%]', delay: 1.4 },
      ]}
    />
  </>
);

/** Kartu 3 (kuning): pembayaran QRIS berhasil lalu paket dikirim. */
const PaymentsScene: React.FC<SceneProps> = ({ t, ...pointer }) => (
  <>
    <DotTexture color="rgba(102,0,14,0.7)" opacity={0.08} />
    <DrawnCurve d="M 0,120 C 200,80 320,200 520,170 S 820,60 1000,110" color="rgba(102,0,14,0.25)" />

    <Parallax {...pointer} depth={20} className="left-[7%] top-[18%] w-[22%]">
      <motion.div {...popIn(0.1)}>
        <Float duration={4.4} y={12} rotate={5}>
          <div className="rotate-6">
            <ExtrudedIcon icon={QrCode} face="#800C19" side="#3F0009" layers={12} strokeWidth={2.4} />
          </div>
        </Float>
      </motion.div>
    </Parallax>

    {/* Struk pembayaran */}
    <Parallax {...pointer} depth={12} className="left-[36%] top-[18%] w-[34%] sm:w-[27%]">
      <motion.div {...popIn(0.25)}>
        <Float duration={5.4} y={7} rotate={-2}>
          <div className="-rotate-3 rounded-2xl sm:rounded-3xl bg-white p-3 sm:p-5 shadow-[0_24px_40px_-16px_rgba(102,0,14,0.45)]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 shrink-0 text-emerald-500" />
              <span className="text-[10px] sm:text-sm font-semibold text-[#1A1414] leading-tight">
                {t('hero_badge_payment_success', 'Pembayaran Berhasil')}
              </span>
            </div>
            <p className="mt-2 sm:mt-4 text-sm sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#1A1414]">Rp 350.000</p>
            <div className="mt-2 sm:mt-4 border-t border-dashed border-[#E4DCDC] pt-2 sm:pt-3 flex items-center justify-between text-[9px] sm:text-xs text-[#5F5652]">
              <span>QRIS</span>
              <span className="font-medium text-[#800C19]">GoPay</span>
            </div>
          </div>
        </Float>
      </motion.div>
    </Parallax>

    <FloatingProduct {...pointer} img="red_bags" className="right-[6%] top-[12%] w-[20%] sm:w-[17%]" depth={26} duration={5} rotate={6} delay={0.4} />
    <FloatingProduct {...pointer} img="cardboard_box" className="left-[28%] bottom-[8%] w-[10%] sm:w-[8%]" depth={18} duration={4.4} rotate={-6} delay={0.55} />

    <InfoPill {...pointer} depth={22} delay={0.7} className="right-[12%] bottom-[12%]">
      <span className="flex w-6 h-6 items-center justify-center rounded-full bg-[#800C19] text-white">
        <Truck className="w-3.5 h-3.5" />
      </span>
      <span className="text-xs font-semibold text-[#1A1414] whitespace-nowrap">
        {t('features_whatsapp_tracking', 'Auto Kirim Resi ke WhatsApp')}
      </span>
    </InfoPill>

    <Sparkles
      color="#800C19"
      items={[
        { className: 'left-[33%] top-[10%] w-[1.8%]', delay: 0.2 },
        { className: 'right-[32%] bottom-[18%] w-[2%]', delay: 1.3 },
      ]}
    />
  </>
);

/* ─────────────── Slider tumpukan kartu ─────────────── */

const SLIDES = [
  {
    id: 'store',
    labelKey: 'hero_slide_store',
    label: 'Toko Online',
    background: 'radial-gradient(120% 90% at 20% 30%, #A3182A 0%, #800C19 45%, #5A0510 100%)',
    chip: 'bg-white/15 text-white',
    Scene: StoreScene,
  },
  {
    id: 'products',
    labelKey: 'hero_slide_products',
    label: 'Katalog Produk',
    background: 'radial-gradient(120% 90% at 25% 25%, #FFB3C6 0%, #F28CA6 50%, #E06A8B 100%)',
    chip: 'bg-white/60 text-[#66000E]',
    Scene: ProductsScene,
  },
  {
    id: 'payments',
    labelKey: 'hero_slide_payments',
    label: 'Pembayaran Otomatis',
    background: 'radial-gradient(120% 90% at 25% 25%, #FFE08A 0%, #F7C948 50%, #EDB022 100%)',
    chip: 'bg-white/60 text-[#66000E]',
    Scene: PaymentsScene,
  },
];

const SLIDE_INDEXES: readonly number[] = SLIDES.map((_, i) => i);

/**
 * Pose kartu di tumpukan: 0 = depan, 1 = tengah (miring), 2 = paling belakang (sedikit naik).
 * `x: 0` mengembalikan kartu yang baru saja digeser (swipe) ke tengah saat ia mundur ke belakang.
 */
const STACK_POSES = [
  { x: 0, rotate: -2.5, y: '0%', zIndex: 3 },
  { x: 0, rotate: -6, y: '-2%', zIndex: 2 },
  { x: 0, rotate: -1, y: '-5%', zIndex: 1 },
];

/** Ambang geser (px) dan kecepatan (px/detik) untuk berpindah kartu. */
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 450;

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigateRegister, onScrollToHowItWorks }) => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const pointer = usePointerParallax();
  const pointerProps: PointerProps = { pointerX: pointer.x, pointerY: pointer.y };

  const [active, setActive] = useState(0);
  const autoplay = useAutoAdvance(SLIDE_INDEXES, active, setActive, 6500);

  /** Pindah kartu karena aksi pengguna: autoplay dihentikan agar tidak berebut kendali. */
  const goTo = (index: number) => {
    autoplay.stop();
    setActive((index + SLIDES.length) % SLIDES.length);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) goTo(active + 1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) goTo(active - 1);
  };

  // Saat hero digulir, tumpukan kartu sedikit membesar dan teks bergeser pelan.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const stackScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.04]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const activeLabel = t(SLIDES[active].labelKey, SLIDES[active].label);

  return (
    <section
      ref={sectionRef}
      id="hero"
      {...pointer.handlers}
      // Navbar landing berposisi fixed (tinggi 64–72px), jadi jarak atas sudah memperhitungkannya.
      className="relative overflow-hidden bg-white pt-[112px] sm:pt-[132px] lg:pt-[150px] pb-12 sm:pb-16 font-sans"
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

      {/* ═══════ Slider tumpukan kartu: geser, klik kartu belakang, atau pakai tombol ═══════ */}
      <motion.div
        ref={autoplay.ref as React.RefObject<HTMLDivElement>}
        role="region"
        aria-roledescription="carousel"
        aria-label={t('hero_slider_label', 'Sorotan fitur LapakQ')}
        className="relative mt-14 sm:mt-16 lg:mt-20 max-w-[1120px] mx-auto px-4 sm:px-8 select-none"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE_SMOOTH, delay: 0.35 }}
      >
        <motion.div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[16/7.5]" style={{ scale: stackScale }}>
          {SLIDES.map((slide, idx) => {
            const position = (idx - active + SLIDES.length) % SLIDES.length;
            const isFront = position === 0;
            const { zIndex, ...pose } = STACK_POSES[position];
            const Scene = slide.Scene;
            const label = t(slide.labelKey, slide.label);
            return (
              <motion.div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} / ${SLIDES.length}: ${label}`}
                aria-hidden={!isFront}
                initial={false}
                animate={pose}
                transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                drag={isFront ? 'x' : false}
                dragSnapToOrigin
                dragElastic={0.2}
                onDragEnd={isFront ? handleDragEnd : undefined}
                onClick={isFront ? undefined : () => goTo(idx)}
                className={`absolute inset-0 rounded-[24px] sm:rounded-[40px] overflow-hidden ${
                  isFront
                    ? 'cursor-grab active:cursor-grabbing shadow-[0_40px_80px_-30px_rgba(102,0,14,0.55)]'
                    : 'cursor-pointer'
                }`}
                style={{ zIndex, background: slide.background }}
              >
                {/* Isi hanya dirender di kartu depan, jadi animasinya diputar ulang setiap kartu maju. */}
                {isFront && (
                  <div className="absolute inset-0 pointer-events-none">
                    <span
                      className={`absolute left-[4%] top-[5%] z-10 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold backdrop-blur-sm ${slide.chip}`}
                    >
                      {String(idx + 1).padStart(2, '0')} · {label}
                    </span>
                    <Scene {...pointerProps} t={t} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Kontrol: sebelumnya, titik posisi, berikutnya */}
        <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4">
          <SliderButton label={t('hero_slide_prev', 'Kartu sebelumnya')} onClick={() => goTo(active - 1)}>
            <ChevronLeft className="w-5 h-5" />
          </SliderButton>

          <div className="flex items-center gap-2">
            {SLIDES.map((slide, idx) => {
              const isActive = idx === active;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(idx)}
                  aria-label={t(slide.labelKey, slide.label)}
                  aria-current={isActive}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive ? 'w-8 bg-[#800C19]' : 'w-2.5 bg-[#E4DCDC] hover:bg-[#D2C2C4]'
                  }`}
                />
              );
            })}
          </div>

          <SliderButton label={t('hero_slide_next', 'Kartu berikutnya')} onClick={() => goTo(active + 1)}>
            <ChevronRight className="w-5 h-5" />
          </SliderButton>
        </div>
        <p className="mt-3 text-center text-xs text-[#5F5652]" aria-live="polite">
          {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')} · {activeLabel}
        </p>
      </motion.div>
    </section>
  );
};

const SliderButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({
  label,
  onClick,
  children,
}) => (
  <motion.button
    type="button"
    onClick={onClick}
    aria-label={label}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.92 }}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E4DCDC] bg-white text-[#1A1414] hover:border-[#800C19] hover:text-[#800C19] transition-colors cursor-pointer"
  >
    {children}
  </motion.button>
);
