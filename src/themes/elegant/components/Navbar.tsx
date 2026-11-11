import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { ShoppingBag } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getHeaderDisplay, getHeaderSubtitle } from '../../navMenu';
import { NavSearchButton } from '../../NavSearchButton';
import { NavTrackOrderButton } from '../../NavTrackOrderButton';
import { StoreLogo } from '../../StoreLogo';
import { CartCount } from '../../storefrontCart';

export const ElegantNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const header = getHeaderDisplay(sectionOptions);
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = getHeaderSubtitle(sectionOptions, storeInfo?.description);
  const showDesktopSearch = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden md:flex',
  });
  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden md:flex',
  });
  const showCartLabel = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'inline',
    fallback: 'hidden md:inline',
  });

  return (
    <header className={`w-full bg-[#FAF9F6]/90 backdrop-blur-sm border-b border-[#E8E6E1] py-5 px-8 md:px-16 ${header.positionClass} font-['Cormorant_Garamond',serif]`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Search */}
        <div className="flex-1 flex items-center gap-6">
          {header.showSearch && (
            <NavSearchButton
              className="flex items-center gap-2 text-[#6B6865] hover:text-[#2C2A29] transition-colors"
              label={<span className={`${showDesktopSearch} text-xs tracking-[0.15em] uppercase font-sans`}>Cari</span>}
            />
          )}
          <NavTrackOrderButton
            className="flex items-center gap-2 text-[#6B6865] hover:text-[#2C2A29] transition-colors"
            label={<span className={`${showDesktopSearch} text-xs tracking-[0.15em] uppercase font-sans`}>Lacak</span>}
          />
        </div>

        {/* Center: Logo */}
        <div className="flex-1 text-center flex flex-col items-center">
          <a href="/" className="text-3xl md:text-4xl font-normal tracking-wide text-[#2C2A29]">
            <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11">{storeTitle}</StoreLogo>
          </a>
          {storeSubtitle && (
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#6B6865] mt-1 font-sans">
              {storeSubtitle}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-6">
          {header.showCart && (
            <button data-href="/keranjang" aria-label="Buka keranjang belanja" className="text-[#6B6865] hover:text-[#2C2A29] transition-colors flex items-center gap-2 cursor-pointer">
              <span className={`text-xs tracking-[0.15em] uppercase ${showCartLabel} font-sans`}>Keranjang</span>
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -bottom-2 -right-2 text-[#2C2A29] text-[9px] font-sans"><CartCount /></span>
              </div>
            </button>
          )}
        </div>

      </div>

      {/* Second row: Desktop Navigation */}
      <nav className={`${showDesktopNav} items-center justify-center gap-12 mt-6`}>
        {getNavMenuItems(sectionOptions).map((nav) => (
          <a
            key={nav.id}
            href={nav.route}
            className="text-xs tracking-[0.2em] uppercase text-[#6B6865] hover:text-[#2C2A29] transition-colors font-sans relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-[#2C2A29] after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1"
          >
            {nav.label}
          </a>
        ))}
      </nav>
    </header>
  );
};
