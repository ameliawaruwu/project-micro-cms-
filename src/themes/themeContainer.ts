import { normalizeThemeId, ThemeId } from './ThemeRegistry';

/**
 * Lebar & jarak tepi konten tiap template, disalin dari bagian produk unggulan tema
 * (FeaturedProducts / ProductGrid). Bagian umum (Pencarian & Kategori, Banner Promo,
 * Keunggulan Toko) memakai nilai ini agar sejajar dengan navbar, hero, dan grid produk
 * template — bukan selebar layar atau memakai lebar bawaan LapakQ.
 *
 * - `outer`: padding horizontal pada pembungkus bagian (latar tetap penuh).
 * - `inner`: batas lebar konten (beserta padding bila tema menaruhnya di dalam container).
 */
export interface ThemeContainer {
  outer: string;
  inner: string;
}

const CONTAINERS: Record<ThemeId, ThemeContainer> = {
  minimalist: { outer: 'px-3.5 sm:px-6 md:px-12', inner: 'max-w-5xl mx-auto' },
  editorial: { outer: 'px-4 sm:px-6 md:px-12', inner: 'max-w-6xl mx-auto' },
  futuristic: { outer: 'px-4 sm:px-6 md:px-12', inner: 'max-w-7xl mx-auto' },
  bold: { outer: 'px-4 sm:px-6 md:px-12', inner: 'max-w-7xl mx-auto' },
  nature: { outer: 'px-4 sm:px-6', inner: 'max-w-6xl mx-auto' },
  luxury: { outer: 'px-4 sm:px-8 md:px-16', inner: 'w-full' },
  cute: { outer: 'px-4 sm:px-6', inner: 'max-w-6xl mx-auto' },
  creative: { outer: 'px-4 sm:px-6', inner: 'max-w-6xl mx-auto' },
  elegant: { outer: 'px-4 sm:px-6 md:px-16', inner: 'max-w-7xl mx-auto' },
  modern: { outer: 'px-4 md:px-8', inner: 'max-w-7xl mx-auto' },
  professional: { outer: '', inner: 'max-w-7xl mx-auto px-4 sm:px-6 md:px-16' },
  fashion: { outer: '', inner: 'max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12' },
};

const DEFAULT_CONTAINER: ThemeContainer = { outer: 'px-4 sm:px-6 lg:px-8', inner: 'max-w-6xl mx-auto' };

export function getThemeContainer(themeId?: string): ThemeContainer {
  if (!themeId) return DEFAULT_CONTAINER;
  return CONTAINERS[normalizeThemeId(themeId)] || DEFAULT_CONTAINER;
}
