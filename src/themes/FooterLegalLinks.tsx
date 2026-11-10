import React from 'react';
import { getFooterLegalLinks } from './navMenu';

interface FooterLegalLinksProps {
  sectionOptions?: any;
  className?: string;
}

/**
 * Tautan legal (Kebijakan Privasi, Syarat & Ketentuan) yang ditempel di samping teks hak cipta
 * footer tema. Dirender sebagai <span> agar aman diletakkan di dalam <p>, dan mewarisi gaya teksnya.
 */
export const FooterLegalLinks: React.FC<FooterLegalLinksProps> = ({ sectionOptions = {}, className = '' }) => {
  const links = getFooterLegalLinks(sectionOptions);
  if (links.length === 0) return null;

  return (
    <span className={`inline-flex flex-wrap justify-center gap-x-3 ml-3 ${className}`}>
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
