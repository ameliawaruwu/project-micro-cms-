import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  Building2,
  Calendar,
  Clock,
  Printer,
  CheckCircle2,
  MapPin,
  Loader2,
  Package,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  SlidersHorizontal,
  Info,
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

  const handlePrintThermalLabel = () => {
    const labelUrl = shipmentResult?.shipping_label_url || order.shippingLabelUrl;
    if (labelUrl) {
      window.open(labelUrl, '_blank');
    } else {
      window.print();
    }
  };

  return (
    <div
      id="modal-shipping-fulfillment"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs font-sans"
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
                Atur Pengiriman Pesanan
              </h3>
              <p className="text-[11px] text-[#777777]">
                Pesanan #{order.orderNumber} • {order.customerName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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

          {/* SUKSES: TAMPILKAN RESI & TOMBOL CETAK LABEL */}
          {shipmentResult ? (
            <div className="p-5 bg-[#FBFDFB] border border-[#ABEFC6] rounded-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#ECFDF3] text-[#027A48] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#1F1F1F]">Pengiriman Berhasil Diatur!</h4>
                <p className="text-[#555555] text-xs mt-0.5">
                  {deliveryType === 'pickup'
                    ? `Kurir ${dynamicCourierName} akan menjemput paket sesuai jadwal ke alamat gudang asal Anda.`
                    : `Paket siap diantar ke counter gerai ${dynamicCourierName} terdekat.`}
                </p>
              </div>

              {/* Box Nomor Resi */}
              <div className="p-4 bg-white rounded-xl border border-[#EAEAEA] shadow-2xs space-y-2 text-left">
                <div className="flex items-center justify-between text-[#777777]">
                  <span className="text-[11px] font-semibold">
                    Nomor Resi / AWB ({dynamicCourierName} - {dynamicServiceName})
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-[#FFF1F0] text-[#9A0602] px-2 py-0.5 rounded">
                    Biteship Verified
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-mono font-bold text-[#1F1F1F] tracking-wide">
                    {shipmentResult.tracking_number}
                  </span>
                  <button
                    onClick={handleCopyResi}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F7F7F7] hover:bg-[#EAEAEA] text-[#1F1F1F] font-semibold text-xs transition cursor-pointer"
                  >
                    {isCopiedResi ? <Check className="w-3.5 h-3.5 text-[#027A48]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedResi ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                {/* Mock Barcode Graphic */}
                <div className="pt-2 border-t border-[#F0F0F0] flex flex-col items-center">
                  <div className="h-9 w-48 flex items-stretch gap-0.5 justify-center py-1 opacity-80">
                    {[1, 3, 2, 4, 1, 2, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2].map((w, i) => (
                      <div
                        key={i}
                        className={`bg-zinc-800 h-full ${w === 1 ? 'w-0.5' : w === 2 ? 'w-1' : w === 3 ? 'w-1.5' : 'w-2'}`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-[#777777]">{shipmentResult.tracking_number}</span>
                </div>
              </div>

              {/* Action Buttons Cetak PDF */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  onClick={handlePrintThermalLabel}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Label Pengiriman (PDF)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-[#EAEAEA] text-[#555555] hover:bg-[#F7F7F7] font-semibold text-xs transition cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Alamat Asal Penjemputan (Gudang Cabang) */}
              <div className="p-3.5 bg-[#F9F9F9] rounded-2xl border border-[#EAEAEA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#1F1F1F] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#9A0602]" />
                    <span>Alamat Asal Penjemputan (Shipper Origin)</span>
                  </span>
                  {selectedBranch?.isDefault && (
                    <span className="text-[10px] font-semibold text-[#9A0602] bg-[#FFF1F0] px-1.5 py-0.2 rounded border border-[#FECDCA]">
                      Cabang Utama
                    </span>
                  )}
                </div>

                {branches.length > 1 ? (
                  <select
                    value={selectedBranch?.id || ''}
                    onChange={(e) => {
                      const b = branches.find((item) => item.id === e.target.value);
                      if (b) setSelectedBranch(b);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#CCCCCC] bg-white text-xs font-semibold text-[#1F1F1F] focus:outline-none focus:border-[#9A0602]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branchName} — {b.city} (PIC: {b.picName})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="font-bold text-xs text-[#1F1F1F]">{selectedBranch?.branchName}</p>
                )}

                <div className="text-[11px] text-[#555555] space-y-0.5 pl-1">
                  <p className="font-medium text-[#1F1F1F]">
                    PIC: {selectedBranch?.picName} • Telp: {selectedBranch?.picPhone}
                  </p>
                  <p>{selectedBranch?.address}, {selectedBranch?.city}, {selectedBranch?.province}</p>
                  <p className="text-[#777777]">Kode Pos Origin: {selectedBranch?.postalCode}</p>
                </div>
              </div>

              {/* 2. Pilihan Kurir Ekspedisi Dinamis (Biteship API) */}
              <div className="space-y-2 p-3.5 bg-white rounded-2xl border border-[#EAEAEA]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1F1F1F] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#9A0602]" />
                    <span>Ekspedisi Pengiriman</span>
                  </label>
                  <span className="text-[11px] text-[#777777]">
                    Kurir Pilihan: <strong className="text-[#1F1F1F]">{dynamicCourierName}</strong>
                  </span>
                </div>

                {/* Courier Select Dropdown */}
                <select
                  value={selectedCourier?.courier_code || ''}
                  onChange={(e) => {
                    const c = availableCouriers.find((item) => item.courier_code === e.target.value);
                    if (c) handleCourierSelect(c);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs font-semibold text-[#1F1F1F] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602] cursor-pointer"
                >
                  {availableCouriers.map((c) => (
                    <option key={`${c.courier_code}-${c.courier_service_code}`} value={c.courier_code}>
                      {c.courier_name} - {c.courier_service_name} ({c.available_for_drop_off && c.available_for_pickup ? 'Drop-off & Pick-up' : c.available_for_drop_off ? 'Hanya Drop-off' : 'Hanya Pick-up'})
                    </option>
                  ))}
                </select>

                {/* Quick Selection Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {availableCouriers.slice(0, 5).map((c) => {
                    const isSelected = selectedCourier?.courier_code === c.courier_code;
                    return (
                      <button
                        key={c.courier_code}
                        type="button"
                        onClick={() => handleCourierSelect(c)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                          isSelected
                            ? 'bg-[#FFF1F0] text-[#9A0602] border-[#FECDCA] shadow-2xs'
                            : 'bg-white text-[#555555] border-[#EAEAEA] hover:bg-[#F7F7F7]'
                        }`}
                      >
                        {c.courier_name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Ringkasan Tujuan Pembeli */}
              <div className="p-3 bg-white rounded-xl border border-[#EAEAEA] flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#9A0602] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#777777] uppercase">Tujuan Pengiriman</span>
                  <p className="font-semibold text-xs text-[#1F1F1F]">{order.customerName} ({order.customerPhone})</p>
                  <p className="text-[11px] text-[#555555] line-clamp-1">{order.customerAddress}, {order.customerCity}</p>
                </div>
              </div>

              {/* 4. Pilihan Tab Metode: Drop-off vs Pick-up (Dinamis Sesuai Kurir) */}
              <div>
                <label className="block text-xs font-bold text-[#1F1F1F] mb-2">
                  Metode Penyerahan Paket
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Option 1: Drop Off */}
                  {(() => {
                    const isDropOffAllowed = selectedCourier ? selectedCourier.available_for_drop_off : true;
                    return (
                      <div
                        onClick={() => {
                          if (isDropOffAllowed) setDeliveryType('drop_off');
                        }}
                        className={`p-3 rounded-2xl border-2 transition flex flex-col justify-between ${
                          !isDropOffAllowed
                            ? 'opacity-40 bg-[#FAFAFA] border-[#EAEAEA] cursor-not-allowed'
                            : deliveryType === 'drop_off'
                            ? 'border-[#9A0602] bg-[#FFF1F0] cursor-pointer'
                            : 'border-[#EAEAEA] bg-white hover:border-[#CCCCCC] cursor-pointer'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-[#1F1F1F]">Antar ke Counter</span>
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                deliveryType === 'drop_off' && isDropOffAllowed
                                  ? 'border-[#9A0602] bg-[#9A0602]'
                                  : 'border-[#CCCCCC]'
                              }`}
                            >
                              {deliveryType === 'drop_off' && isDropOffAllowed && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-[#9A0602] bg-white px-1.5 py-0.2 rounded border border-[#FECDCA] inline-block mb-1">
                            Drop-off
                          </span>
                          <p className="text-[11px] text-[#555555] leading-snug">
                            {isDropOffAllowed
                              ? `Antar paket langsung ke gerai ${dynamicCourierName} terdekat tanpa perlu menunggu kurir.`
                              : `Layanan ${dynamicCourierName} tidak mendukung drop-off counter.`}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Option 2: Pick Up */}
                  {(() => {
                    const isPickupAllowed = selectedCourier ? selectedCourier.available_for_pickup : true;
                    return (
                      <div
                        onClick={() => {
                          if (isPickupAllowed) setDeliveryType('pickup');
                        }}
                        className={`p-3 rounded-2xl border-2 transition flex flex-col justify-between ${
                          !isPickupAllowed
                            ? 'opacity-40 bg-[#FAFAFA] border-[#EAEAEA] cursor-not-allowed'
                            : deliveryType === 'pickup'
                            ? 'border-[#9A0602] bg-[#FFF1F0] cursor-pointer'
                            : 'border-[#EAEAEA] bg-white hover:border-[#CCCCCC] cursor-pointer'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-[#1F1F1F]">Pick-up (Kurir Jemput)</span>
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                deliveryType === 'pickup' && isPickupAllowed
                                  ? 'border-[#9A0602] bg-[#9A0602]'
                                  : 'border-[#CCCCCC]'
                              }`}
                            >
                              {deliveryType === 'pickup' && isPickupAllowed && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-[#027A48] bg-[#ECFDF3] px-1.5 py-0.2 rounded border border-[#ABEFC6] inline-block mb-1">
                            Kurir Datang ke Gudang
                          </span>
                          <p className="text-[11px] text-[#555555] leading-snug">
                            {isPickupAllowed
                              ? `Kurir ${dynamicCourierName} akan datang menjemput paket ke alamat gudang Anda.`
                              : `Layanan ${dynamicCourierName} tidak mendukung penjemputan paket.`}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 5. Slot Picker jika Memilih Pick-up */}
              {deliveryType === 'pickup' && (
                <div className="p-3.5 bg-[#FFF9F9] rounded-2xl border border-[#FECDCA] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F1F1F]">
                    <Calendar className="w-4 h-4 text-[#9A0602]" />
                    <span>Jadwal Penjemputan Kurir ({dynamicCourierName})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-[#777777] mb-1">
                        Pilih Tanggal *
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs font-semibold text-[#1F1F1F] focus:outline-none focus:border-[#9A0602]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-[#777777] mb-1">
                        Slot Waktu Penjemputan *
                      </label>
                      <select
                        value={pickupTimeSlot}
                        onChange={(e) => setPickupTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EAEAEA] bg-white text-xs font-semibold text-[#1F1F1F] focus:outline-none focus:border-[#9A0602]"
                      >
                        <option value="09:00 - 12:00">Pagi (09:00 - 12:00 WIB)</option>
                        <option value="13:00 - 16:00">Siang (13:00 - 16:00 WIB)</option>
                        <option value="16:00 - 19:00">Sore (16:00 - 19:00 WIB)</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#706866]">
                    * Pastikan paket sudah selesai dikemas dan siap diserahkan saat kurir {dynamicCourierName} tiba.
                  </p>
                </div>
              )}
            </>
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
