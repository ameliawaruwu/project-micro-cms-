import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const ElegantHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const bgImage = sectionOptions?.imageUrl || sectionOptions?.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80";

  return (
    <section className="relative w-full min-h-screen flex font-['Cormorant_Garamond',serif] bg-[#FAF9F6]">
      {/* Editorial Layout: Image left/center, text offset */}
      <div className="absolute inset-0 md:left-[10%] md:right-[10%] top-0 md:top-12 md:bottom-12 overflow-hidden shadow-2xl">
        <img 
          src={bgImage} 
          alt="Elegant Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 md:bg-black/10"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-end md:items-center px-6 md:px-16 pb-20 md:pb-0 pt-[40vh] md:pt-0">
        <div className="bg-[#FAF9F6] p-8 md:p-16 max-w-xl md:ml-auto md:-mr-12 shadow-xl">
          <span className="block text-[#6B6865] text-[10px] tracking-[0.3em] uppercase font-sans mb-6">
            Maison de Couture
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#2C2A29] leading-[1.1] mb-8 italic">
            {storeInfo.name}
          </h1>
          <p className="text-lg text-[#6B6865] mb-12 max-w-md leading-relaxed">
            {storeInfo.description}
          </p>
          <a 
            href="/produk" 
            className="group inline-flex items-center gap-4 text-[#2C2A29] font-sans text-xs uppercase tracking-[0.2em] pb-2 border-b border-[#2C2A29]/30 hover:border-[#2C2A29] transition-colors"
          >
            Discover Collection
            <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
