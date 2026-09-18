import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Cpu, ShieldCheck, Truck, CreditCard, Headphones, Send, Phone, Mail, MapPin, Instagram, Youtube, Clock } from 'lucide-react';

export const FuturisticFooter: React.FC<{ sectionOptions?: any }> = () => {
  const storeInfo = useCmsStore(state => state.storeInfo);

  return (
    <footer className="w-full bg-[#070A14] text-gray-300 pt-16 pb-8 px-6 md:px-12 font-['Space_Grotesk',sans-serif] border-t border-purple-900/30 relative overflow-hidden">
      {/* Background Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Top Feature Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-gray-800/80">
          <div className="flex items-center gap-3 bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30">
            <Truck className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Pengiriman Cepat</h5>
              <p className="text-[11px] text-gray-400">Gratis Ongkir & Instant Courier</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Garansi Resmi</h5>
              <p className="text-[11px] text-gray-400">100% Produk Original & BNIB</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30">
            <CreditCard className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Pembayaran Aman</h5>
              <p className="text-[11px] text-gray-400">QRIS, Transfer Bank, Cicilan 0%</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30">
            <Headphones className="w-6 h-6 text-pink-400 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider">Layanan CS 24/7</h5>
              <p className="text-[11px] text-gray-400">Konsultasi Hardware & Assembly</p>
            </div>
          </div>
        </div>

        {/* Multi-Column Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Column 1: Store Brand Info (col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-wider uppercase text-white">
                {storeInfo.name || "KROOM//HARDWARE"}
              </h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              {storeInfo.description || "Pusat Hardware, Component PC High-End, Gaming Gear & Watercooling System Terpercaya di Indonesia."}
            </p>
            <div className="space-y-2 text-xs text-gray-400 pt-2 font-mono">
              <p className="flex items-center gap-2.5"><MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {storeInfo.address || "Neo Cyber District, Jakarta"}</p>
              <p className="flex items-center gap-2.5"><Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {storeInfo.phone || "+62 812-3456-7890"}</p>
              <p className="flex items-center gap-2.5"><Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {storeInfo.email || "support@kroomhardware.id"}</p>
              <p className="flex items-center gap-2.5"><Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Senin - Sabtu: 09.00 - 21.00 WIB</p>
            </div>
          </div>

          {/* Column 2: Product Categories (col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Kategori Hardware
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="/katalog" className="hover:text-purple-400 transition-colors">VGA Card RTX / RX</a></li>
              <li><a href="/katalog" className="hover:text-purple-400 transition-colors">Processor & Mobo</a></li>
              <li><a href="/katalog" className="hover:text-purple-400 transition-colors">RAM & NVMe SSD</a></li>
              <li><a href="/katalog" className="hover:text-purple-400 transition-colors">Gaming Keyboard & Mouse</a></li>
              <li><a href="/katalog" className="hover:text-purple-400 transition-colors">Cooling & PC Case</a></li>
              <li><a href="/katalog" className="hover:text-purple-400 transition-colors">Monitor High Refresh</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Service & Help (col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Layanan & Bantuan
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li><a href="/tentang" className="hover:text-cyan-400 transition-colors">Lacak Status Pesanan</a></li>
              <li><a href="/tentang" className="hover:text-cyan-400 transition-colors">Klaim Garansi & Retur</a></li>
              <li><a href="/tentang" className="hover:text-cyan-400 transition-colors">Panduan Metode Pembayaran</a></li>
              <li><a href="/tentang" className="hover:text-cyan-400 transition-colors">Syarat & Ketentuan Pembelian</a></li>
              <li><a href="/tentang" className="hover:text-cyan-400 transition-colors">Kebijakan Privasi & Keamanan</a></li>
              <li><a href="/tentang" className="hover:text-cyan-400 transition-colors">Simulasi Rakit PC Custom</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Payment/Shipping Badges (col-span-3) */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span> Promo & Flash Sale
              </h4>
              <p className="text-gray-400 text-xs mb-3">Dapatkan voucher diskon hardware & promo rakitan PC.</p>
              <form className="flex gap-1.5" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Email anda..."
                  className="w-full bg-gray-900/90 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Payment & Shipping Logos */}
            <div className="space-y-3 pt-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Metode Pembayaran</p>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-gray-300">
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded">BCA</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded">Mandiri</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded">BNI</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-cyan-400">QRIS</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-emerald-400">GoPay</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded">Visa / MC</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Kurir Partner</p>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-gray-300">
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-red-400">JNE</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-amber-400">J&T</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-purple-400">SiCepat</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-emerald-400">GoSend</span>
                  <span className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-[#00A5CF]">GrabExpress</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Social Links */}
        <div className="pt-6 border-t border-gray-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <p>© {new Date().getFullYear()} {storeInfo.name || "Kroombox Store"}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Official Socials:</span>
            <a href="#" className="hover:text-purple-400 transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-red-400 transition-colors"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>

      </div>
    </footer>
  );
};

