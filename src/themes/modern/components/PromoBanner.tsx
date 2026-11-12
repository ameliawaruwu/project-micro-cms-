import React from 'react';
import { STORE_ROUTES, resolveSectionCta, resolveSectionImage } from '../../storefrontLinks';

export const ModernPromoBanner: React.FC<{ sectionOptions?: any; accentColor?: string }> = ({ sectionOptions = {}, accentColor = '#2563EB' }) => {
  const heading = sectionOptions.heading || "Diskon Spesial Minggu Ini";
  const desc = sectionOptions.description || "Dapatkan penawaran terbaik untuk produk pilihan, waktu terbatas.";
  // Tautan tombol dari merchant (disanitasi); bawaan membuka halaman promo seperti menu navbar.
  const cta = resolveSectionCta(sectionOptions, 'Lihat Promo', STORE_ROUTES.promo);
  const badge = sectionOptions.discountBadge || sectionOptions.badgeText;
  const bgImage = resolveSectionImage(sectionOptions);

  return (
    <section className="w-full px-4 md:px-8 py-6 font-['Outfit',sans-serif] bg-white">
      <div
        className="max-w-7xl mx-auto rounded-[2rem] py-14 sm:py-16 md:py-24 px-4 sm:px-6 text-center text-white relative overflow-hidden"
        style={{ backgroundColor: accentColor }}
      >
        {bgImage && <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/10"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          {badge && (
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/20 text-xs font-bold tracking-widest uppercase">{badge}</span>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-4 break-words">{heading}</h2>
          <p className="text-sm md:text-base text-white/80 mb-8">{desc}</p>
          <a
            href={cta.href}
            className="inline-block px-8 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:scale-105 transition-transform"
          >
            {cta.label}
          </a>
        </div>
      </div>
    </section>
  );
};
