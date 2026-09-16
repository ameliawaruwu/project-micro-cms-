import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { MinimalistProductCard } from './ProductCard';

export const MinimalistCollectionGrid: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const title = sectionOptions.heading || "Curated Collection";
  const columns = sectionOptions.gridColumns || 3;

  return (
    <section className="py-24 px-6 max-w-[1400px] mx-auto bg-white">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
        <div>
          <h2 className="text-3xl font-light text-gray-900 tracking-tight">{title}</h2>
        </div>
        <a href="#all" className="text-sm font-medium tracking-wide uppercase text-gray-900 hover:text-gray-500 transition-colors group">
          View All Objects
          <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-[1px] bg-gray-900 mt-1"></span>
        </a>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-x-8 gap-y-16`}>
        {products.map((product) => (
          <MinimalistProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
