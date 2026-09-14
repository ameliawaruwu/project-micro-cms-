import React from 'react';
import { Truck, MapPin } from 'lucide-react';
import { Integration } from '../../types';
import { IntegrationCard } from '../../components/integrations/IntegrationCard';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const shippingIntegrations = integrations.filter((i) => i.type === 'shipping');
  const activeCount = shippingIntegrations.filter((i) => i.isConnected).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 text-left w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-[#66000E]" />
            <span>{t('nav_shipping', 'Pengiriman')}</span>
          </h1>
          <p className="text-xs text-[#706866] mt-1">
            {t(
              'shipping_page_subtitle',
              'Atur pilihan kurir ekspedisi, tarif ongkos kirim otomatis, dan kemudahan cetak nomor resi pengiriman.'
            )}
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

      {/* Info Notice Banner */}
      <div className="p-3.5 rounded-xl bg-[#FBF9F9] border border-[#EBE5E2] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#5F5652] leading-relaxed">
          <p className="font-semibold text-[#241A1A]">Kalkulasi Ongkir & Pelacakan Resi Otomatis</p>
          <p className="mt-0.5">
            Ekspedisi yang aktif akan langsung muncul saat pembeli melakukan checkout di etalase toko. Ongkir dihitung akurat berdasarkan lokasi tujuan dan berat barang.
          </p>
        </div>
      </div>

      {/* List of Shipping Couriers */}
      <div className="space-y-4">
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
    </div>
  );
};
