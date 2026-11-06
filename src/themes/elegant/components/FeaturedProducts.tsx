import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { ElegantProductCard } from './ProductCard';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';

export const ElegantFeaturedProducts: React.FC<{ isMobile?: boolean; isTablet?: boolean }> = ({ isMobile, isTablet }) => {
  const allProducts = useThemeProductsSource('elegant');
  const products = allProducts.filter(p => p.isFeatured).slice(0, 3);

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-2 md:grid-cols-3',
  });

  if (products.length === 0) return null;

  return (
    <section className="w-full py-32 px-6 md:px-16 font-['Cormorant_Garamond',serif] bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-20">
          <span className="block text-[#6B6865] text-[10px] tracking-[0.3em] uppercase font-sans mb-4">
            L'Édition
          </span>
          <h2 className="text-4xl md:text-5xl font-normal text-[#2C2A29] mb-6 italic">
            Pièces de Résistance
          </h2>
          <div className="w-px h-16 bg-[#2C2A29]/30"></div>
        </div>

        <div className={`grid ${gridColsClass} gap-12 md:gap-8`}>
          {products.map(product => (
            <ElegantProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-24 text-center">
          <a 
            href="/produk" 
            className="inline-block border border-[#2C2A29] text-[#2C2A29] font-sans text-xs uppercase tracking-[0.2em] px-12 py-4 hover:bg-[#2C2A29] hover:text-[#FAF9F6] transition-colors duration-500"
          >
            View Complete Collection
          </a>
        </div>
      </div>
    </section>
  );
};
