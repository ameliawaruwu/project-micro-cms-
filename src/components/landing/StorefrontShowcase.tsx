import React, { useState } from 'react';
import {
  Store,
  Share2,
  Search,
  ShoppingBag,
  ExternalLink,
  Check,
} from 'lucide-react';

interface StorefrontShowcaseProps {
  onViewStorefrontDemo: () => void;
  onNavigateRegister: () => void;
}

export const StorefrontShowcase: React.FC<StorefrontShowcaseProps> = ({
  onViewStorefrontDemo,
  onNavigateRegister,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.('https://kroomify.id/toko-batik');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF7F7] border-t border-[#E8DDDE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-3">
            <Store className="w-3.5 h-3.5" />
            <span>Halaman Toko Pembeli Modern</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-snug mb-2">
            Punya Toko Online Sendiri.
          </h2>
          <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal">
            Setiap bisnis mendapatkan halaman toko yang dapat dibagikan langsung kepada pelanggan melalui WhatsApp, Instagram, dan TikTok.
          </p>
        </div>

        {/* Storefront Visual Container */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-[#E8DDDE] shadow-md overflow-hidden">
          
          {/* Top Browser URL Bar */}
          <div className="bg-[#241A1A] text-white p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">

              <div className="px-3 py-1 rounded-lg bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 flex-1 sm:flex-initial">
                <Store className="w-3.5 h-3.5 text-[#F5E8EA]" />
                <span className="font-normal">kroomify.id/toko-batik</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition text-xs cursor-pointer min-h-[36px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Bagikan Toko'}</span>
              </button>

              <button
                onClick={onViewStorefrontDemo}
                className="px-3.5 py-1.5 rounded-lg bg-[#66000E] hover:bg-[#801010] text-white font-semibold flex items-center gap-1.5 transition text-xs shadow-xs cursor-pointer min-h-[36px]"
              >
                <span>Buka Toko Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Storefront Content Preview */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FAF7F7]">
            
            {/* Store Banner & Brand Header */}
            <div className="relative rounded-2xl bg-[#241A1A] text-white p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 shadow-xs overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=160&auto=format&fit=crop&q=80"
                alt="Logo Toko"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#66000E] shadow-sm shrink-0"
              />
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Toko Batik Kirana</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E]">
                    ✓ Resmi Terverifikasi
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 font-normal">
                  Batik Lokal Berkualitas • Asli Pekalongan & Solo
                </p>
                <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-3 text-xs text-neutral-300 font-normal">
                  <span>📍 Pekalongan, Jawa Tengah</span>
                  <span>•</span>
                  <span>⭐ 4.9 (140+ Ulasan)</span>
                </div>
              </div>
            </div>

            {/* Search and Categories bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#857C76] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari motif batik favorit..."
                  readOnly
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[#E8DDDE] text-[#241A1A] font-normal"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="px-3 py-1.5 rounded-lg bg-[#66000E] text-white font-semibold shadow-xs">Semua Produk</span>
                <span className="px-3 py-1.5 rounded-lg bg-white text-[#5F5652] font-normal border border-[#E8DDDE]">Batik Tulis</span>
                <span className="px-3 py-1.5 rounded-lg bg-white text-[#5F5652] font-normal border border-[#E8DDDE]">Kemeja Pria</span>
              </div>
            </div>

            {/* Product Cards Preview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
              
              {/* Product 1 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DDDE] shadow-xs hover:shadow-md transition space-y-2">
                <img
                  src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80"
                  alt="Batik Parang"
                  className="w-full h-36 rounded-xl object-cover"
                />
                <div>
                  <span className="text-[10px] font-semibold text-[#66000E] bg-[#F5E8EA] px-2 py-0.5 rounded-full border border-[#E8DDDE]">
                    Terlaris
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#241A1A] mt-1.5 truncate">Batik Parang Pekalongan</h4>
                  <p className="text-xs text-[#5F5652] font-normal line-clamp-1">Kain katun primisima halus dan adem</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs sm:text-sm font-bold text-[#66000E]">Rp 150.000</span>
                  <button className="px-3 py-1 rounded-lg bg-[#241A1A] hover:bg-[#66000E] text-white text-xs font-semibold flex items-center gap-1 transition min-h-[32px]">
                    <ShoppingBag className="w-3 h-3" />
                    <span>Beli</span>
                  </button>
                </div>
              </div>

              {/* Product 2 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DDDE] shadow-xs hover:shadow-md transition space-y-2">
                <img
                  src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&auto=format&fit=crop&q=80"
                  alt="Batik Mega Mendung"
                  className="w-full h-36 rounded-xl object-cover"
                />
                <div>
                  <span className="text-[10px] font-semibold text-[#241A1A] bg-[#FAF7F7] px-2 py-0.5 rounded-full border border-[#E8DDDE]">
                    Koleksi Baru
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#241A1A] mt-1.5 truncate">Batik Mega Mendung Sutra</h4>
                  <p className="text-xs text-[#5F5652] font-normal line-clamp-1">Motif khas Cirebon modern</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs sm:text-sm font-bold text-[#66000E]">Rp 175.000</span>
                  <button className="px-3 py-1 rounded-lg bg-[#241A1A] hover:bg-[#66000E] text-white text-xs font-semibold flex items-center gap-1 transition min-h-[32px]">
                    <ShoppingBag className="w-3 h-3" />
                    <span>Beli</span>
                  </button>
                </div>
              </div>

              {/* Product 3 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E8DDDE] shadow-xs hover:shadow-md transition space-y-2 hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80"
                  alt="Kemeja Batik"
                  className="w-full h-36 rounded-xl object-cover"
                />
                <div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Siap Kirim
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#241A1A] mt-1.5 truncate">Kemeja Batik Solo Premium</h4>
                  <p className="text-xs text-[#5F5652] font-normal line-clamp-1">Jahitan dobel furing sangat nyaman dipakai</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs sm:text-sm font-bold text-[#66000E]">Rp 225.000</span>
                  <button className="px-3 py-1 rounded-lg bg-[#241A1A] hover:bg-[#66000E] text-white text-xs font-semibold flex items-center gap-1 transition min-h-[32px]">
                    <ShoppingBag className="w-3 h-3" />
                    <span>Beli</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

