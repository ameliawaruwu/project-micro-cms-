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

  /**
   * Ambil semua data permohonan domain (Admin & Merchant)
   */
  async getAllRequests(): Promise<DomainRequest[]> {
    // 1. Coba fetch dari Supabase stores.theme_settings atau tabel domain_requests
    try {
      const { data, error } = await supabase.from('domain_requests').select('*');
      if (!error && data && data.length > 0) {
        const mapped: DomainRequest[] = data.map((d: any) => ({
          id: d.id,
          storeId: d.store_id,
          storeName: d.store_name,
          domainName: d.domain_name,
          tld: d.tld,
          fullDomain: d.full_domain || `${d.domain_name}${d.tld}`,
          price: Number(d.price || 0),
          status: d.status,
          adminSuggestions: d.admin_suggestions || [],
          adminNotes: d.admin_notes || '',
          invoiceNumber: d.invoice_number || '',
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
        this.saveStoredRequests(mapped);
        return mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch {
      // Fallback
    }

    return this.getStoredRequests().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Ambil permohonan domain untuk toko tertentu
   */
  async getRequestByStore(storeId: string): Promise<DomainRequest | null> {
    const requests = await this.getAllRequests();
    const match = requests.find((r) => r.storeId === storeId);
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
    const id = `req_${Date.now()}`;
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

    // 2. Simpan ke Supabase stores (di kolom theme_settings)
    try {
      const store = await storeService.getStoreById(storeId);
      const updatedSettings = {
        ...(store?.layoutSettings || {}),
        domainRequest: newRequest,
      };
      await supabase
        .from('stores')
        .update({
          theme_settings: updatedSettings as any,
          updated_at: now,
        })
        .eq('id', storeId);
    } catch (dbErr) {
      console.warn('Supabase store domainRequest notice:', dbErr);
    }

    // 3. Coba insert ke tabel domain_requests jika ada
    try {
      await supabase.from('domain_requests').insert([
        {
          id: newRequest.id,
          store_id: newRequest.storeId,
          store_name: newRequest.storeName,
          domain_name: newRequest.domainName,
          tld: newRequest.tld,
          full_domain: newRequest.fullDomain,
          price: newRequest.price,
          status: newRequest.status,
          created_at: newRequest.createdAt,
          updated_at: newRequest.updatedAt,
        },
      ]);
    } catch {
      // ignore if table doesn't exist yet
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
    if (index === -1) return false;

    const now = new Date().toISOString();
    const req = current[index];
    const finalPrice = price !== undefined ? price : req.price;
    const invoiceNumber = `INV-DOM-${Date.now().toString().slice(-6)}`;

    const updated: DomainRequest = {
      ...req,
      price: finalPrice,
      status: 'approved',
      invoiceNumber,
      adminNotes: 'Domain tersedia dan telah disetujui. Silakan lakukan pembayaran.',
      updatedAt: now,
    };

    current[index] = updated;
    this.saveStoredRequests(current);

    // Sync ke Supabase store
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
      console.warn('Failed sync approve to Supabase:', err);
    }

    // Sync ke domain_requests table jika ada
    try {
      await supabase
        .from('domain_requests')
        .update({
          status: 'approved',
          price: finalPrice,
          invoice_number: invoiceNumber,
          admin_notes: updated.adminNotes,
          updated_at: now,
        })
        .eq('id', requestId);
    } catch {
      // ignore
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
    if (index === -1) return false;

    const now = new Date().toISOString();
    const req = current[index];

    const updated: DomainRequest = {
      ...req,
      status: 'rejected',
      adminSuggestions: suggestions.filter((s) => s.trim().length > 0),
      adminNotes:
        adminNotes ||
        `Domain ${req.fullDomain} saat ini tidak tersedia. Silakan pilih salah satu saran domain alternatif berikut.`,
      updatedAt: now,
    };

    current[index] = updated;
    this.saveStoredRequests(current);

    // Sync ke Supabase
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
      console.warn('Failed sync reject to Supabase:', err);
    }

    return true;
  }

  /**
   * Menandai domain lunas dan aktifkan koneksi ke toko
   */
  async markAsPaidAndActivate(requestId: string): Promise<boolean> {
    const current = this.getStoredRequests();
    const index = current.findIndex((r) => r.id === requestId);
    if (index === -1) return false;

    const now = new Date().toISOString();
    const req = current[index];

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

    try {
      await supabase
        .from('stores')
        .update({
          custom_domain: req.fullDomain,
          updated_at: now,
        })
        .eq('id', req.storeId);
    } catch {
      // ignore
    }

    return true;
  }
}

export const domainRequestService = new DomainRequestService();
