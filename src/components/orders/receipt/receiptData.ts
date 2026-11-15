import { useEffect, useState } from 'react';
import { Order, Store as StoreType } from '../../../types';
import { supabase } from '../../../services/supabaseClient';

/** Berat default per produk bila `weight_grams` kosong (sama dengan server, backend/orderController.ts). */
const DEFAULT_ITEM_WEIGHT_GRAMS = 250;

/**
 * Alamat pengirim dari data toko. `city` diisi 'Indonesia' oleh storeService bila kosong,
 * jadi nilai itu dianggap belum diisi. Mengembalikan string kosong bila toko belum punya alamat.
 */
export function storeAddressLine(store: StoreType): string {
  const city = store.city && store.city !== 'Indonesia' ? store.city : '';
  const parts = [
    store.addressDetail || store.address,
    store.subdistrict,
    store.district,
    city,
    store.province,
    store.postalCode,
  ]
    .map((p) => (p || '').trim())
    .filter(Boolean);
  return Array.from(new Set(parts)).join(', ');
}

/**
 * Catatan yang benar-benar ditulis pembeli. Checkout lama menyimpan ringkasan otomatis
 * ("Alamat: … Kurir: … Ongkir: …") di kolom notes; ringkasan itu mengulang data alamat,
 * kurir, dan ongkir sehingga tidak ditampilkan.
 */
export function buyerNote(order: Pick<Order, 'notes'>): string {
  const note = (order.notes || '').trim();
  if (!note || /^Alamat:\s/.test(note)) return '';
  return note;
}

export function formatWeight(grams: number, isEn: boolean): string {
  if (grams < 1000) return `${grams} g`;
  return `${(grams / 1000).toLocaleString(isEn ? 'en-US' : 'id-ID', { maximumFractionDigits: 2 })} kg`;
}

/** Total berat paket (gram) dari tabel products, dengan rumus yang sama seperti tarif ongkir server. */
export function useOrderWeightGrams(order: Order | null): number | null {
  const [grams, setGrams] = useState<number | null>(null);

  useEffect(() => {
    if (!order) return;
    let cancelled = false;
    setGrams(null);
    const ids = Array.from(new Set(order.items.map((i) => i.productId).filter(Boolean)));

    (async () => {
      const weights = new Map<string, number>();
      if (ids.length > 0) {
        const { data } = await supabase.from('products').select('id, weight_grams').in('id', ids);
        (data || []).forEach((row: { id: string; weight_grams: number | null }) => {
          const w = Number(row.weight_grams);
          weights.set(String(row.id), Number.isFinite(w) && w > 0 ? w : DEFAULT_ITEM_WEIGHT_GRAMS);
        });
      }
      const total = order.items.reduce(
        (acc, i) => acc + (weights.get(i.productId) ?? DEFAULT_ITEM_WEIGHT_GRAMS) * (i.quantity || 1),
        0,
      );
      if (!cancelled) setGrams(total);
    })().catch(() => {
      if (!cancelled) setGrams(null);
    });

    return () => {
      cancelled = true;
    };
  }, [order]);

  return grams;
}

/** Rapikan alamat pembeli untuk tampilan: buang bagian kosong seperti "-" atau "(Patokan / Catatan: -)". */
export function displayAddress(address: string | undefined | null): string {
  return (address || '')
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && p !== '-' && !/^\(Patokan \/ Catatan:\s*-?\s*\)$/.test(p))
    .join(', ');
}
