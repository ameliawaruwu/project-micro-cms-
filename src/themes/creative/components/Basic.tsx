import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getFooterSocialLinks } from '../../navMenu';
import { StoreLogo } from '../../StoreLogo';

export const CreativeNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = sectionOptions.headerSubtitle ?? sectionOptions.subheading ?? sectionOptions.tagline ?? sectionOptions.subtitle ?? '';
  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden md:flex',
  });

  return (
    <nav className="w-full px-8 py-6 flex justify-between items-center bg-[#E11D48] text-white sticky top-0 z-50">
      <div className="flex-1 flex justify-start">
        {showLogo && (
          <div className="flex flex-col">
            <a href="/" className="text-3xl font-extrabold tracking-tighter hover:text-yellow-300 transition-colors transform hover:-rotate-3">
              <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11">{storeTitle}</StoreLogo>
            </a>
            {storeSubtitle && (
              <span className="text-xs font-semibold tracking-wider text-pink-200 mt-0.5">
                {storeSubtitle}
              </span>
            )}
          </div>
        )}
      </div>
      
      {showNav && (
        <div className={`${showDesktopNav} gap-8 flex-1 justify-center items-center`}>
          {getNavMenuItems(sectionOptions).map(nav => (
            <a key={nav.id} href={nav.route} className="text-sm font-bold uppercase tracking-widest hover:text-yellow-300 hover:scale-110 transition-transform">
              {nav.label}
            </a>
          ))}
        </div>
      )}
      
      <div className="flex-1 flex justify-end">
        <button className="w-12 h-12 rounded-full bg-yellow-300 text-[#E11D48] flex items-center justify-center font-bold hover:scale-110 transition-transform shadow-lg">
          0
        </button>
      </div>
    </nav>
  );
};

export const CreativeHero: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const heading = sectionOptions.heading || "Where Art Meets Commerce";
  const subheading = sectionOptions.heroSubtitle ?? sectionOptions.description ?? sectionOptions.subheading ?? sectionOptions.content ?? "Explore unique handcrafted art supplies, pigments, canvases, and creative tools crafted for visionary artists.";
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80";
  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const halfWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-1/2';
  const halfHeightClass = isMobile || isTablet ? 'h-1/2' : 'h-1/2 md:h-full';
  const imgPositionClass = isMobile || isTablet ? 'absolute' : 'absolute md:relative';

  return (
    <section className={`relative w-full h-[85vh] bg-[#E11D48] flex ${flexDirClass} items-center overflow-hidden`}>
      <div className={`${halfWidthClass} ${halfHeightClass} relative z-10 flex flex-col justify-center px-12 md:px-24`}>
        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-6 mix-blend-difference z-20 transform -rotate-2">
          {heading}
        </h1>
        {subheading && (
          <p className="text-lg md:text-xl font-medium text-pink-100 mb-8 max-w-lg z-20 leading-relaxed">
            {subheading}
          </p>
        )}
        <div className="flex gap-4 z-20">
          <button className="px-8 py-4 bg-yellow-300 text-black font-bold uppercase tracking-wider rounded-full hover:bg-white transition-colors transform hover:scale-105 shadow-xl">
            View Gallery
          </button>
        </div>
      </div>
      
      <div className={`${halfWidthClass} ${halfHeightClass} ${imgPositionClass} bottom-0 right-0 z-0`}>
        <div className="absolute inset-0 bg-blue-600 mix-blend-color z-10 opacity-30"></div>
        <img 
          src={bgImage} 
          alt="Creative Hero" 
          className="w-full h-full object-cover scale-110 rotate-3 opacity-90 rounded-bl-[100px]"
        />
        <div className="absolute top-1/2 -left-12 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-screen blur-2xl animate-pulse delay-700"></div>
      </div>
    </section>
  );
};

export const CreativeFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo?.email;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo?.address;
  const navItems = getNavMenuItems(sectionOptions);
  const socials = getFooterSocialLinks(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeTitle}`;

  return (
    <footer className="w-full px-5 sm:px-8 py-14 sm:py-20 bg-black text-white flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[#E11D48] via-yellow-300 to-blue-500"></div>

      <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-[#E11D48] mb-4 break-words max-w-full">
        {storeTitle}
      </h2>
      {storeDesc && (
        <p className="text-sm md:text-base text-gray-300 max-w-md mb-8 font-medium leading-relaxed">{storeDesc}</p>
      )}

      <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 text-sm font-bold uppercase tracking-widest">
        {navItems.map((nav) => (
          <a key={nav.id} href={nav.route} className="hover:text-yellow-300 transition-colors">{nav.label}</a>
        ))}
      </nav>

      {socials.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          {socials.map((s) => (
            <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">{s.label}</a>
          ))}
        </div>
      )}

      {(email || address) && (
        <div className="space-y-1 mb-6 text-sm text-gray-300">
          {address && <p className="break-words">{address}</p>}
          {email && <a href={`mailto:${email}`} className="block hover:text-white break-all">{email}</a>}
        </div>
      )}
      <p className="text-xs tracking-widest text-gray-500 font-medium">{copyrightText}</p>
    </footer>
  );
};
