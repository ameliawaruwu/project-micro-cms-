import { supabase } from './supabaseClient';

/**
 * Voucher promo toko (tabel `store_vouchers`). Potongan yang benar-benar dibayar selalu
 * dihitung ulang di database saat pesanan dibuat (`place_order`); hasil `preview` di sini
 * hanya perkiraan untuk ditampilkan di checkout.
 */
export type VoucherDiscountType = 'percent' | 'fixed';

export interface StoreVoucher {
  id: string;
  storeId: string;
  code: string;
  title?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minPurchase: number;
  quota?: number;
  usedCount: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  isPublic: boolean;
  createdAt?: string;
}

export type VoucherInput = Omit<StoreVoucher, 'id' | 'storeId' | 'usedCount' | 'createdAt'>;

export type VoucherRejectReason = 'not_found' | 'inactive' | 'not_started' | 'expired' | 'quota' | 'min_purchase';

export interface VoucherPreview {
  valid: boolean;
  reason?: VoucherRejectReason;
  code?: string;
  title?: string;
  discountType?: VoucherDiscountType;
  discountValue?: number;
  maxDiscount?: number;
  minPurchase?: number;
  subtotal: number;
  discount: number;
}

export const VOUCHER_CODE_RE = /^[A-Z0-9_-]{3,32}$/;

export const normalizeVoucherCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, '');

const mapRow = (r: any): StoreVoucher => ({
  id: r.id,
  storeId: r.store_id,
  code: r.code,
  title: r.title || undefined,
  discountType: r.discount_type === 'fixed' ? 'fixed' : 'percent',
  discountValue: Number(r.discount_value || 0),
  maxDiscount: r.max_discount != null ? Number(r.max_discount) : undefined,
  minPurchase: Number(r.min_purchase || 0),
  quota: r.quota != null ? Number(r.quota) : undefined,
  usedCount: Number(r.used_count || 0),
  startsAt: r.starts_at || undefined,
  endsAt: r.ends_at || undefined,
  isActive: !!r.is_active,
  isPublic: !!r.is_public,
  createdAt: r.created_at || undefined,
});

const toRow = (v: VoucherInput) => ({
  code: normalizeVoucherCode(v.code),
  title: v.title?.trim() || null,
  discount_type: v.discountType,
  discount_value: Math.round(v.discountValue),
  max_discount: v.discountType === 'percent' && v.maxDiscount ? Math.round(v.maxDiscount) : null,
  min_purchase: Math.max(0, Math.round(v.minPurchase || 0)),
  quota: v.quota ? Math.round(v.quota) : null,
  starts_at: v.startsAt || null,
  ends_at: v.endsAt || null,
  is_active: v.isActive,
  is_public: v.isPublic,
});

const COLUMNS =
  'id, store_id, code, title, discount_type, discount_value, max_discount, min_purchase, quota, used_count, starts_at, ends_at, is_active, is_public, created_at';

export const voucherService = {
  /** Semua voucher milik toko (untuk merchant; RLS membatasi ke pemilik toko / admin). */
  async listForStore(storeId: string): Promise<StoreVoucher[]> {
    const { data, error } = await supabase
      .from('store_vouchers')
      .select(COLUMNS)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  },

  /** Voucher aktif yang ditampilkan di halaman Promo toko (dibaca pengunjung). */
  async listPublic(storeId: string): Promise<StoreVoucher[]> {
    if (!storeId) return [];
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('store_vouchers')
      .select(COLUMNS)
      .eq('store_id', storeId)
      .eq('is_active', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return [];
    return (data || [])
      .map(mapRow)
      .filter(
        (v) =>
          (!v.startsAt || v.startsAt <= nowIso) && (!v.endsAt || v.endsAt > nowIso) && (!v.quota || v.usedCount < v.quota)
      );
  },

  async create(storeId: string, input: VoucherInput): Promise<StoreVoucher> {
    const { data, error } = await supabase
      .from('store_vouchers')
      .insert({ store_id: storeId, ...toRow(input) })
      .select(COLUMNS)
      .single();
    if (error) throw error;
    return mapRow(data);
  },

  async update(id: string, input: VoucherInput): Promise<StoreVoucher> {
    const { data, error } = await supabase.from('store_vouchers').update(toRow(input)).eq('id', id).select(COLUMNS).single();
    if (error) throw error;
    return mapRow(data);
  },

  async setActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.from('store_vouchers').update({ is_active: isActive }).eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('store_vouchers').delete().eq('id', id);
    if (error) throw error;
  },

  /** Cek kode untuk isi keranjang; subtotal & potongan dihitung database dari harga produk. */
  async preview(storeId: string, code: string, items: Array<{ productId: string; quantity: number }>): Promise<VoucherPreview> {
    const normalized = normalizeVoucherCode(code);
    if (!VOUCHER_CODE_RE.test(normalized)) return { valid: false, reason: 'not_found', subtotal: 0, discount: 0 };
    const { data, error } = await supabase.rpc('preview_store_voucher', {
      p_store_id: storeId,
      p_code: normalized,
      p_items: items.map((it) => ({ product_id: it.productId, quantity: it.quantity })),
    });
    if (error || !data) throw error || new Error('preview failed');
    const d = data as any;
    return {
      valid: !!d.valid,
      reason: d.reason,
      code: d.code,
      title: d.title,
      discountType: d.discount_type,
      discountValue: d.discount_value != null ? Number(d.discount_value) : undefined,
      maxDiscount: d.max_discount != null ? Number(d.max_discount) : undefined,
      minPurchase: d.min_purchase != null ? Number(d.min_purchase) : undefined,
      subtotal: Number(d.subtotal || 0),
      discount: Number(d.discount || 0),
    };
  },
};

/** Ringkasan potongan, mis. "Diskon 10% (maks Rp 20.000)" / "Potongan Rp 15.000". */
export const describeVoucher = (
  v: Pick<StoreVoucher, 'discountType' | 'discountValue' | 'maxDiscount' | 'minPurchase'>,
  isEn: boolean,
  fmt: (n: number) => string
): string => {
  const main =
    v.discountType === 'percent'
      ? isEn
        ? `${v.discountValue}% off${v.maxDiscount ? ` (max ${fmt(v.maxDiscount)})` : ''}`
        : `Diskon ${v.discountValue}%${v.maxDiscount ? ` (maks ${fmt(v.maxDiscount)})` : ''}`
      : isEn
      ? `${fmt(v.discountValue)} off`
      : `Potongan ${fmt(v.discountValue)}`;
  if (!v.minPurchase) return main;
  return isEn ? `${main} · min. spend ${fmt(v.minPurchase)}` : `${main} · min. belanja ${fmt(v.minPurchase)}`;
};

/** Pesan dua bahasa untuk alasan voucher ditolak. */
export const voucherReasonText = (reason: VoucherRejectReason | undefined, isEn: boolean, minPurchase?: string): string => {
  switch (reason) {
    case 'inactive':
    case 'expired':
      return isEn ? 'This voucher is no longer valid.' : 'Voucher ini sudah tidak berlaku.';
    case 'not_started':
      return isEn ? 'This voucher is not valid yet.' : 'Voucher ini belum berlaku.';
    case 'quota':
      return isEn ? 'This voucher has been fully redeemed.' : 'Kuota voucher ini sudah habis.';
    case 'min_purchase':
      return isEn
        ? `Minimum spend for this voucher is ${minPurchase || '-'}.`
        : `Voucher ini berlaku untuk belanja minimal ${minPurchase || '-'}.`;
    default:
      return isEn ? 'Voucher code not found.' : 'Kode voucher tidak ditemukan.';
  }
};
