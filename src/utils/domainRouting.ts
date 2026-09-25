/**
 * Utility functions for domain detection and storefront routing.
 * Differentiates between Kroomify platform hosts (Landing page / CMS Dashboard)
 * and dedicated merchant storefronts (<slug>.kroombox.com or custom domains).
 */

const PLATFORM_DOMAINS = new Set([
  'kroomify.kroombox.com',
  'www.kroomify.kroombox.com',
  'kroombox.com',
  'www.kroombox.com',
  'panel.kroombox.com',
  'api.kroombox.com',
  'cdn.kroombox.com',
  'api-cdn.kroombox.com',
  'kromify.id',
  'www.kromify.id',
  'panel.kromify.id',
  'mykolab.store',
  'www.mykolab.store',
  'panel.mykolab.store',
  'localhost',
  '127.0.0.1',
]);

const RESERVED_SUBDOMAINS = new Set([
  'kroomify',
  'panel',
  'api',
  'cdn',
  'api-cdn',
  'www',
  'app',
  'admin',
  'mail',
  'auth',
  'staging',
  'dev',
]);

/**
 * Checks whether the current host is a primary Kroomify CMS platform host.
 * On platform hosts, the default view is Landing Page (guest) or Merchant Dashboard (logged in).
 */
export function isPlatformHost(hostname?: string): boolean {
  if (!hostname && typeof window !== 'undefined') {
    hostname = window.location.hostname;
  }
  if (!hostname) return true;

  const host = hostname.toLowerCase().trim().split(':')[0];
  if (PLATFORM_DOMAINS.has(host)) return true;
  // Local network / ZeroTier IPs
  if (
    host.startsWith('192.168.') ||
    host.startsWith('100.') ||
    host.startsWith('10.') ||
    host.startsWith('172.16.') ||
    host.startsWith('172.17.') ||
    host.startsWith('172.18.') ||
    host.startsWith('172.19.') ||
    host.startsWith('172.2') ||
    host.startsWith('172.3')
  ) {
    return true;
  }
  return false;
}

/**
 * Extracts the merchant store slug from the current hostname, if it is a storefront domain.
 * Returns null if accessed from a platform domain (e.g. kroomify.kroombox.com, localhost)
 * or if no store slug is associated with the domain.
 */
export function getStoreSlugFromHost(hostname?: string): string | null {
  if (typeof window !== 'undefined') {
    const injectedSlug = (window as any).__KROOMIFY_STORE_SLUG__;
    if (injectedSlug && typeof injectedSlug === 'string' && injectedSlug.trim()) {
      return injectedSlug.trim().toLowerCase();
    }
  }

  if (!hostname && typeof window !== 'undefined') {
    hostname = window.location.hostname;
  }
  if (!hostname) return null;

  const host = hostname.toLowerCase().trim().split(':')[0];
  if (isPlatformHost(host)) {
    return null;
  }

  // Multi-tenant base domains
  const BASE_DOMAINS = ['.kroombox.com', '.kromify.id', '.mykolab.store'];
  for (const base of BASE_DOMAINS) {
    if (host.endsWith(base)) {
      const sub = host.slice(0, -base.length);
      if (RESERVED_SUBDOMAINS.has(sub) || !sub) {
        return null;
      }
      return sub;
    }
  }

  // If it's a custom domain mapped by a merchant (e.g. mybrand.com)
  return host;
}
