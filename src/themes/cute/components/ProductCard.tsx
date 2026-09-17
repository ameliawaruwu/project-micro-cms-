import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';

interface ProductCardProps {
  product: CmsProduct;
}

export const CuteProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <a href={`/produk/${product.slug}`} className="group block font-['Outfit',sans-serif]">
      <div className="bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-4 border-[#FFF5F7]">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#FFF5F7] mb-4 border-2 border-white shadow-inner">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {product.isNew && (
            <div className="absolute top-2 left-2 bg-[#FFD1DC] text-[#FF85A1] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border-2 border-white shadow-sm rotate-[-5deg]">
              Baru! ✨
            </div>
          )}
        </div>
        
        <div className="px-2 text-center pb-2">
          <div className="bg-[#FFF5F7] text-[#FF85A1] text-[10px] font-bold px-2 py-1 rounded-full inline-block mb-2">
            {product.categoryName}
          </div>
          <h3 className="text-base font-black text-gray-800 line-clamp-1 mb-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg font-black text-[#FF85A1]">
              Rp{product.price.toLocaleString('id-ID')}
            </p>
            {product.originalPrice && (
              <p className="text-xs font-bold text-gray-400 line-through">
                Rp{product.originalPrice.toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </div>
    </a>
  );
};
