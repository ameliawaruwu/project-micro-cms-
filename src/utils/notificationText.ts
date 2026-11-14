import { formatRupiah } from './formatters';
import type { AppNotification } from '../services/notificationService';

/**
 * Teks notifikasi dua bahasa. Database menyimpan `type` + `data` (parameter
 * mentah); kalimat disusun di sini sesuai bahasa aktif, sehingga notifikasi
 * ikut berganti saat switch bahasa. `title`/`body` dari database hanya dipakai
 * sebagai cadangan untuk tipe yang belum dikenal.
 */
type Text = { title: string; body: string };

const str = (v: unknown, fallback = '-') => {
  const s = typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '';
  return s || fallback;
};
const money = (v: unknown) => formatRupiah(typeof v === 'number' ? v : Number(v) || 0);

const TICKET_STATUS: Record<string, { id: string; en: string }> = {
  pending: { id: 'menunggu', en: 'pending' },
  in_progress: { id: 'sedang diproses', en: 'in progress' },
  resolved: { id: 'selesai', en: 'resolved' },
};

const DOMAIN_STATUS: Record<string, { id: string; en: string }> = {
  pending: { id: 'menunggu peninjauan', en: 'is awaiting review' },
  approved: { id: 'disetujui, silakan lakukan pembayaran', en: 'was approved, please complete the payment' },
  active: { id: 'sudah aktif', en: 'is now active' },
  rejected: { id: 'ditolak', en: 'was rejected' },
};

const WITHDRAWAL_STATUS: Record<string, { id: string; en: string }> = {
  pending: { id: 'menunggu', en: 'pending' },
  approved: { id: 'disetujui', en: 'approved' },
  completed: { id: 'selesai ditransfer', en: 'transferred' },
  paid: { id: 'selesai ditransfer', en: 'transferred' },
  rejected: { id: 'ditolak', en: 'rejected' },
};

const ROLE_LABEL: Record<string, { id: string; en: string }> = {
  merchant: { id: 'pemilik toko', en: 'store owner' },
  sub_admin: { id: 'Sub-Admin Utama', en: 'Main Sub-Admin' },
  sub_admin_umum: { id: 'Sub-Admin Utama', en: 'Main Sub-Admin' },
  community_admin: { id: 'Sub-Admin Produk', en: 'Product Sub-Admin' },
  sub_admin_produk: { id: 'Sub-Admin Produk', en: 'Product Sub-Admin' },
};

const pick = (map: Record<string, { id: string; en: string }>, key: unknown, isEn: boolean) => {
  const k = str(key, '');
  const hit = map[k];
  return hit ? (isEn ? hit.en : hit.id) : k || '-';
};

