import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const LuxurySignatureCollection: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const heading = sectionOptions.heading || "Signature Pieces";
  
  return (
    <section className="py-32 md:py-48 px-8 md:px-16 bg-[#fcfbf9]">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-24 gap-8">
        <h2 className="text-4xl md:text-5xl font-serif text-[#92400E] tracking-tight">{heading}</h2>
        <a href="#all" className="text-[10px] uppercase tracking-[0.3em] border-b border-[#92400E]/30 pb-1 text-[#92400E] hover:border-[#92400E] transition-colors duration-300">
          View Collection
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
        {products.slice(0, 3).map((product, i) => (
          <div key={product.id} className="group cursor-pointer flex flex-col items-center">
            <div className="w-full aspect-[3/4] overflow-hidden mb-8 bg-[#f5f4f0] relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out mix-blend-multiply" />
              <div className="absolute inset-0 bg-[#92400E]/0 group-hover:bg-[#92400E]/5 transition-colors duration-700"></div>
            </div>
            <h3 className="font-serif text-xl mb-4 text-center text-gray-900 group-hover:text-[#92400E] transition-colors duration-300 px-4">{product.name}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-center text-gray-500">Rp {product.price.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const LuxuryCraftsmanship: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Meticulous Craftsmanship";
  const desc = sectionOptions.description || "Setiap potongan dirancang dengan dedikasi mutlak terhadap detail. Dari pemilihan material premium hingga jahitan akhir, pengrajin kami memastikan kesempurnaan di setiap tahap pembuatan.";
  const buttonLabel = sectionOptions.buttonLabel || "Read the Story";

  return (
    <section className="py-32 md:py-48 px-8 md:px-16 bg-white flex flex-col md:flex-row items-center gap-16 md:gap-24">
      <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1">
        <div className="relative w-full max-w-lg aspect-[4/5] overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1594938298596-eb5fd3822758?w=800&q=80" alt="Craftsmanship" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[15s] ease-out grayscale-[20%]" />
        </div>
      </div>
      <div className="w-full md:w-1/2 order-1 md:order-2">
        <div className="max-w-lg">
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#92400E] mb-8">Savoir-Faire</p>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-10 leading-[1.1]">{heading}</h2>
          <p className="text-gray-500 leading-relaxed mb-12 text-sm md:text-base font-light">
            {desc}
          </p>
          <button className="text-[10px] uppercase tracking-[0.2em] border border-[#92400E] text-[#92400E] px-10 py-4 hover:bg-[#92400E] hover:text-white transition-colors duration-500">
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
};

export const LuxuryPrivateCollection: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Join the Private Client Registry";
  const desc = sectionOptions.description || "Register to receive invitations to private viewings and bespoke services.";
  
  return (
    <section className="py-40 md:py-56 px-8 md:px-16 bg-[#121212] text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80')] mix-blend-overlay opacity-10 object-cover object-center grayscale"></div>
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-[#D4AF37] mb-8">Exclusive Access</p>
        <h2 className="text-4xl md:text-6xl font-serif mb-10 leading-tight drop-shadow-lg">{heading}</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-16 text-sm leading-relaxed font-light">
          {desc}
        </p>
        <button className="text-[10px] uppercase tracking-[0.25em] bg-[#D4AF37] text-black px-12 py-5 hover:bg-white hover:text-black transition-all duration-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          Request Access
        </button>
      </div>
    </section>
  );
};
