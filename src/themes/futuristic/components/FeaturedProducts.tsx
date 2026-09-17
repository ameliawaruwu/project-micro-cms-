import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { FuturisticProductCard } from './ProductCard';

export const FuturisticFeaturedProducts: React.FC = () => {
  const allProducts = useCmsStore(state => state.products);
  const products = allProducts.filter(p => p.isFeatured).slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="w-full py-24 px-6 md:px-12 font-['Space_Grotesk',sans-serif] bg-gray-50 relative overflow-hidden">
      {/* Abstract neon glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-red-600"></div>
              <span className="text-[10px] text-red-600 tracking-[0.3em] uppercase font-bold">Katalog Inti</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tighter drop-shadow-sm">
              Produk Pilihan
            </h2>
          </div>
          
          <a 
            href="/produk"
            className="group flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
          >
            LIHAT SEMUA DATA
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <FuturisticProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
