import React, { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { scrollToLandingSection } from '../../utils/scroll';
import { useLanguage } from '../../contexts/LanguageContext';

interface LandingFooterProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onNavigateLogin,
  onNavigateRegister,
}) => {
  const { t } = useLanguage();
  // Mobile accordion active state: only one open at a time
  const [openMobileAccordion, setOpenMobileAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenMobileAccordion((prev) => (prev === section ? null : section));
  };

  const scrollToSection = (id: string) => {
    scrollToLandingSection(id, 0);
  };

  return (
    <footer className="bg-[#F5F1E8] text-[#6B6260] text-xs pt-12 sm:pt-14 pb-10 border-t border-[#E6DDDA] font-sans">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP 5-COLUMN / MOBILE ACCORDION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#E6DDDA]">
          
          {/* Brand Column (Col 1-4 on Desktop) */}
          <div className="md:col-span-4 space-y-3.5 text-left">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 text-left cursor-pointer group bg-transparent border-0 p-0 focus:outline-none"
              title="Kembali ke Halaman Utama"
              aria-label="Kembali ke Halaman Utama Kroombox"
            >
              <div className="w-8 h-8 rounded-xl bg-[#66000E] flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
                K
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-[#241A1A] tracking-tight group-hover:text-[#66000E] transition-colors leading-none">
                  Kroombox
                </span>
                <span className="text-[11px] text-[#6B6260] mt-0.5">
                  {t('footer_brand_tagline', 'Platform Toko Online UMKM Indonesia')}
                </span>
              </div>
            </button>

            <p className="text-[#6B6260] leading-relaxed text-xs sm:text-[13px] max-w-sm">
              {t('footer_brand_desc', 'Kelola produk, pesanan, dan pembayaran tanpa ribet.')}
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E6DDDA] text-[11px] font-semibold text-[#241A1A] shadow-2xs">
                {t('footer_nation_pride', '🇮🇩 100% Karya Anak Bangsa')}
              </span>
            </div>
          </div>

          {/* DESKTOP COLUMNS (Visible on md and up) */}
          <div className="hidden md:grid md:col-span-8 grid-cols-4 gap-6 lg:gap-8">
            
            {/* COLUMN 2: PRODUK */}
            <div className="space-y-3">
              <p className="font-bold text-[#241A1A] text-xs uppercase tracking-wider">
                {t('footer_col_product', 'Produk')}
              </p>
              <ul className="space-y-2 text-[13px]">
                <li>
                  <button
                    onClick={() => scrollToSection('produk')}
                    className="hover:text-[#66000E] transition-colors cursor-pointer text-left inline-block"
                  >
                    {t('footer_link_storefront', 'Beranda Toko')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('fitur')}
                    className="hover:text-[#66000E] transition-colors cursor-pointer text-left inline-block"
                  >
                    {t('footer_link_catalog', 'Katalog Produk')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('produk')}
                    className="hover:text-[#66000E] transition-colors cursor-pointer text-left inline-block"
                  >
                    {t('footer_link_order_mgmt', 'Manajemen Pesanan')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('fitur')}
                    className="hover:text-[#66000E] transition-colors cursor-pointer text-left inline-block"
                  >
                    {t('footer_link_shipping_qris', 'Integrasi Kurir & QRIS')}
                  </button>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: PERUSAHAAN */}
            <div className="space-y-3">
              <p className="font-bold text-[#241A1A] text-xs uppercase tracking-wider">
                {t('footer_col_company', 'Perusahaan')}
              </p>
              <ul className="space-y-2 text-[13px]">
                <li>
                  <a href="#tentang" className="hover:text-[#66000E] transition-colors inline-block">
                    {t('footer_link_about', 'Tentang Kami')}
                  </a>
                </li>
                <li>
                  <a href="#blog" className="hover:text-[#66000E] transition-colors inline-block">
                    {t('footer_link_blog', 'Blog & Edukasi UMKM')}
                  </a>
                </li>
                <li>
                  <a href="#kontak" className="hover:text-[#66000E] transition-colors inline-block">
                    {t('footer_link_partner_contact', 'Kontak Kemitraan')}
                  </a>
                </li>
                <li>
                  <a href="#karir" className="hover:text-[#66000E] transition-colors inline-block">
                    {t('footer_link_career', 'Karier')}
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: BANTUAN */}
            <div className="space-y-3">
              <p className="font-bold text-[#241A1A] text-xs uppercase tracking-wider">
                {t('footer_col_help', 'Bantuan')}
              </p>
              <ul className="space-y-2 text-[13px]">
                <li>
                  <button
                    onClick={() => scrollToSection('faq')}
                    className="hover:text-[#66000E] transition-colors cursor-pointer text-left inline-block"
                  >
                    {t('footer_link_faq', 'FAQ & Tanya Jawab')}
                  </button>
                </li>
                <li>
                  <a href="#panduan" className="hover:text-[#66000E] transition-colors inline-block">
                    {t('footer_link_help_center', 'Pusat Bantuan')}
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Admin%20Kroombox,%20saya%20butuh%20bantuan"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#801010] transition-colors inline-flex items-center gap-1.5 text-[#66000E] font-bold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('footer_link_whatsapp_cs', 'WhatsApp CS 24/7')}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* COLUMN 5: LEGAL */}
            <div className="space-y-3">
              <p className="font-bold text-[#241A1A] text-xs uppercase tracking-wider">
                {t('footer_col_legal', 'Legal')}
              </p>
              <ul className="space-y-2 text-[13px]">
                <li>
                  <a href="#privasi" className="hover:text-[#66000E] transition-colors inline-block">
                    {t('footer_link_privacy', 'Kebijakan Privasi')}
                  </a>
                </li>
                <li>
                  <a href="#syarat" className="hover:text-[#66000E] transition-colors inline-block">
                    {t('footer_link_terms', 'Syarat & Ketentuan')}
                  </a>
                </li>
                <li>
                  <a href="#keamanan" className="hover:text-[#66000E] transition-colors inline-block">
                    {t('footer_link_data_security', 'Keamanan Data')}
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* MOBILE ACCORDION GROUPS (Visible on mobile screens only) */}
          <div className="block md:hidden space-y-2 pt-2 text-left">
            
            {/* Accordion 1: PRODUK */}
            <div className="border border-[#E6DDDA] rounded-xl bg-white/70 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('produk')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold transition-colors ${
                  openMobileAccordion === 'produk' ? 'text-[#66000E] bg-white' : 'text-[#241A1A]'
                }`}
              >
                <span>{t('footer_col_product', 'PRODUK').toUpperCase()}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6B6260] transition-transform duration-200 ${
                    openMobileAccordion === 'produk' ? 'rotate-180 text-[#66000E]' : ''
                  }`}
                />
              </button>
              {openMobileAccordion === 'produk' && (
                <div className="p-3.5 pt-1 bg-white border-t border-[#E6DDDA] space-y-2 text-xs">
                  <button
                    onClick={() => scrollToSection('produk')}
                    className="block w-full text-left py-1 text-[#6B6260] hover:text-[#66000E]"
                  >
                    {t('footer_link_storefront', 'Beranda Toko')}
                  </button>
                  <button
                    onClick={() => scrollToSection('fitur')}
                    className="block w-full text-left py-1 text-[#6B6260] hover:text-[#66000E]"
                  >
                    {t('footer_link_catalog', 'Katalog Produk')}
                  </button>
                  <button
                    onClick={() => scrollToSection('produk')}
                    className="block w-full text-left py-1 text-[#6B6260] hover:text-[#66000E]"
                  >
                    {t('footer_link_order_mgmt', 'Manajemen Pesanan')}
                  </button>
                  <button
                    onClick={() => scrollToSection('fitur')}
                    className="block w-full text-left py-1 text-[#6B6260] hover:text-[#66000E]"
                  >
                    {t('footer_link_shipping_qris', 'Integrasi Kurir & QRIS')}
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 2: PERUSAHAAN */}
            <div className="border border-[#E6DDDA] rounded-xl bg-white/70 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('perusahaan')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold transition-colors ${
                  openMobileAccordion === 'perusahaan' ? 'text-[#66000E] bg-white' : 'text-[#241A1A]'
                }`}
              >
                <span>{t('footer_col_company', 'PERUSAHAAN').toUpperCase()}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6B6260] transition-transform duration-200 ${
                    openMobileAccordion === 'perusahaan' ? 'rotate-180 text-[#66000E]' : ''
                  }`}
                />
              </button>
              {openMobileAccordion === 'perusahaan' && (
                <div className="p-3.5 pt-1 bg-white border-t border-[#E6DDDA] space-y-2 text-xs">
                  <a href="#tentang" className="block py-1 text-[#6B6260] hover:text-[#66000E]">
                    {t('footer_link_about', 'Tentang Kami')}
                  </a>
                  <a href="#blog" className="block py-1 text-[#6B6260] hover:text-[#66000E]">
                    {t('footer_link_blog', 'Blog & Edukasi UMKM')}
                  </a>
                  <a href="#kontak" className="block py-1 text-[#6B6260] hover:text-[#66000E]">
                    {t('footer_link_partner_contact', 'Kontak Kemitraan')}
                  </a>
                  <a href="#karir" className="block py-1 text-[#6B6260] hover:text-[#66000E]">
                    {t('footer_link_career', 'Karier')}
                  </a>
                </div>
              )}
            </div>

            {/* Accordion 3: BANTUAN */}
            <div className="border border-[#E6DDDA] rounded-xl bg-white/70 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('bantuan')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold transition-colors ${
                  openMobileAccordion === 'bantuan' ? 'text-[#66000E] bg-white' : 'text-[#241A1A]'
                }`}
              >
                <span>{t('footer_col_help', 'BANTUAN').toUpperCase()}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6B6260] transition-transform duration-200 ${
                    openMobileAccordion === 'bantuan' ? 'rotate-180 text-[#66000E]' : ''
                  }`}
                />
              </button>
              {openMobileAccordion === 'bantuan' && (
                <div className="p-3.5 pt-1 bg-white border-t border-[#E6DDDA] space-y-2 text-xs">
                  <button
                    onClick={() => scrollToSection('faq')}
                    className="block w-full text-left py-1 text-[#6B6260] hover:text-[#66000E]"
                  >
                    {t('footer_link_faq', 'FAQ & Tanya Jawab')}
                  </button>
                  <a href="#panduan" className="block py-1 text-[#6B6260] hover:text-[#66000E]">
                    {t('footer_link_help_center', 'Pusat Bantuan')}
                  </a>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%20Admin%20Kroombox,%20saya%20butuh%20bantuan"
                    target="_blank"
                    rel="noreferrer"
                    className="block py-1 text-[#66000E] font-bold"
                  >
                    {t('footer_link_whatsapp_cs', 'WhatsApp CS 24/7')}
                  </a>
                </div>
              )}
            </div>

            {/* Accordion 4: LEGAL */}
            <div className="border border-[#E6DDDA] rounded-xl bg-white/70 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion('legal')}
                className={`w-full flex items-center justify-between p-3.5 text-xs font-bold transition-colors ${
                  openMobileAccordion === 'legal' ? 'text-[#66000E] bg-white' : 'text-[#241A1A]'
                }`}
              >
                <span>{t('footer_col_legal', 'LEGAL').toUpperCase()}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#6B6260] transition-transform duration-200 ${
                    openMobileAccordion === 'legal' ? 'rotate-180 text-[#66000E]' : ''
                  }`}
                />
              </button>
              {openMobileAccordion === 'legal' && (
                <div className="p-3.5 pt-1 bg-white border-t border-[#E6DDDA] space-y-2 text-xs">
                  <a href="#privasi" className="block py-1 text-[#6B6260] hover:text-[#66000E]">
                    {t('footer_link_privacy', 'Kebijakan Privasi')}
                  </a>
                  <a href="#syarat" className="block py-1 text-[#6B6260] hover:text-[#66000E]">
                    {t('footer_link_terms', 'Syarat & Ketentuan')}
                  </a>
                  <a href="#keamanan" className="block py-1 text-[#6B6260] hover:text-[#66000E]">
                    {t('footer_link_data_security', 'Keamanan Data')}
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* BOTTOM COPYRIGHT & DISCLAIMER ROW */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-[#6B6260] text-center sm:text-left">
          <p>{t('footer_copyright', '© 2026 Kroombox. Dibuat untuk UMKM Indonesia.')}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[#6B6260]">
            <span>{t('footer_privacy_secure', 'Privasi Terjaga')}</span>
            <span>•</span>
            <span>{t('footer_server_fast_safe', 'Server Cepat & Aman')}</span>
            <span>•</span>
            <span className="text-[#66000E] font-bold">Kroombox v2.4</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

