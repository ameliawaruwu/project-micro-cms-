import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Lock,
  Sparkles,
  Banknote,
  QrCode,
  Building2,
  Check,
  Save,
  Loader2,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';
import {
  paymentChannelService,
  PaymentChannel,
  getLocalizedChannelDescription,
  getLocalizedChannelName,
} from '../../services/paymentChannelService';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';
import { Store, StorePaymentConfig } from '../../types';
import { storeService } from '../../services/storeService';
import { adminService } from '../../services/adminService';

interface PaymentListPageProps {
  store?: Store;
  onUpdateStore?: (updated: Store) => Promise<void> | void;
  onNavigateBilling?: () => void;
  onShowNotification?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateDashboard?: () => void;
}

const COMMON_BANKS = [
  'BCA (Bank Central Asia)',
  'Bank Mandiri',
  'BRI (Bank Rakyat Indonesia)',
  'BNI (Bank Negara Indonesia)',
  'BSI (Bank Syariah Indonesia)',
  'CIMB Niaga',
  'Bank Permata',
  'Bank Danamon',
  'Bank Jago',
  'SeaBank',
  'BCA Syariah',
  'GoPay / GoPay Merchant',
  'OVO',
  'DANA',
  'ShopeePay',
  'Lainnya / Bank Daerah',
];

