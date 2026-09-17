import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { MinimalistProductCard } from './ProductCard';

export const MinimalistFeaturedProducts: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const allProducts = useCmsStore(state => state.products);
  
  const title = sectionOptions.featuredTitle || "Featured Objects";
  const subtitle = sectionOptions.featuredSubtitle || "A selection of our finest pieces, crafted with purpose.";
  const maxItems = sectionOptions.productCount || 2;
  const gridColumns = sectionOptions.gridColumns || 2;
  
  const products = allProducts.filter(p => p.isFeatured).slice(0, maxItems);

  if (products.length === 0) return null;

  return (
    <section className="w-full py-32 px-6 md:px-12 font-sans bg-[#f5f5f5]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-light text-gray-900 tracking-tight mb-4">
              {title}
            </h2>
            <p className="text-gray-500 font-light leading-relaxed">
              {subtitle}
            </p>
          </div>
          <a 
            href="/produk"
            className="inline-flex items-center text-sm font-medium uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors"
          >
            Explore All <span className="ml-2">→</span>
          </a>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-${gridColumns} gap-12`}>
          {products.map(product => (
            <div key={product.id} className="transform hover:-translate-y-2 transition-transform duration-500">
              <MinimalistProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
