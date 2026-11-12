import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { House, LayoutGrid, MessageCircleQuestion, Route, ShoppingBag } from 'lucide-react';
import { scrollToLandingSection } from '../../utils/scroll';
import { useLanguage } from '../../contexts/LanguageContext';

const SECTION_IDS = ['hero', 'produk', 'cara-kerja', 'fitur', 'faq'] as const;
type SectionId = (typeof SECTION_IDS)[number];

/** Jarak dari atas layar (px) tempat sebuah bagian dianggap sedang dibaca. */
const ACTIVE_OFFSET = 130;

/**
 * Navigasi bawah khusus HP: kapsul melayang dengan menu bagian landing page.
 * Tombol daftar/masuk tetap ada di menu navbar atas dan form hero.
 */
export const LandingBottomNav: React.FC = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<SectionId>('hero');

  // Tandai menu sesuai bagian yang sedang terlihat saat halaman digulir.
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY + ACTIVE_OFFSET;
      const current = [...SECTION_IDS].reverse().find((id) => {
        const el = document.getElementById(id);
        return el ? position >= el.offsetTop : false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: SectionId; label: string; icon: typeof House }[] = [
    { id: 'hero', label: t('landing_nav_home', 'Beranda'), icon: House },
    { id: 'produk', label: t('landing_nav_product', 'Produk'), icon: ShoppingBag },
    { id: 'cara-kerja', label: t('landing_nav_how_it_works', 'Cara Kerja'), icon: Route },
    { id: 'fitur', label: t('landing_nav_features', 'Fitur'), icon: LayoutGrid },
    { id: 'faq', label: t('landing_nav_faq', 'FAQ'), icon: MessageCircleQuestion },
  ];

  const handleNavClick = (id: SectionId) => {
    setActiveSection(id);
    scrollToLandingSection(id, 0);
  };

  return (
    <nav
      id="landing-mobile-bottom-nav"
      aria-label={t('landing_mobile_nav_label', 'Navigasi menu')}
      className="fixed inset-x-3 z-40 lg:hidden font-sans select-none bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="mx-auto flex max-w-md items-center gap-1 rounded-full border border-white/70 bg-white/85 p-1.5 shadow-[0_12px_32px_-8px_rgba(102,0,14,0.28),0_2px_6px_rgba(36,26,26,0.08)] backdrop-blur-xl">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => handleNavClick(id)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative flex w-full min-h-[52px] flex-col items-center justify-center gap-1 rounded-full px-1 cursor-pointer transition-colors duration-200 active:scale-95 ${
                  isActive ? 'text-white' : 'text-[#706866] hover:text-[#241A1A]'
                }`}
              >
                {/* Kapsul aktif yang berpindah halus antar menu */}
                {isActive && (
                  <motion.span
                    layoutId="landingBottomNavActive"
                    className="absolute inset-0 rounded-full bg-[#66000E] shadow-[0_6px_14px_-4px_rgba(102,0,14,0.55)]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="relative w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                <span className={`relative text-[10px] leading-none tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
