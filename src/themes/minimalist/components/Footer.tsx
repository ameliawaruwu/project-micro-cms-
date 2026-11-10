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
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

  const isDesktopPreview = !isMobile && !isTablet;
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-12',
    fallback: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-12',
  });
  const colSpan5Class = isDesktopPreview ? 'md:col-span-5' : (isTablet ? 'col-span-2' : '');
  const colSpan3Class = isDesktopPreview ? 'md:col-span-3' : '';
  const colSpan4Class = isDesktopPreview ? 'md:col-span-4' : '';
  const bottomFlexClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col sm:flex-row',
  });

  const navList = getNavMenuItems(sectionOptions);

  return (
    <footer className="w-full max-w-full bg-white pt-10 sm:pt-16 md:pt-28 pb-8 sm:pb-12 px-3.5 sm:px-6 md:px-12 font-sans box-border overflow-hidden border-t border-gray-100">
      <div className={`max-w-7xl mx-auto grid ${gridColsClass} gap-8 md:gap-12 mb-10 sm:mb-16 md:mb-20`}>
        
        <div className={colSpan5Class}>
          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-gray-900 mb-3 sm:mb-5">
            {storeName}
          </h3>
          {storeDesc && (
            <p className="text-gray-500 text-xs sm:text-sm max-w-sm leading-relaxed mb-6 font-light break-words">
              {storeDesc}
            </p>
          )}
        </div>

        <div className={colSpan3Class}>
          <h4 className="text-[11px] sm:text-xs font-semibold text-gray-900 mb-3 sm:mb-5 uppercase tracking-[0.15em]">Navigation</h4>
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

        <div className={colSpan4Class}>
          <h4 className="text-[11px] sm:text-xs font-semibold text-gray-900 mb-3 sm:mb-5 uppercase tracking-[0.15em]">Connect</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 font-light mb-6">
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

      <div className={`max-w-7xl mx-auto flex ${bottomFlexClass} items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-gray-100 text-center sm:text-left`}>
        <p className="text-[11px] sm:text-xs text-gray-400 font-light">
          {copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} />
        </p>
      </div>
    </footer>
  );
};
