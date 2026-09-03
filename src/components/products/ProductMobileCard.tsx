import React from 'react';
import { Plus, Minus, Edit2, Tag } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { StockBadge } from './StockBadge';

interface ProductMobileCardProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
  onQuickStockChange?: (id: string, delta: number) => void;
}

export const ProductMobileCard: React.FC<ProductMobileCardProps> = ({
  products,
  onEditProduct,
}) => {
  return (
    <div className="space-y-3 pb-20 font-sans">
      {/* List of Mobile Product Cards */}
      {products.map((prod) => (
        <div
          key={prod.id}
          className="bg-white rounded-2xl p-4 border border-[#E5E0DD] shadow-2xs flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            {/* Large Product Image */}
            <div className={`w-20 h-20 rounded-xl bg-white overflow-hidden shrink-0 transition-all ${
              prod.stock <= 5
                ? 'border-2 border-red-500 ring-2 ring-red-100'
                : 'border border-[#E5E0DD]'
            }`}>
              <img
                src={prod.imageUrl || 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=300'}
                alt={prod.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[11px] text-[#706866] font-medium mb-0.5">
                <Tag className="w-3 h-3 text-[#66000E]" />
                <span className="truncate">{prod.category}</span>
              </div>
              <h4
                className="font-semibold text-sm text-[#241A1A] leading-snug line-clamp-2 cursor-pointer hover:text-[#66000E]"
                onClick={() => onEditProduct(prod)}
              >
                {prod.name}
              </h4>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-bold text-[#241A1A] text-base">
                  {formatRupiah(prod.price)}
                </span>
                {prod.originalPrice && prod.originalPrice > prod.price && (
                  <span className="text-[11px] text-[#706866] line-through">
                    {formatRupiah(prod.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Stock Info and Edit Button */}
          <div className="pt-3 border-t border-[#E5E0DD] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#706866]">
              <span>Stok:</span>
              <span className={`font-mono ${
                prod.stock <= 5
                  ? 'font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200'
                  : 'font-bold text-[#241A1A]'
              }`}>
                {prod.stock}
              </span>
            </div>

            {/* Edit button */}
            <button
              onClick={() => onEditProduct(prod)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF7F7] hover:bg-[#F9EDEF] hover:text-[#66000E] text-[#241A1A] border border-[#E5E0DD] hover:border-[#66000E]/40 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Ubah Produk</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

