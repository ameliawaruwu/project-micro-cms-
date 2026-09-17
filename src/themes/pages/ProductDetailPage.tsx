import React from 'react';
import { useParams } from 'react-router-dom';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { ShoppingCart, Heart, ShieldCheck, Truck, Star, ArrowRight, Sparkles } from 'lucide-react';

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
  const { id: paramId } = useParams<{ id: string }>();
  const id = propProductId || paramId;
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const product = products?.find(p => p.id === id) || products[0] || {
    id: 'sample-1',
    name: 'Produk Unggulan Premium',
    price: 349000,
    description: 'Produk dibuat dengan material pilihan berkualitas tinggi. Memiliki daya tahan ekstra dan desain yang sangat stylish untuk menunjang penampilan harian Anda.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
  };

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

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
              <h1 className="text-5xl md:text-7xl font-black text-black uppercase tracking-tighter leading-none mb-6">
                {product.name}
              </h1>
              <p className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter mb-8 bg-yellow-300 inline-block px-4 py-2 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <p className="text-lg font-bold uppercase tracking-wide text-gray-800 leading-relaxed mb-8 border-l-8 border-[#FF0000] pl-6">
                {product.description}
              </p>
              <div className="space-y-4">
                <button className="w-full py-6 bg-black text-white text-2xl font-black uppercase tracking-widest hover:bg-[#FF0000] transition-all border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]">
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
              <h1 className="text-4xl lg:text-6xl font-normal font-serif mb-6 leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl text-[#706866] font-serif italic mb-8">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <p className="text-base text-[#241A1A] leading-loose mb-10 font-serif">
                {product.description}
              </p>
              <button className="w-full py-4 border border-[#241A1A] text-[#241A1A] font-serif uppercase tracking-[0.2em] hover:bg-[#241A1A] hover:text-white transition-colors duration-500">
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
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-cyan-300">Rp {product.price.toLocaleString('id-ID')}</p>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300 text-sm leading-relaxed">
                {product.description}
              </div>
              <div className="pt-4 space-y-3">
                <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:opacity-90">
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
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#1B3B2B]">{product.name}</h1>
              <p className="text-3xl font-extrabold text-[#2D5A27]">Rp {product.price.toLocaleString('id-ID')}</p>
              <p className="text-[#1B3B2B]/80 text-base leading-relaxed">{product.description}</p>
              <button className="w-full py-4 bg-[#2D5A27] text-white rounded-2xl font-bold text-base hover:bg-[#1B3B2B] transition-colors shadow-lg">
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
        <div className="pt-32 pb-32 bg-[#0F172A] text-white min-h-screen font-serif">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="border border-[#D4AF37]/40 p-4 rounded bg-[#1E293B]/40">
              <img src={product.imageUrl || (product as any).image} alt={product.name} className="w-full h-auto object-cover rounded" />
            </div>
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-mono">Masterpiece Collection</span>
              <h1 className="text-4xl md:text-6xl font-light text-white">{product.name}</h1>
              <p className="text-3xl font-mono text-[#D4AF37]">Rp {product.price.toLocaleString('id-ID')}</p>
              <div className="w-20 h-0.5 bg-[#D4AF37]/50"></div>
              <p className="text-slate-300 text-base leading-relaxed font-sans">{product.description}</p>
              <button className="w-full py-4 border border-[#D4AF37] text-[#D4AF37] font-sans text-xs uppercase tracking-[0.2em] hover:bg-[#D4AF37] hover:text-black transition-colors">
                Order Private Reserve
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
              <h1 className="text-4xl md:text-5xl font-black text-[#4A154B]">{product.name}</h1>
              <p className="text-3xl font-black text-pink-500">Rp {product.price.toLocaleString('id-ID')}</p>
              <p className="text-[#4A154B]/80 text-base leading-relaxed">{product.description}</p>
              <button className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-bold text-base shadow-lg shadow-pink-200 hover:scale-102 transition-transform">
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
          <div className="w-full md:w-1/2 flex flex-col justify-center mt-10 md:mt-0 space-y-6">
            <h1 className="text-4xl font-light text-[#1A1A1A] tracking-tight">{product.name}</h1>
            <p className="text-2xl text-gray-900 font-bold">Rp {product.price.toLocaleString('id-ID')}</p>
            <div className="w-12 h-px bg-gray-300"></div>
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            <button className="w-full py-4 bg-[#1A1A1A] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors rounded-lg">
              Tambah ke Keranjang
            </button>
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
      
      <div className="flex-1">{renderProductContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
