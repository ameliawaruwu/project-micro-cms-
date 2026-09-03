import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-xs font-semibold font-sans ${
              t.type === 'success'
                ? 'bg-[#ECFDF3] border-[#ABEFC6] text-[#027A48]'
                : t.type === 'error'
                ? 'bg-[#FFF1F0] border-[#FECDCA] text-[#9A0602]'
                : 'bg-white border-[#EAEAEA] text-[#1F1F1F]'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#027A48] shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-[#9A0602] shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-[#9A0602] shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="ml-3 p-1 rounded-md hover:bg-black/5 text-[#777777] hover:text-[#1F1F1F] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
