import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { CuteProductCard } from './ProductCard';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES } from '../../storefrontLinks';

export const CuteFeaturedProducts: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey, isMobile, isTablet }) => {
  const allProducts = useThemeProductsSource('cute');
  // Dynamic product filtering and sorting
  let filteredProducts = [...allProducts];
  
  if (sectionOptions.selectedCategoryId && sectionOptions.selectedCategoryId !== 'all') {
    filteredProducts = filteredProducts.filter(p => ((p as any).category || p.categoryName) === sectionOptions.selectedCategoryId);
  }

  if (sectionOptions.selectedProductIds && sectionOptions.selectedProductIds.length > 0) {
    filteredProducts = filteredProducts.filter(p => sectionOptions.selectedProductIds.includes(p.id));
  }

  if (sectionOptions.sortOrder === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sectionOptions.sortOrder === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sectionOptions.sortOrder === 'name-asc') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  const limit = sectionOptions.productCount || 4;
  const products = filteredProducts.slice(0, limit);

  const title = sectionOptions.featuredTitle || sectionOptions.heading || "Produk Favorit";
  const subtitle = sectionOptions.featuredSubtitle || sectionOptions.subheading || "Paling Disukai 💖";
  const buttonText = sectionOptions.buttonLabel || sectionOptions.buttonText || "Lihat Lebih Banyak 🌸";

  const desiredCols = [2, 3, 4, 5, 6].includes(sectionOptions.gridColumns) ? sectionOptions.gridColumns : 4;
  const desktopColsMap: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-4', 6: 'grid-cols-4' };
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: desktopColsMap[desiredCols],
    fallback:
      desiredCols === 2 ? 'grid-cols-2 sm:grid-cols-2' :
      desiredCols === 3 ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' :
      desiredCols === 5 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' :
      desiredCols === 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' :
      'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  });

  if (products.length === 0) return null;

  return (
    <section className="w-full py-14 sm:py-20 px-4 sm:px-6 font-['Outfit',sans-serif] bg-white relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#FFF5F7] rounded-full -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          {sectionOptions.imageUrl && (
            <img 
              src={sectionOptions.imageUrl} 
              alt="" 
              className="w-full h-48 md:h-64 object-cover rounded-3xl mb-8 border-4 border-[#FFF5F7] shadow-sm"
            />
          )}
          <div className="inline-block px-4 py-1 bg-[#FFD1DC] text-[#FF85A1] font-bold rounded-full mb-4 rotate-2">
            <InlineEditableText
              tagName="span"
              value={subtitle}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-800 tracking-tight break-words">
            <InlineEditableText
              tagName="span"
              value={title}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </h2>
        </div>

        <div className={`grid ${gridColsClass} gap-3 sm:gap-4 md:gap-6`}>
          {products.map(product => (
            <CuteProductCard key={product.id} product={product} options={sectionOptions} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a 
            href={STORE_ROUTES.catalog}
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-[#FF85A1] text-white text-base sm:text-lg font-black hover:bg-[#FF6B8B] hover:scale-105 transition-all duration-300 rounded-full border-4 border-[#FFF5F7] shadow-sm"
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <InlineEditableText
              tagName="span"
              value={buttonText}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val })}
              readonly={!onUpdateSectionOptions}
            />
          </a>
        </div>
      </div>
    </section>
  );
};
