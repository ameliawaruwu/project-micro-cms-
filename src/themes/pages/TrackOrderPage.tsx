import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Loader2,
  MessageCircle,
  Package,
  Search,
  Truck,
  XCircle,
} from 'lucide-react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { useStoreChromeOptions } from './storeChrome';
import { whatsAppChatLink } from '../sectionContent';
import { orderService, TrackedOrder } from '../../services/orderService';
import { formatDateIndo, formatRupiah, generateTrackingLink } from '../../utils/formatters';
import { isCodMethod } from '../../utils/orderFlow';
import { isManualTransferMethod } from '../../utils/manualPayment';
import { ManualPaymentDetails } from './ManualPaymentDetails';
import { PaymentProofUpload } from './PaymentProofUpload';
import type { Order, StorePaymentConfig } from '../../types';

interface TrackOrderPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  onNavigate?: (pageId: string) => void;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

const NOT_FOUND_MESSAGES: Record<'not_found' | 'locked' | 'invalid', string> = {
  not_found: 'Pesanan tidak ditemukan. Periksa kembali nomor pesanan dan nomor WhatsApp yang dipakai saat checkout.',
  locked: 'Terlalu banyak percobaan untuk nomor pesanan ini. Silakan coba lagi dalam 1 jam.',
  invalid: 'Isi nomor pesanan (contoh: KB-1A2B3C4D5E) dan nomor WhatsApp yang valid.',
};

type StepState = 'done' | 'current' | 'upcoming';

interface TrackStep {
  key: string;
  label: string;
  detail?: string;
  state: StepState;
}

