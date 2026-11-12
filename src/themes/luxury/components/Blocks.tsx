import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { sanitizeLinkHref } from '../../navMenu';
import { STORE_ROUTES, formatRupiah, productHref } from '../../storefrontLinks';

/** Tautan tombol dari merchant; "#", "#all" (nilai lama template) atau tautan berbahaya → bawaan. */
function resolveButtonLink(value: unknown, fallback: string): string {
  const href = sanitizeLinkHref(value);
  return href && href !== '#' && href !== '#all' ? href : fallback;
}

export const LuxurySignatureCollection: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('luxury');
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
  const buttonLink = resolveButtonLink(sectionOptions.buttonLink, STORE_ROUTES.catalog);

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3',
  });

  if (products.length === 0) return null;

  return (
    <section className={`py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-16 ${bgColor} transition-colors duration-500`}>
      <div className={`flex ${headerLayout} mb-10 sm:mb-14 gap-6 sm:gap-8`}>
        <div className="min-w-0">
          <h2 className={`text-2xl sm:text-3xl md:text-5xl font-serif ${headingColor} tracking-tight font-normal storefront-heading-section break-words`}>{heading}</h2>
          {(sectionOptions.subheading || sectionOptions.description || sectionOptions.featuredSubtitle) && (
            <p className={`mt-3 text-xs sm:text-sm md:text-base font-light ${textColor} max-w-xl font-sans`}>
              {sectionOptions.subheading || sectionOptions.description || sectionOptions.featuredSubtitle}
            </p>
          )}
        </div>
        <a href={buttonLink} className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.3em] border-b border-[#8C531B]/40 text-[#8C531B] hover:border-[#8C531B] pb-1 transition-colors duration-300 font-sans font-medium">
          {buttonLabel}
        </a>
      </div>
      <div className={`grid ${gridColsClass} gap-3 sm:gap-8`}>
        {products.slice(0, sectionOptions.limit || 6).map((product) => (
          <a key={product.id} href={productHref(product)} className="group min-w-0 flex flex-col items-center bg-[#FAF7F2] p-3 sm:p-6 rounded-2xl border border-[#EADBCE] shadow-2xs hover:shadow-md transition-all duration-300">
            <div className="w-full aspect-[3/4] overflow-hidden mb-3 sm:mb-6 bg-white rounded-xl relative">
              {product.image && (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out" />
              )}
              <div className="absolute inset-0 bg-[#9A6027]/0 group-hover:bg-[#9A6027]/5 transition-colors duration-700"></div>
            </div>
            <h3 className="font-serif text-base sm:text-lg md:text-xl mb-1 sm:mb-2 text-center text-[#36281D] group-hover:text-[#9A6027] transition-colors duration-300 px-1 sm:px-4 font-normal storefront-card-title line-clamp-2 break-words max-w-full">{product.name}</h3>
            <p className="text-xs sm:text-sm tracking-wider sm:tracking-[0.2em] text-center text-[#8C531B] font-mono font-semibold storefront-card-price">{formatRupiah(product.price)}</p>
          </a>
        ))}
      </div>
    </section>
  );
};

