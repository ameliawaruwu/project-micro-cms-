import React from 'react';
import { CmsProduct } from '../../../cms/mockCmsData';

interface ProductCardProps {
  product: CmsProduct;
}

export const FuturisticProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <a href={`/produk/${product.slug}`} className="group block relative font-['Space_Grotesk',sans-serif]">
      {/* Glow background effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-400 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
      
      <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden h-full flex flex-col shadow-sm">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            loading="lazy"
          />
          {product.isNew && (
            <div className="absolute top-3 right-3 bg-red-500/10 border border-red-500 text-red-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm shadow-[0_0_10px_rgba(220,38,38,0.1)]">
              New Arrival
            </div>
          )}
          
          {/* Cyberpunk grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgxOHYxOEgxVjF6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjIwLDM4LDM4LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-20 mix-blend-overlay"></div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-red-600 uppercase tracking-widest mb-2 font-bold">{product.categoryName}</p>
            <h3 className="text-sm font-medium text-gray-900 mb-4 line-clamp-2 leading-relaxed">
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through decoration-red-500/50">
                  Rp{product.originalPrice.toLocaleString('id-ID')}
                </span>
              )}
              <span className="text-lg font-bold text-gray-900">
                Rp{product.price.toLocaleString('id-ID')}
              </span>
            </div>
            
            {/* Fake add to cart button */}
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors shadow-[0_0_15px_rgba(220,38,38,0)] group-hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              +
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};
