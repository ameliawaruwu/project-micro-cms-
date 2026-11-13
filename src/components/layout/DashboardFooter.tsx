import React from 'react';

interface DashboardFooterProps {
  /** Nama panel yang sedang dipakai, mis. "Panel Merchant" / "Panel Super Admin". */
  panelLabel: string;
  language?: 'id' | 'en' | string;
  className?: string;
}

/**
 * Footer bersama untuk halaman dasbor merchant, super admin, dan sub admin.
 * Ikut tergulir di bawah konten (bukan melayang) agar tidak menutupi tabel/form.
 */
export const DashboardFooter: React.FC<DashboardFooterProps> = ({ panelLabel, language = 'id', className = '' }) => {
  const isEn = language === 'en';
  const year = new Date().getFullYear();

  return (
    <footer
      className={`mt-6 pt-4 pb-2 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] sm:text-xs text-gray-500 text-center sm:text-left ${className}`}
    >
      <p>
        © {year} <span className="font-semibold text-gray-700">LapakQ</span>.{' '}
        {isEn ? 'All rights reserved.' : 'Hak cipta dilindungi.'}
      </p>
      <p className="text-gray-400">{panelLabel}</p>
    </footer>
  );
};
