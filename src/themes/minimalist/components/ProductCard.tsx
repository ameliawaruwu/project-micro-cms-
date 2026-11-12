import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';
import { formatRupiah, productHref } from '../../storefrontLinks';

interface ProductCardProps {
  product: CmsProduct;
}

export const MinimalistProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <a href={productHref(product)} className="group block cursor-pointer min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9] mb-3 sm:mb-6">
        {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center mix-blend-multiply group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          loading="lazy"
        />
        )}
        {product.isNew && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[9px] font-medium uppercase tracking-widest text-gray-900 bg-white/90 backdrop-blur-sm px-3 py-1.5">
            Baru
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-1.5 sm:space-y-2 px-1 sm:px-2 min-w-0">
        <h3 className="text-xs sm:text-sm font-light text-gray-900 line-clamp-2 break-words">
          {product.name}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <p className="text-xs sm:text-sm text-gray-500 font-light whitespace-nowrap">
            {formatRupiah(product.price)}
          </p>
          {product.originalPrice && (
            <p className="text-[11px] sm:text-xs text-gray-300 line-through font-light whitespace-nowrap">
              {formatRupiah(product.originalPrice)}
            </p>
          )}
        </div>
      </div>
    </a>
  );
};
