import { Router, Request, Response } from 'express';
import { panelDomainClient, PanelResult } from './panelDomainClient';
import { pool } from './publicApiController';
import { isPlatformAdmin, requireAdmin, requireStoreManager } from './sessionAuth';

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
  community_id?: string | null;
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

const STORE_COLUMNS = 'id, slug, is_published, is_suspended, custom_domain, community_id';

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
      `${url}/rest/v1/stores?select=id,slug,is_published,is_suspended,custom_domain,community_id&${filter}`,
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

// A store's hosts live under lapakq.com or, for a community store, the domain the admin set on
// its community. The client sends baseDomain, but only these two are accepted for the store.
async function storeBaseDomainAllowed(store: StoreRow, baseDomain: string): Promise<boolean | null> {
  if (baseDomain === PUBLIC_BASE_DOMAIN) return true;
  if (!store.community_id || !process.env.DATABASE_URL) return store.community_id ? null : false;
  try {
    const result = await pool.query(
      `SELECT 1 FROM public.communities
        WHERE id = $1 AND lower(base_domain) = $2 AND coalesce(status, 'active') <> 'inactive' LIMIT 1`,
      [store.community_id, baseDomain]
    );
    return result.rows.length > 0;
  } catch (err: any) {
    console.error('[deploy] community query error:', err?.message);
    return null;
  }
}

const BASE_DOMAIN_REFUSED = 'Domain induk ini tidak berlaku untuk toko Anda.';

// The store's custom domain is set by the super admin (stores.custom_domain, guarded in the
// database); merchants can only connect the one assigned to their store.
const assignedCustomDomain = (store: StoreRow) => cleanHost(store.custom_domain);
const CUSTOM_DOMAIN_NOT_ASSIGNED = 'Domain kustom ditetapkan oleh admin LapakQ. Hubungi admin untuk memakai domain sendiri.';

// Parent domains the panel accepts for this app, as plain names.
async function panelAllowedDomains(): Promise<{ names: string[] } | { error: PanelResult }> {
  const result = await panelDomainClient.allowedDomains();
  if (!result.ok) return { error: result };
  const names = (Array.isArray(result.data?.domains) ? result.data.domains : [])
    .map((d: any) => cleanHost(d?.name))
    .filter((n: string) => HOST_RE.test(n));
  return { names: [...new Set<string>(names)] };
}

const underParent = (host: string, parents: string[]) =>
  parents.some((p) => host === p || host.endsWith(`.${p}`));

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
    const baseAllowed = await storeBaseDomainAllowed(store, baseDomain);
    if (baseAllowed === null) return res.status(503).json({ error: 'Database toko tidak dapat dihubungi' });
    if (!baseAllowed) return res.status(403).json({ error: BASE_DOMAIN_REFUSED });

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
      } else if (customHost !== assignedCustomDomain(store)) {
        stages.push({ name: 'Domain Kustom', status: 'failed', detail: CUSTOM_DOMAIN_NOT_ASSIGNED });
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
    const baseAllowed = await storeBaseDomainAllowed(store, baseDomain);
    if (baseAllowed === null) return res.status(503).json({ error: 'Database toko tidak dapat dihubungi' });
    if (!baseAllowed) return res.status(403).json({ error: BASE_DOMAIN_REFUSED });

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
  const user = await requireStoreManager(req, res, storeId);
  if (!user) return;
  const store = await findStoreById(storeId);
  if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan' });
  if (!isPlatformAdmin(user) && host !== assignedCustomDomain(store)) {
    return res.status(403).json({ error: CUSTOM_DOMAIN_NOT_ASSIGNED });
  }
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

/**
 * GET /api/deploy/domains/allowed (super admin)
 * Parent domains the Kroombox Panel accepts for this app's API key. The admin picks community
 * domains and store custom domains from this list only, so every choice can actually go live.
 */
deployRouter.get('/domains/allowed', async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;
  const allowed = await panelAllowedDomains();
  if ('error' in allowed) {
    return res.status(502).json({ error: panelError(allowed.error, 'Daftar domain panel tidak dapat diambil') });
  }
  return res.status(200).json({ defaultDomain: PUBLIC_BASE_DOMAIN, domains: allowed.names });
});

