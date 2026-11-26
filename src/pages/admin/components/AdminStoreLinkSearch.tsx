import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link2, Loader2, Plus, Search, X } from 'lucide-react';
import { communityMembershipService, StoreLookupResult } from '../../../services/communityMembershipService';
import { fieldClass, primaryBtn } from '../../../components/tickets/ticketUi';
import { EntityAvatar } from './EntityAvatar';

/**
 * Sub-Admin Utama: cari toko lewat nama lalu tautkan ke komunitas (Daftar Lapak Binaan).
 * Toko yang sudah tertaut tidak ditampilkan. Server tetap memeriksa peran & keanggotaan.
 */
interface AdminStoreLinkSearchProps {
  isEn: boolean;
  /** Toko yang sudah tampil di daftar binaan (disaring dari hasil, selain flag server). */
  linkedStoreIds: string[];
  onLinked?: () => void | Promise<void>;
  onShowToast?: (msg: string) => void;
}

export const AdminStoreLinkSearch: React.FC<AdminStoreLinkSearchProps> = ({ isEn, linkedStoreIds, onLinked, onShowToast }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StoreLookupResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const seq = useRef(0);

  const search = useCallback(
    async (raw: string) => {
      const term = raw.trim();
      const mySeq = ++seq.current;
      if (term.length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const found = await communityMembershipService.lookupStore(term);
        if (mySeq === seq.current) setResults(found);
      } catch (err: any) {
        if (mySeq !== seq.current) return;
        setResults(null);
        setError(err?.message || (isEn ? 'Search failed.' : 'Pencarian gagal.'));
      } finally {
        if (mySeq === seq.current) setLoading(false);
      }
    },
    [isEn]
  );

  useEffect(() => {
    const t = window.setTimeout(() => search(query), 400);
    return () => window.clearTimeout(t);
  }, [query, search]);

  const linked = new Set(linkedStoreIds);
  const candidates = (results || []).filter((r) => !r.alreadyMember && !linked.has(r.storeId));

  const link = async (r: StoreLookupResult) => {
    setAddingId(r.storeId);
    setError(null);
    try {
      await communityMembershipService.addMember(r.storeId);
      onShowToast?.(isEn ? `${r.storeName} linked to your community.` : `${r.storeName} ditautkan ke komunitas Anda.`);
      setResults((prev) => (prev ? prev.map((x) => (x.storeId === r.storeId ? { ...x, alreadyMember: true } : x)) : prev));
      await onLinked?.();
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Failed to link store.' : 'Gagal menautkan toko.'));
    } finally {
      setAddingId(null);
    }
  };

  const term = query.trim();

  return (
    <div className="bg-white border border-[#E5E0DD] rounded-xl p-3 sm:p-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-[#66000E]" />
        <p className="text-sm font-semibold text-[#1F1F1F]">{isEn ? 'Link a store to your community' : 'Tautkan toko ke komunitas'}</p>
      </div>
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#A8A09D] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          className={`${fieldClass} pl-8 pr-8`}
          maxLength={254}
          placeholder={isEn ? 'Type a store name, e.g. Kopi Santri' : 'Ketik nama toko, mis. Kopi Santri'}
          aria-label={isEn ? 'Search store to link' : 'Cari toko untuk ditautkan'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-[#A8A09D] animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
        ) : query ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#A8A09D] hover:text-[#1F1F1F] cursor-pointer"
            aria-label={isEn ? 'Clear search' : 'Hapus pencarian'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
      {term.length > 0 && term.length < 2 && (
        <p className="text-[11px] text-[#A8A09D]">{isEn ? 'Type at least 2 characters.' : 'Ketik minimal 2 karakter.'}</p>
      )}
      {results && !loading && candidates.length === 0 && (
        <p className="text-xs text-[#A8A09D] text-center py-2">
          {results.length > 0
            ? isEn
              ? 'All matching stores are already linked.'
              : 'Semua toko yang cocok sudah tertaut.'
            : isEn
            ? 'No store found.'
            : 'Toko tidak ditemukan.'}
        </p>
      )}
      {candidates.length > 0 && (
        <ul className="divide-y divide-[#F0ECEA] border border-[#F0ECEA] rounded-lg max-h-72 overflow-y-auto">
          {candidates.map((r) => (
            <li key={r.storeId} className="px-3 py-2.5 flex items-center gap-3">
              <EntityAvatar key={`${r.storeId}-${r.logoUrl || ''}`} sources={[r.logoUrl]} alt={r.storeName} size="sm" rounded="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#1F1F1F] truncate">{r.storeName}</p>
                <p className="text-[11px] text-[#A8A09D] truncate">
                  {r.ownerName ? `${isEn ? 'Owner' : 'Pemilik'}: ${r.ownerName}` : r.slug || '-'}
                  {r.city ? ` · ${r.city}` : ''}
                </p>
              </div>
              <button type="button" className={`${primaryBtn} shrink-0`} onClick={() => link(r)} disabled={!!addingId}>
                {addingId === r.storeId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {isEn ? 'Link' : 'Tautkan'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-[#66000E]">{error}</p>}
    </div>
  );
};
