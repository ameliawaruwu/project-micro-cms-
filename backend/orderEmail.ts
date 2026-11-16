import { pool } from './publicApiController';
import { sendMail, MailerNotConfiguredError } from './mailer';

/**
 * Email "Pembayaran diterima" untuk pembeli: nomor pesanan, nomor HP yang dipakai saat
 * memesan, rincian barang & biaya, serta tautan Lacak Pesanan di toko.
 *
 * Semua isi email diambil dari database (bukan dari browser) dan di-escape sebelum masuk HTML.
 * Pengiriman ganda dicegah lewat `sentOrders` (memori proses); jalur gateway juga hanya memanggil
 * fungsi ini saat saldo toko baru pertama kali dikredit (`credited = true`).
 */

const PUBLIC_BASE_DOMAIN = 'lapakq.com';
const EMAIL_RE = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[A-Za-z]{2,}$/;
const HOST_RE = /^[a-z0-9.-]{3,253}$/;
const SLUG_RE = /^[a-z0-9-]{1,63}$/;

const sentOrders = new Set<string>();

export type OrderPaidEmailResult =
  | 'sent'
  | 'already_sent'
  | 'no_email'
  | 'not_paid'
  | 'not_found'
  | 'mailer_not_configured'
  | 'failed';

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const rupiah = (n: unknown) => `Rp ${Math.round(Number(n) || 0).toLocaleString('id-ID')}`;

/** Rapikan alamat: buang bagian kosong seperti "-" atau "(Patokan / Catatan: -)". */
const cleanAddress = (address: unknown) =>
  String(address ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && p !== '-' && !/^\(Patokan \/ Catatan:\s*-?\s*\)$/.test(p))
    .join(', ');

/** Alamat publik toko yang sudah terbit (domain kustom, atau <slug>.<domain induk>). */
async function storeTrackUrl(store: any, orderNumber: string): Promise<string | null> {
  if (!store?.is_published || store?.is_suspended) return null;
  let host = String(store.custom_domain || '').trim().toLowerCase();
  if (!HOST_RE.test(host)) {
    const slug = String(store.slug || '').trim().toLowerCase();
    if (!SLUG_RE.test(slug)) return null;
    let base = PUBLIC_BASE_DOMAIN;
    if (store.community_id) {
      const r = await pool.query(
        `SELECT lower(base_domain) AS base FROM public.communities
          WHERE id = $1 AND coalesce(base_domain, '') <> '' AND coalesce(status, 'active') <> 'inactive' LIMIT 1`,
        [store.community_id]
      );
      const candidate = String(r.rows[0]?.base || '');
      if (HOST_RE.test(candidate)) base = candidate;
    }
    host = `${slug}.${base}`;
  }
  return `https://${host}/lacak?no=${encodeURIComponent(orderNumber)}`;
}

