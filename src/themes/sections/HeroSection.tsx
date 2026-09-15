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
      <section className="w-full bg-[#0055FF] text-white py-12 px-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
           <div>
             <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest mb-3 rounded-sm">PENAWARAN TERBATAS</span>
             <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-2">{settings.heading}</h1>
             <p className="text-blue-100 text-base md:text-lg font-medium">{settings.subheading}</p>
           </div>
           <Link to={settings.ctaLink} className="shrink-0 px-8 py-3.5 bg-white text-[#0055FF] text-sm font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-colors rounded shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
             {settings.ctaText}
           </Link>
        </div>
      </section>
    );
  }

  // --- 2. EDITORIAL / STORYTELLING THEME ---
  if (themeId && themeId.includes('editorial')) {
    return (
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#241A1A]">
        <div className="absolute inset-0 z-0">
          <img src={settings.imageUrl} alt={settings.heading} className="w-full h-full object-cover opacity-90 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] leading-tight mb-6" style={{ fontFamily: themeSettings.fontFamily }}>
            {settings.heading}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 italic drop-shadow-md mb-12 max-w-3xl mx-auto" style={{ fontFamily: themeSettings.fontFamily }}>
            {settings.subheading}
          </p>
          <Link to={settings.ctaLink} className="inline-block px-12 py-4 bg-transparent border border-white text-white text-sm font-normal uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300">
            {settings.ctaText}
          </Link>
        </div>
      </section>
    );
  }

  // --- 3. BOLD BRAND THEME ---
  if (themeId && themeId.includes('bold')) {
    return (
      <section className="w-full min-h-[70vh] bg-[#FF0000] flex flex-col items-center justify-center text-center p-6 border-b-8 border-black">
        <h1 className="text-7xl md:text-9xl font-black text-black uppercase tracking-tighter leading-none mb-6 mix-blend-color-burn" style={{ fontFamily: themeSettings.fontFamily }}>
          {settings.heading}
        </h1>
        <p className="text-2xl md:text-4xl text-white font-bold uppercase tracking-widest mb-12 max-w-3xl">
          {settings.subheading}
        </p>
        <Link to={settings.ctaLink} className="px-16 py-6 bg-black text-white text-xl font-black uppercase tracking-widest hover:bg-white hover:text-black hover:scale-110 hover:-rotate-3 transition-transform border-4 border-black">
          {settings.ctaText}
        </Link>
      </section>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <section className="w-full bg-[#FDFBF7] flex flex-col items-center py-16 px-6 md:px-12">
        <div className="w-full max-w-6xl aspect-[21/9] rounded-3xl overflow-hidden relative mb-12 shadow-2xl">
          <img src={settings.imageUrl} alt={settings.heading} className="w-full h-full object-cover" />
        </div>
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl md:text-6xl font-medium text-[#3E3E3E] mb-6 tracking-tight" style={{ fontFamily: themeSettings.fontFamily }}>
            {settings.heading}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 font-light leading-relaxed">
            {settings.subheading}
          </p>
          <Link to={settings.ctaLink} className="inline-block px-10 py-4 bg-[#D9A05B] text-white text-sm font-semibold rounded-full hover:bg-[#c28e4e] transition-colors shadow-lg hover:shadow-xl">
            {settings.ctaText}
          </Link>
        </div>
      </section>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  return (
    <section className="w-full bg-[#FAFAFA] flex flex-col lg:flex-row min-h-[600px] lg:h-[80vh]">
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 order-2 lg:order-1">
        <div className="max-w-md">
          <div className="w-12 h-0.5 bg-[#1A1A1A] mb-8"></div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-[#1A1A1A] mb-6 leading-tight">
            {settings.heading}
          </h1>
          <p className="text-lg text-gray-500 mb-10 font-light leading-relaxed">
            {settings.subheading}
          </p>
          <Link to={settings.ctaLink} className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] group">
            {settings.ctaText}
            <span className="w-8 h-px bg-[#1A1A1A] transition-all duration-300 group-hover:w-16"></span>
          </Link>
        </div>
      </div>
      <div className="w-full lg:w-7/12 relative h-[50vh] lg:h-full order-1 lg:order-2 overflow-hidden bg-gray-100">
        <img src={settings.imageUrl} alt={settings.heading} className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-[2s] ease-out" />
      </div>
    </section>
  );
};
