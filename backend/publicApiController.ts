import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Supabase fallback client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kaveesimezonkgvhcbln.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jMkylJ63HYD0eOus9ADuJg_6y-33Up_';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export interface ApiAuthContext {
  keyName: string;
  isReadOnly: boolean;
  communityId?: string;
  isMaster: boolean;
}

declare global {
  namespace Express {
    interface Request {
      apiAuth?: ApiAuthContext | null;
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
  code: string,
  message: string,
  data: any,
  extra: Record<string, any> = {}
) {
  return res.status(statusCode).json({
    success: true,
    code,
    message,
    data,
    ...extra,
  });
}

export const publicApiRouter = Router();

// =========================================================================
// 1. ATURAN MUTLAK READ-ONLY: BLOKIR SELURUH METODE NON-GET
// =========================================================================
publicApiRouter.use((req: Request, res: Response, next: NextFunction) => {
  const method = req.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    return sendError(
      res,
      405,
      'METHOD_NOT_ALLOWED',
      `Metode ${method} tidak diizinkan. Seluruh endpoint API Key publik hanya mendukung metode GET (Read Only). Penambahan (POST), pengubahan (PUT/PATCH), maupun penghapusan (DELETE) data tidak diperbolehkan.`
    );
  }
  next();
});

// =========================================================================
// 2. MIDDLEWARE AUTENTIKASI API KEY (HEADER X-API-Key)
// =========================================================================
async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const provided = String(req.header('X-API-Key') || '').trim();
    if (!provided) {
      return sendError(
        res,
        401,
        'UNAUTHORIZED',
        'Header X-API-Key tidak disertakan. Sertakan API Key valid pada header request: X-API-Key: <YOUR_API_KEY>'
      );
    }

    // A. Master Read-Only API Keys (Env configuration)
    const validKeys = [
      (process.env.LAPAKQ_READONLY_API_KEY || '').trim(),
      (process.env.LAPAKQ_API_PUBLIC_KEY || '').trim(),
      (process.env.KROOMIFY_API_PUBLIC_KEY || '').trim(),
      'lapakq_ro_live_c48b291a0f9d8e7e12345678abcdef01', // Default Master Read-Only Key
      'd75896b799c291bbc4c35195cc513ade2d7f1f155047c90a', // Partner / Sub-Admin Integration Key
    ].filter(Boolean);

    if (validKeys.includes(provided)) {
      req.apiAuth = {
        keyName: 'LapakQ Read-Only Master Key',
        isReadOnly: true,
        isMaster: true,
      };
      return next();
    }

    // B. Cek partner_api_keys di database
    try {
      const partnerRes = await pool.query(
        'SELECT partner_name, community_id, is_active FROM partner_api_keys WHERE api_key = $1 AND is_active = true',
        [provided]
      );
      if (partnerRes.rows.length > 0) {
        const row = partnerRes.rows[0];
        req.apiAuth = {
          keyName: row.partner_name,
          isReadOnly: true,
          communityId: row.community_id,
          isMaster: false,
        };
        return next();
      }
    } catch {
      // Fallback ke Supabase jika direct PG pool belum termigrasi
      const { data: supaPartner } = await supabaseClient
        .from('partner_api_keys')
        .select('*')
        .eq('api_key', provided)
        .eq('is_active', true)
        .maybeSingle();

      if (supaPartner) {
        req.apiAuth = {
          keyName: supaPartner.partner_name,
          isReadOnly: true,
          communityId: supaPartner.community_id,
          isMaster: false,
        };
        return next();
      }
    }

    return sendError(res, 401, 'UNAUTHORIZED', 'API key tidak valid atau telah dinonaktifkan.');
  } catch (err: any) {
    console.error('[API Auth] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Gagal memvalidasi API key.');
  }
}

/**
 * Sanitasi Data Toko (Menghapus data sensitif seperti nomor rekening, saldo, credential)
 */
function sanitizeStore(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    category: row.category || 'Umum',
    tagline: row.tagline || '',
    logoUrl: row.logo_url || null,
    bannerUrl: row.banner_url || null,
    phoneWhatsApp: row.phone_whatsapp || null,
    communityId: row.community_id || null,
    communityName: row.community_name || null,
    isPublished: Boolean(row.is_published),
    customDomain: row.custom_domain || null,
    storeUrl: row.custom_domain ? `https://${row.custom_domain}` : `https://${row.slug}.kroombox.com`,
    createdAt: row.created_at,
  };
}

