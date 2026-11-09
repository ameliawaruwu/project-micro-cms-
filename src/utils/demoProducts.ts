import { THEME_DATA_MAP } from '../themes/themeData';

/** ID semua produk contoh template (THEME_DATA_MAP). Produk ini tidak boleh tampil/terbit di toko live. */
const DEMO_PRODUCT_IDS = new Set(
  Object.values(THEME_DATA_MAP).flatMap((theme) => (theme?.products || []).map((p) => p.id))
);

/** True jika ID milik produk contoh template / data dummy, bukan produk toko dari menu Produk. */
export function isDemoProductId(id?: string | null): boolean {
  if (!id) return true;
  return DEMO_PRODUCT_IDS.has(id) || /^(mock-|pro_p|sample-)/i.test(id);
}

/** Buang produk contoh template dari daftar produk. */
export function filterRealProducts<T extends { id?: string | null }>(products: T[] | null | undefined): T[] {
  return (products || []).filter((p) => p && !isDemoProductId(p.id));
}
