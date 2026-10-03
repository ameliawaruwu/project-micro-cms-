import React from 'react';
import { useParams } from 'react-router-dom';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { ShoppingCart, Heart, ShieldCheck, Truck, Star, ArrowRight, Sparkles } from 'lucide-react';

import { useCmsStore } from '../../cms/useCmsStore';
import { cartService } from '../../services/cartService';

interface ProductDetailPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  products?: Product[];
  productId?: string;
  onNavigate?: (pageId: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ 
  themeData, 
  themeId: propThemeId, 
  store, 
  products = [], 
  productId: propProductId,
  onNavigate 
}) => {
  const cmsProducts = useCmsStore(state => state.products);
  const { id: paramId } = useParams<{ id: string }>();
  const id = propProductId || paramId;
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const displayProducts = (products && products.length > 0) ? products : (cmsProducts && cmsProducts.length > 0 ? (cmsProducts as any[]) : []);

  const product = displayProducts?.find(p => p.id === id || p.slug === id) || displayProducts[0] || {
    id: 'sample-1',
    name: 'Produk Unggulan Premium',
    price: 349000,
    description: 'Produk dibuat dengan material pilihan berkualitas tinggi. Memiliki daya tahan ekstra dan desain yang sangat stylish untuk menunjang penampilan harian Anda.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
  };

  const liveStoreInfo = useCmsStore((state) => state.storeInfo);
  const storeName = liveStoreInfo?.name || store?.name || 'Toko Kami';
  const storeDesc = liveStoreInfo?.description || store?.description || '';

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const activeStoreSlug = store?.slug || (liveStoreInfo as any)?.slug;
    if (activeStoreSlug && product) {
      cartService.addToCart(activeStoreSlug, product as any, 1);
      window.dispatchEvent(new CustomEvent('cart_updated'));
      window.dispatchEvent(new CustomEvent('toast_notification', {
        detail: { message: `"${product.name}" berhasil dimasukkan ke keranjang!`, type: 'success' }
      }));
    }
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const activeStoreSlug = store?.slug || (liveStoreInfo as any)?.slug;
    if (activeStoreSlug && product) {
      cartService.addToCart(activeStoreSlug, product as any, 1);
      window.dispatchEvent(new CustomEvent('cart_updated'));
      if (onNavigate) {
        onNavigate('checkout');
      } else {
        window.dispatchEvent(new CustomEvent('open_cart'));
      }
    }
  };

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

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderProductContent = () => {
    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black border-b-8 border-black">
          <div className="max-w-7xl mx-auto px-6 md:flex items-center gap-16">
            <div className="w-full md:w-1/2 border-8 border-black p-4 shadow-[16px_16px_0px_rgba(0,0,0,1)] bg-white">
              <img src={product.imageUrl || (product as any).image} alt={product.name} className="w-full h-auto object-cover border-4 border-black" />
            </div>
            <div className="w-full md:w-1/2 mt-12 md:mt-0">
              <span className="px-4 py-2 bg-[#FF0000] text-white font-black text-sm uppercase tracking-widest border-2 border-black inline-block mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                HOT DROP 🔥
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tighter leading-none mb-4 sm:mb-6 storefront-heading-hero">
                {product.name}
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-black uppercase tracking-tighter mb-6 sm:mb-8 bg-yellow-300 inline-block px-3 sm:px-4 py-1.5 sm:py-2 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] storefront-card-price">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <p className="text-sm sm:text-base md:text-lg font-bold uppercase tracking-wide text-gray-800 leading-relaxed mb-6 sm:mb-8 border-l-4 sm:border-l-8 border-[#FF0000] pl-4 sm:pl-6 storefront-card-desc">
                {product.description}
              </p>
              <div className="space-y-4">
                <button 
                  onClick={handleBuyNow}
                  className="w-full py-4 sm:py-6 bg-black text-white text-lg sm:text-xl md:text-2xl font-black uppercase tracking-widest hover:bg-[#FF0000] transition-all border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  BELI SEKARANG 🛒
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. EDITORIAL THEME
    if (activeThemeId === 'editorial') {
      return (
        <div className="pt-32 pb-32 bg-[#FAF7F7] text-[#241A1A]">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-5/12 order-2 md:order-1">
              <span className="text-xs uppercase tracking-[0.3em] text-[#706866] block mb-3 font-serif italic">Edition N°01</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal font-serif mb-4 sm:mb-6 leading-tight storefront-heading-hero">
                {product.name}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-[#706866] font-serif italic mb-6 sm:mb-8 storefront-card-price">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <p className="text-xs sm:text-sm md:text-base text-[#241A1A] leading-relaxed sm:leading-loose mb-6 sm:mb-10 font-serif storefront-card-desc">
                {product.description}
              </p>
              <button 
                onClick={handleAddToCart}
                className="w-full py-4 border border-[#241A1A] text-[#241A1A] font-serif uppercase tracking-[0.2em] hover:bg-[#241A1A] hover:text-white transition-colors duration-500 cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
            <div className="w-full md:w-7/12 order-1 md:order-2">
              <div className="p-4 bg-white shadow-xl border border-[#241A1A]/10">
                <img src={product.imageUrl || (product as any).image} alt={product.name} className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-6 backdrop-blur-md relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-950">
                <img src={product.imageUrl || (product as any).image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <span className="absolute top-10 left-10 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-xs rounded-full">
                [VERIFIED_ITEM]
              </span>
            </div>
            <div className="space-y-6">
              <span className="text-xs text-cyan-400 uppercase tracking-widest">[ITEM_CODE: #PROD-{product.id || '881'}]</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent storefront-heading-hero">
                {product.name}
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-300 storefront-card-price">Rp {product.price.toLocaleString('id-ID')}</p>
              <div className="p-3.5 sm:p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300 text-xs sm:text-sm leading-relaxed storefront-card-desc">
                {product.description}
              </div>
              <div className="pt-4 space-y-3">
                <button 
                  onClick={handleBuyNow}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:opacity-90 cursor-pointer"
                >
                  ACQUIRE ITEM
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. NATURE THEME
    if (activeThemeId === 'nature') {
      return (
        <div className="pt-28 pb-24 bg-[#F4F7F4] text-[#1B3B2B] min-h-screen">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-[#2D5A27]/10">
              <img src={product.imageUrl || (product as any).image} alt={product.name} className="w-full h-auto object-cover rounded-2xl" />
            </div>
            <div className="space-y-6">
              <span className="px-4 py-1.5 bg-[#2D5A27]/10 text-[#2D5A27] rounded-full text-xs font-bold uppercase tracking-wider inline-block">
                🌿 Bahan Alami Pilihan
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1B3B2B] storefront-heading-hero">{product.name}</h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2D5A27] storefront-card-price">Rp {product.price.toLocaleString('id-ID')}</p>
              <p className="text-[#1B3B2B]/80 text-xs sm:text-sm md:text-base leading-relaxed storefront-card-desc">{product.description}</p>
              <button 
                onClick={handleBuyNow}
                className="w-full py-4 bg-[#2D5A27] text-white rounded-2xl font-bold text-base hover:bg-[#1B3B2B] transition-colors shadow-lg cursor-pointer"
              >
                Beli Sekarang 🍃
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 5. LUXURY THEME
    if (activeThemeId === 'luxury') {
      return (
        <div className="pt-32 pb-32 bg-[#F7F2EB] text-[#36281D] min-h-screen font-serif">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="border border-[#EADBCE] p-4 rounded-2xl bg-[#FFFDF9] shadow-[0_16px_36px_rgba(90,65,40,0.08)]">
              <img src={product.imageUrl || (product as any).image} alt={product.name} className="w-full h-auto object-cover rounded-xl" />
            </div>
            <div className="space-y-6">
              <span className="text-[11px] uppercase tracking-[0.35em] text-[#9A6027] font-mono font-medium">Masterpiece Collection</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#36281D] storefront-heading-hero">{product.name}</h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-mono text-[#8C531B] font-bold storefront-card-price">Rp {product.price.toLocaleString('id-ID')}</p>
              <div className="w-16 h-px bg-[#C8A97E]"></div>
              <p className="text-[#7D6E63] text-xs sm:text-sm md:text-base leading-relaxed font-sans font-light storefront-card-desc">{product.description}</p>
              <button 
                onClick={handleBuyNow}
                className="w-full py-4 bg-[#8C531B] hover:bg-[#724113] text-[#FFFDF9] font-sans text-xs uppercase tracking-[0.2em] rounded-lg shadow-sm transition-all duration-300 cursor-pointer"
              >
                Pesan Koleksi Eksklusif
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 6. CUTE THEME
    if (activeThemeId === 'cute') {
      return (
        <div className="pt-28 pb-24 bg-[#FFF5F8] text-[#4A154B]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-pink-100 border border-pink-100">
              <img src={product.imageUrl || (product as any).image} alt={product.name} className="w-full h-auto object-cover rounded-2xl" />
            </div>
            <div className="space-y-6">
              <span className="px-4 py-1.5 bg-pink-200 text-pink-700 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
                💖 Pilihan Favorit
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#4A154B] storefront-heading-hero">{product.name}</h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-pink-500 storefront-card-price">Rp {product.price.toLocaleString('id-ID')}</p>
              <p className="text-[#4A154B]/80 text-xs sm:text-sm md:text-base leading-relaxed storefront-card-desc">{product.description}</p>
              <button 
                onClick={handleAddToCart}
                className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-bold text-base shadow-lg shadow-pink-200 hover:scale-102 transition-transform cursor-pointer"
              >
                Masukkan Keranjang Belanja 🛍️
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 7. DEFAULT / MINIMALIST / CREATIVE / PROFESSIONAL / ELEGANT / FASHION
    return (
      <div className="pt-32 pb-24 bg-white text-[#1A1A1A]">
        <div className="max-w-5xl mx-auto px-6 md:flex gap-16 items-center">
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] bg-gray-50 overflow-hidden rounded-xl">
              <img src={product.imageUrl || (product as any).image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-center mt-8 md:mt-0 space-y-4 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#1A1A1A] tracking-tight storefront-heading-hero">{product.name}</h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-900 font-bold storefront-card-price">Rp {product.price.toLocaleString('id-ID')}</p>
            <div className="w-12 h-px bg-gray-300"></div>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed storefront-card-desc">{product.description}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 border-2 border-[#1A1A1A] text-[#1A1A1A] text-xs sm:text-sm font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors rounded-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 py-3.5 px-6 bg-[#1A1A1A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-lg cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>Beli Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {CustomNavbar ? (
        <CustomNavbar sectionOptions={navbarOptions} />
      ) : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderProductContent()}</div>

      {CustomFooter ? (
        <CustomFooter sectionOptions={footerOptions} />
      ) : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
