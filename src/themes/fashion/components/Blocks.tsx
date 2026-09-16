import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const FashionLookbook: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "The Lookbook";
  
  return (
    <section className="py-24 md:py-32 bg-white text-[#18181B]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">Volume 01</p>
          <h2 className="text-4xl md:text-5xl font-serif italic">{heading}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
          <div className="md:col-span-7">
            <div className="relative group overflow-hidden h-[60vh] md:h-[80vh]">
              <img src="https://images.unsplash.com/photo-1550614000-4b95d415d183?w=1200&q=80" alt="Lookbook 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-xs uppercase tracking-widest mb-2">Look 01</p>
                <a href="#" className="text-sm border-b border-white pb-1">Shop The Look</a>
              </div>
            </div>
          </div>
          <div className="md:col-span-5 flex flex-col gap-4 md:gap-8">
            <div className="relative group overflow-hidden h-[30vh] md:h-[40vh]">
              <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80" alt="Lookbook 2" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-xs uppercase tracking-widest mb-2">Look 02</p>
                <a href="#" className="text-sm border-b border-white pb-1">Shop The Look</a>
              </div>
            </div>
            <div className="relative group overflow-hidden h-[30vh] md:h-[40vh] bg-gray-100 p-8 flex flex-col justify-center items-center text-center">
               <h3 className="text-3xl font-serif italic mb-6 text-gray-900">Modern Elegance</h3>
               <p className="text-sm text-gray-600 leading-relaxed mb-8 max-w-xs">
                 Embrace the new season with textures and silhouettes designed for the contemporary lifestyle.
               </p>
               <button className="text-[10px] uppercase tracking-[0.2em] font-medium border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
                 View Full Gallery
               </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FashionFeaturedProducts: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const heading = sectionOptions.heading || "Trending Now";

  return (
    <section className="py-24 md:py-32 bg-[#F9F9F9] text-[#18181B]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-4xl font-serif italic">{heading}</h2>
          <a href="#" className="text-[10px] uppercase tracking-[0.2em] border-b border-black pb-1 hidden md:block hover:text-gray-500 transition-colors">
            Shop All Arrivals
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
          {products.slice(0, 4).map((p, i) => (
            <div key={p.id} className={`group cursor-pointer ${i % 2 !== 0 ? 'md:mt-16' : ''}`}>
              <div className="relative overflow-hidden mb-6 aspect-[3/4]">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500"></div>
                <button className="absolute bottom-0 left-0 w-full bg-white text-black text-[10px] uppercase tracking-[0.2em] py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium">
                  Quick Add
                </button>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium mb-2 group-hover:text-gray-500 transition-colors">{p.name}</h3>
                <p className="text-xs text-gray-500 tracking-widest">Rp {p.price.toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const FashionPromoBanner: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "End of Season Sale";
  const desc = sectionOptions.description || "Up to 50% off selected styles.";
  
  return (
    <section className="w-full h-[60vh] relative flex items-center justify-center bg-[#18181B] text-white">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80" alt="Sale" className="w-full h-full object-cover opacity-40 grayscale" />
      </div>
      <div className="relative z-10 text-center p-8 bg-black/40 backdrop-blur-sm border border-white/20">
        <h2 className="text-5xl md:text-7xl font-serif italic mb-6">{heading}</h2>
        <p className="text-sm md:text-base uppercase tracking-[0.3em] mb-10 text-gray-300">
          {desc}
        </p>
        <button className="px-12 py-4 bg-white text-black text-[10px] uppercase tracking-[0.2em] hover:bg-transparent hover:text-white hover:border-white border border-transparent transition-all duration-300">
          Shop The Sale
        </button>
      </div>
    </section>
  );
};
