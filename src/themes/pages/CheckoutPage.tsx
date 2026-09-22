import React, { useState, useEffect, useMemo } from 'react';
import { ThemeSchema } from '../schema';
import { Product, OrderItem, Order, BiteshipRateOption } from '../../types';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import {
  ShoppingCart,
  Check,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Clock,
  MapPin,
  RefreshCw,
  Lock,
  ChevronDown,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { midtransService } from '../../services/midtransService';
import { storeService } from '../../services/storeService';
import { shippingService, INDONESIAN_CITIES } from '../../services/shippingService';
import { integrationService } from '../../services/integrationService';
import { paymentChannelService, PaymentChannel } from '../../services/paymentChannelService';

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

  // Customer & Shipping state
  const [customerName, setCustomerName] = useState('Budi Santoso');
  const [customerEmail, setCustomerEmail] = useState('budi@example.com');
  const [customerPhone, setCustomerPhone] = useState('081234567890');
  const [customerAddress, setCustomerAddress] = useState('Jl. Sudirman No 123, RT 01 / RW 02');
  const [customerCity, setCustomerCity] = useState('Jakarta Selatan');
  const [customerPostalCode, setCustomerPostalCode] = useState('12730');

  // Couriers & Rates state
  const [availableRates, setAvailableRates] = useState<BiteshipRateOption[]>([]);
  const [selectedRate, setSelectedRate] = useState<BiteshipRateOption | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState('');

  // Merchant Active Integrations & Channels state
  const [activeCouriers, setActiveCouriers] = useState<string[]>([]);
  const [activePaymentChannels, setActivePaymentChannels] = useState<PaymentChannel[]>([]);

  // Payment state
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const isFreePlan = !store?.plan || store.plan === 'free';

  // Cart / sample items
  const cartItemsFromStorage = store?.slug ? cartService.getCart(store.slug) : [];
  const sampleItems = cartItemsFromStorage.length > 0
    ? cartItemsFromStorage.map((ci) => ({
        id: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        imageUrl: ci.product.imageUrl,
        weightGrams: ci.product.weightGrams || 350,
      }))
    : products.length > 0
    ? products.slice(0, 2).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        imageUrl: p.imageUrl,
        weightGrams: p.weightGrams || 350,
      }))
    : [
        {
          id: '1',
          name: 'Produk Unggulan 1',
          price: 150000,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
          weightGrams: 350,
        },
        {
          id: '2',
          name: 'Produk Unggulan 2',
          price: 95000,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
          weightGrams: 350,
        },
      ];

  const subtotal: number = sampleItems.reduce((acc, item) => acc + Number(item.price || 0) * (item.quantity || 1), 0);
  const totalWeightGrams: number = Math.max(250, sampleItems.reduce((acc, item) => acc + (item.quantity || 1) * (item.weightGrams || 350), 0));

  // 1. Load active shipping integrations & active payment channels from Merchant Settings with real-time sync
  const loadMerchantSettings = async () => {
    try {
      const shippingIntegrations = await integrationService.getShippingIntegrations();
      const enabled = shippingIntegrations
        .filter((i) => i.isConnected)
        .map((i) => (i.provider || '').toLowerCase())
        .filter(Boolean);
      setActiveCouriers(enabled);
    } catch (err) {
      console.warn('Failed to load merchant shipping integrations:', err);
    }

    try {
      const channels = paymentChannelService.getChannels();
      setActivePaymentChannels(channels.filter((c) => c.isEnabled));
    } catch (err) {
      console.warn('Failed to load merchant payment channels:', err);
    }
  };

  useEffect(() => {
    loadMerchantSettings();

    const handleSync = () => {
      loadMerchantSettings();
    };

    window.addEventListener('microcms_integrations_updated', handleSync);
    window.addEventListener('microcms_payment_channels_updated', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    let bcIntegrations: BroadcastChannel | null = null;
    let bcPayments: BroadcastChannel | null = null;
    try {
      bcIntegrations = new BroadcastChannel('microcms_integrations_channel');
      bcIntegrations.onmessage = handleSync;
      bcPayments = new BroadcastChannel('microcms_payment_channel');
      bcPayments.onmessage = handleSync;
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('microcms_integrations_updated', handleSync);
      window.removeEventListener('microcms_payment_channels_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
      bcIntegrations?.close();
      bcPayments?.close();
    };
  }, []);

  // Fetch rates dynamically based on postal code
  const fetchBiteshipRates = async (postalCodeToUse?: string) => {
    const destCode = (postalCodeToUse || customerPostalCode || '12730').trim();
    setIsLoadingRates(true);
    setRatesError('');

    try {
      const result = await shippingService.checkBiteshipRates({
        storeId: store?.id,
        destinationPostalCode: destCode,
        weight: totalWeightGrams,
        couriers: 'jnt,jne,sicepat,anteraja,gosend',
      });

      if (result.rates && result.rates.length > 0) {
        setAvailableRates(result.rates);
      } else {
        setRatesError('Tidak ada layanan kurir yang tersedia untuk area ini.');
      }
    } catch (err: any) {
      console.warn('[Checkout] Failed to fetch rates:', err);
      setRatesError('Gagal memuat tarif kurir otomatis.');
    } finally {
      setIsLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchBiteshipRates(customerPostalCode);
  }, []);

  // Filter couriers strictly based on merchant active integrations
  const displayedRates = useMemo(() => {
    if (availableRates.length === 0) return [];
    if (activeCouriers.length === 0) return [];

    return availableRates.filter((rate) => {
      const code = (rate.courier_code || '').toLowerCase();
      return activeCouriers.some((active) => {
        if (!active || active === 'biteship') return false;
        return code === active || code.startsWith(active) || active.startsWith(code);
      });
    });
  }, [availableRates, activeCouriers]);

  // Keep selectedRate valid whenever displayedRates change
  useEffect(() => {
    if (displayedRates.length > 0) {
      const matched = displayedRates.find(
        (r) =>
          selectedRate &&
          r.courier_code === selectedRate.courier_code &&
          r.courier_service_code === selectedRate.courier_service_code
      );
      if (!matched) {
        setSelectedRate(displayedRates[0]);
      }
    } else {
      setSelectedRate(null);
    }
  }, [displayedRates]);

  // Dynamic shipping fee from selected courier
  const shippingFee = selectedRate ? selectedRate.price : 0;
  const total = subtotal + shippingFee;

  // Generate active payment methods matching merchant payment settings strictly
  const paymentOptions = useMemo(() => {
    const options: { id: string; name: string; description: string; badge?: string }[] = [];

    activePaymentChannels.forEach((channel) => {
      if (!channel.isEnabled) return;

      if (channel.id === 'qris') {
        options.push({
          id: 'qris',
          name: 'QRIS & E-Wallet (Scan Otomatis GoPay, OVO, DANA, ShopeePay)',
          description: channel.description || 'Bayar instan via scan kode QRIS dari aplikasi m-Banking atau E-Wallet mana pun.',
          badge: 'Instan Otomatis',
        });
      } else if (channel.id === 'gopay') {
        options.push({
          id: 'gopay',
          name: 'GoPay & GoPay Later',
          description: channel.description,
          badge: 'E-Wallet',
        });
      } else if (channel.id === 'shopeepay') {
        options.push({
          id: 'shopeepay',
          name: 'ShopeePay & SPayLater',
          description: channel.description,
          badge: 'E-Wallet',
        });
      } else if (channel.category === 'virtual_account') {
        options.push({
          id: channel.id,
          name: channel.name,
          description: channel.description || 'Transfer otomatis dengan verifikasi instan 24 jam tanpa perlu upload bukti transfer.',
          badge: 'Otomatis 24/7',
        });
      } else if (channel.id === 'credit_card') {
        options.push({
          id: 'credit_card',
          name: 'Kartu Kredit / Debit Online (Visa, Mastercard, JCB)',
          description: channel.description || 'Pembayaran online terenkripsi dengan proteksi 3D Secure OTP.',
          badge: '3D Secure',
        });
      } else if (channel.category === 'retail_paylater') {
        options.push({
          id: channel.id,
          name: channel.name,
          description: channel.description || 'Bayar tunai di meja kasir dengan kode pembayaran.',
          badge: 'Kasir Retail',
        });
      }
    });

    return options;
  }, [activePaymentChannels]);

  // Sync selectedPaymentId with available options
  useEffect(() => {
    if (paymentOptions.length > 0) {
      const exists = paymentOptions.some((p) => p.id === selectedPaymentId);
      if (!exists) {
        setSelectedPaymentId(paymentOptions[0].id);
      }
    }
  }, [paymentOptions, selectedPaymentId]);

  // Handle City Selection
  const handleCitySelect = (cityName: string) => {
    setCustomerCity(cityName);
    const matched = INDONESIAN_CITIES.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase() || c.id === cityName
    );
    if (matched) {
      setCustomerPostalCode(matched.postalCode);
      fetchBiteshipRates(matched.postalCode);
    }
  };

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find((s) => s.type === 'Header');
  const footerSection = Object.values(sections).find((s) => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const finalizeOrder = async (isPaid: boolean, methodDesc: string) => {
    const orderItems: OrderItem[] = sampleItems.map((s) => ({
      productId: s.id,
      productName: s.name,
      productImage: s.imageUrl,
      price: s.price,
      quantity: s.quantity || 1,
      subtotal: s.price * (s.quantity || 1),
    }));

    const courierDisplayName = selectedRate
      ? `${selectedRate.courier_name} (${selectedRate.courier_service_name})`
      : 'J&T Express (Reguler)';

    const newOrder = await orderService.createOrder({
      storeId: store?.id || 'store-andhika',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerAddress: customerAddress.trim(),
      customerCity: customerCity.trim() || 'Indonesia',
      customerPostalCode: customerPostalCode.trim() || undefined,
      items: orderItems,
      subtotal,
      shippingCost: shippingFee,
      discount: 0,
      grandTotal: total,
      paymentMethod: methodDesc as any,
      paymentStatus: isPaid ? 'Sudah Dibayar' : 'Belum Dibayar',
      courier: (selectedRate?.courier_code?.toUpperCase() || 'J&T') as any,
      courierCode: selectedRate?.courier_code || 'jnt',
      courierService: selectedRate ? `${selectedRate.courier_service_name} • ${selectedRate.etd}` : 'Reguler • 1-3 Hari',
      shippingStatus: 'Baru',
      notes: `Pesanan checkout storefront: ${activeThemeId}. Kurir: ${courierDisplayName}. Ongkir: Rp ${shippingFee.toLocaleString('id-ID')}`,
    });

    if (isPaid && store?.id) {
      const currentBalance = store.balance || 0;
      await storeService.updateStore(store.id, { balance: currentBalance + total });
    }

    setCreatedOrder(newOrder);
    setIsCompleted(true);
    if (store?.slug) {
      cartService.clearCart(store.slug);
    }
    // Notify application & merchant store that new order has arrived
    window.dispatchEvent(new CustomEvent('microcms_order_created', { detail: newOrder }));
  };

  const handleProcessCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert('Silakan lengkapi Nama Lengkap, Nomor WhatsApp, dan Alamat Pengiriman.');
      return;
    }

    if (displayedRates.length === 0) {
      alert('Tidak ada opsi pengiriman aktif yang tersedia saat ini.');
      return;
    }

    if (paymentOptions.length === 0) {
      alert('Tidak ada metode pembayaran yang aktif di toko ini.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = `INV-${Date.now()}`;
      await midtransService.payWithSnap(
        {
          orderId,
          grossAmount: total,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || 'customer@example.com',
          customerPhone: customerPhone.trim(),
          items: [
            ...sampleItems.map((s) => ({
              id: s.id,
              name: s.name,
              price: s.price,
              quantity: s.quantity || 1,
            })),
            {
              id: 'shipping-charge',
              name: `Ongkir (${selectedRate?.courier_name || 'Pengiriman'})`,
              price: shippingFee,
              quantity: 1,
            },
          ],
        },
        {
          onSuccess: async (result) => {
            const methodLabel = paymentOptions.find((p) => p.id === selectedPaymentId)?.name || 'Online Payment';
            await finalizeOrder(true, `Midtrans (${result.payment_type || methodLabel})`);
            setIsSubmitting(false);
          },
          onPending: async (result) => {
            const methodLabel = paymentOptions.find((p) => p.id === selectedPaymentId)?.name || 'Online Payment';
            await finalizeOrder(false, `Midtrans Pending (${result.payment_type || methodLabel})`);
            setIsSubmitting(false);
          },
          onError: (err) => {
            console.error('Midtrans Snap error:', err);
            setIsSubmitting(false);
            alert('Pembayaran dibatalkan atau terjadi kendala. Silakan coba lagi.');
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert('Terjadi kendala saat memproses pesanan: ' + (err?.message || 'Silakan coba kembali.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    // 1. ORDER COMPLETED VIEW
    if (isCompleted) {
      const orderNum = createdOrder?.orderNumber || '#ORD-88231';
      const courierInfo = selectedRate
        ? `${selectedRate.courier_name} (${selectedRate.courier_service_name})`
        : 'J&T Express';
      const selectedPaymentName =
        paymentOptions.find((p) => p.id === selectedPaymentId)?.name || 'Transfer Manual';

      return (
        <div className="py-20 px-4 sm:px-6 max-w-2xl mx-auto text-center font-sans">
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
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black">Pesanan Berhasil Dibuat!</h1>
              <p className="text-sm font-medium text-gray-600">
                Nomor Pesanan: <span className="font-bold font-mono text-gray-900">{orderNum}</span>
              </p>
            </div>

            <div className="p-5 bg-emerald-50/80 rounded-2xl text-left text-xs text-emerald-950 space-y-2 border border-emerald-200/80">
              <p className="font-bold">Status: <span className="text-emerald-700">Tersimpan ke Sistem Toko</span></p>
              <p>Metode Pembayaran: <span className="font-semibold">{selectedPaymentName}</span></p>
              <p>Penerima: <span className="font-semibold">{customerName} ({customerPhone})</span></p>
              <p>Alamat: <span className="font-semibold">{customerAddress}, {customerCity} ({customerPostalCode})</span></p>
              <p>Pengiriman: <span className="font-semibold">{courierInfo} • Rp {shippingFee.toLocaleString('id-ID')}</span></p>
              <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-sm font-extrabold text-emerald-950">
                <span>Total Tagihan</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => (onNavigate ? onNavigate('orders') : null)}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <Package className="w-4 h-4" />
                <span>Lihat Status Pesanan</span>
              </button>

              <button
                onClick={() => (onNavigate ? onNavigate('homepage') : null)}
                className="w-full sm:w-1/2 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition cursor-pointer"
              >
                Kembali ke Toko
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black font-sans">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-white uppercase mb-1">KOTA TUJUAN</label>
                    <select
                      value={customerCity}
                      onChange={(e) => handleCitySelect(e.target.value)}
                      className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm cursor-pointer"
                    >
                      {INDONESIAN_CITIES.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-white uppercase mb-1">KODE POS</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customerPostalCode}
                        onChange={(e) => setCustomerPostalCode(e.target.value)}
                        placeholder="KODE POS"
                        className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => fetchBiteshipRates(customerPostalCode)}
                        className="px-4 bg-yellow-300 border-4 border-black font-black hover:bg-white cursor-pointer"
                        title="Hitung Ulang Tarif"
                      >
                        <RefreshCw className={`w-5 h-5 ${isLoadingRates ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courier Selection Dropdown */}
              <div className="pt-4 border-t-4 border-black space-y-2">
                <h2 className="text-2xl font-black text-white uppercase flex items-center gap-2">
                  <Truck className="w-6 h-6" />
                  <span>LAYANAN PENGIRIMAN</span>
                </h2>

                {isLoadingRates ? (
                  <div className="p-4 bg-white border-4 border-black font-black uppercase text-center flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>MEMUAT PILIHAN KURIR...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedRate ? `${selectedRate.courier_code}-${selectedRate.courier_service_code}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = displayedRates.find((r) => `${r.courier_code}-${r.courier_service_code}` === val);
                        if (match) setSelectedRate(match);
                      }}
                      className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm cursor-pointer"
                    >
                      {displayedRates.map((rate) => (
                        <option
                          key={`${rate.courier_code}-${rate.courier_service_code}`}
                          value={`${rate.courier_code}-${rate.courier_service_code}`}
                        >
                          {rate.courier_name} - {rate.courier_service_name} ({rate.etd}) — Rp {rate.price.toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>
                    {selectedRate && (
                      <div className="p-3 bg-yellow-300 border-4 border-black font-black uppercase text-xs flex justify-between">
                        <span>ESTIMASI: {selectedRate.etd}</span>
                        <span>ONGKIR: Rp {selectedRate.price.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method Dropdown */}
              <div className="pt-4 border-t-4 border-black space-y-2">
                <h2 className="text-2xl font-black text-white uppercase flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  <span>METODE PEMBAYARAN</span>
                </h2>
                <select
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                  className="w-full p-4 bg-white border-4 border-black font-black uppercase text-sm cursor-pointer"
                >
                  {paymentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
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

            <div className="md:col-span-5 bg-yellow-300 p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-6 h-fit sticky top-24">
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
                <div className="flex justify-between">
                  <span className="uppercase">ONGKIR ({selectedRate?.courier_name || 'KURIR'})</span>
                  <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-2xl bg-black text-white p-3 mt-4">
                  <span>TOTAL</span><span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-md space-y-6">
              <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>[1. DESTINATION_PARAMETERS]</span>
              </h2>
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
                  placeholder="SHIPPING_STREET_ADDRESS"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">TARGET_CITY</label>
                    <select
                      value={customerCity}
                      onChange={(e) => handleCitySelect(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400 cursor-pointer"
                    >
                      {INDONESIAN_CITIES.map((c) => (
                        <option key={c.id} value={c.name} className="bg-slate-950 text-white">{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">POSTAL_CODE</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customerPostalCode}
                        onChange={(e) => setCustomerPostalCode(e.target.value)}
                        placeholder="POSTAL_CODE"
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => fetchBiteshipRates(customerPostalCode)}
                        className="px-3 bg-cyan-950 border border-cyan-500/50 text-cyan-300 rounded-xl hover:bg-cyan-900/50 cursor-pointer"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingRates ? 'animate-spin text-cyan-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courier Dropdown */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-400" />
                  <span>[2. SHIPPING_PROVIDER]</span>
                </h2>
                <select
                  value={selectedRate ? `${selectedRate.courier_code}-${selectedRate.courier_service_code}` : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = displayedRates.find((r) => `${r.courier_code}-${r.courier_service_code}` === val);
                    if (match) setSelectedRate(match);
                  }}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400 cursor-pointer"
                >
                  {displayedRates.map((rate) => (
                    <option
                      key={`${rate.courier_code}-${rate.courier_service_code}`}
                      value={`${rate.courier_code}-${rate.courier_service_code}`}
                      className="bg-slate-950 text-white"
                    >
                      {rate.courier_name} - {rate.courier_service_name} ({rate.etd}) — Rp {rate.price.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Dropdown */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span>[3. PAYMENT_GATEWAY]</span>
                </h2>
                <select
                  value={selectedPaymentId}
                  onChange={(e) => setSelectedPaymentId(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 text-sm focus:border-cyan-400 cursor-pointer"
                >
                  {paymentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id} className="bg-slate-950 text-white">
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleProcessCheckout}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl font-bold text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 transition"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>CONFIRM_ORDER ⚡</span>}
              </button>
            </div>

            <div className="md:col-span-5 bg-slate-900/60 border border-cyan-500/30 rounded-3xl p-8 backdrop-blur-md space-y-6 h-fit sticky top-24">
              <h2 className="text-lg font-bold text-cyan-300 border-b border-slate-800 pb-3">[ORDER_MANIFEST]</h2>
              {sampleItems.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800/60 pb-3">
                  <span>{p.name} (x{p.quantity || 1})</span>
                  <span className="font-bold text-cyan-400">Rp {(p.price * (p.quantity || 1)).toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400"><span>SUBTOTAL</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                <div className="flex justify-between text-slate-400">
                  <span>SHIPPING ({selectedRate?.courier_name || 'EXPEDITION'})</span>
                  <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-cyan-300 pt-2 border-t border-slate-800">
                  <span>TOTAL_CREDITS</span><span>Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 4. DEFAULT HIGH-END PROFESSIONAL E-COMMERCE THEME (Minimalist, Editorial, Luxury, Cute, Nature)
    return (
      <div className="pt-24 pb-28 bg-[#FBFBFC] text-[#1A1A1A] min-h-screen font-sans antialiased">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Navigation Link */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => (onNavigate ? onNavigate('homepage') : null)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Belanja</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enkripsi 256-Bit Aman</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Checkout Details Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-7">
                {/* 1. Alamat Pengiriman */}
                <div>
                  <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-5">
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">Detail Alamat Pengiriman</h2>
                      <p className="text-xs text-gray-500">Masukkan alamat lengkap tujuan pengiriman pesanan Anda</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Nama lengkap penerima"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Alamat Email <span className="text-gray-400 font-normal">(Untuk tanda terima &amp; invoice)</span>
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Alamat Lengkap *</label>
                      <textarea
                        rows={2}
                        required
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Nama jalan, nomor bangunan, RT/RW, kelurahan, patokan"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kota / Kabupaten Tujuan *</label>
                        <select
                          value={customerCity}
                          onChange={(e) => handleCitySelect(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition cursor-pointer"
                        >
                          {INDONESIAN_CITIES.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name} ({c.province})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kode Pos</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customerPostalCode}
                            onChange={(e) => setCustomerPostalCode(e.target.value)}
                            placeholder="12730"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                          />
                          <button
                            type="button"
                            onClick={() => fetchBiteshipRates(customerPostalCode)}
                            className="px-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 flex items-center justify-center transition cursor-pointer"
                            title="Perbarui Tarif"
                          >
                            <RefreshCw className={`w-4 h-4 ${isLoadingRates ? 'animate-spin text-black' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Layanan Pengiriman (DROPDOWN) */}
                <div>
                  <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-5">
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">Layanan Pengiriman</h2>
                      <p className="text-xs text-gray-500">Pilih kurir ekspedisi dan durasi pengiriman</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {isLoadingRates ? (
                      <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 text-center flex items-center justify-center gap-2.5 text-xs text-gray-600 font-medium">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-900" />
                        <span>Memuat pilihan kurir dan tarif pengiriman...</span>
                      </div>
                    ) : displayedRates.length === 0 ? (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                        {activeCouriers.length === 0
                          ? 'Belum ada opsi ekspedisi pengiriman yang diaktifkan oleh toko saat ini.'
                          : 'Tidak ada opsi kurir aktif yang melayani kode pos/alamat tujuan ini.'}
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <select
                            value={selectedRate ? `${selectedRate.courier_code}-${selectedRate.courier_service_code}` : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const match = displayedRates.find((r) => `${r.courier_code}-${r.courier_service_code}` === val);
                              if (match) setSelectedRate(match);
                            }}
                            className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition cursor-pointer pr-10"
                          >
                            {displayedRates.map((rate) => (
                              <option
                                key={`${rate.courier_code}-${rate.courier_service_code}`}
                                value={`${rate.courier_code}-${rate.courier_service_code}`}
                              >
                                {rate.courier_name} — {rate.courier_service_name} ({rate.etd}) — Rp {rate.price.toLocaleString('id-ID')}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {selectedRate && (
                          <div className="flex items-center justify-between p-3.5 bg-gray-50/90 rounded-xl border border-gray-100 text-xs">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Truck className="w-4 h-4 text-gray-900" />
                              <span className="font-semibold text-gray-900">{selectedRate.courier_name}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">{selectedRate.courier_service_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                              <Clock className="w-3.5 h-3.5 text-gray-500" />
                              <span>{selectedRate.etd}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Metode Pembayaran (DROPDOWN) */}
                <div>
                  <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-5">
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">Metode Pembayaran</h2>
                      <p className="text-xs text-gray-500">Pilih opsi pembayaran yang sesuai dengan preferensi Anda</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {paymentOptions.length === 0 ? (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                        Belum ada metode pembayaran yang diaktifkan oleh toko saat ini.
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <select
                            value={selectedPaymentId}
                            onChange={(e) => setSelectedPaymentId(e.target.value)}
                            className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition cursor-pointer pr-10"
                          >
                            {paymentOptions.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100 text-xs text-gray-600 flex items-start gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{paymentOptions.find((p) => p.id === selectedPaymentId)?.description}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Submit Button */}
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleProcessCheckout}
                    className="w-full py-4 px-6 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold text-base transition shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Memproses Pesanan Anda...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Bayar Sekarang • Rp {total.toLocaleString('id-ID')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Order Summary */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">Ringkasan Pesanan</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    {sampleItems.length} Produk
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {sampleItems.map((p) => (
                    <div key={p.id} className="flex gap-3.5 items-center">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop'}
                        alt={p.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop';
                        }}
                        className="w-14 h-14 object-cover rounded-xl border border-gray-100 bg-gray-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {p.quantity || 1}</p>
                      </div>
                      <p className="font-bold text-sm text-gray-900 shrink-0">
                        Rp {(p.price * (p.quantity || 1)).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Breakdown Costs */}
                <div className="pt-4 border-t border-gray-100 space-y-2.5 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal Produk</span>
                    <span className="font-semibold text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkir ({selectedRate?.courier_name || 'Kurir'})</span>
                    <span className="font-semibold text-gray-900">Rp {shippingFee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-baseline font-extrabold text-gray-900 text-lg pt-3 border-t border-gray-100">
                    <span>Total Tagihan</span>
                    <span className="text-black text-xl">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
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


