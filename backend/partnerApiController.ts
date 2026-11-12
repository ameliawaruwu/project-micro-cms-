/**
 * Partner API v1 (/api/v1/partner) — khusus API key partner yang terikat ke satu komunitas
 * (tabel partner_api_keys). Dipakai portal komunitas (mis. Portal GMPS) untuk:
 *   - mencari toko milik akun LapakQ berdasarkan email (GET /accounts?email=)
 *   - mencari toko di seluruh LapakQ untuk ditautkan manual (GET /stores?search=)
 *   - memasukkan toko ke komunitas milik key (POST /communities/:id/stores)
 *
 * Memasukkan toko tidak memindahkan toko dari komunitas lain: bila toko belum punya komunitas,
 * komunitas ini menjadi komunitas utamanya (stores.community_id); bila sudah, komunitas ini
 * dicatat sebagai komunitas tambahan (store_communities).
 * Master key dan akses anonim ditolak; endpoint publik read-only tetap di publicApiController.
 */
import { Router, Request, Response, NextFunction } from 'express';
import {
  pool,
  requireApiKey,
  enforceRateLimit,
  sendError,
  sendSuccess,
  sanitizeStore,
  attachStoreBaseDomains,
  resolveCommunityId,
  safeIdentifier,
  storeInCommunity,
} from './publicApiController';

export const partnerApiRouter = Router();

const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

async function requirePartnerKey(req: Request, res: Response, next: NextFunction) {
  if (req.apiAuth?.communityId && !req.apiAuth.isMaster) return next();
  // Key partner bisa bernilai sama dengan master key env (requireApiKey mengutamakan master).
  // Di router partner, keterikatan komunitas di partner_api_keys yang berlaku.
  const provided = String(req.header('X-API-Key') || '').trim();
  if (provided) {
    try {
      const r = await pool.query(
        'SELECT partner_name, community_id FROM partner_api_keys WHERE api_key = $1 AND is_active = true AND community_id IS NOT NULL LIMIT 1',
        [provided]
      );
      if (r.rows.length > 0) {
        req.apiAuth = { keyName: r.rows[0].partner_name, isReadOnly: false, communityId: r.rows[0].community_id, isMaster: false };
        return next();
      }
    } catch (err: any) {
      console.error('[Partner API] Gagal memeriksa partner key:', err?.message);
    }
  }
  return sendError(res, 403, 'FORBIDDEN', 'Endpoint ini hanya untuk API key partner yang terikat ke komunitas.');
}

partnerApiRouter.use(requireApiKey, enforceRateLimit, requirePartnerKey);

/** Daftar komunitas sebuah toko (utama + tambahan). */
async function communitiesOfStores(rows: any[]): Promise<Map<string, { id: string; name: string }[]>> {
  const out = new Map<string, { id: string; name: string }[]>();
  if (rows.length === 0) return out;
  // Every partner response that lists stores goes through here; storeUrl needs the community domain.
  await attachStoreBaseDomains(rows);
  const ids = rows.map((r) => r.id);
  const res = await pool.query(
    `SELECT s.id AS store_id, c.id, c.name
       FROM stores s JOIN communities c ON c.id = s.community_id
      WHERE s.id = ANY($1)
     UNION
     SELECT sc.store_id, c.id, c.name
       FROM store_communities sc JOIN communities c ON c.id = sc.community_id
      WHERE sc.store_id = ANY($1)`,
    [ids]
  );
  for (const r of res.rows) {
    const list = out.get(r.store_id) || [];
    if (!list.some((c) => c.id === r.id)) list.push({ id: r.id, name: r.name });
    out.set(r.store_id, list);
  }
  return out;
}

function presentStore(row: any, communities: { id: string; name: string }[], keyCommunityId: string) {
  return {
    ...sanitizeStore(row),
    communities,
    inCommunity: communities.some((c) => c.id === keyCommunityId),
  };
}

// =========================================================================
// GET /api/v1/partner/accounts?email= — toko milik akun LapakQ dengan email ini
// =========================================================================
partnerApiRouter.get('/accounts', async (req: Request, res: Response) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Parameter email tidak valid.');
    }
    const result = await pool.query(
      `SELECT s.* FROM users u JOIN stores s ON s.user_id = u.id
        WHERE LOWER(u.email) = $1
        ORDER BY s.created_at ASC
        LIMIT 1`,
      [email]
    );
    if (result.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Tidak ada toko LapakQ untuk email ini.');
    }
    const row = result.rows[0];
    const comms = await communitiesOfStores([row]);
    return sendSuccess(res, 200, 'ACCOUNT_STORE_FETCHED', 'Toko akun ditemukan.', presentStore(row, comms.get(row.id) || [], req.apiAuth!.communityId!));
  } catch (err: any) {
    console.error('[Partner API GET /accounts] Error:', err?.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Gagal mencari akun.');
  }
});

