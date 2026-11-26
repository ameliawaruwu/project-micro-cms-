import type React from 'react';
import { normalizeThemeId } from '../ThemeRegistry';
import { getShopAccent } from './shopThemeStyles';

/**
 * Palet halaman toko (Keranjang, Checkout, Detail Produk, Pesanan, Profil, Kontak, Tentang, Login)
 * per tema induk. Halaman memakai kelas seperti `bg-[var(--sf-card)]` sehingga tampilannya
 * otomatis mengikuti tema toko yang aktif, termasuk warna aksen yang diatur merchant.
 */
interface StorefrontPalette {
  page: string;
  card: string;
  subtle: string;
  text: string;
  textSoft: string;
  muted: string;
  border: string;
  /** Warna utama tombol & aksen. `accent` = pakai warna aksen tema (bisa diatur merchant). */
  primary: string | 'accent';
  primaryContrast: string;
  radius: string;
  font?: string;
}

const PALETTES: Record<string, StorefrontPalette> = {
  minimalist: { page: '#FFFFFF', card: '#FFFFFF', subtle: '#F6F6F6', text: '#111111', textSoft: '#4B5563', muted: '#9CA3AF', border: '#E5E7EB', primary: '#111111', primaryContrast: '#FFFFFF', radius: '0px' },
  nature: { page: '#FBF9F5', card: '#FFFFFF', subtle: '#F0F4EF', text: '#2C3B2D', textSoft: '#4A5A4B', muted: '#8C8481', border: '#E8E4DB', primary: '#2C3B2D', primaryContrast: '#F9F6F0', radius: '16px' },
  cute: { page: '#FFFBFC', card: '#FFFFFF', subtle: '#FFF5F7', text: '#374151', textSoft: '#6B7280', muted: '#9CA3AF', border: '#FFE4EA', primary: '#FF85A1', primaryContrast: '#FFFFFF', radius: '24px', font: "'Outfit', sans-serif" },
  creative: { page: '#FFFBFC', card: '#FFFFFF', subtle: '#FFF5F7', text: '#1F2937', textSoft: '#4B5563', muted: '#9CA3AF', border: '#FFE4EA', primary: '#E11D48', primaryContrast: '#FFFFFF', radius: '20px', font: "'Outfit', sans-serif" },
  modern: { page: '#FFFFFF', card: '#FFFFFF', subtle: '#F9FAFB', text: '#111827', textSoft: '#4B5563', muted: '#9CA3AF', border: '#E5E7EB', primary: 'accent', primaryContrast: '#FFFFFF', radius: '16px', font: "'Outfit', sans-serif" },
  fashion: { page: '#F9F9F9', card: '#FFFFFF', subtle: '#F4F4F5', text: '#18181B', textSoft: '#3F3F46', muted: '#9CA3AF', border: '#E4E4E7', primary: '#18181B', primaryContrast: '#FFFFFF', radius: '0px' },
  futuristic: { page: '#050505', card: '#0D0D0D', subtle: '#141414', text: '#F9FAFB', textSoft: '#D1D5DB', muted: '#9CA3AF', border: 'rgba(255,255,255,0.12)', primary: 'accent', primaryContrast: '#FFFFFF', radius: '12px', font: "'Space Grotesk', sans-serif" },
  bold: { page: '#FFFFFF', card: '#FFFFFF', subtle: '#F4F4F5', text: '#000000', textSoft: '#27272A', muted: '#71717A', border: '#18181B', primary: '#FF0000', primaryContrast: '#FFFFFF', radius: '0px' },
  editorial: { page: '#FAF7F7', card: '#FFFFFF', subtle: '#F3EDED', text: '#241A1A', textSoft: '#4A3F3F', muted: '#8A8180', border: '#E5E0DD', primary: '#241A1A', primaryContrast: '#FFFFFF', radius: '2px' },
  luxury: { page: '#FFFFFF', card: '#FAF7F2', subtle: '#F7F2EB', text: '#36281D', textSoft: '#5C4A3B', muted: '#9E8E81', border: '#EADBCE', primary: '#8C531B', primaryContrast: '#FFFFFF', radius: '8px' },
  professional: { page: '#F8FAFC', card: '#FFFFFF', subtle: '#F1F5F9', text: '#0F172A', textSoft: '#334155', muted: '#64748B', border: '#E2E8F0', primary: '#1E40AF', primaryContrast: '#FFFFFF', radius: '12px' },
};

/** Variabel CSS `--sf-*` untuk tema aktif; pasang di elemen akar halaman toko. */
export function getStorefrontThemeVars(themeId?: string, accentColor?: string): React.CSSProperties {
  const id = normalizeThemeId(themeId);
  const p = PALETTES[id] || PALETTES.minimalist;
  const accent = getShopAccent(id, accentColor);
  const primary = p.primary === 'accent' ? (accent === '#1A1A1A' ? p.text : accent) : p.primary;

  const vars: Record<string, string> = {
    '--sf-page': p.page,
    '--sf-card': p.card,
    '--sf-subtle': p.subtle,
    '--sf-text': p.text,
    '--sf-text-soft': p.textSoft,
    '--sf-muted': p.muted,
    '--sf-border': p.border,
    '--sf-primary': primary,
    '--sf-primary-contrast': p.primaryContrast,
    '--sf-primary-soft': `color-mix(in srgb, ${primary} 10%, ${p.card})`,
    '--sf-primary-border': `color-mix(in srgb, ${primary} 30%, ${p.card})`,
    '--sf-primary-strong': `color-mix(in srgb, ${primary} 80%, ${p.text})`,
    '--sf-radius': p.radius,
    '--shop-accent': primary,
  };
  return { ...(vars as React.CSSProperties), ...(p.font ? { fontFamily: p.font } : {}) };
}
