import React, { useEffect, useState } from 'react';
import { Truck, MapPin, Warehouse, SlidersHorizontal, Lock, Sparkles } from 'lucide-react';
import { Integration, Store } from '../../types';
import { IntegrationCard } from '../../components/integrations/IntegrationCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { BranchManagement } from '../../components/shipping/BranchManagement';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { integrationService, STORE_COURIER_PROVIDERS } from '../../services/integrationService';

const isStoreCourier = (i: Integration) =>
  (STORE_COURIER_PROVIDERS as readonly string[]).includes((i.provider || '').toLowerCase());

interface ShippingListPageProps {
  store?: Store;
  onNavigateBilling?: () => void;
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
  onSaveConfig: (id: string, config: Record<string, any>) => void;
  onShowNotification: (msg: string) => void;
  onNavigateDashboard?: () => void;
}

export const ShippingListPage: React.FC<ShippingListPageProps> = ({
  store,
  onNavigateBilling,
  integrations,
  onToggleIntegration,
  onSaveConfig,
  onShowNotification,
  onNavigateDashboard,
}) => {
  const { t, isEn } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'couriers'>('branches');

  // GoSend (kurir instan) tidak didukung alur resi, jadi tidak ditawarkan di sini.
  const shippingIntegrations = integrations.filter(
    (i) => i.type === 'shipping' && (i.provider || '').toLowerCase() !== 'gosend'
  );
  const activeCount = shippingIntegrations.filter((i) => i.isConnected).length;

  // Kurir aktif disimpan per toko di database agar checkout pembeli & Atur Pengiriman memakai
  // daftar yang sama. Saat halaman dibuka, samakan tampilan dengan yang tersimpan.
  useEffect(() => {
    if (!store?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const saved = await integrationService.getStoreCouriers(store.id);
        if (cancelled) return;
        const couriers = integrations.filter((i) => i.type === 'shipping' && isStoreCourier(i));
        if (saved === null) {
          await integrationService.saveStoreCouriers(
            store.id,
            couriers.filter((i) => i.isConnected).map((i) => i.provider)
          );
          return;
        }
        couriers.forEach((i) => {
          if (i.isConnected !== saved.includes(i.provider.toLowerCase())) onToggleIntegration(i.id);
        });
      } catch (err) {
        console.warn('[ShippingListPage] load store couriers failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.id]);

  const handleToggle = async (id: string) => {
    const target = shippingIntegrations.find((i) => i.id === id);
    onToggleIntegration(id);
    if (!store?.id || !target || !isStoreCourier(target)) return;
    const next = shippingIntegrations
      .filter(isStoreCourier)
      .filter((i) => (i.id === id ? !i.isConnected : i.isConnected))
      .map((i) => i.provider);
    try {
      await integrationService.saveStoreCouriers(store.id, next);
    } catch (err) {
      console.warn('[ShippingListPage] save store couriers failed:', err);
      onToggleIntegration(id);
      onShowNotification(
        isEn
          ? 'Failed to save courier settings. Please try again.'
          : 'Gagal menyimpan pengaturan kurir. Silakan coba lagi.'
      );
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-poppins pb-24 lg:pb-8 text-left w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: t('nav_shipping', 'Pengiriman'), isActive: true },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#66000E]" />
            <span>{t('nav_shipping', 'Pengiriman')}</span>
          </h1>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0DD] shadow-2xs text-xs text-[#241A1A]">
            <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span className="font-medium">
              {activeCount} {t('shipping_of', 'dari')} {shippingIntegrations.length} {t('shipping_active_badge', 'Ekspedisi Aktif')}
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation (Responsive Segmented Dock Container) */}
      <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-[#E5E0DD] shadow-2xs font-poppins">
        <button
          onClick={() => setActiveSubTab('branches')}
          className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 min-h-[38px] sm:min-h-[42px] rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer select-none active:scale-[0.97] ${
            activeSubTab === 'branches'
              ? 'bg-gradient-to-r from-[#66000E] to-[#801010] text-white shadow-xs font-bold z-10'
              : 'bg-white text-[#555555] hover:bg-white/95 border border-[#E5E0DD] hover:border-[#66000E]/40 hover:text-[#66000E]'
          }`}
        >
          <Warehouse className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${activeSubTab === 'branches' ? 'text-white' : 'text-[#777777] group-hover:text-[#66000E]'}`} />
          <span className="hidden sm:inline">{t('tab_branches', 'Cabang & Gudang Asal')}</span>
          <span className="sm:hidden">{t('tab_branches_short', 'Cabang Gudang')}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('couriers')}
          className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 min-h-[38px] sm:min-h-[42px] rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out cursor-pointer select-none active:scale-[0.97] ${
            activeSubTab === 'couriers'
              ? 'bg-gradient-to-r from-[#66000E] to-[#801010] text-white shadow-xs font-bold z-10'
              : 'bg-white text-[#555555] hover:bg-white/95 border border-[#E5E0DD] hover:border-[#66000E]/40 hover:text-[#66000E]'
          }`}
        >
          <Truck className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${activeSubTab === 'couriers' ? 'text-white' : 'text-[#777777] group-hover:text-[#66000E]'}`} />
          <span className="hidden sm:inline">{t('tab_couriers', 'Pilihan Kurir & Ekspedisi')}</span>
          <span className="sm:hidden">{t('tab_couriers_short', 'Kurir & Ekspedisi')}</span>
        </button>
      </div>

      {/* TAB 1: CABANG & GUDANG ASAL */}
      {activeSubTab === 'branches' && (
        <BranchManagement storeId={store?.id} onShowNotification={onShowNotification} />
      )}

      {/* TAB 2: PILIHAN KURIR EKSPEDISI */}
      {activeSubTab === 'couriers' && (
        <div className="space-y-4">
          {/* Info Notice Banner */}
          <div className="p-3.5 rounded-xl bg-[#FBF9F9] border border-[#EBE5E2] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-xs text-[#5F5652] leading-relaxed">
              <p className="font-semibold text-[#241A1A]">{t('calc_biteship_title', 'Kalkulasi Ongkir & Biteship Aggregator')}</p>
              <p className="mt-0.5">
                {t('calc_biteship_desc', 'Ekspedisi yang aktif akan langsung muncul saat pembeli melakukan checkout di etalase toko. Ongkos kirim dihitung akurat berdasarkan lokasi cabang gudang asal dan kode pos tujuan.')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#241A1A]">
              {t('available_couriers_heading', 'Pilihan Ekspedisi & Kurir Logistik')}
            </h2>
            <span className="text-xs text-[#706866]">
              {activeCount} {t('shipping_of', 'dari')} {shippingIntegrations.length} {t('couriers_active_count', 'aktif')}
            </span>
          </div>

          <div className="flex flex-col space-y-2.5">
            {shippingIntegrations.map((int) => (
              <IntegrationCard
                key={int.id}
                integration={int}
                isLocked={false}
                onToggle={handleToggle}
                onSaveConfig={onSaveConfig}
                onShowNotification={onShowNotification}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
