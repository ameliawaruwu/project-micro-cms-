import React, { useLayoutEffect, useRef } from 'react';
import { PreviewDeviceMode, resolveResponsiveClasses } from '../../utils/responsivePreview';

const SRC_ATTR = 'data-rc-src';
const OUT_ATTR = 'data-rc-out';
const BREAKPOINT_RE = /(^|\s)(sm|md|lg|xl|2xl):/;

/** Terjemahkan class satu elemen sesuai device; simpan class asli agar bisa dihitung ulang. */
function applyToElement(el: Element, deviceMode: PreviewDeviceMode) {
  const current = el.getAttribute('class') || '';
  const lastOut = el.getAttribute(OUT_ATTR);
  // Class sudah hasil terjemahan kita dan belum diubah React: tidak perlu apa-apa.
  if (lastOut !== null && current === lastOut) return;

  if (!BREAKPOINT_RE.test(current)) {
    if (lastOut !== null) {
      el.removeAttribute(SRC_ATTR);
      el.removeAttribute(OUT_ATTR);
    }
    return;
  }

  const resolved = resolveResponsiveClasses(current, deviceMode);
  el.setAttribute(SRC_ATTR, current);
  el.setAttribute(OUT_ATTR, resolved);
  if (resolved !== current) el.setAttribute('class', resolved);
}

function applyToTree(root: Element, deviceMode: PreviewDeviceMode) {
  applyToElement(root, deviceMode);
  root.querySelectorAll('[class]').forEach((el) => applyToElement(el, deviceMode));
}

/**
 * Di Editor Layout, preview Desktop/Tablet/Ponsel hanya mengecilkan lebar kontainer — kelas
 * Tailwind `sm:`/`md:`/`lg:` di komponen tema tetap mengikuti lebar jendela browser sehingga
 * tampilan ponsel/tablet berantakan. Scope ini menerjemahkan kelas breakpoint di dalamnya
 * sesuai device yang dipilih (lihat resolveResponsiveClasses) dan tetap sinkron saat React
 * memperbarui DOM. Tanpa `deviceMode` (storefront publik) scope tidak melakukan apa pun.
 */
export const ResponsivePreviewScope: React.FC<{ deviceMode?: PreviewDeviceMode; children: React.ReactNode }> = ({
  deviceMode,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !deviceMode) return;

    // Device berganti: hitung ulang dari class asli. Bila React sudah memasang class baru
    // (mis. getDeviceClass untuk device baru), class itu yang dipakai — memulihkan class lama
    // di sini membuat tablet/ponsel tetap memakai kelas desktop (grid-cols-12, nav desktop).
    root.querySelectorAll(`[${SRC_ATTR}]`).forEach((el) => {
      const src = el.getAttribute(SRC_ATTR) || '';
      const lastOut = el.getAttribute(OUT_ATTR);
      if (lastOut !== null && el.getAttribute('class') === lastOut) el.setAttribute('class', src);
      el.removeAttribute(SRC_ATTR);
      el.removeAttribute(OUT_ATTR);
    });
    applyToTree(root, deviceMode);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.target instanceof Element) {
          applyToElement(m.target, deviceMode);
        } else if (m.type === 'childList') {
          m.addedNodes.forEach((node) => {
            if (node instanceof Element) applyToTree(node, deviceMode);
          });
        }
      }
    });
    observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [deviceMode]);

  if (!deviceMode) return <>{children}</>;
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
};
