/**
 * Keanggotaan komunitas (/api/community) — fitur "Komunitas".
 *
 * Keanggotaan hanya lewat sub-admin (tambah toko binaan) atau jalur otomatis portal;
 * fitur "minta gabung" + approve/reject sudah dihentikan (endpoint lama membalas 410).
 *
 * Pengguna (pemilik toko):
 *   GET    /api/community/my                 komunitas toko saya
 * Sub-admin komunitas (sub_admin, sub_admin_umum, community_admin, sub_admin_produk):
 *   GET    /api/community/manage             daftar toko anggota komunitas sendiri
 * Hanya Sub-Admin Utama (sub_admin, sub_admin_umum) — Sub-Admin Produk hanya bisa melihat:
 *   GET    /api/community/manage/lookup?q=   cari toko (nama toko, tautan toko, atau email pemilik persis)
 *   POST   /api/community/manage/members     { storeId } tambahkan toko binaan ke komunitas
 *   DELETE /api/community/manage/members/:storeId  keluarkan toko dari komunitas
 *     (produknya otomatis tidak muncul lagi di API publik komunitas, mis. landing page GMPS)
 *
 * Jalur otomatis (email portal = email akun LapakQ) tetap di partnerApiController; di sini
 * hanya dibaca untuk menampilkan asal keanggotaan (stores.community_id / store_communities.source).
 * Semua akses: sesi (x-lapakq-session) + pemeriksaan kepemilikan; query berparameter.
 */
import { Router, Request, Response } from 'express';
import { pool, safeIdentifier } from './publicApiController';
import { requireSession, SessionUser } from './sessionAuth';

export const communityMembershipRouter = Router();

const COMMUNITY_STAFF_ROLES = new Set(['sub_admin', 'sub_admin_umum', 'community_admin', 'sub_admin_produk']);
/** Sub-Admin Utama: satu-satunya staf komunitas yang boleh menambah/mengeluarkan toko binaan. */
const COMMUNITY_LEAD_ROLES = new Set(['sub_admin', 'sub_admin_umum']);
const LOOKUP_LIMIT_PER_MIN = 60;
const ADD_LIMIT_PER_MIN = 20;
const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

const fail = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, error: message, message });

/** Sesi + peran staf komunitas + komunitas terikat. Mengirim 401/403 bila gagal. */
async function requireCommunityStaff(req: Request, res: Response): Promise<(SessionUser & { communityId: string }) | null> {
  const user = await requireSession(req, res);
  if (!user) return null;
  if (!COMMUNITY_STAFF_ROLES.has(user.role) || !user.communityId) {
    fail(res, 403, 'Hanya sub-admin komunitas yang dapat mengelola anggota.');
    return null;
  }
  return user as SessionUser & { communityId: string };
}

/** Seperti requireCommunityStaff, tetapi hanya Sub-Admin Utama. */
async function requireCommunityLead(req: Request, res: Response): Promise<(SessionUser & { communityId: string }) | null> {
  const user = await requireCommunityStaff(req, res);
  if (!user) return null;
  if (!COMMUNITY_LEAD_ROLES.has(user.role)) {
    fail(res, 403, 'Hanya Sub-Admin Utama yang dapat menambah atau mengeluarkan toko binaan.');
    return null;
  }
  return user;
}

const rateWindows = new Map<string, number[]>();
/** true bila batas terlampaui (jendela geser per kunci). */
function hitLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (rateWindows.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    rateWindows.set(key, hits);
    return true;
  }
  hits.push(now);
  rateWindows.set(key, hits);
  if (rateWindows.size > 5000) {
    for (const [k, v] of rateWindows) if (!v.some((t) => now - t < windowMs)) rateWindows.delete(k);
  }
  return false;
}

/**
 * Jadikan toko anggota komunitas di dalam transaksi `client` (baris toko sudah dikunci pemanggil).
 * Toko mandiri -> komunitas ini jadi komunitas utama; selain itu dicatat di store_communities.
 */
