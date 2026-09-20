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

const STORAGE_KEY = 'kroomify_domain_requests_v1';

const INITIAL_REQUESTS: DomainRequest[] = [
  {
    id: 'req_001',
    storeId: 'store-andhika',
    storeName: 'Toko Andhika',
    domainName: 'andhikastore',
    tld: '.com',
    fullDomain: 'andhikastore.com',
    price: 250000,
    status: 'approved',
    invoiceNumber: 'INV-DOM-2026-001',
    adminNotes: 'Domain tersedia di IDCloudHost. Siap untuk proses pembayaran.',
    createdAt: '2026-09-16T08:00:00Z',
    updatedAt: '2026-09-16T09:30:00Z',
  },
];

class DomainRequestService {
  private getStoredRequests(): DomainRequest[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
      return INITIAL_REQUESTS;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  }

  private saveStoredRequests(requests: DomainRequest[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
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
   * Ambil semua data permohonan domain (Admin & Merchant)
   */
  async getAllRequests(): Promise<DomainRequest[]> {
    const requestsMap = new Map<string, DomainRequest>();

    // 1. Ambil dari local cache dulu
    const stored = this.getStoredRequests();
    for (const r of stored) {
      requestsMap.set(r.id, r);
    }

    // 2. Ambil dari Supabase table domain_requests
    try {
      const { data, error } = await supabase
        .from('domain_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const mapped = this.mapRowToDomainRequest(row);
          requestsMap.set(mapped.id, mapped);
        }
      } else if (error) {
        console.warn('Supabase domain_requests query error:', error.message);
      }
    } catch (err) {
      console.warn('Failed to fetch from domain_requests table:', err);
    }

    // 3. Fallback/Sync dari stores.theme_settings jika ada request toko yang belum di tabel
    try {
      const stores = await storeService.getStores();
      for (const s of stores) {
        const req = (s as any).layoutSettings?.domainRequest as DomainRequest | undefined;
        if (req && req.id && !requestsMap.has(req.id)) {
          requestsMap.set(req.id, req);
        }
      }
    } catch {
      // ignore
    }

    const all = Array.from(requestsMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.saveStoredRequests(all);
    return all;
  }

  /**
   * Ambil permohonan domain untuk toko tertentu
   */
  async getRequestByStore(storeId: string): Promise<DomainRequest | null> {
    try {
      const { data, error } = await supabase
        .from('domain_requests')
        .select('*')
        .eq('store_id', storeId)
        .order('requested_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        return this.mapRowToDomainRequest(data[0]);
      }
    } catch {
      // fallback
    }

    const all = await this.getAllRequests();
    const match = all.find((r) => r.storeId === storeId);
    return match || null;
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

    // 1. Simpan ke local cache
    const current = this.getStoredRequests().filter((r) => r.storeId !== storeId);
    this.saveStoredRequests([newRequest, ...current]);

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
    const current = this.getStoredRequests();
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
      this.saveStoredRequests(current);

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
    const current = this.getStoredRequests();
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
      this.saveStoredRequests(current);

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
    const current = this.getStoredRequests();
    const index = current.findIndex((r) => r.id === requestId);
    const req = index !== -1 ? current[index] : null;

    const now = new Date().toISOString();

    if (req && index !== -1) {
      const updated: DomainRequest = {
        ...req,
        status: 'active',
        updatedAt: now,
      };

      current[index] = updated;
      this.saveStoredRequests(current);

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
