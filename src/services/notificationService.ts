import { supabase } from './supabaseClient';

/**
 * Notifikasi in-app. Baris dibuat oleh trigger database (lihat migrasi
 * 20261116_notifications.sql) dari aktivitas nyata; klien hanya membaca,
 * menandai dibaca, dan menghapus notifikasi miliknya sendiri (RLS).
 */
export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  storeId: string | null;
  readAt: string | null;
  createdAt: string;
}

const COLUMNS = 'id, type, title, body, link, store_id, read_at, created_at';

const mapRow = (r: any): AppNotification => ({
  id: Number(r.id),
  type: String(r.type || ''),
  title: String(r.title || ''),
  body: r.body ?? null,
  link: r.link ?? null,
  storeId: r.store_id ?? null,
  readAt: r.read_at ?? null,
  createdAt: String(r.created_at || ''),
});

export const notificationService = {
  /** Notifikasi terbaru milik pengguna yang login. Gagal → daftar kosong. */
  async list(limit = 30): Promise<AppNotification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(COLUMNS)
        .order('created_at', { ascending: false })
        .limit(Math.min(Math.max(limit, 1), 100));
      if (error || !Array.isArray(data)) return [];
      return data.map(mapRow);
    } catch {
      return [];
    }
  },

  async markRead(ids: number[]): Promise<void> {
    const clean = ids.filter((id) => Number.isSafeInteger(id) && id > 0);
    if (clean.length === 0) return;
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', clean)
        .is('read_at', null);
    } catch {
      /* abaikan: status baca akan tersinkron di polling berikutnya */
    }
  },

  async markAllRead(): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);
    } catch {
      /* abaikan */
    }
  },

  async remove(id: number): Promise<void> {
    if (!Number.isSafeInteger(id) || id <= 0) return;
    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch {
      /* abaikan */
    }
  },
};
