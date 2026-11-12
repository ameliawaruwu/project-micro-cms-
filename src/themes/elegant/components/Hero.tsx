import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { STORE_ROUTES } from '../../storefrontLinks';
import { useThemeProductsSource } from '../../useSectionProducts';

export const ElegantHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const products = useThemeProductsSource('elegant');
  const hero = getHeroContent(sectionOptions, {
    badge: 'Koleksi Terbaru',
    buttonLabel: 'Lihat Koleksi',
    buttonLink: STORE_ROUTES.catalog,
    secondaryButtonLink: STORE_ROUTES.promo,
  });
  const heading = sectionOptions?.heading || storeInfo?.name || 'Selamat Datang';
  const subheading =
    sectionOptions?.subheading ||
    sectionOptions?.subtitle ||
    sectionOptions?.description ||
    storeInfo?.description ||
    'Temukan produk pilihan terbaik dari toko kami.';
  // Tanpa banner dari merchant, pakai foto produk toko sendiri sebelum gambar bawaan tema.
  const bgImage =
    sectionOptions?.imageUrl ||
    sectionOptions?.bannerUrl ||
    (storeInfo as any)?.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80';

  return (
    <section className="relative w-full min-h-screen flex font-['Cormorant_Garamond',serif] bg-[#FAF9F6]">
      {/* Editorial Layout: Image left/center, text offset */}
      <div className="absolute inset-0 md:left-[10%] md:right-[10%] top-0 md:top-12 md:bottom-12 overflow-hidden shadow-2xl">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 md:bg-black/10"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-end md:items-center px-4 sm:px-6 md:px-16 pb-12 sm:pb-20 md:pb-0 pt-[35vh] md:pt-0">
        <div className="bg-[#FAF9F6] p-6 sm:p-8 md:p-16 w-full max-w-xl md:ml-auto md:-mr-12 shadow-xl min-w-0">
          {hero.badge && (
            <span className="block text-[#6B6865] text-[10px] tracking-[0.3em] uppercase font-sans mb-6">
              {hero.badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#2C2A29] leading-[1.1] mb-6 sm:mb-8 italic break-words">
            {heading}
          </h1>
          {subheading && (
            <p className="text-base sm:text-lg text-[#6B6865] mb-8 sm:mb-12 max-w-md leading-relaxed">
              {subheading}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <HeroActionLink
              action={hero.primary}
              className="group inline-flex items-center gap-4 text-[#2C2A29] font-sans text-xs uppercase tracking-[0.2em] pb-2 border-b border-[#2C2A29]/30 hover:border-[#2C2A29] transition-colors"
            >
              {hero.primary.label}
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </HeroActionLink>
            {hero.secondary && (
              <HeroActionLink
                action={hero.secondary}
                className="inline-flex items-center text-[#6B6865] font-sans text-xs uppercase tracking-[0.2em] pb-2 border-b border-transparent hover:border-[#6B6865] transition-colors"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
