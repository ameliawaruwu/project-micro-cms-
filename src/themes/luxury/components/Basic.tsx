import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const LuxuryNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <nav className="w-full px-8 md:px-16 py-8 flex justify-between items-center bg-[#fcfbf9] border-b border-[#92400E]/10 sticky top-0 z-50 transition-all duration-300">
      <div className="w-1/3 flex justify-start">
        {showNav && (
          <div className="hidden md:flex gap-10">
            {navigation.map(nav => (
              <a key={nav.id} href={nav.route} className="text-[10px] uppercase tracking-[0.25em] text-[#555] hover:text-[#92400E] transition-colors duration-300">
                {nav.label}
              </a>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-1/3 flex justify-center">
        {showLogo && (
          <a href="/" className="text-3xl md:text-4xl font-serif text-[#92400E] tracking-tight">
            {storeInfo.name}
          </a>
        )}
      </div>

      <div className="w-1/3 flex justify-end">
        <button className="text-[10px] uppercase tracking-[0.25em] text-[#92400E] hover:text-[#555] transition-colors duration-300">
          Boutique
        </button>
      </div>
    </nav>
  );
};

export const LuxuryHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80";
  const heading = sectionOptions.heading || "Elegansi Klasik";
  const announcementText = sectionOptions.announcementText || "Collection Privée";
  const buttonLabel = sectionOptions.buttonLabel || "Discover";

  return (
    <section className="relative w-full h-[90vh] bg-[#fcfbf9] px-4 md:px-12 pb-12 pt-4">
      <div className="w-full h-full relative overflow-hidden group">
        <img 
          src={bgImage} 
          alt="Luxury Collection" 
          className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[20s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-[#1a1a1a]/20 to-transparent"></div>
        <div className="absolute bottom-16 left-8 md:left-16 text-white max-w-2xl">
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] mb-6 text-[#D4AF37] opacity-90">
            {announcementText}
          </p>
          <h1 className="text-5xl md:text-7xl font-serif mb-10 leading-tight drop-shadow-md">
            {heading}
          </h1>
          <button className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] border-b border-[#D4AF37] pb-2 text-white hover:text-[#D4AF37] transition-colors duration-500">
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
};

export const LuxuryFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name}. All rights reserved.`;

  return (
    <footer className="w-full px-8 md:px-16 py-32 bg-[#121212] text-white flex flex-col items-center border-t border-[#D4AF37]/20">
      <a href="/" className="text-4xl font-serif mb-16 text-[#D4AF37] tracking-wider hover:opacity-80 transition-opacity">
        {storeInfo.name}
      </a>
      
      <div className="flex flex-col md:flex-row gap-12 md:gap-24 text-[10px] uppercase tracking-[0.3em] mb-20 opacity-80 text-center">
        <a href="#" className="hover:text-[#D4AF37] transition-colors">Boutiques</a>
        <a href="#" className="hover:text-[#D4AF37] transition-colors">Client Services</a>
        <a href="#" className="hover:text-[#D4AF37] transition-colors">Contact</a>
        <a href="#" className="hover:text-[#D4AF37] transition-colors">Legal Mentions</a>
      </div>
      
      <div className="w-12 h-[1px] bg-[#D4AF37]/30 mb-12"></div>
      
      <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 text-center">
        {copyrightText}
      </p>
    </footer>
  );
};
