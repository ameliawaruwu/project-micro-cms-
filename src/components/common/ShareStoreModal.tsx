import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Share2, MessageCircle, QrCode } from 'lucide-react';
import { Store } from '../../types';

interface ShareStoreModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onShowNotification: (msg: string) => void;
}

export const ShareStoreModal: React.FC<ShareStoreModalProps> = ({
  store,
  isOpen,
  onClose,
  onShowNotification,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const storeUrl = `https://kroomify.id/${store.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    onShowNotification('Link toko berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Halo! Kunjungi katalog toko online resmi ${store.name} di: ${storeUrl}\n\nBelanja praktis, aman, dan langsung diproses.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div id="modal-share-store" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-[#EAEAEA] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2 text-[#1F1F1F] font-bold text-base">
            <Share2 className="w-5 h-5 text-[#9A0602]" />
            <span>Bagikan Toko Online</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 flex flex-col items-center text-center">
          {/* QR Code preview visual */}
          <div className="p-4 bg-white rounded-2xl border border-[#EAEAEA] shadow-xs flex flex-col items-center mb-4">
            <div className="w-40 h-40 bg-[#F7F7F7] rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(storeUrl)}&color=9a0602`}
                alt="QR Code Toko"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-[#9A0602]">
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan untuk Buka di HP</span>
            </div>
          </div>

          <h3 className="font-bold text-[#1F1F1F] text-base">{store.name}</h3>
          <p className="text-xs text-[#555555] mt-1 max-w-xs">{store.tagline}</p>

          {/* Link Box */}
          <div className="w-full mt-4 p-2 bg-[#F7F7F7] border border-[#EAEAEA] rounded-xl flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-[#1F1F1F] font-semibold truncate pl-2">{storeUrl}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9A0602] hover:bg-[#7D0502] text-white text-xs font-semibold transition shrink-0 cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EAEAEA]">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 py-2.5 min-h-[44px] px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs transition shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Kirim WhatsApp</span>
          </button>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              onShowNotification('Membuka toko online...');
            }}
            className="flex items-center justify-center gap-2 py-2.5 min-h-[44px] px-4 rounded-xl bg-[#1F1F1F] hover:bg-black text-white font-semibold text-xs transition shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Kunjungi Toko</span>
          </a>
        </div>
      </div>
    </div>
  );
};

