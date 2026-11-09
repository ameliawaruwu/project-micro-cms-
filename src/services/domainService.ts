import { storeService } from './storeService';
import { supabase } from './supabaseClient';

export interface DomainConnectResult {
  success: boolean;
  message: string;
  hostname?: string;
  error?: string;
}

export interface DomainCheckResult {
  connected: boolean;
  hostname?: string;
  service?: string;
}

class DomainService {
  /**
   * Daftarkan custom domain ke Cloudflare Tunnel dan update data toko
   */
  async connectCustomDomain(storeId: string, rawDomain: string): Promise<DomainConnectResult> {
    if (!rawDomain || !rawDomain.trim()) {
      return { success: false, message: 'Nama domain tidak boleh kosong' };
    }

    const cleanHost = rawDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '');

    // Validasi format domain sederhana (contoh: toko.com atau www.toko.id)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(cleanHost)) {
      return {
        success: false,
        message: 'Format domain tidak valid. Contoh yang benar: namatoko.com atau www.namatoko.id',
      };
    }

    try {
      // 1. Daftarkan domain ke Kroombox Panel (lewat backend toko)
      const res = await fetch('/api/deploy/domains/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          hostname: cleanHost,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        return {
          success: false,
          message: data.error || 'Domain belum bisa dihubungkan. Coba lagi beberapa saat.',
        };
      }

      // 2. Simpan ke local StoreService
      await storeService.updateStore(storeId, {
        customDomain: cleanHost,
        domainType: 'custom',
        domainStatus: 'connected',
      });

      // 3. Simpan ke Supabase jika tabel stores mendukung
      try {
        await supabase
          .from('stores')
          .update({
            custom_domain: cleanHost,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', storeId);
      } catch (dbErr) {
        console.warn('Supabase store domain update notice:', dbErr);
      }

      return {
        success: true,
        message: `Domain ${cleanHost} berhasil didaftarkan ke Cloudflare Tunnel dan disimpan.`,
        hostname: cleanHost,
      };
    } catch (err: any) {
      console.error('Error connecting custom domain:', err);

      // Fallback: simpan konfigurasi di lokal agar merchant tetap bisa setup
      await storeService.updateStore(storeId, {
        customDomain: cleanHost,
        domainType: 'custom',
        domainStatus: 'pending',
      });

      return {
        success: true,
        message: `Domain ${cleanHost} tersimpan. Pastikan CNAME mengarah ke host LapakQ.`,
        hostname: cleanHost,
      };
    }
  }

  /**
   * Aktifkan kembali subdomain bawaan (Random domain gratis)
   */
  async useRandomDomain(storeId: string): Promise<DomainConnectResult> {
    try {
      await storeService.updateStore(storeId, {
        domainType: 'random',
        domainStatus: 'connected',
      });

      try {
        await supabase
          .from('stores')
          .update({
            custom_domain: null,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', storeId);
      } catch (dbErr) {
        console.warn('Supabase store random domain update notice:', dbErr);
      }

      return {
        success: true,
        message: 'Berhasil menggunakan domain gratis dari sistem LapakQ.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Gagal mengubah pilihan domain.',
      };
    }
  }

  /**
   * Cek apakah custom domain sudah ada di daftar rute Cloudflare Tunnel
   */
  async checkDomainStatus(hostname: string): Promise<DomainCheckResult> {
    const cleanHost = hostname.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    try {
      const res = await fetch(`/api/deploy/domains/status?hostname=${encodeURIComponent(cleanHost)}`);
      if (!res.ok) return { connected: false };

      const data = await res.json();
      return data.connected ? { connected: true, hostname: cleanHost } : { connected: false };
    } catch {
      return { connected: false };
    }
  }

  /**
   * Putuskan/Hapus custom domain dari Cloudflare Tunnel dan kembalikan ke random subdomain
   */
  async disconnectCustomDomain(storeId: string, hostname: string): Promise<DomainConnectResult> {
    const cleanHost = hostname.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
    try {
      // 1. Update storeService
      await storeService.updateStore(storeId, {
        customDomain: undefined,
        domainType: 'random',
        domainStatus: 'connected',
      });

      // 2. Update Supabase
      try {
        await supabase
          .from('stores')
          .update({
            custom_domain: null,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', storeId);
      } catch (dbErr) {
        console.warn('Supabase store disconnect notice:', dbErr);
      }

      // 3. Lepas domain dari Kroombox Panel. WHY: server hanya melepas domain yang tidak lagi dipakai toko.
      const releaseRes = await fetch('/api/deploy/domains/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId,
          hostname: cleanHost,
        }),
      });
      if (!releaseRes.ok) console.warn('Release custom domain notice:', releaseRes.status);

      return {
        success: true,
        message: `Domain ${cleanHost} berhasil diputuskan. Toko kini menggunakan domain sistem kembali.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Gagal memutuskan custom domain.',
      };
    }
  }

}

export const domainService = new DomainService();
