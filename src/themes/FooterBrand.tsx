import React from 'react';
import { useCmsStore } from '../cms/useCmsStore';

export type FooterLogoType = 'text' | 'image';

/** Jenis logo footer dari pengaturan footer; bawaan 'text' (nama toko). */
export function getFooterLogoType(sectionOptions: any = {}): FooterLogoType {
  return sectionOptions?.footerLogoType === 'image' ? 'image' : 'text';
}

/**
 * URL logo gambar footer: logo khusus footer (footerLogoUrl), atau logo toko (header) bila
 * merchant memilih "Gambar" tanpa mengunggah logo khusus. Kosong = tampil teks.
 */
export function getFooterLogoUrl(sectionOptions: any = {}, storeLogoUrl?: string): string {
  if (getFooterLogoType(sectionOptions) !== 'image') return '';
  return String(sectionOptions?.footerLogoUrl || storeLogoUrl || '').trim();
}

interface FooterBrandProps {
  sectionOptions?: any;
  /** Nama toko, dipakai sebagai alt gambar. */
  name?: string;
  /** Kelas gambar logo: tinggi, perataan, jarak bawah (lebar mengikuti rasio). */
  imgClassName?: string;
  /** Tampilan nama toko bawaan template (logo teks). */
  children: React.ReactNode;
}

/**
 * Identitas brand di footer template: logo teks (nama toko, gaya bawaan template) atau logo
 * gambar sesuai pilihan merchant di Pengaturan Footer.
 */
export const FooterBrand: React.FC<FooterBrandProps> = ({ sectionOptions = {}, name, imgClassName = 'h-12 mb-4', children }) => {
  const storeLogoUrl = useCmsStore((state) => state.storeInfo?.logoUrl);
  const logoUrl = getFooterLogoUrl(sectionOptions, storeLogoUrl);
  if (!logoUrl) return <>{children}</>;
  return (
    <img
      src={logoUrl}
      alt={name || 'Logo toko'}
      className={`${imgClassName} w-auto max-w-[220px] object-contain block`}
      loading="lazy"
    />
  );
};
