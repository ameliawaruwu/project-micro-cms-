import { sessionHeaders } from './supabaseClient';

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface MyCommunityMembership {
  storeId: string;
  communityId: string;
  name: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  /** 'primary' | 'admin' | 'request' | 'partner:<nama>' */
  source: string;
  joinedAt?: string;
}

export interface MyJoinRequest {
  id: string;
  status: JoinRequestStatus;
  message?: string | null;
  decisionNote?: string | null;
  createdAt: string;
  decidedAt?: string | null;
  storeId: string;
  storeName: string;
  communityId: string;
  communityName: string;
}

export interface MyCommunityData {
  stores: { id: string; name: string; slug: string }[];
  memberships: MyCommunityMembership[];
  requests: MyJoinRequest[];
  communities: { id: string; name: string; slug?: string; description?: string | null; logoUrl?: string | null }[];
}

export interface ManagedMember {
  storeId: string;
  storeName: string;
  slug?: string;
  isPublished: boolean;
  ownerName?: string | null;
  ownerEmail?: string | null;
  source: string;
  joinedAt?: string;
}

export interface ManagedRequest {
  id: string;
  status: JoinRequestStatus;
  message?: string | null;
  decisionNote?: string | null;
  createdAt: string;
  decidedAt?: string | null;
  storeId: string;
  storeName: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
}

export interface ManageData {
  communityId: string;
  members: ManagedMember[];
  requests: ManagedRequest[];
}

async function call<T = any>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/community${path}`, {
    method: init.method || 'GET',
    headers: sessionHeaders(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // balasan bukan JSON
  }
  if (!res.ok || !json?.success) {
    throw new Error(json?.message || json?.error || `Permintaan gagal (${res.status}).`);
  }
  return json as T;
}

export const communityMembershipService = {
  async getMine(): Promise<MyCommunityData> {
    return (await call<{ data: MyCommunityData }>('/my')).data;
  },
  async requestJoin(storeId: string, communityId: string, message?: string): Promise<void> {
    await call('/requests', { method: 'POST', body: { storeId, communityId, message: message || undefined } });
  },
  async cancelRequest(id: string): Promise<void> {
    await call(`/requests/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
  async getManaged(): Promise<ManageData> {
    return (await call<{ data: ManageData }>('/manage')).data;
  },
  async decide(id: string, approve: boolean, note?: string): Promise<void> {
    await call(`/manage/requests/${encodeURIComponent(id)}/${approve ? 'approve' : 'reject'}`, {
      method: 'POST',
      body: { note: note || undefined },
    });
  },
};

/** Label asal keanggotaan untuk ditampilkan ke pengguna. */
export function membershipSourceLabel(source: string, isEn: boolean): string {
  if (source.startsWith('partner:')) return isEn ? 'Automatic (portal email match)' : 'Otomatis (email portal cocok)';
  if (source === 'request') return isEn ? 'Join request approved' : 'Permintaan disetujui';
  if (source === 'admin') return isEn ? 'Added by admin' : 'Ditambahkan admin';
  return isEn ? 'Primary community' : 'Komunitas utama';
}
