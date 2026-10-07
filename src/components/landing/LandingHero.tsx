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


          {/* ═══════ RIGHT COLUMN: 3D STORE & ECOSYSTEM NODES ═══════ */}
          <div className="lg:col-span-7 relative flex justify-center items-center min-h-[540px] sm:min-h-[600px] lg:min-h-[640px] w-full select-none">
            
            {/* Scale wrapper for small mobile screens */}
            <div className="relative w-full max-w-[660px] h-[540px] sm:h-[600px] flex items-center justify-center scale-[0.82] sm:scale-95 lg:scale-100 transition-transform origin-center">
              
              {/* Soft background ambient glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-[#66000E]/[0.04] blur-[80px] pointer-events-none" />

              {/* ──── SVG NETWORK CONNECTION LINES (CONNECTING CARDS TO CENTER) ──── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 660 600" fill="none">
                <defs>
                  <linearGradient id="rose-pulse" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#800C19" stopOpacity="0" />
                    <stop offset="50%" stopColor="#800C19" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#800C19" stopOpacity="0" />
                  </linearGradient>
                  <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <style>
                  {`
                    .synapse-pulse {
                      stroke-dasharray: 50 350;
                      animation: synapse-flow 4s linear infinite;
                    }
                    @keyframes synapse-flow {
                      0% { stroke-dashoffset: 400; opacity: 0; }
                      20% { opacity: 1; }
                      80% { opacity: 1; }
                      100% { stroke-dashoffset: 0; opacity: 0; }
                    }
                    .d-1 { animation-delay: 0s; }
                    .d-2 { animation-delay: 0.6s; }
                    .d-3 { animation-delay: 1.2s; }
                    .d-4 { animation-delay: 1.8s; }
                    .d-5 { animation-delay: 2.4s; }
                    .d-6 { animation-delay: 3.0s; }
                  `}
                </style>

                {/* Base connection curves (Soft Rose/Pink) */}
                <g stroke="#E8C5C8" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3">
                  {/* Top Left: Katalog Produk */}
                  <path d="M 330,290 C 240,210 160,150 120,110" />
                  {/* Top Center: Pesanan Masuk */}
                  <path d="M 330,260 C 330,170 330,110 330,70" />
                  {/* Top Right: Pembayaran */}
                  <path d="M 330,290 C 420,210 500,150 540,110" />
                  {/* Middle Left: Laporan Penjualan */}
                  <path d="M 280,310 C 180,310 120,310 80,310" />
                  {/* Middle Right: Pengiriman */}
                  <path d="M 380,310 C 480,310 540,310 580,310" />
                  {/* Bottom Left: Pelanggan */}
                  <path d="M 310,340 C 230,420 170,470 130,510" />
                  {/* Bottom Right: Stok */}
                  <path d="M 350,340 C 430,420 490,470 530,510" />
                </g>

                {/* Animated Light Pulses along lines */}
                <g stroke="url(#rose-pulse)" strokeWidth="3" strokeLinecap="round" filter="url(#node-glow)">
                  <path className="synapse-pulse d-1" d="M 330,290 C 240,210 160,150 120,110" />
                  <path className="synapse-pulse d-2" d="M 330,260 C 330,170 330,110 330,70" />
                  <path className="synapse-pulse d-3" d="M 330,290 C 420,210 500,150 540,110" />
                  <path className="synapse-pulse d-4" d="M 280,310 C 180,310 120,310 80,310" />
                  <path className="synapse-pulse d-5" d="M 380,310 C 480,310 540,310 580,310" />
                  <path className="synapse-pulse d-6" d="M 310,340 C 230,420 170,470 130,510" />
                </g>
              </svg>


              {/* ──── CENTRAL 3D BROWSER & PHYSICAL STORE DISPLAY ──── */}
              <div
                className="relative z-10 transition-transform duration-500 hover:scale-[1.02]"
                style={{
                  width: 340,
                  transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)',
                }}
              >
                {/* Main Browser Frame */}
                <div className="bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(128,12,25,0.2)] border border-[#EADBDB] overflow-hidden flex flex-col" style={{ height: 260 }}>
                  
                  {/* Browser Crimson Header Bar */}
                  <div className="bg-[#800C19] px-3.5 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
                    </div>
                    <span className="text-[10px] font-bold text-white/80 flex items-center gap-1">
                      <Store className="w-3 h-3 text-white" /> Toko Saya
                    </span>
                  </div>

                  {/* Red & White Striped Canopy Roof Awning */}
                  <div className="h-4 w-full flex shadow-inner">
                    {[...Array(18)].map((_, i) => (
                      <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-[#800C19]' : 'bg-white'}`} />
                    ))}
                  </div>

                  {/* Browser Dashboard Interior */}
                  <div className="flex-1 bg-[#FAF7F7] p-3 flex gap-2.5">
                    {/* Left Sidebar */}
                    <div className="w-7 flex flex-col items-center gap-2.5 pt-1 border-r border-[#EADBDB] pr-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#800C19]" />
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                    </div>

                    {/* Dashboard Main View */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="grid grid-cols-12 gap-2">
                        {/* 4 Product Grid Cards */}
                        <div className="col-span-7 grid grid-cols-2 gap-1.5">
                          {/* Pouch */}
                          <div className="bg-white rounded-lg p-1 border border-[#EADBDB] flex items-center justify-center h-12 shadow-2xs overflow-hidden">
                            <img src="/assets/3d/kraft_pouch.jpg" alt="Pouch" className="h-10 w-full object-contain mix-blend-multiply" />
                          </div>
                          {/* Green Mug */}
                          <div className="bg-white rounded-lg p-1 border border-[#EADBDB] flex items-center justify-center h-12 shadow-2xs overflow-hidden">
                            <img src="/assets/3d/green_mug.jpg" alt="Mug" className="h-10 w-full object-contain mix-blend-multiply" />
                          </div>
                          {/* Blue Bottle */}
                          <div className="bg-white rounded-lg p-1 border border-[#EADBDB] flex items-center justify-center h-12 shadow-2xs overflow-hidden">
                            <img src="/assets/3d/blue_bottle.jpg" alt="Serum" className="h-10 w-full object-contain mix-blend-multiply" />
                          </div>
                          {/* Cardboard Box */}
                          <div className="bg-white rounded-lg p-1 border border-[#EADBDB] flex items-center justify-center h-12 shadow-2xs overflow-hidden">
                            <img src="/assets/3d/cardboard_box.jpg" alt="Box" className="h-10 w-full object-contain mix-blend-multiply" />
                          </div>
                        </div>

                        {/* Revenue Sales Widget */}
                        <div className="col-span-5 bg-white rounded-xl p-2 border border-[#EADBDB] shadow-2xs flex flex-col justify-between">
                          <div>
                            <p className="text-[7px] font-semibold text-[#706866]">Total Penjualan</p>
                            <p className="text-[10px] font-extrabold text-[#241A1A] leading-tight">Rp 12.450.000</p>
                            <span className="inline-block mt-0.5 px-1 py-0.2 rounded bg-emerald-100 text-emerald-700 text-[6px] font-bold">
                              + 12%
                            </span>
                          </div>
                          {/* Mini Bar Chart */}
                          <div className="flex items-end gap-0.5 h-7 pt-1">
                            <div className="flex-1 bg-[#F5E2E4] rounded-t-xs h-[30%]" />
                            <div className="flex-1 bg-[#E8C5C8] rounded-t-xs h-[50%]" />
                            <div className="flex-1 bg-[#D89B9E] rounded-t-xs h-[40%]" />
                            <div className="flex-1 bg-[#B54B55] rounded-t-xs h-[70%]" />
                            <div className="flex-1 bg-[#800C19] rounded-t-xs h-[95%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── 3D OVERLAY ACCESSORIES ATTACHED TO BROWSER ─── */}

                {/* Bottom Left: 3D Red Shopping Bags */}
                <div className="absolute -bottom-8 -left-10 z-20 transition-transform hover:scale-105">
                  <img src="/assets/3d/red_bags.jpg" alt="Red Bags" className="w-20 h-20 object-contain filter drop-shadow-xl mix-blend-multiply" />
                </div>

                {/* Bottom Center: Cute 3D Physical Store Front Building */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-30 transition-transform hover:scale-105">
                  <img src="/assets/3d/mini_storefront.jpg" alt="Storefront" className="w-28 h-28 object-contain filter drop-shadow-2xl mix-blend-multiply" />
                </div>

                {/* Bottom Right: Floating 3D Cardboard Box */}
                <div className="absolute -bottom-7 right-0 z-20 animate-bounce-gentle">
                  <img src="/assets/3d/cardboard_box.jpg" alt="Shipping Box" className="w-16 h-16 object-contain filter drop-shadow-xl mix-blend-multiply" />
                </div>
              </div>


              {/* ──── 6 FLOATING UI ECOSYSTEM CARDS AROUND CENTER ──── */}

              {/* 1 · Katalog Produk — Top Left */}
              <div className="absolute z-20 animate-float-subtle" style={{ top: '4%', left: '2%', animationDelay: '0.2s' }}>
                <div className="relative bg-white rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] w-[150px] hover:shadow-xl transition-shadow">
                  {/* Badge */}
                  <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-[#800C19] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <ShoppingBag className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[11px] font-extrabold text-[#241A1A] ml-5 mb-2">Katalog Produk</p>
                  {/* Miniature Product Props */}
                  <div className="flex items-end justify-center gap-1 bg-[#FAF7F7] rounded-xl p-1 border border-[#F0EAEB] h-12 overflow-hidden">
                    <img src="/assets/3d/kraft_pouch.jpg" alt="Pouch" className="h-10 object-contain mix-blend-multiply" />
                    <img src="/assets/3d/green_mug.jpg" alt="Mug" className="h-10 object-contain mix-blend-multiply" />
                  </div>
                </div>
              </div>

              {/* 2 · Pesanan Masuk — Top Center */}
              <div className="absolute z-20 animate-float-subtle" style={{ top: '0%', left: '38%', animationDelay: '0.8s' }}>
                <div className="relative bg-white rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] w-[155px] hover:shadow-xl transition-shadow">
                  {/* Badge */}
                  <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-[#800C19] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  {/* Notification count */}
                  <span className="absolute -top-1.5 left-3 z-40 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold border-2 border-white shadow-xs">
                    3
                  </span>
                  <p className="text-[11px] font-extrabold text-[#241A1A] ml-5 mb-2">Pesanan Masuk</p>
                  {/* Order List Rows */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 bg-[#FAF7F7] rounded-lg p-1.5 border border-[#F0EAEB]">
                      <img src="/assets/3d/kraft_pouch.jpg" alt="Thumbnail" className="w-5 h-6 object-contain mix-blend-multiply shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-1 bg-[#D8CECE] rounded-full w-full" />
                        <div className="h-1 bg-[#EDE7E7] rounded-full w-2/3" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#FAF7F7] rounded-lg p-1.5 border border-[#F0EAEB]">
                      <img src="/assets/3d/green_mug.jpg" alt="Thumbnail" className="w-5 h-6 object-contain mix-blend-multiply shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-1 bg-[#D8CECE] rounded-full w-3/4" />
                        <div className="h-1 bg-[#EDE7E7] rounded-full w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 · Pembayaran — Top Right */}
              <div className="absolute z-20 animate-float-subtle" style={{ top: '6%', right: '2%', animationDelay: '1.4s' }}>
                <div className="relative bg-white rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] w-[150px] hover:shadow-xl transition-shadow">
                  {/* Badge */}
                  <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-[#1E75C0] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[11px] font-extrabold text-[#241A1A] ml-5 mb-2">Pembayaran</p>
                  {/* Success Status Pill */}
                  <div className="flex items-center gap-2 bg-[#E8F5E9] rounded-xl p-2 border border-emerald-200">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[8px] font-extrabold text-emerald-800 leading-tight">Pembayaran</p>
                      <p className="text-[8px] font-extrabold text-emerald-800 leading-tight">Berhasil</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 · Laporan Penjualan — Middle Left */}
              <div className="absolute z-20 animate-float-subtle" style={{ top: '40%', left: '-2%', animationDelay: '0.4s' }}>
                <div className="relative bg-white rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] w-[155px] hover:shadow-xl transition-shadow">
                  {/* Badge */}
                  <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-[#800C19] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-extrabold text-[#241A1A] ml-5 truncate">Laporan Penjualan</p>
                  </div>
                  {/* Bar Chart Visual */}
                  <div className="flex items-end justify-between h-11 px-1 bg-[#FAF7F7] rounded-xl p-1.5 border border-[#F0EAEB]">
                    <div className="w-3 bg-[#E8C5C8] rounded-t-xs h-[25%]" />
                    <div className="w-3 bg-[#D89B9E] rounded-t-xs h-[45%]" />
                    <div className="w-3 bg-[#B54B55] rounded-t-xs h-[65%]" />
                    <div className="w-3 bg-[#9A222E] rounded-t-xs h-[85%]" />
                    <div className="w-3 bg-[#800C19] rounded-t-xs h-[100%]" />
                  </div>
                </div>
              </div>

              {/* 5 · Pengiriman — Middle Right */}
              <div className="absolute z-20 animate-float-subtle" style={{ top: '40%', right: '-2%', animationDelay: '1.0s' }}>
                <div className="relative bg-white rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] w-[150px] hover:shadow-xl transition-shadow">
                  {/* Badge */}
                  <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-[#800C19] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[11px] font-extrabold text-[#241A1A] ml-5 mb-2">Pengiriman</p>
                  {/* Package Icon & Tracking bar */}
                  <div className="flex flex-col items-center bg-[#FAF7F7] rounded-xl p-2 border border-[#F0EAEB]">
                    <img src="/assets/3d/cardboard_box.jpg" alt="Box" className="w-10 h-10 object-contain mix-blend-multiply mb-1" />
                    <p className="text-[7px] font-semibold text-[#706866] mb-1">Dalam Pengiriman</p>
                    {/* Progress track */}
                    <div className="w-full h-1.5 bg-[#EADBDB] rounded-full relative">
                      <div className="absolute top-0 left-0 h-full w-2/3 bg-[#800C19] rounded-full" />
                      <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#800C19] rounded-full border-2 border-white shadow-xs" style={{ left: 'calc(66% - 5px)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 · Pelanggan — Bottom Left */}
              <div className="absolute z-20 animate-float-subtle" style={{ bottom: '2%', left: '4%', animationDelay: '0.6s' }}>
                <div className="relative bg-white rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] w-[150px] hover:shadow-xl transition-shadow">
                  {/* Badge */}
                  <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-[#800C19] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[11px] font-extrabold text-[#241A1A] ml-5 mb-2">Pelanggan</p>
                  {/* Avatars */}
                  <div className="flex items-center justify-between bg-[#FAF7F7] p-1.5 rounded-xl border border-[#F0EAEB]">
                    <div className="flex items-center -space-x-1.5">
                      {['#93C5FD', '#FCD34D', '#6EE7B7', '#C4B5FD'].map((color, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-full border-2 border-white overflow-hidden shadow-2xs"
                          style={{ backgroundColor: color }}
                        >
                          <img src={`https://i.pravatar.cc/40?img=${idx + 15}`} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="w-4 h-4 rounded-full bg-white border border-[#D8CECE] flex items-center justify-center text-[9px] font-bold text-[#706866]">
                      +
                    </div>
                  </div>
                </div>
              </div>

              {/* 7 · Stok — Bottom Right */}
              <div className="absolute z-20 animate-float-subtle" style={{ bottom: '2%', right: '4%', animationDelay: '1.2s' }}>
                <div className="relative bg-white rounded-2xl p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#F2EBEB] w-[155px] hover:shadow-xl transition-shadow">
                  {/* Badge */}
                  <div className="absolute -top-3 -left-3 z-30 w-8 h-8 bg-[#800C19] rounded-full flex items-center justify-center shadow-md border-2 border-white">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[11px] font-extrabold text-[#241A1A] ml-5 mb-2">Stok</p>
                  {/* Stock Grid */}
                  <div className="grid grid-cols-3 gap-1 bg-[#FAF7F7] p-1.5 rounded-xl border border-[#F0EAEB] items-end">
                    <div className="flex flex-col items-center">
                      <img src="/assets/3d/green_mug.jpg" alt="Item" className="w-6 h-7 object-contain mix-blend-multiply mb-0.5" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex flex-col items-center">
                      <img src="/assets/3d/kraft_pouch.jpg" alt="Item" className="w-6 h-7 object-contain mix-blend-multiply mb-0.5" />
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>
                    <div className="flex flex-col items-center">
                      <img src="/assets/3d/blue_bottle.jpg" alt="Item" className="w-6 h-7 object-contain mix-blend-multiply mb-0.5" />
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
