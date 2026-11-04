/**
 * Utility to resolve the correct API base URL or endpoint.
 * Ensures storefront subdomains (e.g. mistrore.kroombox.com, flowerss.kroombox.com, custom domains)
 * can communicate directly with the live Express daemon hosted at https://lapakq.com/api/...
 */
export function getApiEndpoint(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Local dev: keep relative so Vite proxy forwards to local/NAS
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('100.')
    ) {
      return cleanPath;
    }
    // Main CMS domains: keep relative
    if (
      host === 'lapakq.com' ||
      host === 'www.lapakq.com' ||
      host === 'kroomify.kroombox.com' ||
      host === 'www.kroomify.kroombox.com'
    ) {
      return cleanPath;
    }
    // Any storefront subdomain or custom domain:
    // Proxy directly to canonical backend domain with full CORS support
    return `https://lapakq.com${cleanPath}`;
  }
  return cleanPath;
}
