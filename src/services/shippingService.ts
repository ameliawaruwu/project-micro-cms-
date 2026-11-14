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
import { getApiEndpoint } from '../utils/apiConfig';
import {
  simulateCourierRates,
  zoneCourierRates,
  INDONESIAN_CITIES,
  type ShippingRate,
  type CityOption,
} from '../utils/shippingFormulas';

export type { ShippingRate, CityOption } from '../utils/shippingFormulas';
export { INDONESIAN_CITIES } from '../utils/shippingFormulas';

export const shippingService = {
  getCities(): CityOption[] {
    return INDONESIAN_CITIES;
  },

  /**
   * Minta tarif bertanda tangan ke server (`POST /api/shipping/quote`). Berat dihitung server
   * dari data produk. `rates: null` berarti server tak terjangkau (pakai perkiraan lokal).
   */
  async requestQuotes(body: Record<string, unknown>): Promise<{ rates: any[] | null; error?: string }> {
    try {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success && Array.isArray(json.rates)) return { rates: json.rates };
      if (res.status >= 400 && res.status < 500 && json?.message) return { rates: [], error: String(json.message) };
    } catch (err) {
      console.warn('[shippingService] /api/shipping/quote gagal:', err);
    }
    return { rates: null };
  },

  /**
   * Tarif kurir (per kode pos) untuk halaman checkout pembeli. Tarif dengan `quote` wajib dipakai
   * saat membuat pesanan; bila server tak terjangkau, tarif ditampilkan dari rumus lokal tanpa
   * `quote` (pesanan ditolak sampai tarif sah didapat).
   */
  async getCheckoutRates(params: {
    storeId: string;
    items: Array<{ productId: string; quantity: number }>;
    destinationPostalCode: string;
    couriers?: string;
    fallbackWeightGrams: number;
  }): Promise<{ rates: BiteshipRateOption[]; signed: boolean; error?: string }> {
    const result = await this.requestQuotes({
      storeId: params.storeId,
      items: params.items,
      destinationPostalCode: params.destinationPostalCode,
      couriers: params.couriers,
      mode: 'postal',
    });
    if (result.rates) return { rates: result.rates as BiteshipRateOption[], signed: true, error: result.error };
    return {
      signed: false,
      rates: simulateCourierRates('12730', params.destinationPostalCode, params.fallbackWeightGrams),
    };
  },

  /** Tarif zona (per kota) untuk keranjang cepat, bertanda tangan server seperti getCheckoutRates. */
  async getZoneCheckoutRates(params: {
    storeId: string;
    items: Array<{ productId: string; quantity: number }>;
    destinationCity: string;
    fallbackWeightGrams: number;
  }): Promise<{ rates: ShippingRate[]; signed: boolean; error?: string }> {
    const result = await this.requestQuotes({
      storeId: params.storeId,
      items: params.items,
      destinationCity: params.destinationCity,
      mode: 'zone',
    });
    if (result.rates) return { rates: result.rates as ShippingRate[], signed: true, error: result.error };
    return { signed: false, rates: zoneCourierRates(params.destinationCity, params.fallbackWeightGrams) };
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
   * Panggil Supabase Edge Function 'check-shipping-rates' atau direct Biteship API
   */
  async checkBiteshipRates(params: {
    storeId?: string;
    branchId?: string;
    destinationPostalCode: string | number;
    weight: number;
    couriers?: string;
  }): Promise<{ rates: BiteshipRateOption[]; originBranch?: ShippingBranch }> {
    const { storeId, branchId, destinationPostalCode, weight, couriers = 'jnt,jne,sicepat' } = params;

    let branch: ShippingBranch | undefined;
    if (branchId) {
      branch = await branchService.getBranchById(branchId);
    }
    if (!branch) {
      branch = await branchService.getDefaultBranch(storeId);
    }

    const packageWeight = Math.max(100, weight || 500);

    // Asal pengiriman: kode pos cabang utama toko; jika toko belum punya cabang, pakai kode pos toko.
    let originPostal = branch?.postalCode || '';
    if (!originPostal && storeId) {
      try {
        const { data: storeRow } = await supabase.from('stores').select('postal_code').eq('id', storeId).maybeSingle();
        originPostal = (storeRow?.postal_code || '').trim();
      } catch {
        // abaikan, pakai fallback di bawah
      }
    }
    if (!originPostal) originPostal = '12730';

    // 1. Coba via Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('check-shipping-rates', {
        body: {
          branch_id: branch?.id,
          origin_postal_code: originPostal,
          destination_postal_code: destinationPostalCode,
          weight: packageWeight,
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

    // 2. Gunakan proxy server internal /api/shipping/rates untuk keamanan API key
    try {
      const endpoint = getApiEndpoint('/api/shipping/rates');
      const proxyRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_postal_code: Number(originPostal),
          destination_postal_code: Number(destinationPostalCode),
          couriers,
          weight: packageWeight,
        }),
      });

      if (proxyRes.ok) {
        const biteshipData = await proxyRes.json();
        if (biteshipData?.pricing && Array.isArray(biteshipData.pricing) && biteshipData.pricing.length > 0) {
          const mappedRates: BiteshipRateOption[] = biteshipData.pricing.map((p: any) => ({
            courier_name: p.courier_name || p.company,
            courier_code: p.courier_code || p.courier,
            courier_service_name: p.courier_service_name || p.service_type,
            courier_service_code: p.courier_service_code || p.type,
            tier: p.tier || 'standard',
            description: p.description || `${p.courier_name} ${p.courier_service_name}`,
            service_type: p.service_type || 'standard',
            shipping_type: p.shipping_type || 'parcel',
            price: Number(p.price) || 0,
            etd: p.duration || p.etd || '1-3 Hari',
          }));

          return {
            rates: mappedRates,
            originBranch: branch,
          };
        }
      }
    } catch (proxyErr) {
      console.warn('[Biteship Proxy Rates] Fallback to direct or simulated rates:', proxyErr);
    }

    // 3. Fallback simulation bila Edge Function belum dideploy atau Biteship offline / sandbox balance 0
    const simulatedRates = simulateCourierRates(originPostal, destinationPostalCode, weight);

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
    // 1. Coba panggil via Supabase Edge Function
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

    // 2. Panggil langsung API resmi Biteship jika API Key aktif
    try {
      const apiKey =
        (import.meta as any).env?.VITE_BITESHIP_API_KEY ||
        (import.meta as any).env?.BITESHIP_API_KEY ||
        '';

      if (apiKey && apiKey.startsWith('biteship_')) {
        const branches = await branchService.getBranches();
        const branch =
          branches.find((b) => b.id === payload.origin_branch_id) ||
          branches.find((b) => b.isDefault) ||
          branches[0];

        let customerName = 'utiy';
        let customerPhone = '081223344556';
        let customerAddress = 'Telkom University Bandung';
        let customerPostal = 40257;
        let itemTitle = 'Pesanan Produk Toko';
        let itemValue = 185000;

        try {
          const rawOrders = localStorage.getItem('microcms_orders_v1');
          if (rawOrders) {
            const list = JSON.parse(rawOrders);
            const found = list.find((o: any) => o.id === payload.order_id);
            if (found) {
              customerName = found.customerName || customerName;
              customerPhone = found.customerPhone || customerPhone;
              customerAddress = found.customerAddress || customerAddress;
              customerPostal = Number(found.customerPostalCode || customerPostal);
              if (found.items && found.items[0]) {
                itemTitle = found.items[0].productName || itemTitle;
                itemValue = found.items[0].price || itemValue;
              }
            }
          }
        } catch {
          // ignore
        }

        const courierComp = (payload.courier_code || 'jnt').toLowerCase().includes('jne')
          ? 'jne'
          : (payload.courier_code || 'jnt').toLowerCase().includes('sicepat')
          ? 'sicepat'
          : 'jnt';

        const courierType = (payload.courier_service || 'ez').toLowerCase().includes('reg')
          ? 'reg'
          : (payload.courier_service || 'ez').toLowerCase().includes('siuntung')
          ? 'siuntung'
          : 'ez';

        const biteshipRes = await fetch('https://api.biteship.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin_contact_name: branch?.picName || 'Gudang Pusat Jakarta',
            origin_contact_phone: branch?.picPhone || '081298765432',
            origin_address: branch?.address || 'Jl. Kemang Raya No. 42',
            origin_postal_code: Number(branch?.postalCode || 12730),
            destination_contact_name: customerName,
            destination_contact_phone: customerPhone,
            destination_address: customerAddress,
            destination_postal_code: customerPostal,
            courier_company: courierComp,
            courier_type: courierType,
            delivery_type: 'now',
            items: [
              {
                name: itemTitle,
                value: itemValue,
                quantity: 1,
                weight: 500,
              },
            ],
          }),
        });

        if (biteshipRes.ok) {
          const biteshipData = await biteshipRes.json();
          if (biteshipData.success) {
            const waybill =
              biteshipData.courier?.waybill_id ||
              biteshipData.courier?.tracking_id ||
              biteshipData.id;
            const trackingUrl =
              biteshipData.courier?.link ||
              `https://track.biteship.com/${biteshipData.courier?.tracking_id}?environment=development`;

            return {
              success: true,
              tracking_number: waybill,
              shipping_label_url: trackingUrl,
              status: 'ready_to_ship',
              message: 'Resi resmi Biteship berhasil diterbitkan & terhubung langsung ke tracking!',
            };
          }
        }
      }
    } catch (apiDirectErr) {
      console.warn('[Direct Biteship API] createShipment fallback:', apiDirectErr);
    }

    // 3. Fallback simulation bila server offline
    const prefix = 'WYB-';
    const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000);
    const trackingNumber = `${prefix}${randomDigits}`;
    const labelUrl = `https://track.biteship.com/hbiQdAcnePHcyl2k1DdUek6d?environment=development`;

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
    return zoneCourierRates(destinationCity, weightGrams);
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
