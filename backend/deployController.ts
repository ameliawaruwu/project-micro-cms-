import { Router, Request, Response } from 'express';
import { panelDomainClient, PanelResult } from './panelDomainClient';
import { pool } from './publicApiController';
import { requireStoreManager } from './sessionAuth';

// Publishing a store = adding <slug>.lapakq.com (and the merchant's custom domain, if any) as a
// host of this app through the Kroombox Panel API. The SPA already renders the store from the
// hostname (src/utils/domainRouting.ts), so nothing is packaged or written to the server.
//
// This app has no server-side session, so every request is checked against the stores table:
// publish needs an existing store, and a host is only removed once that store no longer uses it.

export const deployRouter = Router();

const PUBLIC_BASE_DOMAIN = 'lapakq.com';
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const HOST_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
const STORE_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
// Same list as RESERVED_SUBDOMAINS in src/utils/domainRouting.ts: these never resolve to a store.
const RESERVED_SLUGS = new Set(['lapakq', 'kroomify', 'panel', 'api', 'cdn', 'api-cdn', 'www', 'app', 'admin', 'mail', 'auth', 'staging']);

interface StoreRow {
  id: string;
  slug: string;
  is_published: boolean | null;
  is_suspended: boolean | null;
  custom_domain: string | null;
}

const cleanSlug = (raw: unknown): string => String(raw || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

const cleanHost = (raw: unknown): string =>
  String(raw || '').toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '');

const storeHost = (slug: string, baseDomain = PUBLIC_BASE_DOMAIN) => `${slug}.${baseDomain}`;

// Community stores use their community's domain; the panel only accepts domains this account owns.
const cleanBaseDomain = (raw: unknown): string | null => {
  const base = cleanHost(raw) || PUBLIC_BASE_DOMAIN;
  return HOST_RE.test(base) ? base : null;
};

const STORE_COLUMNS = 'id, slug, is_published, is_suspended, custom_domain';

// Dibaca lewat koneksi server (DATABASE_URL) agar tidak bergantung pada aturan baca anon key.
async function queryStores(where: string, params: unknown[]): Promise<StoreRow[] | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const result = await pool.query(`SELECT ${STORE_COLUMNS} FROM public.stores WHERE ${where} LIMIT 1`, params);
    return result.rows as StoreRow[];
  } catch (err: any) {
    console.error('[deploy] stores query error:', err?.message);
    return null;
  }
}

async function supabaseStores(filter: string): Promise<StoreRow[] | null> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/stores?select=id,slug,is_published,is_suspended,custom_domain&${filter}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

const findStoreById = async (storeId: string) =>
  ((await queryStores('id = $1', [storeId])) ??
    (await supabaseStores(`id=eq.${encodeURIComponent(storeId)}&limit=1`)))?.[0] || null;

const findOtherSlugOwner = async (slug: string, storeId: string) =>
  (await queryStores('slug = $1 AND id <> $2', [slug, storeId])) ??
  (await supabaseStores(`slug=eq.${encodeURIComponent(slug)}&id=neq.${encodeURIComponent(storeId)}&limit=1`));

// Is the host still used by any store (as its slug host or custom domain)?
async function hostInUse(host: string, baseDomain = PUBLIC_BASE_DOMAIN): Promise<boolean | null> {
  const base = `.${baseDomain}`;
  const isSlugHost = host.endsWith(base);
  const value = isSlugHost ? host.slice(0, -base.length) : host;
  const rows =
    (await queryStores(isSlugHost ? 'slug = $1 AND is_published = true' : 'custom_domain = $1', [value])) ??
    (await supabaseStores(
      isSlugHost
        ? `slug=eq.${encodeURIComponent(value)}&is_published=eq.true&limit=1`
        : `custom_domain=eq.${encodeURIComponent(value)}&limit=1`
    ));
  return rows === null ? null : rows.length > 0;
}

const panelError = (result: PanelResult, fallback: string) => result.message || fallback;

const requireStoreId = (raw: unknown): string | null => {
  const id = String(raw || '').trim();
  return STORE_ID_RE.test(id) ? id : null;
};

