import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Package,
  MessageSquare,
  CreditCard,
  Truck,
  Check,
  Zap,
  X,
} from 'lucide-react';

export const SolutionSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#FAF7F7] border-b border-[#E8DDDE] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#66000E]" />
            <span>Transformasi Kroomify</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-snug mb-3">
            Satu Tempat untuk Mengelola Toko Anda.
          </h2>
          <p className="text-[#5F5652] text-sm sm:text-base leading-relaxed font-normal">
            Kroomify menyederhanakan pengelolaan toko online agar Anda bisa fokus pada pengembangan produk dan kepuasan pelanggan.
          </p>
        </div>

        {/* Visual Transformation Grid: Sebelum vs Dengan Kroomify */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Box 1: Sebelum Kroomify (Old & Messy) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E8DDDE] flex flex-col justify-between relative shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                    <X className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#241A1A]">
                    Sebelum Kroomify
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  Rumit & Tercecer
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#5F5652] font-normal mb-6">
                Membuka banyak aplikasi secara manual sehingga rawan salah catat dan pesanan terlambat diproses:
              </p>

              {/* Fragmented Flow Diagram */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-normal text-[#5F5652]">
                  <span className="px-3 py-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex items-center gap-1.5 line-through text-[#857C76]">
                    <Package className="w-3.5 h-3.5" /> Foto Produk di Galeri
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-1.5 text-rose-700 font-medium">
                    <MessageSquare className="w-3.5 h-3.5" /> Chat WA Manual
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-normal text-slate-400">
                  <span>↓</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-normal text-[#5F5652]">
                  <span className="px-3 py-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#857C76]" /> Cek Mutasi Bank Manual
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="px-3 py-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#857C76]" /> Input Kurir Manual
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-normal text-slate-400">
                  <span>↓</span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-800 text-xs font-normal flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Dampak: Buku catatan berantakan, stok selisih, pelanggan menunggu lama.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Dengan Kroomify (New, Integrated & Clear) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white text-[#241A1A] flex flex-col justify-between relative shadow-md border-2 border-[#66000E]">
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#66000E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <Check className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#241A1A]">
                    Dengan Kroomify
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE]">
                  Otomatis & Terintegrasi
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#5F5652] font-normal mb-6">
                Semua alur penjualan terhubung dalam satu jalur rapi dari input katalog sampai resi pengiriman dicetak:
              </p>

              {/* Streamlined Clean Linear Flow */}
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-xs font-medium">
                  
                  <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex flex-col items-center gap-1">
                    <Package className="w-4 h-4 text-[#66000E]" />
                    <span className="text-[#241A1A] font-semibold">Produk</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex flex-col items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-[#66000E]" />
                    <span className="text-[#241A1A] font-semibold">Pesanan</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex flex-col items-center gap-1">
                    <CreditCard className="w-4 h-4 text-[#66000E]" />
                    <span className="text-[#241A1A] font-semibold">Bayar</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-[#66000E]" />
                    <span className="text-[#241A1A] font-semibold">Kirim</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#66000E] text-white flex flex-col items-center gap-1 font-bold shadow-xs">
                    <Check className="w-4 h-4" />
                    <span>Selesai</span>
                  </div>

                </div>

                <div className="p-4 rounded-xl bg-[#F5E8EA] border border-[#E8DDDE] text-[#241A1A] text-xs space-y-1.5 mt-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#66000E] shrink-0" />
                    <span className="font-bold text-[#66000E]">Hasil Nyata:</span>
                  </div>
                  <p className="text-[#5F5652] pl-6 leading-relaxed font-normal">
                    Stok terpotong otomatis, nota pesanan rapi dalam hitungan detik, dan pelanggan menerima status pengiriman secara profesional.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

