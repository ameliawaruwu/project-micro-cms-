import React from 'react';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { ShoppingBag, ArrowRight, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

interface CartPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  products?: Product[];
  onNavigate?: (pageId: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ themeData, themeId: propThemeId, store, products = [], onNavigate }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const sampleItem = products[0] || {
    name: 'Sample Item Premium',
    price: 150000,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
  };

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderCartContent = () => {
    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter mb-8">
              KERANJANG BELANJA
            </h1>
            <div className="bg-[#FF0000] p-8 md:p-12 border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="bg-white p-6 border-4 border-black flex items-center justify-between shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-4">
                  <img src={sampleItem.imageUrl || (sampleItem as any).image} alt={sampleItem.name} className="w-20 h-20 object-cover border-2 border-black" />
                  <div>
                    <h3 className="font-black text-xl uppercase">{sampleItem.name}</h3>
                    <p className="font-black text-lg text-[#FF0000]">Rp {sampleItem.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <button className="p-3 bg-black text-white font-black hover:bg-[#FF0000] border-2 border-black">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-yellow-300 p-6 border-4 border-black flex justify-between items-center text-xl font-black">
                <span>TOTAL:</span>
                <span>Rp {sampleItem.price.toLocaleString('id-ID')}</span>
              </div>
              <button 
                onClick={() => onNavigate ? onNavigate('checkout') : null}
                className="w-full py-6 bg-black text-white text-2xl font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)]"
              >
                LANJUT PENGIRIMAN 🚀
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. EDITORIAL THEME
    if (activeThemeId === 'editorial') {
      return (
        <div className="pt-32 pb-32 bg-[#FAF7F7] text-[#241A1A] min-h-screen">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl lg:text-7xl font-normal font-serif mb-8 uppercase tracking-widest">
              Your Selection
            </h1>
            <div className="border-t border-b border-[#241A1A]/10 py-12 my-12 text-left space-y-6">
              <div className="flex items-center justify-between border-b border-[#241A1A]/10 pb-6">
                <div className="flex items-center gap-6">
                  <img src={sampleItem.imageUrl || (sampleItem as any).image} alt={sampleItem.name} className="w-24 h-24 object-cover" />
                  <div>
                    <h3 className="font-serif text-2xl mb-1">{sampleItem.name}</h3>
                    <p className="font-serif italic text-[#706866]">Rp {sampleItem.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <span className="font-serif italic text-xl">1 Item</span>
              </div>
              <div className="flex justify-between font-serif text-2xl pt-4">
                <span>Subtotal</span>
                <span>Rp {sampleItem.price.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate ? onNavigate('checkout') : null}
              className="px-12 py-4 border border-[#241A1A] text-[#241A1A] font-serif uppercase tracking-[0.2em] hover:bg-[#241A1A] hover:text-white transition-colors duration-500"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      );
    }

    // 3. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-4xl mx-auto px-6">
            <div className="border-b border-cyan-500/20 pb-6 mb-8">
              <span className="text-xs text-cyan-400 uppercase tracking-widest">[CART_STATUS: ACTIVE]</span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                ACQUISITION BUFFER
              </h1>
            </div>
            <div className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-md space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-4">
                  <img src={sampleItem.imageUrl || (sampleItem as any).image} alt={sampleItem.name} className="w-16 h-16 object-cover rounded-lg border border-cyan-500/30" />
                  <div>
                    <h3 className="font-bold text-slate-100">{sampleItem.name}</h3>
                    <p className="text-cyan-400 text-sm">Rp {sampleItem.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-400">QTY: 1</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between text-lg font-bold text-cyan-300">
                <span>TOTAL_CREDITS:</span>
                <span>Rp {sampleItem.price.toLocaleString('id-ID')}</span>
              </div>
              <button 
                onClick={() => onNavigate ? onNavigate('checkout') : null}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              >
                EXECUTE TRANSACTION ⚡
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 4. NATURE THEME
    if (activeThemeId === 'nature') {
      return (
        <div className="pt-28 pb-24 bg-[#F4F7F4] text-[#1B3B2B] min-h-screen font-sans">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold mb-8 text-[#1B3B2B]">Keranjang Pesanan</h1>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#2D5A27]/10 space-y-6">
              <div className="flex items-center justify-between border-b border-[#2D5A27]/10 pb-6">
                <div className="flex items-center gap-4">
                  <img src={sampleItem.imageUrl || (sampleItem as any).image} alt={sampleItem.name} className="w-20 h-20 object-cover rounded-2xl" />
                  <div>
                    <h3 className="font-bold text-lg text-[#1B3B2B]">{sampleItem.name}</h3>
                    <p className="text-[#2D5A27] font-extrabold">Rp {sampleItem.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <button className="text-[#2D5A27] hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="flex justify-between font-extrabold text-xl text-[#1B3B2B] pt-2">
                <span>Total Pesanan</span>
                <span className="text-[#2D5A27]">Rp {sampleItem.price.toLocaleString('id-ID')}</span>
              </div>
              <button 
                onClick={() => onNavigate ? onNavigate('checkout') : null}
                className="w-full py-4 bg-[#2D5A27] text-white rounded-2xl font-bold text-base hover:bg-[#1B3B2B] transition-colors shadow-lg"
              >
                Lanjut ke Checkout 🌿
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 5. CUTE THEME
    if (activeThemeId === 'cute') {
      return (
        <div className="pt-28 pb-24 bg-[#FFF5F8] text-[#4A154B] min-h-screen">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl font-black mb-8 text-[#4A154B]">Keranjang Cantik 💖</h1>
            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-pink-100 border border-pink-100 space-y-6">
              <div className="flex items-center justify-between border-b border-pink-100 pb-6">
                <div className="flex items-center gap-4">
                  <img src={sampleItem.imageUrl || (sampleItem as any).image} alt={sampleItem.name} className="w-20 h-20 object-cover rounded-2xl" />
                  <div>
                    <h3 className="font-bold text-lg text-[#4A154B]">{sampleItem.name}</h3>
                    <p className="text-pink-500 font-black">Rp {sampleItem.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <button className="text-pink-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="flex justify-between font-black text-xl text-[#4A154B]">
                <span>Total Belanja</span>
                <span className="text-pink-500">Rp {sampleItem.price.toLocaleString('id-ID')}</span>
              </div>
              <button 
                onClick={() => onNavigate ? onNavigate('checkout') : null}
                className="w-full py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-2xl font-bold text-base shadow-md shadow-pink-200"
              >
                Bayar Sekarang ✨
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 6. DEFAULT / MINIMALIST / LUXURY / CREATIVE / PROFESSIONAL / ELEGANT / FASHION
    return (
      <div className="pt-32 pb-24 bg-white text-[#1A1A1A] min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-light tracking-tight mb-8">Keranjang Belanja</h1>
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-6">
              <div className="flex items-center gap-4">
                <img src={sampleItem.imageUrl || (sampleItem as any).image} alt={sampleItem.name} className="w-20 h-20 object-cover rounded-lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">{sampleItem.name}</h3>
                  <p className="text-gray-600 font-medium">Rp {sampleItem.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900">
              <span>Total</span>
              <span>Rp {sampleItem.price.toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={() => onNavigate ? onNavigate('checkout') : null}
              className="w-full py-4 bg-black text-white rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition"
            >
              Lanjut ke Checkout
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
      
      <div className="flex-1">{renderCartContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