/**
 * POST /api/deploy/publish  { storeId, slug, baseDomain?, customDomain? }
 */
deployRouter.post('/publish', async (req: Request, res: Response) => {
  try {
    const storeId = requireStoreId(req.body?.storeId);
    const slug = cleanSlug(req.body?.slug);
    if (!storeId) return res.status(400).json({ error: 'ID toko wajib diisi' });
    if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'Slug toko tidak valid' });
    if (RESERVED_SLUGS.has(slug)) return res.status(400).json({ error: 'Alamat toko ini dicadangkan sistem' });
    const baseDomain = cleanBaseDomain(req.body?.baseDomain);
    if (!baseDomain) return res.status(400).json({ error: 'Domain induk toko tidak valid' });
    if (!(await requireStoreManager(req, res, storeId))) return;

    const store = await findStoreById(storeId);
    if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan' });
    if (store.is_suspended) return res.status(403).json({ error: 'Toko sedang ditangguhkan' });

    // The slug may change on publish, but never to one another store already owns.
    const slugOwners = await findOtherSlugOwner(slug, storeId);
    if (slugOwners === null) return res.status(503).json({ error: 'Database toko tidak dapat dihubungi' });
    if (slugOwners.length > 0) return res.status(409).json({ error: 'Alamat toko sudah dipakai toko lain' });

    const primaryHost = storeHost(slug, baseDomain);
    const stages: Array<{ name: string; status: 'success' | 'failed'; detail?: string }> = [];

    const primary = await panelDomainClient.addHost(primaryHost);
    if (!primary.ok) {
      return res.status(primary.status >= 400 && primary.status < 500 ? 400 : 502).json({
        error: `Gagal mengaktifkan alamat toko: ${panelError(primary, 'server panel menolak permintaan')}`,
        stage: 'domain',
      });
    }
    stages.push({ name: 'Alamat Toko', status: 'success', detail: primaryHost });

    let customDomainUrl: string | null = null;
    const customHost = cleanHost(req.body?.customDomain);
    if (customHost) {
      if (!HOST_RE.test(customHost)) {
        stages.push({ name: 'Domain Kustom', status: 'failed', detail: 'Format domain tidak valid' });
      } else {
        const custom = await panelDomainClient.addHost(customHost);
        stages.push(custom.ok
          ? { name: 'Domain Kustom', status: 'success', detail: customHost }
          : { name: 'Domain Kustom', status: 'failed', detail: panelError(custom, 'Domain belum bisa dihubungkan') });
        if (custom.ok) customDomainUrl = `https://${customHost}`;
      }
    }

    console.log(`[Deploy] Store ${slug} published at https://${primaryHost}`);
    return res.status(200).json({
      success: true,
      message: `Toko online ${slug} berhasil dipublikasikan dan live!`,
      slug,
      primaryUrl: `https://${primaryHost}`,
      customDomainUrl,
      domains: [primaryHost, ...(customDomainUrl ? [customHost] : [])],
      stages,
    });
  } catch (err: any) {
    console.error('[Deploy] publish error:', err?.message);
    return res.status(500).json({ error: 'Gagal mempublikasikan toko. Coba lagi beberapa saat.' });
  }
});

/**
 * POST /api/deploy/unpublish  { storeId, baseDomain? }
 * Called after the store is marked unpublished; removes its hosts from the panel.
 */
