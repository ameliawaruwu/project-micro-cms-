import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { pool } from './publicApiController';
import { simulateCourierRates, zoneCourierRates } from '../src/utils/shippingFormulas';

/**
 * Pembuatan pesanan & tarif ongkir yang disahkan server.
 *
 * - `POST /api/shipping/quote`: server menghitung berat dari database, menentukan asal
 *   pengiriman, mengambil tarif (Biteship, atau rumus cadangan yang sama dengan browser),
 *   lalu menandatangani tiap tarif (HMAC).
 * - `POST /api/orders/place`: pesanan hanya dibuat dengan tarif bertanda tangan yang cocok
 *   dengan toko, isi keranjang (berat) dan tujuan. Harga produk tetap dihitung `place_order`
 *   dari tabel products. Browser tidak lagi bisa menentukan ongkir sendiri (mis. Rp 0).
 */

const QUOTE_TTL_MS = 2 * 60 * 60 * 1000; // tarif berlaku 2 jam
const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const POSTAL_RE = /^[0-9]{5}$/;

const QUOTE_SECRET: string = (() => {
  const explicit = (process.env.SHIPPING_QUOTE_SECRET || '').trim();
  if (explicit) return explicit;
  // Turunan rahasia server yang sudah ada, agar tidak perlu env baru dan stabil antar-restart.
  const base = process.env.DATABASE_URL || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.MIDTRANS_SERVER_KEY || '';
  if (base) return crypto.createHash('sha256').update(`lapakq-shipping-quote:${base}`).digest('hex');
  return crypto.randomBytes(32).toString('hex');
})();

interface QuotePayload {
  s: string; // store id
  w: number; // berat total (gram) hasil hitungan server
  d: string; // tujuan: "postal:12345" atau "city:<nama kota>"
  c: string; // kode kurir
  v: string; // kode layanan
  n: string; // nama kurir + layanan (label)
  p: number; // ongkir (rupiah)
  b: string | null; // cabang asal
  e: number; // kedaluwarsa (epoch ms)
}

const b64url = (buf: Buffer) => buf.toString('base64url');

function signQuote(payload: QuotePayload): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const sig = b64url(crypto.createHmac('sha256', QUOTE_SECRET).update(body).digest());
  return `${body}.${sig}`;
}

function verifyQuote(token: unknown): QuotePayload | null {
  if (typeof token !== 'string' || token.length > 2000) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = b64url(crypto.createHmac('sha256', QUOTE_SECRET).update(body).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as QuotePayload;
    if (!payload || typeof payload.e !== 'number' || payload.e < Date.now()) return null;
    if (!Number.isInteger(payload.p) || payload.p < 0 || payload.p > 5_000_000) return null;
    return payload;
  } catch {
    return null;
  }
}

interface CartLine {
  productId: string;
  quantity: number;
}

function parseCartLines(raw: unknown): CartLine[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 100) return null;
  const lines: CartLine[] = [];
  for (const it of raw) {
    const productId = String((it as any)?.productId ?? (it as any)?.product_id ?? '').trim();
    const quantity = Number((it as any)?.quantity);
    if (!ID_RE.test(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) return null;
    lines.push({ productId, quantity });
  }
  return lines;
}

/** Berat total (gram) dari database; null bila ada produk yang bukan milik toko. */
async function computeCartWeight(storeId: string, lines: CartLine[]): Promise<number | null> {
  const ids = Array.from(new Set(lines.map((l) => l.productId)));
  const res = await pool.query('SELECT id, weight_grams FROM products WHERE store_id = $1 AND id = ANY($2::text[])', [
    storeId,
    ids,
  ]);
  const weights = new Map<string, number>();
  for (const row of res.rows) {
    const w = Number(row.weight_grams);
    weights.set(String(row.id), Number.isFinite(w) && w > 0 ? w : 250);
  }
  let total = 0;
  for (const l of lines) {
    const w = weights.get(l.productId);
    if (w === undefined) return null;
    total += w * l.quantity;
  }
  return Math.max(250, Math.round(total));
}

/** Asal pengiriman: cabang utama toko → kode pos toko → kode pos bawaan. */
async function resolveOrigin(storeId: string): Promise<{ branchId: string | null; postal: string }> {
  try {
    const br = await pool.query(
      `SELECT id, postal_code FROM shipping_branches WHERE store_id = $1
        ORDER BY (is_default AND is_active) DESC, is_default DESC, created_at ASC LIMIT 1`,
      [storeId]
    );
    const row = br.rows[0];
    if (row?.postal_code && String(row.postal_code).trim()) {
      return { branchId: String(row.id), postal: String(row.postal_code).trim() };
    }
    const st = await pool.query('SELECT postal_code FROM stores WHERE id = $1', [storeId]);
    const postal = String(st.rows[0]?.postal_code || '').trim();
    return { branchId: row ? String(row.id) : null, postal: postal || '12730' };
  } catch {
    return { branchId: null, postal: '12730' };
  }
}

