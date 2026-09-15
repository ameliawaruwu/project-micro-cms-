import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

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
  title = 'Hapus produk',
  itemName,
  message,
  confirmLabel = 'Hapus',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] sm:max-w-[420px] bg-white rounded-[28px] shadow-2xl p-7 sm:p-8 text-center relative animate-in zoom-in-95 duration-150 border border-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Badge with Layered Glow Rings */}
        <div className="relative flex items-center justify-center mx-auto mb-4">
          <div className="w-14 h-14 rounded-full bg-[#FEE4E2]/70 ring-[10px] ring-[#FEE4E2]/30 flex items-center justify-center text-[#F04438] transition-transform">
            <AlertCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-[#101828] tracking-tight">
          {title}
        </h3>

        {/* Description Body */}
        <div className="text-xs sm:text-sm text-[#475467] mt-2 leading-relaxed max-w-[320px] mx-auto">
          {message ? (
            <p>{message}</p>
          ) : (
            <p>
              Apakah Anda yakin ingin menghapus {itemName ? <strong className="font-semibold text-[#101828]">"{itemName}"</strong> : 'produk ini'}? Tindakan ini tidak dapat dibatalkan.
            </p>
          )}
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 mt-7 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-[#F2F4F7] hover:bg-[#E4E7EC] active:scale-[0.98] text-xs sm:text-sm font-semibold text-[#344054] transition cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl bg-[#F04438] hover:bg-[#D92D20] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
