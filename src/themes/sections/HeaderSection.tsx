import React from 'react';
import { HeaderSettings, ThemeSettings } from '../schema';
import { Search, ShoppingBag, Menu, User, Phone, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  settings: HeaderSettings;
  themeSettings: ThemeSettings;
  themeId?: string;
}

export const HeaderSection: React.FC<Props> = ({ settings, themeSettings, themeId }) => {
  const isTransparent = settings.style === 'transparent';
  const isSticky = settings.style === 'sticky';
  const navigate = useNavigate();

  // --- 1. COMPACT / MODERN CATALOG THEME ---
  if (themeId && themeId.includes('compact')) {
    return (
      <header className="w-full relative z-50 flex flex-col font-sans border-b border-gray-200">
        <div className="hidden md:flex items-center justify-between px-6 py-1.5 bg-[#111827] text-white text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> 0800-1234-567</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Lacak Pesanan</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Bantuan</span>
            <span>Syarat & Ketentuan</span>
          </div>
        </div>
        
        <div className={`w-full bg-white px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6 ${isSticky ? 'sticky top-0 shadow-md' : ''}`}>
          <div className="flex-shrink-0 flex items-center">
            {settings.showLogo && (
              <Link to="/" className="font-black text-2xl tracking-tighter text-[#0055FF]">
                BRAND<span className="text-gray-900">STORE</span>
              </Link>
            )}
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <input type="text" placeholder="Cari ribuan produk unggulan..." className="w-full bg-gray-100 border border-transparent focus:border-[#0055FF] focus:bg-white px-4 py-2.5 rounded-md text-sm outline-none transition-colors" />
            <button className="absolute right-0 top-0 bottom-0 px-4 bg-[#0055FF] text-white rounded-r-md hover:bg-blue-700 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button className="hidden md:flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#0055FF] transition-colors">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold">Masuk</span>
            </button>
            <button onClick={() => navigate('/cart')} className="relative flex flex-col items-center gap-0.5 text-gray-600 hover:text-[#0055FF] transition-colors">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-2 text-[9px] font-bold text-white w-4 h-4 flex items-center justify-center rounded-full bg-[#0055FF]">
                  0
                </span>
              </div>
              <span className="hidden md:block text-[10px] font-bold">Keranjang</span>
            </button>
            <button className="md:hidden text-gray-900">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center gap-8 py-2.5 bg-white border-t border-gray-100 text-sm font-bold text-gray-700 shadow-sm">
          {settings.navLinks.map((link, idx) => (
            <Link key={idx} to={link.url} className="hover:text-[#0055FF] transition-colors uppercase tracking-wider text-[11px]">
              {link.label}
            </Link>
          ))}
        </div>
      </header>
    );
  }

  // --- 2. EDITORIAL / STORYTELLING THEME ---
  if (themeId && themeId.includes('editorial')) {
    return (
      <header 
        className={`w-full z-50 transition-all duration-500 py-6 md:py-10 ${isSticky ? 'sticky top-0 bg-[#FAF7F7]/95 backdrop-blur-md shadow-sm' : 'absolute top-0'}`}
        style={{ fontFamily: themeSettings.fontFamily }}
      >
        <div className="mx-auto px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="flex-shrink-0 flex items-center justify-center w-full relative">
              <button className="absolute left-0 text-[#241A1A] hover:opacity-60 transition-opacity">
                <Menu className="w-6 h-6" />
              </button>

              {settings.showLogo && (
                <Link to="/" className="font-normal text-3xl md:text-5xl tracking-widest uppercase text-[#241A1A]">
                  Artisan
                </Link>
              )}

              <div className="absolute right-0 flex items-center gap-4 text-[#241A1A]">
                <button aria-label="Search" className="hover:opacity-60 transition-opacity">
                  <Search className="w-5 h-5" />
                </button>
                <button aria-label="Cart" onClick={() => navigate('/cart')} className="hover:opacity-60 transition-opacity relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-[#66000E]"></span>
                </button>
              </div>
            </div>

            <nav className="hidden md:flex items-center justify-center space-x-12">
              {settings.navLinks.map((link, idx) => (
                <Link 
                  key={idx} 
                  to={link.url} 
                  className="text-sm italic tracking-widest text-[#706866] hover:text-[#241A1A] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#241A1A] transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
    );
  }

  // --- 3. BOLD BRAND THEME ---
  if (themeId && themeId.includes('bold')) {
    return (
      <header className={`w-full z-50 py-6 border-b-4 border-white ${isSticky ? 'sticky top-0 bg-black shadow-2xl' : 'bg-black'}`}>
        <div className="w-full px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {settings.showLogo && (
              <Link to="/" className="font-black text-4xl tracking-tighter text-white uppercase" style={{ fontFamily: themeSettings.fontFamily }}>
                BOLD
              </Link>
            )}
            <nav className="hidden lg:flex items-center gap-8">
              {settings.navLinks.map((link, idx) => (
                <Link key={idx} to={link.url} className="text-white text-lg font-black uppercase tracking-wider hover:text-[#FF0000] hover:skew-x-[-10deg] transition-all">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-white hover:text-[#FF0000] hover:scale-110 transition-transform">
              <Search className="w-6 h-6 stroke-[3]" />
            </button>
            <button onClick={() => navigate('/cart')} className="text-white hover:text-[#FF0000] hover:scale-110 transition-transform relative">
              <ShoppingBag className="w-6 h-6 stroke-[3]" />
              <span className="absolute -bottom-2 -right-2 bg-[#FF0000] text-white text-[10px] font-black px-1 border-2 border-black">0</span>
            </button>
            <button className="lg:hidden text-white">
              <Menu className="w-8 h-8 stroke-[3]" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <header className={`w-full z-50 py-4 px-6 md:px-12 transition-all ${isSticky ? 'sticky top-0 bg-[#FDFBF7]/90 backdrop-blur shadow-sm' : isTransparent ? 'absolute top-0' : 'bg-[#FDFBF7]'}`}>
        <div className="flex items-center justify-between">
          <button className="text-[#3E3E3E] hover:opacity-70 transition-opacity">
            <Menu className="w-6 h-6" />
          </button>
          
          {settings.showLogo && (
            <Link to="/" className="font-semibold text-2xl tracking-tight text-[#3E3E3E] absolute left-1/2 -translate-x-1/2" style={{ fontFamily: themeSettings.fontFamily }}>
              Lifestyle.
            </Link>
          )}

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 mr-4">
              {settings.navLinks.map((link, idx) => (
                <Link key={idx} to={link.url} className="text-[13px] font-medium text-[#3E3E3E] hover:text-[#D9A05B] transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
            <button aria-label="Search" className="text-[#3E3E3E] hover:opacity-70 transition-opacity">
              <Search className="w-5 h-5" />
            </button>
            <button aria-label="Cart" onClick={() => navigate('/cart')} className="text-[#3E3E3E] hover:opacity-70 transition-opacity relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D9A05B] rounded-full"></span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  return (
    <header 
      className={`w-full z-50 transition-all duration-300 ${isSticky ? 'sticky top-0 bg-white shadow-sm' : isTransparent ? 'absolute top-0 bg-transparent' : 'bg-white'}`}
      style={{ color: isTransparent ? '#FFFFFF' : '#1A1A1A' }}
    >
      <div className={`mx-auto px-6 lg:px-12 ${themeSettings.containerWidth}`}>
        <div className="flex items-center justify-between h-20 sm:h-24">
          <div className="flex-shrink-0 flex items-center">
            {settings.showLogo && (
              <Link to="/" className="font-light text-2xl tracking-tighter" style={{ fontFamily: themeSettings.fontFamily }}>
                Minimal.
              </Link>
            )}
          </div>

          <nav className="hidden md:flex items-center justify-center space-x-10 flex-1">
            {settings.navLinks.map((link, idx) => (
              <Link 
                key={idx} 
                to={link.url} 
                className="text-[13px] font-medium uppercase tracking-[0.2em] opacity-80 hover:opacity-100 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-6 sm:space-x-8">
            <button aria-label="Search" className="opacity-80 hover:opacity-100 transition-opacity">
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>
            <button aria-label="Cart" onClick={() => navigate('/cart')} className="opacity-80 hover:opacity-100 transition-opacity relative flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-medium">(0)</span>
            </button>
            <button className="md:hidden opacity-80 hover:opacity-100 transition-opacity">
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
