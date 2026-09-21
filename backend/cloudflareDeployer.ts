import dotenv from 'dotenv';
dotenv.config();

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

export interface CloudflareDeployResult {
  success: boolean;
  zoneId?: string;
  dnsRecordId?: string;
  ingressUpdated: boolean;
  fullDomain: string;
  error?: string;
}

export class CloudflareDeployer {
  private accountId: string;
  private apiToken: string;
  private tunnelId: string;
  private tunnelServiceUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || 'a94ba01f6e4e47e7710894afa6f3a7b7';
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.tunnelId = process.env.CLOUDFLARE_TUNNEL_ID || '19956650-74b4-4479-9c22-79da749256da';
    this.tunnelServiceUrl = process.env.TUNNEL_SERVICE_URL || 'http://localhost:8080';
  }

  private async cfRequest(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${CF_API_BASE}${path}`;
    const headers = {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const res = await fetch(url, { ...options, headers });
    const raw = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (!res.ok || data?.success === false) {
      const msg = data?.errors?.[0]?.message || data?.message || res.statusText || 'Cloudflare API Error';
      throw new Error(`[Cloudflare ${res.status}] ${msg}`);
    }

    return data?.result;
  }

  /**
   * Cari Zone ID Cloudflare yang cocok dengan domain (misal kroombox.com)
   */
  async getZoneForHostname(hostname: string): Promise<{ id: string; name: string } | null> {
    const host = hostname.toLowerCase().trim();
    const zones = await this.cfRequest('/zones?per_page=50');
    if (!Array.isArray(zones)) return null;

    const matches = zones.filter((z) => {
      const name = String(z?.name || '').toLowerCase();
      return host === name || host.endsWith(`.${name}`);
    });

    if (matches.length === 0) return null;
    // Pilih zona yang paling spesifik (nama terpanjang)
    return matches.sort((a, b) => b.name.length - a.name.length)[0];
  }

  /**
   * Tambah atau perbarui DNS CNAME record di Cloudflare
   */
  async ensureDnsRecord(zoneId: string, hostname: string): Promise<string> {
    const target = `${this.tunnelId}.cfargotunnel.com`;
    const cleanHost = hostname.toLowerCase().trim();

    const list = await this.cfRequest(
      `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(cleanHost)}`
    );

    const existing = Array.isArray(list) ? list[0] : null;
    if (existing?.id) {
      await this.cfRequest(`/zones/${zoneId}/dns_records/${existing.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          type: 'CNAME',
          name: cleanHost,
          content: target,
          proxied: true,
        }),
      });
      return existing.id;
    }

    const created = await this.cfRequest(`/zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'CNAME',
        name: cleanHost,
        content: target,
        proxied: true,
      }),
    });

    return created?.id;
  }

  /**
   * Tambah Ingress Rule ke Cloudflare Tunnel
   */
  async ensureTunnelIngress(hostname: string): Promise<boolean> {
    const cleanHost = hostname.toLowerCase().trim();
    const configRes = await this.cfRequest(
      `/accounts/${this.accountId}/cfd_tunnel/${encodeURIComponent(this.tunnelId)}/configurations`
    );

    const currentConfig = configRes?.config || {};
    const existingIngress: Array<{ hostname?: string; service: string }> = Array.isArray(currentConfig.ingress)
      ? currentConfig.ingress
      : [];

    const newRule = { hostname: cleanHost, service: this.tunnelServiceUrl };
    const ruleExists = existingIngress.some((r) => r.hostname?.toLowerCase() === cleanHost);

    let updatedIngress: Array<{ hostname?: string; service: string }>;
    if (ruleExists) {
      updatedIngress = existingIngress.map((r) =>
        r.hostname?.toLowerCase() === cleanHost ? newRule : r
      );
    } else {
      const catchAll = existingIngress.find((r) => !r.hostname);
      const others = existingIngress.filter((r) => r.hostname);
      updatedIngress = catchAll ? [...others, newRule, catchAll] : [...others, newRule, { service: 'http_status:404' }];
    }

    await this.cfRequest(
      `/accounts/${this.accountId}/cfd_tunnel/${encodeURIComponent(this.tunnelId)}/configurations`,
      {
        method: 'PUT',
        body: JSON.stringify({
          config: {
            ...currentConfig,
            ingress: updatedIngress,
          },
        }),
      }
    );

    return true;
  }

  /**
   * Eksekusi alur penuh pendaftaran Cloudflare (DNS + Ingress)
   */
  async deployHostname(hostname: string): Promise<CloudflareDeployResult> {
    const cleanHost = hostname.toLowerCase().trim();
    try {
      const zone = await this.getZoneForHostname(cleanHost);
      let dnsRecordId: string | undefined;

      if (zone?.id) {
        dnsRecordId = await this.ensureDnsRecord(zone.id, cleanHost);
      } else {
        console.warn(`[CloudflareDeployer] Zona tidak ditemukan untuk ${cleanHost}, hanya mengupdate Ingress.`);
      }

      await this.ensureTunnelIngress(cleanHost);

      return {
        success: true,
        zoneId: zone?.id,
        dnsRecordId,
        ingressUpdated: true,
        fullDomain: cleanHost,
      };
    } catch (err: any) {
      console.error('[CloudflareDeployer] Deploy Error:', err);
      return {
        success: false,
        ingressUpdated: false,
        fullDomain: cleanHost,
        error: err.message || 'Gagal mendaftarkan domain ke Cloudflare Tunnel',
      };
    }
  }

  /**
   * Hapus Ingress Rule & DNS Record saat toko di-unpublish
   */
  async removeHostname(hostname: string): Promise<boolean> {
    const cleanHost = hostname.toLowerCase().trim();
    try {
      const zone = await this.getZoneForHostname(cleanHost);
      if (zone?.id) {
        const list = await this.cfRequest(
          `/zones/${zone.id}/dns_records?type=CNAME&name=${encodeURIComponent(cleanHost)}`
        );
        if (Array.isArray(list) && list[0]?.id) {
          await this.cfRequest(`/zones/${zone.id}/dns_records/${list[0].id}`, {
            method: 'DELETE',
          });
        }
      }

      // Hapus dari Ingress
      const configRes = await this.cfRequest(
        `/accounts/${this.accountId}/cfd_tunnel/${encodeURIComponent(this.tunnelId)}/configurations`
      );
      const currentConfig = configRes?.config || {};
      const ingress: Array<{ hostname?: string; service: string }> = Array.isArray(currentConfig.ingress)
        ? currentConfig.ingress
        : [];

      const filteredIngress = ingress.filter((r) => r.hostname?.toLowerCase() !== cleanHost);

      await this.cfRequest(
        `/accounts/${this.accountId}/cfd_tunnel/${encodeURIComponent(this.tunnelId)}/configurations`,
        {
          method: 'PUT',
          body: JSON.stringify({
            config: {
              ...currentConfig,
              ingress: filteredIngress,
            },
          }),
        }
      );

      return true;
    } catch (err) {
      console.warn('[CloudflareDeployer] Remove Hostname Error:', err);
      return false;
    }
  }

  /**
   * Dapatkan seluruh rute aktif di tunnel
   */
  async getTunnelRoutes(): Promise<Array<{ hostname?: string; service: string }>> {
    try {
      const configRes = await this.cfRequest(
        `/accounts/${this.accountId}/cfd_tunnel/${encodeURIComponent(this.tunnelId)}/configurations`
      );
      return configRes?.config?.ingress || [];
    } catch {
      return [];
    }
  }
}

export const cloudflareDeployer = new CloudflareDeployer();
