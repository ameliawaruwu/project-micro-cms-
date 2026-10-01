import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { useLanguage } from '../../../contexts/LanguageContext';

export const LuxurySignatureCollection: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const { isEn } = useLanguage();

  const defaultHeading = isEn ? "Signature Pieces" : "Koleksi Utama";
  const isDefaultHeading = !sectionOptions.heading 
    || sectionOptions.heading === "Signature Pieces" 
    || sectionOptions.heading === "Koleksi Utama";
  const heading = isDefaultHeading ? defaultHeading : sectionOptions.heading;
  
  const align = sectionOptions.textAlignment || 'left';
  const bgColor = sectionOptions.backgroundColor === 'brand' ? 'bg-[#9A6027]'
                : sectionOptions.backgroundColor === 'cream' ? 'bg-[#FAF7F2]'
                : 'bg-white'; // default clean white base
  
  const headingColor = 'text-[#36281D]';
  const textColor = 'text-[#7D6E63]';
  
  const headerLayout = align === 'center' ? 'flex-col justify-center items-center text-center' 
                     : align === 'right' ? 'flex-col md:flex-row-reverse justify-between items-center md:items-end text-right'
                     : 'flex-col md:flex-row justify-between items-center md:items-end';

  const defaultButton = isEn ? "View Collection" : "Lihat Semua Koleksi";
  const isDefaultButton = !sectionOptions.buttonLabel 
    || sectionOptions.buttonLabel === "View Collection" 
    || sectionOptions.buttonLabel === "Lihat Koleksi"
    || sectionOptions.buttonLabel === "Lihat Semua Koleksi";
  const buttonLabel = isDefaultButton ? defaultButton : sectionOptions.buttonLabel;
  const buttonLink = sectionOptions.buttonLink || "#all";

  return (
    <section className={`py-24 md:py-32 px-8 md:px-16 ${bgColor} transition-colors duration-500`}>
      <div className={`flex ${headerLayout} mb-14 gap-8`}>
        <div>
          <h2 className={`text-2xl sm:text-3xl md:text-5xl font-serif ${headingColor} tracking-tight font-normal storefront-heading-section`}>{heading}</h2>
          {(sectionOptions.subheading || sectionOptions.description || sectionOptions.featuredSubtitle) && (
            <p className={`mt-3 text-xs sm:text-sm md:text-base font-light ${textColor} max-w-xl font-sans`}>
              {sectionOptions.subheading || sectionOptions.description || sectionOptions.featuredSubtitle}
            </p>
          )}
        </div>
        <a href={buttonLink} className="text-[10px] uppercase tracking-[0.3em] border-b border-[#8C531B]/40 text-[#8C531B] hover:border-[#8C531B] pb-1 transition-colors duration-300 font-sans font-medium">
          {buttonLabel}
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {products.slice(0, sectionOptions.limit || 6).map((product) => (
          <div key={product.id} className="group cursor-pointer flex flex-col items-center bg-[#FAF7F2] p-4 sm:p-6 rounded-2xl border border-[#EADBCE] shadow-2xs hover:shadow-md transition-all duration-300">
            <div className="w-full aspect-[3/4] min-h-[220px] sm:min-h-[260px] overflow-hidden mb-4 sm:mb-6 bg-white rounded-xl relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out" />
              <div className="absolute inset-0 bg-[#9A6027]/0 group-hover:bg-[#9A6027]/5 transition-colors duration-700"></div>
            </div>
            <h3 className="font-serif text-base sm:text-lg md:text-xl mb-1 sm:mb-2 text-center text-[#36281D] group-hover:text-[#9A6027] transition-colors duration-300 px-2 sm:px-4 font-normal storefront-card-title">{product.name}</h3>
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-center text-[#8C531B] font-mono font-semibold storefront-card-price">Rp {product.price.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const LuxuryCraftsmanship: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { isEn } = useLanguage();

  const defaultHeading = isEn ? "Meticulous Craftsmanship" : "Keahlian Adiluhung";
  const defaultEyebrow = isEn ? "FINE CRAFTSMANSHIP" : "KEAHLIAN ADILUHUNG";
  const defaultDesc = isEn
    ? "Every piece is designed with absolute dedication to detail. From the selection of premium materials to the final stitch, our artisans ensure perfection at every stage of creation."
    : "Setiap potongan dirancang dengan dedikasi mutlak terhadap detail. Dari pemilihan material premium hingga jahitan akhir, pengrajin kami memastikan kesempurnaan di setiap tahap pembuatan.";
  const defaultButton = isEn ? "Read the Story" : "Baca Kisah Kami";

  const isDefaultHeading = !sectionOptions.heading 
    || sectionOptions.heading === "Meticulous Craftsmanship" 
    || sectionOptions.heading === "Keahlian Adiluhung"
    || sectionOptions.heading === "Craftsmanship";
  const heading = isDefaultHeading ? defaultHeading : sectionOptions.heading;

  const isDefaultEyebrow = !sectionOptions.eyebrow 
    || sectionOptions.eyebrow === "Savoir-Faire" 
    || sectionOptions.eyebrow === "SAVOIR-FAIRE"
    || sectionOptions.eyebrow === "FINE CRAFTSMANSHIP" 
    || sectionOptions.eyebrow === "KEAHLIAN ADILUHUNG";
  const eyebrow = isDefaultEyebrow ? defaultEyebrow : sectionOptions.eyebrow;

  const currentDesc = sectionOptions.description || sectionOptions.subheading || sectionOptions.content;
  const isDefaultDesc = !currentDesc
    || currentDesc === "Setiap potongan dirancang dengan dedikasi mutlak terhadap detail. Dari pemilihan material premium hingga jahitan akhir, pengrajin kami memastikan kesempurnaan di setiap tahap pembuatan."
    || currentDesc === "Every piece is designed with absolute dedication to detail. From the selection of premium materials to the final stitch, our artisans ensure perfection at every stage of creation.";
  const desc = isDefaultDesc ? defaultDesc : currentDesc;

  const isDefaultButton = !sectionOptions.buttonLabel 
    || sectionOptions.buttonLabel === "Read the Story" 
    || sectionOptions.buttonLabel === "Baca Kisah Kami"
    || sectionOptions.buttonLabel === "READ THE STORY";
  const buttonLabel = isDefaultButton ? defaultButton : sectionOptions.buttonLabel;
  
  const align = sectionOptions.textAlignment || 'left';
  const bgColor = sectionOptions.backgroundColor === 'white' ? 'bg-white'
                : 'bg-[#FAF7F2]'; // elegant warm cream accent band
                
  const headingColor = 'text-[#36281D]';
  const textColor = 'text-[#7D6E63]';
  const subColor = 'text-[#9A6027]';
  const btnClass = 'border border-[#8C531B] text-[#8C531B] hover:bg-[#8C531B] hover:text-[#FFFDF9] bg-white rounded-lg shadow-2xs';
    
  const textAlignmentClass = align === 'center' ? 'text-center items-center' 
                           : align === 'right' ? 'text-right items-end'
                           : 'text-left items-start';

  return (
    <section className={`py-24 md:py-32 px-8 md:px-16 ${bgColor} flex flex-col md:flex-row items-center gap-14 md:gap-20 transition-colors duration-500 border-y border-[#F0EBE1]`}>
      <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1">
        <div className="relative w-full max-w-lg aspect-[4/5] overflow-hidden rounded-2xl group border border-[#EADBCE] shadow-xs">
          <img src={sectionOptions.imageUrl || sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80"} alt="Craftsmanship" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[15s] ease-out" />
        </div>
      </div>
      <div className="w-full md:w-1/2 order-1 md:order-2">
        <div className={`max-w-lg mx-auto flex flex-col ${textAlignmentClass}`}>
          <p className={`text-[10px] uppercase tracking-[0.4em] ${subColor} mb-5 font-mono font-medium`}>{eyebrow}</p>
          <h2 className={`text-4xl md:text-5xl font-serif ${headingColor} mb-6 leading-[1.15] font-normal`}>{heading}</h2>
          <p className={`${textColor} leading-relaxed mb-8 text-sm md:text-base font-light font-sans`}>
            {desc}
          </p>
          <button className={`text-[10px] uppercase tracking-[0.2em] px-8 py-3.5 transition-all duration-300 font-sans font-medium cursor-pointer ${btnClass}`}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
};

export const LuxuryPrivateCollection: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { isEn } = useLanguage();

  const defaultHeading = isEn ? "Join the Private Client Registry" : "Daftar Registri Klien Privat";
  const defaultEyebrow = isEn ? "Exclusive Access" : "Akses Eksklusif";
  const defaultDesc = isEn
    ? "Register to receive invitations to private viewings, bespoke services, and limited archival releases."
    : "Daftarkan diri Anda untuk menerima undangan pameran khusus, layanan eksklusif, dan rilisan terbatas.";
  const defaultButton = isEn ? "Request Access" : "Minta Akses";

  const isDefaultHeading = !sectionOptions.heading 
    || sectionOptions.heading === "Join the Private Client Registry" 
    || sectionOptions.heading === "Daftar Registri Klien Privat";
  const heading = isDefaultHeading ? defaultHeading : sectionOptions.heading;

  const isDefaultEyebrow = !sectionOptions.eyebrow 
    || sectionOptions.eyebrow === "Exclusive Access" 
    || sectionOptions.eyebrow === "Akses Eksklusif";
  const eyebrow = isDefaultEyebrow ? defaultEyebrow : sectionOptions.eyebrow;

  const currentDesc = sectionOptions.description || sectionOptions.subheading || sectionOptions.content;
  const isDefaultDesc = !currentDesc
    || currentDesc === "Register to receive invitations to private viewings and bespoke services."
    || currentDesc === "Register to receive invitations to private viewings, bespoke services, and limited archival releases."
    || currentDesc === "Daftarkan diri Anda untuk menerima undangan pameran khusus dan layanan eksklusif."
    || currentDesc === "Daftarkan diri Anda untuk menerima undangan pameran khusus, layanan eksklusif, dan rilisan terbatas.";
  const desc = isDefaultDesc ? defaultDesc : currentDesc;

  const isDefaultButton = !sectionOptions.buttonLabel 
    || sectionOptions.buttonLabel === "Request Access" 
    || sectionOptions.buttonLabel === "Minta Akses";
  const buttonLabel = isDefaultButton ? defaultButton : sectionOptions.buttonLabel;
  const buttonLink = sectionOptions.buttonLink || "#";
  
  const align = sectionOptions.textAlignment || 'center';
  const textAlignmentClass = align === 'left' ? 'text-left items-start' 
                           : align === 'right' ? 'text-right items-end'
                           : 'text-center items-center';

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto bg-[#FAF7F2] border border-[#EADBCE] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xs">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80')] mix-blend-multiply opacity-5 object-cover object-center pointer-events-none"></div>
        <div className={`relative z-10 flex flex-col ${textAlignmentClass}`}>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-[#9A6027] mb-4 font-mono font-medium">{eyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-serif mb-4 leading-tight text-[#36281D] font-normal">{heading}</h2>
          <p className={`text-[#7D6E63] max-w-md ${align === 'center' ? 'mx-auto' : ''} mb-8 text-sm leading-relaxed font-light font-sans`}>
            {desc}
          </p>
          <div>
            <a 
              href={buttonLink} 
              className="inline-block text-[10px] uppercase tracking-[0.25em] bg-[#8C531B] text-[#FFFDF9] hover:bg-[#724113] px-10 py-3.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 font-sans font-medium"
            >
              {buttonLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
