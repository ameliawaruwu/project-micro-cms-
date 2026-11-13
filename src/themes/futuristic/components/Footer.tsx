import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Cpu, Mail, MapPin } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems } from '../../navMenu';
import { FooterLegalLinks } from '../../FooterLegalLinks';
import { FooterSocialLinks } from '../../FooterSocialLinks';

export const FuturisticFooter: React.FC<{ sectionOptions?: any; accentColor?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, accentColor = '#8B5CF6', isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo?.email;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo?.address;
  const navItems = getNavMenuItems(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeTitle}. Hak cipta dilindungi.`;

  const mainGridClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-12',
    fallback: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-12',
  });
  const brandSpanClass = getDeviceClass(isMobile, isTablet, {
    mobile: '',
    tablet: 'col-span-2',
    desktop: 'col-span-6',
    fallback: 'sm:col-span-2 lg:col-span-6',
  });
  const columnSpanClass = getDeviceClass(isMobile, isTablet, {
    mobile: '',
    tablet: '',
    desktop: 'col-span-3',
    fallback: 'lg:col-span-3',
  });

  return (
    <footer className="w-full bg-[#070A14] text-gray-300 pt-14 pb-8 px-5 sm:px-6 md:px-12 font-['Space_Grotesk',sans-serif] border-t relative overflow-hidden" style={{ borderColor: `${accentColor}4D` }}>
      {/* Background Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
      <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: `${accentColor}1A` }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className={`grid ${mainGridClass} gap-10 mb-10`}>
          {/* Brand */}
          <div className={`${brandSpanClass} space-y-4 min-w-0`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}33`, border: `1px solid ${accentColor}66`, color: accentColor }}>
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-wider uppercase text-white break-words min-w-0">{storeTitle}</h3>
            </div>
            {storeDesc && <p className="text-gray-400 text-xs leading-relaxed max-w-md">{storeDesc}</p>}
            <FooterSocialLinks sectionOptions={sectionOptions} className="pt-1" itemClassName="rounded-xl border border-white/15 text-gray-400 hover:text-white hover:border-white/40" />
          </div>

          {/* Menu */}
          <div className={columnSpanClass}>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }}></span> Menu
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {navItems.map((nav) => (
                <li key={nav.id}><a href={nav.route} className="hover:text-white transition-colors">{nav.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          {(email || address) && (
            <div className={`${columnSpanClass} min-w-0`}>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Kontak
              </h4>
              <div className="space-y-2.5 text-xs text-gray-400 font-mono">
                {address && (
                  <p className="flex items-start gap-2.5"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} /> <span className="break-words min-w-0">{address}</span></p>
                )}
                {email && (
                  <p className="flex items-start gap-2.5"><Mail className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} /> <a href={`mailto:${email}`} className="hover:underline break-all min-w-0">{email}</a></p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800/80 text-xs text-gray-500 font-mono text-center">
          {copyrightText}<FooterLegalLinks sectionOptions={sectionOptions} />
        </div>
      </div>
    </footer>
  );
};
