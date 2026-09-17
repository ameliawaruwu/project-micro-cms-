import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const ElegantFooter: React.FC = () => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);

  return (
    <footer className="w-full bg-[#1A1918] text-[#FAF9F6] pt-24 pb-12 px-8 md:px-16 font-['Cormorant_Garamond',serif]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 mb-24">
        
        {/* Brand */}
        <div className="flex-1 md:max-w-sm">
          <h3 className="text-3xl font-normal tracking-widest uppercase mb-8">
            {storeInfo.name}
          </h3>
          <p className="text-[#A39D98] text-lg italic leading-relaxed mb-8">
            {storeInfo.description}
          </p>
        </div>

        {/* Links */}
        <div className="flex-1 flex flex-col md:flex-row gap-16 justify-end">
          <div>
            <h4 className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#A39D98] mb-8">Navigation</h4>
            <ul className="space-y-4">
              {navigation.map(nav => (
                <li key={nav.id}>
                  <a href={nav.route} className="text-lg text-[#FAF9F6] hover:text-[#A39D98] transition-colors italic">
                    {nav.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#A39D98] mb-8">Contact</h4>
            <ul className="space-y-4 font-sans text-xs tracking-wider text-[#FAF9F6]">
              <li>{storeInfo.address}</li>
              <li>{storeInfo.email}</li>
              <li>{storeInfo.phone}</li>
            </ul>
            <div className="mt-8 flex gap-6">
              {storeInfo.socials.instagram && (
                <a href="#" className="font-sans text-[10px] tracking-[0.2em] uppercase hover:text-[#A39D98] transition-colors">Instagram</a>
              )}
              {storeInfo.socials.tiktok && (
                <a href="#" className="font-sans text-[10px] tracking-[0.2em] uppercase hover:text-[#A39D98] transition-colors">TikTok</a>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#A39D98]/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#A39D98]">
          &copy; {new Date().getFullYear()} {storeInfo.name}.
        </p>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#A39D98]">
          Elegance is an attitude.
        </p>
      </div>
    </footer>
  );
};
