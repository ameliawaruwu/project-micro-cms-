/**
 * Keanggotaan komunitas (/api/community) — fitur "Komunitas".
 *
 * Pengguna (pemilik toko):
 *   GET    /api/community/my                 komunitas toko saya, permintaan saya, daftar komunitas aktif
 *   POST   /api/community/requests           { storeId, communityId, message? } minta gabung
 *   DELETE /api/community/requests/:id       batalkan permintaan pending milik sendiri
 * Sub-admin komunitas (sub_admin, sub_admin_umum, community_admin, sub_admin_produk):
 *   GET    /api/community/manage             anggota + permintaan komunitas sendiri
 *   POST   /api/community/manage/requests/:id/approve  { note? }
 *   POST   /api/community/manage/requests/:id/reject   { note? }
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
const MAX_PENDING_PER_USER = 10;
const MAX_TEXT = 500;

const fail = (res: Response, status: number, message: string) =>
  res.status(status).json({ success: false, error: message, message });

const cleanText = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, MAX_TEXT);
  return t || null;
};

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
// POST /requests
// ---------------------------------------------------------------------------
communityMembershipRouter.post('/requests', async (req: Request, res: Response) => {
  const user = await requireSession(req, res);
  if (!user) return;
  try {
    const storeId = String(req.body?.storeId || '').trim();
    const communityId = String(req.body?.communityId || '').trim();
    if (!safeIdentifier(storeId) || !safeIdentifier(communityId)) {
      return fail(res, 400, 'Toko atau komunitas tidak valid.');
    }
    const message = cleanText(req.body?.message);

    // Kepemilikan: hanya toko milik pemohon sendiri (super admin/staf tidak dikecualikan).
    const st = await pool.query('SELECT id, community_id FROM stores WHERE id = $1 AND user_id = $2 LIMIT 1', [storeId, user.id]);
    if (st.rows.length === 0) return fail(res, 403, 'Toko ini bukan milik Anda.');

    const cm = await pool.query(`SELECT id FROM communities WHERE id = $1 AND status = 'active' LIMIT 1`, [communityId]);
    if (cm.rows.length === 0) return fail(res, 404, 'Komunitas tidak ditemukan atau tidak aktif.');

    const already = await pool.query(
      `SELECT 1 FROM stores WHERE id = $1 AND community_id = $2
       UNION ALL SELECT 1 FROM store_communities WHERE store_id = $1 AND community_id = $2 LIMIT 1`,
      [storeId, communityId]
    );
    if (already.rows.length > 0) return fail(res, 409, 'Toko ini sudah menjadi anggota komunitas tersebut.');

    const pendingCount = await pool.query(
      `SELECT COUNT(*)::int AS n FROM community_join_requests WHERE user_id = $1 AND status = 'pending'`,
      [user.id]
    );
    if (pendingCount.rows[0].n >= MAX_PENDING_PER_USER) {
      return fail(res, 429, 'Terlalu banyak permintaan yang masih menunggu. Tunggu keputusan atau batalkan sebagian.');
    }

    try {
      const ins = await pool.query(
        `INSERT INTO community_join_requests (community_id, store_id, user_id, message)
         VALUES ($1, $2, $3, $4) RETURNING id, status, created_at`,
        [communityId, storeId, user.id, message]
      );
      return res.status(201).json({ success: true, message: 'Permintaan terkirim.', data: ins.rows[0] });
    } catch (e: any) {
      if (e?.code === '23505') return fail(res, 409, 'Permintaan untuk komunitas ini sudah menunggu persetujuan.');
      throw e;
    }
  } catch (err: any) {
    console.error('[community POST /requests] Error:', err?.message);
    return fail(res, 500, 'Gagal mengirim permintaan.');
  }
});

// ---------------------------------------------------------------------------
// DELETE /requests/:id  (batalkan, hanya pemilik permintaan, hanya pending)
// ---------------------------------------------------------------------------
communityMembershipRouter.delete('/requests/:id', async (req: Request, res: Response) => {
  const user = await requireSession(req, res);
  if (!user) return;
  try {
    const id = String(req.params.id || '').trim();
    if (!safeIdentifier(id)) return fail(res, 400, 'ID permintaan tidak valid.');
    const r = await pool.query(
      `UPDATE community_join_requests SET status = 'cancelled', updated_at = now()
        WHERE id = $1 AND user_id = $2 AND status = 'pending' RETURNING id`,
      [id, user.id]
    );
    if (r.rows.length === 0) return fail(res, 404, 'Permintaan tidak ditemukan atau sudah diputuskan.');
    return res.json({ success: true, message: 'Permintaan dibatalkan.' });
  } catch (err: any) {
    console.error('[community DELETE /requests/:id] Error:', err?.message);
    return fail(res, 500, 'Gagal membatalkan permintaan.');
  }
});

// ---------------------------------------------------------------------------
// GET /manage  (sub-admin: anggota + permintaan komunitasnya sendiri)
// ---------------------------------------------------------------------------
communityMembershipRouter.get('/manage', async (req: Request, res: Response) => {
  const user = await requireCommunityStaff(req, res);
  if (!user) return;
  try {
    const cid = user.communityId;
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
    const requests = await pool.query(
      `SELECT r.id, r.status, r.message, r.decision_note, r.created_at, r.decided_at,
              st.id AS store_id, st.name AS store_name, u.name AS owner_name, u.email AS owner_email
         FROM community_join_requests r
         JOIN stores st ON st.id = r.store_id
         LEFT JOIN users u ON u.id = r.user_id
        WHERE r.community_id = $1 AND r.status IN ('pending', 'approved', 'rejected')
        ORDER BY (r.status = 'pending') DESC, r.created_at DESC
        LIMIT 200`,
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
          ownerEmail: m.owner_email,
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
          ownerName: r.owner_name,
          ownerEmail: r.owner_email,
        })),
      },
    });
  } catch (err: any) {
    console.error('[community GET /manage] Error:', err?.message);
    return fail(res, 500, 'Gagal memuat anggota komunitas.');
  }
});

// ---------------------------------------------------------------------------
// POST /manage/requests/:id/(approve|reject)
// ---------------------------------------------------------------------------
async function decide(req: Request, res: Response, approve: boolean) {
  const user = await requireCommunityStaff(req, res);
  if (!user) return;
  const id = String(req.params.id || '').trim();
  if (!safeIdentifier(id)) return fail(res, 400, 'ID permintaan tidak valid.');
  const note = cleanText(req.body?.note);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Kunci baris; kepemilikan komunitas dicek di query yang sama (bukan hanya dari klien).
    const rq = await client.query(
      'SELECT id, store_id, community_id, status FROM community_join_requests WHERE id = $1 AND community_id = $2 FOR UPDATE',
      [id, user.communityId]
    );
    if (rq.rows.length === 0) {
      await client.query('ROLLBACK');
      return fail(res, 404, 'Permintaan tidak ditemukan di komunitas Anda.');
    }
    const row = rq.rows[0];
    if (row.status !== 'pending') {
      await client.query('ROLLBACK');
      return fail(res, 409, 'Permintaan ini sudah diputuskan.');
    }

    if (approve) {
      const st = await client.query('SELECT id, community_id FROM stores WHERE id = $1 FOR UPDATE', [row.store_id]);
      if (st.rows.length === 0) {
        await client.query('ROLLBACK');
        return fail(res, 404, 'Toko pemohon sudah tidak ada.');
      }
      const cm = await client.query('SELECT name FROM communities WHERE id = $1', [row.community_id]);
      if (!st.rows[0].community_id) {
        // Toko mandiri: komunitas ini menjadi komunitas utama (sama dengan partner API).
        await client.query(
          'UPDATE stores SET community_id = $1, community_name = $2, updated_at = now() WHERE id = $3 AND community_id IS NULL',
          [row.community_id, cm.rows[0]?.name || null, row.store_id]
        );
      }
      const fresh = await client.query('SELECT community_id FROM stores WHERE id = $1', [row.store_id]);
      if (fresh.rows[0]?.community_id !== row.community_id) {
        await client.query(
          `INSERT INTO store_communities (store_id, community_id, source) VALUES ($1, $2, 'request')
           ON CONFLICT (store_id, community_id) DO NOTHING`,
          [row.store_id, row.community_id]
        );
      }
    }

    await client.query(
      `UPDATE community_join_requests
          SET status = $2, decision_note = $3, decided_by = $4, decided_at = now(), updated_at = now()
        WHERE id = $1`,
      [id, approve ? 'approved' : 'rejected', note, user.id]
    );
    await client.query('COMMIT');
    return res.json({ success: true, message: approve ? 'Permintaan disetujui.' : 'Permintaan ditolak.' });
  } catch (err: any) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    console.error('[community decide] Error:', err?.message);
    return fail(res, 500, 'Gagal memproses permintaan.');
  } finally {
    client.release();
  }
}

communityMembershipRouter.post('/manage/requests/:id/approve', (req, res) => decide(req, res, true));
communityMembershipRouter.post('/manage/requests/:id/reject', (req, res) => decide(req, res, false));
