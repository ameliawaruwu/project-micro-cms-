import React from 'react';
import { MinimalistProductCard } from './ProductCard';
import { getDeviceClass, resolveResponsiveClasses } from '../../../utils/responsivePreview';
import { useSectionProducts } from '../../useSectionProducts';
import { sanitizeLinkHref } from '../../navMenu';
import { STORE_ROUTES } from '../../storefrontLinks';

export const MinimalistCollectionGrid: React.FC<{
  sectionOptions?: any;
  isMobile?: boolean;
  isTablet?: boolean;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}> = ({ sectionOptions = {}, isMobile, isTablet, deviceMode }) => {
  const inEditor = typeof isMobile === 'boolean' || typeof isTablet === 'boolean';
  const rc = (cls: string) => resolveResponsiveClasses(cls, inEditor ? deviceMode || 'desktop' : undefined);
  const products = useSectionProducts('minimalist', sectionOptions, { defaultCount: 6, inEditor });

  const title = sectionOptions.heading || 'Koleksi Pilihan';
  // Tautan "#"/"#all" (nilai lama template) atau tidak aman → halaman Katalog.
  const customHref = sanitizeLinkHref(sectionOptions.buttonLink);
  const buttonHref = customHref && customHref !== '#' && customHref !== '#all' ? customHref : STORE_ROUTES.catalog;
  const subtitle = sectionOptions.subheading || sectionOptions.description || '';
  const columns = [2, 3, 4].includes(sectionOptions.gridColumns) ? sectionOptions.gridColumns : 3;

  const desktopColsMap: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };
  const fallbackColsMap: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
    desktop: desktopColsMap[columns],
    fallback: fallbackColsMap[columns],
  });

  if (products.length === 0) return null;

  return (
    <section className={rc('w-full py-10 sm:py-16 md:py-24 px-4 sm:px-6 max-w-[1400px] mx-auto bg-white box-border overflow-hidden')}>
      <div className={rc('flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-3 sm:gap-4')}>
        <div className="min-w-0">
          <h2 className={rc('text-xl sm:text-2xl md:text-3xl font-light text-gray-900 tracking-tight break-words')}>{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 font-light mt-2 max-w-lg">{subtitle}</p>}
        </div>
        <a
          href={buttonHref}
          className="shrink-0 whitespace-nowrap text-xs font-medium tracking-wide uppercase text-gray-900 hover:text-gray-500 transition-colors group"
        >
          {sectionOptions.buttonLabel || 'Lihat Semua'}
          <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-[1px] bg-gray-900 mt-1"></span>
        </a>
      </div>

      <div className={`grid ${gridColsClass} gap-x-3 sm:gap-x-4 gap-y-8`}>
        {products.map((product) => (
          <MinimalistProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
