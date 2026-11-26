import React from 'react';
import { MotionConfig } from 'motion/react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingBottomNav } from '../components/landing/LandingBottomNav';
import { LandingHero } from '../components/landing/LandingHero';
import { ProductShowcase } from '../components/landing/ProductShowcase';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { FAQSection } from '../components/landing/FAQSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { scrollToLandingSection } from '../utils/scroll';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  /** Membuka halaman daftar dengan nama toko yang diketik di hero. */
  onRegisterWithStoreName?: (storeName: string) => void;
  onNavigateDashboard?: () => void;
  onLaunchDemo: () => void;
  onViewStorefrontDemo: () => void;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onRegisterWithStoreName,
  onNavigateDashboard,
  onLaunchDemo,
  onViewStorefrontDemo,
  isAuthenticated = false,
}) => {
  const scrollToHowItWorks = () => {
    scrollToLandingSection('cara-kerja', 0);
  };

  return (
    // reducedMotion="user": gerak transform dimatikan bila OS meminta "kurangi animasi".
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-[#241A1A] font-sans selection:bg-[#F5E8EA] selection:text-[#66000E] pb-24 lg:pb-0 scroll-smooth">
        {/* Sticky Navigation Bar */}
        <LandingNavbar
          onNavigateHome={() => scrollToLandingSection('hero', 0)}
          onNavigateLogin={onNavigateLogin}
          onNavigateRegister={onNavigateRegister}
          onNavigateDashboard={onNavigateDashboard}
          onLaunchDemo={onLaunchDemo}
          onViewStorefrontDemo={onViewStorefrontDemo}
          isAuthenticated={isAuthenticated}
        />

        {/* 1. Beranda / Hero Section */}
        <LandingHero
          onNavigateRegister={onNavigateRegister}
          onRegisterWithStoreName={onRegisterWithStoreName}
          onNavigateLogin={onNavigateLogin}
          onLaunchDemo={onLaunchDemo}
          onScrollToHowItWorks={scrollToHowItWorks}
          isAuthenticated={isAuthenticated}
        />

        {/* 2. Produk Section */}
        <ProductShowcase
          onNavigateRegister={onNavigateRegister}
          onLaunchDemo={onLaunchDemo}
        />

        {/* 3. Cara Kerja Section */}
        <HowItWorksSection onNavigateRegister={onNavigateRegister} />

        {/* 4. Fitur Section */}
        <FeaturesSection />

        {/* 5. FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <LandingFooter />

        {/* Navigasi bawah melayang khusus HP */}
        <LandingBottomNav />
      </div>
    </MotionConfig>
  );
};




