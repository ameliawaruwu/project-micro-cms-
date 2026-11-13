import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getHeaderDisplay, getHeaderSubtitle } from '../../navMenu';
import { NavSearchButton } from '../../NavSearchButton';
import { StoreLogo } from '../../StoreLogo';
import { CartCountBadge } from '../../storefrontCart';
import { ShoppingBag as CartBagIcon } from 'lucide-react';
import { FooterLegalLinks } from '../../FooterLegalLinks';
import { FooterBrand } from '../../FooterBrand';
import { FooterSocialLinks } from '../../FooterSocialLinks';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { NavTrackOrderButton } from '../../NavTrackOrderButton';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES } from '../../storefrontLinks';

export const ProfessionalNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { storeInfo } = useCmsStore();
  const header = getHeaderDisplay(sectionOptions);
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = getHeaderSubtitle(sectionOptions, storeInfo?.description);
  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden md:flex',
  });

  return (
    <nav className={`w-full bg-[#1E40AF] text-white shadow-md ${header.positionClass}`}>
      {/* Bilah atas: kontak toko (bila diisi) dan tautan cepat yang sama dengan menu navbar. */}
      <div className="w-full bg-[#1e3a8a] py-2 px-6 md:px-16 hidden md:flex justify-between gap-6 text-xs font-medium text-blue-200">
        <div className="flex gap-6 min-w-0">
          {storeInfo?.phone && <span className="truncate">{storeInfo.phone}</span>}
          {storeInfo?.email && <span className="truncate">{storeInfo.email}</span>}
        </div>
        <div className="flex gap-6 shrink-0">
          <a href={STORE_ROUTES.promo} className="hover:text-white transition-colors">Promo</a>
          <a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Bantuan</a>
        </div>
      </div>
      <div className="w-full px-4 sm:px-6 md:px-16 py-4 md:py-5 flex justify-between items-center gap-4">
        <div className="flex items-center gap-12 min-w-0">
          {showLogo && (
            <div className="flex flex-col min-w-0">
              <a href="/" className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-3 min-w-0">
                <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11">
                  <>
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shrink-0">
                      <span className="text-[#1E40AF] font-bold text-xl leading-none">
                        {(storeTitle || 'P')[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="truncate">{storeTitle}</span>
                  </>
                </StoreLogo>
              </a>
              {storeSubtitle && (
                <span className="text-xs text-blue-200 font-medium pl-11 -mt-1 line-clamp-1">
                  {storeSubtitle}
                </span>
              )}
            </div>
          )}
          {showNav && (
            <div className={`${showDesktopNav} gap-8`}>
              {getNavMenuItems(sectionOptions).map(nav => (
                <a key={nav.id} href={nav.route} className="text-sm font-semibold text-blue-50 hover:text-white transition-colors">
                  {nav.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a href={STORE_ROUTES.contact} className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold text-white border border-blue-400 rounded-md hover:bg-blue-800 transition-colors">
            Hubungi Kami
          </a>
          {header.showSearch && (
            <NavSearchButton className="p-2 text-blue-50 hover:text-white transition-colors" iconClassName="w-5 h-5" />
          )}
          <NavTrackOrderButton className="p-2 text-blue-50 hover:text-white transition-colors" iconClassName="w-5 h-5" />
          {header.showCart && (
            <button type="button" data-href="/keranjang" aria-label="Buka keranjang belanja" className="relative flex items-center justify-center p-2.5 bg-white text-[#1E40AF] rounded-md hover:bg-gray-100 transition-colors shadow-sm cursor-pointer">
              <CartBagIcon className="w-4 h-4" />
              <CartCountBadge className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none flex items-center justify-center bg-[#1E40AF] text-white ring-2 ring-white" />
            </button>
          )}
        </div>
      </div>
      {showNav && (
        <div className="md:hidden flex gap-6 overflow-x-auto [scrollbar-width:none] px-4 sm:px-6 pb-3 -mt-1 text-sm font-semibold text-blue-50 whitespace-nowrap">
          {getNavMenuItems(sectionOptions).map(nav => (
            <a key={nav.id} href={nav.route} className="hover:text-white transition-colors">{nav.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
};

export const ProfessionalHero: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const products = useThemeProductsSource('professional');
  const heading = sectionOptions.heading || storeInfo?.name || 'Solusi Kebutuhan Usaha Anda';
  const subheading = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || storeInfo?.description || 'Produk berkualitas dengan layanan profesional. Hubungi kami untuk penawaran terbaik sesuai kebutuhan Anda.';
  const hero = getHeroContent(sectionOptions, {
    buttonLabel: 'Minta Penawaran',
    buttonLink: STORE_ROUTES.contact,
    secondaryButtonLabel: 'Lihat Katalog',
    secondaryButtonLink: STORE_ROUTES.catalog,
  });
  // Gambar hero: unggahan merchant → banner toko → foto produk pertama → gambar dekoratif bawaan.
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl || products.find((p) => p.image)?.image || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80";
  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const halfWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-1/2';
  const ptClass = isMobile || isTablet ? 'pt-10' : 'pt-10 md:pt-0';

  return (
    <section className="relative w-full min-h-[75vh] flex items-center pb-12 md:pb-0 bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-16 flex ${flexDirClass} items-center gap-10 md:gap-12`}>
        <div className={`${halfWidthClass} ${ptClass} min-w-0 z-10`}>
          {hero.badge && (
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
              {hero.badge}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-5 sm:mb-6 tracking-tight break-words">
            {heading}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 leading-relaxed max-w-lg">
            {subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <HeroActionLink
              action={hero.primary}
              className="inline-block px-8 py-3.5 bg-[#1E40AF] text-white font-semibold rounded-md hover:bg-[#1e3a8a] transition-colors shadow-md text-center"
            />
            {hero.secondary && (
              <HeroActionLink
                action={hero.secondary}
                className="inline-block px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors text-center"
              />
            )}
          </div>
        </div>
        <div className={`${halfWidthClass} relative`}>
          <div className="absolute inset-0 bg-blue-600 rounded-2xl transform translate-x-4 translate-y-4 opacity-10"></div>
          <img
            src={bgImage}
            alt={heading}
            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl relative z-10"
          />
        </div>
      </div>
    </section>
  );
};

export const ProfessionalFooter: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { storeInfo } = useCmsStore();
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo?.email;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo?.address;
  const navItems = getNavMenuItems(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeTitle}. Hak cipta dilindungi.`;
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
    <footer className="w-full bg-gray-900 text-gray-300 pt-14 sm:pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-16">
        <div className={`grid ${gridColsClass} gap-10 mb-12`}>
          <div className={brandSpanClass}>
            <FooterBrand sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-11 mb-4">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 min-w-0">
                <span className="w-8 h-8 shrink-0 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl leading-none">
                  {(storeTitle || 'P')[0]?.toUpperCase()}
                </span>
                <span className="break-words min-w-0">{storeTitle}</span>
              </h2>
            </FooterBrand>
            {storeDesc && <p className="text-sm text-gray-400 leading-relaxed max-w-md">{storeDesc}</p>}
            <FooterSocialLinks sectionOptions={sectionOptions} className="mt-5" itemClassName="rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500" />
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 uppercase tracking-wider text-sm">Menu</h3>
            <ul className="space-y-3 text-sm">
              {navItems.map((nav) => (
                <li key={nav.id}><a href={nav.route} className="hover:text-white transition-colors">{nav.label}</a></li>
              ))}
            </ul>
          </div>

          {(email || address) && (
            <div>
              <h3 className="text-white font-semibold mb-5 uppercase tracking-wider text-sm">Kontak</h3>
              <ul className="space-y-3 text-sm">
                {address && <li className="break-words">{address}</li>}
                {email && <li><a href={`mailto:${email}`} className="hover:underline break-all">{email}</a></li>}
              </ul>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-800 text-sm text-gray-500 text-center">{copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} /></div>
      </div>
    </footer>
  );
};
