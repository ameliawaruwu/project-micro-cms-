import React from 'react';
import { FooterSettings, ThemeSettings } from '../schema';
import { STORE_ROUTES } from '../storefrontLinks';

interface Props {
  settings: FooterSettings;
  themeSettings: ThemeSettings;
  themeId?: string;
}

export const FooterSection: React.FC<Props> = ({ settings, themeSettings, themeId }) => {
  // --- 1. COMPACT / MODERN CATALOG THEME ---
  if (themeId && themeId.includes('compact')) {
    return (
      <footer className="bg-[#111827] text-gray-300 pt-16 pb-8 text-sm border-t-4 border-[#0055FF]">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12 border-b border-gray-800 pb-12">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-black text-white mb-6 tracking-tighter break-words">Toko Kami</h3>
              <p className="mb-6 leading-relaxed max-w-sm">Belanja produk pilihan dengan mudah dan aman.</p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Perusahaan</h4>
              <ul className="space-y-3">
                <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Karir</a></li>
                <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Blog</a></li>
                <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Mitra</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Bantuan</h4>
              <ul className="space-y-3">
                <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Cara Belanja</a></li>
                <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Lacak Pesanan</a></li>
                <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Pengembalian</a></li>
              </ul>
            </div>

            {settings.showNewsletter && (
              <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Promo</h4>
                <p className="mb-4 text-xs leading-relaxed">Lihat penawaran dan diskon terbaru dari toko kami.</p>
                <a href={STORE_ROUTES.promo} className="block w-full px-4 py-2 bg-[#0055FF] text-white font-bold rounded text-center hover:bg-blue-600 transition-colors">Lihat Promo</a>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs">{settings.copyrightText}</p>
          </div>
        </div>
      </footer>
    );
  }

  // --- 2. EDITORIAL / STORYTELLING THEME ---
  if (themeId && themeId.includes('editorial')) {
    return (
      <footer className="bg-[#FAF7F7] pt-16 sm:pt-32 pb-10 sm:pb-16 border-t border-[#E5E0DD] box-border">
        <div className="mx-auto px-4 sm:px-6 max-w-7xl flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl md:text-8xl text-[#241A1A] font-normal tracking-wider sm:tracking-widest uppercase mb-10 sm:mb-16 text-center break-words" style={{ fontFamily: themeSettings.fontFamily }}>
            Toko Kami
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 md:gap-16 mb-12 sm:mb-24 text-[#241A1A]">
            <a href={STORE_ROUTES.contact} className="text-xs sm:text-sm italic tracking-widest hover:opacity-50 transition-opacity">Beranda</a>
            <a href={STORE_ROUTES.catalog} className="text-xs sm:text-sm italic tracking-widest hover:opacity-50 transition-opacity">Katalog</a>
            <a href={STORE_ROUTES.contact} className="text-xs sm:text-sm italic tracking-widest hover:opacity-50 transition-opacity">Promo</a>
            <a href={STORE_ROUTES.contact} className="text-xs sm:text-sm italic tracking-widest hover:opacity-50 transition-opacity">Kontak</a>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between border-t border-[#241A1A]/10 pt-8 mt-auto text-center md:text-left gap-4">
            <p className="text-[11px] sm:text-xs tracking-widest text-[#706866] uppercase mb-4 md:mb-0">
              {settings.copyrightText}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // --- 3. BOLD BRAND THEME ---
  if (themeId && themeId.includes('bold')) {
    return (
      <footer className="bg-black text-white pt-16 sm:pt-24 pb-8 sm:pb-12 border-t-8 border-white relative overflow-hidden box-border">
        {/* Giant background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-white/5 select-none pointer-events-none whitespace-nowrap">
          BOLD
        </div>

        <div className="mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-20">
            <div className="lg:col-span-2">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-4 sm:mb-6 uppercase tracking-tighter break-words" style={{ fontFamily: themeSettings.fontFamily }}>
                BOLD
              </h2>
              <div className="w-16 sm:w-24 h-3 sm:h-4 bg-[#FF0000] mb-6 sm:mb-8"></div>
            </div>
            
            <div>
              <h4 className="text-lg sm:text-xl font-black uppercase mb-4 sm:mb-8 tracking-widest text-[#FF0000]">Jelajahi</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li><a href={STORE_ROUTES.catalog} className="text-base sm:text-xl font-bold uppercase hover:text-[#FF0000] hover:pl-4 transition-all inline-block">Semua Produk</a></li>
                <li><a href={STORE_ROUTES.catalog} className="text-base sm:text-xl font-bold uppercase hover:text-[#FF0000] hover:pl-4 transition-all inline-block">Promo</a></li>
                <li><a href={STORE_ROUTES.catalog} className="text-base sm:text-xl font-bold uppercase hover:text-[#FF0000] hover:pl-4 transition-all inline-block">Kontak</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-black uppercase mb-4 sm:mb-8 tracking-widest text-[#FF0000]">Hubungi Kami</h4>
              <a href={STORE_ROUTES.contact} className="inline-block bg-white text-black border-4 border-black px-5 py-3 text-xs sm:text-sm font-black uppercase hover:bg-[#FF0000] hover:text-white transition-colors">Kontak &rarr;</a>
            </div>
          </div>
          
          <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm font-bold uppercase tracking-widest pt-6 sm:pt-8 border-t-4 border-white/20 gap-3">
            <p>{settings.copyrightText}</p>
          </div>
        </div>
      </footer>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <footer className="bg-[#3E3E3E] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D9A05B]/20 rounded-full blur-[100px]"></div>

        <div className="mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center mb-16 sm:mb-24">
            <h3 className="text-3xl md:text-5xl font-medium mb-6 tracking-tight" style={{ fontFamily: themeSettings.fontFamily }}>
              Temukan Produk Favorit Anda.
            </h3>
            <p className="text-white/70 mb-10 font-light max-w-lg">Jelajahi katalog lengkap dan penawaran terbaru dari toko kami.</p>
            <a href={STORE_ROUTES.catalog} className="bg-[#D9A05B] text-white px-8 py-3 rounded-full font-medium hover:bg-[#c28e4e] transition-colors">Belanja Sekarang</a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 border-t border-white/10 pt-16 mb-16">
            <div className="col-span-2 md:col-span-1">
              <h2 className="text-2xl font-semibold tracking-tight mb-6" style={{ fontFamily: themeSettings.fontFamily }}>
                Toko Kami<span className="text-[#D9A05B]">.</span>
              </h2>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Belanja</h4>
              <ul className="space-y-4 font-light text-white/70">
                <li><a href={STORE_ROUTES.catalog} className="hover:text-[#D9A05B] transition-colors">Semua Produk</a></li>
                <li><a href={STORE_ROUTES.catalog} className="hover:text-[#D9A05B] transition-colors">Promo</a></li>
                <li><a href={STORE_ROUTES.catalog} className="hover:text-[#D9A05B] transition-colors">Katalog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Informasi</h4>
              <ul className="space-y-4 font-light text-white/70">
                <li><a href={STORE_ROUTES.home} className="hover:text-[#D9A05B] transition-colors">Beranda</a></li>
                <li><a href={STORE_ROUTES.promo} className="hover:text-[#D9A05B] transition-colors">Promo</a></li>
                <li><a href={STORE_ROUTES.contact} className="hover:text-[#D9A05B] transition-colors">Kontak</a></li>
              </ul>
            </div>
          </div>
          
          <div className="text-center md:text-left text-white/50 text-sm font-light">
            <p>{settings.copyrightText}</p>
          </div>
        </div>
      </footer>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-10 border-t border-gray-800">
      <div className={`mx-auto px-4 sm:px-6 lg:px-12 ${themeSettings.containerWidth || 'max-w-7xl'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 border-b border-gray-800 pb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <a href="/" className="font-extrabold text-2xl tracking-tight text-white block" style={{ fontFamily: themeSettings.fontFamily }}>
              Toko Kami
            </a>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">Belanja produk pilihan dengan mudah dan aman.</p>
          </div>

          {/* Belanja */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Belanja</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href={STORE_ROUTES.home} className="hover:text-white transition-colors">Beranda</a></li>
              <li><a href={STORE_ROUTES.catalog} className="hover:text-white transition-colors">Katalog</a></li>
              <li><a href={STORE_ROUTES.promo} className="hover:text-white transition-colors">Promo</a></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Bantuan Pelanggan</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href={STORE_ROUTES.contact} className="hover:text-white transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>{settings.copyrightText || `© ${new Date().getFullYear()} Toko Kami. Hak cipta dilindungi.`}</p>
        </div>
      </div>
    </footer>
  );
};