async function fetchBiteshipRates(originPostal: string, destPostal: string, weight: number, couriers: string): Promise<any[]> {
  const apiKey = (process.env.BITESHIP_API_KEY || '').trim();
  if (!apiKey || !/^[0-9]{5}$/.test(originPostal)) return [];
  try {
    const res = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST',
      headers: {
        Authorization: apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin_postal_code: Number(originPostal),
        destination_postal_code: Number(destPostal),
        couriers,
        items: [{ name: 'Paket Pesanan Toko', value: 100000, weight: Math.max(100, weight), quantity: 1 }],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    if (!Array.isArray(data?.pricing)) return [];
    return data.pricing
      .map((p: any) => ({
        courier_name: p.courier_name || p.company,
        courier_code: p.courier_code || p.courier,
        courier_service_name: p.courier_service_name || p.service_type,
        courier_service_code: p.courier_service_code || p.type,
        tier: p.tier || 'standard',
        description: p.description || `${p.courier_name} ${p.courier_service_name}`,
        service_type: p.service_type || 'standard',
        shipping_type: p.shipping_type || 'parcel',
        price: Math.round(Number(p.price) || 0),
        etd: p.duration || p.etd || '1-3 Hari',
      }))
      .filter((r: any) => r.courier_code && r.price > 0);
  } catch {
    return [];
  }
}

const clean = (v: unknown, max: number) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max);

export const orderRouter = Router();

// Tarif ongkir bertanda tangan.
orderRouter.post('/shipping/quote', async (req: Request, res: Response) => {
  try {
    const storeId = String(req.body?.storeId || '').trim();
    const lines = parseCartLines(req.body?.items);
    const mode = req.body?.mode === 'zone' ? 'zone' : 'postal';
    if (!ID_RE.test(storeId) || !lines) {
      return res.status(400).json({ success: false, message: 'Data keranjang tidak valid.' });
    }
    const weight = await computeCartWeight(storeId, lines);
    if (weight === null) {
      return res.status(400).json({ success: false, message: 'Ada produk yang tidak tersedia di toko ini.' });
    }
    const exp = Date.now() + QUOTE_TTL_MS;

    if (mode === 'zone') {
      const city = clean(req.body?.destinationCity, 100);
      if (!city) return res.status(400).json({ success: false, message: 'Kota tujuan wajib diisi.' });
      const origin = await resolveOrigin(storeId);
      const rates = zoneCourierRates(city, weight).map((r) => ({
        ...r,
        quote: signQuote({
          s: storeId,
          w: weight,
          d: `city:${city.toLowerCase()}`,
          c: String(r.courierCode || r.courier).toLowerCase(),
          v: String(r.courierServiceCode || ''),
          n: `${r.courier} ${r.serviceName}`.slice(0, 64),
          p: Math.round(r.cost),
          b: origin.branchId,
          e: exp,
        }),
      }));
      return res.json({ success: true, weight, rates });
    }

    const destPostal = String(req.body?.destinationPostalCode || '').trim();
    if (!POSTAL_RE.test(destPostal)) {
      return res.status(400).json({ success: false, message: 'Kode pos tujuan tidak valid.' });
    }
    const couriers = String(req.body?.couriers || 'jnt,jne,sicepat')
      .toLowerCase()
      .replace(/[^a-z0-9_,]/g, '')
      .slice(0, 120) || 'jnt,jne,sicepat';
    const origin = await resolveOrigin(storeId);
    let rates: any[] = await fetchBiteshipRates(origin.postal, destPostal, weight, couriers);
    let source = 'biteship';
    if (rates.length === 0) {
      rates = simulateCourierRates(origin.postal, destPostal, weight);
      source = 'simulated';
    }
    const signed = rates.map((r) => ({
      ...r,
      quote: signQuote({
        s: storeId,
        w: weight,
        d: `postal:${destPostal}`,
        c: String(r.courier_code).toLowerCase(),
        v: String(r.courier_service_code || ''),
        n: `${r.courier_name} ${r.courier_service_name}`.slice(0, 64),
        p: Math.round(Number(r.price) || 0),
        b: origin.branchId,
        e: exp,
      }),
    }));
    return res.json({ success: true, source, weight, originBranchId: origin.branchId, rates: signed });
  } catch (err: any) {
    console.error('[shipping/quote]', err?.message);
    return res.status(500).json({ success: false, message: 'Gagal menghitung ongkos kirim.' });
  }
});

