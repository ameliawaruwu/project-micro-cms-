import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { AddToCartButton, addProductToCart, useStorefrontSlug } from '../../storefrontCart';

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
        
        <div className={`grid ${gridColsClass} gap-8`}>
          {benefits.map((benefit: any, i: number) => (
            <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ProfessionalProductGrid: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const products = useThemeProductsSource('professional');
  const heading = sectionOptions.heading || sectionOptions.featuredTitle || "Katalog Produk";
  const subheading = sectionOptions.subheading || sectionOptions.featuredSubtitle || "Pilihan produk terbaik dari toko kami.";

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  });

  return (
    <section className="py-14 sm:py-20 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 storefront-heading-section">{heading}</h2>
          {subheading && <p className="text-sm text-gray-600">{subheading}</p>}
        </div>

        <div className={`grid ${gridColsClass} gap-4 sm:gap-6`}>
          {products.map(product => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col justify-between">
              <div>
                <div className="aspect-[4/3] min-h-[160px] sm:min-h-[190px] bg-gray-100 overflow-hidden relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {(product.stock ?? 1) > 0 && <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded">Stok tersedia</div>}
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-1.5 truncate storefront-card-title">{product.name}</h3>
                  <p className="text-sm sm:text-base md:text-lg font-bold text-[#1E40AF] mb-3 sm:mb-4 storefront-card-price">Rp {product.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <AddToCartButton product={product} className="w-full py-2 bg-gray-50 border border-gray-300 rounded-md text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
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

export const ProfessionalTestimonials: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const heading = sectionOptions.heading || "Trusted by Industry Leaders";
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-1 md:grid-cols-3',
  });
  
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">{heading}</h2>
        
        <div className={`grid ${gridColsClass} gap-8`}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-left">
              <div className="flex gap-1 text-yellow-400 mb-6">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ))}
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                "The platform has fundamentally transformed how we handle our procurement. The enterprise features and dedicated support are unmatched in the industry."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-gray-900">Jane Doe</h4>
                  <p className="text-sm text-gray-500">Director of Operations, TechCorp</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
