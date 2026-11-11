import React, { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from 'motion/react';

/**
 * Preset animasi bersama untuk landing page.
 * Semua gerak transform dimatikan otomatis bila pengguna memilih "reduce motion"
 * (LandingPage dibungkus <MotionConfig reducedMotion="user">).
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Kurva "expo out": cepat di awal, mendarat sangat halus. */
export const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;

/** Muncul dari bawah sambil menajam (blur → jelas); `custom` = jeda (detik). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE_SMOOTH, delay },
  }),
};

/** Varian per kata untuk judul; dipakai lewat <WordReveal>. */
const wordReveal: Variants = {
  hidden: { opacity: 0, y: '0.45em', filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE_SMOOTH },
  },
};

/**
 * Memecah teks menjadi kata yang muncul bergiliran.
 * Harus berada di dalam induk motion yang memakai varian `stagger`.
 */
export const WordReveal: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <>
    {text.split(' ').map((word, i) => (
      <React.Fragment key={`${word}-${i}`}>
        {i > 0 && ' '}
        <motion.span variants={wordReveal} className={`inline-block ${className ?? ''}`}>
          {word}
        </motion.span>
      </React.Fragment>
    ))}
  </>
);

/** Satu kata dengan varian yang sama, untuk kata yang perlu dekorasi tambahan. */
export const RevealWord: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <motion.span variants={wordReveal} className={`inline-block ${className ?? ''}`}>
    {children}
  </motion.span>
);

/** Wadah yang memunculkan anak-anaknya bergiliran. */
export const stagger = (gap = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren } },
});

/** Pergantian panel (tab/langkah) di dalam <AnimatePresence mode="wait">. */
export const swapPanel = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
  transition: { duration: 0.35, ease: EASE_SMOOTH },
} as const;

const VIEWPORT = { once: true, amount: 0.25 } as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Elemen tunggal yang muncul saat di-scroll ke layar. */
export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0 }) => (
  <motion.div
    className={className}
    variants={fadeUp}
    custom={delay}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT}
  >
    {children}
  </motion.div>
);

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  gap?: number;
}

/** Wadah stagger; isi dengan <RevealItem>. */
export const RevealGroup: React.FC<RevealGroupProps> = ({ children, className, gap = 0.08 }) => (
  <motion.div
    className={className}
    variants={stagger(gap)}
    initial="hidden"
    whileInView="visible"
    viewport={VIEWPORT}
  >
    {children}
  </motion.div>
);

export const RevealItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <motion.div className={className} variants={fadeUp}>
    {children}
  </motion.div>
);

/**
 * Memutar tab/langkah otomatis selama bagiannya terlihat.
 * Berhenti permanen setelah pengunjung memilih sendiri, dan tidak berjalan
 * bila pengguna memilih "reduce motion".
 */
export function useAutoAdvance<T>(
  items: readonly T[],
  active: T,
  setActive: (next: T) => void,
  intervalMs = 5000
) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (stopped || reduceMotion || !inView) return;
    const id = window.setTimeout(() => {
      const next = (items.indexOf(active) + 1) % items.length;
      setActive(items[next]);
    }, intervalMs);
    return () => window.clearTimeout(id);
  }, [active, stopped, reduceMotion, inView, items, setActive, intervalMs]);

  return { ref, stop: () => setStopped(true), running: !stopped && !reduceMotion && inView };
}

/**
 * Posisi kursor relatif terhadap elemen, dinormalisasi ke -1..1 dan diperhalus pegas.
 * Hanya bereaksi pada mouse (bukan sentuhan) dan diam bila "reduce motion" aktif.
 */
export function usePointerParallax() {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const spring = { stiffness: 70, damping: 18, mass: 0.6 };
  const x = useSpring(rawX, spring);
  const y = useSpring(rawY, spring);

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };
  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return { x, y, handlers: { onPointerMove, onPointerLeave } };
}

/** Angka yang menghitung naik saat pertama kali terlihat (format Rupiah tanpa "Rp"). */
export const CountUp: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE_OUT,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      {shown.toLocaleString('id-ID')}
    </span>
  );
};
