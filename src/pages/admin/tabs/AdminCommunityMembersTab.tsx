import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Users, Loader2, RefreshCw, Search, Plus, UserMinus, Store as StoreIcon } from 'lucide-react';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import {
  communityMembershipService,
  ManageData,
  ManagedMember,
  StoreLookupResult,
  membershipSourceLabel,
} from '../../../services/communityMembershipService';
import { formatDate } from '../../../components/community/communityUi';
import { SimpleModal, fieldClass, ghostBtn, primaryBtn } from '../../../components/tickets/ticketUi';

interface AdminCommunityMembersTabProps {
  language: string;
  onShowToast?: (msg: string) => void;
  onNavigateOverview?: () => void;
  /** Sub-Admin Utama: boleh menambah & mengeluarkan toko binaan. Server tetap memeriksa peran. */
  canManage?: boolean;
}

export const AdminCommunityMembersTab: React.FC<AdminCommunityMembersTabProps> = ({ language, onShowToast, onNavigateOverview, canManage = false }) => {
  const isEn = language === 'en';
  const [data, setData] = useState<ManageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState<StoreLookupResult[] | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ManagedMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await communityMembershipService.getManaged());
    } catch (err: any) {
      setLoadError(err?.message || (isEn ? 'Failed to load.' : 'Gagal memuat data.'));
    } finally {
      setLoading(false);
    }
  }, [isEn]);

  useEffect(() => {
    load();
  }, [load]);

  const q = query.trim().toLowerCase();
  const members = data?.members || [];
  const visibleMembers = members.filter(
    (m) => !q || [m.storeName, m.slug, m.ownerName, m.ownerEmail].some((v) => (v || '').toLowerCase().includes(q))
  );

  const openAdd = () => {
    setAddOpen(true);
    setLookupQuery('');
    setLookupResults(null);
    setAddError(null);
  };

  const lookupSeq = useRef(0);
  const searchStores = useCallback(
    async (raw: string) => {
      const term = raw.trim();
      const seq = ++lookupSeq.current;
      if (term.length < 2) {
        setLookupResults(null);
        setLookupLoading(false);
        return;
      }
      setLookupLoading(true);
      setAddError(null);
      try {
        const found = await communityMembershipService.lookupStore(term);
        if (seq === lookupSeq.current) setLookupResults(found);
      } catch (err: any) {
        if (seq !== lookupSeq.current) return;
        setLookupResults(null);
        setAddError(err?.message || (isEn ? 'Search failed.' : 'Pencarian gagal.'));
      } finally {
        if (seq === lookupSeq.current) setLookupLoading(false);
      }
    },
    [isEn]
  );

  // Daftar toko muncul otomatis saat mengetik nama toko.
  useEffect(() => {
    if (!addOpen) return;
    const t = window.setTimeout(() => searchStores(lookupQuery), 400);
    return () => window.clearTimeout(t);
  }, [addOpen, lookupQuery, searchStores]);

  const runLookup = (e?: React.FormEvent) => {
    e?.preventDefault();
    searchStores(lookupQuery);
  };

  const addStore = async (r: StoreLookupResult) => {
    setAddingId(r.storeId);
    setAddError(null);
    try {
      await communityMembershipService.addMember(r.storeId);
      setAddOpen(false);
      onShowToast?.(isEn ? `${r.storeName} added to the community.` : `${r.storeName} ditambahkan ke komunitas.`);
      await load();
    } catch (err: any) {
      setAddError(err?.message || (isEn ? 'Failed to add store.' : 'Gagal menambahkan toko.'));
    } finally {
      setAddingId(null);
    }
  };

  const openRemove = (m: ManagedMember) => {
    setRemoveTarget(m);
    setRemoveError(null);
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      await communityMembershipService.removeMember(removeTarget.storeId);
      onShowToast?.(
        isEn ? `${removeTarget.storeName} removed from the community.` : `${removeTarget.storeName} dikeluarkan dari komunitas.`
      );
      setRemoveTarget(null);
      await load();
    } catch (err: any) {
      setRemoveError(err?.message || (isEn ? 'Failed to remove store.' : 'Gagal mengeluarkan toko.'));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateOverview },
          { label: isEn ? 'Community Members' : 'Anggota Komunitas', isActive: true },
        ]}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[#1F1F1F]">{isEn ? 'Community Members' : 'Anggota Komunitas'}</h1>
          <p className="text-xs text-[#706866] mt-0.5">
            {!canManage
              ? isEn
                ? 'List of member stores in your community (view only).'
                : 'Daftar toko anggota komunitas Anda (hanya lihat).'
              : isEn
              ? 'Stores in your community. Stores are added by the community lead, or automatically when the owner email matches the portal. Only member stores appear on the community portal.'
              : 'Toko yang tergabung di komunitas Anda. Toko ditambahkan oleh Sub-Admin Utama, atau otomatis bila email pemilik cocok dengan portal. Hanya produk toko anggota yang tampil di portal komunitas.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={load} className={ghostBtn} aria-label={isEn ? 'Refresh' : 'Muat ulang'}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isEn ? 'Refresh' : 'Muat ulang'}</span>
          </button>
          {canManage && (
            <button type="button" onClick={openAdd} className={primaryBtn}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEn ? 'Add store' : 'Tambah Toko Binaan'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-xs text-[#706866]">
          {isEn ? `${members.length} member stores` : `${members.length} toko anggota`}
        </p>
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#A8A09D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className={`${fieldClass} pl-8 py-1.5 text-xs`}
            placeholder={isEn ? 'Search store or owner…' : 'Cari toko atau pemilik…'}
            aria-label={isEn ? 'Search store or owner' : 'Cari toko atau pemilik'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-[#E5E0DD] rounded-xl overflow-hidden">
        {loading && !data ? (
          <div className="py-12 flex justify-center text-[#A8A09D]">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="py-10 px-4 text-center text-xs text-[#66000E]">{loadError}</div>
        ) : visibleMembers.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-[#A8A09D]">
            <Users className="w-7 h-7" />
            <p className="text-xs">
              {q ? (isEn ? 'No matching store' : 'Tidak ada toko yang cocok') : isEn ? 'No members yet' : 'Belum ada anggota'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F0ECEA]">
            {visibleMembers.map((m) => (
              <li key={m.storeId} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1F1F1F] truncate">
                    {m.storeName}
                    {!m.isPublished && (
                      <span className="ml-2 text-[10px] font-medium text-[#706866] bg-[#F5F2F1] rounded px-1.5 py-0.5 align-middle">
                        {isEn ? 'Draft' : 'Draf'}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[#A8A09D] truncate">
                    {canManage ? (
                      <>
                        {m.slug ? `${m.slug}.lapakq.com · ` : ''}
                        {m.ownerName || '-'}
                        {m.ownerEmail ? ` · ${m.ownerEmail}` : ''}
                      </>
                    ) : (
                      `${isEn ? 'Owner' : 'Pemilik'}: ${m.ownerName || '-'}`
                    )}
                  </p>
                </div>
                {canManage && (
                  <p className="text-[11px] text-[#706866] sm:text-right">
                    {membershipSourceLabel(m.source, isEn)}
                    {m.joinedAt ? ` · ${formatDate(m.joinedAt)}` : ''}
                  </p>
                )}
                {canManage && (
                  <button
                    type="button"
                    onClick={() => openRemove(m)}
                    className={`${ghostBtn} text-[#66000E] self-start sm:self-auto shrink-0`}
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    {isEn ? 'Remove' : 'Keluarkan'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage && (
        <SimpleModal
          open={!!removeTarget}
          title={isEn ? 'Remove store from community' : 'Keluarkan toko dari komunitas'}
          onClose={() => !removing && setRemoveTarget(null)}
          footer={
            <>
              <button type="button" className={ghostBtn} onClick={() => setRemoveTarget(null)} disabled={removing}>
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button type="button" className={primaryBtn} onClick={confirmRemove} disabled={removing}>
                {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                {isEn ? 'Remove' : 'Keluarkan'}
              </button>
            </>
          }
        >
          {removeTarget && (
            <>
              <p className="text-sm font-semibold text-[#1F1F1F]">{removeTarget.storeName}</p>
              <p className="text-xs text-[#4A4242] leading-relaxed">
                {isEn
                  ? 'This store will leave your community. Its products will no longer appear on the community portal (landing page linked via API), and the portal cannot add it back automatically. You can add it again later with "Add store".'
                  : 'Toko ini akan keluar dari komunitas Anda. Produknya tidak lagi tampil di portal komunitas (landing page yang ditautkan lewat API), dan portal tidak dapat memasukkannya kembali secara otomatis. Anda bisa menambahkannya lagi nanti lewat "Tambah Toko Binaan".'}
              </p>
              {removeError && <p className="text-xs text-[#66000E]">{removeError}</p>}
            </>
          )}
        </SimpleModal>
      )}

      {canManage && (
        <SimpleModal
          open={addOpen}
          title={isEn ? 'Add store to community' : 'Tambah Toko Binaan'}
          onClose={() => !addingId && setAddOpen(false)}
          footer={
            <button type="button" className={ghostBtn} onClick={() => setAddOpen(false)} disabled={!!addingId}>
              {isEn ? 'Close' : 'Tutup'}
            </button>
          }
        >
          <p className="text-xs text-[#706866] leading-relaxed">
            {isEn
              ? 'Type the store name (at least 2 characters), then choose the store from the list. The exact owner email also works.'
              : 'Ketik nama toko (minimal 2 karakter), lalu pilih toko dari daftar. Bisa juga dengan email pemilik secara lengkap.'}
          </p>
          <form onSubmit={runLookup} className="flex gap-2">
            <input
              className={`${fieldClass} flex-1 min-w-0`}
              maxLength={254}
              placeholder={isEn ? 'Store name, e.g. Kopi Santri' : 'Nama toko, mis. Kopi Santri'}
              aria-label={isEn ? 'Search store by name' : 'Cari toko berdasarkan nama'}
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className={primaryBtn} disabled={lookupLoading || !lookupQuery.trim()}>
              {lookupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isEn ? 'Find' : 'Cari'}</span>
            </button>
          </form>
          {lookupResults && lookupResults.length === 0 && (
            <p className="text-xs text-[#A8A09D] text-center py-3">{isEn ? 'No store found.' : 'Toko tidak ditemukan.'}</p>
          )}
          {lookupResults && lookupResults.length > 0 && (
            <ul className="divide-y divide-[#F0ECEA] border border-[#F0ECEA] rounded-lg max-h-80 overflow-y-auto">
              {lookupResults.map((r) => (
                <li key={r.storeId} className="px-3 py-2.5 flex items-center gap-3">
                  <StoreIcon className="w-4 h-4 text-[#A8A09D] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1F1F1F] truncate">{r.storeName}</p>
                    <p className="text-[11px] text-[#A8A09D] truncate">
                      {r.slug ? `${r.slug}.lapakq.com` : '-'}
                      {r.ownerName ? ` · ${r.ownerName}` : ''}
                    </p>
                  </div>
                  {r.alreadyMember ? (
                    <span className="text-[11px] text-[#706866] shrink-0">{isEn ? 'Member' : 'Sudah anggota'}</span>
                  ) : (
                    <button type="button" className={`${primaryBtn} shrink-0`} onClick={() => addStore(r)} disabled={!!addingId}>
                      {addingId === r.storeId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      {isEn ? 'Add' : 'Tambah'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {addError && <p className="text-xs text-[#66000E]">{addError}</p>}
        </SimpleModal>
      )}
    </div>
  );
};