/**
 * POST /api/deploy/admin/store-domain  { storeId, hostname }  (super admin)
 * Assigns a custom domain to a store (e.g. a merchant's own domain after they contacted the admin),
 * registers it with the panel, and releases the previous one. An empty hostname removes it.
 */
deployRouter.post('/admin/store-domain', async (req: Request, res: Response) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const storeId = requireStoreId(req.body?.storeId);
    const host = cleanHost(req.body?.hostname);
    if (!storeId) return res.status(400).json({ error: 'ID toko wajib diisi' });
    if (host && !HOST_RE.test(host)) return res.status(400).json({ error: 'Format domain tidak valid' });
    if (host && (host === PUBLIC_BASE_DOMAIN || host.endsWith(`.${PUBLIC_BASE_DOMAIN}`))) {
      return res.status(400).json({ error: `Alamat .${PUBLIC_BASE_DOMAIN} sudah otomatis dari slug toko` });
    }
    if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database toko tidak dapat dihubungi' });

    const store = await findStoreById(storeId);
    if (!store) return res.status(404).json({ error: 'Toko tidak ditemukan' });
    const previous = assignedCustomDomain(store);
    if (host === previous) return res.status(200).json({ success: true, hostname: host || null });

    if (host) {
      const allowed = await panelAllowedDomains();
      if ('error' in allowed) {
        return res.status(502).json({ error: panelError(allowed.error, 'Daftar domain panel tidak dapat diambil') });
      }
      if (!underParent(host, allowed.names)) {
        return res.status(400).json({
          error: `Domain ${host} belum terdaftar di Kroombox Panel untuk LapakQ. Tambahkan domainnya di panel dulu.`,
        });
      }
      // <name>.<community domain> is a community store's slug address; never hand it out as a custom domain.
      const bases = await pool.query(
        "SELECT DISTINCT lower(base_domain) AS base FROM public.communities WHERE coalesce(base_domain, '') <> ''"
      );
      const slugHostOf = bases.rows
        .map((r: { base: string }) => r.base)
        .find((base: string) => host.endsWith(`.${base}`) && !host.slice(0, -(base.length + 1)).includes('.'));
      if (slugHostOf) {
        return res.status(400).json({
          error: `Alamat langsung di bawah ${slugHostOf} dipakai untuk toko komunitas. Pakai domain lain atau sub-subdomain.`,
        });
      }
      const taken = await pool.query(
        'SELECT 1 FROM public.stores WHERE lower(custom_domain) = $1 AND id <> $2 LIMIT 1',
        [host, storeId]
      );
      if (taken.rows.length) return res.status(409).json({ error: 'Domain sudah dipakai toko lain' });
      const added = await panelDomainClient.addHost(host);
      if (!added.ok) return res.status(400).json({ error: panelError(added, 'Domain belum bisa dihubungkan') });
    }

    await pool.query('UPDATE public.stores SET custom_domain = $1, updated_at = now() WHERE id = $2', [host || null, storeId]);

    let warning: string | undefined;
    if (previous && HOST_RE.test(previous) && !(await hostInUse(previous))) {
      const removed = await panelDomainClient.removeHost(previous);
      if (!removed.ok) warning = `Domain lama ${previous} belum terlepas dari panel: ${panelError(removed, 'gagal dilepas')}`;
    }
    console.log(`[Deploy] Store ${storeId} custom domain: ${previous || '-'} -> ${host || '-'}`);
    return res.status(200).json({ success: true, hostname: host || null, warning });
  } catch (err: any) {
    console.error('[Deploy] admin store-domain error:', err?.message);
    return res.status(500).json({ error: 'Gagal mengatur domain toko' });
  }
});
