import { Store } from '../types';
import { initialStores } from './mockData';
import { supabase } from './supabaseClient';

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
        if (s.id.startsWith('store-') && !updated.onboarding?.paymentConnected) {
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
    const localStores = this.getStoredStores().filter((s) => s.merchantId === userId);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId);
      if (!error && data && data.length > 0) {
        const mappedStores: Store[] = data.map((row) => ({
          id: row.id,
          merchantId: row.user_id,
          name: row.name,
          slug: row.slug,
          tagline: row.tagline || '',
          description: row.description || '',
          logoUrl: row.logo_url || '',
          bannerUrl: row.banner_url || '',
          phoneWhatsApp: row.phone_whatsapp || '',
          city: row.city || 'Indonesia',
          province: row.province,
          district: row.district,
          postalCode: row.postal_code,
          address: row.address || '',
          category: row.category || 'Bisnis UMKM',
          currency: 'IDR',
          balance: Number(row.balance || 0),
          plan: row.plan || 'free',
          layoutSettings: row.theme_settings,
          customDomain: row.custom_domain,
          onboarding: {
            storeNameSet: !row.name.startsWith('Toko usr_'),
            productUploaded: false,
            paymentConnected: row.plan !== 'free',
          },
          createdAt: row.created_at || new Date().toISOString(),
        }));
        const map = new Map<string, Store>();
        mappedStores.forEach((s) => map.set(s.id, s));
        localStores.forEach((s) => {
          if (!map.has(s.id)) map.set(s.id, s);
        });
        const combined = Array.from(map.values());
        const allOther = this.getStoredStores().filter((s) => s.merchantId !== userId);
        this.saveStores([...allOther, ...combined]);
        return combined;
      }
    } catch (e) {
      console.warn('Supabase fetch stores error:', e);
    }
    return localStores;
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

    // 2. Fuzzy match
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
      const userStores = await this.getStoresForUser(userId);
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

    // Sync to Supabase stores table
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.phoneWhatsApp !== undefined) dbUpdates.phone_whatsapp = updates.phoneWhatsApp;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
      if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
      if (updates.customDomain !== undefined) dbUpdates.custom_domain = updates.customDomain;
      if (updates.layoutSettings !== undefined) dbUpdates.theme_settings = updates.layoutSettings;
      await supabase.from('stores').update(dbUpdates).eq('id', storeId);
      console.log(`[Supabase Database] Toko ${storeId} berhasil diperbarui di cloud.`);
    } catch (err) {
      console.warn('Supabase store update notice:', err);
    }

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
      phoneWhatsApp: data.phoneWhatsApp || '',
      city: data.city || 'Indonesia',
      address: data.address || 'Pusat Usaha UMKM',
      category: data.category || 'Bisnis UMKM',
      currency: data.currency || 'IDR',
      balance: data.balance || 0,
      plan: data.plan || 'free',
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

    // Sync directly to Supabase
    try {
      await supabase.from('stores').upsert({
        id: newStore.id,
        user_id: newStore.merchantId,
        name: newStore.name,
        slug: newStore.slug,
        tagline: newStore.tagline,
        description: newStore.description,
        logo_url: newStore.logoUrl,
        banner_url: newStore.bannerUrl,
        phone_whatsapp: newStore.phoneWhatsApp,
        city: newStore.city || 'Indonesia',
        province: newStore.province,
        district: newStore.district,
        postal_code: newStore.postalCode,
        address: newStore.address,
        category: newStore.category,
        plan: newStore.plan || 'free',
        balance: newStore.balance || 0,
        theme_settings: newStore.layoutSettings || {},
        created_at: newStore.createdAt,
        updated_at: new Date().toISOString(),
      });
      console.log(`[Supabase Database] Toko ${newStore.name} (${newStore.id}) berhasil dibuat di cloud!`);
    } catch (err) {
      console.warn('Supabase create store warning:', err);
    }

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
