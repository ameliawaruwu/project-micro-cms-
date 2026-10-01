import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { NatureProductCard } from './ProductCard';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';

export const NatureFeaturedProducts: React.FC<{ 
  sectionOptions?: any; 
  onUpdateSectionOptions?: any; 
  sectionKey?: string;
  readonly?: boolean;
}> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey, readonly = false }) => {
  const allProducts = useCmsStore(state => state.products);
  
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

  const title = sectionOptions.featuredTitle || sectionOptions.heading || "Panen Segar Pilihan";
  const subtitle = sectionOptions.featuredSubtitle || sectionOptions.subheading || "100% Organik & Dipetik Langsung dari Kebun";
  const buttonText = sectionOptions.buttonLabel || sectionOptions.buttonText || "Lihat Semua Produk 🌿";

  const gridColsClass = 
    sectionOptions.gridColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    sectionOptions.gridColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
    sectionOptions.gridColumns === 5 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' :
    sectionOptions.gridColumns === 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6' :
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  if (products.length === 0) return null;

  return (
    <section className="w-full py-20 px-6 font-serif bg-[#FBF9F5] relative overflow-hidden border-b border-[#E8E4DB]/60">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          {sectionOptions.imageUrl && (
            <img 
              src={sectionOptions.imageUrl} 
              alt="Featured Products Banner" 
              className="w-full h-48 md:h-64 object-cover rounded-2xl mb-8 border border-[#E8E4DB] shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80';
              }}
            />
          )}
          <div className="inline-block px-3.5 py-1 bg-[#E8F5E9] text-[#166534] border border-[#C8E6C9] font-sans text-xs font-semibold rounded-full mb-3 tracking-wide">
            <InlineEditableText
              tagName="span"
              value={subtitle}
              readonly={readonly}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { featuredSubtitle: val })}
            />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2C3B2D] tracking-tight">
            <InlineEditableText
              tagName="span"
              value={title}
              readonly={readonly}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { featuredTitle: val })}
            />
          </h2>
        </div>

        {/* Product Grid */}
        <div className={`grid ${gridColsClass} gap-4 sm:gap-6`}>
          {products.map((product) => (
            <NatureProductCard key={product.id} product={product} options={sectionOptions} readonly={readonly} />
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-14 text-center">
          <a
            href="/produk"
            className="inline-flex items-center justify-center px-8 py-3 bg-[#2C3B2D] hover:bg-[#1E2A1F] text-[#F9F6F0] font-sans text-sm font-medium rounded-full hover:shadow-md transition-all duration-300"
          >
            <InlineEditableText
              tagName="span"
              value={buttonText}
              readonly={readonly}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val })}
            />
          </a>
        </div>
      </div>
    </section>
  );
};
