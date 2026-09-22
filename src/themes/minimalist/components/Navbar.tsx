import React, { useState } from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';

export const MinimalistNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <header className="w-full bg-white/95 backdrop-blur-md py-4 sm:py-5 px-4 sm:px-6 md:px-12 sticky top-0 z-50 font-sans border-b border-gray-100/80 transition-all">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Mobile / Tablet Hamburger Button */}
        <div className="md:hidden flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-gray-900 hover:text-gray-600 transition-colors rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Brand Logo / Name */}
        <div className="flex-shrink-0 text-center md:text-left min-w-0">
          {showLogo && (
            <a 
              href="/" 
              className="text-lg sm:text-xl md:text-2xl font-light tracking-tighter text-gray-900 uppercase whitespace-nowrap block hover:opacity-75 transition-opacity truncate max-w-[200px] sm:max-w-xs md:max-w-none"
              title={storeInfo.name}
            >
              {storeInfo.name}
            </a>
          )}
        </div>

        {/* Desktop Navigation Links */}
        {showNav && (
          <nav className="hidden md:flex items-center justify-center flex-1 gap-6 lg:gap-10 px-4">
            {navigation.filter(n => n.isActive).map((nav) => (
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

        {/* Right Action Icons */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 sm:gap-5 lg:gap-6">
          <button 
            type="button" 
            aria-label="Pencarian Produk"
            className="text-gray-900 hover:text-gray-500 transition-colors p-1"
          >
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
          </button>
          <button 
            type="button" 
            aria-label="Keranjang Belanja"
            className="text-gray-900 hover:text-gray-500 transition-colors relative p-1"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.5]" />
          </button>
        </div>

      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {showNav && mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 mt-3 pt-3 pb-2 px-2 bg-white animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navigation.filter(n => n.isActive).map((nav) => (
              <a
                key={nav.id}
                href={nav.route}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
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
