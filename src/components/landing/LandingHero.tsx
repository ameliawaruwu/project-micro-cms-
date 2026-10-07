import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Store,
  ShoppingBag,
  Bell,
  CreditCard,
  Truck,
  Box,
  Users,
  BarChart3,
  Package,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LandingHeroProps {
  onNavigateRegister: () => void;
  onNavigateLogin: () => void;
  onLaunchDemo: () => void;
  onScrollToHowItWorks: () => void;
  isAuthenticated?: boolean;
}

/* ──────────────────────────────────────────
   IconBadge — the round icon that sits at
   the top-left corner of each floating card
   ────────────────────────────────────────── */
const IconBadge: React.FC<{
  icon: React.ReactNode;
  bg?: string;
  className?: string;
}> = ({ icon, bg = 'bg-[#66000E]', className = '' }) => (
  <div className={`absolute -top-3 -left-3 z-30 w-7 h-7 ${bg} rounded-full flex items-center justify-center shadow-md border-2 border-white ${className}`}>
    {icon}
  </div>
);

export const LandingHero: React.FC<LandingHeroProps> = ({
  onNavigateRegister,
  onScrollToHowItWorks,
}) => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100svh-64px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center pt-8 pb-20 sm:py-12 lg:py-16 overflow-hidden bg-[#FAFAFA] font-sans"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0 items-center">

          {/* ═══════ LEFT COLUMN ═══════ */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left z-20 py-10">
            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-[52px] text-[#241A1A] tracking-tight leading-[1.15]">
              Bikin Toko Online,<br />
              <span className="text-[#66000E] relative inline-block italic">
                Semudah Mengelola
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#66000E]/20" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,6 Q50,12 100,2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span><br />
              Toko Sendiri
            </h1>

            <p className="text-[14px] lg:text-[15px] text-[#5F5652] max-w-[420px] mx-auto lg:mx-0 leading-relaxed font-medium">
              Platform e-commerce modern berkecepatan tinggi dengan integrasi otomatis payment gateway, kurir logistik real-time, cloud CDN, dan enkripsi data aman.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button onClick={onNavigateRegister} className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 lg:h-13 px-8 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:shadow-[#66000E]/20 active:scale-[0.98] transition-all cursor-pointer">
                <span>Mulai Gratis</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={onScrollToHowItWorks} className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 lg:h-13 px-8 rounded-full bg-white hover:bg-[#FAF7F7] text-[#241A1A] font-semibold text-sm border border-[#E8DDDE] shadow-sm active:scale-[0.98] transition-all cursor-pointer">
                <span>Lihat Cara Kerja</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#857C76] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-3 gap-x-6 text-[12px] font-bold text-[#706866]">
              <div className="flex items-center gap-2">
                <div className="bg-[#66000E] rounded-full p-0.5"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>
                <span>Cloud CDN Subdomain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-sky-500 rounded-full p-0.5"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>
                <span>API Payment & Logistik</span>
              </div>
            </div>
          </div>


          {/* ═══════ RIGHT COLUMN ═══════ */}
          <div className="lg:col-span-7 relative flex justify-center items-center min-h-[500px] lg:min-h-[600px]">

            {/* Soft elliptical background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#66000E]/[0.03] blur-[60px] pointer-events-none" />

            {/* Animated Brain Cell / Synapse Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 660 600" fill="none">
              <defs>
                <linearGradient id="synapse-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#66000E" stopOpacity="0" />
                  <stop offset="50%" stopColor="#66000E" stopOpacity="1" />
                  <stop offset="100%" stopColor="#66000E" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <style>
                {`
                  .synapse-path {
                    stroke-dasharray: 40 400;
                    animation: synapse-flow linear infinite;
                  }
                  @keyframes synapse-flow {
                    0% { stroke-dashoffset: 440; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { stroke-dashoffset: 0; opacity: 0; }
                  }
                  .d1 { animation-delay: 0s; animation-duration: 3s; }
                  .d2 { animation-delay: 0.5s; animation-duration: 4s; }
                  .d3 { animation-delay: 1s; animation-duration: 3.5s; }
                  .d4 { animation-delay: 1.5s; animation-duration: 4.5s; }
                  .d5 { animation-delay: 2s; animation-duration: 3.2s; }
                  .d6 { animation-delay: 2.5s; animation-duration: 3.8s; }
                  .d7 { animation-delay: 0.8s; animation-duration: 3.6s; }
                `}
              </style>

              {/* Base faint lines */}
              <g stroke="#66000E" strokeWidth="1" strokeOpacity="0.08">
                <path d="M330,300 C230,200 160,160 110,120" />
                <path d="M330,300 C330,180 370,110 370,70" />
                <path d="M330,300 C450,200 540,140 570,100" />
                <path d="M330,300 C500,280 560,250 590,240" />
                <path d="M330,300 C480,380 530,430 560,460" />
                <path d="M330,300 C300,430 270,480 250,500" />
                <path d="M330,300 C200,320 130,310 80,290" />
              </g>

              {/* Animated glowing lines */}
              <g stroke="url(#synapse-gradient)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)">
                <path className="synapse-path d1" d="M330,300 C230,200 160,160 110,120" />
                <path className="synapse-path d2" d="M330,300 C330,180 370,110 370,70" />
                <path className="synapse-path d3" d="M330,300 C450,200 540,140 570,100" />
                <path className="synapse-path d4" d="M330,300 C500,280 560,250 590,240" />
                <path className="synapse-path d5" d="M330,300 C480,380 530,430 560,460" />
                <path className="synapse-path d6" d="M330,300 C300,430 270,480 250,500" />
                <path className="synapse-path d7" d="M330,300 C200,320 130,310 80,290" />
              </g>
            </svg>


            {/* ──── CENTRAL BROWSER ──── */}
            <div
              className="relative z-10"
              style={{
                width: 300,
                transform: 'perspective(900px) rotateY(-10deg) rotateX(4deg)',
              }}
            >
              <div className="bg-white rounded-xl shadow-[0_20px_50px_-10px_rgba(102,0,14,0.15)] overflow-hidden flex flex-col border border-[#EDE7E7]" style={{ height: 230 }}>
                {/* Browser chrome */}
                <div className="bg-[#8A1A2A] px-3 py-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                </div>
                {/* Awning strip */}
                <div className="h-3 w-full flex">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#8A1A2A]' : 'bg-white'}`} />
                  ))}
                </div>
                {/* Dashboard body */}
                <div className="flex-1 bg-[#FAF7F7] p-3 flex gap-2.5">
                  {/* Sidebar */}
                  <div className="w-6 flex flex-col gap-2 items-center pt-1 border-r border-[#E8DDDE] pr-2">
                    <Store className="w-3 h-3 text-[#66000E]" />
                    <Package className="w-3 h-3 text-[#857C76]" />
                    <Users className="w-3 h-3 text-[#857C76]" />
                    <BarChart3 className="w-3 h-3 text-[#857C76]" />
                  </div>
                  {/* Main content */}
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Revenue card */}
                    <div className="bg-white rounded-lg p-2 shadow-sm border border-[#EDE7E7] flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[7px] text-[#857C76] font-semibold leading-none">Total Penjualan</p>
                        <p className="text-[11px] font-bold text-[#241A1A] leading-tight">Rp 12.450.000</p>
                        <p className="text-[6px] text-emerald-600 font-bold leading-none">+12%</p>
                      </div>
                    </div>
                    {/* Product grid */}
                    <div className="grid grid-cols-3 gap-1.5 flex-1">
                      {[
                        { c: '#D4B895', h: 'h-8' },
                        { c: '#E2D5D6', h: 'h-8' },
                        { c: '#C8A882', h: 'h-8' },
                        { c: '#7C8A76', h: 'h-8' },
                        { c: '#D4E4E6', h: 'h-8' },
                        { c: '#A69085', h: 'h-8' },
                      ].map((p, i) => (
                        <div key={i} className="bg-white rounded-md p-1 border border-[#EDE7E7] flex flex-col items-center">
                          <div className={`w-full ${p.h} rounded-sm bg-gray-50/80 flex items-center justify-center`}>
                            <div className="w-3 h-5 rounded-sm opacity-80" style={{ backgroundColor: p.c }} />
                          </div>
                          <div className="w-full h-[2px] bg-[#E8DDDE] rounded-full mt-1" />
                          <div className="w-2/3 h-[2px] bg-[#F5E8EA] rounded-full mt-0.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative shopping bags */}
              <div className="absolute -bottom-7 -left-6 flex items-end gap-1 z-20">
                <div className="w-8 h-10 bg-[#8A1A2A] rounded-t-sm rounded-b-md shadow-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white/40" />
                </div>
                <div className="w-6 h-8 bg-gray-100 rounded-t-sm rounded-b-md shadow-md border border-gray-200 flex items-center justify-center">
                  <ShoppingBag className="w-3 h-3 text-gray-300" />
                </div>
              </div>

              {/* Mini physical storefront */}
              <div className="absolute -bottom-8 right-4 z-20">
                <div className="w-16 h-14 bg-white rounded-lg shadow-lg border border-[#EDE7E7] flex flex-col overflow-hidden">
                  <div className="h-3.5 w-full flex">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#8A1A2A]' : 'bg-white'}`} />
                    ))}
                  </div>
                  <div className="flex-1 bg-[#FAF7F7] flex gap-1 items-end justify-center pb-1 px-1">
                    <div className="w-3 h-5 bg-[#241A1A] rounded-sm" />
                    <div className="w-4 h-3.5 bg-[#66000E] rounded-sm" />
                  </div>
                </div>
              </div>
            </div>


            {/* ──── FLOATING CARDS WITH ICON BADGES ──── */}

            {/* 1 · Katalog Produk — Top Left */}
            <div className="absolute z-20 animate-float-subtle" style={{ top: '8%', left: '4%', animationDelay: '0.2s' }}>
              <div className="relative bg-white rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-[#F0EAEA] w-[130px]">
                <IconBadge icon={<ShoppingBag className="w-3.5 h-3.5 text-white" />} />
                <div className="flex gap-2 mb-2 justify-center pt-2">
                  <div className="w-5 h-7 bg-[#D4B895] rounded-sm shadow-sm" />
                  <div className="w-4 h-5 bg-[#7C8A76] rounded-full mt-2 shadow-sm" />
                  <div className="w-5 h-6 bg-[#E2D5D6] rounded-sm mt-1 shadow-sm" />
                </div>
                <p className="text-[9px] font-bold text-[#241A1A] text-center">Katalog Produk</p>
              </div>
            </div>

            {/* 2 · Pesanan Masuk — Top Center */}
            <div className="absolute z-20 animate-float-subtle" style={{ top: '2%', left: '38%', animationDelay: '0.7s' }}>
              <div className="relative bg-white rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-[#F0EAEA] w-[140px]">
                <IconBadge icon={<Bell className="w-3.5 h-3.5 text-white" />} className="!-top-3 !-left-3" />
                <span className="absolute -top-1 left-3 w-4 h-4 bg-red-500 rounded-full text-[7px] text-white flex items-center justify-center font-bold border-2 border-white z-40">3</span>
                <p className="text-[9px] font-bold text-[#241A1A] mb-2 mt-1 ml-4">Pesanan Masuk</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 bg-[#FAF7F7] rounded-md p-1.5">
                    <div className="w-4 h-5 bg-[#D4B895] rounded-sm shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-[3px] bg-[#E8DDDE] rounded-full w-full" />
                      <div className="h-[3px] bg-[#F5E8EA] rounded-full w-2/3" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#FAF7F7] rounded-md p-1.5">
                    <div className="w-4 h-5 bg-[#E2D5D6] rounded-sm shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-[3px] bg-[#E8DDDE] rounded-full w-3/4" />
                      <div className="h-[3px] bg-[#F5E8EA] rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 · Pembayaran — Top Right */}
            <div className="absolute z-20 animate-float-subtle" style={{ top: '10%', right: '2%', animationDelay: '1s' }}>
              <div className="relative bg-white rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-[#F0EAEA] w-[130px]">
                <IconBadge icon={<CreditCard className="w-3.5 h-3.5 text-white" />} bg="bg-sky-500" />
                <p className="text-[9px] font-bold text-[#241A1A] mb-2 mt-1 ml-4">Pembayaran</p>
                <div className="flex items-center gap-2 bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                  <div className="bg-emerald-500 p-0.5 rounded-full shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[7px] font-bold text-emerald-700 leading-tight">Pembayaran</p>
                    <p className="text-[7px] font-bold text-emerald-700 leading-tight">Berhasil</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 · Pengiriman — Right Middle */}
            <div className="absolute z-20 animate-float-subtle" style={{ top: '45%', right: '0%', animationDelay: '0.5s' }}>
              <div className="relative bg-white rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-[#F0EAEA] w-[130px]">
                <IconBadge icon={<Truck className="w-3.5 h-3.5 text-white" />} />
                <p className="text-[9px] font-bold text-[#241A1A] mb-2 mt-1 ml-4">Pengiriman</p>
                {/* Package box icon */}
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-8 bg-[#D4B895] rounded shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 w-full h-2 bg-[#C2A380]" />
                    <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-full bg-[#C2A380]" />
                  </div>
                </div>
                <p className="text-[7px] text-[#857C76] font-semibold mb-1">Dalam Pengiriman</p>
                <div className="w-full h-1.5 bg-[#E8DDDE] rounded-full relative">
                  <div className="absolute top-0 left-0 h-full w-2/3 bg-[#66000E] rounded-full" />
                  <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#66000E] rounded-full border-2 border-white shadow-sm" style={{ left: 'calc(66% - 4px)' }} />
                </div>
              </div>
            </div>

            {/* 5 · Stok — Bottom Right */}
            <div className="absolute z-20 animate-float-subtle" style={{ bottom: '8%', right: '12%', animationDelay: '1.2s' }}>
              <div className="relative bg-white rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-[#F0EAEA] w-[130px]">
                <IconBadge icon={<Box className="w-3.5 h-3.5 text-white" />} />
                <p className="text-[9px] font-bold text-[#241A1A] mb-2 mt-1 ml-4">Stok</p>
                <div className="flex justify-center gap-2 mb-2">
                  <div className="w-4 h-7 bg-emerald-500 rounded-sm shadow-sm" />
                  <div className="w-4 h-7 bg-red-400 rounded-sm shadow-sm" />
                  <div className="w-3.5 h-8 bg-sky-500 rounded-sm shadow-sm" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <div className="flex-1 h-1 bg-emerald-200 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <div className="flex-1 h-1 bg-red-200 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* 6 · Pelanggan — Bottom Left */}
            <div className="absolute z-20 animate-float-subtle" style={{ bottom: '6%', left: '8%', animationDelay: '0.8s' }}>
              <div className="relative bg-white rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-[#F0EAEA] w-[135px]">
                <IconBadge icon={<Users className="w-3.5 h-3.5 text-white" />} />
                <p className="text-[9px] font-bold text-[#241A1A] mb-2 mt-1 ml-4">Pelanggan</p>
                <div className="flex items-center bg-[#FAF7F7] p-1.5 rounded-lg border border-[#EDE7E7]">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-5 h-5 rounded-full border-2 border-white overflow-hidden ${i > 1 ? '-ml-2' : ''}`}
                      style={{ backgroundColor: ['#93C5FD', '#FCD34D', '#6EE7B7', '#C4B5FD'][i - 1] }}
                    >
                      <img src={`https://i.pravatar.cc/40?img=${i + 10}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <span className="text-[7px] font-bold text-[#857C76] ml-1.5">+</span>
                </div>
              </div>
            </div>

            {/* 7 · Laporan Penjualan — Left Middle */}
            <div className="absolute z-20 animate-float-subtle" style={{ top: '38%', left: '0%', animationDelay: '0.3s' }}>
              <div className="relative bg-white rounded-2xl p-3 shadow-[0_8px_24px_rgba(0,0,0,0.07)] border border-[#F0EAEA] w-[130px]">
                <IconBadge icon={<BarChart3 className="w-3.5 h-3.5 text-white" />} />
                <p className="text-[9px] font-bold text-[#241A1A] mb-2 mt-1 ml-4">Laporan Penjualan</p>
                <div className="flex items-end justify-between h-10 px-1">
                  <div className="w-3 bg-[#E8DDDE] rounded-sm h-[25%]" />
                  <div className="w-3 bg-[#E8DDDE] rounded-sm h-[40%]" />
                  <div className="w-3 bg-[#E8DDDE] rounded-sm h-[55%]" />
                  <div className="w-3 bg-[#E8DDDE] rounded-sm h-[75%]" />
                  <div className="w-3 bg-[#8A1A2A] rounded-sm h-[95%]" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