async function attachStoreToCommunity(client: any, storeId: string, communityId: string, source: string) {
  const cm = await client.query('SELECT name FROM communities WHERE id = $1', [communityId]);
  await client.query(
    'UPDATE stores SET community_id = $1, community_name = $2, updated_at = now() WHERE id = $3 AND community_id IS NULL',
    [communityId, cm.rows[0]?.name || null, storeId]
  );
  const fresh = await client.query('SELECT community_id FROM stores WHERE id = $1', [storeId]);
  if (fresh.rows[0]?.community_id !== communityId) {
    await client.query(
      `INSERT INTO store_communities (store_id, community_id, source) VALUES ($1, $2, $3)
       ON CONFLICT (store_id, community_id) DO NOTHING`,
      [storeId, communityId, source]
    );
  }
}

/** Tabel community_store_removals (migrasi 20261119) bisa belum diterapkan; fitur tetap jalan tanpanya. */
async function removalsTableExists(db: { query: (sql: string) => Promise<any> }): Promise<boolean> {
  const r = await db.query(`SELECT to_regclass('public.community_store_removals') IS NOT NULL AS ok`);
  return !!r.rows[0]?.ok;
}

const JOIN_REQUESTS_GONE =
  'Permintaan gabung komunitas tidak lagi tersedia. Toko ditambahkan oleh sub-admin komunitas.';

// ---------------------------------------------------------------------------
// GET /my
// ---------------------------------------------------------------------------
communityMembershipRouter.get('/my', async (req: Request, res: Response) => {
  const user = await requireSession(req, res);
  if (!user) return;
  try {
    const stores = await pool.query(
      'SELECT id, name, slug, community_id FROM stores WHERE user_id = $1 ORDER BY created_at ASC LIMIT 50',
      [user.id]
    );
    const storeIds: string[] = stores.rows.map((s) => s.id);

    const memberships = storeIds.length
      ? await pool.query(
          `SELECT s.id AS store_id, c.id AS community_id, c.name, c.slug, c.logo_url, c.description,
                  'primary'::text AS source, s.created_at AS joined_at
             FROM stores s JOIN communities c ON c.id = s.community_id
            WHERE s.id = ANY($1)
           UNION ALL
           SELECT sc.store_id, c.id, c.name, c.slug, c.logo_url, c.description, sc.source, sc.created_at
             FROM store_communities sc JOIN communities c ON c.id = sc.community_id
            WHERE sc.store_id = ANY($1)`,
          [storeIds]
        )
      : { rows: [] as any[] };

    const requests = await pool.query(
      `SELECT r.id, r.status, r.message, r.decision_note, r.created_at, r.decided_at,
              r.store_id, st.name AS store_name, c.id AS community_id, c.name AS community_name
         FROM community_join_requests r
         JOIN communities c ON c.id = r.community_id
         JOIN stores st ON st.id = r.store_id
        WHERE r.user_id = $1
        ORDER BY r.created_at DESC
        LIMIT 50`,
      [user.id]
    );

    const communities = await pool.query(
      `SELECT id, name, slug, description, logo_url FROM communities WHERE status = 'active' ORDER BY name ASC LIMIT 200`
    );

    return res.json({
      success: true,
      data: {
        stores: stores.rows.map((s) => ({ id: s.id, name: s.name, slug: s.slug })),
        memberships: memberships.rows.map((m) => ({
          storeId: m.store_id,
          communityId: m.community_id,
          name: m.name,
          slug: m.slug,
          logoUrl: m.logo_url,
          description: m.description,
          source: m.source,
          joinedAt: m.joined_at,
        })),
        requests: requests.rows.map((r) => ({
          id: r.id,
          status: r.status,
          message: r.message,
          decisionNote: r.decision_note,
          createdAt: r.created_at,
          decidedAt: r.decided_at,
          storeId: r.store_id,
          storeName: r.store_name,
          communityId: r.community_id,
          communityName: r.community_name,
        })),
        communities: communities.rows.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          logoUrl: c.logo_url,
        })),
      },
    });
  } catch (err: any) {
    console.error('[community GET /my] Error:', err?.message);
    return fail(res, 500, 'Gagal memuat data komunitas.');
  }
});

