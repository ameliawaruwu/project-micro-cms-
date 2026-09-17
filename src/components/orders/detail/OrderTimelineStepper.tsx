import React from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Truck,
  Printer,
  ShoppingBag,
  CreditCard,
  PackageCheck,
  LucideIcon,
} from 'lucide-react';
import { Order } from '../../../types';
import { formatRupiah, formatDateIndo } from '../../../utils/formatters';

export interface TimelineStepItem {
  id: number;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  completed: boolean;
  active: boolean;
  statusLabel: string;
  badgeColor: string;
  description: string;
  actionType: string;
}

interface OrderTimelineStepperProps {
  order: Order;
  currentStepIndex: number;
  progressPercentage: number;
  selectedStepId: number;
  setSelectedStepId: React.Dispatch<React.SetStateAction<number>>;
  vehicleType: 'motor' | 'mobil';
  isShipped: boolean;
  isCompleted: boolean;
  copiedResi: boolean;
  handleCopyResi: () => void;
  biteshipTrackingUrl: string;
  onProcessShipping: (order: Order) => void;
  onMarkCompleted?: (orderId: string) => void;
  onPrintReceipt: (order: Order) => void;
}

export const OrderTimelineStepper: React.FC<OrderTimelineStepperProps> = ({
  order,
  currentStepIndex,
  progressPercentage,
  selectedStepId,
  setSelectedStepId,
  vehicleType,
  isShipped,
  isCompleted,
  copiedResi,
  handleCopyResi,
  biteshipTrackingUrl,
  onProcessShipping,
  onMarkCompleted,
  onPrintReceipt,
}) => {
  const isPaid = order.paymentStatus === 'Sudah Dibayar';
  const isProcessed = order.shippingStatus !== 'Baru';

  const steps: TimelineStepItem[] = [
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

  return (
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

      {/* Interactive Step Detail Card */}
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
  );
};