function buildHtml(order: any, items: any[], storeName: string, trackUrl: string | null): string {
  const subtotal = items.reduce((acc, i) => acc + (Number(i.subtotal) || Number(i.price) * Number(i.quantity) || 0), 0);
  const courier = [order.shipping_courier, order.shipping_service].filter(Boolean).join(' · ');
  const address = [cleanAddress(order.shipping_address), order.shipping_city].filter(Boolean).join(', ');

  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #EEE;font-size:13px;color:#1F1F1F;">
          ${esc(i.product_name)}${i.variant_info ? `<br><span style="font-size:11px;color:#777;">${esc(i.variant_info)}</span>` : ''}
          <br><span style="font-size:11px;color:#777;">${esc(i.quantity)} × ${esc(rupiah(i.price))}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #EEE;font-size:13px;color:#1F1F1F;text-align:right;white-space:nowrap;">${esc(rupiah(i.subtotal || Number(i.price) * Number(i.quantity)))}</td>
      </tr>`
    )
    .join('');

  const infoRow = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:4px 0;font-size:12px;color:#777;width:120px;vertical-align:top;">${esc(label)}</td>
           <td style="padding:4px 0;font-size:13px;color:#1F1F1F;font-weight:600;">${esc(value)}</td></tr>`
      : '';

  const trackBlock = trackUrl
    ? `<div style="text-align:center;margin:24px 0 8px;">
         <a href="${esc(trackUrl)}" style="display:inline-block;background:#66000E;color:#FFF;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;">Lacak Pesanan</a>
       </div>
       <p style="font-size:12px;color:#555;text-align:center;margin:0;">Untuk melacak, masukkan <b>Nomor Pesanan</b> dan <b>Nomor HP</b> di atas.</p>`
    : `<p style="font-size:12px;color:#555;margin:16px 0 0;">Simpan <b>Nomor Pesanan</b> dan <b>Nomor HP</b> di atas untuk melacak paket di halaman Lacak Pesanan toko.</p>`;

  return `<!doctype html><html><body style="margin:0;background:#F5F2F1;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#FFF;border:1px solid #E5E0DD;border-radius:16px;padding:24px;">
      <p style="font-size:12px;color:#777;margin:0 0 4px;">${esc(storeName)}</p>
      <h1 style="font-size:20px;color:#1F1F1F;margin:0 0 8px;">Pembayaran diterima ✅</h1>
      <p style="font-size:13px;color:#555;margin:0 0 20px;line-height:1.5;">
        Halo ${esc(order.customer_name || 'Pelanggan')}, pembayaran pesanan Anda sudah dikonfirmasi penjual dan pesanan sedang diproses.
      </p>

      <table style="width:100%;border-collapse:collapse;background:#FAF7F7;border:1px solid #E5E0DD;border-radius:12px;">
        <tr><td style="padding:12px 16px;">
          <table style="width:100%;border-collapse:collapse;">
            ${infoRow('Nomor Pesanan', `#${order.order_number}`)}
            ${infoRow('Nomor HP', order.customer_phone || '')}
            ${infoRow('Pembayaran', order.payment_method || '')}
            ${infoRow('Kurir', courier)}
            ${infoRow('Alamat', address)}
          </table>
        </td></tr>
      </table>

      <h2 style="font-size:14px;color:#1F1F1F;margin:20px 0 4px;">Rincian Pesanan</h2>
      <table style="width:100%;border-collapse:collapse;">
        ${rows}
        <tr><td style="padding:8px 0 2px;font-size:12px;color:#777;">Subtotal</td><td style="padding:8px 0 2px;font-size:12px;color:#1F1F1F;text-align:right;">${esc(rupiah(subtotal))}</td></tr>
        <tr><td style="padding:2px 0;font-size:12px;color:#777;">Ongkos kirim</td><td style="padding:2px 0;font-size:12px;color:#1F1F1F;text-align:right;">${esc(rupiah(order.shipping_cost))}</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;font-weight:700;color:#1F1F1F;border-top:1px solid #E5E0DD;">Total</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#66000E;text-align:right;border-top:1px solid #E5E0DD;">${esc(rupiah(order.total_amount))}</td></tr>
      </table>

      ${trackBlock}
    </div>
    <p style="font-size:11px;color:#999;text-align:center;margin:16px 0 0;">Email ini dikirim otomatis oleh LapakQ atas nama ${esc(storeName)}. Mohon tidak membalas email ini.</p>
  </div>
</body></html>`;
}

/**
 * Kirim email pembayaran diterima untuk pesanan `orderId`. Tidak pernah melempar error.
 * `maxPaidAgeMs`: bila diisi, email hanya dikirim bila `paid_at` masih baru (jalur verifikasi manual).
 */
export async function sendOrderPaidEmail(orderId: string, maxPaidAgeMs?: number): Promise<OrderPaidEmailResult> {
  if (sentOrders.has(orderId)) return 'already_sent';
  try {
    const orderRes = await pool.query(
      `SELECT id, store_id, order_number, customer_name, customer_phone, customer_email,
              shipping_address, shipping_city, shipping_courier, shipping_service, shipping_cost,
              total_amount, payment_method, payment_status, paid_at, order_status
         FROM public.orders WHERE id = $1 LIMIT 1`,
      [orderId]
    );
    const order = orderRes.rows[0];
    if (!order) return 'not_found';
    if (order.payment_status !== 'paid' || order.order_status === 'cancelled') return 'not_paid';
    if (maxPaidAgeMs !== undefined) {
      const paidAt = order.paid_at ? new Date(order.paid_at).getTime() : 0;
      if (!paidAt || Date.now() - paidAt > maxPaidAgeMs) return 'not_paid';
    }
    const email = String(order.customer_email || '').trim();
    if (!EMAIL_RE.test(email)) return 'no_email';

    const [itemsRes, storeRes] = await Promise.all([
      pool.query(
        `SELECT product_name, price, quantity, subtotal, variant_info
           FROM public.order_items WHERE order_id = $1 ORDER BY id LIMIT 100`,
        [orderId]
      ),
      pool.query(
        `SELECT name, slug, custom_domain, community_id, is_published, is_suspended
           FROM public.stores WHERE id = $1 LIMIT 1`,
        [order.store_id]
      ),
    ]);
    const store = storeRes.rows[0] || {};
    const storeName = String(store.name || 'Toko LapakQ');
    const trackUrl = await storeTrackUrl(store, String(order.order_number));

    // Tandai sebelum mengirim agar permintaan paralel tidak mengirim dua kali.
    sentOrders.add(orderId);
    try {
      await sendMail(
        email,
        `Pembayaran diterima - Pesanan #${String(order.order_number).replace(/[\r\n]/g, '')} (${storeName.replace(/[\r\n]/g, ' ')})`,
        buildHtml(order, itemsRes.rows, storeName, trackUrl)
      );
    } catch (err) {
      sentOrders.delete(orderId);
      throw err;
    }
    return 'sent';
  } catch (err: any) {
    if (err instanceof MailerNotConfiguredError) return 'mailer_not_configured';
    console.error('[orderEmail] gagal mengirim email pesanan lunas:', err?.message);
    return 'failed';
  }
}

