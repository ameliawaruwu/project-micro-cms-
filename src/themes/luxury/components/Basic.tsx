import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getFooterSocialLinks, getHeaderDisplay, getHeaderSubtitle } from '../../navMenu';
import { NavSearchButton } from '../../NavSearchButton';
import { NavTrackOrderButton } from '../../NavTrackOrderButton';
import { StoreLogo } from '../../StoreLogo';
import { CartCount, CartCountBadge, NavCartButton } from '../../storefrontCart';
import { ShoppingBag as CartBagIcon } from 'lucide-react';
import { FooterLegalLinks } from '../../FooterLegalLinks';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES } from '../../storefrontLinks';

export const LuxuryNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const header = getHeaderDisplay(sectionOptions);
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = getHeaderSubtitle(sectionOptions, storeInfo?.description);
  const navItems = getNavMenuItems(sectionOptions);

  return (
    <nav className={`w-full px-5 sm:px-8 md:px-16 pt-5 pb-4 sm:pt-6 bg-white/95 backdrop-blur-md border-b border-[#F0EBE1] ${header.positionClass} transition-all duration-300`}>
      {header.showSearch && (
        <NavSearchButton
          className="absolute left-4 sm:left-8 md:left-16 top-5 sm:top-7 p-1 text-[#8C531B] hover:text-[#5C4533] transition-colors"
          iconClassName="w-5 h-5"
        />
      )}
      <NavTrackOrderButton
        className={`absolute ${header.showCart ? 'right-12 sm:right-16 md:right-24' : 'right-4 sm:right-8 md:right-16'} top-5 sm:top-7 p-1 text-[#8C531B] hover:text-[#5C4533] transition-colors`}
        iconClassName="w-5 h-5"
      />
      {header.showCart && (
        <NavCartButton
          className="absolute right-4 sm:right-8 md:right-16 top-5 sm:top-7 p-1 text-[#8C531B] hover:text-[#5C4533] transition-colors"
          badgeClassName="absolute -top-2 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#8C531B] text-white text-[9px] font-sans font-bold flex items-center justify-center"
        >
          <CartBagIcon className="w-5 h-5" />
        </NavCartButton>
      )}
      <div className="flex flex-col items-center text-center min-w-0">
        {showLogo && (
          <a href="/" className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#8C531B] tracking-tight block max-w-full break-words">
            <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-10 sm:h-12 mx-auto">{storeTitle}</StoreLogo>
          </a>
        )}
        {storeSubtitle && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A6027]/80 mt-1 font-sans max-w-xl line-clamp-1 sm:line-clamp-2">
            {storeSubtitle}
          </span>
        )}
      </div>

      {showNav && navItems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex flex-wrap justify-center gap-x-5 sm:gap-x-8 gap-y-2">
          {navItems.map((nav) => (
            <a key={nav.id} href={nav.route} className="text-[10px] uppercase tracking-[0.25em] text-[#7D6E63] hover:text-[#8C531B] transition-colors duration-300">
              {nav.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export const LuxuryHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { isEn } = useLanguage();
  const { storeInfo } = useCmsStore();
  const products = useThemeProductsSource('luxury');
  // Gambar latar: unggahan merchant → banner toko → foto produk pertama → gambar bawaan dekoratif.
  const bgImage =
    sectionOptions.imageUrl ||
    sectionOptions.bannerUrl ||
    (storeInfo as any)?.bannerUrl ||
    products.find((p) => p.image)?.image ||
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80';

  const defaultHeading = isEn ? "Timeless Elegance" : "Elegansi Klasik";
  const defaultAnnouncement = isEn ? "Haute Creation" : "Koleksi Eksklusif";
  const defaultButton = isEn ? "Discover Collection" : "Jelajahi Koleksi";
  const defaultSubheading = isEn
    ? "The art of quiet luxury, timeless sophistication, and exquisite artisan craftsmanship."
    : "Seni kemewahan abadi, keanggunan sejati, dan dedikasi pada kesempurnaan kreasi.";

  const isDefaultHeading = !sectionOptions.heading
    || sectionOptions.heading === "Elegansi Klasik"
    || sectionOptions.heading === "Timeless Elegance";
  // Judul bawaan template diganti nama toko agar hero menampilkan identitas toko sendiri.
  const heading = isDefaultHeading ? storeInfo?.name || defaultHeading : sectionOptions.heading;

  const isDefaultAnnouncement = !sectionOptions.announcementText
    || sectionOptions.announcementText === "Collection Privée"
    || sectionOptions.announcementText === "Haute Creation"
    || sectionOptions.announcementText === "Koleksi Eksklusif";
  const announcementText = isDefaultAnnouncement ? defaultAnnouncement : sectionOptions.announcementText;

  const isDefaultButton = !sectionOptions.buttonLabel
    || sectionOptions.buttonLabel === "Discover"
    || sectionOptions.buttonLabel === "Discover Collection"
    || sectionOptions.buttonLabel === "Jelajahi Koleksi";
  const hero = getHeroContent(
    { ...sectionOptions, buttonLabel: isDefaultButton ? defaultButton : sectionOptions.buttonLabel },
    { badge: announcementText, buttonLabel: defaultButton, buttonLink: STORE_ROUTES.catalog }
  );

  const currentSub = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle;
  const isDefaultSub = !currentSub
    || currentSub === "The art of quiet luxury, timeless sophistication, and exquisite artisan craftsmanship."
    || currentSub === "Seni kemewahan abadi, keanggunan sejati, dan dedikasi pada kesempurnaan kreasi.";
  const subheading = isDefaultSub ? storeInfo?.description || defaultSubheading : currentSub;

  return (
    <section className="relative w-full h-[80vh] sm:h-[90vh] min-h-[480px] bg-white px-3 sm:px-4 md:px-12 pb-8 sm:pb-12 pt-4">
      <div className="w-full h-full relative overflow-hidden group">
        <img
          src={bgImage}
          alt={heading}
          className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[20s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-[#1a1a1a]/20 to-transparent"></div>
        <div className="absolute bottom-10 sm:bottom-16 left-5 right-5 sm:left-8 sm:right-8 md:left-16 text-white max-w-2xl min-w-0">
          {hero.badge && (
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-4 sm:mb-6 text-[#D4AF37] opacity-90">
              {hero.badge}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif mb-4 leading-tight drop-shadow-md break-words">
            {heading}
          </h1>
          {subheading && (
            <p className="text-sm md:text-base font-light text-white/85 mb-8 max-w-xl leading-relaxed drop-shadow-sm line-clamp-4">
              {subheading}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <HeroActionLink
              action={hero.primary}
              className="inline-block text-[10px] md:text-[11px] uppercase tracking-[0.3em] border-b border-[#D4AF37] pb-2 text-white hover:text-[#D4AF37] transition-colors duration-500"
            />
            {hero.secondary && (
              <HeroActionLink
                action={hero.secondary}
                className="inline-block text-[10px] md:text-[11px] uppercase tracking-[0.3em] border-b border-white/40 pb-2 text-white/80 hover:text-white transition-colors duration-500"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export const LuxuryFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const { isEn } = useLanguage();
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo?.email;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo?.address;
  const navItems = getNavMenuItems(sectionOptions);
  const socials = getFooterSocialLinks(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || (isEn
    ? `© ${new Date().getFullYear()} ${storeTitle}. All rights reserved.`
    : `© ${new Date().getFullYear()} ${storeTitle}. Seluruh hak cipta dilindungi.`);

  return (
    <footer className="w-full px-5 sm:px-8 md:px-16 py-14 sm:py-20 bg-white text-[#36281D] flex flex-col items-center text-center border-t border-[#F0EBE1]">
      <a href="/" className="text-3xl sm:text-4xl font-serif mb-3 text-[#8C531B] tracking-wider hover:opacity-85 transition-opacity break-words max-w-full">
        {storeTitle}
      </a>
      {storeDesc && (
        <p className="text-xs sm:text-sm font-light text-[#7D6E63] max-w-md mb-8 leading-relaxed font-sans">{storeDesc}</p>
      )}

      <nav className="flex flex-wrap justify-center gap-x-6 sm:gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.25em] mb-8 text-[#7D6E63] font-sans">
        {navItems.map((nav) => (
          <a key={nav.id} href={nav.route} className="hover:text-[#8C531B] transition-colors">{nav.label}</a>
        ))}
      </nav>

      <div className="w-12 h-px bg-[#8C531B]/30 mb-6"></div>

      {(email || address) && (
        <div className="space-y-1 mb-6 text-xs text-[#7D6E63] font-sans">
          {address && <p className="break-words">{address}</p>}
          {email && <a href={`mailto:${email}`} className="block hover:underline break-all">{email}</a>}
        </div>
      )}
      {socials.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6 mb-6 text-[10px] uppercase tracking-[0.25em] text-[#7D6E63] font-sans">
          {socials.map((s) => (
            <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#8C531B] transition-colors">{s.label}</a>
          ))}
        </div>
      )}
      <p className="text-[9px] uppercase tracking-[0.35em] text-[#9E8E81] font-mono">{copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} /></p>
    </footer>
  );
};
