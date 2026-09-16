import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu, Hexagon } from 'lucide-react';

export const FuturisticNavbar: React.FC = () => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200 py-4 px-6 sticky top-0 z-50 font-['Space_Grotesk',sans-serif]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Hexagon className="w-8 h-8 text-red-600" />
          <a href="/" className="text-xl font-bold tracking-[0.2em] uppercase text-gray-900 drop-shadow-[0_0_8px_rgba(220,38,38,0.2)]">
            {storeInfo.name}
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 bg-gray-50 px-6 py-2 rounded-full border border-gray-200 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
          {navigation.filter(n => n.isActive).map((nav) => (
            <a
              key={nav.id}
              href={nav.route}
              className="text-xs font-medium text-gray-600 hover:text-red-600 uppercase tracking-widest transition-colors relative group"
            >
              {nav.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full drop-shadow-[0_0_5px_rgba(220,38,38,0.4)]"></span>
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-red-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-red-600 transition-colors relative group">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              0
            </span>
          </button>
          <button className="lg:hidden text-gray-600 hover:text-red-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>

      </div>
    </header>
  );
};
