import React from 'react';
import { PackageOpen, TrendingUp, PackageCheck, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export type MetricType = 'orders' | 'sales' | 'products' | 'stock_alert';

interface MetricCardProps {
  type: MetricType;
  value: number | string;
  subtitle?: string;
  onClick?: () => void;
  actionLabel?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  type,
  value,
  subtitle,
  onClick,
}) => {
  const isStockAlert = type === 'stock_alert';
  const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
  const hasLowStock = isStockAlert && numericValue > 0;

  const getCardConfig = () => {
    switch (type) {
      case 'orders':
        return {
          title: 'Pesanan Masuk',
          displayValue: typeof value === 'number' ? `${value} Pesanan` : value,
          icon: PackageOpen,
          iconColor: 'text-[#800000]',
          iconBg: 'bg-rose-50 border border-rose-200',
          valueColor: 'text-slate-900 group-hover:text-[#800000]',
          helper: subtitle || 'Segera kemas & kirimkan resi',
        };
      case 'sales':
        return {
          title: 'Penjualan Hari Ini',
          displayValue: typeof value === 'number' ? formatRupiah(value) : value,
          icon: TrendingUp,
          iconColor: 'text-emerald-700',
          iconBg: 'bg-emerald-50 border border-emerald-200',
          valueColor: 'text-slate-900 group-hover:text-emerald-700',
          helper: subtitle || 'Total omset transaksi sukses',
        };
      case 'products':
        return {
          title: 'Total Produk',
          displayValue: typeof value === 'number' ? `${value} Produk` : value,
          icon: PackageCheck,
          iconColor: 'text-[#800000]',
          iconBg: 'bg-rose-50/70 border border-rose-200/80',
          valueColor: 'text-slate-900 group-hover:text-[#800000]',
          helper: subtitle || 'Barang aktif di etalase',
        };
      case 'stock_alert':
        return {
          title: 'Stok Menipis',
          displayValue: typeof value === 'number' ? `${value} Produk` : value,
          icon: AlertTriangle,
          iconColor: hasLowStock ? 'text-[#800000]' : 'text-emerald-700',
          iconBg: hasLowStock ? 'bg-rose-50 border border-rose-200' : 'bg-emerald-50 border border-emerald-200',
          valueColor: hasLowStock ? 'text-[#800000] group-hover:text-[#7A0C0C]' : 'text-slate-900',
          helper: subtitle || (hasLowStock ? 'Segera lakukan restock barang' : 'Semua stok produk aman'),
        };
    }
  };

  const config = getCardConfig();
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between font-sans text-left group relative overflow-hidden ${
        hasLowStock
          ? 'border-rose-300 hover:border-[#800000] shadow-2xs hover:shadow-xs bg-gradient-to-b from-white to-rose-50/20'
          : 'border-[#E5E0DD] hover:border-[#800000]/40 shadow-2xs hover:shadow-xs'
      }`}
    >
      <div>
        {/* Top Header: Icon + Title */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
            >
              <Icon className="w-4 h-4 stroke-[1.8]" />
            </div>
            <span className="text-xs font-semibold text-[#706866] truncate">
              {config.title}
            </span>
          </div>

          <ArrowUpRight className="w-3.5 h-3.5 text-[#706866] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Metric Value */}
        <div className="mt-1">
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${config.valueColor}`}>
            {config.displayValue}
          </h3>
          <p className="text-xs text-[#706866] mt-1 font-normal truncate">
            {config.helper}
          </p>
        </div>
      </div>
    </div>
  );
};
