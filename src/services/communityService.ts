import { Community, CommunityTurnoverInvoice, Store, Order, User } from '../types';
import { storeService } from './storeService';
import { supabase } from './supabaseClient';
import { storeInCommunity, addExtraMembership, removeExtraMembership } from '../utils/communityMembership';
import { getWibIsoString } from '../utils/formatters';
import { authService } from './authService';
import { idService } from './idService';

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
            subAdminName: r.sub_admin_name || undefined,
            subAdminEmail: r.sub_admin_email || undefined,
            subAdminPhone: r.sub_admin_phone || undefined,
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
          subAdminName: data.sub_admin_name || undefined,
          subAdminEmail: data.sub_admin_email || undefined,
          subAdminPhone: data.sub_admin_phone || undefined,
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
   * Mendaftarkan Organisasi/Komunitas baru beserta pembuatan akun Sub-Admin Umum & Koordinator Toko ke Supabase
   */
  public async createOrganizationWithSubAdmin(data: {
    name: string;
    description?: string;
    baseDomain?: string;
    logoUrl?: string;
    // Akun 1: Sub Admin Umum (Halaman & Produk)
    subAdminName?: string;
    subAdminEmail?: string;
    subAdminPhone?: string;
    subAdminPassword?: string;
    // Akun 2: Koordinator Toko (Lapak Binaan)
    coordinatorName: string;
    coordinatorEmail: string;
    coordinatorPhone?: string;
    password?: string;
  }): Promise<{ community: Community; user: User; coordinatorUser?: User }> {
    const commId = await idService.generateNextId('communities');
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `org-${Date.now().toString().slice(-4)}`;
    const turnoverFeePercent = 2.5; // Fee ditagihkan di akhir saat penerbitan invoice omset

    const subAdminName = (data.subAdminName || data.coordinatorName).trim();
    const cleanSubAdminEmail = (data.subAdminEmail || data.coordinatorEmail).toLowerCase().trim();
    const subAdminPhone = (data.subAdminPhone || data.coordinatorPhone || '').trim();
    // Tidak ada password bawaan: password akun admin komunitas wajib diisi super admin.
    const plainSubAdminPassword = data.subAdminPassword || data.password || '';

    const coordName = data.coordinatorName.trim();
    const cleanCoordEmail = data.coordinatorEmail.toLowerCase().trim();
    const coordPhone = (data.coordinatorPhone || '').trim();
    const plainCoordPassword = data.password || '';
    if (plainSubAdminPassword.length < 8 || plainCoordPassword.length < 8) {
      throw new Error('Password akun admin komunitas wajib diisi, minimal 8 karakter.');
    }
    // Konfirmasi kredensial super admin di awal agar komunitas tidak dibuat setengah jalan.
    const adminCred = authService.getAdminCredential();

    // Akun dibuat/diperbarui oleh database (password di-hash bcrypt di sana).
    const upsertCommunityAccount = async (
      email: string, name: string, phone: string, role: 'sub_admin' | 'community_admin', password: string
    ): Promise<string> => {
      const { data: res, error } = await supabase.rpc('admin_upsert_user', {
        p_admin_email: adminCred.email,
        p_admin_password: adminCred.password,
        p_email: email,
        p_name: name,
        p_role: role,
        p_password: password,
        p_phone: phone || null,
        p_community_id: commId,
        p_community_name: data.name.trim(),
        p_user_id: null,
      });
      if (error || !res?.success || !res.user?.id) {
        throw new Error(res?.message || error?.message || `Gagal membuat akun ${email}.`);
      }
      return res.user.id as string;
    };

    // 1. Simpan Komunitas ke Local & Service State
    const newComm: Community = {
      id: commId,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || `Organisasi & Lapak Binaan ${data.name.trim()}`,
      subAdminName,
      subAdminEmail: cleanSubAdminEmail,
      subAdminPhone,
      coordinatorName: coordName,
      coordinatorEmail: cleanCoordEmail,
      coordinatorPhone: coordPhone,
      turnoverFeePercent,
      logoUrl: data.logoUrl || undefined,
      baseDomain: data.baseDomain ? data.baseDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').trim() : undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const communities = this.getCommunities().filter((c) => c.slug !== slug && c.id !== commId);
    communities.unshift(newComm);
    this.saveCommunities(communities);

    // 2. Simpan Komunitas ke Supabase
    const saveCommunityPromise = (async () => {
      try {
        const { error } = await supabase.from('communities').upsert({
          id: commId,
          name: newComm.name,
          slug: newComm.slug,
          description: newComm.description,
          sub_admin_name: newComm.subAdminName,
          sub_admin_email: newComm.subAdminEmail,
          sub_admin_phone: newComm.subAdminPhone,
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
          console.log(`[communityService] Komunitas ${newComm.name} (${commId}) tersimpan di Supabase.`);
        }
      } catch (e) {
        console.warn('[communityService] Exception saving community to Supabase:', e);
      }
    })();

    // 3. Simpan Akun Sub Admin Umum (Halaman & Produk)
    let subAdminUserId = '';
    const saveSubAdminPromise = (async () => {
      subAdminUserId = await upsertCommunityAccount(cleanSubAdminEmail, subAdminName, subAdminPhone, 'sub_admin', plainSubAdminPassword);
      console.log(`[communityService] Akun Sub-Admin Umum ${cleanSubAdminEmail} (${subAdminUserId}) tersimpan.`);
    })();

    // 4. Simpan Akun Koordinator Toko jika emailnya berbeda
    let coordUserId = '';
    const isSameAccount = cleanCoordEmail === cleanSubAdminEmail;
    const saveCoordPromise = isSameAccount
      ? Promise.resolve()
      : (async () => {
          coordUserId = await upsertCommunityAccount(cleanCoordEmail, coordName, coordPhone, 'community_admin', plainCoordPassword);
          console.log(`[communityService] Akun Koordinator Toko ${cleanCoordEmail} (${coordUserId}) tersimpan.`);
        })();

    // Eksekusi paralel dengan batas waktu timeout maks 5 detik agar modal tidak menggantung
    await saveCommunityPromise;
    // Akun harus benar-benar tersimpan; kegagalan ditampilkan ke super admin (bukan diabaikan).
    await Promise.all([saveSubAdminPromise, saveCoordPromise]);

    const createdSubAdminUser: User = {
      id: subAdminUserId,
      name: subAdminName,
      email: cleanSubAdminEmail,
      phoneWhatsApp: subAdminPhone,
      role: 'sub_admin',
      communityId: commId,
      communityName: newComm.name,
      createdAt: new Date().toISOString(),
    };

    let createdCoordUser: User | undefined = undefined;
    if (!isSameAccount) {
      createdCoordUser = {
        id: coordUserId,
        name: coordName,
        email: cleanCoordEmail,
        phoneWhatsApp: coordPhone,
        role: 'community_admin',
        communityId: commId,
        communityName: newComm.name,
        createdAt: new Date().toISOString(),
      };
    }

    // 5. Sinkronkan ke cache lokal agar bisa login instan
    try {
      const accountsKey = 'microcms_accounts_v1';
      const rawAccounts = localStorage.getItem(accountsKey);
      let accounts: any[] = rawAccounts ? JSON.parse(rawAccounts) : [];
      accounts = accounts.filter(
        (a) => a.email.toLowerCase() !== cleanSubAdminEmail && a.email.toLowerCase() !== cleanCoordEmail
      );
      accounts.push({
        id: subAdminUserId,
        email: cleanSubAdminEmail,
        user: createdSubAdminUser,
        merchant: {
          id: `merch-${subAdminUserId}`,
          userId: subAdminUserId,
          storeId: '',
          plan: 'premium',
          isVerified: true,
        },
        storeId: '',
      });
      if (!isSameAccount && createdCoordUser) {
        accounts.push({
          id: coordUserId,
          email: cleanCoordEmail,
          user: createdCoordUser,
          merchant: {
            id: `merch-${coordUserId}`,
            userId: coordUserId,
            storeId: '',
            plan: 'premium',
            isVerified: true,
          },
          storeId: '',
        });
      }
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
    } catch (e) {
      console.warn('[communityService] Gagal update cache akun lokal:', e);
    }

    return { community: newComm, user: createdSubAdminUser, coordinatorUser: createdCoordUser };
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
      if (updates.subAdminName !== undefined) dbUpdates.sub_admin_name = updates.subAdminName.trim();
      if (updates.subAdminEmail !== undefined) dbUpdates.sub_admin_email = updates.subAdminEmail.trim();
      if (updates.subAdminPhone !== undefined) dbUpdates.sub_admin_phone = updates.subAdminPhone.trim();
      if (updates.coordinatorName !== undefined) dbUpdates.coordinator_name = updates.coordinatorName.trim();
      if (updates.coordinatorEmail !== undefined) dbUpdates.coordinator_email = updates.coordinatorEmail.trim();
      if (updates.coordinatorPhone !== undefined) dbUpdates.coordinator_phone = updates.coordinatorPhone.trim();
      if (updates.turnoverFeePercent !== undefined) dbUpdates.turnover_fee_percent = Number(updates.turnoverFeePercent);
      if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.baseDomain !== undefined) dbUpdates.base_domain = updates.baseDomain ? updates.baseDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '').trim() : null;

      await supabase.from('communities').update(dbUpdates).eq('id', id);

      // Sinkronkan nama sub admin / koordinator / phone / nama organisasi ke tabel users
      if (updates.subAdminEmail && (updates.subAdminName || updates.subAdminPhone !== undefined)) {
        const subUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.subAdminName) subUpdates.name = updates.subAdminName.trim();
        if (updates.subAdminPhone !== undefined) subUpdates.phone = updates.subAdminPhone.trim();
        await supabase.from('users').update(subUpdates).eq('email', updates.subAdminEmail.toLowerCase().trim());
      }

      if (updates.coordinatorEmail && (updates.coordinatorName || updates.coordinatorPhone !== undefined)) {
        const coordUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.coordinatorName) coordUpdates.name = updates.coordinatorName.trim();
        if (updates.coordinatorPhone !== undefined) coordUpdates.phone = updates.coordinatorPhone.trim();
        await supabase.from('users').update(coordUpdates).eq('email', updates.coordinatorEmail.toLowerCase().trim());
      }

      if (updates.name) {
        await supabase.from('users').update({ community_name: updates.name.trim() }).eq('community_id', id);
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
      // Keanggotaan tambahan ikut terhapus lewat ON DELETE CASCADE, ini untuk berjaga-jaga.
      await supabase.from('store_communities').delete().eq('community_id', id);
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
    return allStores.filter((s) => storeInCommunity(s, communityId));
  }

  /**
   * Menetapkan toko merchant ke dalam komunitas tertentu
   */
  public async assignStoreToCommunity(
    storeId: string,
    communityId: string,
    communityName: string
  ): Promise<void> {
    // Toko tidak dipindah: toko mandiri mendapat komunitas utama, toko yang sudah di komunitas lain
    // mendapat komunitas tambahan (store_communities).
    const store = (await storeService.getStores()).find((s) => s.id === storeId);
    if (!store) throw new Error('Toko tidak ditemukan.');
    if (storeInCommunity(store, communityId)) return;
    if (!store.communityId) {
      const { error } = await supabase
        .from('stores')
        .update({ community_id: communityId, community_name: communityName, updated_at: getWibIsoString() })
        .eq('id', storeId);
      if (error) throw new Error(error.message);
    } else {
      await addExtraMembership(storeId, communityId);
    }
  }

  /**
   * Mengeluarkan toko dari satu komunitas saja. Bila itu komunitas utama, komunitas tambahan pertama
   * (jika ada) naik menjadi komunitas utama; bila tidak ada, toko menjadi toko mandiri.
   */
  public async removeStoreFromCommunity(storeId: string, communityId: string): Promise<void> {
    const store = (await storeService.getStores()).find((s) => s.id === storeId);
    if (!store) throw new Error('Toko tidak ditemukan.');
    await removeExtraMembership(storeId, communityId);
    if (store.communityId !== communityId) return;

    const nextId = (store.extraCommunityIds || []).find((c) => c !== communityId) || null;
    let nextName: string | null = null;
    if (nextId) {
      const { data } = await supabase.from('communities').select('name').eq('id', nextId).maybeSingle();
      nextName = data?.name || null;
    }
    const { error } = await supabase
      .from('stores')
      .update({ community_id: nextId, community_name: nextName, updated_at: getWibIsoString() })
      .eq('id', storeId);
    if (error) throw new Error(error.message);
    if (nextId) await removeExtraMembership(storeId, nextId);
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
    const nextSeq = all.length + 1;
    const invId = idService.formatId('INV', nextSeq);

    const newInv: CommunityTurnoverInvoice = {
      id: invId,
      communityId,
      communityName: comm?.name || 'Komunitas',
      invoiceNumber: invId,
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
