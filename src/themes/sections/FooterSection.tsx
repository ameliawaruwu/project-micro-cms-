import React from 'react';
import { FooterSettings, ThemeSettings } from '../schema';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

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
                <li><Link to="/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Karir</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Mitra</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider">Bantuan</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="hover:text-white transition-colors">Pusat Bantuan</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Cara Belanja</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Lacak Pesanan</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Pengembalian</Link></li>
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
            <Link to="/about" className="text-sm italic tracking-widest hover:opacity-50 transition-opacity">Journal</Link>
            <Link to="/products" className="text-sm italic tracking-widest hover:opacity-50 transition-opacity">Collections</Link>
            <Link to="/about" className="text-sm italic tracking-widest hover:opacity-50 transition-opacity">Our Story</Link>
            <Link to="/about" className="text-sm italic tracking-widest hover:opacity-50 transition-opacity">Contact</Link>
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
      <footer className="bg-[#000000] text-white pt-24 pb-12 border-t-8 border-[#FF0000]">
        <div className="mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <div>
              <h2 className="text-6xl md:text-8xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 tracking-tighter mb-6" style={{ fontFamily: themeSettings.fontFamily }}>
                JOIN THE REVOLUTION
              </h2>
              {settings.showNewsletter && (
                <form className="flex flex-col sm:flex-row gap-4 mt-8">
                  <input type="email" placeholder="ENTER YOUR EMAIL" className="flex-1 px-6 py-4 bg-white text-black font-bold uppercase tracking-widest border-4 border-white focus:outline-none focus:border-[#FF0000]" />
                  <button type="button" className="px-10 py-4 bg-[#FF0000] text-white font-black uppercase tracking-widest border-4 border-[#FF0000] hover:bg-transparent hover:text-[#FF0000] transition-colors">SUBSCRIBE</button>
                </form>
              )}
            </div>
            
            <div className="flex flex-col items-start lg:items-end justify-end">
              <nav className="flex flex-col items-start lg:items-end gap-4 mb-12">
                <Link to="/" className="text-2xl font-black uppercase hover:text-[#FF0000] transition-colors">HOME</Link>
                <Link to="/products" className="text-2xl font-black uppercase hover:text-[#FF0000] transition-colors">SHOP ALL</Link>
                <Link to="/about" className="text-2xl font-black uppercase hover:text-[#FF0000] transition-colors">ABOUT US</Link>
              </nav>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t-4 border-gray-900 gap-8">
            <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">{settings.copyrightText}</p>
            {settings.showSocials && (
              <div className="flex space-x-6">
                <a href="#" className="text-white hover:text-[#FF0000] transition-colors hover:scale-125 transform duration-300"><Instagram className="w-8 h-8 stroke-[2.5]" /></a>
                <a href="#" className="text-white hover:text-[#FF0000] transition-colors hover:scale-125 transform duration-300"><Twitter className="w-8 h-8 stroke-[2.5]" /></a>
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // --- 4. LIFESTYLE STORE THEME ---
  if (themeId && themeId.includes('lifestyle')) {
    return (
      <footer className="bg-[#FDFBF7] pt-24 pb-12 border-t border-gray-200">
        <div className="mx-auto px-6 lg:px-12 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-[#3E3E3E]">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-semibold tracking-tight mb-6" style={{ fontFamily: themeSettings.fontFamily }}>Lifestyle.</h3>
              <p className="text-gray-500 font-light leading-relaxed max-w-sm mb-8">
                Bringing thoughtful design and curated essentials into your everyday life.
              </p>
              {settings.showSocials && (
                <div className="flex space-x-4 text-[#D9A05B]">
                  <a href="#" className="p-2 border border-[#D9A05B]/30 rounded-full hover:bg-[#D9A05B] hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
                  <a href="#" className="p-2 border border-[#D9A05B]/30 rounded-full hover:bg-[#D9A05B] hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-6">Explore</h4>
              <ul className="space-y-4 font-light text-gray-500">
                <li><Link to="/" className="hover:text-[#D9A05B] transition-colors">Home</Link></li>
                <li><Link to="/products" className="hover:text-[#D9A05B] transition-colors">Shop</Link></li>
                <li><Link to="/about" className="hover:text-[#D9A05B] transition-colors">Our Story</Link></li>
                <li><Link to="/about" className="hover:text-[#D9A05B] transition-colors">Journal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-6">Support</h4>
              <ul className="space-y-4 font-light text-gray-500">
                <li><Link to="/about" className="hover:text-[#D9A05B] transition-colors">FAQ</Link></li>
                <li><Link to="/about" className="hover:text-[#D9A05B] transition-colors">Shipping</Link></li>
                <li><Link to="/about" className="hover:text-[#D9A05B] transition-colors">Returns</Link></li>
                <li><Link to="/about" className="hover:text-[#D9A05B] transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-400 font-light">{settings.copyrightText}</p>
          </div>
        </div>
      </footer>
    );
  }

  // --- 5. MINIMALIST CLEAN THEME (Default) ---
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className={`mx-auto px-6 lg:px-12 ${themeSettings.containerWidth}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          <div className="md:col-span-5 lg:col-span-4">
            <h3 className="text-xl font-light text-[#1A1A1A] tracking-tight mb-6">Minimal.</h3>
            {settings.showNewsletter && (
              <div className="max-w-xs">
                <p className="text-sm text-gray-500 font-light mb-6">Subscribe to receive updates, access to exclusive deals, and more.</p>
                <div className="relative">
                  <input type="email" placeholder="Email address" className="w-full border-b border-gray-300 py-2 pl-0 pr-10 text-sm focus:outline-none focus:border-[#1A1A1A] transition-colors" />
                  <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A1A] transition-colors">&rarr;</button>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-7 lg:col-span-8 flex flex-wrap gap-12 md:justify-end">
            {settings.columns.map((col, idx) => (
              <div key={idx} className="min-w-[120px]">
                <h4 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] mb-6">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link to={link.url} className="text-sm text-gray-500 font-light hover:text-[#1A1A1A] transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 gap-6">
          {settings.showSocials && (
            <div className="flex space-x-6 text-[#1A1A1A]">
              <a href="#" className="hover:opacity-50 transition-opacity"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:opacity-50 transition-opacity"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="hover:opacity-50 transition-opacity"><Facebook className="w-4 h-4" /></a>
            </div>
          )}
          <p className="text-[11px] text-gray-400 uppercase tracking-wider">{settings.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};
