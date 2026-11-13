import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getHeaderDisplay, getHeaderSubtitle } from '../../navMenu';
import { NavSearchButton } from '../../NavSearchButton';
import { NavTrackOrderButton } from '../../NavTrackOrderButton';
import { StoreLogo } from '../../StoreLogo';
import { CartCountBadge } from '../../storefrontCart';
import { FooterLegalLinks } from '../../FooterLegalLinks';
import { FooterBrand } from '../../FooterBrand';
import { FooterSocialLinks } from '../../FooterSocialLinks';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { STORE_ROUTES } from '../../storefrontLinks';

export const FashionNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const header = getHeaderDisplay(sectionOptions);
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = getHeaderSubtitle(sectionOptions, storeInfo?.description);

  return (
    <nav className={`w-full bg-[#18181B] text-white border-b border-white/10 ${header.positionClass}`}>
      <div className="w-full px-4 sm:px-6 md:px-12 py-4 sm:py-5 flex items-center gap-3">
        <div className="w-20 shrink-0 flex justify-start gap-1">
          {header.showSearch && (
            <NavSearchButton className="text-white hover:text-gray-400 transition-colors p-1" iconClassName="w-5 h-5" />
          )}
          <NavTrackOrderButton className="text-white hover:text-gray-400 transition-colors p-1" iconClassName="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 flex justify-center">
          {showLogo && (
            <div className="flex flex-col items-center min-w-0 max-w-full">
              <a href="/" className="text-2xl sm:text-3xl md:text-4xl font-serif italic tracking-wider hover:opacity-80 transition-opacity text-center max-w-full truncate">
                <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-10 sm:h-12">{storeTitle}</StoreLogo>
              </a>
              {storeSubtitle && (
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-gray-400 mt-1 font-sans text-center line-clamp-1 max-w-full">
                  {storeSubtitle}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="w-20 shrink-0 flex justify-end">
          {header.showCart && (
            <button type="button" data-href="/keranjang" aria-label="Buka keranjang belanja" className="text-white hover:text-gray-400 transition-colors relative cursor-pointer p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <CartCountBadge className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center" />
            </button>
          )}
        </div>
      </div>
      {showNav && (
        <div className="w-full border-t border-white/10 px-4 sm:px-6 py-3 flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-2">
          {getNavMenuItems(sectionOptions).map((nav) => (
            <a
              key={nav.id}
              href={nav.route}
              className="text-[10px] uppercase tracking-[0.25em] text-gray-300 hover:text-white transition-colors"
            >
              {nav.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export const FashionHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, products } = useCmsStore();
  const heading = sectionOptions.heading || storeInfo?.name || 'Gaya Terbaik untuk Anda';
  const subheading =
    sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || sectionOptions.content ||
    storeInfo?.description || 'Temukan koleksi pilihan kami dan tampil percaya diri setiap hari.';
  // Gambar latar: unggahan merchant → banner toko → foto produk pertama → gambar bawaan dekoratif.
  const bgImage =
    sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80';
  const hero = getHeroContent(sectionOptions, {
    badge: 'Koleksi Pilihan',
    buttonLabel: 'Lihat Koleksi',
    buttonLink: STORE_ROUTES.catalog,
  });

  return (
    <section className="relative w-full min-h-[75vh] sm:min-h-[90vh] bg-[#18181B] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt={heading}
          className="w-full h-full object-cover object-top opacity-70 grayscale-[20%] mix-blend-luminosity scale-105 hover:scale-100 transition-transform duration-[15s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent"></div>
      </div>

      <div className="z-10 text-center relative mt-20 sm:mt-32 px-4 sm:px-6 py-12 max-w-5xl min-w-0">
        {hero.badge && (
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] text-gray-300 mb-6">{hero.badge}</p>
        )}
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif italic text-white drop-shadow-2xl mb-6 break-words">
          {heading}
        </h1>
        {subheading && (
          <p className="text-sm md:text-base text-gray-300 max-w-lg mx-auto mb-10 tracking-wider font-light leading-relaxed">
            {subheading}
          </p>
        )}
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
          <HeroActionLink
            action={hero.primary}
            className="inline-block px-6 sm:px-10 py-4 border border-white text-white text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:bg-white hover:text-black transition-colors duration-500"
          />
          {hero.secondary && (
            <HeroActionLink
              action={hero.secondary}
              className="inline-block px-6 sm:px-10 py-4 bg-white text-black text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:bg-transparent hover:text-white border border-white transition-colors duration-500"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export const FashionFooter: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { storeInfo } = useCmsStore();
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo?.email;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo?.address;
  const navItems = getNavMenuItems(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeTitle}`;
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-4',
    fallback: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
  });
  const brandSpanClass = getDeviceClass(isMobile, isTablet, {
    mobile: '',
    tablet: 'col-span-2',
    desktop: 'col-span-2',
    fallback: 'sm:col-span-2',
  });

  return (
    <footer className="w-full bg-[#18181B] text-white pt-16 sm:pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <div className={`grid ${gridColsClass} gap-10 mb-12`}>
          <div className={brandSpanClass}>
            <FooterBrand sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-12 mb-4">
              <h2 className="text-3xl font-serif italic mb-4 break-words">{storeTitle}</h2>
            </FooterBrand>
            {storeDesc && <p className="text-sm text-gray-400 leading-loose max-w-md">{storeDesc}</p>}
            <FooterSocialLinks sectionOptions={sectionOptions} className="mt-6" itemClassName="rounded-none border border-white/30 hover:border-white" />
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">Menu</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {navItems.map((nav) => (
                <li key={nav.id}><a href={nav.route} className="hover:text-white transition-colors">{nav.label}</a></li>
              ))}
            </ul>
          </div>

          {(email || address) && (
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-5">Kontak</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                {address && <li className="break-words">{address}</li>}
                {email && <li><a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a></li>}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/10 text-xs text-gray-500 uppercase tracking-widest text-center">
          {copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} />
        </div>
      </div>
    </footer>
  );
};
