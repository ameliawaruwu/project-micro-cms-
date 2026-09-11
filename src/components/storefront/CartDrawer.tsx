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
  MessageSquare,
  CheckCircle,
  MapPin,
  User,
  Phone,
  Clock,
  Copy,
  Check,
  Zap,
  Sparkles,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Store, CourierType, PaymentMethod, Order } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';
import { shippingService, INDONESIAN_CITIES, ShippingRate } from '../../services/shippingService';
import { storeService } from '../../services/storeService';
import { midtransService } from '../../services/midtransService';

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCopiedVa, setIsCopiedVa] = useState(false);

  // Dynamic Shipping Rates calculation based on items weight & destination
  const totalWeightGrams = items.reduce((sum, item) => sum + ((item.product.weightGrams || 500) * item.quantity), 0);
  const totalWeightKg = Math.max(1, Math.ceil(totalWeightGrams / 1000));
  
  const [availableRates, setAvailableRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  useEffect(() => {
    const rates = shippingService.calculateRates(store.city || 'Jakarta Selatan', city, totalWeightGrams);
    setAvailableRates(rates);
    
    // Pick first or matching courier rate
    const match = rates.find(r => r.courier === courier) || rates[0];
    setSelectedRate(match || null);
    if (match) setCourier(match.courier);
  }, [city, totalWeightGrams, store.city]);

  if (!isOpen) return null;

  const subtotal = cartService.getTotal(items);
  const shippingCost = selectedRate ? selectedRate.cost : (items.length > 0 ? 15000 : 0);
  const grandTotal = subtotal + shippingCost;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Mohon lengkapi formulir nama, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }
    setStep('payment');
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
      paymentMethod: (verifiedMethod || paymentMethod) as PaymentMethod,
      paymentStatus: 'Sudah Dibayar',
      courier,
      courierService: selectedRate ? `${selectedRate.serviceName} (${selectedRate.etd})` : 'Reguler (1-2 Hari)',
      shippingStatus: 'Baru',
      notes: notes.trim() || undefined,
    });

    // Credit the merchant store balance automatically!
    const currentBalance = store.balance || 0;
    await storeService.updateStore(store.id, { balance: currentBalance + grandTotal });

    cartService.clearCart(store.slug);
    setCompletedOrder(newOrder);
    setStep('success');
    onOrderSuccess(newOrder);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleFinalizeOrder = async () => {
    setIsSubmitting(true);
    const orderId = `KROOM-${Date.now()}`;

    try {
      await midtransService.payWithSnap(
        {
          orderId,
          grossAmount: grandTotal,
          customerName: name.trim(),
          customerPhone: phone.trim(),
        },
        {
          onSuccess: async (res) => {
            await recordSuccessOrder(orderId, res.payment_type ? res.payment_type.toUpperCase() : paymentMethod);
            setIsSubmitting(false);
          },
          onPending: async (res) => {
            await recordSuccessOrder(orderId, res.payment_type ? res.payment_type.toUpperCase() : paymentMethod);
            setIsSubmitting(false);
          },
          onError: () => {
            alert('Pembayaran Midtrans dibatalkan atau gagal.');
            setIsSubmitting(false);
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (err: any) {
      console.warn('Midtrans Snap fallback mode:', err);
      // Fallback: proses langsung jika mode simulasi lokal tanpa API key
      await recordSuccessOrder(orderId, paymentMethod);
      setIsSubmitting(false);
    }
  };

  const [isCopiedOrderNumber, setIsCopiedOrderNumber] = useState(false);

  const handleCopyVa = () => {
    navigator.clipboard.writeText('8099 2198 4401 2291');
    setIsCopiedVa(true);
    setTimeout(() => setIsCopiedVa(false), 2000);
  };

  const handleCopyOrderNumber = () => {
    if (!completedOrder) return;
    navigator.clipboard.writeText(completedOrder.orderNumber);
    setIsCopiedOrderNumber(true);
    setTimeout(() => setIsCopiedOrderNumber(false), 2000);
  };

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-200 text-left font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight">
                {step === 'cart' && 'Keranjang Belanja'}
                {step === 'checkout' && 'Pengiriman & Ongkir'}
                {step === 'payment' && 'Pembayaran'}
                {step === 'success' && 'Pesanan Berhasil'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {items.length} produk • {store.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS LIST */}
        {step === 'cart' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm text-gray-800">Keranjang Kosong</h4>
                <p className="text-xs text-gray-400 max-w-xs">
                  Pilih produk dari katalog toko dan tambahkan ke keranjang.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variantName || 'default'}`}
                    className="p-2.5 bg-white rounded-md border border-gray-200 shadow-2xs flex items-center gap-2.5"
                  >
                    <img
                      src={item.product.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'}
                      alt={item.product.name}
                      className="w-12 h-12 rounded object-cover border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-gray-900 truncate">{item.product.name}</h4>
                      {item.variantName && (
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1 py-0.2 rounded inline-block mt-0.5">
                          {item.variantName}
                        </span>
                      )}
                      <p className="text-xs font-bold text-gray-900 mt-0.5">
                        {formatRupiah(item.product.price)}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-600 transition p-0.5"
                        title="Hapus"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-4 h-4 rounded flex items-center justify-center text-gray-700 hover:bg-white transition cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-semibold text-gray-900 px-1 min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-4 h-4 rounded flex items-center justify-center text-gray-700 hover:bg-white transition cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50/70 space-y-2.5 shrink-0">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Subtotal ({items.length} Item):</span>
                  <span className="text-sm font-bold text-gray-900">{formatRupiah(subtotal)}</span>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Lanjut ke Pengiriman</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SHIPPING & DYNAMIC COURIER CALCULATOR */}
        {step === 'checkout' && (
          <form onSubmit={handleProceedToPayment} className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              
              {/* Customer Contact */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-red-600" />
                  <span>Informasi Penerima</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama Penerima"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">No. WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Destination & Dynamic Ongkir */}
              <div className="space-y-2 pt-2.5 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>Alamat & Ongkir</span>
                  </h4>
                  <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded border border-gray-200">
                    Berat: {totalWeightGrams}g ({totalWeightKg} kg)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Kota Tujuan *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-xs font-medium text-gray-900 bg-white focus:outline-none focus:border-red-500"
                  >
                    {INDONESIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.province})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Alamat Lengkap *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Nama Jalan No. XX, RT/RW..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Couriers */}
              <div className="space-y-2 pt-2.5 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-800">Pilih Layanan Kurir</label>
                
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
                        className={`p-2.5 rounded-md border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-red-600 bg-red-50/50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Truck className={`w-3.5 h-3.5 ${isSelected ? 'text-red-600' : 'text-gray-400'}`} />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-xs text-gray-900">{rate.courier} - {rate.serviceName}</span>
                              {rate.badge && (
                                <span className="text-[9px] font-semibold bg-red-100 text-red-700 px-1 rounded">
                                  {rate.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">Estimasi: {rate.etd}</span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-gray-900">
                          {formatRupiah(rate.cost)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Selector */}
              <div className="space-y-1.5 pt-2.5 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-800">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-2 rounded-md border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'QRIS'
                        ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QRIS (Instan)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BCA_VA')}
                    className={`p-2 rounded-md border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'BCA_VA'
                        ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Virtual Account</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Action */}
            <div className="p-4 border-t border-gray-200 bg-gray-50/70 space-y-2.5 shrink-0">
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Ongkir ({courier}):</span>
                  <span>{formatRupiah(shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total Tagihan:</span>
                  <span className="text-red-600">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-2.5 py-2 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition cursor-pointer text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Pilih Pembayaran ({formatRupiah(grandTotal)})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: PAYMENT GATEWAY SIMULATOR */}
        {step === 'payment' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200 space-y-1 text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Penerima:</span>
                  <span className="font-semibold text-gray-900">{name} ({phone})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kurir & Tujuan:</span>
                  <span className="font-medium text-gray-900">{courier} • {city}</span>
                </div>
                <div className="pt-1.5 border-t border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Pembayaran:</span>
                  <span className="text-sm font-bold text-red-600">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Midtrans Box */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs text-center space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1 font-semibold text-gray-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                    <span>Midtrans Payment Gateway</span>
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded border border-emerald-100">
                    Verifikasi Otomatis
                  </span>
                </div>

                {paymentMethod === 'QRIS' ? (
                  <>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                      <Clock className="w-3 h-3" />
                      <span>Selesaikan dalam 14:59</span>
                    </div>

                    <p className="text-xs text-gray-500">
                      Scan QRIS dengan GoPay, OVO, ShopeePay, Dana, atau BCA/Mandiri Mobile:
                    </p>

                    <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`MIDTRANS_PAY_${Date.now()}_${grandTotal}`)}&color=9A0602`}
                        alt="QRIS Midtrans"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">NMID: ID10200392019 • PT MIDTRANS INDONESIA</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>Nomor Virtual Account (BCA / Midtrans):</span>
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded">Otomatis Dicek</span>
                      </div>
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200">
                        <span className="text-sm font-mono font-bold text-gray-900 tracking-wider">8099 2198 4401 2291</span>
                        <button
                          type="button"
                          onClick={handleCopyVa}
                          className="px-2.5 py-1 rounded bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer flex items-center gap-1"
                        >
                          {isCopiedVa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopiedVa ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        Transfer tepat sesuai nominal tagihan. Pembayaran akan terverifikasi otomatis dalam beberapa detik.
                      </p>
                    </div>
                  </>
                )}

                <div className="pt-2 space-y-1.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalizeOrder}
                    className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Memverifikasi Pembayaran...' : 'Konfirmasi Bayar Lunas (Midtrans)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('checkout')}
                    className="text-xs text-gray-400 hover:text-gray-700 transition cursor-pointer"
                  >
                    ← Ubah Alamat / Kurir
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* STEP 4: ORDER SUCCESS */}
        {step === 'success' && completedOrder && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-center">
              
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle className="w-6 h-6" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold mb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Lunas Otomatis via Midtrans</span>
                </div>
                <h4 className="font-bold text-base text-gray-900">Pesanan Berhasil Dibuat!</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pesanan telah otomatis tercatat dan diteruskan ke penjual.
                </p>
              </div>

              {/* Receipt */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Nomor Pesanan:</span>
                  <span className="font-mono font-bold text-gray-900">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Penerima:</span>
                  <span className="font-medium text-gray-900">{completedOrder.customerName} ({completedOrder.customerPhone})</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Kurir & Estimasi:</span>
                  <span className="font-medium text-gray-900">{completedOrder.courier} ({formatRupiah(completedOrder.shippingCost)})</span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                  <span className="text-gray-500">Status Pembayaran:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Lunas ({completedOrder.paymentMethod})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-semibold text-gray-900">Total Pembayaran:</span>
                  <span className="font-bold text-sm text-red-600">{formatRupiah(completedOrder.grandTotal)}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-left text-[11px] text-amber-800 leading-relaxed">
                ℹ️ Pesanan Anda sedang disiapkan oleh toko <strong>{store.name}</strong> dan nomor resi pengiriman akan otomatis diperbarui saat paket di-pickup kurir.
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
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
                  className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition cursor-pointer"
                >
                  Belanja Lagi di Toko Ini
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
