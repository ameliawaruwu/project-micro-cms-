import express, { Router, Request, Response } from 'express';
import { canManageStore, requireSession, SessionUser } from './sessionAuth';

// Upload gambar (produk, logo, QRIS, gambar editor layout, avatar) ke CDNKroombox.
// Browser tidak pernah melihat API key CDN: file dikirim ke endpoint ini sebagai data URL,
// diperiksa (sesi, hak atas toko, tipe & ukuran), lalu diteruskan ke CDN dengan CDN_API_KEY.

export const mediaRouter = Router();

// Dibaca saat request (bukan saat import) karena dotenv.config() baru jalan setelah modul dimuat.
const cdnApiUrl = () => (process.env.CDN_API_URL || 'https://api-cdn.kroombox.com').replace(/\/+$/, '');
const MAX_BYTES = 5 * 1024 * 1024;
const STORE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const UPLOAD_KINDS = new Set(['product', 'logo', 'qris', 'layout', 'avatar']);
// Gambar toko wajib menyebut storeId agar hak kelolanya bisa dicek.
const STORE_KINDS = new Set(['product', 'logo', 'qris']);
const READY_TIMEOUT_MS = 25_000;
const READY_POLL_MS = 1_500;

// Maks 30 upload per menit per user, cukup untuk mengunggah beberapa foto produk sekaligus.
const RATE_LIMIT = 30;
const rateWindows = new Map<string, { count: number; resetAt: number }>();

type ImageType = { mime: string; ext: string };

// Tipe ditentukan dari isi file (magic bytes), bukan dari klaim browser. SVG sengaja tidak
// diterima karena bisa membawa skrip.
function sniffImage(buf: Buffer): ImageType | null {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: 'image/png', ext: 'png' };
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return { mime: 'image/webp', ext: 'webp' };
  }
  if (buf.length >= 6 && /^GIF8[79]a$/.test(buf.toString('ascii', 0, 6))) {
    return { mime: 'image/gif', ext: 'gif' };
  }
  return null;
}

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateWindows.get(userId);
  if (!entry || entry.resetAt <= now) {
    rateWindows.set(userId, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

const fail = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, error: message, message });

const cdnHeaders = (apiKey: string, extra: Record<string, string> = {}) => ({ 'x-api-key': apiKey, ...extra });

// Upload CDN diproses asinkron; tunggu sampai berstatus ready agar URL langsung bisa ditampilkan.
async function waitUntilReady(fileId: string, apiKey: string): Promise<boolean> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));
    try {
      const res = await fetch(`${cdnApiUrl()}/api/bridge/files/${encodeURIComponent(fileId)}`, {
        headers: cdnHeaders(apiKey),
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) continue;
      const status = String((await res.json())?.status || '');
      if (status === 'ready') return true;
      if (status === 'failed') return false;
    } catch {
      // Coba lagi sampai batas waktu.
    }
  }
  return false;
}

async function checkUploadAccess(
  user: SessionUser,
  kind: string,
  storeId: string,
  res: Response
): Promise<boolean> {
  if (user.role === 'buyer') {
    fail(res, 403, 'Akun pembeli tidak dapat mengunggah gambar.');
    return false;
  }
  if (STORE_KINDS.has(kind) && !storeId) {
    fail(res, 400, 'storeId wajib diisi untuk gambar toko.');
    return false;
  }
  if (storeId) {
    if (!STORE_ID_RE.test(storeId)) {
      fail(res, 400, 'storeId tidak valid.');
      return false;
    }
    try {
      if (!(await canManageStore(user, storeId))) {
        fail(res, 403, 'Anda tidak berhak mengelola toko ini.');
        return false;
      }
    } catch (err: any) {
      console.error('[media] store access error:', err?.message);
      fail(res, 503, 'Database tidak dapat dihubungi');
      return false;
    }
  }
  return true;
}

// Data URL base64 dari 5 MB gambar ±6,7 MB, jadi batas body route ini dinaikkan khusus di sini.
mediaRouter.post('/upload', express.json({ limit: '8mb' }), async (req: Request, res: Response) => {
  const apiKey = process.env.CDN_API_KEY;
  if (!apiKey) {
    console.error('[media] CDN_API_KEY belum diatur');
    return fail(res, 503, 'Layanan upload gambar belum dikonfigurasi.');
  }

  const user = await requireSession(req, res);
  if (!user) return;

  const kind = String(req.body?.kind || '');
  const storeId = String(req.body?.storeId || '').trim();
  const dataUrl = String(req.body?.dataUrl || '');

  if (!UPLOAD_KINDS.has(kind)) return fail(res, 400, 'Jenis gambar tidak dikenal.');
  if (!(await checkUploadAccess(user, kind, storeId, res))) return;
  if (isRateLimited(user.id)) return fail(res, 429, 'Terlalu banyak upload. Coba lagi sebentar lagi.');

  const match = /^data:[^;,]*;base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) return fail(res, 400, 'Format gambar tidak valid.');

  const buffer = Buffer.from(match[1], 'base64');
  if (buffer.length === 0) return fail(res, 400, 'File gambar kosong.');
  if (buffer.length > MAX_BYTES) return fail(res, 413, 'Ukuran gambar maksimal 5MB.');

  const type = sniffImage(buffer);
  if (!type) return fail(res, 415, 'File harus berupa gambar JPG, PNG, WEBP, atau GIF.');

  const owner = storeId || user.id;
  const fileName = `${kind}_${owner}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${type.ext}`;

  try {
    const uploadRes = await fetch(`${cdnApiUrl()}/api/bridge/upload`, {
      method: 'POST',
      headers: cdnHeaders(apiKey, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ fileName, fileContent: buffer.toString('base64'), mimeType: type.mime }),
      signal: AbortSignal.timeout(30_000),
    });
    const payload: any = await uploadRes.json().catch(() => null);
    const fileId = typeof payload?.fileId === 'string' ? payload.fileId : '';
    if (!uploadRes.ok || !payload?.success || !/^[A-Za-z0-9_-]{1,128}$/.test(fileId)) {
      console.error('[media] CDN upload rejected:', uploadRes.status, payload?.error);
      return fail(res, 502, 'CDN menolak gambar. Silakan coba lagi.');
    }

    if (!(await waitUntilReady(fileId, apiKey))) {
      console.error('[media] CDN processing not ready:', fileId);
      return fail(res, 502, 'Gambar gagal diproses CDN. Silakan coba lagi.');
    }

    return res.json({ success: true, id: fileId, url: `${cdnApiUrl()}/api/bridge/view/${fileId}` });
  } catch (err: any) {
    console.error('[media] CDN upload error:', err?.message);
    return fail(res, 502, 'CDN tidak dapat dihubungi. Silakan coba lagi.');
  }
});
