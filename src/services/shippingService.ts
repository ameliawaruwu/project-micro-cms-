import { CourierType } from '../types';

export interface ShippingRate {
  courier: CourierType;
  serviceName: string;
  etd: string;
  cost: number;
  description: string;
  badge?: string;
}

export interface CityOption {
  id: string;
  name: string;
  province: string;
  zone: 'jabodetabek' | 'jawa' | 'luar_jawa';
}

export const INDONESIAN_CITIES: CityOption[] = [
  { id: 'jkt-selatan', name: 'Jakarta Selatan', province: 'DKI Jakarta', zone: 'jabodetabek' },
  { id: 'jkt-pusat', name: 'Jakarta Pusat', province: 'DKI Jakarta', zone: 'jabodetabek' },
  { id: 'jkt-barat', name: 'Jakarta Barat', province: 'DKI Jakarta', zone: 'jabodetabek' },
  { id: 'bogor', name: 'Kota Bogor', province: 'Jawa Barat', zone: 'jabodetabek' },
  { id: 'depok', name: 'Kota Depok', province: 'Jawa Barat', zone: 'jabodetabek' },
  { id: 'tangerang', name: 'Kota Tangerang', province: 'Banten', zone: 'jabodetabek' },
  { id: 'bekasi', name: 'Kota Bekasi', province: 'Jawa Barat', zone: 'jabodetabek' },
  { id: 'bandung', name: 'Kota Bandung', province: 'Jawa Barat', zone: 'jawa' },
  { id: 'semarang', name: 'Kota Semarang', province: 'Jawa Tengah', zone: 'jawa' },
  { id: 'solo', name: 'Kota Solo / Surakarta', province: 'Jawa Tengah', zone: 'jawa' },
  { id: 'pekalongan', name: 'Kota Pekalongan', province: 'Jawa Tengah', zone: 'jawa' },
  { id: 'jogja', name: 'DI Yogyakarta', province: 'DI Yogyakarta', zone: 'jawa' },
  { id: 'surabaya', name: 'Kota Surabaya', province: 'Jawa Timur', zone: 'jawa' },
  { id: 'malang', name: 'Kota Malang', province: 'Jawa Timur', zone: 'jawa' },
  { id: 'denpasar', name: 'Kota Denpasar', province: 'Bali', zone: 'luar_jawa' },
  { id: 'medan', name: 'Kota Medan', province: 'Sumatera Utara', zone: 'luar_jawa' },
  { id: 'makassar', name: 'Kota Makassar', province: 'Sulawesi Selatan', zone: 'luar_jawa' },
];

export const shippingService = {
  getCities(): CityOption[] {
    return INDONESIAN_CITIES;
  },

  calculateRates(originCity: string = 'Jakarta Selatan', destinationCity: string = 'Jakarta Selatan', weightGrams: number = 500): ShippingRate[] {
    const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));
    const dest = INDONESIAN_CITIES.find(c => c.name.toLowerCase().includes(destinationCity.toLowerCase())) || INDONESIAN_CITIES[0];
    
    // Base pricing tier based on destination zone
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
      // luar jawa
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
      },
      {
        courier: 'SiCepat',
        serviceName: 'BEST Sameday / Express',
        etd: dest.zone === 'jabodetabek' ? 'Besok Pagi' : '1 - 2 Hari',
        cost: sicepatBase * weightKg,
        description: `Layanan kilat prioritas kota ${dest.name}`,
      },
      {
        courier: 'JNE',
        serviceName: 'REG (Reguler)',
        etd: dest.zone === 'jabodetabek' ? '1 - 2 Hari' : '2 - 4 Hari',
        cost: jneBase * weightKg,
        description: `Jangkauan terluas hingga pelosok kecamatan`,
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
      });
    }

    return rates;
  },

  generateResi(courier: CourierType): string {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    switch (courier) {
      case 'J&T':
        return `JT${randomDigits}`;
      case 'JNE':
        return `JNE${randomDigits}`;
      case 'SiCepat':
        return `00${randomDigits}`;
      case 'GoSend':
        return `GK-${Math.floor(100000 + Math.random() * 900000)}`;
      default:
        return `EXP-${randomDigits}`;
    }
  },
};
