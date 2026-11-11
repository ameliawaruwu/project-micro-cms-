import { useEffect, useSyncExternalStore } from 'react';
import { supabase } from './supabaseClient';

/**
 * Logo platform yang diatur super admin (`platform_settings.logo_url` / `logo_icon_url`).
 * Disimpan di cache localStorage agar logo langsung tampil saat halaman dibuka, lalu
 * diperbarui sekali per muatan halaman dari database. Bila kosong / gagal dimuat,
 * komponen logo memakai berkas bawaan.
 */
export interface PlatformLogo {
  logoUrl: string;
  logoIconUrl: string;
}

export const DEFAULT_LOGO_URL = '/Logo.png?v=20261104';
export const DEFAULT_LOGO_ICON_URL = '/Logo-Icon.png?v=20261104';

const CACHE_KEY = 'lapakq_platform_logo_v1';
const EMPTY: PlatformLogo = { logoUrl: '', logoIconUrl: '' };

/** Hanya URL https:// tanpa karakter yang bisa keluar dari atribut / CSS yang dipakai. */
export const isSafeLogoUrl = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 500 && /^https:\/\/[^\s"'<>()\\]+$/.test(value);

const normalize = (raw: any): PlatformLogo => ({
  logoUrl: isSafeLogoUrl(raw?.logoUrl) ? raw.logoUrl : '',
  logoIconUrl: isSafeLogoUrl(raw?.logoIconUrl) ? raw.logoIconUrl : '',
});

const readCache = (): PlatformLogo => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? normalize(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
};

let current: PlatformLogo = readCache();
let pending: Promise<PlatformLogo> | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Logo terakhir yang diketahui (cache), tanpa menunggu database. */
export const getPlatformLogo = (): PlatformLogo => current;

/** Simpan logo terbaru ke cache dan beri tahu semua komponen logo yang sedang tampil. */
export const setPlatformLogo = (next: Partial<PlatformLogo>) => {
  const merged = normalize({ ...current, ...next });
  if (merged.logoUrl === current.logoUrl && merged.logoIconUrl === current.logoIconUrl) return;
  current = merged;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(current));
  } catch {
    // Cache hanya mempercepat tampilan; abaikan bila storage penuh / diblokir.
  }
  listeners.forEach((listener) => listener());
};

/** Ambil logo dari database (sekali per muatan halaman kecuali `force`). */
export const loadPlatformLogo = (force = false): Promise<PlatformLogo> => {
  if (pending && !force) return pending;
  pending = (async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('logo_url, logo_icon_url')
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        setPlatformLogo({ logoUrl: (data as any).logo_url || '', logoIconUrl: (data as any).logo_icon_url || '' });
      }
    } catch {
      // Tetap pakai cache / logo bawaan.
    }
    return current;
  })();
  return pending;
};

/** Logo platform aktif; komponen ikut berganti saat super admin menyimpan logo baru. */
export const usePlatformLogo = (): PlatformLogo => {
  useEffect(() => {
    void loadPlatformLogo();
  }, []);
  return useSyncExternalStore(subscribe, () => current, () => current);
};
