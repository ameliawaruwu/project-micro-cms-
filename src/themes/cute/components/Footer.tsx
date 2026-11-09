import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Heart } from 'lucide-react';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getNavMenuItems, getFooterSocialLinks } from '../../navMenu';

export const CuteFooter: React.FC<{ sectionOptions?: any; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);

  const storeName = sectionOptions.storeName || sectionOptions.heading || sectionOptions.title || storeInfo.name;
  const storeDesc = sectionOptions.description !== undefined ? sectionOptions.description : storeInfo.description;
  const address = sectionOptions.address !== undefined ? sectionOptions.address : storeInfo.address;
  const email = sectionOptions.email !== undefined ? sectionOptions.email : storeInfo.email;
  const phone = sectionOptions.phone !== undefined ? sectionOptions.phone : (sectionOptions.phoneWhatsApp || storeInfo.phone);
  const copyrightText = sectionOptions.copyrightText || `Dibuat dengan 💖 oleh ${storeName} © ${new Date().getFullYear()}`;

  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-3',
    fallback: 'grid-cols-1 md:grid-cols-3',
  });
  const itemsAlignClass = isMobile || isTablet ? 'items-center' : 'items-center md:items-start';
  const textAlignClass = isMobile || isTablet ? 'text-center' : 'text-center md:text-left';

  return (
    <footer className="w-full bg-[#FFF5F7] pt-20 pb-10 px-6 mt-12 rounded-t-[3rem] font-['Outfit',sans-serif] border-t-8 border-[#FFD1DC]">
      <div className={`max-w-5xl mx-auto grid ${gridColsClass} gap-12 mb-12 ${textAlignClass}`}>

        {/* Brand */}
        <div className={`flex flex-col ${itemsAlignClass}`}>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border-4 border-[#FFD1DC]">
            <Heart className="w-8 h-8 text-[#FF85A1] fill-[#FF85A1]" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-[#FF85A1] mb-4">
            {storeName}
          </h3>
          <p className="text-gray-600 font-medium text-sm leading-relaxed mb-6">
            {storeDesc}
          </p>
          <div className="flex items-center gap-3">
            {getFooterSocialLinks(sectionOptions).map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" className="px-4 h-10 bg-white rounded-full flex items-center justify-center text-[#FF85A1] text-xs font-bold hover:bg-[#FF85A1] hover:text-white transition-colors shadow-sm border-2 border-[#FFD1DC]">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className={`flex flex-col ${itemsAlignClass}`}>
          <h4 className="text-lg font-black text-gray-800 mb-6 bg-white px-4 py-1 rounded-full border-2 border-[#FFD1DC] inline-block">
            Jalan Pintas 🌈
          </h4>
          <ul className="space-y-4">
            {getNavMenuItems(sectionOptions).map(nav => (
              <li key={nav.id}>
                <a href={nav.route} className="text-gray-600 font-bold hover:text-[#FF85A1] transition-colors flex items-center gap-2">
                  <span className="text-[#FF85A1]">✿</span> {nav.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className={`flex flex-col ${itemsAlignClass}`}>
          <h4 className="text-lg font-black text-gray-800 mb-6 bg-white px-4 py-1 rounded-full border-2 border-[#FFD1DC] inline-block">
            Sapa Kami! 💌
          </h4>
          <ul className="space-y-4 font-bold text-gray-600">
            {address && <li className="bg-white px-4 py-2 rounded-2xl border-2 border-[#FFD1DC] inline-block w-full">{address}</li>}
            {email && <li className="bg-white px-4 py-2 rounded-2xl border-2 border-[#FFD1DC] inline-block w-full break-all"><a href={`mailto:${email}`} className="hover:underline">{email}</a></li>}
          </ul>
        </div>

      </div>

      <div className="max-w-5xl mx-auto pt-8 border-t-4 border-white text-center flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-[#FF85A1]">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
};