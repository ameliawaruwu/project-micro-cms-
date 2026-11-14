import React from 'react';
import { ProductStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface StockBadgeProps {
  status: ProductStatus;
  stock: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ status, stock }) => {
  const { isEn } = useLanguage();
  if (status === 'Habis' || stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#66000E]"></span>
        <span>{isEn ? 'Out of Stock (0)' : 'Stok Habis (0)'}</span>
      </span>
    );
  }

  if (status === 'Hampir Habis' || stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF6EE] text-[#B54708] border border-[#FEDF89]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B54708] animate-pulse"></span>
        <span>{isEn ? `Low Stock (${stock})` : `Hampir Habis (${stock})`}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#027A48]"></span>
      <span>{isEn ? `In Stock (${stock})` : `Tersedia (${stock})`}</span>
    </span>
  );
};

