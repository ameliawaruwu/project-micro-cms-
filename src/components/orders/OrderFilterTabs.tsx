import React, { useRef } from 'react';
import {
  Layers,
  Sparkles,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { ShippingStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface OrderFilterTabsProps {
  activeStatus: ShippingStatus | 'Semua';
  counts: {
    Semua: number;
    Baru: number;
    Diproses: number;
    Dikirim: number;
    Selesai: number;
    Dibatalkan?: number;
  };
  onSelectStatus: (status: ShippingStatus | 'Semua') => void;
}

export const OrderFilterTabs: React.FC<OrderFilterTabsProps> = ({
  activeStatus,
  counts,
  onSelectStatus,
}) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);

  const tabs: {
    id: ShippingStatus | 'Semua';
    label: string;
    count: number;
    icon: React.ElementType;
    activeGradient: string;
    activeGlow: string;
    accentHover: string;
    badgeActive: string;
    badgeInactive: string;
    badgeHover: string;
    hasAlertBadge?: boolean;
  }[] = [
    {
      id: 'Semua',
      label: t('filter_all', 'Semua'),
      count: counts.Semua,
      icon: Layers,
      activeGradient: 'from-[#9A0602] to-[#B91C1C]',
      activeGlow: 'shadow-md shadow-[#9A0602]/25',
      accentHover: 'hover:border-[#9A0602]/40 hover:text-[#9A0602]',
      badgeActive: 'bg-white/25 text-white border-white/30',
      badgeInactive: 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
      badgeHover: 'group-hover:bg-[#FFF1F0] group-hover:text-[#9A0602] group-hover:border-[#FECDCA]',
    },
    {
      id: 'Baru',
      label: t('filter_new', 'Baru'),
      count: counts.Baru,
      icon: Sparkles,
      activeGradient: 'from-[#9A0602] to-[#DC2626]',
      activeGlow: 'shadow-md shadow-[#DC2626]/30',
      accentHover: 'hover:border-[#DC2626]/40 hover:text-[#DC2626]',
      badgeActive: 'bg-white text-[#9A0602] shadow-xs',
      badgeInactive:
        counts.Baru > 0
          ? 'bg-[#FFF1F0] text-[#DC2626] border-[#FECDCA] font-extrabold'
          : 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
      badgeHover: 'group-hover:bg-[#FFF1F0] group-hover:text-[#DC2626] group-hover:border-[#FECDCA]',
      hasAlertBadge: counts.Baru > 0,
    },
    {
      id: 'Diproses',
      label: t('filter_processing', 'Diproses'),
      count: counts.Diproses,
      icon: Clock,
      activeGradient: 'from-[#C2410C] to-[#EA580C]',
      activeGlow: 'shadow-md shadow-[#EA580C]/30',
      accentHover: 'hover:border-[#EA580C]/40 hover:text-[#EA580C]',
      badgeActive: 'bg-white text-[#C2410C] shadow-xs',
      badgeInactive:
        counts.Diproses > 0
          ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5] font-bold'
          : 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
      badgeHover: 'group-hover:bg-[#FFF7ED] group-hover:text-[#C2410C] group-hover:border-[#FFEDD5]',
    },
    {
      id: 'Dikirim',
      label: t('filter_shipped', 'Dikirim'),
      count: counts.Dikirim,
      icon: Truck,
      activeGradient: 'from-[#2563EB] to-[#1D4ED8]',
      activeGlow: 'shadow-md shadow-[#2563EB]/30',
      accentHover: 'hover:border-[#2563EB]/40 hover:text-[#2563EB]',
      badgeActive: 'bg-white text-[#1D4ED8] shadow-xs',
      badgeInactive:
        counts.Dikirim > 0
          ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] font-bold'
          : 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
      badgeHover: 'group-hover:bg-[#EFF6FF] group-hover:text-[#1D4ED8] group-hover:border-[#BFDBFE]',
    },
    {
      id: 'Selesai',
      label: t('filter_completed', 'Selesai'),
      count: counts.Selesai,
      icon: CheckCircle2,
      activeGradient: 'from-[#059669] to-[#047857]',
      activeGlow: 'shadow-md shadow-[#059669]/30',
      accentHover: 'hover:border-[#059669]/40 hover:text-[#059669]',
      badgeActive: 'bg-white text-[#047857] shadow-xs',
      badgeInactive:
        counts.Selesai > 0
          ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6] font-bold'
          : 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
      badgeHover: 'group-hover:bg-[#ECFDF3] group-hover:text-[#027A48] group-hover:border-[#ABEFC6]',
    },
    {
      id: 'Dibatalkan',
      label: t('filter_cancelled', 'Dibatalkan'),
      count: counts.Dibatalkan || 0,
      icon: XCircle,
      activeGradient: 'from-[#475467] to-[#344054]',
      activeGlow: 'shadow-md shadow-[#475467]/30',
      accentHover: 'hover:border-[#475467]/40 hover:text-[#475467]',
      badgeActive: 'bg-white text-[#344054] shadow-xs',
      badgeInactive: 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]',
      badgeHover: 'group-hover:bg-[#F4F4F5] group-hover:text-[#1F1F1F] group-hover:border-[#D4D4D8]',
    },
  ];

  const handleTabClick = (id: ShippingStatus | 'Semua', e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectStatus(id);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div className="w-full font-sans">
      {/* Sleek Segmented Dock Container */}
      <div className="relative p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-[#EAEAEA] shadow-2xs">
        <div
          ref={containerRef}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {tabs.map((tab) => {
            const isActive = activeStatus === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => handleTabClick(tab.id, e)}
                title={`Filter pesanan: ${tab.label} (${tab.count})`}
                className={`group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[42px] rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out shrink-0 cursor-pointer select-none active:scale-[0.97] ${
                  isActive
                    ? `bg-gradient-to-r ${tab.activeGradient} text-white shadow-xs font-bold z-10`
                    : `bg-white text-[#555555] hover:bg-white/95 border border-[#EAEAEA] ${tab.accentHover}`
                }`}
              >
                {/* Micro-interaction: Animated Alert Dot on New Orders */}
                {tab.hasAlertBadge && !isActive && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 z-20 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-80" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#DC2626] border-2 border-white" />
                  </span>
                )}

                {/* Status Icon */}
                <span
                  className={`transition-transform duration-300 ${
                    isActive
                      ? 'scale-105'
                      : 'group-hover:scale-110'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-[#777777] group-hover:text-current'
                    }`}
                  />
                </span>

                {/* Tab Label */}
                <span className="tracking-tight text-[11px] sm:text-xs">{tab.label}</span>

                {/* Interactive Counter Badge */}
                <span
                  className={`text-[10px] sm:text-[11px] min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 rounded-full font-mono font-bold flex items-center justify-center border transition-all duration-200 ${
                    isActive
                      ? tab.badgeActive
                      : `${tab.badgeInactive} ${tab.badgeHover}`
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {/* Quick Clear Filter Button */}
          {activeStatus !== 'Semua' && (
            <button
              type="button"
              onClick={() => onSelectStatus('Semua')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[42px] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-[#777777] hover:text-[#9A0602] hover:bg-white border border-dashed border-[#D4D4D8] hover:border-[#9A0602]/50 whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ml-auto active:scale-95 group"
              title="Reset ke Semua Pesanan"
            >
              <RotateCcw className="w-3 h-3 text-[#777777] group-hover:text-[#9A0602] group-hover:-rotate-90 transition-transform duration-300" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
