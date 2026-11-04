import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface PartnerContext {
  partnerName: string;
  communityId: string;
  subAdminUserId: string;
  isMaster: boolean;
}

declare global {
  namespace Express {
    interface Request {
      partner?: PartnerContext | null;
    }
  }
}

/**
 * Standard JSON Response Helpers
 */
function sendError(res: Response, statusCode: number, code: string, message: string) {
  return res.status(statusCode).json({
    success: false,
    code,
    message,
  });
}

function sendSuccess(
  res: Response,
  statusCode: number,
  data: Record<string, any>,
  extra: Record<string, any> = {}
) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...extra,
  });
}

/**
 * Proteksi endpoint publik dengan Multi-Tenant API Key (partner_api_keys) atau Master API Key.
 * Header: X-API-Key: <key>
 */
async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const provided = String(req.header('X-API-Key') || '').trim();
    if (!provided) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Header X-API-Key tidak disertakan.');
    }

    // 1. Cek partner_api_keys
    const partnerRes = await pool.query(
      'SELECT partner_name, community_id, sub_admin_user_id, is_active FROM partner_api_keys WHERE api_key = $1 AND is_active = true',
      [provided]
    );

    if (partnerRes.rows.length > 0) {
      const row = partnerRes.rows[0];
      req.partner = {
        partnerName: row.partner_name,
        communityId: row.community_id,
        subAdminUserId: row.sub_admin_user_id,
        isMaster: false,
      };
      return next();
    }

    // 2. Fallback: Cek Master API Key (Super Admin)
    const masterKey = (process.env.KROOMIFY_API_PUBLIC_KEY || '').trim();
    if (masterKey && provided === masterKey) {
      req.partner = {
        partnerName: 'Master Admin',
        communityId: '',
        subAdminUserId: 'USR001',
        isMaster: true,
      };
      return next();
    }

    return sendError(res, 401, 'UNAUTHORIZED', 'API key tidak valid atau tidak memiliki akses.');
  } catch (err: any) {
    console.error('[API Auth] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Gagal memvalidasi API key.');
  }
}

