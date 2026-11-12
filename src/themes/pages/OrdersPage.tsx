import React, { useState, useEffect } from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { getDeviceClass } from '../../utils/responsivePreview';

interface OrdersPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  isDetailView?: boolean;
  onNavigate?: (pageId: string) => void;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  themeData,
  themeId: propThemeId,
  store,
  isDetailView,
  onNavigate,
  deviceMode,
}) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const isMobile = deviceMode ? deviceMode === 'mobile' : undefined;
  const isTablet = deviceMode ? deviceMode === 'tablet' : undefined;
  const flexRowHeaderClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });
  const gridCols2Class = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-2',
    fallback: 'grid-cols-1 md:grid-cols-2',
  });
  const gridCols2SmClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-1',
    tablet: 'grid-cols-2',
    desktop: 'grid-cols-2',
    fallback: 'grid-cols-1 sm:grid-cols-2',
  });
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif',
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const list = await orderService.getOrdersByStore(store?.id);
        setOrders(list);
        if (list.length > 0) {
          setSelectedOrder(list[0]);
        }
      } catch (err) {
        console.warn('Failed to load orders in OrdersPage:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();

    const handleNewOrder = () => fetchOrders();
    window.addEventListener('microcms_order_created', handleNewOrder);
    return () => window.removeEventListener('microcms_order_created', handleNewOrder);
  }, [store?.id]);

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find((s) => s.type === 'Header');
  const footerSection = Object.values(sections).find((s) => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderContent = () => {
    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black font-sans">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                STATUS &amp; RIWAYAT PESANAN
              </h1>
              <button
                onClick={() => (onNavigate ? onNavigate('homepage') : null)}
                className="px-4 py-2 bg-black text-white font-black uppercase text-xs hover:bg-yellow-300 hover:text-black border-2 border-black cursor-pointer"
              >
                BELANJA LAGI
              </button>
            </div>

            {isLoading ? (
              <div className="p-8 bg-yellow-300 border-8 border-black font-black uppercase text-center text-lg">
                MEMUAT DATA PESANAN...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 bg-white border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] text-center space-y-4">
                <Package className="w-16 h-16 mx-auto stroke-[2.5]" />
                <h3 className="text-2xl font-black uppercase">BELUM ADA PESANAN AKTIF</h3>
                <p className="text-sm font-bold text-gray-700 uppercase">Silakan buat pesanan pertama Anda dari katalog toko!</p>
                <button
                  onClick={() => (onNavigate ? onNavigate('catalog') : null)}
                  className="px-8 py-3 bg-black text-white font-black uppercase border-4 border-black hover:bg-yellow-300 hover:text-black transition cursor-pointer"
                >
                  JELAJAHI PRODUK
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-yellow-300 p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-6"
                  >
                    <div className={`flex ${flexRowHeaderClass} justify-between items-start md:items-center gap-4 border-b-4 border-black pb-4`}>
                      <div>
                        <div className="flex gap-2 items-center mb-2">
                          <span className="px-3 py-1 bg-black text-white font-black text-xs uppercase">
                            STATUS: {ord.shippingStatus || 'BARU'}
                          </span>
                          <span className="px-3 py-1 bg-white border-2 border-black font-black text-xs uppercase">
                            PEMBAYARAN: {ord.paymentStatus || 'BELUM DIBAYAR'}
                          </span>
                        </div>
                        <h3 className="font-black text-3xl uppercase">NO. PESANAN #{ord.orderNumber}</h3>
                        <p className="font-bold text-xs uppercase text-gray-800">
                          {new Date(ord.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black uppercase block text-gray-700">TOTAL TAGIHAN</span>
                        <p className="font-black text-3xl text-black">Rp {ord.grandTotal.toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className={`grid ${gridCols2Class} gap-4 text-xs font-black uppercase`}>
                      <div className="bg-white p-4 border-4 border-black space-y-1">
                        <p className="text-gray-600">PENERIMA:</p>
                        <p className="text-sm">{ord.customerName} ({ord.customerPhone})</p>
                        <p className="text-gray-700 normal-case font-bold">{ord.customerAddress}, {ord.customerCity}</p>
                      </div>
                      <div className="bg-white p-4 border-4 border-black space-y-1">
                        <p className="text-gray-600">EKSPEDISI &amp; ONGKIR:</p>
                        <p className="text-sm">{ord.courier} ({ord.courierService || 'Reguler'})</p>
                        <p className="text-gray-700 font-bold">BIAYA ONGKIR: Rp {(ord.shippingCost || 0).toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 border-4 border-black space-y-2">
                      <p className="text-xs font-black uppercase text-gray-600">DAFTAR ITEM PESANAN:</p>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-black border-b border-black/20 pb-1">
                          <span>{it.productName} (x{it.quantity})</span>
                          <span>Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 2. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-5xl mx-auto px-6">
            <div className="border-b border-[var(--sf-primary-border)] pb-6 mb-8 flex justify-between items-center">
              <div>
                <span className="text-xs text-[var(--sf-primary)] uppercase tracking-widest">[TRANSACTION_MONITOR]</span>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[var(--sf-primary)] to-[color-mix(in_srgb,var(--sf-primary)_55%,white)] bg-clip-text text-transparent">
                  ORDER STATUS &amp; HISTORY
                </h1>
              </div>
              <button
                onClick={() => (onNavigate ? onNavigate('homepage') : null)}
                className="px-4 py-2 rounded-xl bg-[var(--sf-primary)] border border-[var(--sf-primary-border)] text-[var(--sf-primary)] text-xs hover:bg-[var(--sf-primary-soft)] transition cursor-pointer"
              >
                RETURN_TO_SHOP
              </button>
            </div>

            {isLoading ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-[var(--sf-primary-border)] text-center text-[var(--sf-primary)]">
                LOADING_RECORDS...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/60 border border-[var(--sf-primary-border)] text-center space-y-4">
                <Package className="w-12 h-12 text-[var(--sf-primary)] mx-auto" />
                <h3 className="text-lg font-bold text-slate-200">NO_ORDERS_DETECTED</h3>
                <p className="text-xs text-slate-400">Your manifest log is currently empty.</p>
                <button
                  onClick={() => (onNavigate ? onNavigate('catalog') : null)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--sf-primary)] to-[color-mix(in_srgb,var(--sf-primary)_55%,white)] text-white font-bold text-xs"
                >
                  DISCOVER_PRODUCTS
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-900/60 border border-[var(--sf-primary-border)] rounded-2xl p-6 backdrop-blur-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded bg-[var(--sf-primary-soft)] text-[var(--sf-primary)] border border-[var(--sf-primary-border)] text-xs">
                            [{ord.shippingStatus || 'NEW'}]
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">ORDER_ID: #{ord.orderNumber}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">TOTAL</span>
                        <p className="font-bold text-xl text-[var(--sf-primary)]">Rp {ord.grandTotal.toLocaleString('id-ID')}</p>
                      </div>
                    </div>

                    <div className={`grid ${gridCols2SmClass} gap-3 text-xs text-slate-300`}>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <p className="text-slate-500">RECIPIENT:</p>
                        <p className="font-bold text-white mt-0.5">{ord.customerName} ({ord.customerPhone})</p>
                        <p className="text-slate-400 mt-0.5">{ord.customerAddress}, {ord.customerCity}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <p className="text-slate-500">LOGISTICS:</p>
                        <p className="font-bold text-white mt-0.5">{ord.courier} ({ord.courierService || 'Regular'})</p>
                        <p className="text-slate-400 mt-0.5">COST: Rp {(ord.shippingCost || 0).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 3. DEFAULT / MINIMALIST / NATURE / CUTE / LUXURY / EDITORIAL
    return (
      <div className="pt-24 pb-28 bg-[var(--sf-page)] text-[var(--sf-text)] min-h-screen font-sans antialiased">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--sf-border)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button
                  onClick={() => (onNavigate ? onNavigate('homepage') : null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--sf-muted)] hover:text-[var(--sf-text)] transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Toko</span>
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--sf-text)] tracking-tight">Status &amp; Riwayat Pesanan</h1>
              <p className="text-xs text-[var(--sf-muted)] mt-0.5">Pantau status pesanan dan rincian pengiriman Anda secara real-time</p>
            </div>

            <button
              onClick={() => (onNavigate ? onNavigate('catalog') : null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--sf-radius)] bg-[var(--sf-primary)] hover:bg-[var(--sf-primary)] text-white text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Belanja Lagi</span>
            </button>
          </div>

          {isLoading ? (
            <div className="p-12 rounded-[var(--sf-radius)] bg-[var(--sf-card)] border border-[var(--sf-border)] text-center text-sm text-[var(--sf-muted)]">
              Memuat data pesanan Anda...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 rounded-[var(--sf-radius)] bg-[var(--sf-card)] border border-[var(--sf-border)] shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--sf-subtle)] flex items-center justify-center mx-auto text-[var(--sf-muted)]">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[var(--sf-text)]">Belum Ada Pesanan</h3>
                <p className="text-xs text-[var(--sf-muted)] max-w-sm mx-auto">
                  Anda belum memiliki riwayat pesanan di toko ini. Mulai belanja sekarang untuk melihat status pesanan Anda.
                </p>
              </div>
              <button
                onClick={() => (onNavigate ? onNavigate('catalog') : null)}
                className="px-6 py-2.5 rounded-[var(--sf-radius)] bg-[var(--sf-primary)] hover:bg-[var(--sf-primary)] text-white font-bold text-xs transition cursor-pointer"
              >
                Mulai Belanja Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((ord) => {
                const statusColor =
                  ord.shippingStatus === 'Selesai'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : ord.shippingStatus === 'Dikirim'
                    ? 'bg-[var(--sf-primary-soft)] text-[var(--sf-primary)] border-[var(--sf-primary-border)]'
                    : ord.shippingStatus === 'Diproses'
                    ? 'bg-[var(--sf-primary-soft)] text-[var(--sf-primary)] border-[var(--sf-primary-border)]'
                    : 'bg-amber-50 text-amber-800 border-amber-200';

                return (
                  <div
                    key={ord.id}
                    className="bg-[var(--sf-card)] rounded-[var(--sf-radius)] border border-[var(--sf-border)] shadow-xs p-6 sm:p-7 space-y-6"
                  >
                    {/* Top Row: Order Number, Date, Status */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[var(--sf-border)]">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-base text-[var(--sf-text)]">#{ord.orderNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${statusColor}`}>
                            {ord.shippingStatus === 'Baru' ? 'Pesanan Baru' : ord.shippingStatus || 'Diproses'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--sf-subtle)] text-[var(--sf-text-soft)] text-[11px] font-semibold">
                            {ord.paymentStatus || 'Sudah Dibayar'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--sf-muted)]">
                          Dipesan pada {new Date(ord.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-xs text-[var(--sf-muted)] block">Total Pembayaran</span>
                        <span className="text-lg font-extrabold text-[var(--sf-text)]">
                          Rp {ord.grandTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Progress Stepper Timeline */}
                    <div className="p-4 bg-[var(--sf-subtle)] rounded-[var(--sf-radius)] border border-[var(--sf-border)]">
                      <p className="text-xs font-bold text-[var(--sf-text-soft)] mb-3 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[var(--sf-text)]" />
                        <span>Tracking Status Pengiriman</span>
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                        <div className="space-y-1">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold text-[10px]">
                            ✔
                          </div>
                          <p className="font-bold text-[var(--sf-text)]">Diterima</p>
                          <p className="text-[10px] text-[var(--sf-muted)]">Tersimpan</p>
                        </div>
                        <div className="space-y-1">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold text-[10px]">
                            ✔
                          </div>
                          <p className="font-bold text-[var(--sf-text)]">Pembayaran</p>
                          <p className="text-[10px] text-[var(--sf-muted)]">{ord.paymentMethod || 'Terverifikasi'}</p>
                        </div>
                        <div className="space-y-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto font-bold text-[10px] ${ord.shippingStatus === 'Diproses' || ord.shippingStatus === 'Dikirim' || ord.shippingStatus === 'Selesai' ? 'bg-emerald-600 text-white' : 'bg-[var(--sf-border)] text-[var(--sf-muted)]'}`}>
                            3
                          </div>
                          <p className="font-semibold text-[var(--sf-text-soft)]">Dikemas</p>
                          <p className="text-[10px] text-[var(--sf-muted)]">Gudang Toko</p>
                        </div>
                        <div className="space-y-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto font-bold text-[10px] ${ord.shippingStatus === 'Dikirim' || ord.shippingStatus === 'Selesai' ? 'bg-emerald-600 text-white' : 'bg-[var(--sf-border)] text-[var(--sf-muted)]'}`}>
                            4
                          </div>
                          <p className="font-semibold text-[var(--sf-text-soft)]">Pengiriman</p>
                          <p className="text-[10px] text-[var(--sf-muted)]">{ord.courier || 'Kurir'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery & Items Details */}
                    <div className={`grid ${gridCols2Class} gap-4 text-xs`}>
                      <div className="p-4 rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-card)] space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--sf-text)]">
                          <MapPin className="w-3.5 h-3.5 text-[var(--sf-text-soft)]" />
                          <span>Alamat Penerima</span>
                        </div>
                        <p className="font-semibold text-[var(--sf-text)]">{ord.customerName} ({ord.customerPhone})</p>
                        <p className="text-[var(--sf-text-soft)] leading-relaxed">
                          {ord.customerAddress}, {ord.customerCity} {ord.customerPostalCode ? `(${ord.customerPostalCode})` : ''}
                        </p>
                      </div>

                      <div className="p-4 rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-card)] space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--sf-text)]">
                          <Truck className="w-3.5 h-3.5 text-[var(--sf-text-soft)]" />
                          <span>Kurir &amp; Pengiriman</span>
                        </div>
                        <p className="font-semibold text-[var(--sf-text)]">{ord.courier} — {ord.courierService || 'Reguler'}</p>
                        <p className="text-[var(--sf-text-soft)]">Ongkir: Rp {(ord.shippingCost || 0).toLocaleString('id-ID')}</p>
                        {ord.resiNumber && (
                          <p className="text-emerald-700 font-semibold">Resi: {ord.resiNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Ordered Items */}
                    <div className="pt-2 border-t border-[var(--sf-border)] space-y-3">
                      <p className="text-xs font-bold text-[var(--sf-text-soft)]">Item Produk yang Dipesan ({ord.items.length})</p>
                      <div className="space-y-2">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-[var(--sf-text-soft)] py-1">
                            <span className="font-medium">{it.productName} × {it.quantity}</span>
                            <span className="font-bold text-[var(--sf-text)]">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--sf-page)] text-[var(--sf-text)]">
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

