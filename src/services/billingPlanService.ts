import { BillingPlan, BillingSubscription } from '../types';
import { supabase } from './supabaseClient';

const BILLING_PLANS_KEY = 'microcms_billing_plans_v1';
const SUBSCRIPTIONS_KEY = 'microcms_store_subscriptions_v1';

export const DEFAULT_BILLING_PLANS: BillingPlan[] = [
  {
    id: 'plan_free',
    name: 'Starter (Gratis)',
    slug: 'free',
    tagline: 'Cocok untuk toko baru yang mulai berjualan online',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Katalog produk hingga 25 item',
      'Checkout otomatis via Midtrans (QRIS & VA)',
      'Cek ongkir otomatis ekspedisi (J&T, JNE)',
      'Watermark resmi Kroombox di footer toko',
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'plan_pro',
    name: 'Pro UMKM',
    slug: 'premium',
    tagline: 'Fitur lengkap tanpa batas untuk meningkatkan omset toko',
    priceMonthly: 99000,
    priceYearly: 950000,
    features: [
      'Unlimited katalog produk & varian',
      'Bebas watermark (white-label brand sendiri)',
      'Semua metode pembayaran Midtrans (QRIS, VA Bank, Kartu Kredit)',
      'Visual layout builder & kustomisasi banner toko',
      'Cetak label pengiriman thermal massal',
      'Laporan analitik penjualan & omset real-time',
      'Prioritas bantuan customer support',
    ],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'plan_scaleup',
    name: 'Bisnis Scale-Up',
    slug: 'business',
    tagline: 'Untuk bisnis UMKM berkembang dengan tim & cabang',
    priceMonthly: 249000,
    priceYearly: 2400000,
    features: [
      'Semua fitur paket Pro UMKM',
      'Akses multi-staf pengelola toko (hingga 5 admin)',
      'Dukungan custom domain toko (.com / .id)',
      'Notifikasi otomatis WhatsApp bot ke pembeli',
      'Dedicated Account Manager 24/7',
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
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BILLING_PLANS;
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
}

export const billingPlanService = new BillingPlanService();
