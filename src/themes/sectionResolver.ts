import type React from 'react';
import { ThemeRegistry, ThemeId, normalizeThemeId } from './ThemeRegistry';
import { ThemedAnnouncement, ThemedPromoBanner, ThemedStoreBenefits, ThemedStoreInfo } from './sections/ThemedBlocks';

/**
 * Bagian yang tidak lagi ditampilkan di toko:
 * - `testimonials`: belum ada fitur ulasan pelanggan, isinya hanya testimoni contoh.
 * - `newsletter`: formulir langganan belum terhubung ke mana pun.
 */
export const HIDDEN_SECTION_IDS = new Set(['testimonials', 'newsletter']);

/** Bagian umum yang dimiliki semua tema (bukan khas satu template). */
const GENERIC_SECTION_IDS = new Set([
  'header',
  'hero_banner',
  'footer',
  'featured_products',
  'product_grid',
  'announcement',
  'promo_banner',
  'store_benefits',
  'store_info',
  'search_category',
  'testimonials',
  'newsletter',
]);

const SPECIAL_MAP: Record<string, string> = {
  header: 'Navbar',
  hero_banner: 'Hero',
  footer: 'Footer',
  featured_products: 'FeaturedProducts',
  product_grid: 'FeaturedProducts',
};

/** Versi bertema dari bagian umum, dipakai bila template tidak punya desain khusus. */
const THEMED_FALLBACKS: Record<string, React.FC<any>> = {
  Announcement: ThemedAnnouncement,
  PromoBanner: ThemedPromoBanner,
  StoreBenefits: ThemedStoreBenefits,
  StoreInfo: ThemedStoreInfo,
};

const toPascalCase = (str: string) =>
  str.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase());

export const getSectionComponentName = (sectionId: string) => SPECIAL_MAP[sectionId] || toPascalCase(sectionId);

const getThemeComponents = (themeId?: string) =>
  ThemeRegistry[normalizeThemeId(themeId)] || ThemeRegistry[themeId as ThemeId];

/** Komponen tema untuk sebuah bagian (desain khas template, lalu versi bertema umum). */
export function getThemeSectionComponent(themeId: string | undefined, sectionId: string): React.FC<any> | undefined {
  if (HIDDEN_SECTION_IDS.has(sectionId)) return undefined;
  const name = getSectionComponentName(sectionId);
  const theme = getThemeComponents(themeId);
  return (theme?.[name] as React.FC<any> | undefined) || THEMED_FALLBACKS[name];
}

/**
 * Tema yang benar untuk dirender. Bila daftar bagian berisi bagian khas template lain
 * (mis. "Koleksi Privat" milik Luxury) sementara tema aktif tidak memilikinya, tema aktif
 * tidak sinkron dengan layout — tanpa koreksi ini bagian tersebut tampil kosong (hero
 * langsung footer) dan bagian umum memakai desain template yang salah.
 */
export function resolveThemeForSections(themeId: string | undefined, sectionIds: string[]): ThemeId {
  const current = normalizeThemeId(themeId);
  const specific = Array.from(new Set(sectionIds.filter((id) => !GENERIC_SECTION_IDS.has(id))));
  if (specific.length === 0) return current;
  const supports = (t: ThemeId) => {
    const comps = ThemeRegistry[t];
    return !!comps && specific.every((id) => !!comps[getSectionComponentName(id)]);
  };
  if (supports(current)) return current;
  const ids = Object.keys(ThemeRegistry).filter((k) => !k.includes('_')) as ThemeId[];
  // Tema yang mendukung semua bagian khas; bila tidak ada, yang mendukung paling banyak.
  const full = ids.find(supports);
  if (full) return full;
  let best: ThemeId = current;
  let bestScore = specific.filter((id) => !!ThemeRegistry[current]?.[getSectionComponentName(id)]).length;
  for (const t of ids) {
    const score = specific.filter((id) => !!ThemeRegistry[t]?.[getSectionComponentName(id)]).length;
    if (score > bestScore) {
      best = t;
      bestScore = score;
    }
  }
  return best;
}
