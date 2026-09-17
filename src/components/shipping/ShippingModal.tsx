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
  CourierType,
} from '../../types';
import { branchService } from '../../services/branchService';
import { shippingService } from '../../services/shippingService';
import { orderService } from '../../services/orderService';
import { ShipmentSuccessView } from './ShipmentSuccessView';
import { ShipmentFulfillmentForm } from './ShipmentFulfillmentForm';

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
  const dynamicCourierName = selectedCourier?.courier_name || order.courier || 'Ekspedisi';
  const dynamicServiceName = selectedCourier?.courier_service_name || order.courierService || 'Reguler';

  const handleCourierSelect = (c: AvailableCourier) => {
    setSelectedCourier(c);
    // Auto-adjust delivery type jika metode saat ini tidak didukung oleh kurir baru
    if (deliveryType === 'drop_off' && !c.available_for_drop_off) {
      setDeliveryType('pickup');
      onShowNotification(`${c.courier_name} hanya mendukung metode Pick-up (Kurir Jemput).`);
    } else if (deliveryType === 'pickup' && !c.available_for_pickup) {
      setDeliveryType('drop_off');
      onShowNotification(`${c.courier_name} hanya mendukung metode Drop-off (Antar ke Counter).`);
    }
  };

  const handleCopyResi = () => {
    const resi = shipmentResult?.tracking_number || order.resiNumber;
    if (!resi) return;
    navigator.clipboard.writeText(resi);
    setIsCopiedResi(true);
    onShowNotification(`Nomor Resi ${resi} berhasil disalin!`);
    setTimeout(() => setIsCopiedResi(false), 2000);
  };

  const handleConfirmShipping = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const pickupTimeIso =
        deliveryType === 'pickup'
          ? `${pickupDate}T${pickupTimeSlot.slice(0, 2)}:00:00Z`
          : undefined;

      const courierCodeToSend = (
        selectedCourier?.courier_code ||
        order.courierCode ||
        order.courier ||
        'jnt'
      ).toLowerCase();

      const courierServiceToSend = (
        selectedCourier?.courier_service_code ||
        order.courierService ||
        'ez'
      ).toLowerCase();

      // 1. Panggil Edge Function create-shipment dengan kurir dinamis
      const result = await shippingService.createShipment({
        order_id: order.id,
        delivery_type: deliveryType,
        pickup_time: pickupTimeIso,
        origin_branch_id: selectedBranch?.id,
        courier_code: courierCodeToSend,
        courier_service: courierServiceToSend,
      });

      setShipmentResult(result);

      // Mapping nama kurir untuk order state
      let mappedCourierType: CourierType = 'J&T';
      if (courierCodeToSend.includes('jne')) mappedCourierType = 'JNE';
      else if (courierCodeToSend.includes('sicepat')) mappedCourierType = 'SiCepat';
      else if (courierCodeToSend.includes('gosend')) mappedCourierType = 'GoSend';

      // 2. Update order di local / database
      const updated = await orderService.processShipmentWithBiteship({
        orderId: order.id,
        courier: mappedCourierType,
        courierCode: courierCodeToSend,
        courierService: selectedCourier
          ? `${selectedCourier.courier_name} ${selectedCourier.courier_service_name}`
          : order.courierService,
        trackingNumber: result.tracking_number,
        shippingLabelUrl: result.shipping_label_url,
        shippingMethod: deliveryType,
        originBranchId: selectedBranch?.id,
        pickupTime: pickupTimeIso,
      });

      onSuccess(updated);
      onShowNotification(
        result.message || `Resi pengiriman ${result.tracking_number} berhasil diterbitkan!`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pengiriman paket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintLabel = () => {
    const labelUrl = shipmentResult?.shipping_label_url || order.shippingLabelUrl;
    const trackingNumber =
      shipmentResult?.tracking_number || order.trackingNumber || order.resiNumber;

    if (
      labelUrl &&
      labelUrl.startsWith('http') &&
      !labelUrl.includes('labels.biteship.com') &&
      !labelUrl.includes('biteship.com/id/tracking')
    ) {
      window.open(labelUrl, '_blank', 'noopener,noreferrer');
    } else if (trackingNumber) {
      // Buka pelacakan resmi Biteship live testing
      window.open(
        `https://track.biteship.com/hbiQdAcnePHcyl2k1DdUek6d?environment=development`,
        '_blank',
        'noopener,noreferrer'
      );
    } else {
      alert('Nomor resi atau link label belum tersedia.');
    }
  };

  return (
    <div
      id="modal-shipping-fulfillment"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs font-sans"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#EAEAEA] animate-in fade-in zoom-in duration-200 overflow-hidden">
        {/* Header Shopee Style */}
        <div className="p-4 sm:p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#FDFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF1F0] text-[#9A0602] flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#1F1F1F]">
                {showThermalPreview ? 'Pratinjau Label Pengiriman (Thermal A6)' : 'Atur Pengiriman Pesanan'}
              </h3>
              <p className="text-[11px] text-[#777777]">
                Pesanan #{order.orderNumber} • {order.customerName}
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
          <div className="p-4 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 min-h-[40px] rounded-xl border border-[#EAEAEA] text-[#555555] hover:bg-[#F7F7F7] font-semibold text-xs transition cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleConfirmShipping}
              disabled={isSubmitting}
              className="flex-1 px-5 py-2.5 min-h-[40px] rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menerbitkan Resi {dynamicCourierName}...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>
                    Konfirmasi {deliveryType === 'pickup' ? 'Pick-up' : 'Drop-off'} ({dynamicCourierName}) & Buat Resi
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
