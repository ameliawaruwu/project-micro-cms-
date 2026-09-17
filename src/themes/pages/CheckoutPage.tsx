import React, { useState } from 'react';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { ShoppingCart, Check, CreditCard, Truck, ShieldCheck, ArrowRight } from 'lucide-react';

interface CheckoutPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  products?: Product[];
  onNavigate?: (pageId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ themeData, themeId: propThemeId, store, products = [], onNavigate }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const sampleItems = products.length > 0 ? products.slice(0, 2) : [
    { id: '1', name: 'Produk Unggulan 1', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop' },
    { id: '2', name: 'Produk Unggulan 2', price: 95000, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop' },
  ];

  const subtotal: number = (sampleItems as any[]).reduce((acc: number, item: any) => acc + Number(item.price || 0), 0);
  const shippingFee = 15000;
  const total = subtotal + shippingFee;

  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank' | 'cod'>('qris');
  const [isCompleted, setIsCompleted] = useState(false);

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderContent = () => {
    if (isCompleted) {
      // Thank you state
      return (
        <div className="py-20 px-6 max-w-2xl mx-auto text-center font-sans">
          <div className={`p-8 md:p-12 rounded-3xl border shadow-xl space-y-6 ${
            activeThemeId === 'bold' 
              ? 'bg-yellow-300 text-black border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)]' 
              : activeThemeId === 'futuristic' || activeThemeId === 'modern'
              ? 'bg-slate-900 text-white border border-cyan-500/30'
              : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black">Terima kasih atas pesanan Anda!</h1>
            <p className="text-sm font-medium">Nomor Pesanan: <span className="font-bold">#ORD-98231</span></p>
            <div className="p-4 bg-emerald-50 rounded-xl text-left text-xs text-emerald-900 space-y-1 border border-emerald-200">
              <p className="font-bold">Instruksi Pembayaran:</p>
              <p>Transfer Bank BCA: <span className="font-bold font-mono">8820-1234-5678</span></p>
              <p>Total: <span className="font-bold">Rp {total.toLocaleString('id-ID')}</span></p>
            </div>
            <button 
              onClick={() => onNavigate ? onNavigate('homepage') : null}
              className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition"
            >
              Kembali ke Toko
            </button>
          </div>
        </div>
      );
    }

    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 bg-[#FF0000] p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-6">
              <h2 className="text-3xl font-black text-white uppercase">INFORMASI PENGIRIMAN</h2>
              <div className="space-y-4">
                <input type="email" defaultValue="budi@example.com" placeholder="EMAIL" className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm" />
                <input type="text" defaultValue="Budi Santoso" placeholder="NAMA LENGKAP" className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm" />
                <input type="text" defaultValue="Jl. Sudirman No 123, Jakarta" placeholder="ALAMAT LENGKAP" className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase pt-4">METODE PEMBAYARAN</h2>
              <div className="space-y-3">
                {['qris', 'bank', 'cod'].map((m) => (
                  <label key={m} className={`flex items-center gap-3 p-4 border-4 border-black font-black uppercase cursor-pointer ${paymentMethod === m ? 'bg-yellow-300' : 'bg-white'}`}>
                    <input type="radio" name="pay" checked={paymentMethod === m} onChange={() => setPaymentMethod(m as any)} />
                    <span>{m === 'qris' ? 'QRIS / Instant' : m === 'bank' ? 'Transfer Bank' : 'Bayar di Tempat (COD)'}</span>
                  </label>
                ))}
              </div>
              <button 
                onClick={() => setIsCompleted(true)}
                className="w-full py-6 bg-black text-white text-2xl font-black uppercase tracking-widest hover:bg-yellow-300 hover:text-black border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
              >
                BAYAR SEKARANG ⚡
              </button>
            </div>

            <div className="md:col-span-5 bg-yellow-300 p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-6 h-fit">
              <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-3">RINGKASAN ITEM</h2>
              {sampleItems.map(p => (
                <div key={p.id} className="flex justify-between items-center font-black border-b-2 border-black pb-3">
                  <div>
                    <p className="uppercase text-sm">{p.name}</p>
                    <p className="text-xs text-gray-700">QTY: 1</p>
                  </div>
                  <p className="text-base">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
              ))}
              <div className="pt-4 border-t-4 border-black space-y-2 font-black text-lg">
                <div className="flex justify-between"><span>SUBTOTAL</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between"><span>ONGKIR</span><span>Rp {shippingFee.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-2xl bg-black text-white p-3 mt-4">
                  <span>TOTAL</span><span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-md space-y-6">
              <h2 className="text-xl font-bold text-cyan-300">[1. RECIPIENT_DATA]</h2>
              <div className="space-y-4">
                <input type="email" defaultValue="user@cyber.io" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400" />
                <input type="text" defaultValue="Neo Anderson" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400" />
                <input type="text" defaultValue="Sector 7, Neo Jakarta" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-cyan-300 pt-4">[2. PAYMENT_GATEWAY]</h2>
              <div className="space-y-2">
                {['qris', 'bank', 'cod'].map((m) => (
                  <label key={m} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-sm ${paymentMethod === m ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
                    <input type="radio" name="pay" checked={paymentMethod === m} onChange={() => setPaymentMethod(m as any)} />
                    <span>{m === 'qris' ? 'QRIS / Digital Wallet' : m === 'bank' ? 'Bank Transfer' : 'COD / Delivery'}</span>
                  </label>
                ))}
              </div>
              <button 
                onClick={() => setIsCompleted(true)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              >
                CONFIRM_ORDER ⚡
              </button>
            </div>

            <div className="md:col-span-5 bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-md space-y-6 h-fit">
              <h2 className="text-lg font-bold text-cyan-300 border-b border-slate-800 pb-3">[ORDER_MANIFEST]</h2>
              {sampleItems.map(p => (
                <div key={p.id} className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800/60 pb-3">
                  <span>{p.name}</span>
                  <span className="font-bold text-cyan-400">Rp {p.price.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span>SUBTOTAL</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-slate-400"><span>SHIPPING</span><span>Rp {shippingFee.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-base font-bold text-cyan-300 pt-2 border-t border-slate-800">
                  <span>TOTAL_CREDITS</span><span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. DEFAULT / MINIMALIST / NATURE / CUTE / LUXURY / EDITORIAL / ETC.
    return (
      <div className="pt-28 pb-24 bg-gray-50 text-gray-900 min-h-screen font-sans">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3 border-gray-100">Detail Pengiriman</h2>
            <div className="space-y-4">
              <input type="email" defaultValue="pelanggan@example.com" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" defaultValue="Budi" placeholder="Nama Depan" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
                <input type="text" defaultValue="Santoso" placeholder="Nama Belakang" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
              </div>
              <input type="text" defaultValue="Jl. Sudirman No 123, Jakarta" placeholder="Alamat Lengkap" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 pt-4 border-b pb-3 border-gray-100">Metode Pembayaran</h2>
            <div className="space-y-2.5">
              {[
                { id: 'qris', title: 'Transfer Bank / QRIS Instant' },
                { id: 'bank', title: 'Transfer Bank Manual' },
                { id: 'cod', title: 'Bayar di Tempat (COD)' },
              ].map(m => (
                <label key={m.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer text-sm font-semibold transition ${paymentMethod === m.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pm" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id as any)} />
                  <span>{m.title}</span>
                </label>
              ))}
            </div>

            <button 
              onClick={() => setIsCompleted(true)}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-md"
            >
              Bayar Sekarang • Rp {total.toLocaleString('id-ID')}
            </button>
          </div>

          <div className="md:col-span-5 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3 border-gray-100">Ringkasan Pesanan</h2>
            <div className="space-y-4">
              {sampleItems.map(p => (
                <div key={p.id} className="flex gap-4 items-center">
                  <img src={p.imageUrl || (p as any).image} alt={p.name} className="w-14 h-14 object-cover rounded-lg border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">Qty: 1</p>
                  </div>
                  <p className="font-bold text-sm text-gray-900">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Pengiriman</span><span>Rp {shippingFee.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span className="text-black font-extrabold">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {CustomNavbar ? <CustomNavbar /> : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
