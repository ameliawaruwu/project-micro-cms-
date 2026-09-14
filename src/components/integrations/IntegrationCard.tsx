import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Settings,
  X,
  Zap,
  Truck,
  ShieldCheck,
  ExternalLink,
  Package,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Integration } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface IntegrationCardProps {
  integration: Integration;
  onToggle: (id: string) => void;
  onSaveConfig: (id: string, config: Record<string, any>) => void;
  onShowNotification: (msg: string) => void;
}

// Concise short descriptions for list items
const CONCISE_DESCRIPTIONS: Record<string, string> = {
  'int-midtrans': 'Virtual Account BCA/Mandiri/BRI, QRIS, E-Wallet & Kartu Kredit',
  'int-qris': 'Scan QRIS otomatis dari semua E-Wallet & Mobile Banking',
  'int-stripe': 'Kartu kredit & debit internasional (Visa, Mastercard, AMEX)',
  'int-jnt': 'Layanan EZ (Reguler), J&T Super, & J&T Economy dengan jemput kurir',
  'int-jne': 'Layanan REG (Reguler), YES (Yakin Esok Sampai), & JTR Trucking',
  'int-sicepat': 'Layanan hemat HALU, SIUNTUNG (Reguler), & BEST Sameday',
  'int-gosend': 'Kurir motor instan 1-2 jam & same day khusus area dalam kota',
  'int-biteship': 'Satu gateway API terpusat untuk 25+ ekspedisi logistik Indonesia',
};

// Preset available services for each courier provider
const COURIER_SERVICES_PRESETS: Record<
  string,
  { code: string; name: string; desc: string; badge?: string }[]
