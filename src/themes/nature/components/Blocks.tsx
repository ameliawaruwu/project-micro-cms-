import React from 'react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import {
  DEFAULT_INGREDIENT_EYEBROW,
  DEFAULT_INGREDIENT_ITEMS,
  DEFAULT_SUSTAINABILITY_PILLARS,
  nonEmptyStrings,
  SustainabilityPillar,
} from '../../sectionContent';

export const NatureIngredientStory: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('nature');
  // Gambar: unggahan merchant → foto produk pertama toko → gambar dekoratif bawaan.
  const imageSrc = sectionOptions.imageUrl || sectionOptions.bannerUrl || products.find((p) => p.image)?.image || 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80';
  const heading = sectionOptions.heading || 'Cerita di Balik Produk Kami';
  const desc = sectionOptions.description || 'Setiap produk kami pilih dengan teliti dari bahan berkualitas, diproses dengan hati-hati, dan disiapkan agar sampai ke tangan Anda dalam kondisi terbaik.';
  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const halfWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-1/2';
  const eyebrow = String(sectionOptions.eyebrowText ?? DEFAULT_INGREDIENT_EYEBROW).trim();
  const ingredients = nonEmptyStrings(sectionOptions.ingredients, DEFAULT_INGREDIENT_ITEMS);

  return (
    <section className="py-16 sm:py-24 md:py-40 px-4 sm:px-6 md:px-12 bg-[#F9F6F0]">
      <div className={`max-w-[1200px] mx-auto flex ${flexDirClass} items-center gap-10 sm:gap-16 md:gap-24`}>
        <div className={halfWidthClass}>
          <div className="relative">
            <div className="absolute inset-0 bg-[#E8E4DB] rounded-t-full translate-x-4 translate-y-4"></div>
            <img
              src={imageSrc}
              alt={heading}
              className="relative w-full aspect-[3/4] object-cover rounded-t-full rounded-b-3xl shadow-lg hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
          </div>
        </div>
        <div className={`${halfWidthClass} min-w-0`}>
          {eyebrow && <p className="text-[11px] uppercase tracking-[0.2em] text-[#5C6B5D] mb-6 font-medium">{eyebrow}</p>}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#2C3B2D] mb-6 sm:mb-8 leading-tight break-words">{heading}</h2>
          <p className="text-[#5C6B5D] leading-loose text-base md:text-lg mb-8 sm:mb-12 font-light">
            {desc}
          </p>
          <ul className="space-y-6">
            {ingredients.map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-[#2C3B2D] text-base sm:text-lg">
                <span className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-[#E8E4DB] text-[#5C6B5D]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                <span className="font-medium tracking-wide min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export const NatureSustainability: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const heading = sectionOptions.heading || 'Komitmen Kami';
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-1 md:grid-cols-3',
  });

  const description = String(sectionOptions.description ?? '').trim();
  const pillars: SustainabilityPillar[] = (Array.isArray(sectionOptions.features) ? sectionOptions.features : DEFAULT_SUSTAINABILITY_PILLARS)
    .filter((item: SustainabilityPillar) => item && (String(item.title ?? '').trim() || String(item.desc ?? '').trim()));

  return (
    <section className="py-16 sm:py-24 md:py-40 px-4 sm:px-6 md:px-12 text-center bg-white">
      <div className="max-w-5xl mx-auto">
        <svg className="w-12 h-12 mx-auto mb-8 text-[#5C6B5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl font-serif text-[#2C3B2D] break-words ${description ? 'mb-6' : 'mb-10 sm:mb-16'}`}>{heading}</h2>
        {description && <p className="max-w-2xl mx-auto text-[#5C6B5D] leading-loose text-base md:text-lg font-light mb-10 sm:mb-16">{description}</p>}
        <div className={`grid ${gridColsClass} gap-6 md:gap-12 mt-8 sm:mt-12`}>
          {pillars.map((item, i) => (
            <div key={i} className="p-6 sm:p-10 bg-[#F9F6F0] rounded-[32px] hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-md border border-[#E8E4DB]">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#2C3B2D] text-xl font-serif mb-6 mx-auto shadow-sm">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C3B2D] mb-4 break-words">{item.title}</h3>
              <p className="text-[#5C6B5D] leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
