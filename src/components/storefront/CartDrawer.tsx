import React, { useState, useEffect, useRef } from 'react';
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
import { CartItem, Store, CourierType, PaymentMethod, Order, ShippingBranch, BiteshipRateOption } from '../../types';
import { formatRupiah, generateWhatsAppLink } from '../../utils/formatters';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { shippingService, INDONESIAN_CITIES, ShippingRate } from '../../services/shippingService';
import { duitkuService } from '../../services/duitkuService';
import { adminService } from '../../services/adminService';
import {
  paymentChannelService,
  PaymentChannel,
  DEFAULT_MIDTRANS_CHANNELS,
  getLocalizedChannelDescription,
  getLocalizedChannelName,
} from '../../services/paymentChannelService';
import { useLanguage } from '../../contexts/LanguageContext';
import { CourierSelector } from '../shipping/CourierSelector';

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
  const { language } = useLanguage();
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment' | 'success'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [courier, setCourier] = useState<CourierType>('J&T');
  const [selectedBranch, setSelectedBranch] = useState<ShippingBranch | null>(null);
  const [selectedBiteshipRate, setSelectedBiteshipRate] = useState<BiteshipRateOption | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCopiedVa, setIsCopiedVa] = useState(false);
  const [isCopiedOrderNumber, setIsCopiedOrderNumber] = useState(false);
  // Mengikuti toggle "Payment Gateway" di Pengaturan Sistem super admin:
  // nonaktif -> pembeli membayar manual (transfer bank / COD), tanpa Duitku.
  const [isGatewayEnabledOnPlatform, setIsGatewayEnabledOnPlatform] = useState<boolean>(
    () => adminService.getPlatformSettings().paymentGatewayEnabled ?? true
  );
  const isManualMode = !isGatewayEnabledOnPlatform;

  // Pilihan manual mengikuti pengaturan pembayaran toko (transfer/QRIS toko & COD).
  const payConfig = store.paymentConfig;
  const manualOptions = (() => {
    const list: { id: 'transfer_manual' | 'cod'; title: string; desc: string }[] = [];
    if (!payConfig || payConfig.enableManualTransfer) {
      list.push({
        id: 'transfer_manual',
        title: payConfig?.manualQrisImageUrl ? 'Transfer Bank / QRIS Toko' : 'Transfer Bank Manual',
        desc: 'Bayar ke rekening/QRIS toko lalu kirim bukti bayar',
      });
    }
    if (!payConfig || payConfig.enableCod) {
      list.push({ id: 'cod', title: 'Bayar di Tempat (COD)', desc: 'Bayar tunai saat pesanan Anda tiba' });
    }
    if (list.length === 0) {
      list.push({ id: 'cod', title: 'Bayar di Tempat (COD)', desc: 'Bayar tunai saat pesanan Anda tiba' });
    }
    return list;
  })();

  // Dynamic Midtrans Channels from merchant configuration
  const [activeChannels, setActiveChannels] = useState<PaymentChannel[]>(() => {
    const channels = paymentChannelService.getChannels().filter((c) => c.isEnabled);
    return channels.length > 0 ? channels : DEFAULT_MIDTRANS_CHANNELS.filter((c) => c.isEnabled);
  });
  const [selectedChannelId, setSelectedChannelId] = useState<string>('qris');
  const [channelCategoryFilter, setChannelCategoryFilter] = useState<
    'all' | 'qris_ewallet' | 'virtual_account' | 'credit_card' | 'retail_paylater'
  >('all');

  // Ambil status gateway terbaru dari database setiap drawer dibuka.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    adminService
      .fetchPlatformSettingsFromDatabase()
      .then((settings) => {
        if (!cancelled) setIsGatewayEnabledOnPlatform(settings.paymentGatewayEnabled ?? true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Mode manual hanya punya pilihan transfer_manual / cod.
  useEffect(() => {
    if (isManualMode && !manualOptions.some((m) => m.id === selectedChannelId)) {
      setSelectedChannelId(manualOptions[0].id);
    }
  }, [isManualMode, selectedChannelId, manualOptions.map((m) => m.id).join(',')]);

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

  const isCompletedPaid = completedOrder?.paymentStatus === 'Sudah Dibayar';
  const isCompletedCod = /cod/i.test(completedOrder?.paymentMethod || '');

  if (!isOpen) return null;

  const subtotal = cartService.getTotal(items);
  const shippingCost = selectedBiteshipRate
    ? selectedBiteshipRate.price
    : selectedRate
    ? selectedRate.cost
    : items.length > 0
    ? 15000
    : 0;
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

  // Pesanan gateway belum lunas yang dipakai ulang saat pembeli mencoba bayar lagi.
  const pendingGatewayOrderRef = useRef<{ key: string; order: Order } | null>(null);

  /** Buat pesanan di database (harga & total dihitung server, status selalu belum dibayar). */
  const createOrderRecord = async (verifiedMethod?: string): Promise<Order> => {
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

    return orderService.createOrder({
      storeId: store.id,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      customerCity: city,
      customerPostalCode: postalCode,
      destinationAddress: address.trim(),
      destinationPostalCode: postalCode,
      originBranchId: selectedBranch?.id,
      courierCode: selectedBiteshipRate?.courier_code || courier.toLowerCase(),
      courierService: selectedBiteshipRate
        ? `${selectedBiteshipRate.courier_name} ${selectedBiteshipRate.courier_service_name} (${selectedBiteshipRate.etd})`
        : selectedRate
        ? `${selectedRate.serviceName} (${selectedRate.etd})`
        : 'Reguler (1-2 Hari)',
      items: orderItems,
      subtotal,
      shippingCost,
      discount: 0,
      grandTotal,
      paymentMethod: finalMethod as PaymentMethod,
      paymentStatus: 'Belum Dibayar',
      courier,
      shippingStatus: 'Baru',
      notes: notes.trim() || undefined,
    });
  };

  /** Tampilkan halaman sukses. Saldo toko ditambah oleh server setelah gateway mengonfirmasi. */
  const showCompletedOrder = (newOrder: Order) => {
    pendingGatewayOrderRef.current = null;
    const isPaid = newOrder.paymentStatus === 'Sudah Dibayar';
    cartService.clearCart(store.slug);
    setCompletedOrder(newOrder);
    setStep('success');
    onOrderSuccess(newOrder);

    if (isPaid) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  // Trigger Duitku payment
  const handleLaunchDuitkuPayment = async () => {
    setIsSubmitting(true);

    try {
      const orderKey = JSON.stringify([
        items.map((i) => [i.product.id, i.quantity, i.variantName || '']),
        shippingCost,
        selectedChannel.id,
        name.trim(),
        phone.trim(),
        postalCode,
      ]);
      const order =
        pendingGatewayOrderRef.current?.key === orderKey
          ? pendingGatewayOrderRef.current.order
          : await createOrderRecord(`Duitku (${selectedChannel.name})`);
      pendingGatewayOrderRef.current = { key: orderKey, order };
      const orderId = `${order.orderNumber}-${Date.now().toString(36)}`;

      await duitkuService.payWithDuitku(
        {
          orderId,
          grossAmount: order.grandTotal,
          customerName: name.trim(),
          customerEmail: 'customer@example.com',
          customerPhone: phone.trim(),
          paymentMethod: selectedChannel.id,
          productDetails: `Pesanan ${items.length} item - ${store.name}`,
          // Harga dari database; ongkir ikut agar jumlah rincian = total tagihan.
          items: [
            ...order.items.map((it) => ({
              id: it.productId,
              name: it.productName,
              price: it.price,
              quantity: it.quantity,
            })),
            ...(order.shippingCost > 0
              ? [{ id: 'shipping-charge', name: 'Ongkos Kirim', price: order.shippingCost, quantity: 1 }]
              : []),
          ],
        },
        {
          onSuccess: async () => {
            const paid = await orderService.confirmGatewayPayment(order, orderId);
            showCompletedOrder(paid ? { ...order, paymentStatus: 'Sudah Dibayar', shippingStatus: 'Diproses' } : order);
            setIsSubmitting(false);
          },
          onPending: async () => {
            showCompletedOrder(order);
            setIsSubmitting(false);
          },
          onError: (err) => {
            console.error('Duitku payment error:', err);
            setIsSubmitting(false);
            alert('Pembayaran Duitku dibatalkan atau belum selesai. Silakan coba kembali.');
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.warn('Duitku payment pop-up tidak dapat dibuka:', error);
      setIsSubmitting(false);
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Mohon lengkapi formulir nama, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }

    if (isManualMode) {
      // Gateway platform nonaktif: pesanan diproses manual (Transfer/WA/COD)
      const selectedName = selectedChannelId === 'cod' ? 'COD (Bayar di Tempat)' : 'Transfer Bank Manual';
      createOrderRecord(selectedName)
        .then(showCompletedOrder)
        .catch((err) => alert('Gagal membuat pesanan: ' + (err?.message || 'Silakan coba lagi.')));
      return;
    }

    setStep('payment');
    // Launch Duitku
    setTimeout(() => {
      handleLaunchDuitkuPayment();
    }, 150);
  };

  const handleManualFinalizeOrder = async () => {
    setIsSubmitting(true);
    try {
      showCompletedOrder(await createOrderRecord(selectedChannel.name));
    } catch {
      alert('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
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
                {step === 'payment' && 'Sesi Pembayaran Duitku'}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#706866] mb-1">Kota Tujuan *</label>
                    <select
                      value={city}
                      onChange={(e) => {
                        const selectedCity = e.target.value;
                        setCity(selectedCity);
                        if (!selectedCity) {
                          setPostalCode('');
                          return;
                        }
                        const matchCity = INDONESIAN_CITIES.find((c) => c.name === selectedCity);
                        if (matchCity?.postalCode) {
                          setPostalCode(matchCity.postalCode);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs font-medium text-[#241A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition cursor-pointer"
                    >
                      <option value="">-- Pilih Kota Tujuan --</option>
                      {INDONESIAN_CITIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.province})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#706866] mb-1">Kode Pos Tujuan *</label>
                    <input
                      type="text"
                      maxLength={5}
                      required
                      placeholder="12730"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs font-mono font-bold text-[#241A1A] bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#706866] mb-1">Alamat Lengkap *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Nama Jalan No. XX, RT/RW, Kelurahan, Patokan..."
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

              {/* PAYMENT CHANNELS SELECTOR */}
              <div className="space-y-2.5 pt-3 border-t border-[#E5E0DD]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#241A1A] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#66000E]" />
                      <span>{isManualMode ? 'Metode Pembayaran (Manual)' : 'Metode Pembayaran (Duitku)'}</span>
                    </h4>
                    <p className="text-[10px] text-[#706866]">
                      {isManualMode ? 'Pembayaran via Transfer Bank, WA, atau COD' : `${activeChannels.length} metode pembayaran otomatis aktif`}
                    </p>
                  </div>
                  {isManualMode ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Metode Manual
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Cek Otomatis 24 Jam</span>
                    </span>
                  )}
                </div>

                {isManualMode ? (
                  <div className="space-y-2">
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-900 leading-snug">
                      Pembayaran online sedang tidak aktif. Pesanan Anda disimpan langsung ke sistem toko, lalu selesaikan pembayaran secara manual.
                    </div>
                    {manualOptions.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedChannelId(m.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          selectedChannelId === m.id
                            ? 'border-[#66000E] bg-[#F5E8EA]/40 shadow-2xs font-bold'
                            : 'border-[#E5E0DD] bg-white hover:bg-[#FAF7F7]'
                        }`}
                      >
                        <div>
                          <div className="text-xs text-[#241A1A] font-bold">{m.title}</div>
                          <div className="text-[10px] text-[#706866] font-normal">{m.desc}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedChannelId === m.id ? 'border-[#66000E] bg-[#66000E]' : 'border-gray-300'}`}>
                          {selectedChannelId === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
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
                                <span
                                  className="px-2 py-1 rounded-md text-[10px] font-black text-white shrink-0 tracking-wider"
                                  style={{ backgroundColor: channel.color }}
                                >
                                  {channel.iconCode}
                                </span>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-[#241A1A] truncate">
                                      {getLocalizedChannelName(channel.id, channel.name, language)}
                                    </span>
                                    {channel.badge && (
                                      <span className="text-[9px] font-bold bg-[#FAF7F7] text-[#66000E] px-1.5 py-0.2 rounded border border-[#E6DDDA]">
                                        {channel.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#706866] truncate block">
                                    {getLocalizedChannelDescription(channel.id, channel.description, language)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected
                                      ? 'border-[#66000E] bg-[#66000E]'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
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

              {/* Duitku Payment Container */}
              <div className="bg-white rounded-2xl p-4 border border-[#E5E0DD] shadow-2xs text-center space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#FAF7F7] text-[11px] text-[#706866]">
                  <span className="flex items-center gap-1.5 font-bold text-[#241A1A]">
                    <ShieldCheck className="w-4 h-4 text-[#66000E]" />
                    <span>Duitku Payment Gateway</span>
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
                          `DUITKU_QRIS_${selectedChannel.id}_${Date.now()}_${grandTotal}`
                        )}&color=66000E`}
                        alt="QRIS Duitku"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-[#A8A09E]">
                      NMID: ID10200392019 • PT DUITKU TRANS INDONESIA (Toko: {store.name})
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
                      Lanjutkan pembayaran pada jendela popup resmi Duitku POP. Sistem akan memverifikasi transaksi secara real-time dan memperbarui status pesanan Anda.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleLaunchDuitkuPayment}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#002A45] hover:bg-[#001D30] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Buka Jendela Duitku POP</span>
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
                {isCompletedPaid ? (
                  <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Lunas Otomatis via Duitku</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{isCompletedCod ? 'Bayar Saat Barang Tiba' : 'Menunggu Pembayaran'}</span>
                  </div>
                )}
                <h4 className="font-extrabold text-lg text-[#241A1A]">Pesanan Berhasil Dibuat!</h4>
                <p className="text-xs text-[#706866] mt-1">
                  {isCompletedPaid ? (
                    <>Terima kasih, pembayaran telah diterima dan pesanan telah diteruskan ke toko <strong>{store.name}</strong>.</>
                  ) : isCompletedCod ? (
                    <>Pesanan telah diteruskan ke toko <strong>{store.name}</strong>. Siapkan uang pas saat pesanan tiba.</>
                  ) : (
                    <>Pesanan telah diteruskan ke toko <strong>{store.name}</strong>. Selesaikan pembayaran lalu kirim bukti bayar ke penjual.</>
                  )}
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
                  {isCompletedPaid ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Lunas ({completedOrder.paymentMethod})</span>
                    </span>
                  ) : (
                    <span className="text-amber-800 font-bold text-right">{completedOrder.paymentMethod}</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-[#241A1A]">Total Pembayaran:</span>
                  <span className="font-black text-base text-[#66000E]">
                    {formatRupiah(completedOrder.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Instruksi bayar manual: rekening / QRIS toko + kirim bukti via WhatsApp */}
              {!isCompletedPaid && !isCompletedCod && (
                <div className="p-4 rounded-2xl bg-white border border-[#E5E0DD] text-left space-y-3 text-xs">
                  <p className="font-bold text-[#241A1A] flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#66000E]" /> Cara Pembayaran
                  </p>
                  {payConfig?.manualBankAccountNumber ? (
                    <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] space-y-0.5">
                      <div className="text-[10px] text-[#706866]">{payConfig.manualBankName || 'Rekening Toko'}</div>
                      <div className="font-mono font-black text-sm text-[#241A1A] break-all">{payConfig.manualBankAccountNumber}</div>
                      <div className="text-[11px] text-[#241A1A]">a.n. {payConfig.manualBankAccountHolder || store.name}</div>
                    </div>
                  ) : null}
                  {payConfig?.manualQrisImageUrl ? (
                    <a
                      href={payConfig.manualQrisImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-fit mx-auto p-2 bg-white rounded-xl border border-[#E5E0DD]"
                      title="Buka QRIS ukuran penuh"
                    >
                      <img src={payConfig.manualQrisImageUrl} alt="QRIS toko" className="w-44 h-44 object-contain" />
                    </a>
                  ) : null}
                  {!payConfig?.manualBankAccountNumber && !payConfig?.manualQrisImageUrl && (
                    <p className="text-[11px] text-[#706866]">Hubungi penjual lewat WhatsApp untuk mendapatkan nomor rekening pembayaran.</p>
                  )}
                  {payConfig?.manualInstructions && (
                    <p className="text-[11px] text-[#706866] whitespace-pre-line">{payConfig.manualInstructions}</p>
                  )}
                  <p className="text-[11px] text-[#241A1A]">
                    Bayar tepat <strong>{formatRupiah(completedOrder.grandTotal)}</strong>, lalu kirim bukti bayar ke penjual.
                  </p>
                  {store.phoneWhatsApp && (
                    <a
                      href={generateWhatsAppLink(
                        store.phoneWhatsApp,
                        `Halo ${store.name}, saya sudah membayar pesanan ${completedOrder.orderNumber} sebesar ${formatRupiah(completedOrder.grandTotal)}. Berikut bukti pembayarannya.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Kirim Bukti Bayar via WhatsApp</span>
                    </a>
                  )}
                </div>
              )}

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
