import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export const ModernFooter: React.FC<{ sectionOptions?: any; accentColor?: string }> = ({ sectionOptions = {}, accentColor = '#2563EB' }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeDesc = sectionOptions.subheading || sectionOptions.description || sectionOptions.subtitle || storeInfo?.description;

  return (
    <footer className="w-full px-4 md:px-8 py-6 font-['Outfit',sans-serif] bg-white">
      <div className="max-w-7xl mx-auto rounded-[2rem] p-8 md:p-14" style={{ backgroundColor: `${accentColor}0D` }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">

          <div className="md:col-span-5">
            <h3 className="text-xl font-extrabold text-gray-900 mb-3">{storeTitle}</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-5">{storeDesc}</p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:text-white transition-colors" style={{ ['--hover-bg' as any]: accentColor }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentColor; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}>
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:text-white transition-colors" onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentColor; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}>
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              {navigation.filter(n => n.isActive).map(nav => (
                <li key={nav.id}><a href={nav.route} className="hover:text-gray-900 transition-colors">{nav.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-4">Kontak</h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" style={{ color: accentColor }} /> {storeInfo.address}</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" style={{ color: accentColor }} /> {storeInfo.phone}</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" style={{ color: accentColor }} /> {storeInfo.email}</li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} {storeInfo.name}. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-900 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
