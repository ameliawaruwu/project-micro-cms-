import { Community, CommunityTurnoverInvoice, Store, Order } from '../types';
import { storeService } from './storeService';
import { supabase } from './supabaseClient';

const COMMUNITIES_KEY = 'microcms_communities_v1';
const INVOICES_KEY = 'microcms_community_invoices_v1';

export const DEFAULT_COMMUNITIES: Community[] = [
  {
    id: 'comm_gmps',
    name: 'Komunitas GMPS (Gerakan Masyarakat Peduli Sejahtera)',
    slug: 'gmps',
    description:
      'Paguyuban UMKM & Lapak Komunitas Binaan GMPS. Mengelola lapak anggota secara terpusat dengan skema tagihan berbasis persentase omset.',
    coordinatorName: 'Koordinator GMPS',
    coordinatorEmail: 'gmps@kroomify.id',
    coordinatorPhone: '081234567890',
    turnoverFeePercent: 2.5,
    logoUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'comm_kampus',
    name: 'Sentra UMKM & Wirausaha Mahasiswa',
    slug: 'umkm-kampus',
    description:
      'Wadah lapak wirausaha kreatif mahasiswa & tenant inkubator bisnis kampus.',
    coordinatorName: 'Admin Sentra Bisnis',
    coordinatorEmail: 'wirausaha@kampus.ac.id',
    coordinatorPhone: '081399887766',
    turnoverFeePercent: 2.0,
    logoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

class CommunityService {
  public getCommunities(): Community[] {
    const raw = localStorage.getItem(COMMUNITIES_KEY);
    if (!raw) {
      localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(DEFAULT_COMMUNITIES));
      return DEFAULT_COMMUNITIES;
    }
    try {
      const parsed: Community[] = JSON.parse(raw);
      if (parsed.length === 0) {
        localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(DEFAULT_COMMUNITIES));
        return DEFAULT_COMMUNITIES;
      }
      return parsed;
    } catch {
      return DEFAULT_COMMUNITIES;
    }
  }

  public saveCommunities(list: Community[]): void {
    localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(list));
  }

  public getCommunityById(id: string): Community | undefined {
    return this.getCommunities().find((c) => c.id === id || c.slug === id);
  }

  public createCommunity(data: Omit<Community, 'id' | 'createdAt'>): Community {
    const communities = this.getCommunities();
    const newComm: Community = {
      ...data,
      id: `comm_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    communities.unshift(newComm);
    this.saveCommunities(communities);
    return newComm;
  }

  public updateCommunity(id: string, updates: Partial<Community>): Community {
    const communities = this.getCommunities();
    const idx = communities.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Komunitas tidak ditemukan');

    communities[idx] = {
      ...communities[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveCommunities(communities);
    return communities[idx];
  }

  public deleteCommunity(id: string): void {
    const communities = this.getCommunities().filter((c) => c.id !== id);
    this.saveCommunities(communities);
  }

  /**
   * Mengambil daftar toko/lapak yang bernaung di bawah suatu komunitas (misal GMPS)
   */
  public async getCommunityStores(communityId: string): Promise<Store[]> {
    const allStores = await storeService.getStores();
    return allStores.filter((s) => s.communityId === communityId || (communityId === 'comm_gmps' && (!s.communityId || s.communityId === 'comm_gmps')));
  }

  /**
   * Menetapkan toko merchant ke dalam komunitas tertentu (misal GMPS)
   */
  public async assignStoreToCommunity(
    storeId: string,
    communityId: string,
    communityName: string
  ): Promise<Store> {
    const updated = await storeService.updateStore(storeId, {
      communityId,
      communityName,
    });
    return updated;
  }

  /**
   * Menghitung total omset seluruh toko binaan komunitas berdasarkan pesanan
   */
  public calculateCommunityTurnover(
    communityId: string,
    communityStores: Store[],
    allOrders: Order[]
  ): {
    totalTurnover: number;
    completedOrdersCount: number;
    activeStoresCount: number;
  } {
    const storeIdSet = new Set(communityStores.map((s) => s.id));
    const matchingOrders = allOrders.filter(
      (o) =>
        storeIdSet.has(o.storeId) &&
        (o.paymentStatus === 'Sudah Dibayar' || o.shippingStatus === 'Selesai' || o.paymentMethod?.includes('COD'))
    );

    const totalTurnover = matchingOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    return {
      totalTurnover,
      completedOrdersCount: matchingOrders.length,
      activeStoresCount: communityStores.filter((s) => s.isPublished).length,
    };
  }

  /**
   * Mendapatkan daftar invoice tagihan omset berkala untuk komunitas (GMPS)
   */
  public getCommunityInvoices(communityId?: string): CommunityTurnoverInvoice[] {
    const raw = localStorage.getItem(INVOICES_KEY);
    let invoices: CommunityTurnoverInvoice[] = [];
    if (raw) {
      try {
        invoices = JSON.parse(raw);
      } catch {
        invoices = [];
      }
    }

    if (invoices.length === 0) {
      // Buat default billing contoh untuk GMPS
      const sampleInvoices: CommunityTurnoverInvoice[] = [
        {
          id: 'inv_comm_101',
          communityId: 'comm_gmps',
          communityName: 'Komunitas GMPS',
          invoiceNumber: 'INV-GMPS-202610',
          period: 'Oktober 2026',
          totalTurnover: 12500000,
          feePercent: 2.5,
          totalBilled: 312500, // 12.500.000 * 2.5%
          status: 'paid',
          dueDate: '2026-11-05T00:00:00Z',
          paidAt: '2026-10-28T14:20:00Z',
          createdAt: '2026-10-01T00:00:00Z',
        },
        {
          id: 'inv_comm_102',
          communityId: 'comm_gmps',
          communityName: 'Komunitas GMPS',
          invoiceNumber: 'INV-GMPS-202611',
          period: 'November 2026 (Berjalan)',
          totalTurnover: 4850000,
          feePercent: 2.5,
          totalBilled: 121250, // 4.850.000 * 2.5%
          status: 'unpaid',
          dueDate: '2026-12-05T00:00:00Z',
          createdAt: '2026-11-01T00:00:00Z',
        },
      ];
      localStorage.setItem(INVOICES_KEY, JSON.stringify(sampleInvoices));
      invoices = sampleInvoices;
    }

    if (communityId) {
      return invoices.filter((inv) => inv.communityId === communityId);
    }
    return invoices;
  }

  public markInvoicePaid(invoiceId: string): void {
    const all = this.getCommunityInvoices();
    const idx = all.findIndex((i) => i.id === invoiceId);
    if (idx !== -1) {
      all[idx].status = 'paid';
      all[idx].paidAt = new Date().toISOString();
      localStorage.setItem(INVOICES_KEY, JSON.stringify(all));
    }
  }

  public createTurnoverInvoice(
    communityId: string,
    period: string,
    totalTurnover: number,
    feePercent: number
  ): CommunityTurnoverInvoice {
    const all = this.getCommunityInvoices();
    const comm = this.getCommunityById(communityId);
    const totalBilled = Math.round(totalTurnover * (feePercent / 100));

    const newInv: CommunityTurnoverInvoice = {
      id: `inv_comm_${Date.now()}`,
      communityId,
      communityName: comm?.name || 'Komunitas',
      invoiceNumber: `INV-${comm?.slug?.toUpperCase() || 'COMM'}-${Date.now().toString().slice(-6)}`,
      period,
      totalTurnover,
      feePercent,
      totalBilled,
      status: 'unpaid',
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    all.unshift(newInv);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(all));
    return newInv;
  }
}

export const communityService = new CommunityService();