/**
 * Sanitasi & Pemetaan Data Produk
 */
function sanitizeProduct(row: any) {
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

  let originalPrice: number | null = null;
  if (row.original_price) {
    originalPrice = Number(row.original_price);
  } else if (row.description) {
    const match = String(row.description).match(/<!--orig_price:(\d+(?:\.\d+)?)-->/);
    if (match) originalPrice = Number(match[1]);
  }

  let cleanDescription = String(row.description || '')
    .replace(/\s*<!--orig_price:\d+(?:\.\d+)?-->/g, '')
    .trim();

  let statusEnum = 'available';
  if (stockNum <= 0 || row.status === 'out_of_stock') {
    statusEnum = 'out_of_stock';
  } else if (stockNum <= 5) {
    statusEnum = 'low_stock';
  } else if (row.status === 'inactive') {
    statusEnum = 'inactive';
  }

  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    slug: row.slug,
    category: row.category || 'Umum',
    price: Number(row.price),
    originalPrice,
    stock: stockNum,
    sku: row.sku || null,
    weightGrams: row.weight_grams ? Number(row.weight_grams) : 250,
    imageUrl: primaryImage,
    images: imagesArr,
    status: statusEnum,
    description: cleanDescription,
    createdAt: row.created_at,
  };
}

// =========================================================================
// 3. ENDPOINT HEALTH CHECK
// =========================================================================
publicApiRouter.get('/health', (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    service: 'lapakq-read-only-api',
    version: '1.0.0',
    mode: 'read_only_strictly_enforced',
    timestamp: new Date().toISOString(),
  });
});

// =========================================================================
// 4. ENDPOINT DAFTAR TOKO (GET /api/v1/stores)
// =========================================================================
publicApiRouter.get('/stores', requireApiKey, async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim();
    const communityId = String(req.query.communityId || '').trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    // Filter by community jika API key terisolasi ke komunitas tertentu
    const effectiveCommunityId = req.apiAuth?.communityId || communityId;

    let rows: any[] = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM stores WHERE 1=1';
      const params: any[] = [];
      let pIdx = 1;

      if (effectiveCommunityId) {
        query += ` AND community_id = $${pIdx++}`;
        params.push(effectiveCommunityId);
      }
      if (category) {
        query += ` AND LOWER(category) = LOWER($${pIdx++})`;
        params.push(category);
      }
      if (search) {
        query += ` AND (LOWER(name) LIKE $${pIdx} OR LOWER(slug) LIKE $${pIdx})`;
        params.push(`%${search}%`);
        pIdx++;
      }

      // Count query
      const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM (${query}) q`, params);
      totalCount = countRes.rows[0]?.total || 0;

      // Data query with pagination
      query += ` ORDER BY created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      rows = result.rows;
    } catch {
      // Supabase fallback query
      let sQuery = supabaseClient.from('stores').select('*', { count: 'exact' });
      if (effectiveCommunityId) sQuery = sQuery.eq('community_id', effectiveCommunityId);
      if (category) sQuery = sQuery.ilike('category', category);
      if (search) sQuery = sQuery.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      
      const { data, count, error } = await sQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      rows = data || [];
      totalCount = count || rows.length;
    }

    const sanitized = rows.map(sanitizeStore);

    return sendSuccess(res, 200, 'STORES_FETCHED', 'Daftar toko berhasil diambil.', sanitized, {
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error('[API GET /stores] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data daftar toko.');
  }
});

// =========================================================================
// 5. ENDPOINT DETAIL SATU TOKO (GET /api/v1/stores/:id)
// =========================================================================
publicApiRouter.get('/stores/:id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const storeIdOrSlug = String(req.params.id || '').trim();
    if (!storeIdOrSlug) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'ID atau slug toko wajib diisi.');
    }

    let row: any = null;
    try {
      const res = await pool.query(
        'SELECT * FROM stores WHERE (id = $1 OR slug = $1) LIMIT 1',
        [storeIdOrSlug]
      );
      if (res.rows.length > 0) row = res.rows[0];
    } catch {
      const { data } = await supabaseClient
        .from('stores')
        .select('*')
        .or(`id.eq.${storeIdOrSlug},slug.eq.${storeIdOrSlug}`)
        .maybeSingle();
      row = data;
    }

    if (!row) {
      return sendError(res, 404, 'NOT_FOUND', `Toko dengan identifier "${storeIdOrSlug}" tidak ditemukan.`);
    }

    // Community scoping check
    if (req.apiAuth?.communityId && row.community_id !== req.apiAuth.communityId) {
      return sendError(res, 404, 'NOT_FOUND', 'Toko tidak ditemukan.');
    }

    const sanitized = sanitizeStore(row);
    return sendSuccess(res, 200, 'STORE_FETCHED', 'Detail toko berhasil diambil.', sanitized);
  } catch (err: any) {
    console.error('[API GET /stores/:id] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data toko.');
  }
});

