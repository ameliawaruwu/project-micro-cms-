import React, { useState } from 'react';
import { useCmsStore, cmsProductToProduct } from '../../../cms/useCmsStore';
import { THEME_DATA_MAP } from '../../themeData';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';
import { Search, ShoppingBag } from 'lucide-react';
import { cartService } from '../../../services/cartService';

interface EditorialProductGridProps {
  sectionOptions?: any;
  onUpdateSectionOptions?: (key: string, options: any) => void;
  sectionKey?: string;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
  readonly?: boolean;
}

export const EditorialProductGrid: React.FC<EditorialProductGridProps> = ({
  sectionOptions = {},
  onUpdateSectionOptions,
  sectionKey,
  deviceMode = 'desktop',
  readonly = false,
}) => {
  const cmsProducts = useCmsStore((state) => state.products);
  const fallbackProducts = THEME_DATA_MAP['editorial']?.products || [];
  const rawProducts = cmsProducts && cmsProducts.length > 0 ? cmsProducts : fallbackProducts;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Options
  const heading = sectionOptions.heading || 'The Catalogue';
  const subheading = sectionOptions.subheading || 'Curated Collection';
  const productCount = sectionOptions.productCount || 12;
  const gridColumns = sectionOptions.gridColumns || 3;
  const showPrice = sectionOptions.showPrice !== false;
  const showCategoryTabs = sectionOptions.showCategoryTabs !== false;
  const showSearchBar = sectionOptions.showSearchBar !== false;

  // Filter & sort
  let filtered = [...rawProducts];

  // Specific selected products filter
  if (sectionOptions.selectedProductIds && sectionOptions.selectedProductIds.length > 0) {
    filtered = filtered.filter((p) => sectionOptions.selectedProductIds.includes(p.id));
  }

  // Selected Category filter
  if (sectionOptions.selectedCategoryId && sectionOptions.selectedCategoryId !== 'all') {
    filtered = filtered.filter(
      (p) => ((p as any).category || p.categoryName || (p as any).categoryId) === sectionOptions.selectedCategoryId
    );
  }

  // Categories list
  const categories = [
    'Semua',
    ...Array.from(new Set(rawProducts.map((p: any) => p.category || p.categoryName).filter(Boolean))),
  ];

  if (selectedCategory !== 'Semua') {
    filtered = filtered.filter(
      (p: any) => (p.category || p.categoryName) === selectedCategory
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sectionOptions.sortOrder === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sectionOptions.sortOrder === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sectionOptions.sortOrder === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const displayList = filtered.slice(0, productCount);

  const isMobile = deviceMode === 'mobile';

  const gridColsClass = isMobile
    ? sectionOptions.mobileColumns === 1
      ? 'grid-cols-1 gap-6'
      : 'grid-cols-2 gap-4'
    : gridColumns === 2
    ? 'grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10'
    : gridColumns === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10';

  const handleUpdateField = (field: string, val: any) => {
    if (onUpdateSectionOptions && sectionKey) {
      onUpdateSectionOptions(sectionKey, { [field]: val });
    }
  };

  return (
    <section className="w-full py-16 md:py-24 px-6 md:px-12 bg-[#FAF7F7] text-[#241A1A] font-serif transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-2">
            <InlineEditableText
              tagName="span"
              value={subheading}
              onSave={(val) => handleUpdateField('subheading', val)}
              className="text-xs uppercase tracking-[0.3em] text-[#706866] block font-serif cursor-text"
              readonly={readonly}
            />
          </div>
          <InlineEditableText
            tagName="h2"
            value={heading}
            onSave={(val) => handleUpdateField('heading', val)}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal font-serif tracking-wide text-[#241A1A] cursor-text storefront-heading-hero"
            readonly={readonly}
          />
          <div className="w-16 h-px bg-[#241A1A]/30 mx-auto mt-6"></div>
        </div>

        {/* Filter & Search Bar */}
        {(showCategoryTabs || showSearchBar) && (
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 md:mb-16 border-b border-t border-[#241A1A]/10 py-5">
            {showCategoryTabs && (
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs md:text-sm tracking-[0.2em] uppercase font-serif transition-all duration-200 cursor-pointer ${
                      selectedCategory === cat
                        ? 'text-[#241A1A] border-b border-[#241A1A] pb-1 font-semibold'
                        : 'text-[#706866] hover:text-[#241A1A]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {showSearchBar && (
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-[#706866] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-[#241A1A]/30 py-2 pr-6 text-xs md:text-sm font-serif italic text-[#241A1A] focus:outline-none focus:border-[#241A1A] placeholder:text-[#706866]/60"
                />
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {displayList.length === 0 ? (
          <div className="py-20 text-center text-sm italic text-[#706866] font-serif">
            Tidak ada produk yang sesuai dengan kriteria kurasi ini.
          </div>
        ) : (
          <div className={`grid ${gridColsClass}`}>
            {displayList.map((product) => {
              const pImage = (product as any).imageUrl || product.image || 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=800&q=80';
              const pPrice = product.price || 0;
              const pCategory = (product as any).category || product.categoryName;

              return (
                <div key={product.id} className="group flex flex-col cursor-pointer">
                  {/* Image container */}
                  <div className="aspect-[3/4] min-h-[220px] sm:min-h-[260px] bg-white overflow-hidden mb-4 sm:mb-5 relative shadow-xs">
                    <img
                      src={pImage}
                      alt={product.name}
                      className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                    {product.isFeatured && (
                      <span className="absolute top-3 left-3 bg-[#241A1A] text-white text-[9px] uppercase tracking-widest px-2.5 py-1 font-sans">
                        Editorial Pick
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  {pCategory && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#706866] mb-1 font-sans">
                      {pCategory}
                    </span>
                  )}
                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-normal leading-snug mb-1 sm:mb-1.5 text-[#241A1A] group-hover:text-[#706866] transition-colors storefront-card-title">
                    {product.name}
                  </h3>
                  {showPrice && (
                    <p className="font-serif italic text-xs sm:text-sm md:text-base text-[#706866] mb-3 storefront-card-price">
                      Rp {pPrice.toLocaleString('id-ID')}
                    </p>
                  )}

                  {/* Editorial Minimal Add to Cart / Detail */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const pObj = cmsProductToProduct(product as any);
                      cartService.addToCart('editorial', pObj, 1);
                    }}
                    className="mt-auto py-2.5 px-4 border border-[#241A1A] text-[#241A1A] text-[10px] uppercase tracking-[0.2em] font-sans hover:bg-[#241A1A] hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Beli Sekarang</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
