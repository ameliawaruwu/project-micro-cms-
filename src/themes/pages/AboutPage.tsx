import React from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { Award, ShieldCheck, Heart, Sparkles, Compass } from 'lucide-react';

interface AboutPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  onNavigate?: (pageId: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ themeData, themeId: propThemeId, store, onNavigate }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const storeName = store?.name || 'Toko Kami';
  const storeDesc = store?.description || 'Kami hadir dengan dedikasi tinggi untuk menghadirkan produk-produk berkualitas prima dan pelayanan terbaik bagi Anda.';

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderAboutContent = () => {
    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-black text-white p-12 border-8 border-black shadow-[16px_16px_0px_rgba(255,0,0,1)] mb-16">
              <span className="px-4 py-2 bg-[#FF0000] font-black text-white uppercase text-sm border-2 border-white inline-block mb-4">
                VISI & MISI KAMI
              </span>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6">
                TENTANG {storeName}
              </h1>
              <p className="text-2xl font-bold uppercase tracking-widest text-yellow-300 leading-relaxed">
                {storeDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'KUALITAS UNGGUL', text: 'Produk dijamin menggunakan bahan terbaik tanpa kompromi.' },
                { title: 'DESAIN ORISINIL', text: 'Karakter desain kuat dan penuh percaya diri.' },
                { title: 'GARANSI 100%', text: 'Kepuasan Anda adalah komitmen utama kami.' },
              ].map((item, i) => (
                <div key={i} className="bg-yellow-300 border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-black text-2xl uppercase mb-2">{item.title}</h3>
                  <p className="font-bold text-sm uppercase">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 2. EDITORIAL THEME
    if (activeThemeId === 'editorial') {
      return (
        <div className="pt-32 pb-32 bg-[#FAF7F7] text-[#241A1A] min-h-screen">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="text-xs uppercase tracking-[0.4em] text-[#706866] block mb-4 font-serif italic">Our Heritage & Story</span>
            <h1 className="text-5xl lg:text-7xl font-normal font-serif mb-8">{storeName}</h1>
            <div className="w-20 h-px bg-[#241A1A]/20 mx-auto mb-12"></div>
            <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-[#706866] mb-16">
              "{storeDesc}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left border-t border-[#241A1A]/10 pt-16">
              <div>
                <h3 className="font-serif text-2xl mb-4">Filosofi Desain</h3>
                <p className="font-serif text-sm leading-loose text-[#706866]">
                  Setiap karya yang lahir dibuat dengan mengedepankan estetika klasik yang tak lekang oleh waktu, keahlian tangan tinggi, dan detail yang sempurna.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-2xl mb-4">Komitmen Berkelanjutan</h3>
                <p className="font-serif text-sm leading-loose text-[#706866]">
                  Kami berjanji untuk senantiasa menjaga standar etika produksi dan bahan berkualitas demi kepuasan pelanggan dalam setiap helai dan bentuk produk.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-5xl mx-auto px-6">
            <div className="border-b border-cyan-500/20 pb-8 mb-12 text-center">
              <span className="text-xs text-cyan-400 uppercase tracking-widest">[ENTITY_PROFILE_SYS]</span>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent mt-2">
                ABOUT {storeName.toUpperCase()}
              </h1>
            </div>
            <div className="bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-md mb-12">
              <p className="text-cyan-300 text-lg leading-relaxed">{storeDesc}</p>
            </div>
          </div>
        </div>
      );
    }

    // 4. NATURE THEME
    if (activeThemeId === 'nature') {
      return (
        <div className="pt-28 pb-24 bg-[#F4F7F4] text-[#1B3B2B] min-h-screen">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="px-4 py-1.5 bg-[#2D5A27]/10 text-[#2D5A27] rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-3">
              🌿 Tentang Toko
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-[#1B3B2B]">{storeName}</h1>
            <p className="text-xl text-[#1B3B2B]/80 leading-relaxed mb-12">{storeDesc}</p>
          </div>
        </div>
      );
    }

    // 5. CUTE THEME
    if (activeThemeId === 'cute') {
      return (
        <div className="pt-28 pb-24 bg-[#FFF5F8] text-[#4A154B] min-h-screen">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="px-4 py-2 bg-pink-200 text-pink-700 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-3">
              💖 Cerita Kita
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 text-[#4A154B]">Tentang {storeName} ✨</h1>
            <div className="bg-white rounded-3xl p-8 shadow-lg shadow-pink-100 border border-pink-100">
              <p className="text-lg text-[#4A154B] leading-relaxed">{storeDesc}</p>
            </div>
          </div>
        </div>
      );
    }

    // 6. DEFAULT / MINIMALIST / LUXURY / CREATIVE / PROFESSIONAL / ELEGANT / FASHION
    return (
      <div className="pt-32 pb-24 bg-white text-[#1A1A1A] min-h-screen">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">Tentang {storeName}</h1>
          <div className="w-12 h-0.5 bg-black mx-auto"></div>
          <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">{storeDesc}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {CustomNavbar ? <CustomNavbar /> : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderAboutContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
