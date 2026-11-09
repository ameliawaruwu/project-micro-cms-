import React from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { useCmsStore } from '../../cms/useCmsStore';
import { getDeviceClass } from '../../utils/responsivePreview';

interface ContactPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  onNavigate?: (pageId: string) => void;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export const ContactPage: React.FC<ContactPageProps> = ({ themeData, themeId: propThemeId, store, onNavigate, deviceMode }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const isMobile = deviceMode === 'mobile';
  const isTablet = deviceMode === 'tablet';
  const gridCols2Class = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-1',
    desktop: 'grid-cols-2',
    fallback: 'grid-cols-1 md:grid-cols-2',
  });
  const liveStoreInfo = useCmsStore((state) => state.storeInfo);
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const storeName = liveStoreInfo?.name || store?.name || 'Toko Kami';
  const storeDesc = liveStoreInfo?.description || store?.description || '';

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const navbarOptions = {
    heading: storeName,
    subheading: storeDesc,
    description: storeDesc,
    subtitle: storeDesc,
    tagline: storeDesc,
    ...((headerSection as any)?.options || (headerSection as any)?.settings)
  };

  const footerOptions = {
    heading: storeName,
    subheading: storeDesc,
    description: storeDesc,
    subtitle: storeDesc,
    ...((footerSection as any)?.options || (footerSection as any)?.settings)
  };

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
    if (activeThemeId === 'futuristic') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-8">
              <span className="text-xs text-[var(--sf-primary)] uppercase tracking-widest">[DISPATCH_COMMUNICATION]</span>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--sf-primary)] to-[color-mix(in_srgb,var(--sf-primary)_55%,white)] bg-clip-text text-transparent mt-2">
                CONTACT MATRIX
              </h1>
            </div>
            <div className="bg-slate-900/60 border border-[var(--sf-primary-border)] rounded-3xl p-8 backdrop-blur-md space-y-4">
              <input type="text" placeholder="FULL_NAME" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[var(--sf-primary)] text-sm focus:border-[var(--sf-primary-border)]" />
              <input type="email" placeholder="EMAIL_ADDRESS" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[var(--sf-primary)] text-sm focus:border-[var(--sf-primary-border)]" />
              <textarea placeholder="TRANSMISSION_DATA..." rows={4} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-[var(--sf-primary)] text-sm focus:border-[var(--sf-primary-border)]" />
              <button className="w-full py-4 bg-gradient-to-r from-[var(--sf-primary)] to-[color-mix(in_srgb,var(--sf-primary)_55%,white)] rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                TRANSMIT MESSAGE ⚡
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. DEFAULT / MINIMALIST / NATURE / CUTE / LUXURY / EDITORIAL ETC
    return (
      <div className="pt-28 pb-24 bg-[var(--sf-subtle)] text-[var(--sf-text)] min-h-screen font-sans">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[var(--sf-card)] p-8 md:p-12 rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-sm space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-[var(--sf-text)]">Hubungi Kami</h1>
              <p className="text-sm text-[var(--sf-muted)]">Ada pertanyaan? Tim kami siap membantu Anda kapan saja.</p>
            </div>
            <div className={`grid ${gridCols2Class} gap-8`}>
              <div className="space-y-4">
                <input type="text" placeholder="Nama Anda" className="w-full px-4 py-3 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="email" placeholder="Email Anda" className="w-full px-4 py-3 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <textarea placeholder="Pesan Anda..." rows={4} className="w-full px-4 py-3 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <button className="w-full py-3.5 bg-[var(--sf-primary)] text-white font-bold text-sm rounded-[var(--sf-radius)] hover:bg-[var(--sf-primary)] transition shadow-md">
                  Kirim Pesan
                </button>
              </div>
              <div className="bg-[var(--sf-subtle)] p-6 rounded-[var(--sf-radius)] space-y-4 text-sm text-[var(--sf-text-soft)] border border-[var(--sf-border)]">
                <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-[var(--sf-muted)]" /> support@{store?.name?.toLowerCase()?.replace(/\s+/g, '') || 'toko'}.com</div>
                <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-[var(--sf-muted)]" /> +62 812 3456 7890</div>
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[var(--sf-muted)]" /> Jakarta, Indonesia</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--sf-page)] text-[var(--sf-text)]">
      {CustomNavbar ? (
        <CustomNavbar sectionOptions={navbarOptions} />
      ) : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderContent()}</div>

      {CustomFooter ? (
        <CustomFooter sectionOptions={footerOptions} />
      ) : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
