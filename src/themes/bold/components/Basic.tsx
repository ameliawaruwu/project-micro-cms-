import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getFooterSocialLinks, getHeaderDisplay, getHeaderSubtitle } from '../../navMenu';
import { NavSearchButton } from '../../NavSearchButton';
import { StoreLogo } from '../../StoreLogo';
import { CartCountBadge, NavCartButton } from '../../storefrontCart';
import { ShoppingBag as CartBagIcon } from 'lucide-react';
import { FooterLegalLinks } from '../../FooterLegalLinks';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { NavTrackOrderButton } from '../../NavTrackOrderButton';
import { STORE_ROUTES } from '../../storefrontLinks';
import { useThemeProductsSource } from '../../useSectionProducts';

export const BoldNavbar: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { storeInfo } = useCmsStore();
  const header = getHeaderDisplay(sectionOptions);
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo.name || 'RAWSTATE';
  const storeSubtitle = getHeaderSubtitle(sectionOptions, storeInfo?.description);
  const navFlexClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const logoWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-1/3';
  const logoJustifyClass = isMobile || isTablet ? 'justify-center' : 'justify-center md:justify-start';
  const navWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-2/3';
  const navJustifyClass = isMobile || isTablet ? 'justify-center' : 'justify-center md:justify-end';
  const navMarginClass = isMobile || isTablet ? 'mt-3' : 'mt-3 md:mt-0';

  return (
    <nav className={`w-full px-4 sm:px-6 md:px-12 py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-zinc-950/90 backdrop-blur-md text-white border-b border-zinc-800/80 ${header.positionClass} transition-all`}>
      <div className="order-1 min-w-0 flex-1 lg:flex-none flex items-center">
        {showLogo && (
          <div className="flex flex-col min-w-0">
            <a href="/" className="flex items-center gap-2 sm:gap-3 font-black tracking-tighter uppercase text-xl sm:text-2xl md:text-3xl text-white hover:text-red-500 transition-colors group min-w-0">
              <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11"><span className="font-extrabold tracking-tight truncate">{storeTitle}</span></StoreLogo>
            </a>
            {storeSubtitle && (
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5 line-clamp-1">
                {storeSubtitle}
              </span>
            )}
          </div>
        )}
      </div>

      {showNav && (
        <div className="order-3 lg:order-2 w-full lg:w-auto lg:flex-1 flex flex-wrap justify-center lg:justify-end items-center gap-x-6 sm:gap-x-8 gap-y-2 font-bold uppercase tracking-wider text-xs md:text-sm">
          {getNavMenuItems(sectionOptions).map(nav => (
            <a key={nav.id} href={nav.route} className="text-zinc-400 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-red-500 hover:after:w-full after:transition-all">
              {nav.label}
            </a>
          ))}
        </div>
      )}

      <div className="order-2 lg:order-3 shrink-0 flex items-center gap-2 sm:gap-3">
        {header.showSearch && (
          <NavSearchButton className="p-2 text-zinc-400 hover:text-white transition-colors" />
        )}
        <NavTrackOrderButton className="p-2 text-zinc-400 hover:text-white transition-colors" />
        {header.showCart && (
          <button type="button" data-href="/keranjang" aria-label="Buka keranjang belanja" className="relative cursor-pointer bg-white text-zinc-950 p-2.5 rounded-lg hover:bg-zinc-200 transition-all shadow-md hover:shadow-white/10 active:scale-95 flex items-center justify-center">
            <CartBagIcon className="w-4 h-4" />
            <CartCountBadge className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none flex items-center justify-center bg-zinc-950 text-white ring-2 ring-white" />
          </button>
        )}
      </div>
    </nav>
  );
};

