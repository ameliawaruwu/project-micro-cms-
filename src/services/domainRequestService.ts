import { supabase } from './supabaseClient';
import { storeService } from './storeService';

export interface DomainRequest {
  id: string;
  storeId: string;
  storeName: string;
  domainName: string;
  tld: string;
  fullDomain: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'active';
  adminSuggestions?: string[];
  adminNotes?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export const DOMAIN_TLD_PRICES: Record<string, { price: number; label: string; popular?: boolean }> = {
  '.com': { price: 250000, label: 'Rp 250.000 / thn', popular: true },
  '.id': { price: 250000, label: 'Rp 250.000 / thn', popular: true },
  '.org': { price: 200000, label: 'Rp 200.000 / thn' },
  '.online': { price: 85000, label: 'Rp 85.000 / thn' },
  '.top': { price: 50000, label: 'Rp 50.000 / thn' },
};

// ============================================================
// MERCHANT DATA ISOLATION: localStorage dipartisi per storeId
// Key format: kroomify_domain_v2_{storeId}
// ============================================================
const STORAGE_KEY_PREFIX = 'kroomify_domain_v2_';
// Key untuk admin (semua requests)
const ADMIN_STORAGE_KEY = 'kroomify_domain_requests_admin_v1';
// Hapus key global lama
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('kroomify_domain_requests_v1');
  } catch { /* ignore */ }
}

class DomainRequestService {
  private storeKey(storeId: string): string {
    return `${STORAGE_KEY_PREFIX}${storeId}`;
  }

  private getStoredRequestsForStore(storeId: string): DomainRequest[] {
    const raw = localStorage.getItem(this.storeKey(storeId));
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveStoredRequestsForStore(storeId: string, requests: DomainRequest[]) {
    localStorage.setItem(this.storeKey(storeId), JSON.stringify(requests));
  }

  // Admin cache: semua requests dari semua toko
  private getAdminStoredRequests(): DomainRequest[] {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveAdminStoredRequests(requests: DomainRequest[]) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(requests));
  }

  private mapRowToDomainRequest(d: any): DomainRequest {
    const domainName = d.requested_domain || d.domain_name || '';
    const tld = d.tld || '.com';
    const fullDomain = d.full_domain || `${domainName}${tld}`;
    const price = Number(d.tld_price ?? d.price ?? 250000);
    const suggestions = Array.isArray(d.suggestions)
      ? d.suggestions
      : Array.isArray(d.admin_suggestions)
      ? d.admin_suggestions
      : [];
    const createdAt = d.requested_at || d.created_at || d.updated_at || new Date().toISOString();
    const updatedAt = d.updated_at || d.requested_at || createdAt;

    return {
      id: d.id,
      storeId: d.store_id,
      storeName: d.store_name || 'Toko Kroomify',
      domainName,
      tld,
      fullDomain,
      price,
      status: d.status || 'pending',
      adminSuggestions: suggestions,
      adminNotes: d.admin_notes || '',
      invoiceNumber: d.invoice_number || '',
      createdAt,
      updatedAt,
    };
  }

  /**
   * Ambil semua data permohonan domain (Khusus ADMIN)
   * Merchant harus gunakan getRequestsByMerchant(storeId)
   */
  async getAllRequests(): Promise<DomainRequest[]> {
    const requestsMap = new Map<string, DomainRequest>();

    // 1. Ambil dari admin cache
    const adminCached = this.getAdminStoredRequests();
    for (const r of adminCached) {
      requestsMap.set(r.id, r);
    }

    // 2. Ambil semua dari Supabase (admin view)
    try {
      const { data, error } = await supabase
        .from('domain_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const mapped = this.mapRowToDomainRequest(row);
          requestsMap.set(mapped.id, mapped);
          // Juga update cache per-toko
          const storeCached = this.getStoredRequestsForStore(mapped.storeId);
          const existingIdx = storeCached.findIndex((r) => r.id === mapped.id);
          if (existingIdx !== -1) {
            storeCached[existingIdx] = mapped;
          } else {
            storeCached.unshift(mapped);
          }
          this.saveStoredRequestsForStore(mapped.storeId, storeCached);
        }
      } else if (error) {
        console.warn('Supabase domain_requests query error:', error.message);
      }
    } catch (err) {
      console.warn('Failed to fetch from domain_requests table:', err);
    }

    const all = Array.from(requestsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.saveAdminStoredRequests(all);
    return all;
  }

