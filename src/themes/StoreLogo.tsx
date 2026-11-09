import React from 'react';
import { useCmsStore } from '../cms/useCmsStore';

/** URL logo gambar toko: dari pengaturan header (logoUrl), atau logo toko yang tersimpan. */
export function getStoreLogoUrl(sectionOptions: any = {}, storeLogoUrl?: string): string {
  return String(sectionOptions?.logoUrl || storeLogoUrl || '').trim();
}

interface StoreLogoProps {
  sectionOptions?: any;
  /** Nama toko, dipakai sebagai alt gambar. */
  name?: string;
  /** Kelas tinggi gambar logo (lebar menyesuaikan). */
  imgClassName?: string;
  /** Tampilan teks bawaan tema bila belum ada logo gambar. */
  children: React.ReactNode;
}

/**
 * Logo navbar tema: tampilkan gambar logo bila merchant sudah mengunggahnya,
 * jika belum tampilkan logo teks bawaan tema (children).
 */
export const StoreLogo: React.FC<StoreLogoProps> = ({ sectionOptions = {}, name, imgClassName = 'h-9 sm:h-11', children }) => {
  const storeLogoUrl = useCmsStore((state) => state.storeInfo?.logoUrl);
  const logoUrl = getStoreLogoUrl(sectionOptions, storeLogoUrl);
  if (!logoUrl) return <>{children}</>;
  return (
    <img
      src={logoUrl}
      alt={name || 'Logo toko'}
      className={`${imgClassName} w-auto max-w-[200px] object-contain block`}
      loading="eager"
    />
  );
};
