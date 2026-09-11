import React, { useState } from 'react';
import { Truck, MapPin, Warehouse, SlidersHorizontal } from 'lucide-react';
import { Integration } from '../../types';
import { IntegrationCard } from '../../components/integrations/IntegrationCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { BranchManagement } from '../../components/shipping/BranchManagement';

interface ShippingListPageProps {
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
  onSaveConfig: (id: string, config: Record<string, string>) => void;
  onShowNotification: (msg: string) => void;
}

export const ShippingListPage: React.FC<ShippingListPageProps> = ({
  integrations,
  onToggleIntegration,
  onSaveConfig,
  onShowNotification,
}) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'branches' | 'couriers'>('branches');

  const shippingIntegrations = integrations.filter((i) => i.type === 'shipping');
  const activeCount = shippingIntegrations.filter((i) => i.isConnected).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 text-left max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-[#66000E]" />
            <span>{t('nav_shipping', 'Logistik & Pengiriman')}</span>
          </h1>
          <p className="text-xs text-[#706866] mt-1">
            Kelola cabang gudang asal pengiriman (origin) dan konfigurasi kurir ekspedisi otomatis (Biteship).
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0DD] shadow-2xs text-xs text-[#241A1A]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">
              {activeCount} dari {shippingIntegrations.length} {t('services_active', 'Ekspedisi Aktif')}
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-1">
        <button
          onClick={() => setActiveSubTab('branches')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
            activeSubTab === 'branches'
              ? 'bg-[#9A0602] text-white shadow-xs'
              : 'text-[#555555] hover:bg-[#F7F7F7] hover:text-[#1F1F1F]'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Cabang & Gudang Asal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('couriers')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
            activeSubTab === 'couriers'
              ? 'bg-[#9A0602] text-white shadow-xs'
              : 'text-[#555555] hover:bg-[#F7F7F7] hover:text-[#1F1F1F]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Pilihan Kurir & Ekspedisi</span>
        </button>
      </div>

      {/* TAB 1: CABANG & GUDANG ASAL */}
      {activeSubTab === 'branches' && (
        <BranchManagement onShowNotification={onShowNotification} />
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
              <p className="font-semibold text-[#241A1A]">Kalkulasi Ongkir & Biteship Aggregator</p>
              <p className="mt-0.5">
                Ekspedisi yang aktif akan langsung muncul saat pembeli melakukan checkout di etalase toko. Ongkos kirim dihitung akurat berdasarkan lokasi cabang gudang asal dan kode pos tujuan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#241A1A]">
              Pilihan Ekspedisi & Kurir Logistik
            </h2>
            <span className="text-xs text-[#706866]">
              {activeCount} dari {shippingIntegrations.length} aktif
            </span>
          </div>

          <div className="flex flex-col space-y-2.5">
            {shippingIntegrations.map((int) => (
              <IntegrationCard
                key={int.id}
                integration={int}
                onToggle={onToggleIntegration}
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
