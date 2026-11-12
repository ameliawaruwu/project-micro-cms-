import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { sanitizeLinkHref } from '../../navMenu';
import { AddToCartButton } from '../../storefrontCart';
import { STORE_ROUTES, formatRupiah, productHref } from '../../storefrontLinks';

/** Lookbook dari foto produk toko; tidak dirender bila belum ada produk bergambar. */
export const FashionLookbook: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { storeInfo } = useCmsStore();
  const products = useThemeProductsSource('fashion');
  const items = products.filter((p) => p.image).slice(0, 2);
  if (items.length === 0) return null;

  const heading = sectionOptions.heading || 'Lookbook';
  const [main, second] = items;
  const mainImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || main.image;
  const stackCols = isMobile || isTablet;
  const mainGridClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-12',
    fallback: 'grid-cols-1 md:grid-cols-12',
  });
  const col7Class = stackCols ? '' : 'md:col-span-7';
  const col5Class = stackCols ? '' : 'md:col-span-5';

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-white text-[#18181B]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center mb-10 sm:mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-4">Inspirasi Gaya</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic break-words">{heading}</h2>
        </div>

        <div className={`grid ${mainGridClass} gap-4 md:gap-8`}>
          <div className={col7Class}>
            <a href={productHref(main)} className="relative group overflow-hidden h-[50vh] md:h-[80vh] block">
              <img src={mainImage} alt={main.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 text-white min-w-0">
                <p className="text-xs uppercase tracking-widest mb-2 line-clamp-1">{main.name}</p>
                <span className="text-sm border-b border-white pb-1">Lihat Produk</span>
              </div>
            </a>
          </div>
          <div className={`${col5Class} flex flex-col gap-4 md:gap-8`}>
            {second && (
              <a href={productHref(second)} className="relative group overflow-hidden h-[40vh] block">
                <img src={second.image} alt={second.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 text-white min-w-0">
                  <p className="text-xs uppercase tracking-widest mb-2 line-clamp-1">{second.name}</p>
                  <span className="text-sm border-b border-white pb-1">Lihat Produk</span>
                </div>
              </a>
            )}
            <div className="relative overflow-hidden min-h-[30vh] md:h-[40vh] bg-gray-100 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl sm:text-3xl font-serif italic mb-4 sm:mb-6 text-gray-900 break-words">
                {sectionOptions.subheading || storeInfo?.name || 'Koleksi Kami'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-xs line-clamp-4">
                {sectionOptions.description || storeInfo?.description || 'Temukan pilihan produk terbaik yang dirancang untuk gaya hidup Anda.'}
              </p>
              <a
                href={STORE_ROUTES.catalog}
                className="inline-block text-[10px] uppercase tracking-[0.2em] font-medium border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors"
              >
                Lihat Semua Produk
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Produk unggulan dari toko; tidak dirender bila toko belum punya produk. */
export const FashionFeaturedProducts: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('fashion');
  const heading = sectionOptions.heading || 'Produk Terlaris';

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: 'grid-cols-4',
    fallback: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  });

  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-[#F9F9F9] text-[#18181B]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex justify-between items-end gap-4 mb-10 sm:mb-16">
          <h2 className="min-w-0 break-words text-2xl sm:text-3xl md:text-4xl font-serif italic storefront-heading-section">{heading}</h2>
          <a
            href={STORE_ROUTES.catalog}
            className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] border-b border-black pb-1 hover:text-gray-500 transition-colors"
          >
            Lihat Semua
          </a>
        </div>

        <div className={`grid ${gridColsClass} gap-4 sm:gap-8 md:gap-x-8 md:gap-y-16`}>
          {products.slice(0, 4).map((p, i) => (
            <div key={p.id} className={`group min-w-0 ${i % 2 !== 0 ? 'md:mt-12 lg:mt-16' : ''}`}>
              <div className="relative overflow-hidden mb-4 sm:mb-6 aspect-[3/4] bg-gray-100">
                <a href={productHref(p)} className="block w-full h-full">
                  {p.image && (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                  )}
                </a>
                <AddToCartButton product={p} className="absolute bottom-0 left-0 w-full bg-white text-black text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] py-3 sm:py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium whitespace-nowrap">
                  + Keranjang
                </AddToCartButton>
              </div>
              <a href={productHref(p)} className="block text-center min-w-0">
                <h3 className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 group-hover:text-gray-500 transition-colors storefront-card-title line-clamp-2 break-words">
                  {p.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 tracking-wider sm:tracking-widest storefront-card-price">{formatRupiah(p.price)}</p>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/** Banner promo; tombol membuka halaman Promo (sama dengan menu navbar). */
export const FashionPromoBanner: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const products = useThemeProductsSource('fashion');
  const heading = sectionOptions.heading || 'Promo Spesial';
  const desc = sectionOptions.description || 'Dapatkan penawaran terbaik untuk produk pilihan kami.';
  // Gambar latar dekoratif: unggahan merchant → foto produk toko → gambar bawaan.
  const bgImage =
    sectionOptions.imageUrl ||
    sectionOptions.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80';
  const buttonLabel = sectionOptions.buttonLabel || sectionOptions.buttonText || 'Lihat Promo';
  const customHref = sanitizeLinkHref(sectionOptions.buttonLink);
  const buttonHref = customHref && customHref !== '#' ? customHref : STORE_ROUTES.promo;

  return (
    <section className="w-full min-h-[50vh] sm:min-h-[60vh] relative flex items-center justify-center bg-[#18181B] text-white px-4 py-16">
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover opacity-40 grayscale" />
      </div>
      <div className="relative z-10 text-center p-6 sm:p-8 bg-black/40 backdrop-blur-sm border border-white/20 max-w-3xl min-w-0">
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-serif italic mb-4 sm:mb-6 break-words">{heading}</h2>
        <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-8 sm:mb-10 text-gray-300">
          {desc}
        </p>
        <a
          href={buttonHref}
          className="inline-block px-8 sm:px-12 py-4 bg-white text-black text-[10px] uppercase tracking-[0.2em] hover:bg-transparent hover:text-white hover:border-white border border-transparent transition-all duration-300"
        >
          {buttonLabel}
        </a>
      </div>
    </section>
  );
};
