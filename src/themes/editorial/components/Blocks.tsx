import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES, formatRupiah, productHref } from '../../storefrontLinks';

/** Lookbook dua foto produk toko; tidak dirender bila belum ada foto produk. */
export const EditorialLookbook: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('editorial');
  const items = products.filter((p) => p.image).slice(0, 2);
  const mainGridClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-12',
    fallback: 'grid-cols-1 md:grid-cols-12',
  });
  const colSpanTextClass = isMobile || isTablet ? '' : 'md:col-span-4';
  const colSpanImgClass = isMobile || isTablet ? '' : 'md:col-span-8';
  const orderTextClass = isMobile || isTablet ? '' : 'order-2 md:order-1';
  const orderImgClass = isMobile || isTablet ? '' : 'order-1 md:order-2';
  const imgPairGridClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-2',
    fallback: 'grid-cols-2',
  });
  if (items.length === 0) return null;

  const heading = sectionOptions.heading || 'Galeri Produk';
  const desc =
    sectionOptions.description ||
    'Lihat lebih dekat produk pilihan kami, dirangkai untuk menemani gaya dan kebutuhan Anda sehari-hari.';

  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto bg-[#fafafa]">
      <div className={`grid ${mainGridClass} gap-10 md:gap-24 items-center`}>
        <div className={`${colSpanTextClass} ${orderTextClass} min-w-0`}>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-6">Pilihan Kami</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif italic mb-6 sm:mb-8 text-gray-900 break-words">{heading}</h2>
          <p className="text-gray-600 leading-loose mb-8 sm:mb-12 font-light text-sm md:text-base">{desc}</p>
          <a
            href={STORE_ROUTES.catalog}
            className="inline-block border-b border-gray-900 pb-1 uppercase tracking-[0.2em] text-[10px] font-medium hover:text-gray-500 hover:border-gray-500 transition-colors"
          >
            Lihat Koleksi
          </a>
        </div>
        <div className={`${colSpanImgClass} ${orderImgClass}`}>
          <div className={`grid ${imgPairGridClass} gap-4 md:gap-8`}>
            {items.map((p, i) => (
              <a key={p.id} href={productHref(p)} className={`block overflow-hidden ${i === 1 ? 'mt-10 sm:mt-16 md:mt-24' : ''}`}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full aspect-[3/4] object-cover grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-all duration-1000"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/** Banner kampanye; latar memakai gambar merchant, banner toko, atau foto produk. */
export const EditorialCampaign: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const products = useThemeProductsSource('editorial');
  const heading = sectionOptions.heading || 'Koleksi Pilihan';
  const desc =
    sectionOptions.description ||
    'Temukan produk-produk terbaik kami yang dipilih dengan cermat untuk Anda.';
  // Gambar latar dekoratif: gambar merchant → banner toko → foto produk → gambar bawaan tema.
  const bgImage =
    sectionOptions.imageUrl ||
    sectionOptions.bannerUrl ||
    (storeInfo as any)?.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80';

  return (
    <section className="w-full min-h-[60vh] sm:min-h-[70vh] bg-gray-900 text-white flex flex-col items-center justify-center text-center p-4 sm:p-8 relative overflow-hidden my-12">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
        <img src={bgImage} alt="" className="w-full h-full object-cover object-center grayscale" />
      </div>
      <div className="relative z-10 max-w-2xl w-full px-4 sm:px-6 py-14 sm:py-20 bg-gray-900/40 backdrop-blur-sm border border-white/10">
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif italic mb-8 sm:mb-10 drop-shadow-lg break-words">{heading}</h2>
        <p className="uppercase tracking-[0.3em] text-[10px] md:text-xs text-gray-300 leading-loose">
          {desc}
        </p>
        <a
          href={STORE_ROUTES.catalog}
          className="inline-block mt-8 sm:mt-10 border-b border-white pb-1 uppercase tracking-[0.3em] text-[10px] md:text-xs hover:opacity-70 transition-opacity"
        >
          Belanja Sekarang
        </a>
      </div>
    </section>
  );
};

/** Sorotan satu produk toko dengan tata letak asimetris. */
export const EditorialAsymmetricShowcase: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('editorial');
  const product = products.find((p) => p.isFeatured) || products[2] || products[0];
  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const imgWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-7/12';
  const textWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-5/12';
  if (!product) return null;

  return (
    <section className={`py-16 sm:py-24 md:py-40 px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto flex ${flexDirClass} items-end gap-10 sm:gap-16 md:gap-24`}>
      {product.image && (
        <a href={productHref(product)} className={`${imgWidthClass} block relative overflow-hidden group`}>
          <div className="absolute inset-0 bg-gray-900/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
          <img src={product.image} alt={product.name} className="w-full aspect-[4/5] object-cover mix-blend-multiply" />
        </a>
      )}
      <div className={`${textWidthClass} min-w-0 pb-4 sm:pb-12 md:pb-24 md:pr-12`}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-6 sm:mb-8 font-medium">
          {sectionOptions.badgeText || 'Produk Unggulan'}
        </p>
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-6 sm:mb-8 text-gray-900 leading-tight break-words">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 leading-loose mb-8 sm:mb-12 font-light line-clamp-5">{product.description}</p>
        )}
        <p className="font-medium tracking-widest text-gray-900">{formatRupiah(product.price)}</p>
        <a
          href={productHref(product)}
          className="block text-center mt-8 sm:mt-12 w-full py-4 bg-gray-900 text-white text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
        >
          Lihat Detail
        </a>
      </div>
    </section>
  );
};

