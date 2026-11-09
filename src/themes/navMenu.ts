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
