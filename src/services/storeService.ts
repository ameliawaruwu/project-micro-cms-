import { Store } from '../types';
import { initialStores } from './mockData';

const STORE_KEY = 'microcms_stores_v2';
const ACTIVE_STORE_KEY = 'microcms_active_store_id';

class StoreService {
  private getStoredStores(): Store[] {
    const data = localStorage.getItem(STORE_KEY);
    if (!data) {
      localStorage.setItem(STORE_KEY, JSON.stringify(initialStores));
      return initialStores;
    }
    try {
      const parsed: Store[] = JSON.parse(data);
      const storeMap = new Map<string, Store>();
      parsed.forEach((s) => {
        if (s && s.id) {
          storeMap.set(s.id, s);
        }
      });

      let modified = false;
      // Merge any missing initial stores
      initialStores.forEach((defStore) => {
        if (!storeMap.has(defStore.id)) {
          storeMap.set(defStore.id, defStore);
          modified = true;
        }
      });

      // Ensure demo stores have distinct merchant IDs and paymentConnected is true
      const normalized = Array.from(storeMap.values()).map((s) => {
        let changed = false;
        let updated = { ...s };

        if (s.id === 'store-andhika' && s.merchantId !== 'usr-andhika-01') {
          updated.merchantId = 'usr-andhika-01';
          changed = true;
        }
        if (s.id === 'store-1' && s.merchantId !== 'usr-kirana-01') {
          updated.merchantId = 'usr-kirana-01';
          changed = true;
        }
        if (s.id === 'store-2' && s.merchantId !== 'usr-barista-01') {
          updated.merchantId = 'usr-barista-01';
          changed = true;
        }
        if (s.id === 'store-3' && s.merchantId !== 'usr-artisan-01') {
          updated.merchantId = 'usr-artisan-01';
          changed = true;
        }
        if (!updated.onboarding?.paymentConnected) {
          updated.onboarding = {
            ...updated.onboarding,
            storeNameSet: true,
            productUploaded: true,
            paymentConnected: true,
          };
          changed = true;
        }
        if (changed) modified = true;
        return updated;
      });

      if (modified || normalized.length !== parsed.length) {
        this.saveStores(normalized);
      }
      return normalized;
    } catch {
      return initialStores;
    }
  }

  private saveStores(stores: Store[]) {
    const uniqueMap = new Map<string, Store>();
    stores.forEach((s) => {
      if (s && s.id) {
        uniqueMap.set(s.id, s);
      }
    });
    localStorage.setItem(STORE_KEY, JSON.stringify(Array.from(uniqueMap.values())));
  }

  async getStores(): Promise<Store[]> {
    return this.getStoredStores();
  }

  async getStoresForUser(userId: string): Promise<Store[]> {
    const stores = this.getStoredStores();
    return stores.filter((s) => s.merchantId === userId);
  }

  async getStoreById(id: string): Promise<Store | undefined> {
    const stores = this.getStoredStores();
    return stores.find((s) => s.id === id);
  }

  async getStoreBySlug(slug: string): Promise<Store> {
    const stores = this.getStoredStores();
    if (!slug) return stores[0] || initialStores[0];

    const clean = slug.toLowerCase().trim();
    // 1. Exact slug or ID match
    const exact = stores.find((s) => s.slug?.toLowerCase() === clean || s.id?.toLowerCase() === clean);
    if (exact) return exact;

    // 2. Fuzzy match (e.g. 'toko-andhikagonzales' vs 'store-andhika' or 'toko-andhika')
    const fuzzy = stores.find((s) => {
      const sSlug = (s.slug || '').toLowerCase();
      const sId = (s.id || '').toLowerCase();
      const sName = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSimple = clean.replace(/[^a-z0-9]/g, '');
      return (
        sSlug.includes(clean) ||
        clean.includes(sSlug) ||
        sId.includes(clean) ||
        clean.includes(sId) ||
        sName.includes(cleanSimple) ||
        cleanSimple.includes(sName)
      );
    });

    return fuzzy || stores[0] || initialStores[0];
  }

  async getActiveStore(userId?: string): Promise<Store | undefined> {
    const stores = this.getStoredStores();
    if (userId) {
      const userStores = stores.filter((s) => s.merchantId === userId);
      if (userStores.length === 0) return undefined;
      const activeId = localStorage.getItem(ACTIVE_STORE_KEY);
      return userStores.find((s) => s.id === activeId) || userStores[0];
    }
    const activeId = localStorage.getItem(ACTIVE_STORE_KEY);
    const found = stores.find((s) => s.id === activeId);
    if (found) return found;
    return stores[0];
  }

  async setActiveStore(storeId: string): Promise<Store> {
    localStorage.setItem(ACTIVE_STORE_KEY, storeId);
    const store = await this.getStoreById(storeId);
    if (!store) throw new Error('Toko tidak ditemukan');
    return store;
  }

  async updateStore(storeId: string, updates: Partial<Store>): Promise<Store> {
    const stores = this.getStoredStores();
    const index = stores.findIndex((s) => s.id === storeId);
    if (index === -1) throw new Error('Toko tidak ditemukan');

    stores[index] = {
      ...stores[index],
      ...updates,
    };
    this.saveStores(stores);
    return stores[index];
  }

  async createStore(data: Partial<Store>): Promise<Store> {
    const stores = this.getStoredStores();
    
    // Check if store with same ID already exists
    if (data.id) {
      const existing = stores.find((s) => s.id === data.id);
      if (existing) {
        return existing;
      }
    }

    const name = data.name || 'Toko Baru UMKM';
    const slug = data.slug || `toko-${Date.now()}`;

    const newStore: Store = {
      id: data.id || `store-${Date.now()}`,
      merchantId: data.merchantId || 'usr-default',
      name,
      slug,
      tagline: data.tagline || `Toko Resmi ${name}`,
      description: data.description || 'Katalog online dan pemesanan praktis via WhatsApp.',
      logoUrl: data.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FFD358&color=002A45&bold=true`,
      bannerUrl: data.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      phoneWhatsApp: data.phoneWhatsApp || '081234567890',
      city: data.city || 'Indonesia',
      address: data.address || 'Pusat Usaha UMKM',
      category: data.category || 'Bisnis UMKM',
      currency: data.currency || 'IDR',
      balance: data.balance || 0,
      onboarding: data.onboarding || {
        storeNameSet: true,
        productUploaded: false,
        paymentConnected: false,
      },
      createdAt: data.createdAt || new Date().toISOString(),
    };

    stores.push(newStore);
    this.saveStores(stores);
    localStorage.setItem(ACTIVE_STORE_KEY, newStore.id);
    return newStore;
  }

  async withdrawBalance(storeId: string, amount: number): Promise<{ newBalance: number }> {
    const store = await this.getStoreById(storeId);
    if (!store) throw new Error('Toko tidak ditemukan');
    if (store.balance < amount) throw new Error('Saldo tidak mencukupi untuk penarikan');

    const newBalance = store.balance - amount;
    await this.updateStore(storeId, { balance: newBalance });
    return { newBalance };
  }
}

export const storeService = new StoreService();
