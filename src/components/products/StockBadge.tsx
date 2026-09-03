import React from 'react';
import { ProductStatus } from '../../types';

interface StockBadgeProps {
  status: ProductStatus;
  stock: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ status, stock }) => {
  if (status === 'Habis' || stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFF1F0] text-[#9A0602] border border-[#FECDCA]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9A0602]"></span>
        <span>Stok Habis (0)</span>
      </span>
    );
  }

  if (status === 'Hampir Habis' || stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF6EE] text-[#B54708] border border-[#FEDF89]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B54708] animate-pulse"></span>
        <span>Hampir Habis ({stock})</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#027A48]"></span>
      <span>Tersedia ({stock})</span>
    </span>
  );
};

