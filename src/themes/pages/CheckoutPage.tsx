import React, { useState } from 'react';
import { ThemeSchema } from '../schema';
import { Product, OrderItem, Order } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { ShoppingCart, Check, CreditCard, Truck, ShieldCheck, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';

interface CheckoutPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  products?: Product[];
  onNavigate?: (pageId: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  themeData,
  themeId: propThemeId,
  store,
  products = [],
  onNavigate,
}) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif',
  };

  // Form states
  const [customerName, setCustomerName] = useState('Budi Santoso');
  const [customerEmail, setCustomerEmail] = useState('budi@example.com');
  const [customerPhone, setCustomerPhone] = useState('081234567890');
  const [customerAddress, setCustomerAddress] = useState('Jl. Sudirman No 123, RT 01 / RW 02');
  const [customerCity, setCustomerCity] = useState('Jakarta Selatan');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bank' | 'cod'>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Cart / sample items
  const cartItemsFromStorage = store?.slug ? cartService.getCart(store.slug) : [];
  const sampleItems = cartItemsFromStorage.length > 0
    ? cartItemsFromStorage.map((ci) => ({
        id: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        imageUrl: ci.product.imageUrl,
      }))
    : products.length > 0
    ? products.slice(0, 2).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        imageUrl: p.imageUrl,
      }))
    : [
        { id: '1', name: 'Produk Unggulan 1', price: 150000, quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop' },
        { id: '2', name: 'Produk Unggulan 2', price: 95000, quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop' },
      ];

  const subtotal: number = sampleItems.reduce((acc, item) => acc + Number(item.price || 0) * (item.quantity || 1), 0);
  const shippingFee = 15000;
  const total = subtotal + shippingFee;

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find((s) => s.type === 'Header');
  const footerSection = Object.values(sections).find((s) => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const handleProcessCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert('Silakan lengkapi Nama Lengkap, Nomor WhatsApp, dan Alamat Pengiriman.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = sampleItems.map((s) => ({
        productId: s.id,
        productName: s.name,
        productImage: s.imageUrl,
        price: s.price,
        quantity: s.quantity || 1,
        subtotal: s.price * (s.quantity || 1),
      }));

      const newOrder = await orderService.createOrder({
        storeId: store?.id || 'store-andhika',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim(),
        customerCity: customerCity.trim() || 'Indonesia',
        items: orderItems,
        subtotal,
        shippingCost: shippingFee,
        discount: 0,
        grandTotal: total,
        paymentMethod: paymentMethod === 'qris' ? 'QRIS' : paymentMethod === 'bank' ? 'Transfer Bank' : 'COD',
        paymentStatus: paymentMethod === 'qris' ? 'Sudah Dibayar' : 'Belum Dibayar',
        courier: 'J&T',
        shippingStatus: 'Baru',
        notes: `Pesanan checkout via tema storefront: ${activeThemeId}`,
      });

      setCreatedOrder(newOrder);
      setIsCompleted(true);
      if (store?.slug) {
        cartService.clearCart(store.slug);
      }
    } catch (err: any) {
      alert('Terjadi kendala saat membuat pesanan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isCompleted) {
      const orderNum = createdOrder?.orderNumber || '#ORD-88231';
      const waNumber = (store?.phoneWhatsApp || '6281234567890').replace(/[^0-9]/g, '');
      const waText = encodeURIComponent(
        `Halo ${store?.name || 'Admin Toko'}, saya sudah membuat pesanan #${orderNum} dengan total Rp ${total.toLocaleString('id-ID')}. Mohon konfirmasi pesanannya ya!`
      );

      return (
        <div className="py-20 px-6 max-w-2xl mx-auto text-center font-sans">
          <div
            className={`p-8 md:p-12 rounded-3xl border shadow-xl space-y-6 ${
              activeThemeId === 'bold'
                ? 'bg-yellow-300 text-black border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)]'
                : activeThemeId === 'futuristic' || activeThemeId === 'modern'
                ? 'bg-slate-900 text-white border border-cyan-500/30'
                : 'bg-white text-gray-900 border-gray-200'
            }`}
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black">Pesanan Berhasil Dibuat!</h1>
            <p className="text-sm font-medium">
              Nomor Pesanan: <span className="font-bold font-mono">{orderNum}</span>
            </p>
            <div className="p-4 bg-emerald-50 rounded-xl text-left text-xs text-emerald-900 space-y-1.5 border border-emerald-200">
              <p className="font-bold">Status Pesanan: <span className="text-emerald-700">Tersimpan ke Sistem</span></p>
              <p>Metode Pembayaran: <span className="font-semibold">{paymentMethod === 'qris' ? 'QRIS / E-Wallet' : paymentMethod === 'bank' ? 'Transfer Bank' : 'COD'}</span></p>
              <p>Penerima: <span className="font-semibold">{customerName} ({customerPhone})</span></p>
              <p>Total Tagihan: <span className="font-bold text-base text-emerald-900">Rp {total.toLocaleString('id-ID')}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konfirmasi via WhatsApp</span>
              </a>

              <button
                onClick={() => (onNavigate ? onNavigate('homepage') : null)}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition cursor-pointer"
              >
                Kembali ke Toko
              </button>
            </div>
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
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="NAMA LENGKAP"
                  className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="NOMOR WHATSAPP"
                  className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="EMAIL"
                  className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm"
                />
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="ALAMAT LENGKAP"
                  className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm"
                />
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
                type="button"
                disabled={isSubmitting}
                onClick={handleProcessCheckout}
                className="w-full py-6 bg-black text-white text-2xl font-black uppercase tracking-widest hover:bg-yellow-300 hover:text-black border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>BAYAR SEKARANG ⚡</span>}
              </button>
            </div>

            <div className="md:col-span-5 bg-yellow-300 p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-6 h-fit">
              <h2 className="text-2xl font-black uppercase border-b-4 border-black pb-3">RINGKASAN ITEM</h2>
              {sampleItems.map((p) => (
                <div key={p.id} className="flex justify-between items-center font-black border-b-2 border-black pb-3">
                  <div>
                    <p className="uppercase text-sm">{p.name}</p>
                    <p className="text-xs text-gray-700">QTY: {p.quantity || 1}</p>
                  </div>
                  <p className="text-base">Rp {(p.price * (p.quantity || 1)).toLocaleString('id-ID')}</p>
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
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="FULL_NAME"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="WHATSAPP_NUMBER"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="EMAIL_ADDRESS"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400"
                />
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="SHIPPING_ADDRESS"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400"
                />
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
                type="button"
                disabled={isSubmitting}
                onClick={handleProcessCheckout}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>CONFIRM_ORDER ⚡</span>}
              </button>
            </div>

            <div className="md:col-span-5 bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-md space-y-6 h-fit">
              <h2 className="text-lg font-bold text-cyan-300 border-b border-slate-800 pb-3">[ORDER_MANIFEST]</h2>
              {sampleItems.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800/60 pb-3">
                  <span>{p.name} (x{p.quantity || 1})</span>
                  <span className="font-bold text-cyan-400">Rp {(p.price * (p.quantity || 1)).toLocaleString('id-ID')}</span>
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

    // 3. DEFAULT / MINIMALIST / NATURE / CUTE / LUXURY / EDITORIAL
    return (
      <div className="pt-28 pb-24 bg-gray-50 text-gray-900 min-h-screen font-sans">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3 border-gray-100">Detail Pengiriman</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Lengkap *</label>
                <textarea
                  rows={2}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  placeholder="Kota / Kabupaten"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 pt-4 border-b pb-3 border-gray-100">Metode Pembayaran</h2>
            <div className="space-y-2.5">
              {[
                { id: 'qris', title: 'Transfer Bank / QRIS Instant (Otomatis)' },
                { id: 'bank', title: 'Transfer Bank Manual' },
                { id: 'cod', title: 'Bayar di Tempat (COD)' },
              ].map((m) => (
                <label key={m.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer text-sm font-semibold transition ${paymentMethod === m.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pm" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id as any)} />
                  <span>{m.title}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleProcessCheckout}
              className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <span>Bayar Sekarang • Rp {total.toLocaleString('id-ID')}</span>
              )}
            </button>
          </div>

          <div className="md:col-span-5 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-3 border-gray-100">Ringkasan Pesanan</h2>
            <div className="space-y-4">
              {sampleItems.map((p) => (
                <div key={p.id} className="flex gap-4 items-center">
                  <img src={p.imageUrl || (p as any).image} alt={p.name} className="w-14 h-14 object-cover rounded-lg border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">Qty: {p.quantity || 1}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-900">Rp {(p.price * (p.quantity || 1)).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span>Pengiriman (J&amp;T Reguler)</span><span>Rp {shippingFee.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total Tagihan</span><span className="text-black font-extrabold">Rp {total.toLocaleString('id-ID')}</span>
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
