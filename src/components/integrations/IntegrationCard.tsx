import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Settings,
  X,
  Zap,
} from 'lucide-react';
import { Integration } from '../../types';

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string) => void;
  onSaveConfig: (id: string, config: Record<string, string>) => void;
  onShowNotification: (msg: string) => void;
}

// Concise short descriptions for list items
const CONCISE_DESCRIPTIONS: Record<string, string> = {
  'int-midtrans': 'Virtual Account BCA/Mandiri/BRI, QRIS, E-Wallet & Kartu Kredit',
  'int-qris': 'Scan QRIS otomatis dari semua E-Wallet & Mobile Banking',
  'int-stripe': 'Kartu kredit & debit internasional (Visa, Mastercard, AMEX)',
  'int-jnt': 'Jemput paket otomatis & cetak nomor resi instan',
  'int-jne': 'Layanan pengiriman REG, YES (Esok Sampai), & JTR Trucking',
  'int-sicepat': 'Layanan pengiriman hemat HALU & BEST Sameday',
  'int-gosend': 'Kurir motor kilat sampai dalam 1-2 jam (khusus dalam kota)',
  'int-biteship': 'Satu koneksi API untuk 25+ ekspedisi logistik Indonesia',
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onToggle,
  onSaveConfig,
  onShowNotification,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiKey, setApiKey] = useState(integration.config?.apiKey || '');
  const [merchantId, setMerchantId] = useState(integration.config?.merchantId || '');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(integration.id, {
      apiKey,
      merchantId,
    });
    setShowConfigModal(false);
    onShowNotification(`Pengaturan ${integration.name} berhasil disimpan.`);
  };

  const handleToggle = () => {
    onToggle(integration.id);
    onShowNotification(
      integration.isConnected
        ? `${integration.name} dinonaktifkan.`
        : `${integration.name} berhasil diaktifkan!`
    );
  };

  const shortDesc = CONCISE_DESCRIPTIONS[integration.id] || integration.description;

  return (
    <>
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#EAEAEA] shadow-2xs hover:border-[#D5CEC9] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
        {/* Left: Logo & Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-[#FAF7F7] border border-[#EAEAEA] overflow-hidden flex items-center justify-center p-1.5 shrink-0">
            <img
              src={integration.logo}
              alt={integration.name}
              className="w-full h-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-[#241A1A] truncate">
                {integration.name}
              </h4>
              {integration.isPopular && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-[#F9EDEF] text-[#66000E] border border-[#F0D5D8] px-1.5 py-0.2 rounded-full shrink-0">
                  <Zap className="w-2.5 h-2.5 fill-[#66000E]" />
                  <span>Populer</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#706866] truncate mt-0.5">
              {shortDesc}
            </p>
          </div>
        </div>

        {/* Right: Status, Settings Button & Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F3EFEF]">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                integration.isConnected ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            ></span>
            <span
              className={`text-xs font-medium ${
                integration.isConnected ? 'text-emerald-700 font-semibold' : 'text-[#706866]'
              }`}
            >
              {integration.isConnected ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            {/* Settings button */}
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1 text-xs font-medium text-[#706866] hover:text-[#241A1A] p-2 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-[#F3EFEF] border border-transparent hover:border-[#EAEAEA] transition cursor-pointer"
              title="Atur Kunci API"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Atur</span>
            </button>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleToggle}
              role="switch"
              aria-checked={integration.isConnected}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                integration.isConnected ? 'bg-[#66000E]' : 'bg-slate-200'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  integration.isConnected ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Config Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-[#241A1A]">
                <Settings className="w-4 h-4 text-[#66000E]" />
                <span>Pengaturan {integration.name}</span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg text-[#706866] hover:text-[#241A1A] hover:bg-[#F3EFEF] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="py-3 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#706866] mb-1">
                  Merchant ID / Client Key
                </label>
                <input
                  type="text"
                  placeholder="Contoh: M-1092819"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D5CEC9] bg-white text-[#241A1A] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#706866] mb-1">
                  Server Key / API Secret
                </label>
                <input
                  type="password"
                  placeholder="SB-Mid-server-xxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-[#D5CEC9] bg-white text-[#241A1A] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-[#D5CEC9] text-xs font-semibold text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#66000E] hover:bg-[#52000B] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

