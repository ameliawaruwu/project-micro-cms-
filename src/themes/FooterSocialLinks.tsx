import React from 'react';
import { Facebook, Instagram, Youtube, type LucideIcon } from 'lucide-react';
import { getFooterSocialLinks } from './navMenu';

/** Logo X (Twitter) — lucide hanya punya burung lama. */
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

/** Logo TikTok — tidak tersedia di lucide. */
const TikTokIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const ICONS: Record<string, LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>> = {
  instagram: Instagram,
  tiktok: TikTokIcon,
  twitter: XIcon,
  facebook: Facebook,
  youtube: Youtube,
};

interface FooterSocialLinksProps {
  sectionOptions?: any;
  /** Kelas pembungkus baris ikon (mis. perataan / jarak). */
  className?: string;
  /** Kelas tiap tombol ikon — warna, border, dan sudut mengikuti template. */
  itemClassName?: string;
  /** Ukuran ikon di dalam tombol. */
  iconClassName?: string;
}

/**
 * Ikon media sosial footer yang dipakai semua template. Urutan tetap sama dengan panel
 * Pengaturan Footer (Instagram, TikTok, X, Facebook, YouTube); hanya yang diisi merchant yang
 * tampil. Tiap ikon berupa tombol berukuran sama agar barisnya rapi di semua perangkat;
 * nama platform tetap terbaca lewat aria-label & tooltip.
 */
export const FooterSocialLinks: React.FC<FooterSocialLinksProps> = ({
  sectionOptions = {},
  className = '',
  itemClassName = 'border border-current/20 rounded-full hover:opacity-70',
  iconClassName = 'w-4 h-4',
}) => {
  const socials = getFooterSocialLinks(sectionOptions);
  if (socials.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {socials.map((s) => {
        const Icon = ICONS[s.key];
        return (
          <a
            key={s.key}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={`inline-flex w-9 h-9 shrink-0 items-center justify-center transition-all duration-200 ${itemClassName}`}
          >
            {Icon ? <Icon className={iconClassName} /> : s.label}
          </a>
        );
      })}
    </div>
  );
};
