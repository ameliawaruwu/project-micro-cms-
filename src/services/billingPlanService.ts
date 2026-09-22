import { BillingPlan, BillingSubscription } from '../types';
import { supabase } from './supabaseClient';

const BILLING_PLANS_KEY = 'microcms_billing_plans_v1';
const SUBSCRIPTIONS_KEY = 'microcms_store_subscriptions_v1';

export const DEFAULT_BILLING_PLANS: BillingPlan[] = [
  {
    id: 'plan_free',
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
    id: 'plan_personal',
    name: 'Personal Toko',
    slug: 'personal',
    tagline: 'Buka toko online mandiri & terima pembayaran instan',
    priceMonthly: 0,
    priceYearly: 350000,
    hostingPriceYearly: 200000,
    cmsPriceYearly: 150000,
    features: [
      'Kapasitas hingga 50 produk & varian',
      'Deploy Toko Online Aktif (bisa diakses pembeli)',
      'Checkout otomatis Midtrans (QRIS & VA Bank)',
      'Cek ongkir & pengiriman otomatis Biteship',
      'Kapasitas Hosting Cloud Kroomify cepat',
      'Laporan penjualan & pesanan harian',
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'plan_community',
    name: 'Community UMKM',
    slug: 'community',
    tagline: 'Solusi lengkap & paling laris untuk bisnis UMKM bertumbuh',
    badge: 'Pilihan Terbaik UMKM',
    priceMonthly: 0,
    priceYearly: 1000000,
    hostingPriceYearly: 700000,
    cmsPriceYearly: 300000,
    features: [
      'Unlimited katalog produk & varian tanpa batas',
      'Mendukung Custom Domain Sendiri (.com, .id, dll)',
      'Bebas Watermark (100% White-label Brand Anda)',
      'Full checkout Midtrans (QRIS, VA Bank, E-Wallet)',
      'Cetak label resi pengiriman thermal massal',
      'Visual layout builder (bebas kustom tema toko)',
      'Hosting Server UMKM prioritas tinggi',
    ],
    isActive: true,
    sortOrder: 3,
  },
];

const INITIAL_SUBSCRIPTIONS: BillingSubscription[] = [
  {
    id: 'sub_001',
    storeId: 'store-andhika',
    storeName: 'Toko Andhika',
    planId: 'plan_pro',
    planName: 'Pro UMKM',
    cycle: 'monthly',
    amount: 99000,
    status: 'paid',
    paymentMethod: 'Midtrans QRIS',
    invoiceNumber: 'INV/2026/09/SUB-001',
    paidAt: '2026-09-01T10:00:00Z',
    expiresAt: '2026-10-01T10:00:00Z',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'sub_002',
    storeId: 'store-1',
    storeName: 'Batik Kirana Solo',
    planId: 'plan_scaleup',
    planName: 'Bisnis Scale-Up',
    cycle: 'yearly',
    amount: 2400000,
    status: 'paid',
    paymentMethod: 'Midtrans BCA VA',
    invoiceNumber: 'INV/2026/08/SUB-098',
    paidAt: '2026-08-15T14:30:00Z',
    expiresAt: '2027-08-15T14:30:00Z',
    createdAt: '2026-08-15T14:30:00Z',
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
      // Validasi agar hanya 3 paket resmi yang dimuat
      const validSlugs = new Set(['free', 'personal', 'community']);
      const filtered = Array.isArray(parsed) ? parsed.filter((p) => validSlugs.has(p.slug)) : [];
      if (filtered.length !== 3) {
        localStorage.setItem(BILLING_PLANS_KEY, JSON.stringify(DEFAULT_BILLING_PLANS));
        return DEFAULT_BILLING_PLANS;
      }
      return filtered;
    } catch {
      return DEFAULT_BILLING_PLANS;
    }
  }

  private saveStoredPlans(plans: BillingPlan[]) {
    localStorage.setItem(BILLING_PLANS_KEY, JSON.stringify(plans));
  }

  /**
   * Get all plans synchronously from local cache, with async background sync to Supabase
   */
  getPlans(): BillingPlan[] {
    return this.getStoredPlans().sort((a, b) => a.sortOrder - b.sortOrder);
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
        const validSlugs = new Set(['free', 'personal', 'community']);
        const mapped = data.map(mapRowToPlan).filter((p) => validSlugs.has(p.slug));
        if (mapped.length > 0) {
          this.saveStoredPlans(mapped);
          return mapped;
        }
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
    const id = `plan_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const newPlan: BillingPlan = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const current = this.getStoredPlans();
    const updated = [...current, newPlan];
    this.saveStoredPlans(updated);

    // Sync to Supabase
    try {
      const row = mapPlanToRow(newPlan);
      await supabase.from('billing_plans').insert([{ ...row, created_at: newPlan.createdAt }]);
    } catch (err) {
      console.warn('Failed to sync new plan to Supabase:', err);
    }

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

    current[index] = updatedPlan;
    this.saveStoredPlans(current);

    // Sync to Supabase
    try {
      const row = mapPlanToRow(updatedPlan);
      await supabase.from('billing_plans').update(row).eq('id', id);
    } catch (err) {
      console.warn('Failed to update plan in Supabase:', err);
    }

    return updatedPlan;
  }

  /**
   * Delete a billing plan
   */
  async deletePlan(id: string): Promise<boolean> {
    const current = this.getStoredPlans();
    const filtered = current.filter((p) => p.id !== id);
    if (filtered.length === current.length) return false;

    this.saveStoredPlans(filtered);

    // Sync to Supabase
    try {
      await supabase.from('billing_plans').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to delete plan from Supabase:', err);
    }

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
    if (!raw) {
      localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      return INITIAL_SUBSCRIPTIONS;
    }
    try {
      const parsed: BillingSubscription[] = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  }

  async recordSubscription(sub: Omit<BillingSubscription, 'id' | 'createdAt'>): Promise<BillingSubscription> {
    const id = `sub_${Date.now()}`;
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
   * Update the status of a subscription (e.g. from pending to paid or cancelled)
   */
  async updateSubscriptionStatus(
    identifier: string,
    status: 'paid' | 'pending' | 'failed' | 'cancelled',
    extra?: Partial<BillingSubscription>
  ): Promise<BillingSubscription | null> {
    const subs = this.getSubscriptions();
    const index = subs.findIndex(
      (s) => s.id === identifier || s.invoiceNumber === identifier || (s.orderId && s.orderId === identifier)
    );

    if (index === -1) return null;

    const existing = subs[index];
    const updated: BillingSubscription = {
      ...existing,
      ...extra,
      status,
      paidAt: status === 'paid' ? new Date().toISOString() : existing.paidAt,
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
    } catch (err) {
      console.warn('Failed to update subscription status in Supabase:', err);
    }

    return updated;
  }
}

export const billingPlanService = new BillingPlanService();
