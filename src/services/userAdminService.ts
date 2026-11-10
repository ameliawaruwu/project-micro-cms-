import { supabase } from './supabaseClient';
import { authService, getWibIsoString } from './authService';
import { User } from '../types';

export type ManagedRole = User['role'];

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: ManagedRole;
  communityId?: string;
  communityName?: string;
  createdAt?: string;
}

export interface ManagedUserInput {
  name: string;
  email: string;
  phone?: string;
  role: ManagedRole;
  communityId?: string | null;
  communityName?: string | null;
  password?: string;
}

/** Peran yang dapat dipilih super admin. Admin produk memakai nilai 'community_admin' (sesuai alur login). */
export const ROLE_OPTIONS: { value: ManagedRole; label: string }[] = [
  { value: 'admin', label: 'Super Admin' },
  { value: 'sub_admin_umum', label: 'Admin Umum' },
  { value: 'community_admin', label: 'Admin Produk' },
  { value: 'merchant', label: 'Merchant' },
];

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  sub_admin: 'Sub Admin',
  sub_admin_umum: 'Admin Umum',
  sub_admin_produk: 'Admin Produk',
  community_admin: 'Admin Produk',
  merchant: 'Merchant',
  buyer: 'Pembeli',
};

export const isCommunityRole = (role: string) =>
  role === 'sub_admin' || role === 'sub_admin_umum' || role === 'sub_admin_produk' || role === 'community_admin';

const COLUMNS = 'id, name, email, phone, role, community_id, community_name, created_at';

const mapRow = (r: any): ManagedUser => ({
  id: r.id,
  name: r.name || '',
  email: r.email || '',
  phone: r.phone || undefined,
  role: r.role,
  communityId: r.community_id || undefined,
  communityName: r.community_name || undefined,
  createdAt: r.created_at || undefined,
});

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

class UserAdminService {
  async list(): Promise<ManagedUser[]> {
    const { data, error } = await supabase.from('users').select(COLUMNS).order('created_at', { ascending: false });
    if (error) throw new Error(error.message || 'Gagal memuat data user.');
    return (data || []).map(mapRow);
  }

  async create(input: ManagedUserInput): Promise<ManagedUser> {
    const email = input.email.toLowerCase().trim();
    const name = input.name.trim();
    if (!name) throw new Error('Nama wajib diisi.');
    if (!isValidEmail(email)) throw new Error('Format email tidak valid.');
    if (!input.password || input.password.length < 8) throw new Error('Password minimal 8 karakter.');
    if (isCommunityRole(input.role) && !input.communityId) throw new Error('Pilih komunitas untuk peran admin komunitas.');

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) throw new Error('Email sudah terdaftar.');

    // Password di-hash & ditulis oleh database setelah kredensial super admin dikonfirmasi.
    return this.adminUpsert(input, email, name);
  }

  /** Buat/ubah akun lewat RPC admin_upsert_user (wajib kredensial super admin yang sedang login). */
  private async adminUpsert(input: ManagedUserInput, email: string, name: string, userId?: string): Promise<ManagedUser> {
    const admin = authService.getAdminCredential();
    const community = isCommunityRole(input.role);
    const { data, error } = await supabase.rpc('admin_upsert_user', {
      p_admin_email: admin.email,
      p_admin_password: admin.password,
      p_email: email,
      p_name: name,
      p_role: input.role,
      p_password: input.password || null,
      p_phone: input.phone?.trim() || null,
      p_community_id: community ? input.communityId || null : null,
      p_community_name: community ? input.communityName || null : null,
      p_user_id: userId || null,
    });
    if (error) throw new Error(/minimal 8|tidak valid|tidak dikenal/i.test(error.message) ? error.message : 'Gagal menyimpan user.');
    if (!data?.success || !data.user) throw new Error(data?.message || 'Gagal menyimpan user.');
    // Super admin mengganti password akunnya sendiri: aksi admin berikutnya memakai password baru.
    if (input.password) authService.refreshAdminCredential(email, input.password);
    return mapRow(data.user);
  }

  async update(id: string, input: ManagedUserInput): Promise<ManagedUser> {
    const name = input.name.trim();
    if (!name) throw new Error('Nama wajib diisi.');
    if (isCommunityRole(input.role) && !input.communityId) throw new Error('Pilih komunitas untuk peran admin komunitas.');

    const payload: Record<string, any> = {
      name,
      phone: input.phone?.trim() || null,
      role: input.role,
      community_id: isCommunityRole(input.role) ? input.communityId || null : null,
      community_name: isCommunityRole(input.role) ? input.communityName || null : null,
      updated_at: getWibIsoString(),
    };
    if (input.password) {
      // Ganti password akun lain hanya lewat RPC admin (password tidak bisa ditulis langsung dari browser).
      if (input.password.length < 8) throw new Error('Password minimal 8 karakter.');
      return this.adminUpsert(input, input.email.toLowerCase().trim(), name, id);
    }

    const { data, error } = await supabase.from('users').update(payload).eq('id', id).select(COLUMNS).single();
    if (error) throw new Error(error.message || 'Gagal memperbarui user.');
    return mapRow(data);
  }

  async remove(id: string): Promise<void> {
    const { data, error } = await supabase.from('users').delete().eq('id', id).select('id');
    if (error) throw new Error(error.message || 'Gagal menghapus user.');
    if (!data || data.length === 0) {
      throw new Error('User tidak terhapus. Pastikan migrasi 20261106_support_tickets.sql sudah dijalankan.');
    }
  }
}

export const userAdminService = new UserAdminService();
