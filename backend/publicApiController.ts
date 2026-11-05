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
// 2. MIDDLEWARE AUTENTIKASI API KEY (HEADER X-API-Key / QUERY PARAM apiKey)
// =========================================================================
async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  try {
    const provided = String(
      req.header('X-API-Key') ||
      req.query.apiKey ||
      req.query.api_key ||
      ''
    ).trim();

    // A. Master Read-Only API Keys (Env configuration)
    const validKeys = [
      (process.env.LAPAKQ_READONLY_API_KEY || '').trim(),
      (process.env.LAPAKQ_API_PUBLIC_KEY || '').trim(),
      (process.env.KROOMIFY_API_PUBLIC_KEY || '').trim(),
    ].filter(Boolean);

    if (provided) {
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
    }

    // C. Jika tanpa API key, berikan akses publik anonim (Read-Only Public Catalog)
    req.apiAuth = {
      keyName: 'LapakQ Public Read-Only Access',
      isReadOnly: true,
      isMaster: false,
    };
    return next();
  } catch (err: any) {
    console.error('[API Auth] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Gagal memvalidasi API key.');
  }
}

// =========================================================================
// DATA SANITIZATION HELPERS
// =========================================================================

/**
 * Sanitasi Data Komunitas (Menyembunyikan kredensial login, password, & email admin)
 */
function sanitizeCommunity(row: any, stats?: { totalStores?: number; totalProducts?: number }) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    logoUrl: row.logo_url || null,
    baseDomain: row.base_domain || null,
    status: row.status || 'active',
    turnoverFeePercent: Number(row.turnover_fee_percent || 0),
    coordinator: {
      name: row.coordinator_name || null,
      phoneWhatsApp: row.coordinator_phone || null,
    },
    subAdmin: {
      name: row.sub_admin_name || null,
      phoneWhatsApp: row.sub_admin_phone || null,
    },
    totalStores: stats?.totalStores ?? (row.total_stores ? Number(row.total_stores) : 0),
    totalProducts: stats?.totalProducts ?? (row.total_products ? Number(row.total_products) : 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  };
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
    city: row.city || null,
    province: row.province || null,
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

  const cleanDescription = String(row.description || '')
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