export const PaymentListPage: React.FC<PaymentListPageProps> = ({
  store,
  onUpdateStore,
  onNavigateBilling,
  onShowNotification,
  onNavigateDashboard,
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  // Status Master Payment Gateway dari Pengaturan Admin
  const [isGatewayEnabledOnPlatform, setIsGatewayEnabledOnPlatform] = useState<boolean>(() => {
    return adminService.getPlatformSettings().paymentGatewayEnabled ?? true;
  });

  React.useEffect(() => {
    adminService.fetchPlatformSettingsFromDatabase().then((settings) => {
      setIsGatewayEnabledOnPlatform(settings.paymentGatewayEnabled ?? true);
    });

    const handleSettingsUpdated = () => {
      setIsGatewayEnabledOnPlatform(adminService.getPlatformSettings().paymentGatewayEnabled ?? true);
    };
    window.addEventListener('storage', handleSettingsUpdated);
    return () => {
      window.removeEventListener('storage', handleSettingsUpdated);
    };
  }, []);

  // Load store's saved payment configuration with resilient defaults
  const currentConfig: StorePaymentConfig = useMemo(() => {
    return (
      store?.paymentConfig || {
        enableCod: true,
        codInstructions: 'Siapkan uang pas saat barang diantar oleh kurir/penjual.',
        enableManualTransfer: true,
        manualBankName: 'BCA (Bank Central Asia)',
        manualBankAccountNumber: '',
        manualBankAccountHolder: '',
        manualQrisImageUrl: '',
        manualInstructions: 'Scan QRIS atau transfer ke rekening di atas, lalu konfirmasi pesanan ke WhatsApp toko.',
        enablePaymentGateway: true,
      }
    );
  }, [store?.paymentConfig]);

  // Form states
  const [enableCod, setEnableCod] = useState<boolean>(currentConfig.enableCod ?? true);
  const [codInstructions, setCodInstructions] = useState<string>(
    currentConfig.codInstructions || 'Siapkan uang pas saat barang diantar oleh kurir/penjual.'
  );

  const [enableManualTransfer, setEnableManualTransfer] = useState<boolean>(currentConfig.enableManualTransfer ?? true);
  const [manualBankName, setManualBankName] = useState<string>(
    currentConfig.manualBankName || 'BCA (Bank Central Asia)'
  );
  const [manualBankAccountNumber, setManualBankAccountNumber] = useState<string>(
    currentConfig.manualBankAccountNumber || ''
  );
  const [manualBankAccountHolder, setManualBankAccountHolder] = useState<string>(
    currentConfig.manualBankAccountHolder || ''
  );
  const [manualQrisImageUrl, setManualQrisImageUrl] = useState<string>(currentConfig.manualQrisImageUrl || '');
  const [manualInstructions, setManualInstructions] = useState<string>(
    currentConfig.manualInstructions || 'Scan QRIS atau transfer ke rekening di atas, lalu konfirmasi pesanan ke WhatsApp toko.'
  );

  const [enablePaymentGateway, setEnablePaymentGateway] = useState<boolean>(
    currentConfig.enablePaymentGateway ?? true
  );

  // Gateway channels & search filter
  const [channels, setChannels] = useState<PaymentChannel[]>(() => paymentChannelService.getChannels());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [isMasterActive, setIsMasterActive] = useState(currentConfig.enablePaymentGateway ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const markDirty = () => {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };

  // Filter channels based on search and category
  const filteredChannels = useMemo(() => {
    let result = channels;

    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => {
        const localizedName = getLocalizedChannelName(c.id, c.name, language).toLowerCase();
        const localizedDesc = getLocalizedChannelDescription(c.id, c.description, language).toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          localizedName.includes(q) ||
          localizedDesc.includes(q) ||
          c.categoryLabel.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [channels, searchQuery, selectedCategory, language]);

  const activeGatewayCount = useMemo(() => {
    if (!enablePaymentGateway || !isGatewayEnabledOnPlatform) return 0;
    return channels.filter((c) => c.isEnabled).length;
  }, [channels, enablePaymentGateway, isGatewayEnabledOnPlatform]);

  const handleToggleChannel = (id: string) => {
    const { channels: updated, updatedItem } = paymentChannelService.toggleChannel(id);
    setChannels(updated);
    markDirty();
    if (onShowNotification && updatedItem) {
      const displayName = getLocalizedChannelName(updatedItem.id, updatedItem.name, language);
      onShowNotification(
        isEn
          ? `${displayName} ${updatedItem.isEnabled ? 'enabled' : 'disabled'}`
          : `${displayName} ${updatedItem.isEnabled ? 'diaktifkan' : 'dinonaktifkan'}`,
        'info'
      );
    }
  };

  const handleToggleMaster = () => {
    const nextState = !isMasterActive;
    setIsMasterActive(nextState);
    setEnablePaymentGateway(nextState);
    const updated = paymentChannelService.setAllChannels(nextState);
    setChannels(updated);
    markDirty();
  };

  const handleSaveAll = async () => {
    if (!store?.id) return;
    setIsSaving(true);
    try {
      const updatedConfig: StorePaymentConfig = {
        enableCod,
        codInstructions,
        enableManualTransfer,
        manualBankName,
        manualBankAccountNumber,
        manualBankAccountHolder,
        manualQrisImageUrl,
        manualInstructions,
        enablePaymentGateway,
      };

      const updatedStore: Store = {
        ...store,
        paymentConfig: updatedConfig,
      };

      if (onUpdateStore) {
        await onUpdateStore(updatedStore);
      } else {
        await storeService.updateStore(store.id, { paymentConfig: updatedConfig });
      }

      setHasUnsavedChanges(false);
      if (onShowNotification) {
        onShowNotification(
          isEn
            ? 'Payment settings updated successfully!'
            : 'Pengaturan metode pembayaran toko berhasil disimpan!',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Failed to save payment settings:', err);
      if (onShowNotification) {
        onShowNotification(
          isEn
            ? 'Failed to save settings: ' + (err?.message || '')
            : 'Gagal menyimpan pengaturan: ' + (err?.message || ''),
          'error'
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Render official payment logo
  const renderChannelLogo = (id: string, iconCode: string) => {
    switch (iconCode) {
      case 'QRIS':
        return (
          <div className="w-14 h-9 rounded-lg bg-white border border-[#E5E0DD] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <path d="M12 8h8v8h-8zM14 10h4v4h-4zM12 28h8v8h-8zM14 30h4v4h-4zM32 8h8v8h-8zM34 10h4v4h-4z" fill="#ED1C24" />
              <rect x="23" y="14" width="4" height="16" fill="#1F1F1F" />
              <rect x="29" y="22" width="6" height="4" fill="#ED1C24" />
              <text x="68" y="28" textAnchor="middle" fill="#ED1C24" fontWeight="900" fontSize="20" letterSpacing="0.5" fontFamily="Arial, Helvetica, sans-serif">QRIS</text>
            </svg>
          </div>
        );

      case 'GOPAY':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#00AED6] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <circle cx="22" cy="22.5" r="9" fill="#FFFFFF" />
              <circle cx="22" cy="22.5" r="4.5" fill="#00AED6" />
              <text x="62" y="28" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="18" letterSpacing="-0.5" fontFamily="Arial, Helvetica, sans-serif">gopay</text>
            </svg>
          </div>
        );

      case 'SHOPEE':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#EE4D2D] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <path d="M16 15v-2a4 4 0 0 1 8 0v2h2v14a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V15h2zm2-2a2 2 0 0 1 4 0v2h-4v-2z" fill="#FFFFFF" />
              <path d="M19 21c0-.8.7-1.3 1.5-1.3s1.5.5 1.5 1.3c0 1.2-3 1.3-3 2.8 0 .8.7 1.4 1.5 1.4.9 0 1.6-.6 1.6-1.4" stroke="#EE4D2D" strokeWidth="1" fill="none" />
              <text x="63" y="27" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="15" letterSpacing="-0.3" fontFamily="Arial, Helvetica, sans-serif">Shopee</text>
            </svg>
          </div>
        );

      case 'BCA':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#003B70] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <path d="M14 12c-4 3-6 7-6 11s2 8 6 11l4-3c-3-2-4-5-4-8s1-6 4-8l-4-3z" fill="#FFFFFF" opacity="0.6" />
              <text x="56" y="29" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="24" letterSpacing="1.5" fontFamily="Arial, Helvetica, sans-serif">BCA</text>
            </svg>
          </div>
        );

      case 'MANDIRI':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#003D79] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <path d="M72 10c-5 0-9 2-11 6 3-1 5-1 8-1 6 0 10 3 10 8 0 6-5 10-11 10-5 0-9-2-11-6 3 1 6 1 8 1 6 0 11-4 11-10 0-5-4-8-9-8z" fill="#F3B229" />
              <text x="36" y="28" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="16" letterSpacing="-0.2" fontFamily="Arial, Helvetica, sans-serif">mandırı</text>
            </svg>
          </div>
        );

      case 'BNI':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#005E6A] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <text x="42" y="29" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="22" letterSpacing="1" fontFamily="Arial, Helvetica, sans-serif">BNI</text>
              <path d="M74 13l8-5v20l-8 5z" fill="#F15A24" />
            </svg>
          </div>
        );

      case 'BRI':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#00529C] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <text x="50" y="30" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="25" letterSpacing="1" fontFamily="Arial, Helvetica, sans-serif">BRI</text>
            </svg>
          </div>
        );

      case 'PERMATA':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#008850] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <path d="M15 22.5l7-7 7 7-7 7z" fill="#00D06C" />
              <path d="M22 15.5l7 7-7 7-7-7z" fill="#8DC63F" opacity="0.85" />
              <text x="64" y="28" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="14" letterSpacing="-0.3" fontFamily="Arial, Helvetica, sans-serif">Permata</text>
            </svg>
          </div>
        );

      case 'CIMB':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#7F1416] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <polygon points="12,14 24,22.5 12,31" fill="#ED1C24" />
              <text x="58" y="28" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="18" letterSpacing="0.5" fontFamily="Arial, Helvetica, sans-serif">CIMB</text>
            </svg>
          </div>
        );

      case 'CARD':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <svg viewBox="0 0 100 45" className="w-full h-full object-contain">
              <circle cx="42" cy="22.5" r="13" fill="#EB001B" />
              <circle cx="58" cy="22.5" r="13" fill="#F79E1B" fillOpacity="0.9" />
            </svg>
          </div>
        );

      default:
        return (
          <div className="w-14 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs shrink-0 border border-[#E5E0DD]">
            {iconCode || 'VA'}
          </div>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans pb-28 lg:pb-12 text-left w-full max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: t('nav_payment', 'Pengaturan Pembayaran'), isActive: true },
        ]}
      />

      {/* 1. Header Bar */}
      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[#66000E]" />
            <span>Pengaturan Metode Pembayaran Toko</span>
          </h1>
          <p className="text-xs text-[#706866] mt-1">
            Atur pilihan cara bayar pelanggan Anda di etalase: <strong>Bayar di Tempat (COD)</strong>,{' '}
            <strong>QRIS &amp; Transfer Bank Langsung</strong>, atau <strong>Payment Gateway Otomatis</strong>.
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveAll}
          className={`shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-sm ${
            hasUnsavedChanges
              ? 'bg-[#66000E] hover:bg-[#55000C] text-white ring-2 ring-[#66000E]/30 animate-pulse'
              : 'bg-[#241A1A] hover:bg-black text-white'
          } disabled:opacity-50`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{hasUnsavedChanges ? 'Simpan Perubahan *' : 'Simpan Pengaturan'}</span>
            </>
          )}
        </button>
      </div>

      {/* Info Banner: Penjelasan Sederhana untuk Merchant & UMKM Komunitas */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
          <Check className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="text-xs text-emerald-950 leading-relaxed">
          <p className="font-bold text-emerald-900 text-sm">
            Fleksibilitas Penuh: Toko Anda Bebas Melayani COD &amp; QRIS Manual
          </p>
          <p className="mt-0.5 text-emerald-800">
            Anda dapat mengaktifkan <strong>COD</strong> dan <strong>QRIS / Rekening Pribadi</strong> tanpa biaya
            gateway (0% fee). Pelanggan dapat memesan langsung dan Anda menerima uang secara tunai atau langsung masuk
            ke rekening Anda.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KARTU 1: BAYAR DI TEMPAT (COD / CASH ON DELIVERY)                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E5E0DD] shadow-2xs overflow-hidden transition">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-amber-50/30">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
              <Banknote className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-[#241A1A]">1. Bayar di Tempat (COD)</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  Semua Paket (Gratis)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                  0% Biaya Gateway
                </span>
              </div>
              <p className="text-xs text-[#706866] mt-0.5">
                Pelanggan membayar tunai kepada kurir atau penjual saat barang tiba di alamat pengantaran.
              </p>
            </div>
          </div>

          {/* Toggle Switch COD */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#706866] hidden sm:inline">
              {enableCod ? 'Aktif' : 'Nonaktif'}
            </span>
            <button
              type="button"
              onClick={() => {
                setEnableCod(!enableCod);
                markDirty();
              }}
              role="switch"
              aria-checked={enableCod}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableCod ? 'bg-[#027A48]' : 'bg-[#D1C9C5]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  enableCod ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Form Pengaturan COD jika aktif */}
        {enableCod && (
          <div className="p-4 sm:p-5 border-t border-[#E5E0DD] bg-[#FAF7F7] space-y-3">
            <label className="block text-xs font-bold text-[#241A1A]">
              Petunjuk / Catatan COD untuk Pembeli
            </label>
            <textarea
              rows={2}
              value={codInstructions}
              onChange={(e) => {
                setCodInstructions(e.target.value);
                markDirty();
              }}
              placeholder="Contoh: Siapkan uang pas saat barang diantar. Hanya melayani pengantaran area sekitar kampus / kota."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs font-medium text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition resize-none"
            />
            <p className="text-[11px] text-[#706866]">
              Teks ini akan ditampilkan kepada pembeli saat memilih metode Bayar di Tempat (COD) di halaman checkout.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* KARTU 2: QRIS STATIS & REKENING BANK TOKO (MANUAL DIRECT TRANSFER)        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-[#E5E0DD] shadow-2xs overflow-hidden transition">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-blue-50/30">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
              <QrCode className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-[#241A1A]">
                  2. QRIS Statis &amp; Transfer Bank Langsung Toko
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                  Langsung Masuk Rekening Sendiri
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  0% Komisi Gateway
                </span>
              </div>
              <p className="text-xs text-[#706866] mt-0.5">
                Pelanggan scan barcode QRIS toko Anda atau transfer ke nomor rekening toko, lalu konfirmasi via WhatsApp.
              </p>
            </div>
          </div>

          {/* Toggle Switch Manual Transfer */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#706866] hidden sm:inline">
              {enableManualTransfer ? 'Aktif' : 'Nonaktif'}
            </span>
            <button
              type="button"
              onClick={() => {
                setEnableManualTransfer(!enableManualTransfer);
                markDirty();
              }}
              role="switch"
              aria-checked={enableManualTransfer}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enableManualTransfer ? 'bg-[#027A48]' : 'bg-[#D1C9C5]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  enableManualTransfer ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Form Pengaturan QRIS & Rekening Toko jika aktif */}
        {enableManualTransfer && (
          <div className="p-4 sm:p-5 border-t border-[#E5E0DD] bg-[#FAF7F7] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Nama Bank */}
              <div>
                <label className="block text-xs font-bold text-[#241A1A] mb-1.5">
                  Nama Bank / E-Wallet *
                </label>
                <select
                  value={manualBankName}
                  onChange={(e) => {
                    setManualBankName(e.target.value);
                    markDirty();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#241A1A] focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nomor Rekening */}
              <div>
                <label className="block text-xs font-bold text-[#241A1A] mb-1.5">
                  Nomor Rekening / No. HP E-Wallet *
                </label>
                <input
                  type="text"
                  value={manualBankAccountNumber}
                  onChange={(e) => {
                    setManualBankAccountNumber(e.target.value);
                    markDirty();
                  }}
                  placeholder="Contoh: 1234567890 atau 08123456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>

              {/* Atas Nama Rekening */}
              <div>
                <label className="block text-xs font-bold text-[#241A1A] mb-1.5">
                  Atas Nama Pemilik Rekening *
                </label>
                <input
                  type="text"
                  value={manualBankAccountHolder}
                  onChange={(e) => {
                    setManualBankAccountHolder(e.target.value);
                    markDirty();
                  }}
                  placeholder="Contoh: Budi Santoso / Toko Komunitas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            {/* URL Gambar QRIS Statis */}
            <div className="pt-2 border-t border-[#E5E0DD]/80">
              <label className="block text-xs font-bold text-[#241A1A] mb-1.5 flex items-center justify-between">
                <span>Gambar / URL Barcode QRIS Toko (Opsional)</span>
                <span className="text-[11px] text-[#706866] font-normal">
                  Dapat berupa link gambar JPG/PNG barcode QRIS merchant Anda
                </span>
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <ImageIcon className="w-4 h-4 text-[#706866] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={manualQrisImageUrl}
                    onChange={(e) => {
                      setManualQrisImageUrl(e.target.value);
                      markDirty();
                    }}
                    placeholder="https://.../qris-toko.png (atau tempel link barcode QRIS)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Preview QRIS jika ada */}
              {manualQrisImageUrl && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-[#E5E0DD] inline-flex items-center gap-3">
                  <img
                    src={manualQrisImageUrl}
                    alt="Preview Barcode QRIS"
                    className="w-16 h-16 object-contain rounded-lg border border-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&auto=format&fit=crop';
                    }}
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Preview Barcode QRIS</span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Barcode ini akan muncul saat pembeli checkout
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Petunjuk Tambahan */}
            <div>
              <label className="block text-xs font-bold text-[#241A1A] mb-1.5">
                Petunjuk Konfirmasi Pembayaran
              </label>
              <textarea
                rows={2}
                value={manualInstructions}
                onChange={(e) => {
                  setManualInstructions(e.target.value);
                  markDirty();
                }}
                placeholder="Contoh: Setelah transfer atau scan QRIS, kirim bukti transaksi ke WhatsApp admin toko agar pesanan langsung diproses."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs font-medium text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* KARTU 3: PAYMENT GATEWAY OTOMATIS (MIDTRANS & DUITKU)                     */}
      {/* ========================================================================= */}
      {!isGatewayEnabledOnPlatform ? (
        <div className="bg-amber-50/75 border border-amber-300 rounded-2xl p-5 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300/80 shadow-2xs">
              <CreditCard className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-amber-950">
                  Payment Gateway Otomatis Dinonaktifkan oleh Admin
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-900 font-bold text-[10px] border border-amber-300">
                  Mode QRIS Toko & COD Aktif
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed max-w-2xl">
                Super Admin sedang menonaktifkan jalur payment gateway otomatis (Virtual Account & E-Wallet). Seluruh transaksi toko Anda saat ini diarahkan ke <strong>QRIS Pribadi & Transfer Bank Toko</strong> (Kartu 2) serta <strong>Bayar di Tempat (COD)</strong> (Kartu 1).
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 shrink-0">
            0% Biaya Gateway
          </span>
        </div>
      ) : (
      <div className="bg-white rounded-2xl border border-[#E5E0DD] shadow-2xs overflow-hidden transition">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0 shadow-2xs border border-[#E6DDDA]">
              <CreditCard className="w-5 h-5 text-[#66000E]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-[#241A1A]">
                  3. Payment Gateway Otomatis (Midtrans &amp; Duitku)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#66000E]/10 text-[#66000E] font-bold text-[10px] border border-[#66000E]/20">
                  Verifikasi Real-Time 24 Jam
                </span>
              </div>
              <p className="text-xs text-[#706866] mt-0.5">
                {activeGatewayCount} / {channels.length} metode pembayaran gateway otomatis aktif di etalase toko Anda.
              </p>
            </div>
          </div>

          {/* Master Toggle Switch Gateway */}
          <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E0DD]">
            <button
              type="button"
              onClick={handleToggleMaster}
              role="switch"
              aria-checked={isMasterActive && activeGatewayCount > 0}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isMasterActive && activeGatewayCount > 0 ? 'bg-[#66000E]' : 'bg-[#D1C9C5]'
              }`}
              title={
                isMasterActive
                  ? isEn
                    ? 'Disable Gateway'
                    : 'Nonaktifkan Gateway'
                  : isEn
                  ? 'Enable Gateway'
                  : 'Aktifkan Gateway'
              }
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isMasterActive && activeGatewayCount > 0 ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Daftar Channel Gateway */}
        <div className="border-t border-[#E5E0DD] bg-[#FAF7F7] p-4 sm:p-5 space-y-4">
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#706866] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  isEn
                    ? 'Search payment channels (e.g. BCA, QRIS, GoPay, Mandiri)...'
                    : 'Cari channel gateway (contoh: BCA, QRIS Dinamis, GoPay, Mandiri)...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs sm:text-sm text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#241A1A] focus:outline-none focus:border-[#66000E] cursor-pointer"
            >
              <option value="all">
                {isEn ? `All Categories (${channels.length})` : `Semua Kategori (${channels.length})`}
              </option>
              <option value="virtual_account">Virtual Account (Bank)</option>
              <option value="qris_ewallet">QRIS Dinamis &amp; E-Wallet</option>
              <option value="credit_card">{isEn ? 'Credit Card' : 'Kartu Kredit'}</option>
              <option value="retail_paylater">{isEn ? 'Retail & PayLater' : 'Gerai Retail & PayLater'}</option>
            </select>
          </div>

          {/* List of Channels */}
          {filteredChannels.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E5E0DD]">
              <Search className="w-8 h-8 text-[#706866] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#241A1A]">
                {isEn ? 'No payment methods found' : 'Metode pembayaran tidak ditemukan'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredChannels.map((channel) => {
                const displayName = getLocalizedChannelName(channel.id, channel.name, language);
                const displayDesc = getLocalizedChannelDescription(channel.id, channel.description, language);
                const isChannelActive = enablePaymentGateway && channel.isEnabled;

                return (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 bg-white ${
                      isChannelActive
                        ? 'border-[#E5E0DD] hover:border-[#66000E]/40 shadow-2xs'
                        : 'border-[#E5E0DD]/60 opacity-70 bg-[#FCFBFB]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderChannelLogo(channel.id, channel.iconCode)}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#241A1A] leading-snug truncate">
                          {displayName}
                        </h4>
                        <p className="text-[10px] text-[#706866] line-clamp-1">{displayDesc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleChannel(channel.id)}
                        role="switch"
                        aria-checked={isChannelActive}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isChannelActive ? 'bg-[#66000E]' : 'bg-[#D1C9C5]'
                        }`}
                      >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              isChannelActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