/** Cerita toko; bawaan memakai deskripsi toko. */
export const EditorialBrandStory: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const heading = sectionOptions.heading || 'Tentang Kami';
  const desc =
    sectionOptions.description ||
    storeInfo?.description ||
    'Kami menghadirkan produk pilihan dengan kualitas terbaik dan pelayanan yang ramah. Terima kasih telah berbelanja di toko kami.';

  return (
    <section className="py-16 sm:py-32 md:py-48 px-4 sm:px-6 text-center max-w-4xl mx-auto">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic mb-8 sm:mb-12 text-gray-900 break-words">{heading}</h2>
      <p className="text-base sm:text-lg md:text-xl leading-loose sm:leading-[2.5] text-gray-600 font-light break-words">
        {desc}
      </p>
      <a
        href={STORE_ROUTES.contact}
        className="inline-block mt-10 border-b border-gray-900 pb-1 uppercase tracking-[0.2em] text-[10px] font-medium hover:text-gray-500 hover:border-gray-500 transition-colors"
      >
        Hubungi Kami
      </a>
      <div className="w-px h-16 sm:h-24 bg-gray-300 mx-auto mt-12 sm:mt-20"></div>
    </section>
  );
};

/** Sorotan beberapa produk toko bergaya jurnal; tidak dirender bila belum ada foto produk. */
export const EditorialJournal: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('editorial');
  const items = products.filter((p) => p.image).slice(0, 3);
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-1 md:grid-cols-3',
  });
  if (items.length === 0) return null;

  const heading = sectionOptions.heading || 'Sorotan Produk';

  return (
    <section className="py-16 sm:py-32 bg-white px-4 sm:px-6 md:px-12 border-t border-gray-100">
      <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-serif italic mb-10 sm:mb-20 text-gray-900 break-words">{heading}</h2>
      <div className={`grid ${gridColsClass} gap-8 md:gap-12 max-w-[1400px] mx-auto`}>
        {items.map((product) => (
          <a key={product.id} href={productHref(product)} className="block group">
            <div className="w-full aspect-[4/5] bg-gray-100 mb-6 sm:mb-8 overflow-hidden relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out grayscale-[10%]"
              />
            </div>
            <div className="flex flex-col items-center text-center px-4 min-w-0">
              <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-3 sm:mb-4">
                {product.categoryName || 'Produk'}
              </p>
              <h3 className="text-xl sm:text-2xl font-serif group-hover:text-gray-500 transition-colors line-clamp-2 break-words">{product.name}</h3>
              <p className="mt-2 text-sm tracking-widest text-gray-700">{formatRupiah(product.price)}</p>
            </div>
          </a>
        ))}
      </div>
      <div className="flex justify-center mt-12 sm:mt-20">
        <a
          href={STORE_ROUTES.catalog}
          className="inline-block border border-gray-900 px-8 sm:px-12 py-4 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-gray-900 hover:text-white transition-colors"
        >
          Lihat Semua Produk
        </a>
      </div>
    </section>
  );
};
