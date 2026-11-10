import React, { useState, useEffect } from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { cartService } from '../../../services/cartService';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getHeaderDisplay, getHeaderSubtitle } from '../../navMenu';
import { NavSearchButton } from '../../NavSearchButton';
import { StoreLogo } from '../../StoreLogo';
import { useCartCount, useStorefrontSlug } from '../../storefrontCart';

export const MinimalistNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const header = getHeaderDisplay(sectionOptions);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const cartCount = useCartCount(useStorefrontSlug());
  
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = getHeaderSubtitle(sectionOptions, storeInfo?.description);

  const navItems = getNavMenuItems(sectionOptions);

  // Pada preview editor (device dipaksa), nav desktop & hamburger harus mengikuti
  // device yang DIPILIH, bukan lebar window browser sesungguhnya.
  const showHamburger = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex',
    tablet: 'flex',
    desktop: 'hidden',
    fallback: 'md:hidden flex',
  });
  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden md:flex',
  });
  const brandAlign = getDeviceClass(isMobile, isTablet, {
    mobile: 'text-center',
    tablet: 'text-center',
    desktop: 'text-left',
    fallback: 'text-center md:text-left',
  });
  const brandFlex = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-1',
    tablet: 'flex-1',
    desktop: 'flex-initial',
    fallback: 'flex-1 md:flex-initial',
  });
  const brandMarginClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'mx-auto',
    tablet: 'mx-auto',
    desktop: 'mx-0',
    fallback: 'mx-auto md:mx-0',
  });

  return (
    <header className={`w-full max-w-full bg-white/95 backdrop-blur-md ${header.positionClass} font-sans border-b border-gray-100/90 box-border overflow-x-hidden transition-all`}>
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between py-3 sm:py-4 px-3 sm:px-5 md:px-10 gap-2 sm:gap-4 box-border">
        
        {/* Mobile / Tablet Hamburger Button */}
        <div className={`${showHamburger} items-center shrink-0`}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 -ml-1 text-gray-900 hover:text-gray-600 active:bg-gray-100 rounded-lg transition-colors focus:outline-none cursor-pointer"
            aria-label="Menu Navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Brand Logo / Name (Auto-fits mobile screen without overlapping) */}
        <div className={`${brandFlex} ${brandAlign} min-w-0 px-1`}>
          {showLogo && (
            <a 
              href="/" 
              className={`text-base sm:text-lg md:text-2xl font-light tracking-tighter text-gray-900 uppercase whitespace-nowrap block hover:opacity-75 transition-opacity truncate max-w-[160px] sm:max-w-[240px] md:max-w-none ${brandMarginClass}`}
              title={storeTitle}
            >
              <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11">{storeTitle}</StoreLogo>
            </a>
          )}
          {storeSubtitle && (
            <span className={`text-[10px] text-gray-500 tracking-wider block truncate max-w-[240px] ${brandMarginClass} font-normal mt-0.5`}>
              {storeSubtitle}
            </span>
          )}
        </div>

        {/* Desktop Navigation Links (Strictly hidden on mobile viewport & simulator) */}
        {showNav && (
          <nav className={`${showDesktopNav} items-center justify-center flex-1 gap-6 lg:gap-10 px-4`}>
            {navItems.map((nav: any) => (
              <a
                key={nav.id}
                href={nav.route}
                className="text-xs font-medium uppercase tracking-[0.15em] text-gray-500 hover:text-gray-950 transition-colors whitespace-nowrap"
              >
                {nav.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Action Icons (Compact & perfectly aligned on mobile) */}
        <div className="flex-shrink-0 flex items-center justify-end gap-1.5 sm:gap-3 md:gap-6">
          {header.showSearch && (
            <NavSearchButton
              className="text-gray-900 hover:text-gray-500 active:scale-95 transition-transform p-1.5 rounded-lg focus:outline-none inline-flex items-center"
              iconClassName="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]"
            />
          )}
          {header.showCart && (
          <a 
            href="/cart"
            aria-label="Keranjang Belanja"
            onClick={(e) => {
              window.dispatchEvent(new CustomEvent('open_cart'));
            }}
            className="text-gray-900 hover:text-gray-500 active:scale-95 transition-transform relative p-1.5 rounded-lg focus:outline-none cursor-pointer inline-flex items-center"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 bg-gray-900 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </a>
          )}
        </div>

      </div>

      {/* Dedicated Mobile Collapsible Drawer Menu */}
      {showNav && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 w-full bg-white px-4 py-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navItems.map((nav: any) => (
              <a
                key={nav.id}
                href={nav.route}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-gray-800 hover:text-gray-950 hover:bg-gray-50 rounded-lg transition-colors block border-b border-gray-50 last:border-none"
              >
                {nav.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
