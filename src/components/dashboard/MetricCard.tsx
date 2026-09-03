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
          iconColor: 'text-[#66000E]',
          iconBg: 'bg-[#F9EDEF] border border-[#F5D0D6]',
          valueColor: 'text-[#241A1A] group-hover:text-[#66000E]',
          helper: subtitle || 'Segera proses & kirim resi',
        };
      case 'sales':
        return {
          title: 'Penjualan Hari Ini',
          displayValue: typeof value === 'number' ? formatRupiah(value) : value,
          icon: TrendingUp,
          iconColor: 'text-emerald-700',
          iconBg: 'bg-emerald-50 border border-emerald-200',
          valueColor: 'text-[#241A1A] group-hover:text-emerald-700',
          helper: subtitle || 'Total omset berhasil',
        };
      case 'products':
        return {
          title: 'Total Produk',
          displayValue: typeof value === 'number' ? `${value} Produk` : value,
          icon: PackageCheck,
          iconColor: 'text-[#241A1A]',
          iconBg: 'bg-[#FAF7F7] border border-[#E5E0DD]',
          valueColor: 'text-[#241A1A]',
          helper: subtitle || 'Barang aktif di etalase',
        };
      case 'stock_alert':
        return {
          title: 'Stok Menipis',
          displayValue: typeof value === 'number' ? `${value} Produk` : value,
          icon: AlertTriangle,
          iconColor: hasLowStock ? 'text-red-600' : 'text-amber-700',
          iconBg: hasLowStock ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200',
          valueColor: hasLowStock ? 'text-red-600 group-hover:text-red-700' : 'text-[#241A1A]',
          helper: subtitle || 'Segera lakukan restock barang',
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
          ? 'border-red-300 hover:border-red-500 shadow-2xs hover:shadow-xs bg-gradient-to-b from-white to-red-50/20'
          : 'border-[#E5E0DD] hover:border-[#66000E]/40 shadow-2xs hover:shadow-xs'
      }`}
    >
      <div>
        {/* Top Header: Icon + Title (Badges Removed) */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
              <Icon className="w-4 h-4 stroke-[1.8]" />
            </div>
            <span className="text-xs font-semibold text-[#706866] truncate">
              {config.title}
            </span>
          </div>

          <ArrowUpRight className="w-3.5 h-3.5 text-[#706866] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Metric Value */}
        <div className="mt-2">
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${config.valueColor}`}>
            {config.displayValue}
          </h3>
        </div>
      </div>
    </div>
  );
};

