import type { CmsProduct } from '../cms/mockCmsData';
import { sanitizeLinkHref } from './navMenu';

/**
 * Tujuan tombol section beranda. Sama dengan menu bawaan navbar (Beranda, Katalog, Promo,
 * Kontak) sehingga tombol landing page membuka halaman yang sama dengan menu navigasi.
 * Klik ditangani navigasi halaman toko (CenterPreviewCanvas), bukan reload browser.
 */
export const STORE_ROUTES = {
  home: '/',
  catalog: '/katalog',
  promo: '/promo',
  contact: '/kontak',
} as const;

/** Tautan detail produk; dikenali CenterPreviewCanvas lewat pola "/produk/:slug". */
export function productHref(product: Pick<CmsProduct, 'id' | 'slug'>): string {
  return `/produk/${encodeURIComponent(product.slug || product.id)}`;
}

export interface ProductCategoryTile {
  name: string;
  image: string;
  count: number;
}

/** Kategori yang benar-benar dimiliki produk toko, beserta gambar produk pertamanya. */
export function getProductCategories(products: CmsProduct[], max = 4): ProductCategoryTile[] {
  const byName = new Map<string, ProductCategoryTile>();
  for (const product of products) {
    const name = String(product.categoryName || '').trim();
    if (!name) continue;
    const existing = byName.get(name);
    if (existing) {
      existing.count += 1;
      if (!existing.image && product.image) existing.image = product.image;
    } else {
      byName.set(name, { name, image: product.image || '', count: 1 });
    }
  }
  return Array.from(byName.values()).slice(0, max);
}

/** Harga dalam format Rupiah ("Rp 100.000"); nilai tidak valid dianggap 0. */
export function formatRupiah(value: unknown): string {
  const amount = Number(value);
  return `Rp ${(Number.isFinite(amount) ? amount : 0).toLocaleString('id-ID')}`;
}

/**
 * Tombol aksi section dari panel editor ("Teks Tombol" & "Tautan Tombol"). Tautan kosong,
 * "#"/"#all" (nilai lama template) atau tautan berbahaya memakai tujuan bawaan section.
 */
export function resolveSectionCta(
  options: Record<string, any> | undefined,
  fallbackLabel: string,
  fallbackHref: string,
): { label: string; href: string } {
  const label = String(options?.buttonLabel || options?.buttonText || '').trim() || fallbackLabel;
  const href = sanitizeLinkHref(options?.buttonLink);
  return { label, href: href && href !== '#' && href !== '#all' ? href : fallbackHref };
}

/** Gambar section yang diunggah/dipilih merchant di editor; hanya URL http(s) atau path lokal. */
export function resolveSectionImage(options: Record<string, any> | undefined): string {
  const url = String(options?.imageUrl || options?.bannerUrl || '').trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  return '';
}
