import {
  BiteshipRateOption,
  CreateShipmentResult,
  ShippingBranch,
  AvailableCourier,
} from '../types';
import { supabase, sessionHeaders } from './supabaseClient';
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

/** ok=true → `result` terisi; ok=false → `code` (+ `providerMessage` dari kurir). */
export interface CreateShipmentResponse {
  ok: boolean;
  result?: CreateShipmentResult;
  code?: string;
  providerMessage?: string;
}

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
   * Daftar layanan kurir Biteship dari server (`GET /api/shipping/couriers`), lengkap dengan
   * metode serah terima yang benar-benar didukung. Tidak ada daftar cadangan: bila gagal,
   * kembalikan daftar kosong agar merchant tidak memilih metode yang akan ditolak kurir.
   */
  async getAvailableCouriers(): Promise<AvailableCourier[]> {
    try {
      const res = await fetch(getApiEndpoint('/api/shipping/couriers'), {
        headers: sessionHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && Array.isArray(data.couriers)) {
        return data.couriers as AvailableCourier[];
      }
    } catch (err) {
      console.warn('[shippingService] getAvailableCouriers failed:', err);
    }
    return [];
  },

  /**
   * Layanan kurir untuk rute pesanan ini beserta metode yang didukung (Pick-up/Drop-off),
   * dicek server ke Rates API Biteship. Mengembalikan [] bila gagal.
   */
  async getRouteCouriers(orderId: string, originBranchId?: string): Promise<AvailableCourier[]> {
    try {
      const res = await fetch(getApiEndpoint('/api/shipping/route-couriers'), {
        method: 'POST',
        headers: sessionHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ orderId, originBranchId: originBranchId || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && Array.isArray(data.couriers)) {
        return data.couriers as AvailableCourier[];
      }
    } catch (err) {
      console.warn('[shippingService] getRouteCouriers failed:', err);
    }
    return [];
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
   * Pesan kurir & resi lewat server (`POST /api/shipping/create-shipment`). Server memeriksa sesi,
   * hak kelola toko, status bayar, lalu memesan ke Biteship dengan data dari database dan
   * menyimpan resinya. Tidak ada resi simulasi: bila gagal, hasilnya berisi kode galat.
   */
  async createShipment(params: {
    orderId: string;
    deliveryType: 'pickup' | 'drop_off';
    pickupDate?: string;
    pickupTime?: string;
    originBranchId?: string;
    courierCode: string;
    courierService: string;
  }): Promise<CreateShipmentResponse> {
    try {
      const res = await fetch(getApiEndpoint('/api/shipping/create-shipment'), {
        method: 'POST',
        headers: sessionHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success && data.trackingNumber) {
        return {
          ok: true,
          result: {
            success: true,
            tracking_number: String(data.trackingNumber),
            shipping_label_url: data.trackingUrl ? String(data.trackingUrl) : '',
            status: String(data.status || 'confirmed'),
            pickup_scheduled: data.pickupScheduled !== false,
          },
        };
      }
      return {
        ok: false,
        code: String(data?.code || (res.status === 401 ? 'unauthorized' : res.status === 403 ? 'forbidden' : 'failed')),
        providerMessage: data?.providerMessage ? String(data.providerMessage) : undefined,
      };
    } catch {
      return { ok: false, code: 'network' };
    }
  },

  calculateRates(
    originCity: string = 'Jakarta Selatan',
    destinationCity: string = 'Jakarta Selatan',
    weightGrams: number = 500
  ): ShippingRate[] {
    return zoneCourierRates(destinationCity, weightGrams);
  },
};
