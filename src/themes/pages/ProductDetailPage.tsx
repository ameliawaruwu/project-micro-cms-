import React from 'react';
import { useParams } from 'react-router-dom';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';

import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ShoppingCart } from 'lucide-react';

interface ProductDetailPageProps {
  themeData: ThemeSchema;
  products?: Product[];
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ themeData, products }) => {
  const { id } = useParams<{ id: string }>();
  const { settings, themeId, sections } = themeData;

  const product = products?.find(p => p.id === id) || {
    name: 'Sample Premium Product',
    price: 499000,
    description: 'This is a beautifully crafted sample product designed to showcase the layout of your new theme. Enjoy the crisp typography, clear spacing, and seamless integration.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop'
  };

  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={themeId} />
      )}

      {/* --- PRODUCT DETAIL VARIANT RENDERER --- */}
      
      {themeId.includes('compact') ? (
        <div className="pt-24 pb-16 bg-[#F3F4F6] flex-1">
          <div className="max-w-7xl mx-auto px-4 md:flex gap-8">
            <div className="w-full md:w-1/2 bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover rounded mix-blend-multiply" />
            </div>
            <div className="w-full md:w-1/2 mt-6 md:mt-0 bg-white p-6 md:p-8 rounded-md shadow-sm border border-gray-200">
              <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-black uppercase tracking-widest rounded-sm">Hot Item</span>
              <h1 className="text-3xl font-black mt-4 uppercase tracking-tight text-gray-900">{product.name}</h1>
              <p className="text-[#0055FF] text-3xl font-black mt-2">Rp {product.price.toLocaleString('id-ID')}</p>
              
              <div className="my-6 border-t border-b py-4">
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{product.description}</p>
              </div>

              <button className="w-full py-4 bg-[#0055FF] text-white font-black uppercase tracking-widest rounded shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-yellow-400 hover:text-black hover:shadow-none transition-all flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Masukkan Keranjang
              </button>
            </div>
          </div>
        </div>
      ) : themeId.includes('editorial') ? (
        <div className="pt-32 pb-32 bg-[#FAF7F7] flex-1">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-5/12 order-2 md:order-1">
              <h1 className="text-5xl lg:text-7xl font-normal text-[#241A1A] mb-8 leading-tight" style={{ fontFamily: settings.fontFamily }}>
                {product.name}
              </h1>
              <p className="text-xl text-[#706866] italic mb-12 tracking-wide" style={{ fontFamily: settings.fontFamily }}>
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <p className="text-base text-[#241A1A] leading-loose mb-12">
                {product.description}
              </p>
              <button className="px-12 py-4 border border-[#241A1A] text-[#241A1A] uppercase tracking-[0.2em] hover:bg-[#241A1A] hover:text-white transition-colors duration-500">
                Add to Cart
              </button>
            </div>
            <div className="w-full md:w-7/12 order-1 md:order-2">
              <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover shadow-2xl" />
            </div>
          </div>
        </div>
      ) : themeId.includes('bold') ? (
        <div className="pt-24 pb-24 bg-white flex-1 border-b-8 border-black">
          <div className="max-w-7xl mx-auto px-6 md:flex items-center gap-16">
            <div className="w-full md:w-1/2 border-8 border-black p-4 shadow-[16px_16px_0px_rgba(0,0,0,1)]">
              <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover border-4 border-black filter contrast-125 grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            <div className="w-full md:w-1/2 mt-16 md:mt-0">
              <h1 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter leading-none mb-6" style={{ fontFamily: settings.fontFamily }}>
                {product.name}
              </h1>
              <p className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter mb-8">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              <p className="text-xl font-bold uppercase tracking-widest text-gray-700 leading-relaxed mb-12 border-l-8 border-[#FF0000] pl-6">
                {product.description}
              </p>
              <button className="w-full py-6 bg-black text-white text-2xl font-black uppercase tracking-widest hover:bg-[#FF0000] hover:scale-105 transition-transform border-4 border-black">
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      ) : themeId.includes('lifestyle') ? (
        <div className="pt-24 pb-24 bg-[#FDFBF7] flex-1">
          <div className="max-w-6xl mx-auto px-6 md:flex items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-white">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center" />
              </div>
            </div>
            <div className="w-full md:w-1/2 mt-12 md:mt-0">
              <p className="text-[#D9A05B] font-medium tracking-widest uppercase text-sm mb-4">New Arrival</p>
              <h1 className="text-4xl md:text-5xl font-medium text-[#3E3E3E] mb-6 tracking-tight" style={{ fontFamily: settings.fontFamily }}>
                {product.name}
              </h1>
              <p className="text-2xl text-[#3E3E3E]/80 font-light mb-8">Rp {product.price.toLocaleString('id-ID')}</p>
              <div className="w-16 h-px bg-[#D9A05B] mb-8"></div>
              <p className="text-gray-500 font-light leading-relaxed mb-10 text-lg">
                {product.description}
              </p>
              <button className="w-full py-4 bg-[#D9A05B] text-white text-sm font-semibold rounded-full hover:bg-[#c28e4e] transition-colors shadow-lg hover:shadow-xl">
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MINIMALIST (Default) */
        <div className="pt-32 pb-24 bg-white flex-1">
          <div className="max-w-5xl mx-auto px-6 md:flex gap-16">
            <div className="w-full md:w-1/2">
              <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center" />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center mt-10 md:mt-0">
              <h1 className="text-4xl font-light text-[#1A1A1A] tracking-tight mb-4">{product.name}</h1>
              <p className="text-xl text-gray-500 font-light mb-8">Rp {product.price.toLocaleString('id-ID')}</p>
              <div className="w-12 h-px bg-gray-300 mb-8"></div>
              <p className="text-gray-500 font-light leading-relaxed mb-10">{product.description}</p>
              
              <button className="w-full py-4 bg-[#1A1A1A] text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={themeId} />
      )}
    </div>
  );
};
