import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const LuxurySignatureCollection: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const heading = sectionOptions.heading || "Signature Pieces";
  
  const align = sectionOptions.textAlignment || 'left';
  const bgColor = sectionOptions.backgroundColor === 'white' ? 'bg-white' 
                : sectionOptions.backgroundColor === 'brand' ? 'bg-[#92400E]'
                : sectionOptions.backgroundColor === 'dark' ? 'bg-gray-900'
                : 'bg-[#fcfbf9]'; // default
  
  const isDarkBg = bgColor === 'bg-gray-900' || bgColor === 'bg-[#92400E]';
  const headingColor = isDarkBg ? 'text-white' : 'text-[#92400E]';
  const textColor = isDarkBg ? 'text-gray-300' : 'text-gray-500';
  
  const headerLayout = align === 'center' ? 'flex-col justify-center items-center text-center' 
                     : align === 'right' ? 'flex-col md:flex-row-reverse justify-between items-center md:items-end text-right'
                     : 'flex-col md:flex-row justify-between items-center md:items-end';

  const buttonLabel = sectionOptions.buttonLabel || "View Collection";
  const buttonLink = sectionOptions.buttonLink || "#all";

  return (
    <section className={`py-32 md:py-48 px-8 md:px-16 ${bgColor} transition-colors duration-500`}>
      <div className={`flex ${headerLayout} mb-24 gap-8`}>
        <h2 className={`text-4xl md:text-5xl font-serif ${headingColor} tracking-tight`}>{heading}</h2>
        <a href={buttonLink} className={`text-[10px] uppercase tracking-[0.3em] border-b pb-1 transition-colors duration-300 ${isDarkBg ? 'border-white/30 text-white hover:border-white' : 'border-[#92400E]/30 text-[#92400E] hover:border-[#92400E]'}`}>
          {buttonLabel}
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
        {products.slice(0, 3).map((product, i) => (
          <div key={product.id} className="group cursor-pointer flex flex-col items-center">
            <div className="w-full aspect-[3/4] overflow-hidden mb-8 bg-[#f5f4f0] relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out mix-blend-multiply" />
              <div className="absolute inset-0 bg-[#92400E]/0 group-hover:bg-[#92400E]/5 transition-colors duration-700"></div>
            </div>
            <h3 className={`font-serif text-xl mb-4 text-center transition-colors duration-300 px-4 ${isDarkBg ? 'text-white group-hover:text-gray-300' : 'text-gray-900 group-hover:text-[#92400E]'}`}>{product.name}</h3>
            <p className={`text-[10px] uppercase tracking-[0.2em] text-center ${textColor}`}>Rp {product.price.toLocaleString('id-ID')}</p>
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
  
  const align = sectionOptions.textAlignment || 'left';
  const bgColor = sectionOptions.backgroundColor === 'brand' ? 'bg-[#92400E]' 
                : sectionOptions.backgroundColor === 'dark' ? 'bg-gray-900'
                : sectionOptions.backgroundColor === 'default' ? 'bg-[#fcfbf9]'
                : 'bg-white';
                
  const isDarkBg = bgColor === 'bg-gray-900' || bgColor === 'bg-[#92400E]';
  const headingColor = isDarkBg ? 'text-white' : 'text-gray-900';
  const textColor = isDarkBg ? 'text-gray-300' : 'text-gray-500';
  const subColor = isDarkBg ? 'text-[#D4AF37]' : 'text-[#92400E]';
  const btnClass = isDarkBg 
    ? 'border-white text-white hover:bg-white hover:text-black' 
    : 'border-[#92400E] text-[#92400E] hover:bg-[#92400E] hover:text-white';
    
  const textAlignmentClass = align === 'center' ? 'text-center items-center' 
                           : align === 'right' ? 'text-right items-end'
                           : 'text-left items-start';

  return (
    <section className={`py-32 md:py-48 px-8 md:px-16 ${bgColor} flex flex-col md:flex-row items-center gap-16 md:gap-24 transition-colors duration-500`}>
      <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1">
        <div className="relative w-full max-w-lg aspect-[4/5] overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1594938298596-eb5fd3822758?w=800&q=80" alt="Craftsmanship" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[15s] ease-out grayscale-[20%]" />
        </div>
      </div>
      <div className="w-full md:w-1/2 order-1 md:order-2">
        <div className={`max-w-lg mx-auto flex flex-col ${textAlignmentClass}`}>
          <p className={`text-[9px] uppercase tracking-[0.4em] ${subColor} mb-8`}>Savoir-Faire</p>
          <h2 className={`text-4xl md:text-5xl font-serif ${headingColor} mb-10 leading-[1.1]`}>{heading}</h2>
          <p className={`${textColor} leading-relaxed mb-12 text-sm md:text-base font-light`}>
            {desc}
          </p>
          <button className={`text-[10px] uppercase tracking-[0.2em] border px-10 py-4 transition-colors duration-500 ${btnClass}`}>
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
  
  const align = sectionOptions.textAlignment || 'center';
  const bgColor = sectionOptions.backgroundColor === 'white' ? 'bg-white' 
                : sectionOptions.backgroundColor === 'brand' ? 'bg-[#92400E]'
                : sectionOptions.backgroundColor === 'default' ? 'bg-[#fcfbf9]'
                : 'bg-[#121212]'; // dark

  const isLightBg = bgColor === 'bg-white' || bgColor === 'bg-[#fcfbf9]';
  const headingColor = isLightBg ? 'text-gray-900' : 'text-white';
  const textColor = isLightBg ? 'text-gray-600' : 'text-gray-400';
  
  const textAlignmentClass = align === 'left' ? 'text-left items-start' 
                           : align === 'right' ? 'text-right items-end'
                           : 'text-center items-center';

  const buttonLabel = sectionOptions.buttonLabel || "Request Access";
  const buttonLink = sectionOptions.buttonLink || "#";

  return (
    <section className={`py-40 md:py-56 px-8 md:px-16 ${bgColor} ${headingColor} relative overflow-hidden transition-colors duration-500`}>
      <div className={`absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80')] mix-blend-overlay ${isLightBg ? 'opacity-5' : 'opacity-10'} object-cover object-center grayscale`}></div>
      <div className={`relative z-10 max-w-3xl mx-auto flex flex-col ${textAlignmentClass}`}>
        <p className={`text-[10px] md:text-[11px] uppercase tracking-[0.4em] ${isLightBg ? 'text-[#92400E]' : 'text-[#D4AF37]'} mb-8`}>Exclusive Access</p>
        <h2 className="text-4xl md:text-6xl font-serif mb-10 leading-tight drop-shadow-lg">{heading}</h2>
        <p className={`${textColor} max-w-md ${align === 'center' ? 'mx-auto' : ''} mb-16 text-sm leading-relaxed font-light`}>
          {desc}
        </p>
        <a href={buttonLink} className={`inline-block text-[10px] uppercase tracking-[0.25em] ${isLightBg ? 'bg-[#92400E] text-white hover:bg-black' : 'bg-[#D4AF37] text-black hover:bg-white'} px-12 py-5 transition-all duration-500 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]`}>
          {buttonLabel}
        </a>
      </div>
    </section>
  );
};
