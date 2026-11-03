import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu } from 'lucide-react';

export const ModernNavbar: React.FC<{ sectionOptions?: any; accentColor?: string }> = ({ sectionOptions = {}, accentColor = '#2563EB' }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;

  return (
    <header className="w-full bg-white py-4 px-4 md:px-8 sticky top-0 z-50 font-['Outfit',sans-serif]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white border border-gray-100 rounded-full px-5 py-2.5 shadow-sm">
        
        {/* Logo */}
        <a href="/" className="text-lg font-bold text-gray-900 shrink-0">
          {storeTitle}
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          {navigation.filter(n => n.isActive).map((nav) => (
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
          <button className="w-9 h-9 rounded-full text-white flex items-center justify-center relative transition-transform hover:scale-105" style={{ backgroundColor: accentColor }}>
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
              0
            </span>
          </button>
          <button className="lg:hidden w-9 h-9 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-500">
            <Menu className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
