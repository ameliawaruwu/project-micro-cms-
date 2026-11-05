import type { Store } from '../types';
import { supabase } from '../services/supabaseClient';

/**
 * Keanggotaan komunitas toko.
 * - Komunitas utama: stores.community_id (Store.communityId).
 * - Komunitas tambahan: tabel store_communities (Store.extraCommunityIds), mis. toko yang
 *   dimasukkan Portal GMPS lewat partner API tanpa keluar dari komunitas asalnya.
 */
export function storeInCommunity(store: Store, communityId?: string | null, communityName?: string | null): boolean {
  if (!communityId && !communityName) return false;
  if (communityId && store.communityId === communityId) return true;
  if (communityId && store.extraCommunityIds?.includes(communityId)) return true;
  const name = (communityName || '').trim().toLowerCase();
  return Boolean(name && store.communityName && store.communityName.trim().toLowerCase() === name);
}

/** Peta storeId -> komunitas tambahan. Kosong bila tabel belum ada atau gagal dibaca. */
export async function fetchExtraMemberships(): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  try {
    const { data, error } = await supabase.from('store_communities').select('store_id, community_id');
    if (error || !data) return map;
    for (const row of data as { store_id: string; community_id: string }[]) {
      const list = map.get(row.store_id) || [];
      list.push(row.community_id);
      map.set(row.store_id, list);
    }
  } catch {
    // tabel belum dimigrasi: perlakukan sebagai tanpa komunitas tambahan
  }
  return map;
}

export async function withExtraMemberships<T extends Store>(stores: T[]): Promise<T[]> {
  if (stores.length === 0) return stores;
  const map = await fetchExtraMemberships();
  return stores.map((s) => ({ ...s, extraCommunityIds: (map.get(s.id) || []).filter((c) => c !== s.communityId) }));
}

/** Catat komunitas tambahan untuk toko (idempoten). */
export async function addExtraMembership(storeId: string, communityId: string): Promise<void> {
  const { error } = await supabase
    .from('store_communities')
    .upsert({ store_id: storeId, community_id: communityId, source: 'admin' }, { onConflict: 'store_id,community_id', ignoreDuplicates: true });
  if (error) throw new Error(error.message);
}

export async function removeExtraMembership(storeId: string, communityId: string): Promise<void> {
  const { error } = await supabase.from('store_communities').delete().eq('store_id', storeId).eq('community_id', communityId);
  if (error) throw new Error(error.message);
}