// ---------------------------------------------------------------------------
// POST /requests, DELETE /requests/:id — dihentikan: toko masuk komunitas hanya
// lewat Sub-Admin Utama atau jalur otomatis portal.
// ---------------------------------------------------------------------------
communityMembershipRouter.post('/requests', (_req: Request, res: Response) => fail(res, 410, JOIN_REQUESTS_GONE));
communityMembershipRouter.delete('/requests/:id', (_req: Request, res: Response) => fail(res, 410, JOIN_REQUESTS_GONE));

// ---------------------------------------------------------------------------
// GET /manage  (sub-admin: daftar toko anggota komunitasnya sendiri)
// ---------------------------------------------------------------------------
communityMembershipRouter.get('/manage', async (req: Request, res: Response) => {
  const user = await requireCommunityStaff(req, res);
  if (!user) return;
  try {
    const cid = user.communityId;
    // Sub-Admin Produk hanya melihat nama toko & pemilik (tanpa email/kontak).
    const isLead = COMMUNITY_LEAD_ROLES.has(user.role);
    const members = await pool.query(
      `SELECT s.id AS store_id, s.name AS store_name, s.slug, s.is_published, u.name AS owner_name, u.email AS owner_email,
              m.source, m.joined_at
         FROM (
           SELECT id AS store_id, 'primary'::text AS source, created_at AS joined_at FROM stores WHERE community_id = $1
           UNION
           SELECT store_id, source, created_at FROM store_communities WHERE community_id = $1
         ) m
         JOIN stores s ON s.id = m.store_id
         LEFT JOIN users u ON u.id = s.user_id
        ORDER BY m.joined_at DESC
        LIMIT 500`,
      [cid]
    );
    return res.json({
      success: true,
      data: {
        communityId: cid,
        members: members.rows.map((m) => ({
          storeId: m.store_id,
          storeName: m.store_name,
          slug: m.slug,
          isPublished: !!m.is_published,
          ownerName: m.owner_name,
          ownerEmail: isLead ? m.owner_email : null,
          source: m.source,
          joinedAt: m.joined_at,
        })),
        requests: [],
      },
    });
  } catch (err: any) {
    console.error('[community GET /manage] Error:', err?.message);
    return fail(res, 500, 'Gagal memuat anggota komunitas.');
  }
});

// ---------------------------------------------------------------------------
// POST /manage/requests/:id/(approve|reject) — dihentikan (lihat atas).
// ---------------------------------------------------------------------------
communityMembershipRouter.post('/manage/requests/:id/approve', (_req: Request, res: Response) => fail(res, 410, JOIN_REQUESTS_GONE));
communityMembershipRouter.post('/manage/requests/:id/reject', (_req: Request, res: Response) => fail(res, 410, JOIN_REQUESTS_GONE));

