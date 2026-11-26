import React, { useEffect, useState } from 'react';
import { Check, Copy, TicketPercent } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatRupiah } from '../../utils/formatters';
import { useStorefrontStoreId } from '../storefrontCart';
import { voucherService, describeVoucher, type StoreVoucher } from '../../services/voucherService';

interface StoreVoucherListProps {
  /** Bawaan diambil dari StorefrontContext; isi bila komponen dirender di luar konteks itu. */
  storeId?: string;
  /** `themed` memakai variabel warna tema (--sf-*); `onDark` untuk banner berlatar gelap/berwarna. */
  variant?: 'themed' | 'onDark';
  className?: string;
}

/**
 * Daftar voucher publik toko yang bisa disalin pembeli lalu ditukar di checkout.
 * Tidak merender apa pun bila toko belum punya voucher aktif.
 */
export const StoreVoucherList: React.FC<StoreVoucherListProps> = ({ storeId: storeIdProp, variant = 'themed', className = '' }) => {
  const { isEn } = useLanguage();
  const ctxStoreId = useStorefrontStoreId();
  const storeId = storeIdProp || ctxStoreId;
  const [vouchers, setVouchers] = useState<StoreVoucher[]>([]);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!storeId) {
      setVouchers([]);
      return;
    }
    voucherService.listPublic(storeId).then((list) => {
      if (!cancelled) setVouchers(list.slice(0, 6));
    });
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  if (vouchers.length === 0) return null;

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      window.setTimeout(() => setCopied((c) => (c === code ? '' : c)), 2000);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const dark = variant === 'onDark';
  const cardCls = dark
    ? 'bg-white/10 border border-white/30 text-white backdrop-blur-sm'
    : 'bg-[var(--sf-card)] border border-dashed border-[var(--sf-primary-border)] text-[var(--sf-text)]';
  const subCls = dark ? 'text-white/75' : 'text-[var(--sf-text-soft)]';
  const codeCls = dark ? 'text-white' : 'text-[var(--sf-primary)]';
  const btnCls = dark
    ? 'bg-white text-gray-900 hover:bg-white/90'
    : 'bg-[var(--sf-primary)] text-[var(--sf-primary-contrast)] hover:opacity-90';

  return (
    <div className={`w-full text-left ${className}`}>
      <p className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${subCls}`}>
        <TicketPercent className="w-4 h-4" />
        {isEn ? 'Use these voucher codes at checkout' : 'Pakai kode voucher ini saat checkout'}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {vouchers.map((v) => (
          <li key={v.id} className={`flex items-center justify-between gap-3 rounded-[var(--sf-radius,12px)] px-3 py-2.5 ${cardCls}`}>
            <div className="min-w-0">
              <p className={`font-mono font-bold text-sm tracking-wide ${codeCls}`}>{v.code}</p>
              {v.title && <p className="text-xs font-medium truncate">{v.title}</p>}
              <p className={`text-[11px] ${subCls}`}>{describeVoucher(v, isEn, formatRupiah)}</p>
            </div>
            <button
              type="button"
              onClick={() => void copy(v.code)}
              className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-[var(--sf-radius,10px)] text-xs font-semibold transition cursor-pointer ${btnCls}`}
              aria-label={isEn ? `Copy code ${v.code}` : `Salin kode ${v.code}`}
            >
              {copied === v.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === v.code ? (isEn ? 'Copied' : 'Tersalin') : isEn ? 'Copy' : 'Salin'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
