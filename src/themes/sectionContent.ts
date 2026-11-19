/**
 * Konten bawaan bagian yang bisa diedit di panel kanan. Dipakai bersama oleh komponen tema
 * dan editor agar yang tampil di panel sama dengan yang dirender sebelum merchant mengubahnya.
 */

export const DEFAULT_INGREDIENT_EYEBROW = 'Bahan Pilihan';
export const DEFAULT_INGREDIENT_ITEMS = ['Bahan Berkualitas', 'Proses Teliti', 'Kualitas Terjaga', 'Dikemas dengan Rapi'];

export interface SustainabilityPillar {
  title: string;
  desc: string;
}

export const DEFAULT_SUSTAINABILITY_PILLARS: SustainabilityPillar[] = [
  { title: 'Kemasan Aman', desc: 'Setiap pesanan dikemas rapi agar sampai dengan baik.' },
  { title: 'Kualitas Terjaga', desc: 'Produk dipilih dan diperiksa sebelum dikirim.' },
  { title: 'Pelayanan Ramah', desc: 'Kami siap membantu setiap pertanyaan Anda.' },
];

/** Poin keunggulan bawaan (judul + penjelasan); dipakai bersama oleh tema dan panel editor. */
const TECH_FEATURES: Record<'id' | 'en', SustainabilityPillar[]> = {
  id: [
    { title: 'Produk Berkualitas', desc: 'Setiap produk dipilih dan diperiksa sebelum dikirim.' },
    { title: 'Pengiriman Cepat', desc: 'Pesanan diproses segera dan dikirim ke seluruh Indonesia.' },
    { title: 'Pembayaran Aman', desc: 'Transaksi terlindungi dengan metode pembayaran tepercaya.' },
  ],
  en: [
    { title: 'Quality Products', desc: 'Every product is selected and checked before shipping.' },
    { title: 'Fast Shipping', desc: 'Orders are processed promptly and shipped across Indonesia.' },
    { title: 'Secure Payment', desc: 'Transactions are protected with trusted payment methods.' },
  ],
};

const STORE_BENEFITS: Record<'id' | 'en', SustainabilityPillar[]> = {
  id: [
    { title: 'Produk Terjamin', desc: 'Produk dicek sebelum dikirim' },
    { title: 'Pengiriman Aman', desc: 'Dikemas rapi ke seluruh Indonesia' },
    { title: 'Pembayaran Mudah', desc: 'Transfer, QRIS, atau COD' },
  ],
  en: [
    { title: 'Guaranteed Products', desc: 'Products are checked before shipping' },
    { title: 'Safe Shipping', desc: 'Neatly packed, shipped across Indonesia' },
    { title: 'Easy Payment', desc: 'Transfer, QRIS, or COD' },
  ],
};

const PROFESSIONAL_BENEFITS: Record<'id' | 'en', SustainabilityPillar[]> = {
  id: [
    { title: 'Produk Terjamin', desc: 'Setiap produk dicek sebelum dikirim ke pelanggan.' },
    { title: 'Pengiriman Aman', desc: 'Dikemas rapi dan dikirim ke seluruh Indonesia.' },
    { title: 'Pembayaran Mudah', desc: 'Bayar lewat transfer, QRIS, atau COD.' },
    { title: 'Pesanan Terpantau', desc: 'Status pesanan bisa dicek kapan saja.' },
  ],
  en: [
    { title: 'Guaranteed Products', desc: 'Every product is checked before it is shipped to customers.' },
    { title: 'Safe Shipping', desc: 'Neatly packed and shipped across Indonesia.' },
    { title: 'Easy Payment', desc: 'Pay by transfer, QRIS, or COD.' },
    { title: 'Tracked Orders', desc: 'Order status can be checked at any time.' },
  ],
};

/** Poin bawaan section berdaftar poin keunggulan; null bila section tidak memakai daftar poin. */
export function defaultFeatureItems(sectionId: string, themeId: string, isEn: boolean): SustainabilityPillar[] | null {
  const lang = isEn ? 'en' : 'id';
  if (sectionId === 'tech_features') return TECH_FEATURES[lang];
  if (sectionId === 'store_benefits') return themeId === 'professional' ? PROFESSIONAL_BENEFITS[lang] : STORE_BENEFITS[lang];
  return null;
}

/** Poin dari editor; poin tanpa judul & penjelasan dibuang. Belum diisi / kosong semua → poin bawaan. */
export function resolveFeatureItems(value: unknown, fallback: SustainabilityPillar[]): SustainabilityPillar[] {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .map((item: any) => ({ title: String(item?.title ?? '').trim(), desc: String(item?.desc ?? '').trim() }))
    .filter((item) => item.title || item.desc);
  return items.length > 0 ? items : fallback;
}

/** Daftar teks yang tidak kosong (item kosong dari editor tidak ikut dirender). */
export function nonEmptyStrings(value: unknown, fallback: string[]): string[] {
  const list = Array.isArray(value) ? value : fallback;
  return list.map((item) => String(item ?? '').trim()).filter(Boolean);
}

/**
 * Tautan chat WhatsApp dari nomor yang diisi merchant. Hanya digit yang dipakai
 * (awalan 0 diganti kode negara 62); nomor tidak valid → null.
 */
export function whatsAppChatLink(phone: unknown): string | null {
  let digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return digits.length >= 8 && digits.length <= 15 ? `https://wa.me/${digits}` : null;
}
