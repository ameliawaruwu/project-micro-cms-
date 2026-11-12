import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { sanitizeLinkHref } from '../../navMenu';
import { STORE_ROUTES, formatRupiah, productHref, resolveSectionCta, resolveSectionImage } from '../../storefrontLinks';

/** Sorotan produk unggulan toko; tidak dirender bila toko belum punya produk. */
export const FuturisticFloatingShowcase: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('futuristic');
  const product = products.find((p) => p.isFeatured) || products[0];
  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const halfWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-1/2';
  const prClass = isMobile || isTablet ? '' : 'md:pr-12';
  const mtClass = isMobile || isTablet ? 'mt-12' : 'mt-12 md:mt-0';
  if (!product) return null;

  // Teks, gambar & tombol dari editor; bila kosong memakai data produk yang disorot.
  const heading = sectionOptions.heading || product.name;
  const description = sectionOptions.description || product.description;
  const image = resolveSectionImage(sectionOptions) || product.image;
  const cta = resolveSectionCta(sectionOptions, 'Lihat Detail', productHref(product));

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#050505] text-white overflow-hidden relative border-t border-gray-900">
      <div className={`max-w-6xl mx-auto flex ${flexDirClass} items-center`}>
        <div className={`${halfWidthClass} relative z-20 min-w-0 ${prClass}`}>
          <div className="inline-block px-3 py-1 bg-purple-900/40 border border-purple-500/50 text-purple-400 text-xs font-mono mb-6 uppercase tracking-widest backdrop-blur-sm">
            {sectionOptions.badgeText || 'Produk Unggulan'}
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-4 sm:mb-6 text-white drop-shadow-lg break-words">
            {heading}
          </h2>
          <p className="text-xl sm:text-2xl font-mono font-bold text-purple-300 mb-4 sm:mb-6">{formatRupiah(product.price)}</p>
          {description && (
            <p className="text-gray-400 mb-8 sm:mb-10 font-mono leading-relaxed text-sm lg:text-base line-clamp-4">{description}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <a
              href={cta.href}
              className="inline-block px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white text-sm sm:text-base font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              {cta.label}
            </a>
            <a
              href={STORE_ROUTES.catalog}
              className="inline-block px-6 sm:px-8 py-3.5 sm:py-4 border border-gray-700 text-gray-300 hover:text-white hover:border-white text-sm sm:text-base font-bold uppercase tracking-widest transition-all duration-300"
            >
              Lihat Katalog
            </a>
          </div>
        </div>
        {image && (
          <a href={productHref(product)} className={`${halfWidthClass} relative block ${mtClass}`}>
            <div className="absolute w-64 h-64 sm:w-[400px] sm:h-[400px] bg-purple-600/20 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <img
              src={image}
              alt={heading}
              className="w-full h-72 sm:h-[500px] object-contain relative z-20 mix-blend-screen drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-[float_6s_ease-in-out_infinite]"
            />
          </a>
        )}
      </div>
    </section>
  );
};

