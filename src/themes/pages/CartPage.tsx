import React from 'react';
import { ThemeSchema } from '../schema';
import { useNavigate } from 'react-router-dom';

import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface CartPageProps {
  themeData: ThemeSchema;
}

export const CartPage: React.FC<CartPageProps> = ({ themeData }) => {
  const { settings, themeId, sections } = themeData;
  const navigate = useNavigate();

  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={themeId} />
      )}

      {/* --- CART VARIANT RENDERER --- */}
      
      {themeId.includes('compact') ? (
        <div className="pt-24 pb-16 bg-[#F3F4F6] flex-1">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-2xl font-black mb-6 uppercase tracking-tight text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" /> Keranjang Belanja
            </h1>
            
            <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 text-center py-20">
              <p className="text-gray-500 font-medium mb-6">Keranjang Anda masih kosong.</p>
              <button onClick={() => navigate('/products')} className="px-8 py-3 bg-[#0055FF] text-white font-black uppercase tracking-widest rounded shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-yellow-400 hover:text-black hover:shadow-none transition-all inline-flex items-center gap-2">
                Mulai Belanja <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : themeId.includes('editorial') ? (
        <div className="pt-32 pb-32 bg-[#FAF7F7] flex-1">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl lg:text-7xl font-normal text-[#241A1A] mb-8 uppercase tracking-widest" style={{ fontFamily: settings.fontFamily }}>
              Your Bag
            </h1>
            <div className="border-t border-b border-[#241A1A]/10 py-24 my-16">
              <p className="text-xl text-[#706866] italic mb-12 tracking-wide" style={{ fontFamily: settings.fontFamily }}>
                It seems your bag is currently empty.
              </p>
              <button onClick={() => navigate('/products')} className="px-12 py-4 border border-[#241A1A] text-[#241A1A] uppercase tracking-[0.2em] hover:bg-[#241A1A] hover:text-white transition-colors duration-500">
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      ) : themeId.includes('bold') ? (
        <div className="pt-24 pb-32 bg-white flex-1 border-b-8 border-black text-center">
          <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-7xl md:text-9xl font-black text-black uppercase tracking-tighter mb-12" style={{ fontFamily: settings.fontFamily }}>
              YOUR CART
            </h1>
            <div className="bg-[#FF0000] p-12 border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)]">
              <p className="text-4xl font-black text-white uppercase tracking-widest mb-12">
                IT'S EMPTY. FIX THAT.
              </p>
              <button onClick={() => navigate('/products')} className="px-12 py-6 bg-black text-white text-2xl font-black uppercase tracking-widest hover:bg-white hover:text-black hover:scale-110 transition-transform border-4 border-black inline-flex items-center gap-4">
                SHOP NOW <ShoppingBag className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      ) : themeId.includes('lifestyle') ? (
        <div className="pt-32 pb-32 bg-[#FDFBF7] flex-1">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-medium text-[#3E3E3E] mb-6 tracking-tight" style={{ fontFamily: settings.fontFamily }}>
              Your Bag
            </h1>
            <div className="w-16 h-1 bg-[#D9A05B] rounded-full mx-auto mb-16"></div>
            
            <div className="bg-white p-12 rounded-3xl shadow-xl">
              <ShoppingBag className="w-16 h-16 text-[#D9A05B]/50 mx-auto mb-6" />
              <p className="text-xl text-gray-500 font-light mb-10">Your bag is thoughtfully empty.</p>
              <button onClick={() => navigate('/products')} className="px-10 py-4 bg-[#D9A05B] text-white text-sm font-semibold rounded-full hover:bg-[#c28e4e] transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                Discover Goods
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MINIMALIST (Default) */
        <div className="pt-32 pb-24 bg-white flex-1">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-light text-[#1A1A1A] tracking-tight mb-4">Shopping Cart</h1>
            <div className="w-12 h-px bg-gray-300 mx-auto mb-16"></div>
            
            <p className="text-gray-500 font-light mb-10">Your cart is currently empty.</p>
            
            <button onClick={() => navigate('/products')} className="px-10 py-4 bg-[#1A1A1A] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
              Return to Shop
            </button>
          </div>
        </div>
      )}

      {footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={themeId} />
      )}
    </div>
  );
};
