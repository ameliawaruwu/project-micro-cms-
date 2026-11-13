import React, { useLayoutEffect, useRef, useState } from 'react';

/** Lebar desain tiap preview device (px). Desktop = breakpoint `lg` yang dipaksa aktif di kanvas. */
export const DEVICE_DESIGN_WIDTH = { mobile: 390, tablet: 768, desktop: 1024 } as const;

interface ScaledDeviceFrameProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Lebar desain device dalam px. */
  designWidth: number;
  /** Desktop: bila ruang lebih lebar dari lebar desain, frame memakai seluruh lebar (tanpa scale). */
  fillWhenWider?: boolean;
  children: React.ReactNode;
}

/**
 * Bingkai preview device yang selalu muat di kanvas editor.
 *
 * Konten dirender selebar lebar desain device (Ponsel 390px, Tablet 768px, Desktop 1024px) agar
 * tata letaknya sama dengan device aslinya, lalu diperkecil proporsional (transform: scale) bila
 * ruang kanvas lebih sempit — jadi tidak ada konten yang keluar frame atau terpotong.
 *
 * Transform juga menjadikan frame sebagai containing block untuk elemen `position: fixed` di
 * dalam template (toast keranjang, tombol mengambang, drawer), sehingga elemen itu tetap berada
 * di dalam frame, bukan menempel ke jendela editor.
 *
 * Variabel CSS `--preview-scale` tersedia untuk anak-anaknya (mis. menyesuaikan tinggi maksimum).
 */
export const ScaledDeviceFrame: React.FC<ScaledDeviceFrameProps> = ({
  designWidth,
  fillWhenWider = false,
  className = '',
  children,
  ...rest
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [innerHeight, setInnerHeight] = useState(0);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const measure = () => {
      setAvailable(outer.clientWidth);
      setInnerHeight(inner.offsetHeight);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  const measured = available > 0;
  const fits = !measured || available >= designWidth;
  const scale = fits ? 1 : available / designWidth;
  const width = fits && fillWhenWider ? '100%' : `${designWidth}px`;
  const offsetX = fits ? 0 : (available - designWidth * scale) / 2;

  return (
    <div
      ref={outerRef}
      className="w-full min-w-0 relative"
      style={{ height: scale < 1 && innerHeight ? innerHeight * scale : undefined }}
    >
      <div
        ref={innerRef}
        {...rest}
        className={`${className} ${fits && !fillWhenWider ? 'mx-auto' : ''}`}
        style={{
          width,
          maxWidth: fits ? '100%' : undefined,
          transform: `translateX(${offsetX}px) scale(${scale})`,
          transformOrigin: 'top left',
          ['--preview-scale' as string]: scale,
        }}
      >
        {children}
      </div>
    </div>
  );
};
