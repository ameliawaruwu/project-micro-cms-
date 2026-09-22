import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { MinimalistProductCard } from './ProductCard';

export const MinimalistCollectionGrid: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const title = sectionOptions.heading || "Curated Collection";
  const columns = sectionOptions.gridColumns || 3;

  return (
    <section className="w-full max-w-full py-10 sm:py-16 md:py-24 px-3.5 sm:px-6 max-w-[1400px] mx-auto bg-white box-border overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-14 gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900 tracking-tight">{title}</h2>
        </div>
        <a href="#all" className="text-xs sm:text-sm font-medium tracking-wide uppercase text-gray-900 hover:text-gray-500 transition-colors group">
          View All Objects
          <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-[1px] bg-gray-900 mt-1"></span>
        </a>
      </div>
      
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-8 sm:gap-y-12`}>
        {products.map((product) => (
          <MinimalistProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
