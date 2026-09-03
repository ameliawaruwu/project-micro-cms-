import React, { useState } from 'react';
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
} from 'lucide-react';
import { CartItem, Store, CourierType, PaymentMethod, Order } from '../../types';
import { formatRupiah, generateWhatsAppLink } from '../../utils/formatters';
import { orderService } from '../../services/orderService';
import { cartService } from '../../services/cartService';

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
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');
  const [courier, setCourier] = useState<CourierType>('J&T');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartService.getTotal(items);
  const shippingCost = items.length > 0 ? (courier === 'GoSend' ? 25000 : 15000) : 0;
  const grandTotal = subtotal + shippingCost;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      alert('Mohon lengkapi formulir nama, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }

    setIsSubmitting(true);

    try {
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
        paymentMethod,
        paymentStatus: 'Sudah Dibayar',
        courier,
        courierService: courier === 'GoSend' ? 'Instant Delivery' : 'Reguler (1-2 Hari)',
        shippingStatus: 'Baru',
        notes: notes.trim() || undefined,
      });

      cartService.clearCart(store.slug);
      setCompletedOrder(newOrder);
      setStep('success');
      onOrderSuccess(newOrder);
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    if (!completedOrder) return;
    const itemsList = completedOrder.items
      .map((i) => `• ${i.productName} (x${i.quantity}) - ${formatRupiah(i.subtotal)}`)
      .join('\n');

    const message = `Halo Toko *${store.name}*! 👋\n\nSaya ingin konfirmasi pesanan baru:\n*No. Pesanan:* ${completedOrder.orderNumber}\n*Nama Pemesan:* ${completedOrder.customerName}\n*No. HP:* ${completedOrder.customerPhone}\n*Alamat Kirim:* ${completedOrder.customerAddress}, ${completedOrder.customerCity}\n\n*Rincian Produk:*\n${itemsList}\n\n*Ongkir (${completedOrder.courier}):* ${formatRupiah(completedOrder.shippingCost)}\n*Total Pembayaran:* *${formatRupiah(completedOrder.grandTotal)}*\n*Metode Bayar:* ${completedOrder.paymentMethod}\n\nMohon segera diproses ya. Terima kasih! 🙏`;

    const waLink = generateWhatsAppLink(store.phoneWhatsApp, message);
    window.open(waLink, '_blank');
  };

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF1F0] flex items-center justify-center text-[#9A0602]">
              <ShoppingBag className="w-5 h-5 text-[#9A0602]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#1F1F1F]">
                {step === 'cart' && 'Keranjang Belanja'}
                {step === 'checkout' && 'Rincian Pengiriman'}
                {step === 'success' && 'Pesanan Berhasil! 🎉'}
              </h3>
              <p className="text-xs text-[#777777]">
                {items.length} item • Toko {store.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#777777] mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-[#1F1F1F] text-sm">Keranjangmu masih kosong</h4>
                  <p className="text-xs text-[#777777] mt-1 max-w-xs">
                    Yuk pilih produk pilihan di etalase toko dan tambahkan ke keranjang!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-[#9A0602] text-white font-semibold text-xs hover:bg-[#7D0502] transition shadow-xs cursor-pointer"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#EAEAEA] shadow-xs flex items-center gap-3.5"
                    >
                      <div className="w-16 h-16 rounded-xl bg-[#F7F7F7] overflow-hidden shrink-0 border border-[#EAEAEA]">
                        <img
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=200'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-[#1F1F1F] leading-snug line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs font-bold text-[#1F1F1F] mt-1">
                          {formatRupiah(item.product.price)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-[#F7F7F7] rounded-lg p-0.5 border border-[#EAEAEA]">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-white text-[#1F1F1F] font-bold flex items-center justify-center text-xs active:scale-95 transition cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold text-[#1F1F1F] font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-white text-[#1F1F1F] font-bold flex items-center justify-center text-xs active:scale-95 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-[#777777] hover:text-[#9A0602] p-1.5 transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FEFEFE] border border-[#EAEAEA] space-y-3">
                <h4 className="font-bold text-xs text-[#1F1F1F] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#9A0602]" />
                  <span>Data Pembeli</span>
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Nama Lengkap <span className="text-[#9A0602]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Siti Rahmawati"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] bg-white text-xs font-medium text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Nomor WhatsApp <span className="text-[#9A0602]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAEAEA] bg-white text-xs font-medium text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FEFEFE] border border-[#EAEAEA] space-y-3">
                <h4 className="font-bold text-xs text-[#1F1F1F] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#9A0602]" />
                  <span>Alamat Pengiriman</span>
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-[#555555] mb-1">
                    Alamat Lengkap (Jalan, RT/RW, No. Rumah) <span className="text-[#9A0602]">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jl. Mawar No. 12, Kel. Menteng..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs font-medium text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">Kota / Kab</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs font-medium text-[#1F1F1F]"
                    >
                      <option value="Jakarta Selatan">Jakarta Selatan</option>
                      <option value="Jakarta Pusat">Jakarta Pusat</option>
                      <option value="Bandung">Bandung</option>
                      <option value="Surabaya">Surabaya</option>
                      <option value="Pekalongan">Pekalongan</option>
                      <option value="Yogyakarta">Yogyakarta</option>
                      <option value="Semarang">Semarang</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#555555] mb-1">Pilihan Kurir</label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value as CourierType)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs font-medium text-[#1F1F1F]"
                    >
                      <option value="J&T">J&T Express (Rp 15.000)</option>
                      <option value="JNE">JNE Reguler (Rp 15.000)</option>
                      <option value="SiCepat">SiCepat HALU (Rp 15.000)</option>
                      <option value="GoSend">GoSend Instant (Rp 25.000)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FEFEFE] border border-[#EAEAEA] space-y-3">
                <h4 className="font-bold text-xs text-[#1F1F1F] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#9A0602]" />
                  <span>Metode Pembayaran</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('QRIS')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      paymentMethod === 'QRIS'
                        ? 'border-[#9A0602] bg-[#FFF1F0] text-[#9A0602] ring-1 ring-[#9A0602]'
                        : 'border-[#EAEAEA] bg-white hover:border-[#D5D5D5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">QRIS Instant</span>
                      <QrCode className="w-4 h-4 text-[#777777]" />
                    </div>
                    <span className="text-[10px] text-[#777777] mt-2">Semua E-Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('BCA_VA')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      paymentMethod === 'BCA_VA'
                        ? 'border-[#9A0602] bg-[#FFF1F0] text-[#9A0602] ring-1 ring-[#9A0602]'
                        : 'border-[#EAEAEA] bg-white hover:border-[#D5D5D5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">BCA VA</span>
                      <CreditCard className="w-4 h-4 text-[#777777]" />
                    </div>
                    <span className="text-[10px] text-[#777777] mt-2">Otomatis Terverifikasi</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'success' && completedOrder && (
            <div className="py-6 flex flex-col items-center text-center space-y-4 font-sans">
              <div className="w-16 h-16 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center justify-center shadow-xs">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#1F1F1F]">Pesanan Berhasil Dibuat!</h4>
                <p className="text-xs text-[#777777] mt-1">
                  Nomor Pesanan:{' '}
                  <span className="font-mono font-bold text-[#1F1F1F]">{completedOrder.orderNumber}</span>
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="w-full bg-[#F7F7F7] rounded-2xl p-4 border border-[#EAEAEA] text-left space-y-2 text-xs">
                <div className="flex justify-between text-[#555555]">
                  <span>Penerima</span>
                  <span className="font-semibold text-[#1F1F1F]">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between text-[#555555]">
                  <span>Kurir Pengiriman</span>
                  <span className="font-semibold text-[#1F1F1F]">{completedOrder.courier} (Reguler)</span>
                </div>
                <div className="flex justify-between text-[#555555]">
                  <span>Metode Pembayaran</span>
                  <span className="font-semibold text-[#9A0602]">{completedOrder.paymentMethod}</span>
                </div>
                <div className="pt-2 border-t border-[#EAEAEA] flex justify-between font-bold text-sm text-[#1F1F1F]">
                  <span>Total Tagihan</span>
                  <span>{formatRupiah(completedOrder.grandTotal)}</span>
                </div>
              </div>

              <div className="w-full pt-2 space-y-2.5">
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full py-3.5 px-4 min-h-[44px] rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Kirim Konfirmasi ke WhatsApp Toko</span>
                </button>
                <button
                  onClick={() => {
                    setStep('cart');
                    onClose();
                  }}
                  className="w-full py-3 px-4 min-h-[44px] rounded-xl border border-[#EAEAEA] text-[#1F1F1F] font-semibold text-xs hover:bg-[#F7F7F7] transition cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions for cart & checkout */}
        {step !== 'success' && items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EAEAEA] bg-white shrink-0 space-y-3 font-sans">
            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-[#555555]">
              <div className="flex justify-between">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-[#1F1F1F]">{formatRupiah(subtotal)}</span>
              </div>
              {step === 'checkout' && (
                <div className="flex justify-between">
                  <span>Ongkos Kirim ({courier})</span>
                  <span className="font-semibold text-[#1F1F1F]">{formatRupiah(shippingCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#1F1F1F] pt-1.5 border-t border-[#EAEAEA]">
                <span>Total Bayar</span>
                <span>{formatRupiah(step === 'checkout' ? grandTotal : subtotal)}</span>
              </div>
            </div>

            {/* Main Action CTA */}
            {step === 'cart' ? (
              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 px-4 min-h-[44px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Pengiriman</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 min-h-[44px] rounded-xl border border-[#EAEAEA] text-[#1F1F1F] font-semibold text-xs hover:bg-[#F7F7F7] transition cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  form="checkout-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-4 min-h-[44px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Memproses Pesanan...' : 'Bayar Sekarang'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
