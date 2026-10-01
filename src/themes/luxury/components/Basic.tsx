import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { useLanguage } from '../../../contexts/LanguageContext';

export const LuxuryNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const { isEn } = useLanguage();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || sectionOptions.tagline || storeInfo?.description;

  return (
    <nav className="w-full px-8 md:px-16 py-6 md:py-8 flex justify-between items-center bg-white/95 backdrop-blur-md border-b border-[#F0EBE1] sticky top-0 z-50 transition-all duration-300">
      <div className="w-1/3 flex justify-start">
        {showNav && (
          <div className="hidden md:flex gap-10">
            {navigation.map(nav => (
              <a key={nav.id} href={nav.route} className="text-[10px] uppercase tracking-[0.25em] text-[#7D6E63] hover:text-[#8C531B] transition-colors duration-300">
                {nav.label}
              </a>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-1/3 flex flex-col justify-center items-center text-center">
        {showLogo && (
          <a href="/" className="text-3xl md:text-4xl font-serif text-[#8C531B] tracking-tight text-center block">
            {storeTitle}
          </a>
        )}
        {storeSubtitle && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9A6027]/80 mt-1 block font-sans">
            {storeSubtitle}
          </span>
        )}
      </div>

      <div className="w-1/3 flex justify-end">
        <button className="text-[10px] uppercase tracking-[0.25em] text-[#8C531B] hover:text-[#5C4533] transition-colors duration-300">
          {isEn ? 'Boutique' : 'Butik'}
        </button>
      </div>
    </nav>
  );
};

export const LuxuryHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { isEn } = useLanguage();
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80";

  const defaultHeading = isEn ? "Timeless Elegance" : "Elegansi Klasik";
  const defaultAnnouncement = isEn ? "Haute Creation" : "Koleksi Eksklusif";
  const defaultButton = isEn ? "Discover Collection" : "Jelajahi Koleksi";
  const defaultSubheading = isEn 
    ? "The art of quiet luxury, timeless sophistication, and exquisite artisan craftsmanship."
    : "Seni kemewahan abadi, keanggunan sejati, dan dedikasi pada kesempurnaan kreasi.";

  const isDefaultHeading = !sectionOptions.heading 
    || sectionOptions.heading === "Elegansi Klasik" 
    || sectionOptions.heading === "Timeless Elegance";
  const heading = isDefaultHeading ? defaultHeading : sectionOptions.heading;

  const isDefaultAnnouncement = !sectionOptions.announcementText 
    || sectionOptions.announcementText === "Collection Privée" 
    || sectionOptions.announcementText === "Haute Creation" 
    || sectionOptions.announcementText === "Koleksi Eksklusif";
  const announcementText = isDefaultAnnouncement ? defaultAnnouncement : sectionOptions.announcementText;

  const isDefaultButton = !sectionOptions.buttonLabel 
    || sectionOptions.buttonLabel === "Discover" 
    || sectionOptions.buttonLabel === "Discover Collection" 
    || sectionOptions.buttonLabel === "Jelajahi Koleksi";
  const buttonLabel = isDefaultButton ? defaultButton : sectionOptions.buttonLabel;

  const currentSub = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle;
  const isDefaultSub = !currentSub
    || currentSub === "The art of quiet luxury, timeless sophistication, and exquisite artisan craftsmanship."
    || currentSub === "Seni kemewahan abadi, keanggunan sejati, dan dedikasi pada kesempurnaan kreasi.";
  const subheading = isDefaultSub ? defaultSubheading : currentSub;

  return (
    <section className="relative w-full h-[90vh] bg-white px-4 md:px-12 pb-12 pt-4">
      <div className="w-full h-full relative overflow-hidden group">
        <img 
          src={bgImage} 
          alt="Luxury Collection" 
          className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[20s] ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-[#1a1a1a]/20 to-transparent"></div>
        <div className="absolute bottom-16 left-8 md:left-16 text-white max-w-2xl">
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] mb-6 text-[#D4AF37] opacity-90">
            {announcementText}
          </p>
          <h1 className="text-5xl md:text-7xl font-serif mb-4 leading-tight drop-shadow-md">
            {heading}
          </h1>
          {subheading && (
            <p className="text-sm md:text-base font-light text-white/85 mb-8 max-w-xl leading-relaxed drop-shadow-sm">
              {subheading}
            </p>
          )}
          <button className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] border-b border-[#D4AF37] pb-2 text-white hover:text-[#D4AF37] transition-colors duration-500">
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
};

export const LuxuryFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const { isEn } = useLanguage();
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.description || storeInfo?.description;
  const copyrightText = sectionOptions.copyrightText || (isEn 
    ? `© ${new Date().getFullYear()} ${storeTitle}. All rights reserved.`
    : `© ${new Date().getFullYear()} ${storeTitle}. Seluruh hak cipta dilindungi.`);

  const navLinks = isEn
    ? [
        { label: 'Boutiques', href: '#' },
        { label: 'Client Services', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Legal Mentions', href: '#' },
      ]
    : [
        { label: 'Butik', href: '#' },
        { label: 'Layanan Pelanggan', href: '#' },
        { label: 'Kontak', href: '#' },
        { label: 'Ketentuan Hukum', href: '#' },
      ];

  return (
    <footer className="w-full px-8 md:px-16 py-20 bg-white text-[#36281D] flex flex-col items-center border-t border-[#F0EBE1]">
      <a href="/" className="text-3xl sm:text-4xl font-serif mb-3 text-[#8C531B] tracking-wider hover:opacity-85 transition-opacity">
        {storeTitle}
      </a>
      {storeDesc && (
        <p className="text-xs sm:text-sm font-light text-[#7D6E63] max-w-md text-center mb-10 leading-relaxed font-sans">
          {storeDesc}
        </p>
      )}
      
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-[10px] uppercase tracking-[0.25em] mb-12 text-[#7D6E63] text-center font-sans">
        {navLinks.map((link, idx) => (
          <a key={idx} href={link.href} className="hover:text-[#8C531B] transition-colors">{link.label}</a>
        ))}
      </div>
      
      <div className="w-12 h-px bg-[#8C531B]/30 mb-8"></div>
      
      <p className="text-[9px] uppercase tracking-[0.35em] text-[#9E8E81] text-center font-mono">
        {copyrightText}
      </p>
    </footer>
  );
};
