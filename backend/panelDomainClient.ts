// Store hostnames are published through the Kroombox Panel API instead of touching nginx,
// sudo or Cloudflare from this app. The panel adds the host as an alias of this site
// (nginx vhost, tunnel ingress, DNS) and only accepts hosts under domains the account owns.
//
// Env:
//   KROOMBOX_PANEL_API_URL  default https://panel.kroombox.com/api
//   KROOMBOX_SITE_ID        this app's site id in the panel
//   KROOMBOX_PANEL_API_KEY  panel API key (kp_live_...) with scopes domains:write + domains:read only

const DEFAULT_PANEL_API_URL = 'https://panel.kroombox.com/api';
const REQUEST_TIMEOUT_MS = 20000;

export interface PanelResult {
  ok: boolean;
  status: number;
  message?: string;
  data?: any;
}

const panelConfig = () => ({
  baseUrl: (process.env.KROOMBOX_PANEL_API_URL || DEFAULT_PANEL_API_URL).replace(/\/+$/, ''),
  siteId: (process.env.KROOMBOX_SITE_ID || '').trim(),
  apiKey: (process.env.KROOMBOX_PANEL_API_KEY || '').trim(),
});

export const isPanelConfigured = (): boolean => {
  const { siteId, apiKey } = panelConfig();
  return Boolean(siteId && apiKey);
};

async function callPanel(method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<PanelResult> {
  const { baseUrl, siteId, apiKey } = panelConfig();
  if (!siteId || !apiKey) {
    return { ok: false, status: 503, message: 'Publikasi toko belum dikonfigurasi (API panel belum diatur).' };
  }
  try {
    const res = await fetch(`${baseUrl}/sites/${encodeURIComponent(siteId)}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, message: data?.message, data };
  } catch (err: any) {
    console.error('[panelDomainClient]', method, path, err?.message);
    return { ok: false, status: 502, message: 'Server panel tidak dapat dihubungi. Coba lagi beberapa saat.' };
  }
}

export const panelDomainClient = {
  // 409 "already added to this site" counts as success so publishing again is idempotent.
  async addHost(host: string): Promise<PanelResult> {
    const result = await callPanel('POST', '/custom-domains', { domain: host });
    if (!result.ok && result.status === 409 && /sudah ditambahkan ke site ini/i.test(result.message || '')) {
      return { ...result, ok: true };
    }
    return result;
  },

  // 404 means the host is already gone.
  async removeHost(host: string): Promise<PanelResult> {
    const result = await callPanel('DELETE', `/custom-domains/${encodeURIComponent(host)}`);
    return result.status === 404 ? { ...result, ok: true } : result;
  },

  // Parent domains the panel accepts hosts under for this site: { domains: [{ name, source }], customDomains, limits }.
  async allowedDomains(): Promise<PanelResult> {
    return callPanel('GET', '/custom-domains/allowed');
  },

  // DNS status of a host: active / active_a / not_propagated.
  async hostStatus(host: string): Promise<PanelResult> {
    return callPanel('GET', `/custom-domains/${encodeURIComponent(host)}/verify`);
  },
};