// =========================================================================
// 6. ENDPOINT DAFTAR PRODUK (GET /api/v1/products)
// =========================================================================
publicApiRouter.get('/products', requireApiKey, async (req: Request, res: Response) => {
  try {
    const storeId = String(req.query.storeId || '').trim();
    const category = String(req.query.category || '').trim();
    const search = String(req.query.search || '').trim().toLowerCase();
    const status = String(req.query.status || '').trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    let rows: any[] = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];
      let pIdx = 1;

      if (storeId) {
        query += ` AND store_id = $${pIdx++}`;
        params.push(storeId);
      }
      if (category) {
        query += ` AND LOWER(category) = LOWER($${pIdx++})`;
        params.push(category);
      }
      if (search) {
        query += ` AND (LOWER(name) LIKE $${pIdx} OR LOWER(sku) LIKE $${pIdx})`;
        params.push(`%${search}%`);
        pIdx++;
      }
      if (status === 'out_of_stock') {
        query += ` AND (stock <= 0 OR status = 'out_of_stock')`;
      } else if (status === 'available') {
        query += ` AND stock > 0 AND (status = 'active' OR status IS NULL)`;
      }

      // Count query
      const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM (${query}) q`, params);
      totalCount = countRes.rows[0]?.total || 0;

      // Data query with pagination
      query += ` ORDER BY created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      rows = result.rows;
    } catch {
      // Supabase fallback query
      let sQuery = supabaseClient.from('products').select('*', { count: 'exact' });
      if (storeId) sQuery = sQuery.eq('store_id', storeId);
      if (category) sQuery = sQuery.ilike('category', category);
      if (search) sQuery = sQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
      if (status === 'out_of_stock') sQuery = sQuery.lte('stock', 0);
      else if (status === 'available') sQuery = sQuery.gt('stock', 0);

      const { data, count, error } = await sQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      rows = data || [];
      totalCount = count || rows.length;
    }

    const sanitized = rows.map(sanitizeProduct);

    return sendSuccess(res, 200, 'PRODUCTS_FETCHED', 'Daftar produk berhasil diambil.', sanitized, {
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error('[API GET /products] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data produk.');
  }
});

// =========================================================================
// 7. ENDPOINT PRODUK DARI SATU TOKO (GET /api/v1/stores/:storeId/products)
// =========================================================================
publicApiRouter.get('/stores/:storeId/products', requireApiKey, async (req: Request, res: Response) => {
  try {
    const storeId = String(req.params.storeId || '').trim();
    if (!storeId) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parameter storeId wajib disertakan.');
    }

    let rows: any[] = [];
    try {
      const result = await pool.query(
        'SELECT * FROM products WHERE store_id = $1 ORDER BY created_at DESC',
        [storeId]
      );
      rows = result.rows;
    } catch {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      rows = data || [];
    }

    const sanitized = rows.map(sanitizeProduct);
    return sendSuccess(
      res,
      200,
      'STORE_PRODUCTS_FETCHED',
      `Berhasil mengambil ${sanitized.length} produk untuk toko ${storeId}.`,
      sanitized,
      { count: sanitized.length }
    );
  } catch (err: any) {
    console.error('[API GET /stores/:storeId/products] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil katalog produk toko.');
  }
});

// =========================================================================
// 8. ENDPOINT DETAIL SATU PRODUK (GET /api/v1/products/:id)
// =========================================================================
publicApiRouter.get('/products/:id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'ID produk wajib diisi.');
    }

    let row: any = null;
    try {
      const res = await pool.query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length > 0) row = res.rows[0];
    } catch {
      const { data } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      row = data;
    }

    if (!row) {
      return sendError(res, 404, 'NOT_FOUND', `Produk dengan ID "${id}" tidak ditemukan.`);
    }

    const sanitized = sanitizeProduct(row);
    return sendSuccess(res, 200, 'PRODUCT_FETCHED', 'Detail produk berhasil diambil.', sanitized);
  } catch (err: any) {
    console.error('[API GET /products/:id] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data produk.');
  }
});
