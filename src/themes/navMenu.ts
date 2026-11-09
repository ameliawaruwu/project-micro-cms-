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
      route: item.href || item.route || '#',
      isActive: true,
    }));
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
