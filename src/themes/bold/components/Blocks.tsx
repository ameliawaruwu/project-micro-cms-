import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const BoldLatestDrop: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const product = products[0];
  if (!product) return null;
  const heading = sectionOptions.heading || "LATEST DROP";

  return (
    <section className="py-24 px-6 md:px-12 bg-black text-white relative overflow-hidden border-b-[16px] border-[#DC2626]">
      <div className="text-[150px] md:text-[300px] font-black italic absolute top-1/2 -translate-y-1/2 left-0 text-white/5 whitespace-nowrap leading-none select-none pointer-events-none z-0">
        {heading}
      </div>
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20 relative z-10">
        <div className="w-full md:w-1/2 p-6 bg-[#DC2626] transform -rotate-3 hover:rotate-0 transition-transform duration-500 border-8 border-white shadow-[16px_16px_0_0_#fff]">
          <img src={product.image} alt={product.name} className="w-full aspect-square md:aspect-[4/5] object-cover grayscale mix-blend-multiply" />
        </div>
        <div className="w-full md:w-1/2 mt-12 md:mt-0">
          <div className="bg-white text-black inline-block px-6 py-2 mb-8 transform -skew-x-12">
            <span className="font-black uppercase tracking-widest text-2xl skew-x-12 inline-block">HOT SHIT</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 text-white drop-shadow-[6px_6px_0_#DC2626] leading-none">
            {product.name}
          </h2>
          <p className="text-3xl font-black bg-[#DC2626] text-white inline-block px-6 py-3 mb-8 uppercase border-4 border-white">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
          <p className="text-xl md:text-2xl font-bold text-white/90 uppercase leading-relaxed mb-12 max-w-xl">
            {product.description}
          </p>
          <button className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest text-2xl border-[6px] border-black hover:bg-[#DC2626] hover:text-white transition-colors shadow-[12px_12px_0_0_#DC2626]">
            Cop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export const BoldCategoryTiles: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => (
  <section className="bg-black py-16 px-6 border-b-[16px] border-white">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
      {['Tops', 'Bottoms', 'Outerwear', 'Accessories'].map((cat, i) => (
        <div key={i} className={`h-[250px] md:h-[400px] border-8 border-black flex items-center justify-center p-8 cursor-pointer group transition-all duration-300 ${i % 2 === 0 ? 'bg-white hover:bg-[#DC2626] text-black hover:text-white' : 'bg-yellow-400 hover:bg-black text-black hover:text-white hover:border-yellow-400'}`}>
          <h3 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter group-hover:scale-125 transition-transform duration-300 transform -skew-x-12">
            {cat}
          </h3>
        </div>
      ))}
    </div>
  </section>
);

export const BoldLookbook: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Street Certified";
  return (
    <section className="py-32 px-6 bg-white text-black text-center border-b-[16px] border-black">
      <h2 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter mb-20 text-[#DC2626] drop-shadow-[8px_8px_0_black]">
        {heading}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[1400px] mx-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className="relative group overflow-hidden bg-[#DC2626] border-8 border-black transform transition-transform hover:-translate-y-4 shadow-[16px_16px_0_0_#000]">
            <img 
              src={`https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&random=${i}`} 
              alt="Lookbook" 
              className="w-full aspect-[3/4] object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 mix-blend-multiply group-hover:mix-blend-normal transition-all duration-500" 
            />
            <div className="absolute inset-0 border-[16px] border-transparent group-hover:border-white transition-colors duration-300 pointer-events-none"></div>
            <div className="absolute bottom-6 left-6 right-6 bg-black text-white text-3xl font-black italic uppercase py-4 translate-y-[150%] group-hover:translate-y-0 transition-transform duration-300">
              Drop 0{i}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const BoldLimitedRelease: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Limited Release";
  const desc = sectionOptions.description || "Members only drop. Sign up to get the password.";
  return (
    <section className="py-40 px-6 bg-yellow-400 text-black text-center border-b-[16px] border-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')]"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter mb-10 drop-shadow-[6px_6px_0_white]">
          {heading}
        </h2>
        <p className="text-2xl md:text-4xl font-black uppercase mb-16 bg-black text-white inline-block px-8 py-4 transform -skew-x-12">
          <span className="skew-x-12 inline-block">{desc}</span>
        </p>
        <div className="flex flex-col md:flex-row justify-center max-w-3xl mx-auto border-8 border-black shadow-[16px_16px_0_0_#DC2626]">
          <input type="email" placeholder="ENTER EMAIL" className="w-full md:w-2/3 px-8 py-6 font-black text-2xl uppercase bg-white outline-none placeholder-gray-400" />
          <button className="w-full md:w-1/3 bg-black text-white px-10 py-6 font-black uppercase text-3xl hover:bg-[#DC2626] transition-colors border-t-8 md:border-t-0 md:border-l-8 border-black">
            Join
          </button>
        </div>
      </div>
    </section>
  );
};

export const BoldCommunityBoard: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "#BOLDMARKET";
  return (
    <section className="py-32 px-6 bg-[#DC2626] text-black overflow-hidden border-b-[16px] border-black">
      <h2 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter text-center mb-24 text-white drop-shadow-[8px_8px_0_black]">
        {heading}
      </h2>
      <div className="flex flex-wrap gap-8 justify-center max-w-[1600px] mx-auto">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-[280px] md:w-[350px] aspect-square bg-black border-8 border-white overflow-hidden transform hover:scale-110 hover:z-20 hover:-rotate-3 transition-all duration-300 relative group cursor-pointer shadow-[12px_12px_0_0_#000]">
            <img src={`https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80&random=${i}`} className="w-full h-full object-cover mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500" alt="Community" />
            <div className="absolute inset-0 bg-[#DC2626]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-black uppercase tracking-widest text-white text-3xl italic">@user_{i}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
