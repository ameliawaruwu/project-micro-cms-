import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const BoldLatestDrop: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const product = products[0] || {
    name: 'HEAVYWEIGHT OVERSIZED HOODIE',
    price: 499000,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
    description: '500GSM Ultra-heavyweight French Terry Cotton. Custom acid wash finish. Oversized drop-shoulder boxy fit.'
  };
  const heading = sectionOptions.heading || "LATEST DROP";

  return (
    <section className="py-20 sm:py-28 px-6 md:px-12 bg-zinc-950 text-white relative overflow-hidden border-b border-zinc-900">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16 relative z-10">
        <div className="w-full md:w-1/2 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          </div>
        </div>
        <div className="w-full md:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-600/10 border border-red-500/30 text-red-500 text-xs font-extrabold uppercase tracking-widest rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            FEATURED RELEASE
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight uppercase">
            {product.name}
          </h2>
          <div className="text-2xl font-black text-white bg-zinc-900 border border-zinc-800 inline-block px-5 py-2.5 rounded-xl tracking-tight shadow-md">
            Rp {product.price.toLocaleString('id-ID')}
          </div>
          <p className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xl">
            {product.description}
          </p>
          <div className="pt-2">
            <button className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest text-xs sm:text-sm rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:scale-105 active:scale-95 cursor-pointer">
              COP NOW →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const BoldCategoryTiles: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => (
  <section className="bg-zinc-950 py-16 px-6 border-b border-zinc-900">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mb-2">COLLECTIONS</h2>
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">Shop By Category</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {['Tops', 'Bottoms', 'Outerwear', 'Accessories'].map((cat, i) => (
          <div key={i} className="h-44 md:h-60 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 text-white flex flex-col items-center justify-center p-6 cursor-pointer group hover:border-red-500/50 transition-all duration-300 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight group-hover:scale-110 transition-transform relative z-10 text-white">
              {cat}
            </h3>
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-2 relative z-10 group-hover:text-red-400 transition-colors">
              Explore →
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const BoldLookbook: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "LOOKBOOK 2026";
  return (
    <section className="py-24 px-6 bg-zinc-950 text-white border-b border-zinc-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-12 text-white">
          {heading}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="relative group overflow-hidden bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl hover:-translate-y-1.5 transition-transform duration-300">
              <img 
                src={sectionOptions.imageUrl || sectionOptions.bannerUrl || `https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&random=${i}`} 
                alt="Lookbook" 
                className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block mb-2">
                  EDITORIAL
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">
                  EDITORIAL DROP 0{i}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BoldLimitedRelease: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "LIMITED ACCESS";
  const desc = sectionOptions.description || "Get early notification for members-only drops and exclusive releases.";
  return (
    <section className="py-24 px-6 bg-zinc-950 text-white text-center border-b border-zinc-900 relative overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <span className="px-4 py-1.5 bg-red-600/10 border border-red-500/30 text-red-500 font-extrabold text-xs uppercase tracking-widest rounded-full inline-block">
          VIP MEMBER ACCESS
        </span>
        <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
          {heading}
        </h2>
        <p className="text-sm font-medium text-zinc-400 max-w-lg mx-auto leading-relaxed">
          {desc}
        </p>
        <div className="flex flex-col sm:flex-row justify-center max-w-md mx-auto gap-3 pt-2">
          <input 
            type="email" 
            placeholder="Enter your email address..." 
            className="flex-1 px-5 py-3.5 font-medium text-sm bg-zinc-900 border border-zinc-800 text-white rounded-xl focus:border-red-500 outline-none transition-colors" 
          />
          <button className="bg-red-600 text-white px-7 py-3.5 font-extrabold uppercase text-xs tracking-wider rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-600/25">
            JOIN DROP
          </button>
        </div>
      </div>
    </section>
  );
};

export const BoldCommunityBoard: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "#BOLDMARKET";
  return (
    <section className="py-20 px-6 bg-zinc-950 text-white border-b border-zinc-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-center mb-10 text-white">
          {heading}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-900 rounded-2xl border border-zinc-800/80 overflow-hidden relative group cursor-pointer shadow-lg">
              <img src={`https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80&random=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Community" />
              <div className="absolute inset-0 bg-zinc-950/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-extrabold text-xs uppercase tracking-widest text-white bg-zinc-900/90 border border-zinc-700 px-3 py-1.5 rounded-full">
                  @user_{i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
