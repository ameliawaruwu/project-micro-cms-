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

export type PreviewDeviceMode = 'desktop' | 'tablet' | 'mobile';

/** Urutan device preview dari yang tersempit; dipakai untuk membandingkan lebarnya. */
const DEVICE_ORDER: PreviewDeviceMode[] = ['mobile', 'tablet', 'desktop'];

/**
 * Device preview terlebar yang masih muat di jendela browser saat ini. Batasnya sama dengan
 * breakpoint Tailwind `sm` (640px) dan `lg` (1024px) yang dipakai tombol pengalih device.
 */
export function getViewportDeviceMode(): PreviewDeviceMode {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia('(max-width: 639.98px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1023.98px)').matches) return 'tablet';
  return 'desktop';
}

/**
 * Turunkan device preview bila lebih lebar dari layar. Contoh: editor dibuka di HP saat
 * preview masih "Desktop" — tanpa ini kelas `md:`/`lg:` dipaksa aktif di kanvas selebar
 * ±375px sehingga grid dan kolom template terhimpit.
 */
export function fitDeviceModeToViewport(mode: PreviewDeviceMode): PreviewDeviceMode {
  const max = getViewportDeviceMode();
  return DEVICE_ORDER.indexOf(mode) > DEVICE_ORDER.indexOf(max) ? max : mode;
}

/**
 * Breakpoint Tailwind yang "aktif" untuk tiap preview device di editor: Ponsel ±390px,
 * Tablet ±730px (isi frame 768px), Desktop = tampilan desktop (sm/md/lg aktif). Kanvas desktop
 * bisa sedikit di bawah 1024px, tetapi komponen tema memasangkan `grid-cols-12` desktop dengan
 * `lg:col-span-*`, sehingga `lg` harus aktif agar kolom tidak menyempit.
 */
const ACTIVE_BREAKPOINTS: Record<PreviewDeviceMode, string[]> = {
  mobile: [],
  tablet: ['sm'],
  desktop: ['sm', 'md', 'lg'],
};
const ALL_BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'];
const TEXT_SIZES = new Set(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']);
const DISPLAY = new Set(['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'hidden', 'contents']);

/** Kunci "jenis utilitas" agar kelas breakpoint bisa menimpa kelas dasar yang sejenis. */
function utilityKey(cls: string): string {
  const variantSplit = cls.lastIndexOf(':');
  const variants = variantSplit >= 0 ? cls.slice(0, variantSplit + 1) : '';
  const base = variantSplit >= 0 ? cls.slice(variantSplit + 1) : cls;
  if (DISPLAY.has(base)) return `${variants}display`;
  if (base === 'flex-row' || base === 'flex-col' || base === 'flex-row-reverse' || base === 'flex-col-reverse') return `${variants}flex-dir`;
  const textMatch = base.match(/^text-(.+)$/);
  if (textMatch) {
    const v = textMatch[1];
    if (TEXT_SIZES.has(v) || /^\[\d/.test(v)) return `${variants}text-size`;
    if (['left', 'center', 'right', 'justify', 'start', 'end'].includes(v)) return `${variants}text-align`;
    return `${variants}text-color`;
  }
  const dash = base.lastIndexOf('-');
  return `${variants}${dash > 0 ? base.slice(0, dash) : base}`;
}

/**
 * Mensimulasikan breakpoint Tailwind (`sm:`, `md:`, `lg:` …) untuk preview device di editor.
 * - Di luar editor (deviceMode undefined) className dikembalikan apa adanya, sehingga storefront
 *   produksi tetap memakai breakpoint asli berbasis lebar jendela.
 * - Di editor, kelas breakpoint yang aktif untuk device tsb di-"unwrap" dan menimpa kelas dasar
 *   sejenis; kelas breakpoint yang tidak aktif dibuang.
 */
export function resolveResponsiveClasses(className: string, deviceMode?: PreviewDeviceMode): string {
  if (!deviceMode || !className) return className;
  const active = ACTIVE_BREAKPOINTS[deviceMode];
  const result: string[] = [];
  const indexByKey = new Map<string, number>();

  const push = (cls: string) => {
    const key = utilityKey(cls);
    const existing = indexByKey.get(key);
    if (existing !== undefined) result[existing] = '';
    indexByKey.set(key, result.length);
    result.push(cls);
  };

  // Urutkan: kelas dasar dulu, lalu breakpoint dari kecil ke besar (seperti cascade CSS Tailwind).
  const tokens = className.split(/\s+/).filter(Boolean);
  const rank = (cls: string) => {
    const bp = cls.split(':')[0];
    const i = ALL_BREAKPOINTS.indexOf(bp);
    return cls.includes(':') && i >= 0 ? i + 1 : 0;
  };
  tokens
    .map((cls, i) => ({ cls, i, r: rank(cls) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .forEach(({ cls, r }) => {
      if (r === 0) return push(cls);
      const bp = ALL_BREAKPOINTS[r - 1];
      if (!active.includes(bp)) return;
      push(cls.slice(bp.length + 1));
    });

  return result.filter(Boolean).join(' ');
}