export const LuxuryCraftsmanship: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { isEn } = useLanguage();
  const products = useThemeProductsSource('luxury');

  const defaultHeading = isEn ? "Meticulous Craftsmanship" : "Keahlian Adiluhung";
  const defaultEyebrow = isEn ? "FINE CRAFTSMANSHIP" : "KEAHLIAN ADILUHUNG";
  const defaultDesc = isEn
    ? "Every piece is designed with absolute dedication to detail. From the selection of premium materials to the final stitch, our artisans ensure perfection at every stage of creation."
    : "Setiap potongan dirancang dengan dedikasi mutlak terhadap detail. Dari pemilihan material premium hingga jahitan akhir, pengrajin kami memastikan kesempurnaan di setiap tahap pembuatan.";
  const defaultButton = isEn ? "Explore the Collection" : "Jelajahi Koleksi";

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
  const buttonLink = resolveButtonLink(sectionOptions.buttonLink, STORE_ROUTES.catalog);
  // Gambar: unggahan merchant → foto produk toko → gambar bawaan dekoratif.
  const image =
    sectionOptions.imageUrl ||
    sectionOptions.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80';
  
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
  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const halfWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-1/2';
  const orderImgClass = isMobile || isTablet ? '' : 'order-2 md:order-1';
  const orderTextClass = isMobile || isTablet ? '' : 'order-1 md:order-2';

  return (
    <section className={`py-16 sm:py-24 md:py-32 px-4 sm:px-8 md:px-16 ${bgColor} flex ${flexDirClass} items-center gap-10 sm:gap-14 md:gap-20 transition-colors duration-500 border-y border-[#F0EBE1]`}>
      <div className={`${halfWidthClass} flex justify-center ${orderImgClass}`}>
        <div className="relative w-full max-w-lg aspect-[4/5] overflow-hidden rounded-2xl group border border-[#EADBCE] shadow-xs">
          <img src={image} alt={heading} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[15s] ease-out" />
        </div>
      </div>
      <div className={`${halfWidthClass} ${orderTextClass}`}>
        <div className={`max-w-lg mx-auto flex flex-col ${textAlignmentClass}`}>
          <p className={`text-[10px] uppercase tracking-[0.4em] ${subColor} mb-5 font-mono font-medium`}>{eyebrow}</p>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-serif ${headingColor} mb-6 leading-[1.15] font-normal break-words`}>{heading}</h2>
          <p className={`${textColor} leading-relaxed mb-8 text-sm md:text-base font-light font-sans`}>
            {desc}
          </p>
          <a href={buttonLink} className={`inline-block text-[10px] uppercase tracking-[0.2em] px-8 py-3.5 transition-all duration-300 font-sans font-medium ${btnClass}`}>
            {buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
};

export const LuxuryPrivateCollection: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { isEn } = useLanguage();

  // Tidak ada formulir pendaftaran: section ini mengajak pengunjung menghubungi toko (halaman Kontak).
  const defaultHeading = isEn ? "Personal Shopping Assistance" : "Layanan Belanja Personal";
  const defaultEyebrow = isEn ? "Exclusive Service" : "Layanan Eksklusif";
  const defaultDesc = isEn
    ? "Contact us for product recommendations, availability, and personal assistance."
    : "Hubungi kami untuk rekomendasi produk, ketersediaan stok, dan bantuan belanja personal.";
  const defaultButton = isEn ? "Contact Us" : "Hubungi Kami";

  const isDefaultHeading = !sectionOptions.heading 
    || sectionOptions.heading === "Join the Private Client Registry" 
    || sectionOptions.heading === "Daftar Registri Klien Privat"
    || sectionOptions.heading === "Personal Shopping Assistance"
    || sectionOptions.heading === "Layanan Belanja Personal";
  const heading = isDefaultHeading ? defaultHeading : sectionOptions.heading;

  const isDefaultEyebrow = !sectionOptions.eyebrow 
    || sectionOptions.eyebrow === "Exclusive Access" 
    || sectionOptions.eyebrow === "Akses Eksklusif"
    || sectionOptions.eyebrow === "Exclusive Service"
    || sectionOptions.eyebrow === "Layanan Eksklusif";
  const eyebrow = isDefaultEyebrow ? defaultEyebrow : sectionOptions.eyebrow;

  const currentDesc = sectionOptions.description || sectionOptions.subheading || sectionOptions.content;
  const isDefaultDesc = !currentDesc
    || currentDesc === "Register to receive invitations to private viewings and bespoke services."
    || currentDesc === "Register to receive invitations to private viewings, bespoke services, and limited archival releases."
    || currentDesc === "Daftarkan diri Anda untuk menerima undangan pameran khusus dan layanan eksklusif."
    || currentDesc === "Daftarkan diri Anda untuk menerima undangan pameran khusus, layanan eksklusif, dan rilisan terbatas."
    || currentDesc === "Contact us for product recommendations, availability, and personal assistance."
    || currentDesc === "Hubungi kami untuk rekomendasi produk, ketersediaan stok, dan bantuan belanja personal.";
  const desc = isDefaultDesc ? defaultDesc : currentDesc;

  const isDefaultButton = !sectionOptions.buttonLabel 
    || sectionOptions.buttonLabel === "Request Access" 
    || sectionOptions.buttonLabel === "Minta Akses"
    || sectionOptions.buttonLabel === "Contact Us"
    || sectionOptions.buttonLabel === "Hubungi Kami";
  const buttonLabel = isDefaultButton ? defaultButton : sectionOptions.buttonLabel;
  const buttonLink = resolveButtonLink(sectionOptions.buttonLink, STORE_ROUTES.contact);
  
  const align = sectionOptions.textAlignment || 'center';
  const textAlignmentClass = align === 'left' ? 'text-left items-start' 
                           : align === 'right' ? 'text-right items-end'
                           : 'text-center items-center';

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-white">
      <div className="max-w-4xl mx-auto bg-[#FAF7F2] border border-[#EADBCE] rounded-3xl p-6 sm:p-10 md:p-16 text-center relative overflow-hidden shadow-2xs">
        <div className={`relative z-10 flex flex-col ${textAlignmentClass}`}>
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-[#9A6027] mb-4 font-mono font-medium">{eyebrow}</p>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif mb-4 leading-tight text-[#36281D] font-normal break-words">{heading}</h2>
          <p className={`text-[#7D6E63] max-w-md ${align === 'center' ? 'mx-auto' : ''} mb-8 text-sm leading-relaxed font-light font-sans`}>
            {desc}
          </p>
          <div>
            <a 
              href={buttonLink} 
              className="inline-block text-[10px] uppercase tracking-[0.25em] bg-[#8C531B] text-[#FFFDF9] hover:bg-[#724113] px-8 sm:px-10 py-3.5 rounded-lg shadow-sm hover:shadow transition-all duration-300 font-sans font-medium"
            >
              {buttonLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
