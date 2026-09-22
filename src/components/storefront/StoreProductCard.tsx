import React from 'react';
import { ShoppingBag, Zap, Eye } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface StoreProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const StoreProductCard: React.FC<StoreProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
}) => {
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0DD] shadow-xs hover:border-[#D5D0CD] transition-all duration-200 overflow-hidden flex flex-col justify-between group font-poppins">
      {/* Product Image Area */}
      <div
        onClick={() => onSelectProduct(product)}
        className="relative aspect-square bg-[#F7F7F7] overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2.5 left-2.5 bg-[#66000E] text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
            Diskon {discountPercent}%
          </div>
        )}

        {/* Stock status overlay if out of stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-2">
            <span className="bg-[#66000E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
              Stok Habis
            </span>
          </div>
        )}

        {/* Quick View Hover Indicator */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white text-[#1F1F1F] font-semibold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#66000E]" />
            <span>Lihat Detail</span>
          </span>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#777777] uppercase tracking-wider block">
            {product.category}
          </span>
          <h3
            onClick={() => onSelectProduct(product)}
            className="font-bold text-xs sm:text-sm text-[#1F1F1F] hover:text-[#66000E] cursor-pointer mt-1 line-clamp-2 leading-snug transition-colors"
          >
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
            <span className="font-bold text-sm sm:text-base text-[#1F1F1F]">
              {formatRupiah(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#777777] line-through">
                {formatRupiah(product.originalPrice!)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-3 border-t border-[#E5E0DD] grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="w-full py-2.5 px-2 min-h-[40px] rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E5E0DD] text-[#1F1F1F] font-semibold text-xs flex items-center justify-center gap-1 transition disabled:opacity-40 cursor-pointer"
            title="Tambah ke Keranjang"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Keranjang</span>
          </button>

          <button
            onClick={() => onBuyNow(product)}
            disabled={isOutOfStock}
            className="w-full py-2.5 px-2 min-h-[40px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs flex items-center justify-center gap-1 transition shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Beli</span>
          </button>
        </div>
      </div>
    </div>
  );
};

