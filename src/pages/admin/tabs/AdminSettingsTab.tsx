import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Check,
  CreditCard,
  Truck,
  Copy,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { PlatformSettings } from '../../../types';
import { Breadcrumb } from '../../../components/common/Breadcrumb';

interface AdminSettingsTabProps {
  isEn: boolean;
  platformSettings: PlatformSettings;
  setPlatformSettings: React.Dispatch<React.SetStateAction<PlatformSettings>>;
  handleSaveSettings: (e?: React.FormEvent) => void;
  handleTestApi: (service: 'midtrans' | 'duitku' | 'biteship' | 'wa') => void;
  testingService: string | null;
  onNavigateOverview?: () => void;
  isSaving?: boolean;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  isEn,
  platformSettings,
  setPlatformSettings,
  handleSaveSettings,
  handleTestApi,
  testingService,
  onNavigateOverview,
  isSaving = false,
}) => {
  const [copiedCallback, setCopiedCallback] = useState(false);

  const handleCopyCallback = () => {
    navigator.clipboard.writeText('https://kroomify.kroombox.com/api/payment/callback');
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const isGatewayActive = platformSettings.paymentGatewayEnabled ?? true;

  return (
    <form onSubmit={handleSaveSettings} className="space-y-4 w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: isEn ? 'Dashboard' : 'Beranda', onClick: onNavigateOverview },
          { label: isEn ? 'System Settings' : 'Pengaturan Sistem', isActive: true },
        ]}
      />

      {/* Header Halaman — HANYA SATU TOMBOL SAVE PERUBAHAN */}
      <div className="pb-3 border-b border-[#E5E0DD] flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#66000E]" />
          <span>{isEn ? 'System Settings' : 'Pengaturan Sistem'}</span>
        </h1>
        <button
          type="submit"
          disabled={isSaving}
          className="px-3.5 py-1.5 rounded-lg bg-[#66000E] hover:bg-[#52000B] text-white font-medium text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{isEn ? 'Save Changes' : 'Simpan Perubahan'}</span>
            </>
          )}
        </button>
      </div>

      {/* SAKELAR MASTER PAYMENT GATEWAY */}
      <div
        className={`p-3.5 rounded-xl border transition-all ${
          isGatewayActive
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-amber-50/70 border-amber-200'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                isGatewayActive ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-xs text-gray-900">
                  {isEn ? 'Payment Gateway' : 'Payment Gateway'}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                    isGatewayActive
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {isGatewayActive
                    ? isEn
                      ? 'Active'
                      : 'Aktif'
                    : isEn
                    ? 'Disabled'
                    : 'Nonaktif'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">
                {isGatewayActive
                  ? isEn
                    ? 'Automated VA, QRIS, and e-wallets active at checkout.'
                    : 'Saluran otomatis (VA, QRIS, e-Wallet) aktif di checkout toko.'
                  : isEn
                  ? 'Gateway disabled. Stores accept manual QRIS & COD.'
                  : 'Gateway nonaktif. Toko hanya menggunakan QRIS manual & COD.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isGatewayActive}
              onChange={(e) =>
                setPlatformSettings({
                  ...platformSettings,
                  paymentGatewayEnabled: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* STATUS & UJI KONEKSI LAYANAN API BACKEND (.ENV) */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-xs text-gray-900">
              {isEn ? 'Backend API Integration Status (.env)' : 'Status Integrasi API Backend (.env)'}
            </h3>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {isEn ? 'Secured Server-side' : 'Aman di Sisi Server'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Duitku Gateway */}
          <div className="p-3 rounded-lg bg-sky-50/70 border border-sky-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-sky-950 block">Duitku Gateway</span>
                <span className="text-[10px] text-sky-700 font-medium">
                  Mode: <strong className="uppercase">{platformSettings.duitkuEnvironment || 'sandbox'}</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTestApi('duitku')}
              disabled={testingService === 'duitku'}
              className="px-2.5 py-1 rounded border border-sky-300 bg-white text-sky-800 hover:bg-sky-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {testingService === 'duitku'
                ? isEn
                  ? 'Testing...'
                  : 'Menguji...'
                : isEn
                ? 'Test'
                : 'Uji Koneksi'}
            </button>
          </div>

          {/* Biteship Ekspedisi */}
          <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-gray-900 block">
                  {isEn ? 'Biteship Shipping' : 'Biteship Ongkir'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isEn ? 'Integrated' : 'Terintegrasi'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTestApi('biteship')}
              disabled={testingService === 'biteship'}
              className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {testingService === 'biteship'
                ? isEn
                  ? 'Testing...'
                  : 'Menguji...'
                : isEn
                ? 'Ping'
                : 'Tes Ping'}
            </button>
          </div>

          {/* Midtrans (Cadangan) */}
          <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-gray-700 block">
                  {isEn ? 'Midtrans (Backup)' : 'Midtrans (Cadangan)'}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  Mode: <strong className="uppercase">{platformSettings.midtransEnvironment || 'sandbox'}</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTestApi('midtrans')}
              disabled={testingService === 'midtrans'}
              className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {testingService === 'midtrans'
                ? isEn
                  ? 'Testing...'
                  : 'Menguji...'
                : isEn
                ? 'Ping'
                : 'Tes'}
            </button>
          </div>
        </div>

        {/* Callback URL Single-line Info with Copy */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-medium text-gray-700">Duitku Callback URL:</span>
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sky-800 font-mono text-[10px] select-all">
              https://kroomify.kroombox.com/api/payment/callback
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopyCallback}
            className="text-[10px] font-medium text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer shrink-0 ml-2"
          >
            {copiedCallback ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">{isEn ? 'Copied' : 'Tersalin'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>{isEn ? 'Copy' : 'Salin'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KEBIJAKAN OPERASIONAL & PEMELIHARAAN */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3 text-xs">
        <div className="pb-2 border-b border-gray-100">
          <h3 className="font-semibold text-xs text-gray-900">
            {isEn ? 'Platform Commission & Payout Policy' : 'Kebijakan Komisi & Penarikan'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-medium text-gray-700 block mb-1">
              {isEn ? 'Transaction Fee (%)' : 'Biaya Transaksi (%)'}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={platformSettings.platformFeePercent}
              onChange={(e) =>
                setPlatformSettings({
                  ...platformSettings,
                  platformFeePercent: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-[#66000E]"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 block mb-1">
              {isEn ? 'Min. Payout (Rp)' : 'Min. Tarik Saldo (Rp)'}
            </label>
            <input
              type="number"
              step="10000"
              min="10000"
              value={platformSettings.payoutMinAmount}
              onChange={(e) =>
                setPlatformSettings({
                  ...platformSettings,
                  payoutMinAmount: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-[#66000E]"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 block mb-1">
              {isEn ? 'Bank Fee (Rp)' : 'Biaya Bank (Rp)'}
            </label>
            <input
              type="number"
              step="500"
              min="0"
              value={platformSettings.payoutBankFee}
              onChange={(e) =>
                setPlatformSettings({
                  ...platformSettings,
                  payoutBankFee: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-[#66000E]"
            />
          </div>
        </div>

        {/* Maintenance Switch */}
        <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-200 mt-2">
          <div>
            <span className="font-medium text-gray-800 block text-xs">
              {isEn ? 'System Maintenance Mode' : 'Mode Pemeliharaan Sistem'}
            </span>
            <span className="text-[11px] text-gray-500">
              {isEn
                ? 'Display maintenance notice to visitors and merchants.'
                : 'Tampilkan halaman pemeliharaan kepada pengunjung dan merchant.'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={platformSettings.maintenanceMode}
            onChange={(e) =>
              setPlatformSettings({ ...platformSettings, maintenanceMode: e.target.checked })
            }
            className="w-4 h-4 accent-[#66000E] cursor-pointer shrink-0"
          />
        </div>
      </div>
    </form>
  );
};
