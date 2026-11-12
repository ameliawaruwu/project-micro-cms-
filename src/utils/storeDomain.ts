import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Store } from '../types';

/** Domain toko untuk merchant tanpa komunitas. */
// lapakq.com is the zone this app owns in the Kroombox Panel; store hosts are published under it.
export const DEFAULT_BASE_DOMAIN = 'lapakq.com';

export interface StoreBaseDomainInfo {
  /** Domain induk subdomain toko, mis. `kroombox.com` atau `gmpsbandung.org`. */
  domain: string;
  /** Nama komunitas pemilik domain (kosong bila memakai domain default). */
  communityName?: string;
}

const cleanDomain = (value?: string | null) =>
  (value || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^\.+/, '').replace(/\/+$/, '').trim();

const cache = new Map<string, Promise<StoreBaseDomainInfo>>();

/**
 * Domain induk subdomain toko: toko anggota komunitas memakai domain komunitasnya
 * (`communities.base_domain`, diatur admin di menu Komunitas); toko tanpa komunitas
 * — atau komunitas yang belum mengatur domain — memakai `lapakq.com`.
 */
export function fetchStoreBaseDomain(store: Pick<Store, 'communityId' | 'communityName' | 'baseDomain'>): Promise<StoreBaseDomainInfo> {
  const explicit = cleanDomain(store.baseDomain);
  if (explicit) return Promise.resolve({ domain: explicit, communityName: store.communityName });
  const communityId = store.communityId;
  if (!communityId) return Promise.resolve({ domain: DEFAULT_BASE_DOMAIN });

  if (!cache.has(communityId)) {
    const request = (async (): Promise<StoreBaseDomainInfo> => {
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('name, base_domain, status')
          .eq('id', communityId)
          .maybeSingle();
        if (error || !data) return { domain: DEFAULT_BASE_DOMAIN };
        const domain = cleanDomain(data.base_domain);
        if (!domain || data.status === 'inactive') return { domain: DEFAULT_BASE_DOMAIN };
        return { domain, communityName: data.name || store.communityName };
      } catch {
        return { domain: DEFAULT_BASE_DOMAIN };
      }
    })();
    cache.set(communityId, request);
    // Jangan simpan kegagalan jaringan selamanya: izinkan coba lagi berikutnya.
    request.then((info) => {
      if (info.domain === DEFAULT_BASE_DOMAIN) cache.delete(communityId);
    });
  }
  return cache.get(communityId)!;
}

/** Hook React untuk {@link fetchStoreBaseDomain}; `loading` true sampai domain komunitas diketahui. */
export function useStoreBaseDomain(store?: Pick<Store, 'communityId' | 'communityName' | 'baseDomain'> | null) {
  const communityId = store?.communityId;
  const explicit = store?.baseDomain;
  const [state, setState] = useState<{ info: StoreBaseDomainInfo; loading: boolean }>(() => ({
    info: { domain: cleanDomain(explicit) || DEFAULT_BASE_DOMAIN, communityName: explicit ? store?.communityName : undefined },
    loading: !explicit && !!communityId,
  }));

  useEffect(() => {
    if (!store) return;
    let alive = true;
    setState((prev) => ({ ...prev, loading: !explicit && !!communityId }));
    fetchStoreBaseDomain(store).then((info) => {
      if (alive) setState({ info, loading: false });
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId, explicit]);

  return { ...state.info, loading: state.loading };
}

/** Alamat publik toko yang sudah terbit: domain kustom bila ada, selain itu `<slug>.<domain induk>`. */
export function buildStoreLiveUrl(slug: string, baseDomain: string, customDomain?: string | null): string {
  const custom = cleanDomain(customDomain);
  if (custom) return `https://${custom}`;
  return `https://${encodeURIComponent(slug)}.${cleanDomain(baseDomain) || DEFAULT_BASE_DOMAIN}`;
}
