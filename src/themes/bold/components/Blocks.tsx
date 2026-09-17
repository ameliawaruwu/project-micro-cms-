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
    <section className="py-16 sm:py-24 px-6 md:px-12 bg-black text-white relative overflow-hidden border-b-8 border-[#DC2626]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
        <div className="w-full md:w-1/2 p-2 bg-[#DC2626] rounded-xl border-4 border-black shadow-[8px_8px_0_0_#fff]">
          <img src={product.image} alt={product.name} className="w-full aspect-square md:aspect-[4/5] object-cover rounded-lg" />
        </div>
        <div className="w-full md:w-1/2 space-y-6">
          <span className="bg-[#DC2626] text-white inline-block px-4 py-1 text-xs font-black uppercase tracking-widest rounded-sm border border-black shadow-[3px_3px_0_0_#fff]">
            FEATURED ITEM
          </span>
          <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white leading-tight">
            {product.name}
          </h2>
          <p className="text-2xl font-black text-black bg-white inline-block px-4 py-2 uppercase border-2 border-black">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
          <p className="text-sm font-semibold text-gray-300 uppercase leading-relaxed max-w-xl">
            {product.description}
          </p>
          <button className="px-8 py-4 bg-[#DC2626] text-white font-black uppercase tracking-widest text-base border-4 border-black hover:bg-white hover:text-black transition-all shadow-[6px_6px_0_0_#fff]">
            COP NOW →
          </button>
        </div>
      </div>
    </section>
  );
};

export const BoldCategoryTiles: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => (
  <section className="bg-black py-16 px-6 border-b-8 border-black">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
      {['Tops', 'Bottoms', 'Outerwear', 'Accessories'].map((cat, i) => (
        <div key={i} className="h-44 md:h-64 border-4 border-white bg-slate-900 text-white flex items-center justify-center p-4 cursor-pointer group hover:bg-[#DC2626] hover:border-black transition-all duration-300 rounded-xl shadow-[4px_4px_0_0_#DC2626]">
          <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter group-hover:scale-110 transition-transform">
            {cat}
          </h3>
        </div>
      ))}
    </div>
  </section>
);

export const BoldLookbook: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "STREET CERTIFIED";
  return (
    <section className="py-20 px-6 bg-white text-black text-center border-b-8 border-black">
      <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter mb-12 text-black">
        {heading}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="relative group overflow-hidden bg-black rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#DC2626] hover:-translate-y-2 transition-transform">
            <img 
              src={sectionOptions.imageUrl || sectionOptions.bannerUrl || `https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&random=${i}`} 
              alt="Lookbook" 
              className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/90 text-white text-base font-black italic uppercase py-2.5 rounded-xl border border-white/20">
              DROP 0{i}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const BoldLimitedRelease: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "LIMITED RELEASE";
  const desc = sectionOptions.description || "Members only drop. Sign up to get the password.";
  return (
    <section className="py-20 px-6 bg-black text-white text-center border-b-8 border-[#DC2626] relative overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white">
          {heading}
        </h2>
        <p className="text-sm sm:text-base font-bold uppercase text-gray-400">
          {desc}
        </p>
        <div className="flex flex-col sm:flex-row justify-center max-w-xl mx-auto gap-2">
          <input type="email" placeholder="ENTER YOUR EMAIL..." className="flex-1 px-5 py-3.5 font-bold text-sm uppercase bg-slate-900 border-2 border-gray-700 text-white rounded-xl focus:border-[#DC2626] outline-none" />
          <button className="bg-[#DC2626] text-white px-8 py-3.5 font-black uppercase text-sm rounded-xl hover:bg-white hover:text-black transition-colors border-2 border-black shadow-[4px_4px_0_0_#000]">
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
    <section className="py-16 px-6 bg-slate-950 text-white border-b-8 border-black">
      <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-center mb-12 text-white">
        {heading}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square bg-slate-900 rounded-2xl border-2 border-slate-800 overflow-hidden relative group cursor-pointer">
            <img src={`https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80&random=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Community" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="font-black text-sm uppercase tracking-widest text-white">@user_{i + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