// ---------------------------------------------------------------------------
// GET /manage/lookup?q=  (Sub-Admin Utama: cari toko untuk ditambahkan)
// Nama toko (sebagian, maks 20 hasil), tautan toko persis, atau email pemilik persis.
// Email pemilik tidak pernah dikembalikan.
// ---------------------------------------------------------------------------
communityMembershipRouter.get('/manage/lookup', async (req: Request, res: Response) => {
  const user = await requireCommunityLead(req, res);
  if (!user) return;
  if (hitLimit(`lookup:${user.id}`, LOOKUP_LIMIT_PER_MIN)) {
    return fail(res, 429, 'Terlalu banyak pencarian. Coba lagi sebentar lagi.');
  }
  try {
    let q = String(req.query.q || '').trim().toLowerCase().slice(0, 254);
    // Terima juga tautan toko: https://slug.lapakq.com/... -> slug
    const urlMatch = q.match(/^(?:https?:\/\/)?([a-z0-9-]+)\.lapakq\.com(?:[/?#].*)?$/);
    if (urlMatch) q = urlMatch[1];

    let rows: any[];
    if (EMAIL_REGEX.test(q)) {
      const r = await pool.query(
        `SELECT s.id, s.name, s.slug, s.community_id, u.name AS owner_name
           FROM stores s JOIN users u ON u.id = s.user_id
          WHERE lower(u.email) = $1
          ORDER BY s.created_at ASC LIMIT 10`,
        [q]
      );
      rows = r.rows;
    } else if (urlMatch && SLUG_REGEX.test(q)) {
      const r = await pool.query(
        `SELECT s.id, s.name, s.slug, s.community_id, u.name AS owner_name
           FROM stores s LEFT JOIN users u ON u.id = s.user_id
          WHERE lower(s.slug) = $1 LIMIT 1`,
        [q]
      );
      rows = r.rows;
    } else {
      // Cari berdasarkan nama toko (atau slug) sebagian; minimal 2 karakter, maks 20 hasil.
      const term = q.slice(0, 100);
      if (term.length < 2) {
        return fail(res, 400, 'Ketik minimal 2 karakter nama toko.');
      }
      const like = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
      const r = await pool.query(
        `SELECT s.id, s.name, s.slug, s.community_id, u.name AS owner_name
           FROM stores s LEFT JOIN users u ON u.id = s.user_id
          WHERE lower(s.name) LIKE $1 OR lower(s.slug) LIKE $1
          ORDER BY (lower(s.slug) = $2 OR lower(s.name) = $2) DESC,
                   (lower(s.name) LIKE $3) DESC,
                   s.name ASC
          LIMIT 20`,
        [like, term, `${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`]
      );
      rows = r.rows;
    }

    const ids = rows.map((r) => r.id);
    const secondary = ids.length
      ? await pool.query('SELECT store_id FROM store_communities WHERE community_id = $1 AND store_id = ANY($2)', [user.communityId, ids])
      : { rows: [] as any[] };
    const inSecondary = new Set(secondary.rows.map((r: any) => r.store_id));

    return res.json({
      success: true,
      data: rows.map((r) => ({
        storeId: r.id,
        storeName: r.name,
        slug: r.slug,
        ownerName: r.owner_name,
        alreadyMember: r.community_id === user.communityId || inSecondary.has(r.id),
      })),
    });
  } catch (err: any) {
    console.error('[community GET /manage/lookup] Error:', err?.message);
    return fail(res, 500, 'Gagal mencari toko.');
  }
});

// ---------------------------------------------------------------------------
// POST /manage/members  { storeId }  (Sub-Admin Utama: tambahkan toko binaan)
// ---------------------------------------------------------------------------
communityMembershipRouter.post('/manage/members', async (req: Request, res: Response) => {
  const user = await requireCommunityLead(req, res);
  if (!user) return;
  if (hitLimit(`add:${user.id}`, ADD_LIMIT_PER_MIN)) {
    return fail(res, 429, 'Terlalu banyak permintaan. Coba lagi sebentar lagi.');
  }
  const storeId = String(req.body?.storeId || '').trim();
  if (!safeIdentifier(storeId)) return fail(res, 400, 'Toko tidak valid.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cm = await client.query(`SELECT id FROM communities WHERE id = $1 AND status = 'active' LIMIT 1`, [user.communityId]);
    if (cm.rows.length === 0) {
      await client.query('ROLLBACK');
      return fail(res, 409, 'Komunitas Anda tidak aktif.');
    }
    const st = await client.query('SELECT id, name FROM stores WHERE id = $1 FOR UPDATE', [storeId]);
    if (st.rows.length === 0) {
      await client.query('ROLLBACK');
      return fail(res, 404, 'Toko tidak ditemukan.');
    }
    const already = await client.query(
      `SELECT 1 FROM stores WHERE id = $1 AND community_id = $2
       UNION ALL SELECT 1 FROM store_communities WHERE store_id = $1 AND community_id = $2 LIMIT 1`,
      [storeId, user.communityId]
    );
    if (already.rows.length > 0) {
      await client.query('ROLLBACK');
      return fail(res, 409, 'Toko ini sudah menjadi anggota komunitas Anda.');
    }

    await attachStoreToCommunity(client, storeId, user.communityId, 'staff');
    // Ditambahkan lagi oleh Sub-Admin Utama: catatan "dikeluarkan" tidak berlaku lagi.
    if (await removalsTableExists(client)) {
      await client.query('DELETE FROM community_store_removals WHERE community_id = $1 AND store_id = $2', [user.communityId, storeId]);
    }
    // Permintaan gabung yang masih menunggu untuk toko ini dianggap selesai.
    await client.query(
      `UPDATE community_join_requests
          SET status = 'approved', decided_by = $3, decided_at = now(), updated_at = now(),
              decision_note = COALESCE(decision_note, 'Ditambahkan langsung oleh Sub-Admin Utama')
        WHERE store_id = $1 AND community_id = $2 AND status = 'pending'`,
      [storeId, user.communityId, user.id]
    );
    await client.query('COMMIT');
    console.info(`[community] toko ${storeId} ditambahkan ke komunitas ${user.communityId} oleh ${user.id}`);
    return res.status(201).json({ success: true, message: `${st.rows[0].name} ditambahkan sebagai toko binaan.` });
  } catch (err: any) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    console.error('[community POST /manage/members] Error:', err?.message);
    return fail(res, 500, 'Gagal menambahkan toko.');
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// DELETE /manage/members/:storeId  (Sub-Admin Utama: keluarkan toko dari komunitas)
// Keanggotaan dihapus dari kedua sumber (stores.community_id & store_communities), jadi
// toko & produknya tidak lagi tampil di API publik komunitas (sqlInCommunity / storeInCommunity).
// Toko tetap ada dan tetap terbit di subdomainnya; hanya keluar dari komunitas ini.
// ---------------------------------------------------------------------------
communityMembershipRouter.delete('/manage/members/:storeId', async (req: Request, res: Response) => {
  const user = await requireCommunityLead(req, res);
  if (!user) return;
  if (hitLimit(`remove:${user.id}`, ADD_LIMIT_PER_MIN)) {
    return fail(res, 429, 'Terlalu banyak permintaan. Coba lagi sebentar lagi.');
  }
  const storeId = String(req.params.storeId || '').trim();
  if (!safeIdentifier(storeId)) return fail(res, 400, 'Toko tidak valid.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const st = await client.query('SELECT id, name, community_id FROM stores WHERE id = $1 FOR UPDATE', [storeId]);
    if (st.rows.length === 0) {
      await client.query('ROLLBACK');
      return fail(res, 404, 'Toko tidak ditemukan.');
    }
    // Komunitas selalu dari sesi, bukan dari body: hanya bisa mengeluarkan dari komunitas sendiri.
    const secondary = await client.query(
      'DELETE FROM store_communities WHERE store_id = $1 AND community_id = $2 RETURNING store_id',
      [storeId, user.communityId]
    );
    const primary = await client.query(
      `UPDATE stores SET community_id = NULL, community_name = NULL, updated_at = now()
        WHERE id = $1 AND community_id = $2 RETURNING id`,
      [storeId, user.communityId]
    );
    if (secondary.rows.length === 0 && primary.rows.length === 0) {
      await client.query('ROLLBACK');
      return fail(res, 404, 'Toko ini bukan anggota komunitas Anda.');
    }
    // Catat agar jalur otomatis portal (partner API) tidak memasukkannya kembali.
    if (await removalsTableExists(client)) {
      await client.query(
        `INSERT INTO community_store_removals (community_id, store_id, removed_by) VALUES ($1, $2, $3)
         ON CONFLICT (community_id, store_id) DO UPDATE SET removed_by = EXCLUDED.removed_by, removed_at = now()`,
        [user.communityId, storeId, user.id]
      );
    }
    await client.query('COMMIT');
    console.info(`[community] toko ${storeId} dikeluarkan dari komunitas ${user.communityId} oleh ${user.id}`);
    return res.json({ success: true, message: `${st.rows[0].name} dikeluarkan dari komunitas.` });
  } catch (err: any) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    console.error('[community DELETE /manage/members] Error:', err?.message);
    return fail(res, 500, 'Gagal mengeluarkan toko.');
  } finally {
    client.release();
  }
});
