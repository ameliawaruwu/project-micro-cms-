import { sessionHeaders } from './supabaseClient';

/** Domain yang boleh dipakai LapakQ menurut Kroombox Panel (API key LapakQ). */
export interface AllowedDomains {
  defaultDomain: string;
  domains: string[];
}

const readError = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => ({}));
  return { data, error: res.ok ? null : String(data?.error || fallback) };
};

let allowedCache: Promise<AllowedDomains> | null = null;

export const adminDomainService = {
  /** Daftar domain induk dari panel. Hanya super admin. */
  getAllowedDomains(force = false): Promise<AllowedDomains> {
    if (force || !allowedCache) {
      allowedCache = (async () => {
        const res = await fetch('/api/deploy/domains/allowed', { headers: sessionHeaders() });
        const { data, error } = await readError(res, 'Daftar domain panel tidak dapat diambil');
        if (error) throw new Error(error);
        return {
          defaultDomain: String(data.defaultDomain || 'lapakq.com'),
          domains: Array.isArray(data.domains) ? data.domains.map(String) : [],
        };
      })();
      allowedCache.catch(() => {
        allowedCache = null;
      });
    }
    return allowedCache;
  },

  /** Tetapkan (atau hapus, bila kosong) domain kustom toko; backend mendaftarkannya ke panel. */
  async setStoreDomain(storeId: string, hostname: string): Promise<{ hostname: string | null; warning?: string }> {
    const res = await fetch('/api/deploy/admin/store-domain', {
      method: 'POST',
      headers: sessionHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ storeId, hostname }),
    });
    const { data, error } = await readError(res, 'Gagal mengatur domain toko');
    if (error) throw new Error(error);
    return { hostname: data.hostname || null, warning: data.warning };
  },
};

/** Apakah host berada di bawah salah satu domain induk. */
export const isUnderDomain = (host: string, parents: string[]) =>
  parents.some((p) => host === p || host.endsWith(`.${p}`));
