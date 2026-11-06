import { supabase } from './supabaseClient';
import { User } from '../types';

export type TicketStatus = 'pending' | 'in_progress' | 'resolved';
export type TicketCategory = 'akun' | 'toko' | 'produk' | 'pembayaran' | 'teknis' | 'lainnya';
export type TicketPriority = 'low' | 'normal' | 'high';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  requesterId: string;
  requesterName: string;
  requesterEmail?: string;
  requesterRole: string;
  storeId?: string;
  storeName?: string;
  communityId?: string;
  communityName?: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
  status: TicketStatus;
  adminResponse?: string;
  handledBy?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateTicketInput {
  requester: Pick<User, 'id' | 'name' | 'email' | 'role' | 'communityId' | 'communityName'>;
  store?: { id?: string; name?: string } | null;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  description: string;
}

const TABLE = 'support_tickets';

const mapRow = (r: any): SupportTicket => ({
  id: r.id,
  ticketNumber: r.ticket_number,
  requesterId: r.requester_id,
  requesterName: r.requester_name,
  requesterEmail: r.requester_email || undefined,
  requesterRole: r.requester_role,
  storeId: r.store_id || undefined,
  storeName: r.store_name || undefined,
  communityId: r.community_id || undefined,
  communityName: r.community_name || undefined,
  subject: r.subject,
  category: r.category,
  priority: r.priority,
  description: r.description,
  status: r.status,
  adminResponse: r.admin_response || undefined,
  handledBy: r.handled_by || undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  resolvedAt: r.resolved_at || undefined,
});

const buildTicketNumber = (): string => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TKT-${ymd}-${rand}`;
};

const toError = (err: any, fallback: string): Error => {
  const msg = err?.message || '';
  if (/support_tickets/.test(msg) && /(does not exist|schema cache|not find)/i.test(msg)) {
    return new Error('Tabel tiket belum tersedia. Jalankan migrasi 20261106_support_tickets.sql di Supabase.');
  }
  return new Error(msg || fallback);
};

class TicketService {
  /** Semua tiket (khusus super admin). */
  async listAll(): Promise<SupportTicket[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw toError(error, 'Gagal memuat tiket.');
    return (data || []).map(mapRow);
  }

  /** Tiket milik pengaju tertentu (merchant / sub admin). */
  async listByRequester(requesterId: string): Promise<SupportTicket[]> {
    if (!requesterId) return [];
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('requester_id', requesterId)
      .order('created_at', { ascending: false });
    if (error) throw toError(error, 'Gagal memuat tiket.');
    return (data || []).map(mapRow);
  }

  async countPending(): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (error) return 0;
    return count || 0;
  }

  async create(input: CreateTicketInput): Promise<SupportTicket> {
    const subject = input.subject.trim();
    const description = input.description.trim();
    if (!input.requester?.id) throw new Error('Sesi login tidak valid. Silakan login ulang.');
    if (subject.length < 3) throw new Error('Judul tiket minimal 3 karakter.');
    if (description.length < 5) throw new Error('Deskripsi tiket terlalu singkat.');

    const payload = {
      ticket_number: buildTicketNumber(),
      requester_id: input.requester.id,
      requester_name: input.requester.name || input.requester.email || 'Pengguna',
      requester_email: input.requester.email || null,
      requester_role: input.requester.role || 'merchant',
      store_id: input.store?.id || null,
      store_name: input.store?.name || null,
      community_id: input.requester.communityId || null,
      community_name: input.requester.communityName || null,
      subject: subject.slice(0, 200),
      category: input.category,
      priority: input.priority,
      description,
      status: 'pending' as TicketStatus,
    };

    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
    if (error) throw toError(error, 'Gagal mengirim tiket.');
    return mapRow(data);
  }

  /** Super admin memperbarui status & tanggapan tiket. */
  async update(
    id: string,
    updates: { status: TicketStatus; adminResponse?: string; handledBy?: string }
  ): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        status: updates.status,
        admin_response: updates.adminResponse?.trim() || null,
        handled_by: updates.handledBy || null,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw toError(error, 'Gagal memperbarui tiket.');
    return mapRow(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw toError(error, 'Gagal menghapus tiket.');
  }
}

export const ticketService = new TicketService();
