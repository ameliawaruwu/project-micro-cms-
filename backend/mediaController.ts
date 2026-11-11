import express, { Router, Request, Response } from 'express';
import { pool } from './publicApiController';
import { canManageStore, isPlatformAdmin, requireAdmin, requireSession, SessionUser } from './sessionAuth';

// Upload gambar (produk, logo, QRIS, gambar editor layout, avatar, bukti bayar) ke CDNKroombox.
// Browser tidak pernah melihat API key CDN: file dikirim ke endpoint ini sebagai data URL,
// diperiksa (sesi / pesanan, hak atas toko, tipe & ukuran), lalu diteruskan ke CDN dengan CDN_API_KEY.

export const mediaRouter = Router();

// Dibaca saat request (bukan saat import) karena dotenv.config() baru jalan setelah modul dimuat.
const cdnApiUrl = () => (process.env.CDN_API_URL || 'https://api-cdn.kroombox.com').replace(/\/+$/, '');
const MAX_BYTES = 5 * 1024 * 1024;
const STORE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const ORDER_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const ORDER_NUMBER_RE = /^[A-Z0-9-]{4,32}$/;
const UPLOAD_KINDS = new Set(['product', 'logo', 'qris', 'layout', 'avatar', 'platform']);
// Gambar toko wajib menyebut storeId agar hak kelolanya bisa dicek.
const STORE_KINDS = new Set(['product', 'logo', 'qris']);
// Logo platform LapakQ: hanya super admin, tidak terkait toko mana pun.
const PLATFORM_KIND = 'platform';
const READY_TIMEOUT_MS = 25_000;
const READY_POLL_MS = 1_500;

type RateWindows = Map<string, { count: number; resetAt: number }>;

// Maks 30 upload per menit per user, cukup untuk mengunggah beberapa foto produk sekaligus.
const RATE_LIMIT = 30;
const rateWindows: RateWindows = new Map();

// Bukti bayar diunggah pembeli tanpa login: dibatasi per IP dan per pesanan.
const PROOF_IP_LIMIT = 10;
const PROOF_ORDER_LIMIT = 5;
const PROOF_WINDOW_MS = 60 * 60_000;
const proofIpWindows: RateWindows = new Map();
const proofOrderWindows: RateWindows = new Map();

type ImageType = { mime: string; ext: string };
type ParsedImage = { buffer: Buffer; type: ImageType };
type Failure = { status: number; message: string };

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

/** true bila `key` sudah melewati `limit` request dalam jendela waktu berjalan. */
function hitLimit(windows: RateWindows, key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    // Bersihkan jendela kedaluwarsa agar map tidak tumbuh tanpa batas.
    if (windows.size > 5_000) {
      for (const [k, v] of windows) if (v.resetAt <= now) windows.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

const fail = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, error: message, message });

const cdnHeaders = (apiKey: string, extra: Record<string, string> = {}) => ({ 'x-api-key': apiKey, ...extra });

const randomSuffix = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** Data URL base64 → buffer yang sudah dicek ukuran & tipenya. */
function parseImageDataUrl(dataUrl: string): ParsedImage | Failure {
  const match = /^data:[^;,]*;base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) return { status: 400, message: 'Format gambar tidak valid.' };

  const buffer = Buffer.from(match[1], 'base64');
  if (buffer.length === 0) return { status: 400, message: 'File gambar kosong.' };
  if (buffer.length > MAX_BYTES) return { status: 413, message: 'Ukuran gambar maksimal 5MB.' };

  const type = sniffImage(buffer);
  if (!type) return { status: 415, message: 'File harus berupa gambar JPG, PNG, WEBP, atau GIF.' };
  return { buffer, type };
}

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

