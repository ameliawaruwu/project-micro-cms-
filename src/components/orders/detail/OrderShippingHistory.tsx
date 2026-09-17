import React from 'react';
import { Clock } from 'lucide-react';
import { Order, Store as StoreType } from '../../../types';
import { formatDateIndo } from '../../../utils/formatters';

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
  return (
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
  );
};
