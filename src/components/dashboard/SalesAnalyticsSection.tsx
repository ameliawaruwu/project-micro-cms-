import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { TimeFilter, SalesAnalytics, MerchantTab } from '../../types';
import { merchantService } from '../../services/merchantService';
import { formatRupiah } from '../../utils/formatters';

interface SalesAnalyticsSectionProps {
  storeId: string;
  onNavigateTab?: (tab: MerchantTab) => void;
}

export const SalesAnalyticsSection: React.FC<SalesAnalyticsSectionProps> = ({
  storeId,
  onNavigateTab,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimeFilter>('Hari Ini');
  const [analytics, setAnalytics] = useState<(SalesAnalytics & { peakLabel?: string; peakAmount?: number }) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [showMobilePeriodSheet, setShowMobilePeriodSheet] = useState<boolean>(false);

  const periods: TimeFilter[] = ['Hari Ini', '7 Hari', '30 Hari', 'Tahun Ini'];

  useEffect(() => {
    setIsLoading(true);
    merchantService.getDashboardAnalytics(storeId, selectedPeriod).then((data) => {
      setAnalytics(data);
      // default select the peak or highest bar
      const maxIdx = data.chartData.reduce(
        (maxI, item, idx, arr) => (item.sales > arr[maxI].sales ? idx : maxI),
        0
      );
      setSelectedBarIndex(maxIdx);
      setIsLoading(false);
    });
  }, [storeId, selectedPeriod]);

  // Helper format short currency for Y-axis
  const formatShortRupiah = (num: number): string => {
    if (num >= 1000000000) return `Rp ${(num / 1000000000).toFixed(1)}M`;
    if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}jt`;
    if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}rb`;
    return `Rp ${num}`;
  };

  if (isLoading || !analytics) {
    return (
      <div className="bg-white rounded-[20px] border border-[#E5E0DD] p-4 sm:p-6 shadow-[0_8px_25px_rgba(36,26,26,0.06)] font-sans animate-pulse space-y-4">
        <div className="h-6 bg-[#FAF7F7] rounded-md w-1/3"></div>
        <div className="h-56 bg-[#FAF7F7] rounded-xl"></div>
      </div>
    );
  }

  const maxSales = Math.max(...analytics.chartData.map((d) => d.sales), 1);
  const activeBarIdx = hoveredBarIndex !== null ? hoveredBarIndex : selectedBarIndex;
  const activeBarData = activeBarIdx !== null ? analytics.chartData[activeBarIdx] : null;

  // Generate 4 Y-Axis scale marks (0%, 33%, 66%, 100%)
  const yAxisTicks = [
    maxSales,
    Math.round(maxSales * 0.66),
    Math.round(maxSales * 0.33),
    0,
  ];

  return (
    <div
      id="sales-summary-section"
      className="bg-white rounded-[20px] border border-[#E5E0DD] p-4 sm:p-6 shadow-[0_8px_25px_rgba(36,26,26,0.06)] font-sans text-left transition-all"
    >
      {/* 1. Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E0DD]">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm sm:text-base font-semibold text-[#241A1A]">
            Ringkasan Penjualan
          </h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{analytics.salesGrowth}%</span>
          </span>
        </div>

        {/* Period Selector: Desktop Segmented Control */}
        <div className="hidden sm:flex items-center p-1 bg-[#FAF7F7] rounded-xl border border-[#E5E0DD] text-xs">
          {periods.map((p) => {
            const isActive = selectedPeriod === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer min-h-[34px] ${
                  isActive
                    ? 'bg-white text-[#66000E] shadow-2xs border border-[#E6DDDA] font-medium'
                    : 'text-[#706866] hover:text-[#241A1A] font-normal'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Period Selector: Mobile Trigger Button */}
        <div className="sm:hidden flex items-center justify-between pt-1">
          <button
            onClick={() => setShowMobilePeriodSheet(true)}
            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs font-medium text-[#66000E] shadow-2xs min-h-[38px] w-full"
          >
            <span>Periode: {selectedPeriod}</span>
            <ChevronDown className="w-4 h-4 text-[#706866]" />
          </button>
        </div>
      </div>

      {/* Interactive Sales Chart Area */}
      <div className="pt-4">
        <div className="flex items-center justify-between text-xs text-[#706866] font-normal mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#241A1A]">Aktivitas Penjualan</span>
            <span className="text-[11px] text-[#706866]">({selectedPeriod})</span>
          </div>

          {/* Simple Legend */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#66000E]"></span>
            <span>Nominal Penjualan</span>
          </div>
        </div>

        {/* Chart Container with Axis & Interactive Bars */}
        <div className="relative h-56 sm:h-64 flex flex-col justify-between pt-4 pb-2 px-1">
          
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 pt-4 pb-8 flex flex-col justify-between pointer-events-none">
            {yAxisTicks.map((val, idx) => (
              <div key={idx} className="flex items-center w-full">
                <span className="w-14 sm:w-16 text-[10px] text-[#706866] font-mono text-right pr-2 shrink-0">
                  {formatShortRupiah(val)}
                </span>
                <div className="flex-1 border-b border-dashed border-[#E5E0DD]"></div>
              </div>
            ))}
          </div>

          {/* Bars Row */}
          <div className="relative z-10 flex items-end gap-2 sm:gap-4 pl-14 sm:pl-16 h-full pb-7">
            {analytics.chartData.map((d, index) => {
              const heightPercent = Math.max(Math.round((d.sales / maxSales) * 100), 8);
              const isHovered = hoveredBarIndex === index;
              const isSelected = selectedBarIndex === index;
              const isPrimary = isHovered || isSelected;

              return (
                <div
                  key={d.label}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer"
                  onMouseEnter={() => setHoveredBarIndex(index)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  onClick={() => setSelectedBarIndex(index)}
                >
                  {/* Tooltip on active/hovered bar */}
                  {isPrimary && (
                    <div className="absolute -top-12 z-30 px-3 py-1.5 rounded-xl bg-[#241A1A] text-white text-[11px] font-medium shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 pointer-events-none border border-white/10">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/70 font-normal">{d.label}:</span>
                        <span>{formatRupiah(d.sales)}</span>
                      </div>
                      <p className="text-[10px] text-rose-200 font-normal mt-0.2">
                        {d.orders} pesanan sukses
                      </p>
                    </div>
                  )}

                  {/* Bar Element */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 ${
                      isPrimary
                        ? 'bg-[#66000E] shadow-sm ring-2 ring-[#66000E]/20'
                        : 'bg-[#66000E]/70 hover:bg-[#66000E]/90'
                    }`}
                  />

                  {/* X-Axis Label */}
                  <span className={`absolute -bottom-6 text-[10px] sm:text-[11px] transition-colors whitespace-nowrap ${
                    isPrimary ? 'font-medium text-[#66000E]' : 'font-normal text-[#706866]'
                  }`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Mobile Period Selector Bottom Sheet */}
      {showMobilePeriodSheet && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-xs sm:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowMobilePeriodSheet(false)}
          />
          <div className="relative w-full bg-white rounded-t-3xl p-5 shadow-2xl z-10 border-t border-[#E5E0DD] animate-in slide-in-from-bottom duration-250">
            <div className="w-12 h-1.5 bg-[#E5E0DD] rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0DD] mb-3">
              <h3 className="font-bold text-sm text-[#241A1A]">Pilih Periode Penjualan</h3>
              <button
                onClick={() => setShowMobilePeriodSheet(false)}
                className="p-1 rounded-full text-[#706866] hover:bg-[#FAF7F7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {periods.map((p) => {
                const isActive = selectedPeriod === p;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPeriod(p);
                      setShowMobilePeriodSheet(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-[#FAF7F7] text-[#66000E] border border-[#E6DDDA]'
                        : 'text-[#241A1A] hover:bg-[#FAF7F7]'
                    }`}
                  >
                    <span>{p}</span>
                    {isActive && <Check className="w-4 h-4 text-[#66000E]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
