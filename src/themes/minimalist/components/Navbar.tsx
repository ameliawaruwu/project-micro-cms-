import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu } from 'lucide-react';

export const MinimalistNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);
  
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <header className="w-full bg-white/90 backdrop-blur-md py-5 px-6 md:px-12 sticky top-0 z-50 font-sans border-b border-gray-100/50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button className="p-2 -ml-2 text-gray-900 hover:text-gray-600 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Logo / Name */}
        <div className="flex-shrink-0 mr-6 lg:mr-12 text-center md:text-left">
          {showLogo && (
            <a href="/" className="text-xl md:text-2xl font-light tracking-tighter text-gray-900 uppercase whitespace-nowrap block hover:opacity-75 transition-opacity">
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
                className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400 hover:text-gray-900 transition-colors whitespace-nowrap"
              >
                {nav.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Action Icons */}
        <div className="flex-shrink-0 flex items-center justify-end gap-5 lg:gap-6 ml-6 lg:ml-12">
          <button className="text-gray-900 hover:text-gray-500 transition-colors">
            <Search className="w-4.5 h-4.5" />
          </button>
          <button className="text-gray-900 hover:text-gray-500 transition-colors relative">
            <ShoppingBag className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
