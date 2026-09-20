import React from 'react';
import { PackageOpen, TrendingUp, PackageCheck, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { language } = useLanguage();
  const isEn = language === 'en';
  const isStockAlert = type === 'stock_alert';
  const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
  const hasLowStock = isStockAlert && numericValue > 0;

  const getCardConfig = () => {
    switch (type) {
      case 'orders':
        return {
          title: isEn ? 'Incoming Orders' : 'Pesanan Masuk',
          displayValue: typeof value === 'number' ? `${value} ${isEn ? 'Orders' : 'Pesanan'}` : value,
          icon: PackageOpen,
          iconColor: 'text-[#66000E]',
          iconBg: 'bg-[#F5E8EA] border border-[#E8DDDE]',
          valueColor: 'text-slate-900 group-hover:text-[#66000E]',
          helper: subtitle || (isEn ? 'Pack & ship tracking number' : 'Segera kemas & kirimkan resi'),
        };
      case 'sales':
        return {
          title: isEn ? "Today's Sales" : 'Penjualan Hari Ini',
          displayValue: typeof value === 'number' ? formatRupiah(value) : value,
          icon: TrendingUp,
          iconColor: 'text-emerald-700',
          iconBg: 'bg-emerald-50 border border-emerald-200',
          valueColor: 'text-slate-900 group-hover:text-emerald-700',
          helper: subtitle || (isEn ? 'Total completed transaction revenue' : 'Total omset transaksi sukses'),
        };
      case 'products':
        return {
          title: isEn ? 'Total Products' : 'Total Produk',
          displayValue: typeof value === 'number' ? `${value} ${isEn ? 'Products' : 'Produk'}` : value,
          icon: PackageCheck,
          iconColor: 'text-[#66000E]',
          iconBg: 'bg-[#F5E8EA] border border-[#E8DDDE]',
          valueColor: 'text-slate-900 group-hover:text-[#66000E]',
          helper: subtitle || (isEn ? 'Active items in storefront' : 'Barang aktif di etalase'),
        };
      case 'stock_alert':
        return {
          title: isEn ? 'Low Stock' : 'Stok Menipis',
          displayValue: typeof value === 'number' ? `${value} ${isEn ? 'Products' : 'Produk'}` : value,
          icon: AlertTriangle,
          iconColor: hasLowStock ? 'text-[#66000E]' : 'text-emerald-700',
          iconBg: hasLowStock ? 'bg-[#F5E8EA] border border-[#E8DDDE]' : 'bg-emerald-50 border border-emerald-200',
          valueColor: hasLowStock ? 'text-[#66000E] group-hover:text-[#52000B]' : 'text-slate-900',
          helper: subtitle || (hasLowStock ? (isEn ? 'Restock items soon' : 'Segera lakukan restock barang') : (isEn ? 'All product stock is safe' : 'Semua stok produk aman')),
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
          ? 'border-[#F0D5D8] hover:border-[#66000E] shadow-2xs hover:shadow-xs bg-gradient-to-b from-white to-[#F5E8EA]/30'
          : 'border-[#E5E0DD] hover:border-[#66000E]/40 shadow-2xs hover:shadow-xs'
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
            <span className="text-xs font-medium text-[#706866] truncate">
              {config.title}
            </span>
          </div>

          <ArrowUpRight className="w-3.5 h-3.5 text-[#706866] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Metric Value */}
        <div className="mt-1">
          <h3 className={`text-xl sm:text-2xl font-semibold tracking-tight transition-colors ${config.valueColor}`}>
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
