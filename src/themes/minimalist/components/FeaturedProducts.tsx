import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { MinimalistProductCard } from './ProductCard';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';

export const MinimalistFeaturedProducts: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey }) => {
  const allProducts = useCmsStore(state => state.products);
  
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

  const maxItems = sectionOptions.productCount || 4;
  const products = filteredProducts.slice(0, maxItems);

  const title = sectionOptions.featuredTitle || sectionOptions.heading || "Featured Objects";
  const subtitle = sectionOptions.featuredSubtitle || sectionOptions.subheading || "A selection of our finest pieces, crafted with purpose.";
  const buttonText = sectionOptions.buttonLabel || sectionOptions.buttonText || "Explore All";

  const gridColsClass = 
    sectionOptions.gridColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    sectionOptions.gridColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' :
    sectionOptions.gridColumns === 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' :
    'grid-cols-1 sm:grid-cols-2';

  if (products.length === 0) return null;

  return (
    <section className="w-full max-w-full py-10 sm:py-16 md:py-28 px-3.5 sm:px-6 md:px-12 font-sans bg-[#f5f5f5] box-border overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-14 gap-4 sm:gap-8">
          <div className="max-w-lg">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900 tracking-tight mb-2 sm:mb-3">
              <InlineEditableText
                tagName="span"
                value={title}
                onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
                readonly={!onUpdateSectionOptions}
              />
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
              <InlineEditableText
                tagName="span"
                value={subtitle}
                onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
                readonly={!onUpdateSectionOptions}
              />
            </p>
          </div>
          <a 
            href="/produk"
            className="inline-flex items-center text-xs sm:text-sm font-medium uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors shrink-0"
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <InlineEditableText
              tagName="span"
              value={buttonText}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val })}
              readonly={!onUpdateSectionOptions}
            /> <span className="ml-1.5">→</span>
          </a>
        </div>

        <div className={`grid ${gridColsClass} gap-6 sm:gap-8 md:gap-12`}>
          {products.map(product => (
            <div key={product.id} className="transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-transform duration-300">
              <MinimalistProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
