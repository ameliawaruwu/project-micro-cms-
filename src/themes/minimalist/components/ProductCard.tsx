import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';

interface ProductCardProps {
  product: CmsProduct;
}

export const MinimalistProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <a href={`/produk/${product.slug}`} className="group block cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9] mb-6">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center mix-blend-multiply group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          loading="lazy"
        />
        {product.isNew && (
          <div className="absolute top-4 right-4 text-[9px] font-medium uppercase tracking-widest text-gray-900 bg-white/90 backdrop-blur-sm px-3 py-1.5">
            New
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2 px-2">
        <h3 className="text-sm font-light text-gray-900">
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 font-light">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
          {product.originalPrice && (
            <p className="text-xs text-gray-300 line-through font-light">
              Rp {product.originalPrice.toLocaleString('id-ID')}
            </p>
          )}
        </div>
      </div>
    </a>
  );
};
