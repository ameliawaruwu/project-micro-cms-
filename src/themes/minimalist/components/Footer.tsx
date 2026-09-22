import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const MinimalistFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);
  
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name}. All rights reserved.`;

  return (
    <footer className="w-full max-w-full bg-white pt-10 sm:pt-16 md:pt-28 pb-8 sm:pb-12 px-3.5 sm:px-6 md:px-12 font-sans box-border overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 mb-10 sm:mb-16 md:mb-20">
        
        <div className="sm:col-span-2 md:col-span-5">
          <h3 className="text-xl sm:text-2xl font-light tracking-tight text-gray-900 mb-3 sm:mb-5">
            {storeInfo.name}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm max-w-sm leading-relaxed mb-6 font-light break-words">
            {storeInfo.description}
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[11px] sm:text-xs font-semibold text-gray-900 mb-3 sm:mb-5 uppercase tracking-[0.15em]">Navigation</h4>
          <ul className="space-y-2.5 sm:space-y-3">
            {navigation.map(nav => (
              <li key={nav.id}>
                <a href={nav.route} className="text-gray-600 hover:text-black text-xs sm:text-sm font-light transition-colors block py-0.5">
                  {nav.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-[11px] sm:text-xs font-semibold text-gray-900 mb-3 sm:mb-5 uppercase tracking-[0.15em]">Connect</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-600 font-light mb-6">
            <li className="break-words">{storeInfo.address}</li>
            <li className="break-words">{storeInfo.email}</li>
            <li className="break-words">{storeInfo.phone}</li>
          </ul>
          <div className="flex items-center gap-5">
            {storeInfo.socials?.instagram && (
              <a href="#" className="text-xs uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors">Instagram</a>
            )}
            {storeInfo.socials?.twitter && (
              <a href="#" className="text-xs uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors">Twitter</a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-gray-100 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs text-gray-400 font-light">
          {copyrightText}
        </p>
        <div className="flex gap-4 sm:gap-6 text-[11px] sm:text-xs text-gray-400 font-light">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