> = {
  jnt: [
    { code: 'ez', name: 'EZ (Reguler)', desc: 'Pengiriman reguler standar 2-3 hari kerja ke seluruh Indonesia', badge: 'Terpopuler' },
    { code: 'super', name: 'J&T Super', desc: 'Layanan kilat esok hari sampai dengan garansi pengantaran', badge: 'Kilat' },
    { code: 'economy', name: 'J&T Economy', desc: 'Pengiriman hemat ekonomis dengan tarif lebih bersahabat', badge: 'Hemat' },
  ],
  jne: [
    { code: 'reg', name: 'REG (Reguler)', desc: 'Jaringan pengiriman terluas ke pelosok nusantara (1-3 hari)', badge: 'Standar' },
    { code: 'yes', name: 'YES (Yakin Esok Sampai)', desc: 'Layanan prioritas tiba esok hari termasuk hari libur', badge: 'Prioritas' },
    { code: 'jtr', name: 'JTR (Trucking/Kargo)', desc: 'Pengiriman kargo untuk paket berbobot berat (>10 kg)', badge: 'Kargo' },
  ],
  sicepat: [
    { code: 'halu', name: 'HALU (Hemat)', desc: 'Tarif ongkir hemat khusus e-commerce (mulai Rp 5.000)', badge: 'Ekonomis' },
    { code: 'siuntung', name: 'SIUNTUNG (Reguler)', desc: 'Pengiriman reguler cepat tanpa minimum jumlah paket', badge: 'Reguler' },
    { code: 'best', name: 'BEST (Sameday)', desc: 'Paket sampai di hari yang sama khusus kota-kota besar', badge: 'Sameday' },
  ],
  gosend: [
    { code: 'instant', name: 'Instant (1-2 Jam)', desc: 'Driver motor point-to-point langsung antar tanpa delay', badge: 'Kilat' },
    { code: 'sameday', name: 'Same Day (6-8 Jam)', desc: 'Pengantaran di hari yang sama dengan tarif hemat', badge: 'Hemat' },
  ],
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onToggle,
  onSaveConfig,
  onShowNotification,
}) => {
  const { t } = useLanguage();
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Form State: Payment Integrations
  const [apiKey, setApiKey] = useState(integration.config?.apiKey || '');
  const [merchantId, setMerchantId] = useState(integration.config?.merchantId || '');

  // Form State: Shipping Service Preferences (Biteship Aggregator)
  const isShipping = integration.type === 'shipping';
  const isBiteship = integration.provider === 'biteship';
  const providerServices = COURIER_SERVICES_PRESETS[integration.provider] || [];

  const initialEnabled = integration.config?.enabledServices || providerServices.map((s) => s.code);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialEnabled);
  const [autoInsurance, setAutoInsurance] = useState<boolean>(integration.config?.autoInsurance ?? false);
  const [defaultHandoff, setDefaultHandoff] = useState<'pickup' | 'drop_off'>(
    integration.config?.defaultHandoff || (integration.provider === 'jne' ? 'drop_off' : 'pickup')
  );

  const handleToggleService = (code: string) => {
    setSelectedServices((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();

    if (isShipping) {
      // Simpan preferensi kurir operasional (tanpa minta kredensial payment gateway)
      onSaveConfig(integration.id, {
        enabledServices: selectedServices,
        autoInsurance,
        defaultHandoff,
      });
      onShowNotification(`Preferensi layanan ${integration.name} berhasil diperbarui!`);
    } else {
      // Simpan konfigurasi payment gateway
      onSaveConfig(integration.id, {
        apiKey,
        merchantId,
      });
      onShowNotification(`Pengaturan kredensial ${integration.name} berhasil disimpan.`);
    }

    setShowConfigModal(false);
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAEAEA] shadow-2xs hover:border-[#D5CEC9] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans text-left">
        {/* Left: Logo & Info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F7] border border-[#EAEAEA] overflow-hidden flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
            <img
              src={integration.logo}
              alt={integration.name}
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-[#1F1F1F] tracking-tight truncate">
                {integration.name}
              </h4>
              {integration.isPopular && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-[#FFF1F0] text-[#9A0602] border border-[#FECDCA] px-2 py-0.2 rounded-full shrink-0">
                  <Zap className="w-2.5 h-2.5 fill-[#9A0602]" />
                  <span>{t('courier_badge_popular', 'Populer')}</span>
                </span>
              )}
              {isBiteship && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6] px-2 py-0.2 rounded-full shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t('courier_badge_aggregator', 'Aggregator Terpusat')}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#666666] truncate mt-0.5">
              {shortDesc}
            </p>
          </div>
        </div>

        {/* Right: Status, Settings Button & Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#F3EFEF]">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                integration.isConnected ? 'bg-[#027A48]' : 'bg-slate-300'
              }`}
            ></span>
            <span
              className={`text-xs font-semibold ${
                integration.isConnected ? 'text-[#027A48]' : 'text-[#777777]'
              }`}
            >
              {isBiteship && integration.isConnected
                ? t('courier_connected_env', 'Terhubung via .env')
                : integration.isConnected
                ? t('courier_status_active', 'Aktif')
                : t('courier_status_inactive', 'Nonaktif')}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-2">
            {/* Settings button */}
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#555555] hover:text-[#1F1F1F] px-3 py-2 rounded-xl hover:bg-[#F7F7F7] border border-[#EAEAEA] transition cursor-pointer"
              title={isShipping ? t('courier_title_settings', 'Atur Preferensi Layanan') : t('courier_title_api_settings', 'Atur Kunci API')}
            >
              <Settings className="w-3.5 h-3.5 text-[#777777]" />
              <span>{t('courier_btn_settings', 'Atur')}</span>
            </button>

            {/* Toggle Switch (Disembunyikan pada master Biteship agar selalu aktif via .env) */}
            {!isBiteship ? (
              <button
                type="button"
                onClick={handleToggle}
                role="switch"
                aria-checked={integration.isConnected}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  integration.isConnected ? 'bg-[#9A0602]' : 'bg-slate-200'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    integration.isConnected ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            ) : (
              <span className="text-[11px] font-semibold text-[#027A48] bg-[#ECFDF3] border border-[#ABEFC6] px-2.5 py-1 rounded-xl">
                Master API
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MODAL PENGATURAN (SESUAI DENGAN JENIS INTEGRASI) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in duration-150 overflow-hidden text-left">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EAEAEA] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF7F7] border border-[#EAEAEA] p-1 flex items-center justify-center shrink-0">
                  <img src={integration.logo} alt={integration.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1F1F1F]">
                    {isBiteship
                      ? 'Integrasi Biteship Aggregator'
                      : isShipping
                      ? `Pengaturan Layanan ${integration.name}`
                      : `Kredensial ${integration.name}`}
                  </h3>
                  <p className="text-[11px] text-[#777777]">
                    {isShipping
                      ? 'Dikelola otomatis via Biteship Aggregator API'
                      : 'Koneksi payment gateway transaksi'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 overflow-y-auto space-y-4 text-xs">
              {/* KASUS A: MODAL BITESHIP AGGREGATOR TERPUSAT */}
              {isBiteship ? (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                    <div className="flex items-center gap-2 text-[#166534] font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                      <span>Koneksi Biteship Berjalan Normal</span>
                    </div>
                    <p className="text-[11px] text-[#15803d] leading-relaxed">
                      Sistem Micro CMS menggunakan <strong>1 API Key terpusat</strong> pada environment backend (<code className="bg-white px-1.5 py-0.5 rounded border border-[#BBF7D0] font-mono">BITESHIP_API_KEY</code>). Anda tidak perlu mendaftar akun atau memasukkan Merchant ID per kurir secara manual.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9F9F9] border border-[#EAEAEA] space-y-2.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#777777]">Status Autentikasi:</span>
                      <span className="font-semibold text-[#027A48] bg-[#ECFDF3] px-2 py-0.5 rounded border border-[#ABEFC6]">
                        Aktif (.env Terpasang)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#777777]">Mode API:</span>
                      <span className="font-semibold text-[#1F1F1F]">Sandbox & Live Production</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#777777]">Cakupan Kurir:</span>
                      <span className="font-semibold text-[#1F1F1F]">J&T, JNE, SiCepat, GoSend, POS, Anteraja</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <a
                      href="https://dashboard.biteship.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl border border-[#EAEAEA] bg-white hover:bg-[#F7F7F7] text-[#1F1F1F] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Buka Dashboard Biteship</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#777777]" />
                    </a>
                    <a
                      href="https://biteship.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl border border-[#EAEAEA] text-[#555555] hover:bg-[#F7F7F7] font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Dokumentasi API</span>
                    </a>
                  </div>
                </div>
              ) : isShipping ? (
                /* KASUS B: MODAL KURIR LOGISTIK INDIVIDUAL (J&T, JNE, SICEPAT, GOSEND) */
                <form onSubmit={handleSaveConfig} className="space-y-4">
                  {/* Notice Info: Bebas dari Kredensial Payment Gateway */}
                  <div className="p-3 bg-[#FFF9F9] border border-[#FECDCA] rounded-2xl flex items-start gap-2.5 text-[#9A0602]">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      Kredensial API telah terhubung otomatis melalui Biteship. Atur opsi layanan di bawah ini untuk menentukan layanan yang dapat dipilih oleh pembeli saat checkout.
                    </p>
                  </div>

                  {/* 1. Checklist Layanan Aktif */}
                  <div>
                    <label className="block text-xs font-bold text-[#1F1F1F] mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#9A0602]" />
                      <span>Pilihan Layanan Pengiriman Aktif</span>
                    </label>

                    <div className="space-y-2">
                      {providerServices.map((svc) => {
                        const isChecked = selectedServices.includes(svc.code);
                        return (
                          <div
                            key={svc.code}
                            onClick={() => handleToggleService(svc.code)}
                            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? 'border-[#9A0602] bg-[#FFF1F0]'
                                : 'border-[#EAEAEA] bg-white hover:border-[#CCCCCC]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 pr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Handled by div container
                                className="w-4 h-4 accent-[#9A0602] rounded cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-[#1F1F1F]">{svc.name}</span>
                                  {svc.badge && (
                                    <span className="text-[9px] font-semibold bg-white border border-[#FECDCA] text-[#9A0602] px-1.5 py-0.2 rounded">
                                      {svc.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-[#555555] mt-0.5">{svc.desc}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Pengaturan Operasional & Asuransi */}
                  <div className="pt-2 border-t border-[#EAEAEA] space-y-3">
                    <label className="block text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#9A0602]" />
                      <span>Pengaturan Operasional & Penjemputan</span>
                    </label>

                    {/* Tipe Penyerahan Default */}
                    <div>
                      <span className="block text-[11px] font-semibold text-[#555555] mb-1">
                        Metode Penyerahan Paket Default
                      </span>
                      <select
                        value={defaultHandoff}
                        onChange={(e) => setDefaultHandoff(e.target.value as 'pickup' | 'drop_off')}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#EAEAEA] bg-white text-[#1F1F1F] focus:outline-none focus:border-[#9A0602]"
                      >
                        <option value="pickup">Pick-up (Kurir Datang Menjemput ke Gudang Toko)</option>
                        <option value="drop_off">Drop-off (Antar Paket Mandiri ke Gerai / Counter)</option>
                      </select>
                    </div>

                    {/* Toggle Asuransi Pengiriman */}
                    <div className="p-3 bg-[#F9F9F9] rounded-2xl border border-[#EAEAEA] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-[#1F1F1F] block">
                          Asuransi Pengiriman Otomatis
                        </span>
                        <span className="text-[11px] text-[#666666]">
                          Aktifkan proteksi ganti rugi jika barang hilang / rusak saat ekspedisi.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoInsurance(!autoInsurance)}
                        role="switch"
                        aria-checked={autoInsurance}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          autoInsurance ? 'bg-[#9A0602]' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            autoInsurance ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#EAEAEA] flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfigModal(false)}
                      className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#EAEAEA] text-xs font-semibold text-[#555555] hover:bg-[#F7F7F7] transition cursor-pointer"
                    >
                      {t('branch_form_cancel', 'Batal')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 min-h-[40px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      {t('btn_save_settings', 'Simpan Pengaturan')}
                    </button>
                  </div>
                </form>
              ) : (
                /* KASUS C: MODAL PAYMENT GATEWAY (MIDTRANS, STRIPE, DLL) */
                <form onSubmit={handleSaveConfig} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Merchant ID / Client Key
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: M-1092819"
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#EAEAEA] bg-white text-[#1F1F1F] focus:outline-none focus:border-[#9A0602]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">
                      Server Key / API Secret Key
                    </label>
                    <input
                      type="password"
                      placeholder="Masukkan Server Key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#EAEAEA] bg-white text-[#1F1F1F] focus:outline-none focus:border-[#9A0602]"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#EAEAEA] flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowConfigModal(false)}
                      className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#EAEAEA] text-xs font-semibold text-[#555555] hover:bg-[#F7F7F7] transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 min-h-[40px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      Simpan Kredensial
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
