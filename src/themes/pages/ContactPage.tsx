import React from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

interface ContactPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  onNavigate?: (pageId: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ themeData, themeId: propThemeId, store, onNavigate }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderContent = () => {
    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 text-center">
              HUBUNGI KAMI
            </h1>
            <div className="bg-[#FF0000] p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-4">
              <input type="text" placeholder="NAMA LENGKAP" className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm" />
              <input type="email" placeholder="EMAIL" className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm" />
              <textarea placeholder="PESAN ANDA..." rows={4} className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm" />
              <button className="w-full py-5 bg-black text-white text-xl font-black uppercase border-4 border-black hover:bg-yellow-300 hover:text-black transition shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                KIRIM PESAN 📩
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-8">
              <span className="text-xs text-cyan-400 uppercase tracking-widest">[DISPATCH_COMMUNICATION]</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mt-2">
                CONTACT MATRIX
              </h1>
            </div>
            <div className="bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-md space-y-4">
              <input type="text" placeholder="FULL_NAME" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400" />
              <input type="email" placeholder="EMAIL_ADDRESS" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400" />
              <textarea placeholder="TRANSMISSION_DATA..." rows={4} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400" />
              <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                TRANSMIT MESSAGE ⚡
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. DEFAULT / MINIMALIST / NATURE / CUTE / LUXURY / EDITORIAL ETC
    return (
      <div className="pt-28 pb-24 bg-gray-50 text-gray-900 min-h-screen font-sans">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Hubungi Kami</h1>
              <p className="text-sm text-gray-500">Ada pertanyaan? Tim kami siap membantu Anda kapan saja.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <input type="text" placeholder="Nama Anda" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="email" placeholder="Email Anda" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <textarea placeholder="Pesan Anda..." rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <button className="w-full py-3.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition shadow-md">
                  Kirim Pesan
                </button>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl space-y-4 text-sm text-gray-600 border border-gray-100">
                <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-gray-400" /> support@{store?.name?.toLowerCase()?.replace(/\s+/g, '') || 'toko'}.com</div>
                <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-gray-400" /> +62 812 3456 7890</div>
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-gray-400" /> Jakarta, Indonesia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {CustomNavbar ? <CustomNavbar /> : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