// -----------------------------------------------------------------------------
// Email "Pesanan dibatalkan"
// -----------------------------------------------------------------------------

const cancelledOrders = new Set<string>();

export type OrderCancelledEmailResult = 'sent' | 'already_sent' | 'no_email' | 'not_cancelled' | 'not_found' | 'mailer_not_configured' | 'failed';

function buildCancelHtml(order: any, items: any[], storeName: string, trackUrl: string | null): string {
  const byBuyer = order.cancelled_by === 'buyer';
  const paid = order.payment_status === 'paid';
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #EEE;font-size:13px;color:#1F1F1F;">${esc(i.product_name)}${i.variant_info ? ` <span style="font-size:11px;color:#777;">(${esc(i.variant_info)})</span>` : ''} × ${esc(i.quantity)}</td>
      </tr>`
    )
    .join('');
  const intro = byBuyer
    ? 'pesanan Anda sudah dibatalkan sesuai permintaan Anda.'
    : `pesanan Anda dibatalkan oleh penjual ${esc(storeName)}.`;
  const reason = order.cancel_reason
    ? `<p style="font-size:13px;color:#555;margin:0 0 16px;line-height:1.5;"><b>Alasan:</b> ${esc(order.cancel_reason)}</p>`
    : '';
  const refund = paid
    ? `<p style="font-size:13px;color:#1F1F1F;background:#FFF7E6;border:1px solid #F5D9A8;border-radius:10px;padding:12px;margin:16px 0 0;line-height:1.5;">
         Pembayaran sebesar <b>${esc(rupiah(order.total_amount))}</b> sudah tercatat. Penjual akan menghubungi Anda untuk proses pengembalian dana.
       </p>`
    : '';
  const track = trackUrl
    ? `<div style="text-align:center;margin:24px 0 0;"><a href="${esc(trackUrl)}" style="display:inline-block;background:#66000E;color:#FFF;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;">Lihat Status Pesanan</a></div>`
    : '';

  return `<!doctype html><html><body style="margin:0;background:#F5F2F1;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#FFF;border:1px solid #E5E0DD;border-radius:16px;padding:24px;">
      <p style="font-size:12px;color:#777;margin:0 0 4px;">${esc(storeName)}</p>
      <h1 style="font-size:20px;color:#1F1F1F;margin:0 0 8px;">Pesanan dibatalkan</h1>
      <p style="font-size:13px;color:#555;margin:0 0 12px;line-height:1.5;">
        Halo ${esc(order.customer_name || 'Pelanggan')}, ${intro}
      </p>
      ${reason}
      <p style="font-size:12px;color:#777;margin:0 0 4px;">Nomor Pesanan</p>
      <p style="font-size:15px;font-weight:700;color:#1F1F1F;margin:0 0 16px;">#${esc(order.order_number)}</p>
      <table style="width:100%;border-collapse:collapse;">${rows}
        <tr><td style="padding:8px 0;font-size:14px;font-weight:700;color:#1F1F1F;">Total ${esc(rupiah(order.total_amount))}</td></tr>
      </table>
      ${refund}
      ${track}
    </div>
    <p style="font-size:11px;color:#999;text-align:center;margin:16px 0 0;">Email ini dikirim otomatis oleh LapakQ atas nama ${esc(storeName)}. Mohon tidak membalas email ini.</p>
  </div>
</body></html>`;
}

/** Kirim email pembatalan untuk pesanan `orderId` (status harus sudah 'cancelled'). Tidak pernah melempar error. */
export async function sendOrderCancelledEmail(orderId: string): Promise<OrderCancelledEmailResult> {
  if (cancelledOrders.has(orderId)) return 'already_sent';
  try {
    const orderRes = await pool.query(
      `SELECT id, store_id, order_number, customer_name, customer_email, total_amount,
              payment_status, order_status, cancel_reason, cancelled_by
         FROM public.orders WHERE id = $1 LIMIT 1`,
      [orderId]
    );
    const order = orderRes.rows[0];
    if (!order) return 'not_found';
    if (order.order_status !== 'cancelled') return 'not_cancelled';
    const email = String(order.customer_email || '').trim();
    if (!EMAIL_RE.test(email)) return 'no_email';

    const [itemsRes, storeRes] = await Promise.all([
      pool.query(
        `SELECT product_name, quantity, variant_info FROM public.order_items WHERE order_id = $1 ORDER BY id LIMIT 100`,
        [orderId]
      ),
      pool.query(
        `SELECT name, slug, custom_domain, community_id, is_published, is_suspended
           FROM public.stores WHERE id = $1 LIMIT 1`,
        [order.store_id]
      ),
    ]);
    const store = storeRes.rows[0] || {};
    const storeName = String(store.name || 'Toko LapakQ');
    const trackUrl = await storeTrackUrl(store, String(order.order_number));

    cancelledOrders.add(orderId);
    try {
      await sendMail(
        email,
        `Pesanan dibatalkan - #${String(order.order_number).replace(/[\r\n]/g, '')} (${storeName.replace(/[\r\n]/g, ' ')})`,
        buildCancelHtml(order, itemsRes.rows, storeName, trackUrl)
      );
    } catch (err) {
      cancelledOrders.delete(orderId);
      throw err;
    }
    return 'sent';
  } catch (err: any) {
    if (err instanceof MailerNotConfiguredError) return 'mailer_not_configured';
    console.error('[orderEmail] gagal mengirim email pembatalan:', err?.message);
    return 'failed';
  }
}
