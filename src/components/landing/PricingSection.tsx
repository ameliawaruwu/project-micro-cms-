import React from 'react';
import { Check, ArrowRight, Zap } from 'lucide-react';

interface PricingSectionProps {
  onNavigateRegister: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onNavigateRegister,
}) => {
  return (
    <section 
      id="harga" 
      className="min-h-[calc(100vh-76px)] flex flex-col justify-center py-8 sm:py-10 lg:py-12 bg-white border-y border-[#E8DDDE] scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-2 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#66000E]" />
            <span>Transparan Tanpa Biaya Tersembunyi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-snug mb-1.5">
            Pilihan Paket Sederhana untuk UMKM.
          </h2>
          <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal max-w-lg mx-auto">
            Mulai gratis sekarang dan upgrade paket Pro kapan saja saat bisnis Anda semakin bertumbuh.
          </p>
        </div>

        {/* 2 Simple Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto items-stretch">
          
          {/* PLAN 1: GRATIS */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#FAF7F7] border border-[#E8DDDE] flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-[#241A1A]">Gratis</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#5F5652] border border-[#E8DDDE]">
                  Untuk Memulai
                </span>
              </div>

              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#241A1A]">Rp0</span>
                <span className="text-xs text-[#857C76] font-normal ml-1">/ selamanya</span>
                <p className="text-xs text-[#5F5652] mt-1 font-normal">
                  Cocok untuk Anda yang baru ingin membuka toko online pertama kali.
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-[#E8DDDE]/60 text-xs sm:text-sm text-[#241A1A] font-normal">
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Halaman Toko Online Resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Katalog Produk (hingga 25 produk)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Pencatatan & Notifikasi Pesanan Masuk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Beranda Ringkas Penjualan</span>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <button
                onClick={onNavigateRegister}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F5E8EA] text-[#241A1A] font-semibold text-xs sm:text-sm border border-[#E8DDDE] transition cursor-pointer min-h-[44px]"
              >
                Mulai Gratis
              </button>
            </div>
          </div>

          {/* PLAN 2: PRO (High-contrast, Elegant White Card with Burgundy Accent) */}
          <div className="relative p-5 sm:p-6 rounded-3xl bg-white border-2 border-[#66000E] text-[#241A1A] flex flex-col justify-between shadow-lg">
            
            {/* Recommended Tag */}
            <div className="absolute -top-3 right-6 bg-[#66000E] text-white text-[10px] sm:text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
              Pilihan Favorit UMKM
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-[#241A1A]">Pro</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE]">
                  Untuk Berkembang
                </span>
              </div>

              <div className="mb-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#66000E]">Rp99.000</span>
                <span className="text-xs text-[#857C76] font-normal ml-1">/ bulan</span>
                <p className="text-xs text-[#5F5652] mt-1 font-normal">
                  Untuk UMKM yang ingin otomatisasi pesanan dan fitur lengkap tanpa batasan.
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-[#E8DDDE]/60 text-xs sm:text-sm text-[#241A1A] font-normal">
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-[#241A1A]">Semua fitur Paket Gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Katalog Produk Unlimited</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Integrasi Pembayaran (QRIS & VA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Integrasi Pengiriman (JNE, J&T, SiCepat)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Laporan Analytics & Omset Toko</span>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <button
                onClick={onNavigateRegister}
                className="w-full py-2.5 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Mulai Pro</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

