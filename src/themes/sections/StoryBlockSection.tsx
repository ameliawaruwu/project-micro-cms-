import React from 'react';
import { StoryBlockSettings, ThemeSettings } from '../schema';

interface Props {
  settings: StoryBlockSettings;
  themeSettings: ThemeSettings;
  themeId?: string;
}

export const StoryBlockSection: React.FC<Props> = ({ settings, themeSettings, themeId }) => {
  const isImageRight = settings.layout === 'image-right';

  // --- 1. COMPACT / MODERN CATALOG THEME ---
  if (themeId && themeId.includes('compact')) {
    return (
      <section className="py-20 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#0055FF]/5 rounded-l-full -translate-y-20 translate-x-10 z-0"></div>
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#0055FF] to-blue-400 rounded-3xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500"></div>
              <img src={settings.imageUrl || (settings as any).bannerUrl} alt={settings.title} className="relative w-full aspect-[4/3] object-cover rounded-2xl shadow-xl shadow-blue-900/10" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,85,255,0.4)_1px,_transparent_1px)] bg-[length:12px_12px] z-[-1]"></div>
            </div>
            <div className="w-full md:w-1/2 md:p-8">
              <span className="text-[#0055FF] text-sm font-black uppercase tracking-widest mb-4 block">BRAND STORY</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase text-gray-900 mb-6 tracking-tight leading-[1.1]">{settings.title}</h2>
              <div className="w-20 h-1.5 bg-[#0055FF] rounded-full mb-8"></div>
              <p className="text-gray-600 font-medium leading-relaxed text-lg">{settings.content}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- 2. EDITORIAL / STORYTELLING THEME ---
  if (themeId && themeId.includes('editorial')) {
    return (
      <section className="py-32 md:py-48 bg-[#FAF7F7] relative">
        <div className="mx-auto px-6 lg:px-12 max-w-7xl">
          <div className={`flex flex-col md:flex-row items-center gap-16 lg:gap-0 ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
            <div className={`w-full md:w-6/12 relative z-10 ${isImageRight ? 'md:-ml-20' : 'md:-mr-20'}`}>
              <div className="group relative">
                <div className="absolute inset-0 bg-[#241A1A] translate-x-6 translate-y-6 -z-10 transition-transform duration-500 group-hover:translate-x-8 group-hover:translate-y-8"></div>
                <img src={settings.imageUrl || (settings as any).bannerUrl} alt={settings.title} className="w-full aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
              </div>
            </div>
            <div className={`w-full md:w-7/12 bg-white p-12 md:p-20 shadow-2xl relative z-20 ${isImageRight ? 'md:mr-auto' : 'md:ml-auto'}`}>
              <div className="w-16 h-px bg-[#241A1A] mb-12"></div>
              <h2 className="text-5xl md:text-7xl font-normal text-[#241A1A] mb-10 leading-none" style={{ fontFamily: themeSettings.fontFamily }}>
                {settings.title}
              </h2>
              <p className="text-xl text-[#706866] leading-relaxed font-light italic">
                "{settings.content}"
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- 3. BOLD BRAND THEME ---
  if (themeId && themeId.includes('bold')) {
    return (
      <section className="py-32 bg-[#FF0000] border-b-8 border-black overflow-hidden">
        <div className="mx-auto px-6 max-w-7xl">
          <div className={`flex flex-col lg:flex-row items-stretch border-8 border-black bg-white shadow-[24px_24px_0px_rgba(0,0,0,1)] hover:shadow-[32px_32px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 hover:-translate-x-2 ${isImageRight ? 'lg:flex-row-reverse' : ''}`}>
            <div className="w-full lg:w-1/2 relative group border-b-8 lg:border-b-0 lg:border-r-8 border-black">
              <div className="absolute inset-0 bg-[#FF0000] mix-blend-color-burn opacity-0 group-hover:opacity-60 transition-opacity duration-300 z-10"></div>
              <img src={settings.imageUrl || (settings as any).bannerUrl} alt={settings.title} className="w-full h-full min-h-[500px] object-cover filter contrast-125 grayscale" />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-12 lg:p-20 relative">
              <div className="absolute top-8 right-8 text-6xl text-gray-200 font-black opacity-30 select-none">#</div>
              <h2 className="text-6xl md:text-8xl font-black uppercase text-black mb-10 tracking-tighter leading-none" style={{ fontFamily: themeSettings.fontFamily }}>
                {settings.title}
              </h2>
              <p className="text-2xl md:text-3xl font-bold text-black uppercase tracking-wider leading-relaxed">
                {settings.content}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <section className="py-32 bg-[#FDFBF7] relative">
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-[#D9A05B]/10 rounded-tl-full blur-[100px]"></div>
        
        <div className="mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
          <div className={`flex flex-col md:flex-row items-center gap-20 lg:gap-32 ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-[#D9A05B]/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <img src={settings.imageUrl || (settings as any).bannerUrl} alt={settings.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out" />
              </div>
              <div className={`absolute top-1/2 -translate-y-1/2 w-[120%] h-[80%] rounded-[3rem] border border-[#D9A05B]/30 -z-10 ${isImageRight ? '-right-10' : '-left-10'}`}></div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <span className="text-[#D9A05B] text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">About Us</span>
              <h2 className="text-4xl md:text-6xl font-medium text-[#3E3E3E] mb-8 tracking-tight leading-tight" style={{ fontFamily: themeSettings.fontFamily }}>
                {settings.title}
              </h2>
              <p className="text-xl text-[#3E3E3E]/70 font-light leading-relaxed mb-12">
                {settings.content}
              </p>
              <button className="text-[#D9A05B] font-medium border-b-2 border-[#D9A05B] pb-2 hover:text-[#c28e4e] hover:border-[#c28e4e] transition-colors flex items-center gap-2 mx-auto md:mx-0 group">
                Read the Full Story
                <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  return (
    <section className="py-32 lg:py-48 bg-white">
      <div className={`mx-auto px-6 lg:px-12 ${themeSettings.containerWidth}`}>
        <div className={`flex flex-col lg:flex-row items-stretch gap-16 lg:gap-32 ${isImageRight ? 'lg:flex-row-reverse' : ''}`}>
          <div className="w-full lg:w-5/12 relative group">
            <div className="aspect-[3/4] overflow-hidden bg-gray-50">
              <img src={settings.imageUrl || (settings as any).bannerUrl} alt={settings.title} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[3s] ease-out" />
            </div>
            {/* Minimal accent line */}
            <div className={`absolute top-1/2 -translate-y-1/2 w-px h-1/2 bg-[#1A1A1A] ${isImageRight ? '-left-8' : '-right-8'} hidden lg:block`}></div>
          </div>
          <div className="w-full lg:w-7/12 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-light text-[#1A1A1A] tracking-tighter leading-[1.1] mb-12">
              {settings.title}
            </h2>
            <div className="w-16 h-px bg-[#1A1A1A] mb-12"></div>
            <p className="text-[#1A1A1A]/60 font-light leading-relaxed text-xl lg:text-2xl max-w-2xl">
              {settings.content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
