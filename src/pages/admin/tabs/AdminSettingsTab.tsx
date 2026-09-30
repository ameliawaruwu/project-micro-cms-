import React from 'react';
import {
  Settings as SettingsIcon,
  Check,
  Key,
  CreditCard,
  Truck,
} from 'lucide-react';
import { PlatformSettings } from '../../../types';

import { Breadcrumb } from '../../../components/common/Breadcrumb';

interface AdminSettingsTabProps {
  isEn: boolean;
  platformSettings: PlatformSettings;
  setPlatformSettings: React.Dispatch<React.SetStateAction<PlatformSettings>>;
  handleSaveSettings: (e: React.FormEvent) => void;
  handleTestApi: (service: 'midtrans' | 'duitku' | 'biteship' | 'wa') => void;
  testingService: string | null;

  onNavigateOverview?: () => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  isEn,
  platformSettings,
  setPlatformSettings,
  handleSaveSettings,
  handleTestApi,
  testingService,
  onNavigateOverview,
}) => {
  return (
    <div className="space-y-4 w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: isEn ? 'Dashboard' : 'Beranda', onClick: onNavigateOverview },
          { label: isEn ? 'System Settings' : 'Pengaturan Sistem', isActive: true },
        ]}
      />

      {/* Header Judul Halaman di Bawah Topbar */}
      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-[#66000E]" />
            <span>{isEn ? 'System Settings' : 'Pengaturan Sistem'}</span>
          </h1>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-3.5 py-1.5 rounded-lg bg-[#66000E] hover:bg-[#52000B] text-white font-medium text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isEn ? 'Save Changes' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      {/* 1. STATUS INTEGRASI API & GATEWAY (.ENV) */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="pb-2 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-xs text-gray-900 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-gray-500" />
              <span>{isEn ? 'Master API Key Integration Status (.env)' : 'Status Integrasi Kunci API Master (.env)'}</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              {isEn ? 'According to security standards, all Secret API Keys are configured via backend environment (.env) files so they are not exposed to the browser.' : 'Sesuai standar keamanan, seluruh Secret API Key dikonfigurasi melalui file environment backend (.env) agar tidak terekspos di browser.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Duitku Status (Active Gateway) */}
          <div className="p-3 rounded-lg bg-sky-50/80 border border-sky-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-sky-950 block">Duitku Gateway (Aktif)</span>
                <span className="text-[10px] text-sky-700 font-medium flex items-center gap-1">
                  Mode: <strong className="uppercase text-sky-900">{platformSettings.duitkuEnvironment || 'sandbox'}</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTestApi('duitku')}
              disabled={testingService === 'duitku'}
              className="px-2.5 py-1 rounded border border-sky-300 bg-white text-sky-800 hover:bg-sky-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50 shadow-xs flex items-center gap-1"
            >
              {testingService === 'duitku' ? (isEn ? 'Testing...' : 'Menguji...') : (isEn ? 'Test Connection' : 'Uji Koneksi')}
            </button>
          </div>

          {/* Biteship Status */}
          <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-gray-900 block">{isEn ? 'Biteship Shipping' : 'Biteship Ekspedisi'}</span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isEn ? 'Active & Integrated' : 'Aktif & Terintegrasi'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTestApi('biteship')}
              disabled={testingService === 'biteship'}
              className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {testingService === 'biteship' ? (isEn ? 'Testing...' : 'Menguji...') : (isEn ? 'Ping Test' : 'Tes Ping')}
            </button>
          </div>

          {/* Midtrans Status (Secondary / Legacy) */}
          <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-gray-700 block">Midtrans (Cadangan)</span>
                <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                  Mode: <strong className="uppercase">{platformSettings.midtransEnvironment || 'sandbox'}</strong>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleTestApi('midtrans')}
              disabled={testingService === 'midtrans'}
              className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50 shadow-xs flex items-center gap-1"
            >
              {testingService === 'midtrans' ? (isEn ? 'Testing...' : 'Menguji...') : (isEn ? 'Ping' : 'Tes')}
            </button>
          </div>
        </div>

        {/* DUITKU CREDENTIALS FORM */}
        <div className="pt-2 border-t border-gray-100 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sky-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-sky-600" />
              {isEn ? 'Duitku Gateway Credentials (Active)' : 'Kredensial Duitku Gateway (Aktif)'}
            </span>
            <span className="text-[10px] text-gray-400">
              {isEn ? 'Saved to database & synched with backend' : 'Tersimpan di database & disinkronkan ke server backend'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="font-medium text-gray-700 block mb-1">Environment Duitku</label>
              <select
                value={platformSettings.duitkuEnvironment || 'sandbox'}
                onChange={(e) =>
                  setPlatformSettings({
                    ...platformSettings,
                    duitkuEnvironment: e.target.value as 'sandbox' | 'production',
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="sandbox">Sandbox (Pengujian / Test)</option>
                <option value="production">Production (Live Resmi)</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-1">Merchant Code Duitku</label>
              <input
                type="text"
                placeholder="D12345"
                value={platformSettings.duitkuMerchantCode || ''}
                onChange={(e) =>
                  setPlatformSettings({
                    ...platformSettings,
                    duitkuMerchantCode: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-1">API Key Duitku</label>
              <input
                type="text"
                placeholder="Masukkan API Key dari Duitku Merchant Portal"
                value={platformSettings.duitkuApiKey || ''}
                onChange={(e) =>
                  setPlatformSettings({
                    ...platformSettings,
                    duitkuApiKey: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-500">
            💡 Dapatkan <strong>Merchant Code</strong> dan <strong>API Key</strong> dari dashboard <strong>Duitku Merchant Portal (My Project)</strong>. URL Callback proyek: <code className="bg-gray-100 px-1 py-0.5 rounded text-sky-700 font-mono">https://kroomify.kroombox.com/api/payment/callback</code>
          </p>
        </div>

        {/* MIDTRANS CREDENTIALS FORM */}
        <div className="pt-2 border-t border-gray-100 space-y-2.5 text-xs opacity-75">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">
              {isEn ? 'Midtrans Credentials (Legacy / Backup)' : 'Kredensial Midtrans (Cadangan)'}
            </span>
            <span className="text-[10px] text-gray-400">
              {isEn ? 'Saved to database & synched with backend' : 'Tersimpan di database'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label className="font-medium text-gray-700 block mb-1">Environment</label>
              <select
                value={platformSettings.midtransEnvironment || 'sandbox'}
                onChange={(e) =>
                  setPlatformSettings({
                    ...platformSettings,
                    midtransEnvironment: e.target.value as 'sandbox' | 'production',
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-red-500"
              >
                <option value="sandbox">Sandbox (Pengujian / Test)</option>
                <option value="production">Production (Live Resmi)</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-1">Merchant ID</label>
              <input
                type="text"
                placeholder="G477630600"
                value={platformSettings.midtransMerchantId || ''}
                onChange={(e) =>
                  setPlatformSettings({
                    ...platformSettings,
                    midtransMerchantId: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-1">Client Key</label>
              <input
                type="text"
                placeholder="SB-Mid-client-..."
                value={platformSettings.midtransClientKey || ''}
                onChange={(e) =>
                  setPlatformSettings({
                    ...platformSettings,
                    midtransClientKey: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-1">Server Key</label>
              <input
                type="text"
                placeholder="SB-Mid-server-..."
                value={platformSettings.midtransServerKey || ''}
                onChange={(e) =>
                  setPlatformSettings({
                    ...platformSettings,
                    midtransServerKey: e.target.value,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-500">
            💡 Dapatkan Server Key dan Client Key resmi dari <strong>Midtrans Dashboard &gt; Settings &gt; Access Keys</strong>.
          </p>
        </div>

      </div>

      {/* 2. FORM KEBIJAKAN OPERASIONAL PLATFORM */}
      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
          <div className="pb-2 border-b border-gray-100">
            <h3 className="font-semibold text-xs text-gray-900">{isEn ? 'Platform Commission & Payout Policy' : 'Komisi Platform & Kebijakan Payout'}</h3>
            <p className="text-[11px] text-gray-500">
              {isEn ? 'Fee rate parameters and merchant store withdrawal terms.' : 'Parameter tarif potongan dan ketentuan penarikan saldo toko merchant.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-gray-700 block mb-1">{isEn ? 'Transaction Fee (%)' : 'Biaya Transaksi (%)'}</label>
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
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-1">{isEn ? 'Min. Payout (Rp)' : 'Min. Tarik Saldo (Rp)'}</label>
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
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="font-medium text-gray-700 block mb-1">{isEn ? 'Bank Fee (Rp)' : 'Biaya Bank (Rp)'}</label>
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
                className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Maintenance Switch */}
          <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-200 mt-2">
            <div>
              <span className="font-medium text-gray-800 block">{isEn ? 'System Maintenance Mode' : 'Mode Pemeliharaan (Maintenance Mode)'}</span>
              <span className="text-[11px] text-gray-500">{isEn ? 'When active, visitors and merchants will see a system maintenance screen.' : 'Jika aktif, pengunjung dan merchant akan melihat layar pemeliharaan sistem.'}</span>
            </div>
            <input
              type="checkbox"
              checked={platformSettings.maintenanceMode}
              onChange={(e) =>
                setPlatformSettings({ ...platformSettings, maintenanceMode: e.target.checked })
              }
              className="w-4 h-4 accent-red-600 cursor-pointer shrink-0"
            />
          </div>
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
          >
            {isEn ? 'Save Changes' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};
