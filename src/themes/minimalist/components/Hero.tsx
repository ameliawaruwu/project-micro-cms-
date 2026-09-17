import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const MinimalistHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  
  const heading = sectionOptions.heading || storeInfo.name;
  const subheading = sectionOptions.subheading || storeInfo.description;
  const buttonLabel = sectionOptions.buttonLabel || 'View Collection';
  const buttonLink = sectionOptions.buttonLink || '/products';
  // Use imageUrl/bannerUrl from options if available, else a minimalist default
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80";

  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[85vh] py-12 md:py-0 flex items-center justify-center overflow-hidden bg-[#fafafa]">
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt="Hero background" 
          className="w-full h-full object-cover opacity-90 scale-105 animate-[kenburns_20s_ease-out_forwards]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 max-w-5xl mx-auto flex flex-col items-start justify-center">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-md p-6 sm:p-10 md:p-16 shadow-sm border border-white/40 transform transition-all duration-700 translate-y-0 opacity-100 rounded-xl md:rounded-none">
          <span className="inline-block text-[11px] sm:text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-gray-500 mb-3 sm:mb-4">
            Curated Essentials
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight leading-[1.1] mb-4 sm:mb-6">
            {heading}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-10 font-light leading-relaxed">
            {subheading}
          </p>
          <a 
            href={buttonLink} 
            className="group inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-gray-900 text-white text-xs sm:text-sm tracking-wide uppercase hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto min-w-[160px] text-center"
          >
            <span className="relative overflow-hidden">
              <span className="block transition-transform duration-300 group-hover:-translate-y-full">{buttonLabel}</span>
              <span className="absolute inset-0 block transition-transform duration-300 translate-y-full group-hover:translate-y-0">{buttonLabel}</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};