/** Keunggulan belanja di toko (teks umum, dapat diganti lewat judul/deskripsi section). */
export const FuturisticTechFeatures: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-1 md:grid-cols-3',
  });
  const features = [
    { title: 'Produk Berkualitas', desc: 'Setiap produk dipilih dan diperiksa sebelum dikirim.' },
    { title: 'Pengiriman Cepat', desc: 'Pesanan diproses segera dan dikirim ke seluruh Indonesia.' },
    { title: 'Pembayaran Aman', desc: 'Transaksi terlindungi dengan metode pembayaran tepercaya.' },
  ];
  const description = sectionOptions.description || sectionOptions.subheading;
  const image = resolveSectionImage(sectionOptions);
  // Tombol hanya tampil bila merchant mengisi teks tombol di editor.
  const hasCta = Boolean(sectionOptions.buttonLabel || sectionOptions.buttonText);
  const cta = resolveSectionCta(sectionOptions, 'Belanja Sekarang', STORE_ROUTES.catalog);
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-[#080808] text-white border-y border-gray-900 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-[#080808] to-[#080808]"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        {sectionOptions.heading && (
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest mb-10 sm:mb-14 text-center break-words">{sectionOptions.heading}</h2>
        )}
        {description && (
          <p className="max-w-2xl mx-auto -mt-6 sm:-mt-8 mb-10 sm:mb-14 text-center text-gray-400 font-mono text-sm leading-relaxed">{description}</p>
        )}
        {image && (
          <img src={image} alt={sectionOptions.heading || ''} className="w-full max-h-[420px] object-cover mb-10 sm:mb-14 border border-gray-900" />
        )}
        <div className={`grid ${gridColsClass} gap-10 sm:gap-16`}>
          {features.map((feature) => (
            <div key={feature.title} className="border-l-2 border-purple-600 pl-6 sm:pl-8 py-2 relative group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#080808] border-2 border-purple-600 group-hover:bg-purple-600 transition-colors shadow-[0_0_10px_#A855F7]"></div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-500 font-mono text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
        {hasCta && (
          <div className="mt-12 text-center">
            <a
              href={cta.href}
              className="inline-block px-8 py-4 border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-all duration-300"
            >
              {cta.label}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

/** Perbandingan produk toko (kategori & harga); butuh minimal dua produk. */
export const FuturisticProductComparison: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const products = useThemeProductsSource('futuristic').slice(0, 3);
  if (products.length < 2) return null;

  const colsClass = products.length === 3 ? 'grid-cols-4' : 'grid-cols-3';
  const rows: { label: string; value: (p: (typeof products)[number]) => string }[] = [
    { label: 'Kategori', value: (p) => p.categoryName || '-' },
    { label: 'Harga', value: (p) => formatRupiah(p.price) },
  ];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-[#050505] text-white text-center">
      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest mb-4 break-words">
        {sectionOptions.heading || 'Bandingkan Produk'}
      </h2>
      <p className="text-purple-500 font-mono mb-10 sm:mb-16 tracking-widest text-xs sm:text-sm">
        {sectionOptions.subheading || 'Pilih produk yang paling sesuai untuk Anda'}
      </p>
      <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 sm:p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-x-auto">
        <div className={`grid ${colsClass} gap-2 sm:gap-4 font-mono text-[11px] sm:text-sm uppercase text-purple-400 mb-4 sm:mb-6 border-b border-gray-800 pb-4 tracking-wider min-w-[320px]`}>
          <div className="text-left">Produk</div>
          {products.map((p) => (
            <a key={p.id} href={productHref(p)} className="min-w-0 line-clamp-2 break-words hover:text-white transition-colors">
              {p.name}
            </a>
          ))}
        </div>
        {rows.map((row) => (
          <div key={row.label} className={`grid ${colsClass} gap-2 sm:gap-4 font-mono text-xs sm:text-sm text-gray-400 py-4 sm:py-6 border-b border-gray-800/50 last:border-0 hover:bg-white/[0.02] transition-colors min-w-[320px]`}>
            <div className="text-left text-gray-300">{row.label}</div>
            {products.map((p) => (
              <div key={p.id} className="min-w-0 break-words">{row.value(p)}</div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

/** Ajakan belanja; tombol membuka katalog (atau tautan yang diisi merchant). */
export const FuturisticInnovationCta: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore((state) => state.storeInfo);
  const heading = sectionOptions.heading || 'Siap Upgrade Gaya Anda?';
  const desc = sectionOptions.description || `Jelajahi koleksi lengkap ${storeInfo?.name || 'kami'} sekarang.`;
  const buttonLabel = sectionOptions.buttonLabel || 'Belanja Sekarang';
  const customHref = sanitizeLinkHref(sectionOptions.buttonLink);
  const buttonHref = customHref && customHref !== '#' ? customHref : STORE_ROUTES.catalog;
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80';

  return (
    <section className="py-20 sm:py-32 md:py-40 px-4 sm:px-6 md:px-12 bg-purple-600 text-white text-center relative overflow-hidden group">
      <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-80"></div>
      <div className="relative z-10 max-w-3xl mx-auto min-w-0">
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 sm:mb-8 drop-shadow-2xl break-words">{heading}</h2>
        <p className="font-mono mb-10 sm:mb-12 text-gray-300 tracking-wider sm:tracking-widest text-sm sm:text-base">{desc}</p>
        <a
          href={buttonHref}
          className="inline-block px-8 sm:px-10 py-4 sm:py-5 bg-white text-purple-900 text-sm sm:text-base font-bold uppercase tracking-widest hover:bg-gray-200 transition shadow-[0_0_30px_rgba(255,255,255,0.3)]"
        >
          {buttonLabel}
        </a>
      </div>
    </section>
  );
};
