import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Send, Inbox, Loader2, RefreshCw, X } from 'lucide-react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  communityMembershipService,
  membershipSourceLabel,
  MyCommunityData,
} from '../../services/communityMembershipService';
import { RequestStatusBadge, formatDate } from '../../components/community/communityUi';
import { SimpleModal, fieldClass, ghostBtn, labelClass, primaryBtn } from '../../components/tickets/ticketUi';

interface KomunitasPageProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateDashboard?: () => void;
}

const EmptyState: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="py-10 flex flex-col items-center gap-2 text-[#A8A09D] px-4 text-center">
    {icon}
    <p className="text-xs">{text}</p>
  </div>
);

const memberKey = (sid: string, cid: string) => `${sid}::${cid}`;

export const KomunitasPage: React.FC<KomunitasPageProps> = ({ onShowToast, onNavigateDashboard }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [data, setData] = useState<MyCommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [storeId, setStoreId] = useState('');
  const [communityId, setCommunityId] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await communityMembershipService.getMine());
    } catch (err: any) {
      setLoadError(err?.message || (isEn ? 'Failed to load.' : 'Gagal memuat data.'));
    } finally {
      setLoading(false);
    }
  }, [isEn]);

  useEffect(() => {
    load();
  }, [load]);

  const memberSet = useMemo(() => new Set((data?.memberships || []).map((m) => memberKey(m.storeId, m.communityId))), [data]);
  const pendingSet = useMemo(
    () => new Set((data?.requests || []).filter((r) => r.status === 'pending').map((r) => memberKey(r.storeId, r.communityId))),
    [data]
  );

  // Komunitas yang masih bisa diminta untuk toko terpilih (belum anggota, belum ada permintaan menunggu).
  const requestable = useMemo(
    () =>
      (data?.communities || []).filter(
        (c) => storeId && !memberSet.has(memberKey(storeId, c.id)) && !pendingSet.has(memberKey(storeId, c.id))
      ),
    [data, storeId, memberSet, pendingSet]
  );

  useEffect(() => {
    if (communityId && !requestable.some((c) => c.id === communityId)) setCommunityId('');
  }, [requestable, communityId]);

  const openModal = () => {
    setStoreId(data?.stores[0]?.id || '');
    setCommunityId('');
    setMessage('');
    setFormError(null);
    setModalOpen(true);
  };

  const submit = async () => {
    if (!storeId || !communityId) {
      setFormError(isEn ? 'Choose a store and a community.' : 'Pilih toko dan komunitas.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await communityMembershipService.requestJoin(storeId, communityId, message.trim());
      setModalOpen(false);
      onShowToast?.(isEn ? 'Join request sent.' : 'Permintaan gabung terkirim.', 'success');
      await load();
    } catch (err: any) {
      setFormError(err?.message || (isEn ? 'Failed to send.' : 'Gagal mengirim.'));
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id: string) => {
    setBusyId(id);
    try {
      await communityMembershipService.cancelRequest(id);
      onShowToast?.(isEn ? 'Request cancelled.' : 'Permintaan dibatalkan.', 'success');
      await load();
    } catch (err: any) {
      onShowToast?.(err?.message || (isEn ? 'Failed to cancel.' : 'Gagal membatalkan.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const storeName = (id: string) => data?.stores.find((s) => s.id === id)?.name || '';
  const hasStores = (data?.stores.length || 0) > 0;

  return (
    <div className="space-y-4 max-w-4xl">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateDashboard },
          { label: isEn ? 'Community' : 'Komunitas', isActive: true },
        ]}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[#1F1F1F]">{isEn ? 'Community' : 'Komunitas'}</h1>
          <p className="text-xs text-[#706866] mt-0.5">
            {isEn
              ? 'Communities your store belongs to. A store whose owner email matches the email registered in the community portal joins automatically; otherwise send a join request.'
              : 'Komunitas tempat toko Anda bergabung. Toko dengan email yang sama dengan email terdaftar di portal komunitas masuk otomatis; selain itu, ajukan permintaan gabung.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={load} className={ghostBtn} aria-label="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button type="button" onClick={openModal} disabled={!hasStores || loading} className={primaryBtn}>
            <Send className="w-3.5 h-3.5" />
            <span>{isEn ? 'Request to join' : 'Minta gabung'}</span>
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="py-12 flex justify-center text-[#A8A09D]">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : loadError ? (
        <div className="py-10 px-4 text-center text-xs text-[#66000E] bg-white border border-[#E5E0DD] rounded-xl">{loadError}</div>
      ) : (
        <>
          <section className="bg-white border border-[#E5E0DD] rounded-xl overflow-hidden">
            <h2 className="px-4 py-3 text-sm font-semibold text-[#1F1F1F] border-b border-[#F0ECEA]">
              {isEn ? 'My communities' : 'Komunitas saya'}
            </h2>
            {!hasStores ? (
              <EmptyState
                icon={<Inbox className="w-7 h-7" />}
                text={isEn ? 'Create a store first to join a community.' : 'Buat toko terlebih dahulu untuk bergabung ke komunitas.'}
              />
            ) : (data?.memberships.length || 0) === 0 ? (
              <EmptyState
                icon={<Users className="w-7 h-7" />}
                text={isEn ? 'Your store is not in any community yet.' : 'Toko Anda belum tergabung di komunitas mana pun.'}
              />
            ) : (
              <ul className="divide-y divide-[#F0ECEA]">
                {data!.memberships.map((m) => (
                  <li key={memberKey(m.storeId, m.communityId)} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF7F7] border border-[#F0ECEA] flex items-center justify-center overflow-hidden shrink-0">
                      {m.logoUrl ? (
                        <img src={m.logoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-4 h-4 text-[#66000E]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1F1F1F] truncate">{m.name}</p>
                      <p className="text-[11px] text-[#A8A09D] truncate">
                        {storeName(m.storeId)} · {membershipSourceLabel(m.source, isEn)}
                        {m.joinedAt ? ` · ${formatDate(m.joinedAt)}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-white border border-[#E5E0DD] rounded-xl overflow-hidden">
            <h2 className="px-4 py-3 text-sm font-semibold text-[#1F1F1F] border-b border-[#F0ECEA]">
              {isEn ? 'My join requests' : 'Permintaan gabung saya'}
            </h2>
            {(data?.requests.length || 0) === 0 ? (
              <EmptyState icon={<Inbox className="w-7 h-7" />} text={isEn ? 'No join requests' : 'Belum ada permintaan gabung'} />
            ) : (
              <ul className="divide-y divide-[#F0ECEA]">
                {data!.requests.map((r) => (
                  <li key={r.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1F1F1F] truncate">{r.communityName}</p>
                      <p className="text-[11px] text-[#A8A09D] truncate">
                        {r.storeName} · {formatDate(r.createdAt)}
                      </p>
                      {r.decisionNote && <p className="text-[11px] text-[#706866] mt-1">{r.decisionNote}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <RequestStatusBadge status={r.status} isEn={isEn} />
                      {r.status === 'pending' && (
                        <button type="button" onClick={() => cancel(r.id)} disabled={busyId === r.id} className={ghostBtn}>
                          {busyId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          <span>{isEn ? 'Cancel' : 'Batalkan'}</span>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <SimpleModal
        open={modalOpen}
        title={isEn ? 'Request to join a community' : 'Minta gabung komunitas'}
        onClose={() => !saving && setModalOpen(false)}
        footer={
          <>
            <button type="button" className={ghostBtn} onClick={() => setModalOpen(false)} disabled={saving}>
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button type="button" className={primaryBtn} onClick={submit} disabled={saving || !communityId}>
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEn ? 'Send request' : 'Kirim permintaan'}
            </button>
          </>
        }
      >
        <div>
          <label className={labelClass}>{isEn ? 'Store' : 'Toko'}</label>
          <select className={fieldClass} value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            {(data?.stores || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{isEn ? 'Community' : 'Komunitas'}</label>
          <select className={fieldClass} value={communityId} onChange={(e) => setCommunityId(e.target.value)}>
            <option value="">{isEn ? 'Choose a community' : 'Pilih komunitas'}</option>
            {requestable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {requestable.length === 0 && (
            <p className="text-[11px] text-[#A8A09D] mt-1">
              {isEn ? 'No community available for this store.' : 'Tidak ada komunitas yang tersedia untuk toko ini.'}
            </p>
          )}
        </div>
        <div>
          <label className={labelClass}>{isEn ? 'Message (optional)' : 'Pesan (opsional)'}</label>
          <textarea className={`${fieldClass} min-h-[80px] resize-y`} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        {formError && <p className="text-xs text-[#66000E]">{formError}</p>}
      </SimpleModal>
    </div>
  );
};
