import { Router, type Request, type Response } from 'express';
import { pool } from './publicApiController';

/**
 * Pesan "Hubungi Kami" dari storefront → kotak masuk merchant (public.store_messages).
 * Klien tidak punya hak INSERT ke tabel itu; hanya endpoint ini yang menyimpan pesan,
 * setelah input divalidasi, frekuensi per IP dibatasi, dan toko dipastikan terbit.
 * Pemilik toko membaca pesannya langsung lewat Supabase (RLS app_private.owns_store).
 */
export const messageRouter = Router();

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Buang karakter kontrol (kecuali baris baru/tab) dan tanda kurung sudut.
const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F<>]/g, '')
    .trim()
    .slice(0, max);

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_STORE = 30;
const hits = new Map<string, number[]>();

function rateLimited(key: string, max: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= max) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return false;
}

// Kirim pesan: { storeId, name, email, message, website? } — `website` adalah honeypot (harus kosong).
messageRouter.post('/store-messages', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const storeId = String(body.storeId || '').trim();
    const name = clean(body.name, 100).replace(/\s+/g, ' ');
    const email = clean(body.email, 254).toLowerCase();
    const message = clean(body.message, 2000);

    // Bot yang mengisi kolom tersembunyi: pura-pura berhasil, tidak disimpan.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return res.json({ success: true });
    }

    if (!ID_RE.test(storeId)) {
      return res.status(400).json({ success: false, code: 'invalid', message: 'Data pesan tidak valid.' });
    }
    if (name.length < 2) {
      return res.status(400).json({ success: false, code: 'name_required', message: 'Nama minimal 2 karakter.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, code: 'email_invalid', message: 'Format email tidak valid.' });
    }
    if (message.length < 5) {
      return res.status(400).json({ success: false, code: 'message_required', message: 'Pesan minimal 5 karakter.' });
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (rateLimited(`ip:${ip}`, MAX_PER_IP) || rateLimited(`store:${storeId}`, MAX_PER_STORE)) {
      return res.status(429).json({ success: false, code: 'rate_limited', message: 'Terlalu banyak pesan. Coba lagi beberapa menit lagi.' });
    }

    const result = await pool.query(
      `INSERT INTO public.store_messages (store_id, sender_name, sender_email, message)
       SELECT s.id, $2, $3, $4
         FROM public.stores s
        WHERE s.id = $1 AND s.is_published = true AND coalesce(s.is_suspended, false) = false
       RETURNING id`,
      [storeId, name, email, message]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, code: 'store_not_found', message: 'Toko tidak ditemukan.' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[store-messages]', err?.message);
    return res.status(500).json({ success: false, code: 'failed', message: 'Gagal mengirim pesan. Silakan coba lagi.' });
  }
});
