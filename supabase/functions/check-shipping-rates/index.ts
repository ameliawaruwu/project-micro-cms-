/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// CORS Headers untuk pemanggilan dari frontend browser
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface RequestBody {
  branch_id?: string;
  origin_postal_code?: string;
  destination_postal_code: string | number;
  weight: number; // in grams
  couriers?: string; // e.g. "jnt,jne,sicepat,gosend"
  items?: Array<{
    name: string;
    value: number;
    quantity: number;
    weight: number;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const biteshipApiKey = Deno.env.get('BITESHIP_API_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: RequestBody = await req.json();

    const {
      branch_id,
      origin_postal_code,
      destination_postal_code,
      weight,
      couriers = 'jnt,jne,sicepat',
    } = body;

    if (!destination_postal_code) {
      return new Response(
        JSON.stringify({ error: 'destination_postal_code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Ambil origin postal code dari cabang jika branch_id diberikan
    let originPostalCode = origin_postal_code;
    let branchInfo: any = null;

    if (branch_id) {
      const { data: branch, error: branchErr } = await supabase
        .from('shipping_branches')
        .select('*')
        .eq('id', branch_id)
        .maybeSingle();

      if (!branchErr && branch) {
        branchInfo = branch;
        originPostalCode = branch.postal_code;
      }
    }

    // Fallback origin postal code jika belum diset (Jakarta Selatan)
    if (!originPostalCode) {
      originPostalCode = '12730';
    }

    const packageWeight = Math.max(100, Number(weight) || 500);

    // 2. Request ke Biteship Aggregator API
    let courierRates: any[] = [];
    let isLiveBiteship = false;

    try {
      const biteshipRes = await fetch('https://api.biteship.com/v1/rates/couriers', {
        method: 'POST',
        headers: {
          'Authorization': biteshipApiKey.startsWith('Bearer ') ? biteshipApiKey : `Bearer ${biteshipApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin_postal_code: Number(originPostalCode),
          destination_postal_code: Number(destination_postal_code),
          couriers: couriers,
          items: [
            {
              name: 'Paket Pesanan Toko',
              value: 100000,
              weight: packageWeight,
              quantity: 1,
            },
          ],
        }),
      });

      if (biteshipRes.ok) {
        const biteshipData = await biteshipRes.json();
        if (biteshipData?.pricing && Array.isArray(biteshipData.pricing)) {
          courierRates = biteshipData.pricing.map((p: any) => ({
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
          isLiveBiteship = true;
        }
      }
    } catch (apiErr) {
      console.warn('Biteship API fetch error, falling back to simulated rates:', apiErr);
    }

    // 3. Fallback jika Biteship offline / sandbox limit
    if (!isLiveBiteship || courierRates.length === 0) {
      const weightKg = Math.max(1, Math.ceil(packageWeight / 1000));
      const isOriginNearDest = String(originPostalCode).slice(0, 2) === String(destination_postal_code).slice(0, 2);

      courierRates = [
        {
          courier_name: 'J&T Express',
          courier_code: 'jnt',
          courier_service_name: 'EZ Regular',
          courier_service_code: 'ez',
          tier: 'standard',
          description: 'Layanan reguler dengan jaringan luas seluruh Indonesia',
          service_type: 'standard',
          shipping_type: 'parcel',
          price: (isOriginNearDest ? 11000 : 18000) * weightKg,
          etd: isOriginNearDest ? '1-2 Hari' : '2-3 Hari',
          badge: 'Paling Populer',
        },
        {
          courier_name: 'SiCepat Ekspres',
          courier_code: 'sicepat',
          courier_service_name: 'SIUNTUNG / Reguler',
          courier_service_code: 'siuntung',
          tier: 'standard',
          description: 'Ongkir hemat dan pick-up cepat langsung dari gudang',
          service_type: 'standard',
          shipping_type: 'parcel',
          price: (isOriginNearDest ? 12000 : 19000) * weightKg,
          etd: isOriginNearDest ? '1 Hari' : '2-3 Hari',
        },
        {
          courier_name: 'JNE',
          courier_code: 'jne',
          courier_service_name: 'REG (Reguler)',
          courier_service_code: 'reg',
          tier: 'standard',
          description: 'Layanan pengiriman terpercaya hingga pelosok kecamatan',
          service_type: 'standard',
          shipping_type: 'parcel',
          price: (isOriginNearDest ? 13000 : 20000) * weightKg,
          etd: isOriginNearDest ? '1-2 Hari' : '2-4 Hari',
        },
        {
          courier_name: 'J&T Express',
          courier_code: 'jnt',
          courier_service_name: 'SUPER Express',
          courier_service_code: 'super',
          tier: 'express',
          description: 'Layanan pengiriman kilat esok hari sampai',
          service_type: 'express',
          shipping_type: 'parcel',
          price: (isOriginNearDest ? 19000 : 28000) * weightKg,
          etd: 'Esok Hari (1 Hari)',
          badge: 'Kilat Prioritas',
        },
      ];
    }

    return new Response(
      JSON.stringify({
        success: true,
        origin: {
          branch_id: branch_id || null,
          branch_name: branchInfo?.branch_name || 'Gudang Pengirim',
          postal_code: originPostalCode,
          city: branchInfo?.city || 'Jakarta Selatan',
        },
        destination: {
          postal_code: destination_postal_code,
        },
        weight_grams: packageWeight,
        rates: courierRates,
        source: isLiveBiteship ? 'biteship_api' : 'simulated_fallback',
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
