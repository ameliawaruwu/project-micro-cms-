import crypto from 'crypto';
import type { Request, Response } from 'express';
import { pool } from './publicApiController';

/**
 * Sesi LapakQ untuk endpoint server. Browser mengirim token yang sama dengan yang dipakai
 * database (header `x-lapakq-session`); server mencocokkan hash SHA-256-nya ke
 * app_private.sessions lewat koneksi DATABASE_URL.
 */
export const SESSION_HEADER = 'x-lapakq-session';

export type SessionUser = { id: string; role: string; communityId: string | null };

const COMMUNITY_STAFF_ROLES = new Set(['sub_admin', 'sub_admin_umum', 'community_admin', 'sub_admin_produk']);

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const raw = req.header(SESSION_HEADER);
  const token = typeof raw === 'string' ? raw.trim() : '';
  if (!token || token.length > 512) return null;
  const tokenHash = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
  const result = await pool.query(
    `SELECT u.id, u.role, u.community_id
       FROM app_private.sessions s
       JOIN public.users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()
      LIMIT 1`,
    [tokenHash]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: row.id, role: String(row.role || ''), communityId: row.community_id || null };
}

export const isPlatformAdmin = (user: SessionUser | null) => user?.role === 'admin';

/** Pemilik toko, super admin, atau staf komunitas toko itu (sama dengan app_private.can_manage_store). */
export async function canManageStore(user: SessionUser | null, storeId: string): Promise<boolean> {
  if (!user) return false;
  if (isPlatformAdmin(user)) return true;
  const staffCommunity = COMMUNITY_STAFF_ROLES.has(user.role) ? user.communityId : null;
  const result = await pool.query(
    `SELECT 1 FROM public.stores s
      WHERE s.id = $1
        AND (s.user_id = $2
             OR ($3::text IS NOT NULL
                 AND (s.community_id = $3
                      OR EXISTS (SELECT 1 FROM public.store_communities sc
                                  WHERE sc.store_id = s.id AND sc.community_id = $3))))
      LIMIT 1`,
    [storeId, user.id, staffCommunity]
  );
  return result.rows.length > 0;
}

/** Kirim 401 dan kembalikan null bila tidak ada sesi yang sah. */
export async function requireSession(req: Request, res: Response): Promise<SessionUser | null> {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ success: false, error: 'Sesi login tidak valid. Silakan masuk kembali.', message: 'Sesi login tidak valid. Silakan masuk kembali.' });
      return null;
    }
    return user;
  } catch (err: any) {
    console.error('[sessionAuth] session lookup error:', err?.message);
    res.status(503).json({ success: false, error: 'Database tidak dapat dihubungi', message: 'Database tidak dapat dihubungi' });
    return null;
  }
}

export async function requireAdmin(req: Request, res: Response): Promise<SessionUser | null> {
  const user = await requireSession(req, res);
  if (!user) return null;
  if (!isPlatformAdmin(user)) {
    res.status(403).json({ success: false, error: 'Hanya super admin.', message: 'Hanya super admin.' });
    return null;
  }
  return user;
}

export async function requireStoreManager(req: Request, res: Response, storeId: string): Promise<SessionUser | null> {
  const user = await requireSession(req, res);
  if (!user) return null;
  try {
    if (await canManageStore(user, storeId)) return user;
  } catch (err: any) {
    console.error('[sessionAuth] store access error:', err?.message);
    res.status(503).json({ success: false, error: 'Database tidak dapat dihubungi', message: 'Database tidak dapat dihubungi' });
    return null;
  }
  res.status(403).json({ success: false, error: 'Anda tidak berhak mengelola toko ini.', message: 'Anda tidak berhak mengelola toko ini.' });
  return null;
}
