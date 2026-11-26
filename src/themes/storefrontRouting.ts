/**
 * Rute URL storefront publik (<slug>.lapakq.com / domain kustom). Navigasi di dalam toko
 * memakai history.pushState agar URL mengikuti halaman (mis. /katalog, /produk/<slug>),
 * tombol Back/Forward browser berfungsi, dan tautan bisa dibagikan / di-refresh.
 */

/** Path utama tiap halaman toko (dipakai saat menulis URL). */
const PAGE_PATHS: Record<string, string> = {
  homepage: '/',
  home: '/',
  katalog: '/katalog',
  catalog: '/katalog',
  promo: '/promo',
  contact: '/kontak',
  about: '/tentang',
  cart: '/keranjang',
  checkout: '/checkout',
  track_order: '/lacak',
  orders: '/pesanan',
  order_status: '/pesanan',
  order_detail: '/detail-pesanan',
  profile: '/profil',
  login: '/masuk',
  register: '/daftar',
  forgot_password: '/lupa-password',
  wishlist: '/favorit',
  address: '/alamat',
  category: '/kategori',
};

/** Segmen pertama path → halaman (termasuk alias bahasa Inggris & path lama). */
const SEGMENT_PAGES: Record<string, string> = {
  '': 'homepage',
  beranda: 'homepage',
  home: 'homepage',
  homepage: 'homepage',
  katalog: 'katalog',
  catalog: 'katalog',
  products: 'katalog',
  promo: 'promo',
  kontak: 'contact',
  contact: 'contact',
  tentang: 'about',
  about: 'about',
  keranjang: 'cart',
  cart: 'cart',
  checkout: 'checkout',
  lacak: 'track_order',
  track: 'track_order',
  pesanan: 'orders',
  orders: 'orders',
  'detail-pesanan': 'order_detail',
  'order-detail': 'order_detail',
  profil: 'profile',
  profile: 'profile',
  masuk: 'login',
  login: 'login',
  daftar: 'register',
  register: 'register',
  'lupa-password': 'forgot_password',
  'forgot-password': 'forgot_password',
  favorit: 'wishlist',
  wishlist: 'wishlist',
  alamat: 'address',
  address: 'address',
  kategori: 'category',
  category: 'category',
};

const PRODUCT_SEGMENTS = new Set(['produk', 'product', 'detail-produk']);

export interface StorefrontRoute {
  page: string;
  /** Slug/ID produk dari /produk/<slug>; ProductDetailPage menerima slug maupun ID. */
  productId?: string;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Halaman toko dari pathname, atau null bila path tidak dikenal. */
export function pageFromPath(pathname: string): StorefrontRoute | null {
  const parts = String(pathname || '/')
    .split('/')
    .filter(Boolean)
    .map((p) => p.toLowerCase());
  const first = parts[0] || '';
  if (PRODUCT_SEGMENTS.has(first)) {
    // "/produk" tanpa slug = daftar produk.
    const raw = String(pathname).split('/').filter(Boolean)[1];
    return raw ? { page: 'product', productId: safeDecode(raw) } : { page: 'katalog' };
  }
  const page = SEGMENT_PAGES[first];
  return page ? { page } : null;
}

/** Path untuk halaman toko; null bila halaman tidak punya URL sendiri (mis. thank_you). */
export function pathForPage(page: string, productSlug?: string): string | null {
  if (page === 'product') {
    return productSlug ? `/produk/${encodeURIComponent(productSlug)}` : null;
  }
  return PAGE_PATHS[page] ?? null;
}

/** Path sama dengan halaman yang sedang tampil (abaikan beda huruf & garis miring akhir). */
export function isSamePath(a: string, b: string): boolean {
  const norm = (p: string) => (p.replace(/\/+$/, '') || '/').toLowerCase();
  return norm(a) === norm(b);
}
