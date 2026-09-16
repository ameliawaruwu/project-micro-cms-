import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const MinimalistFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);
  
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name}. All rights reserved.`;

  return (
    <footer className="w-full bg-white pt-32 pb-12 px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
        
        <div className="md:col-span-5">
          <h3 className="text-2xl font-light tracking-tight text-gray-900 mb-6">
            {storeInfo.name}
          </h3>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-8 font-light">
            {storeInfo.description}
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs font-semibold text-gray-900 mb-6 uppercase tracking-[0.2em]">Navigation</h4>
          <ul className="space-y-4">
            {navigation.map(nav => (
              <li key={nav.id}>
                <a href={nav.route} className="text-gray-500 hover:text-black text-sm font-light transition-colors">
                  {nav.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-xs font-semibold text-gray-900 mb-6 uppercase tracking-[0.2em]">Connect</h4>
          <ul className="space-y-4 text-sm text-gray-500 font-light mb-8">
            <li>{storeInfo.address}</li>
            <li>{storeInfo.email}</li>
            <li>{storeInfo.phone}</li>
          </ul>
          <div className="flex items-center gap-6">
            {storeInfo.socials.instagram && (
              <a href="#" className="text-xs uppercase tracking-widest text-gray-900 hover:text-gray-400 transition-colors">Instagram</a>
            )}
            {storeInfo.socials.twitter && (
              <a href="#" className="text-xs uppercase tracking-widest text-gray-900 hover:text-gray-400 transition-colors">Twitter</a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400 font-light">
          {copyrightText}
        </p>
        <div className="flex gap-6 text-xs text-gray-400 font-light">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};
