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
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className={`flex flex-col md:flex-row items-center gap-8 ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2">
              <img src={settings.imageUrl} alt={settings.title} className="w-full h-[300px] object-cover rounded-lg shadow-sm" />
            </div>
            <div className="w-full md:w-1/2 bg-gray-50 p-8 rounded-lg border border-gray-100">
              <h2 className="text-2xl font-black uppercase text-gray-900 mb-4">{settings.title}</h2>
              <p className="text-gray-600 font-medium leading-relaxed">{settings.content}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- 2. EDITORIAL / STORYTELLING THEME ---
  if (themeId && themeId.includes('editorial')) {
    return (
      <section className="py-32 bg-[#FAF7F7]">
        <div className="mx-auto px-6 lg:px-12 max-w-7xl">
          <div className={`flex flex-col md:flex-row items-center gap-16 lg:gap-32 ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-5/12 relative">
              <div className="absolute inset-0 bg-[#241A1A] translate-x-4 translate-y-4 -z-10"></div>
              <img src={settings.imageUrl} alt={settings.title} className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
            </div>
            <div className="w-full md:w-7/12">
              <div className="w-16 h-px bg-[#241A1A] mb-8"></div>
              <h2 className="text-4xl md:text-6xl font-normal text-[#241A1A] mb-10 leading-tight" style={{ fontFamily: themeSettings.fontFamily }}>
                {settings.title}
              </h2>
              <p className="text-lg text-[#706866] leading-loose max-w-xl">
                {settings.content}
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
      <section className="py-24 bg-[#FF0000] border-b-8 border-black">
        <div className="mx-auto px-6 max-w-7xl">
          <div className={`flex flex-col lg:flex-row items-center gap-12 border-8 border-black bg-white p-6 md:p-12 shadow-[16px_16px_0px_rgba(0,0,0,1)] ${isImageRight ? 'lg:flex-row-reverse' : ''}`}>
            <div className="w-full lg:w-1/2">
              <img src={settings.imageUrl} alt={settings.title} className="w-full h-[400px] object-cover border-4 border-black filter contrast-125 grayscale" />
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <h2 className="text-5xl md:text-7xl font-black uppercase text-black mb-6 tracking-tighter" style={{ fontFamily: themeSettings.fontFamily }}>
                {settings.title}
              </h2>
              <p className="text-xl md:text-2xl font-bold text-black uppercase tracking-widest leading-relaxed">
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
      <section className="py-24 bg-[#FDFBF7]">
        <div className="mx-auto px-6 lg:px-12 max-w-6xl">
          <div className={`flex flex-col md:flex-row items-center gap-16 ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
            <div className="w-full md:w-1/2">
              <div className="aspect-square rounded-full overflow-hidden shadow-2xl relative p-4">
                <div className="absolute inset-0 bg-[#D9A05B]/10 rounded-full"></div>
                <img src={settings.imageUrl} alt={settings.title} className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-medium text-[#3E3E3E] mb-6 tracking-tight" style={{ fontFamily: themeSettings.fontFamily }}>
                {settings.title}
              </h2>
              <p className="text-lg text-gray-500 font-light leading-relaxed mb-8">
                {settings.content}
              </p>
              <button className="text-[#D9A05B] font-medium border-b border-[#D9A05B] pb-1 hover:text-[#c28e4e] hover:border-[#c28e4e] transition-colors">
                Read More
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  return (
    <section className="py-24 bg-white">
      <div className={`mx-auto px-6 lg:px-12 ${themeSettings.containerWidth}`}>
        <div className={`flex flex-col md:flex-row items-center gap-16 lg:gap-24 ${isImageRight ? 'md:flex-row-reverse' : ''}`}>
          <div className="w-full md:w-1/2 relative">
            <img src={settings.imageUrl} alt={settings.title} className="w-full h-auto object-cover" />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="w-12 h-px bg-[#1A1A1A] mb-8"></div>
            <h2 className="text-3xl md:text-4xl font-light text-[#1A1A1A] tracking-tight mb-8">
              {settings.title}
            </h2>
            <p className="text-gray-500 font-light leading-relaxed mb-10 text-lg">
              {settings.content}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
