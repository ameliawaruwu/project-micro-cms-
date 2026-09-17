import React from 'react';
import { AlertTriangle, ArrowRight, PackageX, CheckCircle2, PlusCircle } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';

interface StockAlertCardProps {
  products: Product[];
  lowStockItems?: Product[];
  count?: number;
  onManageStock: () => void;
}

export const StockAlertCard: React.FC<StockAlertCardProps> = ({
  products,
  lowStockItems: providedLowStock,
  count,
  onManageStock,
}) => {
  const { language, t } = useLanguage();
  const isEn = language === 'en';
  const lowStockItems = providedLowStock || products.filter((p) => Number(p.stock) <= 5);
  const totalLowStock = count !== undefined ? count : lowStockItems.length;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0DD] p-4 sm:p-5 shadow-2xs font-sans text-left transition-all hover:border-[#800000]/20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              totalLowStock > 0
                ? 'bg-rose-50 border-rose-200 text-[#800000]'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {totalLowStock > 0 ? (
              <AlertTriangle className="w-4 h-4 stroke-[1.8]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 stroke-[1.8]" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{t('stat_low_stock', 'Stok Menipis')}</h3>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            totalLowStock > 0
              ? 'bg-rose-50 text-[#800000] border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {totalLowStock} {isEn ? 'Products' : 'Produk'}
        </span>
      </div>

      {/* Stock List / Empty State */}
      <div className="divide-y divide-[#E5E0DD]/70 my-1 min-h-[140px] flex flex-col justify-center">
        {totalLowStock === 0 || lowStockItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#706866] flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2 text-emerald-600">
              <PackageX className="w-5 h-5" />
            </div>
            <p className="font-medium text-slate-800">{t('all_stock_safe', 'Semua stok produk aman')}</p>
            <p className="text-[11px] text-[#706866] mt-0.5">{t('no_stock_below_5', 'Tidak ada produk dengan stok di bawah 5')}</p>
          </div>
        ) : (
          lowStockItems.slice(0, 5).map((prod) => (
            <div key={prod.id} className="py-2.5 flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                    alt={prod.name}
                    className="w-10 h-10 rounded-xl object-cover border border-rose-200 shrink-0 bg-neutral-100"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#800000] border-2 border-white"></span>
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-slate-800 truncate group-hover:text-[#800000] transition-colors">
                    {prod.name}
                  </p>
                  <p className="text-[11px] text-[#706866] font-normal">{formatRupiah(prod.price)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[#800000] text-xs font-semibold">
                  {t('stock_remaining', 'Sisa')} {prod.stock}
                </span>
                <button
                  onClick={onManageStock}
                  title={isEn ? 'Restock this product' : 'Restock produk ini'}
                  className="p-1 rounded-lg hover:bg-rose-50 text-[#706866] hover:text-[#800000] transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          onClick={onManageStock}
          className="w-full py-2.5 min-h-[40px] rounded-xl bg-white hover:bg-rose-50/70 border border-[#E5E0DD] hover:border-rose-200 text-[#800000] font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-2xs"
        >
          <span>{t('manage_stock_restock', 'Kelola Stok & Restock')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
