import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';

interface ProductCardProps {
  product: CmsProduct;
}

export const ElegantProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <a href={`/produk/${product.slug}`} className="group block font-['Cormorant_Garamond',serif] text-center">
      <div className="relative aspect-[2/3] overflow-hidden mb-6 bg-[#E8E6E1]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-in-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
        {product.isNew && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#2C2A29] text-[#FAF9F6] text-[9px] font-sans uppercase tracking-[0.2em] px-4 py-1">
            Nouveau
          </div>
        )}
      </div>
      
      <div className="px-4">
        <h3 className="text-xl text-[#2C2A29] mb-2 font-normal italic">
          {product.name}
        </h3>
        <div className="flex flex-col items-center gap-1 font-sans">
          <p className="text-sm tracking-widest text-[#6B6865]">
            IDR {product.price.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </a>
  );
};
