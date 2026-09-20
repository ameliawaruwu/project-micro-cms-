import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Zap, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const handleBuy = () => {
    onBuyNow(product, quantity);
    onClose();
  };

  return (
    <div id="modal-product-detail" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto font-poppins">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-xl border border-[#E5E0DD] my-6 animate-in fade-in zoom-in duration-200">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0DD]">
          <span className="text-xs font-semibold text-[#777777] uppercase tracking-wider">
            Detail Produk • {product.category}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Photo Gallery */}
          <div>
            <div className="aspect-square rounded-2xl bg-[#F7F7F7] border border-[#E5E0DD] overflow-hidden relative">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800'}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-[#66000E] text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
                  Hemat {discountPercent}%
                </div>
              )}
            </div>
          </div>

          {/* Details & Buy controls */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1F1F1F] leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1F1F1F]">
                  {formatRupiah(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-[#777777] line-through">
                    {formatRupiah(product.originalPrice!)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-2 text-xs font-semibold">
                {isOutOfStock ? (
                  <span className="text-[#66000E]">❌ Stok Habis</span>
                ) : (
                  <span className="text-[#027A48]">✓ Stok Tersedia ({product.stock} barang tersisa)</span>
                )}
              </div>

              {/* Description */}
              <div className="mt-3.5 pt-3 border-t border-[#E5E0DD]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#777777] mb-1">
                  Deskripsi Produk
                </h4>
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {product.description}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#555555] font-medium bg-[#F7F7F7] p-2.5 rounded-xl border border-[#E5E0DD]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#027A48]" />
                  <span>100% Produk Original</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#66000E]" />
                  <span>Kirim Cepat J&T/JNE</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & CTAs */}
            <div className="pt-3 border-t border-[#E5E0DD] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1F1F1F]">Jumlah Pembelian:</span>
                <div className="flex items-center bg-[#F7F7F7] rounded-xl p-1 border border-[#E5E0DD]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 rounded-lg bg-white text-[#1F1F1F] flex items-center justify-center font-bold text-xs disabled:opacity-40 shadow-xs cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#1F1F1F] font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="w-8 h-8 rounded-lg bg-white text-[#1F1F1F] flex items-center justify-center font-bold text-xs disabled:opacity-40 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock}
                  className="py-2.5 px-3 min-h-[44px] rounded-xl bg-[#F7F7F7] hover:bg-[#EAEAEA] border border-[#E5E0DD] text-[#1F1F1F] font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>+ Keranjang</span>
                </button>

                <button
                  onClick={handleBuy}
                  disabled={isOutOfStock}
                  className="py-2.5 px-3 min-h-[44px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Beli Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

