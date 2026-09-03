import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Home,
  Package,
  Sparkles,
  Layers,
  HelpCircle,
  ArrowRight,
  Store,
} from 'lucide-react';
import { scrollToLandingSection } from '../../utils/scroll';
import { useLanguage } from '../../contexts/LanguageContext';

interface LandingBottomNavProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onLaunchDemo?: () => void;
  isAuthenticated?: boolean;
}

export const LandingBottomNav: React.FC<LandingBottomNavProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  isAuthenticated = false,
}) => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Track active section as user scrolls continuously
  useEffect(() => {
    const sectionIds = ['hero', 'produk', 'cara-kerja', 'fitur', 'faq'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 130;
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

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    scrollToLandingSection(id, 0);
  };

  const navItems = [
    {
      id: 'hero',
      label: t('landing_nav_home', 'Beranda'),
      icon: Home,
      action: () => handleNavClick('hero'),
    },
    {
      id: 'produk',
      label: t('landing_nav_product', 'Produk'),
      icon: Package,
      action: () => handleNavClick('produk'),
    },
    {
      id: 'cara-kerja',
      label: t('landing_nav_how_it_works', 'Cara Kerja'),
      icon: Sparkles,
      action: () => handleNavClick('cara-kerja'),
    },
    {
      id: 'fitur',
      label: t('landing_nav_features', 'Fitur'),
      icon: Layers,
      action: () => handleNavClick('fitur'),
    },
    {
      id: 'faq',
      label: t('landing_nav_faq', 'FAQ'),
      icon: HelpCircle,
      action: () => handleNavClick('faq'),
    },
  ];

  return (
    <nav
      id="landing-mobile-bottom-nav"
      aria-label="Navigasi Menu Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DDDE] shadow-[0_-4px_20px_rgba(36,26,26,0.08)] px-2 py-1.5 flex items-center justify-around lg:hidden font-sans select-none"
    >
      <div className="flex items-center justify-between w-full max-w-md mx-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl min-h-[50px] transition-colors duration-200 relative cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-[#66000E] font-bold'
                  : 'text-[#706866] hover:text-[#241A1A] font-medium'
              }`}
              title={item.label}
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomNavPill"
                  className="absolute inset-0 bg-[#FAF7F7] border border-[#E8DDDE]/60 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative z-10">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-[#66000E] stroke-[2.3] scale-110' : 'text-[#706866]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none relative z-10 ${
                  isActive ? 'font-bold text-[#66000E]' : 'text-[#706866]'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.span
                  layoutId="activeBottomNavDot"
                  className="w-3.5 h-0.5 bg-[#66000E] rounded-full mt-1 relative z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          );
        })}

        {/* Quick UMKM Action Button (Buat Toko / Dashboard) */}
        <button
          type="button"
          onClick={isAuthenticated ? onNavigateLogin : onNavigateRegister}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl min-h-[50px] bg-[#66000E] text-white hover:bg-[#801010] active:scale-95 transition-all shadow-xs cursor-pointer ml-1 relative z-10"
          title={isAuthenticated ? 'Ke Dashboard Toko' : 'Daftar Toko Gratis'}
          aria-label={isAuthenticated ? 'Dashboard Toko' : 'Daftar Toko'}
        >
          <div className="flex items-center justify-center w-5 h-5">
            {isAuthenticated ? (
              <Store className="w-4 h-4 text-white" />
            ) : (
              <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
            )}
          </div>
          <span className="text-[10px] font-bold text-white mt-1 leading-none whitespace-nowrap">
            {isAuthenticated ? 'Toko Saya' : 'Mulai'}
          </span>
        </button>
      </div>
    </nav>
  );
};

