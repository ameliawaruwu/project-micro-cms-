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
