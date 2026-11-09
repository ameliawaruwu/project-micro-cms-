import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems } from '../../navMenu';
import { StoreLogo } from '../../StoreLogo';
import { CartCount } from '../../storefrontCart';

export const ModernNavbar: React.FC<{ sectionOptions?: any; accentColor?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, accentColor = '#2563EB', isMobile, isTablet }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;

  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden lg:flex',
  });
  const showMobileMenuBtn = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex',
    tablet: 'flex',
    desktop: 'hidden',
    fallback: 'lg:hidden',
  });

  return (
    <header className="w-full bg-white py-4 px-4 md:px-8 sticky top-0 z-50 font-['Outfit',sans-serif]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-full px-5 py-2.5 shadow-sm">
        
        {/* Logo */}
        <a href="/" className="text-lg font-bold text-gray-900 shrink-0">
          <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11">{storeTitle}</StoreLogo>
        </a>

        {/* Desktop Navigation */}
        <nav className={`${showDesktopNav} items-center gap-7`}>
          {getNavMenuItems(sectionOptions).map((nav) => (
            <a
              key={nav.id}
              href={nav.route}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {nav.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button data-href="/keranjang" aria-label="Buka keranjang belanja" className="w-9 h-9 rounded-full text-white flex items-center justify-center relative transition-transform hover:scale-105 cursor-pointer" style={{ backgroundColor: accentColor }}>
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
              <CartCount />
            </span>
          </button>
          <button className={`${showMobileMenuBtn} w-9 h-9 rounded-full hover:bg-gray-50 items-center justify-center text-gray-500`}>
            <Menu className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
