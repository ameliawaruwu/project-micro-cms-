import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Check, X, Inbox, Loader2, RefreshCw, Search, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '../../../components/common/Breadcrumb';
import { communityMembershipService, ManageData, ManagedRequest, membershipSourceLabel } from '../../../services/communityMembershipService';
import { RequestStatusBadge, formatDate } from '../../../components/community/communityUi';
import { SimpleModal, fieldClass, ghostBtn, labelClass, primaryBtn } from '../../../components/tickets/ticketUi';

interface AdminCommunityMembersTabProps {
  language: string;
  onShowToast?: (msg: string) => void;
  onNavigateOverview?: () => void;
}

type View = 'pending' | 'members' | 'history';

export const AdminCommunityMembersTab: React.FC<AdminCommunityMembersTabProps> = ({ language, onShowToast, onNavigateOverview }) => {
  const isEn = language === 'en';
  const [data, setData] = useState<ManageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<View>('pending');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ManagedRequest | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState<'approve' | 'reject' | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

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

  const pending = useMemo(() => (data?.requests || []).filter((r) => r.status === 'pending'), [data]);
  const history = useMemo(() => (data?.requests || []).filter((r) => r.status !== 'pending'), [data]);

  const q = query.trim().toLowerCase();
  const matches = (...vals: (string | null | undefined)[]) => !q || vals.some((v) => (v || '').toLowerCase().includes(q));
  const visiblePending = pending.filter((r) => matches(r.storeName, r.ownerName, r.ownerEmail));
  const visibleHistory = history.filter((r) => matches(r.storeName, r.ownerName, r.ownerEmail));
  const visibleMembers = (data?.members || []).filter((m) => matches(m.storeName, m.ownerName, m.ownerEmail));

  const openRequest = (r: ManagedRequest) => {
    setSelected(r);
    setNote('');
    setModalError(null);
  };

  const decide = async (approve: boolean) => {
    if (!selected) return;
    setSaving(approve ? 'approve' : 'reject');
    setModalError(null);
    try {
      await communityMembershipService.decide(selected.id, approve, note.trim());
      setSelected(null);
      onShowToast?.(approve ? (isEn ? 'Request approved.' : 'Permintaan disetujui.') : isEn ? 'Request rejected.' : 'Permintaan ditolak.');
      await load();
    } catch (err: any) {
      setModalError(err?.message || (isEn ? 'Failed to process.' : 'Gagal memproses.'));
    } finally {
      setSaving(null);
    }
  };

  const tabs: { id: View; label: string; count: number }[] = [
    { id: 'pending', label: isEn ? 'Pending requests' : 'Permintaan masuk', count: pending.length },
    { id: 'members', label: isEn ? 'Members' : 'Anggota', count: data?.members.length || 0 },
    { id: 'history', label: isEn ? 'History' : 'Riwayat', count: history.length },
  ];

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
            {isEn
              ? 'Stores in your community and pending join requests. Stores whose owner email matches the portal join automatically.'
              : 'Toko anggota komunitas Anda dan permintaan gabung yang menunggu. Toko dengan email yang cocok dengan portal masuk otomatis.'}
          </p>
        </div>
        <button type="button" onClick={load} className={ghostBtn} aria-label="Refresh">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {tabs.map((t) => {
            const active = view === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setView(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-[#66000E] border-[#66000E] text-white'
                    : 'bg-white border-[#E5E0DD] text-[#706866] hover:text-[#66000E] hover:border-[#E8DDDE]'
                }`}
              >
                {t.label}
                <span className={`ml-1.5 ${active ? 'text-white/80' : 'text-[#A8A09D]'}`}>{t.count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#A8A09D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className={`${fieldClass} pl-8 py-1.5 text-xs`}
            placeholder={isEn ? 'Search store or owner…' : 'Cari toko atau pemilik…'}
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
        ) : view === 'members' ? (
          visibleMembers.length === 0 ? (
            <Empty icon={<Users className="w-7 h-7" />} text={isEn ? 'No members yet' : 'Belum ada anggota'} />
          ) : (
            <ul className="divide-y divide-[#F0ECEA]">
              {visibleMembers.map((m) => (
                <li key={m.storeId} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1F1F1F] truncate">{m.storeName}</p>
                    <p className="text-[11px] text-[#A8A09D] truncate">
                      {m.ownerName || '-'}
                      {m.ownerEmail ? ` · ${m.ownerEmail}` : ''}
                    </p>
                  </div>
                  <p className="text-[11px] text-[#706866] sm:text-right">
                    {membershipSourceLabel(m.source, isEn)}
                    {m.joinedAt ? ` · ${formatDate(m.joinedAt)}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )
        ) : view === 'pending' ? (
          visiblePending.length === 0 ? (
            <Empty icon={<Inbox className="w-7 h-7" />} text={isEn ? 'No pending requests' : 'Tidak ada permintaan yang menunggu'} />
          ) : (
            <ul className="divide-y divide-[#F0ECEA]">
              {visiblePending.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => openRequest(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAF7F7] transition cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1F1F1F] truncate">{r.storeName}</p>
                      <p className="text-[11px] text-[#A8A09D] truncate">
                        {r.ownerName || '-'}
                        {r.ownerEmail ? ` · ${r.ownerEmail}` : ''} · {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <RequestStatusBadge status={r.status} isEn={isEn} />
                    <ChevronRight className="w-4 h-4 text-[#A8A09D] shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : visibleHistory.length === 0 ? (
          <Empty icon={<Inbox className="w-7 h-7" />} text={isEn ? 'No decided requests' : 'Belum ada permintaan yang diputuskan'} />
        ) : (
          <ul className="divide-y divide-[#F0ECEA]">
            {visibleHistory.map((r) => (
              <li key={r.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1F1F1F] truncate">{r.storeName}</p>
                  <p className="text-[11px] text-[#A8A09D] truncate">
                    {r.ownerName || '-'}
                    {r.ownerEmail ? ` · ${r.ownerEmail}` : ''} · {formatDate(r.decidedAt || r.createdAt)}
                  </p>
                  {r.decisionNote && <p className="text-[11px] text-[#706866] mt-0.5">{r.decisionNote}</p>}
                </div>
                <RequestStatusBadge status={r.status} isEn={isEn} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <SimpleModal
        open={!!selected}
        title={isEn ? 'Join request' : 'Permintaan gabung'}
        onClose={() => !saving && setSelected(null)}
        footer={
          <>
            <button type="button" className={ghostBtn} onClick={() => setSelected(null)} disabled={!!saving}>
              {isEn ? 'Close' : 'Tutup'}
            </button>
            <button type="button" className={`${ghostBtn} text-[#66000E]`} onClick={() => decide(false)} disabled={!!saving}>
              {saving === 'reject' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              {isEn ? 'Reject' : 'Tolak'}
            </button>
            <button type="button" className={primaryBtn} onClick={() => decide(true)} disabled={!!saving}>
              {saving === 'approve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {isEn ? 'Approve' : 'Setujui'}
            </button>
          </>
        }
      >
        {selected && (
          <>
            <div>
              <p className="text-sm font-semibold text-[#1F1F1F]">{selected.storeName}</p>
              <p className="text-[11px] text-[#A8A09D] mt-0.5">{formatDate(selected.createdAt)}</p>
            </div>
            <dl className="text-xs">
              <dt className="text-[#A8A09D]">{isEn ? 'Owner' : 'Pemilik'}</dt>
              <dd className="text-[#1F1F1F] break-all">{selected.ownerName || '-'}</dd>
              {selected.ownerEmail && <dd className="text-[#706866] break-all">{selected.ownerEmail}</dd>}
            </dl>
            {selected.message && (
              <p className="text-xs text-[#4A4242] whitespace-pre-wrap leading-relaxed rounded-lg bg-[#FAF7F7] border border-[#F0ECEA] p-3">
                {selected.message}
              </p>
            )}
            <div>
              <label className={labelClass}>{isEn ? 'Note to applicant (optional)' : 'Catatan untuk pemohon (opsional)'}</label>
              <textarea className={`${fieldClass} min-h-[70px] resize-y`} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            {modalError && <p className="text-xs text-[#66000E]">{modalError}</p>}
          </>
        )}
      </SimpleModal>
    </div>
  );
};

const Empty: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="py-12 flex flex-col items-center gap-2 text-[#A8A09D]">
    {icon}
    <p className="text-xs">{text}</p>
  </div>
);
