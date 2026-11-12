import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Sparkles } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { STORE_ROUTES } from '../../storefrontLinks';
import { useThemeProductsSource } from '../../useSectionProducts';

export const CuteHero: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const products = useThemeProductsSource('cute');
  // Tanpa banner dari merchant, pakai foto produk toko sendiri sebelum gambar bawaan tema.
  const bgImage =
    sectionOptions?.imageUrl ||
    sectionOptions?.bannerUrl ||
    (storeInfo as any)?.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80';
  const heading = sectionOptions?.heading || storeInfo?.name || 'Selamat Datang! 💖';
  const subheading =
    sectionOptions?.subheading ||
    sectionOptions?.subtitle ||
    sectionOptions?.description ||
    storeInfo?.description ||
    'Temukan produk pilihan terbaik dari toko kami.';
  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const hero = getHeroContent(sectionOptions, {
    badge: '✨ Selamat Datang',
    buttonLabel: 'Mulai Belanja!',
    buttonLink: STORE_ROUTES.catalog,
    secondaryButtonLink: STORE_ROUTES.promo,
  });
  const contentTextAlignClass = isMobile || isTablet ? 'text-center' : 'text-center md:text-left';
  const contentPadClass = isMobile || isTablet ? 'p-6 sm:p-10' : 'p-6 sm:p-10 md:p-16';
  const imageHeightClass = isMobile || isTablet ? 'h-[300px] sm:h-[400px]' : 'h-[300px] sm:h-[400px] md:h-[600px]';

  return (
    <section className="relative w-full py-8 sm:py-12 px-4 sm:px-6 font-['Outfit',sans-serif]">
      <div className={`max-w-6xl mx-auto bg-[#FFD1DC]/30 rounded-[2rem] sm:rounded-[3rem] overflow-hidden relative flex ${flexDirClass} items-center border-4 sm:border-8 border-white shadow-xl`}>

        {/* Floating decorations */}
        <div className="absolute top-10 left-10 text-[#FF85A1] animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="absolute bottom-20 left-1/2 text-[#FFB6C1] animate-pulse">
          <Sparkles className="w-12 h-12" />
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${contentPadClass} ${contentTextAlignClass} z-10`}>
          {hero.badge && (
            <div className="inline-block px-4 py-2 bg-white rounded-full text-[#FF85A1] font-bold text-sm mb-6 shadow-sm border-2 border-[#FFF5F7]">
              {hero.badge}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#FF85A1] leading-[1.1] mb-6 break-words">
            {heading}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-lg font-medium leading-relaxed">
            {subheading}
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <HeroActionLink
              action={hero.primary}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-[#FF85A1] text-white text-base sm:text-lg font-black hover:bg-[#FF6B8B] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 sm:min-w-[200px] rounded-full border-4 border-white"
            />
            {hero.secondary && (
              <HeroActionLink
                action={hero.secondary}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#FF85A1] text-base sm:text-lg font-black hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-full border-4 border-[#FFD1DC]"
              />
            )}
          </div>
        </div>

        {/* Image */}
        <div className={`flex-1 w-full ${imageHeightClass} relative p-4 sm:p-6`}>
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-8 border-white shadow-lg bg-white relative group">
            <img
              src={bgImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Cute badge on image */}
            <div className="absolute right-2 sm:-right-4 top-6 sm:top-10 bg-[#FFD1DC] w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 border-white shadow-md rotate-12 group-hover:rotate-45 transition-transform">
              <span className="font-black text-[#FF85A1] text-sm sm:text-base text-center leading-tight">Produk<br/>Terbaru</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

