import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Order,
  ShippingBranch,
  ShippingMethod,
  CreateShipmentResult,
  AvailableCourier,
} from '../../types';
import { branchService } from '../../services/branchService';
import { shippingService } from '../../services/shippingService';
import { orderService } from '../../services/orderService';
import { ShipmentSuccessView } from './ShipmentSuccessView';
import { ShipmentFulfillmentForm } from './ShipmentFulfillmentForm';
import { useLanguage } from '../../contexts/LanguageContext';

interface ShippingModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
  onShowNotification: (msg: string) => void;
}

export const ShippingModal: React.FC<ShippingModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
  onShowNotification,
}) => {
  const { isEn } = useLanguage();
  const [deliveryType, setDeliveryType] = useState<ShippingMethod>('drop_off');
  const [branches, setBranches] = useState<ShippingBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<ShippingBranch | null>(null);

  // Dynamic Couriers from Biteship API
  const [availableCouriers, setAvailableCouriers] = useState<AvailableCourier[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<AvailableCourier | null>(null);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);

  // Pickup Scheduling state
  const [pickupDate, setPickupDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [pickupTimeSlot, setPickupTimeSlot] = useState<string>('13:00 - 16:00');

  // Shipment fulfillment state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipmentResult, setShipmentResult] = useState<CreateShipmentResult | null>(null);
  const [showThermalPreview, setShowThermalPreview] = useState(false);
  const [isCopiedResi, setIsCopiedResi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load branches & available couriers
  useEffect(() => {
    if (!isOpen || !order) return;

    const loadInitialData = async () => {
      setIsLoadingCouriers(true);
      try {
        // 1. Load branches
        const branchList = await branchService.getBranches(order.storeId);
        setBranches(branchList);

        const matchBranch =
          (order.originBranchId && branchList.find((b) => b.id === order.originBranchId)) ||
          branchList.find((b) => b.isDefault) ||
          branchList[0];

        setSelectedBranch(matchBranch || null);

        // 2. Load available couriers from Biteship API
        const couriers = await shippingService.getAvailableCouriers();
        setAvailableCouriers(couriers);

        // Match courier from order or default to first
        const orderCourierCode = (order.courierCode || order.courier || 'jnt').toLowerCase();
        let matchedCourier = couriers.find((c) => {
          const cCode = c.courier_code.toLowerCase();
          const cName = c.courier_name.toLowerCase();
          return (
            cCode === orderCourierCode ||
            cName.includes(orderCourierCode) ||
            orderCourierCode.includes(cCode)
          );
        });

        if (!matchedCourier) {
          matchedCourier = couriers[0];
        }

        setSelectedCourier(matchedCourier || null);

        // Validasi method pengiriman yang didukung oleh kurir
        if (matchedCourier) {
          if (!matchedCourier.available_for_drop_off && matchedCourier.available_for_pickup) {
            setDeliveryType('pickup');
          } else if (!matchedCourier.available_for_pickup && matchedCourier.available_for_drop_off) {
            setDeliveryType('drop_off');
          } else {
            setDeliveryType(order.shippingMethod || 'drop_off');
          }
        }
      } catch (err) {
        console.error('Failed to load initial fulfillment data:', err);
      } finally {
        setIsLoadingCouriers(false);
      }
    };

    setShipmentResult(null);
    setShowThermalPreview(false);
    setErrorMsg('');
    loadInitialData();
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  // Nama kurir dinamis
  const dynamicCourierName = selectedCourier?.courier_name || order.courier || (isEn ? 'Courier' : 'Ekspedisi');
  const dynamicServiceName = selectedCourier?.courier_service_name || order.courierService || (isEn ? 'Regular' : 'Reguler');

  const handleCourierSelect = (c: AvailableCourier) => {
    setSelectedCourier(c);
    // Auto-adjust delivery type jika metode saat ini tidak didukung oleh kurir baru
    if (deliveryType === 'drop_off' && !c.available_for_drop_off) {
      setDeliveryType('pickup');
      onShowNotification(isEn ? `${c.courier_name} only supports Pick-up (courier collects).` : `${c.courier_name} hanya mendukung metode Pick-up (Kurir Jemput).`);
    } else if (deliveryType === 'pickup' && !c.available_for_pickup) {
      setDeliveryType('drop_off');
      onShowNotification(isEn ? `${c.courier_name} only supports Drop-off (drop at counter).` : `${c.courier_name} hanya mendukung metode Drop-off (Antar ke Counter).`);
    }
  };

  const handleCopyResi = () => {
    const resi = shipmentResult?.tracking_number || order.resiNumber;
    if (!resi) return;
    navigator.clipboard.writeText(resi);
    setIsCopiedResi(true);
    onShowNotification(isEn ? `Tracking number ${resi} copied!` : `Nomor Resi ${resi} berhasil disalin!`);
    setTimeout(() => setIsCopiedResi(false), 2000);
  };

  const shipmentErrorText = (code: string, providerMessage?: string): string => {
    const messages: Record<string, [string, string]> = {
      invalid: ['Data pengiriman tidak valid. Periksa pilihan kurir dan metode pengiriman.', 'Invalid shipment data. Check the courier and delivery method.'],
      invalid_pickup: ['Jadwal penjemputan tidak valid. Pilih tanggal hari ini sampai 7 hari ke depan.', 'Invalid pick-up schedule. Choose a date from today up to 7 days ahead.'],
      not_found: ['Pesanan tidak ditemukan.', 'Order not found.'],
      unauthorized: ['Sesi login berakhir. Silakan masuk kembali.', 'Your session has expired. Please sign in again.'],
      forbidden: ['Anda tidak punya akses untuk mengelola pesanan toko ini.', "You do not have access to manage this store's orders."],
      rate_limited: ['Terlalu banyak permintaan. Coba lagi sebentar.', 'Too many requests. Please try again shortly.'],
      cancelled: ['Pesanan sudah dibatalkan.', 'This order has been cancelled.'],
      already_shipped: ['Pesanan ini sudah punya resi atau sudah dikirim. Muat ulang daftar pesanan.', 'This order already has a tracking number or has been shipped. Reload the order list.'],
      cod_unconfirmed: ['Konfirmasi pesanan COD terlebih dahulu sebelum mengatur pengiriman.', 'Confirm the COD order before arranging shipment.'],
      unpaid: ['Pesanan belum lunas. Tandai pembayaran lunas terlebih dahulu.', 'The order is not paid yet. Mark the payment as paid first.'],
      branch_not_found: ['Cabang pengiriman tidak ditemukan. Pilih cabang lain.', 'Shipping branch not found. Choose another branch.'],
      origin_incomplete: ['Lengkapi alamat, kode pos, dan nomor HP cabang pengiriman (atau alamat toko) terlebih dahulu.', 'Complete the address, postal code, and phone number of the shipping branch (or store address) first.'],
      destination_incomplete: ['Alamat, kode pos, atau nomor HP pembeli belum lengkap, jadi kurir tidak bisa dipesan. Hubungi pembeli untuk melengkapinya.', "The buyer's address, postal code, or phone number is incomplete, so a courier cannot be booked. Contact the buyer to complete it."],
      no_items: ['Pesanan tidak memiliki barang.', 'The order has no items.'],
      not_configured: ['Layanan pemesanan kurir belum aktif. Hubungi admin LapakQ.', 'Courier booking is not active yet. Contact the LapakQ admin.'],
      busy: ['Pemesanan kurir untuk pesanan ini sedang diproses. Tunggu sebentar lalu muat ulang.', 'A courier booking for this order is in progress. Wait a moment, then reload.'],
      provider_unreachable: ['Layanan kurir tidak dapat dihubungi. Coba lagi beberapa saat.', 'The courier service cannot be reached. Please try again shortly.'],
      courier_rejected: ['Kurir menolak pemesanan. Coba kurir atau layanan lain.', 'The courier rejected the booking. Try another courier or service.'],
      network: ['Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', 'Cannot connect to the server. Check your internet connection.'],
    };
    const [id, en] = messages[code] || ['Gagal memesan kurir. Silakan coba lagi.', 'Failed to book the courier. Please try again.'];
    const base = isEn ? en : id;
    return providerMessage ? `${base} (${isEn ? 'Courier' : 'Kurir'}: ${providerMessage})` : base;
  };

  const handleConfirmShipping = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const courierCodeToSend = (selectedCourier?.courier_code || order.courierCode || '').toLowerCase();
      const courierServiceToSend = (selectedCourier?.courier_service_code || '').toLowerCase();
      if (!courierCodeToSend || !courierServiceToSend) {
        setErrorMsg(isEn ? 'Choose a courier service first.' : 'Pilih layanan kurir terlebih dahulu.');
        return;
      }

      // Server memesan kurir ke Biteship dan menyimpan resinya; tidak ada resi simulasi.
      const response = await shippingService.createShipment({
        orderId: order.id,
        deliveryType,
        pickupDate: deliveryType === 'pickup' ? pickupDate : undefined,
        pickupTime: deliveryType === 'pickup' ? pickupTimeSlot.slice(0, 5) : undefined,
        originBranchId: selectedBranch?.id,
        courierCode: courierCodeToSend,
        courierService: courierServiceToSend,
      });

      if (!response.ok || !response.result) {
        setErrorMsg(shipmentErrorText(response.code || 'failed', response.providerMessage));
        return;
      }

      const result = response.result;
      setShipmentResult(result);

      // Ambil ulang pesanan dari database (resi & status sudah disimpan server).
      const refreshed = await orderService.getOrderById(order.id, order.storeId);
      onSuccess(
        refreshed && refreshed.trackingNumber
          ? refreshed
          : {
              ...order,
              resiNumber: result.tracking_number,
              trackingNumber: result.tracking_number,
              shippingLabelUrl: result.shipping_label_url || order.shippingLabelUrl,
              shippingMethod: deliveryType,
              originBranchId: selectedBranch?.id || order.originBranchId,
              shippingStatus: 'Dikirim',
              shippedAt: new Date().toISOString(),
            }
      );
      onShowNotification(
        isEn
          ? `Tracking number ${result.tracking_number} issued successfully!`
          : `Resi pengiriman ${result.tracking_number} berhasil diterbitkan!`
      );
    } catch {
      setErrorMsg(isEn ? 'Failed to process the shipment. Please try again.' : 'Gagal memproses pengiriman paket. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintLabel = () => {
    // Tautan pelacakan resmi dari Biteship (disimpan server saat pemesanan berhasil).
    const trackingUrl = shipmentResult?.shipping_label_url || order.shippingLabelUrl;
    if (trackingUrl && /^https:\/\//.test(trackingUrl)) {
      window.open(trackingUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Belum ada tautan dari kurir: tampilkan label thermal yang bisa dicetak.
      setShowThermalPreview(true);
    }
  };

  return (
    <div
      id="modal-shipping-fulfillment"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs font-poppins"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#E5E0DD] animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header Shopee Style */}
        <div className="p-4 sm:p-5 border-b border-[#E5E0DD] flex items-center justify-between bg-[#FDFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#1F1F1F]">
                {showThermalPreview
                  ? (isEn ? 'Shipping Label Preview (Thermal A6)' : 'Pratinjau Label Pengiriman (Thermal A6)')
                  : (isEn ? 'Arrange Order Shipment' : 'Atur Pengiriman Pesanan')}
              </h3>
              <p className="text-[11px] text-[#777777]">
                {isEn ? 'Order' : 'Pesanan'} #{order.orderNumber} • {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowThermalPreview(false);
              onClose();
            }}
            className="p-1.5 rounded-xl text-[#777777] hover:text-[#1F1F1F] hover:bg-[#F0F0F0] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-left">
          {errorMsg && (
            <div className="p-3 bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUKSES: TAMPILKAN RESI & TOMBOL CETAK LABEL ATAU PRATINJAU THERMAL */}
          {shipmentResult ? (
            <ShipmentSuccessView
              order={order}
              shipmentResult={shipmentResult}
              showThermalPreview={showThermalPreview}
              setShowThermalPreview={setShowThermalPreview}
              dynamicCourierName={dynamicCourierName}
              dynamicServiceName={dynamicServiceName}
              deliveryType={deliveryType}
              selectedBranch={selectedBranch}
              isCopiedResi={isCopiedResi}
              handleCopyResi={handleCopyResi}
              handlePrintLabel={handlePrintLabel}
              onClose={onClose}
            />
          ) : (
            <ShipmentFulfillmentForm
              order={order}
              branches={branches}
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              availableCouriers={availableCouriers}
              selectedCourier={selectedCourier}
              handleCourierSelect={handleCourierSelect}
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
              pickupDate={pickupDate}
              setPickupDate={setPickupDate}
              pickupTimeSlot={pickupTimeSlot}
              setPickupTimeSlot={setPickupTimeSlot}
              dynamicCourierName={dynamicCourierName}
            />
          )}
        </div>

        {/* Modal Footer Actions */}
        {!shipmentResult && (
          <div className="p-4 border-t border-[#E5E0DD] bg-white flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#E5E0DD] text-[#555555] hover:bg-[#F7F7F7] font-semibold text-xs transition cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>

            <button
              onClick={handleConfirmShipping}
              disabled={isSubmitting}
              className="flex-1 px-5 py-2.5 min-h-[40px] rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEn ? `Issuing ${dynamicCourierName} tracking number...` : `Menerbitkan Resi ${dynamicCourierName}...`}</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>
                    {isEn
                      ? `Confirm ${deliveryType === 'pickup' ? 'Pick-up' : 'Drop-off'} (${dynamicCourierName}) & Create Tracking Number`
                      : `Konfirmasi ${deliveryType === 'pickup' ? 'Pick-up' : 'Drop-off'} (${dynamicCourierName}) & Buat Resi`}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