export const notificationText = (n: AppNotification, isEn: boolean): Text => {
  const d = n.data || {};
  switch (n.type) {
    case 'order_new':
      return isEn
        ? { title: `New order ${str(d.order_number, '')}`.trim(), body: `Total ${money(d.amount)} · awaiting payment/processing.` }
        : { title: `Pesanan baru ${str(d.order_number, '')}`.trim(), body: `Total ${money(d.amount)} · menunggu pembayaran/proses.` };
    case 'order_paid':
      return isEn
        ? { title: `Payment received ${str(d.order_number, '')}`.trim(), body: `The ${money(d.amount)} order is paid. Please process the shipment.` }
        : { title: `Pembayaran diterima ${str(d.order_number, '')}`.trim(), body: `Pesanan sebesar ${money(d.amount)} sudah lunas. Segera proses pengiriman.` };
    case 'product_added':
      return isEn
        ? { title: 'New product added to your store', body: `"${str(d.product)}" was added by ${str(d.actor, 'an admin')}.` }
        : { title: 'Produk baru ditambahkan ke toko Anda', body: `"${str(d.product)}" ditambahkan oleh ${str(d.actor, 'admin')}.` };
    case 'community_joined':
      return isEn
        ? { title: 'Your store joined a community', body: `"${str(d.store)}" is now a member store of ${str(d.community)}.` }
        : { title: 'Toko Anda bergabung dengan komunitas', body: `"${str(d.store)}" kini menjadi toko binaan komunitas ${str(d.community)}.` };
    case 'community_store_added':
      return isEn
        ? { title: 'New member store', body: `"${str(d.store)}" joined ${str(d.community)}. You can now add its products.` }
        : { title: 'Toko binaan baru', body: `"${str(d.store)}" bergabung dengan komunitas ${str(d.community)}. Anda bisa menambahkan produknya.` };
    case 'join_request_new':
      return isEn
        ? { title: 'Community join request', body: `"${str(d.store)}" wants to join ${str(d.community, 'your community')}.` }
        : { title: 'Permintaan gabung komunitas', body: `"${str(d.store)}" ingin bergabung dengan ${str(d.community, 'komunitas Anda')}.` };
    case 'join_request_rejected': {
      const note = str(d.note, '');
      return isEn
        ? { title: 'Join request rejected', body: `The request from "${str(d.store)}" to ${str(d.community, 'the community')} was rejected${note ? `: ${note}` : '.'}` }
        : { title: 'Permintaan gabung ditolak', body: `Permintaan "${str(d.store)}" ke ${str(d.community, 'komunitas')} ditolak${note ? `: ${note}` : '.'}` };
    }
    case 'ticket_new':
      return isEn
        ? { title: `New support ticket ${str(d.ticket_number, '')}`.trim(), body: `${str(d.requester, 'A user')}: ${str(d.subject)}` }
        : { title: `Tiket bantuan baru ${str(d.ticket_number, '')}`.trim(), body: `${str(d.requester, 'Pengguna')}: ${str(d.subject)}` };
    case 'ticket_update': {
      const status = pick(TICKET_STATUS, d.status, isEn);
      return isEn
        ? { title: `Ticket ${str(d.ticket_number, '')} updated`.replace('  ', ' '), body: `"${str(d.subject)}" is now ${status}${d.replied ? ' · new reply from admin.' : '.'}` }
        : { title: `Tiket ${str(d.ticket_number, '')} diperbarui`.replace('  ', ' '), body: `"${str(d.subject)}" kini ${status}${d.replied ? ' · ada balasan baru dari admin.' : '.'}` };
    }
    case 'domain_request_new':
      return isEn
        ? { title: 'New domain request', body: `${str(d.store, 'A store')} requested ${str(d.domain)}.` }
        : { title: 'Pengajuan domain baru', body: `${str(d.store, 'Toko')} mengajukan ${str(d.domain)}.` };
    case 'domain_payment_proof':
      return isEn
        ? { title: 'Domain payment proof received', body: `${str(d.store, 'A store')} sent a payment proof for ${str(d.domain)}.` }
        : { title: 'Bukti bayar domain masuk', body: `${str(d.store, 'Toko')} mengirim bukti bayar untuk ${str(d.domain)}.` };
    case 'domain_status': {
      const status = pick(DOMAIN_STATUS, d.status, isEn);
      return isEn
        ? { title: `Domain status ${str(d.domain, '')}`.trim(), body: `Your domain request ${str(d.domain)} ${status}.` }
        : { title: `Status domain ${str(d.domain, '')}`.trim(), body: `Pengajuan domain ${str(d.domain)} ${status}.` };
    }
    case 'withdrawal_new':
      return isEn
        ? { title: 'Withdrawal request', body: `${str(d.store, 'A store')} requested a ${money(d.amount)} withdrawal.` }
        : { title: 'Permintaan penarikan dana', body: `${str(d.store, 'Toko')} meminta penarikan ${money(d.amount)}.` };
    case 'withdrawal_status': {
      const status = pick(WITHDRAWAL_STATUS, d.status, isEn);
      return isEn
        ? { title: 'Withdrawal status', body: `Your ${money(d.amount)} withdrawal is now ${status}.` }
        : { title: 'Status penarikan dana', body: `Penarikan ${money(d.amount)} kini berstatus ${status}.` };
    }
    case 'user_new': {
      const role = pick(ROLE_LABEL, d.role, isEn);
      return isEn
        ? { title: 'New user registered', body: `${str(d.name, 'A user')} signed up as ${role}.` }
        : { title: 'Pengguna baru terdaftar', body: `${str(d.name, 'Pengguna')} mendaftar sebagai ${role}.` };
    }
    case 'community_invoice_new':
      return isEn
        ? { title: `Community invoice ${str(d.period, '')}`.trim(), body: `Invoice ${str(d.invoice_number, '')} for ${money(d.amount)} has been issued.` }
        : { title: `Tagihan komunitas ${str(d.period, '')}`.trim(), body: `Tagihan ${str(d.invoice_number, '')} sebesar ${money(d.amount)} telah terbit.` };
    case 'community_invoice_paid':
      return isEn
        ? { title: 'Community invoice paid', body: `${str(d.community, 'A community')} paid ${str(d.invoice_number, '')} (${money(d.amount)}).` }
        : { title: 'Tagihan komunitas lunas', body: `${str(d.community, 'Komunitas')} melunasi ${str(d.invoice_number, '')} (${money(d.amount)}).` };
    default:
      return { title: n.title, body: n.body || '' };
  }
};
