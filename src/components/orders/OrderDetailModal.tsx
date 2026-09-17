import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Printer,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { Order, Store as StoreType } from '../../types';
import {
  formatRupiah,
  formatDateIndo,
  generateWhatsAppLink,
  generateTrackingLink,
} from '../../utils/formatters';
import { OrderTimelineStepper } from './detail/OrderTimelineStepper';
import { OrderLiveTrackingMap } from './detail/OrderLiveTrackingMap';
import { OrderShippingHistory } from './detail/OrderShippingHistory';
import { OrderCustomerAndItems } from './detail/OrderCustomerAndItems';

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

  // Addresses for Google Maps Direction & Pin
  const originCity = store?.city || 'Yogyakarta, DI Yogyakarta';
  const destinationAddress = `${order.customerAddress}, ${order.customerDistrict ? `${order.customerDistrict}, ` : ''}${order.customerCity}`;
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
          {/* 1. STATUS PERJALANAN PESANAN (Interactive Stepper with Progress & Details) */}
          <OrderTimelineStepper
            order={order}
            currentStepIndex={currentStepIndex}
            progressPercentage={progressPercentage}
            selectedStepId={selectedStepId}
            setSelectedStepId={setSelectedStepId}
            vehicleType={vehicleType}
            isShipped={isShipped}
            isCompleted={isCompleted}
            copiedResi={copiedResi}
            handleCopyResi={handleCopyResi}
            biteshipTrackingUrl={biteshipTrackingUrl}
            onProcessShipping={onProcessShipping}
            onMarkCompleted={onMarkCompleted}
            onPrintReceipt={onPrintReceipt}
          />

          {/* 2. LIVE TRACKING & LOGISTIK PENGIRIMAN (COLLAPSIBLE MAP ON-DEMAND) */}
          <OrderLiveTrackingMap
            order={order}
            store={store}
            copiedResi={copiedResi}
            handleCopyResi={handleCopyResi}
            biteshipTrackingUrl={biteshipTrackingUrl}
            vehicleType={vehicleType}
            isInstant={isInstant}
            driverInfo={driverInfo}
            destinationLandmark={destinationLandmark}
            destinationCityClean={destinationCityClean}
            originCity={originCity}
            destinationAddress={destinationAddress}
          />

          {/* 2B. Riwayat Checkpoints Kurir */}
          <OrderShippingHistory
            order={order}
            store={store}
            vehicleType={vehicleType}
            isInstant={isInstant}
            destinationLandmark={destinationLandmark}
            destinationCityClean={destinationCityClean}
            originCity={originCity}
          />

          {/* 3. DETAILS: CUSTOMER INFO & ITEMS BREAKDOWN */}
          <OrderCustomerAndItems order={order} />
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
