import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu } from 'lucide-react';

export const MinimalistNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);
  
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <header className="w-full bg-white/90 backdrop-blur-md py-6 px-6 md:px-12 sticky top-0 z-50 font-sans border-b border-gray-100/50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        <div className="md:hidden flex-1">
          <button className="p-2 -ml-2 text-gray-900">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 md:flex-none text-center md:text-left">
          {showLogo && (
            <a href="/" className="text-2xl font-light tracking-tighter text-gray-900 uppercase">
              {storeInfo.name}
            </a>
          )}
        </div>

        {showNav && (
          <nav className="hidden md:flex items-center justify-center flex-1 gap-10">
            {navigation.filter(n => n.isActive).map((nav) => (
              <a
                key={nav.id}
                href={nav.route}
                className="text-xs font-medium uppercase tracking-[0.15em] text-gray-400 hover:text-gray-900 transition-colors"
              >
                {nav.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex-1 flex items-center justify-end gap-6">
          <button className="text-gray-900 hover:text-gray-400 transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="text-gray-900 hover:text-gray-400 transition-colors relative">
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
