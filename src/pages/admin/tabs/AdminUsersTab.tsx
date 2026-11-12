import React, { useEffect, useMemo, useState } from 'react';
import { UserCog, UserPlus, Search, Inbox, Loader2, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Community, User } from '../../../types';
import {
  userAdminService,
  ManagedUser,
  ManagedRole,
  ROLE_OPTIONS,
  ROLE_LABELS,
  isCommunityRole,
} from '../../../services/userAdminService';
import { communityService } from '../../../services/communityService';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { ConfirmDeleteModal } from '../../../components/common/ConfirmDeleteModal';
import { SimpleModal, fieldClass, ghostBtn, labelClass, primaryBtn } from '../../../components/tickets/ticketUi';

interface AdminUsersTabProps {
  currentUser?: User | null;
  language: string;
  onShowToast?: (msg: string) => void;
  onNavigateOverview?: () => void;
}

type RoleFilter = 'all' | 'admin' | 'sub_admin_umum' | 'admin_produk' | 'merchant';

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-[#66000E] text-white border-[#66000E]',
  sub_admin_umum: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  community_admin: 'bg-violet-50 text-violet-700 border-violet-200',
  sub_admin_produk: 'bg-violet-50 text-violet-700 border-violet-200',
  sub_admin: 'bg-violet-50 text-violet-700 border-violet-200',
  merchant: 'bg-gray-50 text-gray-700 border-gray-200',
  buyer: 'bg-gray-50 text-gray-500 border-gray-200',
};

const matchesRoleFilter = (role: string, f: RoleFilter) => {
  if (f === 'all') return true;
  if (f === 'admin_produk') return role === 'community_admin' || role === 'sub_admin_produk' || role === 'sub_admin';
  return role === f;
};

interface FormState {
  name: string;
  email: string;
  phone: string;
  role: ManagedRole;
  communityId: string;
  password: string;
}

