import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu } from 'lucide-react';

export const ElegantNavbar: React.FC = () => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);

  return (
    <header className="w-full bg-[#FAF9F6]/90 backdrop-blur-sm border-b border-[#E8E6E1] py-5 px-8 md:px-16 sticky top-0 z-50 font-['Cormorant_Garamond',serif]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Mobile Menu & Search */}
        <div className="flex-1 flex items-center gap-6">
          <button className="md:hidden text-[#2C2A29]">
            <Menu className="w-5 h-5" />
          </button>
          <button className="hidden md:flex items-center gap-2 text-[#6B6865] hover:text-[#2C2A29] transition-colors">
            <Search className="w-4 h-4" />
            <span className="text-xs tracking-[0.15em] uppercase font-sans">Search</span>
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 text-center flex flex-col items-center">
          <a href="/" className="text-3xl md:text-4xl font-normal tracking-wide text-[#2C2A29]">
            {storeInfo.name}
          </a>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-6">
          <button className="text-[#6B6865] hover:text-[#2C2A29] transition-colors flex items-center gap-2">
            <span className="text-xs tracking-[0.15em] uppercase hidden md:inline font-sans">Cart</span>
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute -bottom-2 -right-2 text-[#2C2A29] text-[9px] font-sans">0</span>
            </div>
          </button>
        </div>

      </div>

      {/* Second row: Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-center gap-12 mt-6">
        {navigation.filter(n => n.isActive).map((nav) => (
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
