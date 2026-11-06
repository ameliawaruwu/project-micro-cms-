import { createContext, useContext } from 'react';
import { useCmsStore } from '../cms/useCmsStore';
import { CmsProduct } from '../cms/mockCmsData';
import { THEME_DATA_MAP } from './themeData';

/**
 * Bernilai true saat section tema dirender di preview Editor Layout (dipasang oleh ThemeSectionRenderer).
 * Dipakai agar section produk tetap terlihat di editor walau toko belum punya produk.
 */
export const ThemePreviewContext = createContext(false);

/**
 * Sumber produk untuk section tema: produk toko dari CMS store. Jika toko belum punya produk
 * dan section dirender di editor, pakai produk contoh tema agar desain section tetap terlihat.
 * Storefront publik tidak pernah memakai produk contoh.
 */
export function useThemeProductsSource(themeId: string, forceEditor = false): CmsProduct[] {
  const storeProducts = useCmsStore((state) => state.products);
  const inEditor = useContext(ThemePreviewContext) || forceEditor;
  if (storeProducts.length > 0 || !inEditor) return storeProducts;
  return THEME_DATA_MAP[themeId]?.products || [];
}

interface SectionProductOptions {
  selectedCategoryId?: string;
  selectedProductIds?: string[];
  sortOrder?: string;
  productCount?: number;
}

/**
 * Produk untuk section katalog tema, sesuai pengaturan panel kanan editor
 * (filter kategori, produk pilihan, urutan, jumlah).
 */
export function useSectionProducts(
  themeId: string,
  options: SectionProductOptions = {},
  { defaultCount = 4, inEditor = false }: { defaultCount?: number; inEditor?: boolean } = {}
): CmsProduct[] {
  const source = useThemeProductsSource(themeId, inEditor);
  let list = [...source];

  if (options.selectedCategoryId && options.selectedCategoryId !== 'all') {
    list = list.filter((p) => ((p as any).category || p.categoryName) === options.selectedCategoryId);
  }
  if (options.selectedProductIds && options.selectedProductIds.length > 0) {
    const picked = list.filter((p) => options.selectedProductIds!.includes(p.id));
    if (picked.length > 0) list = picked;
  }

  if (options.sortOrder === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (options.sortOrder === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (options.sortOrder === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));

  return list.slice(0, options.productCount || defaultCount);
}
