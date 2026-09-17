import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingBottomNav } from '../components/landing/LandingBottomNav';
import { LandingHero } from '../components/landing/LandingHero';
import { ProductShowcase } from '../components/landing/ProductShowcase';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { FAQSection } from '../components/landing/FAQSection';
import { FinalCTASection } from '../components/landing/FinalCTASection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { scrollToLandingSection } from '../utils/scroll';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
  onNavigateDashboard?: () => void;
  onLaunchDemo: () => void;
  onViewStorefrontDemo: () => void;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
  onNavigateDashboard,
  onLaunchDemo,
  onViewStorefrontDemo,
  isAuthenticated = false,
}) => {
  const scrollToHowItWorks = () => {
    scrollToLandingSection('cara-kerja', 0);
  };

  return (
    <div className="min-h-screen bg-white text-[#241A1A] font-sans selection:bg-[#F5E8EA] selection:text-[#66000E] pb-16 sm:pb-20 lg:pb-0 scroll-smooth">
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

      {/* 6. Final Call to Action Section */}
      <FinalCTASection
        onNavigateRegister={onNavigateRegister}
        onLaunchDemo={onLaunchDemo}
      />

      {/* Footer */}
      <LandingFooter
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={onNavigateRegister}
      />

      {/* Mobile Bottom Navigation with real-time scroll tracking and smooth jump */}
      <LandingBottomNav
        onNavigateLogin={onNavigateLogin}
        onNavigateRegister={onNavigateRegister}
        onLaunchDemo={onLaunchDemo}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};




