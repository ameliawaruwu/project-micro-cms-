import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Supabase fallback client (strictly from environment variables without hardcoded secrets)
const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
export const supabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder_key'
);

const SAFE_IDENTIFIER_REGEX = /^[A-Za-z0-9_-]{1,100}$/;

/**
 * Status produk dari aplikasi LapakQ: 'Tersedia' | 'Hampir Habis' | 'Habis' (calculateProductStatus),
 * plus nilai lama 'active' / 'available' / 'out_of_stock' / 'inactive'. Filter API mengikuti sanitizeProduct:
 * tersedia = stok > 0 dan tidak berstatus habis/nonaktif.
 */
const SOLD_OUT_STATUSES = ['out_of_stock', 'Habis'];
const HIDDEN_STATUSES = [...SOLD_OUT_STATUSES, 'inactive', 'Nonaktif'];
const sqlList = (vals: string[]) => vals.map((v) => `'${v}'`).join(', ');
const sqlAvailable = (col: string) => `${col}stock > 0 AND COALESCE(${col}status, '') NOT IN (${sqlList(HIDDEN_STATUSES)})`;
const sqlSoldOut = (col: string) => `(${col}stock <= 0 OR ${col}status IN (${sqlList(SOLD_OUT_STATUSES)}))`;
const pgrstNotIn = (vals: string[]) => `(${vals.map((v) => `"${v}"`).join(',')})`;

/** Nilai yang aman disisipkan ke filter PostgREST `.or()`; selain itu null. */
export const safeIdentifier = (v: string): string | null => (SAFE_IDENTIFIER_REGEX.test(v) ? v : null);

/**
 * Kata kunci pencarian untuk filter `ilike` di `.or()`. Karakter yang punya arti di sintaks
 * PostgREST (koma, titik, kurung, titik dua, kutip, wildcard, backslash) dibuang.
 */
export const safeSearchTerm = (v: string): string => v.replace(/[,.():"'*%\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);

// In-memory rate limiting store (Poin 2.4)
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const apiRateLimitMap = new Map<string, RateLimitBucket>();

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
export function sendError(res: Response, statusCode: number, code: string, message: string) {
  return res.status(statusCode).json({
    success: false,
    code,
    message,
  });
}

export function sendSuccess(
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
export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
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

// Middleware Rate Limiting per IP (Anonim: 60 req/min) & per API Key (Partner: 300 req/min)
export function enforceRateLimit(req: Request, res: Response, next: NextFunction) {
  const isPrivileged = Boolean(req.apiAuth?.communityId || req.apiAuth?.isMaster);
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
    .split(',')[0]
    .trim();
  const apiKey = String(req.header('X-API-Key') || req.query.apiKey || req.query.api_key || '').trim();
  const bucketKey = apiKey ? `key:${apiKey}` : `ip:${ip}`;

  const maxRequests = isPrivileged ? 300 : 60;
  const now = Date.now();
  const windowMs = 60 * 1000;

  let bucket = apiRateLimitMap.get(bucketKey);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 1, resetAt: now + windowMs };
    apiRateLimitMap.set(bucketKey, bucket);
  } else {
    bucket.count++;
  }

  const remaining = Math.max(0, maxRequests - bucket.count);
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));

  if (bucket.count > maxRequests) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader('Retry-After', retryAfter);
    return sendError(
      res,
      429,
      'RATE_LIMITED',
      `Batas kuota request tercapai (${maxRequests} per menit). Silakan coba kembali dalam ${retryAfter} detik.`
    );
  }
  next();
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
export function sanitizeStore(row: any) {
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
    communityMemberRef: row.community_member_ref || null,
    isPublished: Boolean(row.is_published),
    customDomain: row.custom_domain || null,
    storeUrl: row.custom_domain ? `https://${row.custom_domain}` : `https://${row.slug}.lapakq.com`,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
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
    updatedAt: row.updated_at || row.created_at,
  };
}

