import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, ShieldCheck, X } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { MAX_IMAGE_BYTES } from '../../services/mediaService';
import { useLanguage } from '../../contexts/LanguageContext';

interface PaymentProofUploadProps {
  orderId: string;
  orderNumber: string;
  storeId: string;
  total: number;
  /** Dipanggil setelah bukti tersimpan di server. */
  onSubmitted: (result: { url: string; paymentConfirmedAt: string }) => void;
}

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

/**
 * Input bukti transfer untuk pesanan QRIS / transfer langsung ke rekening toko.
 * Dipakai di halaman checkout selesai dan halaman Lacak Pesanan.
 */
export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  orderId,
  orderNumber,
  storeId,
  total,
  onSubmitted,
}) => {
  const { isEn } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Object URL pratinjau dilepas saat file diganti / komponen dilepas.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clearFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    setError('');
    if (!picked) return;
    if (!picked.type.startsWith('image/')) {
      setError(isEn ? 'The file must be an image (JPG, PNG, WEBP, or GIF).' : 'File harus berupa gambar (JPG, PNG, WEBP, atau GIF).');
      clearFile();
      return;
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      setError(isEn ? 'Maximum image size is 5MB.' : 'Ukuran gambar maksimal 5MB.');
      clearFile();
      return;
    }
    setFile(picked);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError(isEn ? 'Please choose a photo / screenshot of the transfer proof first.' : 'Pilih foto / screenshot bukti transfer terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      onSubmitted(await orderService.submitPaymentProof(orderId, storeId, orderNumber, file));
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Failed to send payment proof. Please try again.' : 'Gagal mengirim bukti pembayaran. Silakan coba lagi.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2.5 text-left">
      <p className="text-xs font-bold text-[var(--sf-text)]">{isEn ? 'Upload Payment Proof' : 'Unggah Bukti Pembayaran'}</p>

      {previewUrl ? (
        <div className="relative rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-card)] p-2">
          <img src={previewUrl} alt={isEn ? 'Payment proof preview' : 'Pratinjau bukti pembayaran'} className="max-h-64 w-full object-contain rounded" />
          <button
            type="button"
            onClick={clearFile}
            disabled={isSubmitting}
            aria-label={isEn ? 'Remove proof photo' : 'Hapus foto bukti'}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-6 px-4 rounded-[var(--sf-radius)] border-2 border-dashed border-[var(--sf-primary-border)] bg-[var(--sf-card)] text-[var(--sf-text-soft)] hover:bg-[var(--sf-primary-soft)] transition flex flex-col items-center gap-1.5 cursor-pointer"
        >
          <ImagePlus className="w-6 h-6 text-[var(--sf-primary)]" />
          <span className="text-xs font-semibold">{isEn ? 'Choose a photo / screenshot of the transfer proof' : 'Pilih foto / screenshot bukti transfer'}</span>
          <span className="text-[10px] text-[var(--sf-muted)]">{isEn ? 'JPG, PNG, WEBP, or GIF • max. 5MB' : 'JPG, PNG, WEBP, atau GIF • maks. 5MB'}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={ACCEPTED_TYPES} onChange={handlePick} className="hidden" />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || !file}
        className="w-full py-3.5 px-4 bg-[var(--sf-primary)] text-white font-bold rounded-[var(--sf-radius)] flex items-center justify-center gap-2 transition hover:opacity-90 cursor-pointer shadow-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        <span>
          {isSubmitting
            ? (isEn ? 'Sending Proof...' : 'Mengirim Bukti...')
            : (isEn ? 'Send Proof & Confirm Payment' : 'Kirim Bukti & Konfirmasi Bayar')}
        </span>
      </button>
      <p className="text-[11px] text-center text-[var(--sf-muted)]">
        {isEn
          ? `Upload after you complete the transfer or QRIS scan of Rp ${total.toLocaleString('id-ID')}. The seller will match this proof against their account statement.`
          : `Unggah setelah Anda menyelesaikan transfer atau scan QRIS sebesar Rp ${total.toLocaleString('id-ID')}. Penjual akan mencocokkan bukti ini dengan mutasi rekeningnya.`}
      </p>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
};
