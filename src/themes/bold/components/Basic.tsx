import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';

export const BoldNavbar: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <nav className="w-full px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center bg-zinc-950/90 backdrop-blur-md text-white border-b border-zinc-800/80 sticky top-0 z-50 transition-all">
      <div className="w-full md:w-1/3 flex justify-center md:justify-start items-center">
        {showLogo && (
          <a href="/" className="flex items-center gap-3 font-black tracking-tighter uppercase text-2xl md:text-3xl text-white hover:text-red-500 transition-colors group">
            <span className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black tracking-widest rounded-md group-hover:scale-105 transition-transform shadow-md shadow-red-600/20">RAW</span>
            <span className="font-extrabold tracking-tight">{storeInfo.name || 'RAWSTATE'}</span>
          </a>
        )}
      </div>
      
      {showNav && (
        <div className="w-full md:w-2/3 flex flex-wrap justify-center md:justify-end items-center gap-8 font-bold uppercase tracking-wider text-xs md:text-sm mt-3 md:mt-0">
          {navigation.map(nav => (
            <a key={nav.id} href={nav.route} className="text-zinc-400 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red-500 hover:after:w-full after:transition-all">
              {nav.label}
            </a>
          ))}
          <button className="bg-white text-zinc-950 px-5 py-2.5 text-xs font-extrabold uppercase rounded-lg hover:bg-zinc-200 transition-all shadow-md hover:shadow-white/10 active:scale-95">
            CART [0]
          </button>
        </div>
      )}
    </nav>
  );
};

export const BoldHero: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const heading = sectionOptions.heading || "LOUD & CLEAR";
  const subheading = sectionOptions.subheading || "The New Standard in Streetwear & Modern Aesthetics";
  const buttonLabel = sectionOptions.buttonLabel || "Explore Collection";
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80";

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden border-b border-zinc-800">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt="Bold Market" 
          className="w-full h-full object-cover opacity-40 filter contrast-110 scale-105 animate-pulse-subtle"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.8)_100%)]"></div>
      </div>
      
      {/* Hero Content */}
      <div className="z-10 text-center relative w-full px-6 max-w-5xl mx-auto flex flex-col items-center justify-center flex-grow py-24">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/90 border border-zinc-700/80 rounded-full text-zinc-300 font-bold text-xs uppercase tracking-[0.25em] mb-8 backdrop-blur-md shadow-xl">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          STREETWEAR COLLECTION 2026
        </div>

        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter uppercase text-white leading-none mb-8 text-center max-w-full drop-shadow-2xl">
          <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            <InlineEditableText
              tagName="span"
              value={heading}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </span>
        </h1>
        
        <p className="text-base sm:text-xl font-medium text-zinc-300 max-w-2xl mx-auto mb-10 tracking-wide leading-relaxed">
          <InlineEditableText
            tagName="span"
            value={subheading}
            onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
            readonly={!onUpdateSectionOptions}
          />
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <button 
            className="w-full sm:w-auto px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest text-sm rounded-xl transition-all duration-300 shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 cursor-pointer"
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <InlineEditableText
              tagName="span"
              value={buttonLabel}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val })}
              readonly={!onUpdateSectionOptions}
            /> →
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-bold uppercase tracking-widest text-sm rounded-xl transition-all duration-300 backdrop-blur-md hover:border-zinc-500">
            Lookbook
          </button>
        </div>
      </div>
      
      {/* Ticker / Marquee */}
      <div className="w-full overflow-hidden bg-zinc-900/90 text-zinc-400 py-3 z-20 whitespace-nowrap border-t border-b border-zinc-800/80 backdrop-blur-md">
        <div className="animate-marquee font-extrabold uppercase tracking-[0.2em] text-xs flex items-center">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {heading} — EXCLUSIVE DROP 2026
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BoldFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name} ALL RIGHTS RESERVED`;

  return (
    <footer className="w-full px-8 py-16 bg-zinc-950 text-white text-center border-t border-zinc-800/80 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        <a href="/" className="inline-block text-4xl md:text-6xl font-black tracking-tighter uppercase text-white hover:text-red-500 transition-colors">
          {storeInfo.name || 'RAWSTATE'}
        </a>
        <div className="flex flex-wrap justify-center gap-8 font-semibold uppercase tracking-wider text-xs text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">TikTok</a>
          <a href="#" className="hover:text-white transition-colors">Discord</a>
        </div>
        <div className="pt-6 border-t border-zinc-900 text-xs font-medium text-zinc-500 tracking-wider">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
};
