import { Resolver } from 'dns';
import https from 'https';

// A store is only reported live after the public internet can reach it: its host resolves on a public
// resolver and an HTTPS request to it answers. The panel registers a host and creates its DNS record a
// few seconds after replying, so "registered" is not "live".
// WHY: publish said "live" before the CNAME existed; the browser cached NXDOMAIN and the merchant got
// "situs tidak dapat ditemukan" (amel-florist / floooorist.gmpsbandung.org, 2026-11-11).

export interface HostLiveResult {
  host: string;
  dns: boolean;
  httpStatus: number | null;
  live: boolean;
  detail: string;
}

// Public resolvers, not the node's own cache, which may still hold an NXDOMAIN from before the record existed.
const resolver = new Resolver({ timeout: 3000, tries: 1 });
resolver.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8']);

const resolveA = (host: string): Promise<string[]> =>
  new Promise((resolve) => resolver.resolve4(host, (err, addresses) => resolve(err ? [] : addresses)));

const probeHttps = (host: string, address: string): Promise<number | null> =>
  new Promise((resolve) => {
    const req = https.request(
      {
        host: address,
        servername: host,
        path: '/',
        method: 'GET',
        headers: { Host: host, 'User-Agent': 'LapakQ-publish-check/1.0' },
        timeout: 8000,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode ?? null);
      },
    );
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve(null));
    req.end();
  });

/** One check: DNS on a public resolver, then an HTTPS GET of "/". 2xx/3xx counts as live. */
export async function checkHostLive(host: string): Promise<HostLiveResult> {
  const addresses = await resolveA(host);
  if (!addresses.length) return { host, dns: false, httpStatus: null, live: false, detail: 'DNS belum aktif' };
  const status = await probeHttps(host, addresses[0]);
  const live = status !== null && status >= 200 && status < 400;
  const detail = live ? `HTTP ${status}` : status === null ? 'Server belum menjawab' : `HTTP ${status}`;
  return { host, dns: true, httpStatus: status, live, detail };
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Repeats checkHostLive until the host is live or timeoutMs passes; returns the last result. */
export async function waitForHostLive(host: string, timeoutMs = 45000, intervalMs = 3000): Promise<HostLiveResult> {
  const deadline = Date.now() + timeoutMs;
  let last = await checkHostLive(host);
  while (!last.live && Date.now() + intervalMs < deadline) {
    await pause(intervalMs);
    last = await checkHostLive(host);
  }
  return last;
}
