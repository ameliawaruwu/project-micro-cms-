import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { FuturisticProductCard } from './ProductCard';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';

export const FuturisticFeaturedProducts: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey }) => {
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

  const limit = sectionOptions.productCount || 4;
  const products = filteredProducts.slice(0, limit);

  const title = sectionOptions.featuredTitle || sectionOptions.heading || "Produk Pilihan";
  const subtitle = sectionOptions.featuredSubtitle || sectionOptions.subheading || "Katalog Inti";
  const buttonText = sectionOptions.buttonLabel || sectionOptions.buttonText || "LIHAT SEMUA DATA";

  const gridColsClass = 
    sectionOptions.gridColumns === 2 ? 'grid-cols-2 md:grid-cols-2' :
    sectionOptions.gridColumns === 3 ? 'grid-cols-2 md:grid-cols-3' :
    sectionOptions.gridColumns === 5 ? 'grid-cols-2 md:grid-cols-5' :
    sectionOptions.gridColumns === 6 ? 'grid-cols-2 md:grid-cols-6' :
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  if (products.length === 0) return null;

  return (
    <section className="w-full py-24 px-6 md:px-12 font-['Space_Grotesk',sans-serif] bg-gray-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-red-600"></div>
              <span className="text-[10px] text-red-600 tracking-[0.3em] uppercase font-bold">
                <InlineEditableText
                  tagName="span"
                  value={subtitle}
                  onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
                  readonly={!onUpdateSectionOptions}
                />
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tighter drop-shadow-sm">
              <InlineEditableText
                tagName="span"
                value={title}
                onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
                readonly={!onUpdateSectionOptions}
              />
            </h2>
          </div>
          
          <a 
            href="/produk"
            className="group flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <InlineEditableText
              tagName="span"
              value={buttonText}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val })}
              readonly={!onUpdateSectionOptions}
            />
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        <div className={`grid ${gridColsClass} gap-6`}>
          {products.map(product => (
            <FuturisticProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
