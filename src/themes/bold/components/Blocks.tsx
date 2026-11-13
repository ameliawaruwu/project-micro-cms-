import React from 'react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import {
  STORE_ROUTES,
  formatRupiah,
  getProductCategories,
  productHref,
  resolveSectionCta,
  resolveSectionImage,
} from '../../storefrontLinks';

/** Produk unggulan: produk pertama toko. Tidak dirender bila toko belum punya produk. */
export const BoldLatestDrop: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const products = useThemeProductsSource('bold');
  const product = products.find((p) => p.isFeatured) || products[0];
  if (!product) return null;

  // Teks, gambar & tombol dari editor; bila kosong memakai data produk unggulan.
  const badge = sectionOptions.badgeText || 'Produk Unggulan';
  const heading = sectionOptions.heading || product.name;
  const description = sectionOptions.description || product.description;
  const image = resolveSectionImage(sectionOptions) || product.image;
  const cta = resolveSectionCta(sectionOptions, 'Beli Sekarang →', productHref(product));

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-zinc-950 text-white relative overflow-hidden border-b border-zinc-900">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
        <a href={productHref(product)} className="w-full md:w-5/12 max-w-md mx-auto relative group block">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
            {image && (
              <img src={image} alt={heading} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
            )}
          </div>
        </a>
        <div className="w-full md:flex-1 min-w-0 space-y-5 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-red-600/10 border border-red-500/30 text-red-500 text-xs font-extrabold uppercase tracking-widest rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {badge}
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight uppercase break-words">
            {heading}
          </h2>
          <div className="text-xl sm:text-2xl font-black text-white bg-zinc-900 border border-zinc-800 inline-block px-5 py-2.5 rounded-xl tracking-tight shadow-md">
            {formatRupiah(product.price)}
          </div>
          {description && (
            <p className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xl line-clamp-4">
              {description}
            </p>
          )}
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={cta.href}
              className="inline-block px-7 sm:px-8 py-3.5 sm:py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest text-xs sm:text-sm rounded-xl transition-all duration-300 shadow-lg shadow-red-600/25 hover:scale-105 active:scale-95"
            >
              {cta.label}
            </a>
            <a
              href={STORE_ROUTES.catalog}
              className="inline-block px-7 sm:px-8 py-3.5 sm:py-4 border border-zinc-700 hover:border-red-500 text-white font-extrabold uppercase tracking-widest text-xs sm:text-sm rounded-xl transition-colors"
            >
              Lihat Katalog
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Kategori dari produk toko; setiap kartu membuka katalog. */
export const BoldCategoryTiles: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('bold');
  const categories = getProductCategories(products, 4);
  if (categories.length === 0) return null;

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-4',
    fallback: 'grid-cols-2 md:grid-cols-4',
  });

  return (
    <section className="bg-zinc-950 py-14 sm:py-16 px-4 sm:px-6 border-b border-zinc-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 mb-2">Koleksi</h2>
          <p className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            {sectionOptions.heading || 'Belanja per Kategori'}
          </p>
        </div>
        <div className={`grid ${gridColsClass} gap-3 sm:gap-5`}>
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={STORE_ROUTES.catalog}
              className="h-40 md:h-60 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 group hover:border-red-500/50 transition-all duration-300 shadow-xl relative overflow-hidden"
            >
              {cat.image && (
                <img src={cat.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight group-hover:scale-110 transition-transform relative z-10 text-white text-center break-words max-w-full">
                {cat.name}
              </h3>
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest mt-2 relative z-10 group-hover:text-red-400 transition-colors">
                {cat.count} produk →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

/** Galeri foto dari produk toko (atau banner yang diunggah merchant). */
export const BoldLookbook: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('bold');
  const items = products.filter((p) => p.image).slice(0, 3);
  if (items.length === 0) return null;

  const heading = sectionOptions.heading || 'Galeri Produk';
  const description = sectionOptions.description;
  const cta = sectionOptions.buttonLabel || sectionOptions.buttonText ? resolveSectionCta(sectionOptions, '', STORE_ROUTES.catalog) : null;
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-1 sm:grid-cols-3',
  });
  // Satu kolom di ponsel memakai rasio landscape agar foto tidak setinggi layar.
  const imageAspectClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'aspect-[4/3]',
    tablet: 'aspect-[4/5]',
    desktop: 'aspect-[4/5]',
    fallback: 'aspect-[4/3] sm:aspect-[4/5]',
  });
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-950 text-white border-b border-zinc-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className={`text-3xl sm:text-5xl font-black uppercase tracking-tight text-white break-words ${description ? 'mb-4' : 'mb-10 sm:mb-12'}`}>
          {heading}
        </h2>
        {description && (
          <p className="text-sm font-medium text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10 sm:mb-12">{description}</p>
        )}
        <div className={`grid ${gridColsClass} gap-5 sm:gap-8`}>
          {items.map((product) => (
            <a
              key={product.id}
              href={productHref(product)}
              className="relative group overflow-hidden bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl hover:-translate-y-1.5 transition-transform duration-300 block"
            >
              <img
                src={product.image}
                alt={product.name}
                className={`w-full ${imageAspectClass} object-cover group-hover:scale-105 transition-transform duration-700`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute bottom-5 left-5 right-5 text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block mb-2">
                  {product.categoryName || 'Produk'}
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight text-white line-clamp-2">
                  {product.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
        {cta && (
          <a
            href={cta.href}
            className="inline-block mt-10 sm:mt-12 px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl transition-colors shadow-lg shadow-red-600/25"
          >
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
};

/** Ajakan menghubungi toko untuk info produk terbaru. */
export const BoldLimitedRelease: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || 'Jangan Sampai Kehabisan';
  const desc =
    sectionOptions.description ||
    'Stok produk kami terbatas. Hubungi kami untuk info produk terbaru atau pemesanan khusus.';
  const cta = resolveSectionCta(sectionOptions, 'Belanja Sekarang', STORE_ROUTES.catalog);
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-950 text-white text-center border-b border-zinc-900 relative overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto space-y-5 sm:space-y-6">
        <span className="px-4 py-1.5 bg-red-600/10 border border-red-500/30 text-red-500 font-extrabold text-xs uppercase tracking-widest rounded-full inline-block">
          {sectionOptions.badgeText || 'Stok Terbatas'}
        </span>
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white break-words">
          {heading}
        </h2>
        <p className="text-sm font-medium text-zinc-400 max-w-lg mx-auto leading-relaxed">
          {desc}
        </p>
        <div className="flex flex-col sm:flex-row justify-center max-w-md mx-auto gap-3 pt-2">
          <a
            href={cta.href}
            className="bg-red-600 text-white px-7 py-3.5 font-extrabold uppercase text-xs tracking-wider rounded-xl hover:bg-red-500 transition-colors shadow-lg shadow-red-600/25"
          >
            {cta.label}
          </a>
          <a
            href={STORE_ROUTES.contact}
            className="border border-zinc-700 hover:border-red-500 text-white px-7 py-3.5 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-colors"
          >
            Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
};

/** Etalase mini: foto produk toko yang langsung membuka detail produk. */
export const BoldCommunityBoard: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('bold');
  const items = products.filter((p) => p.image).slice(0, 4);
  if (items.length === 0) return null;

  const heading = sectionOptions.heading || 'Pilihan Pelanggan';
  const description = sectionOptions.description;
  const cta = sectionOptions.buttonLabel || sectionOptions.buttonText ? resolveSectionCta(sectionOptions, '', STORE_ROUTES.catalog) : null;
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-4',
    fallback: 'grid-cols-2 sm:grid-cols-4',
  });
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-zinc-950 text-white border-b border-zinc-900">
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight text-center text-white break-words ${description ? 'mb-4' : 'mb-8 sm:mb-10'}`}>
          {heading}
        </h2>
        {description && (
          <p className="text-sm font-medium text-zinc-400 text-center max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">{description}</p>
        )}
        <div className={`grid ${gridColsClass} gap-3 sm:gap-4`}>
          {items.map((product) => (
            <a
              key={product.id}
              href={productHref(product)}
              className="aspect-square bg-zinc-900 rounded-2xl border border-zinc-800/80 overflow-hidden relative group shadow-lg block"
            >
              <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={product.name} />
              <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-zinc-950/90 to-transparent">
                <span className="block font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-white truncate">
                  {product.name}
                </span>
              </div>
            </a>
          ))}
        </div>
        {cta && (
          <div className="text-center mt-8 sm:mt-10">
            <a
              href={cta.href}
              className="inline-block px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl transition-colors shadow-lg shadow-red-600/25"
            >
              {cta.label}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
