import { Router, type Request, type Response } from 'express';
import { pool } from './publicApiController';
import { requireSession, requireStoreManager } from './sessionAuth';

/**
 * Pemesanan kurir & resi (Biteship) untuk pesanan merchant.
 *
 * `POST /api/shipping/create-shipment` { orderId, deliveryType, pickupDate?, pickupTime?,
 *   originBranchId?, courierCode, courierService }
 *
 * - Wajib sesi login dengan hak kelola toko pemilik pesanan (dicek dari database, bukan body).
 * - Pesanan non-COD wajib sudah lunas; COD wajib sudah dikonfirmasi (processing). Pesanan
 *   batal atau yang sudah punya resi ditolak, jadi resi tidak bisa dipesan dua kali.
 * - Data pengirim (cabang/toko), penerima, barang, berat, dan nominal COD diambil dari
 *   database. Browser hanya memilih kurir, metode (antar/jemput), cabang, dan jadwal jemput.
 * - Tidak ada resi simulasi: bila Biteship belum dikonfigurasi atau menolak, merchant
 *   mendapat kode galat dan pesanan tidak berubah.
 */
export const shipmentRouter = Router();

const ID_RE = /^[A-Za-z0-9_-]{1,80}$/;
const CODE_RE = /^[a-z0-9_]{2,30}$/;
const POSTAL_RE = /^[0-9]{5}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Buang karakter kontrol dan tanda kurung sudut.
const clean = (v: unknown, max: number) =>
  String(v ?? '')
    .replace(/[\u0000-\u001F\u007F<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const phoneDigits = (v: unknown) => {
  let d = String(v ?? '').replace(/[^0-9]/g, '');
  if (d.startsWith('62')) d = `0${d.slice(2)}`;
  return d.length >= 9 && d.length <= 15 ? d : '';
};

const isCod = (method: unknown) => /\bCOD\b/i.test(String(method || ''));

const WINDOW_MS = 60 * 1000;
const MAX_PER_USER = 10;
const hits = new Map<string, number[]>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const list = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_USER) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 2000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return false;
}

// Satu pemesanan per pesanan dalam satu waktu (cegah resi ganda karena klik berulang).
const inflight = new Set<string>();

type Fail = { status: number; code: string; message: string; providerMessage?: string };
const fail = (res: Response, f: Fail) =>
  res.status(f.status).json({ success: false, code: f.code, message: f.message, providerMessage: f.providerMessage });

