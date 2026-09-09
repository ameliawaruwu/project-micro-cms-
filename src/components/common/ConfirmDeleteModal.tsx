import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  itemName?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = 'Hapus Produk?',
  itemName,
  message,
  confirmLabel = 'Ya, Hapus Produk',
  cancelLabel = 'Batal',
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#E5E0DD] shadow-2xl p-6 relative animate-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer"
          aria-label="Tutup Dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-base sm:text-lg font-bold text-[#241A1A] leading-tight">
              {title}
            </h3>
            <div className="text-xs text-[#706866] mt-2 space-y-1.5 leading-relaxed">
              {message ? (
                <p>{message}</p>
              ) : (
                <p>
                  Apakah Anda yakin ingin menghapus produk{' '}
                  <strong className="text-[#241A1A] font-semibold">{itemName ? `"${itemName}"` : 'ini'}</strong>?
                </p>
              )}
              <p className="text-rose-600 font-medium text-[11px] flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>Tindakan ini permanen dan tidak dapat dibatalkan.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E0DD]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-[#E5E0DD] text-xs font-semibold text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer min-h-[38px]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer min-h-[38px]"
          >
            {isDeleting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
