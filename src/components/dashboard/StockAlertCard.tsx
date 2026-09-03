import React from 'react';
import { AlertTriangle, ArrowRight, PackageX } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface StockAlertCardProps {
  products: Product[];
  onManageStock: () => void;
}

export const StockAlertCard: React.FC<StockAlertCardProps> = ({ products, onManageStock }) => {
  const lowStockItems = products.filter((p) => p.stock <= 5);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0DD] p-4 sm:p-5 shadow-2xs font-sans text-left">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E5E0DD]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#241A1A]">Stok Menipis</h3>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
          {lowStockItems.length} Produk
        </span>
      </div>

      {/* Stock list */}
      <div className="divide-y divide-[#E5E0DD] my-1">
        {lowStockItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#706866]">
            <PackageX className="w-8 h-8 mx-auto mb-2 text-[#E5E0DD]" />
            <p className="font-normal">Semua stok produk Anda masih aman.</p>
          </div>
        ) : (
          lowStockItems.map((prod) => (
            <div key={prod.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative shrink-0">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-red-500 ring-2 ring-red-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 border border-white"></span>
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#241A1A] truncate">{prod.name}</p>
                  <p className="text-[11px] text-[#706866] font-normal">{formatRupiah(prod.price)}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  Sisa {prod.stock}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          onClick={onManageStock}
          className="w-full py-2.5 min-h-[40px] rounded-xl bg-[#FAF7F7] hover:bg-[#E5E0DD] border border-[#E5E0DD] text-[#241A1A] font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>Kelola Stok Produk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
