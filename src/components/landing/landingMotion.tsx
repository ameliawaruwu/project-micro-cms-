import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, type Variants } from 'motion/react';

/**
 * Preset animasi bersama untuk landing page.
 * Semua gerak transform dimatikan otomatis bila pengguna memilih "reduce motion"
 * (LandingPage dibungkus <MotionConfig reducedMotion="user">).
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Muncul dari bawah; `custom` = jeda (detik). */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  }),
};

/** Wadah yang memunculkan anak-anaknya bergiliran. */
export const stagger = (gap = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren } },
});

/** Pergantian panel (tab/langkah) di dalam <AnimatePresence mode="wait">. */
export const swapPanel = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: EASE_OUT },
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
