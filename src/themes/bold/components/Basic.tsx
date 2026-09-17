import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const BoldNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <nav className="w-full px-6 py-4 flex flex-col md:flex-row justify-between items-center bg-[#DC2626] text-white border-b-8 border-black sticky top-0 z-50">
      <div className="w-full md:w-1/3 flex justify-center md:justify-start">
        {showLogo && (
          <a href="/" className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 md:mb-0 hover:scale-105 transition-transform origin-left">
            {storeInfo.name}
          </a>
        )}
      </div>
      
      {showNav && (
        <div className="w-full md:w-2/3 flex flex-wrap justify-center md:justify-end gap-6 font-bold uppercase tracking-widest text-sm md:text-base">
          {navigation.map(nav => (
            <a key={nav.id} href={nav.route} className="hover:text-black hover:bg-white px-2 py-1 transition-colors">
              {nav.label}
            </a>
          ))}
          <button className="text-black bg-white px-4 py-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent">
            CART [0]
          </button>
        </div>
      )}
    </nav>
  );
};

export const BoldHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "LOUD & CLEAR";
  const subheading = sectionOptions.subheading || "The New Standard in Streetwear";
  const buttonLabel = sectionOptions.buttonLabel || "Shop Now";
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80";

  // Split heading by space to style parts differently if there are multiple words
  const headingParts = heading.split(' ');
  const firstWord = headingParts[0] || "LOUD";
  const restWords = headingParts.slice(1).join(' ') || "& CLEAR";

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center bg-black text-white overflow-hidden border-b-[16px] border-[#DC2626]">
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt="Bold Market" 
          className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 animate-[pulse_10s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-[#DC2626]/20 mix-blend-color"></div>
      </div>
      
      <div className="z-10 text-center relative w-full px-4 flex flex-col items-center justify-center flex-grow">
        <div className="text-[120px] md:text-[200px] font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent absolute inset-0 -top-20 flex justify-center items-center scale-150 blur-[2px] select-none pointer-events-none">
          {firstWord}
        </div>
        
        <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black italic tracking-tighter mb-6 uppercase relative z-10 text-[#DC2626] drop-shadow-[6px_6px_0_white] md:drop-shadow-[10px_10px_0_white] leading-none text-center px-4 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {heading}
        </h1>
        
        <p className="text-xl md:text-3xl font-black uppercase tracking-widest mb-12 relative z-10 bg-white text-black inline-block px-6 py-3 transform -skew-x-12 border-4 border-black">
          <span className="transform skew-x-12 inline-block">{subheading}</span>
        </p>
        
        <button className="relative z-10 px-16 py-6 bg-[#DC2626] text-white font-black uppercase tracking-widest text-2xl border-[6px] border-black hover:bg-white hover:text-black hover:scale-110 transition-all shadow-[12px_12px_0_0_#000]">
          {buttonLabel}
        </button>
      </div>
      
      <div className="absolute bottom-0 w-full overflow-hidden bg-[#DC2626] py-3 z-20 whitespace-nowrap border-t-[6px] border-black">
        <div className="animate-marquee font-black uppercase tracking-widest text-black text-2xl">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-4">{heading} — </span>
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
    <footer className="w-full px-8 py-24 bg-black text-white text-center border-t-[16px] border-[#DC2626] relative overflow-hidden">
      <div className="absolute -left-20 -top-20 text-[250px] font-black italic text-white/5 pointer-events-none select-none">
        {storeInfo.name}
      </div>
      <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-12 relative z-10 text-white drop-shadow-[4px_4px_0_#DC2626]">
        {storeInfo.name}
      </h2>
      <div className="flex flex-wrap justify-center gap-6 md:gap-12 font-black uppercase tracking-widest text-lg md:text-2xl text-[#DC2626] mb-20 relative z-10">
        <a href="#" className="hover:text-white hover:bg-[#DC2626] px-4 py-2 transition-colors">Instagram</a>
        <a href="#" className="hover:text-white hover:bg-[#DC2626] px-4 py-2 transition-colors">Twitter</a>
        <a href="#" className="hover:text-white hover:bg-[#DC2626] px-4 py-2 transition-colors">TikTok</a>
      </div>
      <p className="font-bold uppercase tracking-widest text-xl opacity-50 relative z-10">{copyrightText}</p>
    </footer>
  );
};
