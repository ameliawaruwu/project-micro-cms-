import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Sparkles } from 'lucide-react';

export const CuteHero: React.FC = () => {
  const storeInfo = useCmsStore(state => state.storeInfo);

  return (
    <section className="relative w-full py-12 px-6 font-['Outfit',sans-serif]">
      <div className="max-w-6xl mx-auto bg-[#FFD1DC]/30 rounded-[3rem] overflow-hidden relative flex flex-col md:flex-row items-center border-8 border-white shadow-xl">
        
        {/* Floating decorations */}
        <div className="absolute top-10 left-10 text-[#FF85A1] animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-20 left-1/2 text-[#FFB6C1] animate-pulse">
          <Sparkles className="w-12 h-12" />
        </div>

        {/* Content */}
        <div className="flex-1 p-10 md:p-16 text-center md:text-left z-10">
          <div className="inline-block px-4 py-2 bg-white rounded-full text-[#FF85A1] font-bold text-sm mb-6 shadow-sm border-2 border-[#FFF5F7]">
            ✨ Toko Paling Gemas
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#FF85A1] leading-[1.1] mb-6">
            Selamat Datang di {storeInfo.name}! 💖
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg font-medium leading-relaxed">
            {storeInfo.description}
          </p>
          <a 
            href="/produk" 
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FF85A1] text-white text-lg font-black hover:bg-[#FF6B8B] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 min-w-[200px] rounded-full border-4 border-white"
          >
            Mulai Belanja!
          </a>
        </div>

        {/* Image */}
        <div className="flex-1 w-full h-[400px] md:h-[600px] relative p-6">
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-8 border-white shadow-lg bg-white relative group">
            <img 
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80" 
              alt="Hero" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Cute badge on image */}
            <div className="absolute -right-4 top-10 bg-[#FFD1DC] w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-md rotate-12 group-hover:rotate-45 transition-transform">
              <span className="font-black text-[#FF85A1] text-lg text-center leading-tight">NEW<br/>ARRIVALS</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