export const BoldHero: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const heading = sectionOptions.heading || storeInfo?.name || 'Selamat Datang';
  const subheading =
    sectionOptions.subheading ||
    sectionOptions.description ||
    storeInfo?.description ||
    'Temukan produk pilihan terbaik dari toko kami.';
  const hero = getHeroContent(sectionOptions, {
    badge: 'Koleksi Terbaru',
    buttonLabel: 'Lihat Katalog',
    buttonLink: STORE_ROUTES.catalog,
    secondaryButtonLabel: 'Lihat Promo',
    secondaryButtonLink: STORE_ROUTES.promo,
  });
  const products = useThemeProductsSource('bold');
  // Tanpa banner dari merchant, pakai foto produk toko sendiri sebelum gambar bawaan tema.
  const bgImage =
    sectionOptions.imageUrl ||
    sectionOptions.bannerUrl ||
    (storeInfo as any)?.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80';

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden border-b border-zinc-800">
      {/* Background Image with Dark Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover opacity-40 filter contrast-110 scale-105 animate-pulse-subtle"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.8)_100%)]"></div>
      </div>

      {/* Hero Content */}
      <div className="z-10 text-center relative w-full px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center justify-center flex-grow py-16 sm:py-24">
        {hero.badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900/90 border border-zinc-700/80 rounded-full text-zinc-300 font-bold text-xs uppercase tracking-[0.25em] mb-8 backdrop-blur-md shadow-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            {hero.badge}
          </div>
        )}

        <h1 className="text-4xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase text-white leading-none mb-8 text-center max-w-full break-words drop-shadow-2xl">
          <span className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            <InlineEditableText
              tagName="span"
              value={heading}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </span>
        </h1>

        <p className="text-base sm:text-xl font-medium text-zinc-300 max-w-2xl mx-auto mb-10 tracking-wide leading-relaxed">
          <InlineEditableText
            tagName="span"
            value={subheading}
            onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
            readonly={!onUpdateSectionOptions}
          />
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <HeroActionLink
            action={hero.primary}
            className="w-full sm:w-auto text-center px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-widest text-sm rounded-xl transition-all duration-300 shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 cursor-pointer"
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <InlineEditableText
              tagName="span"
              value={hero.primary.label}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val, buttonText: val })}
              readonly={!onUpdateSectionOptions}
            /> →
          </HeroActionLink>
          {hero.secondary && (
            <HeroActionLink
              action={hero.secondary}
              className="w-full sm:w-auto text-center px-8 py-4 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 font-bold uppercase tracking-widest text-sm rounded-xl transition-all duration-300 backdrop-blur-md hover:border-zinc-500"
            />
          )}
        </div>
      </div>

      {/* Ticker / Marquee */}
      <div className="w-full overflow-hidden bg-zinc-900/90 text-zinc-400 py-3 z-20 whitespace-nowrap border-t border-b border-zinc-800/80 backdrop-blur-md">
        <div className="animate-marquee font-extrabold uppercase tracking-[0.2em] text-xs flex items-center">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {heading} — {hero.badge || 'Koleksi Terbaru'}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BoldFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo?.email;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo?.address;
  const navItems = getNavMenuItems(sectionOptions);
  const socials = getFooterSocialLinks(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeTitle} Hak cipta dilindungi.`;

  return (
    <footer className="w-full px-5 sm:px-8 py-12 sm:py-16 bg-zinc-950 text-white text-center border-t border-zinc-800/80 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        <a href="/" className="inline-block text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase text-white hover:text-red-500 transition-colors break-words max-w-full">
          {storeTitle}
        </a>
        {storeDesc && <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">{storeDesc}</p>}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 font-semibold uppercase tracking-wider text-xs text-zinc-400">
          {navItems.map((nav) => (
            <a key={nav.id} href={nav.route} className="hover:text-white transition-colors">{nav.label}</a>
          ))}
        </nav>
        {(email || address) && (
          <div className="space-y-1 text-xs text-zinc-400">
            {address && <p className="break-words">{address}</p>}
            {email && <a href={`mailto:${email}`} className="block font-black uppercase tracking-widest text-white hover:underline break-all">{email}</a>}
          </div>
        )}
        {socials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {socials.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{s.label}</a>
            ))}
          </div>
        )}
        <div className="pt-6 border-t border-zinc-900 text-xs font-medium text-zinc-500 tracking-wider">
          {copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} />
        </div>
      </div>
    </footer>
  );
};
