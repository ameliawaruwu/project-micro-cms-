/**
 * Judul tab & favicon browser. Storefront memakai nama & logo toko,
 * halaman lain (landing, dashboard) memakai identitas LapakQ dari index.html.
 */
const DEFAULT_TITLE = 'LapakQ';
const DEFAULT_ICON = '/Logo-Icon.png?v=20261104';

const safeIconUrl = (url?: string | null): string | null => {
  const value = String(url || '').trim();
  if (!value) return null;
  // Hanya gambar dari https atau path relatif; tolak javascript:/data: dll.
  if (/^https:\/\//i.test(value) || value.startsWith('/')) return value;
  return null;
};

const setIconLinks = (href: string) => {
  (['icon', 'apple-touch-icon'] as const).forEach((rel) => {
    let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    if (link.getAttribute('href') !== href) {
      link.removeAttribute('type');
      link.href = href;
    }
  });
};

/** Ikon huruf awal nama toko, dipakai bila toko belum mengunggah logo. */
const letterIcon = (name: string): string => {
  const letter = (Array.from(name.trim())[0] || 'T').toUpperCase().replace(/[<>&"']/g, '');
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" rx="14" fill="#1F1F1F"/>' +
    '<text x="32" y="43" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700" fill="#FFFFFF">' +
    letter +
    '</text></svg>';
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export function applyStoreBranding(store: { name?: string | null; logoUrl?: string | null }): void {
  if (typeof document === 'undefined') return;
  const name = String(store.name || '').trim();
  document.title = name || DEFAULT_TITLE;
  setIconLinks(safeIconUrl(store.logoUrl) || (name ? letterIcon(name) : DEFAULT_ICON));
}

export function resetDocumentBranding(): void {
  if (typeof document === 'undefined') return;
  document.title = DEFAULT_TITLE;
  setIconLinks(DEFAULT_ICON);
}
