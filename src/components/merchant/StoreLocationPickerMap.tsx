import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Check,
  AlertCircle,
  RefreshCw,
  Search,
  Sparkles,
  X,
  Crosshair,
  Loader2,
} from 'lucide-react';
import {
  wilayahService,
  ReverseGeocodeResult,
  PlaceSearchResult,
} from '../../services/wilayahService';

interface StoreLocationPickerMapProps {
  latitude?: number;
  longitude?: number;
  fullAddressString?: string;
  onChangeCoordinates: (lat: number, lng: number) => void;
  onLocationSelect?: (locationData: ReverseGeocodeResult) => void;
}

const createCustomPin = () => {
  return L.divIcon({
    className: 'kroomify-pin-wrapper',
    html: `
      <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
        <div style="width: 34px; height: 34px; background: #66000E; border: 2.5px solid #FFFFFF; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 6px 16px rgba(102,0,14,0.45); display: flex; align-items: center; justify-content: center;">
          <div style="width: 10px; height: 10px; background: #FFFFFF; border-radius: 50%; transform: rotate(45deg); box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
        </div>
        <div style="position: absolute; bottom: -3px; width: 14px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1.5px);"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export const StoreLocationPickerMap: React.FC<StoreLocationPickerMapProps> = ({
  latitude,
  longitude,
  fullAddressString,
  onChangeCoordinates,
  onLocationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default coordinate (Bandung / Telkom University / Indonesia center)
  const defaultLat = latitude && !isNaN(latitude) ? latitude : -6.9730;
  const defaultLng = longitude && !isNaN(longitude) ? longitude : 107.6303;

  const [currentLat, setCurrentLat] = useState<number>(defaultLat);
  const [currentLng, setCurrentLng] = useState<number>(defaultLng);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [lastDetectedAddress, setLastDetectedAddress] = useState<string | null>(null);
  const [autoFillSuccess, setAutoFillSuccess] = useState(false);

  // Search places state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Trigger Reverse Geocode and send data to parent
  const performReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsReverseGeocoding(true);
      setGeoError(null);
      try {
        const result = await wilayahService.reverseGeocode(lat, lng);
        if (result) {
          const summaryParts = [
            result.address,
            result.village,
            result.district,
            result.city,
          ].filter(Boolean);
          const summary = summaryParts.length > 0 ? summaryParts.join(', ') : result.displayName;
          setLastDetectedAddress(summary || null);
          setAutoFillSuccess(true);
          setTimeout(() => setAutoFillSuccess(false), 5000);

          if (onLocationSelect) {
            onLocationSelect(result);
          }
        }
      } catch (err) {
        console.warn('[StoreLocationPickerMap] Reverse geocode error:', err);
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [onLocationSelect]
  );

  // Handle marker position update
  const updateMarkerAndNotify = useCallback(
    (lat: number, lng: number, shouldReverseGeocode: boolean = true) => {
      const cleanLat = Number(lat.toFixed(6));
      const cleanLng = Number(lng.toFixed(6));
      setCurrentLat(cleanLat);
      setCurrentLng(cleanLng);

      if (markerRef.current) {
        markerRef.current.setLatLng([cleanLat, cleanLng]);
      }

      onChangeCoordinates(cleanLat, cleanLng);

      if (shouldReverseGeocode) {
        performReverseGeocode(cleanLat, cleanLng);
      }
    },
    [onChangeCoordinates, performReverseGeocode]
  );

  // Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = latitude && !isNaN(latitude) ? latitude : -6.9730;
    const initialLng = longitude && !isNaN(longitude) ? longitude : 107.6303;
    const initialZoom = latitude && longitude ? 16 : 14;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
    });

    // Tile Layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control di kanan bawah
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Marker Pin Draggable
    const marker = L.marker([initialLat, initialLng], {
      icon: createCustomPin(),
      draggable: true,
      autoPan: true,
    }).addTo(map);

    // Drag marker event
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      updateMarkerAndNotify(pos.lat, pos.lng, true);
    });

    // Click map event
    map.on('click', (e: L.LeafletMouseEvent) => {
      updateMarkerAndNotify(e.latlng.lat, e.latlng.lng, true);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Handle container resize
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker jika props koordinat berubah dari luar
  useEffect(() => {
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      if (
        Math.abs(latitude - currentLat) > 0.00001 ||
        Math.abs(longitude - currentLng) > 0.00001
      ) {
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([latitude, longitude]);
        }
      }
    }
  }, [latitude, longitude]);

  // Ambil lokasi akurat melalui sensor GPS / Geolocation
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

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 17, {
            duration: 1.2,
          });
        }

        updateMarkerAndNotify(userLat, userLng, true);
        setIsLocating(false);
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

  // Live Search Places di Nominatim
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!val.trim() || val.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const places = await wilayahService.searchPlaces(val);
        setSearchResults(places);
        setShowSearchResults(places.length > 0);
      } catch (err) {
        console.warn('Search places error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  const handleSelectSearchResult = (place: PlaceSearchResult) => {
    setSearchQuery(place.name || place.displayName);
    setShowSearchResults(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.latitude, place.longitude], 17, {
        duration: 1.2,
      });
    }

    updateMarkerAndNotify(place.latitude, place.longitude, true);
  };

  const openExternalMapUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0DD] overflow-hidden shadow-xs space-y-3 p-4 sm:p-5 font-poppins">
      {/* Header Titik Lokasi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#E5E0DD]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center font-bold shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
              <span>Titik Keakuratan Lokasi Toko (Peta GPS)</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                <Sparkles className="w-2.5 h-2.5" />
                Auto-Fill Alamat
              </span>
            </h4>
            <p className="text-[11px] text-gray-500">
              Klik atau geser pin merah pada peta. Alamat, kelurahan, kecamatan, dan kota akan terisi otomatis!
            </p>
          </div>
        </div>

        {/* Action Button: GPS Picker */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs bg-[#66000E] hover:bg-[#52000B] text-white active:scale-95 disabled:opacity-75"
        >
          {isLocating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Mencari GPS...</span>
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

      {/* Pencarian Tempat & Gedung Cepat */}
      <div className="relative z-20">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => {
              if (searchResults.length > 0) setShowSearchResults(true);
            }}
            placeholder="Ketik nama jalan, gedung, kampus, atau patokan lokasi untuk mencari..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowSearchResults(false);
              }}
              className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-8">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#66000E]" />
            </div>
          )}
        </div>

        {/* Dropdown Hasil Pencarian Tempat */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-30 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-1">
            {searchResults.map((place, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSearchResult(place)}
                className="w-full text-left px-3.5 py-2 hover:bg-[#F5E8EA]/40 border-b border-gray-100 last:border-b-0 transition flex items-start gap-2.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#66000E] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-900 truncate">
                    {place.name}
                  </div>
                  <div className="text-[11px] text-gray-500 line-clamp-1">
                    {place.displayName}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Frame Peta Interaktif Leaflet */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Status Loading Reverse Geocode */}
        {isReverseGeocoding && (
          <div className="absolute top-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-gray-200 shadow-md flex items-center gap-2 text-xs font-semibold text-[#66000E] animate-in fade-in">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#66000E]" />
            <span>Mendeteksi alamat dari titik peta...</span>
          </div>
        )}

        {/* Status Berhasil Auto-Fill */}
        {!isReverseGeocoding && autoFillSuccess && lastDetectedAddress && (
          <div className="absolute top-2.5 left-2.5 z-20 max-w-[85%] bg-emerald-50/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-emerald-300 shadow-md flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-1">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              Alamat terisi otomatis: <strong className="font-bold">{lastDetectedAddress}</strong>
            </span>
          </div>
        )}

        {/* Petunjuk Interaksi pada Peta */}
        {!isReverseGeocoding && !autoFillSuccess && (
          <div className="absolute top-2.5 left-2.5 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs flex items-center gap-1.5 text-[11px] font-medium text-gray-700 pointer-events-none">
            <Crosshair className="w-3 h-3 text-[#66000E]" />
            <span>Klik peta atau geser pin merah untuk ubah titik</span>
          </div>
        )}

        {/* Link Eksternal Google Maps */}
        <a
          href={openExternalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2.5 left-2.5 z-20 bg-white/95 hover:bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-xs flex items-center gap-1 text-[11px] font-semibold text-gray-800 transition cursor-pointer"
        >
          <ExternalLink className="w-3 h-3 text-[#66000E]" />
          <span>Buka di Google Maps ({currentLat.toFixed(4)}, {currentLng.toFixed(4)})</span>
        </a>
      </div>
    </div>
  );
};
