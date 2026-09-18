import React from 'react';
import { Check, ArrowRight, Zap, Sparkles, X, ShieldCheck } from 'lucide-react';

interface PricingSectionProps {
  onNavigateRegister: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onNavigateRegister,
}) => {
  return (
    <section 
      id="harga" 
      className="py-12 sm:py-16 lg:py-20 bg-white border-y border-[#E8DDDE] scroll-mt-16 sm:scroll-mt-20 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-3 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#66000E]" />
            <span>3 Pilihan Paket Resmi Tanpa Biaya Tersembunyi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-snug mb-2">
            Paket Bisnis Sesuai Skala UMKM Anda.
          </h2>
          <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal max-w-xl mx-auto">
            Mulai dari paket belajar gratis hingga paket komplit dengan custom domain sendiri dan checkout payment gateway otomatis.
          </p>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          
          {/* PLAN 1: PAKET FREE */}
          <div className="p-6 rounded-3xl bg-[#FAF7F7] border border-[#E8DDDE] flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-[#241A1A]">Paket Free</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#5F5652] border border-[#E8DDDE]">
                  Mulai Belajar
                </span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-[#241A1A]">Rp0</span>
                <span className="text-xs text-[#857C76] font-normal ml-1">/ tahun</span>
                <p className="text-xs text-[#5F5652] mt-1.5 font-normal leading-relaxed">
                  Cocok untuk mempelajari sistem &amp; merapikan katalog produk lokal secara gratis.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#E8DDDE]/80 text-xs sm:text-sm text-[#241A1A]">
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Katalog Produk (Maks 10 Produk)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Subdomain namatoko.kroombox.com</span>
                </div>
                <div className="flex items-center gap-2 text-[#857C76]">
                  <div className="w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                    <X className="w-3 h-3" />
                  </div>
                  <span className="line-through">Tanpa Checkout Midtrans</span>
                </div>
                <div className="flex items-center gap-2 text-[#857C76]">
                  <div className="w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                    <X className="w-3 h-3" />
                  </div>
                  <span className="line-through">Tanpa Pengiriman Biteship</span>
                </div>
                <div className="flex items-center gap-2 text-[#857C76]">
                  <div className="w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                    <X className="w-3 h-3" />
                  </div>
                  <span className="line-through">Tanpa Deploy / Custom Domain</span>
                </div>
                <div className="flex items-center gap-2 text-[#706866] text-[11px] pt-1">
                  <span>* Watermark resmi Kroomify di footer</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onNavigateRegister}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-[#F5E8EA] text-[#241A1A] font-semibold text-xs sm:text-sm border border-[#E8DDDE] transition cursor-pointer min-h-[44px]"
              >
                Daftar Paket Free
              </button>
            </div>
          </div>

          {/* PLAN 2: PERSONAL TOKO */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8DDDE] flex flex-col justify-between hover:shadow-md hover:border-[#66000E]/40 transition">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-[#241A1A]">Personal Toko</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Starter UMKM
                </span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-[#66000E]">Rp350.000</span>
                <span className="text-xs text-[#857C76] font-normal ml-1">/ tahun</span>
                <p className="text-[11px] text-[#706866] mt-1">Hosting Rp200k + CMS Rp150k / thn</p>
                <p className="text-xs text-[#5F5652] mt-1.5 font-normal leading-relaxed">
                  Pilihan hemat pedagang mandiri: website online &amp; bisa bayar QRIS.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#E8DDDE]/80 text-xs sm:text-sm text-[#241A1A]">
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-emerald-700">Deploy Toko Online Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Katalog Produk hingga 50 Produk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-semibold">Checkout Midtrans (QRIS &amp; VA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Cek Ongkir &amp; Kirim Otomatis Biteship</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Hosting Cloud Server Cepat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Laporan Pesanan &amp; Penjualan Harian</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onNavigateRegister}
                className="w-full py-2.5 rounded-xl bg-[#66000E] hover:bg-[#55000C] text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer min-h-[44px]"
              >
                Pilih Personal Toko
              </button>
            </div>
          </div>

          {/* PLAN 3: COMMUNITY UMKM */}
          <div className="relative p-6 rounded-3xl bg-white border-2 border-[#66000E] text-[#241A1A] flex flex-col justify-between shadow-xl">
            {/* Best value tag */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-[#66000E] to-[#990014] text-white text-[10px] sm:text-[11px] font-bold px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Paling Laris UMKM</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-[#241A1A]">Community UMKM</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE]">
                  Bisnis Pro
                </span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-[#66000E]">Rp1.000.000</span>
                <span className="text-xs text-[#857C76] font-normal ml-1">/ tahun</span>
                <p className="text-[11px] text-[#706866] mt-1">Hosting Rp700k + CMS Rp300k / thn</p>
                <p className="text-xs text-[#5F5652] mt-1.5 font-normal leading-relaxed">
                  Solusi lengkap tanpa batas dengan nama domain sendiri &amp; white-label.
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#E8DDDE]/80 text-xs sm:text-sm text-[#241A1A]">
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[#66000E]">Custom Domain (.com / .id) + SSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-semibold">Unlimited Produk &amp; Varian</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Bebas Watermark (100% Brand Sendiri)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Full Midtrans (QRIS, VA Bank, E-Wallet)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Cetak Label Resi Thermal Massal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Visual Layout &amp; Theme Builder Lengkap</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#66000E] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Hosting Prioritas Tinggi &amp; SLA 99.9%</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onNavigateRegister}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Pilih Community UMKM</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