  /**
   * Ambil permohonan domain milik merchant tertentu (terisolasi per store)
   */
  async getRequestsByMerchant(storeId: string): Promise<DomainRequest[]> {
    // 1. Ambil dari cache per-toko
    const cached = this.getStoredRequestsForStore(storeId);

    // 2. Sync dari Supabase (filter by store_id)
    try {
      const { data, error } = await supabase
        .from('domain_requests')
        .select('*')
        .eq('store_id', storeId) // ownership filter!
        .order('requested_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const mapped = data.map((row) => this.mapRowToDomainRequest(row));
        this.saveStoredRequestsForStore(storeId, mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Failed to fetch merchant domain requests:', err);
    }

    return cached;
  }

  /**
   * Ambil permohonan domain untuk toko tertentu (terisolasi)
   */
  async getRequestByStore(storeId: string): Promise<DomainRequest | null> {
    try {
      const { data, error } = await supabase
        .from('domain_requests')
        .select('*')
        .eq('store_id', storeId) // ownership filter
        .order('requested_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const mapped = this.mapRowToDomainRequest(data[0]);
        // Update cache per-toko
        const cached = this.getStoredRequestsForStore(storeId);
        const idx = cached.findIndex((r) => r.id === mapped.id);
        if (idx !== -1) cached[idx] = mapped; else cached.unshift(mapped);
        this.saveStoredRequestsForStore(storeId, cached);
        return mapped;
      }
    } catch {
      // fallback
    }

    const cached = this.getStoredRequestsForStore(storeId);
    return cached[0] || null;
  }

  /**
   * Merchant membuat permohonan domain baru
   */
  async createRequest(
    storeId: string,
    storeName: string,
    domainName: string,
    tld: string
  ): Promise<{ success: boolean; request?: DomainRequest; message: string }> {
    const cleanDomain = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleanDomain) {
      return { success: false, message: 'Nama domain tidak boleh kosong.' };
    }

    if (!DOMAIN_TLD_PRICES[tld]) {
      return { success: false, message: 'Ekstensi domain tidak didukung.' };
    }

    const price = DOMAIN_TLD_PRICES[tld].price;
    const fullDomain = `${cleanDomain}${tld}`;
    const id = `dom_${Date.now()}`;
    const now = new Date().toISOString();

    const newRequest: DomainRequest = {
      id,
      storeId,
      storeName,
      domainName: cleanDomain,
      tld,
      fullDomain,
      price,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    // 1. Simpan ke cache per-toko (isolasi merchant)
    const storeCached = this.getStoredRequestsForStore(storeId).filter((r) => r.storeId !== storeId);
    this.saveStoredRequestsForStore(storeId, [newRequest, ...storeCached]);

    // 2. Update admin cache juga
    const adminCached = this.getAdminStoredRequests().filter((r) => r.storeId !== storeId);
    this.saveAdminStoredRequests([newRequest, ...adminCached]);

    // 2. Pastikan store ada di Supabase stores (Foreign Key domain_requests -> stores(id))
    try {
      const store = await storeService.getStoreById(storeId);
      if (store) {
        await supabase.from('stores').upsert({
          id: store.id,
          user_id: store.merchantId,
          name: store.name,
          slug: store.slug,
          theme_settings: {
            ...(store.layoutSettings || {}),
            domainRequest: newRequest,
          } as any,
          updated_at: now,
        });
      }
    } catch (storeErr) {
      console.warn('Store sync notice before domain request insert:', storeErr);
    }

    // 3. Simpan ke tabel domain_requests Supabase dengan skema kolom yang tepat
    try {
      const { error } = await supabase.from('domain_requests').upsert({
        id: newRequest.id,
        store_id: newRequest.storeId,
        store_name: newRequest.storeName,
        requested_domain: newRequest.domainName,
        tld: newRequest.tld,
        tld_price: newRequest.price,
        status: 'pending',
        admin_notes: null,
        suggestions: [],
        invoice_number: null,
        payment_status: 'unpaid',
        requested_at: newRequest.createdAt,
        updated_at: newRequest.updatedAt,
      });

      if (error) {
        console.error('Supabase domain_requests insert error:', error);
      } else {
        console.log('Domain request successfully saved to Supabase:', newRequest.id);
      }
    } catch (dbErr) {
      console.error('Supabase domain_requests unexpected error:', dbErr);
    }

    return {
      success: true,
      request: newRequest,
      message: `Permohonan domain ${fullDomain} berhasil diajukan! Admin sedang mengecek ketersediaan.`,
    };
  }

  /**
   * Super Admin menyetujui permohonan domain
   */
  async approveRequest(requestId: string, price?: number): Promise<boolean> {
    // Cari di admin cache
    const current = this.getAdminStoredRequests();
    const index = current.findIndex((r) => r.id === requestId);
    const req = index !== -1 ? current[index] : null;

    const now = new Date().toISOString();
    const finalPrice = price !== undefined ? price : req?.price || 250000;
    const invoiceNumber = `INV-DOM-${Date.now().toString().slice(-6)}`;
    const adminNotes = 'Domain tersedia dan telah disetujui. Silakan lakukan pembayaran.';

    if (req && index !== -1) {
      const updated: DomainRequest = {
        ...req,
        price: finalPrice,
        status: 'approved',
        invoiceNumber,
        adminNotes,
        updatedAt: now,
      };

      current[index] = updated;
      this.saveAdminStoredRequests(current);

      // Update juga cache per-toko
      const storeCached = this.getStoredRequestsForStore(req.storeId);
      const storeIdx = storeCached.findIndex((r) => r.id === requestId);
      if (storeIdx !== -1) {
        storeCached[storeIdx] = updated;
      } else {
        storeCached.unshift(updated);
      }
      this.saveStoredRequestsForStore(req.storeId, storeCached);

      // Sync ke Supabase store layoutSettings
      try {
        const store = await storeService.getStoreById(req.storeId);
        const updatedSettings = {
          ...(store?.layoutSettings || {}),
          domainRequest: updated,
        };
        await supabase
          .from('stores')
          .update({
            theme_settings: updatedSettings as any,
            updated_at: now,
          })
          .eq('id', req.storeId);
      } catch (err) {
        console.warn('Failed sync approve to Supabase store:', err);
      }
    }

    // Sync ke domain_requests table di Supabase
    try {
      const { error } = await supabase
        .from('domain_requests')
        .update({
          status: 'approved',
          tld_price: finalPrice,
          invoice_number: invoiceNumber,
          admin_notes: adminNotes,
          approved_at: now,
          updated_at: now,
        })
        .eq('id', requestId);

      if (error) {
        console.error('Supabase approve error:', error);
      }
    } catch (err) {
      console.warn('Failed update Supabase domain_requests approve:', err);
    }

    return true;
  }

  /**
   * Super Admin menolak permohonan domain dan memberikan rekomendasi alternatif
   */
  async rejectRequest(
    requestId: string,
    suggestions: string[],
    adminNotes?: string
  ): Promise<boolean> {
    const current = this.getAdminStoredRequests();
    const index = current.findIndex((r) => r.id === requestId);
    const req = index !== -1 ? current[index] : null;

    const now = new Date().toISOString();
    const cleanSuggestions = suggestions.filter((s) => s.trim().length > 0);
    const finalNotes =
      adminNotes ||
      `Domain ${req?.fullDomain || ''} saat ini tidak tersedia. Silakan pilih salah satu saran domain alternatif berikut.`;

    if (req && index !== -1) {
      const updated: DomainRequest = {
        ...req,
        status: 'rejected',
        adminSuggestions: cleanSuggestions,
        adminNotes: finalNotes,
        updatedAt: now,
      };

      current[index] = updated;
      this.saveAdminStoredRequests(current);

      // Update cache per-toko
      const storeCached = this.getStoredRequestsForStore(req.storeId);
      const storeIdx = storeCached.findIndex((r) => r.id === requestId);
      if (storeIdx !== -1) {
        storeCached[storeIdx] = updated;
      } else {
        storeCached.unshift(updated);
      }
      this.saveStoredRequestsForStore(req.storeId, storeCached);

      // Sync ke store theme_settings
      try {
        const store = await storeService.getStoreById(req.storeId);
        const updatedSettings = {
          ...(store?.layoutSettings || {}),
          domainRequest: updated,
        };
        await supabase
          .from('stores')
          .update({
            theme_settings: updatedSettings as any,
            updated_at: now,
          })
          .eq('id', req.storeId);
      } catch (err) {
        console.warn('Failed sync reject to Supabase store:', err);
      }
    }

    // Sync ke Supabase domain_requests table
    try {
      const { error } = await supabase
        .from('domain_requests')
        .update({
          status: 'rejected',
          suggestions: cleanSuggestions,
          admin_notes: finalNotes,
          updated_at: now,
        })
        .eq('id', requestId);

      if (error) {
        console.error('Supabase reject error:', error);
      }
    } catch (err) {
      console.warn('Failed update Supabase domain_requests reject:', err);
    }

    return true;
  }

  /**
   * Menandai domain lunas dan aktifkan koneksi ke toko
   */
  async markAsPaidAndActivate(requestId: string): Promise<boolean> {
    const adminCached = this.getAdminStoredRequests();
    const index = adminCached.findIndex((r) => r.id === requestId);
    const req = index !== -1 ? adminCached[index] : null;

    const now = new Date().toISOString();

    if (req && index !== -1) {
      const updated: DomainRequest = {
        ...req,
        status: 'active',
        updatedAt: now,
      };

      adminCached[index] = updated;
      this.saveAdminStoredRequests(adminCached);

      // Update cache per-toko
      const storeCached = this.getStoredRequestsForStore(req.storeId);
      const storeIdx = storeCached.findIndex((r) => r.id === requestId);
      if (storeIdx !== -1) {
        storeCached[storeIdx] = updated;
      } else {
        storeCached.unshift(updated);
      }
      this.saveStoredRequestsForStore(req.storeId, storeCached);

      // Update Store dengan custom domain aktif
      await storeService.updateStore(req.storeId, {
        customDomain: req.fullDomain,
        domainType: 'custom',
        domainStatus: 'connected',
      });
    }

    // Update di Supabase stores
    if (req) {
      try {
        await supabase
          .from('stores')
          .update({
            custom_domain: req.fullDomain,
            domain_status: 'connected',
            updated_at: now,
          })
          .eq('id', req.storeId);
      } catch {
        // ignore
      }
    }

    // Update di Supabase domain_requests table
    try {
      await supabase
        .from('domain_requests')
        .update({
          status: 'active',
          payment_status: 'paid',
          activated_at: now,
          updated_at: now,
        })
        .eq('id', requestId);
    } catch {
      // ignore
    }

    return true;
  }
}

export const domainRequestService = new DomainRequestService();
