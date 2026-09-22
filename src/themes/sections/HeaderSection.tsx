import React, { useState, useEffect } from 'react';
import { HeaderSettings, ThemeSettings } from '../schema';
import { Search, ShoppingBag, Menu, User, Phone, MapPin, ChevronDown } from 'lucide-react';
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
  
  const navLinks = settings.navLinks && settings.navLinks.length > 0 
    ? settings.navLinks 
    : [
        { label: 'Beranda', url: '#' },
        { label: 'Katalog Produk', url: '#katalog' },
        { label: 'Promo Spesial', url: '#promo' },
        { label: 'Tentang Kami', url: '#tentang' },
        { label: 'Kontak', url: '#kontak' },
      ];

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    if (isSticky) {
      window.addEventListener('scroll', handleScroll);
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]);

  // --- 1. COMPACT / MODERN CATALOG THEME ---
  if (themeId && themeId.includes('compact')) {
    return (
      <header className={`w-full relative z-50 flex flex-col font-sans transition-all duration-300 ${isSticky ? 'sticky top-0' : ''}`}>
        {/* Topbar */}
        <div className="hidden md:flex items-center justify-between px-6 py-2 bg-gradient-to-r from-gray-900 to-black text-white/80 text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"><Phone className="w-3.5 h-3.5" /> 0800-1234-567</span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"><MapPin className="w-3.5 h-3.5" /> Lacak Pesanan</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Bantuan</span>
            <span className="hover:text-white transition-colors cursor-pointer">Syarat & Ketentuan</span>
          </div>
        </div>
        
        {/* Main Header */}
        <div className={`w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-8 transition-all duration-300 ${
          scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5' : 'bg-white'
        }`}>
          <div className="flex-shrink-0 flex items-center">
            {settings.showLogo && (
              <Link to="/" className="font-black text-2xl tracking-tighter text-[#0055FF] flex items-center gap-1 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0055FF] to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                  B
                </div>
                <span className="ml-1">BRAND</span><span className="text-gray-900">STORE</span>
              </Link>
            )}
          </div>

          <div className="hidden lg:flex flex-1 max-w-2xl relative group">
            <input type="text" placeholder="Cari ribuan produk unggulan..." className="w-full bg-gray-50/50 border border-gray-200 focus:border-[#0055FF] focus:bg-white px-5 py-3 rounded-xl text-sm outline-none transition-all duration-300 shadow-inner group-hover:shadow-md" />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#0055FF] text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2">
              <Search className="w-4 h-4" /> <span className="text-xs font-bold hidden xl:block">CARI</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden md:flex flex-col items-center gap-1 text-gray-500 hover:text-[#0055FF] transition-all hover:-translate-y-0.5 p-2 rounded-lg hover:bg-blue-50/50">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold">Masuk</span>
            </button>
            <div className="w-px h-8 bg-gray-200 hidden md:block mx-1"></div>
            <button onClick={() => navigate('/cart')} className="relative flex flex-col items-center gap-1 text-gray-500 hover:text-[#0055FF] transition-all hover:-translate-y-0.5 p-2 rounded-lg hover:bg-blue-50/50">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-2 text-[9px] font-bold text-white w-4.5 h-4.5 flex items-center justify-center rounded-full bg-[#0055FF] shadow-sm ring-2 ring-white">
                  0
                </span>
              </div>
              <span className="hidden md:block text-[10px] font-bold">Keranjang</span>
            </button>
            <button className="lg:hidden text-gray-900 p-2 bg-gray-50 rounded-lg active:scale-95 transition-transform">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className={`hidden lg:flex items-center justify-center gap-8 py-3 bg-white border-b border-gray-100 text-sm font-semibold text-gray-600 shadow-sm transition-all ${
          scrolled ? 'h-0 py-0 opacity-0 overflow-hidden' : 'opacity-100 h-auto'
        }`}>
          {navLinks.map((link, idx) => (
            <Link key={idx} to={link.url} className="hover:text-[#0055FF] transition-colors uppercase tracking-widest text-[11px] flex items-center gap-1 group">
              {link.label}
              <ChevronDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
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
        className={`w-full z-50 transition-all duration-700 py-6 md:py-8 ${isSticky ? 'fixed top-0' : 'absolute top-0'} ${
          scrolled ? 'bg-[#FAF7F7]/80 backdrop-blur-2xl shadow-sm border-b border-[#241A1A]/5 py-4' : ''
        }`}
        style={{ fontFamily: themeSettings.fontFamily }}
      >
        <div className="mx-auto px-6 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Mobile Menu */}
            <button className="md:hidden text-[#241A1A] hover:opacity-60 transition-opacity p-2">
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>

            {/* Left Nav (Desktop) */}
            <nav className="hidden md:flex items-center flex-1 space-x-12">
              {navLinks.slice(0, Math.ceil(navLinks.length / 2)).map((link, idx) => (
                <Link key={idx} to={link.url} className="text-[13px] italic tracking-[0.2em] text-[#706866] hover:text-[#241A1A] transition-colors relative group">
                  {link.label}
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-px bg-[#241A1A] transition-all duration-500 ease-out group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center">
              {settings.showLogo && (
                <Link to="/" className="font-normal text-3xl md:text-5xl tracking-widest uppercase text-[#241A1A] hover:opacity-80 transition-opacity">
                  Artisan
                </Link>
              )}
            </div>

            {/* Right Nav (Desktop) & Icons */}
            <div className="flex items-center justify-end flex-1 gap-6 md:gap-12">
              <nav className="hidden md:flex items-center space-x-12 mr-4">
                {navLinks.slice(Math.ceil(navLinks.length / 2)).map((link, idx) => (
                  <Link key={idx} to={link.url} className="text-[13px] italic tracking-[0.2em] text-[#706866] hover:text-[#241A1A] transition-colors relative group">
                    {link.label}
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-px bg-[#241A1A] transition-all duration-500 ease-out group-hover:w-full"></span>
                  </Link>
                ))}
              </nav>
              
              <div className="flex items-center gap-5 text-[#241A1A]">
                <button aria-label="Search" className="hover:scale-110 transition-transform">
                  <Search className="w-5 h-5 stroke-[1.5]" />
                </button>
                <button aria-label="Cart" onClick={() => navigate('/cart')} className="hover:scale-110 transition-transform relative group">
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#66000E] border-2 border-white/50 group-hover:scale-125 transition-transform"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // --- 3. BOLD BRAND THEME ---
  if (themeId && themeId.includes('bold')) {
    return (
      <header className={`w-full z-50 py-6 transition-all duration-500 border-b-8 border-white ${
        isSticky && scrolled ? 'fixed top-0 bg-black/90 backdrop-blur-xl shadow-[0_20px_0_0_rgba(255,0,0,1)]' : 'bg-black'
      }`}>
        <div className="w-full px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-12">
            {settings.showLogo && (
              <Link to="/" className="relative group inline-block" style={{ fontFamily: themeSettings.fontFamily }}>
                <span className="font-black text-4xl tracking-tighter text-white uppercase relative z-10 group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform block">BOLD</span>
                <span className="font-black text-4xl tracking-tighter text-[#FF0000] uppercase absolute top-0 left-0 z-0">BOLD</span>
              </Link>
            )}
            <nav className="hidden lg:flex items-center gap-8 bg-white/10 px-8 py-3 rounded-full backdrop-blur-md border border-white/20">
              {navLinks.map((link, idx) => (
                <Link key={idx} to={link.url} className="text-white text-sm font-black uppercase tracking-widest hover:text-[#FF0000] hover:skew-x-[-15deg] transition-all">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#FF0000] hover:text-white hover:scale-110 hover:-rotate-12 transition-all">
              <Search className="w-5 h-5 stroke-[3]" />
            </button>
            <button onClick={() => navigate('/cart')} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black hover:bg-[#FF0000] hover:text-white hover:scale-110 hover:rotate-12 transition-all relative">
              <ShoppingBag className="w-5 h-5 stroke-[3]" />
              <span className="absolute -top-2 -right-2 bg-black text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">0</span>
            </button>
            <button className="lg:hidden w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center text-white hover:bg-white hover:text-[#FF0000] transition-colors">
              <Menu className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <header className={`w-full z-50 py-5 px-6 md:px-12 transition-all duration-500 ${
        isSticky && scrolled ? 'fixed top-0 bg-[#FDFBF7]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-[#D9A05B]/10' : 
        isTransparent ? 'absolute top-0' : 'bg-[#FDFBF7]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#3E3E3E] hover:bg-[#D9A05B] hover:text-white hover:border-[#D9A05B] transition-all">
              <Menu className="w-4 h-4" />
            </button>
            <button aria-label="Search" className="hidden md:flex w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#3E3E3E] hover:text-[#D9A05B] transition-all hover:shadow-md">
              <Search className="w-4 h-4" />
            </button>
          </div>
          
          {settings.showLogo && (
            <Link to="/" className="font-semibold text-3xl tracking-tight text-[#3E3E3E] absolute left-1/2 -translate-x-1/2" style={{ fontFamily: themeSettings.fontFamily }}>
              Lifestyle<span className="text-[#D9A05B]">.</span>
            </Link>
          )}

          <div className="flex items-center gap-8">
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, idx) => (
                <Link key={idx} to={link.url} className="text-[14px] font-medium text-[#3E3E3E]/80 hover:text-[#D9A05B] transition-colors relative group">
                  {link.label}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D9A05B] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
              ))}
            </nav>
            <button aria-label="Cart" onClick={() => navigate('/cart')} className="flex items-center gap-2 bg-[#3E3E3E] text-white px-5 py-2.5 rounded-full hover:bg-[#D9A05B] transition-colors shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:block">Cart (0)</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header 
      className={`w-full max-w-full z-50 transition-all duration-700 box-border overflow-x-hidden ${
        isSticky && scrolled ? 'fixed top-0 bg-white/90 backdrop-blur-2xl shadow-sm border-b border-gray-100 py-2' : 
        isTransparent ? 'absolute top-0 bg-transparent py-3 sm:py-6' : 'bg-white py-3 sm:py-5'
      }`}
      style={{ color: isTransparent && !scrolled ? '#FFFFFF' : '#1A1A1A' }}
    >
      <div className={`mx-auto px-3 sm:px-6 lg:px-12 w-full max-w-full ${themeSettings.containerWidth}`}>
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          <div className="flex-shrink-0 flex items-center min-w-0">
            {settings.showLogo && (
              <Link to="/" className="font-light text-lg sm:text-2xl md:text-3xl tracking-tighter flex items-center hover:opacity-70 transition-opacity whitespace-nowrap truncate max-w-[170px] sm:max-w-xs md:max-w-none" style={{ fontFamily: themeSettings.fontFamily }}>
                <span className="font-medium mr-1">M</span>inimal.
              </Link>
            )}
          </div>

          <nav className="hidden md:flex items-center justify-center space-x-6 lg:space-x-12 px-4 flex-1">
            {navLinks.map((link, idx) => (
              <Link 
                key={idx} 
                to={link.url} 
                className="text-[12px] font-medium uppercase tracking-[0.25em] opacity-60 hover:opacity-100 transition-all hover:scale-105 whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex-shrink-0 ml-auto flex items-center space-x-2 sm:space-x-6 sm:space-x-8">
            <button aria-label="Search" className="opacity-60 hover:opacity-100 hover:rotate-90 transition-all duration-300 p-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.2]" />
            </button>
            <button aria-label="Cart" onClick={() => navigate('/cart')} className="opacity-60 hover:opacity-100 transition-opacity relative flex items-center gap-1.5 sm:gap-2 group p-1">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.2] group-hover:-translate-y-1 transition-transform" />
              <span className="text-xs font-medium tracking-widest">(0)</span>
            </button>
            <button 
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden opacity-60 hover:opacity-100 transition-opacity p-1.5 rounded-lg focus:outline-none cursor-pointer"
              aria-label="Menu Navigasi"
            >
              <Menu className="w-5 h-5 stroke-[1.2]" />
            </button>
          </div>
        </div>

        {/* Dedicated Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100/60 mt-2 pt-3 pb-2 w-full animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link, idx) => (
                <Link 
                  key={idx} 
                  to={link.url} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-medium uppercase tracking-wider opacity-80 hover:opacity-100 py-2 px-2.5 rounded-lg hover:bg-black/5 transition-all block"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
