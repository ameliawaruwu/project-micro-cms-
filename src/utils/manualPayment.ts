// Alur pembayaran QRIS / transfer langsung ke rekening toko:
// pembeli bayar -> klik "Saya Sudah Bayar" -> merchant cek mutasi -> tandai lunas di menu Pesanan.

export const DEFAULT_MANUAL_INSTRUCTIONS =
  'Scan QRIS atau transfer ke rekening di atas sesuai total tagihan, lalu klik tombol "Saya Sudah Bayar". Penjual akan memeriksa pembayaran Anda.';

// Teks bawaan versi lama yang masih mengarahkan pembeli konfirmasi via WhatsApp.
const LEGACY_DEFAULT_INSTRUCTIONS = [
  'Transfer ke rekening atau scan QRIS, lalu konfirmasi via WhatsApp.',
  'Scan QRIS atau transfer ke rekening di atas, lalu konfirmasi pesanan ke WhatsApp toko.',
  'Scan QRIS atau transfer ke rekening toko di atas, lalu konfirmasi pesanan ke WhatsApp toko.',
];

/** Kembalikan petunjuk pembayaran manual, mengganti teks bawaan lama (WhatsApp) dengan yang baru. */
export function resolveManualInstructions(text?: string | null): string {
  const trimmed = (text || '').trim();
  if (!trimmed || LEGACY_DEFAULT_INSTRUCTIONS.includes(trimmed)) return DEFAULT_MANUAL_INSTRUCTIONS;
  return trimmed;
}

/** Pesanan yang dibayar via QRIS statis / transfer langsung ke rekening toko (perlu dicek merchant). */
export function isManualTransferMethod(paymentMethod?: string | null): boolean {
  const method = paymentMethod || '';
  return method.includes('QRIS & Transfer') || method === 'Transfer Bank Manual';
}

export const QRIS_MAX_FILE_BYTES = 2 * 1024 * 1024;
