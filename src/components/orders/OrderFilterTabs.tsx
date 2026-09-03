import React from 'react';
import { ShippingStatus } from '../../types';

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
  const tabs: { id: ShippingStatus | 'Semua'; label: string; count: number }[] = [
    { id: 'Semua', label: 'Semua', count: counts.Semua },
    { id: 'Baru', label: 'Baru', count: counts.Baru },
    { id: 'Diproses', label: 'Diproses', count: counts.Diproses },
    { id: 'Dikirim', label: 'Dikirim', count: counts.Dikirim },
    { id: 'Selesai', label: 'Selesai', count: counts.Selesai },
    { id: 'Dibatalkan', label: 'Dibatalkan', count: counts.Dibatalkan || 0 },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar font-sans">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectStatus(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              isActive
                ? 'bg-[#9A0602] text-white shadow-xs'
                : 'bg-white text-[#555555] hover:bg-[#F7F7F7] border border-[#EAEAEA]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white text-[#9A0602]' : 'bg-[#F7F7F7] text-[#555555]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

