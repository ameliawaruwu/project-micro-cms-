import React from 'react';
import { Clock } from 'lucide-react';
import { Order, Store as StoreType } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface OrderShippingHistoryProps {
  order: Order;
  store?: StoreType | null;
  vehicleType: 'motor' | 'mobil';
  isInstant: boolean;
  destinationLandmark: string;
  destinationCityClean: string;
  originCity: string;
}

export const OrderShippingHistory: React.FC<OrderShippingHistoryProps> = ({
  order,
  store,
  vehicleType,
  isInstant,
  destinationLandmark,
  destinationCityClean,
  originCity,
}) => {
  const { isEn } = useLanguage();
  const formatOrderDate = (value: string | undefined | null): string => {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
    } catch {
      return value;
    }
  };
  return (
    <div className="p-3.5 sm:p-4 bg-white border-t border-[#E5E0DD] space-y-3 font-poppins">
      <div className="flex items-center justify-between">
        <span className="font-bold text-xs text-[#1F1F1F] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#66000E]" />
          <span>{isEn ? 'Courier Trip History' : 'Riwayat Perjalanan Kurir'}</span>
        </span>
        <span className="text-[10px] text-[#777777]">{isEn ? 'Latest Updates' : 'Pembaruan Terkini'}</span>
      </div>

      {/* Realistic Checkpoints */}
      <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E0DD]">
        {/* Log 1: Currently active checkpoint */}
        <div className="relative">
          <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#66000E] ring-4 ring-[#F5E8EA] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1F1F1F] text-xs flex items-center gap-1.5">
                <span>{vehicleType === 'motor'
                  ? (isEn ? '🛵 Motorbike Courier Delivering' : '🛵 Kurir Motor Sedang Mengantar')
                  : (isEn ? '🚐 Box Van Delivering' : '🚐 Mobil Box Sedang Mengantar')}</span>
              </span>
              <span className="text-[10px] text-[#777777]">{isEn ? 'Today' : 'Hari ini'}</span>
            </div>
            <p className="text-[11px] text-[#555555] mt-0.5">
              {isEn
                ? order.shippingStatus === 'Selesai'
                  ? `The package has been successfully handed over to ${order.customerName}.`
                  : isInstant
                  ? `${order.courier} courier is on the way delivering the order directly to ${destinationLandmark}, ${destinationCityClean}.`
                  : `${order.courier} ${vehicleType === 'motor' ? 'motorbike' : 'box van'} courier is on the way to ${destinationLandmark}, ${destinationCityClean}.`
                : order.shippingStatus === 'Selesai'
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
                  ? (isEn ? `Package Picked Up by ${order.courier} Courier` : `Paket Selesai Di-Pickup oleh Kurir ${order.courier}`)
                  : (isEn ? `Arrived at Sorting Hub Gateway (${destinationCityClean})` : `Tiba di Sorting Hub Gateway (${destinationCityClean})`)}
              </span>
              <span className="text-[10px] text-[#777777]">{formatOrderDate(order.createdAt)}</span>
            </div>
            <p className="text-[11px] text-[#777777] mt-0.5">
              {isInstant
                ? (isEn
                  ? `${order.courier} driver has picked up the package from ${store?.name || ''} and confirmed the pickup.`
                  : `Driver ${order.courier} telah mengambil paket dari toko ${store?.name || ''} dan mengonfirmasi penjemputan.`)
                : (isEn
                  ? `The package was carried by the transit fleet and cleared hub sorting for last-mile delivery.`
                  : `Paket diangkut armada transit dan lolos sortir hub logistik untuk pengantaran last-mile.`)}
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
                  ? (isEn ? `Order Processed & ${order.courier} Driver Assigned` : `Pesanan Diproses & Driver ${order.courier} Dialokasikan`)
                  : (isEn ? `Package Handed to Courier Outlet (${originCity.split(',')[0]})` : `Paket Diserahkan ke Gerai Kurir (${originCity.split(',')[0]})`)}
              </span>
              <span className="text-[10px] text-[#777777]">{formatOrderDate(order.createdAt)}</span>
            </div>
            <p className="text-[11px] text-[#777777] mt-0.5">
              {isInstant
                ? (isEn ? `The instant delivery system matched the order with the nearest courier.` : `Sistem pengiriman langsung menghubungkan pesanan dengan kurir terdekat.`)
                : (isEn ? `The official tracking number was issued through the logistics system integration.` : `Nomor resi resmi diterbitkan melalui integrasi sistem logistik.`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
