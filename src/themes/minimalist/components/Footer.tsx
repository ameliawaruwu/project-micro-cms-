import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getFooterSocialLinks } from '../../navMenu';
import { FooterLegalLinks } from '../../FooterLegalLinks';

export const MinimalistFooter: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);
  
  const storeName = sectionOptions.storeName || sectionOptions.heading || sectionOptions.title || storeInfo.name;
  const storeDesc = sectionOptions.description !== undefined ? sectionOptions.description : (sectionOptions.tagline || storeInfo.description);
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo.address;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo.email;
  const phone = sectionOptions.phone !== undefined ? sectionOptions.phone : (sectionOptions.phoneWhatsApp || storeInfo.phone);
  const socials = getFooterSocialLinks(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeName}. Hak cipta dilindungi.`;

  // Ponsel & tablet: nama toko selebar penuh di atas, lalu Navigasi dan Kontak berdampingan
  // (bukan Kontak sendirian di baris bawah). Desktop tetap 12 kolom 5/3/4.
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2 gap-x-5 gap-y-7',
    tablet: 'grid-cols-2 gap-x-10 gap-y-8',
    desktop: 'grid-cols-12 gap-12',
    fallback: 'grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-10 sm:gap-y-8 md:grid-cols-12 md:gap-12',
  });
  const brandColClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'col-span-2',
    tablet: 'col-span-2',
    desktop: 'col-span-5',
    fallback: 'col-span-2 md:col-span-5',
  });
  const navColClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'min-w-0',
    tablet: 'min-w-0',
    desktop: 'min-w-0 col-span-3',
    fallback: 'min-w-0 md:col-span-3',
  });
  const contactColClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'min-w-0',
    tablet: 'min-w-0',
    desktop: 'min-w-0 col-span-4',
    fallback: 'min-w-0 md:col-span-4',
  });
  const bottomFlexClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col text-center',
    tablet: 'flex-col text-center',
    desktop: 'flex-row text-left',
    fallback: 'flex-col text-center md:flex-row md:text-left',
  });
  const footerPaddingClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'pt-10 pb-6 px-5',
    tablet: 'pt-14 pb-8 px-8',
    desktop: 'pt-28 pb-12 px-12',
    fallback: 'pt-10 pb-6 px-5 sm:pt-14 sm:pb-8 sm:px-8 md:pt-28 md:pb-12 md:px-12',
  });
  const gridMarginClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'mb-8',
    tablet: 'mb-10',
    desktop: 'mb-20',
    fallback: 'mb-8 sm:mb-10 md:mb-20',
  });

  const navList = getNavMenuItems(sectionOptions);

  return (
    <footer className={`w-full max-w-full bg-white ${footerPaddingClass} font-sans box-border overflow-hidden border-t border-gray-100`}>
      <div className={`max-w-7xl mx-auto grid ${gridColsClass} ${gridMarginClass}`}>

        <div className={brandColClass}>
          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-gray-900 mb-2 sm:mb-4 break-words">
            {storeName}
          </h3>
          {storeDesc && (
            <p className="text-gray-500 text-xs sm:text-sm max-w-sm leading-relaxed font-light break-words">
              {storeDesc}
            </p>
          )}
        </div>

        <div className={navColClass}>
          <h4 className="text-[11px] sm:text-xs font-semibold text-gray-900 mb-3 sm:mb-5 uppercase tracking-[0.15em]">Navigasi</h4>
          <ul className="space-y-2.5 sm:space-y-3">
            {navList.map((nav: any) => (
              <li key={nav.id}>
                <a href={nav.route} className="text-gray-600 hover:text-black text-xs sm:text-sm font-light transition-colors block py-0.5">
                  {nav.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={contactColClass}>
          <h4 className="text-[11px] sm:text-xs font-semibold text-gray-900 mb-3 sm:mb-5 uppercase tracking-[0.15em]">Kontak</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 font-light mb-4">
            {address && <li className="break-words">{address}</li>}
            {email && <li className="break-all"><a href={`mailto:${email}`} className="hover:text-black transition-colors">{email}</a></li>}
          </ul>
          {socials.length > 0 && (
            <div className="flex flex-wrap items-center gap-5">
              {socials.map((s) => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors">{s.label}</a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`max-w-7xl mx-auto flex ${bottomFlexClass} items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-gray-100`}>
        <p className="text-[11px] sm:text-xs text-gray-400 font-light">
          {copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} />
        </p>
      </div>
    </footer>
  );
};
