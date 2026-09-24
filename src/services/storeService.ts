import { Store } from '../types';
import { supabase } from './supabaseClient';
import { getWibIsoString } from '../utils/formatters';
import { idService } from './idService';

const STORE_KEY = 'microcms_stores_v2';
const ACTIVE_STORE_KEY = 'microcms_active_store_id';

class StoreService {
  private getStoredStores(): Store[] {
    const data = localStorage.getItem(STORE_KEY);
    if (!data) {
      return [];
    }
    try {
      const parsed: Store[] = JSON.parse(data);
      const storeMap = new Map<string, Store>();
      let modified = false;

      // Filter out auto-generated legacy stores & demo stores so merchants start clean
      parsed.forEach((s) => {
        if (s && s.id) {
          const isDemoStore = ['store-andhika', 'store-1', 'store-2', 'store-3'].includes(s.id);
          const isLegacyAuto =
            isDemoStore ||
            ((s.slug && (s.slug === 'toko-me' || s.slug.startsWith('toko-amelia') || s.slug.startsWith('toko-usr_'))) ||
              s.name.startsWith('Toko usr_') ||
              s.name === 'Toko Baru UMKM' ||
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

      const cleanList = Array.from(storeMap.values());
      if (modified || cleanList.length !== parsed.length) {
        this.saveStores(cleanList);
      }
      return cleanList;
    } catch {
      return [];
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
    try {
      const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
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
          category: row.category || 'General',
          currency: row.currency || 'IDR',
          balance: Number(row.balance || 0),
          isPublished: row.is_published !== false,
          layoutSettings: row.layout_settings,
          onboarding: row.onboarding || {
            storeNameSet: true,
            productUploaded: false,
            paymentConnected: false,
          },
          createdAt: row.created_at || new Date().toISOString(),
        }));
      }
    } catch {
      // ignore
    }
    return this.getStoredStores();
  }

  async getStoresForUser(userId: string): Promise<Store[]> {
    const localStores = this.getStoredStores().filter((s) => s.merchantId === userId);

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId);

      if (!error && data) {
        if (data.length === 0) {
          // Cloud explicitly confirms no store exists for this merchant.
          // Purge any local ghost/zombie stores for this user immediately.
          const allOther = this.getStoredStores().filter((s) => s.merchantId !== userId);
          this.saveStores(allOther);

          const activeId = localStorage.getItem(ACTIVE_STORE_KEY);
          if (localStores.some((s) => s.id === activeId)) {
            localStorage.removeItem(ACTIVE_STORE_KEY);
            localStorage.removeItem('microcms_active_store');
          }
          return [];
        }

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
          isPublished: row.is_published !== undefined && row.is_published !== null
            ? Boolean(row.is_published)
            : ['store-1', 'store-2', 'store-3', 'store-4'].includes(row.id),
          layoutSettings: row.theme_settings,
          customDomain: row.custom_domain,
          onboarding: {
            storeNameSet: !row.name.startsWith('Toko usr_'),
            productUploaded: false,
            paymentConnected: row.plan !== 'free',
          },
          createdAt: row.created_at || new Date().toISOString(),
        }));

        // Cache synced cloud stores locally
        const allOther = this.getStoredStores().filter((s) => s.merchantId !== userId);
        this.saveStores([...allOther, ...mappedStores]);
        return mappedStores;
      }
    } catch (e) {
      console.warn('Supabase fetch stores error:', e);
    }

    // In case of network error/offline, return local stores if any
    return isDemoUser ? localStores : [];
  }

  async getStoreById(id: string): Promise<Store | undefined> {
    const stores = this.getStoredStores();
    return stores.find((s) => s.id === id);
  }

  async getStoreBySlug(slug: string): Promise<Store | undefined> {
    if (!slug) {
      return undefined;
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
        const isPub = row.is_published !== undefined && row.is_published !== null
          ? Boolean(row.is_published)
          : ['store-1', 'store-2', 'store-3', 'store-4'].includes(row.id);

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

    // 2. Search local stored stores
    const stores = this.getStoredStores();
    const exact = stores.find((s) => s.slug?.toLowerCase() === clean || s.id?.toLowerCase() === clean);
    if (exact) return exact;

    const fuzzy = stores.find((s) => {
      const sSlug = (s.slug || '').toLowerCase();
      const sId = (s.id || '').toLowerCase();
      const sName = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSimple = clean.replace(/[^a-z0-9]/g, '');
      return (
        sSlug === clean ||
        sId === clean ||
        sName === cleanSimple
      );
    });

    // Strictly return match or undefined. Never fall back to another merchant's store.
    return fuzzy || undefined;
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
    return undefined;
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
        ...(updates.planExpiresAt ? { planExpiresAt: updates.planExpiresAt } : {}),
        ...(updates.planSubscribedAt ? { planSubscribedAt: updates.planSubscribedAt } : {}),
      };
      // Keep theme_settings clean of store publication column
      delete (combinedThemeSettings as any).isPublished;
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

    const name = data.name ? data.name.trim() : '';
    const slug = data.slug
      ? data.slug.trim()
      : name
      ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : '';

    const storeId = (data.id && data.id.startsWith('STR')) ? data.id : await idService.generateNextId('stores');

    const newStore: Store = {
      id: storeId,
      merchantId: data.merchantId || 'USR001',
      name,
      slug,
      tagline: data.tagline || '',
      description: data.description || '',
      logoUrl: data.logoUrl || '',
      bannerUrl: data.bannerUrl || '',
      phoneWhatsApp: data.phoneWhatsApp || '',
      city: data.city || '',
      province: data.province || '',
      district: data.district || '',
      subdistrict: data.subdistrict || '',
      village: data.village || '',
      addressDetail: data.addressDetail || '',
      postalCode: data.postalCode || '',
      address: data.address || '',
      latitude: data.latitude,
      longitude: data.longitude,
      category: data.category || '',
      currency: data.currency || 'IDR',
      balance: data.balance || 0,
      plan: data.plan || 'free',
      isPublished: data.isPublished !== undefined ? data.isPublished : false,
      onboarding: data.onboarding || {
        storeNameSet: Boolean(name),
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
        city: newStore.city || '',
        province: newStore.province || '',
        district: newStore.district || '',
        subdistrict: newStore.subdistrict || '',
        village: newStore.village || '',
        address_detail: newStore.addressDetail || '',
        postal_code: newStore.postalCode || '',
        address: newStore.address || '',
        latitude: newStore.latitude,
        longitude: newStore.longitude,
        category: newStore.category || '',
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
                const isPub = row.is_published !== undefined && row.is_published !== null
                  ? Boolean(row.is_published) 
                  : ['store-1', 'store-2', 'store-3', 'store-4'].includes(row.id);

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
                    id: row.id,
                    merchantId: row.user_id,
                    name: row.name || '',
                    slug: row.slug || '',
                    tagline: row.tagline || '',
                    description: row.description || '',
                    logoUrl: row.logo_url || '',
                    bannerUrl: row.banner_url || '',
                    phoneWhatsApp: row.phone_whatsapp || '',
                    city: row.city || '',
                    province: row.province || '',
                    district: row.district || '',
                    subdistrict: row.subdistrict || '',
                    village: row.village || '',
                    addressDetail: row.address_detail || '',
                    postalCode: row.postal_code || '',
                    address: row.address || '',
                    category: row.category || '',
                    currency: 'IDR',
                    balance: Number(row.balance || 0),
                    plan: row.plan || 'free',
                    isPublished: isPub,
                    createdAt: row.created_at || new Date().toISOString(),
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
