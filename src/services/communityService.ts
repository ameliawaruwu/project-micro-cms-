import { Community, CommunityTurnoverInvoice, Store, Order, User } from '../types';
import { storeService } from './storeService';
import { supabase } from './supabaseClient';
import { hashPassword } from './authService';

const COMMUNITIES_KEY = 'microcms_communities_v1';
const INVOICES_KEY = 'microcms_community_invoices_v1';

export const DEFAULT_COMMUNITIES: Community[] = [
  {
    id: 'comm_sentra_umkm',
    name: 'Sentra UMKM Nusantara',
    slug: 'sentra-umkm',
    description:
      'Paguyuban wirausaha dan sentra lapak binaan terpadu dengan pembinaan digital & kurasi produk.',
    coordinatorName: 'Koordinator Sentra',
    coordinatorEmail: 'koordinator@sentraumkm.id',
    coordinatorPhone: '081298765432',
    turnoverFeePercent: 2.0,
    logoUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=200&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
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
      // Hapus data GMPS lama sesuai permintaan user
      const filtered = parsed.filter((c) => c.id !== 'comm_gmps' && c.slug !== 'gmps');
      if (filtered.length === 0) {
        localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(DEFAULT_COMMUNITIES));
        return DEFAULT_COMMUNITIES;
      }
      if (filtered.length !== parsed.length) {
        localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(filtered));
      }
      return filtered;
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

  /**
   * Mendaftarkan Organisasi/Komunitas baru beserta pembuatan akun Sub-Admin koordinatornya langsung ke Supabase
   */
  public async createOrganizationWithSubAdmin(data: {
    name: string;
    slug?: string;
    description?: string;
    coordinatorName: string;
    coordinatorEmail: string;
    coordinatorPhone?: string;
    password?: string;
    turnoverFeePercent?: number;
    logoUrl?: string;
  }): Promise<{ community: Community; user: User }> {
    const cleanEmail = data.coordinatorEmail.toLowerCase().trim();
    const commId = `comm_${Date.now()}`;
    const slug = (data.slug?.trim() || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || `org-${Date.now().toString().slice(-4)}`;
    const plainPassword = data.password || 'subadmin123';
    const hashedPassword = await hashPassword(plainPassword);

    // 1. Simpan Komunitas ke Local & Service State
    const newComm: Community = {
      id: commId,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || `Organisasi & Lapak Binaan ${data.name.trim()}`,
      coordinatorName: data.coordinatorName.trim(),
      coordinatorEmail: cleanEmail,
      coordinatorPhone: data.coordinatorPhone?.trim() || '',
      turnoverFeePercent: data.turnoverFeePercent !== undefined ? Number(data.turnoverFeePercent) : 2.5,
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=200&auto=format&fit=crop',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const communities = this.getCommunities().filter((c) => c.slug !== slug && c.id !== commId);
    communities.unshift(newComm);
    this.saveCommunities(communities);

    // 2. Buat / Daftarkan User Sub-Admin ke Database Supabase
    let userId = `USR_SUB_${Date.now().toString().slice(-6)}`;
    try {
      const { data: insertedUser, error: insertErr } = await supabase
        .from('users')
        .insert({
          email: cleanEmail,
          password_hash: hashedPassword,
          name: data.coordinatorName.trim(),
          phone: data.coordinatorPhone?.trim() || '',
          role: 'sub_admin',
          community_id: commId,
          community_name: newComm.name,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!insertErr && insertedUser) {
        userId = insertedUser.id;
      } else if (insertErr) {
        // Jika email sudah terdaftar (misal merchant lama dipromosikan jadi sub-admin organisasi)
        if (insertErr.code === '23505' || insertErr.message?.includes('duplicate key') || insertErr.message?.includes('users_email_key')) {
          const { data: updatedUser } = await supabase
            .from('users')
            .update({
              role: 'sub_admin',
              community_id: commId,
              community_name: newComm.name,
              password_hash: hashedPassword,
              updated_at: new Date().toISOString(),
            })
            .eq('email', cleanEmail)
            .select()
            .single();

          if (updatedUser) userId = updatedUser.id;
        } else {
          console.warn('[communityService] Warning insert sub_admin ke Supabase:', insertErr.message);
        }
      }
    } catch (e) {
      console.warn('[communityService] Exception saat insert sub_admin ke DB:', e);
    }

    const createdUser: User = {
      id: userId,
      name: data.coordinatorName.trim(),
      email: cleanEmail,
      phoneWhatsApp: data.coordinatorPhone?.trim() || '',
      role: 'sub_admin',
      communityId: commId,
      communityName: newComm.name,
      createdAt: new Date().toISOString(),
    };

    // 3. Sinkronkan ke cache lokal agar bisa login instan
    try {
      const accountsKey = 'microcms_accounts_v1';
      const rawAccounts = localStorage.getItem(accountsKey);
      let accounts: any[] = rawAccounts ? JSON.parse(rawAccounts) : [];
      accounts = accounts.filter((a) => a.email.toLowerCase() !== cleanEmail);
      accounts.push({
        id: userId,
        email: cleanEmail,
        password: hashedPassword,
        user: createdUser,
        merchant: {
          id: `merch-${userId}`,
          userId: userId,
          storeId: '',
          plan: 'premium',
          isVerified: true,
        },
        storeId: '',
      });
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
    } catch (e) {
      console.warn('[communityService] Gagal update cache akun lokal:', e);
    }

    return { community: newComm, user: createdUser };
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

  public async deleteCommunity(id: string): Promise<void> {
    const communities = this.getCommunities().filter((c) => c.id !== id);
    this.saveCommunities(communities);

    // Lepas seluruh toko yang terikat dengan komunitas ini
    try {
      const allStores = await storeService.getStores();
      const linkedStores = allStores.filter((s) => s.communityId === id);
      for (const st of linkedStores) {
        await storeService.updateStore(st.id, {
          communityId: undefined,
          communityName: undefined,
        });
      }
    } catch (e) {
      console.warn('Gagal unlink toko saat hapus komunitas:', e);
    }
  }

  /**
   * Mengambil daftar toko/lapak yang bernaung di bawah suatu komunitas tertentu
   */
  public async getCommunityStores(communityId: string): Promise<Store[]> {
    const allStores = await storeService.getStores();
    return allStores.filter((s) => s.communityId === communityId);
  }

  /**
   * Menetapkan toko merchant ke dalam komunitas tertentu
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
   * Mendapatkan daftar invoice tagihan omset berkala untuk komunitas
   */
  public getCommunityInvoices(communityId?: string): CommunityTurnoverInvoice[] {
    const raw = localStorage.getItem(INVOICES_KEY);
    let invoices: CommunityTurnoverInvoice[] = [];
    if (raw) {
      try {
        invoices = JSON.parse(raw);
        // Hapus invoice GMPS lama
        invoices = invoices.filter((i) => i.communityId !== 'comm_gmps');
      } catch {
        invoices = [];
      }
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
      invoiceNumber: `INV-${comm?.slug?.toUpperCase() || 'ORG'}-${Date.now().toString().slice(-6)}`,
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