deployRouter.post('/unpublish', async (req: Request, res: Response) => {
  try {
    const storeId = requireStoreId(req.body?.storeId);
    const baseDomain = cleanBaseDomain(req.body?.baseDomain);
    if (!storeId || !baseDomain) return res.status(400).json({ error: 'ID toko wajib diisi' });
    if (!(await requireStoreManager(req, res, storeId))) return;

    const store = await findStoreById(storeId);
    if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan' });
    if (store.is_published) return res.status(409).json({ error: 'Toko masih berstatus terbit' });

    const hosts = [storeHost(cleanSlug(store.slug), baseDomain)];
    const custom = cleanHost(store.custom_domain);
    if (custom && HOST_RE.test(custom)) hosts.push(custom);

    const failures: string[] = [];
    for (const host of hosts) {
      if (await hostInUse(host, baseDomain)) continue;
      const result = await panelDomainClient.removeHost(host);
      if (!result.ok) failures.push(`${host}: ${panelError(result, 'gagal dilepas')}`);
    }
    if (failures.length) {
      return res.status(502).json({ error: `Sebagian alamat belum terlepas (${failures.join('; ')})` });
    }
    return res.status(200).json({ success: true, message: 'Toko berhasil ditarik dari publikasi.' });
  } catch (err: any) {
    console.error('[Deploy] unpublish error:', err?.message);
    return res.status(500).json({ error: 'Gagal menghapus publikasi toko' });
  }
});

/**
 * GET /api/deploy/status/:slug
 */
deployRouter.get('/status/:slug', async (req: Request, res: Response) => {
  const slug = cleanSlug(req.params.slug);
  if (!SLUG_RE.test(slug)) return res.status(400).json({ error: 'Slug toko tidak valid' });
  const baseDomain = cleanBaseDomain(req.query.baseDomain);
  if (!baseDomain) return res.status(400).json({ error: 'Domain induk toko tidak valid' });
  const host = storeHost(slug, baseDomain);
  const result = await panelDomainClient.hostStatus(host);
  return res.status(200).json({
    slug,
    primaryDomain: host,
    liveUrl: `https://${host}`,
    dnsStatus: result.ok ? result.data?.status : 'unknown',
  });
});

/**
 * Custom domain endpoints used by src/services/domainService.ts.
 */
deployRouter.post('/domains/connect', async (req: Request, res: Response) => {
  const storeId = requireStoreId(req.body?.storeId);
  const host = cleanHost(req.body?.hostname);
  if (!storeId || !HOST_RE.test(host)) return res.status(400).json({ error: 'ID toko dan domain wajib valid' });
  if (host.endsWith(`.${PUBLIC_BASE_DOMAIN}`) || host === PUBLIC_BASE_DOMAIN) {
    return res.status(400).json({ error: `Gunakan domain milik Anda sendiri, bukan ${PUBLIC_BASE_DOMAIN}` });
  }
  if (!(await requireStoreManager(req, res, storeId))) return;
  const store = await findStoreById(storeId);
  if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan' });
  const result = await panelDomainClient.addHost(host);
  if (!result.ok) return res.status(400).json({ error: panelError(result, 'Domain belum bisa dihubungkan') });
  return res.status(200).json({ success: true, hostname: host });
});

deployRouter.post('/domains/disconnect', async (req: Request, res: Response) => {
  const storeId = requireStoreId(req.body?.storeId);
  const host = cleanHost(req.body?.hostname);
  if (!storeId || !HOST_RE.test(host)) return res.status(400).json({ error: 'ID toko dan domain wajib valid' });
  if (!(await requireStoreManager(req, res, storeId))) return;
  const store = await findStoreById(storeId);
  if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan' });
  const inUse = await hostInUse(host);
  if (inUse === null) return res.status(503).json({ error: 'Database toko tidak dapat dihubungi' });
  if (inUse) return res.status(409).json({ error: 'Domain masih dipakai toko' });
  const result = await panelDomainClient.removeHost(host);
  if (!result.ok) return res.status(502).json({ error: panelError(result, 'Domain gagal dilepas') });
  return res.status(200).json({ success: true });
});

deployRouter.get('/domains/status', async (req: Request, res: Response) => {
  const host = cleanHost(req.query.hostname);
  if (!HOST_RE.test(host)) return res.status(400).json({ error: 'Domain tidak valid' });
  const result = await panelDomainClient.hostStatus(host);
  if (!result.ok) return res.status(result.status === 404 ? 404 : 502).json({ connected: false });
  const status = String(result.data?.status || '');
  return res.status(200).json({ connected: status.startsWith('active'), hostname: host, status });
});
