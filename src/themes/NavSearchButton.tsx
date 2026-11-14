import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavSearchButtonProps {
  className?: string;
  iconClassName?: string;
  /** Teks di samping ikon (opsional). */
  label?: React.ReactNode;
}

/**
 * Tombol pencarian navbar tema: membuka halaman Katalog (yang memiliki kolom pencarian
 * produk) lewat data-href yang ditangani CenterPreviewCanvas.
 */
export const NavSearchButton: React.FC<NavSearchButtonProps> = ({ className = '', iconClassName = 'w-4 h-4', label }) => {
  const { isEn } = useLanguage();
  const text = isEn ? 'Search products' : 'Cari produk';
  return (
    <button
      type="button"
      data-href="/katalog"
      aria-label={text}
      title={text}
      className={`cursor-pointer ${className}`}
    >
      <Search className={iconClassName} />
      {label}
    </button>
  );
};
