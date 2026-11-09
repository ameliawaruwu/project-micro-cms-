import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu, Heart } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems } from '../../navMenu';
import { StoreLogo } from '../../StoreLogo';
import { CartCount } from '../../storefrontCart';

export const CuteNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || sectionOptions.tagline || storeInfo?.description;
  const navFlexClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const navGapClass = isMobile || isTablet ? 'gap-4' : 'gap-4 md:gap-0';
  const showMobileBar = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex',
    tablet: 'flex',
    desktop: 'hidden',
    fallback: 'md:hidden flex',
  });
  const logoFlexNoneClass = isMobile || isTablet ? 'flex-1' : 'flex-1 md:flex-none';
  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden md:flex',
  });

  return (
    <header className="w-full bg-[#FFF5F7] border-b-4 border-[#FFD1DC] py-4 px-6 sticky top-0 z-50 font-['Outfit',sans-serif] rounded-b-3xl shadow-sm">
      <div className={`max-w-5xl mx-auto flex ${navFlexClass} items-center ${navGapClass} justify-between`}>
        
        {/* Mobile top bar */}
        <div className={`w-full ${showMobileBar} justify-between items-center`}>
          <span className="w-9 h-9" aria-hidden="true" />
          <button data-href="/keranjang" aria-label="Buka keranjang belanja" className="p-2 text-[#FF85A1] bg-white rounded-xl shadow-sm relative cursor-pointer">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#FF85A1] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              <CartCount />
            </span>
          </button>
        </div>

        {/* Center: Logo */}
        <div className={`${logoFlexNoneClass} text-center flex flex-col items-center group cursor-pointer`}>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:-translate-y-1 transition-transform">
            <Heart className="w-6 h-6 text-[#FF85A1] fill-[#FF85A1]" />
          </div>
          <a href="/" className="text-2xl font-black text-[#FF85A1] tracking-tight">
            <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11">{storeTitle}</StoreLogo>
          </a>
          {storeSubtitle && (
            <span className="text-xs font-semibold text-[#FF85A1]/80 mt-0.5 max-w-[200px] truncate">
              {storeSubtitle}
            </span>
          )}
        </div>

        {/* Center: Desktop Navigation */}
        <nav className={`${showDesktopNav} items-center justify-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm`}>
          {getNavMenuItems(sectionOptions).map((nav) => (
            <a
              key={nav.id}
              href={nav.route}
              className="text-sm font-bold text-[#FF85A1] hover:bg-[#FFF5F7] px-4 py-2 rounded-xl transition-colors"
            >
              {nav.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className={`${showDesktopNav} items-center gap-3`}>
          <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF85A1] hover:bg-[#FF85A1] hover:text-white transition-colors shadow-sm">
            <Search className="w-5 h-5" />
          </button>
          <button data-href="/keranjang" aria-label="Buka keranjang belanja" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF85A1] hover:bg-[#FF85A1] hover:text-white transition-colors shadow-sm relative cursor-pointer">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#FF85A1] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              <CartCount />
            </span>
          </button>
        </div>

      </div>
      <nav className={`${showMobileBar} flex-wrap justify-center gap-2 mt-3`}>
        {getNavMenuItems(sectionOptions).map((nav) => (
          <a key={nav.id} href={nav.route} className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#FF85A1] shadow-sm">
            {nav.label}
          </a>
        ))}
      </nav>
    </header>
  );
};
