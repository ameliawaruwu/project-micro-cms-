import { DEFAULT_LANDING_NAV_ITEMS } from '../utils/layoutConstants';

export interface ResolvedNavItem {
  id: string;
  label: string;
  route: string;
  isActive: boolean;
}

/**
 * Menu navigasi navbar/footer tema = menu yang diatur di panel kanan editor ("Menu Navigasi").
 * Bila merchant belum mengubahnya, pakai default yang sama dengan yang ditampilkan panel
 * (Beranda, Katalog, Promo, Kontak) — bukan menu contoh template.
 */
export function getNavMenuItems(sectionOptions: any = {}): ResolvedNavItem[] {
  const items: any[] =
    Array.isArray(sectionOptions?.navMenuItems) && sectionOptions.navMenuItems.length > 0
      ? sectionOptions.navMenuItems
      : DEFAULT_LANDING_NAV_ITEMS;

  return items
    .filter((item) => item && (item.label || item.name))
    .map((item, i) => ({
      id: item.id || `nav-${i}`,
      label: item.label || item.name,
      // Tautan diisi merchant: tolak skema berbahaya (mis. javascript:) sebelum dirender.
      route: sanitizeLinkHref(item.href || item.route) || '#',
      isActive: true,
    }));
}

export interface HeaderDisplay {
  /** Kelas posisi navbar: melayang (sticky) atau ikut tergulir. */
  positionClass: string;
  showSearch: boolean;
  showCart: boolean;
}

/** Toggle "Header Sticky", "Bar Pencarian", dan "Icon Keranjang" dari panel Header & Logo. */
export function getHeaderDisplay(sectionOptions: any = {}): HeaderDisplay {
  return {
    positionClass: sectionOptions?.stickyHeader === false ? 'relative z-40' : 'sticky top-0 z-50',
    showSearch: sectionOptions?.showSearchBar !== false,
    showCart: sectionOptions?.showCartBadge !== false,
  };
}

/**
 * Subjudul di bawah logo header. Hanya membaca pengaturan header sendiri (string kosong =
 * disembunyikan); deskripsi toko hanya dipakai bila merchant belum pernah mengisinya.
 */
export function getHeaderSubtitle(sectionOptions: any = {}, fallback?: string): string {
  const own =
    sectionOptions?.headerSubtitle ??
    sectionOptions?.subheading ??
    sectionOptions?.subtitle ??
    sectionOptions?.tagline ??
    sectionOptions?.description;
  return String(own ?? fallback ?? '').trim();
}

interface NavPageRule {
  page: string;
  matchesHref: (href: string) => boolean;
  matchesText: (text: string) => boolean;
}

const hrefHas = (...parts: string[]) => (href: string) => parts.some((p) => href.includes(p));
const hrefIs = (...values: string[]) => (href: string) => values.includes(href);
const textHas = (...words: string[]) => (text: string) => words.some((w) => text.includes(w));

/** Urutan aturan menentukan prioritas bila sebuah tautan cocok dengan lebih dari satu halaman. */
const NAV_PAGE_RULES: NavPageRule[] = [
  {
    page: 'homepage',
    matchesHref: hrefIs('/', '/beranda', '/home', '#beranda', '#home'),
    matchesText: (text) => text === 'beranda' || text === 'home',
  },
  {
    page: 'katalog',
    matchesHref: (href) => hrefHas('/katalog', '/products', '/catalog', '/produk', '/shop')(href) || hrefIs('#katalog', '#produk')(href),
    matchesText: textHas('shop', 'katalog', 'produk', 'collection', 'drop', 'gadget', 'jewelry', 'new arrival', 'explore', 'koleksi', 'etalase'),
  },
  {
    page: 'about',
    matchesHref: (href) => hrefHas('/about', '/tentang', '/archive')(href) || hrefIs('#about', '#tentang')(href),
    matchesText: textHas('about', 'tentang', 'philosophy', 'story', 'archive', 'kisah kami', 'b2b', 'craftsmanship', 'behind the scenes', 'brand'),
  },
  {
    page: 'contact',
    matchesHref: (href) => hrefHas('/contact', '/kontak')(href) || hrefIs('#kontak', '#contact')(href),
    matchesText: textHas('kontak', 'contact', 'support', 'bantuan', 'store locator', 'fitting'),
  },
  {
    page: 'cart',
    matchesHref: (href) => hrefHas('/cart', '/keranjang')(href) || hrefIs('#cart', '#keranjang')(href),
    matchesText: textHas('cart', 'keranjang'),
  },
  {
    page: 'checkout',
    matchesHref: (href) => hrefHas('/checkout')(href) || hrefIs('#checkout')(href),
    matchesText: textHas('checkout', 'bayar'),
  },
  {
    page: 'orders',
    matchesHref: (href) => hrefHas('/orders', '/pesanan')(href) || hrefIs('#orders', '#pesanan')(href),
    matchesText: textHas('orders', 'pesanan'),
  },
  {
    page: 'profile',
    matchesHref: (href) => hrefHas('/profile', '/profil', '/akun')(href) || hrefIs('#profile', '#profil', '#akun')(href),
    matchesText: textHas('profile', 'profil', 'akun'),
  },
  {
    page: 'login',
    matchesHref: (href) => hrefHas('/login', '/masuk')(href) || hrefIs('#login')(href),
    matchesText: textHas('login', 'masuk'),
  },
];

