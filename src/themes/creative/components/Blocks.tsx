import React from 'react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES, formatRupiah, productHref, resolveSectionCta, resolveSectionImage } from '../../storefrontLinks';

/** Galeri foto produk toko bergaya masonry; tidak dirender bila belum ada foto produk. */
export const CreativeLookbook: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('creative');
  const items = products.filter((p) => p.image).slice(0, 9);
  if (items.length === 0) return null;

  const heading = sectionOptions.heading || 'Galeri Produk';
  const description = sectionOptions.description || sectionOptions.subheading;
  const coverImage = resolveSectionImage(sectionOptions);
  // Tombol hanya tampil bila merchant mengisi teks tombol di editor.
  const hasCta = Boolean(sectionOptions.buttonLabel || sectionOptions.buttonText);
  const cta = resolveSectionCta(sectionOptions, 'Lihat Koleksi', STORE_ROUTES.catalog);
  const columnsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'columns-1',
    tablet: 'columns-2',
    desktop: 'columns-3',
    fallback: 'columns-1 sm:columns-2 md:columns-3',
  });

  return (
    <section className="py-16 sm:py-32 px-4 sm:px-6 md:px-12 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-yellow-300 rounded-br-[100px] z-0"></div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 sm:gap-8 mb-10 sm:mb-20">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-black tracking-tighter break-words min-w-0">{heading}</h2>
          <div className="h-2 flex-1 min-w-[2rem] bg-black rounded-full"></div>
        </div>
        {description && (
          <p className="max-w-2xl -mt-6 sm:-mt-12 mb-10 sm:mb-16 text-base sm:text-lg text-gray-600 font-medium leading-relaxed">{description}</p>
        )}
        {coverImage && (
          <img src={coverImage} alt={heading} className="w-full max-h-[480px] object-cover rounded-3xl mb-8 sm:mb-12" />
        )}

        <div className={`${columnsClass} gap-6 sm:gap-8 space-y-6 sm:space-y-8`}>
          {items.map((p, i) => (
            <a key={p.id} href={productHref(p)} className="block break-inside-avoid group">
              <div className="relative overflow-hidden rounded-3xl mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/60 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={p.image}
                  alt={p.name}
                  className={`w-full ${i % 2 === 0 ? 'aspect-square' : 'aspect-[3/4]'} object-cover transform group-hover:scale-110 transition-transform duration-700`}
                />
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 text-white">
                  <p className="font-bold text-lg sm:text-xl mb-1 line-clamp-2 break-words">{p.name}</p>
                  <p className="text-yellow-300 font-bold">{formatRupiah(p.price)}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
        {hasCta && (
          <div className="mt-10 sm:mt-16 text-center">
            <a
              href={cta.href}
              className="inline-block px-8 py-4 bg-black text-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-blue-600 transition-colors"
            >
              {cta.label}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

/** Sorotan satu produk toko dengan gaya kartu miring; tidak dirender tanpa gambar. */
export const CreativeFloatingShowcase: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('creative');
  const product = products.find((p) => p.isFeatured && p.image) || products.find((p) => p.image) || products[0];
  const image = resolveSectionImage(sectionOptions) || product?.image;
  if (!image && !product) return null;

  const heading = sectionOptions.heading || 'Sorotan Produk';
  const title = sectionOptions.subheading || product?.name || 'Karya Pilihan Kami';
  const description =
    sectionOptions.description ||
    product?.description ||
    'Setiap produk kami pilih dengan teliti agar tampil beda dan berkesan untuk Anda.';
  const cta = resolveSectionCta(
    sectionOptions,
    product ? 'Lihat Produk' : 'Lihat Katalog',
    product ? productHref(product) : STORE_ROUTES.catalog,
  );
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-2',
    fallback: 'grid-cols-1 md:grid-cols-2',
  });

  return (
    <section className="py-16 sm:py-32 bg-blue-600 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-10 sm:mb-12 break-words">{heading}</h2>

        <div className={`grid ${gridColsClass} gap-10 sm:gap-12 items-center`}>
          {image && (
            <div className="h-[300px] sm:h-[400px] bg-white rounded-[40px] transform -rotate-3 hover:rotate-0 transition-transform duration-500 p-2 shadow-2xl relative">
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-12 h-12 sm:w-16 sm:h-16 bg-yellow-300 rounded-full z-20 animate-bounce"></div>
              <img src={image} className="w-full h-full object-cover rounded-[32px]" alt={product?.name || heading} />
            </div>
          )}
          <div className="text-left min-w-0">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-yellow-300 break-words">{title}</h3>
            {product && !sectionOptions.subheading && (
              <p className="text-xl font-black mb-4">{formatRupiah(product.price)}</p>
            )}
            <p className="text-base sm:text-lg leading-relaxed font-medium opacity-90 mb-8 line-clamp-5">{description}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={cta.href}
                className="inline-block px-6 sm:px-8 py-3.5 sm:py-4 bg-yellow-300 text-black rounded-full font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors"
              >
                {cta.label}
              </a>
              <a
                href={STORE_ROUTES.catalog}
                className="inline-block px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-white rounded-full font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-blue-600 transition-colors"
              >
                Semua Produk
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