// Buat pesanan: ongkir hanya dari tarif bertanda tangan, harga produk dari database.
orderRouter.post('/orders/place', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const storeId = String(body.storeId || '').trim();
    const lines = parseCartLines(body.items);
    if (!ID_RE.test(storeId) || !lines) {
      return res.status(400).json({ success: false, message: 'Data pesanan tidak valid.' });
    }

    const quote = verifyQuote(body.shipping?.quote);
    if (!quote || quote.s !== storeId) {
      return res.status(409).json({
        success: false,
        code: 'SHIPPING_QUOTE_INVALID',
        message: 'Tarif ongkir sudah kedaluwarsa atau tidak valid. Silakan pilih ulang kurir pengiriman.',
      });
    }

    const weight = await computeCartWeight(storeId, lines);
    if (weight === null) {
      return res.status(400).json({ success: false, message: 'Ada produk yang tidak tersedia di toko ini.' });
    }
    const postal = String(body.shipping?.postal_code || '').trim();
    const city = clean(body.shipping?.city, 128);
    const destOk = quote.d.startsWith('postal:') ? quote.d === `postal:${postal}` : quote.d === `city:${city.toLowerCase()}`;
    if (weight !== quote.w || !destOk) {
      return res.status(409).json({
        success: false,
        code: 'SHIPPING_QUOTE_MISMATCH',
        message: 'Isi keranjang atau alamat berubah sejak ongkir dihitung. Silakan pilih ulang kurir pengiriman.',
      });
    }

    const customer = body.customer || {};
    const items = (body.items as any[]).map((it) => ({
      product_id: String(it.productId ?? it.product_id),
      quantity: Number(it.quantity),
      variant_info: it.variantInfo ?? it.variant_info ? clean(it.variantInfo ?? it.variant_info, 255) : null,
    }));
    const shipping = {
      cost: quote.p,
      city: city || null,
      courier: clean(body.shipping?.courier, 64) || quote.n,
      service: clean(body.shipping?.service, 64) || quote.n,
      courier_code: quote.c,
      postal_code: postal || null,
      origin_branch_id: quote.b,
    };

    const result = await pool.query(
      'SELECT public.place_order($1, $2::jsonb, $3::jsonb, $4::jsonb, $5, $6) AS result',
      [
        storeId,
        JSON.stringify({
          name: clean(customer.name, 255),
          phone: clean(customer.phone, 32),
          email: customer.email ? clean(customer.email, 255) : null,
          address: clean(customer.address, 2000),
        }),
        JSON.stringify(items),
        JSON.stringify(shipping),
        clean(body.paymentMethod, 120) || 'Manual',
        body.notes ? clean(body.notes, 2000) : null,
      ]
    );
    const order = result.rows[0]?.result;
    if (!order) return res.status(500).json({ success: false, message: 'Gagal membuat pesanan.' });
    return res.json({ success: true, order });
  } catch (err: any) {
    // Pesan validasi dari place_order (RAISE EXCEPTION) aman ditampilkan ke pembeli.
    const msg = String(err?.message || '');
    if (err?.code === 'P0001' && msg) return res.status(400).json({ success: false, message: msg });
    console.error('[orders/place]', msg);
    return res.status(500).json({ success: false, message: 'Gagal membuat pesanan. Silakan coba lagi.' });
  }
});

/**
 * Nominal tagihan yang sah untuk ID transaksi gateway, diambil dari database (bukan browser).
 * - Pesanan toko: `<order_number>` atau `<order_number>-<sufiks>` → orders.total_amount (belum lunas).
 * - Domain: `DOM-<id permintaan>-<sufiks>` / nomor invoice → domain_requests.tld_price (status approved).
 * - Langganan: order_id / invoice_number di store_subscriptions → amount (status pending).
 */
export async function resolveBillableAmount(
  merchantOrderId: string
): Promise<{ amount: number } | { error: string; status: number }> {
  if (/^(DOM-|INV-DOM)/.test(merchantOrderId)) {
    const requestId = merchantOrderId.startsWith('DOM-')
      ? merchantOrderId.slice(4).replace(/-[A-Za-z0-9]+$/, '')
      : '';
    const r = await pool.query(
      `SELECT tld_price, status, payment_status FROM domain_requests
        WHERE invoice_number = $1 OR ($2 <> '' AND id = $2) LIMIT 1`,
      [merchantOrderId, requestId]
    );
    const row = r.rows[0];
    if (!row) return { error: 'Tagihan domain tidak ditemukan.', status: 404 };
    if (row.payment_status === 'paid') return { error: 'Tagihan domain sudah lunas.', status: 409 };
    if (row.status !== 'approved') return { error: 'Permintaan domain belum disetujui.', status: 409 };
    return { amount: Math.round(Number(row.tld_price)) };
  }

  const candidates = Array.from(new Set([merchantOrderId, merchantOrderId.replace(/-[A-Za-z0-9]+$/, '')]));
  const o = await pool.query(
    'SELECT total_amount, payment_status FROM orders WHERE order_number = ANY($1::text[]) LIMIT 1',
    [candidates]
  );
  if (o.rows[0]) {
    if (o.rows[0].payment_status === 'paid') return { error: 'Pesanan ini sudah lunas.', status: 409 };
    return { amount: Math.round(Number(o.rows[0].total_amount)) };
  }

  const s = await pool.query(
    'SELECT amount, status FROM store_subscriptions WHERE order_id = $1 OR invoice_number = $1 LIMIT 1',
    [merchantOrderId]
  );
  if (s.rows[0]) {
    if (s.rows[0].status === 'paid') return { error: 'Tagihan langganan sudah lunas.', status: 409 };
    return { amount: Math.round(Number(s.rows[0].amount)) };
  }

  return { error: 'Tagihan tidak ditemukan. Buat pesanan terlebih dahulu.', status: 404 };
}
