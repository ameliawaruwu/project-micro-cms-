import React from 'react';
import {
  Smartphone,
  Plus,
} from 'lucide-react';

export const MobileShowcase: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-[#E8DDDE] text-[#241A1A] relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-3">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile-First Kroombox</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-tight mb-3">
            Bisnis Anda, di Genggaman.
          </h2>
          <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal">
            Kelola toko kapan saja dan dari mana saja langsung melalui smartphone tanpa perlu membuka laptop.
          </p>
        </div>

        {/* 3 Smartphone Frames Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center max-w-5xl mx-auto">
          
          {/* PHONE 1: DASHBOARD */}
          <div className="relative mx-auto w-full max-w-[280px] rounded-[36px] bg-[#241A1A] p-3 shadow-xl border-4 border-[#E8DDDE]">
            {/* Phone Screen */}
            <div className="rounded-[28px] bg-white text-[#241A1A] p-4 min-h-[420px] flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="space-y-3">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[10px] text-[#857C76] font-mono">
                  <span>09:41</span>
                  <div className="w-12 h-2.5 rounded-full bg-[#241A1A] mx-auto" />
                  <span>100%</span>
                </div>

                {/* Top User Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-[#857C76]">Merchant Kroombox</span>
                    <h3 className="text-xs font-bold text-[#241A1A]">Toko Batik Kirana</h3>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#66000E] text-white flex items-center justify-center text-[10px] font-bold">
                    BK
                  </div>
                </div>

                {/* Metric Card */}
                <div className="p-3.5 rounded-2xl bg-[#66000E] text-white shadow-xs">
                  <span className="text-[9px] text-rose-100 font-medium">Total Omset Bulan Ini</span>
                  <p className="text-base font-bold text-white mt-0.5">Rp 8.638.000</p>
                  <span className="text-[8px] text-emerald-200 font-semibold mt-1 inline-block">
                    ↑ 24% dari pekan lalu
                  </span>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE]">
                    <span className="text-[#5F5652]">Pesanan Baru</span>
                    <p className="font-bold text-[#241A1A] text-xs mt-0.5">8 Pesanan</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE]">
                    <span className="text-[#5F5652]">Siap Dikirim</span>
                    <p className="font-bold text-[#66000E] text-xs mt-0.5">3 Paket</p>
                  </div>
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="p-2 rounded-xl bg-[#F5E8EA] text-[#66000E] text-[10px] font-bold text-center border border-[#E8DDDE]">
                01. Beranda Ringkas
              </div>
            </div>
          </div>

          {/* PHONE 2: PRODUK (Elevated Center Card) */}
          <div className="relative mx-auto w-full max-w-[290px] rounded-[36px] bg-[#241A1A] p-3 shadow-2xl border-4 border-[#66000E] -translate-y-1">
            
            {/* Floating badge */}
            <div className="absolute -top-3.5 -right-2 z-20 bg-[#66000E] text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
              <Plus className="w-3 h-3 text-white" />
              <span>Tambah Produk</span>
            </div>

            {/* Phone Screen */}
            <div className="rounded-[28px] bg-white text-[#241A1A] p-4 min-h-[430px] flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="space-y-2.5">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[10px] text-[#857C76] font-mono">
                  <span>09:41</span>
                  <div className="w-12 h-2.5 rounded-full bg-[#241A1A] mx-auto" />
                  <span>100%</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-xs font-bold text-[#241A1A]">Katalog Produk (18)</h3>
                  <button className="px-2 py-0.5 rounded-md bg-[#66000E] text-white text-[9px] font-bold">
                    + Tambah
                  </button>
                </div>

                {/* Product 1 */}
                <div className="p-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=60&auto=format&fit=crop&q=80"
                    alt="Batik"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[11px] text-[#241A1A] truncate">Batik Parang Premium</p>
                    <p className="text-[10px] text-[#66000E] font-bold">Rp 175.000</p>
                    <span className="text-[9px] text-emerald-700 font-semibold">Stok: 24 pcs</span>
                  </div>
                </div>

                {/* Product 2 */}
                <div className="p-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=60&auto=format&fit=crop&q=80"
                    alt="Kemeja"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[11px] text-[#241A1A] truncate">Kemeja Sutra Solo</p>
                    <p className="text-[10px] text-[#66000E] font-bold">Rp 275.000</p>
                    <span className="text-[9px] text-[#66000E] font-semibold">Sisa 3 pcs</span>
                  </div>
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="p-2 rounded-xl bg-[#241A1A] text-white text-[10px] font-bold text-center">
                02. Kelola Produk Cepat
              </div>
            </div>
          </div>

          {/* PHONE 3: ORDERS */}
          <div className="relative mx-auto w-full max-w-[280px] rounded-[36px] bg-[#241A1A] p-3 shadow-xl border-4 border-[#E8DDDE]">
            {/* Phone Screen */}
            <div className="rounded-[28px] bg-white text-[#241A1A] p-4 min-h-[420px] flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="space-y-2.5">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[10px] text-[#857C76] font-mono">
                  <span>09:41</span>
                  <div className="w-12 h-2.5 rounded-full bg-[#241A1A] mx-auto" />
                  <span>100%</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <h3 className="text-xs font-bold text-[#241A1A]">Pesanan Pelanggan</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] font-bold border border-[#E8DDDE]">
                    8 Baru
                  </span>
                </div>

                {/* Order 1 */}
                <div className="p-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-[10px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#241A1A]">Dina Rahmawati</span>
                    <span className="text-[#66000E] font-bold">Rp 350.000</span>
                  </div>
                  <p className="text-[9px] text-[#5F5652]">2x Batik Parang Tulis</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white text-[#5F5652] font-semibold border border-[#E8DDDE]">
                      J&T Express
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">✓ Lunas</span>
                  </div>
                </div>

                {/* Order 2 */}
                <div className="p-2 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-[10px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#241A1A]">Budi Santoso</span>
                    <span className="text-[#66000E] font-bold">Rp 275.000</span>
                  </div>
                  <p className="text-[9px] text-[#5F5652]">1x Kemeja Sutra Solo</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#F5E8EA] text-[#66000E] font-semibold">
                      Siap Kirim
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">✓ Lunas</span>
                  </div>
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="p-2 rounded-xl bg-[#FAF7F7] text-[#241A1A] text-[10px] font-bold text-center border border-[#E8DDDE]">
                03. Pemrosesan Pesanan
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

