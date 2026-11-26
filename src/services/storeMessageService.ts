import { supabase } from './supabaseClient';

/**
 * Pesan "Hubungi Kami" dari storefront.
 * - Pengunjung mengirim lewat server (POST /api/store-messages): validasi, batas
 *   frekuensi, dan cek toko terbit dilakukan di server; klien tidak bisa INSERT.
 * - Pemilik toko membaca, menandai dibaca, dan menghapus pesan tokonya langsung
 *   lewat Supabase (RLS app_private.owns_store, migrasi 20261118_store_messages.sql).
 */
export interface StoreMessage {
  id: number;
  storeId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/** Kode hasil kirim; teks dua bahasa disusun di komponen. */
export type SendMessageResult =
  | 'sent'
  | 'invalid'
  | 'name_required'
  | 'email_invalid'
  | 'message_required'
  | 'rate_limited'
  | 'store_not_found'
  | 'failed';

const COLUMNS = 'id, store_id, sender_name, sender_email, message, is_read, created_at';

const mapRow = (r: any): StoreMessage => ({
  id: Number(r.id),
  storeId: String(r.store_id || ''),
  senderName: String(r.sender_name || ''),
  senderEmail: String(r.sender_email || ''),
  message: String(r.message || ''),
  isRead: Boolean(r.is_read),
  createdAt: String(r.created_at || ''),
});

const KNOWN: SendMessageResult[] = ['invalid', 'name_required', 'email_invalid', 'message_required', 'rate_limited', 'store_not_found'];

export const storeMessageService = {
  async send(input: { storeId: string; name: string; email: string; message: string; website?: string }): Promise<SendMessageResult> {
    try {
      const res = await fetch('/api/store-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) return 'sent';
      const data = await res.json().catch(() => ({}));
      const code = String(data?.code || '') as SendMessageResult;
      return KNOWN.includes(code) ? code : 'failed';
    } catch {
      return 'failed';
    }
  },

  async list(storeId: string, limit = 200): Promise<StoreMessage[]> {
    const { data, error } = await supabase
      .from('store_messages')
      .select(COLUMNS)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 500));
    if (error) throw error;
    return Array.isArray(data) ? data.map(mapRow) : [];
  },

  async countUnread(storeId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('store_messages')
        .select('id', { count: 'exact', head: true })
        .eq('store_id', storeId)
        .eq('is_read', false);
      return error ? 0 : count || 0;
    } catch {
      return 0;
    }
  },

  async setRead(ids: number[], isRead: boolean): Promise<void> {
    const clean = ids.filter((id) => Number.isSafeInteger(id) && id > 0);
    if (clean.length === 0) return;
    const { error } = await supabase.from('store_messages').update({ is_read: isRead }).in('id', clean);
    if (error) throw error;
  },

  async remove(id: number): Promise<void> {
    if (!Number.isSafeInteger(id) || id <= 0) return;
    const { error } = await supabase.from('store_messages').delete().eq('id', id);
    if (error) throw error;
  },
};
