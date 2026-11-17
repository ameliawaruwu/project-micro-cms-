import { Integration } from '../types';
import { initialIntegrations } from './mockData';
import { supabase } from './supabaseClient';

/** Kurir reguler yang bisa diaktifkan merchant; harus sama dengan STORE_COURIER_CODES di backend. */
export const STORE_COURIER_PROVIDERS = ['jnt', 'jne', 'sicepat', 'anteraja'] as const;

const INTEGRATIONS_KEY = 'microcms_integrations_v1';

class IntegrationService {
  private getStoredIntegrations(): Integration[] {
    const data = localStorage.getItem(INTEGRATIONS_KEY);
    if (!data) {
      localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(initialIntegrations));
      return initialIntegrations;
    }
    try {
      const parsed: Integration[] = JSON.parse(data);
      const existingIds = new Set(parsed.map((i) => i.id));
      let modified = false;

      initialIntegrations.forEach((i) => {
        if (!existingIds.has(i.id)) {
          parsed.push(i);
          modified = true;
        }
      });

      if (modified) {
        this.saveIntegrations(parsed);
      }
      return parsed;
    } catch {
      return initialIntegrations;
    }
  }

  private saveIntegrations(integrations: Integration[]) {
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('microcms_integrations_updated', { detail: integrations }));
      try {
        const bc = new BroadcastChannel('microcms_integrations_channel');
        bc.postMessage({ type: 'integrations_updated', integrations });
        bc.close();
      } catch {
        // ignore
      }
    }
  }

  async getIntegrations(): Promise<Integration[]> {
    return this.getStoredIntegrations();
  }

  async getPaymentIntegrations(): Promise<Integration[]> {
    const all = this.getStoredIntegrations();
    return all.filter((i) => i.type === 'payment');
  }

  async getShippingIntegrations(): Promise<Integration[]> {
    const all = this.getStoredIntegrations();
    return all.filter((i) => i.type === 'shipping');
  }

  /**
   * Kurir aktif toko yang tersimpan di database (`stores.shipping_couriers`), dipakai server untuk
   * tarif checkout dan daftar kurir Atur Pengiriman. `null` = belum pernah diatur.
   */
  async getStoreCouriers(storeId: string): Promise<string[] | null> {
    const { data, error } = await supabase.from('stores').select('shipping_couriers').eq('id', storeId).maybeSingle();
    if (error) throw error;
    const raw = (data as { shipping_couriers?: unknown } | null)?.shipping_couriers;
    return Array.isArray(raw) ? raw.map((c) => String(c).toLowerCase()) : null;
  }

  /** Simpan kurir aktif toko (hanya kode yang dikenal). */
  async saveStoreCouriers(storeId: string, providers: string[]): Promise<void> {
    const allowed = new Set<string>(STORE_COURIER_PROVIDERS);
    const codes = Array.from(new Set(providers.map((p) => p.toLowerCase()))).filter((p) => allowed.has(p));
    const { error } = await supabase.from('stores').update({ shipping_couriers: codes }).eq('id', storeId);
    if (error) throw error;
  }

  async toggleIntegration(id: string): Promise<Integration> {
    const integrations = this.getStoredIntegrations();
    const index = integrations.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Integrasi tidak ditemukan');

    const newConnected = !integrations[index].isConnected;
    integrations[index] = {
      ...integrations[index],
      isConnected: newConnected,
      statusText: newConnected ? 'Terhubung & Aktif' : 'Belum terhubung',
    };
    this.saveIntegrations(integrations);
    return integrations[index];
  }

  async updateIntegrationConfig(id: string, config: Record<string, any>): Promise<Integration> {
    const integrations = this.getStoredIntegrations();
    const index = integrations.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Integrasi tidak ditemukan');

    integrations[index] = {
      ...integrations[index],
      isConnected: true,
      statusText: 'Terhubung & Aktif',
      config: {
        ...integrations[index].config,
        ...config,
      },
    };
    this.saveIntegrations(integrations);
    return integrations[index];
  }
}

export const integrationService = new IntegrationService();
