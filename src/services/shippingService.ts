import { CourierType } from '../types';

export interface ShippingRate {
  courier: CourierType;
  serviceName: string;
  etd: string;
  cost: number;
  description: string;
  badge?: string;
}

export const shippingRates: ShippingRate[] = [
  {
    courier: 'J&T',
    serviceName: 'EZ Regular',
    etd: '1 - 2 Hari',
    cost: 15000,
    description: 'Layanan standar antar pulau tercepat dengan armada langsung.',
    badge: 'Rekomendasi',
  },
  {
    courier: 'SiCepat',
    serviceName: 'BEST Sameday / Nextday',
    etd: 'Besok Sampai',
    cost: 18000,
    description: 'Garansi sampai esok hari untuk kota-kota besar.',
  },
  {
    courier: 'JNE',
    serviceName: 'REG (Reguler)',
    etd: '2 - 3 Hari',
    cost: 14000,
    description: 'Jaringan pos terluas menjangkau seluruh kecamatan.',
  },
  {
    courier: 'GoSend',
    serviceName: 'Instant Kurir Motor',
    etd: '1 - 2 Jam',
    cost: 25000,
    description: 'Pengiriman instan dalam kota langsung dari toko.',
  },
];

export const shippingService = {
  getRates(_originCity?: string, _destinationCity?: string, _weightGrams?: number): ShippingRate[] {
    return shippingRates;
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
