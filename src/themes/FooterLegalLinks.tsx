import React from 'react';
import { getFooterLegalLinks } from './navMenu';

interface FooterLegalLinksProps {
  sectionOptions?: any;
  className?: string;
}

/**
 * Tautan footer yang ditempel di samping teks hak cipta footer tema: "Lacak Pesanan" (selalu ada,
 * agar pembeli tanpa akun bisa memantau pesanannya di semua template) lalu tautan legal
 * (Kebijakan Privasi, Syarat & Ketentuan). Dirender sebagai <span> agar aman diletakkan di dalam
 * <p>, dan mewarisi gaya teksnya.
 */
export const FooterLegalLinks: React.FC<FooterLegalLinksProps> = ({ sectionOptions = {}, className = '' }) => {
  const links = getFooterLegalLinks(sectionOptions);

  return (
    <span className={`inline-flex flex-wrap justify-center gap-x-3 ml-3 ${className}`}>
      <a href="/lacak" className="underline underline-offset-2 hover:opacity-80 transition-opacity">
        Lacak Pesanan
      </a>
      {links.map((link) => {
        const isExternal = /^https?:\/\//i.test(link.href);
        return (
          <a
            key={link.key}
            href={link.href}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {link.label}
          </a>
        );
      })}
    </span>
  );
};