const authHeader = (apiKey: string) => (apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`);

/** Kirim `POST /v1/orders`. `ok: false` hanya bila Biteship tidak terjangkau. */
async function postBiteshipOrder(
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; httpOk: boolean; data: any; waybill: string }> {
  try {
    const r = await fetch('https://api.biteship.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: authHeader(apiKey), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });
    const data: any = await r.json().catch(() => null);
    const waybill = clean(data?.courier?.waybill_id || data?.courier?.tracking_id, 80);
    return { ok: true, httpOk: r.ok, data, waybill: r.ok && data?.success !== false ? waybill : '' };
  } catch (err: any) {
    console.error('[create-shipment] Biteship tidak terjangkau:', err?.message);
    return { ok: false, httpOk: false, data: null, waybill: '' };
  }
}

/** Tanggal hari ini di WIB (YYYY-MM-DD). */
function todayWib(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

shipmentRouter.post('/shipping/create-shipment', async (req: Request, res: Response) => {
  const body = req.body || {};
  const orderId = String(body.orderId || '').trim();
  const deliveryType = body.deliveryType === 'pickup' ? 'pickup' : body.deliveryType === 'drop_off' ? 'drop_off' : '';
  const courierCode = String(body.courierCode || '').trim().toLowerCase();
  const courierService = String(body.courierService || '').trim().toLowerCase();
  const branchId = body.originBranchId ? String(body.originBranchId).trim() : '';

  if (!ID_RE.test(orderId) || !deliveryType || !CODE_RE.test(courierCode) || !CODE_RE.test(courierService) || (branchId && !ID_RE.test(branchId))) {
    return fail(res, { status: 400, code: 'invalid', message: 'Data pengiriman tidak valid.' });
  }

  let pickupDate = '';
  let pickupTime = '';
  if (deliveryType === 'pickup') {
    pickupDate = String(body.pickupDate || '').trim();
    pickupTime = String(body.pickupTime || '').trim();
    const today = todayWib();
    const maxDate = new Date(Date.parse(`${today}T00:00:00Z`) + 7 * 86400000).toISOString().slice(0, 10);
    if (!DATE_RE.test(pickupDate) || !TIME_RE.test(pickupTime) || pickupDate < today || pickupDate > maxDate) {
      return fail(res, { status: 400, code: 'invalid_pickup', message: 'Jadwal penjemputan tidak valid (maksimal 7 hari ke depan).' });
    }
  }

  try {
    const orderRes = await pool.query(
      `SELECT id, store_id, order_number, customer_name, customer_phone, customer_email,
              shipping_address, destination_address, destination_postal_code, total_amount,
              payment_method, payment_status, order_status, tracking_number, notes
         FROM public.orders WHERE id = $1 LIMIT 1`,
      [orderId]
    );
    const order = orderRes.rows[0];
    if (!order) return fail(res, { status: 404, code: 'not_found', message: 'Pesanan tidak ditemukan.' });

    const storeId = String(order.store_id);
    const user = await requireStoreManager(req, res, storeId);
    if (!user) return;
    if (rateLimited(`u:${user.id}`)) {
      return fail(res, { status: 429, code: 'rate_limited', message: 'Terlalu banyak permintaan. Coba lagi sebentar.' });
    }

    if (order.order_status === 'cancelled') {
      return fail(res, { status: 409, code: 'cancelled', message: 'Pesanan sudah dibatalkan.' });
    }
    if (order.tracking_number || (order.order_status !== 'pending' && order.order_status !== 'processing')) {
      return fail(res, { status: 409, code: 'already_shipped', message: 'Pesanan ini sudah punya resi atau sudah dikirim.' });
    }
    const cod = isCod(order.payment_method);
    if (cod && order.order_status !== 'processing') {
      return fail(res, { status: 409, code: 'cod_unconfirmed', message: 'Konfirmasi pesanan COD terlebih dahulu.' });
    }
    if (!cod && order.payment_status !== 'paid') {
      return fail(res, { status: 409, code: 'unpaid', message: 'Pesanan belum lunas.' });
    }

    // Asal pengiriman: cabang pilihan (milik toko & aktif) → cabang utama → alamat toko.
    const storeRes = await pool.query(
      'SELECT name, phone_whatsapp, address, address_detail, postal_code FROM public.stores WHERE id = $1',
      [storeId]
    );
    const store = storeRes.rows[0] || {};
    const branchRes = await pool.query(
      `SELECT id, branch_name, pic_name, pic_phone, address, subdistrict, city, province, postal_code
         FROM public.shipping_branches
        WHERE store_id = $1 AND coalesce(is_active, true) = true AND ($2::text = '' OR id::text = $2::text)
        ORDER BY (id::text = $2::text) DESC, is_default DESC, created_at ASC
        LIMIT 1`,
      [storeId, branchId]
    );
    const branch = branchRes.rows[0];
    if (branchId && (!branch || String(branch.id) !== branchId)) {
      return fail(res, { status: 400, code: 'branch_not_found', message: 'Cabang pengiriman tidak ditemukan.' });
    }

    const originName = clean(branch?.pic_name || store.name, 100);
    const originPhone = phoneDigits(branch?.pic_phone || store.phone_whatsapp);
    const originAddress = branch
      ? clean([branch.address, branch.subdistrict, branch.city, branch.province].filter(Boolean).join(', '), 500)
      : clean([store.address, store.address_detail].filter(Boolean).join(', '), 500);
    const originPostal = String(branch?.postal_code || store.postal_code || '').trim();
    if (!originName || !originPhone || originAddress.length < 10 || !POSTAL_RE.test(originPostal)) {
      return fail(res, {
        status: 422,
        code: 'origin_incomplete',
        message: 'Lengkapi alamat, kode pos, dan nomor HP cabang pengiriman (atau alamat toko) terlebih dahulu.',
      });
    }

    const destName = clean(order.customer_name, 100);
    const destPhone = phoneDigits(order.customer_phone);
    const destAddress = clean(order.destination_address || order.shipping_address, 500);
    const destPostal = String(order.destination_postal_code || '').trim();
    if (!destName || !destPhone || destAddress.length < 10 || !POSTAL_RE.test(destPostal)) {
      return fail(res, {
        status: 422,
        code: 'destination_incomplete',
        message: 'Alamat, kode pos, atau nomor HP pembeli belum lengkap untuk dipesankan kurir.',
      });
    }

    const itemsRes = await pool.query(
      `SELECT oi.product_name, oi.price, oi.quantity, p.weight_grams
         FROM public.order_items oi
         LEFT JOIN public.products p ON p.id = oi.product_id
        WHERE oi.order_id = $1`,
      [orderId]
    );
    const items = itemsRes.rows.map((r: any) => {
      const w = Number(r.weight_grams);
      return {
        name: clean(r.product_name, 100) || 'Produk',
        value: Math.max(0, Math.round(Number(r.price) || 0)),
        quantity: Math.max(1, Math.round(Number(r.quantity) || 1)),
        weight: Number.isFinite(w) && w > 0 ? Math.round(w) : 250,
      };
    });
    if (items.length === 0) {
      return fail(res, { status: 422, code: 'no_items', message: 'Pesanan tidak memiliki barang.' });
    }

    const apiKey = (process.env.BITESHIP_API_KEY || '').trim();
    if (!apiKey) {
      return fail(res, { status: 503, code: 'not_configured', message: 'Layanan pemesanan kurir belum dikonfigurasi.' });
    }

    if (inflight.has(orderId)) {
      return fail(res, { status: 409, code: 'busy', message: 'Pemesanan kurir untuk pesanan ini sedang diproses.' });
    }
    inflight.add(orderId);
    try {
      const payload: Record<string, unknown> = {
        reference_id: String(order.order_number || orderId).slice(0, 50),
        shipper_contact_name: clean(store.name, 100) || originName,
        shipper_contact_phone: originPhone,
        shipper_organization: clean(store.name, 100) || undefined,
        origin_contact_name: originName,
        origin_contact_phone: originPhone,
        origin_address: originAddress,
        origin_postal_code: Number(originPostal),
        origin_collection_method: deliveryType,
        destination_contact_name: destName,
        destination_contact_phone: destPhone,
        destination_contact_email: order.customer_email ? clean(order.customer_email, 254) : undefined,
        destination_address: destAddress,
        destination_postal_code: Number(destPostal),
        courier_company: courierCode,
        courier_type: courierService,
        delivery_type: deliveryType === 'pickup' ? 'scheduled' : 'now',
        order_note: order.notes ? clean(order.notes, 200) : undefined,
        items,
      };
      if (deliveryType === 'pickup') {
        payload.delivery_date = pickupDate;
        payload.delivery_time = pickupTime;
      }
      if (cod) {
        payload.destination_cash_on_delivery = Math.round(Number(order.total_amount) || 0);
        payload.destination_cash_on_delivery_type = '7_days';
      }

      let result = await postBiteshipOrder(apiKey, payload);
      // Banyak layanan reguler tidak menerima jadwal jemput ("not available for scheduled
      // delivery"). Ulangi sekali sebagai `now`: resi terbit dan kurir menjemput di jam operasional.
      let scheduled = deliveryType === 'pickup';
      if (
        scheduled &&
        result.ok &&
        !result.waybill &&
        /schedul/i.test(String(result.data?.error || result.data?.message || ''))
      ) {
        delete payload.delivery_date;
        delete payload.delivery_time;
        payload.delivery_type = 'now';
        scheduled = false;
        result = await postBiteshipOrder(apiKey, payload);
      }
      if (!result.ok) {
        return fail(res, { status: 502, code: 'provider_unreachable', message: 'Layanan kurir tidak dapat dihubungi. Coba lagi beberapa saat.' });
      }
      const data = result.data;
      const httpOk = result.httpOk;

      const trackingNumber = result.waybill;
      if (!httpOk || data?.success === false || !trackingNumber) {
        const providerMessage = clean(data?.error || data?.message, 200) || undefined;
        console.warn('[create-shipment] Biteship menolak:', order.order_number, providerMessage || `HTTP gagal`);
        return fail(res, {
          status: 422,
          code: 'courier_rejected',
          message: 'Kurir menolak pemesanan.',
          providerMessage,
        });
      }

      const shippingOrderId = clean(data?.id, 80) || null;
      const trackingUrl = /^https:\/\//.test(String(data?.courier?.link || '')) ? clean(data.courier.link, 500) : null;
      const pickupAt = scheduled ? `${pickupDate}T${pickupTime}:00+07:00` : null;

      const upd = await pool.query(
        `UPDATE public.orders
            SET tracking_number = $3,
                shipping_order_id = $4,
                shipping_label_url = $5,
                courier_code = $6,
                courier_service = $7,
                shipping_method = $8,
                origin_branch_id = $9,
                pickup_time = $10,
                order_status = 'shipped',
                shipped_at = now(),
                updated_at = now()
          WHERE id = $1 AND store_id = $2 AND tracking_number IS NULL
          RETURNING id`,
        [orderId, storeId, trackingNumber, shippingOrderId, trackingUrl, courierCode, courierService, deliveryType, branch ? String(branch.id) : null, pickupAt]
      );
      if (upd.rowCount === 0) {
        // Resi sudah dipesan tetapi pesanan berubah bersamaan; catat agar bisa ditindaklanjuti.
        console.error('[create-shipment] resi dipesan tetapi pesanan tidak diperbarui:', order.order_number, shippingOrderId);
        return fail(res, { status: 409, code: 'already_shipped', message: 'Pesanan ini sudah punya resi atau sudah dikirim.' });
      }

      return res.json({
        success: true,
        trackingNumber,
        shippingOrderId,
        trackingUrl,
        status: clean(data?.status, 40) || 'confirmed',
        deliveryType,
        pickupScheduled: scheduled,
      });
    } finally {
      inflight.delete(orderId);
    }
  } catch (err: any) {
    console.error('[create-shipment]', err?.message);
    return fail(res, { status: 500, code: 'failed', message: 'Gagal memesan kurir. Silakan coba lagi.' });
  }
});

/**
 * `GET /api/shipping/couriers` — daftar layanan kurir Biteship beserta metode serah terima
 * yang benar-benar didukung (`available_collection_method`), agar merchant tidak memilih
 * drop-off untuk layanan yang hanya bisa dijemput. Wajib sesi login; disimpan 1 jam.
 */
type CourierOption = {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  available_for_drop_off: boolean;
  available_for_pickup: boolean;
  tier?: string;
  description?: string;
};

const COURIER_TTL_MS = 60 * 60 * 1000;
// Layanan instan/same-day butuh koordinat titik jemput & antar, tidak didukung alur resi ini.
const UNSUPPORTED_TIERS = new Set(['instant', 'same_day']);
let courierCache: { at: number; list: CourierOption[] } | null = null;

shipmentRouter.get('/shipping/couriers', async (req: Request, res: Response) => {
  const user = await requireSession(req, res);
  if (!user) return;

  if (courierCache && Date.now() - courierCache.at < COURIER_TTL_MS) {
    return res.json({ success: true, couriers: courierCache.list });
  }

  const apiKey = (process.env.BITESHIP_API_KEY || '').trim();
  if (!apiKey) {
    return fail(res, { status: 503, code: 'not_configured', message: 'Layanan kurir belum dikonfigurasi.' });
  }

  try {
    const resp = await fetch('https://api.biteship.com/v1/couriers', {
      headers: { Authorization: apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    const data: any = await resp.json().catch(() => ({}));
    if (!resp.ok || !Array.isArray(data?.couriers)) {
      console.error('[shipping/couriers] Biteship error:', resp.status, data?.error || data?.code);
      return fail(res, { status: 502, code: 'provider_error', message: 'Daftar kurir tidak dapat dimuat.' });
    }

    const seen = new Set<string>();
    const list: CourierOption[] = [];
    for (const c of data.couriers) {
      const code = String(c?.courier_code || '').trim().toLowerCase();
      const service = String(c?.courier_service_code || '').trim().toLowerCase();
      const tier = String(c?.tier || '').trim().toLowerCase();
      if (!CODE_RE.test(code) || !CODE_RE.test(service) || UNSUPPORTED_TIERS.has(tier)) continue;
      const key = `${code}:${service}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const methods: string[] = Array.isArray(c?.available_collection_method)
        ? c.available_collection_method.map((m: unknown) => String(m).toLowerCase().replace(/[^a-z]/g, ''))
        : ['pickup']; // tanpa info: anggap hanya jemput, jangan tawarkan drop-off.
      const pickup = methods.includes('pickup');
      const dropOff = methods.includes('dropoff');
      if (!pickup && !dropOff) continue;

      list.push({
        courier_name: clean(c.courier_name, 60) || code.toUpperCase(),
        courier_code: code,
        courier_service_name: clean(c.courier_service_name, 80) || service.toUpperCase(),
        courier_service_code: service,
        available_for_drop_off: dropOff,
        available_for_pickup: pickup,
        tier: tier || undefined,
        description: clean(c.description, 200) || undefined,
      });
    }

    courierCache = { at: Date.now(), list };
    return res.json({ success: true, couriers: list });
  } catch (err: any) {
    console.error('[shipping/couriers] fetch failed:', err?.message);
    return fail(res, { status: 502, code: 'provider_error', message: 'Daftar kurir tidak dapat dimuat.' });
  }
});