// Helper untuk query ID komunitas berdasarkan slug atau ID
export async function resolveCommunityId(idOrSlug: string): Promise<string | null> {
  if (!idOrSlug) return null;
  try {
    const res = await pool.query(
      'SELECT id FROM communities WHERE id = $1 OR slug = $1 LIMIT 1',
      [idOrSlug]
    );
    if (res.rows.length > 0) return res.rows[0].id;
  } catch {
    if (!safeIdentifier(idOrSlug)) return null;
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
// KEANGGOTAAN KOMUNITAS (komunitas utama stores.community_id + tabel store_communities)
// =========================================================================

/**
 * Predikat SQL: toko dengan alias `alias` (mis. 's.' atau 'stores.') termasuk komunitas `ph`
 * (placeholder seperti '$1' atau kolom seperti 'c.id'), sebagai komunitas utama atau tambahan.
 */
export const sqlInCommunity = (alias: string, ph: string) =>
  `(${alias}community_id = ${ph} OR EXISTS (SELECT 1 FROM store_communities sc WHERE sc.store_id = ${alias}id AND sc.community_id = ${ph}))`;

/** Apakah toko termasuk komunitas (utama atau tambahan). */
export async function storeInCommunity(storeId: string, primaryCommunityId: string | null | undefined, communityId: string): Promise<boolean> {
  if (!communityId || !storeId) return false;
  if (primaryCommunityId === communityId) return true;
  try {
    const r = await pool.query('SELECT 1 FROM store_communities WHERE store_id = $1 AND community_id = $2 LIMIT 1', [storeId, communityId]);
    return r.rows.length > 0;
  } catch {
    const { data } = await supabaseClient
      .from('store_communities')
      .select('store_id')
      .eq('store_id', storeId)
      .eq('community_id', communityId)
      .maybeSingle();
    return Boolean(data);
  }
}

/** ID seluruh toko komunitas, untuk jalur fallback Supabase. */
async function communityStoreIdsFallback(communityId: string): Promise<string[]> {
  const [primary, extra] = await Promise.all([
    supabaseClient.from('stores').select('id').eq('community_id', communityId),
    supabaseClient.from('store_communities').select('store_id').eq('community_id', communityId),
  ]);
  return [...new Set([...(primary.data || []).map((r: any) => r.id), ...(extra.data || []).map((r: any) => r.store_id)])];
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
publicApiRouter.get('/communities', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
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
          COALESCE((SELECT COUNT(*)::int FROM stores s WHERE ${sqlInCommunity('s.', 'c.id')}), 0) AS total_stores,
          COALESCE((SELECT COUNT(*)::int FROM products p JOIN stores s ON p.store_id = s.id WHERE ${sqlInCommunity('s.', 'c.id')}), 0) AS total_products
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
        if (!safeIdentifier(effectiveCommunityId)) throw new Error('ID komunitas tidak valid.');
        sQuery = sQuery.or(`id.eq.${effectiveCommunityId},slug.eq.${effectiveCommunityId}`);
      }
      if (status && status !== 'all') {
        sQuery = sQuery.eq('status', status);
      }
      if (search) {
        sQuery = sQuery.or(`name.ilike.%${safeSearchTerm(search)}%,slug.ilike.%${safeSearchTerm(search)}%,description.ilike.%${safeSearchTerm(search)}%`);
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
publicApiRouter.get('/communities/:id', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
  try {
    const idOrSlug = String(req.params.id || '').trim();
    if (!idOrSlug || !safeIdentifier(idOrSlug)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'ID atau slug komunitas tidak valid.');
    }

    let row: any = null;
    try {
      const res = await pool.query(
        `SELECT 
          c.*,
          COALESCE((SELECT COUNT(*)::int FROM stores s WHERE ${sqlInCommunity('s.', 'c.id')}), 0) AS total_stores,
          COALESCE((SELECT COUNT(*)::int FROM products p JOIN stores s ON p.store_id = s.id WHERE ${sqlInCommunity('s.', 'c.id')}), 0) AS total_products
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
publicApiRouter.get('/communities/:id/stores', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
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
      let query = `SELECT * FROM stores WHERE ${sqlInCommunity('stores.', '$1')}`;
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
      const ids = await communityStoreIdsFallback(realCommunityId);
      let sQuery = supabaseClient
        .from('stores')
        .select('*', { count: 'exact' })
        .in('id', ids.length ? ids : ['__none__']);

      if (category) sQuery = sQuery.ilike('category', category);
      if (search) sQuery = sQuery.or(`name.ilike.%${safeSearchTerm(search)}%,slug.ilike.%${safeSearchTerm(search)}%`);

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
publicApiRouter.get('/communities/:id/products', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
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
        WHERE ${sqlInCommunity('s.', '$1')}
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
        query += ` AND ${sqlSoldOut('p.')}`;
      } else if (status === 'available') {
        query += ` AND ${sqlAvailable('p.')}`;
      }

      const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM (${query}) q`, params);
      totalCount = countRes.rows[0]?.total || 0;

      query += ` ORDER BY p.created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      rows = result.rows;
    } catch {
      // Supabase fallback: get store ids under community first
      const storeIds = await communityStoreIdsFallback(realCommunityId);

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
      if (search) sQuery = sQuery.or(`name.ilike.%${safeSearchTerm(search)}%,sku.ilike.%${safeSearchTerm(search)}%`);
      if (status === 'out_of_stock') sQuery = sQuery.or(`stock.lte.0,status.in.${pgrstNotIn(SOLD_OUT_STATUSES)}`);
      else if (status === 'available') sQuery = sQuery.gt('stock', 0).not('status', 'in', pgrstNotIn(HIDDEN_STATUSES));

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
publicApiRouter.get('/stores', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
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
    const effectiveCommunityId =
      req.apiAuth?.communityId || (communityId ? (await resolveCommunityId(communityId)) || communityId : '');

    // Publik anonim HANYA melihat toko terbit. Partner key bisa melihat draf toko komunitasnya
    const isPrivileged = Boolean(req.apiAuth?.communityId || req.apiAuth?.isMaster);
    const filterPublished = !isPrivileged
      ? true
      : (isPublishedParam !== undefined ? isPublishedParam === 'true' : undefined);

    let rows: any[] = [];
    let totalCount = 0;

    try {
      let query = 'SELECT * FROM stores WHERE 1=1';
      const params: any[] = [];
      let pIdx = 1;

      if (effectiveCommunityId) {
        query += ` AND ${sqlInCommunity('stores.', `$${pIdx}`)}`;
        params.push(effectiveCommunityId);
        pIdx++;
      }

      if (filterPublished !== undefined) {
        query += ` AND is_published = $${pIdx++}`;
        params.push(filterPublished);
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
      if (effectiveCommunityId) {
        const ids = await communityStoreIdsFallback(effectiveCommunityId);
        sQuery = sQuery.in('id', ids.length ? ids : ['__none__']);
      }
      if (filterPublished !== undefined) sQuery = sQuery.eq('is_published', filterPublished);
      if (category) sQuery = sQuery.ilike('category', category);
      if (search) sQuery = sQuery.or(`name.ilike.%${safeSearchTerm(search)}%,slug.ilike.%${safeSearchTerm(search)}%`);

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
publicApiRouter.get('/stores/:id', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
  try {
    const storeIdOrSlug = String(req.params.id || '').trim();
    if (!storeIdOrSlug || !SAFE_IDENTIFIER_REGEX.test(storeIdOrSlug)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Format ID atau slug toko tidak valid.');
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

    // Community scoping check (Poin 1.4): komunitas utama atau tambahan
    const inKeyCommunity = req.apiAuth?.communityId
      ? await storeInCommunity(row.id, row.community_id, req.apiAuth.communityId)
      : false;
    if (req.apiAuth?.communityId && !inKeyCommunity) {
      return sendError(res, 404, 'NOT_FOUND', 'Toko tidak ditemukan di komunitas Anda.');
    }

    // Publication check (Poin 1.3):
    // Akses tanpa key (publik anonim): HANYA toko yang sudah dipublikasikan (is_published = true)
    // Key partner: boleh melihat toko komunitasnya yang belum terbit
    const isPartnerAccess = inKeyCommunity;
    const isMasterAccess = Boolean(req.apiAuth?.isMaster);
    if (!row.is_published && !isPartnerAccess && !isMasterAccess) {
      return sendError(res, 404, 'NOT_FOUND', 'Toko belum dipublikasikan.');
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
publicApiRouter.get('/stores/:storeId/products', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
  try {
    const storeIdOrSlug = String(req.params.storeId || '').trim();
    if (!storeIdOrSlug || !SAFE_IDENTIFIER_REGEX.test(storeIdOrSlug)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parameter storeId atau slug tidak valid.');
    }

    // 1. Ambil info toko untuk verifikasi hak akses komunitas & status publikasi
    let storeRow: any = null;
    try {
      const stRes = await pool.query('SELECT * FROM stores WHERE id = $1 OR slug = $1 LIMIT 1', [storeIdOrSlug]);
      if (stRes.rows.length > 0) storeRow = stRes.rows[0];
    } catch {
      const { data } = await supabaseClient
        .from('stores')
        .select('*')
        .or(`id.eq.${storeIdOrSlug},slug.eq.${storeIdOrSlug}`)
        .maybeSingle();
      storeRow = data;
    }

    if (!storeRow) {
      return sendError(res, 404, 'NOT_FOUND', `Toko "${storeIdOrSlug}" tidak ditemukan.`);
    }

    // Community scoping check (Poin 1.4): komunitas utama atau tambahan
    const inKeyCommunity = req.apiAuth?.communityId
      ? await storeInCommunity(storeRow.id, storeRow.community_id, req.apiAuth.communityId)
      : false;
    if (req.apiAuth?.communityId && !inKeyCommunity) {
      return sendError(res, 404, 'NOT_FOUND', 'Toko tidak ditemukan di komunitas Anda.');
    }

    // Publication check (Poin 1.3):
    const isPartnerAccess = inKeyCommunity;
    const isMasterAccess = Boolean(req.apiAuth?.isMaster);
    if (!storeRow.is_published && !isPartnerAccess && !isMasterAccess) {
      return sendError(res, 404, 'NOT_FOUND', 'Toko belum dipublikasikan.');
    }

    // 2. Pagination query parameters (Poin 2.2)
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const offset = (page - 1) * limit;
    const statusFilter = String(req.query.status || 'available').trim().toLowerCase();

    const storeId = storeRow.id;
    let rows: any[] = [];
    let totalCount = 0;

    try {
      let countQuery = 'SELECT COUNT(*)::int AS count FROM products WHERE store_id = $1';
      let dataQuery = 'SELECT * FROM products WHERE store_id = $1';
      const params: any[] = [storeId];
      let pIdx = 2;

      if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'available') {
          countQuery += ` AND ${sqlAvailable('')}`;
          dataQuery += ` AND ${sqlAvailable('')}`;
        } else if (statusFilter === 'out_of_stock') {
          countQuery += ` AND ${sqlSoldOut('')}`;
          dataQuery += ` AND ${sqlSoldOut('')}`;
        }
      }

      dataQuery += ` ORDER BY created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
      params.push(limit, offset);

      const [countRes, dataRes] = await Promise.all([
        pool.query(countQuery, [storeId]),
        pool.query(dataQuery, params),
      ]);
      totalCount = countRes.rows[0]?.count || 0;
      rows = dataRes.rows;
    } catch {
      let q = supabaseClient.from('products').select('*', { count: 'exact' }).eq('store_id', storeId);
      if (statusFilter && statusFilter !== 'all') {
        if (statusFilter === 'available') {
          q = q.gt('stock', 0).not('status', 'in', pgrstNotIn(HIDDEN_STATUSES));
        } else if (statusFilter === 'out_of_stock') {
          q = q.or(`stock.lte.0,status.in.${pgrstNotIn(SOLD_OUT_STATUSES)}`);
        }
      }
      const { data, count, error } = await q.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      if (error) throw error;
      rows = data || [];
      totalCount = count || rows.length;
    }

    const sanitized = rows.map(sanitizeProduct);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return sendSuccess(
      res,
      200,
      'STORE_PRODUCTS_FETCHED',
      `Berhasil mengambil ${sanitized.length} produk untuk toko ${storeRow.name}.`,
      sanitized,
      {
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
        },
      }
    );
  } catch (err: any) {
    console.error('[API GET /stores/:storeId/products] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil produk toko.');
  }
});

// =========================================================================
// 11. ENDPOINT DAFTAR PRODUK (GET /api/v1/products)
// =========================================================================
publicApiRouter.get('/products', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
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

    const effectiveCommunityId =
      req.apiAuth?.communityId || (communityId ? (await resolveCommunityId(communityId)) || communityId : '');

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
        query += ` AND ${sqlInCommunity('s.', `$${pIdx++}`)}`;
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
        query += ` AND ${sqlSoldOut('p.')}`;
      } else if (status === 'available') {
        query += ` AND ${sqlAvailable('p.')}`;
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
      if (effectiveCommunityId) {
        const ids = await communityStoreIdsFallback(effectiveCommunityId);
        sQuery = sQuery.in('store_id', ids.length ? ids : ['__none__']);
      }
      if (storeId) sQuery = sQuery.eq('store_id', storeId);
      if (category) sQuery = sQuery.ilike('category', category);
      if (search) sQuery = sQuery.or(`name.ilike.%${safeSearchTerm(search)}%,sku.ilike.%${safeSearchTerm(search)}%`);
      if (status === 'out_of_stock') sQuery = sQuery.or(`stock.lte.0,status.in.${pgrstNotIn(SOLD_OUT_STATUSES)}`);
      else if (status === 'available') sQuery = sQuery.gt('stock', 0).not('status', 'in', pgrstNotIn(HIDDEN_STATUSES));
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
publicApiRouter.get('/products/:id', requireApiKey, enforceRateLimit, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id || !SAFE_IDENTIFIER_REGEX.test(id)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Format ID produk tidak valid.');
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

    // Community scoping & publication check
    let storeRow: any = null;
    try {
      const stRes = await pool.query('SELECT community_id, is_published FROM stores WHERE id = $1 LIMIT 1', [row.store_id]);
      if (stRes.rows.length > 0) storeRow = stRes.rows[0];
    } catch {
      const { data } = await supabaseClient
        .from('stores')
        .select('community_id, is_published')
        .eq('id', row.store_id)
        .maybeSingle();
      storeRow = data;
    }

    if (storeRow) {
      if (req.apiAuth?.communityId && !(await storeInCommunity(row.store_id, storeRow.community_id, req.apiAuth.communityId))) {
        return sendError(res, 404, 'NOT_FOUND', 'Produk tidak ditemukan di komunitas Anda.');
      }
      const isPrivileged = Boolean(req.apiAuth?.communityId || req.apiAuth?.isMaster);
      if (!storeRow.is_published && !isPrivileged) {
        return sendError(res, 404, 'NOT_FOUND', 'Produk tidak ditemukan (toko belum dipublikasikan).');
      }
    }

    const sanitized = sanitizeProduct(row);
    return sendSuccess(res, 200, 'PRODUCT_FETCHED', 'Detail produk berhasil diambil.', sanitized);
  } catch (err: any) {
    console.error('[API GET /products/:id] Error:', err);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', err?.message || 'Gagal mengambil data produk.');
  }
});
