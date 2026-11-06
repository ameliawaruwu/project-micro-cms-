import { supabase } from './supabaseClient';
import { idService } from './idService';
import { hashPassword, getWibIsoString } from './authService';
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
    if (!input.password || input.password.length < 6) throw new Error('Password minimal 6 karakter.');
    if (isCommunityRole(input.role) && !input.communityId) throw new Error('Pilih komunitas untuk peran admin komunitas.');

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) throw new Error('Email sudah terdaftar.');

    const now = getWibIsoString();
    const row = {
      id: await idService.generateNextId('users'),
      email,
      name,
      phone: input.phone?.trim() || null,
      role: input.role,
      community_id: isCommunityRole(input.role) ? input.communityId || null : null,
      community_name: isCommunityRole(input.role) ? input.communityName || null : null,
      password_hash: await hashPassword(input.password),
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase.from('users').insert(row).select(COLUMNS).single();
    if (error) throw new Error(error.message || 'Gagal menambahkan user.');
    return mapRow(data);
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
      if (input.password.length < 6) throw new Error('Password minimal 6 karakter.');
      payload.password_hash = await hashPassword(input.password);
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
