import { Store } from '../types';
import { initialStores } from './mockData';
import { supabase } from './supabaseClient';
import { getWibIsoString } from '../utils/formatters';

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
      let modified = false;

      // Filter out auto-generated legacy stores so merchants start fresh without a store
      parsed.forEach((s) => {
        if (s && s.id) {
          const isLegacyAuto =
            !s.id.startsWith('store-') &&
            s.slug &&
            (s.slug.startsWith('toko-amelia') ||
              s.slug.startsWith('toko-usr_') ||
              s.name.startsWith('Toko usr_') ||
              s.description === 'Pusat belanja produk berkualitas dengan pemesanan mudah dan cepat.' ||
              (s.description === 'Katalog online dan pemesanan praktis via WhatsApp.' && s.balance === 0));

          if (isLegacyAuto) {
            modified = true;
            if (localStorage.getItem(ACTIVE_STORE_KEY) === s.id) {
              localStorage.removeItem(ACTIVE_STORE_KEY);
            }
            return;
          }
          storeMap.set(s.id, s);
        }
      });

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
        // Set demo stores to published, and others to false if undefined
        const isLegacyDemoStore = ['store-1', 'store-2', 'store-3', 'store-4'].includes(s.id);
        if (isLegacyDemoStore && updated.isPublished === undefined) {
          updated.isPublished = true;
          changed = true;
        } else if (updated.isPublished === undefined) {
          updated.isPublished = false;
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
          province: row.province || '',
          district: row.district || '',
          subdistrict: row.subdistrict || '',
          village: row.village || '',
          addressDetail: row.address_detail || '',
          postalCode: row.postal_code || '',
          address: row.address || '',
          latitude: row.latitude ? Number(row.latitude) : undefined,
          longitude: row.longitude ? Number(row.longitude) : undefined,
          category: row.category || 'Bisnis UMKM',
          currency: 'IDR',
          balance: Number(row.balance || 0),
          plan: row.plan || 'free',
          planExpiresAt: row.plan_expires_at || row.theme_settings?.planExpiresAt || undefined,
          planSubscribedAt: row.plan_subscribed_at || row.theme_settings?.planSubscribedAt || undefined,
          isPublished: row.is_published !== undefined ? Boolean(row.is_published) : Boolean(row.theme_settings?.isPublished),
          layoutSettings: row.theme_settings,
          customDomain: row.custom_domain,
          onboarding: {
            storeNameSet: !row.name.startsWith('Toko usr_'),
            productUploaded: false,
            paymentConnected: row.plan !== 'free',
          },
          createdAt: row.created_at || new Date().toISOString(),
        }));
        const validMapped = mappedStores;

        const map = new Map<string, Store>();
        validMapped.forEach((s) => map.set(s.id, s));
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
    if (!slug) {
      const stores = this.getStoredStores();
      return stores[0] || initialStores[0];
    }

    const clean = slug.toLowerCase().trim();

    // 1. Fetch live from Supabase cloud so status is 100% synchronized across devices/browsers
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .or(`slug.ilike.${clean},id.eq.${clean}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const isPub = row.is_published !== undefined
          ? Boolean(row.is_published)
          : Boolean(row.theme_settings?.isPublished);

        const mappedStore: Store = {
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
          province: row.province || '',
          district: row.district || '',
          subdistrict: row.subdistrict || '',
          village: row.village || '',
          addressDetail: row.address_detail || '',
          postalCode: row.postal_code || '',
          address: row.address || '',
          latitude: row.latitude ? Number(row.latitude) : undefined,
          longitude: row.longitude ? Number(row.longitude) : undefined,
          category: row.category || 'Bisnis UMKM',
          currency: 'IDR',
          balance: Number(row.balance || 0),
          plan: row.plan || 'free',
          isPublished: isPub,
          layoutSettings: row.theme_settings,
          customDomain: row.custom_domain,
          createdAt: row.created_at || new Date().toISOString(),
          onboarding: row.theme_settings?.onboarding || {},
        };

        const stored = this.getStoredStores();
        const existingIdx = stored.findIndex((s) => s.id === mappedStore.id);
        if (existingIdx !== -1) {
          stored[existingIdx] = { ...stored[existingIdx], ...mappedStore };
        } else {
          stored.push(mappedStore);
        }
        this.saveStores(stored);
        return mappedStore;
      }
    } catch (err) {
      console.warn('Supabase getStoreBySlug notice:', err);
    }

    // 2. Fallback to local stored stores
    const stores = this.getStoredStores();
    const exact = stores.find((s) => s.slug?.toLowerCase() === clean || s.id?.toLowerCase() === clean);
    if (exact) return exact;

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
      const dbUpdates: any = { updated_at: getWibIsoString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.province !== undefined) dbUpdates.province = updates.province;
      if (updates.district !== undefined) dbUpdates.district = updates.district;
      if (updates.subdistrict !== undefined) dbUpdates.subdistrict = updates.subdistrict;
      if (updates.village !== undefined) dbUpdates.village = updates.village;
      if (updates.addressDetail !== undefined) dbUpdates.address_detail = updates.addressDetail;
      if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode;
      if (updates.address !== undefined) dbUpdates.address = updates.address;
      if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
      if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
      if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
      if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
      if (updates.customDomain !== undefined) dbUpdates.custom_domain = updates.customDomain;
      if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;
      
      const combinedThemeSettings = {
        ...(stores[index].layoutSettings || {}),
        ...(updates.layoutSettings || {}),
        ...(updates.isPublished !== undefined ? { isPublished: updates.isPublished } : {}),
        ...(updates.planExpiresAt ? { planExpiresAt: updates.planExpiresAt } : {}),
        ...(updates.planSubscribedAt ? { planSubscribedAt: updates.planSubscribedAt } : {}),
      };
      dbUpdates.theme_settings = combinedThemeSettings;
      stores[index].layoutSettings = combinedThemeSettings;
      await supabase.from('stores').update(dbUpdates).eq('id', storeId);
      console.log(`[Supabase Database] Toko ${storeId} berhasil diperbarui di cloud. is_published = ${updates.isPublished}`);
    } catch (err) {
      console.warn('Supabase store update notice:', err);
    }

    // Update active auth session store in localStorage so changes persist across reload
    try {
      const activeAuthStoreStr = localStorage.getItem('microcms_auth_store');
      if (activeAuthStoreStr) {
        const parsed = JSON.parse(activeAuthStoreStr);
        if (parsed.id === storeId) {
          localStorage.setItem('microcms_auth_store', JSON.stringify(stores[index]));
        }
      }
    } catch (e) {}

    // Instant local multi-tab & cross-tab broadcast
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('microcms_store_sync');
        bc.postMessage({ type: 'STORE_UPDATED', store: stores[index] });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent('microcms_store_updated', { detail: stores[index] }));
    } catch (e) {}

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
      province: data.province || '',
      district: data.district || '',
      subdistrict: data.subdistrict || '',
      village: data.village || '',
      addressDetail: data.addressDetail || '',
      postalCode: data.postalCode || '',
      address: data.address || '',
      latitude: data.latitude,
      longitude: data.longitude,
      category: data.category || 'Bisnis UMKM',
      currency: data.currency || 'IDR',
      balance: data.balance || 0,
      plan: data.plan || 'free',
      isPublished: data.isPublished !== undefined ? data.isPublished : false,
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
        province: newStore.province || '',
        district: newStore.district || '',
        subdistrict: newStore.subdistrict || '',
        village: newStore.village || '',
        address_detail: newStore.addressDetail || '',
        postal_code: newStore.postalCode || '',
        address: newStore.address || '',
        latitude: newStore.latitude,
        longitude: newStore.longitude,
        category: newStore.category,
        plan: newStore.plan || 'free',
        balance: newStore.balance || 0,
        theme_settings: newStore.layoutSettings || {},
        is_published: newStore.isPublished !== undefined ? newStore.isPublished : false,
        created_at: newStore.createdAt,
        updated_at: getWibIsoString(),
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

  /**
   * Berlangganan (Subscribe) perubahan status toko secara Real-Time via Supabase WebSocket & BroadcastChannel
   */
  subscribeToStoreChanges(storeIdOrSlug: string, onUpdate: (updatedStore: Store) => void): () => void {
    const unsubscribers: Array<() => void> = [];

    // 1. BroadcastChannel listener (sinkronisasi instan antar-tab pada browser yang sama)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('microcms_store_sync');
        const bcHandler = (event: MessageEvent) => {
          if (event.data && event.data.store) {
            const incoming: Store = event.data.store;
            if (incoming.id === storeIdOrSlug || incoming.slug === storeIdOrSlug) {
              onUpdate(incoming);
            }
          }
        };
        bc.addEventListener('message', bcHandler);
        unsubscribers.push(() => {
          bc.removeEventListener('message', bcHandler);
          bc.close();
        });
      }
    } catch (e) {}

    // 2. Window storage & custom event listener
    try {
      const storageHandler = (e: StorageEvent) => {
        if (e.key === STORE_KEY && e.newValue) {
          try {
            const list: Store[] = JSON.parse(e.newValue);
            const found = list.find((s) => s.id === storeIdOrSlug || s.slug === storeIdOrSlug);
            if (found) {
              onUpdate(found);
            }
          } catch (err) {}
        }
      };
      window.addEventListener('storage', storageHandler);
      unsubscribers.push(() => window.removeEventListener('storage', storageHandler));

      const customHandler = (e: any) => {
        if (e.detail) {
          const s: Store = e.detail;
          if (s.id === storeIdOrSlug || s.slug === storeIdOrSlug) {
            onUpdate(s);
          }
        }
      };
      window.addEventListener('microcms_store_updated', customHandler);
      unsubscribers.push(() => window.removeEventListener('microcms_store_updated', customHandler));
    } catch (e) {}

    // 3. Supabase Realtime WebSocket channel (sinkronisasi lintas-perangkat dan lintas-browser)
    try {
      const channel = supabase
        .channel(`realtime:stores:${storeIdOrSlug}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'stores',
          },
          (payload: any) => {
            if (payload?.new) {
              const row = payload.new;
              if (row.id === storeIdOrSlug || row.slug === storeIdOrSlug) {
                const isPub = row.is_published !== undefined 
                  ? Boolean(row.is_published) 
                  : Boolean(row.theme_settings?.isPublished);

                const stored = this.getStoredStores();
                const idx = stored.findIndex((s) => s.id === row.id || s.slug === row.slug);
                let merged: Store;
                if (idx !== -1) {
                  merged = {
                    ...stored[idx],
                    name: row.name || stored[idx].name,
                    slug: row.slug || stored[idx].slug,
                    isPublished: isPub,
                    customDomain: row.custom_domain !== undefined ? row.custom_domain : stored[idx].customDomain,
                  };
                  stored[idx] = merged;
                  this.saveStores(stored);
                } else {
                  merged = {
                    ...initialStores[0],
                    id: row.id,
                    name: row.name,
                    slug: row.slug,
                    isPublished: isPub,
                  };
                }
                onUpdate(merged);
              }
            }
          }
        )
        .subscribe();

      unsubscribers.push(() => {
        supabase.removeChannel(channel);
      });
    } catch (err) {
      console.warn('Realtime subscription error in storeService:', err);
    }

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
  }
}

export const storeService = new StoreService();
