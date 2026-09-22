import React from 'react';
import { ProductGridSettings, ThemeSettings } from '../schema';
import { Product } from '../../types';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  settings: ProductGridSettings;
  themeSettings: ThemeSettings;
  products?: Product[];
  themeId?: string;
}

const mockProducts = [
  { id: '1', name: 'Premium Item 1', price: 299000, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop' },
  { id: '2', name: 'Exclusive Design', price: 450000, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop' },
  { id: '3', name: 'Signature Collection', price: 890000, imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop' },
  { id: '4', name: 'Limited Edition', price: 1200000, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop' },
  { id: '5', name: 'Essential Basics', price: 199000, imageUrl: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop' },
  { id: '6', name: 'Modern Classic', price: 750000, imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop' },
  { id: '7', name: 'Urban Style', price: 320000, imageUrl: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&auto=format&fit=crop' },
  { id: '8', name: 'Vintage Find', price: 550000, imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&auto=format&fit=crop' },
];

export const ProductGridSection: React.FC<Props> = ({ settings, themeSettings, products, themeId }) => {
  const displayProducts = (products && products.length > 0 ? products : mockProducts).slice(0, settings.maxItems || 8);
  const navigate = useNavigate();

  // --- 1. COMPACT / MODERN CATALOG THEME ---
  if (themeId && themeId.includes('compact')) {
    return (
      <section className="py-16 md:py-24 bg-[#F8FAFC]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {settings.title && (
            <div className="flex items-end justify-between mb-10 border-b border-gray-200 pb-4">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-tighter">{settings.title}</h2>
              <Link to="/products" className="text-sm font-bold text-[#0055FF] hover:text-blue-700 transition-colors flex items-center gap-2 group">
                Lihat Semua 
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-[#0055FF] group-hover:text-white transition-colors">
                  &rarr;
                </span>
              </Link>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {displayProducts.map((product, idx) => (
              <div key={product.id || idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:border-[#0055FF]/50 hover:shadow-[0_20px_40px_-15px_rgba(0,85,255,0.15)] transition-all duration-300 relative flex flex-col cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30 tracking-wider">
                  HOT
                </div>
                
                {/* Actions overlay */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white shadow-sm" onClick={(e) => e.stopPropagation()}>
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-600 hover:text-[#0055FF] hover:bg-white shadow-sm" onClick={(e) => e.stopPropagation()}>
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="aspect-square overflow-hidden bg-gray-50/50 p-6 relative">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="p-4 md:p-5 flex flex-col flex-1 bg-white">
                  <h3 className="text-sm text-gray-600 font-semibold line-clamp-2 mb-2 group-hover:text-[#0055FF] transition-colors">{product.name}</h3>
                  <div className="mt-auto">
                    {settings.showPrices && (
                      <p className="text-[#0055FF] font-black text-lg">Rp {product.price.toLocaleString('id-ID')}</p>
                    )}
                    <button className="w-full mt-4 py-2.5 bg-gray-50 text-gray-900 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#0055FF] hover:text-white transition-colors flex items-center justify-center gap-2 group/btn" onClick={(e) => { e.stopPropagation(); navigate('/cart'); }}>
                      <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Beli
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
      <section className="py-32 bg-[#FAF7F7]">
        <div className="mx-auto px-6 lg:px-12 w-full max-w-7xl">
          {settings.title && (
            <div className="text-center mb-24">
              <span className="text-[#241A1A]/40 uppercase tracking-[0.3em] text-xs font-bold mb-4 block">Our Selection</span>
              <h2 className="text-4xl md:text-6xl font-normal text-[#241A1A] leading-tight" style={{ fontFamily: themeSettings.fontFamily }}>
                {settings.title}
              </h2>
            </div>
          )}
          
          <div className="flex flex-col gap-32">
            {displayProducts.reduce((rows: any[], product, index) => {
              if (index % 2 === 0) rows.push(displayProducts.slice(index, index + 2));
              return rows;
            }, []).map((row, rowIndex) => (
              <div key={rowIndex} className={`flex flex-col md:flex-row gap-12 lg:gap-24 items-center ${rowIndex % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                {row[0] && (
                  <div className="w-full md:w-7/12 group cursor-pointer relative" onClick={() => navigate(`/product/${row[0].id}`)}>
                    <div className="absolute -inset-4 bg-[#241A1A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
                    <div className="aspect-[3/4] overflow-hidden mb-8 relative">
                      <div className="absolute inset-0 bg-[#241A1A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
                        <span className="text-white text-sm uppercase tracking-[0.3em] font-light border border-white/30 px-8 py-3 backdrop-blur-sm">Discover</span>
                      </div>
                      <img src={row[0].imageUrl} alt={row[0].name} className="w-full h-full object-cover filter brightness-95 group-hover:brightness-100 group-hover:scale-105 transition-all duration-[2s] ease-out" />
                    </div>
                    <div className="text-center md:text-left pr-8">
                      <h3 className="text-3xl text-[#241A1A] font-normal italic mb-3 group-hover:opacity-70 transition-opacity" style={{ fontFamily: themeSettings.fontFamily }}>{row[0].name}</h3>
                      {settings.showPrices && <p className="text-[#706866] tracking-[0.15em] text-sm">Rp {row[0].price.toLocaleString('id-ID')}</p>}
                    </div>
                  </div>
                )}
                
                {row[1] && (
                  <div className="w-full md:w-5/12 group cursor-pointer mt-12 md:mt-48 relative" onClick={() => navigate(`/product/${row[1].id}`)}>
                    <div className="absolute -inset-4 bg-[#241A1A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
                    <div className="aspect-square overflow-hidden mb-8 relative">
                      <div className="absolute inset-0 bg-[#241A1A]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-center justify-center">
                        <span className="text-white text-sm uppercase tracking-[0.3em] font-light border border-white/30 px-8 py-3 backdrop-blur-sm">Discover</span>
                      </div>
                      <img src={row[1].imageUrl} alt={row[1].name} className="w-full h-full object-cover filter brightness-95 group-hover:brightness-100 group-hover:scale-105 transition-all duration-[2s] ease-out" />
                    </div>
                    <div className="text-center md:text-left pr-8">
                      <h3 className="text-2xl text-[#241A1A] font-normal italic mb-3 group-hover:opacity-70 transition-opacity" style={{ fontFamily: themeSettings.fontFamily }}>{row[1].name}</h3>
                      {settings.showPrices && <p className="text-[#706866] tracking-[0.15em] text-sm">Rp {row[1].price.toLocaleString('id-ID')}</p>}
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
      <section className="py-24 bg-black border-b-8 border-black">
        <div className="mx-auto px-6 max-w-7xl">
          {settings.title && (
            <div className="flex flex-col items-center mb-10 sm:mb-16 relative px-2">
              <h2 className="text-3xl sm:text-6xl md:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase tracking-tighter leading-none z-10 break-words text-center" style={{ fontFamily: themeSettings.fontFamily }}>
                {settings.title}
              </h2>
              <div className="absolute top-1/2 left-0 right-0 h-1.5 sm:h-2 bg-[#FF0000] -translate-y-1/2 z-0"></div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {displayProducts.map((product, idx) => (
              <div key={product.id || idx} className="bg-white relative group cursor-pointer shadow-[4px_4px_0_rgba(255,0,0,1)] sm:shadow-[8px_8px_0_rgba(255,0,0,1)] hover:shadow-[16px_16px_0_rgba(255,0,0,1)] hover:-translate-y-2 hover:-translate-x-2 transition-all duration-300 border-4 border-black" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="aspect-[4/5] overflow-hidden border-b-4 border-black relative bg-gray-100">
                  {/* Glitch Effect Overlay on Hover */}
                  <div className="absolute inset-0 bg-[#FF0000] mix-blend-color-burn opacity-0 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 contrast-125 transition-all duration-500 scale-100 group-hover:scale-110" />
                </div>
                <div className="p-4 sm:p-6 relative overflow-hidden bg-white z-20 flex flex-col justify-between min-h-[140px] sm:min-h-[180px]">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tighter mb-2 group-hover:text-[#FF0000] transition-colors line-clamp-2 leading-tight break-words">{product.name}</h3>
                  </div>
                  {settings.showPrices && (
                    <p className="text-2xl sm:text-3xl font-black text-black tracking-tighter mt-auto">Rp {product.price.toLocaleString('id-ID')}</p>
                  )}
                  
                  {/* Buy Button overlay */}
                  <button className="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-black text-white flex items-center justify-center group-hover:w-full group-hover:h-full group-hover:bg-[#FF0000] transition-all duration-300 z-30" onClick={(e) => { e.stopPropagation(); navigate('/cart'); }}>
                    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 group-hover:hidden" />
                    <span className="hidden group-hover:block font-black text-xl sm:text-3xl uppercase tracking-widest text-white">BUY NOW</span>
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
      <section className="py-12 sm:py-24 bg-[#FDFBF7] relative box-border">
        {/* Soft background blobs */}
        <div className="absolute top-40 left-0 w-96 h-96 bg-[#D9A05B]/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-40 right-0 w-96 h-96 bg-[#8B9B8B]/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          {settings.title && (
            <div className="text-center mb-12 sm:mb-20 flex flex-col items-center">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium text-[#3E3E3E] tracking-tight mb-4 sm:mb-6 break-words" style={{ fontFamily: themeSettings.fontFamily }}>{settings.title}</h2>
              <div className="w-12 h-1 bg-[#D9A05B]/30 rounded-full"></div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {displayProducts.map((product, idx) => (
              <div key={product.id || idx} className="group cursor-pointer flex flex-col" onClick={() => navigate(`/product/${product.id}`)}>
                <div className="aspect-[4/5] rounded-2xl sm:rounded-[2rem] overflow-hidden mb-4 sm:mb-6 shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(217,160,91,0.2)] transition-all duration-500 bg-white relative">
                  
                  {/* Hover Add to Cart Overlay */}
                  <div className="absolute inset-x-3 sm:inset-x-4 bottom-3 sm:bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button className="w-full py-2.5 sm:py-3.5 bg-white/90 backdrop-blur-md text-[#3E3E3E] text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl shadow-lg hover:bg-[#D9A05B] hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); navigate('/cart'); }}>
                      Add to Bag
                    </button>
                  </div>

                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[2s] ease-out" />
                </div>
                
                <div className="flex flex-col text-center px-2 sm:px-4">
                  <h3 className="text-sm sm:text-[15px] font-medium text-[#3E3E3E] mb-1 sm:mb-2 group-hover:text-[#D9A05B] transition-colors break-words">{product.name}</h3>
                  {settings.showPrices && (
                    <p className="text-[#3E3E3E]/60 font-medium text-xs sm:text-sm">Rp {product.price.toLocaleString('id-ID')}</p>
                  )}
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
    <section className="py-12 sm:py-20 lg:py-32 bg-white box-border">
      <div className={`mx-auto px-4 sm:px-6 lg:px-12 ${themeSettings.containerWidth || 'max-w-7xl'}`}>
        
        {settings.title && (
          <div className="flex flex-col items-center mb-10 sm:mb-20 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-[#1A1A1A] tracking-tight break-words">{settings.title}</h2>
            <div className="w-12 h-px bg-[#1A1A1A]/20 mt-4 sm:mt-8"></div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-12 gap-y-10 sm:gap-y-20">
          {displayProducts.slice(0, settings.columns === 3 ? 3 : 6).map((product, idx) => (
            <div key={product.id || idx} className="group cursor-pointer flex flex-col" onClick={() => navigate(`/product/${product.id}`)}>
              <div className="aspect-[3/4] overflow-hidden mb-5 sm:mb-8 bg-[#F9F9F9] relative">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-center transform transition-transform duration-[3s] ease-out group-hover:scale-105" />
                
                {/* Minimalist Hover Overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                  <span className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-[#1A1A1A] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#1A1A1A] hover:text-white transition-colors duration-300 shadow-xl" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}>
                    View Details
                  </span>
                </div>
              </div>
              
              <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center md:items-start gap-2 sm:gap-4">
                <h3 className="text-xs sm:text-sm font-medium tracking-wide text-[#1A1A1A] uppercase leading-relaxed max-w-full md:max-w-[80%] break-words">
                  {product.name}
                </h3>
                {settings.showPrices && (
                  <p className="text-xs sm:text-sm text-gray-500 font-light whitespace-nowrap">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-24 text-center">
           <Link to="/products" className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A] group/link">
              View All Products
              <span className="w-8 h-px bg-[#1A1A1A] transition-all duration-500 group-hover/link:w-16"></span>
           </Link>
        </div>
      </div>
    </section>
  );
};
