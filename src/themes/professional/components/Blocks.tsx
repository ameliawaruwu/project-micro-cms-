import React from 'react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useSectionProducts } from '../../useSectionProducts';
import { AddToCartButton } from '../../storefrontCart';
import { STORE_ROUTES, formatRupiah, productHref } from '../../storefrontLinks';

export const ProfessionalStoreBenefits: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const heading = sectionOptions.heading || "Mengapa Belanja di Toko Kami?";
  
  const benefits = sectionOptions.features || [
    { title: "Produk Terjamin", desc: "Setiap produk dicek sebelum dikirim ke pelanggan." },
    { title: "Pengiriman Aman", desc: "Dikemas rapi dan dikirim ke seluruh Indonesia." },
    { title: "Pembayaran Mudah", desc: "Bayar lewat transfer, QRIS, atau COD." },
    { title: "Pesanan Terpantau", desc: "Status pesanan bisa dicek kapan saja." }
  ];

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-4',
    fallback: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  });

  return (
    <section className="py-14 sm:py-20 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{heading}</h2>
        </div>
        
        <div className={`grid ${gridColsClass} gap-5 sm:gap-8`}>
          {benefits.map((benefit: any, i: number) => (
            <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 break-words">{benefit.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ProfessionalProductGrid: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  // Produk mengikuti pengaturan panel editor (kategori, produk pilihan, urutan, jumlah).
  const products = useSectionProducts('professional', sectionOptions, { defaultCount: 8 });
  const heading = sectionOptions.heading || sectionOptions.featuredTitle || "Katalog Produk";
  const subheading = sectionOptions.subheading || sectionOptions.featuredSubtitle || "Pilihan produk terbaik dari toko kami.";

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  });

  if (products.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16">
        <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 break-words storefront-heading-section">{heading}</h2>
            {subheading && <p className="text-sm text-gray-600">{subheading}</p>}
          </div>
          <a
            href={STORE_ROUTES.catalog}
            className="inline-block w-fit shrink-0 px-5 py-2.5 text-sm font-semibold text-[#1E40AF] border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
          >
            Lihat Semua Produk →
          </a>
        </div>

        <div className={`grid ${gridColsClass} gap-4 sm:gap-6`}>
          {products.map(product => (
            <div key={product.id} className="min-w-0 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col justify-between">
              <a href={productHref(product)} className="block">
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  {(product.stock ?? 1) > 0 && <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded">Stok tersedia</div>}
                </div>
                <div className="p-3 sm:p-5">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1.5 line-clamp-2 break-words storefront-card-title">{product.name}</h3>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-[#1E40AF] mb-3 sm:mb-4 storefront-card-price">{formatRupiah(product.price)}</p>
                </div>
              </a>
              <div className="px-3 pb-3 sm:px-5 sm:pb-5">
                <AddToCartButton product={product} className="w-full min-w-0 whitespace-nowrap py-2 bg-gray-50 border border-gray-300 rounded-md text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                  + Keranjang
                </AddToCartButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
}

/** Testimoni yang benar-benar diisi merchant (sectionOptions.testimonials); item kosong diabaikan. */
function getMerchantTestimonials(value: unknown): TestimonialItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item: any) => ({
      quote: String(item?.quote ?? item?.text ?? item?.desc ?? '').trim(),
      name: String(item?.name ?? item?.title ?? '').trim(),
      role: String(item?.role ?? item?.subtitle ?? '').trim(),
    }))
    .filter((item) => item.quote);
}

/**
 * Testimoni pelanggan. Hanya menampilkan testimoni yang diisi merchant; bila belum ada,
 * section berubah menjadi ajakan belanja / menghubungi toko (tanpa ulasan palsu).
 */
export const ProfessionalTestimonials: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const testimonials = getMerchantTestimonials(sectionOptions.testimonials);
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-1 md:grid-cols-3',
  });

  if (testimonials.length === 0) {
    const heading = sectionOptions.heading || 'Kepuasan Pelanggan Prioritas Kami';
    const desc =
      sectionOptions.description ||
      'Ada pertanyaan tentang produk atau butuh penawaran khusus? Tim kami siap membantu Anda.';
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-16 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 break-words">{heading}</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed">{desc}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href={STORE_ROUTES.catalog}
              className="inline-block px-8 py-3.5 bg-[#1E40AF] text-white font-semibold rounded-md hover:bg-[#1e3a8a] transition-colors shadow-md text-center"
            >
              Belanja Sekarang
            </a>
            <a
              href={STORE_ROUTES.contact}
              className="inline-block px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors text-center"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>
    );
  }

  const heading = sectionOptions.heading || 'Apa Kata Pelanggan Kami';
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-10 sm:mb-16 break-words">{heading}</h2>

        <div className={`grid ${gridColsClass} gap-5 sm:gap-8`}>
          {testimonials.map((item, i) => (
            <div key={i} className="p-6 sm:p-8 bg-gray-50 rounded-2xl border border-gray-100 text-left min-w-0">
              <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed break-words">&ldquo;{item.quote}&rdquo;</p>
              {(item.name || item.role) && (
                <div className="min-w-0">
                  {item.name && <h4 className="font-bold text-gray-900 break-words">{item.name}</h4>}
                  {item.role && <p className="text-sm text-gray-500 break-words">{item.role}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
