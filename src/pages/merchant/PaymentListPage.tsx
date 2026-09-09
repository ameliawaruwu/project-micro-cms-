import React from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { Integration } from '../../types';
import { IntegrationCard } from '../../components/integrations/IntegrationCard';
import { useLanguage } from '../../contexts/LanguageContext';

interface PaymentListPageProps {
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
  onSaveConfig: (id: string, config: Record<string, string>) => void;
  onShowNotification: (msg: string) => void;
}

export const PaymentListPage: React.FC<PaymentListPageProps> = ({
  integrations,
  onToggleIntegration,
  onSaveConfig,
  onShowNotification,
}) => {
  const { t } = useLanguage();
  const paymentIntegrations = integrations.filter((i) => i.type === 'payment');
  const activeCount = paymentIntegrations.filter((i) => i.isConnected).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 text-left max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[#66000E]" />
            <span>{t('nav_payment', 'Pembayaran')}</span>
          </h1>
          <p className="text-xs text-[#706866] mt-1">
            {t(
              'payment_page_subtitle',
              'Kelola metode pembayaran online, QRIS otomatis, transfer bank (VA), dan kartu kredit untuk toko Anda.'
            )}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0DD] shadow-2xs text-xs text-[#241A1A]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">
              {activeCount} dari {paymentIntegrations.length} {t('services_active', 'Layanan Aktif')}
            </span>
          </div>
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="p-3.5 rounded-xl bg-[#FBF9F9] border border-[#EBE5E2] flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#5F5652] leading-relaxed">
          <p className="font-semibold text-[#241A1A]">Penyelesaian Pembayaran Instan & Otomatis</p>
          <p className="mt-0.5">
            Ketika pelanggan membayar via QRIS atau Virtual Account, sistem langsung mendeteksi transaksi secara real-time dan memperbarui status pesanan menjadi Lunas.
          </p>
        </div>
      </div>

      {/* List of Payment Providers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#241A1A]">
            Penyedia Layanan Pembayaran
          </h2>
          <span className="text-xs text-[#706866]">
            {activeCount} dari {paymentIntegrations.length} aktif
          </span>
        </div>

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
    </div>
  );
};
