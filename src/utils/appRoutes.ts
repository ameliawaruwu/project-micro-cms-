import type { MerchantTab } from '../types';
import type { AdminTab } from '../pages/admin/types';

/**
 * Peta URL panel (hanya di host platform, mis. lapakq.com):
 *   /dashboard[/<seg>]       → tab merchant
 *   /admin[/<seg>]           → tab admin / sub-admin
 *   /admin/toko/<storeId>    → halaman detail toko binaan (sub-admin)
 * Navigasi tetap berbasis state; berkas ini hanya menerjemahkan state ⇄ path
 * agar refresh, akses langsung, dan tombol Back/Forward bekerja.
 */

const MERCHANT_SEGMENTS: Record<MerchantTab, string> = {
  beranda: '',
  produk: 'produk',
  pesanan: 'pesanan',
  layout: 'layout',
  domain: 'domain',
  pembayaran: 'pembayaran',
  pengiriman: 'pengiriman',
  billing: 'billing',
  pengaturan: 'toko',
  profil: 'profil',
  integrasi: 'integrasi',
  tiket: 'tiket',
  pesan: 'pesan',
  voucher: 'voucher',
  komunitas: 'komunitas',
} as Record<MerchantTab, string>;

const ADMIN_SEGMENTS: Record<AdminTab, string> = {
  overview: '',
  stores: 'toko',
  products: 'produk',
  communities: 'komunitas',
  'community-members': 'anggota',
  'domain-requests': 'domain',
  withdrawals: 'penarikan',
  plans: 'paket',
  'orders-shipping': 'pengiriman',
  transactions: 'transaksi',
  settings: 'pengaturan',
  users: 'pengguna',
  tickets: 'tiket',
  'my-tickets': 'tiket-saya',
};

const STORE_ID_REGEX = /^[A-Za-z0-9_-]{1,80}$/;

const splitPath = (pathname: string) =>
  pathname
    .split('/')
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });

const findKey = <T extends string>(map: Record<T, string>, seg: string): T | null => {
  const lower = seg.toLowerCase();
  const hit = (Object.keys(map) as T[]).find((k) => map[k] === lower);
  return hit ?? null;
};

export const merchantTabPath = (tab: MerchantTab): string => {
  const seg = MERCHANT_SEGMENTS[tab];
  return seg ? `/dashboard/${seg}` : '/dashboard';
};

export const isDashboardPath = (pathname: string) => splitPath(pathname)[0]?.toLowerCase() === 'dashboard';
export const isAdminPath = (pathname: string) => splitPath(pathname)[0]?.toLowerCase() === 'admin';

/** Tab merchant dari path `/dashboard/...`; null bila bukan path dashboard / segmen tak dikenal. */
export const parseMerchantPath = (pathname: string): MerchantTab | null => {
  const parts = splitPath(pathname);
  if (parts[0]?.toLowerCase() !== 'dashboard') return null;
  if (parts.length === 1) return 'beranda';
  return findKey(MERCHANT_SEGMENTS, parts[1]);
};

export interface AdminRoute {
  tab: AdminTab;
  storeId: string | null;
}

export const adminRoutePath = (tab: AdminTab, storeId?: string | null): string => {
  if (tab === 'stores' && storeId) return `/admin/toko/${encodeURIComponent(storeId)}`;
  const seg = ADMIN_SEGMENTS[tab];
  return seg ? `/admin/${seg}` : '/admin';
};

/** Rute admin dari path `/admin/...`; null bila bukan path admin / segmen tak dikenal. */
export const parseAdminPath = (pathname: string): AdminRoute | null => {
  const parts = splitPath(pathname);
  if (parts[0]?.toLowerCase() !== 'admin') return null;
  if (parts.length === 1) return { tab: 'overview', storeId: null };
  const tab = findKey(ADMIN_SEGMENTS, parts[1]);
  if (!tab) return null;
  if (tab === 'stores' && parts[2]) {
    return STORE_ID_REGEX.test(parts[2]) ? { tab, storeId: parts[2] } : { tab, storeId: null };
  }
  return { tab, storeId: null };
};
