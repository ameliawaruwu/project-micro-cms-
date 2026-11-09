import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';
import { AddToCartButton, addProductToCart, useStorefrontSlug } from '../../storefrontCart';

interface ProductCardProps {
  product: CmsProduct;
  accentColor?: string;
}

export const ModernProductCard: React.FC<ProductCardProps> = ({ product, accentColor = '#2563EB' }) => {
  return (
    <a href={`/produk/${product.slug}`} className="group block font-['Outfit',sans-serif]">
      <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-2xl mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-300">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.isNew && (
          <div className="absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full" style={{ backgroundColor: accentColor }}>
            Baru
          </div>
        )}
        <AddToCartButton
          product={product}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          style={{ color: accentColor }}
        >
          +
        </AddToCartButton>
      </div>
      <div className="px-1">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-1">{product.categoryName}</p>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold" style={{ color: accentColor }}>
            Rp{product.price.toLocaleString('id-ID')}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              Rp{product.originalPrice.toLocaleString('id-ID')}
            </span>
          )}
        </div>
      </div>
    </a>
  );
};