/** Kirim gambar ke CDN, tunggu siap, lalu kembalikan id & URL publiknya. */
async function uploadToCdn(image: ParsedImage, fileName: string, apiKey: string): Promise<{ id: string; url: string } | Failure> {
  try {
    const uploadRes = await fetch(`${cdnApiUrl()}/api/bridge/upload`, {
      method: 'POST',
      headers: cdnHeaders(apiKey, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ fileName, fileContent: image.buffer.toString('base64'), mimeType: image.type.mime }),
      signal: AbortSignal.timeout(30_000),
    });
    const payload: any = await uploadRes.json().catch(() => null);
    const fileId = typeof payload?.fileId === 'string' ? payload.fileId : '';
    if (!uploadRes.ok || !payload?.success || !/^[A-Za-z0-9_-]{1,128}$/.test(fileId)) {
      console.error('[media] CDN upload rejected:', uploadRes.status, payload?.error);
      return { status: 502, message: 'CDN menolak gambar. Silakan coba lagi.' };
    }

    if (!(await waitUntilReady(fileId, apiKey))) {
      console.error('[media] CDN processing not ready:', fileId);
      return { status: 502, message: 'Gambar gagal diproses CDN. Silakan coba lagi.' };
    }

    return { id: fileId, url: `${cdnApiUrl()}/api/bridge/view/${fileId}` };
  } catch (err: any) {
    console.error('[media] CDN upload error:', err?.message);
    return { status: 502, message: 'CDN tidak dapat dihubungi. Silakan coba lagi.' };
  }
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
  if (kind === PLATFORM_KIND) {
    if (!isPlatformAdmin(user)) {
      fail(res, 403, 'Hanya super admin yang dapat mengganti logo platform.');
      return false;
    }
    if (storeId) {
      fail(res, 400, 'Logo platform tidak terkait toko.');
      return false;
    }
    return true;
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

const requireCdnKey = (res: Response): string | null => {
  const apiKey = process.env.CDN_API_KEY;
  if (!apiKey) {
    console.error('[media] CDN_API_KEY belum diatur');
    fail(res, 503, 'Layanan upload gambar belum dikonfigurasi.');
    return null;
  }
  return apiKey;
};

// Data URL base64 dari 5 MB gambar ±6,7 MB, jadi batas body route ini dinaikkan khusus di sini.
mediaRouter.post('/upload', express.json({ limit: '8mb' }), async (req: Request, res: Response) => {
  const apiKey = requireCdnKey(res);
  if (!apiKey) return;

  const user = await requireSession(req, res);
  if (!user) return;

  const kind = String(req.body?.kind || '');
  const storeId = String(req.body?.storeId || '').trim();
  const dataUrl = String(req.body?.dataUrl || '');

  if (!UPLOAD_KINDS.has(kind)) return fail(res, 400, 'Jenis gambar tidak dikenal.');
  if (!(await checkUploadAccess(user, kind, storeId, res))) return;
  if (hitLimit(rateWindows, user.id, RATE_LIMIT, 60_000)) {
    return fail(res, 429, 'Terlalu banyak upload. Coba lagi sebentar lagi.');
  }

  const image = parseImageDataUrl(dataUrl);
  if ('status' in image) return fail(res, image.status, image.message);

  const owner = storeId || user.id;
  const uploaded = await uploadToCdn(image, `${kind}_${owner}_${randomSuffix()}.${image.type.ext}`, apiKey);
  if ('status' in uploaded) return fail(res, uploaded.status, uploaded.message);
  return res.json({ success: true, id: uploaded.id, url: uploaded.url });
});

// Bukti pembayaran QRIS / transfer langsung dari pembeli (tanpa login).
// Pembeli membuktikan pesanan miliknya dengan ID + nomor pesanan acak dari checkout, sama seperti
// RPC buyer_confirm_payment. Bukti hanya bisa dikirim selama pesanan belum lunas; menyimpannya
// sekaligus menandai pembeli sudah konfirmasi bayar. Status lunas tetap ditentukan merchant.
mediaRouter.post('/payment-proof', express.json({ limit: '8mb' }), async (req: Request, res: Response) => {
  const apiKey = requireCdnKey(res);
  if (!apiKey) return;

  const orderId = String(req.body?.orderId || '').trim();
  const orderNumber = String(req.body?.orderNumber || '').trim().toUpperCase();
  const dataUrl = String(req.body?.dataUrl || '');
  if (!ORDER_ID_RE.test(orderId) || !ORDER_NUMBER_RE.test(orderNumber)) {
    return fail(res, 400, 'Data pesanan tidak valid.');
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (hitLimit(proofIpWindows, ip, PROOF_IP_LIMIT, PROOF_WINDOW_MS)) {
    return fail(res, 429, 'Terlalu banyak upload. Coba lagi nanti.');
  }

  let storeId = '';
  try {
    const found = await pool.query(
      `SELECT store_id FROM public.orders
        WHERE id = $1 AND order_number = $2 AND payment_status = 'unpaid'
        LIMIT 1`,
      [orderId, orderNumber]
    );
    if (found.rows.length === 0) return fail(res, 404, 'Pesanan tidak ditemukan atau sudah dibayar.');
    storeId = String(found.rows[0].store_id || '');
  } catch (err: any) {
    console.error('[media] payment proof order lookup error:', err?.message);
    return fail(res, 503, 'Database tidak dapat dihubungi');
  }

  if (hitLimit(proofOrderWindows, orderId, PROOF_ORDER_LIMIT, PROOF_WINDOW_MS)) {
    return fail(res, 429, 'Bukti pembayaran pesanan ini sudah terlalu sering diganti. Coba lagi nanti.');
  }

  const image = parseImageDataUrl(dataUrl);
  if ('status' in image) return fail(res, image.status, image.message);

  const owner = STORE_ID_RE.test(storeId) ? storeId : 'store';
  const uploaded = await uploadToCdn(image, `payment_proof_${owner}_${randomSuffix()}.${image.type.ext}`, apiKey);
  if ('status' in uploaded) return fail(res, uploaded.status, uploaded.message);

  try {
    const saved = await pool.query(
      `UPDATE public.orders
          SET payment_proof_url = $1,
              payment_confirmed_at = coalesce(payment_confirmed_at, now()),
              updated_at = now()
        WHERE id = $2 AND order_number = $3 AND payment_status = 'unpaid'
        RETURNING payment_confirmed_at`,
      [uploaded.url, orderId, orderNumber]
    );
    if (saved.rows.length === 0) return fail(res, 409, 'Pesanan sudah dibayar atau tidak ditemukan.');
    return res.json({
      success: true,
      url: uploaded.url,
      paymentConfirmedAt: new Date(saved.rows[0].payment_confirmed_at).toISOString(),
    });
  } catch (err: any) {
    console.error('[media] payment proof save error:', err?.message);
    return fail(res, 503, 'Bukti pembayaran gagal disimpan. Silakan coba lagi.');
  }
});

// ---------------------------------------------------------------------------
// Migrasi gambar lama (Supabase Storage) ke CDNKroombox — khusus super admin.
// Diproses bertahap (maks. MIGRATE_BATCH gambar per request) agar tidak melewati batas
// waktu proxy; panggil ulang sampai `remaining` bernilai 0. `dryRun: true` hanya menghitung.
// ---------------------------------------------------------------------------

// Hanya URL publik bucket Supabase yang boleh diunduh server (mencegah SSRF ke host lain).
const LEGACY_IMAGE_RE = /^https:\/\/[a-z0-9]{20}\.supabase\.co\/storage\/v1\/object\/public\/[A-Za-z0-9_\-./%]+$/;
const LEGACY_SQL_PATTERN = '%.supabase.co/storage/v1/object/public/%';
const MIGRATE_BATCH = 8;

const isLegacyImage = (url: unknown): url is string =>
  typeof url === 'string' && LEGACY_IMAGE_RE.test(url) && !url.includes('..');

/** Unduh satu gambar lama, validasi isinya, lalu unggah ke CDN. */
async function copyLegacyImage(url: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20_000) });
    if (!res.ok) {
      console.error('[media] legacy image fetch failed:', res.status, url);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_BYTES) return null;
    const type = sniffImage(buffer);
    if (!type) return null;

    const uploaded = await uploadToCdn({ buffer, type }, `migrated_${randomSuffix()}.${type.ext}`, apiKey);
    return 'url' in uploaded ? uploaded.url : null;
  } catch (err: any) {
    console.error('[media] legacy image copy error:', err?.message, url);
    return null;
  }
}

