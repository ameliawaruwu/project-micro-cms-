import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES } from '../../storefrontLinks';

export const MinimalistHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);

  const products = useThemeProductsSource('minimalist');

  const heading = sectionOptions.heading || storeInfo?.name || 'Selamat Datang';
  const subheading =
    sectionOptions.subheading || sectionOptions.description || storeInfo?.description ||
    'Temukan produk pilihan terbaik untuk kebutuhan sehari-hari Anda.';
  const hero = getHeroContent(sectionOptions, {
    badge: 'Koleksi Pilihan',
    buttonLabel: 'Lihat Koleksi',
    buttonLink: STORE_ROUTES.catalog,
  });
  // Gambar latar: unggahan merchant → banner toko → foto produk pertama → gambar bawaan dekoratif.
  const bgImage =
    sectionOptions.imageUrl ||
    sectionOptions.bannerUrl ||
    (storeInfo as any)?.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80';

  return (
    <section className="relative w-full max-w-full min-h-[50vh] sm:min-h-[65vh] md:min-h-[85vh] py-8 sm:py-12 md:py-0 flex items-center justify-center overflow-hidden bg-[#fafafa] box-border">
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover opacity-90 scale-105 animate-[kenburns_20s_ease-out_forwards]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20"></div>
      </div>

      <div className="relative z-10 w-full px-3.5 sm:px-6 md:px-12 max-w-5xl mx-auto flex flex-col items-start justify-center box-border">
        <div className="w-full max-w-2xl bg-white/85 backdrop-blur-md p-5 sm:p-8 md:p-14 shadow-sm border border-white/50 rounded-2xl md:rounded-none box-border">
          {hero.badge && (
            <span className="inline-block text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.2em] uppercase text-gray-500 mb-2 sm:mb-4">
              {hero.badge}
            </span>
          )}
          <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight leading-tight sm:leading-[1.1] mb-3 sm:mb-5 break-words">
            {heading}
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-gray-600 mb-5 sm:mb-8 font-light leading-relaxed break-words">
            {subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <HeroActionLink
              action={hero.primary}
              className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-white text-xs sm:text-sm tracking-wide uppercase hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto min-w-[150px] text-center rounded-xl sm:rounded-none"
            >
              <span className="relative overflow-hidden">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">{hero.primary.label}</span>
                <span className="absolute inset-0 block transition-transform duration-300 translate-y-full group-hover:translate-y-0">{hero.primary.label}</span>
              </span>
            </HeroActionLink>
            {hero.secondary && (
              <HeroActionLink
                action={hero.secondary}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-gray-900 text-gray-900 text-xs sm:text-sm tracking-wide uppercase hover:bg-gray-900 hover:text-white transition-all duration-300 w-full sm:w-auto min-w-[150px] text-center rounded-xl sm:rounded-none"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
