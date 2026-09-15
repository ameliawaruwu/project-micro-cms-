import { Integration } from '../types';
import { initialIntegrations } from './mockData';

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

      // Ensure key payment gateways are marked as connected
      const normalized = parsed.map((item) => {
        if ((item.id === 'int-midtrans' || item.id === 'int-qris' || item.id === 'int-stripe') && !item.isConnected) {
          modified = true;
          return {
            ...item,
            isConnected: true,
            statusText: 'Terhubung & Aktif',
          };
        }
        return item;
      });

      if (modified) {
        this.saveIntegrations(normalized);
      }
      return normalized;
    } catch {
      return initialIntegrations;
    }
  }

  private saveIntegrations(integrations: Integration[]) {
    localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(integrations));
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
