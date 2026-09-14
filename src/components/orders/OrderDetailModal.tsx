import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Printer,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Package,
  User,
  Phone,
  Truck,
  ShoppingBag,
  CreditCard,
  PackageCheck,
  Map as MapIcon,
  Navigation,
  Compass,
  ArrowRight,
  Clock,
  Building2,
  Share2,
  Sparkles,
  Route,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Order, Store as StoreType } from '../../types';
import {
  formatRupiah,
  formatDateIndo,
  generateWhatsAppLink,
  generateTrackingLink,
} from '../../utils/formatters';

interface OrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  store?: StoreType | null;
  onClose: () => void;
  onProcessShipping: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onMarkCompleted?: (orderId: string) => void;
  onShowNotification?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

/**
 * Animated Vector Illustration: Kurir Sepeda Motor (Motorcycle Rider)
 */
const MotorDeliveryIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Road & Speed lines */}
    <path d="M10 108 H150" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
    <path d="M6 100 H32" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" className="animate-pulse" />
    <path d="M16 92 H40" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 84 H26" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />

    {/* Wheels */}
    <circle cx="46" cy="94" r="17" fill="#1F2937" />
    <circle cx="46" cy="94" r="11" fill="#E5E7EB" />
    <circle cx="46" cy="94" r="5" fill="#4B5563" />
    <circle cx="122" cy="94" r="17" fill="#1F2937" />
    <circle cx="122" cy="94" r="11" fill="#E5E7EB" />
    <circle cx="122" cy="94" r="5" fill="#4B5563" />

    {/* Motorcycle Body Frame */}
    <path d="M46 94 L68 76 H96 L110 60 H120 L122 94" stroke="#9A0602" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M68 76 L82 94 H105 L118 78" stroke="#9A0602" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Exhaust Pipe */}
    <path d="M44 98 H80" stroke="#6B7280" strokeWidth="4.5" strokeLinecap="round" />
    {/* Mudguard */}
    <path d="M30 84 Q46 72 62 84" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M108 82 Q122 72 136 84" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" fill="none" />

    {/* Delivery Cargo Box on Rear Rack */}
    <rect x="24" y="44" width="34" height="32" rx="4" fill="#9A0602" stroke="#7F1D1D" strokeWidth="2" />
    <rect x="29" y="52" width="24" height="16" rx="2" fill="#FFFFFF" opacity="0.95" />
    <path d="M34 60 H48" stroke="#9A0602" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M37 56 L41 60 L45 56" stroke="#9A0602" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Scooter Headlight & Windshield */}
    <path d="M118 58 L126 50" stroke="#9A0602" strokeWidth="4" strokeLinecap="round" />
    <polygon points="125,56 138,58 127,68" fill="#FCD34D" />
    <polygon points="138,58 158,50 158,68" fill="#FDE68A" opacity="0.4" />

    {/* Courier Rider */}
    <path d="M72 74 L84 48 Q92 48 98 56 L108 60" stroke="#B91C1C" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M88 54 L106 62 L116 58" stroke="#DC2626" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="86" cy="32" r="14" fill="#1E293B" />
    <path d="M88 28 Q98 28 100 36 H88 Z" fill="#38BDF8" opacity="0.85" />
    <path d="M74 34 Q86 20 98 34" stroke="#EF4444" strokeWidth="3" fill="none" />
  </svg>
);

/**
 * Animated Vector Illustration: Mobil Box / Van Ekspedisi (Delivery Van / Car)
 */
const MobilDeliveryIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Road & Speed lines */}
    <path d="M10 108 H150" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
    <path d="M4 100 H28" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" className="animate-pulse" />
    <path d="M12 92 H36" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 84 H22" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />

    {/* Wheels */}
    <circle cx="44" cy="96" r="15" fill="#1F2937" />
    <circle cx="44" cy="96" r="9" fill="#E5E7EB" />
    <circle cx="44" cy="96" r="4" fill="#4B5563" />
    <circle cx="120" cy="96" r="15" fill="#1F2937" />
    <circle cx="120" cy="96" r="9" fill="#E5E7EB" />
    <circle cx="120" cy="96" r="4" fill="#4B5563" />

    {/* Main Cargo Box Container */}
    <rect x="22" y="38" width="76" height="56" rx="4" fill="#9A0602" stroke="#7F1D1D" strokeWidth="2" />
    <rect x="22" y="58" width="76" height="12" fill="#B91C1C" />
    <rect x="36" y="44" width="46" height="10" rx="2" fill="#FFFFFF" opacity="0.95" />
    <path d="M42 49 H74" stroke="#9A0602" strokeWidth="2" strokeLinecap="round" />
    <circle cx="39" cy="49" r="1.5" fill="#9A0602" />

    {/* Van Front Cab */}
    <path d="M98 48 H118 L136 68 V94 H98 V48 Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="2" strokeLinejoin="round" />
    <path d="M102 52 H116 L130 68 H102 V52 Z" fill="#BAE6FD" opacity="0.85" />
    <circle cx="110" cy="62" r="4" fill="#1F2937" />
    <path d="M106 68 Q110 64 116 68" fill="#1F2937" />

    {/* Headlight */}
    <rect x="132" y="76" width="6" height="8" rx="2" fill="#FCD34D" />
    <polygon points="138,76 156,70 156,86 138,84" fill="#FDE68A" opacity="0.4" />
    <rect x="134" y="86" width="6" height="8" rx="1" fill="#374151" />
    <path d="M102 68 V92" stroke="#7F1D1D" strokeWidth="1.5" />
    <circle cx="106" cy="74" r="1.5" fill="#FFFFFF" />

    {/* Wheel Well Arches */}
    <path d="M28 96 C28 86 60 86 60 96" stroke="#4B5563" strokeWidth="3" fill="none" />
    <path d="M104 96 C104 86 136 86 136 96" stroke="#4B5563" strokeWidth="3" fill="none" />
  </svg>
);

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  order,
  store,
  onClose,
  onProcessShipping,
  onPrintReceipt,
  onMarkCompleted,
  onShowNotification,
}) => {
  const [copiedResi, setCopiedResi] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [mapDisplayMode, setMapDisplayMode] = useState<'route_map' | 'google_maps'>('route_map');

  // Determine current active step index (0 to 4)
  const isPaid = order?.paymentStatus === 'Sudah Dibayar';
  const isProcessed = order?.shippingStatus !== 'Baru';
  const isShipped = order?.shippingStatus === 'Dikirim' || order?.shippingStatus === 'Selesai';
  const isCompleted = order?.shippingStatus === 'Selesai';

  const currentStepIndex = isCompleted ? 4 : isShipped ? 3 : isProcessed ? 2 : isPaid ? 1 : 0;
  const progressPercentage = Math.round((currentStepIndex / 4) * 100);

  const [selectedStepId, setSelectedStepId] = useState<number>(currentStepIndex + 1);

  // Auto-sync selectedStepId when order or status changes
  useEffect(() => {
    if (order) {
      setSelectedStepId(currentStepIndex + 1);
    }
  }, [order?.id, order?.shippingStatus, order?.paymentStatus, currentStepIndex]);

  // Auto-detect service nature from courier and service (sinkron dengan jasa kirim sebenarnya)
  const courierLower = (order?.courier || '').toLowerCase();
  const serviceLower = (order?.courierService || '').toLowerCase();

  const isInstant =
    courierLower.includes('gosend') ||
    courierLower.includes('grab') ||
    courierLower.includes('instant') ||
    serviceLower.includes('instant') ||
    serviceLower.includes('sameday');

  const isCargo =
    courierLower.includes('cargo') ||
    courierLower.includes('truck') ||
    serviceLower.includes('cargo') ||
    serviceLower.includes('kargo') ||
    serviceLower.includes('truck') ||
    serviceLower.includes('mobil');

  const vehicleType: 'motor' | 'mobil' = isCargo ? 'mobil' : 'motor';

  // Info driver & armada yang sinkron dengan kurir
  const driverInfo = isInstant
    ? {
        name: courierLower.includes('grab') ? 'Mitra Driver GrabExpress' : 'Mitra Driver GoSend',
        plate: 'B 3481 SUT',
        vehicleLabel: 'Kurir Sepeda Motor (Instant)',
        statusDesc: `Kurir ${order?.courier} telah mengambil paket dari toko dan sedang melaju langsung ke alamat penerima.`,
      }
    : isCargo
    ? {
        name: `Driver Kargo (${order?.courier})`,
        plate: 'B 9234 KRO (Truk CDE)',
        vehicleLabel: 'Armada Truk / Mobil Box Kargo',
        statusDesc: `Armada mobil box / truk ${order?.courier} dalam perjalanan mengantar muatan logistik ke lokasi.`,
      }
    : {
        name: `Kurir ${order?.courier} Express`,
        plate: 'D 4821 UTY (Honda Vario)',
        vehicleLabel: 'Kurir Sepeda Motor (Rider Last-Mile)',
        statusDesc: `Kurir motor ${order?.courier} sedang membawa paket Anda langsung menuju lokasi penerima.`,
      };

  // Label alamat yang dinamis sesuai data order
  const destinationLandmark = order?.customerAddress?.split(',')[0] || order?.customerCity || 'Lokasi Tujuan';
  const destinationCityClean = order?.customerCity || 'Tujuan';

  if (!isOpen || !order) return null;

  const handleCopyResi = () => {
    if (!order.resiNumber) return;
    navigator.clipboard.writeText(order.resiNumber);
    setCopiedResi(true);
    if (onShowNotification) onShowNotification('Nomor resi berhasil disalin!');
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'Pesanan Dibuat',
      subtitle: formatDateIndo(order.createdAt),
      icon: ShoppingBag,
      completed: true,
      active: !isPaid,
      statusLabel: 'Selesai Dibuat',
      badgeColor: 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]',
      description: `Pesanan #${order.orderNumber} berhasil dibuat oleh ${order.customerName}. Data belanja ${order.items?.length || 1} produk dan alamat pengiriman telah tersimpan aman di database toko.`,
      actionType: 'none',
    },
    {
      id: 2,
      title: 'Pembayaran Diterima',
      subtitle: isPaid ? `${order.paymentMethod} (Lunas)` : 'Menunggu Bayar',
      icon: CreditCard,
      completed: isPaid,
      active: isPaid && !isProcessed,
      statusLabel: isPaid ? 'Pembayaran Lunas' : 'Menunggu Verifikasi',
      badgeColor: isPaid ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]' : 'bg-[#FEFCE8] text-[#A16207] border-[#FEF08A]',
      description: isPaid
        ? `Tagihan pesanan sebesar ${formatRupiah(order.grandTotal)} telah diverifikasi lunas melalui metode pembayaran ${order.paymentMethod}.`
        : `Menunggu penyelesaian pembayaran sebesar ${formatRupiah(order.grandTotal)} dari pelanggan via ${order.paymentMethod}.`,
      actionType: 'receipt',
    },
    {
      id: 3,
      title: 'Sedang Diproses',
      subtitle: isProcessed ? 'Selesai Dikemas' : 'Menunggu Diproses',
      icon: PackageCheck,
      completed: isProcessed,
      active: isProcessed && !isShipped,
      statusLabel: isProcessed ? 'Selesai Dikemas' : 'Perlu Diproses',
      badgeColor: isProcessed ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]' : 'bg-[#FFF1F0] text-[#9A0602] border-[#FECDCA]',
      description: isProcessed
        ? `Pesanan telah selesai dipacking rapi oleh penjual, label pengiriman telah tercetak dan siap diserahkan ke gerai kurir ${order.courier}.`
        : `Pesanan belum diproses. Silakan klik tombol "Proses Pengiriman" untuk mencetak resi dan menyiapkan paket.`,
      actionType: isProcessed ? 'receipt' : 'process',
    },
    {
      id: 4,
      title: 'Dalam Pengiriman',
      subtitle: order.resiNumber ? `Resi: ${order.resiNumber}` : 'Menunggu Kurir',
      icon: Truck,
      completed: isShipped,
      active: isShipped && !isCompleted,
      statusLabel: isShipped ? 'Dalam Perjalanan' : 'Menunggu Penyerahan',
      badgeColor: isShipped ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]' : 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]',
      description: isShipped
        ? `Paket telah diserahterimakan dan sedang diantar oleh kurir ${order.courier} (${order.courierService || 'Reguler'}). Nomor resi resmi: ${order.resiNumber || '-'}.`
        : `Paket menunggu penjemputan atau serah terima kepada kurir ${order.courier}. Nomor resi akan terbit otomatis saat diproses.`,
      actionType: isShipped ? 'tracking' : 'none',
    },
    {
      id: 5,
      title: 'Pesanan Selesai',
      subtitle: isCompleted ? 'Diterima Pembeli' : 'Tujuan Akhir',
      icon: CheckCircle2,
      completed: isCompleted,
      active: isCompleted,
      statusLabel: isCompleted ? 'Pesanan Berhasil' : 'Menunggu Konfirmasi',
      badgeColor: isCompleted ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]' : 'bg-[#F4F4F5] text-[#71717A] border-[#E4E4E7]',
      description: isCompleted
        ? `Paket telah berhasil diterima oleh ${order.customerName} di ${order.customerCity}. Seluruh proses transaksi jual-beli telah selesai sempurna.`
        : `Paket akan diserahterimakan ke alamat ${order.customerAddress}, ${order.customerCity}. Setelah diterima, penjual atau pembeli dapat menyelesaikan pesanan.`,
      actionType: !isCompleted && isShipped ? 'complete' : 'none',
    },
  ];

  const currentSelectedStep = steps.find((s) => s.id === selectedStepId) || steps[currentStepIndex];

  // Addresses for Google Maps Direction & Pin
  const originCity = store?.city || 'Yogyakarta, DI Yogyakarta';
  const destinationAddress = `${order.customerAddress}, ${order.customerDistrict ? `${order.customerDistrict}, ` : ''}${order.customerCity}`;

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originCity)}&destination=${encodeURIComponent(destinationAddress)}`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationAddress)}`;
  const biteshipTrackingUrl = generateTrackingLink(order.courier, order.resiNumber || '');

  const waMessage = `Halo Kak ${order.customerName}, informasi pesanan #${order.orderNumber} dari toko kami:\nTotal: ${formatRupiah(order.grandTotal)}\nStatus: ${order.shippingStatus}${order.resiNumber ? `\nNo Resi: ${order.resiNumber}` : ''}\n\nTerima kasih!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-poppins">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in duration-150 overflow-hidden">
        {/* Top Header (Pinned) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EAEAEA] shrink-0 bg-[#FDFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF1F0] border border-[#FECDCA] flex items-center justify-center text-[#9A0602]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base sm:text-lg text-[#1F1F1F]">
                  #{order.orderNumber}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  order.shippingStatus === 'Selesai'
                    ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                    : order.shippingStatus === 'Dikirim'
                    ? 'bg-[#FFF1F0] text-[#9A0602] border-[#FECDCA]'
                    : 'bg-[#F7F7F7] text-[#555555] border-[#EAEAEA]'
                }`}>
                  {order.shippingStatus}
                </span>
              </div>
              <p className="text-xs text-[#777777] mt-0.5">Dibuat pada {formatDateIndo(order.createdAt)}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs custom-scrollbar">
          {/* ========================================================================= */}
          {/* 1. STATUS PERJALANAN PESANAN (Interactive Stepper with Progress & Details) */}
          {/* ========================================================================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FAFAFA] to-[#F7F7F7] border border-[#EAEAEA] shadow-2xs">
            {/* Header: Title, Progress Pill & Live Status Badge */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFF1F0] border border-[#FECDCA] text-[#9A0602] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                    Status Perjalanan Pesanan
                  </h4>
                  <p className="text-[10px] text-[#777777]">
                    Klik tahapan di bawah untuk melihat rincian aktivitas & aksi cepat
                  </p>
                </div>
              </div>

              {/* Progress & Live Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Progress Pill Indicator */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#EAEAEA] shadow-2xs text-[11px] font-bold text-[#1F1F1F]">
                  <span className="w-2 h-2 rounded-full bg-[#9A0602]" />
                  <span>Tahap {currentStepIndex + 1} dari 5</span>
                  <span className="text-[#777777] font-normal font-mono">• {progressPercentage}%</span>
                </div>

                {/* Dynamic Live Status Badge */}
                {isShipped && !isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
                    <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-ping" />
                    <span>{vehicleType === 'motor' ? 'Kurir Motor Mengantar' : 'Mobil Box Mengantar'}</span>
                  </span>
                ) : isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pesanan Selesai</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-[#555555] border border-[#EAEAEA]">
                    <Clock className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Dalam Proses Penjual</span>
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Timeline Bar with Interactive Nodes & Filled Progress Line */}
            <div className="overflow-x-auto pt-4 pb-2.5 px-2 custom-scrollbar touch-pan-x">
              <div className="grid grid-cols-5 min-w-[460px] sm:min-w-[520px] relative">
                {/* 1. Inactive Background Track Line running from 10% to 90% */}
                <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-[#EAEAEA] rounded-full -translate-y-1/2" />

                {/* 2. Active Filled Animated Progress Line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-1 rounded-full -translate-y-1/2 overflow-hidden pointer-events-none">
                  <div
                    className="h-full bg-gradient-to-r from-[#9A0602] to-[#DC2626] transition-all duration-700 ease-out relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                  </div>
                </div>

                {/* 3. Interactive Step Nodes */}
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  const isSelected = selectedStepId === step.id;
                  const isCurrentActive = step.active;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setSelectedStepId(step.id)}
                      title={`Klik untuk melihat detail: ${step.title}`}
                      className="group flex flex-col items-center text-center relative z-10 px-1 cursor-pointer select-none transition-transform duration-200 focus:outline-none"
                    >
                      {/* Node Circle */}
                      <div className="relative flex items-center justify-center">
                        {/* Live Radar Pulse Halo for Active Step */}
                        {isCurrentActive && (
                          <span className="absolute -inset-1.5 rounded-full bg-[#9A0602]/25 animate-ping pointer-events-none" />
                        )}

                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                            isSelected
                              ? 'ring-4 ring-[#9A0602]/25 shadow-md scale-105'
                              : 'ring-4 ring-white shadow-xs group-hover:ring-[#9A0602]/20'
                          } ${
                            step.completed
                              ? 'bg-gradient-to-br from-[#9A0602] to-[#B91C1C] text-white'
                              : isCurrentActive
                              ? 'bg-gradient-to-br from-[#9A0602] to-[#DC2626] text-white animate-pulse'
                              : 'bg-white text-[#999999] border-2 border-[#EAEAEA]'
                          }`}
                        >
                          {step.completed ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <StepIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
                          )}
                        </div>
                      </div>

                      {/* Step Labels */}
                      <div className="mt-2.5 flex flex-col items-center">
                        <span
                          className={`text-[10px] sm:text-[11px] font-bold leading-tight px-1.5 py-0.5 rounded-md transition-colors text-center break-words max-w-[85px] sm:max-w-none ${
                            isSelected
                              ? 'text-[#9A0602] bg-[#FFF1F0]'
                              : step.completed || step.active
                              ? 'text-[#1F1F1F] group-hover:text-[#9A0602]'
                              : 'text-[#777777] group-hover:text-[#1F1F1F]'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Step Detail Card (Dynamic Card that changes based on selected step) */}
            <div className="mt-2 p-3.5 sm:p-4 rounded-xl bg-white border border-[#EAEAEA] shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#F0F0F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF1F0] text-[#9A0602] border border-[#FECDCA] flex items-center justify-center font-bold text-sm shrink-0">
                    <currentSelectedStep.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-xs sm:text-sm text-[#1F1F1F]">
                        {currentSelectedStep.title}
                      </h5>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentSelectedStep.badgeColor}`}>
                        {currentSelectedStep.statusLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#777777] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#9A0602]" />
                      <span>{currentSelectedStep.subtitle}</span>
                    </p>
                  </div>
                </div>

                {/* Step Navigation Arrows (Prev / Next Step) */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={currentSelectedStep.id === 1}
                    onClick={() => setSelectedStepId((prev) => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-[#EAEAEA] text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Tahap Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-[#777777] px-1 font-semibold">
                    Tahap {currentSelectedStep.id} / 5
                  </span>
                  <button
                    type="button"
                    disabled={currentSelectedStep.id === 5}
                    onClick={() => setSelectedStepId((prev) => Math.min(5, prev + 1))}
                    className="p-1.5 rounded-lg border border-[#EAEAEA] text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Tahap Selanjutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step Explanation & Contextual Action */}
              <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-[#555555] leading-relaxed text-[11px] sm:text-xs flex-1">
                  {currentSelectedStep.description}
                </p>

                {/* Contextual Quick Actions */}
                {currentSelectedStep.id === 4 && order.resiNumber && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyResi}
                      className="px-2.5 py-1.5 rounded-lg bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#1F1F1F] font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer border border-[#EAEAEA]"
                    >
                      {copiedResi ? <Check className="w-3 h-3 text-[#027A48]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedResi ? 'Tersalin' : 'Salin Resi'}</span>
                    </button>
                    <a
                      href={biteshipTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      <span>Lacak Kurir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {currentSelectedStep.id === 3 && !isShipped && (
                  <button
                    type="button"
                    onClick={() => onProcessShipping(order)}
                    className="px-3 py-1.5 rounded-lg bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0 self-start sm:self-center"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Atur Pengiriman</span>
                  </button>
                )}

                {currentSelectedStep.id === 5 && !isCompleted && isShipped && onMarkCompleted && (
                  <button
                    type="button"
                    onClick={() => onMarkCompleted(order.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#027A48] hover:bg-[#059669] text-white font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0 self-start sm:self-center"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Selesai</span>
                  </button>
                )}

                {currentSelectedStep.id === 2 && (
                  <button
                    type="button"
                    onClick={() => onPrintReceipt(order)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#1F1F1F] font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer border border-[#EAEAEA] shrink-0 self-start sm:self-center"
                  >
                    <Printer className="w-3 h-3 text-[#555555]" />
                    <span>Struk Bayar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. LIVE TRACKING & LOGISTIK PENGIRIMAN (OPSI B: COLLAPSIBLE MAP ON-DEMAND)*/}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-[#EAEAEA] bg-white overflow-hidden shadow-xs">
            {/* Header: Kurir & Nomor Resi */}
            <div className="p-3.5 sm:p-4 bg-[#FDFBFB] border-b border-[#EAEAEA] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF1F0] border border-[#FECDCA] text-[#9A0602] flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-[#1F1F1F]">
                      Pelacakan & Logistik Pengiriman
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#1F1F1F] border border-[#EAEAEA] shadow-2xs">
                      {order.courier} {order.courierService || 'Reguler'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#777777] mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>No. Resi:</span>
                    <strong className="font-mono text-[#1F1F1F]">{order.resiNumber || 'Belum terbit'}</strong>
                    {order.resiNumber && (
                      <button
                        type="button"
                        onClick={handleCopyResi}
                        className="p-1 hover:bg-[#F0F0F0] rounded text-[#777777] hover:text-[#1F1F1F] transition cursor-pointer"
                        title="Salin Resi"
                      >
                        {copiedResi ? <Check className="w-3.5 h-3.5 text-[#027A48]" /> : <Copy className="w-3.5 h-3.5 text-[#777777]" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Biteship Live Link */}
              <div className="flex items-center gap-2 shrink-0">
                {order.resiNumber && (
                  <a
                    href={biteshipTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#FFF1F0] text-[#9A0602] border border-[#FECDCA] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#FEE4E2] transition cursor-pointer"
                  >
                    <span>Lacak Live Biteship</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Live Courier Vehicle Banner (Gambar Motor atau Mobil) */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#FFF5F5] via-white to-[#FDFBFB] flex flex-col sm:flex-row items-center justify-between gap-3.5">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-white border-2 border-[#FECDCA] shadow-xs flex items-center justify-center p-1 shrink-0 relative overflow-hidden group">
                  {vehicleType === 'motor' ? (
                    <MotorDeliveryIllustration className="w-full h-full transform group-hover:scale-105 transition duration-300" />
                  ) : (
                    <MobilDeliveryIllustration className="w-full h-full transform group-hover:scale-105 transition duration-300" />
                  )}
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#12B76A] ring-2 ring-white animate-pulse" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-xs sm:text-sm text-[#1F1F1F]">
                      {driverInfo.vehicleLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-ping" />
                      <span>Live Driver</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-[#555555] mt-0.5 leading-snug">
                    {driverInfo.statusDesc}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#777777] font-mono flex-wrap">
                    <span className="font-bold text-[#1F1F1F] bg-white px-1.5 py-0.5 rounded border border-[#EAEAEA]">
                      Plat: {driverInfo.plate}
                    </span>
                    <span>•</span>
                    <span>{driverInfo.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* OPSI B: ACCORDION TOGGLE UNTUK PETA RUTE PENGIRIMAN */}
            <div className="border-t border-[#EAEAEA]">
              <button
                type="button"
                onClick={() => setIsMapExpanded((prev) => !prev)}
                className="w-full py-2.5 px-3.5 sm:px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#1F1F1F] transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#9A0602]/10 text-[#9A0602] flex items-center justify-center">
                    <MapIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[#1F1F1F]">Visual Peta & Jalur Pengiriman</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#777777] border border-[#EAEAEA] font-medium hidden sm:inline-block">
                    {isMapExpanded ? 'Sedang Ditampilkan' : 'Opsional • Klik untuk Buka Peta'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#9A0602] text-xs font-bold">
                  <span>{isMapExpanded ? 'Sembunyikan Peta' : 'Buka Peta'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMapExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Collapsible Content: Interactive Map & Google Maps */}
              {isMapExpanded && (
                <div className="p-3 sm:p-4 space-y-3 bg-[#FAFAFA] border-t border-[#EAEAEA] animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Map Display Mode Switcher */}
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#1F1F1F]">
                      <Sparkles className="w-3.5 h-3.5 text-[#9A0602]" />
                      <span>Jalur Pengiriman Toko ➔ Pembeli</span>
                    </div>

                    <div className="flex items-center gap-1 bg-[#EDEDED] p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setMapDisplayMode('route_map')}
                        className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer ${
                          mapDisplayMode === 'route_map'
                            ? 'bg-white text-[#9A0602] shadow-2xs font-bold'
                            : 'text-[#777777] hover:text-[#1F1F1F]'
                        }`}
                      >
                        <Route className="w-3 h-3" />
                        <span>Peta Rute Interaktif</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMapDisplayMode('google_maps')}
                        className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer ${
                          mapDisplayMode === 'google_maps'
                            ? 'bg-white text-[#1F1F1F] shadow-2xs font-bold'
                            : 'text-[#777777] hover:text-[#1F1F1F]'
                        }`}
                      >
                        <MapIcon className="w-3 h-3" />
                        <span>Google Maps</span>
                      </button>
                    </div>
                  </div>

                  {/* 1A. LIVE ROUTE MAP CANVAS */}
                  {mapDisplayMode === 'route_map' ? (
                    <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#EAEAEA] bg-[#F8FAFC] select-none shadow-inner">
                      {/* Background Realistic Map Street Canvas */}
                      <svg viewBox="0 0 700 320" className="w-full h-full absolute inset-0 preserve-3d" preserveAspectRatio="none">
                        <rect width="700" height="320" fill="#F1F5F9" />
                        <path d="M 0 160 Q 180 180 320 120 T 700 140" fill="none" stroke="#E0F2FE" strokeWidth="24" strokeLinecap="round" />
                        <path d="M 0 160 Q 180 180 320 120 T 700 140" fill="none" stroke="#BAE6FD" strokeWidth="12" strokeLinecap="round" />
                        <rect x="40" y="30" width="120" height="70" rx="8" fill="#DCFCE7" opacity="0.6" />
                        <rect x="220" y="220" width="140" height="60" rx="8" fill="#DCFCE7" opacity="0.6" />
                        <rect x="480" y="160" width="160" height="80" rx="8" fill="#DCFCE7" opacity="0.6" />
                        <path d="M 0 60 H 700 M 0 260 H 700" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
                        <path d="M 160 0 V 320 M 380 0 V 320 M 520 0 V 320" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
                        <path d="M 0 200 L 700 180" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 60 0 L 260 320" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 440 0 L 620 320" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />

                        {/* Highway Glow & Line */}
                        <path
                          d="M 120 240 C 220 240, 260 170, 360 170 C 450 170, 480 95, 570 85"
                          fill="none"
                          stroke="#FEE2E2"
                          strokeWidth="18"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 120 240 C 220 240, 260 170, 360 170 C 450 170, 480 95, 570 85"
                          fill="none"
                          stroke="#9A0602"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 120 240 C 220 240, 260 170, 360 170 C 450 170, 480 95, 570 85"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="3.5"
                          strokeDasharray="9 7"
                          strokeLinecap="round"
                        >
                          <animate attributeName="stroke-dashoffset" from="32" to="0" dur="0.9s" repeatCount="indefinite" />
                        </path>

                        <text x="180" y="275" fill="#94A3B8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                          {isInstant ? `Rute Langsung ${order.courier}` : `Rute Antarkota ➔ Hub ${destinationCityClean}`}
                        </text>
                        <text x="440" y="70" fill="#94A3B8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                          Menuju Kawasan {destinationCityClean}
                        </text>
                      </svg>

                      {/* Origin Store Pin */}
                      <div className="absolute left-[10%] bottom-[12%] sm:bottom-[15%] -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10">
                        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border-2 border-[#027A48] flex items-center gap-1.5 transition transform group-hover:scale-105">
                          <div className="w-5 h-5 rounded-md bg-[#ECFDF3] flex items-center justify-center text-xs">
                            🏬
                          </div>
                          <div>
                            <p className="font-black text-[10px] text-[#027A48] leading-none uppercase">Asal Toko</p>
                            <p className="text-[9px] text-[#1F1F1F] font-bold truncate max-w-[90px] sm:max-w-[110px]">{store?.name || 'Toko Pengirim'}</p>
                            <p className="text-[8px] text-[#777777] leading-none">{originCity.split(',')[0]}</p>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 bg-[#027A48] rotate-45 -mt-1 rounded-xs" />
                        <div className="relative mt-0.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-[#027A48] ring-4 ring-[#ECFDF3] shadow-md" />
                        </div>
                      </div>

                      {/* Intermediate transit box */}
                      {!isInstant && (
                        <div className="absolute left-[30%] bottom-[32%] -translate-x-1/2 hidden sm:flex flex-col items-center z-10">
                          <div className="bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-[#EAEAEA] shadow-xs text-[9px] font-bold text-[#555555] flex items-center gap-1">
                            <span className="text-xs">🚐</span>
                            <span>Mobil Box Transit</span>
                          </div>
                          <span className="text-[7px] text-[#94A3B8] font-mono">Antarkota</span>
                        </div>
                      )}

                      {/* Checkpoint Transit Hub */}
                      {!isInstant && (
                        <div className="absolute left-[50%] top-[48%] -translate-x-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center z-10">
                          <div className="bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-[#EAEAEA] shadow-xs text-[9px] font-bold text-[#1F1F1F] flex items-center gap-1">
                            <span>🏢</span>
                            <span>Hub Gateway {destinationCityClean}</span>
                          </div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#64748B] ring-2 ring-white mt-0.5" />
                        </div>
                      )}

                      {/* Moving Vehicle Marker */}
                      <div className="absolute left-[64%] sm:left-[67%] top-[34%] sm:top-[33%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 animate-in fade-in zoom-in">
                        <div className="bg-[#9A0602] text-white px-3 py-1 rounded-xl shadow-xl border-2 border-white flex items-center gap-2 animate-bounce duration-1000">
                          <span className="text-base sm:text-lg">
                            {vehicleType === 'motor' ? '🛵' : '🚐'}
                          </span>
                          <div>
                            <p className="font-black text-[10px] text-white uppercase leading-tight tracking-wide flex items-center gap-1">
                              <span>{isInstant ? 'Kurir Instant' : vehicleType === 'motor' ? 'Kurir Motor Last-Mile' : 'Mobil Box Pengantar'}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-ping inline-block" />
                            </p>
                            <p className="text-[9px] text-[#FECDCA] font-medium leading-none">
                              {order.courier} • Mengantar ke Lokasi
                            </p>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 bg-[#9A0602] rotate-45 -mt-1 rounded-xs" />
                        <div className="relative mt-0.5">
                          <div className="w-4 h-4 rounded-full bg-[#9A0602] ring-4 ring-[#FFF1F0] shadow-lg flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          </div>
                          <div className="absolute -inset-2 rounded-full bg-[#9A0602]/20 animate-ping" />
                        </div>
                      </div>

                      {/* Destination Pin */}
                      <div className="absolute right-[8%] sm:right-[10%] top-[8%] sm:top-[12%] translate-x-1/2 flex flex-col items-center group cursor-pointer z-10">
                        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border-2 border-[#9A0602] flex items-center gap-1.5 transition transform group-hover:scale-105">
                          <div className="w-5 h-5 rounded-md bg-[#FFF1F0] flex items-center justify-center text-xs">
                            🏠
                          </div>
                          <div>
                            <p className="font-black text-[10px] text-[#9A0602] leading-none uppercase">Lokasi Tujuan</p>
                            <p className="text-[9px] text-[#1F1F1F] font-bold truncate max-w-[100px] sm:max-w-[140px]">
                              {destinationLandmark}
                            </p>
                            <p className="text-[8px] text-[#777777] leading-none">
                              {order.customerName} ({destinationCityClean})
                            </p>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 bg-[#9A0602] rotate-45 -mt-1 rounded-xs" />
                        <div className="relative mt-0.5">
                          <div className="w-4 h-4 rounded-full bg-[#9A0602] ring-4 ring-[#FFF1F0] shadow-md" />
                          <div className="absolute -inset-1.5 rounded-full bg-[#9A0602] animate-ping opacity-60" />
                        </div>
                      </div>

                      {/* Top Bar Notification */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#EAEAEA] shadow-md flex items-center justify-between sm:justify-start gap-2.5 z-20 pointer-events-none">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12B76A] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#12B76A]"></span>
                          </span>
                          <span className="font-bold text-[11px] text-[#1F1F1F]">
                            {vehicleType === 'motor' ? '🛵 Kurir Motor' : '🚐 Mobil Box'} sedang menuju lokasimu
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#027A48] bg-[#ECFDF3] px-2 py-0.5 rounded-md border border-[#ABEFC6]">
                          Estimasi: Hari ini
                        </span>
                      </div>

                      {/* Bottom-right Distance ETA Badge */}
                      <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#EAEAEA] shadow-md text-[10px] text-[#1F1F1F] font-mono z-20 pointer-events-none hidden sm:flex items-center gap-1.5">
                        <Navigation className="w-3 h-3 text-[#9A0602]" />
                        <span>Sisa Jarak: <strong>~{isInstant ? '2.4' : '3.8'} km</strong> • {destinationCityClean}</span>
                      </div>
                    </div>
                  ) : (
                    /* 1B. GOOGLE MAPS ASLI */
                    <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#EAEAEA] bg-[#EAEAEA] shadow-inner">
                      <iframe
                        title={`Google Maps Delivery ${order.customerName}`}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(destinationAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        allowFullScreen
                      />

                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#EAEAEA] shadow-md flex items-center gap-2 pointer-events-none">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12B76A] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#12B76A]"></span>
                        </span>
                        <span className="font-semibold text-[11px] text-[#1F1F1F]">
                          Pin Tujuan: {order.customerCity}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#EAEAEA] shadow-lg flex items-center gap-2.5 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-9 h-9 rounded-lg bg-[#FFF1F0] border border-[#FECDCA] flex items-center justify-center text-xl shrink-0">
                          {vehicleType === 'motor' ? '🛵' : '🚐'}
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-[#1F1F1F] flex items-center gap-1.5">
                            <span>{vehicleType === 'motor' ? 'Kurir Motor En-Route' : 'Mobil Box En-Route'}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-ping" />
                          </div>
                          <p className="text-[10px] text-[#555555] max-w-[200px] truncate">
                            {order.customerDistrict || order.customerCity}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Direct Action Links (Google Maps Directions & Pin) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2 text-[11px] text-[#555555]">
                      <MapPin className="w-3.5 h-3.5 text-[#9A0602]" />
                      <span>Terhubung langsung dengan rute navigasi ekspedisi</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={googleMapsDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-[11px] flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Buka Rute di Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <a
                        href={googleMapsSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#EAEAEA] text-[#1F1F1F] hover:bg-[#F7F7F7] font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <MapIcon className="w-3.5 h-3.5 text-[#555555]" />
                        <span>Titik Alamat</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Riwayat Checkpoints Kurir (Selalu tampil rapi & ringkas) */}
            <div className="p-3.5 sm:p-4 bg-white border-t border-[#EAEAEA] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#1F1F1F] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#9A0602]" />
                  <span>Riwayat Perjalanan Kurir</span>
                </span>
                <span className="text-[10px] text-[#777777]">Pembaruan Terkini</span>
              </div>

              {/* Realistic Checkpoints */}
              <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAEAEA]">
                {/* Log 1: Currently active checkpoint */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#9A0602] ring-4 ring-[#FFF1F0] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1F1F1F] text-xs flex items-center gap-1.5">
                        <span>{vehicleType === 'motor' ? '🛵 Kurir Motor Sedang Mengantar' : '🚐 Mobil Box Sedang Mengantar'}</span>
                      </span>
                      <span className="text-[10px] text-[#777777]">Hari ini</span>
                    </div>
                    <p className="text-[11px] text-[#555555] mt-0.5">
                      {order.shippingStatus === 'Selesai'
                        ? `Paket telah berhasil diserahterimakan kepada ${order.customerName}.`
                        : isInstant
                        ? `Kurir ${order.courier} sedang melaju mengantarkan pesanan langsung ke ${destinationLandmark}, ${destinationCityClean}.`
                        : `Kurir ${vehicleType === 'motor' ? 'sepeda motor' : 'mobil box'} ${order.courier} sedang melaju menuju ${destinationLandmark}, ${destinationCityClean}.`}
                    </p>
                  </div>
                </div>

                {/* Log 2: Hub arrival */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#EAEAEA] border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#777777]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1F1F1F] text-xs">
                        {isInstant
                          ? `Paket Selesai Di-Pickup oleh Kurir ${order.courier}`
                          : `Tiba di Sorting Hub Gateway (${destinationCityClean})`}
                      </span>
                      <span className="text-[10px] text-[#777777]">{formatDateIndo(order.createdAt).slice(0, 11)}</span>
                    </div>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      {isInstant
                        ? `Driver ${order.courier} telah mengambil paket dari toko ${store?.name || ''} dan mengonfirmasi penjemputan.`
                        : `Paket diangkut armada transit dan lolos sortir hub logistik untuk pengantaran last-mile.`}
                    </p>
                  </div>
                </div>

                {/* Log 3: Drop-off / Dispatch */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#EAEAEA] border-2 border-white flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#777777]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1F1F1F] text-xs">
                        {isInstant
                          ? `Pesanan Diproses & Driver ${order.courier} Dialokasikan`
                          : `Paket Diserahkan ke Gerai Kurir (${originCity.split(',')[0]})`}
                      </span>
                      <span className="text-[10px] text-[#777777]">{formatDateIndo(order.createdAt).slice(0, 11)}</span>
                    </div>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      {isInstant
                        ? `Sistem pengiriman langsung menghubungkan pesanan dengan kurir terdekat.`
                        : `Nomor resi resmi diterbitkan melalui integrasi sistem logistik.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. DETAILS: CUSTOMER INFO & ITEMS BREAKDOWN */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Left: Customer Info */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#F7F7F7] border border-[#EAEAEA]">
              <h5 className="font-bold text-[#1F1F1F] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#9A0602]" />
                <span>Informasi Pembeli & Alamat</span>
              </h5>
              <div className="space-y-1.5 text-[#555555]">
                <p className="font-bold text-[#1F1F1F] text-sm">{order.customerName}</p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#777777]" />
                  <span className="font-mono font-semibold text-[#1F1F1F]">{order.customerPhone}</span>
                </p>
                <p className="flex items-start gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#9A0602] shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    {order.customerAddress}, {order.customerCity} {order.customerPostalCode || ''}
                  </span>
                </p>
                {order.notes && (
                  <div className="p-2.5 rounded-xl bg-white border border-[#EAEAEA] text-[#555555] text-[11px] mt-2">
                    <span className="font-bold text-[#1F1F1F]">Catatan:</span> "{order.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Right: Ordered Products & Total Breakdown */}
            <div className="space-y-3">
              <h5 className="font-bold text-[#1F1F1F] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#9A0602]" />
                <span>Daftar Barang Belanja</span>
              </h5>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#EAEAEA]">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-10 h-10 rounded-lg object-cover border border-[#EAEAEA] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1F1F1F] truncate">{item.productName}</p>
                      <p className="text-[10px] text-[#777777]">
                        {item.quantity} x {formatRupiah(item.price)}
                        {item.variantName && ` • ${item.variantName}`}
                      </p>
                    </div>
                    <span className="font-bold text-[#1F1F1F]">{formatRupiah(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="p-3.5 rounded-xl bg-[#F7F7F7] border border-[#EAEAEA] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#555555]">
                  <span>Subtotal Produk</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#555555]">
                  <span>Ongkos Kirim ({order.courier})</span>
                  <span>{formatRupiah(order.shippingCost)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#027A48] font-bold">
                    <span>Diskon Kupon</span>
                    <span>-{formatRupiah(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[#1F1F1F] pt-2 border-t border-[#EAEAEA]">
                  <span>Total Tagihan</span>
                  <span>{formatRupiah(order.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-[#777777] pt-0.5 text-[10px]">
                  <span>Metode Pembayaran</span>
                  <span className="font-bold text-[#1F1F1F]">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-[#EAEAEA] bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onPrintReceipt(order)}
              className="w-full sm:w-auto justify-center px-3.5 py-2.5 min-h-[40px] rounded-xl border border-[#EAEAEA] text-[#555555] hover:text-[#1F1F1F] hover:bg-[#F7F7F7] font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>

            <a
              href={generateWhatsAppLink(order.customerPhone, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto justify-center px-3.5 py-2.5 min-h-[40px] rounded-xl bg-white hover:bg-[#F7F7F7] text-[#027A48] border border-[#ABEFC6] font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center w-full sm:w-auto">
            {order.shippingStatus === 'Baru' || order.shippingStatus === 'Diproses' ? (
              <button
                onClick={() => {
                  onClose();
                  onProcessShipping(order);
                }}
                className="w-full sm:w-auto justify-center px-5 py-2.5 min-h-[42px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Proses Pengiriman</span>
              </button>
            ) : order.shippingStatus === 'Dikirim' && onMarkCompleted ? (
              <button
                onClick={() => {
                  onMarkCompleted(order.id);
                  onClose();
                }}
                className="w-full sm:w-auto justify-center px-4 py-2.5 min-h-[42px] rounded-xl bg-[#027A48] hover:bg-[#026038] text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tandai Selesai</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