const EMPTY_FORM: FormState = { name: '', email: '', phone: '', role: 'merchant', communityId: '', password: '' };

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ currentUser, language, onShowToast, onNavigateOverview }) => {
  const isEn = language === 'en';
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ManagedUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [list, comms] = await Promise.all([
        userAdminService.list(),
        communityService.fetchCommunitiesFromDatabase().catch(() => [] as Community[]),
      ]);
      setUsers(list);
      setCommunities(comms);
    } catch (err: any) {
      setLoadError(err?.message || 'Gagal memuat user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filterItems: { id: RoleFilter; label: string }[] = [
    { id: 'all', label: isEn ? 'All' : 'Semua' },
    { id: 'admin', label: 'Super Admin' },
    { id: 'sub_admin_umum', label: 'Admin Umum' },
    { id: 'admin_produk', label: 'Admin Produk' },
    { id: 'merchant', label: 'Merchant' },
  ];

  const counts = useMemo(() => {
    const c: Record<RoleFilter, number> = { all: 0, admin: 0, sub_admin_umum: 0, admin_produk: 0, merchant: 0 };
    users.forEach((u) => {
      (Object.keys(c) as RoleFilter[]).forEach((k) => {
        if (matchesRoleFilter(u.role, k)) c[k] += 1;
      });
    });
    return c;
  }, [users]);

  const visible = users.filter((u) => {
    if (!matchesRoleFilter(u.role, roleFilter)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [u.name, u.email, u.phone, u.communityName].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      communityId: u.communityId || '',
      password: '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError(null);
    const community = communities.find((c) => c.id === form.communityId);
    const input = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      communityId: form.communityId || null,
      communityName: community?.name || (editing?.communityId === form.communityId ? editing?.communityName : null) || null,
      password: form.password || undefined,
    };
    try {
      if (editing) {
        const updated = await userAdminService.update(editing.id, input);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        onShowToast?.(isEn ? 'User updated' : 'User diperbarui');
      } else {
        const created = await userAdminService.create(input);
        setUsers((prev) => [created, ...prev]);
        onShowToast?.(isEn ? 'User added' : 'User ditambahkan');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (u: ManagedUser) => {
    if (u.id === currentUser?.id || u.email === currentUser?.email) {
      onShowToast?.(isEn ? 'You cannot delete your own account' : 'Tidak bisa menghapus akun sendiri');
      return;
    }
    setPendingDelete(u);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await userAdminService.remove(pendingDelete.id);
      setUsers((prev) => prev.filter((x) => x.id !== pendingDelete.id));
      onShowToast?.(isEn ? 'User deleted' : 'User dihapus');
      setPendingDelete(null);
    } catch (err: any) {
      onShowToast?.(err?.message || 'Gagal menghapus user.');
    } finally {
      setDeleting(false);
    }
  };

  const needsCommunity = isCommunityRole(form.role);
  // Pastikan opsi peran lama (mis. sub_admin_produk) tetap tampil saat edit
  const roleOptions = ROLE_OPTIONS.some((r) => r.value === form.role)
    ? ROLE_OPTIONS
    : [...ROLE_OPTIONS, { value: form.role, label: ROLE_LABELS[form.role] || form.role }];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateOverview },
          { label: isEn ? 'Manage Users' : 'Kelola User', isActive: true },
        ]}
      />

      <div className="pb-3 border-b border-[#E5E0DD] flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
          <UserCog className="w-5 h-5 text-[#66000E]" />
          <span>{isEn ? 'Manage Users' : 'Kelola User'}</span>
        </h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={load} className="p-2 rounded-lg text-[#706866] hover:text-[#66000E] hover:bg-white cursor-pointer" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={openCreate} className={primaryBtn}>
            <UserPlus className="w-3.5 h-3.5" />
            {isEn ? 'Add User' : 'Tambah User'}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {filterItems.map((it) => {
            const active = roleFilter === it.id;
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setRoleFilter(it.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-brand border-[#66000E] text-white'
                    : 'bg-white border-[#E5E0DD] text-[#706866] hover:text-[#66000E] hover:border-[#E8DDDE]'
                }`}
              >
                {it.label}
                <span className={`ml-1.5 ${active ? 'text-white/80' : 'text-[#A8A09D]'}`}>{counts[it.id]}</span>
              </button>
            );
          })}
        </div>
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#A8A09D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className={`${fieldClass} pl-8 py-1.5 text-xs`}
            placeholder={isEn ? 'Search name or email…' : 'Cari nama atau email…'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E0DD] rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center text-[#A8A09D]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="py-10 px-4 text-center text-xs text-[#66000E]">{loadError}</div>
        ) : visible.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-[#A8A09D]">
            <Inbox className="w-7 h-7" />
            <p className="text-xs">{isEn ? 'No users' : 'Tidak ada user'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0ECEA]">
            {visible.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-[#F5E8EA] text-[#66000E] text-xs font-semibold flex items-center justify-center shrink-0 uppercase">
                  {(u.name || u.email || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1F1F1F] truncate">{u.name || '-'}</p>
                  <p className="text-[11px] text-[#A8A09D] truncate">
                    {u.email}
                    {u.communityName ? ` · ${u.communityName}` : ''}
                  </p>
                </div>
                <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${ROLE_BADGE[u.role] || ROLE_BADGE.merchant}`}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
                <button type="button" onClick={() => openEdit(u)} className="p-1.5 rounded-md text-[#706866] hover:text-[#66000E] hover:bg-[#FAF7F7] cursor-pointer" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleDelete(u)} className="p-1.5 rounded-md text-[#706866] hover:text-[#66000E] hover:bg-[#FAF7F7] cursor-pointer" title={isEn ? 'Delete' : 'Hapus'}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SimpleModal
        open={isFormOpen}
        title={editing ? (isEn ? 'Edit User' : 'Edit User') : isEn ? 'Add User' : 'Tambah User'}
        onClose={() => !saving && setIsFormOpen(false)}
        footer={
          <>
            <button type="button" className={ghostBtn} onClick={() => setIsFormOpen(false)} disabled={saving}>
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button type="button" className={primaryBtn} onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEn ? 'Save' : 'Simpan'}
            </button>
          </>
        }
      >
        <div>
          <label className={labelClass}>{isEn ? 'Name' : 'Nama'}</label>
          <input className={fieldClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={`${fieldClass} ${editing ? 'bg-[#FAF7F7] text-[#706866]' : ''}`}
            type="email"
            value={form.email}
            disabled={!!editing}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{isEn ? 'Phone' : 'No. HP'}</label>
            <input className={fieldClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>{isEn ? 'Role' : 'Peran'}</label>
            <select className={fieldClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as ManagedRole })}>
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
        {needsCommunity && (
          <div>
            <label className={labelClass}>{isEn ? 'Community' : 'Komunitas'}</label>
            <select className={fieldClass} value={form.communityId} onChange={(e) => setForm({ ...form, communityId: e.target.value })}>
              <option value="">{isEn ? 'Select community' : 'Pilih komunitas'}</option>
              {editing?.communityId && !communities.some((c) => c.id === editing.communityId) && (
                <option value={editing.communityId}>{editing.communityName || editing.communityId}</option>
              )}
              {communities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelClass}>{editing ? (isEn ? 'New password (optional)' : 'Password baru (opsional)') : 'Password'}</label>
          <input
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {formError && <p className="text-xs text-[#66000E]">{formError}</p>}
      </SimpleModal>

      <ConfirmDeleteModal
        isOpen={!!pendingDelete}
        title={isEn ? 'Delete User' : 'Hapus User'}
        message={
          pendingDelete
            ? pendingDelete.role === 'merchant'
              ? isEn
                ? `${pendingDelete.email} and their stores will be permanently deleted.`
                : `${pendingDelete.email} beserta tokonya akan dihapus permanen.`
              : isEn
              ? `${pendingDelete.email} will be permanently deleted.`
              : `${pendingDelete.email} akan dihapus permanen.`
            : undefined
        }
        isDeleting={deleting}
        onConfirm={confirmDelete}
        onClose={() => !deleting && setPendingDelete(null)}
      />
    </div>
  );
};
