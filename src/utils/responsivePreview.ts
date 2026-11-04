/**
 * Helper untuk layout responsif di dalam Editor Layout Toko (preview Desktop/Tablet/Ponsel).
 *
 * Masalah: komponen tema menggunakan breakpoint Tailwind (`sm:`, `md:`, `lg:`) yang
 * dievaluasi berdasarkan LEBAR JENDELA BROWSER sesungguhnya. Di dalam editor, preview
 * device (Desktop/Tablet/Ponsel) hanya mengecilkan lebar KONTAINER, bukan jendela browser
 * itu sendiri — sehingga saat memilih preview "Ponsel" di layar laptop lebar, kelas
 * `md:grid-cols-4` / `md:flex-row` tetap aktif (karena window masih >=768px) meski
 * container cuma ~390px, menyebabkan card bertumpuk/terpotong.
 *
 * Solusi: saat komponen tema dirender DI DALAM editor (prop `isMobile`/`isTablet` eksplisit
 * dikirim oleh ThemeSectionRenderer), paksa kelas sesuai device yang dipilih. Saat komponen
 * dirender di halaman storefront produksi (tanpa prop tsb, `isMobile`/`isTablet` undefined),
 * kembalikan ke kelas breakpoint Tailwind asli (perilaku window-based yang sudah benar
 * untuk pengunjung toko sesungguhnya).
 */

export interface DeviceClassOptions {
  /** Kelas class yang dipakai saat preview diset ke Ponsel */
  mobile: string;
  /** Kelas class yang dipakai saat preview diset ke Tablet */
  tablet: string;
  /** Kelas class yang dipakai saat preview diset ke Desktop */
  desktop: string;
  /** Kelas class asli (breakpoint Tailwind sm:/md:/lg:) dipakai di storefront produksi */
  fallback: string;
}

/**
 * Mengembalikan className yang tepat tergantung konteks render:
 * - Di dalam editor (isMobile/isTablet adalah boolean eksplisit): pakai kelas device yang dipaksa.
 * - Di storefront produksi (isMobile/isTablet undefined): pakai kelas fallback (Tailwind breakpoint biasa).
 */
export function getDeviceClass(
  isMobile: boolean | undefined,
  isTablet: boolean | undefined,
  options: DeviceClassOptions
): string {
  const inEditorPreview = typeof isMobile === 'boolean' || typeof isTablet === 'boolean';
  if (!inEditorPreview) return options.fallback;
  if (isMobile) return options.mobile;
  if (isTablet) return options.tablet;
  return options.desktop;
}