/**
 * Halaman toko tujuan sebuah tautan navigasi. Alamat (href) yang diisi merchant selalu
 * diutamakan; teks label hanya dipakai bila alamatnya tidak dikenali. Mengembalikan null
 * bila tidak ada halaman yang cocok (mis. anchor section "#promo").
 */
export function resolveNavPage(href: string, text = ''): string | null {
  const cleanHref = (href || '').toLowerCase().trim();
  const cleanText = (text || '').toLowerCase().trim();
  const byHref = NAV_PAGE_RULES.find((rule) => cleanHref && rule.matchesHref(cleanHref));
  if (byHref) return byHref.page;
  if (cleanHref.startsWith('#') && cleanHref.length > 1) return null;
  const byText = NAV_PAGE_RULES.find((rule) => cleanText && rule.matchesText(cleanText));
  return byText ? byText.page : null;
}

/**
 * Tautan yang aman dipakai pada atribut href: hanya http(s), mailto, tel, path relatif ("/...")
 * atau anchor ("#..."). Skema lain (mis. "javascript:") dibuang untuk mencegah XSS.
 */
export function sanitizeLinkHref(value: unknown): string {
  const href = String(value ?? '').trim();
  if (!href) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href;
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (href.startsWith('#')) return href;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(href)) return `https://${href}`;
  return '';
}

export interface FooterLegalLink {
  key: 'privacy' | 'terms';
  label: string;
  href: string;
}

/**
 * Tautan Kebijakan Privasi & Syarat Ketentuan dari pengaturan footer.
 * Hanya tampil bila merchant mengisi URL yang valid (tidak ada tautan mati).
 */
export function getFooterLegalLinks(sectionOptions: any = {}): FooterLegalLink[] {
  const entries: Array<[FooterLegalLink['key'], string, string, string]> = [
    ['privacy', 'privacyPolicyText', 'privacyPolicyUrl', 'Kebijakan Privasi'],
    ['terms', 'termsOfServiceText', 'termsOfServiceUrl', 'Syarat & Ketentuan'],
  ];
  return entries.flatMap(([key, textKey, urlKey, fallbackLabel]) => {
    const href = sanitizeLinkHref(sectionOptions?.[urlKey]);
    if (!href) return [];
    const label = String(sectionOptions?.[textKey] ?? '').trim() || fallbackLabel;
    return [{ key, label, href }];
  });
}

export interface FooterSocialLink {
  key: string;
  label: string;
  href: string;
}

/**
 * Tautan media sosial footer: hanya yang diisi merchant di pengaturan footer (sectionOptions),
 * tidak memakai akun contoh template.
 */
export function getFooterSocialLinks(sectionOptions: any = {}): FooterSocialLink[] {
  const socials = sectionOptions?.socials || {};
  const read = (key: string) => String(sectionOptions?.[key] || socials?.[key] || '').trim();
  const toUrl = (value: string, base: string) =>
    /^https?:\/\//i.test(value) ? value : `${base}${value.replace(/^@/, '')}`;

  const links: FooterSocialLink[] = [];
  const instagram = read('instagram');
  const tiktok = read('tiktok');
  const twitter = read('twitter');
  const facebook = read('facebook');
  const youtube = read('youtube');
  if (instagram) links.push({ key: 'instagram', label: 'Instagram', href: toUrl(instagram, 'https://instagram.com/') });
  if (tiktok) links.push({ key: 'tiktok', label: 'TikTok', href: toUrl(tiktok, 'https://tiktok.com/@') });
  if (twitter) links.push({ key: 'twitter', label: 'X / Twitter', href: toUrl(twitter, 'https://x.com/') });
  if (facebook) links.push({ key: 'facebook', label: 'Facebook', href: toUrl(facebook, 'https://facebook.com/') });
  if (youtube) links.push({ key: 'youtube', label: 'YouTube', href: toUrl(youtube, 'https://youtube.com/@') });
  return links;
}