// Helper untuk query ID komunitas berdasarkan slug atau ID
async function resolveCommunityId(idOrSlug: string): Promise<string | null> {
  if (!idOrSlug) return null;
  try {
    const res = await pool.query(
      'SELECT id FROM communities WHERE id = $1 OR slug = $1 LIMIT 1',
      [idOrSlug]
    );
    if (res.rows.length > 0) return res.rows[0].id;
  } catch {
    const { data } = await supabaseClient
      .from('communities')
      .select('id')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  return null;
}

// =========================================================================
// 3. OVERVIEW & DOKUMENTASI API (GET /api/v1 dan GET /api/v1/docs)
// =========================================================================
const apiDocumentation = {
  service: 'LapakQ Public Read-Only API',
  version: '1.0.0',
  description: 'REST API publik untuk mengonsumsi data Komunitas, Toko (Store), dan Produk secara read-only (GET only).',
  authentication: {
    type: 'API Key (Opsional untuk data publik)',
    methods: [
      'Header: X-API-Key: <YOUR_API_KEY>',
      'Query Param: ?apiKey=<YOUR_API_KEY> atau ?api_key=<YOUR_API_KEY>',
    ],
    note: 'Hubungi administrator atau koordinator komunitas Anda untuk memperoleh API Key resmi.',
  },
  endpoints: [
    {
      group: 'Kesehatan & Status',
      method: 'GET',
      path: '/api/v1/health',
      description: 'Cek status runtime dan koneksi API.',
    },
    {
      group: 'Komunitas',
      method: 'GET',
      path: '/api/v1/communities',
      description: 'Daftar seluruh komunitas aktif dengan statistik jumlah toko dan produk.',
      params: {
        search: 'string (cari nama/slug komunitas)',
        status: 'string (active / all)',
        page: 'number (default: 1)',
        limit: 'number (default: 20, max: 100)',
      },
    },
    {
      group: 'Komunitas',
      method: 'GET',
      path: '/api/v1/communities/:idOrSlug',
      description: 'Detail satu komunitas berdasarkan ID atau Slug (contoh: /api/v1/communities/gmps).',
    },
    {
      group: 'Komunitas',
      method: 'GET',
      path: '/api/v1/communities/:idOrSlug/stores',
      description: 'Daftar seluruh toko binaan yang berada di bawah naungan komunitas ini.',
      params: {
        search: 'string (cari nama toko)',
        category: 'string (kategori toko)',
        page: 'number',
        limit: 'number',
      },
    },
    {
      group: 'Komunitas',
      method: 'GET',
      path: '/api/v1/communities/:idOrSlug/products',
      description: 'Daftar seluruh produk katalog dari seluruh toko di bawah naungan komunitas ini.',
      params: {
        search: 'string',
        category: 'string',
        status: 'string (available / out_of_stock / all)',
        page: 'number',
        limit: 'number',
      },
    },
    {
      group: 'Toko (Stores)',
      method: 'GET',
      path: '/api/v1/stores',
      description: 'Daftar seluruh toko aktif dan terpublikasi.',
      params: {
        search: 'string (cari nama atau slug toko)',
        category: 'string',
        communityId: 'string (filter berdasarkan ID komunitas)',
        communitySlug: 'string (filter berdasarkan slug komunitas, misal: gmps)',
        isPublished: 'boolean (default: true)',
        page: 'number (default: 1)',
        limit: 'number (default: 20, max: 100)',
      },
    },
    {
      group: 'Toko (Stores)',
      method: 'GET',
      path: '/api/v1/stores/:idOrSlug',
      description: 'Detail lengkap profil satu toko berdasarkan ID atau Slug.',
    },
    {
      group: 'Toko (Stores)',
      method: 'GET',
      path: '/api/v1/stores/:storeIdOrSlug/products',
      description: 'Katalog produk lengkap milik satu toko tertentu.',
    },
    {
      group: 'Data Produk (Products)',
      method: 'GET',
      path: '/api/v1/products',
      description: 'Daftar seluruh data produk dengan kemampuan filter lintas toko dan komunitas.',
      params: {
        storeId: 'string (filter produk milik ID toko tertentu)',
        storeSlug: 'string (filter produk milik slug toko tertentu)',
        communityId: 'string (filter produk milik ID komunitas tertentu)',
        communitySlug: 'string (filter produk milik slug komunitas tertentu)',
        category: 'string (kategori produk)',
        search: 'string (cari nama produk atau SKU)',
        status: 'string (available / out_of_stock / all)',
        page: 'number (default: 1)',
        limit: 'number (default: 20, max: 100)',
      },
    },
    {
      group: 'Data Produk (Products)',
      method: 'GET',
      path: '/api/v1/products/:id',
      description: 'Detail lengkap satu produk spesifik berdasarkan ID produk.',
    },
  ],
};

publicApiRouter.get(['/', '/docs'], (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    code: 'API_DOCUMENTATION',
    message: 'Selamat datang di LapakQ Public Read-Only API. Hanya metode GET yang didukung.',
    ...apiDocumentation,
  });
});

publicApiRouter.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    service: 'lapakq-read-only-api',
    version: '1.0.0',
    mode: 'read_only_strictly_enforced',
    timestamp: new Date().toISOString(),
  });
});

