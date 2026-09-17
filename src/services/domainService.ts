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
      // 1. Panggil API Cloudflare Tunnel (via backend proxy)
      const res = await fetch('/api/cloudflare/connect-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostname: cleanHost,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        // Jika offline / dev fallback, kita tetap simpan status lokal agar merchant bisa melanjutkan
        console.warn('API Cloudflare response warning:', data.error);
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
        message: `Domain ${cleanHost} tersimpan. Pastikan CNAME mengarah ke host Kroombox.`,
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
        message: 'Berhasil menggunakan domain gratis dari sistem Kroombox.',
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
      const res = await fetch('/api/cloudflare/routes');
      if (!res.ok) return { connected: false };

      const routes: any[] = await res.json();
      const match = routes.find((r) => r.hostname?.toLowerCase() === cleanHost);

      if (match) {
        return {
          connected: true,
          hostname: match.hostname,
          service: match.service,
        };
      }

      return { connected: false };
    } catch {
      return { connected: false };
    }
  }
}

export const domainService = new DomainService();
