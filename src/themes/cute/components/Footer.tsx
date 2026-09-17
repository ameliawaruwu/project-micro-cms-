import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Heart } from 'lucide-react';

export const CuteFooter: React.FC = () => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);

  return (
    <footer className="w-full bg-[#FFF5F7] pt-20 pb-10 px-6 mt-12 rounded-t-[3rem] font-['Outfit',sans-serif] border-t-8 border-[#FFD1DC]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-left">

        {/* Brand */}
        <div className="flex flex-col items-center md:items-start">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border-4 border-[#FFD1DC]">
            <Heart className="w-8 h-8 text-[#FF85A1] fill-[#FF85A1]" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-[#FF85A1] mb-4">
            {storeInfo.name}
          </h3>
          <p className="text-gray-600 font-medium text-sm leading-relaxed mb-6">
            {storeInfo.description}
          </p>
          <div className="flex items-center gap-3">
            {storeInfo.socials.instagram && (
              <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#FF85A1] hover:bg-[#FF85A1] hover:text-white transition-colors shadow-sm border-2 border-[#FFD1DC]">
                IG
              </a>
            )}
            {storeInfo.socials.tiktok && (
              <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#FF85A1] hover:bg-[#FF85A1] hover:text-white transition-colors shadow-sm border-2 border-[#FFD1DC]">
                TK
              </a>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-black text-gray-800 mb-6 bg-white px-4 py-1 rounded-full border-2 border-[#FFD1DC] inline-block">
            Jalan Pintas 🌈
          </h4>
          <ul className="space-y-4">
            {navigation.map(nav => (
              <li key={nav.id}>
                <a href={nav.route} className="text-gray-600 font-bold hover:text-[#FF85A1] transition-colors flex items-center gap-2">
                  <span className="text-[#FF85A1]">✿</span> {nav.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-center md:items-start">
          <h4 className="text-lg font-black text-gray-800 mb-6 bg-white px-4 py-1 rounded-full border-2 border-[#FFD1DC] inline-block">
            Sapa Kami! 💌
          </h4>
          <ul className="space-y-4 font-bold text-gray-600">
            <li className="bg-white px-4 py-2 rounded-2xl border-2 border-[#FFD1DC] inline-block w-full">{storeInfo.address}</li>
            <li className="bg-white px-4 py-2 rounded-2xl border-2 border-[#FFD1DC] inline-block w-full">{storeInfo.email}</li>
            <li className="bg-white px-4 py-2 rounded-2xl border-2 border-[#FFD1DC] inline-block w-full">{storeInfo.phone}</li>
          </ul>
        </div>

      </div>

      <div className="max-w-5xl mx-auto pt-8 border-t-4 border-white text-center flex flex-col items-center gap-2">
        <p className="text-sm font-bold text-[#FF85A1]">
          Dibuat dengan 💖 oleh {storeInfo.name} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};