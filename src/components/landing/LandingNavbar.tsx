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
  onNavigateDashboard?: () => void;
  isAuthenticated?: boolean;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  activeTab = 'hero',
  onSelectTab,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateHome,
  onNavigateDashboard,
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

            {/* Login / Dashboard Link */}
            {isAuthenticated ? (
              <button
                onClick={onNavigateDashboard}
                className="min-h-[42px] px-4 py-2 rounded-xl text-[14px] font-semibold text-white bg-[#66000E] hover:bg-[#801010] transition-colors cursor-pointer border border-[#66000E]"
              >
                {t('landing_dashboard', 'Ke Dashboard')}
              </button>
            ) : (
              <button
                onClick={onNavigateLogin}
                className="min-h-[42px] px-4 py-2 rounded-xl text-[14px] font-semibold text-[#66000E] bg-[#F5E8EA] hover:bg-[#ebd3d6] transition-colors cursor-pointer border border-[#E8DDDE]"
              >
                {t('landing_login', 'Masuk Akun')}
              </button>
            )}
          </div>

          {/* 4. Mobile & Tablet Header Controls (< 1024px) */}
          <div className="flex items-center gap-2 shrink-0 lg:hidden">
            
            {/* Language Switch Button on Mobile Header */}
            <LanguageSwitchButton compact className="scale-90 origin-right" />

            {/* Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-[#241A1A] hover:bg-[#FAF7F7] border border-[#E5E0DD] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#241A1A]" /> : <Menu className="w-5 h-5 text-[#241A1A]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-[64px] sm:top-[68px] inset-0 z-40 lg:hidden border-b border-[#E5E0DD] bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full min-h-[46px] text-left px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#F5E8EA] text-[#66000E] font-semibold'
                      : 'text-[#5F5652] hover:bg-[#FAF7F7] hover:text-[#66000E]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#66000E]" />}
                </button>
              );
            })}

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-[#E5E0DD] flex flex-col gap-2.5">
              
              {/* Language Switch Row */}
              <div className="flex items-center justify-between px-2 py-1 bg-[#FAF7F7] rounded-xl border border-[#E5E0DD]">
                <span className="text-xs font-semibold text-[#5F5652]">Bahasa / Language:</span>
                <LanguageSwitchButton compact />
              </div>

              {/* Login Button */}
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
    </>
  );
};
