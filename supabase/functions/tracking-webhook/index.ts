/// <reference path="../deno.d.ts" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-biteship-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log('Received Biteship Webhook event:', JSON.stringify(body));

    const event = body.event;
    const trackingId = body.courier_tracking_id || body.waybill_id || body.tracking_id;
    const biteshipOrderId = body.order_id || body.id;
    const status = (body.status || '').toLowerCase();

    // Map status Biteship ke status sistem Kroomify
    let shippingStatus: string = 'Diproses';
    let orderStatus: string = 'processing';
    let updateShippedAt: string | null = null;

    switch (status) {
      case 'allocated':
      case 'picking_up':
        shippingStatus = 'Diproses';
        orderStatus = 'processing';
        break;
      case 'picked':
      case 'dropping_off':
      case 'in_transit':
        shippingStatus = 'Dikirim';
        orderStatus = 'shipped';
        updateShippedAt = new Date().toISOString();
        break;
      case 'delivered':
        shippingStatus = 'Selesai';
        orderStatus = 'delivered';
        break;
      case 'rejected':
      case 'cancelled':
      case 'returned':
        shippingStatus = 'Dibatalkan';
        orderStatus = 'cancelled';
        break;
      default:
        shippingStatus = 'Diproses';
    }

    // Cari order berdasarkan tracking_number atau order_id
    let orderMatch: any = null;

    if (trackingId) {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, shipping_status')
        .eq('tracking_number', trackingId)
        .maybeSingle();
      orderMatch = data;
    }

    if (!orderMatch && biteshipOrderId) {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, shipping_status')
        .or(`id.eq.${biteshipOrderId},order_number.eq.${biteshipOrderId}`)
        .maybeSingle();
      orderMatch = data;
    }

    if (orderMatch) {
      const updateData: any = {
        shipping_status: shippingStatus,
        order_status: orderStatus,
        updated_at: new Date().toISOString(),
      };
      if (updateShippedAt) {
        updateData.shipped_at = updateShippedAt;
      }

      await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderMatch.id);

      console.log(`Order ${orderMatch.order_number} status updated to: ${shippingStatus}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        received: true,
        event,
        status: shippingStatus,
        order_id: orderMatch?.id || null,
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
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
