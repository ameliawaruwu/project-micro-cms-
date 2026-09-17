import React from 'react';
import {
  Building2,
  Truck,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  Order,
  ShippingBranch,
  ShippingMethod,
  AvailableCourier,
} from '../../types';

interface ShipmentFulfillmentFormProps {
  order: Order;
  branches: ShippingBranch[];
  selectedBranch: ShippingBranch | null;
  setSelectedBranch: (branch: ShippingBranch) => void;
  availableCouriers: AvailableCourier[];
  selectedCourier: AvailableCourier | null;
  handleCourierSelect: (courier: AvailableCourier) => void;
  deliveryType: ShippingMethod;
  setDeliveryType: (type: ShippingMethod) => void;
  pickupDate: string;
  setPickupDate: (date: string) => void;
  pickupTimeSlot: string;
  setPickupTimeSlot: (slot: string) => void;
  dynamicCourierName: string;
}

export const ShipmentFulfillmentForm: React.FC<ShipmentFulfillmentFormProps> = ({
  order,
  branches,
  selectedBranch,
  setSelectedBranch,
  availableCouriers,
  selectedCourier,
  handleCourierSelect,
  deliveryType,
  setDeliveryType,
  pickupDate,
  setPickupDate,
  pickupTimeSlot,
  setPickupTimeSlot,
  dynamicCourierName,
}) => {
  return (
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
  );
};
