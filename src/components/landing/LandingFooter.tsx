import React from 'react';
import { Mail } from 'lucide-react';
import { scrollToLandingSection } from '../../utils/scroll';
import { useLanguage } from '../../contexts/LanguageContext';
import { KroomifyLogo } from '../common/KroomifyLogo';
import { SUPPORT_EMAIL, supportMailtoLink } from '../../config/contact';

/** Footer landing page: hanya berisi menu yang memang ada di halaman ini. */
export const LandingFooter: React.FC = () => {
  const { t } = useLanguage();

  // Sama dengan menu di navbar agar setiap tautan selalu menuju bagian yang ada.
  const menuItems = [
    { id: 'hero', label: t('landing_nav_home', 'Beranda') },
    { id: 'produk', label: t('landing_nav_product', 'Produk') },
    { id: 'cara-kerja', label: t('landing_nav_how_it_works', 'Cara Kerja') },
    { id: 'fitur', label: t('landing_nav_features', 'Fitur') },
    { id: 'faq', label: t('landing_nav_faq', 'FAQ') },
  ];

  return (
    <footer className="bg-[#FAF7F6] border-t border-[#E6DDDA] pt-12 sm:pt-16 pb-10 text-[#241A1A] font-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#E6DDDA]">
          {/* Logo & deskripsi singkat */}
          <div className="sm:col-span-2 md:col-span-6 space-y-3.5">
            <button
              type="button"
              onClick={() => scrollToLandingSection('hero', 0)}
              className="flex items-center cursor-pointer bg-transparent border-0 p-0"
              aria-label={t('footer_back_to_top', 'Kembali ke atas halaman LapakQ')}
            >
              <KroomifyLogo size="lg" />
            </button>
            <p className="text-[#6B6260] leading-relaxed text-[13px] max-w-sm">
              {t('footer_brand_desc', 'Kelola produk, pesanan, dan pembayaran tanpa ribet.')}
            </p>
          </div>

          {/* Menu halaman */}
          <nav className="md:col-span-3 space-y-3" aria-label={t('footer_col_menu', 'Menu')}>
            <p className="font-bold text-xs uppercase tracking-wider">{t('footer_col_menu', 'Menu')}</p>
            <ul className="space-y-2 text-[13px]">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollToLandingSection(item.id, 0)}
                    className="text-left hover:text-[#66000E] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kontak bantuan */}
          <div className="md:col-span-3 space-y-3">
            <p className="font-bold text-xs uppercase tracking-wider">{t('footer_col_contact', 'Kontak')}</p>
            <p className="text-[13px] text-[#6B6260]">
              {t('footer_contact_desc', 'Ada pertanyaan? Kirim email ke kami.')}
            </p>
            <a
              href={supportMailtoLink(t('footer_email_subject', 'Bantuan LapakQ'))}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#66000E] hover:text-[#801010] transition-colors break-all"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{SUPPORT_EMAIL}</span>
            </a>
          </div>
        </div>

        <p className="pt-6 sm:pt-8 text-xs text-[#6B6260] text-center sm:text-left">
          {t('footer_copyright', '© 2026 LapakQ. Dibuat untuk UMKM Indonesia.')}
        </p>
      </div>
    </footer>
  );
};
