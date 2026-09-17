import React, { useState } from 'react';
import { X, CheckCircle2, Copy, ExternalLink, Globe, Check, Share2, ShieldCheck } from 'lucide-react';
import { Store } from '../../types';

interface PublishStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
}

export const PublishStoreModal: React.FC<PublishStoreModalProps> = ({
  isOpen,
  onClose,
  store,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isCustomDomain = !!store.customDomain && store.domainStatus === 'connected';
  const displayDomain = isCustomDomain 
    ? store.customDomain 
    : `${store.slug}.kroombox.com`;
  
  // Real accessible link in browser
  const storeUrl = isCustomDomain
    ? `https://${store.customDomain}`
    : `${window.location.origin}/${store.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Halo! Kunjungi toko online resmi kami di: ${storeUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-[#E5E0DD]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EBE5E2] bg-[#FAF7F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#241A1A]">
                Toko Berhasil Dipublikasikan
              </h2>
              <p className="text-[11px] text-[#706866]">Website etalase Anda sudah live dan siap diakses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center space-y-5">
          {/* Animated Success Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-emerald-100/80 rounded-full animate-ping opacity-30" />
            <div className="relative w-20 h-20 bg-emerald-50 border-2 border-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-[#241A1A]">
              Selamat! Website Anda Sudah Online
            </h3>
            <p className="text-xs text-[#706866] leading-relaxed">
              Desain tata letak terbaru untuk <span className="font-bold text-[#241A1A]">{store.name}</span> telah tersimpan di cloud dan dapat langsung dikunjungi oleh pembeli.
            </p>
          </div>

          {/* URL Box */}
          <div className="bg-[#FAF7F7] rounded-xl p-4 border border-[#EBE5E2] text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#706866] uppercase tracking-wider">
                Alamat Link Toko
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCustomDomain 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {isCustomDomain ? 'Custom Domain' : 'Domain Default (Aktif)'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-white border border-[#D5CEC8] rounded-xl p-2.5 shadow-2xs gap-2">
              <span className="text-xs font-semibold text-[#241A1A] truncate flex-1 select-all">
                {storeUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-[#241A1A]'
                }`}
                title="Salin Tautan"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#EBE5E2] bg-[#FAF7F7] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-800 text-xs font-bold transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Bagikan ke WhatsApp</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#706866] hover:text-[#241A1A] hover:bg-white rounded-xl transition cursor-pointer"
            >
              Tutup
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] rounded-xl shadow-2xs transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Toko</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
