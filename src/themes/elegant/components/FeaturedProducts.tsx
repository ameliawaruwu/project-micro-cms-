import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { ElegantProductCard } from './ProductCard';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useSectionProducts } from '../../useSectionProducts';
import { STORE_ROUTES } from '../../storefrontLinks';
import { useLanguage } from '../../../contexts/LanguageContext';

export const ElegantFeaturedProducts: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { isEn } = useLanguage();
  // Pilihan & jumlah produk dari panel kanan editor; tanpa pilihan manual utamakan produk unggulan.
  const products = useSectionProducts('elegant', sectionOptions, { defaultCount: 3, preferFeatured: true });
  const eyebrow = sectionOptions.eyebrowText || (isEn ? 'Our Picks' : 'Pilihan Kami');
  const description = sectionOptions.description || sectionOptions.featuredSubtitle;
  const heading = sectionOptions.heading || (isEn ? 'Featured Products' : 'Produk Unggulan');
  const buttonLabel = sectionOptions.buttonLabel || sectionOptions.buttonText || (isEn ? 'View All Collections' : 'Lihat Semua Koleksi');

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-2 md:grid-cols-3',
  });

  if (products.length === 0) return null;

  return (
    <section className="w-full py-16 sm:py-32 px-4 sm:px-6 md:px-16 font-['Cormorant_Garamond',serif] bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12 sm:mb-20">
          <span className="block text-[#6B6865] text-[10px] tracking-[0.3em] uppercase font-sans mb-4">
            {eyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#2C2A29] mb-6 italic break-words">
            {heading}
          </h2>
          {description && (
            <p className="max-w-xl text-sm sm:text-base text-[#6B6865] font-sans font-light leading-relaxed mb-6">{description}</p>
          )}
          <div className="w-px h-16 bg-[#2C2A29]/30"></div>
        </div>

        <div className={`grid ${gridColsClass} gap-x-4 gap-y-10 sm:gap-12 md:gap-8`}>
          {products.map(product => (
            <ElegantProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-14 sm:mt-24 text-center">
          <a 
            href={STORE_ROUTES.catalog}
            className="inline-block border border-[#2C2A29] text-[#2C2A29] font-sans text-xs uppercase tracking-[0.2em] px-8 sm:px-12 py-4 hover:bg-[#2C2A29] hover:text-[#FAF9F6] transition-colors duration-500"
          >
            {buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
};
