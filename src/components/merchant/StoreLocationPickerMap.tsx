import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface StoreLocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  fullAddressString: string;
  onChangeCoordinates: (lat: number, lng: number) => void;
}

export const StoreLocationPickerMap: React.FC<StoreLocationPickerMapProps> = ({
  latitude,
  longitude,
  fullAddressString,
  onChangeCoordinates,
}) => {
  const [lat, setLat] = useState<number | ''>(latitude || '');
  const [lng, setLng] = useState<number | ''>(longitude || '');
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  useEffect(() => {
    if (latitude !== undefined) setLat(latitude);
    if (longitude !== undefined) setLng(longitude);
  }, [latitude, longitude]);

  // Ambil lokasi akurat melalui sensor GPS / Browser Geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Perangkat atau browser Anda tidak mendukung fitur deteksi lokasi GPS.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = Number(position.coords.latitude.toFixed(6));
        const userLng = Number(position.coords.longitude.toFixed(6));
        setLat(userLat);
        setLng(userLng);
        onChangeCoordinates(userLat, userLng);
        setIsLocating(false);
        setGpsSuccess(true);
        setTimeout(() => setGpsSuccess(false), 3500);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Gagal mendeteksi lokasi GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin akses lokasi ditolak. Harap izinkan akses lokasi pada browser Anda.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Informasi lokasi perangkat saat ini tidak tersedia.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Waktu permintaan lokasi habis. Silakan coba kembali.';
        }
        setGeoError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleManualCoordChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    onChangeCoordinates(newLat, newLng);
  };

  // URL Google Maps Embed & Open in Google Maps
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);

  const mapQuery = hasCoordinates
    ? `${lat},${lng}`
    : encodeURIComponent(fullAddressString || 'Indonesia');

  const embedMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const openExternalMapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressString || 'Indonesia')}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0DD] overflow-hidden shadow-xs space-y-3 p-4 sm:p-5 font-poppins">
      {/* Header Titik Lokasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#E5E0DD]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Titik Keakuratan Lokasi Toko (Peta GPS)
            </h4>
            <p className="text-[11px] text-gray-500">
              Bantu kurir logistik dan pembeli menemukan posisi fisik toko Anda dengan presisi
            </p>
          </div>
        </div>

        {/* Action Button: GPS Picker */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs ${
            gpsSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-[#66000E] hover:bg-[#52000B] text-white active:scale-95'
          }`}
        >
          {isLocating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Mencari GPS...</span>
            </>
          ) : gpsSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Titik GPS Terkunci!</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Ambil Titik GPS Saya</span>
            </>
          )}
        </button>
      </div>

      {/* Alert Notifikasi Geolocation Error */}
      {geoError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Frame Tampilan Peta Interaktif */}
      <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
        <iframe
          title="Titik Lokasi Toko di Peta"
          src={embedMapUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />

        {/* Overlay Badge Status Lokasi */}
        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs flex items-center gap-1.5 text-[11px] font-medium text-gray-800">
          <span className={`w-2 h-2 rounded-full ${hasCoordinates ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          <span>
            {hasCoordinates
              ? 'Titik Lokasi GPS Terkunci'
              : 'Menampilkan perkiraan lokasi toko'}
          </span>
        </div>

        {/* Link Eksternal Google Maps */}
        <a
          href={openExternalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-xs flex items-center gap-1 text-[11px] font-semibold text-gray-800 transition cursor-pointer"
        >
          <ExternalLink className="w-3 h-3 text-[#66000E]" />
          <span>Buka di Google Maps</span>
        </a>
      </div>
    </div>
  );
};
