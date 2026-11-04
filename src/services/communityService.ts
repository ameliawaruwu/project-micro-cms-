import { Community, CommunityTurnoverInvoice, Store, Order, User } from '../types';
import { storeService } from './storeService';
import { supabase } from './supabaseClient';
import { hashPassword, authService } from './authService';

const COMMUNITIES_KEY = 'microcms_communities_v1';
const INVOICES_KEY = 'microcms_community_invoices_v1';

export const DEFAULT_COMMUNITIES: Community[] = [];

class CommunityService {
  public getCommunities(): Community[] {
    const raw = localStorage.getItem(COMMUNITIES_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed: Community[] = JSON.parse(raw);
      // Bersihkan data dummy lama (Sentra UMKM, GMPS lama, dsb.)
      const filtered = parsed.filter(
        (c) =>
          c.id !== 'comm_sentra_umkm' &&
          c.id !== 'comm_default' &&
          c.slug !== 'sentra-umkm' &&
          c.id !== 'comm_gmps' &&
          c.slug !== 'gmps-dummy'
      );
      if (filtered.length !== parsed.length) {
        localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  }

  public async fetchCommunitiesFromDatabase(): Promise<Community[]> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: Community[] = data
          .filter(
            (r) =>
              r.id !== 'comm_sentra_umkm' &&
              r.id !== 'comm_default' &&
              r.slug !== 'sentra-umkm'
          )
          .map((r) => ({
            id: r.id,
            name: r.name,
            slug: r.slug || r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: r.description || '',
            coordinatorName: r.coordinator_name || '',
            coordinatorEmail: r.coordinator_email,
            coordinatorPhone: r.coordinator_phone || '',
            turnoverFeePercent: Number(r.turnover_fee_percent || 2.5),
            logoUrl: r.logo_url || undefined,
            baseDomain: r.base_domain || undefined,
            status: (r.status as 'active' | 'pending' | 'inactive') || 'active',
            createdAt: r.created_at || new Date().toISOString(),
          }));

        this.saveCommunities(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[communityService] Error fetching communities from database:', e);
    }
    return this.getCommunities();
  }

  public saveCommunities(list: Community[]): void {
    localStorage.setItem(COMMUNITIES_KEY, JSON.stringify(list));
  }

  public getCommunityById(id: string): Community | undefined {
    return this.getCommunities().find((c) => c.id === id || c.slug === id);
  }

  /**
   * Mencari komunitas berdasarkan kode referral (slug / nama / id)
   */
  public async findCommunityByCode(code: string): Promise<Community | undefined> {
    if (!code || !code.trim()) return undefined;
    const clean = code.trim().toLowerCase();

    // 1. Cek dari cache lokal
    const local = this.getCommunities().find(
      (c) =>
        c.slug?.toLowerCase() === clean ||
        c.name.toLowerCase() === clean ||
        c.id.toLowerCase() === clean
    );
    if (local) return local;

    // 2. Cek langsung ke database Supabase
    try {
      const { data } = await supabase
        .from('communities')
        .select('*')
        .or(`slug.ilike.${clean},name.ilike.${clean},id.ilike.${clean}`)
        .maybeSingle();

      if (data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          coordinatorName: data.coordinator_name || '',
          coordinatorEmail: data.coordinator_email,
          coordinatorPhone: data.coordinator_phone || '',
          turnoverFeePercent: Number(data.turnover_fee_percent || 2.5),
          logoUrl: data.logo_url || undefined,
          status: data.status || 'active',
          createdAt: data.created_at || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('[communityService] Error querying community by code:', e);
    }
    return undefined;
  }

  /**
   * Mendaftarkan Organisasi/Komunitas baru beserta pembuatan akun Sub-Admin koordinatornya langsung ke Supabase
   */
  public async createOrganizationWithSubAdmin(data: {
    name: string;
    description?: string;
    coordinatorName: string;
    coordinatorEmail: string;
    coordinatorPhone?: string;
    password?: string;
    logoUrl?: string;
    baseDomain?: string;
  }): Promise<{ community: Community; user: User }> {
    const cleanEmail = data.coordinatorEmail.toLowerCase().trim();
    const commId = `comm_${Date.now()}`;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `org-${Date.now().toString().slice(-4)}`;
    const plainPassword = data.password || 'subadmin123';
    const hashedPassword = await hashPassword(plainPassword);
    const turnoverFeePercent = 2.5; // Fee ditagihkan di akhir saat penerbitan invoice omset

    // 1. Simpan Komunitas ke Local & Service State
    const newComm: Community = {
      id: commId,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || `Organisasi & Lapak Binaan ${data.name.trim()}`,
      coordinatorName: data.coordinatorName.trim(),
      coordinatorEmail: cleanEmail,
      coordinatorPhone: data.coordinatorPhone?.trim() || '',
      turnoverFeePercent,
      logoUrl: data.logoUrl || undefined,
      baseDomain: data.baseDomain ? data.baseDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').trim() : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const communities = this.getCommunities().filter((c) => c.slug !== slug && c.id !== commId);
    communities.unshift(newComm);
    this.saveCommunities(communities);

    // 2. Simpan Komunitas & Akun Sub-Admin ke Supabase secara Paralel dengan Proteksi Timeout
    let userId = `USR_SUB_${Date.now().toString().slice(-6)}`;
    const saveCommunityPromise = (async () => {
      try {
        const { error } = await supabase.from('communities').upsert({
          id: commId,
          name: newComm.name,
          slug: newComm.slug,
          description: newComm.description,
          coordinator_name: newComm.coordinatorName,
          coordinator_email: newComm.coordinatorEmail,
          coordinator_phone: newComm.coordinatorPhone,
          turnover_fee_percent: newComm.turnoverFeePercent,
          logo_url: newComm.logoUrl,
          base_domain: newComm.baseDomain || null,
          status: newComm.status,
          created_at: newComm.createdAt,
          updated_at: new Date().toISOString(),
        });
        if (error) {
          console.warn('[communityService] Error upsert community ke Supabase:', error.message);
        } else {
          console.log(`[communityService] Organisasi ${newComm.name} (${commId}) tersimpan di Supabase.`);
        }
      } catch (e) {
        console.warn('[communityService] Exception saving community to Supabase:', e);
      }
    })();

    const saveUserPromise = (async () => {
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
          console.log(`[communityService] Akun Sub-Admin ${cleanEmail} (${userId}) berhasil dibuat di Supabase!`);
        } else if (insertErr) {
          // Jika email sudah terdaftar (misal user lama dipromosikan jadi sub-admin organisasi)
          if (
            insertErr.code === '23505' ||
            insertErr.message?.includes('duplicate key') ||
            insertErr.message?.includes('users_email_key')
          ) {
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
            console.log(`[communityService] Akun ${cleanEmail} berhasil dipromosikan menjadi Sub-Admin organisasi.`);
          } else {
            console.warn('[communityService] Warning insert sub_admin ke Supabase:', insertErr.message);
          }
        }
      } catch (e) {
        console.warn('[communityService] Exception saat insert sub_admin ke DB:', e);
      }
    })();

    // Eksekusi paralel dengan batas waktu timeout maks 5 detik agar modal tidak menggantung
    await Promise.race([
      Promise.allSettled([saveCommunityPromise, saveUserPromise]),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);

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

    // 4. Sinkronkan ke cache lokal agar bisa login instan
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

  public async updateCommunity(id: string, updates: Partial<Community>): Promise<Community> {
    const communities = this.getCommunities();
    const idx = communities.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Komunitas tidak ditemukan');

    communities[idx] = {
      ...communities[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveCommunities(communities);

    // Sync to Supabase communities table
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug.trim();
      if (updates.description !== undefined) dbUpdates.description = updates.description.trim();
      if (updates.coordinatorName !== undefined) dbUpdates.coordinator_name = updates.coordinatorName.trim();
      if (updates.coordinatorEmail !== undefined) dbUpdates.coordinator_email = updates.coordinatorEmail.trim();
      if (updates.coordinatorPhone !== undefined) dbUpdates.coordinator_phone = updates.coordinatorPhone.trim();
      if (updates.turnoverFeePercent !== undefined) dbUpdates.turnover_fee_percent = Number(updates.turnoverFeePercent);
      if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.baseDomain !== undefined) dbUpdates.base_domain = updates.baseDomain ? updates.baseDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').trim() : null;

      await supabase.from('communities').update(dbUpdates).eq('id', id);

      // Sinkronkan nama koordinator / phone / nama organisasi ke tabel users
      if (updates.coordinatorName || updates.coordinatorPhone !== undefined || updates.name) {
        const userUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.coordinatorName) userUpdates.name = updates.coordinatorName.trim();
        if (updates.coordinatorPhone !== undefined) userUpdates.phone = updates.coordinatorPhone.trim();
        if (updates.name) userUpdates.community_name = updates.name.trim();
        await supabase.from('users').update(userUpdates).eq('community_id', id);
      }

      // Sinkronkan nama organisasi ke toko-toko yang terikat jika nama berubah
      if (updates.name) {
        await supabase.from('stores').update({ community_name: updates.name.trim() }).eq('community_id', id);
      }
    } catch (e) {
      console.warn('[communityService] Error updating community in Supabase:', e);
    }

    return communities[idx];
  }

  public async deleteCommunity(id: string): Promise<void> {
    // 1. Hapus dari Supabase communities table
    try {
      const { error: delErr } = await supabase.from('communities').delete().eq('id', id);
      if (delErr) {
        console.error('[communityService] Error deleting community from Supabase:', delErr);
        throw new Error(delErr.message || 'Gagal menghapus organisasi dari database.');
      }
      console.log(`[communityService] Komunitas ${id} berhasil dihapus dari database Supabase.`);
    } catch (e: any) {
      console.error('[communityService] Exception saat delete community di Supabase:', e);
      throw e;
    }

    // 2. Hapus akun user Sub-Admin yang terikat dengan komunitas ini
    try {
      const { data: subAdminUsers } = await supabase
        .from('users')
        .select('id, email')
        .eq('community_id', id);

      if (subAdminUsers && subAdminUsers.length > 0) {
        for (const u of subAdminUsers) {
          authService.purgeLocalAccount(u.email);
        }
        await supabase.from('users').delete().eq('community_id', id);
        console.log(`[communityService] Akun Sub-Admin terkait organisasi ${id} berhasil dihapus.`);
      }
    } catch (e) {
      console.warn('[communityService] Warning cleaning up sub_admin user in Supabase:', e);
    }

    // 3. Lepas seluruh toko yang terikat dengan komunitas ini
    try {
      const allStores = await storeService.getStores();
      const linkedStores = allStores.filter((s) => s.communityId === id);
      for (const st of linkedStores) {
        await storeService.updateStore(st.id, {
          communityId: undefined,
          communityName: undefined,
        });
      }
      await supabase.from('stores').update({ community_id: null, community_name: null }).eq('community_id', id);
      console.log(`[communityService] Lapak anggota dari organisasi ${id} berhasil dilepas menjadi toko mandiri.`);
    } catch (e) {
      console.warn('[communityService] Warning unlinking stores on delete community:', e);
    }

    // 4. Update cache lokal communities
    const communities = this.getCommunities().filter((c) => c.id !== id);
    this.saveCommunities(communities);
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
