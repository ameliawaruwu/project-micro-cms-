import type { Store } from '../types';

/**
 * Toko dianggap sudah disiapkan merchant bila data wajib di Pengaturan Toko (nama, provinsi,
 * alamat) sudah diisi, atau toko sudah pernah diterbitkan.
 *
 * Saat registrasi/login pertama setiap merchant otomatis dibuatkan toko bernama "Toko <nama>"
 * tanpa alamat, jadi keberadaan store.id saja belum berarti merchant sudah membuka toko.
 */
export const isStoreSetUp = (store?: Partial<Store> | null): boolean => {
  if (!store?.id) return false;
  if (store.isPublished) return true;

  const name = (store.name || '').trim();
  const hasName = name !== '' && !name.startsWith('Toko usr_');
  const hasProvince = (store.province || '').trim() !== '';
  const hasAddress = (store.address || store.addressDetail || '').trim() !== '';

  return hasName && hasProvince && hasAddress;
};
