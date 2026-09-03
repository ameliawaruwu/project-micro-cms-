import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  Play,
  ChevronRight,
  LogIn,
} from 'lucide-react';
import { scrollToLandingSection } from '../../utils/scroll';
import { DemoPreviewModal } from './DemoPreviewModal';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';

interface LandingNavbarProps {
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onLaunchDemo: () => void;
  onViewStorefrontDemo?: () => void;
  onNavigateHome?: () => void;
  isAuthenticated?: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  activeTab = 'hero',
  onSelectTab,
  onNavigateLogin,
  onNavigateRegister,
  onLaunchDemo,
  onNavigateHome,
  isAuthenticated = false,
}) => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(activeTab);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  useEffect(() => {
    setActiveSection(activeTab);
  }, [activeTab]);

  // Track scroll for subtle shadow & sticky behavior & active section
  useEffect(() => {
    const sectionIds = ['hero', 'produk', 'cara-kerja', 'fitur', 'faq'];

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const scrollPosition = window.scrollY + 100;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    if (onSelectTab) {
      onSelectTab(id);
    }
    scrollToLandingSection(id, 0);
  };

  const handlePrimaryRegisterClick = () => {
    setIsRegisterLoading(true);
    setTimeout(() => {
      setIsRegisterLoading(false);
      onNavigateRegister();
    }, 200);
  };

  const navItems = [
    { id: 'produk', label: t('landing_nav_product', 'Produk') },
    { id: 'cara-kerja', label: t('landing_nav_how_it_works', 'Cara Kerja') },
    { id: 'fitur', label: t('landing_nav_features', 'Fitur') },
    { id: 'faq', label: t('landing_nav_faq', 'FAQ') },
  ];

  return (
    <>
      <header
        id="kroombox-landing-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white/95 backdrop-blur-md border-b ${
          isScrolled
            ? 'border-[#E5E0DD] shadow-[0_2px_12px_rgba(36,26,26,0.06)] h-[64px] sm:h-[68px]'
            : 'border-[#E5E0DD] h-[68px] sm:h-[72px]'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* 1. Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveSection('hero');
                scrollToLandingSection('hero', 0);
                if (onNavigateHome) onNavigateHome();
              }}
              className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer text-left bg-transparent border-0 p-0 focus:outline-none shrink-0"
              title="Kroombox"
              aria-label="Kroombox"
            >
              {/* Dark Burgundy Logo Icon (#66000E) */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#66000E] flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:bg-[#801010] transition-colors">
                <span className="font-bold text-base sm:text-lg text-white select-none">K</span>
              </div>

              {/* Brand Typography & UMKM Badge */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg text-[#241A1A] tracking-tight group-hover:text-[#66000E] transition-colors font-sans">
                  Kroombox
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] text-[10px] font-semibold tracking-wide border border-[#E8DDDE] leading-tight select-none">
                  UMKM
                </span>
              </div>
            </button>
          </div>

          {/* 2. Desktop Navigation Center Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-[14px] font-medium text-[#706866]">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative min-h-[42px] px-3.5 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
                    isActive
                      ? 'text-[#66000E] font-semibold bg-[#FAF7F7]'
                      : 'hover:text-[#66000E] hover:bg-[#FAF7F7]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1.5 left-3.5 right-3.5 h-[2px] bg-[#66000E] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* 3. Desktop Actions & Language Switcher */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 shrink-0">
            
            {/* Language Switch Button */}
            <LanguageSwitchButton compact />

            {/* Login Link if not authenticated */}
            <button
              onClick={onNavigateLogin}
              className="px-3.5 py-2 rounded-xl text-[14px] font-semibold text-[#66000E] hover:bg-[#F5E8EA] transition-colors cursor-pointer"
            >
              {t('landing_login', 'Masuk Akun')}
            </button>

            {/* Secondary CTA: [ ▶ Lihat Demo ] (Subtle Outlined) */}
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="group min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F8F6] border border-[#E5E0DD] hover:border-[#66000E] text-[13.5px] font-medium text-[#241A1A] hover:text-[#66000E] transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-2xs active:scale-[0.98]"
              title={t('landing_view_demo', 'Lihat Demo')}
            >
              <div className="w-5 h-5 rounded-full bg-[#F5E8EA] group-hover:bg-[#66000E] flex items-center justify-center transition-colors">
                <Play className="w-2.5 h-2.5 fill-[#66000E] text-[#66000E] group-hover:fill-white group-hover:text-white transition-colors translate-x-0.2" />
              </div>
              <span>{t('landing_view_demo', 'Lihat Demo')}</span>
            </button>

            {/* Primary CTA: [ Mulai Gratis → ] (Dominant Burgundy Button) */}
            <button
              onClick={handlePrimaryRegisterClick}
              disabled={isRegisterLoading}
              className="group min-h-[44px] px-4.5 py-2.5 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white text-[14px] font-medium transition-all duration-200 shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer active:scale-[0.97] border-0 shrink-0"
            >
              <span>{isRegisterLoading ? t('saving', 'Memulai...') : t('landing_start_free', 'Mulai Gratis')}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>

          {/* 4. Mobile & Tablet Header Controls (< 1024px) */}
          <div className="flex items-center gap-2 shrink-0 lg:hidden">
            
            {/* Language Switch Button on Mobile Header */}
            <LanguageSwitchButton compact className="scale-90 origin-right" />

            {/* Mobile & Tablet CTA Button */}
            <button
              onClick={handlePrimaryRegisterClick}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white text-xs font-medium transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-[0.97] shrink-0 whitespace-nowrap"
            >
              <span>{t('landing_start_free', 'Mulai Gratis')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#241A1A] hover:text-[#66000E] hover:bg-[#FAF7F7] active:bg-[#FAF7F7] transition-colors cursor-pointer border border-[#E5E0DD] shrink-0"
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu (< 1024px) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#241A1A]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Full-width Dropdown Drawer in White */}
          <div className="fixed top-[64px] sm:top-[68px] inset-x-0 bg-white border-b border-[#E5E0DD] shadow-xl z-50 p-5 sm:p-6 animate-in slide-in-from-top-3 duration-200 max-h-[calc(100vh-64px)] overflow-y-auto">
            
            {/* Header in Drawer with Language Toggle */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E5E0DD]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#241A1A]">{t('landing_main_nav', 'Navigasi Utama')}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE]">
                  Kroombox
                </span>
              </div>
              <LanguageSwitchButton compact />
            </div>

            {/* Navigation items (min-height 48px each for touch ergonomics) */}
            <div className="divide-y divide-[#E5E0DD]/60">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full min-h-[48px] flex items-center justify-between py-3 text-left font-medium text-[15px] transition cursor-pointer ${
                      isActive ? 'text-[#66000E] font-bold' : 'text-[#241A1A] hover:text-[#66000E]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#66000E]" />}
                      {item.label}
                    </span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#66000E]' : 'text-[#706866]'}`} />
                  </button>
                );
              })}
            </div>

            {/* Subtle Divider */}
            <div className="my-4 border-t border-[#E5E0DD]" />

            {/* Action Buttons in exact priority order */}
            <div className="space-y-2.5 pt-1">
              
              {/* Login Button in mobile drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateLogin();
                }}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl border border-[#E5E0DD] text-[#66000E] font-semibold text-[15px] flex items-center justify-center gap-2 bg-[#FAF7F7] hover:bg-[#F5E8EA] transition cursor-pointer active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('landing_login', 'Masuk Akun')}</span>
              </button>

              {/* Secondary: Lihat Demo */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsDemoModalOpen(true);
                }}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl border border-[#E5E0DD] text-[#241A1A] font-medium text-[15px] flex items-center justify-center gap-2.5 bg-white hover:bg-[#F8F8F6] hover:border-[#66000E] hover:text-[#66000E] transition cursor-pointer active:scale-[0.98] shadow-2xs"
              >
                <Play className="w-4 h-4 fill-[#66000E] text-[#66000E]" />
                <span>{t('landing_view_demo', 'Lihat Demo')} (1 Min)</span>
              </button>

              {/* Primary Full-width Action: Mulai Gratis */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateRegister();
                }}
                className="w-full h-[48px] py-2.5 px-4 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-medium text-[15px] shadow-sm flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.97]"
              >
                <span>{t('landing_start_free', 'Mulai Gratis')}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Interactive 1-Minute Demo Preview Modal */}
      <DemoPreviewModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onLaunchFullDemo={() => {
          setIsDemoModalOpen(false);
          onLaunchDemo();
        }}
        onNavigateRegister={() => {
          setIsDemoModalOpen(false);
          onNavigateRegister();
        }}
      />
    </>
  );
};
