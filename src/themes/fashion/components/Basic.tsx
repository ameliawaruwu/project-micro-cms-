import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getFooterSocialLinks } from '../../navMenu';
import { StoreLogo } from '../../StoreLogo';

export const FashionNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || sectionOptions.tagline || storeInfo?.description;

  return (
    <nav className="w-full bg-[#18181B] text-white border-b border-white/10 sticky top-0 z-50">
      <div className="w-full py-2 bg-black text-center text-[10px] uppercase tracking-[0.3em] text-gray-400">
        Free Global Shipping on Orders Over $500
      </div>
      <div className="w-full px-6 md:px-12 py-5 flex justify-between items-center">
        <div className="w-1/3 flex justify-start">
          <button className="text-white hover:text-gray-400 transition-colors flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        
        <div className="w-1/3 flex justify-center">
          {showLogo && (
            <div className="flex flex-col items-center">
              <a href="/" className="text-3xl md:text-4xl font-serif italic tracking-wider hover:opacity-80 transition-opacity text-center">
                <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-10 sm:h-12">{storeTitle}</StoreLogo>
              </a>
              {storeSubtitle && (
                <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mt-1 font-sans">
                  {storeSubtitle}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="w-1/3 flex justify-end gap-6 items-center">
          <button className="text-white hover:text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <button className="text-white hover:text-gray-400 transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
      {showNav && (
        <div className="w-full border-t border-white/10 px-6 py-3 flex flex-wrap justify-center gap-x-8 gap-y-2">
          {getNavMenuItems(sectionOptions).map((nav) => (
            <a
              key={nav.id}
              href={nav.route}
              className="text-[10px] uppercase tracking-[0.25em] text-gray-300 hover:text-white transition-colors"
            >
              {nav.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export const FashionHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const heading = sectionOptions.heading || "CHIC & URBAN";
  const subheading = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || sectionOptions.content || storeInfo?.description;
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80";

  return (
    <section className="relative w-full h-[90vh] bg-[#18181B] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt="Fashion Campaign" 
          className="w-full h-full object-cover object-top opacity-70 grayscale-[20%] mix-blend-luminosity scale-105 hover:scale-100 transition-transform duration-[15s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent"></div>
      </div>
      
      <div className="z-10 text-center relative mt-32">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-gray-300 mb-6">New Season</p>
        <h1 className="text-6xl md:text-9xl font-serif italic text-white drop-shadow-2xl mb-6">
          {heading}
        </h1>
        {subheading && (
          <p className="text-sm md:text-base text-gray-300 max-w-lg mx-auto mb-10 tracking-wider font-light leading-relaxed">
            {subheading}
          </p>
        )}
        <button className="px-10 py-4 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-colors duration-500">
          Shop The Collection
        </button>
      </div>
    </section>
  );
};

export const FashionFooter: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { storeInfo } = useCmsStore();
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo?.email;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo?.address;
  const navItems = getNavMenuItems(sectionOptions);
  const socials = getFooterSocialLinks(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeTitle}`;
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-4',
    fallback: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  });
  const brandSpanClass = getDeviceClass(isMobile, isTablet, {
    mobile: '',
    tablet: 'col-span-2',
    desktop: 'col-span-2',
    fallback: 'sm:col-span-2',
  });

  return (
    <footer className="w-full bg-[#18181B] text-white pt-16 sm:pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <div className={`grid ${gridColsClass} gap-10 mb-12`}>
          <div className={brandSpanClass}>
            <h2 className="text-3xl font-serif italic mb-4 break-words">{storeTitle}</h2>
            {storeDesc && <p className="text-sm text-gray-400 leading-loose max-w-md">{storeDesc}</p>}
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-6 text-[10px] uppercase tracking-[0.2em]">
                {socials.map((s) => (
                  <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="border-b border-white/30 pb-1 hover:border-white transition-colors">{s.label}</a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">Menu</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {navItems.map((nav) => (
                <li key={nav.id}><a href={nav.route} className="hover:text-white transition-colors">{nav.label}</a></li>
              ))}
            </ul>
          </div>

          {(email || address) && (
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">Kontak</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {address && <li className="break-words">{address}</li>}
                {email && <li><a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a></li>}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/10 text-xs text-gray-500 uppercase tracking-widest text-center">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
};
