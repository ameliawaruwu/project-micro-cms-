import React, { useState, useEffect, useRef } from 'react';
import { Store as StoreIcon, ArrowRight, Sparkles, X } from 'lucide-react';
import { Store } from '../../types';

interface StoreNameSetupModalProps {
  isOpen: boolean;
  currentStore: Store;
  onSave: (name: string, slug: string) => void;
  onCancel?: () => void;
}

export const StoreNameSetupModal: React.FC<StoreNameSetupModalProps> = ({
  isOpen,
  currentStore,
  onSave,
  onCancel,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Pre-fill only if the name isn't the auto-generated placeholder
      const isPlaceholder = !currentStore.name || currentStore.name.startsWith('Toko usr_');
      setStoreName(isPlaceholder ? '' : currentStore.name);
      setStoreSlug(
        isPlaceholder
          ? ''
          : (currentStore.slug || currentStore.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      );
      // Auto-focus after mount
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentStore.name, currentStore.slug]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStoreSlug(autoSlug || 'toko-saya');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      inputRef.current?.focus();
      return;
    }
    setIsSaving(true);
    await onSave(storeName.trim(), storeSlug.trim() || 'toko-saya');
    setIsSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Decorative header stripe */}
        <div className="h-1.5 bg-gradient-to-r from-[#66000E] via-red-500 to-amber-400 w-full" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#66000E] flex items-center justify-center shadow-md shadow-[#66000E]/30 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                Selamat datang! 👋
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Ayo mulai dengan memberi nama toko Anda
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Store name input — prominent */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Nama Toko Online <span className="text-[#66000E]">*</span>
            </label>
            <div className="relative">
              <StoreIcon className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                required
                value={storeName}
                onChange={handleNameChange}
                placeholder="Contoh: Dapur Nusantara, Batik Sekar, Kopi Senja"
                className="w-full pl-11 pr-4 py-3.5 text-base font-semibold bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-[#66000E] focus:ring-4 focus:ring-[#66000E]/10 transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Nama ini akan ditampilkan di halaman utama toko dan link berbagi Anda.
            </p>
          </div>

          {/* Slug preview */}
          {storeName && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium shrink-0">Link toko Anda:</span>
              <span className="text-[#66000E] font-bold font-mono truncate">
                kroomify.id/<span className="text-gray-800">{storeSlug || 'toko-saya'}</span>
              </span>
            </div>
          )}

          {/* Note */}
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Nama toko dapat diubah kapan saja di menu <strong>Pengaturan</strong> setelah Anda masuk ke dashboard.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Nanti saja
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving || !storeName.trim()}
              className="flex-[2] py-3 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#66000E]/20 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <span>Mulai Kelola Toko</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
