/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export interface CourierOption {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  available_for_drop_off: boolean;
  available_for_pickup: boolean;
  tier?: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const biteshipApiKey = Deno.env.get('BITESHIP_API_KEY') || '';
    let couriers: CourierOption[] = [];
    let isLiveSuccess = false;

    if (biteshipApiKey) {
      try {
        const response = await fetch('https://api.biteship.com/v1/couriers', {
          method: 'GET',
          headers: {
            'Authorization': biteshipApiKey.startsWith('Bearer ')
              ? biteshipApiKey
              : `Bearer ${biteshipApiKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.couriers && Array.isArray(data.couriers)) {
            couriers = data.couriers.map((c: any) => ({
              courier_name: c.courier_name || c.name || c.company,
              courier_code: (c.courier_code || c.code || '').toLowerCase(),
              courier_service_name: c.courier_service_name || c.service_name || 'Reguler',
              courier_service_code: (c.courier_service_code || c.service_code || 'reg').toLowerCase(),
              available_for_drop_off: Boolean(c.available_for_drop_off ?? true),
              available_for_pickup: Boolean(c.available_for_pickup ?? true),
              tier: c.tier || 'standard',
              description: c.description || `${c.courier_name} ${c.courier_service_name}`,
            }));
            isLiveSuccess = true;
          }
        } else {
          console.warn('Biteship API get-couriers response not ok:', response.status);
        }
      } catch (apiErr) {
        console.warn('Biteship API fetch error for couriers:', apiErr);
      }
    }

    // Fallback list kurir resmi Biteship Indonesia jika API offline / sandbox limit
    if (!isLiveSuccess || couriers.length === 0) {
      couriers = [
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
          courier_name: 'J&T Express',
          courier_code: 'jnt',
          courier_service_name: 'SUPER Express',
          courier_service_code: 'super',
          available_for_drop_off: true,
          available_for_pickup: true,
          tier: 'express',
          description: 'Pengiriman kilat esok hari sampai',
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
          available_for_drop_off: false, // GoSend hanya pickup langsung
          available_for_pickup: true,
          tier: 'instant',
          description: 'Driver motor jemput dan antar langsung hari ini (1-2 jam)',
        },
        {
          courier_name: 'POS Indonesia',
          courier_code: 'pos',
          courier_service_name: 'Pos Reguler',
          courier_service_code: 'reguler',
          available_for_drop_off: true,
          available_for_pickup: false, // POS umumnya drop di kantor pos
          tier: 'standard',
          description: 'Jangkauan pos kantor seluruh nusantara',
        },
      ];
    }

    return new Response(
      JSON.stringify({
        success: true,
        couriers,
        source: isLiveSuccess ? 'biteship_api' : 'simulated_fallback',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal Server Error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
