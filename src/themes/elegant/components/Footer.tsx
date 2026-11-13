import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems } from '../../navMenu';
import { FooterLegalLinks } from '../../FooterLegalLinks';
import { FooterSocialLinks } from '../../FooterSocialLinks';

export const ElegantFooter: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);

  const storeName = sectionOptions.storeName || sectionOptions.heading || sectionOptions.title || storeInfo.name;
  const storeDesc = sectionOptions.description !== undefined ? sectionOptions.description : storeInfo.description;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo.address;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo.email;
  const phone = sectionOptions.phone !== undefined ? sectionOptions.phone : (sectionOptions.phoneWhatsApp || storeInfo.phone);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeName || ''}. Hak cipta dilindungi.`;

  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const maxWClass = isMobile || isTablet ? '' : 'md:max-w-sm';

  return (
    <footer className="w-full bg-[#1A1918] text-[#FAF9F6] pt-16 sm:pt-24 pb-12 px-4 sm:px-8 md:px-16 font-['Cormorant_Garamond',serif]">
      <div className={`max-w-7xl mx-auto flex ${flexDirClass} justify-between gap-12 sm:gap-16 mb-16 sm:mb-24`}>
        
        {/* Brand */}
        <div className={`flex-1 min-w-0 ${maxWClass}`}>
          <h3 className="text-2xl sm:text-3xl font-normal tracking-widest uppercase mb-6 sm:mb-8 break-words">
            {storeName}
          </h3>
          <p className="text-[#A39D98] text-lg italic leading-relaxed mb-8">
            {storeDesc}
          </p>
        </div>

        {/* Links */}
        <div className={`flex-1 flex ${flexDirClass} gap-12 sm:gap-16 justify-end`}>
          <div>
            <h4 className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#A39D98] mb-8">Navigasi</h4>
            <ul className="space-y-4">
              {getNavMenuItems(sectionOptions).map(nav => (
                <li key={nav.id}>
                  <a href={nav.route} className="text-lg text-[#FAF9F6] hover:text-[#A39D98] transition-colors italic">
                    {nav.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#A39D98] mb-8">Kontak</h4>
            <ul className="space-y-4 font-sans text-xs tracking-wider text-[#FAF9F6]">
              {address && <li className="break-words">{address}</li>}
              {email && <li className="break-all"><a href={`mailto:${email}`} className="hover:underline">{email}</a></li>}
            </ul>
            <FooterSocialLinks sectionOptions={sectionOptions} className="mt-8" itemClassName="rounded-none border border-[#A39D98]/40 hover:text-[#A39D98] hover:border-[#A39D98]" />
          </div>
        </div>

      </div>

      <div className={`max-w-7xl mx-auto pt-8 border-t border-[#A39D98]/20 flex ${flexDirClass} justify-between items-center gap-4`}>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#A39D98] text-center md:text-left">
          {copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} />
        </p>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#A39D98]">
          Terima kasih telah berbelanja.
        </p>
      </div>
    </footer>
  );
};
