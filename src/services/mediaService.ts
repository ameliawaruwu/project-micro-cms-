import { sessionHeaders } from './supabaseClient';

/**
 * Upload gambar ke CDNKroombox lewat backend (`POST /api/media/upload`).
 * Backend yang memegang API key CDN dan memeriksa sesi login serta hak atas toko.
 */
export type MediaKind = 'product' | 'logo' | 'qris' | 'layout' | 'avatar';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const isDataImageUrl = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith('data:image');

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

/** Cek cepat di browser (server tetap memeriksa isi file) lalu ubah File menjadi data URL. */
const toImageDataUrl = async (source: File | string): Promise<string> => {
  if (source instanceof File) {
    if (!source.type.startsWith('image/')) {
      throw new Error('File harus berupa gambar (JPG, PNG, WEBP, atau GIF).');
    }
    if (source.size > MAX_IMAGE_BYTES) {
      throw new Error('Ukuran gambar maksimal 5MB.');
    }
  }
  const dataUrl = source instanceof File ? await readFileAsDataUrl(source) : source;
  if (!isDataImageUrl(dataUrl)) {
    throw new Error('Format gambar tidak valid.');
  }
  return dataUrl;
};

export const mediaService = {
  /** Unggah File atau data URL gambar dan kembalikan URL CDN-nya. */
  async uploadImage(source: File | string, kind: MediaKind, storeId?: string): Promise<string> {
    const dataUrl = await toImageDataUrl(source);

    let res: Response;
    try {
      res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: sessionHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ dataUrl, kind, storeId }),
      });
    } catch {
      throw new Error('Server upload tidak dapat dihubungi. Periksa koneksi Anda.');
    }

    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success || typeof payload.url !== 'string') {
      if (res.status === 413) throw new Error('Ukuran gambar maksimal 5MB.');
      throw new Error(payload?.error || `Gagal mengupload gambar (HTTP ${res.status}).`);
    }
    return payload.url;
  },

  /**
   * Bukti transfer dari pembeli tanpa login (`POST /api/media/payment-proof`).
   * Server mencocokkan ID + nomor pesanan, menyimpan URL bukti, dan menandai pembeli sudah konfirmasi.
   */
  async uploadPaymentProof(
    file: File,
    orderId: string,
    orderNumber: string,
  ): Promise<{ url: string; paymentConfirmedAt: string }> {
    const dataUrl = await toImageDataUrl(file);

    let res: Response;
    try {
      res = await fetch('/api/media/payment-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, orderId, orderNumber }),
      });
    } catch {
      throw new Error('Server upload tidak dapat dihubungi. Periksa koneksi Anda.');
    }

    const payload = await res.json().catch(() => null);
    if (!res.ok || !payload?.success || typeof payload.url !== 'string') {
      if (res.status === 413) throw new Error('Ukuran gambar maksimal 5MB.');
      throw new Error(payload?.error || `Gagal mengirim bukti pembayaran (HTTP ${res.status}).`);
    }
    return { url: payload.url, paymentConfirmedAt: String(payload.paymentConfirmedAt || new Date().toISOString()) };
  },
};
