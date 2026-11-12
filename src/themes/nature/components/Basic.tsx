import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getHeaderDisplay, getHeaderSubtitle, getFooterSocialLinks } from '../../navMenu';
import { StoreLogo } from '../../StoreLogo';
import { CartCount } from '../../storefrontCart';
import { FooterLegalLinks } from '../../FooterLegalLinks';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { NavTrackOrderButton } from '../../NavTrackOrderButton';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES } from '../../storefrontLinks';

export const NatureNavbar: React.FC<{
  sectionOptions?: any;
  isMobile?: boolean;
  isTablet?: boolean;
  readonly?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}> = ({
  sectionOptions = {},
  isMobile = false,
  isTablet = false,
  readonly = false,
  searchQuery: controlledSearchQuery,
  onSearchChange
}) => {
  const [localSearch, setLocalSearch] = React.useState('');
  const query = controlledSearchQuery !== undefined ? controlledSearchQuery : localSearch;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalSearch(val);
    }
  };

  const { storeInfo } = useCmsStore();
  const header = getHeaderDisplay(sectionOptions);
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  const rawName = sectionOptions.heading || sectionOptions.storeName || storeInfo?.name;
  const storeName = (!rawName || rawName === 'NEON//CORE Electronics') ? 'Toko Kami' : rawName;
  const rawSub = getHeaderSubtitle(sectionOptions, storeInfo?.description);
  const storeSubtitle = (!rawSub || rawSub.includes("Komponen Komputer") || rawSub.includes("PC Gaming") || rawSub.includes("GPU RTX"))
    ? undefined
    : rawSub;

  const navList = getNavMenuItems(sectionOptions);

  const navFlexClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const flex1Class = isMobile || isTablet ? 'w-full' : 'w-full md:flex-1';
  const navJustifyStartClass = isMobile || isTablet ? 'justify-center' : 'justify-center md:justify-start';
  const navJustifyEndClass = isMobile || isTablet ? 'justify-center' : 'justify-center md:justify-end';
  const navGapClass = isMobile || isTablet ? 'gap-4' : 'gap-4 md:gap-0';

  return (
    <nav className={`w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-4 pb-3 bg-[#F9F6F0] border-b border-[#E8E4DB] ${header.positionClass} font-serif`}>
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        <div className="min-w-0 flex-1">
          {showLogo && (
            <div className="flex flex-col min-w-0">
              <a href="/" className="text-xl sm:text-2xl lg:text-3xl font-serif text-[#2C3B2D] tracking-wide hover:opacity-80 transition-opacity font-bold truncate">
                <StoreLogo sectionOptions={sectionOptions} name={storeName} imgClassName="h-9 sm:h-11">{storeName}</StoreLogo>
              </a>
              {storeSubtitle && (
                <span className="text-[11px] sm:text-xs font-sans text-[#5C6B5D] tracking-wider mt-0.5 truncate">
                  {storeSubtitle}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {header.showSearch && (
          <div className="relative hidden sm:block w-44 lg:w-60">
            <svg className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C6B5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Cari produk segar..."
              className="w-full pl-9 pr-7 py-1.5 bg-white border border-[#E8E4DB] rounded-full text-xs font-sans text-[#2C3B2D] placeholder-[#5C6B5D]/60 focus:outline-none focus:ring-1.5 focus:ring-[#2C3B2D] focus:border-transparent transition-all shadow-2xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => onSearchChange ? onSearchChange('') : setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#5C6B5D] hover:text-[#2C3B2D] bg-[#E8E4DB]/50 hover:bg-[#E8E4DB] rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          )}

          <NavTrackOrderButton className="p-1 text-[#2C3B2D] hover:text-[#1B3B2B] transition-colors" iconClassName="w-5 h-5" />
          {header.showCart && (
            <button type="button" data-href="/keranjang" aria-label="Buka keranjang belanja" className="relative text-xs sm:text-[13px] tracking-wide text-[#2C3B2D] hover:text-[#1B3B2B] transition-colors flex items-center gap-2 cursor-pointer font-sans whitespace-nowrap p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#2D5A27] text-white text-[10px] font-bold leading-none flex items-center justify-center"><CartCount /></span>
            </button>
          )}
        </div>
      </div>

      {showNav && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-2">
          {navList.map(nav => (
            <a key={nav.id} href={nav.route} className="text-xs sm:text-[13px] tracking-wide font-medium text-[#5C6B5D] hover:text-[#2C3B2D] transition-colors relative group font-sans whitespace-nowrap">
              {nav.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#2C3B2D] group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export const NatureHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const products = useThemeProductsSource('nature');
  const rawStoreName = sectionOptions.storeName || storeInfo?.name;
  const storeName = (!rawStoreName || rawStoreName === 'NEON//CORE Electronics') ? '' : rawStoreName;
  const heading = sectionOptions.heading || storeName || 'Selamat Datang di Toko Kami';
  const rawSub = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || storeInfo?.description;
  const subheading = (!rawSub || rawSub.includes("Komponen Komputer") || rawSub.includes("PC Gaming") || rawSub.includes("GPU RTX"))
    ? 'Temukan produk pilihan kami dengan kualitas terbaik dan harga bersahabat.'
    : rawSub;
  const hero = getHeroContent(sectionOptions, {
    buttonLabel: 'Belanja Sekarang',
    buttonLink: STORE_ROUTES.catalog,
    secondaryButtonLink: STORE_ROUTES.promo,
  });
  // Gambar hero: unggahan merchant → banner toko → foto produk pertama → gambar dekoratif bawaan.
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl || products.find((p) => p.image)?.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=80";

  return (
    <section className="relative w-full min-h-[70vh] sm:min-h-[80vh] flex items-center justify-center bg-[#F9F6F0] p-4 md:p-8">
      <div className="absolute inset-0 w-full h-full p-4 md:p-8">
        <div className="w-full h-full relative overflow-hidden rounded-[40px] shadow-sm">
          <img
            src={bgImage}
            alt={heading}
            className="w-full h-full object-cover rounded-[40px] scale-105 hover:scale-100 transition-transform duration-[20s] ease-out"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      </div>

      <div className="z-10 min-w-0 text-center text-white bg-black/20 p-6 sm:p-12 md:p-16 max-w-3xl mx-2 sm:mx-4 rounded-[32px] backdrop-blur-md border border-white/10 shadow-2xl transform hover:-translate-y-1 transition-transform duration-500">
        {hero.badge && (
          <span className="inline-block px-4 py-1.5 mb-5 rounded-full bg-[#F9F6F0]/90 text-[#2C3B2D] text-[11px] font-semibold uppercase tracking-[0.2em] font-sans">
            {hero.badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold mb-3 sm:mb-4 leading-tight drop-shadow-md tracking-tight break-words">
          {heading}
        </h1>
        {subheading && (
          <p className="text-sm sm:text-base md:text-lg text-[#F9F6F0]/90 font-light italic max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed drop-shadow-sm font-serif">
            {subheading}
          </p>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          <HeroActionLink
            action={hero.primary}
            className="inline-block px-8 sm:px-10 py-3 sm:py-3.5 bg-[#F9F6F0] text-[#2C3B2D] rounded-full text-xs sm:text-sm font-medium hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer font-sans"
          />
          {hero.secondary && (
            <HeroActionLink
              action={hero.secondary}
              className="inline-block px-8 sm:px-10 py-3 sm:py-3.5 border border-[#F9F6F0] text-[#F9F6F0] rounded-full text-xs sm:text-sm font-medium hover:bg-[#F9F6F0]/10 transition-all duration-300 cursor-pointer font-sans"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export const NatureFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const footerEmail = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo?.email;
  const footerAddress = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo?.address;
  const rawStoreName = sectionOptions.storeName || sectionOptions.heading || sectionOptions.title || storeInfo?.name;
  const storeName = (!rawStoreName || rawStoreName === 'NEON//CORE Electronics') ? 'Toko Kami' : rawStoreName;

  const rawDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;
  const description = (!rawDesc || rawDesc.includes("Komponen Komputer") || rawDesc.includes("PC Gaming") || rawDesc.includes("GPU RTX Series"))
    ? ''
    : rawDesc;

  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeName.toUpperCase()}. HAK CIPTA DILINDUNGI.`;

  const footerLinks = getNavMenuItems(sectionOptions);
  const socials = getFooterSocialLinks(sectionOptions);

  return (
    <footer className="w-full px-4 sm:px-8 md:px-16 py-16 sm:py-24 bg-[#2C3B2D] text-[#E8E4DB] rounded-t-[40px] mt-12 flex flex-col items-center shadow-inner font-serif">
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center">
        <svg className="w-12 h-12 mb-8 text-[#E8E4DB]/50" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 break-words max-w-full">{storeName}</h2>
        {description && (
          <p className="text-sm md:text-base leading-relaxed tracking-wide mb-12 max-w-xl mx-auto opacity-80 font-light font-sans">
            {description}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-14 text-sm font-sans tracking-wider opacity-85">
          {footerLinks.map(link => (
            <a key={link.id} href={link.route} className="hover:text-white hover:opacity-100 transition-opacity">
              {link.label}
            </a>
          ))}
        </div>

        {socials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-xs font-sans uppercase tracking-widest opacity-80">
            {socials.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:opacity-100 transition-opacity">
                {s.label}
              </a>
            ))}
          </div>
        )}

        <div className="w-full h-px bg-[#E8E4DB]/20 mb-8"></div>
        {footerAddress && <p className="text-sm opacity-80 mb-2 font-sans break-words">{footerAddress}</p>}
        {footerEmail && (
          <a href={`mailto:${footerEmail}`} className="inline-block text-sm opacity-80 mb-8 hover:underline font-sans break-all">{footerEmail}</a>
        )}
        <div className="text-[10px] uppercase font-sans tracking-widest opacity-50 font-medium">
          {copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} />
        </div>
      </div>
    </footer>
  );
};
