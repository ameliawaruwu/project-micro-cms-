import React from 'react';
import { Plus, ShoppingBag, Share2, Wallet } from 'lucide-react';

interface QuickActionProps {
  onAddProduct: () => void;
  onViewOrders: () => void;
  onShareStore: () => void;
  onWithdraw: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  onAddProduct,
  onViewOrders,
  onShareStore,
  onWithdraw,
}) => {
  return (
    <div id="quick-actions-bar" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 font-sans w-full max-w-full">
      
      {/* 1. Tambah Produk */}
      <button
        onClick={onAddProduct}
        className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-medium text-xs sm:text-sm shadow-2xs hover:shadow-xs transition text-left cursor-pointer min-h-[46px] min-w-0"
      >
        <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-white/15 text-white flex items-center justify-center shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-medium text-white leading-tight truncate">Tambah Produk</span>
          <span className="text-[10px] text-white/80 font-normal mt-0.5 block truncate">Upload barang baru</span>
        </div>
      </button>

      {/* 2. Lihat Pesanan */}
      <button
        onClick={onViewOrders}
        className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#FAF7F7] border border-[#E5E0DD] hover:border-[#66000E] text-[#241A1A] font-medium text-xs sm:text-sm shadow-2xs transition text-left cursor-pointer min-h-[46px] min-w-0"
      >
        <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-[#FAF7F7] text-[#66000E] border border-[#E6DDDA] flex items-center justify-center shrink-0">
          <ShoppingBag className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-medium text-[#241A1A] leading-tight truncate">Lihat Pesanan</span>
          <span className="text-[10px] text-[#706866] font-normal mt-0.5 block truncate">Kelola order masuk</span>
        </div>
      </button>

      {/* 3. Bagikan Toko */}
      <button
        onClick={onShareStore}
        className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#FAF7F7] border border-[#E5E0DD] hover:border-[#66000E] text-[#241A1A] font-medium text-xs sm:text-sm shadow-2xs transition text-left cursor-pointer min-h-[46px] min-w-0"
      >
        <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-[#FAF7F7] text-[#241A1A] border border-[#E5E0DD] flex items-center justify-center shrink-0">
          <Share2 className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-medium text-[#241A1A] leading-tight truncate">Bagikan Toko</span>
          <span className="text-[10px] text-[#706866] font-normal mt-0.5 block truncate">Link & katalog WA</span>
        </div>
      </button>

      {/* 4. Tarik Saldo */}
      <button
        onClick={onWithdraw}
        className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#FAF7F7] border border-[#E5E0DD] hover:border-emerald-500 text-[#241A1A] font-medium text-xs sm:text-sm shadow-2xs transition text-left cursor-pointer min-h-[46px] min-w-0"
      >
        <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
          <Wallet className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-medium text-[#241A1A] leading-tight truncate">Tarik Saldo</span>
          <span className="text-[10px] text-[#706866] font-normal mt-0.5 block truncate">Transfer rekening</span>
        </div>
      </button>
    </div>
  );
};
