import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { CuteProductCard } from './ProductCard';

export const CuteFeaturedProducts: React.FC = () => {
  const allProducts = useCmsStore(state => state.products);
  const products = allProducts.filter(p => p.isFeatured).slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="w-full py-20 px-6 font-['Outfit',sans-serif] bg-white relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFF5F7] rounded-full -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-[#FFD1DC] text-[#FF85A1] font-bold rounded-full mb-4 rotate-2">
            Paling Disukai 💖
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">
            Produk Favorit
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <CuteProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a 
            href="/produk" 
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FF85A1] text-white text-lg font-black hover:bg-[#FF6B8B] hover:scale-105 transition-all duration-300 rounded-full border-4 border-[#FFF5F7] shadow-sm"
          >
            Lihat Lebih Banyak 🌸
          </a>
        </div>
      </div>
    </section>
  );
};
