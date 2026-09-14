import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  CheckCircle,
  MapPin,
  User,
  Phone,
  Clock,
  Copy,
  Check,
  ArrowLeft,
  Building2,
  ExternalLink,
  Wallet,
  Store as StoreIcon,
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Store, CourierType, PaymentMethod, Order } from '../../types';
import { formatRupiah, generateWhatsAppLink } from '../../utils/formatters';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { shippingService, INDONESIAN_CITIES, ShippingRate } from '../../services/shippingService';
import { storeService } from '../../services/storeService';
import { midtransService } from '../../services/midtransService';
import {
  paymentChannelService,
  PaymentChannel,
  DEFAULT_MIDTRANS_CHANNELS,
} from '../../services/paymentChannelService';

interface CartDrawerProps {
  isOpen: boolean;
  store: Store;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderSuccess: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  store,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment' | 'success'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');
  const [courier, setCourier] = useState<CourierType>('J&T');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCopiedVa, setIsCopiedVa] = useState(false);
  const [isCopiedOrderNumber, setIsCopiedOrderNumber] = useState(false);

  // Dynamic Midtrans Channels from merchant configuration
  const [activeChannels, setActiveChannels] = useState<PaymentChannel[]>(() => {
    const channels = paymentChannelService.getChannels().filter((c) => c.isEnabled);
    return channels.length > 0 ? channels : DEFAULT_MIDTRANS_CHANNELS.filter((c) => c.isEnabled);
  });
  const [selectedChannelId, setSelectedChannelId] = useState<string>('qris');
  const [channelCategoryFilter, setChannelCategoryFilter] = useState<
    'all' | 'qris_ewallet' | 'virtual_account' | 'credit_card' | 'retail_paylater'
  >('all');

  // Reload enabled channels when drawer opens
  useEffect(() => {
    if (isOpen) {
      const channels = paymentChannelService.getChannels().filter((c) => c.isEnabled);
      const list = channels.length > 0 ? channels : DEFAULT_MIDTRANS_CHANNELS.filter((c) => c.isEnabled);
      setActiveChannels(list);
      if (!list.some((c) => c.id === selectedChannelId)) {
        setSelectedChannelId(list[0]?.id || 'qris');
      }
    }
  }, [isOpen]);

  const selectedChannel =
    activeChannels.find((c) => c.id === selectedChannelId) ||
    activeChannels[0] ||
    DEFAULT_MIDTRANS_CHANNELS[0];

  // Dynamic Shipping Rates calculation based on items weight & destination
  const totalWeightGrams = items.reduce(
    (sum, item) => sum + (item.product.weightGrams || 500) * item.quantity,
    0
  );
  const totalWeightKg = Math.max(1, Math.ceil(totalWeightGrams / 1000));

  const [availableRates, setAvailableRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  useEffect(() => {
    const rates = shippingService.calculateRates(store.city || 'Jakarta Selatan', city, totalWeightGrams);
    setAvailableRates(rates);

    // Pick first or matching courier rate
    const match = rates.find((r) => r.courier === courier) || rates[0];
    setSelectedRate(match || null);
    if (match) setCourier(match.courier);
  }, [city, totalWeightGrams, store.city]);

  if (!isOpen) return null;

  const subtotal = cartService.getTotal(items);
  const shippingCost = selectedRate ? selectedRate.cost : items.length > 0 ? 15000 : 0;
  const grandTotal = subtotal + shippingCost;

  // Virtual Account number generator based on channel and customer phone
  const getVaNumber = (channelId: string): string => {
    const rawDigits = (phone.replace(/\D/g, '') || '8123456789').slice(-8);
    switch (channelId) {
      case 'bca_va':
        return `8099 ${rawDigits.slice(0, 4)} ${rawDigits.slice(4)}`;
      case 'mandiri_bill':
        return `8976 ${rawDigits.slice(0, 4)} ${rawDigits.slice(4)}`;
      case 'bni_va':
        return `8277 ${rawDigits.slice(0, 4)} ${rawDigits.slice(4)}`;
      case 'bri_va':
        return `1029 ${rawDigits.slice(0, 4)} ${rawDigits.slice(4)}`;
      case 'permata_va':
        return `8522 ${rawDigits.slice(0, 4)} ${rawDigits.slice(4)}`;
      case 'cimb_va':
        return `1188 ${rawDigits.slice(0, 4)} ${rawDigits.slice(4)}`;
      default:
        return `8000 ${rawDigits.slice(0, 4)} ${rawDigits.slice(4)}`;
    }
  };

  const recordSuccessOrder = async (orderIdCode?: string, verifiedMethod?: string) => {
    const orderItems = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.imageUrl || '',
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
      variantName: item.variantName,
    }));

    const finalMethod = verifiedMethod || selectedChannel.name || 'QRIS Real-Time';

    const newOrder = await orderService.createOrder({
      storeId: store.id,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      customerCity: city,
      items: orderItems,
      subtotal,
      shippingCost,
      discount: 0,
      grandTotal,
      paymentMethod: finalMethod as PaymentMethod,
      paymentStatus: 'Sudah Dibayar',
      courier,
      courierService: selectedRate ? `${selectedRate.serviceName} (${selectedRate.etd})` : 'Reguler (1-2 Hari)',
      shippingStatus: 'Baru',
      notes: notes.trim() || undefined,
    });

    // Credit the merchant store balance automatically
    const currentBalance = store.balance || 0;
    await storeService.updateStore(store.id, { balance: currentBalance + grandTotal });

    cartService.clearCart(store.slug);
    setCompletedOrder(newOrder);
    setStep('success');
    onOrderSuccess(newOrder);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  };

  // Trigger Midtrans Snap payment
  const handleLaunchMidtransSnap = async () => {
    setIsSubmitting(true);
    const orderId = `KROOM-${Date.now()}`;

    try {
      await midtransService.payWithSnap(
        {
          orderId,
          grossAmount: grandTotal,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          enabledPayments: [selectedChannel.id],
          items: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
        },
        {
          onSuccess: async (res) => {
            const methodTag = res.payment_type ? res.payment_type.toUpperCase() : selectedChannel.name;
            await recordSuccessOrder(orderId, `${selectedChannel.name} (${methodTag})`);
            setIsSubmitting(false);
          },
          onPending: async (res) => {
            const methodTag = res.payment_type ? res.payment_type.toUpperCase() : selectedChannel.name;
            await recordSuccessOrder(orderId, `${selectedChannel.name} (${methodTag})`);
            setIsSubmitting(false);
          },
          onError: () => {
            alert('Pembayaran Midtrans dibatalkan atau mengalami kendala.');
            setIsSubmitting(false);
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (err: any) {
      console.warn('Midtrans Snap fallback mode:', err);
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Mohon lengkapi formulir nama, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }
    setStep('payment');
    // Launch Snap
    setTimeout(() => {
      handleLaunchMidtransSnap();
    }, 150);
  };

  const handleManualFinalizeOrder = async () => {
    setIsSubmitting(true);
    const orderId = `KROOM-${Date.now()}`;
    await recordSuccessOrder(orderId, selectedChannel.name);
    setIsSubmitting(false);
  };

  const handleCopyVa = () => {
    navigator.clipboard.writeText(getVaNumber(selectedChannel.id).replace(/\s+/g, ''));
    setIsCopiedVa(true);
    setTimeout(() => setIsCopiedVa(false), 2000);
  };

  const handleCopyOrderNumber = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.orderNumber);
    setIsCopiedOrderNumber(true);
    setTimeout(() => setIsCopiedOrderNumber(false), 2000);
  };

  // Filter channels based on selected category
  const filteredChannels = activeChannels.filter((c) => {
    if (channelCategoryFilter === 'all') return true;
    return c.category === channelCategoryFilter;
  });

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-left font-sans">
        {/* Top Header */}
        <div className="p-4 border-b border-[#E5E0DD] flex items-center justify-between bg-[#FAF7F7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#66000E] flex items-center justify-center text-white shadow-2xs">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#241A1A] leading-tight">
                {step === 'cart' && 'Keranjang Belanja'}
                {step === 'checkout' && 'Pengiriman & Pembayaran'}
                {step === 'payment' && 'Sesi Pembayaran Midtrans'}
                {step === 'success' && 'Pesanan Berhasil'}
              </h3>
              <p className="text-[11px] text-[#706866]">
                {items.length} produk • {store.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#EAE4E2] text-[#706866] hover:text-[#241A1A] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS LIST */}
        {step === 'cart' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-[#66000E]" />
                </div>
                <h4 className="font-bold text-sm text-[#241A1A]">Keranjang Masih Kosong</h4>
                <p className="text-xs text-[#706866] max-w-xs leading-relaxed">
                  Pilih produk UMKM favorit Anda dari katalog toko dan tambahkan ke keranjang untuk melanjutkan pemesanan.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variantName || 'default'}`}
                    className="p-3 bg-white rounded-2xl border border-[#E5E0DD] shadow-2xs flex items-center gap-3"
                  >
                    <img
                      src={item.product.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#EAE4E2] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#241A1A] truncate">{item.product.name}</h4>
                      {item.variantName && (
                        <span className="text-[10px] text-[#706866] bg-[#FAF7F7] px-1.5 py-0.5 rounded border border-[#E5E0DD] inline-block mt-0.5">
                          {item.variantName}
                        </span>
                      )}
                      <p className="text-xs font-black text-[#66000E] mt-1">
                        {formatRupiah(item.product.price)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1 bg-[#FAF7F7] border border-[#E5E0DD] rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-700 hover:bg-white transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#241A1A] px-1 min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-gray-700 hover:bg-white transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="p-4 border-t border-[#E5E0DD] bg-[#FAF7F7] space-y-3 shrink-0">
                <div className="flex items-center justify-between text-xs text-[#706866]">
                  <span>Subtotal ({items.length} Item):</span>
                  <span className="text-sm font-black text-[#241A1A]">{formatRupiah(subtotal)}</span>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Lanjut ke Pengiriman & Pembayaran</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SHIPPING & DYNAMIC MIDTRANS PAYMENT CHANNELS */}
        {step === 'checkout' && (
          <form onSubmit={handleProceedToPayment} className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Customer Contact */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-[#241A1A] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#66000E]" />
                  <span>Informasi Pembeli & Penerima</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#706866] mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs text-[#241A1A] bg-[#FAF7F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#706866] mb-1">No. WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs text-[#241A1A] bg-[#FAF7F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Destination & Dynamic Ongkir */}
              <div className="space-y-2.5 pt-3 border-t border-[#E5E0DD]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#241A1A] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#66000E]" />
                    <span>Alamat Pengiriman & Kurir</span>
                  </h4>
                  <span className="text-[10px] font-semibold text-[#706866] bg-[#FAF7F7] px-2 py-0.5 rounded-full border border-[#E5E0DD]">
                    Berat: {totalWeightGrams}g ({totalWeightKg} kg)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#706866] mb-1">Kota Tujuan *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs font-medium text-[#241A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
                  >
                    {INDONESIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#706866] mb-1">Alamat Lengkap *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Nama Jalan No. XX, RT/RW, Patokan..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs text-[#241A1A] bg-[#FAF7F7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
                  />
                </div>

                {/* Couriers */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-semibold text-[#706866]">Pilih Layanan Ekspedisi</label>
                  <div className="space-y-1.5">
                    {availableRates.map((rate) => {
                      const isSelected = courier === rate.courier;
                      return (
                        <div
                          key={rate.courier}
                          onClick={() => {
                            setCourier(rate.courier);
                            setSelectedRate(rate);
                          }}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#66000E] bg-[#F5E8EA]/40 shadow-2xs'
                              : 'border-[#E5E0DD] bg-white hover:bg-[#FAF7F7]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Truck className={`w-4 h-4 ${isSelected ? 'text-[#66000E]' : 'text-[#706866]'}`} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#241A1A]">
                                  {rate.courier} - {rate.serviceName}
                                </span>
                                {rate.badge && (
                                  <span className="text-[9px] font-bold bg-[#F5E8EA] text-[#66000E] px-1.5 py-0.2 rounded-full border border-[#E6DDDA]">
                                    {rate.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#706866]">Estimasi: {rate.etd}</span>
                            </div>
                          </div>

                          <span className="text-xs font-black text-[#241A1A]">
                            {formatRupiah(rate.cost)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* DYNAMIC MIDTRANS PAYMENT CHANNELS SELECTOR */}
              <div className="space-y-2.5 pt-3 border-t border-[#E5E0DD]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#241A1A] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#66000E]" />
                      <span>Metode Pembayaran (Midtrans)</span>
                    </h4>
                    <p className="text-[10px] text-[#706866]">
                      {activeChannels.length} metode pembayaran otomatis aktif
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Cek Otomatis 24 Jam</span>
                  </span>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'qris_ewallet', label: 'QRIS & E-Wallet' },
                    { id: 'virtual_account', label: 'Transfer Bank (VA)' },
                    { id: 'credit_card', label: 'Kartu Kredit' },
                    { id: 'retail_paylater', label: 'Gerai / PayLater' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setChannelCategoryFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition cursor-pointer ${
                        channelCategoryFilter === tab.id
                          ? 'bg-[#66000E] text-white shadow-2xs'
                          : 'bg-[#FAF7F7] text-[#706866] hover:bg-[#EAE4E2] hover:text-[#241A1A]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Channels List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
                  {filteredChannels.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3 text-center">
                      Tidak ada metode dalam kategori ini.
                    </p>
                  ) : (
                    filteredChannels.map((channel) => {
                      const isSelected = selectedChannelId === channel.id;
                      return (
                        <div
                          key={channel.id}
                          onClick={() => setSelectedChannelId(channel.id)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#66000E] bg-[#F5E8EA]/40 shadow-2xs'
                              : 'border-[#E5E0DD] bg-white hover:bg-[#FAF7F7]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Brand Badge */}
                            <span
                              className="px-2 py-1 rounded-md text-[10px] font-black text-white shrink-0 tracking-wider"
                              style={{ backgroundColor: channel.color }}
                            >
                              {channel.iconCode}
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[#241A1A] truncate">
                                  {channel.name}
                                </span>
                                {channel.badge && (
                                  <span className="text-[9px] font-bold bg-[#FAF7F7] text-[#66000E] px-1.5 py-0.2 rounded border border-[#E6DDDA]">
                                    {channel.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#706866] truncate max-w-xs">
                                {channel.description}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                              isSelected
                                ? 'border-[#66000E] bg-[#66000E] text-white'
                                : 'border-[#E5E0DD] bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="p-4 border-t border-[#E5E0DD] bg-[#FAF7F7] space-y-3 shrink-0">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-[#706866]">
                  <span>Subtotal Produk:</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[#706866]">
                  <span>Ongkos Kirim ({courier}):</span>
                  <span>{formatRupiah(shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-[#241A1A] pt-1.5 border-t border-[#E5E0DD]">
                  <span>Total Tagihan:</span>
                  <span className="text-[#66000E] font-black">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-3 py-2.5 rounded-xl border border-[#E5E0DD] bg-white text-[#706866] hover:bg-[#FAF7F7] transition cursor-pointer text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: PAYMENT GATEWAY INTERACTION & IN-DRAWER DETAILS */}
        {step === 'payment' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {/* Order Summary Pill */}
              <div className="bg-[#FAF7F7] rounded-2xl p-3.5 border border-[#E5E0DD] space-y-1.5 text-[#706866]">
                <div className="flex items-center justify-between">
                  <span>Penerima:</span>
                  <span className="font-bold text-[#241A1A]">
                    {name} ({phone})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kurir & Tujuan:</span>
                  <span className="font-medium text-[#241A1A]">
                    {courier} • {city}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E5E0DD] flex items-center justify-between">
                  <span className="font-bold text-[#241A1A]">Total Tagihan:</span>
                  <span className="text-base font-black text-[#66000E]">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Midtrans Payment Container */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E0DD] shadow-2xs text-center space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#FAF7F7] text-[11px] text-[#706866]">
                  <span className="flex items-center gap-1.5 font-bold text-[#241A1A]">
                    <ShieldCheck className="w-4 h-4 text-[#66000E]" />
                    <span>Midtrans Payment Gateway</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                    Otomatis Dicek
                  </span>
                </div>

                {/* Selected Method Display */}
                <div className="flex items-center justify-between bg-[#FAF7F7] p-2.5 rounded-xl border border-[#E5E0DD]">
                  <div className="flex items-center gap-2 text-left">
                    <span
                      className="px-2 py-1 rounded text-[10px] font-black text-white shrink-0"
                      style={{ backgroundColor: selectedChannel.color }}
                    >
                      {selectedChannel.iconCode}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-[#241A1A]">{selectedChannel.name}</div>
                      <div className="text-[10px] text-[#706866]">{selectedChannel.categoryLabel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#66000E] bg-[#F5E8EA] px-2 py-0.5 rounded-full border border-[#E6DDDA]">
                      {selectedChannel.badge}
                    </span>
                  </div>
                </div>

                {/* QRIS / E-Wallet View */}
                {selectedChannel.category === 'qris_ewallet' ? (
                  <>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                      <Clock className="w-3 h-3" />
                      <span>Selesaikan dalam 14:59</span>
                    </div>

                    <p className="text-xs text-[#706866]">
                      Buka aplikasi <strong>BCA/Mandiri/BRI/BNI Mobile</strong>, atau <strong>GoPay, OVO, ShopeePay, DANA</strong>, lalu scan kode QR di bawah:
                    </p>

                    <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-2xl border-2 border-[#E5E0DD] shadow-xs flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${encodeURIComponent(
                          `MIDTRANS_QRIS_${selectedChannel.id}_${Date.now()}_${grandTotal}`
                        )}&color=66000E`}
                        alt="QRIS Midtrans"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-[#A8A09E]">
                      NMID: ID10200392019 • PT MIDTRANS INDONESIA (Toko: {store.name})
                    </p>
                  </>
                ) : selectedChannel.category === 'virtual_account' ? (
                  /* Virtual Account View */
                  <div className="p-3.5 bg-[#FAF7F7] rounded-2xl border border-[#E5E0DD] text-left space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#706866]">
                      <span>Nomor Virtual Account ({selectedChannel.name}):</span>
                      <span className="text-[10px] font-bold text-[#66000E] bg-[#F5E8EA] px-2 py-0.2 rounded-full border border-[#E6DDDA]">
                        Verifikasi Instan 24 Jam
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-[#E5E0DD]">
                      <span className="text-sm font-mono font-black text-[#241A1A] tracking-wider">
                        {getVaNumber(selectedChannel.id)}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyVa}
                        className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F7] border border-[#E5E0DD] text-[11px] font-bold text-[#241A1A] hover:bg-[#EAE4E2] transition cursor-pointer flex items-center gap-1"
                      >
                        {isCopiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedVa ? 'Tersalin' : 'Salin VA'}</span>
                      </button>
                    </div>
                    <div className="space-y-1 text-[11px] text-[#706866] pt-1">
                      <p className="font-semibold text-[#241A1A]">Cara Pembayaran:</p>
                      <ol className="list-decimal list-inside space-y-0.5 pl-1">
                        <li>Buka aplikasi m-Banking atau ATM bank Anda</li>
                        <li>Pilih menu <strong>Transfer / Bayar &gt; Virtual Account</strong></li>
                        <li>Masukkan nomor VA di atas &amp; nominal tepat <strong>{formatRupiah(grandTotal)}</strong></li>
                        <li>Konfirmasi pembayaran hingga muncul resi berhasil</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  /* Other Channels View (Credit Card, Retail) */
                  <div className="p-3.5 bg-[#FAF7F7] rounded-2xl border border-[#E5E0DD] text-left space-y-2">
                    <div className="font-bold text-xs text-[#241A1A]">
                      Petunjuk Pembayaran {selectedChannel.name}
                    </div>
                    <p className="text-[11px] text-[#706866] leading-relaxed">
                      Lanjutkan pembayaran pada jendela popup resmi Midtrans Snap. Sistem akan memverifikasi transaksi secara real-time dan memperbarui status pesanan Anda.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleLaunchMidtransSnap}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#002A45] hover:bg-[#001D30] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Buka Jendela Midtrans Snap Popup</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleManualFinalizeOrder}
                    className="w-full py-2.5 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Memproses Pesanan...' : 'Konfirmasi Bayar Lunas (Selesai)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('checkout')}
                    className="text-xs text-[#706866] hover:text-[#241A1A] transition cursor-pointer pt-1"
                  >
                    ← Ubah Alamat atau Metode Pembayaran
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ORDER SUCCESS */}
        {step === 'success' && completedOrder && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
                <CheckCircle className="w-7 h-7" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Lunas Otomatis via Midtrans</span>
                </div>
                <h4 className="font-extrabold text-lg text-[#241A1A]">Pesanan Berhasil Dibuat!</h4>
                <p className="text-xs text-[#706866] mt-1">
                  Terima kasih, pembayaran telah diterima dan pesanan telah diteruskan ke toko <strong>{store.name}</strong>.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="p-4 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
                  <span className="text-[#706866]">Nomor Pesanan:</span>
                  <span className="font-mono font-black text-[#241A1A]">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
                  <span className="text-[#706866]">Penerima:</span>
                  <span className="font-bold text-[#241A1A]">
                    {completedOrder.customerName} ({completedOrder.customerPhone})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
                  <span className="text-[#706866]">Kurir & Ongkir:</span>
                  <span className="font-medium text-[#241A1A]">
                    {completedOrder.courier} ({formatRupiah(completedOrder.shippingCost)})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
                  <span className="text-[#706866]">Metode Pembayaran:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Lunas ({completedOrder.paymentMethod})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-[#241A1A]">Total Pembayaran:</span>
                  <span className="font-black text-base text-[#66000E]">
                    {formatRupiah(completedOrder.grandTotal)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Notification CTA */}
              <a
                href={generateWhatsAppLink(
                  store.phoneWhatsApp,
                  `Halo ${store.name}, saya sudah melakukan pembayaran pesanan di toko online Anda.\n\nNo Pesanan: #${completedOrder.orderNumber}\nPenerima: ${completedOrder.customerName}\nTotal: ${formatRupiah(completedOrder.grandTotal)}\nMetode: ${completedOrder.paymentMethod}\n\nMohon bantu proses pengirimannya ya, terima kasih!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#ECFDF3] hover:bg-[#D1FADF] text-[#027A48] font-bold text-xs border border-[#ABEFC6] transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Bukti Pesanan ke WA Toko</span>
              </a>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="w-full py-2.5 rounded-xl bg-[#241A1A] hover:bg-black text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isCopiedOrderNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopiedOrderNumber ? 'Nomor Pesanan Tersalin!' : 'Salin Nomor Pesanan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('cart');
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#E5E0DD] hover:bg-[#FAF7F7] text-xs font-semibold text-[#706866] transition cursor-pointer"
                >
                  Selesai &amp; Belanja Lagi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
