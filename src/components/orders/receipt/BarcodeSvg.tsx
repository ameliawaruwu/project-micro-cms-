import React from 'react';

interface BarcodeSvgProps {
  code: string;
}

/**
 * Generates clean, deterministic SVG barcode lines from any code string (Resi / Order ID)
 */
export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({ code }) => {
  const safeCode = (code || '00000000').toUpperCase();
  const bars: { width: number; isSpace: boolean }[] = [];

  // Start guard
  bars.push({ width: 2, isSpace: false }, { width: 1, isSpace: true }, { width: 2, isSpace: false });

  for (let i = 0; i < safeCode.length; i++) {
    const charCode = safeCode.charCodeAt(i);
    const p1 = (charCode % 3) + 1;
    const p2 = ((charCode >> 1) % 2) + 1;
    const p3 = ((charCode >> 2) % 3) + 1;
    bars.push({ width: p1, isSpace: false });
    bars.push({ width: p2, isSpace: true });
    bars.push({ width: p3, isSpace: false });
    bars.push({ width: 1, isSpace: true });
  }

  // End guard
  bars.push({ width: 2, isSpace: false }, { width: 1, isSpace: true }, { width: 3, isSpace: false });

  let currentX = 0;
  const rects = [];
  for (let j = 0; j < bars.length; j++) {
    const bar = bars[j];
    if (!bar.isSpace) {
      rects.push(
        <rect
          key={j}
          x={currentX}
          y={0}
          width={bar.width * 1.5}
          height={48}
          fill="#000000"
        />
      );
    }
    currentX += bar.width * 1.5;
  }

  return (
    <div className="w-full flex justify-center py-1">
      <svg
        viewBox={`0 0 ${currentX} 48`}
        className="w-full max-w-[280px] h-11"
        preserveAspectRatio="none"
      >
        {rects}
      </svg>
    </div>
  );
};
