import React, { useState, useMemo } from 'react';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Star, 
  ArrowUpDown, 
  Check, 
  Eye, 
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Heart
} from 'lucide-react';

import { useCmsStore } from '../../cms/useCmsStore';
import { useLanguage } from '../../contexts/LanguageContext';
import { cartService } from '../../services/cartService';
import { getEnrichedCatalog, CatalogProduct } from '../catalogData';

interface ShopPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  products?: Product[];
  isWishlist?: boolean;
  onNavigate?: (pageId: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ 
  themeData, 
  themeId: propThemeId, 
  store, 
  products = [], 
  isWishlist, 
  onNavigate 
}) => {
  const activeThemeId = (propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist').toLowerCase();
  const { isEn } = useLanguage();

  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const liveStoreInfo = useCmsStore((state) => state.storeInfo);
  const storeName = liveStoreInfo?.name || store?.name || (isEn ? 'Our Boutique' : 'Toko Kami');
  const storeDesc = liveStoreInfo?.description || store?.description || (isEn 
    ? 'Explore our curated collection of exceptional pieces with unmatched quality.' 
    : 'Jelajahi seluruh koleksi produk pilihan terbaik dengan kualitas terjamin.');

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const navbarOptions = {
    heading: storeName,
    subheading: storeDesc,
    description: storeDesc,
    subtitle: storeDesc,
    tagline: storeDesc,
    ...((headerSection as any)?.options || (headerSection as any)?.settings)
  };

  const footerOptions = {
    heading: storeName,
    subheading: storeDesc,
    description: storeDesc,
    subtitle: storeDesc,
    ...((footerSection as any)?.options || (footerSection as any)?.settings)
  };

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'discount' | 'newest'>('popular');
  const [visibleCount, setVisibleCount] = useState(12);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // 1. Get rich, abundant product catalog (16-24 items per theme)
  const fullCatalog = useMemo(() => {
    return getEnrichedCatalog(activeThemeId, products);
  }, [activeThemeId, products]);

  // 2. Compute categories with count
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    counts['Semua'] = fullCatalog.length;
    fullCatalog.forEach(p => {
      const cat = p.category || 'Lainnya';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return [
      { name: 'Semua', count: counts['Semua'] },
      ...Object.keys(counts)
        .filter(k => k !== 'Semua')
        .map(k => ({ name: k, count: counts[k] }))
    ];
  }, [fullCatalog]);

  // 3. Filter & Sort
  const filteredAndSortedProducts = useMemo(() => {
    let result = fullCatalog.filter(p => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        break;
      case 'newest':
        result.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.salesCount - a.salesCount);
        break;
    }

    return result;
  }, [fullCatalog, selectedCategory, searchQuery, sortBy]);

  const displayedProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedProducts.length;

  const handleAddToCart = (e: React.MouseEvent, p: CatalogProduct) => {
    e.stopPropagation();
    if (store?.slug) {
      cartService.addToCart(store.slug, p as any, 1);
    }
    showToast(`"${p.name}" ditambahkan ke keranjang belanja`);
  };

  const handleBuyNow = (e: React.MouseEvent, p: CatalogProduct) => {
    e.stopPropagation();
    if (store?.slug) {
      cartService.addToCart(store.slug, p as any, 1);
    }
    if (onNavigate) {
      onNavigate('checkout');
    }
  };

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  // Render Theme-aware Shop UI
  const renderThemeContent = () => {
    // ── 1. BOLD THEME (RawState / Streetwear) ─────────────────────────────────
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-[#FF0000] p-6 sm:p-10 md:p-12 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] mb-10">
              <span className="px-3 py-1 bg-black text-white font-black text-xs uppercase tracking-widest inline-block mb-3">
                KATALOG ETALASE RESMI
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-4 storefront-heading-hero">
                KATALOG PRODUK
              </h1>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm sm:text-lg font-black text-black bg-white inline-block px-4 py-2 border-4 border-black uppercase">
                  {filteredAndSortedProducts.length} PRODUK TERSEDIA
                </span>
                <span className="text-xs sm:text-sm font-bold text-white bg-black px-3 py-1.5 uppercase border-2 border-white">
                  GARANSI ORIGINAL 100%
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-black" />
                <input
                  type="text"
                  placeholder="CARI NAMA, KATEGORI, ATAU BAHAN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white border-4 border-black font-black uppercase text-sm focus:outline-none focus:bg-yellow-300 shadow-[5px_5px_0px_rgba(0,0,0,1)]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 font-black text-sm bg-black text-white w-6 h-6 flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    aria-label="Urutkan Produk"
                    className="appearance-none px-6 py-3.5 pr-10 bg-white border-4 border-black font-black uppercase text-xs shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer"
                  >
                    <option value="popular">URUTKAN: PALING POPULER</option>
                    <option value="price-asc">HARGA: TERMURAH</option>
                    <option value="price-desc">HARGA: TERMAHAL</option>
                    <option value="discount">DISKON TERBESAR</option>
                    <option value="newest">PRODUK TERBARU</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-10 pb-2 border-b-4 border-black">
              {categoryStats.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 font-black uppercase border-4 border-black text-xs transition-all cursor-pointer ${
                    selectedCategory === cat.name 
                      ? 'bg-black text-white shadow-[4px_4px_0px_rgba(255,0,0,1)] translate-x-0.5' 
                      : 'bg-white text-black hover:bg-yellow-300 shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => onNavigate && onNavigate('product')}
                  className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="aspect-square min-h-[200px] sm:min-h-[240px] md:min-h-[260px] border-4 border-black overflow-hidden mb-3 bg-gray-100 relative">
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-500" 
                      />
                      {p.discountPercent && (
                        <div className="absolute top-2 left-2 bg-[#FF0000] text-white border-2 border-black font-black text-xs px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          -{p.discountPercent}%
                        </div>
                      )}
                      {p.badge && (
                        <div className="absolute top-2 right-2 bg-yellow-300 text-black border-2 border-black font-black text-[10px] uppercase px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                          {p.badge}
                        </div>
                      )}
                    </div>

                    {/* Category Tag */}
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      {p.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-black text-xs sm:text-sm md:text-base uppercase leading-snug line-clamp-1 mt-0.5 mb-1 group-hover:text-[#FF0000] transition-colors storefront-card-title">
                      {p.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-[10px] sm:text-xs text-gray-600 font-bold line-clamp-2 mb-3 leading-relaxed storefront-card-desc">
                      {p.description}
                    </p>
                  </div>

                  <div>
                    {/* Rating & Stock */}
                    <div className="flex items-center justify-between text-xs font-black mb-2 pt-2 border-t-2 border-black">
                      <span className="flex items-center gap-1 text-black">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-black" />
                        <span>{p.rating}</span>
                        <span className="text-gray-500 text-[10px]">({p.salesCount}+ terjual)</span>
                      </span>
                      <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 text-[10px] border border-black">
                        Stok: {p.stock}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-base sm:text-lg md:text-xl text-[#FF0000] storefront-card-price">
                          Rp {p.price.toLocaleString('id-ID')}
                        </span>
                        {p.originalPrice && (
                          <span className="text-xs font-bold text-gray-400 line-through">
                            Rp {p.originalPrice.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      <button 
                        type="button"
                        onClick={(e) => handleAddToCart(e, p)}
                        className="col-span-1 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black flex items-center justify-center font-black transition cursor-pointer"
                        title="Tambah ke Keranjang"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleBuyNow(e, p)}
                        className="col-span-3 py-2.5 bg-black hover:bg-[#FF0000] text-white font-black uppercase text-xs border-2 border-black transition cursor-pointer"
                      >
                        Beli Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-8 py-4 bg-black text-white font-black text-sm uppercase tracking-wider border-4 border-black hover:bg-yellow-300 hover:text-black transition shadow-[6px_6px_0px_rgba(255,0,0,1)] cursor-pointer"
                >
                  MUAT LEBIH BANYAK PRODUK ({displayedProducts.length} DARI {filteredAndSortedProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── 2. EDITORIAL THEME ───────────────────────────────────────────────────
    if (activeThemeId === 'editorial') {
      return (
        <div className="pt-28 pb-32 bg-[#FAF7F7] text-[#241A1A] min-h-screen font-serif">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.3em] text-[#706866] block mb-2 font-sans font-semibold">
                Curated Collection
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-normal font-serif mb-4 tracking-wide storefront-heading-hero">
                The Catalogue
              </h1>
              <p className="text-sm font-sans text-[#706866] max-w-xl mx-auto font-light leading-relaxed">
                Menyajikan pilihan kurasi eksklusif dengan fokus pada keahlian siluet dan material premium terbaik.
              </p>
              <div className="w-20 h-px bg-[#241A1A]/30 mx-auto mt-6"></div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b border-t border-[#241A1A]/10 py-5">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#706866]" />
                <input
                  type="text"
                  placeholder="Cari koleksi katalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/70 border border-[#241A1A]/20 pl-9 pr-8 py-2 rounded-full text-xs font-sans text-[#241A1A] focus:outline-none focus:border-[#241A1A]"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end font-sans text-xs">
                <span className="text-gray-500 hidden sm:inline">Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  aria-label="Urutkan Koleksi"
                  className="bg-transparent border-b border-[#241A1A]/30 py-1.5 font-sans text-xs text-[#241A1A] focus:outline-none cursor-pointer"
                >
                  <option value="popular">Kurasi Pilihan</option>
                  <option value="price-asc">Harga: Rendah ke Tinggi</option>
                  <option value="price-desc">Harga: Tinggi ke Rendah</option>
                  <option value="discount">Promo & Diskon</option>
                  <option value="newest">Koleksi Terbaru</option>
                </select>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-12">
              {categoryStats.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`text-xs sm:text-sm tracking-[0.15em] uppercase font-sans py-1 transition-all cursor-pointer ${
                    selectedCategory === cat.name 
                      ? 'text-[#241A1A] font-bold border-b-2 border-[#241A1A]' 
                      : 'text-[#706866] hover:text-[#241A1A]'
                  }`}
                >
                  {cat.name} <span className="text-[11px] opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10">
              {displayedProducts.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => onNavigate && onNavigate('product')}
                  className="group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container with Badges */}
                    <div className="aspect-[3/4] min-h-[220px] sm:min-h-[260px] md:min-h-[280px] bg-white overflow-hidden mb-4 shadow-xs relative rounded-xs">
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      {p.discountPercent && (
                        <div className="absolute top-3 left-3 bg-[#66000E] text-white text-[10px] font-sans font-bold px-2 py-0.5 uppercase tracking-wider">
                          Hemat {p.discountPercent}%
                        </div>
                      )}
                      {p.badge && (
                        <div className="absolute top-3 right-3 bg-white/95 text-[#241A1A] text-[9px] font-sans font-bold px-2 py-0.5 uppercase tracking-widest border border-gray-200 shadow-xs">
                          {p.badge}
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#706866] font-sans mb-1">
                      {p.category}
                    </p>
                    <h3 className="font-serif text-base sm:text-lg md:text-xl font-normal mb-1.5 group-hover:text-[#66000E] transition-colors line-clamp-1 storefront-card-title">
                      {p.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-sans text-[#706866] line-clamp-2 mb-3 leading-relaxed font-light storefront-card-desc">
                      {p.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between font-sans text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span className="font-medium text-[#241A1A]">{p.rating}</span>
                        <span className="text-[11px]">({p.salesCount} terjual)</span>
                      </span>
                      <span className="text-[11px] text-emerald-800 font-medium">
                        Stok {p.stock} unit
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-serif text-lg sm:text-xl md:text-2xl text-[#241A1A] storefront-card-price">
                        Rp {p.price.toLocaleString('id-ID')}
                      </span>
                      {p.originalPrice && (
                        <span className="font-sans text-xs text-[#706866] line-through">
                          Rp {p.originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, p)}
                        className="px-3 py-2.5 border border-[#241A1A] hover:bg-[#241A1A] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                        title="Tambah ke Keranjang"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(e, p)}
                        className="flex-1 py-2.5 bg-[#241A1A] hover:bg-[#66000E] text-white font-sans text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer"
                      >
                        Beli Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-16">
                <button
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-10 py-3.5 border border-[#241A1A] hover:bg-[#241A1A] hover:text-white font-sans text-xs uppercase tracking-[0.2em] transition-all cursor-pointer"
                >
                  Lihat Lebih Banyak Koleksi ({displayedProducts.length} dari {filteredAndSortedProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── 3. LUXURY THEME (Maison Collection) ──────────────────────────────────
    if (activeThemeId === 'luxury') {
      return (
        <div className="pt-24 pb-32 bg-white text-[#3A2D23] min-h-screen font-serif">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] uppercase tracking-[0.35em] text-[#9A6027] block mb-2.5 font-mono font-medium">
                {isEn ? 'Exquisite Selection' : 'Pilihan Istimewa'}
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-[#36281D] font-normal tracking-tight mb-3 storefront-heading-hero">
                {isEn ? 'Maison Collection' : 'Koleksi Maison'}
              </h1>
              <p className="text-xs sm:text-sm font-sans text-[#7D6E63] max-w-lg mx-auto font-light leading-relaxed">
                {isEn 
                  ? 'High fashion garments and luxury accessories crafted with timeless elegance and world-class precision.'
                  : 'Karya seni busana dan aksesori mewah dengan standar keanggunan abadi serta presisi kelas dunia.'}
              </p>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#C8A97E] to-transparent mx-auto mt-6"></div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-[#FAF7F2] border border-[#EADBCE] rounded-xl px-4 py-3.5 shadow-2xs">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A6027]" />
                <input
                  type="text"
                  placeholder={isEn ? "Search exclusive items..." : "Cari item eksklusif..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#E5D7C7] pl-9 pr-4 py-2 rounded-lg text-xs font-sans text-[#36281D] placeholder-[#A8988B] focus:outline-none focus:border-[#9A6027]"
                />
              </div>

              <div className="flex items-center gap-3 font-sans text-xs">
                <span className="text-[#7D6E63]">{isEn ? 'Sort:' : 'Urutkan:'}</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  aria-label={isEn ? "Sort Luxury Collection" : "Urutkan Koleksi Mewah"}
                  className="bg-white border border-[#E5D7C7] px-3 py-2 text-xs font-sans text-[#36281D] rounded-lg focus:outline-none focus:border-[#9A6027] cursor-pointer"
                >
                  <option value="popular">{isEn ? 'Curated Selection' : 'Pilihan Kurasi'}</option>
                  <option value="price-asc">{isEn ? 'Price: Low to High' : 'Harga: Rendah ke Tinggi'}</option>
                  <option value="price-desc">{isEn ? 'Price: High to Low' : 'Harga: Tinggi ke Rendah'}</option>
                  <option value="discount">{isEn ? 'Special Offers' : 'Promo Istimewa'}</option>
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 border-b border-[#F0EBE1] pb-4">
              {categoryStats.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`text-xs tracking-[0.2em] uppercase transition-colors cursor-pointer pb-2 ${
                    selectedCategory === cat.name 
                      ? 'text-[#9A6027] border-b-2 border-[#9A6027] font-semibold' 
                      : 'text-[#827367] hover:text-[#9A6027]'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {displayedProducts.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => onNavigate && onNavigate('product')}
                  className="group cursor-pointer flex flex-col justify-between bg-white rounded-xl p-3 sm:p-3.5 border border-[#F0EBE1] hover:border-[#C8A97E] hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <div className="aspect-[4/5] min-h-[200px] sm:min-h-[240px] bg-[#FAF7F2] rounded-lg overflow-hidden mb-3 relative">
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                      />
                      {p.discountPercent && (
                        <span className="absolute top-2.5 left-2.5 bg-[#8C531B] text-white font-sans text-[10px] font-semibold px-2 py-0.5 rounded-sm tracking-wide shadow-2xs">
                          -{p.discountPercent}%
                        </span>
                      )}
                      {p.badge && (
                        <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-[#8C531B] border border-[#EADBCE] text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#9A6027] block mb-1">
                      {p.category}
                    </span>
                    <h3 className="font-serif text-xs sm:text-sm md:text-base text-[#2B2118] group-hover:text-[#8C531B] transition-colors line-clamp-1 font-normal mb-1 storefront-card-title">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[#8C531B] font-mono text-xs sm:text-sm md:text-base font-semibold storefront-card-price">
                        Rp {p.price.toLocaleString('id-ID')}
                      </p>
                      {p.rating && (
                        <span className="flex items-center gap-1 text-[11px] text-[#A39281] font-sans">
                          <Star className="w-3 h-3 fill-[#C07E28] text-[#C07E28]" /> {p.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#F5F0E6]">
                    <button
                      type="button"
                      onClick={(e) => handleBuyNow(e, p)}
                      className="w-full py-2 bg-[#8C531B] hover:bg-[#724113] text-[#FFFDF9] font-sans font-medium text-[11px] uppercase tracking-[0.15em] rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Buy Now' : 'Beli Sekarang'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-16">
                <button
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-8 py-3.5 border border-[#8C531B] text-[#8C531B] bg-[#FAF7F2] hover:bg-[#8C531B] hover:text-[#FFFDF9] font-sans text-xs uppercase tracking-[0.25em] rounded-lg transition-all duration-300 cursor-pointer shadow-2xs"
                >
                  {isEn 
                    ? `Load More (${displayedProducts.length} of ${filteredAndSortedProducts.length})`
                    : `Muat Lebih Banyak (${displayedProducts.length} dari ${filteredAndSortedProducts.length})`}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── 4. PROFESSIONAL / PRO_CORPORATE (Full Blue B2B Corporate) ─────────────
    if (activeThemeId === 'professional') {
      const PRO_BLUE = '#1E40AF';
      const PRO_DARK = '#1e3a8a';
      return (
        <div className="pt-24 pb-24 bg-gray-50 text-gray-900 min-h-screen font-sans">
          {/* B2B Header Banner */}
          <div className="bg-[#1e3a8a] text-white py-12 px-6 md:px-16 mb-0">
            <div className="max-w-7xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-blue-600/30 border border-blue-400/40 text-blue-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></span>
                Enterprise Catalog
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 storefront-heading-hero">
                Product Catalog
              </h1>
              <p className="text-blue-200 max-w-2xl text-sm leading-relaxed">{storeDesc}</p>
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-blue-200">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Verified Supplier
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Net-30 Payment Terms
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16v2a2 2 0 002 2h14a2 2 0 002-2v-2M16 10l-4 4m0 0l-4-4m4 4V3"/></svg>
                  Bulk Pricing Available
                </span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
            {/* Search & Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/30 focus:border-[#1E40AF] transition"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 cursor-pointer">✕</button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  aria-label="Sort Products"
                  className="py-2 px-3 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/20 focus:border-[#1E40AF] cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
              {categoryStats.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                    selectedCategory === cat.name
                      ? 'bg-[#1E40AF] text-white border-[#1E40AF] shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-blue-50 hover:border-[#1E40AF]/50 border-gray-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Count */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-5 px-1">
              <span>Showing <strong>{displayedProducts.length}</strong> of <strong>{filteredAndSortedProducts.length}</strong> products
                {selectedCategory !== 'Semua' && ` in "${selectedCategory}"`}
              </span>
            </div>

            {/* Products Grid — B2B Corporate Card Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate && onNavigate('product')}
                  className="group cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-[#1E40AF]/40 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="aspect-[4/3] min-h-[160px] sm:min-h-[190px] bg-gray-100 overflow-hidden relative">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    {p.discountPercent && (
                      <div className="absolute top-2.5 left-2.5 bg-[#1E40AF] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        -{p.discountPercent}%
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5 bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                      In Stock
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                    <p className="text-[10px] text-gray-400 font-mono mb-1 uppercase tracking-wider">{p.category}</p>
                    <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1 group-hover:text-[#1E40AF] transition-colors leading-snug storefront-card-title">{p.name}</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed storefront-card-desc">{p.description}</p>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs sm:text-sm md:text-base font-bold text-[#1E40AF] storefront-card-price">Rp {p.price.toLocaleString('id-ID')}</p>
                      {p.rating && <span className="flex items-center gap-1 text-[11px] text-gray-400"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{p.rating}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, p)}
                      className="mt-3 w-full py-2.5 bg-[#1E40AF] hover:bg-[#1e3a8a] text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Quote</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-8 py-3 bg-white border border-gray-300 hover:border-[#1E40AF] text-gray-700 hover:text-[#1E40AF] font-semibold text-xs rounded-xl shadow-xs transition hover:bg-blue-50 cursor-pointer"
                >
                  Load More Products ({displayedProducts.length} of {filteredAndSortedProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── 5. DEFAULT / MINIMALIST / NATURE / CUTE / MODERN / OTHERS ─────────────

    return (
      <div className="pt-24 pb-24 bg-[#FAFAFA] text-[#1A1A1A] min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          {/* Header Title */}
          <div className="text-center mb-10">
            <span className="px-3.5 py-1 bg-[#66000E]/10 text-[#66000E] rounded-full text-xs font-semibold uppercase tracking-wider inline-block mb-3">
              Katalog Lengkap Resmi
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1A1A1A] mb-3 storefront-heading-hero">
              Katalog Produk {storeName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
              {storeDesc}
            </p>
            <div className="w-16 h-1 bg-[#66000E] mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Search, Filter & Sort Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk berdasarkan nama, kategori, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                aria-label="Urutkan Produk Toko"
                className="py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] cursor-pointer"
              >
                <option value="popular">Paling Populer</option>
                <option value="price-asc">Harga: Rendah ke Tinggi</option>
                <option value="price-desc">Harga: Tinggi ke Rendah</option>
                <option value="discount">Diskon Tertinggi</option>
                <option value="newest">Produk Terbaru</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {categoryStats.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.name 
                    ? 'bg-[#66000E] text-white shadow-sm' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Products Summary Count */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-6 px-1">
            <span>
              Menampilkan <strong>{displayedProducts.length}</strong> dari <strong>{filteredAndSortedProducts.length}</strong> produk
              {selectedCategory !== 'Semua' && ` di kategori "${selectedCategory}"`}
            </span>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate && onNavigate('product')}
                className="group cursor-pointer bg-white rounded-2xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="aspect-[4/5] min-h-[200px] sm:min-h-[240px] md:min-h-[260px] bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {p.discountPercent && (
                      <div className="absolute top-2.5 left-2.5 bg-[#66000E] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        -{p.discountPercent}%
                      </div>
                    )}

                    {p.badge && (
                      <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {p.badge}
                      </div>
                    )}
                  </div>

                  {/* Category Tag */}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#66000E] block mb-1">
                    {p.category}
                  </span>

                  {/* Product Title */}
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base leading-snug line-clamp-1 mb-1.5 group-hover:text-[#66000E] transition-colors storefront-card-title">
                    {p.name}
                  </h3>

                  {/* Short Description */}
                  <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed font-normal storefront-card-desc">
                    {p.description}
                  </p>
                </div>

                <div>
                  {/* Rating & Stock */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 mb-2.5">
                    <span className="flex items-center gap-1 text-gray-800 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{p.rating}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({p.salesCount}+ terjual)</span>
                    </span>
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ Stok {p.stock}
                    </span>
                  </div>

                  {/* Price Block */}
                  <div className="mb-3.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-900 font-extrabold text-sm sm:text-base md:text-lg storefront-card-price">
                        Rp {p.price.toLocaleString('id-ID')}
                      </span>
                      {p.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          Rp {p.originalPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, p)}
                      className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-400 text-gray-700 hover:text-black transition cursor-pointer flex items-center justify-center shrink-0"
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleBuyNow(e, p)}
                      className="flex-1 py-2.5 bg-black hover:bg-[#66000E] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Beli Sekarang</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount(prev => prev + 8)}
                className="px-8 py-3.5 bg-white border border-gray-300 hover:border-gray-800 text-gray-800 font-bold text-xs rounded-xl shadow-xs transition hover:bg-gray-50 cursor-pointer"
              >
                Muat Lebih Banyak Produk ({displayedProducts.length} dari {filteredAndSortedProducts.length})
              </button>
            </div>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen relative">
      {CustomNavbar ? (
        <CustomNavbar sectionOptions={navbarOptions} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      ) : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderThemeContent()}</div>

      {CustomFooter ? (
        <CustomFooter sectionOptions={footerOptions} />
      ) : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
