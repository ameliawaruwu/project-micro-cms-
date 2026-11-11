import React from 'react';
import { PackageSearch } from 'lucide-react';

interface NavTrackOrderButtonProps {
  className?: string;
  iconClassName?: string;
  /** Teks di samping ikon (opsional). */
  label?: React.ReactNode;
}

/**
 * Tombol "Lacak Pesanan" di navbar tema. Selalu tampil (tidak bergantung menu yang diatur
 * merchant) agar pembeli tanpa akun bisa mengecek status & pembayaran pesanannya kapan saja.
 * Navigasinya lewat data-href yang ditangani CenterPreviewCanvas, sama seperti NavSearchButton.
 */
export const NavTrackOrderButton: React.FC<NavTrackOrderButtonProps> = ({
  className = '',
  iconClassName = 'w-4 h-4',
  label,
}) => (
  <button
    type="button"
    data-href="/lacak"
    aria-label="Lacak pesanan"
    title="Lacak pesanan"
    className={`cursor-pointer ${className}`}
  >
    <PackageSearch className={iconClassName} />
    {label}
  </button>
);
