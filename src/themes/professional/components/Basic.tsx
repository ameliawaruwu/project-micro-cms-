import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getFooterSocialLinks } from '../../navMenu';
import { StoreLogo } from '../../StoreLogo';
import { CartCount } from '../../storefrontCart';

export const ProfessionalNavbar: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || sectionOptions.tagline || storeInfo?.description;
  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden md:flex',
  });

  return (
    <nav className="w-full bg-[#1E40AF] text-white shadow-md sticky top-0 z-50">
      <div className="w-full bg-[#1e3a8a] py-2 px-6 md:px-16 flex justify-between text-xs font-medium text-blue-200">
        <div className="flex gap-6">
          <span>Enterprise Solutions</span>
          <span>Global Shipping</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <a href="#" className="hover:text-white transition-colors">Client Portal</a>
        </div>
      </div>
      <div className="w-full px-6 md:px-16 py-5 flex justify-between items-center">
        <div className="flex items-center gap-12">
          {showLogo && (
            <div className="flex flex-col">
              <a href="/" className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11">
                  <>
                    <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shrink-0">
                      <span className="text-[#1E40AF] font-bold text-xl leading-none">
                        {(storeTitle || 'P')[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span>{storeTitle}</span>
                  </>
                </StoreLogo>
              </a>
              {storeSubtitle && (
                <span className="text-xs text-blue-200 font-medium pl-11 -mt-1">
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
        <div className="flex gap-4">
          <a href="#kontak" className="hidden sm:inline-flex px-5 py-2 text-sm font-semibold text-white border border-blue-400 rounded-md hover:bg-blue-800 transition-colors">
            Hubungi Kami
          </a>
          <button type="button" data-href="/keranjang" aria-label="Buka keranjang belanja" className="px-5 py-2 text-sm font-semibold bg-white text-[#1E40AF] rounded-md hover:bg-gray-100 transition-colors shadow-sm cursor-pointer">
            Keranjang (<CartCount />)
          </button>
        </div>
      </div>
    </nav>
  );
};

export const ProfessionalHero: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const heading = sectionOptions.heading || "Professional B2B Solutions";
  const subheading = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || storeInfo?.description || "Streamline your procurement process with our enterprise-grade supplies and dedicated account management.";
  const buttonLabel = sectionOptions.buttonLabel || "Request a Quote";
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80";
  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const halfWidthClass = isMobile || isTablet ? 'w-full' : 'w-full md:w-1/2';
  const ptClass = isMobile || isTablet ? 'pt-12' : 'pt-12 md:pt-0';

  return (
    <section className="relative w-full min-h-[75vh] flex items-center bg-gray-50 border-b border-gray-200 overflow-hidden">
      <div className={`w-full max-w-7xl mx-auto px-6 md:px-16 flex ${flexDirClass} items-center gap-12`}>
        <div className={`${halfWidthClass} ${ptClass} z-10`}>
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            Enterprise Ready
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            {heading}
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
            {subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3.5 bg-[#1E40AF] text-white font-semibold rounded-md hover:bg-[#1e3a8a] transition-colors shadow-md text-center">
              {buttonLabel}
            </button>
            <button className="px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors text-center">
              View Catalog
            </button>
          </div>
        </div>
        <div className={`${halfWidthClass} relative`}>
          <div className="absolute inset-0 bg-blue-600 rounded-2xl transform translate-x-4 translate-y-4 opacity-10"></div>
          <img 
            src={bgImage} 
            alt="Corporate" 
            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl relative z-10"
          />
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg z-20 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-gray-900">99.8%</p>
              </div>
            </div>
          </div>
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
  const socials = getFooterSocialLinks(sectionOptions);
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeTitle}. All rights reserved.`;
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
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 shrink-0 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl leading-none">
                {(storeTitle || 'P')[0]?.toUpperCase()}
              </span>
              <span className="break-words min-w-0">{storeTitle}</span>
            </h2>
            {storeDesc && <p className="text-sm text-gray-400 leading-relaxed max-w-md">{storeDesc}</p>}
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-5 text-sm">
                {socials.map((s) => (
                  <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">{s.label}</a>
                ))}
              </div>
            )}
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

        <div className="pt-6 border-t border-gray-800 text-sm text-gray-500 text-center">{copyrightText}</div>
      </div>
    </footer>
  );
};
