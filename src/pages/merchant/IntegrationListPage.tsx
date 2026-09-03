import React, { useState } from 'react';
import {
  CreditCard,
  Truck,
  Zap,
} from 'lucide-react';
import { Integration } from '../../types';
import { IntegrationCard } from '../../components/integrations/IntegrationCard';
import { useLanguage } from '../../contexts/LanguageContext';

interface IntegrationListPageProps {
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
  onSaveConfig: (id: string, config: Record<string, string>) => void;
  onShowNotification: (msg: string) => void;
}

export const IntegrationListPage: React.FC<IntegrationListPageProps> = ({
  integrations,
  onToggleIntegration,
  onSaveConfig,
  onShowNotification,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'pembayaran' | 'pengiriman'>('pembayaran');

  const paymentIntegrations = integrations.filter((i) => i.type === 'payment');
  const shippingIntegrations = integrations.filter((i) => i.type === 'shipping');

  const activePaymentsCount = paymentIntegrations.filter((i) => i.isConnected).length;
  const activeShippingsCount = shippingIntegrations.filter((i) => i.isConnected).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 text-left max-w-5xl">
      {/* Page Header - Clean & Concise */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F] tracking-tight">
            {t('integrations_title', 'Pembayaran & Pengiriman')}
          </h1>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0DD] shadow-2xs text-xs text-[#241A1A]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">{activePaymentsCount + activeShippingsCount} {t('services_active', 'Layanan Aktif')}</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher: [ Pembayaran ] [ Pengiriman ] */}
      <div className="flex items-center gap-1.5 bg-[#F3EFEF] p-1 rounded-xl w-full sm:w-fit border border-[#E5E0DD]">
        <button
          type="button"
          onClick={() => setActiveTab('pembayaran')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[38px] ${
            activeTab === 'pembayaran'
              ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
              : 'text-[#706866] hover:text-[#241A1A] hover:bg-white/50'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${activeTab === 'pembayaran' ? 'text-[#66000E]' : 'text-[#706866]'}`} />
          <span>{t('tab_payment', 'Pembayaran')}</span>
          <span
            className={`px-2 py-0.2 text-[10px] font-bold rounded-full transition-colors ${
              activeTab === 'pembayaran'
                ? 'bg-[#F9EDEF] text-[#66000E]'
                : 'bg-white/80 text-[#706866]'
            }`}
          >
            {activePaymentsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pengiriman')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[38px] ${
            activeTab === 'pengiriman'
              ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
              : 'text-[#706866] hover:text-[#241A1A] hover:bg-white/50'
          }`}
        >
          <Truck className={`w-4 h-4 ${activeTab === 'pengiriman' ? 'text-[#66000E]' : 'text-[#706866]'}`} />
          <span>{t('tab_shipping', 'Pengiriman')}</span>
          <span
            className={`px-2 py-0.2 text-[10px] font-bold rounded-full transition-colors ${
              activeTab === 'pengiriman'
                ? 'bg-[#F9EDEF] text-[#66000E]'
                : 'bg-white/80 text-[#706866]'
            }`}
          >
            {activeShippingsCount}
          </span>
        </button>
      </div>

      {/* TAB 1: PEMBAYARAN */}
      {activeTab === 'pembayaran' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#241A1A]">
              Penyedia Layanan Pembayaran
            </h2>
            <span className="text-xs text-[#706866]">
              {activePaymentsCount} dari {paymentIntegrations.length} aktif
            </span>
          </div>

          {/* Payment Gateways List */}
          <div className="flex flex-col space-y-2.5">
            {paymentIntegrations.map((int) => (
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

      {/* TAB 2: PENGIRIMAN */}
      {activeTab === 'pengiriman' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#241A1A]">
              Pilihan Ekspedisi & Kurir
            </h2>
            <span className="text-xs text-[#706866]">
              {activeShippingsCount} dari {shippingIntegrations.length} aktif
            </span>
          </div>

          {/* Shipping Couriers List */}
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
