import React from 'react';
import { HeroSettings, ThemeSettings } from '../schema';
import { Link } from 'react-router-dom';

interface Props {
  settings: HeroSettings;
  themeSettings: ThemeSettings;
  themeId?: string;
}

export const HeroSection: React.FC<Props> = ({ settings, themeSettings, themeId }) => {
  // --- 1. COMPACT / MODERN CATALOG THEME ---
  if (themeId && themeId.includes('compact')) {
    return (
      <section className="w-full bg-gradient-to-br from-[#0055FF] via-blue-600 to-indigo-900 text-white py-12 sm:py-16 lg:py-24 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden group box-border">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.4)_1px,_transparent_1px)] bg-[length:24px_24px] group-hover:scale-105 transition-transform duration-[2s]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between relative z-10 gap-8 sm:gap-10">
           <div className="md:w-3/5 text-center md:text-left min-w-0">
             <span className="inline-block px-3.5 py-1 sm:px-4 sm:py-1.5 bg-yellow-400/90 backdrop-blur text-yellow-900 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-4 sm:mb-6 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] border border-yellow-300">
               PENAWARAN TERBATAS
             </span>
             <h1 className="text-2xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[1.1] mb-4 sm:mb-6 drop-shadow-md break-words">
               {settings.heading}
             </h1>
             <p className="text-blue-100/90 text-sm sm:text-lg md:text-xl font-medium max-w-lg mx-auto md:mx-0 leading-relaxed break-words">
               {settings.subheading}
             </p>
           </div>
           <div className="md:w-2/5 flex justify-center md:justify-end w-full sm:w-auto">
             <Link to={settings.ctaLink} className="relative overflow-hidden group/btn px-6 sm:px-10 py-3.5 sm:py-5 bg-white text-[#0055FF] text-xs sm:text-sm font-black uppercase tracking-[0.15em] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 text-center w-full sm:w-auto">
               <span className="relative z-10 group-hover/btn:text-black transition-colors duration-300">{settings.ctaText}</span>
               <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
             </Link>
           </div>
        </div>
      </section>
    );
  }

  // --- 2. EDITORIAL / STORYTELLING THEME ---
  if (themeId && themeId.includes('editorial')) {
    const bgImage = settings.imageUrl || (settings as any).bannerUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80";
    return (
      <section className="relative w-full min-h-[500px] md:min-h-[600px] lg:h-[90vh] flex items-center justify-center overflow-hidden bg-[#1a1515] group box-border">
        <div className="absolute inset-0 z-0">
          <img src={bgImage} alt={settings.heading} className="w-full h-full object-cover opacity-80 mix-blend-luminosity scale-100 group-hover:scale-105 transition-transform duration-[10s] ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1515]/90 via-[#1a1515]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1515]/80 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto py-16 md:py-20 mt-8 md:mt-16">
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-normal text-white drop-shadow-2xl leading-tight mb-6 sm:mb-8 tracking-[-0.02em] break-words" style={{ fontFamily: themeSettings.fontFamily }}>
            {settings.heading}
          </h1>
          <p className="text-base sm:text-xl md:text-3xl text-white/80 italic drop-shadow-lg mb-8 sm:mb-12 max-w-2xl mx-auto font-light break-words" style={{ fontFamily: themeSettings.fontFamily }}>
            {settings.subheading}
          </p>
          <Link to={settings.ctaLink} className="group/btn inline-flex items-center justify-center relative px-8 sm:px-12 py-3.5 sm:py-5 bg-transparent text-white text-xs sm:text-sm font-normal uppercase tracking-[0.25em] overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 border border-white/30 group-hover/btn:border-white transition-colors duration-500"></div>
            <div className="absolute inset-0 bg-white -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-out"></div>
            <span className="relative z-10 group-hover/btn:text-black transition-colors duration-500">{settings.ctaText}</span>
          </Link>
        </div>
      </section>
    );
  }

  // --- 3. BOLD BRAND THEME ---
  if (themeId && themeId.includes('bold')) {
    return (
      <section className="w-full min-h-[60vh] md:min-h-[75vh] bg-[#FF0000] flex flex-col items-center justify-center text-center p-4 sm:p-6 border-b-8 border-black relative overflow-hidden group box-border">
        {/* Animated Marquee Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-col justify-between py-10 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`whitespace-nowrap font-black text-9xl uppercase ${i % 2 === 0 ? 'animate-marquee' : 'animate-marquee-reverse'}`}>
              BOLD BRAND BOLD BRAND BOLD BRAND BOLD BRAND
            </div>
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-full px-2">
          <h1 className="text-4xl sm:text-6xl md:text-[10vw] leading-none font-black text-black uppercase tracking-tighter mb-4 mix-blend-overlay drop-shadow-[4px_4px_0_rgba(255,255,255,1)] sm:drop-shadow-[8px_8px_0_rgba(255,255,255,1)] group-hover:drop-shadow-[16px_16px_0_rgba(255,255,255,1)] transition-all duration-500 break-words" style={{ fontFamily: themeSettings.fontFamily }}>
            {settings.heading}
          </h1>
          <p className="text-base sm:text-2xl md:text-3xl text-white font-bold uppercase tracking-widest mb-8 sm:mb-12 max-w-2xl bg-black px-4 sm:px-6 py-2 -rotate-1 sm:-rotate-2 shadow-[4px_4px_0_rgba(0,0,0,0.5)] sm:shadow-[8px_8px_0_rgba(0,0,0,0.5)] break-words">
            {settings.subheading}
          </p>
          <Link to={settings.ctaLink} className="px-8 sm:px-16 py-4 sm:py-6 bg-black text-white text-base sm:text-2xl font-black uppercase tracking-[0.1em] hover:bg-white hover:text-[#FF0000] hover:scale-105 transition-all duration-300 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_rgba(0,0,0,1)]">
            {settings.ctaText}
          </Link>
        </div>
      </section>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <section className="w-full bg-[#FDFBF7] flex flex-col items-center py-12 sm:py-20 px-4 sm:px-6 md:px-12 relative overflow-hidden box-border">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#D9A05B]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-[#8B9B8B]/5 rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4"></div>
        
        <div className="w-full max-w-6xl aspect-[16/9] md:aspect-[21/9] rounded-2xl sm:rounded-[2rem] overflow-hidden relative mb-8 sm:mb-16 shadow-xl group">
          <img src={settings.imageUrl || (settings as any).bannerUrl} alt={settings.heading} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[3s] ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>
        </div>
        
        <div className="max-w-3xl text-center relative z-10 px-2">
          <h1 className="text-2xl sm:text-5xl md:text-7xl font-medium text-[#3E3E3E] mb-4 sm:mb-6 tracking-tight leading-[1.1] break-words" style={{ fontFamily: themeSettings.fontFamily }}>
            {settings.heading}
          </h1>
          <p className="text-sm sm:text-lg md:text-2xl text-[#3E3E3E]/60 mb-6 sm:mb-10 font-light leading-relaxed max-w-2xl mx-auto break-words">
            {settings.subheading}
          </p>
          <Link to={settings.ctaLink} className="inline-block px-8 sm:px-12 py-3.5 sm:py-4 bg-[#D9A05B] text-white text-xs sm:text-sm font-semibold rounded-full hover:bg-[#c28e4e] hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg shadow-[#D9A05B]/30">
            {settings.ctaText}
          </Link>
        </div>
      </section>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  return (
    <section className="w-full bg-white flex flex-col lg:flex-row min-h-[50vh] sm:min-h-[70vh] lg:h-[85vh] relative overflow-hidden group box-border">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-5 sm:px-8 md:px-16 lg:px-24 py-12 sm:py-16 lg:py-20 order-2 lg:order-1 relative z-10 bg-white/80 backdrop-blur-sm lg:bg-transparent">
        <div className="max-w-xl">
          <div className="w-12 sm:w-16 h-px bg-[#1A1A1A] mb-6 sm:mb-10 scale-x-0 origin-left animate-[scaleX_1s_ease-out_forwards]"></div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tighter text-[#1A1A1A] mb-4 sm:mb-8 leading-[1.1] opacity-0 translate-y-4 animate-[fadeUp_1s_0.2s_ease-out_forwards] break-words">
            {settings.heading}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-500 mb-6 sm:mb-12 font-light leading-relaxed opacity-0 translate-y-4 animate-[fadeUp_1s_0.4s_ease-out_forwards] break-words">
            {settings.subheading}
          </p>
          <div className="opacity-0 translate-y-4 animate-[fadeUp_1s_0.6s_ease-out_forwards]">
            <Link to={settings.ctaLink} className="inline-flex items-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A] group/link">
              {settings.ctaText}
              <div className="relative flex items-center">
                <span className="w-8 sm:w-12 h-px bg-[#1A1A1A] transition-all duration-500 group-hover/link:w-16 sm:group-hover/link:w-20"></span>
                <span className="absolute right-0 w-2 h-2 border-t border-r border-[#1A1A1A] rotate-45 translate-x-px"></span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 relative h-[40vh] sm:h-[55vh] lg:h-full order-1 lg:order-2 overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-[#1A1A1A]/5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <img src={settings.imageUrl || (settings as any).bannerUrl} alt={settings.heading} className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[4s] ease-out" />
      </div>
    </section>
  );
};
