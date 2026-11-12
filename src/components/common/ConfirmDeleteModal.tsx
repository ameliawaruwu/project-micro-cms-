import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

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
  title,
  itemName,
  message,
  confirmLabel,
  cancelLabel,
  isDeleting = false,
  onConfirm,
  onClose,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const resolvedTitle = title || (language === 'en' ? 'Delete Item' : 'Hapus Item');
  const resolvedConfirmLabel = confirmLabel || (language === 'en' ? 'Delete' : 'Hapus');
  const resolvedCancelLabel = cancelLabel || (language === 'en' ? 'Cancel' : 'Batal');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 font-poppins"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] sm:max-w-[420px] bg-white rounded-2xl shadow-2xl p-7 sm:p-8 text-center relative animate-in zoom-in-95 duration-150 border border-[#E5E0DD]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Badge with Layered Glow Rings */}
        <div className="relative flex items-center justify-center mx-auto mb-4">
          <div className="w-14 h-14 rounded-full bg-[#F5E8EA] ring-[10px] ring-[#F5E8EA]/40 flex items-center justify-center text-[#66000E] transition-transform">
            <AlertCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] tracking-tight">
          {resolvedTitle}
        </h3>

        {/* Description Body */}
        <div className="text-xs sm:text-sm text-[#555555] mt-2 leading-relaxed max-w-[320px] mx-auto">
          {message ? (
            <p>{message}</p>
          ) : (
            <p>
              {language === 'en' ? (
                <>Are you sure you want to delete {itemName ? <strong className="font-semibold text-[#1F1F1F]">"{itemName}"</strong> : 'this item'}? This action cannot be undone.</>
              ) : (
                <>Apakah Anda yakin ingin menghapus {itemName ? <strong className="font-semibold text-[#1F1F1F]">"{itemName}"</strong> : 'item ini'}? Tindakan ini tidak dapat dibatalkan.</>
              )}
            </p>
          )}
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-3 mt-7 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-[#E5E0DD] bg-[#F7F7F7] hover:bg-[#EAEAEA] active:scale-[0.98] text-xs sm:text-sm font-semibold text-[#555555] transition cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            {resolvedCancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#66000E] hover:bg-[#52000B] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{language === 'en' ? 'Deleting...' : 'Menghapus...'}</span>
              </>
            ) : (
              <span>{resolvedConfirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
