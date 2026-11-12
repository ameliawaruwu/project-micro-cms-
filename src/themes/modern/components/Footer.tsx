import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Mail, MapPin } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getFooterSocialLinks } from '../../navMenu';
import { FooterLegalLinks } from '../../FooterLegalLinks';

export const ModernFooter: React.FC<{ sectionOptions?: any; accentColor?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, accentColor = '#2563EB', isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);

  const storeName = sectionOptions.storeName || sectionOptions.heading || sectionOptions.title || storeInfo.name;
  const storeDesc = sectionOptions.description !== undefined ? sectionOptions.description : (sectionOptions.tagline || storeInfo.description);
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo.address;
  const phone = sectionOptions.phone !== undefined ? sectionOptions.phone : (sectionOptions.phoneWhatsApp || storeInfo.phone);
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo.email;
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeName}. Hak cipta dilindungi.`;

  const isDesktopPreview = !isMobile && !isTablet;
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-12',
    fallback: 'grid-cols-1 md:grid-cols-12',
  });
  const colSpan5Class = isDesktopPreview ? 'md:col-span-5' : '';
  const colSpan3Class = isDesktopPreview ? 'md:col-span-3' : '';
  const colSpan4Class = isDesktopPreview ? 'md:col-span-4' : '';
  const bottomFlexClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });

  return (
    <footer className="w-full px-4 md:px-8 py-6 font-['Outfit',sans-serif] bg-white">
      <div className="max-w-7xl mx-auto rounded-[2rem] p-6 sm:p-8 md:p-14" style={{ backgroundColor: `${accentColor}0D` }}>
        <div className={`grid ${gridColsClass} gap-10 mb-10`}>

          <div className={colSpan5Class}>
            <h3 className="text-xl font-extrabold text-gray-900 mb-3 break-words">{storeName}</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-5">{storeDesc}</p>
            {getFooterSocialLinks(sectionOptions).length > 0 && (
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                {getFooterSocialLinks(sectionOptions).map((s) => (
                  <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">{s.label}</a>
                ))}
              </div>
            )}
          </div>

          <div className={colSpan3Class}>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {getNavMenuItems(sectionOptions).map(nav => (
                <li key={nav.id}><a href={nav.route} className="hover:text-gray-900 transition-colors">{nav.label}</a></li>
              ))}
            </ul>
          </div>

          <div className={colSpan4Class}>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-4">Kontak</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {address && <li className="flex items-start gap-2 break-words"><MapPin className="w-4 h-4 shrink-0" style={{ color: accentColor }} /> {address}</li>}
              {email && <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" style={{ color: accentColor }} /> <a href={`mailto:${email}`} className="hover:underline break-all">{email}</a></li>}
            </ul>
          </div>

        </div>

        <div className={`pt-6 border-t border-black/5 flex ${bottomFlexClass} items-center justify-between gap-3 text-xs text-gray-500`}>
          <p>{copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} /></p>
        </div>
      </div>
    </footer>
  );
};

