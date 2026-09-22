import React, { useState } from 'react';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { Search, Filter, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

import { THEME_DATA_MAP } from '../themeData';
import { mockProducts } from '../../cms/mockCmsData';
import { useCmsStore } from '../../cms/useCmsStore';
import { cartService } from '../../services/cartService';

interface ShopPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  products?: Product[];
  isWishlist?: boolean;
  onNavigate?: (pageId: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ themeData, themeId: propThemeId, store, products = [], isWishlist, onNavigate }) => {
  const cmsProducts = useCmsStore(state => state.products);
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const fallbackThemeData = THEME_DATA_MAP[activeThemeId] || THEME_DATA_MAP['minimalist'];
  const themeProducts = fallbackThemeData?.products && fallbackThemeData.products.length > 0 ? fallbackThemeData.products : mockProducts;
  const displayProducts = (products && products.length > 0) ? products : (cmsProducts && cmsProducts.length > 0 ? (cmsProducts as any[]) : (themeProducts as any[]));

  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', ...Array.from(new Set(displayProducts.map((p: any) => p.category || p.categoryName).filter(Boolean)))];

  const filteredProducts = displayProducts.filter(p => {
    const cat = p.category || (p as any).categoryName;
    const matchCat = selectedCategory === 'Semua' || cat === selectedCategory;
    const matchSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  // Render Theme-aware Shop UI
  const renderThemeContent = () => {
    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-[#FF0000] p-8 md:p-12 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] mb-12">
              <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-4">
                KATALOG PRODUK
              </h1>
              <p className="text-xl md:text-2xl font-black text-black bg-white inline-block px-4 py-2 border-4 border-black uppercase">
                {filteredProducts.length} ITEM TERSEDIA
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-12">
              <div className="relative flex-1">
                <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-black" />
                <input
                  type="text"
                  placeholder="CARI PRODUK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-white border-4 border-black font-black uppercase text-lg focus:outline-none focus:bg-yellow-300 shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-4 font-black uppercase border-4 border-black text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all ${
                      selectedCategory === cat ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white text-black hover:bg-yellow-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                  <div className="aspect-square border-4 border-black overflow-hidden mb-4 bg-gray-100">
                    <img src={p.imageUrl || (p as any).image} alt={p.name} className="w-full h-full object-cover filter contrast-125" />
                  </div>
                  <h3 className="font-black text-xl uppercase truncate mb-1">{p.name}</h3>
                  <p className="font-black text-2xl text-[#FF0000] mb-4">Rp {p.price.toLocaleString('id-ID')}</p>
                  <button className="w-full py-3 bg-black text-white font-black uppercase border-2 border-black hover:bg-[#FF0000] transition-colors">
                    LIHAT DETAIL
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 2. EDITORIAL THEME
    if (activeThemeId === 'editorial') {
      return (
        <div className="pt-32 pb-32 bg-[#FAF7F7] text-[#241A1A] min-h-screen">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.3em] text-[#706866] block mb-2 font-serif">Curated Collection</span>
              <h1 className="text-5xl lg:text-7xl font-normal font-serif mb-6 tracking-wide">The Catalogue</h1>
              <div className="w-16 h-px bg-[#241A1A]/30 mx-auto"></div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 border-b border-t border-[#241A1A]/10 py-6">
              <div className="flex flex-wrap justify-center gap-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm tracking-[0.2em] uppercase font-serif transition-colors ${
                      selectedCategory === cat ? 'text-[#241A1A] border-b border-[#241A1A] pb-1' : 'text-[#706866] hover:text-[#241A1A]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-[#241A1A]/30 py-2 text-sm font-serif italic text-[#241A1A] focus:outline-none focus:border-[#241A1A]"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {filteredProducts.map((p) => (
                <div key={p.id} className="group cursor-pointer">
                  <div className="aspect-[3/4] bg-white overflow-hidden mb-6 shadow-sm">
                    <img src={p.imageUrl || (p as any).image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <h3 className="font-serif text-2xl font-normal mb-2 group-hover:text-[#706866] transition-colors">{p.name}</h3>
                  <p className="font-serif italic text-lg text-[#706866]">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 3. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="mb-12 border-b border-cyan-500/20 pb-8">
              <span className="text-xs text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> [CATALOG_INDEX_V2.0]
              </span>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                PRODUCT NEXUS
              </h1>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-12">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="text"
                  placeholder="QUERY_ITEMS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-cyan-500/30 rounded-xl text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400 backdrop-blur-md"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-3 rounded-xl text-xs uppercase tracking-wider transition-all backdrop-blur-md ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-cyan-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-4 backdrop-blur-md hover:border-cyan-400/60 transition duration-300 group">
                  <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden mb-4 relative">
                    <img src={p.imageUrl || (p as any).image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-[10px] text-cyan-400 border border-cyan-500/40">READY</div>
                  </div>
                  <h3 className="font-bold text-base text-slate-100 truncate mb-1">{p.name}</h3>
                  <p className="text-cyan-400 font-bold text-lg mb-4">Rp {p.price.toLocaleString('id-ID')}</p>
                  <button className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:opacity-90">
                    VIEW DATA
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 4. NATURE THEME
    if (activeThemeId === 'nature') {
      return (
        <div className="pt-28 pb-24 bg-[#F4F7F4] text-[#1B3B2B] min-h-screen font-sans">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="px-4 py-1.5 bg-[#2D5A27]/10 text-[#2D5A27] rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-3">
                100% Organik & Alami
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#1B3B2B]">Katalog Produk Alam</h1>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      selectedCategory === cat ? 'bg-[#2D5A27] text-white shadow-md' : 'bg-white text-[#1B3B2B]/70 hover:bg-[#2D5A27]/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#2D5A27]" />
                <input
                  type="text"
                  placeholder="Cari produk herbal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#2D5A27]/20 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl p-4 shadow-sm border border-[#2D5A27]/10 hover:shadow-lg transition-all group">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-emerald-50">
                    <img src={p.imageUrl || (p as any).image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <h3 className="font-bold text-lg text-[#1B3B2B] truncate mb-1">{p.name}</h3>
                  <p className="text-[#2D5A27] font-extrabold text-xl mb-4">Rp {p.price.toLocaleString('id-ID')}</p>
                  <button className="w-full py-3 bg-[#2D5A27] text-white rounded-2xl font-bold text-sm hover:bg-[#1B3B2B] transition-colors">
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 5. LUXURY THEME
    if (activeThemeId === 'luxury') {
      return (
        <div className="pt-32 pb-32 bg-[#0F172A] text-white min-h-screen font-serif">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] block mb-3 font-mono">Exclusive Selection</span>
              <h1 className="text-5xl lg:text-7xl font-light text-white mb-6">Maison Collection</h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto"></div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 border-y border-[#D4AF37]/20 py-6">
              <div className="flex flex-wrap justify-center gap-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm tracking-[0.2em] uppercase transition-colors ${
                      selectedCategory === cat ? 'text-[#D4AF37] border-b border-[#D4AF37] pb-1' : 'text-slate-400 hover:text-[#D4AF37]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-[#1E293B]/60 border border-[#D4AF37]/30 rounded-lg p-6 group hover:border-[#D4AF37] transition duration-500">
                  <div className="aspect-[4/5] bg-slate-900 rounded overflow-hidden mb-6">
                    <img src={p.imageUrl || (p as any).image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  </div>
                  <h3 className="font-serif text-2xl text-white mb-2">{p.name}</h3>
                  <p className="text-[#D4AF37] font-mono text-xl mb-6">Rp {p.price.toLocaleString('id-ID')}</p>
                  <button className="w-full py-3 border border-[#D4AF37] text-[#D4AF37] text-xs uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-black transition-colors">
                    Explore Item
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 6. CUTE THEME
    if (activeThemeId === 'cute') {
      return (
        <div className="pt-28 pb-24 bg-[#FFF5F8] text-[#4A154B] min-h-screen font-sans">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="px-4 py-2 bg-pink-200 text-pink-700 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-3 shadow-sm">
                💖 Katalog Pilihan Cantik
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-[#4A154B]">Temukan Favoritmu ✨</h1>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white scale-105 shadow-pink-200'
                      : 'bg-white text-pink-600 hover:bg-pink-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl p-5 shadow-lg shadow-pink-100/60 border border-pink-100 hover:scale-102 transition-transform group">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-pink-50">
                    <img src={p.imageUrl || (p as any).image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <h3 className="font-bold text-lg text-[#4A154B] truncate mb-1">{p.name}</h3>
                  <p className="text-pink-500 font-black text-xl mb-4">Rp {p.price.toLocaleString('id-ID')}</p>
                  <button className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition">
                    Lihat Detail 🛍️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 7. DEFAULT / MINIMALIST / CREATIVE / PROFESSIONAL / ELEGANT / FASHION
    return (
      <div className="pt-28 pb-24 bg-white text-[#1A1A1A] min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">Katalog Produk</h1>
            <div className="w-12 h-0.5 bg-black mx-auto"></div>
          </div>

          {/* Search & Categories */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${
                    selectedCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  if (store?.slug) {
                    cartService.addToCart(store.slug, p as any, 1);
                  }
                  if (onNavigate) onNavigate('product');
                }}
                className="group cursor-pointer bg-white rounded-2xl p-3 border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                    <img
                      src={p.imageUrl || (p as any).image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3.5 py-1.5 bg-white text-black text-xs font-bold rounded-lg shadow-md">
                        Lihat Detail
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate text-sm mb-1">{p.name}</h3>
                  <p className="text-gray-900 font-bold text-base">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (store?.slug) {
                        cartService.addToCart(store.slug, p as any, 1);
                      }
                      if (onNavigate) onNavigate('checkout');
                    }}
                    className="w-full py-2.5 bg-black hover:bg-[#66000E] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Beli Sekarang</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {CustomNavbar ? <CustomNavbar /> : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderThemeContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
