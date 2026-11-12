import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { ShoppingBag } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getHeaderDisplay, getHeaderSubtitle } from '../../navMenu';
import { NavSearchButton } from '../../NavSearchButton';
import { StoreLogo } from '../../StoreLogo';
import { CartCount } from '../../storefrontCart';
import { NavTrackOrderButton } from '../../NavTrackOrderButton';

export const ModernNavbar: React.FC<{ sectionOptions?: any; accentColor?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, accentColor = '#2563EB', isMobile, isTablet }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const header = getHeaderDisplay(sectionOptions);
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  // Modern tidak menampilkan deskripsi toko otomatis; subjudul hanya dari pengaturan header.
  const storeSubtitle = getHeaderSubtitle(sectionOptions);
  // Pengaturan header merchant: sembunyikan logo/nama toko atau menu navigasi bila dimatikan.
  const showLogo = sectionOptions.showLogo ?? true;
  const navItems = (sectionOptions.showNavMenu ?? true) ? getNavMenuItems(sectionOptions) : [];

  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden lg:flex',
  });

  return (
    <header className={`w-full bg-white py-4 px-4 md:px-8 ${header.positionClass} font-['Outfit',sans-serif]`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-full px-5 py-2.5 shadow-sm">
        
        {/* Logo */}
        {showLogo ? (
          <a href="/" className="min-w-0 flex flex-col">
            <span className="text-lg font-bold text-gray-900 truncate">
              <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11">{storeTitle}</StoreLogo>
            </span>
            {storeSubtitle && <span className="text-[11px] text-gray-500 truncate">{storeSubtitle}</span>}
          </a>
        ) : (
          <span aria-hidden="true" />
        )}

        {/* Desktop Navigation */}
        <nav className={`${showDesktopNav} items-center gap-7`}>
          {navItems.map((nav) => (
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
          {header.showSearch && (
            <NavSearchButton className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors" />
          )}
          <NavTrackOrderButton className="w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500 transition-colors" />
          {header.showCart && (
            <button data-href="/keranjang" aria-label="Buka keranjang belanja" className="w-9 h-9 rounded-full text-white flex items-center justify-center relative transition-transform hover:scale-105 cursor-pointer" style={{ backgroundColor: accentColor }}>
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                <CartCount />
              </span>
            </button>
          )}
        </div>

      </div>
      <nav className="lg:hidden max-w-7xl mx-auto flex gap-6 overflow-x-auto [scrollbar-width:none] whitespace-nowrap px-5 pt-3">
        {navItems.map((nav) => (
          <a key={nav.id} href={nav.route} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            {nav.label}
          </a>
        ))}
      </nav>
    </header>
  );
};
