import React from 'react';
import { Search } from 'lucide-react';

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
export const NavSearchButton: React.FC<NavSearchButtonProps> = ({ className = '', iconClassName = 'w-4 h-4', label }) => (
  <button
    type="button"
    data-href="/katalog"
    aria-label="Cari produk"
    title="Cari produk"
    className={`cursor-pointer ${className}`}
  >
    <Search className={iconClassName} />
    {label}
  </button>
);
