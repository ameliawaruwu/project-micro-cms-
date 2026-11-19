import { supabase } from './supabaseClient';

/**
 * Draf tema (Pustaka tema di editor Layout) per toko, disimpan di
 * public.store_theme_drafts agar sama di semua perangkat.
 * Akses dibatasi RLS app_private.can_manage_store (migrasi 20261119_store_theme_drafts.sql).
 */

/**
 * - `{ status: 'ok', drafts }`: baris ada di DB (sumber kebenaran).
 * - `{ status: 'missing' }`: toko belum punya baris; draf lokal boleh diunggah.
 * - `{ status: 'error' }`: gagal dibaca (jaringan / tabel belum dimigrasi); jangan menimpa DB.
 */
export type ThemeDraftsLoad =
  | { status: 'ok'; drafts: any[] }
  | { status: 'missing' }
  | { status: 'error' };

export async function loadThemeDrafts(storeId: string): Promise<ThemeDraftsLoad> {
  if (!storeId) return { status: 'error' };
  try {
    const { data, error } = await supabase
      .from('store_theme_drafts')
      .select('drafts')
      .eq('store_id', storeId)
      .maybeSingle();
    if (error) return { status: 'error' };
    if (!data) return { status: 'missing' };
    return { status: 'ok', drafts: Array.isArray(data.drafts) ? data.drafts : [] };
  } catch {
    return { status: 'error' };
  }
}

export async function saveThemeDrafts(storeId: string, drafts: any[]): Promise<boolean> {
  if (!storeId) return false;
  try {
    const { error } = await supabase
      .from('store_theme_drafts')
      .upsert({ store_id: storeId, drafts }, { onConflict: 'store_id' });
    if (error) {
      console.warn('Gagal menyimpan draf tema ke server:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
