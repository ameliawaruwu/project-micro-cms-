import React, { useState } from 'react';
import { Truck, MapPin, Warehouse, SlidersHorizontal, Lock, Sparkles } from 'lucide-react';
import { Integration, Store } from '../../types';
import { IntegrationCard } from '../../components/integrations/IntegrationCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { BranchManagement } from '../../components/shipping/BranchManagement';
import { Breadcrumb } from '../../components/common/Breadcrumb';

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
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'couriers'>('branches');

  const isFreePlan = !store?.plan || store.plan === 'free' || store.plan === 'free_trial' || store.plan === 'starter';

  const shippingIntegrations = integrations.filter((i) => i.type === 'shipping');
  const activeCount = isFreePlan ? 0 : shippingIntegrations.filter((i) => i.isConnected).length;

  const handleToggle = (id: string) => {
    if (isFreePlan) {
      onShowNotification(
        'Fitur integrasi ekspedisi terkunci pada Paket Free. Silakan upgrade ke paket hosting berbayar.'
      );
      if (onNavigateBilling) {
        onNavigateBilling();
      }
      return;
    }
    onToggleIntegration(id);
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
          {/* Locked Alert on Free Plan */}
          {isFreePlan && (
            <div className="bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7]/30 to-white border-2 border-[#F59E0B]/40 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Lock className="w-5 h-5 text-[#B45309]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-[#92400E]">
                      {t('shipping_locked_title', 'Integrasi Ekspedisi Otomatis Terkunci (Paket Free)')}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold text-[10px] border border-[#FDE68A]">
                      {t('hosting_plan_required', 'Perlu Paket Hosting')}
                    </span>
                  </div>
                  <p className="text-xs text-[#78350F] mt-1 max-w-2xl leading-relaxed">
                    {t('shipping_locked_desc', 'Kalkulasi ongkos kirim otomatis & integrasi kurir (JNE, J&T, SiCepat, Anteraja, GoSend via Biteship) memerlukan paket hosting server aktif (Personal Rp 350.000/thn atau Community UMKM Rp 1.000.000/thn).')}
                  </p>
                </div>
              </div>
              {onNavigateBilling && (
                <button
                  type="button"
                  onClick={onNavigateBilling}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] text-white text-xs font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Upgrade Paket Hosting</span>
                </button>
              )}
            </div>
          )}

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

          <div className={`flex flex-col space-y-2.5 ${isFreePlan ? 'opacity-85 pointer-events-auto' : ''}`}>
            {shippingIntegrations.map((int) => (
              <IntegrationCard
                key={int.id}
                integration={int}
                isLocked={isFreePlan}
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
