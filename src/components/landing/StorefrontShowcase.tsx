import React, { useState, useRef } from 'react';
import {
  Store,
  Share2,
  Search,
  ShoppingBag,
  ExternalLink,
  Check,
  Rotate3d,
  Network,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import BrainCellAnimation from './BrainCellAnimation';

interface StorefrontShowcaseProps {
  onViewStorefrontDemo: () => void;
  onNavigateRegister: () => void;
}

export const StorefrontShowcase: React.FC<StorefrontShowcaseProps> = ({
  onViewStorefrontDemo,
  onNavigateRegister,
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeBranchTab, setActiveBranchTab] = useState<'pusat' | 'bandung' | 'surabaya'>('pusat');

  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.('https://kroomify.id/toko-batik');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 10;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 10;

    setMousePos({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const transformStyle = isHovered
    ? `perspective(1200px) rotateX(${mousePos.x}deg) rotateY(${mousePos.y}deg) scale3d(1.015, 1.015, 1.015)`
    : 'perspective(1200px) rotateX(2deg) rotateY(-3deg) scale3d(1, 1, 1)';

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF7F7] border-t border-[#E8DDDE] overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#66000E]/5 blur-3xl -z-10 pointer-events-none rounded-full" />
      
      <BrainCellAnimation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-3">
            <Network className="w-3.5 h-3.5" />
            <span>Rantai Toko Digital & Multi-Branch Online</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-snug mb-2">
            Etalase Digital Rantai Toko Berotasi 3D.
          </h2>
          <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal">
            Setiap cabang fisik memiliki halaman toko digital independen & terhubung langsung ke link WhatsApp, Instagram, dan TikTok.
          </p>
        </div>

        {/* 3D Perspective Controls Indicator */}
        <div className="max-w-4xl mx-auto mb-2 flex items-center justify-between text-xs text-[#5F5652]">
          <div className="flex items-center gap-2">
            <Rotate3d className="w-4 h-4 text-[#66000E] animate-spin" />
            <span className="font-medium text-[#241A1A]">Animasi 3D Interaktif Rantai Toko</span>
          </div>
          <span className="text-[11px] text-[#857C76]">Arahkan kursor untuk rotasi 3D</span>
        </div>

        {/* Storefront 3D Rotational Container */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: transformStyle,
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="max-w-4xl mx-auto rounded-2xl bg-white border border-[#E8DDDE] shadow-2xl overflow-hidden preserve-3d relative transition-all"
        >
          
          {/* FLOATING 3D DEPTH BADGE (Layer Z: 40px) */}
          <div 
            style={{ transform: 'translateZ(40px)' }}
            className="absolute top-14 right-4 z-40 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-[#E8DDDE] hidden sm:flex items-center gap-2 text-xs font-bold text-[#241A1A]"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#241A1A]">Multi-Branch Synced</p>
              <p className="text-[9px] text-[#857C76] font-normal">Stok realtime 3 cabang</p>
            </div>
          </div>

          {/* Top Browser URL Bar */}
          <div className="bg-[#241A1A] text-white p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="px-3 py-1 rounded-lg bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 flex-1 sm:flex-initial">
                <Store className="w-3.5 h-3.5 text-[#F5E8EA]" />
                <span className="font-normal">kroomify.id/toko-batik</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                ● Live 3D Chain
              </span>
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
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Toko Batik Kirana (Rantai Toko)</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E]">
                    ✓ Resmi Terverifikasi
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 font-normal">
                  Batik Lokal Berkualitas • Pekalongan, Solo, & Jakarta
                </p>
                <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-300 font-normal">
                  <span>📍 3 Cabang Aktif</span>
                  <span>•</span>
                  <span>⭐ 4.9 (140+ Ulasan)</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">⚡ Delivery Biteship Instant</span>
                </div>
              </div>
            </div>

            {/* Branch Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-[#E8DDDE] text-xs">
              <span className="font-bold text-[#241A1A] px-2 text-[11px]">Etalase Cabang:</span>
              <button
                onClick={() => setActiveBranchTab('pusat')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeBranchTab === 'pusat'
                    ? 'bg-[#66000E] text-white shadow-2xs'
                    : 'text-[#5F5652] hover:bg-[#FAF7F7]'
                }`}
              >
                Pusat (Jakarta)
              </button>
              <button
                onClick={() => setActiveBranchTab('bandung')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeBranchTab === 'bandung'
                    ? 'bg-[#66000E] text-white shadow-2xs'
                    : 'text-[#5F5652] hover:bg-[#FAF7F7]'
                }`}
              >
                Cabang Bandung
              </button>
              <button
                onClick={() => setActiveBranchTab('surabaya')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeBranchTab === 'surabaya'
                    ? 'bg-[#66000E] text-white shadow-2xs'
                    : 'text-[#5F5652] hover:bg-[#FAF7F7]'
                }`}
              >
                Cabang Surabaya
              </button>
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
                    Terlaris • {activeBranchTab === 'pusat' ? 'Pusat' : activeBranchTab === 'bandung' ? 'Bandung' : 'Surabaya'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#241A1A] mt-1.5 truncate">Batik Parang Pekalongan</h4>
                  <p className="text-xs text-[#5F5652] font-normal line-clamp-1">Kain katun primisima halus dan adem</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs sm:text-sm font-bold text-[#66000E]">Rp 150.000</span>
                  <button className="px-3 py-1 rounded-lg bg-[#241A1A] hover:bg-[#66000E] text-white text-xs font-semibold flex items-center gap-1 transition min-h-[32px] cursor-pointer">
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
                  <button className="px-3 py-1 rounded-lg bg-[#241A1A] hover:bg-[#66000E] text-white text-xs font-semibold flex items-center gap-1 transition min-h-[32px] cursor-pointer">
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
                  <button className="px-3 py-1 rounded-lg bg-[#241A1A] hover:bg-[#66000E] text-white text-xs font-semibold flex items-center gap-1 transition min-h-[32px] cursor-pointer">
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
