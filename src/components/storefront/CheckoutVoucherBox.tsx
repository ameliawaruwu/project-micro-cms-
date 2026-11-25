import React, { useEffect, useState } from 'react';
import { Loader2, TicketPercent, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatRupiah } from '../../utils/formatters';
import {
  voucherService,
  describeVoucher,
  voucherReasonText,
  type StoreVoucher,
  type VoucherPreview,
} from '../../services/voucherService';

/**
 * State voucher di checkout. Potongan di sini hanya perkiraan dari database
 * (`preview_store_voucher`); potongan final dihitung ulang `place_order` saat pesanan dibuat.
 */
export function useCheckoutVoucher(
  storeId: string | undefined,
  items: Array<{ productId: string; quantity: number }>,
  subtotal: number
) {
  const { isEn } = useLanguage();
  const [input, setInput] = useState('');
  const [applied, setApplied] = useState<VoucherPreview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<StoreVoucher[]>([]);
  const cartSignature = items.map((it) => `${it.productId}:${it.quantity}`).join('|');

  // Voucher publik toko ditampilkan sebagai pilihan cepat di checkout.
  useEffect(() => {
    let cancelled = false;
    if (!storeId) {
      setAvailable([]);
      return;
    }
    voucherService.listPublic(storeId).then((list) => {
      if (!cancelled) setAvailable(list.slice(0, 6));
    });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const apply = async (code: string = input) => {
    if (!storeId || !code.trim() || items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await voucherService.preview(storeId, code, items);
      if (res.valid) {
        setApplied(res);
        setInput(res.code || code);
      } else {
        setApplied(null);
        setError(voucherReasonText(res.reason, isEn, res.minPurchase ? formatRupiah(res.minPurchase) : undefined));
      }
    } catch {
      setApplied(null);
      setError(isEn ? 'Could not check the voucher. Please try again.' : 'Gagal memeriksa voucher. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setApplied(null);
    setError('');
    setInput('');
  };

  // Isi keranjang berubah: hitung ulang potongan voucher yang sedang dipakai.
  useEffect(() => {
    if (applied?.code) void apply(applied.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSignature]);

  const discount = applied?.valid ? Math.max(0, Math.min(applied.discount, subtotal)) : 0;
  const code = applied?.valid ? applied.code : undefined;

  return { input, setInput, applied, error, setError, loading, available, apply, remove, discount, code };
}

export type CheckoutVoucherState = ReturnType<typeof useCheckoutVoucher>;

interface CheckoutVoucherBoxProps {
  voucher: CheckoutVoucherState;
  /** `themed` memakai variabel warna tema toko (--sf-*); `classic` untuk laci keranjang. */
  tone?: 'themed' | 'classic';
  className?: string;
}

const TONES = {
  themed: {
    label: 'text-[var(--sf-text)]',
    icon: 'text-[var(--sf-primary)]',
    soft: 'text-[var(--sf-text-soft)]',
    input:
      'rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-transparent text-[var(--sf-text)] focus:border-[var(--sf-primary)]',
    button: 'rounded-[var(--sf-radius)] bg-[var(--sf-primary)] text-white',
    chip: 'rounded-[var(--sf-radius)] border border-dashed border-[var(--sf-primary)] text-[var(--sf-text)] hover:bg-[var(--sf-primary)]/10',
    chipCode: 'text-[var(--sf-primary)]',
  },
  classic: {
    label: 'text-[#241A1A]',
    icon: 'text-[#66000E]',
    soft: 'text-[#706866]',
    input: 'rounded-xl border border-[#E5E0DD] bg-white text-[#241A1A] focus:border-[#66000E]',
    button: 'rounded-xl bg-[#66000E] text-white',
    chip: 'rounded-xl border border-dashed border-[#66000E]/50 text-[#241A1A] bg-white hover:bg-[#66000E]/5',
    chipCode: 'text-[#66000E]',
  },
};

export const CheckoutVoucherBox: React.FC<CheckoutVoucherBoxProps> = ({ voucher, tone = 'themed', className = '' }) => {
  const { isEn } = useLanguage();
  const t = TONES[tone];
  const { input, setInput, applied, error, setError, loading, available, apply, remove, discount } = voucher;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className={`flex items-center gap-1.5 text-xs font-bold ${t.label}`}>
        <TicketPercent className={`w-4 h-4 ${t.icon}`} />
        {isEn ? 'Promo Voucher' : 'Voucher Promo'}
      </p>

      {applied?.valid ? (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div className="min-w-0 text-xs">
            <p className="font-bold text-emerald-800 font-mono">{applied.code}</p>
            <p className="text-emerald-700">
              {applied.title ? `${applied.title} · ` : ''}
              {isEn ? 'You save' : 'Hemat'} {formatRupiah(discount)}
            </p>
          </div>
          <button
            type="button"
            onClick={remove}
            aria-label={isEn ? 'Remove voucher' : 'Hapus voucher'}
            title={isEn ? 'Remove voucher' : 'Hapus voucher'}
            className="p-1 rounded-md text-emerald-700 hover:bg-emerald-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value.toUpperCase().replace(/\s+/g, '').slice(0, 32));
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void apply();
                }
              }}
              placeholder={isEn ? 'Enter voucher code' : 'Masukkan kode voucher'}
              aria-label={isEn ? 'Voucher code' : 'Kode voucher'}
              className={`flex-1 min-w-0 px-3 py-2 text-xs font-mono uppercase focus:outline-none ${t.input}`}
            />
            <button
              type="button"
              onClick={() => void apply()}
              disabled={loading || !input.trim()}
              className={`px-3 py-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 ${t.button}`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEn ? 'Apply' : 'Pakai'}
            </button>
          </div>

          {available.length > 0 ? (
            <div className="space-y-1.5">
              <p className={`text-[11px] ${t.soft}`}>
                {isEn ? 'Available vouchers from this store:' : 'Voucher tersedia dari toko ini:'}
              </p>
              <div className="flex flex-col gap-1.5">
                {available.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={loading}
                    onClick={() => void apply(v.code)}
                    className={`w-full text-left px-3 py-2 transition cursor-pointer disabled:opacity-50 flex items-center justify-between gap-2 ${t.chip}`}
                    aria-label={isEn ? `Use voucher ${v.code}` : `Pakai voucher ${v.code}`}
                  >
                    <span className="min-w-0">
                      <span className={`block font-mono font-bold text-xs ${t.chipCode}`}>{v.code}</span>
                      <span className={`block text-[11px] truncate ${t.soft}`}>
                        {v.title ? `${v.title} · ` : ''}
                        {describeVoucher(v, isEn, formatRupiah)}
                      </span>
                    </span>
                    <span className={`shrink-0 text-[11px] font-bold ${t.chipCode}`}>{isEn ? 'Use' : 'Pakai'}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className={`text-[11px] ${t.soft}`}>
              {isEn
                ? 'This store has no public vouchers right now. Have a code? Enter it above.'
                : 'Toko ini belum memiliki voucher publik. Punya kode? Masukkan di atas.'}
            </p>
          )}
        </>
      )}

      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
};
