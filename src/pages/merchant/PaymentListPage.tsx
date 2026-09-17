import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
} from 'lucide-react';
import { paymentChannelService, PaymentChannel } from '../../services/paymentChannelService';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';

interface PaymentListPageProps {
  onShowNotification?: (msg: string) => void;
  onNavigateDashboard?: () => void;
}

export const PaymentListPage: React.FC<PaymentListPageProps> = ({ onShowNotification, onNavigateDashboard }) => {
  const { t } = useLanguage();
  const [channels, setChannels] = useState<PaymentChannel[]>(() => paymentChannelService.getChannels());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [isMasterActive, setIsMasterActive] = useState(true);

  // Filter channels based on search and category
  const filteredChannels = useMemo(() => {
    let result = channels;

    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.categoryLabel.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [channels, searchQuery, selectedCategory]);

  const activeCount = useMemo(() => {
    return channels.filter((c) => c.isEnabled).length;
  }, [channels]);

  const handleToggleChannel = (id: string) => {
    const { channels: updated, updatedItem } = paymentChannelService.toggleChannel(id);
    setChannels(updated);
    if (onShowNotification && updatedItem) {
      onShowNotification(
        `${updatedItem.name} ${updatedItem.isEnabled ? 'diaktifkan' : 'dinonaktifkan'}`
      );
    }
  };

  const handleToggleMaster = () => {
    const nextState = !isMasterActive;
    setIsMasterActive(nextState);
    const updated = paymentChannelService.setAllChannels(nextState);
    setChannels(updated);
    if (onShowNotification) {
      onShowNotification(
        nextState
          ? 'Semua metode pembayaran Midtrans diaktifkan'
          : 'Semua metode pembayaran Midtrans dinonaktifkan'
      );
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

      case 'INDOMARET':
        return (
          <div className="w-14 h-9 rounded-lg bg-white border border-[#CBD5E1] flex flex-col items-center justify-center p-1 shrink-0 shadow-2xs overflow-hidden">
            <div className="w-full flex items-center justify-center gap-0.5">
              <span className="w-3 h-1.5 bg-[#005BAA] rounded-xs" />
              <span className="w-3 h-1.5 bg-[#EE2E24] rounded-xs" />
              <span className="w-3 h-1.5 bg-[#FED100] rounded-xs" />
            </div>
            <span className="text-[8.5px] font-black tracking-tighter text-[#005BAA] mt-0.5 font-sans">
              Indomaret
            </span>
          </div>
        );

      case 'ALFAMART':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#E31B23] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <div className="bg-white px-2 py-0.5 rounded">
              <span className="text-[9px] font-black text-[#E31B23] tracking-tight font-sans">
                Alfamart
              </span>
            </div>
          </div>
        );

      case 'AKULAKU':
        return (
          <div className="w-14 h-9 rounded-lg bg-[#FF5000] flex items-center justify-center p-1 shrink-0 shadow-2xs">
            <span className="text-[10px] font-black text-white tracking-tight font-sans">
              akulaku
            </span>
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
    <div className="space-y-4 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 text-left w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: t('nav_payment', 'Pembayaran'), isActive: true },
        ]}
      />

      {/* 1. Page Title */}
      <div className="pb-3 border-b border-[#E5E0DD]">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-5 h-5 text-[#66000E]" />
          <span>{t('nav_payment', 'Pembayaran')}</span>
        </h1>
      </div>

      {/* 2. Main Midtrans Gateway Card */}
      <div className="bg-white rounded-2xl border border-[#E5E0DD] shadow-2xs overflow-hidden transition">
        {/* Top Header Card */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0 shadow-2xs border border-[#E6DDDA]">
              <CreditCard className="w-5 h-5 text-[#66000E]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#241A1A]">
                {t('payment_methods_title', 'Pilihan Metode Pembayaran')}
              </h2>
              <p className="text-xs text-[#706866] mt-0.5">
                {activeCount} / {channels.length} {t('payment_active_count', 'metode pembayaran aktif di etalase toko Anda')}
              </p>
            </div>
          </div>

          {/* Master Controls: Only the Master Toggle Switch */}
          <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E0DD]">
            <button
              type="button"
              onClick={handleToggleMaster}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isMasterActive && activeCount > 0 ? 'bg-[#66000E]' : 'bg-[#D1C9C5]'
              }`}
              title={isMasterActive ? 'Nonaktifkan Gateway' : 'Aktifkan Gateway'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isMasterActive && activeCount > 0 ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Payment Channels List Section */}
        <div className="border-t border-[#E5E0DD] bg-[#FAF7F7] p-4 sm:p-5 space-y-4">
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Bar Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#706866] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari metode pembayaran (contoh: BCA, QRIS, GoPay, Mandiri)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-xs sm:text-sm text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2.5 px-3 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#241A1A] focus:outline-none focus:border-[#66000E] cursor-pointer"
              >
                <option value="all">Semua Kategori ({channels.length})</option>
                <option value="virtual_account">Virtual Account (Bank)</option>
                <option value="qris_ewallet">QRIS &amp; E-Wallet</option>
                <option value="credit_card">Kartu Kredit</option>
                <option value="retail_paylater">Gerai Retail &amp; PayLater</option>
              </select>
            </div>
          </div>

          {/* List of Channels */}
          {filteredChannels.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-[#E5E0DD]">
              <Search className="w-8 h-8 text-[#706866] mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-[#241A1A]">Metode pembayaran tidak ditemukan</p>
              <p className="text-[11px] text-[#706866] mt-0.5">
                Coba kata kunci pencarian lain seperti "BCA", "QRIS", atau pilih Semua Kategori.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 bg-white ${
                    channel.isEnabled
                      ? 'border-[#E5E0DD] hover:border-[#66000E]/40 shadow-2xs'
                      : 'border-[#E5E0DD]/60 opacity-65 bg-[#FCFBFB]'
                  }`}
                >
                  {/* Left: Official Payment Logo & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {renderChannelLogo(channel.id, channel.iconCode)}

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[#241A1A] leading-snug">
                        {channel.name}
                      </h4>
                      <p className="text-[11px] text-[#706866] mt-0.5 line-clamp-1">
                        {channel.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Toggle Switch & Status Text */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-semibold hidden sm:inline-block ${
                        channel.isEnabled ? 'text-emerald-700' : 'text-[#706866]'
                      }`}
                    >
                      {channel.isEnabled ? 'Aktif' : 'Nonaktif'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleChannel(channel.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        channel.isEnabled ? 'bg-[#66000E]' : 'bg-[#D1C9C5]'
                      }`}
                      title={channel.isEnabled ? `Nonaktifkan ${channel.name}` : `Aktifkan ${channel.name}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          channel.isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Counter & Help Note */}
          <div className="flex items-center justify-between text-[11px] text-[#706866] pt-2 border-t border-[#E5E0DD]/80">
            <span>Menampilkan {filteredChannels.length} metode pembayaran</span>
            <span className="text-[#66000E] font-medium">
              Pilihan metode pembayaran otomatis tersinkron ke checkout pembeli
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
