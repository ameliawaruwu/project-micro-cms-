import React, { useState } from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, MessageCircle, Menu, X } from 'lucide-react';

export const EditorialNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const isSticky = sectionOptions.stickyHeader ?? true;
  const showSearch = sectionOptions.showSearchBar ?? true;
  const showCart = sectionOptions.showCartBadge ?? true;
  const showWhatsApp = sectionOptions.showWhatsAppButton ?? false;

  const rawTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeTitle = (!rawTitle || rawTitle === 'Green Market Indonesia') ? 'LOOKSEE' : rawTitle;
  const leftSubtitle = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || sectionOptions.tagline || storeInfo?.description || "The Journal";

  const navItems = (sectionOptions.navMenuItems && sectionOptions.navMenuItems.length > 0)
    ? sectionOptions.navMenuItems.map((item: any, i: number) => ({
        id: item.id || `nav-${i}`,
        label: item.label || item.name,
        route: item.href || item.route || '#',
        isActive: true,
      }))
    : (navigation && navigation.length > 0 ? navigation : [
        { id: 'en1', label: 'Collection', route: '/katalog', isActive: true },
        { id: 'en2', label: 'Editorial', route: '/berita', isActive: true },
        { id: 'en3', label: 'Behind The Scenes', route: '/tentang', isActive: true },
      ]);

  return (
    <header className={`w-full bg-[#FAFAFA] border-b border-gray-200/90 font-serif ${isSticky ? 'sticky top-0 z-50' : 'relative z-10'} transition-all`}>
      {/* Top Tier: Editorial Masthead */}
      <div className="w-full px-5 sm:px-8 md:px-12 py-5 sm:py-6 flex items-center justify-between gap-4">
        {/* Left: Magazine / Editorial Tagline */}
        <div className="w-1/4 hidden md:flex items-center justify-start min-w-0">
          <span className="text-[10px] lg:text-[11px] font-sans font-medium tracking-[0.25em] uppercase text-gray-500 truncate" title={leftSubtitle}>
            {leftSubtitle}
          </span>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 -ml-1 text-gray-900 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Center: Brand Title (Dominant & Never Overlapped) */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-2 min-w-0">
          {showLogo && (
            <a
              href="/"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif italic tracking-tight text-gray-950 hover:opacity-80 transition-opacity truncate max-w-full inline-block py-0.5"
              title={storeTitle}
            >
              {storeTitle}
            </a>
          )}
          {leftSubtitle && (
            <span className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.25em] uppercase text-gray-500 truncate max-w-full">
              {leftSubtitle}
            </span>
          )}
        </div>

        {/* Right: Actions / Utilities */}
        <div className="w-1/4 flex items-center justify-end gap-3 sm:gap-5 text-gray-800 shrink-0 font-sans">
          {showSearch && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] hover:text-black transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 text-gray-700" />
              <span className="hidden lg:inline">Search</span>
            </button>
          )}

          {showWhatsApp && (
            <a
              href={`https://wa.me/${(storeInfo.phone || '628123456789').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-emerald-700 hover:text-emerald-900 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden xl:inline">Chat</span>
            </a>
          )}

          {showCart && (
            <button
              type="button"
              className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] hover:text-black transition-colors relative cursor-pointer"
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4 text-gray-800" />
              <span className="hidden lg:inline">Cart</span>
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center -ml-0.5">
                0
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Tier: Centered Navigation Links (Desktop) */}
      {showNav && navItems.length > 0 && (
        <div className="hidden md:flex w-full border-t border-gray-200/60 px-6 py-3 items-center justify-center gap-6 lg:gap-10 overflow-x-auto no-scrollbar font-sans">
          {navItems.map((nav: any) => (
            <a
              key={nav.id}
              href={nav.route}
              className="text-[10px] lg:text-[11px] uppercase tracking-[0.25em] text-gray-600 hover:text-black font-medium transition-colors whitespace-nowrap py-0.5 relative group"
            >
              {nav.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-[#FAFAFA] px-6 py-5 space-y-4 font-sans animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-semibold border-b border-gray-200 pb-2">
            {leftSubtitle}
          </div>
          <div className="flex flex-col space-y-3">
            {navItems.map((nav: any) => (
              <a
                key={nav.id}
                href={nav.route}
                className="text-xs uppercase tracking-[0.2em] text-gray-800 hover:text-black font-medium py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {nav.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export const EditorialHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Autumn / Winter";
  const announcementText = sectionOptions.announcementText || "The New Collection";
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80";

  return (
    <section className="relative w-full h-[85vh] flex flex-col items-center justify-center bg-[#fafafa] overflow-hidden">
      <div className="absolute inset-0 p-4 md:p-8">
        <div className="w-full h-full relative overflow-hidden bg-gray-200">
          <img 
            src={bgImage} 
            alt="Editorial Campaign" 
            className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>
      
      <div className="z-10 text-center text-white mix-blend-difference mt-auto mb-24 pointer-events-none px-4">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] mb-6 md:mb-8 font-medium">
          {announcementText}
        </p>
        <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-serif italic leading-none">
          {heading}
        </h1>
        {(sectionOptions.subheading || sectionOptions.description) && (
          <p className="text-sm md:text-base lg:text-xl font-serif italic mt-6 max-w-xl mx-auto opacity-90 leading-relaxed">
            {sectionOptions.subheading || sectionOptions.description}
          </p>
        )}
      </div>
    </section>
  );
};

export const EditorialFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const rawTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeTitle = (!rawTitle || rawTitle === 'Green Market Indonesia') ? 'LOOKSEE' : rawTitle;
  const address = (storeInfo?.address && !storeInfo.address.includes('Lembang')) ? storeInfo.address : 'Grand Indonesia West Mall Lt. 1, Jakarta';
  const email = (storeInfo?.email && !storeInfo.email.includes('greenmarket')) ? storeInfo.email : 'contact@looksee.id';
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeTitle}`;

  return (
    <footer className="w-full px-6 md:px-12 py-24 bg-gray-900 text-white flex flex-col items-center">
      <h2 className="text-4xl md:text-5xl font-serif italic mb-4">{storeTitle}</h2>
      {(sectionOptions.description || storeInfo?.description) && (
        <p className="text-xs md:text-sm font-serif italic text-gray-400 max-w-md text-center mb-10 leading-relaxed">
          {sectionOptions.description || storeInfo?.description}
        </p>
      )}
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-center mb-16">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-4">Headquarters</p>
          <p className="text-xs uppercase tracking-widest text-gray-300 max-w-xs">{address}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-4">Inquiries</p>
          <p className="text-xs uppercase tracking-widest text-gray-300">{email}</p>
        </div>
      </div>
      <div className="w-full max-w-lg h-[1px] bg-gray-800 mb-8"></div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{copyrightText}</p>
    </footer>
  );
};
