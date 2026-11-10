import { Router, Request, Response } from 'express';
import { sendMail, MailerNotConfiguredError } from './mailer';

// Reset password: kode 6 digit dibuat & disimpan (ter-hash bcrypt) oleh fungsi database
// request_password_reset, yang HANYA bisa dipanggil service_role. Kode dikirim ke email pemilik akun
// dan tidak pernah dikembalikan ke browser. Verifikasi & penggantian password lewat RPC
// complete_password_reset (percobaan dibatasi di database).
//
// Env server: VITE_SUPABASE_URL (atau SUPABASE_URL) dan SUPABASE_SERVICE_ROLE_KEY (jangan di-commit).

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 15 * 60_000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;
const attempts = new Map<string, { count: number; resetAt: number }>();

function hit(key: string, max: number): boolean {
  const now = Date.now();
  const info = attempts.get(key);
  if (!info || now >= info.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  info.count += 1;
  return info.count <= max;
}

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Balasan sama untuk email terdaftar maupun tidak, agar keberadaan akun tidak bocor.
const GENERIC_OK = { success: true, message: 'Jika email terdaftar, kode verifikasi telah dikirim.' };

authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Alamat email tidak valid.' });
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!hit(`ip:${ip}`, MAX_PER_IP) || !hit(`email:${email}`, MAX_PER_EMAIL)) {
    return res.status(429).json({ error: 'Terlalu banyak permintaan. Coba lagi dalam 15 menit.' });
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceKey) {
    console.error('[auth] forgot-password: SUPABASE_SERVICE_ROLE_KEY belum diatur di .env server');
    return res.status(503).json({ error: 'Reset kata sandi belum tersedia. Hubungi admin LapakQ untuk mengatur ulang kata sandi Anda.' });
  }

  let token: string | null = null;
  let name = '';
  try {
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/request_password_reset`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_email: email }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!rpcRes.ok) {
      console.error('[auth] request_password_reset HTTP', rpcRes.status);
      return res.status(502).json({ error: 'Gagal memproses permintaan. Coba lagi beberapa saat.' });
    }
    const data = await rpcRes.json();
    token = typeof data?.token === 'string' ? data.token : null;
    name = typeof data?.name === 'string' ? data.name : '';
  } catch (err: any) {
    console.error('[auth] request_password_reset error:', err?.message);
    return res.status(502).json({ error: 'Gagal memproses permintaan. Coba lagi beberapa saat.' });
  }

  if (!token) return res.status(200).json(GENERIC_OK);

  try {
    await sendMail(
      email,
      'LapakQ - Kode Reset Kata Sandi',
      `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #66000E;">Permintaan Reset Kata Sandi</h2>
        <p>Halo${name ? ` ${escapeHtml(name)}` : ''},</p>
        <p>Gunakan kode berikut untuk mengatur ulang kata sandi akun LapakQ Anda. Kode berlaku 15 menit.</p>
        <div style="background-color: #F9EDEF; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #66000E;">${token}</span>
        </div>
        <p>Jika Anda tidak meminta reset kata sandi, abaikan email ini. Kata sandi Anda tidak berubah.</p>
        <p style="font-size: 12px; color: #666;">Tim LapakQ</p>
      </div>`
    );
  } catch (err: any) {
    if (err instanceof MailerNotConfiguredError) {
      console.error('[auth] forgot-password: SMTP belum diatur');
      return res.status(503).json({ error: 'Pengiriman email belum tersedia. Hubungi admin LapakQ.' });
    }
    console.error('[auth] forgot-password mail error:', err?.message);
    return res.status(502).json({ error: 'Gagal mengirim email. Coba lagi beberapa saat.' });
  }

  return res.status(200).json(GENERIC_OK);
});
