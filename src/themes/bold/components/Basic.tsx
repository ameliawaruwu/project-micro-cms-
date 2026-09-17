import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const BoldNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <nav className="w-full px-6 py-3 flex flex-col md:flex-row justify-between items-center bg-black text-white border-b-4 border-[#DC2626] sticky top-0 z-50">
      <div className="w-full md:w-1/3 flex justify-center md:justify-start items-center">
        {showLogo && (
          <a href="/" className="flex items-center gap-2 font-black italic tracking-tighter uppercase text-2xl md:text-3xl text-white hover:text-[#DC2626] transition-colors">
            <span className="px-2 py-0.5 bg-[#DC2626] text-white text-sm not-italic rounded-sm">RAW</span>
            <span>{storeInfo.name || 'RAWSTATE'}</span>
          </a>
        )}
      </div>
      
      {showNav && (
        <div className="w-full md:w-2/3 flex flex-wrap justify-center md:justify-end items-center gap-6 font-black uppercase tracking-widest text-xs md:text-sm">
          {navigation.map(nav => (
            <a key={nav.id} href={nav.route} className="text-gray-300 hover:text-white hover:underline underline-offset-4 transition-colors">
              {nav.label}
            </a>
          ))}
          <button className="bg-[#DC2626] text-white px-4 py-2 text-xs font-black uppercase border-2 border-black hover:bg-white hover:text-black transition-all shadow-[3px_3px_0_0_#000]">
            CART [0]
          </button>
        </div>
      )}
    </nav>
  );
};

export const BoldHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const heading = sectionOptions.heading || "LOUD & CLEAR";
  const subheading = sectionOptions.subheading || "The New Standard in Streetwear";
  const buttonLabel = sectionOptions.buttonLabel || "Shop Now";
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80";

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center bg-black text-white overflow-hidden border-b-8 border-[#DC2626]">
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt="Bold Market" 
          className="w-full h-full object-cover opacity-50 filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
      </div>
      
      <div className="z-10 text-center relative w-full px-6 max-w-6xl mx-auto flex flex-col items-center justify-center flex-grow py-20">
        <span className="px-4 py-1.5 bg-[#DC2626] text-white font-black text-xs uppercase tracking-[0.3em] mb-6 rounded-sm border border-black shadow-[3px_3px_0_0_#000]">
          STREETWEAR COLLECTION 2026
        </span>

        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black italic tracking-tighter uppercase text-white drop-shadow-[4px_4px_0_#DC2626] leading-none mb-6 text-center max-w-full">
          {heading}
        </h1>
        
        <p className="text-base sm:text-2xl font-black uppercase tracking-widest mb-10 bg-white text-black px-6 py-2.5 rounded-sm border-2 border-black shadow-[4px_4px_0_0_#DC2626]">
          {subheading}
        </p>
        
        <button className="px-10 sm:px-14 py-4 sm:py-5 bg-[#DC2626] text-white font-black uppercase tracking-widest text-lg sm:text-xl border-4 border-black hover:bg-white hover:text-black transition-all shadow-[6px_6px_0_0_#000] cursor-pointer">
          {buttonLabel} →
        </button>
      </div>
      
      <div className="w-full overflow-hidden bg-black text-[#DC2626] py-2.5 z-20 whitespace-nowrap border-t-4 border-b-4 border-[#DC2626]">
        <div className="animate-marquee font-black uppercase tracking-widest text-sm sm:text-base">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-6">🔥 {heading} — LIMITED DROP 2026 </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BoldFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name} WORLDWIDE`;

  return (
    <footer className="w-full px-8 py-16 bg-black text-white text-center border-t-8 border-[#DC2626] relative overflow-hidden">
      <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 text-white">
        {storeInfo.name || 'RAWSTATE'}
      </h2>
      <div className="flex flex-wrap justify-center gap-6 font-black uppercase tracking-widest text-sm text-[#DC2626] mb-8">
        <a href="#" className="hover:text-white transition-colors">Instagram</a>
        <a href="#" className="hover:text-white transition-colors">Twitter</a>
        <a href="#" className="hover:text-white transition-colors">TikTok</a>
      </div>
      <p className="font-bold uppercase tracking-widest text-xs text-gray-500">{copyrightText}</p>
    </footer>
  );
};
