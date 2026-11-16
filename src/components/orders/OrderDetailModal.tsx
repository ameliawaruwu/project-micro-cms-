import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Printer,
  CheckCircle2,
  Package,
  Clock,
  Loader2,
  ExternalLink,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { isManualTransferMethod } from '../../utils/manualPayment';
import { getMerchantOrderAction } from '../../utils/orderFlow';
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
import { getPaymentDeadline } from '../../utils/orderPaymentDeadline';

interface OrderDetailModalProps {
  isOpen: boolean;
  order: Order | null;
  store?: StoreType | null;
  onClose: () => void;
  onProcessShipping: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onMarkCompleted?: (orderId: string) => void;
  onVerifyPayment?: (orderId: string) => Promise<void>;
  onConfirmCodOrder?: (orderId: string) => Promise<void>;
  onShowNotification?: (message: string, type?: 'success' | 'error' | 'info') => void;
  /** Membatalkan pesanan lewat server; resolve true bila berhasil. */
  onCancelOrder?: (orderId: string, reason: string) => Promise<boolean>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  order,
  store,
  onClose,
  onProcessShipping,
  onPrintReceipt,
  onMarkCompleted,
  onVerifyPayment,
  onConfirmCodOrder,
  onShowNotification,
  onCancelOrder,
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [copiedResi, setCopiedResi] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isConfirmingCod, setIsConfirmingCod] = useState(false);

  // Determine current active step index (0 to 4)
  const isPaid = order?.paymentStatus === 'Sudah Dibayar';
  // Bukti transfer hanya ditampilkan bila berupa URL https (diisi server dari CDN).
  const proofUrl = order?.paymentProofUrl?.startsWith('https://') ? order.paymentProofUrl : null;
  const paymentDeadline = order ? getPaymentDeadline(order) : null;
  const isProcessed = order?.shippingStatus !== 'Baru';
  const isShipped = order?.shippingStatus === 'Dikirim' || order?.shippingStatus === 'Selesai';
  const isCompleted = order?.shippingStatus === 'Selesai';
  const nextAction = order ? getMerchantOrderAction(order) : 'none';
  const isCancelled = order?.shippingStatus === 'Dibatalkan';
  // Penjual boleh membatalkan selama pesanan belum dikirim (server memeriksa ulang).
  const canCancel =
    !!onCancelOrder &&
    (order?.shippingStatus === 'Baru' || order?.shippingStatus === 'Diproses') &&
    !order?.resiNumber &&
    !order?.shippingOrderId;
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setIsCancelOpen(false);
    setCancelReason('');
  }, [order?.id]);

  const handleCancelOrder = async () => {
    if (!order || !onCancelOrder) return;
    setIsCancelling(true);
    try {
      const ok = await onCancelOrder(order.id, cancelReason.trim());
      if (ok) {
        setIsCancelOpen(false);
        setCancelReason('');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmCod = async () => {
    if (!order || !onConfirmCodOrder) return;
    setIsConfirmingCod(true);
    try {
      await onConfirmCodOrder(order.id);
    } finally {
      setIsConfirmingCod(false);
    }
  };

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

  // Label alamat yang dinamis sesuai data order
  const destinationLandmark = order?.customerAddress?.split(',')[0] || order?.customerCity || (isEn ? 'Destination' : 'Lokasi Tujuan');
  const destinationCityClean = order?.customerCity || (isEn ? 'Destination' : 'Tujuan');

  if (!isOpen || !order) return null;

  const handleCopyResi = () => {
    if (!order.resiNumber) return;
    navigator.clipboard.writeText(order.resiNumber);
    setCopiedResi(true);
    if (onShowNotification) onShowNotification(isEn ? 'Tracking number copied!' : 'Nomor resi berhasil disalin!');
    setTimeout(() => setCopiedResi(false), 2000);
  };

  // Addresses for Google Maps Direction & Pin
  const originCity = store?.city || 'Yogyakarta, DI Yogyakarta';
  const destinationAddress = `${order.customerAddress}, ${order.customerDistrict ? `${order.customerDistrict}, ` : ''}${order.customerCity}`;
  const biteshipTrackingUrl = generateTrackingLink(order.courier, order.resiNumber || '');

  const shippingStatusLabel = (status: string): string => {
    switch (status) {
      case 'Baru':
        return t('filter_new', 'Baru');
      case 'Diproses':
        return t('filter_processing', 'Diproses');
      case 'Dikirim':
        return t('filter_shipped', 'Dikirim');
      case 'Selesai':
        return t('filter_completed', 'Selesai');
      case 'Dibatalkan':
        return t('filter_cancelled', 'Dibatalkan');
      case 'ready_to_ship':
        return isEn ? 'Ready to Ship' : 'Siap Dikirim';
      default:
        return status;
    }
  };
  const formatDateTimeEn = (value: string) =>
    new Date(value).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
                    : isCancelled
                    ? 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                    : 'bg-[#FAF7F7] text-[#706866] border-[#E5E0DD]'
                }`}>
                  {shippingStatusLabel(order.shippingStatus)}
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
          {/* PESANAN DIBATALKAN */}
          {isCancelled && (
            <div className="p-4 rounded-xl border bg-[#FEF3F2] border-[#FECDCA] flex items-start gap-2.5">
              <XCircle className="w-5 h-5 shrink-0 text-[#B42318]" />
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-[#241A1A]">
                  {order.cancelledBy === 'buyer'
                    ? (isEn ? 'Cancelled by the buyer' : 'Dibatalkan oleh pembeli')
                    : order.cancelledBy === 'merchant'
                    ? (isEn ? 'Cancelled by your store' : 'Dibatalkan oleh toko Anda')
                    : order.cancelledBy === 'system'
                    ? (isEn ? 'Cancelled automatically: not paid within 24 hours' : 'Dibatalkan otomatis: tidak dibayar dalam 24 jam')
                    : (isEn ? 'Order cancelled' : 'Pesanan dibatalkan')}
                </p>
                <p className="text-xs text-[#706866] leading-relaxed">
                  {order.cancelledAt && (
                    <>
                      {isEn ? formatDateTimeEn(order.cancelledAt) : formatDateIndo(order.cancelledAt)}
                      {'. '}
                    </>
                  )}
                  {order.cancelledBy === 'system'
                    ? (isEn ? 'The buyer did not pay before the deadline.' : 'Pembeli tidak membayar sebelum batas waktu.')
                    : order.cancelReason
                    ? `${isEn ? 'Reason' : 'Alasan'}: ${order.cancelReason}`
                    : (isEn ? 'No reason given.' : 'Tanpa alasan.')}
                </p>
                {isPaid && (
                  <p className="text-xs text-[#B42318] font-medium leading-relaxed">
                    {isEn
                      ? `This order was paid. Refund ${formatRupiah(order.grandTotal)} to the buyer manually.`
                      : `Pesanan ini sudah dibayar. Kembalikan dana ${formatRupiah(order.grandTotal)} ke pembeli secara manual.`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* KONFIRMASI PEMBATALAN OLEH PENJUAL */}
          {canCancel && isCancelOpen && (
            <div className="p-4 rounded-xl border bg-white border-[#FECDCA] space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 text-[#B42318]" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-[#241A1A]">
                    {isEn ? 'Cancel this order?' : 'Batalkan pesanan ini?'}
                  </p>
                  <p className="text-xs text-[#706866] leading-relaxed">
                    {isPaid
                      ? (isEn
                        ? `The buyer has paid ${formatRupiah(order.grandTotal)}. You must refund it manually, and any amount credited to your store balance will be deducted.`
                        : `Pembeli sudah membayar ${formatRupiah(order.grandTotal)}. Anda wajib mengembalikan dananya secara manual, dan saldo toko yang sudah masuk akan dikurangi.`)
                      : (isEn
                        ? 'The buyer will be notified by email. This cannot be undone.'
                        : 'Pembeli akan diberi tahu lewat email. Pembatalan tidak bisa diurungkan.')}
                  </p>
                </div>
              </div>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value.slice(0, 300))}
                maxLength={300}
                rows={2}
                placeholder={isEn ? 'Reason for cancelling (e.g. out of stock)' : 'Alasan pembatalan (mis. stok habis)'}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0DD] text-xs text-[#241A1A] placeholder:text-[#A29A98] focus:outline-none focus:border-[#66000E] resize-none"
              />
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setIsCancelOpen(false)}
                  className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#E5E0DD] text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] font-semibold text-xs transition cursor-pointer disabled:opacity-70"
                >
                  {isEn ? 'Keep Order' : 'Tidak Jadi'}
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelOrder}
                  className="px-4 py-2.5 min-h-[40px] rounded-xl bg-[#B42318] hover:bg-[#912018] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-70"
                >
                  {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  <span>{isEn ? 'Yes, Cancel Order' : 'Ya, Batalkan Pesanan'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 0. PENGECEKAN PEMBAYARAN QRIS / TRANSFER LANGSUNG */}
          {isManualTransferMethod(order.paymentMethod) && !isPaid && !isCancelled && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-3 ${
                order.paymentConfirmedAt ? 'bg-amber-50 border-amber-300' : 'bg-[#FAF7F7] border-[#E5E0DD]'
              }`}
            >
              <div className="flex items-start gap-2.5 flex-1">
                <Clock className={`w-5 h-5 shrink-0 ${order.paymentConfirmedAt ? 'text-amber-700' : 'text-[#706866]'}`} />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-[#241A1A]">
                    {order.paymentConfirmedAt
                      ? (isEn ? 'Buyer has confirmed payment' : 'Pembeli sudah konfirmasi pembayaran')
                      : (isEn ? 'Awaiting buyer payment' : 'Menunggu pembayaran pembeli')}
                  </p>
                  <p className="text-xs text-[#706866] leading-relaxed">
                    {order.paymentConfirmedAt
                      ? (isEn
                        ? `Confirmed ${formatDateTimeEn(order.paymentConfirmedAt)}. Check your bank / QRIS statement for ${formatRupiah(order.grandTotal)}, then mark it as paid.`
                        : `Dikonfirmasi ${formatDateIndo(order.paymentConfirmedAt)}. Cek mutasi rekening / QRIS Anda sebesar ${formatRupiah(order.grandTotal)}, lalu tandai lunas.`)
                      : (isEn
                        ? `The buyer has not sent payment proof yet. You can still mark it as paid if ${formatRupiah(order.grandTotal)} has been received.`
                        : `Pembeli belum mengirim bukti pembayaran. Anda tetap bisa menandai lunas jika dana ${formatRupiah(order.grandTotal)} sudah masuk.`)}
                    {paymentDeadline && (
                      <>
                        {' '}
                        {isEn
                          ? `Cancelled automatically if unpaid by ${formatDateTimeEn(paymentDeadline.toISOString())}.`
                          : `Batal otomatis bila belum dibayar sampai ${formatDateIndo(paymentDeadline.toISOString())}.`}
                      </>
                    )}
                  </p>
                </div>
              </div>
              {onVerifyPayment && (
                <button
                  type="button"
                  disabled={isVerifyingPayment}
                  onClick={async () => {
                    setIsVerifyingPayment(true);
                    try {
                      await onVerifyPayment(order.id);
                    } finally {
                      setIsVerifyingPayment(false);
                    }
                  }}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-[#027A48] hover:bg-[#026038] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-70"
                >
                  {isVerifyingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isEn ? 'Mark as Paid' : 'Tandai Lunas'}</span>
                </button>
              )}
            </div>
          )}

          {/* 0a. BUKTI TRANSFER DARI PEMBELI */}
          {proofUrl && (
            <div className="p-4 rounded-xl border bg-white border-[#E5E0DD] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#241A1A]">{isEn ? 'Payment Proof from Buyer' : 'Bukti Pembayaran dari Pembeli'}</p>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#7A1D1D] hover:underline flex items-center gap-1"
                >
                  {isEn ? 'Open full size' : 'Buka ukuran penuh'} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={proofUrl}
                  alt={isEn ? `Payment proof ${order.orderNumber}` : `Bukti pembayaran ${order.orderNumber}`}
                  className="max-h-80 w-full object-contain rounded-lg border border-[#E5E0DD] bg-[#FAF7F7]"
                />
              </a>
              {!isPaid && (
                <p className="text-xs text-[#706866]">
                  {isEn
                    ? `Match the sender name, amount ${formatRupiah(order.grandTotal)}, and transfer time with your statement before marking it as paid.`
                    : `Cocokkan nama pengirim, nominal ${formatRupiah(order.grandTotal)}, dan waktu transfer dengan mutasi sebelum menandai lunas.`}
                </p>
              )}
            </div>
          )}

          {/* 0b. PESANAN COD: perlu dikonfirmasi merchant sebelum dikirim */}
          {nextAction === 'confirm_cod' && (
            <div className="p-4 rounded-xl border bg-[#FAF7F7] border-[#E5E0DD] flex items-start gap-2.5">
              <Clock className="w-5 h-5 shrink-0 text-[#706866]" />
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-[#241A1A]">{isEn ? 'COD order awaiting your confirmation' : 'Pesanan COD menunggu konfirmasi Anda'}</p>
                <p className="text-xs text-[#706866] leading-relaxed">
                  {isEn
                    ? `Make sure the stock is available, then confirm the order before arranging shipping. The buyer pays ${formatRupiah(order.grandTotal)} on delivery, and the payment is recorded as paid automatically when the order is marked completed.`
                    : `Pastikan stok tersedia lalu konfirmasi pesanan sebelum mengatur pengiriman. Pembeli membayar ${formatRupiah(order.grandTotal)} saat barang tiba, dan pembayaran tercatat lunas otomatis ketika pesanan ditandai selesai.`}
                </p>
              </div>
            </div>
          )}

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
            nextAction={nextAction}
            isConfirmingCod={isConfirmingCod}
            onConfirmCod={onConfirmCodOrder ? handleConfirmCod : undefined}
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
            {canCancel && !isCancelOpen && (
              <button
                type="button"
                onClick={() => setIsCancelOpen(true)}
                className="w-full sm:w-auto justify-center px-3.5 py-2.5 min-h-[40px] rounded-xl border border-[#FECDCA] text-[#B42318] hover:bg-[#FEF3F2] font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{isEn ? 'Cancel Order' : 'Batalkan Pesanan'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center w-full sm:w-auto">
            {nextAction === 'verify_payment' ? (
              <span className="w-full sm:w-auto justify-center px-4 py-2.5 min-h-[42px] rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-semibold text-xs flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{isEn ? 'Mark as paid first to ship' : 'Tandai lunas dulu untuk mengirim'}</span>
              </span>
            ) : nextAction === 'confirm_cod' && onConfirmCodOrder ? (
              <button
                type="button"
                disabled={isConfirmingCod}
                onClick={handleConfirmCod}
                className="w-full sm:w-auto justify-center px-5 py-2.5 min-h-[42px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-98 disabled:opacity-70"
              >
                {isConfirmingCod ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{t('confirm_order', 'Konfirmasi Pesanan')}</span>
              </button>
            ) : nextAction === 'ship' ? (
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
            ) : nextAction === 'complete' && onMarkCompleted ? (
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
