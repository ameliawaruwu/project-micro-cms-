import React from 'react';
import { useCmsStore } from '../cms/useCmsStore';
import { useLanguage } from '../contexts/LanguageContext';
import { DEFAULT_LOGO_ICON_URL, usePlatformLogo } from '../services/platformLogoService';

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
 * jika belum tampilkan ikon LapakQ sebagai logo bawaan diikuti nama toko (children).
 */
export const StoreLogo: React.FC<StoreLogoProps> = ({ sectionOptions = {}, name, imgClassName = 'h-9 sm:h-11', children }) => {
  const { isEn } = useLanguage();
  const storeLogoUrl = useCmsStore((state) => state.storeInfo?.logoUrl);
  const logoUrl = getStoreLogoUrl(sectionOptions, storeLogoUrl);
  const platformIcon = usePlatformLogo().logoIconUrl || DEFAULT_LOGO_ICON_URL;
  if (!logoUrl) {
    return (
      <span className="inline-flex items-center gap-2 min-w-0 max-w-full align-middle">
        <img
          src={platformIcon}
          alt="LapakQ"
          className={`${imgClassName} w-auto shrink-0 object-contain`}
          loading="eager"
        />
        <span className="min-w-0 truncate">{children}</span>
      </span>
    );
  }
  return (
    <img
      src={logoUrl}
      alt={name || (isEn ? 'Store logo' : 'Logo toko')}
      className={`${imgClassName} w-auto max-w-[200px] object-contain block`}
      loading="eager"
    />
  );
};
