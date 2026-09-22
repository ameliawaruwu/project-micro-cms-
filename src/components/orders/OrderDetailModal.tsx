import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Printer,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { Order, Store as StoreType } from '../../types';
import {
  formatRupiah,
  formatDateIndo,
  generateTrackingLink,
} from '../../utils/formatters';
import { OrderTimelineStepper } from './detail/OrderTimelineStepper';
import { OrderLiveTrackingMap } from './detail/OrderLiveTrackingMap';
import { OrderShippingHistory } from './detail/OrderShippingHistory';
import { OrderCustomerAndItems } from './detail/OrderCustomerAndItems';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { t, language } = useLanguage();
  const isEn = language === 'en';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#E5E0DD] animate-in fade-in zoom-in duration-150 overflow-hidden">
        {/* Top Header (Pinned) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#E5E0DD] shrink-0 bg-[#FDFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5E8EA] border border-[#E8DDDE] flex items-center justify-center text-[#66000E]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base sm:text-lg text-[#241A1A]">
                  #{order.orderNumber}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  order.shippingStatus === 'Selesai'
                    ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                    : order.shippingStatus === 'Dikirim'
                    ? 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]'
                    : 'bg-[#FAF7F7] text-[#706866] border-[#E5E0DD]'
                }`}>
                  {order.shippingStatus}
                </span>
              </div>
              <p className="text-xs text-[#706866] mt-0.5">
                {isEn ? `Created on ${new Date(order.createdAt).toLocaleDateString('en-US')}` : `Dibuat pada ${formatDateIndo(order.createdAt)}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer"
            title={t('actions_close', 'Tutup')}
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
        <div className="p-3.5 sm:p-4 border-t border-[#E5E0DD] bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onPrintReceipt(order)}
              className="w-full sm:w-auto justify-center px-3.5 py-2.5 min-h-[40px] rounded-xl border border-[#E5E0DD] text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('receipt_modal_title', 'Cetak Struk')}</span>
            </button>
          </div>

          <div className="flex items-center w-full sm:w-auto">
            {order.shippingStatus === 'Baru' || order.shippingStatus === 'Diproses' ? (
              <button
                onClick={() => {
                  onClose();
                  onProcessShipping(order);
                }}
                className="w-full sm:w-auto justify-center px-5 py-2.5 min-h-[42px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>{t('order_btn_process_shipping', 'Proses Pengiriman')}</span>
              </button>
            ) : order.shippingStatus === 'Dikirim' && onMarkCompleted ? (
              <button
                onClick={() => {
                  onMarkCompleted(order.id);
                  onClose();
                }}
                className="w-full sm:w-auto justify-center px-4 py-2.5 min-h-[42px] rounded-xl bg-[#027A48] hover:bg-[#026038] text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('mark_completed', 'Tandai Selesai')}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
