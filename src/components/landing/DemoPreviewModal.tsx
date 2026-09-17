import React from 'react';
import {
  X,
  Play,
  ArrowRight,
  Package,
  ShoppingBag,
  Store,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface DemoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchFullDemo: () => void;
  onNavigateRegister: () => void;
}

export const DemoPreviewModal: React.FC<DemoPreviewModalProps> = ({
  isOpen,
  onClose,
  onLaunchFullDemo,
  onNavigateRegister,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A1A]/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-[20px] shadow-2xl border border-[#E5E0DD] z-10 overflow-hidden animate-in zoom-in-95 duration-200 text-left">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#E5E0DD] flex items-start justify-between gap-4 bg-[#FAF7F7]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5E8EA] border border-[#E8DDDE] text-[#66000E] text-[11px] font-bold mb-1.5">
              <Sparkles className="w-3 h-3 text-[#66000E]" />
              <span>Simulasi 1 Menit</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#241A1A] tracking-tight">
              Lihat Kroomify dalam 1 Menit
            </h3>
            <p className="text-xs sm:text-sm text-[#706866] mt-0.5">
              Cara termudah kelola toko online Anda dari HP atau laptop.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#706866] hover:text-[#241A1A] hover:bg-white transition cursor-pointer border border-transparent hover:border-[#E5E0DD]"
            aria-label="Tutup pratinjau"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Quick Steps */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] hover:border-[#66000E]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              1
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#241A1A]">
                Tambah Produk dengan Cepat
              </h4>
              <p className="text-[11px] sm:text-xs text-[#706866] mt-0.5">
                Upload foto, tulis harga dan stok dalam hitungan detik. Katalog otomatis siap dibagikan ke WhatsApp & Medsos.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] hover:border-[#66000E]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              2
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#241A1A]">
                Terima Pesanan & Pembayaran Otomatis
              </h4>
              <p className="text-[11px] sm:text-xs text-[#706866] mt-0.5">
                Pembeli bisa bayar via QRIS atau Transfer Bank. Status pesanan dan cetak resi kurir otomatis terupdate.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] hover:border-[#66000E]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              3
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#241A1A]">
                Pantau Penjualan Tanpa Ribet
              </h4>
              <p className="text-[11px] sm:text-xs text-[#706866] mt-0.5">
                Lihat omset harian, cek stok menipis, dan kelola pelanggan langsung dalam satu dashboard praktis.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 sm:p-6 pt-3 bg-[#FAF7F7] border-t border-[#E5E0DD] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onLaunchFullDemo();
            }}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[46px] rounded-xl border border-[#E5E0DD] bg-white hover:bg-[#FAF7F7] hover:border-[#66000E] text-[#241A1A] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
          >
            <Play className="w-3.5 h-3.5 fill-[#66000E] text-[#66000E]" />
            <span>Jelajahi Demo Lengkap</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateRegister();
            }}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[46px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
          >
            <span>Mulai Buka Toko Gratis</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </div>
    </div>
  );
};
