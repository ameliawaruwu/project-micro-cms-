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
import { KroomifyLogo } from '../common/KroomifyLogo';

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
        id="kroomify-landing-header"
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
              title="Kroomify"
              aria-label="Kroomify"
            >
              <KroomifyLogo size="md" />
            </button>
          </div>

          {/* 2. Desktop Navigation Center Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[14px] font-medium text-[#706866]">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`transition-colors cursor-pointer text-[14px] p-0 bg-transparent border-0 focus:outline-none ${
                    isActive
                      ? 'text-[#66000E] font-bold'
                      : 'text-[#706866] hover:text-[#66000E] font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 3. Desktop Actions & Language Switcher */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5 shrink-0">
            
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
                className="text-[14px] font-semibold text-[#66000E] hover:text-[#801010] transition-colors cursor-pointer px-2 py-1.5 bg-transparent border-0 focus:outline-none"
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
                  className={`w-full py-2.5 px-3 text-left text-[15px] transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'text-[#66000E] font-bold'
                      : 'text-[#5F5652] hover:text-[#66000E] font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-[#E5E0DD] flex flex-col gap-2.5">
              
              {/* Language Switch Row */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#FAF7F7] rounded-xl border border-[#E5E0DD]">
                <span className="text-xs font-semibold text-[#5F5652]">Bahasa / Language:</span>
                <LanguageSwitchButton compact />
              </div>

              {/* Login Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateLogin();
                }}
                className="w-full py-2.5 px-4 text-[#66000E] font-semibold text-[15px] flex items-center justify-center gap-2 hover:text-[#801010] transition cursor-pointer"
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
