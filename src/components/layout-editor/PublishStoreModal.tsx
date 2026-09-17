import React from 'react';
import { X, CheckCircle2, Copy, ExternalLink, Globe } from 'lucide-react';
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
  if (!isOpen) return null;

  const storeUrl = `${window.location.origin}/${store.slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl);
    alert('URL berhasil disalin!');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            Toko Berhasil Dipublikasikan
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Selamat! Website Anda sudah online.
            </h3>
            <p className="text-sm text-gray-500">
              Desain terbaru untuk toko <span className="font-bold text-gray-700">{store.name}</span> telah berhasil dipublikasikan dan sekarang dapat diakses oleh pelanggan Anda.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 text-left uppercase tracking-wider">
              URL Website Toko Anda
            </p>
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm">
              <span className="text-sm font-medium text-gray-700 truncate mr-3 flex-1 text-left">
                {storeUrl}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors shrink-0"
                title="Salin URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Kunjungi Toko
          </a>
        </div>
      </div>
    </div>
  );
};
