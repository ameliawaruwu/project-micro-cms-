import React from 'react';
import type { StoreSectionConfig } from '../../types';

/**
 * Pengaturan navbar (header) & footer milik merchant, diambil dari section `header`/`footer`
 * layout toko. Halaman selain beranda (Katalog, Tentang, Kontak, Keranjang, dst.) merender
 * navbar & footer tema sendiri, jadi pengaturan ini dibagikan lewat context agar tampilannya
 * sama dengan beranda di editor maupun di toko yang sudah terbit.
 */
export interface StoreChromeOptions {
  header?: Record<string, any>;
  footer?: Record<string, any>;
}

export const StoreChromeContext = React.createContext<StoreChromeOptions>({});

/** Ambil opsi header & footer dari daftar section halaman yang sedang dirender. */
export function buildStoreChromeOptions(sections: StoreSectionConfig[] | undefined): StoreChromeOptions {
  const header = sections?.find((s) => s.id === 'header')?.options as Record<string, any> | undefined;
  const footer = sections?.find((s) => s.id === 'footer')?.options as Record<string, any> | undefined;
  return {
    header,
    // Footer memakai menu navigasi header bila merchant belum mengatur menu footer sendiri.
    footer: header?.navMenuItems && !footer?.navMenuItems ? { ...footer, navMenuItems: header.navMenuItems } : footer,
  };
}

/**
 * Gabungkan opsi bawaan halaman dengan pengaturan merchant. Nilai merchant menang, termasuk
 * string kosong (mis. subjudul header yang sengaja dikosongkan) agar sama dengan beranda;
 * navbar tema tetap jatuh ke nama toko bila judul kosong.
 */
export function useStoreChromeOptions(
  navbarBase: Record<string, any>,
  footerBase: Record<string, any>,
): { navbarOptions: Record<string, any>; footerOptions: Record<string, any>; isStickyHeader: boolean } {
  const chrome = React.useContext(StoreChromeContext);
  const navbarOptions = { ...navbarBase, ...definedOnly(chrome.header) };
  const footerOptions = { ...footerBase, ...definedOnly(chrome.footer) };
  return { navbarOptions, footerOptions, isStickyHeader: navbarOptions.stickyHeader !== false };
}

function definedOnly(options?: Record<string, any>): Record<string, any> {
  if (!options) return {};
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === null) continue;
    result[key] = value;
  }
  return result;
}
