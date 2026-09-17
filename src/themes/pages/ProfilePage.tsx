import React from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';

interface ProfilePageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  tab?: string;
  onNavigate?: (pageId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ themeData, themeId: propThemeId, store, tab, onNavigate }) => {
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
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8">
              PROFIL SAYA
            </h1>
            <div className="bg-[#FF0000] p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-6">
              <div className="bg-white p-6 border-4 border-black space-y-3 font-black uppercase">
                <p className="text-3xl text-black">BUDI SANTOSO</p>
                <p className="text-lg text-gray-700">EMAIL: BUDI@EXAMPLE.COM</p>
                <p className="text-lg text-gray-700">NO TELP: +62 812 3456 7890</p>
                <p className="text-lg text-gray-700">ALAMAT: JL. SUDIRMAN NO. 123, JAKARTA</p>
              </div>
              <button className="w-full py-4 bg-black text-white text-xl font-black uppercase border-4 border-black hover:bg-yellow-300 hover:text-black transition">
                EDIT PROFIL ✏️
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
            <div className="border-b border-cyan-500/20 pb-6 mb-8">
              <span className="text-xs text-cyan-400 uppercase tracking-widest">[USER_CARD]</span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                ACCOUNT PROFILE
              </h1>
            </div>
            <div className="bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-md space-y-4">
              <p className="text-cyan-300 font-bold text-xl">Budi Santoso</p>
              <p className="text-slate-400 text-sm">Email: budi@example.com</p>
              <p className="text-slate-400 text-sm">Phone: +62 812 3456 7890</p>
              <p className="text-slate-400 text-sm">Address: Sector 7, Jakarta</p>
            </div>
          </div>
        </div>
      );
    }

    // 3. DEFAULT / MINIMALIST / NATURE / CUTE / LUXURY / EDITORIAL ETC
    return (
      <div className="pt-28 pb-24 bg-gray-50 text-gray-900 min-h-screen font-sans">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Profil Pelanggan</h1>
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center font-bold text-xl text-gray-700">
                BS
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Budi Santoso</h2>
                <p className="text-xs text-gray-500">Member Aktif sejak 2026</p>
              </div>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-gray-400" /> budi@example.com</div>
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-gray-400" /> +62 812 3456 7890</div>
              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-gray-400" /> Jl. Sudirman No 123, Jakarta</div>
            </div>
            <button className="px-6 py-2.5 bg-black text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition">
              Edit Informasi
            </button>
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