// =========================================================================
// GET /api/v1/partner/stores?search= — cari toko di seluruh LapakQ (untuk tautan manual)
// =========================================================================
partnerApiRouter.get('/stores', async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || '').trim().toLowerCase().slice(0, 100);
    if (search.length < 2) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'Kata kunci pencarian minimal 2 karakter.');
    }
    const digits = search.replace(/\D/g, '');
    const params: any[] = [`%${search}%`];
    let where = '(LOWER(name) LIKE $1 OR LOWER(slug) LIKE $1)';
    if (digits.length >= 6) {
      params.push(`%${digits.replace(/^(62|0)/, '')}%`);
      where = `(${where} OR regexp_replace(COALESCE(phone_whatsapp, ''), '\\D', '', 'g') LIKE $2)`;
    }
    const result = await pool.query(`SELECT * FROM stores WHERE ${where} ORDER BY created_at DESC LIMIT 20`, params);
    const comms = await communitiesOfStores(result.rows);
    const data = result.rows.map((r) => presentStore(r, comms.get(r.id) || [], req.apiAuth!.communityId!));
    return sendSuccess(res, 200, 'STORES_FETCHED', `Ditemukan ${data.length} toko.`, data);
  } catch (err: any) {
    console.error('[Partner API GET /stores] Error:', err?.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Gagal mencari toko.');
  }
});

// =========================================================================
// POST /api/v1/partner/communities/:id/stores { storeId } — masukkan toko ke komunitas key
// =========================================================================
partnerApiRouter.post('/communities/:id/stores', async (req: Request, res: Response) => {
  try {
    const keyCommunityId = req.apiAuth!.communityId!;
    const idOrSlug = String(req.params.id || '').trim();
    const communityId = safeIdentifier(idOrSlug) ? await resolveCommunityId(idOrSlug) : null;
    if (!communityId) {
      return sendError(res, 404, 'NOT_FOUND', 'Komunitas tidak ditemukan.');
    }
    if (communityId !== keyCommunityId) {
      return sendError(res, 403, 'FORBIDDEN', 'API key hanya boleh memasukkan toko ke komunitasnya sendiri.');
    }

    const storeId = String(req.body?.storeId || '').trim();
    if (!safeIdentifier(storeId)) {
      return sendError(res, 400, 'VALIDATION_ERROR', 'storeId tidak valid.');
    }
    const stRes = await pool.query('SELECT * FROM stores WHERE id = $1 LIMIT 1', [storeId]);
    if (stRes.rows.length === 0) {
      return sendError(res, 404, 'NOT_FOUND', 'Toko tidak ditemukan.');
    }
    const store = stRes.rows[0];

    let joined = false;
    if (!(await storeInCommunity(store.id, store.community_id, communityId))) {
      const cRes = await pool.query('SELECT name FROM communities WHERE id = $1', [communityId]);
      const communityName = cRes.rows[0]?.name || null;
      if (!store.community_id) {
        // Toko mandiri: komunitas ini menjadi komunitas utama.
        await pool.query(
          'UPDATE stores SET community_id = $1, community_name = $2, updated_at = now() WHERE id = $3 AND community_id IS NULL',
          [communityId, communityName, store.id]
        );
      }
      // Selalu catat di store_communities juga (aman bila update di atas kalah balapan).
      const fresh = await pool.query('SELECT community_id FROM stores WHERE id = $1', [store.id]);
      if (fresh.rows[0]?.community_id !== communityId) {
        await pool.query(
          `INSERT INTO store_communities (store_id, community_id, source) VALUES ($1, $2, $3)
           ON CONFLICT (store_id, community_id) DO NOTHING`,
          [store.id, communityId, `partner:${String(req.apiAuth!.keyName || '').slice(0, 60)}`]
        );
      }
      joined = true;
      // Permintaan gabung yang masih menunggu untuk toko & komunitas ini otomatis selesai (tabel baru bisa belum dimigrasi).
      try {
        await pool.query(
          `UPDATE community_join_requests SET status = 'approved', decision_note = 'Otomatis: email portal cocok', decided_at = now(), updated_at = now()
            WHERE store_id = $1 AND community_id = $2 AND status = 'pending'`,
          [store.id, communityId]
        );
      } catch {}
      console.log(`[Partner API] Toko ${store.id} dimasukkan ke komunitas ${communityId} oleh ${req.apiAuth!.keyName}`);
    }

    const after = await pool.query('SELECT * FROM stores WHERE id = $1', [store.id]);
    const comms = await communitiesOfStores(after.rows);
    return sendSuccess(
      res,
      joined ? 201 : 200,
      joined ? 'STORE_JOINED' : 'STORE_ALREADY_MEMBER',
      joined ? 'Toko dimasukkan ke komunitas.' : 'Toko sudah ada di komunitas.',
      presentStore(after.rows[0], comms.get(store.id) || [], communityId),
      { joined }
    );
  } catch (err: any) {
    console.error('[Partner API POST /communities/:id/stores] Error:', err?.message);
    return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Gagal memasukkan toko ke komunitas.');
  }
});