async function hashPassword(plain: string): Promise<string> {
  const data = `kroomify_salt_v1_${plain}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapProductStatus(stock: number, rawStatus?: string): 'available' | 'low_stock' | 'out_of_stock' {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= 5) return 'low_stock';
  if (rawStatus === 'out_of_stock' || rawStatus === 'Habis') return 'out_of_stock';
  if (rawStatus === 'low_stock' || rawStatus === 'Stok Menipis') return 'low_stock';
  return 'available';
}

function mapProductRow(row: any) {
  let imagesArr: string[] = [];
  if (Array.isArray(row.images)) {
    imagesArr = row.images;
  } else if (typeof row.images === 'string') {
    try {
      const parsed = JSON.parse(row.images);
      if (Array.isArray(parsed)) imagesArr = parsed;
    } catch {}
  }
  if (imagesArr.length === 0 && row.image_url) {
    imagesArr = [row.image_url];
  }

  const primaryImage = imagesArr.length > 0 ? imagesArr[0] : (row.image_url || null);
  const stockNum = Number(row.stock) || 0;
  const statusEnum = mapProductStatus(stockNum, row.status);

  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: Number(row.price),
    stock: stockNum,
    sku: row.sku || null,
    weightGrams: row.weight_grams ? Number(row.weight_grams) : 250,
    description: row.description || '',
    imageUrl: primaryImage,
    images: imagesArr,
    status: statusEnum,
    createdAt: row.created_at,
  };
}

export const publicApiRouter = Router();
publicApiRouter.use(requireApiKey);

// ============================================================
// 1. ACCOUNT API — Registrasi Akun Merchant Baru
// ============================================================

/**
 * POST /api/v1/accounts
 * Body: { email, password, fullName, phone?, phoneWhatsApp?, storeName?, referralCode? }
 * Membuat akun merchant + toko baru di bawah naungan partner/sub-admin jika ada referralCode atau partner API Key.
 */
publicApiRouter.post('/accounts', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { email, password, fullName, phone, phoneWhatsApp, storeName, referralCode } = req.body || {};
    const finalPhone = (phone || phoneWhatsApp || '').toString().trim();

    if (!email || !isValidEmail(String(email))) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Field email wajib diisi dengan format yang valid.');
    }
    if (!password || String(password).length < 6) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Field password wajib diisi, minimal 6 karakter.');
    }
    if (!fullName || !String(fullName).trim()) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Field fullName wajib diisi.');
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanName = String(fullName).trim();
    const hashedPassword = await hashPassword(String(password));

    await client.query('BEGIN');

    // Cek duplikasi email
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return sendError(res, 409, 'EMAIL_EXISTS', 'Email sudah terdaftar.');
    }

    // Validasi Referral Code (jika diberikan)
    let matchedReferrerUserId: string | null = null;
    let matchedCommunityId: string | null = null;
    let matchedCommunityName: string | null = null;
    let validatedRefCode: string | null = null;

    const inputRefCode = referralCode ? String(referralCode).trim().toUpperCase() : '';
    if (inputRefCode) {
      const refCheck = await client.query(
        `SELECT urc.user_id, urc.referral_code, u.community_id, u.community_name 
         FROM user_referral_codes urc 
         JOIN users u ON u.id = urc.user_id 
         WHERE UPPER(urc.referral_code) = UPPER($1)`,
        [inputRefCode]
      );

      if (refCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return sendError(res, 400, 'INVALID_REFERRAL', 'Kode referral tidak valid atau tidak ditemukan.');
      }

      matchedReferrerUserId = refCheck.rows[0].user_id;
      validatedRefCode = refCheck.rows[0].referral_code;
      matchedCommunityId = refCheck.rows[0].community_id || null;
      matchedCommunityName = refCheck.rows[0].community_name || null;
    } else if (req.partner && !req.partner.isMaster && req.partner.communityId) {
      // Jika partner memanggil tanpa referralCode, auto-link ke komunitas partner
      matchedCommunityId = req.partner.communityId;
      matchedCommunityName = req.partner.partnerName;
      matchedReferrerUserId = req.partner.subAdminUserId;
    }

    // Ambil ID berurutan dari sequence database
    const userIdRes = await client.query("SELECT get_next_id('users') as id");
    const userId: string = userIdRes.rows[0].id;

    await client.query(
      `INSERT INTO users (id, email, password_hash, name, phone, role, community_id, community_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'merchant', $6, $7, now(), now())`,
      [userId, cleanEmail, hashedPassword, cleanName, finalPhone || null, matchedCommunityId, matchedCommunityName]
    );

    const finalStoreName = (storeName || `Toko ${cleanName}`).trim();
    const storeSlugBase = finalStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'toko';

    const storeIdRes = await client.query("SELECT get_next_id('stores') as id");
    const storeId: string = storeIdRes.rows[0].id;
    const storeSlug = `${storeSlugBase}-${storeId.toLowerCase()}`;

    await client.query(
      `INSERT INTO stores (id, user_id, name, slug, phone_whatsapp, city, plan, balance, is_published, community_id, community_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, '', 'free', 0, false, $6, $7, now(), now())`,
      [storeId, userId, finalStoreName, storeSlug, finalPhone || '', matchedCommunityId, matchedCommunityName]
    );

    // Generate kode referral unik untuk user baru
    let cleanRefName = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '');
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

    // Catat ke referral_redemptions jika ada pengajak
    if (matchedReferrerUserId && matchedReferrerUserId !== userId) {
      await client.query(
        'INSERT INTO referral_redemptions (referrer_user_id, referee_user_id, referral_code) VALUES ($1, $2, $3) ON CONFLICT (referee_user_id) DO NOTHING',
        [matchedReferrerUserId, userId, validatedRefCode || req.partner?.partnerName || 'ORGANIZATION']
      );
    }

    await client.query('COMMIT');

    const userData = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      phone: finalPhone || null,
      role: 'merchant',
      communityId: matchedCommunityId || null,
      communityName: matchedCommunityName || null,
      referralCode: generatedRefCode,
    };

    const storeData = {
      id: storeId,
      name: finalStoreName,
      slug: storeSlug,
      plan: 'free',
      isPublished: false,
    };

    return sendSuccess(
      res,
      201,
      { user: userData, store: storeData },
      { code: 'ACCOUNT_CREATED', message: 'Akun dan toko berhasil dibuat.', user: userData, store: storeData }
    );
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[API /accounts] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal membuat akun.');
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/accounts/:id
 * Ambil detail akun (tanpa password_hash) beserta ringkasan toko miliknya.
 * Dibatasi per-partner: hanya akun dalam naungan komunitas partner yang boleh diakses.
 */
publicApiRouter.get('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRes = await pool.query(
      'SELECT id, email, name, phone, role, community_id, community_name, created_at FROM users WHERE id = $1',
      [id]
    );
    if (userRes.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Akun tidak ditemukan.');
    }

    const userRow = userRes.rows[0];

    // Scoping check untuk Partner API Key
    if (req.partner && !req.partner.isMaster) {
      const isSelf = userRow.id === req.partner.subAdminUserId;
      const isInCommunity = userRow.community_id === req.partner.communityId;
      if (!isSelf && !isInCommunity) {
        return sendError(res, 404, 'NOT_FOUND', 'Akun tidak ditemukan.');
      }
    }

    const storesRes = await pool.query(
      'SELECT id, name, slug, plan, is_published, created_at FROM stores WHERE user_id = $1 ORDER BY created_at ASC',
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
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      phone: userRow.phone || null,
      role: userRow.role,
      communityId: userRow.community_id || null,
      communityName: userRow.community_name || null,
      referralCode: refRes.rows[0]?.referral_code || null,
      totalReferred: totalReferredRes.rows[0]?.count || 0,
      createdAt: userRow.created_at,
    };

    const storesData = storesRes.rows.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      plan: s.plan,
      isPublished: Boolean(s.is_published),
      createdAt: s.created_at,
    }));

    return sendSuccess(
      res,
      200,
      { user: userData, stores: storesData },
      { user: userData, stores: storesData }
    );
  } catch (err: any) {
    console.error('[API /accounts/:id] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data akun.');
  }
});

/**
 * GET /api/v1/accounts/:id/referrals
 * Ambil daftar seluruh merchant yang mendaftar menggunakan kode referral akun ini.
 * Mengembalikan storeId, storeSlug, phone, isPublished, dan redeemedAt.
 */
publicApiRouter.get('/accounts/:id/referrals', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Scoping check untuk Partner API Key
    if (req.partner && !req.partner.isMaster) {
      const isSelf = id === req.partner.subAdminUserId;
      if (!isSelf) {
        const ownerCheck = await pool.query('SELECT community_id FROM users WHERE id = $1', [id]);
        if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].community_id !== req.partner.communityId) {
          return sendError(res, 404, 'NOT_FOUND', 'Akun tidak ditemukan.');
        }
      }
    }

    const refCodeRes = await pool.query(
      'SELECT referral_code FROM user_referral_codes WHERE user_id = $1',
      [id]
    );

    if (refCodeRes.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Akun tidak ditemukan atau belum memiliki kode referral.');
    }

    const referralCode = refCodeRes.rows[0].referral_code;

    const refereesRes = await pool.query(
      `SELECT 
        r.referee_user_id,
        r.referral_code,
        r.redeemed_at,
        u.name as referee_name,
        u.email as referee_email,
        u.phone as referee_phone,
        s.id as store_id,
        s.name as store_name,
        s.slug as store_slug,
        s.is_published
       FROM referral_redemptions r
       JOIN users u ON u.id = r.referee_user_id
       LEFT JOIN stores s ON s.user_id = r.referee_user_id
       WHERE r.referrer_user_id = $1
       ORDER BY r.redeemed_at DESC`,
      [id]
    );

    const referees = refereesRes.rows.map((row) => ({
      refereeUserId: row.referee_user_id,
      refereeName: row.referee_name,
      refereeEmail: row.referee_email,
      phone: row.referee_phone || null,
      storeId: row.store_id || null,
      storeName: row.store_name || null,
      storeSlug: row.store_slug || null,
      isPublished: Boolean(row.is_published),
      redeemedAt: row.redeemed_at,
    }));

    return sendSuccess(
      res,
      200,
      { referralCode, totalReferred: referees.length, referees },
      { referralCode, totalReferred: referees.length, referees }
    );
  } catch (err: any) {
    console.error('[API /accounts/:id/referrals] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data referral.');
  }
});

/**
 * GET /api/v1/referrals/validate/:code
 * Cek validitas kode referral sebelum digunakan oleh pendaftar / aplikasi mitra.
 */
publicApiRouter.get('/referrals/validate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    if (!code || !code.trim()) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Kode referral wajib diisi.');
    }

    const cleanCode = code.trim().toUpperCase();
    const queryRes = await pool.query(
      `SELECT 
        urc.user_id, 
        urc.referral_code, 
        u.name as owner_name, 
        u.community_id,
        u.community_name,
        s.name as store_name,
        s.slug as store_slug
       FROM user_referral_codes urc
       JOIN users u ON u.id = urc.user_id
       LEFT JOIN stores s ON s.user_id = urc.user_id
       WHERE UPPER(urc.referral_code) = $1`,
      [cleanCode]
    );

    if (queryRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        valid: false,
        code: 'NOT_FOUND',
        message: 'Kode referral tidak ditemukan atau tidak valid.',
      });
    }

    const row = queryRes.rows[0];
    const data = {
      referralCode: row.referral_code,
      referrerUserId: row.user_id,
      ownerName: row.owner_name,
      communityId: row.community_id || null,
      communityName: row.community_name || null,
      storeName: row.store_name || null,
      storeSlug: row.store_slug || null,
    };

    return res.status(200).json({
      success: true,
      valid: true,
      data,
      ...data,
    });
  } catch (err: any) {
    console.error('[API /referrals/validate/:code] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal memvalidasi kode referral.');
  }
});

// ============================================================
// 2. PRODUCT API — CRUD Produk per Toko (dengan Scoping & Pagination)
// ============================================================

/**
 * GET /api/v1/stores/:storeId/products
 * Daftar produk milik satu toko dengan dukungan pagination ?page=1&limit=20.
 * Dibatasi per-partner: storeId harus berada di naungan komunitas partner.
 */
publicApiRouter.get('/stores/:storeId/products', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;

    // 1. Scoping Check
    const storeCheck = await pool.query('SELECT id, community_id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Toko tidak ditemukan.');
    }

    if (req.partner && !req.partner.isMaster) {
      if (storeCheck.rows[0].community_id !== req.partner.communityId) {
        return sendError(res, 404, 'NOT_FOUND', 'Toko tidak ditemukan.');
      }
    }

    // 2. Pagination Params
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const countRes = await pool.query('SELECT COUNT(*)::int as total FROM products WHERE store_id = $1', [storeId]);
    const total = countRes.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const listRes = await pool.query(
      'SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [storeId, limit, offset]
    );

    const products = listRes.rows.map(mapProductRow);
    const pagination = { page, limit, total, totalPages };

    return sendSuccess(
      res,
      200,
      { products, pagination },
      { products, pagination }
    );
  } catch (err: any) {
    console.error('[API GET /products] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil daftar produk.');
  }
});

/**
 * GET /api/v1/products/:id
 * Detail satu produk dengan verifikasi batas akses partner.
 */
publicApiRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, s.community_id 
       FROM products p 
       JOIN stores s ON s.id = p.store_id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Produk tidak ditemukan.');
    }

    // Scoping check
    if (req.partner && !req.partner.isMaster) {
      if (result.rows[0].community_id !== req.partner.communityId) {
        return sendError(res, 404, 'NOT_FOUND', 'Produk tidak ditemukan.');
      }
    }

    const product = mapProductRow(result.rows[0]);
    return sendSuccess(res, 200, { product }, { product });
  } catch (err: any) {
    console.error('[API GET /products/:id] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil detail produk.');
  }
});

/**
 * POST /api/v1/stores/:storeId/products
 * Tambah produk baru ke toko partner.
 * Body: { name, price, stock, category?, sku?, weightGrams?, description?, imageUrl?, images? }
 */
publicApiRouter.post('/stores/:storeId/products', async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const { name, price, stock, category, sku, weightGrams, description, imageUrl, images } = req.body || {};

    if (!name || !String(name).trim()) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Field name wajib diisi.');
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Field price wajib berupa angka >= 0.');
    }
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Field stock wajib berupa angka >= 0.');
    }

    // Scoping check
    const storeCheck = await pool.query('SELECT id, user_id, community_id FROM stores WHERE id = $1', [storeId]);
    if (storeCheck.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Toko tidak ditemukan.');
    }

    if (req.partner && !req.partner.isMaster) {
      if (storeCheck.rows[0].community_id !== req.partner.communityId) {
        return sendError(res, 404, 'NOT_FOUND', 'Toko tidak ditemukan.');
      }
    }

    const idRes = await pool.query("SELECT get_next_id('products') as id");
    const productId: string = idRes.rows[0].id;
    const slugBase = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produk';
    const slug = `${slugBase}-${productId.toLowerCase()}`;

    // Normalisasi images
    let imagesArr: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      imagesArr = images.map((img: any) => String(img));
    } else if (imageUrl) {
      imagesArr = [String(imageUrl)];
    }
    const primaryImg = imagesArr.length > 0 ? imagesArr[0] : '';
    const statusEnum = mapProductStatus(numStock);

    const result = await pool.query(
      `INSERT INTO products (id, store_id, user_id, name, category, price, stock, sku, weight_grams, description, image_url, images, status, slug, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now())
       RETURNING *`,
      [
        productId,
        storeId,
        storeCheck.rows[0].user_id,
        String(name).trim(),
        category || 'Umum',
        Math.round(numPrice),
        Math.round(numStock),
        sku || null,
        weightGrams ? Math.round(Number(weightGrams)) : 250,
        description || '',
        primaryImg,
        JSON.stringify(imagesArr),
        statusEnum,
        slug,
      ]
    );

    const product = mapProductRow(result.rows[0]);
    return sendSuccess(
      res,
      201,
      { product },
      { code: 'PRODUCT_CREATED', message: 'Produk berhasil dibuat.', product }
    );
  } catch (err: any) {
    console.error('[API POST /products] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal membuat produk.');
  }
});

/**
 * PATCH /api/v1/products/:id
 * Update sebagian field produk.
 */
publicApiRouter.patch('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await pool.query(
      `SELECT p.*, s.community_id 
       FROM products p 
       JOIN stores s ON s.id = p.store_id 
       WHERE p.id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Produk tidak ditemukan.');
    }

    if (req.partner && !req.partner.isMaster) {
      if (existing.rows[0].community_id !== req.partner.communityId) {
        return sendError(res, 404, 'NOT_FOUND', 'Produk tidak ditemukan.');
      }
    }

    const body = req.body || {};
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
      if (isNaN(p) || p < 0) return sendError(res, 400, 'VALIDATION_ERROR', 'Field price tidak valid.');
      setField('price', Math.round(p));
    }
    if (body.stock !== undefined) {
      const s = Number(body.stock);
      if (isNaN(s) || s < 0) return sendError(res, 400, 'VALIDATION_ERROR', 'Field stock tidak valid.');
      setField('stock', Math.round(s));
      setField('status', mapProductStatus(s));
    }
    if (body.sku !== undefined) setField('sku', body.sku);
    if (body.weightGrams !== undefined) setField('weight_grams', Math.round(Number(body.weightGrams)) || 250);
    if (body.description !== undefined) setField('description', body.description);

    if (body.images !== undefined && Array.isArray(body.images)) {
      setField('images', JSON.stringify(body.images));
      if (body.images.length > 0) {
        setField('image_url', body.images[0]);
      }
    } else if (body.imageUrl !== undefined) {
      setField('image_url', body.imageUrl);
      setField('images', JSON.stringify(body.imageUrl ? [body.imageUrl] : []));
    }

    if (fields.length === 0) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Tidak ada field valid untuk diperbarui.');
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );

    const product = mapProductRow(result.rows[0]);
    return sendSuccess(
      res,
      200,
      { product },
      { code: 'PRODUCT_UPDATED', message: 'Produk berhasil diperbarui.', product }
    );
  } catch (err: any) {
    console.error('[API PATCH /products/:id] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal memperbarui produk.');
  }
});

/**
 * DELETE /api/v1/products/:id
 */
publicApiRouter.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await pool.query(
      `SELECT p.id, s.community_id 
       FROM products p 
       JOIN stores s ON s.id = p.store_id 
       WHERE p.id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Produk tidak ditemukan.');
    }

    if (req.partner && !req.partner.isMaster) {
      if (existing.rows[0].community_id !== req.partner.communityId) {
        return sendError(res, 404, 'NOT_FOUND', 'Produk tidak ditemukan.');
      }
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return sendSuccess(
      res,
      200,
      { id },
      { code: 'PRODUCT_DELETED', message: 'Produk berhasil dihapus.' }
    );
  } catch (err: any) {
    console.error('[API DELETE /products/:id] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal menghapus produk.');
  }
});
