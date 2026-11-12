import React from 'react';
import { ModernProductCard } from './ProductCard';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES } from '../../storefrontLinks';

export const ModernFeaturedProducts: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string; accentColor?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey, accentColor = '#2563EB', isMobile, isTablet }) => {
  const allProducts = useThemeProductsSource('modern');

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

  const title = sectionOptions.featuredTitle || sectionOptions.heading || "Produk Pilihan";
  const subtitle = sectionOptions.featuredSubtitle || sectionOptions.subheading || "Terlaris minggu ini";
  const buttonText = sectionOptions.buttonLabel || sectionOptions.buttonText || "Lihat Semua";

  const desiredCols = sectionOptions.gridColumns && [2, 3, 4, 5, 6].includes(sectionOptions.gridColumns)
    ? sectionOptions.gridColumns
    : 4;

  const desktopColsMap: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-4',
    6: 'grid-cols-4',
  };

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: desktopColsMap[desiredCols],
    fallback:
      desiredCols === 2 ? 'grid-cols-2' :
      desiredCols === 3 ? 'grid-cols-2 md:grid-cols-3' :
      desiredCols === 5 ? 'grid-cols-2 md:grid-cols-5' :
      desiredCols === 6 ? 'grid-cols-2 md:grid-cols-6' :
      'grid-cols-2 md:grid-cols-4',
  });

  if (products.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-20 px-4 md:px-8 font-['Outfit',sans-serif] bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold mb-1.5" style={{ color: accentColor }}>
              <InlineEditableText
                tagName="span"
                value={subtitle}
                onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
                readonly={!onUpdateSectionOptions}
              />
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 break-words">
              <InlineEditableText
                tagName="span"
                value={title}
                onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
                readonly={!onUpdateSectionOptions}
              />
            </h2>
          </div>

          <a
            href={STORE_ROUTES.catalog}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 transition-colors w-fit"
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <InlineEditableText
              tagName="span"
              value={buttonText}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val })}
              readonly={!onUpdateSectionOptions}
            />
            <span>→</span>
          </a>
        </div>

        <div className={`grid ${gridColsClass} gap-4 md:gap-6`}>
          {products.map(product => (
            <ModernProductCard key={product.id} product={product} accentColor={accentColor} />
          ))}
        </div>
      </div>
    </section>
  );
};
