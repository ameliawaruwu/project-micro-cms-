import React from 'react';
import { FooterSettings, ThemeSettings } from '../schema';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

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
              <h3 className="text-2xl font-black text-white mb-6 tracking-tighter">BRAND<span className="text-[#0055FF]">STORE</span></h3>
              <p className="mb-6 leading-relaxed max-w-sm">
                Toko online terpercaya dengan ribuan produk berkualitas. Kami menjamin keaslian barang dan pengiriman cepat ke seluruh Indonesia.
              </p>
              <div className="space-y-3">
                <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#0055FF]" /> 0800-1234-567 (Toll Free)</p>
                <p className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#0055FF]" /> support@brandstore.com</p>
                <p className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[#0055FF]" /> Jakarta Selatan, Indonesia</p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Perusahaan</h4>
              <ul className="space-y-3">
                <li><a href="/about" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Karir</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Mitra</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Bantuan</h4>
              <ul className="space-y-3">
                <li><a href="/about" className="hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Cara Belanja</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Lacak Pesanan</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">Pengembalian</a></li>
              </ul>
            </div>

            {settings.showNewsletter && (
              <div>
                <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Berlangganan</h4>
                <p className="mb-4 text-xs leading-relaxed">Dapatkan info promo dan diskon eksklusif.</p>
                <form className="flex flex-col gap-2">
                  <input type="email" placeholder="Email Anda" className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-[#0055FF]" />
                  <button type="button" className="w-full px-4 py-2 bg-[#0055FF] text-white font-bold rounded hover:bg-blue-600 transition-colors">Daftar</button>
                </form>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs">{settings.copyrightText}</p>
            {settings.showSocials && (
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#0055FF] hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#0055FF] hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#0055FF] hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // --- 2. EDITORIAL / STORYTELLING THEME ---
  if (themeId && themeId.includes('editorial')) {
    return (
      <footer className="bg-[#FAF7F7] pt-32 pb-16 border-t border-[#E5E0DD]">
        <div className="mx-auto px-6 max-w-7xl flex flex-col items-center">
          <h2 className="text-5xl md:text-8xl text-[#241A1A] font-normal tracking-widest uppercase mb-16 text-center" style={{ fontFamily: themeSettings.fontFamily }}>
            Artisan
          </h2>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-24 text-[#241A1A]">
            <a href="/about" className="text-sm italic tracking-widest hover:opacity-50 transition-opacity">Journal</a>
            <a href="/products" className="text-sm italic tracking-widest hover:opacity-50 transition-opacity">Collections</a>
            <a href="/about" className="text-sm italic tracking-widest hover:opacity-50 transition-opacity">Our Story</a>
            <a href="/about" className="text-sm italic tracking-widest hover:opacity-50 transition-opacity">Contact</a>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-between border-t border-[#241A1A]/10 pt-8 mt-auto">
            <p className="text-xs tracking-widest text-[#706866] uppercase mb-6 md:mb-0">
              {settings.copyrightText}
            </p>
            
            {settings.showSocials && (
              <div className="flex space-x-8 text-[#241A1A]">
                <a href="#" className="hover:opacity-50 transition-opacity"><Instagram className="w-5 h-5 stroke-[1]" /></a>
                <a href="#" className="hover:opacity-50 transition-opacity"><Twitter className="w-5 h-5 stroke-[1]" /></a>
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // --- 3. BOLD BRAND THEME ---
  if (themeId && themeId.includes('bold')) {
    return (

      <footer className="bg-black text-white pt-24 pb-12 border-t-8 border-white relative overflow-hidden">
        {/* Giant background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black text-white/5 select-none pointer-events-none whitespace-nowrap">
          BOLD
        </div>

        <div className="mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="lg:col-span-2">
              <h2 className="text-7xl font-black mb-6 uppercase tracking-tighter" style={{ fontFamily: themeSettings.fontFamily }}>
                BOLD
              </h2>
              <div className="w-24 h-4 bg-[#FF0000] mb-8"></div>
              {settings.showSocials && (
                <div className="flex gap-4">
                  <a href="#" className="w-14 h-14 bg-white text-black flex items-center justify-center hover:bg-[#FF0000] hover:text-white hover:-rotate-12 transition-all"><Facebook className="w-6 h-6 stroke-[3]" /></a>
                  <a href="#" className="w-14 h-14 bg-white text-black flex items-center justify-center hover:bg-[#FF0000] hover:text-white hover:rotate-12 transition-all"><Twitter className="w-6 h-6 stroke-[3]" /></a>
                  <a href="#" className="w-14 h-14 bg-white text-black flex items-center justify-center hover:bg-[#FF0000] hover:text-white hover:-rotate-12 transition-all"><Instagram className="w-6 h-6 stroke-[3]" /></a>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="text-xl font-black uppercase mb-8 tracking-widest text-[#FF0000]">Explore</h4>
              <ul className="space-y-4">
                <li><a href="/products" className="text-xl font-bold uppercase hover:text-[#FF0000] hover:pl-4 transition-all inline-block">Shop All</a></li>
                <li><a href="/products" className="text-xl font-bold uppercase hover:text-[#FF0000] hover:pl-4 transition-all inline-block">Trending</a></li>
                <li><a href="/products" className="text-xl font-bold uppercase hover:text-[#FF0000] hover:pl-4 transition-all inline-block">Sale</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-black uppercase mb-8 tracking-widest text-[#FF0000]">Join Us</h4>
              <div className="flex bg-white text-black border-4 border-black group focus-within:border-white shadow-[8px_8px_0_rgba(255,0,0,1)]">
                <input type="email" placeholder="EMAIL" className="w-full bg-transparent px-4 py-4 text-black font-bold uppercase outline-none placeholder-black/50" />
                <button className="bg-black text-white px-6 font-black uppercase hover:bg-[#FF0000] transition-colors">
                  &rarr;
                </button>
              </div>
            </div>
          </div>
          
          <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm font-bold uppercase tracking-widest pt-8 border-t-4 border-white/20">
            <p>{settings.copyrightText}</p>
          </div>
        </div>
      </footer>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <footer className="bg-[#3E3E3E] text-white py-24 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D9A05B]/20 rounded-full blur-[100px]"></div>

        <div className="mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex flex-col items-center text-center mb-24">
            <h3 className="text-3xl md:text-5xl font-medium mb-6 tracking-tight" style={{ fontFamily: themeSettings.fontFamily }}>
              Join Our Lifestyle.
            </h3>
            <p className="text-white/70 mb-10 font-light max-w-lg">Get 10% off your first order when you sign up for our newsletter.</p>
            <div className="w-full max-w-md flex bg-white/10 rounded-full overflow-hidden border border-white/20 focus-within:border-[#D9A05B] transition-colors p-1">
              <input type="email" placeholder="Email address" className="w-full bg-transparent px-6 py-3 text-white outline-none font-light" />
              <button className="bg-[#D9A05B] text-white px-8 py-3 rounded-full font-medium hover:bg-[#c28e4e] transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/10 pt-16 mb-16">
            <div className="col-span-2 md:col-span-1">
              <h2 className="text-2xl font-semibold tracking-tight mb-6" style={{ fontFamily: themeSettings.fontFamily }}>
                Lifestyle<span className="text-[#D9A05B]">.</span>
              </h2>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Shop</h4>
              <ul className="space-y-4 font-light text-white/70">
                <li><a href="/products" className="hover:text-[#D9A05B] transition-colors">All Products</a></li>
                <li><a href="/products" className="hover:text-[#D9A05B] transition-colors">New Arrivals</a></li>
                <li><a href="/products" className="hover:text-[#D9A05B] transition-colors">Collections</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">About</h4>
              <ul className="space-y-4 font-light text-white/70">
                <li><a href="/" className="hover:text-[#D9A05B] transition-colors">Our Story</a></li>
                <li><a href="/" className="hover:text-[#D9A05B] transition-colors">Journal</a></li>
                <li><a href="/" className="hover:text-[#D9A05B] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Social</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D9A05B] transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D9A05B] transition-colors"><Facebook className="w-4 h-4" /></a>
              </div>
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
      <div className={`mx-auto px-6 lg:px-12 ${themeSettings.containerWidth || 'max-w-7xl'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12 border-b border-gray-800 pb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <a href="/" className="font-extrabold text-2xl tracking-tight text-white block" style={{ fontFamily: themeSettings.fontFamily }}>
              KROOM<span className="text-purple-500">STORE</span>
            </a>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Toko Online Hardware & Perangkat Komputer Terlengkap. Menjual VGA, PC Gaming, Accessories, dan Components Original Bergaransi Resmi.
            </p>
            <div className="space-y-1.5 text-xs text-gray-400">
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-purple-400" /> Jakarta, Indonesia</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-purple-400" /> +62 812-3456-7890</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-purple-400" /> support@kroomstore.id</p>
            </div>
          </div>

          {/* Kategori Hardware */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Kategori Produk</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="/katalog" className="hover:text-white transition-colors">VGA Card & GPU</a></li>
              <li><a href="/katalog" className="hover:text-white transition-colors">Processor & Mobo</a></li>
              <li><a href="/katalog" className="hover:text-white transition-colors">RAM & Storage SSD</a></li>
              <li><a href="/katalog" className="hover:text-white transition-colors">Keyboard & Mouse</a></li>
              <li><a href="/katalog" className="hover:text-white transition-colors">Cooling & Casing</a></li>
            </ul>
          </div>

          {/* Layanan & Bantuan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Bantuan Pelanggan</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="/tentang" className="hover:text-white transition-colors">Lacak Pesanan</a></li>
              <li><a href="/tentang" className="hover:text-white transition-colors">Garansi & Retur</a></li>
              <li><a href="/tentang" className="hover:text-white transition-colors">Cara Pembayaran</a></li>
              <li><a href="/tentang" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="/tentang" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Pembayaran & Ekspedisi */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-2.5">Pembayaran</h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-gray-300">
                <span className="px-2 py-1 bg-gray-800 rounded">BCA</span>
                <span className="px-2 py-1 bg-gray-800 rounded">Mandiri</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-cyan-400">QRIS</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-emerald-400">GoPay</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-2.5">Pengiriman</h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-gray-300">
                <span className="px-2 py-1 bg-gray-800 rounded text-red-400">JNE</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-amber-400">J&T</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-purple-400">SiCepat</span>
                <span className="px-2 py-1 bg-gray-800 rounded text-emerald-400">GoSend</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>{settings.copyrightText || `© ${new Date().getFullYear()} Kroombox Store. Hak cipta dilindungi.`}</p>
          {settings.showSocials && (
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
