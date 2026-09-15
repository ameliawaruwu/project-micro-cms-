import React from 'react';
import { ProductGridSettings, ThemeSettings } from '../schema';
import { Product } from '../../types';
import { ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  settings: ProductGridSettings;
  themeSettings: ThemeSettings;
  products?: Product[];
  themeId?: string;
}

const mockProducts = [
  { id: '1', name: 'Premium Item 1', price: 299000, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop' },
  { id: '2', name: 'Exclusive Design', price: 450000, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop' },
  { id: '3', name: 'Signature Collection', price: 890000, imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop' },
  { id: '4', name: 'Limited Edition', price: 1200000, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop' },
  { id: '5', name: 'Essential Basics', price: 199000, imageUrl: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=500&auto=format&fit=crop' },
  { id: '6', name: 'Modern Classic', price: 750000, imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop' },
  { id: '7', name: 'Urban Style', price: 320000, imageUrl: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&auto=format&fit=crop' },
  { id: '8', name: 'Vintage Find', price: 550000, imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500&auto=format&fit=crop' },
];

export const ProductGridSection: React.FC<Props> = ({ settings, themeSettings, products, themeId }) => {
  const displayProducts = (products || mockProducts).slice(0, settings.maxItems || 8);
  const navigate = useNavigate();

  // --- 1. COMPACT / MODERN CATALOG THEME ---
  if (themeId && themeId.includes('compact')) {
    return (
      <section className="py-12 bg-[#F3F4F6]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {settings.title && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">{settings.title}</h2>
              <Link to="/products" className="text-sm font-bold text-[#0055FF] hover:underline">Lihat Semua &rarr;</Link>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {displayProducts.map((product, idx) => (
              <div key={product.id || idx} className="bg-white rounded-md border border-gray-200 overflow-hidden group hover:border-[#0055FF] transition-colors relative flex flex-col cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">-20%</div>
                <div className="aspect-square overflow-hidden bg-gray-100 p-4 relative">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <h3 className="text-xs md:text-sm text-gray-700 font-medium line-clamp-2 mb-1">{product.name}</h3>
                  <div className="mt-auto">
                    {settings.showPrices && (
                      <p className="text-[#0055FF] font-black text-sm md:text-base">Rp {product.price.toLocaleString('id-ID')}</p>
                    )}
                    <button className="w-full mt-3 py-2 bg-gray-100 text-gray-900 text-xs font-bold rounded hover:bg-[#0055FF] hover:text-white transition-colors flex items-center justify-center gap-2" onClick={(e) => { e.stopPropagation(); navigate('/cart'); }}>
                      <ShoppingCart className="w-3.5 h-3.5" /> Beli
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- 2. EDITORIAL / STORYTELLING THEME ---
  if (themeId && themeId.includes('editorial')) {
    return (
      <section className="py-24 bg-[#FAF7F7]">
        <div className="mx-auto px-6 lg:px-12 w-full max-w-7xl">
          {settings.title && (
            <h2 className="text-3xl md:text-5xl font-normal text-center mb-20 text-[#241A1A]" style={{ fontFamily: themeSettings.fontFamily }}>
              {settings.title}
            </h2>
          )}
          
          <div className="flex flex-col gap-24">
            {displayProducts.reduce((rows: any[], product, index) => {
              if (index % 2 === 0) rows.push(displayProducts.slice(index, index + 2));
              return rows;
            }, []).map((row, rowIndex) => (
              <div key={rowIndex} className={`flex flex-col md:flex-row gap-8 lg:gap-16 items-center ${rowIndex % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                {row[0] && (
                  <div className="w-full md:w-7/12 group cursor-pointer" onClick={() => navigate(`/product/${row[0].id}`)}>
                    <div className="aspect-[3/4] overflow-hidden mb-6 relative">
                      <img src={row[0].imageUrl} alt={row[0].name} className="w-full h-full object-cover filter hover:brightness-90 transition-all duration-700 hover:scale-105" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl text-[#241A1A] font-normal italic mb-2" style={{ fontFamily: themeSettings.fontFamily }}>{row[0].name}</h3>
                      {settings.showPrices && <p className="text-gray-500 tracking-widest text-sm">Rp {row[0].price.toLocaleString('id-ID')}</p>}
                    </div>
                  </div>
                )}
                
                {row[1] && (
                  <div className="w-full md:w-5/12 group cursor-pointer mt-12 md:mt-32" onClick={() => navigate(`/product/${row[1].id}`)}>
                    <div className="aspect-square overflow-hidden mb-6 relative">
                      <img src={row[1].imageUrl} alt={row[1].name} className="w-full h-full object-cover filter hover:brightness-90 transition-all duration-700 hover:scale-105" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-xl text-[#241A1A] font-normal italic mb-2" style={{ fontFamily: themeSettings.fontFamily }}>{row[1].name}</h3>
                      {settings.showPrices && <p className="text-gray-500 tracking-widest text-sm">Rp {row[1].price.toLocaleString('id-ID')}</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- 3. BOLD BRAND THEME ---
  if (themeId && themeId.includes('bold')) {
    return (
      <section className="py-20 bg-[#000000] border-b-8 border-black">
        <div className="mx-auto px-6 max-w-7xl">
          {settings.title && (
            <h2 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white uppercase tracking-tighter mb-12 text-center" style={{ fontFamily: themeSettings.fontFamily }}>
              {settings.title}
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product, idx) => (
              <div key={product.id || idx} className="bg-white border-4 border-black relative group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="aspect-square overflow-hidden border-b-4 border-black relative">
                  <div className="absolute inset-0 bg-[#FF0000] opacity-0 group-hover:opacity-20 transition-opacity z-10 mix-blend-multiply"></div>
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="p-6 relative overflow-hidden">
                  <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-2 group-hover:text-[#FF0000] transition-colors">{product.name}</h3>
                  {settings.showPrices && (
                    <p className="text-4xl font-black text-black tracking-tighter">Rp {product.price.toLocaleString('id-ID')}</p>
                  )}
                  <button className="absolute bottom-0 right-0 w-16 h-16 bg-black text-white flex items-center justify-center group-hover:w-full group-hover:bg-[#FF0000] transition-all duration-300" onClick={(e) => { e.stopPropagation(); navigate('/cart'); }}>
                    <ShoppingCart className="w-6 h-6 group-hover:hidden" />
                    <span className="hidden group-hover:block font-black uppercase tracking-widest">BUY NOW</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <section className="py-24 bg-[#FDFBF7]">
        <div className="mx-auto px-6 max-w-6xl">
          {settings.title && (
            <div className="text-center mb-16">
              <h2 className="text-3xl font-medium text-[#3E3E3E] tracking-tight mb-4" style={{ fontFamily: themeSettings.fontFamily }}>{settings.title}</h2>
              <div className="w-16 h-1 bg-[#D9A05B] rounded-full mx-auto"></div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayProducts.map((product, idx) => (
              <div key={product.id || idx} className="group cursor-pointer flex flex-col" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-6 shadow-sm group-hover:shadow-xl transition-shadow duration-500 bg-white">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-lg font-medium text-[#3E3E3E] mb-2 group-hover:text-[#D9A05B] transition-colors">{product.name}</h3>
                  {settings.showPrices && (
                    <p className="text-[#3E3E3E]/70 font-semibold mb-4">Rp {product.price.toLocaleString('id-ID')}</p>
                  )}
                  <button className="px-6 py-2 rounded-full border border-[#D9A05B] text-[#D9A05B] text-sm font-medium hover:bg-[#D9A05B] hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/cart'); }}>
                    Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  return (
    <section className="py-24 bg-white">
      <div className={`mx-auto px-6 lg:px-12 ${themeSettings.containerWidth}`}>
        
        {settings.title && (
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl font-light text-[#1A1A1A] tracking-tight">{settings.title}</h2>
            <div className="w-12 h-px bg-gray-300 mt-6"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {displayProducts.slice(0, settings.columns === 3 ? 3 : 6).map((product, idx) => (
            <div key={product.id || idx} className="group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
              <div className="aspect-[4/5] overflow-hidden mb-6 bg-gray-50 relative">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                  <span className="px-6 py-3 bg-white text-[#1A1A1A] text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}>
                    View Product
                  </span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium tracking-wide text-[#1A1A1A] uppercase mb-2">
                  {product.name}
                </h3>
                {settings.showPrices && (
                  <p className="text-sm text-gray-500 font-light">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
