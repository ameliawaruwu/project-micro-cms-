import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import type { StorePaymentConfig } from '../../types';
import { resolveManualInstructions } from '../../utils/manualPayment';

interface ManualPaymentDetailsProps {
  paymentConfig: StorePaymentConfig;
  total: number;
}

/**
 * QRIS & rekening toko untuk pesanan "QRIS & Transfer" langsung ke penjual.
 * Dipakai di halaman checkout selesai dan halaman Lacak Pesanan.
 */
export const ManualPaymentDetails: React.FC<ManualPaymentDetailsProps> = ({ paymentConfig, total }) => {
  const [copiedField, setCopiedField] = useState<'account' | 'amount' | null>(null);

  const handleCopy = (text: string, field: 'account' | 'amount') => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch(() => {
        // Clipboard tidak tersedia (mis. bukan HTTPS); pembeli masih bisa menyalin manual.
      });
  };

  const copyButtonClass =
    'px-2 py-0.5 bg-[var(--sf-primary-soft)] hover:bg-[var(--sf-primary-soft)] text-[var(--sf-primary)] rounded text-[10px] font-bold border border-[var(--sf-primary-border)] transition cursor-pointer';

  return (
    <div className="p-5 rounded-[var(--sf-radius)] bg-[var(--sf-primary-soft)] border border-[var(--sf-primary-border)] text-left text-xs text-[var(--sf-primary-strong)] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--sf-primary-border)]">
        <div className="flex items-center gap-2 font-bold text-[var(--sf-primary-strong)] text-sm">
          <QrCode className="w-4 h-4 text-[var(--sf-primary)]" />
          <span>Rekening &amp; QRIS Pembayaran Toko</span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[var(--sf-primary-soft)] text-[var(--sf-primary-strong)] font-bold text-[10px]">
          Direct Transfer
        </span>
      </div>

      {paymentConfig.manualQrisImageUrl && (
        <div className="text-center py-2 bg-[var(--sf-card)] p-3 rounded-[var(--sf-radius)] border border-[var(--sf-primary-border)] space-y-2">
          <p className="text-[11px] font-bold text-[var(--sf-text-soft)]">Scan QR Code Barcode di Bawah Ini:</p>
          <img
            src={paymentConfig.manualQrisImageUrl}
            alt="Barcode QRIS Toko"
            className="w-48 h-48 mx-auto object-contain rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-2xs"
          />
          <p className="text-[10px] text-[var(--sf-muted)]">Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay</p>
        </div>
      )}

      <div className="bg-[var(--sf-card)] p-3.5 rounded-[var(--sf-radius)] border border-[var(--sf-primary-border)] space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--sf-muted)] font-medium">Bank Tujuan:</span>
          <span className="font-bold text-[var(--sf-text)]">{paymentConfig.manualBankName || 'Transfer Bank'}</span>
        </div>
        {paymentConfig.manualBankAccountNumber && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--sf-muted)] font-medium">Nomor Rekening:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-[var(--sf-primary-strong)] text-sm">
                {paymentConfig.manualBankAccountNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(paymentConfig.manualBankAccountNumber!, 'account')}
                className={copyButtonClass}
              >
                {copiedField === 'account' ? 'Tersalin!' : 'Salin'}
              </button>
            </div>
          </div>
        )}
        {paymentConfig.manualBankAccountHolder && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--sf-muted)] font-medium">Atas Nama:</span>
            <span className="font-bold text-[var(--sf-text)]">{paymentConfig.manualBankAccountHolder}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-xs pt-2 border-t border-[var(--sf-border)]">
          <span className="text-[var(--sf-muted)] font-medium">Total Nominal Transfer:</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[var(--sf-primary)] text-base">Rp {total.toLocaleString('id-ID')}</span>
            <button type="button" onClick={() => handleCopy(String(total), 'amount')} className={copyButtonClass}>
              {copiedField === 'amount' ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[var(--sf-primary-strong)] leading-relaxed">
        {resolveManualInstructions(paymentConfig.manualInstructions)}
      </p>
    </div>
  );
};
