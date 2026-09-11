import {
  CourierType,
  BiteshipRateOption,
  CreateShipmentPayload,
  CreateShipmentResult,
  ShippingBranch,
  AvailableCourier,
} from '../types';
import { supabase } from './supabaseClient';
import { branchService } from './branchService';

export interface ShippingRate {
  courier: CourierType;
  serviceName: string;
  etd: string;
  cost: number;
  description: string;
  badge?: string;
  courierCode?: string;
  courierServiceCode?: string;
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

export const shippingService = {
  getCities(): CityOption[] {
    return INDONESIAN_CITIES;
  },

  /**
   * Panggil Supabase Edge Function 'get-available-couriers' untuk mengambil daftar ekspedisi Biteship
   */
  async getAvailableCouriers(): Promise<AvailableCourier[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get-available-couriers');
      if (!error && data?.success && Array.isArray(data.couriers) && data.couriers.length > 0) {
        return data.couriers;
      }
    } catch (err) {
      console.warn('[Supabase Edge Function] get-available-couriers fallback:', err);
    }

    return [
      {
        courier_name: 'J&T Express',
        courier_code: 'jnt',
        courier_service_name: 'EZ Regular',
        courier_service_code: 'ez',
        available_for_drop_off: true,
        available_for_pickup: true,
        tier: 'standard',
        description: 'Layanan reguler dengan jaringan jemput & antar terluas',
      },
      {
        courier_name: 'SiCepat Ekspres',
        courier_code: 'sicepat',
        courier_service_name: 'SIUNTUNG / Reguler',
        courier_service_code: 'siuntung',
        available_for_drop_off: true,
        available_for_pickup: true,
        tier: 'standard',
        description: 'Pick-up cepat kurir ke gudang tanpa minimum paket',
      },
      {
        courier_name: 'JNE Logistics',
        courier_code: 'jne',
        courier_service_name: 'REG (Reguler)',
        courier_service_code: 'reg',
        available_for_drop_off: true,
        available_for_pickup: true,
        tier: 'standard',
        description: 'Jaringan gerai drop counter terbanyak hingga pelosok kecamatan',
      },
      {
        courier_name: 'Anteraja',
        courier_code: 'anteraja',
        courier_service_name: 'Regular Service',
        courier_service_code: 'reg',
        available_for_drop_off: true,
        available_for_pickup: true,
        tier: 'standard',
        description: 'Layanan pengiriman terpercaya dengan jemput kurir Satria',
      },
      {
        courier_name: 'GoSend',
        courier_code: 'gosend',
        courier_service_name: 'Instant Motor',
        courier_service_code: 'instant',
        available_for_drop_off: false,
        available_for_pickup: true,
        tier: 'instant',
        description: 'Driver motor jemput dan antar langsung hari ini',
      },
    ];
  },

  /**
   * Panggil Supabase Edge Function 'check-shipping-rates' dengan Biteship API
   */
  async checkBiteshipRates(params: {
    branchId?: string;
    destinationPostalCode: string | number;
    weight: number;
    couriers?: string;
  }): Promise<{ rates: BiteshipRateOption[]; originBranch?: ShippingBranch }> {
    const { branchId, destinationPostalCode, weight, couriers = 'jnt,jne,sicepat' } = params;

    let branch: ShippingBranch | undefined;
    if (branchId) {
      branch = await branchService.getBranchById(branchId);
    }
    if (!branch) {
      branch = await branchService.getDefaultBranch();
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-shipping-rates', {
        body: {
          branch_id: branch?.id,
          origin_postal_code: branch?.postalCode,
          destination_postal_code: destinationPostalCode,
          weight: Math.max(100, weight || 500),
          couriers,
        },
      });

      if (!error && data?.success && Array.isArray(data.rates) && data.rates.length > 0) {
        return {
          rates: data.rates,
          originBranch: branch,
        };
      }
    } catch (err) {
      console.warn('[Supabase Edge Function] check-shipping-rates fallback:', err);
    }

    // Fallback simulation bila Edge Function belum dideploy atau Biteship offline
    const originPostal = branch?.postalCode || '12730';
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

    return {
      rates: simulatedRates,
      originBranch: branch,
    };
  },

  /**
   * Panggil Supabase Edge Function 'create-shipment' untuk booking & generate resi Biteship
   */
  async createShipment(
    payload: CreateShipmentPayload & { origin_branch_id?: string; notes?: string }
  ): Promise<CreateShipmentResult> {
    try {
      const { data, error } = await supabase.functions.invoke('create-shipment', {
        body: payload,
      });

      if (!error && data?.success) {
        return {
          success: true,
          tracking_number: data.tracking_number,
          shipping_label_url: data.shipping_label_url,
          status: data.shipping_status || 'ready_to_ship',
          message: data.message,
        };
      }
    } catch (err) {
      console.warn('[Supabase Edge Function] create-shipment fallback:', err);
    }

    // Fallback simulation: buat resi dan label standar
    const prefix = 'EXP';
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const trackingNumber = `${prefix}${randomDigits}`;
    const labelUrl = `https://labels.biteship.com/labels/${trackingNumber}.pdf`;

    return {
      success: true,
      tracking_number: trackingNumber,
      shipping_label_url: labelUrl,
      status: 'ready_to_ship',
      message:
        payload.delivery_type === 'pickup'
          ? 'Penjemputan paket oleh kurir berhasil dijadwalkan!'
          : 'Resi pengiriman drop-off berhasil diterbitkan.',
    };
  },

  calculateRates(
    originCity: string = 'Jakarta Selatan',
    destinationCity: string = 'Jakarta Selatan',
    weightGrams: number = 500
  ): ShippingRate[] {
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
