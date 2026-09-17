import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Search, ShoppingBag, Menu, Heart } from 'lucide-react';

export const CuteNavbar: React.FC = () => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const navigation = useCmsStore((state) => state.navigation);

  return (
    <header className="w-full bg-[#FFF5F7] border-b-4 border-[#FFD1DC] py-4 px-6 sticky top-0 z-50 font-['Outfit',sans-serif] rounded-b-3xl shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-0 justify-between">
        
        {/* Mobile top bar */}
        <div className="w-full md:hidden flex justify-between items-center">
          <button className="p-2 text-[#FF85A1] bg-white rounded-xl shadow-sm">
            <Menu className="w-5 h-5" />
          </button>
          <button className="p-2 text-[#FF85A1] bg-white rounded-xl shadow-sm relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#FF85A1] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 md:flex-none text-center flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:-translate-y-1 transition-transform">
            <Heart className="w-6 h-6 text-[#FF85A1] fill-[#FF85A1]" />
          </div>
          <a href="/" className="text-2xl font-black text-[#FF85A1] tracking-tight">
            {storeInfo.name}
          </a>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm">
          {navigation.filter(n => n.isActive).map((nav) => (
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
        <div className="hidden md:flex items-center gap-3">
          <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF85A1] hover:bg-[#FF85A1] hover:text-white transition-colors shadow-sm">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF85A1] hover:bg-[#FF85A1] hover:text-white transition-colors shadow-sm relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#FF85A1] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
              0
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