/** Langkah status pesanan dari sudut pandang pembeli. */
function buildSteps(order: TrackedOrder): TrackStep[] {
  const isCod = isCodMethod(order.paymentMethod);
  const progress = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 }[order.orderStatus];
  const stateFor = (doneWhen: boolean, currentWhen: boolean): StepState =>
    doneWhen ? 'done' : currentWhen ? 'current' : 'upcoming';

  // Langkah kedua: COD menunggu konfirmasi penjual; metode lain menunggu pembayaran dicek penjual.
  let secondStep: TrackStep;
  if (isCod) {
    const confirmed = progress >= 1;
    secondStep = {
      key: 'confirmed',
      label: 'Dikonfirmasi Penjual',
      detail: order.isPaid ? 'Lunas' : confirmed ? 'Bayar tunai saat paket tiba (COD)' : 'Menunggu konfirmasi penjual',
      state: stateFor(confirmed, !confirmed),
    };
  } else {
    let detail = 'Menunggu pembayaran';
    if (order.isPaid) detail = order.paidAt ? `Lunas · ${formatDateIndo(order.paidAt)}` : 'Lunas';
    else if (order.paymentConfirmedAt) detail = 'Bukti bayar dikirim, menunggu dicek penjual';
    secondStep = { key: 'payment', label: 'Pembayaran', detail, state: stateFor(order.isPaid, !order.isPaid) };
  }
  const readyToPack = secondStep.state === 'done';

  return [
    { key: 'created', label: 'Pesanan Dibuat', detail: formatDateIndo(order.createdAt), state: 'done' },
    secondStep,
    { key: 'processing', label: 'Dikemas Penjual', state: stateFor(progress >= 2, readyToPack && progress <= 1) },
    {
      key: 'shipped',
      label: 'Dikirim',
      detail: order.shippedAt ? formatDateIndo(order.shippedAt) : undefined,
      state: stateFor(progress >= 3, progress === 2),
    },
    { key: 'delivered', label: 'Pesanan Selesai', state: stateFor(progress >= 3, false) },
  ];
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  themeData,
  themeId: propThemeId,
  store,
  onNavigate,
}) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif',
  };
  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find((s) => s.type === 'Header');
  const footerSection = Object.values(sections).find((s) => s.type === 'Footer');
  const { navbarOptions, footerOptions, isStickyHeader } = useStoreChromeOptions({}, {});
  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const storeId: string = store?.id || '';
  const [orderNumber, setOrderNumber] = useState(
    () => new URLSearchParams(window.location.search).get('no')?.slice(0, 32) || '',
  );
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tracked, setTracked] = useState<TrackedOrder | null>(null);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);

  /** Salinan lokal pesanan yang dibuat dari perangkat ini (berisi id untuk konfirmasi bayar). */
  const findLocalOrder = (number: string): Order | undefined =>
    orderService.getLocalOrders(storeId).find((o) => o.orderNumber === number);

  const runTrack = async (number: string, phoneNumber: string) => {
    if (!storeId) return;
    setIsLoading(true);
    setErrorMessage('');
    setTracked(null);
    try {
      const result = await orderService.trackOrder(storeId, number, phoneNumber);
      if (result.status === 'found') {
        setTracked(result.order);
        setLocalOrders(orderService.getLocalOrders(storeId).slice(0, 5));
      } else {
        setErrorMessage(NOT_FOUND_MESSAGES[result.status]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal memuat status pesanan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runTrack(orderNumber.trim(), phone.trim());
  };

  const handlePickLocal = (order: Order) => {
    setOrderNumber(order.orderNumber);
    setPhone(order.customerPhone || '');
    runTrack(order.orderNumber, order.customerPhone || '');
  };

  // Dibuka dari tautan ?no= (mis. halaman checkout yang di-refresh): bila pesanan itu dibuat
  // dari perangkat ini, langsung tampilkan statusnya tanpa perlu mengetik nomor WhatsApp.
  useEffect(() => {
    setLocalOrders(orderService.getLocalOrders(storeId).slice(0, 5));
    const linked = orderNumber.trim() ? findLocalOrder(orderNumber.trim()) : undefined;
    if (linked?.customerPhone) handlePickLocal(linked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const handleProofSubmitted = (orderNumberSent: string, paymentConfirmedAt: string) => {
    setTracked((current) =>
      current?.orderNumber === orderNumberSent ? { ...current, paymentConfirmedAt } : current,
    );
  };

  const sellerChatLink = useMemo(() => {
    const base = whatsAppChatLink(store?.phoneWhatsApp);
    if (!base) return null;
    const subject = tracked?.orderNumber || orderNumber.trim();
    const message = subject
      ? `Halo ${store?.name || 'kak'}, saya ingin menanyakan pesanan ${subject}.`
      : `Halo ${store?.name || 'kak'}, saya ingin menanyakan pesanan saya.`;
    return `${base}?text=${encodeURIComponent(message)}`;
  }, [store?.phoneWhatsApp, store?.name, tracked?.orderNumber, orderNumber]);

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-page)] text-sm text-[var(--sf-text)] placeholder:text-[var(--sf-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)]/30';
  const cardClass = 'rounded-[var(--sf-radius)] border border-[var(--sf-border)] bg-[var(--sf-subtle)] p-5';

  /** Instruksi bayar & unggah bukti transfer untuk pesanan QRIS/transfer yang belum lunas. */
  const renderPaymentAction = (order: TrackedOrder) => {
    if (order.isPaid || !isManualTransferMethod(order.paymentMethod)) return null;

    if (order.paymentConfirmedAt) {
      return (
        <div className="p-4 rounded-[var(--sf-radius)] bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-emerald-900">Bukti pembayaran terkirim</p>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Penjual akan memeriksa pembayaran Anda. Pesanan diproses setelah pembayaran dinyatakan lunas.
            </p>
          </div>
        </div>
      );
    }

    const paymentConfig: StorePaymentConfig | undefined = store?.paymentConfig;
    // Kirim bukti butuh id pesanan, yang hanya ada di perangkat tempat pesanan dibuat.
    const localOrderId = findLocalOrder(order.orderNumber)?.id;

    return (
      <div className="space-y-2.5">
        {paymentConfig && <ManualPaymentDetails paymentConfig={paymentConfig} total={order.totalAmount} />}
        {localOrderId ? (
          <PaymentProofUpload
            orderId={localOrderId}
            orderNumber={order.orderNumber}
            storeId={storeId}
            total={order.totalAmount}
            onSubmitted={({ paymentConfirmedAt }) => handleProofSubmitted(order.orderNumber, paymentConfirmedAt)}
          />
        ) : (
          <p className="text-xs text-[var(--sf-muted)]">
            Sudah membayar? Hubungi penjual lewat tombol WhatsApp di bawah dan sebutkan nomor pesanan Anda.
          </p>
        )}
      </div>
    );
  };

  const renderResult = (order: TrackedOrder) => {
    const steps = buildSteps(order);
    const isCancelled = order.orderStatus === 'cancelled';
    const trackingLink = order.trackingNumber
      ? generateTrackingLink(order.courier, encodeURIComponent(order.trackingNumber))
      : null;

    return (
      <div className="space-y-4">
        <div className={cardClass}>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--sf-muted)]">Nomor Pesanan</p>
              <p className="text-lg font-bold text-[var(--sf-text)]">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--sf-muted)]">Total</p>
              <p className="text-lg font-bold text-[var(--sf-text)]">{formatRupiah(order.totalAmount)}</p>
            </div>
          </div>

          {isCancelled ? (
            <div className="flex items-start gap-2.5 p-3 rounded-[var(--sf-radius)] border border-red-200 bg-red-50 text-red-700">
              <XCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">Pesanan ini dibatalkan. Hubungi penjual bila ada pertanyaan.</p>
            </div>
          ) : (
            <ol className="space-y-3">
              {steps.map((step) => (
                <li key={step.key} className="flex items-start gap-3">
                  {step.state === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-[var(--sf-primary)]" />
                  ) : step.state === 'current' ? (
                    <Clock className="w-5 h-5 shrink-0 text-amber-500" />
                  ) : (
                    <span className="w-5 h-5 shrink-0 rounded-full border-2 border-[var(--sf-border)]" />
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        step.state === 'upcoming' ? 'text-[var(--sf-muted)]' : 'text-[var(--sf-text)]'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.detail && <p className="text-xs text-[var(--sf-muted)]">{step.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {!isCancelled && renderPaymentAction(order)}

        <div className={`${cardClass} grid gap-4 sm:grid-cols-2`}>
          <div className="flex items-start gap-2.5">
            <CreditCard className="w-4 h-4 mt-0.5 shrink-0 text-[var(--sf-muted)]" />
            <div>
              <p className="text-xs text-[var(--sf-muted)]">Metode Pembayaran</p>
              <p className="text-sm font-semibold text-[var(--sf-text)]">{order.paymentMethod || '-'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Truck className="w-4 h-4 mt-0.5 shrink-0 text-[var(--sf-muted)]" />
            <div className="min-w-0">
              <p className="text-xs text-[var(--sf-muted)]">Pengiriman</p>
              <p className="text-sm font-semibold text-[var(--sf-text)]">
                {[order.courier, order.courierService].filter(Boolean).join(' · ') || '-'}
                {order.shippingCity ? ` → ${order.shippingCity}` : ''}
              </p>
              {order.trackingNumber ? (
                <a
                  href={trackingLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-[var(--sf-primary)] hover:underline break-all"
                >
                  Resi {order.trackingNumber}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <p className="text-xs text-[var(--sf-muted)] mt-1">Nomor resi muncul setelah paket dikirim.</p>
              )}
            </div>
          </div>
        </div>

        {order.items.length > 0 && (
          <div className={cardClass}>
            <p className="text-sm font-bold text-[var(--sf-text)] mb-3">Isi Pesanan</p>
            <ul className="divide-y divide-[var(--sf-border)]">
              {order.items.map((item, i) => (
                <li key={`${item.name}-${i}`} className="flex items-center gap-3 py-2.5">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-12 h-12 rounded-md object-cover bg-[var(--sf-page)]" />
                  ) : (
                    <span className="w-12 h-12 rounded-md bg-[var(--sf-page)] flex items-center justify-center">
                      <Package className="w-5 h-5 text-[var(--sf-muted)]" />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--sf-text)] truncate">{item.name}</p>
                    <p className="text-xs text-[var(--sf-muted)]">
                      {item.variant ? `${item.variant} · ` : ''}
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--sf-text)]">{formatRupiah(item.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-between pt-3 mt-1 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
              <span>Ongkos kirim</span>
              <span>{formatRupiah(order.shippingCost)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => (
    <div className="pt-24 pb-28 bg-[var(--sf-page)] text-[var(--sf-text)] min-h-screen font-sans antialiased">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-5">
        <div>
          <button
            type="button"
            onClick={() => onNavigate?.('homepage')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--sf-muted)] hover:text-[var(--sf-text)] transition cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Toko</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Lacak Pesanan</h1>
          <p className="text-xs text-[var(--sf-muted)] mt-1">
            Masukkan nomor pesanan dan nomor WhatsApp yang Anda isi saat checkout. Tidak perlu login.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={`${cardClass} space-y-3`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="block text-xs font-semibold mb-1">Nomor Pesanan</span>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="KB-1A2B3C4D5E"
                maxLength={32}
                autoComplete="off"
                required
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold mb-1">Nomor WhatsApp</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
                maxLength={20}
                autoComplete="tel"
                required
                className={inputClass}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading || !storeId}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--sf-radius)] bg-[var(--sf-primary)] text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isLoading ? 'Mencari...' : 'Lacak Pesanan'}</span>
          </button>
          {errorMessage && <p className="text-xs font-semibold text-red-600">{errorMessage}</p>}
        </form>

        {tracked && renderResult(tracked)}

        {!tracked && localOrders.length > 0 && (
          <div className={cardClass}>
            <p className="text-sm font-bold mb-1">Pesanan dari perangkat ini</p>
            <p className="text-xs text-[var(--sf-muted)] mb-3">Pilih untuk melihat status terbarunya.</p>
            <ul className="divide-y divide-[var(--sf-border)]">
              {localOrders.map((order) => (
                <li key={order.id}>
                  <button
                    type="button"
                    onClick={() => handlePickLocal(order)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between gap-3 py-2.5 text-left cursor-pointer hover:opacity-80 disabled:opacity-60"
                  >
                    <span>
                      <span className="block text-sm font-semibold">{order.orderNumber}</span>
                      <span className="block text-xs text-[var(--sf-muted)]">{formatDateIndo(order.createdAt)}</span>
                    </span>
                    <span className="text-sm font-semibold">{formatRupiah(order.grandTotal)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {sellerChatLink && (
          <a
            href={sellerChatLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--sf-radius)] border border-[var(--sf-border)] text-sm font-semibold text-[var(--sf-text)] hover:bg-[var(--sf-subtle)] transition"
          >
            <MessageCircle className="w-4 h-4 text-green-600" />
            <span>Hubungi Penjual via WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--sf-page)] text-[var(--sf-text)]">
      {CustomNavbar ? (
        <div className={isStickyHeader ? 'sticky top-0 z-50' : undefined}>
          <CustomNavbar sectionOptions={navbarOptions} />
        </div>
      ) : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}

      <div className="flex-1">{renderContent()}</div>

      {CustomFooter ? <CustomFooter sectionOptions={footerOptions} /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
