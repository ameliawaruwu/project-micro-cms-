import { BillingPlan, BillingSubscription, Store } from '../types';
import { supabase } from './supabaseClient';
import { idService } from './idService';

const BILLING_PLANS_KEY = 'microcms_billing_plans_v1';
const SUBSCRIPTIONS_KEY = 'microcms_store_subscriptions_v2';

export const ALLOWED_PLAN_SLUGS: readonly ('free' | 'personal' | 'community')[] = ['free', 'personal', 'community'] as const;

export function resolvePlanSlug(planIdOrName?: string): 'free' | 'personal' | 'community' {
  if (!planIdOrName) return 'free';
  const raw = planIdOrName.toLowerCase().trim();

  // Personal matches
  if (
    raw === 'personal' ||
    raw === 'pln002' ||
    raw === 'plan_pln002' ||
    raw === 'plan_personal' ||
    raw.includes('personal') ||
    raw.includes('pro umkm') ||
    raw === 'pro'
  ) {
    return 'personal';
  }

  // Community matches
  if (
    raw === 'community' ||
    raw === 'pln003' ||
    raw === 'plan_pln003' ||
    raw === 'plan_community' ||
    raw.includes('community') ||
    raw.includes('scale-up') ||
    raw.includes('premium') ||
    raw.includes('corporate') ||
    raw.includes('startup')
  ) {
    return 'community';
  }

  return 'free';
}

export interface ActiveSubscriptionInfo {
  hasActivePaidPlan: boolean;
  planSlug: 'free' | 'personal' | 'community';
  planName: string;
  subscribedAt?: string;
  expiresAt?: string;
  isExpired: boolean;
  subscription?: BillingSubscription;
}