/**
 * `POST /api/shipping/route-couriers` { orderId, originBranchId? } — metode serah terima per
 * layanan untuk rute pesanan ini, dari Rates API Biteship (`available_collection_method`).
 * Daftar `GET /couriers` tidak memuat info drop-off; dukungan drop-off bergantung pada rute
 * (kota asal) sehingga harus dicek per pesanan. Asal, tujuan, dan berat diambil dari database.
 */
shipmentRouter.post('/shipping/route-couriers', async (req: Request, res: Response) => {
  const body = req.body || {};
  const orderId = String(body.orderId || '').trim();
  const branchId = body.originBranchId ? String(body.originBranchId).trim() : '';
  if (!ID_RE.test(orderId) || (branchId && !ID_RE.test(branchId))) {
    return fail(res, { status: 400, code: 'invalid', message: 'Data tidak valid.' });
  }

  try {
    const orderRes = await pool.query(
      'SELECT store_id, destination_postal_code FROM public.orders WHERE id = $1 LIMIT 1',
      [orderId]
    );
    const order = orderRes.rows[0];
    if (!order) return fail(res, { status: 404, code: 'not_found', message: 'Pesanan tidak ditemukan.' });
    const storeId = String(order.store_id);
    const user = await requireStoreManager(req, res, storeId);
    if (!user) return;
    if (rateLimited(`r:${user.id}`)) {
      return fail(res, { status: 429, code: 'rate_limited', message: 'Terlalu banyak permintaan. Coba lagi sebentar.' });
    }

    const branchRes = await pool.query(
      `SELECT postal_code FROM public.shipping_branches
        WHERE store_id = $1 AND coalesce(is_active, true) = true AND ($2::text = '' OR id::text = $2::text)
        ORDER BY (id::text = $2::text) DESC, is_default DESC, created_at ASC
        LIMIT 1`,
      [storeId, branchId]
    );
    let originPostal = String(branchRes.rows[0]?.postal_code || '').trim();
    if (!originPostal) {
      const st = await pool.query('SELECT postal_code FROM public.stores WHERE id = $1', [storeId]);
      originPostal = String(st.rows[0]?.postal_code || '').trim();
    }
    const destPostal = String(order.destination_postal_code || '').trim();
    if (!POSTAL_RE.test(originPostal) || !POSTAL_RE.test(destPostal)) {
      return fail(res, { status: 422, code: 'postal_missing', message: 'Kode pos asal atau tujuan belum lengkap.' });
    }

    const itemsRes = await pool.query(
      `SELECT oi.price, oi.quantity, p.weight_grams
         FROM public.order_items oi
         LEFT JOIN public.products p ON p.id = oi.product_id
        WHERE oi.order_id = $1`,
      [orderId]
    );
    let weight = 0;
    let value = 0;
    for (const r of itemsRes.rows) {
      const q = Math.max(1, Math.round(Number(r.quantity) || 1));
      const w = Number(r.weight_grams);
      weight += (Number.isFinite(w) && w > 0 ? Math.round(w) : 250) * q;
      value += Math.max(0, Math.round(Number(r.price) || 0)) * q;
    }

    const apiKey = (process.env.BITESHIP_API_KEY || '').trim();
    if (!apiKey) return fail(res, { status: 503, code: 'not_configured', message: 'Layanan kurir belum dikonfigurasi.' });

    // Kode kurir dari daftar layanan (cache); bila belum ada, pakai kurir reguler umum.
    const codes = courierCache
      ? Array.from(new Set(courierCache.list.map((c) => c.courier_code)))
      : ['jne', 'jnt', 'sicepat', 'anteraja', 'pos', 'tiki', 'ninja', 'lion', 'idexpress', 'sap', 'wahana', 'rpx', 'sentralcargo'];

    const resp = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST',
      headers: { Authorization: authHeader(apiKey), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin_postal_code: Number(originPostal),
        destination_postal_code: Number(destPostal),
        couriers: codes.join(','),
        items: [{ name: 'Paket', value: Math.max(1000, value), weight: Math.max(100, weight), quantity: 1 }],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data: any = await resp.json().catch(() => ({}));
    if (!resp.ok || !Array.isArray(data?.pricing)) {
      console.warn('[shipping/route-couriers] Biteship error:', resp.status, data?.error || data?.code);
      return fail(res, { status: 502, code: 'provider_error', message: 'Metode kurir untuk rute ini tidak dapat dimuat.' });
    }

    const seen = new Set<string>();
    const list: CourierOption[] = [];
    for (const p of data.pricing) {
      const code = String(p?.courier_code || p?.company || '').trim().toLowerCase();
      const service = String(p?.courier_service_code || p?.type || '').trim().toLowerCase();
      const tier = String(p?.tier || '').trim().toLowerCase();
      if (!CODE_RE.test(code) || !CODE_RE.test(service) || UNSUPPORTED_TIERS.has(tier)) continue;
      const key = `${code}:${service}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const methods: string[] = Array.isArray(p?.available_collection_method)
        ? p.available_collection_method.map((m: unknown) => String(m).toLowerCase().replace(/[^a-z]/g, ''))
        : ['pickup'];
      const pickup = methods.includes('pickup');
      const dropOff = methods.includes('dropoff');
      if (!pickup && !dropOff) continue;
      list.push({
        courier_name: clean(p.courier_name || p.company, 60) || code.toUpperCase(),
        courier_code: code,
        courier_service_name: clean(p.courier_service_name, 80) || service.toUpperCase(),
        courier_service_code: service,
        available_for_drop_off: dropOff,
        available_for_pickup: pickup,
        tier: tier || undefined,
        description: clean(p.description, 200) || undefined,
      });
    }
    return res.json({ success: true, couriers: list });
  } catch (err: any) {
    console.error('[shipping/route-couriers]', err?.message);
    return fail(res, { status: 502, code: 'provider_error', message: 'Metode kurir untuk rute ini tidak dapat dimuat.' });
  }
});
