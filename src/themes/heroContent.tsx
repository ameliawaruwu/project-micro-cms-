import React from 'react';
import { sanitizeLinkHref } from './navMenu';

export interface HeroAction {
  label: string;
  href: string;
}

export interface HeroContent {
  /** Teks label badge di atas judul; string kosong = badge disembunyikan. */
  badge: string;
  primary: HeroAction;
  /** Tombol kedua; null bila merchant tidak mengisinya (dan tema tidak punya bawaan). */
  secondary: HeroAction | null;
}

interface HeroDefaults {
  badge?: string;
  buttonLabel: string;
  buttonLink?: string;
  secondaryButtonLabel?: string;
  secondaryButtonLink?: string;
}

const DEFAULT_HERO_LINK = '/katalog';

/** Tautan tombol yang diisi merchant; "#" (nilai awal panel) atau tautan berbahaya → bawaan. */
function resolveHeroLink(value: unknown, fallback = DEFAULT_HERO_LINK): string {
  const href = sanitizeLinkHref(value);
  return href && href !== '#' ? href : fallback;
}

/**
 * Isi hero dari panel kanan editor ("Label Badge", "Tombol Utama", "Tombol Sekunder").
 * Nilai yang belum pernah diisi memakai bawaan tema; nilai yang sengaja dikosongkan
 * menyembunyikan badge / tombol sekunder.
 */
export function getHeroContent(sectionOptions: any = {}, defaults: HeroDefaults): HeroContent {
  const badge = String(sectionOptions?.badgeText ?? defaults.badge ?? '').trim();

  const primaryLabel =
    String(sectionOptions?.buttonLabel ?? sectionOptions?.buttonText ?? '').trim() || defaults.buttonLabel;

  const secondaryLabel = String(
    sectionOptions?.secondaryButtonLabel ?? defaults.secondaryButtonLabel ?? ''
  ).trim();

  return {
    badge,
    primary: {
      label: primaryLabel,
      href: resolveHeroLink(sectionOptions?.buttonLink, defaults.buttonLink),
    },
    secondary: secondaryLabel
      ? {
          label: secondaryLabel,
          href: resolveHeroLink(sectionOptions?.secondaryButtonLink, defaults.secondaryButtonLink),
        }
      : null,
  };
}

interface HeroActionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  action: HeroAction;
  children?: React.ReactNode;
}

/**
 * Tombol hero berupa tautan. Tautan internal ditangani navigasi halaman toko
 * (CenterPreviewCanvas); tautan eksternal dibuka di tab baru.
 */
export const HeroActionLink: React.FC<HeroActionLinkProps> = ({ action, children, ...rest }) => {
  const isExternal = /^(https?:\/\/|mailto:|tel:)/i.test(action.href);
  return (
    <a
      href={action.href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children ?? action.label}
    </a>
  );
};