export const DEFAULT_BILLING_PLANS: BillingPlan[] = [
  {
    id: 'PLN001',
    name: 'Paket Free',
    slug: 'free',
    tagline: 'Belajar & kelola katalog produk lokal secara gratis',
    priceMonthly: 0,
    priceYearly: 0,
    hostingPriceYearly: 0,
    cmsPriceYearly: 0,
    features: [
      'Subdomain pratinjau: namatoko.kroombox.com',
      'Katalog produk dasar (maksimal 10 produk)',
      '❌ Tanpa Checkout Otomatis Midtrans (Manual/WA saja)',
      '❌ Tanpa Ekspedisi Kurir Otomatis Biteship',
      '❌ Tanpa Publikasi/Deploy Toko Online & Domain',
      'Watermark resmi Kroomify di footer',
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'PLN002',
    name: 'Personal Toko',
    slug: 'personal',
    tagline: 'Buka toko online mandiri & terima pembayaran instan',
    priceMonthly: 35000,
    priceYearly: 350000,
    hostingPriceYearly: 200000,
    cmsPriceYearly: 150000,
    features: [
      'Hosting Server: Rp 200.000 / tahun',
      'Jasa Micro CMS: Rp 150.000 / tahun',
      'Dukungan Custom Domain (.top, .online, .org, .com, .id)',
      'Katalog produk hingga 100 item',
      'Automated Midtrans (QRIS, VA Bank, E-Wallet)',
      'Integrasi Ekspedisi Logistik (JNE, J&T via Biteship)',
      'White-label tanpa watermark',
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'PLN003',
    name: 'Community UMKM',
    slug: 'community',
    tagline: 'Solusi lengkap & paling laris untuk bisnis UMKM bertumbuh',
    badge: 'Pilihan Terbaik UMKM',
    priceMonthly: 100000,
    priceYearly: 1000000,
    hostingPriceYearly: 700000,
    cmsPriceYearly: 300000,
    features: [
      'Hosting Server: Rp 700.000 / tahun',
      'Jasa Micro CMS: Rp 300.000 / tahun',
      'Pilihan Terbaik UMKM (Rekomendasi Utama)',
      'Dukungan Custom Domain (.top, .online, .org, .com, .id)',
      'Unlimited katalog produk & varian tanpa batas',
      'Full checkout Midtrans (QRIS, VA Bank, E-Wallet)',
      'Cetak label resi pengiriman thermal massal',
      'Visual layout builder (bebas kustom tema toko)',
      'Hosting Server UMKM prioritas tinggi',
    ],
    isActive: true,
    sortOrder: 3,
  },
];

function mapRowToPlan(row: any): BillingPlan {
  let features: string[] = [];
  if (Array.isArray(row.features)) {
    features = row.features;
  } else if (typeof row.features === 'string') {
    try {
      features = JSON.parse(row.features);
    } catch {
      features = [];
    }
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || '',
    priceMonthly: Number(row.price_monthly || 0),
    priceYearly: Number(row.price_yearly || 0),
    features,
    isActive: row.is_active ?? true,
    sortOrder: Number(row.sort_order || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPlanToRow(plan: BillingPlan) {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    tagline: plan.tagline,
    price_monthly: plan.priceMonthly,
    price_yearly: plan.priceYearly,
    features: plan.features,
    is_active: plan.isActive,
    sort_order: plan.sortOrder,
    updated_at: new Date().toISOString(),
  };
}

class BillingPlanService {
  private getStoredPlans(): BillingPlan[] {
    const raw = localStorage.getItem(BILLING_PLANS_KEY);
    if (!raw) {
      localStorage.setItem(BILLING_PLANS_KEY, JSON.stringify(DEFAULT_BILLING_PLANS));
      return DEFAULT_BILLING_PLANS;
    }
    try {
      const parsed: BillingPlan[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce strictly 3 allowed plans
        const filtered = parsed.filter((p) => {
          const s = resolvePlanSlug(p.slug || p.id || p.name);
          return s === 'free' || s === 'personal' || s === 'community';
        });
        if (filtered.length >= 3) {
          // Normalize to exactly unique 3 plans
          const planMap = new Map<string, BillingPlan>();
          filtered.forEach((p) => {
            const slug = resolvePlanSlug(p.slug || p.id || p.name);
            if (!planMap.has(slug)) planMap.set(slug, { ...p, slug });
          });
          const result = Array.from(planMap.values());
          if (result.length === 3) return result;
        }
      }
      return DEFAULT_BILLING_PLANS;
    } catch {
      return DEFAULT_BILLING_PLANS;
    }
  }

  private saveStoredPlans(plans: BillingPlan[]) {
    // Only save strictly the 3 allowed plans
    const filtered = plans.filter((p) => {
      const s = resolvePlanSlug(p.slug || p.id || p.name);
      return s === 'free' || s === 'personal' || s === 'community';
    });
    localStorage.setItem(BILLING_PLANS_KEY, JSON.stringify(filtered.length > 0 ? filtered : DEFAULT_BILLING_PLANS));
  }

  /**
   * Get all plans synchronously from local cache, with async background sync to Supabase
   * Exactly 3 plans: Paket Free, Personal Toko, Community UMKM
   */
  getPlans(): BillingPlan[] {
    const stored = this.getStoredPlans();
    return stored
      .filter((p) => {
        const s = resolvePlanSlug(p.slug || p.id || p.name);
        return s === 'free' || s === 'personal' || s === 'community';
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Fetch plans asynchronously from Supabase, updating local cache
   */
  async fetchPlansFromDatabase(): Promise<BillingPlan[]> {
    try {
      const { data, error } = await supabase
        .from('billing_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('Supabase fetch billing_plans error, using local cache:', error.message);
        return this.getPlans();
      }

      if (data && data.length > 0) {
        const mapped = data.map(mapRowToPlan);
        this.saveStoredPlans(mapped);
        return mapped;
      }
      return this.getPlans();
    } catch (err) {
      console.warn('Network error fetching billing_plans:', err);
      return this.getPlans();
    }
  }

  /**
   * Get active plans for display to merchants
   */
  getActivePlans(): BillingPlan[] {
    return this.getPlans().filter((p) => p.isActive);
  }

  /**
   * Create a new billing plan
   */
  async createPlan(data: Omit<BillingPlan, 'id'>): Promise<BillingPlan> {
    const id = await idService.generateNextId('billing_plans');
    const newPlan: BillingPlan = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Sync ke Supabase
    try {
      const row = mapPlanToRow(newPlan);
      const { error } = await supabase.from('billing_plans').insert([{ ...row, created_at: newPlan.createdAt }]);
      if (error) {
        console.error('Failed to sync new plan to Supabase:', error);
      }
    } catch (err) {
      console.warn('Failed to sync new plan to Supabase:', err);
    }

    // 2. Simpan ke local cache
    const current = this.getStoredPlans();
    const updated = [...current.filter((p) => p.id !== id), newPlan];
    this.saveStoredPlans(updated);

    return newPlan;
  }

  /**
   * Update an existing billing plan
   */
  async updatePlan(id: string, updates: Partial<BillingPlan>): Promise<BillingPlan | null> {
    const current = this.getStoredPlans();
    const index = current.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updatedPlan: BillingPlan = {
      ...current[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // 1. Sync ke Supabase
    try {
      const row = mapPlanToRow(updatedPlan);
      const { error } = await supabase.from('billing_plans').update(row).eq('id', id);
      if (error) {
        console.error('Failed to update plan in Supabase:', error);
      }
    } catch (err) {
      console.warn('Failed to update plan in Supabase:', err);
    }

    // 2. Simpan ke local cache
    current[index] = updatedPlan;
    this.saveStoredPlans(current);

    return updatedPlan;
  }

  /**
   * Delete a billing plan
   */
  async deletePlan(id: string): Promise<boolean> {
    // 1. Sync ke Supabase
    try {
      const { error } = await supabase.from('billing_plans').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete plan from Supabase:', error);
      }
    } catch (err) {
      console.warn('Failed to delete plan from Supabase:', err);
    }

    // 2. Simpan ke local cache
    const current = this.getStoredPlans();
    const filtered = current.filter((p) => p.id !== id);
    this.saveStoredPlans(filtered);

    return true;
  }

  /**
   * Toggle is_active status of a plan
   */
  async togglePlanStatus(id: string): Promise<BillingPlan | null> {
    const current = this.getStoredPlans();
    const plan = current.find((p) => p.id === id);
    if (!plan) return null;

    return this.updatePlan(id, { isActive: !plan.isActive });
  }

  /**
   * Subscriptions log management
   */
  getSubscriptions(): BillingSubscription[] {
    const raw = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (!raw) return [];
    try {
      const parsed: BillingSubscription[] = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async fetchSubscriptionsFromDatabase(): Promise<BillingSubscription[]> {
    try {
      const { data, error } = await supabase
        .from('store_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch store_subscriptions error:', error.message);
        return this.getSubscriptions();
      }

      const mapped: BillingSubscription[] = (data || []).map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        storeName: r.store_name || '',
        planId: r.plan_id,
        planName: r.plan_name,
        cycle: r.cycle || 'monthly',
        amount: Number(r.amount || 0),
        status: r.status || 'paid',
        paymentMethod: r.payment_method || 'Midtrans',
        invoiceNumber: r.invoice_number || `INV-${r.id}`,
        paidAt: r.paid_at || r.created_at || new Date().toISOString(),
        expiresAt: r.expires_at || new Date().toISOString(),
        createdAt: r.created_at || new Date().toISOString(),
      }));

      localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.warn('Network error fetching subscriptions:', err);
      return this.getSubscriptions();
    }
  }

  async recordSubscription(sub: Omit<BillingSubscription, 'id' | 'createdAt'>): Promise<BillingSubscription> {
    const id = await idService.generateNextId('store_subscriptions');
    const newSub: BillingSubscription = {
      ...sub,
      id,
      createdAt: new Date().toISOString(),
    };

    const current = this.getSubscriptions();
    const updated = [newSub, ...current];
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(updated));

    // Try Supabase insert
    try {
      await supabase.from('store_subscriptions').insert([
        {
          id: newSub.id,
          store_id: newSub.storeId,
          plan_id: newSub.planId,
          plan_name: newSub.planName,
          cycle: newSub.cycle,
          amount: newSub.amount,
          status: newSub.status,
          payment_method: newSub.paymentMethod,
          invoice_number: newSub.invoiceNumber,
          paid_at: newSub.paidAt,
          expires_at: newSub.expiresAt,
          created_at: newSub.createdAt,
        },
      ]);
    } catch (err) {
      console.warn('Failed to sync subscription to Supabase:', err);
    }

    return newSub;
  }

  /**
   * Get subscriptions for a specific store
   */
  getStoreSubscriptions(storeId: string): BillingSubscription[] {
    return this.getSubscriptions().filter((s) => s.storeId === storeId);
  }

  /**
   * Get pending subscription for a specific store if any
   */
  getPendingSubscription(storeId: string): BillingSubscription | undefined {
    return this.getSubscriptions().find((s) => s.storeId === storeId && s.status === 'pending');
  }

  /**
   * Check whether a merchant/store has an active paid subscription directly from database.
   * Validates exact 1-year expiration date from the paid_at date.
   */
  async getActiveSubscriptionForStore(storeId: string): Promise<ActiveSubscriptionInfo> {
    if (!storeId) {
      return {
        hasActivePaidPlan: false,
        planSlug: 'free',
        planName: 'Paket Free',
        isExpired: false,
      };
    }

    try {
      const { data, error } = await supabase
        .from('store_subscriptions')
        .select('*')
        .eq('store_id', storeId)
        .order('paid_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      let subs: BillingSubscription[] = [];

      if (!error && data && data.length > 0) {
        subs = data.map((r: any) => ({
          id: r.id,
          storeId: r.store_id,
          storeName: r.store_name || '',
          planId: r.plan_id,
          planName: r.plan_name,
          cycle: r.cycle || 'yearly',
          amount: Number(r.amount || 0),
          status: r.status || 'paid',
          paymentMethod: r.payment_method || 'Midtrans',
          invoiceNumber: r.invoice_number || `INV-${r.id}`,
          paidAt: r.paid_at || r.created_at || new Date().toISOString(),
          expiresAt: r.expires_at || new Date(new Date(r.paid_at || r.created_at || Date.now()).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: r.created_at || new Date().toISOString(),
        }));
        // Update local cache for this store
        const existingOther = this.getSubscriptions().filter((s) => s.storeId !== storeId);
        localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify([...subs, ...existingOther]));
      } else {
        subs = this.getStoreSubscriptions(storeId);
      }

      // Filter paid subscriptions
      const paidSubs = subs.filter((s) => s.status === 'paid');
      if (paidSubs.length === 0) {
        // Check if there was an expired subscription
        const expiredSub = subs.find((s) => s.status === 'expired');
        return {
          hasActivePaidPlan: false,
          planSlug: 'free',
          planName: 'Paket Free',
          isExpired: !!expiredSub,
          subscription: expiredSub,
        };
      }

      // Latest paid subscription
      const latestPaid = paidSubs[0];
      const paidAt = latestPaid.paidAt || latestPaid.createdAt || new Date().toISOString();
      let expiresAt = latestPaid.expiresAt;
      if (!expiresAt || isNaN(new Date(expiresAt).getTime())) {
        expiresAt = new Date(new Date(paidAt).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }

      const nowTime = Date.now();
      const expiresTime = new Date(expiresAt).getTime();
      const isExpired = expiresTime <= nowTime;

      if (isExpired) {
        // Mark as expired in DB
        supabase
          .from('store_subscriptions')
          .update({ status: 'expired' })
          .eq('id', latestPaid.id)
          .then(() => {}, () => {});

        return {
          hasActivePaidPlan: false,
          planSlug: 'free',
          planName: 'Paket Free',
          subscribedAt: paidAt,
          expiresAt,
          isExpired: true,
          subscription: latestPaid,
        };
      }

      const planSlug = resolvePlanSlug(latestPaid.planId || latestPaid.planName);
      if (planSlug === 'free') {
        return {
          hasActivePaidPlan: false,
          planSlug: 'free',
          planName: 'Paket Free',
          subscribedAt: paidAt,
          expiresAt,
          isExpired: false,
          subscription: latestPaid,
        };
      }

      const planName = latestPaid.planName || (planSlug === 'community' ? 'Community UMKM' : 'Personal Toko');

      return {
        hasActivePaidPlan: true,
        planSlug,
        planName,
        subscribedAt: paidAt,
        expiresAt,
        isExpired: false,
        subscription: latestPaid,
      };
    } catch (err) {
      console.warn('[billingPlanService] Error in getActiveSubscriptionForStore:', err);
      // Fallback to local subscriptions
      const subs = this.getStoreSubscriptions(storeId).filter((s) => s.status === 'paid');
      if (subs.length > 0) {
        const latestPaid = subs[0];
        const paidAt = latestPaid.paidAt || latestPaid.createdAt;
        const expiresAt = latestPaid.expiresAt || new Date(new Date(paidAt).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
        const isExpired = new Date(expiresAt).getTime() <= Date.now();
        if (isExpired) {
          return { hasActivePaidPlan: false, planSlug: 'free', planName: 'Paket Free', subscribedAt: paidAt, expiresAt, isExpired: true, subscription: latestPaid };
        }
        const planSlug = resolvePlanSlug(latestPaid.planId || latestPaid.planName);
        return {
          hasActivePaidPlan: planSlug !== 'free',
          planSlug,
          planName: latestPaid.planName,
          subscribedAt: paidAt,
          expiresAt,
          isExpired: false,
          subscription: latestPaid,
        };
      }

      return {
        hasActivePaidPlan: false,
        planSlug: 'free',
        planName: 'Paket Free',
        isExpired: false,
      };
    }
  }

  /**
   * Syncs store entity with its active subscription from DB, auto-healing inconsistent plan states
   */
  async syncStoreWithActiveSubscription(store: Store): Promise<Store> {
    if (!store || !store.id) return store;
    try {
      const info = await this.getActiveSubscriptionForStore(store.id);

      let needsUpdate = false;
      let newPlan = store.plan;
      let newExpiresAt = store.planExpiresAt;
      let newSubscribedAt = store.planSubscribedAt;

      if (info.hasActivePaidPlan) {
        if (store.plan !== info.planSlug || store.planExpiresAt !== info.expiresAt) {
          newPlan = info.planSlug;
          newExpiresAt = info.expiresAt;
          newSubscribedAt = info.subscribedAt;
          needsUpdate = true;
        }
      } else if (info.isExpired) {
        if (store.plan && store.plan !== 'free') {
          newPlan = 'free';
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        store.plan = newPlan;
        store.planExpiresAt = newExpiresAt;
        store.planSubscribedAt = newSubscribedAt;

        // Auto-heal stores table in Supabase
        await supabase
          .from('stores')
          .update({
            plan: newPlan,
            theme_settings: {
              ...(store.layoutSettings || {}),
              planExpiresAt: newExpiresAt,
              planSubscribedAt: newSubscribedAt,
            },
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', store.id);

        // Sync local storage active store
        try {
          const authStoreStr = localStorage.getItem('microcms_active_store');
          if (authStoreStr) {
            const parsed = JSON.parse(authStoreStr);
            if (parsed.id === store.id) {
              localStorage.setItem('microcms_active_store', JSON.stringify(store));
            }
          }
        } catch { /* ignore */ }
      }
    } catch (e) {
      console.warn('[billingPlanService] syncStoreWithActiveSubscription warning:', e);
    }
    return store;
  }

  /**
   * Update the status of a subscription (e.g. from pending to paid or cancelled)
   */
  async updateSubscriptionStatus(
    identifier: string,
    status: 'paid' | 'pending' | 'failed' | 'cancelled' | 'expired',
    extra?: Partial<BillingSubscription>
  ): Promise<BillingSubscription | null> {
    const subs = this.getSubscriptions();
    const index = subs.findIndex(
      (s) => s.id === identifier || s.invoiceNumber === identifier || (s.orderId && s.orderId === identifier)
    );

    if (index === -1) return null;

    const existing = subs[index];
    const now = new Date();
    const paidAtIso = status === 'paid' ? (extra?.paidAt || now.toISOString()) : existing.paidAt;
    const expiresAtIso = status === 'paid'
      ? (extra?.expiresAt || new Date(new Date(paidAtIso).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString())
      : (extra?.expiresAt || existing.expiresAt);

    const updated: BillingSubscription = {
      ...existing,
      ...extra,
      status,
      paidAt: paidAtIso,
      expiresAt: expiresAtIso,
    };

    subs[index] = updated;
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs));

    // Sync to Supabase
    try {
      await supabase
        .from('store_subscriptions')
        .update({
          status: updated.status,
          paid_at: updated.paidAt,
          expires_at: updated.expiresAt,
        })
        .eq('id', updated.id);

      // Auto-update stores table in Supabase when paid
      if (status === 'paid' && existing.storeId) {
        const planSlug = resolvePlanSlug(existing.planId || existing.planName);
        await supabase
          .from('stores')
          .update({
            plan: planSlug,
            theme_settings: {
              planExpiresAt: expiresAtIso,
              planSubscribedAt: paidAtIso,
            },
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', existing.storeId);
      }
    } catch (err) {
      console.warn('Failed to update subscription status in Supabase:', err);
    }

    return updated;
  }
}

export const billingPlanService = new BillingPlanService();
