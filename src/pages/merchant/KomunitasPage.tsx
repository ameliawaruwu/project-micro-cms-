import React, { useCallback, useEffect, useState } from 'react';
import { Users, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  communityMembershipService,
  membershipSourceLabel,
  MyCommunityData,
} from '../../services/communityMembershipService';
import { formatDate } from '../../components/community/communityUi';
import { ghostBtn } from '../../components/tickets/ticketUi';

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

export const KomunitasPage: React.FC<KomunitasPageProps> = ({ onNavigateDashboard }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [data, setData] = useState<MyCommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
              ? 'Communities your store belongs to. Stores are added by the community lead (Sub-Admin Utama), or automatically when the owner email matches the email registered in the community portal.'
              : 'Komunitas tempat toko Anda bergabung. Toko ditambahkan oleh Sub-Admin Utama komunitas, atau otomatis bila email pemilik sama dengan email terdaftar di portal komunitas.'}
          </p>
        </div>
        <button type="button" onClick={load} className={`${ghostBtn} shrink-0`} aria-label={isEn ? 'Refresh' : 'Muat ulang'}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !data ? (
        <div className="py-12 flex justify-center text-[#A8A09D]">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : loadError ? (
        <div className="py-10 px-4 text-center text-xs text-[#66000E] bg-white border border-[#E5E0DD] rounded-xl">{loadError}</div>
      ) : (
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
              text={
                isEn
                  ? 'Your store is not in any community yet. Contact the community lead to be added.'
                  : 'Toko Anda belum tergabung di komunitas mana pun. Hubungi Sub-Admin Utama komunitas untuk ditambahkan.'
              }
            />
          ) : (
            <ul className="divide-y divide-[#F0ECEA]">
              {data!.memberships.map((m) => (
                <li key={memberKey(m.storeId, m.communityId)} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF7F7] border border-[#F0ECEA] flex items-center justify-center overflow-hidden shrink-0">
                    {m.logoUrl ? (
                      <img src={m.logoUrl} alt={m.name} className="w-full h-full object-cover" />
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
      )}
    </div>
  );
};
