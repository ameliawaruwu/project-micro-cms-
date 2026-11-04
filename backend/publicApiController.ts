import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/**
 * Proteksi semua endpoint publik di router ini dengan API Key statis.
 * Kirim header: X-API-Key: <KROOMIFY_API_PUBLIC_KEY>
 */
function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const expected = (process.env.KROOMIFY_API_PUBLIC_KEY || '').trim();
  if (!expected) {
    return res.status(500).json({ success: false, message: 'API belum dikonfigurasi di server (KROOMIFY_API_PUBLIC_KEY kosong).' });
  }
  const provided = String(req.header('X-API-Key') || '').trim();
  if (!provided || provided !== expected) {
    return res.status(401).json({ success: false, message: 'API key tidak valid atau tidak disertakan (header X-API-Key).' });
  }
  next();
}

async function hashPassword(plain: string): Promise<string> {
  const data = `kroomify_salt_v1_${plain}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const publicApiRouter = Router();
publicApiRouter.use(requireApiKey);

// ============================================================
// 1. ACCOUNT API — Registrasi Akun Merchant Baru
// ============================================================

/**
 * POST /api/v1/accounts
 * Body: { email, password, fullName, phoneWhatsApp?, storeName? }
 * Membuat akun merchant + toko kosong (plan free), setara alur register() di authService.
 */
publicApiRouter.post('/accounts', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { email, password, fullName, phoneWhatsApp, storeName } = req.body || {};

    if (!email || !isValidEmail(String(email))) {
      return res.status(400).json({ success: false, message: 'Field email wajib diisi dengan format yang valid.' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Field password wajib diisi, minimal 6 karakter.' });
    }
    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({ success: false, message: 'Field fullName wajib diisi.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const hashedPassword = await hashPassword(String(password));

    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const userIdRes = await client.query("SELECT get_next_id('users') as id");
    const userId: string = userIdRes.rows[0].id;

    await client.query(
      `INSERT INTO users (id, email, password_hash, name, phone, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'merchant', now(), now())`,
      [userId, cleanEmail, hashedPassword, String(fullName).trim(), (phoneWhatsApp || '').trim() || null]
    );

    const finalStoreName = (storeName || `Toko ${String(fullName).trim()}`).trim();
    const storeSlugBase = finalStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'toko';

    const storeIdRes = await client.query("SELECT get_next_id('stores') as id");
    const storeId: string = storeIdRes.rows[0].id;
    const storeSlug = `${storeSlugBase}-${storeId.toLowerCase()}`;

    await client.query(
      `INSERT INTO stores (id, user_id, name, slug, phone_whatsapp, city, plan, balance, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, '', 'free', 0, false, now(), now())`,
      [storeId, userId, finalStoreName, storeSlug, (phoneWhatsApp || '').trim() || '']
    );

    // Generate kode referral unik untuk user baru
    let cleanRefName = String(fullName).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanRefName || cleanRefName.length < 2) cleanRefName = 'KRM';
    else cleanRefName = cleanRefName.slice(0, 5);

    const safeChars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let generatedRefCode = '';
    for (let i = 0; i < 3; i++) {
      generatedRefCode += safeChars.charAt(Math.floor(Math.random() * safeChars.length));
    }
    generatedRefCode = `${cleanRefName}${generatedRefCode}`;

    await client.query(
      'INSERT INTO user_referral_codes (user_id, referral_code) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [userId, generatedRefCode]
    );

    // Jika ada kode referral yang dimasukkan saat pendaftaran, proses rujukan
    const inputRefCode = req.body.referralCode ? String(req.body.referralCode).trim().toUpperCase() : '';
    if (inputRefCode) {
      const refCheck = await client.query(
        'SELECT user_id, referral_code FROM user_referral_codes WHERE LOWER(referral_code) = LOWER($1)',
        [inputRefCode]
      );
      if (refCheck.rows.length > 0 && refCheck.rows[0].user_id !== userId) {
        await client.query(
          'INSERT INTO referral_redemptions (referrer_user_id, referee_user_id, referral_code) VALUES ($1, $2, $3) ON CONFLICT (referee_user_id) DO NOTHING',
          [refCheck.rows[0].user_id, userId, refCheck.rows[0].referral_code]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        name: String(fullName).trim(),
        role: 'merchant',
        referralCode: generatedRefCode,
      },
      store: { id: storeId, name: finalStoreName, slug: storeSlug, plan: 'free' },
    });
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[API /accounts] Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal membuat akun.' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/accounts/:id
 * Ambil detail akun (tanpa password_hash) beserta ringkasan toko miliknya.
 */
publicApiRouter.get('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRes = await pool.query(
      'SELECT id, email, name, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan.' });
    }
    const storesRes = await pool.query(
      'SELECT id, name, slug, plan, is_published FROM stores WHERE user_id = $1',
      [id]
    );

    const refRes = await pool.query(
      'SELECT referral_code FROM user_referral_codes WHERE user_id = $1',
      [id]
    );
    const totalReferredRes = await pool.query(
      'SELECT COUNT(*)::int as count FROM referral_redemptions WHERE referrer_user_id = $1',
      [id]
    );

    const userData = {
      ...userRes.rows[0],
      referralCode: refRes.rows[0]?.referral_code || null,
      totalReferred: totalReferredRes.rows[0]?.count || 0,
    };

    return res.status(200).json({ success: true, user: userData, stores: storesRes.rows });
  } catch (err: any) {
    console.error('[API /accounts/:id] Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal mengambil data akun.' });
  }
});

// ============================================================
// 2. PRODUCT API — CRUD Produk per Toko
// ============================================================

function mapProductRow(row: any) {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: Number(row.price),
    stock: Number(row.stock),
    sku: row.sku,
    weightGrams: row.weight_grams ? Number(row.weight_grams) : 250,
    description: row.description,
    imageUrl: row.image_url,
    images: row.images || [],
    status: row.status,
    createdAt: row.created_at,
  };
}

/**
 * GET /api/v1/stores/:storeId/products
 * Daftar produk milik satu toko.
 */
publicApiRouter.get('/stores/:storeId/products', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const result = await pool.query(
      'SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC',
      [storeId]
    );
    return res.status(200).json({ success: true, products: result.rows.map(mapProductRow) });
  } catch (err: any) {
    console.error('[API GET /products] Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal mengambil daftar produk.' });
  }
});

/**
 * GET /api/v1/products/:id
 * Detail satu produk.
 */
publicApiRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }
    return res.status(200).json({ success: true, product: mapProductRow(result.rows[0]) });
  } catch (err: any) {
    console.error('[API GET /products/:id] Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal mengambil detail produk.' });
  }
});

/**
 * POST /api/v1/stores/:storeId/products
 * Body: { name, price, stock, category?, sku?, weightGrams?, description?, imageUrl?, images? }
 */
publicApiRouter.post('/stores/:storeId/products', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const { name, price, stock, category, sku, weightGrams, description, imageUrl, images } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Field name wajib diisi.' });
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Field price wajib berupa angka >= 0.' });
    }
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Field stock wajib berupa angka >= 0.' });
    }

    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Toko tidak ditemukan.' });
    }

    const idRes = await pool.query("SELECT get_next_id('products') as id");
    const productId: string = idRes.rows[0].id;
    const slugBase = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produk';
    const slug = `${slugBase}-${productId.toLowerCase()}`;
    const status = numStock <= 0 ? 'Habis' : numStock <= 5 ? 'Stok Menipis' : 'Tersedia';

    const result = await pool.query(
      `INSERT INTO products (id, store_id, name, category, price, stock, sku, weight_grams, description, image_url, images, status, slug, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now())
       RETURNING *`,
      [
        productId,
        storeId,
        String(name).trim(),
        category || 'Umum',
        Math.round(numPrice),
        Math.round(numStock),
        sku || null,
        weightGrams ? Math.round(Number(weightGrams)) : 250,
        description || '',
        imageUrl || '',
        JSON.stringify(images || (imageUrl ? [imageUrl] : [])),
        status,
        slug,
      ]
    );

    return res.status(201).json({ success: true, product: mapProductRow(result.rows[0]) });
  } catch (err: any) {
    console.error('[API POST /products] Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal membuat produk.' });
  }
});

/**
 * PATCH /api/v1/products/:id
 * Update sebagian field produk. Mendukung: name, price, stock, category, sku, weightGrams, description, imageUrl, images.
 */
publicApiRouter.patch('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }

    const body = req.body || {};
    const current = existing.rows[0];
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;

    const setField = (column: string, value: any) => {
      fields.push(`${column} = $${i++}`);
      values.push(value);
    };

    if (body.name !== undefined) setField('name', String(body.name).trim());
    if (body.category !== undefined) setField('category', body.category);
    if (body.price !== undefined) {
      const p = Number(body.price);
      if (isNaN(p) || p < 0) return res.status(400).json({ success: false, message: 'Field price tidak valid.' });
      setField('price', Math.round(p));
    }
    if (body.stock !== undefined) {
      const s = Number(body.stock);
      if (isNaN(s) || s < 0) return res.status(400).json({ success: false, message: 'Field stock tidak valid.' });
      setField('stock', Math.round(s));
      setField('status', s <= 0 ? 'Habis' : s <= 5 ? 'Stok Menipis' : 'Tersedia');
    }
    if (body.sku !== undefined) setField('sku', body.sku);
    if (body.weightGrams !== undefined) setField('weight_grams', Math.round(Number(body.weightGrams)) || 250);
    if (body.description !== undefined) setField('description', body.description);
    if (body.imageUrl !== undefined) setField('image_url', body.imageUrl);
    if (body.images !== undefined) setField('images', JSON.stringify(body.images));

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada field valid untuk diperbarui.' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    return res.status(200).json({ success: true, product: mapProductRow(result.rows[0]) });
  } catch (err: any) {
    console.error('[API PATCH /products/:id] Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal memperbarui produk.' });
  }
});

/**
 * DELETE /api/v1/products/:id
 */
publicApiRouter.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
    }
    return res.status(200).json({ success: true, message: 'Produk berhasil dihapus.' });
  } catch (err: any) {
    console.error('[API DELETE /products/:id] Error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Gagal menghapus produk.' });
  }
});