mediaRouter.post('/migrate-legacy', express.json({ limit: '10kb' }), async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;
  const apiKey = requireCdnKey(res);
  if (!apiKey) return;
  const dryRun = req.body?.dryRun === true;

  try {
    const products = await pool.query(
      `SELECT id, image_url, images FROM public.products
        WHERE image_url LIKE $1 OR images::text LIKE $1 ORDER BY id`,
      [LEGACY_SQL_PATTERN]
    );
    const items = await pool.query(
      `SELECT id, product_image FROM public.order_items WHERE product_image LIKE $1 ORDER BY id`,
      [LEGACY_SQL_PATTERN]
    );

    const pending = new Set<string>();
    for (const row of products.rows) {
      if (isLegacyImage(row.image_url)) pending.add(row.image_url);
      for (const img of Array.isArray(row.images) ? row.images : []) if (isLegacyImage(img)) pending.add(img);
    }
    for (const row of items.rows) if (isLegacyImage(row.product_image)) pending.add(row.product_image);

    if (dryRun) return res.json({ success: true, dryRun: true, remaining: pending.size });

    // Satu URL lama → satu URL CDN, dipakai ulang di semua baris yang merujuknya.
    const migrated = new Map<string, string>();
    const failed: string[] = [];
    for (const url of [...pending].slice(0, MIGRATE_BATCH)) {
      const cdnUrl = await copyLegacyImage(url, apiKey);
      if (cdnUrl) migrated.set(url, cdnUrl);
      else failed.push(url);
    }
    const swap = (url: unknown) => (typeof url === 'string' && migrated.get(url)) || url;

    let updatedRows = 0;
    for (const row of products.rows) {
      const images = Array.isArray(row.images) ? row.images.map(swap) : row.images;
      const imageUrl = swap(row.image_url);
      if (imageUrl === row.image_url && JSON.stringify(images) === JSON.stringify(row.images)) continue;
      await pool.query(
        'UPDATE public.products SET image_url = $1, images = $2::jsonb WHERE id = $3',
        [imageUrl, JSON.stringify(images), row.id]
      );
      updatedRows++;
    }
    for (const row of items.rows) {
      const image = swap(row.product_image);
      if (image === row.product_image) continue;
      await pool.query('UPDATE public.order_items SET product_image = $1 WHERE id = $2', [image, row.id]);
      updatedRows++;
    }

    return res.json({
      success: true,
      migrated: migrated.size,
      failed: failed.length,
      updatedRows,
      remaining: pending.size - migrated.size,
    });
  } catch (err: any) {
    console.error('[media] legacy migration error:', err?.message);
    return fail(res, 503, 'Migrasi gambar gagal. Silakan coba lagi.');
  }
});
