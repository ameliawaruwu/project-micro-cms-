import React, { useState } from 'react';
import {
  Navigation,
  Check,
  Copy,
  ExternalLink,
  Map as MapIcon,
  Sparkles,
  Route,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { Order, Store as StoreType } from '../../../types';
import {
  MotorDeliveryIllustration,
  MobilDeliveryIllustration,
} from './DeliveryIllustrations';

interface OrderLiveTrackingMapProps {
  order: Order;
  store?: StoreType | null;
  copiedResi: boolean;
  handleCopyResi: () => void;
  biteshipTrackingUrl: string;
  vehicleType: 'motor' | 'mobil';
  isInstant: boolean;
  driverInfo: {
    name: string;
    plate: string;
    vehicleLabel: string;
    statusDesc: string;
  };
  destinationLandmark: string;
  destinationCityClean: string;
  originCity: string;
  destinationAddress: string;
}

export const OrderLiveTrackingMap: React.FC<OrderLiveTrackingMapProps> = ({
  order,
  store,
  copiedResi,
  handleCopyResi,
  biteshipTrackingUrl,
  vehicleType,
  isInstant,
  driverInfo,
  destinationLandmark,
  destinationCityClean,
  originCity,
  destinationAddress,
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [mapDisplayMode, setMapDisplayMode] = useState<'route_map' | 'google_maps'>('route_map');

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originCity)}&destination=${encodeURIComponent(destinationAddress)}`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationAddress)}`;

  return (
    <div className="rounded-2xl border border-[#EAEAEA] bg-white overflow-hidden shadow-xs">
      {/* Header: Kurir & Nomor Resi */}
      <div className="p-3.5 sm:p-4 bg-[#FDFBFB] border-b border-[#EAEAEA] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF1F0] border border-[#FECDCA] text-[#9A0602] flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-[#1F1F1F]">
                Pelacakan & Logistik Pengiriman
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#1F1F1F] border border-[#EAEAEA] shadow-2xs">
                {order.courier} {order.courierService || 'Reguler'}
              </span>
            </div>
            <div className="text-[11px] text-[#777777] mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>No. Resi:</span>
              <strong className="font-mono text-[#1F1F1F]">{order.resiNumber || 'Belum terbit'}</strong>
              {order.resiNumber && (
                <button
                  type="button"
                  onClick={handleCopyResi}
                  className="p-1 hover:bg-[#F0F0F0] rounded text-[#777777] hover:text-[#1F1F1F] transition cursor-pointer"
                  title="Salin Resi"
                >
                  {copiedResi ? <Check className="w-3.5 h-3.5 text-[#027A48]" /> : <Copy className="w-3.5 h-3.5 text-[#777777]" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Biteship Live Link */}
        <div className="flex items-center gap-2 shrink-0">
          {order.resiNumber && (
            <a
              href={biteshipTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#FFF1F0] text-[#9A0602] border border-[#FECDCA] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#FEE4E2] transition cursor-pointer"
            >
              <span>Lacak Live Biteship</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Live Courier Vehicle Banner (Gambar Motor atau Mobil) */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#FFF5F5] via-white to-[#FDFBFB] flex flex-col sm:flex-row items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-white border-2 border-[#FECDCA] shadow-xs flex items-center justify-center p-1 shrink-0 relative overflow-hidden group">
            {vehicleType === 'motor' ? (
              <MotorDeliveryIllustration className="w-full h-full transform group-hover:scale-105 transition duration-300" />
            ) : (
              <MobilDeliveryIllustration className="w-full h-full transform group-hover:scale-105 transition duration-300" />
            )}
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#12B76A] ring-2 ring-white animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-xs sm:text-sm text-[#1F1F1F]">
                {driverInfo.vehicleLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-ping" />
                <span>Live Driver</span>
              </span>
            </div>

            <p className="text-[11px] text-[#555555] mt-0.5 leading-snug">
              {driverInfo.statusDesc}
            </p>

            <div className="flex items-center gap-2 mt-1 text-[10px] text-[#777777] font-mono flex-wrap">
              <span className="font-bold text-[#1F1F1F] bg-white px-1.5 py-0.5 rounded border border-[#EAEAEA]">
                Plat: {driverInfo.plate}
              </span>
              <span>•</span>
              <span>{driverInfo.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACCORDION TOGGLE UNTUK PETA RUTE PENGIRIMAN */}
      <div className="border-t border-[#EAEAEA]">
        <button
          type="button"
          onClick={() => setIsMapExpanded((prev) => !prev)}
          className="w-full py-2.5 px-3.5 sm:px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#1F1F1F] transition cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#9A0602]/10 text-[#9A0602] flex items-center justify-center">
              <MapIcon className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-[#1F1F1F]">Visual Peta & Jalur Pengiriman</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#777777] border border-[#EAEAEA] font-medium hidden sm:inline-block">
              {isMapExpanded ? 'Sedang Ditampilkan' : 'Opsional • Klik untuk Buka Peta'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#9A0602] text-xs font-bold">
            <span>{isMapExpanded ? 'Sembunyikan Peta' : 'Buka Peta'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMapExpanded ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Collapsible Content: Interactive Map & Google Maps */}
        {isMapExpanded && (
          <div className="p-3 sm:p-4 space-y-3 bg-[#FAFAFA] border-t border-[#EAEAEA] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Map Display Mode Switcher */}
            <div className="flex items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#1F1F1F]">
                <Sparkles className="w-3.5 h-3.5 text-[#9A0602]" />
                <span>Jalur Pengiriman Toko ➔ Pembeli</span>
              </div>

              <div className="flex items-center gap-1 bg-[#EDEDED] p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setMapDisplayMode('route_map')}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer ${
                    mapDisplayMode === 'route_map'
                      ? 'bg-white text-[#9A0602] shadow-2xs font-bold'
                      : 'text-[#777777] hover:text-[#1F1F1F]'
                  }`}
                >
                  <Route className="w-3 h-3" />
                  <span>Peta Rute Interaktif</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapDisplayMode('google_maps')}
                  className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition cursor-pointer ${
                    mapDisplayMode === 'google_maps'
                      ? 'bg-white text-[#1F1F1F] shadow-2xs font-bold'
                      : 'text-[#777777] hover:text-[#1F1F1F]'
                  }`}
                >
                  <MapIcon className="w-3 h-3" />
                  <span>Google Maps</span>
                </button>
              </div>
            </div>

            {/* 1A. LIVE ROUTE MAP CANVAS */}
            {mapDisplayMode === 'route_map' ? (
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#EAEAEA] bg-[#F8FAFC] select-none shadow-inner">
                {/* Background Realistic Map Street Canvas */}
                <svg viewBox="0 0 700 320" className="w-full h-full absolute inset-0 preserve-3d" preserveAspectRatio="none">
                  <rect width="700" height="320" fill="#F1F5F9" />
                  <path d="M 0 160 Q 180 180 320 120 T 700 140" fill="none" stroke="#E0F2FE" strokeWidth="24" strokeLinecap="round" />
                  <path d="M 0 160 Q 180 180 320 120 T 700 140" fill="none" stroke="#BAE6FD" strokeWidth="12" strokeLinecap="round" />
                  <rect x="40" y="30" width="120" height="70" rx="8" fill="#DCFCE7" opacity="0.6" />
                  <rect x="220" y="220" width="140" height="60" rx="8" fill="#DCFCE7" opacity="0.6" />
                  <rect x="480" y="160" width="160" height="80" rx="8" fill="#DCFCE7" opacity="0.6" />
                  <path d="M 0 60 H 700 M 0 260 H 700" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 160 0 V 320 M 380 0 V 320 M 520 0 V 320" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 0 200 L 700 180" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 60 0 L 260 320" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 440 0 L 620 320" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />

                  {/* Highway Glow & Line */}
                  <path
                    d="M 120 240 C 220 240, 260 170, 360 170 C 450 170, 480 95, 570 85"
                    fill="none"
                    stroke="#FEE2E2"
                    strokeWidth="18"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 120 240 C 220 240, 260 170, 360 170 C 450 170, 480 95, 570 85"
                    fill="none"
                    stroke="#9A0602"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 120 240 C 220 240, 260 170, 360 170 C 450 170, 480 95, 570 85"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeDasharray="9 7"
                    strokeLinecap="round"
                  >
                    <animate attributeName="stroke-dashoffset" from="32" to="0" dur="0.9s" repeatCount="indefinite" />
                  </path>

                  <text x="180" y="275" fill="#94A3B8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                    {isInstant ? `Rute Langsung ${order.courier}` : `Rute Antarkota ➔ Hub ${destinationCityClean}`}
                  </text>
                  <text x="440" y="70" fill="#94A3B8" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                    Menuju Kawasan {destinationCityClean}
                  </text>
                </svg>

                {/* Origin Store Pin */}
                <div className="absolute left-[10%] bottom-[12%] sm:bottom-[15%] -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10">
                  <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border-2 border-[#027A48] flex items-center gap-1.5 transition transform group-hover:scale-105">
                    <div className="w-5 h-5 rounded-md bg-[#ECFDF3] flex items-center justify-center text-xs">
                      🏬
                    </div>
                    <div>
                      <p className="font-black text-[10px] text-[#027A48] leading-none uppercase">Asal Toko</p>
                      <p className="text-[9px] text-[#1F1F1F] font-bold truncate max-w-[90px] sm:max-w-[110px]">{store?.name || 'Toko Pengirim'}</p>
                      <p className="text-[8px] text-[#777777] leading-none">{originCity.split(',')[0]}</p>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 bg-[#027A48] rotate-45 -mt-1 rounded-xs" />
                  <div className="relative mt-0.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#027A48] ring-4 ring-[#ECFDF3] shadow-md" />
                  </div>
                </div>

                {/* Intermediate transit box */}
                {!isInstant && (
                  <div className="absolute left-[30%] bottom-[32%] -translate-x-1/2 hidden sm:flex flex-col items-center z-10">
                    <div className="bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-[#EAEAEA] shadow-xs text-[9px] font-bold text-[#555555] flex items-center gap-1">
                      <span className="text-xs">🚐</span>
                      <span>Mobil Box Transit</span>
                    </div>
                    <span className="text-[7px] text-[#94A3B8] font-mono">Antarkota</span>
                  </div>
                )}

                {/* Checkpoint Transit Hub */}
                {!isInstant && (
                  <div className="absolute left-[50%] top-[48%] -translate-x-1/2 -translate-y-1/2 hidden sm:flex flex-col items-center z-10">
                    <div className="bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg border border-[#EAEAEA] shadow-xs text-[9px] font-bold text-[#1F1F1F] flex items-center gap-1">
                      <span>🏢</span>
                      <span>Hub Gateway {destinationCityClean}</span>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#64748B] ring-2 ring-white mt-0.5" />
                  </div>
                )}

                {/* Moving Vehicle Marker */}
                <div className="absolute left-[64%] sm:left-[67%] top-[34%] sm:top-[33%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 animate-in fade-in zoom-in">
                  <div className="bg-[#9A0602] text-white px-3 py-1 rounded-xl shadow-xl border-2 border-white flex items-center gap-2 animate-bounce duration-1000">
                    <span className="text-base sm:text-lg">
                      {vehicleType === 'motor' ? '🛵' : '🚐'}
                    </span>
                    <div>
                      <p className="font-black text-[10px] text-white uppercase leading-tight tracking-wide flex items-center gap-1">
                        <span>{isInstant ? 'Kurir Instant' : vehicleType === 'motor' ? 'Kurir Motor Last-Mile' : 'Mobil Box Pengantar'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-ping inline-block" />
                      </p>
                      <p className="text-[9px] text-[#FECDCA] font-medium leading-none">
                        {order.courier} • Mengantar ke Lokasi
                      </p>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 bg-[#9A0602] rotate-45 -mt-1 rounded-xs" />
                  <div className="relative mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-[#9A0602] ring-4 ring-[#FFF1F0] shadow-lg flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    </div>
                    <div className="absolute -inset-2 rounded-full bg-[#9A0602]/20 animate-ping" />
                  </div>
                </div>

                {/* Destination Pin */}
                <div className="absolute right-[8%] sm:right-[10%] top-[8%] sm:top-[12%] translate-x-1/2 flex flex-col items-center group cursor-pointer z-10">
                  <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border-2 border-[#9A0602] flex items-center gap-1.5 transition transform group-hover:scale-105">
                    <div className="w-5 h-5 rounded-md bg-[#FFF1F0] flex items-center justify-center text-xs">
                      🏠
                    </div>
                    <div>
                      <p className="font-black text-[10px] text-[#9A0602] leading-none uppercase">Lokasi Tujuan</p>
                      <p className="text-[9px] text-[#1F1F1F] font-bold truncate max-w-[100px] sm:max-w-[140px]">
                        {destinationLandmark}
                      </p>
                      <p className="text-[8px] text-[#777777] leading-none">
                        {order.customerName} ({destinationCityClean})
                      </p>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 bg-[#9A0602] rotate-45 -mt-1 rounded-xs" />
                  <div className="relative mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-[#9A0602] ring-4 ring-[#FFF1F0] shadow-md" />
                    <div className="absolute -inset-1.5 rounded-full bg-[#9A0602] animate-ping opacity-60" />
                  </div>
                </div>

                {/* Top Bar Notification */}
                <div className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#EAEAEA] shadow-md flex items-center justify-between sm:justify-start gap-2.5 z-20 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12B76A] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#12B76A]"></span>
                    </span>
                    <span className="font-bold text-[11px] text-[#1F1F1F]">
                      {vehicleType === 'motor' ? '🛵 Kurir Motor' : '🚐 Mobil Box'} sedang menuju lokasimu
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#027A48] bg-[#ECFDF3] px-2 py-0.5 rounded-md border border-[#ABEFC6]">
                    Estimasi: Hari ini
                  </span>
                </div>

                {/* Bottom-right Distance ETA Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#EAEAEA] shadow-md text-[10px] text-[#1F1F1F] font-mono z-20 pointer-events-none hidden sm:flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-[#9A0602]" />
                  <span>Sisa Jarak: <strong>~{isInstant ? '2.4' : '3.8'} km</strong> • {destinationCityClean}</span>
                </div>
              </div>
            ) : (
              /* 1B. GOOGLE MAPS ASLI */
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-[#EAEAEA] bg-[#EAEAEA] shadow-inner">
                <iframe
                  title={`Google Maps Delivery ${order.customerName}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(destinationAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />

                <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#EAEAEA] shadow-md flex items-center gap-2 pointer-events-none">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#12B76A] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#12B76A]"></span>
                  </span>
                  <span className="font-semibold text-[11px] text-[#1F1F1F]">
                    Pin Tujuan: {order.customerCity}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#EAEAEA] shadow-lg flex items-center gap-2.5 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF1F0] border border-[#FECDCA] flex items-center justify-center text-xl shrink-0">
                    {vehicleType === 'motor' ? '🛵' : '🚐'}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#1F1F1F] flex items-center gap-1.5">
                      <span>{vehicleType === 'motor' ? 'Kurir Motor En-Route' : 'Mobil Box En-Route'}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-ping" />
                    </div>
                    <p className="text-[10px] text-[#555555] max-w-[200px] truncate">
                      {order.customerDistrict || order.customerCity}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Direct Action Links (Google Maps Directions & Pin) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#555555]">
                <MapPin className="w-3.5 h-3.5 text-[#9A0602]" />
                <span>Terhubung langsung dengan rute navigasi ekspedisi</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-[11px] flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Buka Rute di Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#EAEAEA] text-[#1F1F1F] hover:bg-[#F7F7F7] font-semibold text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MapIcon className="w-3.5 h-3.5 text-[#555555]" />
                  <span>Titik Alamat</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