// =========================================================================
// 4. ENDPOINT KOMUNITAS (GET /api/v1/communities)
// =========================================================================
publicApiRouter.get('/communities', requireApiKey, async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const status = String(req.query.status || 'active').trim().toLowerCase();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    // Jika API key terisolasi ke komunitas tertentu (Partner API Key)
    const effectiveCommunityId = req.apiAuth?.communityId;

    let rows: any[] = [];
    let totalCount = 0;

    try {
      let query = `
        SELECT 
          c.*,
          COALESCE((SELECT COUNT(*)::int FROM stores s WHERE s.community_id = c.id), 0) AS total_stores,
          COALESCE((SELECT COUNT(*)::int FROM products p JOIN stores s ON p.store_id = s.id WHERE s.community_id = c.id), 0) AS total_products
        FROM communities c
        WHERE 1=1
      `;
      const params: any[] = [];
      let pIdx = 1;

      if (effectiveCommunityId) {
        query += ` AND (c.id = $${pIdx} OR c.slug = $${pIdx})`;
        params.push(effectiveCommunityId);
        pIdx++;
      }

      if (status && status !== 'all') {
        query += ` AND LOWER(c.status) = LOWER($${pIdx++})`;
        params.push(status);
      }

      if (search) {
        query += ` AND (LOWER(c.name) LIKE $${pIdx} OR LOWER(c.slug) LIKE $${pIdx} OR LOWER(c.description) LIKE $${pIdx})`;
        params.push(`%${search}%`);
        pIdx++;
      }

      const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM (${query}) q`, params);
      totalCount = countRes.rows[0]?.total || 0;

      query += ` ORDER BY c.created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      rows = result.rows;
    } catch {
      // Supabase fallback query
      let sQuery = supabaseClient.from('communities').select('*', { count: 'exact' });
      if (effectiveCommunityId) {
        sQuery = sQuery.or(`id.eq.${effectiveCommunityId},slug.eq.${effectiveCommunityId}`);
      }
      if (status && status !== 'all') {
        sQuery = sQuery.eq('status', status);
      }
      if (search) {
        sQuery = sQuery.or(`name.ilike.%${search}%,slug.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, count, error } = await sQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      rows = data || [];
      totalCount = count || rows.length;
    }

    const sanitized = rows.map((r) => sanitizeCommunity(r));

    return sendSuccess(res, 200, 'COMMUNITIES_FETCHED', 'Daftar komunitas berhasil diambil.', sanitized, {
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error('[API GET /communities] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data daftar komunitas.');
  }
});

// =========================================================================
// 5. ENDPOINT DETAIL SATU KOMUNITAS (GET /api/v1/communities/:idOrSlug)
// =========================================================================
publicApiRouter.get('/communities/:id', requireApiKey, async (req: Request, res: Response) => {
  try {
    const idOrSlug = String(req.params.id || '').trim();
    if (!idOrSlug) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'ID atau slug komunitas wajib diisi.');
    }

    let row: any = null;
    try {
      const res = await pool.query(
        `SELECT 
          c.*,
          COALESCE((SELECT COUNT(*)::int FROM stores s WHERE s.community_id = c.id), 0) AS total_stores,
          COALESCE((SELECT COUNT(*)::int FROM products p JOIN stores s ON p.store_id = s.id WHERE s.community_id = c.id), 0) AS total_products
        FROM communities c 
        WHERE (c.id = $1 OR c.slug = $1) 
        LIMIT 1`,
        [idOrSlug]
      );
      if (res.rows.length > 0) row = res.rows[0];
    } catch {
      const { data } = await supabaseClient
        .from('communities')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .maybeSingle();
      row = data;
    }

    if (!row) {
      return sendError(res, 404, 'NOT_FOUND', `Komunitas dengan identifier "${idOrSlug}" tidak ditemukan.`);
    }

    // Scoping check jika API key terbatas pada komunitas tertentu
    if (req.apiAuth?.communityId && row.id !== req.apiAuth.communityId && row.slug !== req.apiAuth.communityId) {
      return sendError(res, 404, 'NOT_FOUND', 'Komunitas tidak ditemukan.');
    }

    const sanitized = sanitizeCommunity(row);
    return sendSuccess(res, 200, 'COMMUNITY_FETCHED', 'Detail komunitas berhasil diambil.', sanitized);
  } catch (err: any) {
    console.error('[API GET /communities/:id] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data komunitas.');
  }
});

// =========================================================================
// 6. ENDPOINT TOKO DARI SATU KOMUNITAS (GET /api/v1/communities/:idOrSlug/stores)
// =========================================================================
publicApiRouter.get('/communities/:id/stores', requireApiKey, async (req: Request, res: Response) => {
  try {
    const idOrSlug = String(req.params.id || '').trim();
    const realCommunityId = await resolveCommunityId(idOrSlug);

    if (!realCommunityId) {
      return sendError(res, 404, 'NOT_FOUND', `Komunitas "${idOrSlug}" tidak ditemukan.`);
    }

    const search = String(req.query.search || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    let rows: any[] = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM stores WHERE community_id = $1';
      const params: any[] = [realCommunityId];
      let pIdx = 2;

      if (category) {
        query += ` AND LOWER(category) = LOWER($${pIdx++})`;
        params.push(category);
      }
      if (search) {
        query += ` AND (LOWER(name) LIKE $${pIdx} OR LOWER(slug) LIKE $${pIdx})`;
        params.push(`%${search}%`);
        pIdx++;
      }

      const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM (${query}) q`, params);
      totalCount = countRes.rows[0]?.total || 0;

      query += ` ORDER BY created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      rows = result.rows;
    } catch {
      let sQuery = supabaseClient
        .from('stores')
        .select('*', { count: 'exact' })
        .eq('community_id', realCommunityId);

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
    return sendSuccess(
      res,
      200,
      'COMMUNITY_STORES_FETCHED',
      `Berhasil mengambil ${sanitized.length} toko binaan komunitas.`,
      sanitized,
      {
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
      }
    );
  } catch (err: any) {
    console.error('[API GET /communities/:id/stores] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil toko binaan komunitas.');
  }
});

// =========================================================================
// 7. ENDPOINT PRODUK DARI SATU KOMUNITAS (GET /api/v1/communities/:idOrSlug/products)
// =========================================================================
publicApiRouter.get('/communities/:id/products', requireApiKey, async (req: Request, res: Response) => {
  try {
    const idOrSlug = String(req.params.id || '').trim();
    const realCommunityId = await resolveCommunityId(idOrSlug);

    if (!realCommunityId) {
      return sendError(res, 404, 'NOT_FOUND', `Komunitas "${idOrSlug}" tidak ditemukan.`);
    }

    const search = String(req.query.search || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim();
    const status = String(req.query.status || '').trim();
    const storeId = String(req.query.storeId || '').trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    let rows: any[] = [];
    let totalCount = 0;

    try {
      let query = `
        SELECT p.* 
        FROM products p
        JOIN stores s ON p.store_id = s.id
        WHERE s.community_id = $1
      `;
      const params: any[] = [realCommunityId];
      let pIdx = 2;

      if (storeId) {
        query += ` AND p.store_id = $${pIdx++}`;
        params.push(storeId);
      }
      if (category) {
        query += ` AND LOWER(p.category) = LOWER($${pIdx++})`;
        params.push(category);
      }
      if (search) {
        query += ` AND (LOWER(p.name) LIKE $${pIdx} OR LOWER(p.sku) LIKE $${pIdx})`;
        params.push(`%${search}%`);
        pIdx++;
      }
      if (status === 'out_of_stock') {
        query += ` AND (p.stock <= 0 OR p.status = 'out_of_stock')`;
      } else if (status === 'available') {
        query += ` AND p.stock > 0 AND (p.status = 'active' OR p.status IS NULL)`;
      }

      const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM (${query}) q`, params);
      totalCount = countRes.rows[0]?.total || 0;

      query += ` ORDER BY p.created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      rows = result.rows;
    } catch {
      // Supabase fallback: get store ids under community first
      const { data: storeRows } = await supabaseClient
        .from('stores')
        .select('id')
        .eq('community_id', realCommunityId);

      const storeIds = (storeRows || []).map((s) => s.id);

      if (storeIds.length === 0) {
        return sendSuccess(res, 200, 'COMMUNITY_PRODUCTS_FETCHED', 'Belum ada produk di komunitas ini.', [], {
          pagination: { page, limit, total: 0, totalPages: 1 },
        });
      }

      let sQuery = supabaseClient
        .from('products')
        .select('*', { count: 'exact' })
        .in('store_id', storeIds);

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
    return sendSuccess(
      res,
      200,
      'COMMUNITY_PRODUCTS_FETCHED',
      `Berhasil mengambil ${sanitized.length} produk katalog komunitas.`,
      sanitized,
      {
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
      }
    );
  } catch (err: any) {
    console.error('[API GET /communities/:id/products] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil produk katalog komunitas.');
  }
});

// =========================================================================
// 8. ENDPOINT DAFTAR TOKO (GET /api/v1/stores)
// =========================================================================
publicApiRouter.get('/stores', requireApiKey, async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase();
    const category = String(req.query.category || '').trim();
    let communityId = String(req.query.communityId || '').trim();
    const communitySlug = String(req.query.communitySlug || '').trim();
    const isPublishedParam = req.query.isPublished;
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    // Resolve communitySlug jika diberikan
    if (!communityId && communitySlug) {
      const resolved = await resolveCommunityId(communitySlug);
      if (resolved) communityId = resolved;
    }

    // Filter by community jika API key terisolasi ke komunitas tertentu
    const effectiveCommunityId = req.apiAuth?.communityId || communityId;

    let rows: any[] = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM stores WHERE 1=1';
      const params: any[] = [];
      let pIdx = 1;

      if (effectiveCommunityId) {
        query += ` AND (community_id = $${pIdx} OR community_id IN (SELECT id FROM communities WHERE slug = $${pIdx}))`;
        params.push(effectiveCommunityId);
        pIdx++;
      }
      if (isPublishedParam !== undefined) {
        query += ` AND is_published = $${pIdx++}`;
        params.push(isPublishedParam === 'true');
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

      const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM (${query}) q`, params);
      totalCount = countRes.rows[0]?.total || 0;

      query += ` ORDER BY created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      rows = result.rows;
    } catch {
      let sQuery = supabaseClient.from('stores').select('*', { count: 'exact' });
      if (effectiveCommunityId) sQuery = sQuery.eq('community_id', effectiveCommunityId);
      if (isPublishedParam !== undefined) sQuery = sQuery.eq('is_published', isPublishedParam === 'true');
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
// 9. ENDPOINT DETAIL SATU TOKO (GET /api/v1/stores/:idOrSlug)
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
// 10. ENDPOINT PRODUK DARI SATU TOKO (GET /api/v1/stores/:storeId/products)
// =========================================================================
publicApiRouter.get('/stores/:storeId/products', requireApiKey, async (req: Request, res: Response) => {
  try {
    const storeIdOrSlug = String(req.params.storeId || '').trim();
    if (!storeIdOrSlug) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parameter storeId atau slug wajib disertakan.');
    }

    // Cari ID toko jika yang dimasukkan adalah slug
    let storeId = storeIdOrSlug;
    try {
      const stRes = await pool.query('SELECT id FROM stores WHERE id = $1 OR slug = $1 LIMIT 1', [storeIdOrSlug]);
      if (stRes.rows.length > 0) storeId = stRes.rows[0].id;
    } catch {
      const { data } = await supabaseClient
        .from('stores')
        .select('id')
        .or(`id.eq.${storeIdOrSlug},slug.eq.${storeIdOrSlug}`)
        .maybeSingle();
      if (data?.id) storeId = data.id;
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
      `Berhasil mengambil ${sanitized.length} produk untuk toko ${storeIdOrSlug}.`,
      sanitized,
      { count: sanitized.length }
    );
  } catch (err: any) {
    console.error('[API GET /stores/:storeId/products] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil katalog produk toko.');
  }
});

// =========================================================================
// 11. ENDPOINT DAFTAR PRODUK (GET /api/v1/products)
// =========================================================================
publicApiRouter.get('/products', requireApiKey, async (req: Request, res: Response) => {
  try {
    const storeId = String(req.query.storeId || '').trim();
    const storeSlug = String(req.query.storeSlug || '').trim();
    let communityId = String(req.query.communityId || '').trim();
    const communitySlug = String(req.query.communitySlug || '').trim();
    const category = String(req.query.category || '').trim();
    const search = String(req.query.search || '').trim().toLowerCase();
    const status = String(req.query.status || '').trim();
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;

    if (!communityId && communitySlug) {
      const resolved = await resolveCommunityId(communitySlug);
      if (resolved) communityId = resolved;
    }

    const effectiveCommunityId = req.apiAuth?.communityId || communityId;

    let rows: any[] = [];
    let totalCount = 0;

    try {
      let query = `
        SELECT p.* 
        FROM products p
        LEFT JOIN stores s ON p.store_id = s.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let pIdx = 1;

      if (effectiveCommunityId) {
        query += ` AND s.community_id = $${pIdx++}`;
        params.push(effectiveCommunityId);
      }
      if (storeId) {
        query += ` AND p.store_id = $${pIdx++}`;
        params.push(storeId);
      }
      if (storeSlug) {
        query += ` AND s.slug = $${pIdx++}`;
        params.push(storeSlug);
      }
      if (category) {
        query += ` AND LOWER(p.category) = LOWER($${pIdx++})`;
        params.push(category);
      }
      if (search) {
        query += ` AND (LOWER(p.name) LIKE $${pIdx} OR LOWER(p.sku) LIKE $${pIdx})`;
        params.push(`%${search}%`);
        pIdx++;
      }
      if (status === 'out_of_stock') {
        query += ` AND (p.stock <= 0 OR p.status = 'out_of_stock')`;
      } else if (status === 'available') {
        query += ` AND p.stock > 0 AND (p.status = 'active' OR p.status IS NULL)`;
      }
      if (minPrice !== null && !isNaN(minPrice)) {
        query += ` AND p.price >= $${pIdx++}`;
        params.push(minPrice);
      }
      if (maxPrice !== null && !isNaN(maxPrice)) {
        query += ` AND p.price <= $${pIdx++}`;
        params.push(maxPrice);
      }

      const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM (${query}) q`, params);
      totalCount = countRes.rows[0]?.total || 0;

      query += ` ORDER BY p.created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      rows = result.rows;
    } catch {
      let sQuery = supabaseClient.from('products').select('*', { count: 'exact' });
      if (storeId) sQuery = sQuery.eq('store_id', storeId);
      if (category) sQuery = sQuery.ilike('category', category);
      if (search) sQuery = sQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
      if (status === 'out_of_stock') sQuery = sQuery.lte('stock', 0);
      else if (status === 'available') sQuery = sQuery.gt('stock', 0);
      if (minPrice !== null && !isNaN(minPrice)) sQuery = sQuery.gte('price', minPrice);
      if (maxPrice !== null && !isNaN(maxPrice)) sQuery = sQuery.lte('price', maxPrice);

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
// 12. ENDPOINT DETAIL SATU PRODUK (GET /api/v1/products/:id)
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
