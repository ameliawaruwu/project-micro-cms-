import type { BiteshipRateOption, CourierType } from '../types';

/**
 * Rumus tarif ongkir cadangan (tanpa akses jaringan). Dipakai bersama oleh browser dan server
 * agar tarif yang ditampilkan ke pembeli sama persis dengan tarif yang disahkan server saat
 * pesanan dibuat. Jangan menambah impor yang menyentuh browser/Supabase di berkas ini.
 */

export interface ShippingRate {
  courier: CourierType;
  serviceName: string;
  etd: string;
  cost: number;
  description: string;
  badge?: string;
  courierCode?: string;
  courierServiceCode?: string;
  /** Tanda tangan server atas tarif ini; wajib dikirim saat membuat pesanan. */
  quote?: string;
}

export interface CityOption {
  id: string;
  name: string;
  province: string;
  postalCode: string;
  zone: 'jabodetabek' | 'jawa' | 'luar_jawa';
}

export const INDONESIAN_CITIES: CityOption[] = [
  { id: 'jkt-selatan', name: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12730', zone: 'jabodetabek' },
  { id: 'jkt-pusat', name: 'Jakarta Pusat', province: 'DKI Jakarta', postalCode: '10110', zone: 'jabodetabek' },
  { id: 'jkt-barat', name: 'Jakarta Barat', province: 'DKI Jakarta', postalCode: '11460', zone: 'jabodetabek' },
  { id: 'bogor', name: 'Kota Bogor', province: 'Jawa Barat', postalCode: '16111', zone: 'jabodetabek' },
  { id: 'depok', name: 'Kota Depok', province: 'Jawa Barat', postalCode: '16411', zone: 'jabodetabek' },
  { id: 'tangerang', name: 'Kota Tangerang', province: 'Banten', postalCode: '15111', zone: 'jabodetabek' },
  { id: 'bekasi', name: 'Kota Bekasi', province: 'Jawa Barat', postalCode: '17111', zone: 'jabodetabek' },
  { id: 'bandung', name: 'Kota Bandung', province: 'Jawa Barat', postalCode: '40111', zone: 'jawa' },
  { id: 'semarang', name: 'Kota Semarang', province: 'Jawa Tengah', postalCode: '50131', zone: 'jawa' },
  { id: 'solo', name: 'Kota Solo / Surakarta', province: 'Jawa Tengah', postalCode: '57111', zone: 'jawa' },
  { id: 'pekalongan', name: 'Kota Pekalongan', province: 'Jawa Tengah', postalCode: '51111', zone: 'jawa' },
  { id: 'jogja', name: 'DI Yogyakarta', province: 'DI Yogyakarta', postalCode: '55111', zone: 'jawa' },
  { id: 'surabaya', name: 'Kota Surabaya', province: 'Jawa Timur', postalCode: '60293', zone: 'jawa' },
  { id: 'malang', name: 'Kota Malang', province: 'Jawa Timur', postalCode: '65111', zone: 'jawa' },
  { id: 'denpasar', name: 'Kota Denpasar', province: 'Bali', postalCode: '80111', zone: 'luar_jawa' },
  { id: 'medan', name: 'Kota Medan', province: 'Sumatera Utara', postalCode: '20111', zone: 'luar_jawa' },
  { id: 'makassar', name: 'Kota Makassar', province: 'Sulawesi Selatan', postalCode: '90111', zone: 'luar_jawa' },
];

/** Tarif simulasi per kode pos (cadangan bila Biteship tidak bisa dihubungi). */
export function simulateCourierRates(
  originPostal: string | number,
  destinationPostalCode: string | number,
  weight: number
): BiteshipRateOption[] {
  const isNearby = String(originPostal).slice(0, 2) === String(destinationPostalCode).slice(0, 2);
  const weightKg = Math.max(1, Math.ceil(weight / 1000));

  const simulatedRates: BiteshipRateOption[] = [
    {
      courier_name: 'J&T Express',
      courier_code: 'jnt',
      courier_service_name: 'EZ Regular',
      courier_service_code: 'ez',
      tier: 'standard',
      description: 'Layanan reguler dengan jaringan jemput & antar terluas',
      service_type: 'standard',
      shipping_type: 'parcel',
      price: (isNearby ? 11000 : 18000) * weightKg,
      etd: isNearby ? '1-2 Hari' : '2-3 Hari',
      badge: 'Paling Populer',
    },
    {
      courier_name: 'SiCepat Ekspres',
      courier_code: 'sicepat',
      courier_service_name: 'SIUNTUNG / Reguler',
      courier_service_code: 'siuntung',
      tier: 'standard',
      description: 'Pick-up cepat kurir ke gudang tanpa minimum paket',
      service_type: 'standard',
      shipping_type: 'parcel',
      price: (isNearby ? 12000 : 19000) * weightKg,
      etd: isNearby ? '1 Hari' : '2-3 Hari',
    },
    {
      courier_name: 'JNE',
      courier_code: 'jne',
      courier_service_name: 'REG (Reguler)',
      courier_service_code: 'reg',
      tier: 'standard',
      description: 'Jaringan gerai fisik terbanyak hingga pelosok kecamatan',
      service_type: 'standard',
      shipping_type: 'parcel',
      price: (isNearby ? 13000 : 20000) * weightKg,
      etd: isNearby ? '1-2 Hari' : '2-4 Hari',
    },
    {
      courier_name: 'J&T Express',
      courier_code: 'jnt',
      courier_service_name: 'SUPER Express',
      courier_service_code: 'super',
      tier: 'express',
      description: 'Pengiriman kilat garansi sampai besok',
      service_type: 'express',
      shipping_type: 'parcel',
      price: (isNearby ? 19000 : 28000) * weightKg,
      etd: '1 Hari',
      badge: 'Kilat Prioritas',
    },
  ];

  return simulatedRates;
}

/** Tarif per zona kota tujuan (dipakai keranjang cepat). */
export function zoneCourierRates(destinationCity: string = 'Jakarta Selatan', weightGrams: number = 500): ShippingRate[] {
  const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));
  const dest =
    INDONESIAN_CITIES.find((c) => c.name.toLowerCase().includes(destinationCity.toLowerCase())) ||
    INDONESIAN_CITIES[0];

  let jntBase = 15000;
  let jneBase = 16000;
  let sicepatBase = 18000;
  let gosendAvailable = false;

  if (dest.zone === 'jabodetabek') {
    jntBase = 12000;
    jneBase = 13000;
    sicepatBase = 15000;
    gosendAvailable = true;
  } else if (dest.zone === 'jawa') {
    jntBase = 16000;
    jneBase = 17000;
    sicepatBase = 20000;
  } else {
    jntBase = 28000;
    jneBase = 30000;
    sicepatBase = 35000;
  }

  const rates: ShippingRate[] = [
    {
      courier: 'J&T',
      serviceName: 'EZ Regular',
      etd: dest.zone === 'jabodetabek' ? '1 Hari' : dest.zone === 'jawa' ? '1 - 2 Hari' : '2 - 3 Hari',
      cost: jntBase * weightKg,
      description: `Tarif reguler untuk ${weightGrams} gram (${weightKg} kg)`,
      badge: 'Paling Populer',
      courierCode: 'jnt',
      courierServiceCode: 'ez',
    },
    {
      courier: 'SiCepat',
      serviceName: 'BEST Sameday / Express',
      etd: dest.zone === 'jabodetabek' ? 'Besok Pagi' : '1 - 2 Hari',
      cost: sicepatBase * weightKg,
      description: `Layanan kilat prioritas kota ${dest.name}`,
      courierCode: 'sicepat',
      courierServiceCode: 'best',
    },
    {
      courier: 'JNE',
      serviceName: 'REG (Reguler)',
      etd: dest.zone === 'jabodetabek' ? '1 - 2 Hari' : '2 - 4 Hari',
      cost: jneBase * weightKg,
      description: `Jangkauan terluas hingga pelosok kecamatan`,
      courierCode: 'jne',
      courierServiceCode: 'reg',
    },
  ];

  if (gosendAvailable) {
    rates.push({
      courier: 'GoSend',
      serviceName: 'Instant Delivery Motor',
      etd: '1 - 2 Jam',
      cost: 25000,
      description: 'Kurir langsung kirim ke alamat hari ini',
      badge: 'Instan Cepat',
      courierCode: 'gosend',
      courierServiceCode: 'instant',
    });
  }

  return rates;
}
