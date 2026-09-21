import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY') || 'SB-Mid-server-n197M_KyR7is6x0Ag4cZEIAj';
const MIDTRANS_ENV = Deno.env.get('VITE_MIDTRANS_ENV') || 'sandbox';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // 1. Check transaction status: GET ?orderId=...
  if (req.method === 'GET' && url.searchParams.get('orderId')) {
    const orderId = url.searchParams.get('orderId') || '';
    const apiUrl = MIDTRANS_ENV === 'production'
      ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
      : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

    const basicAuth = btoa(`${MIDTRANS_SERVER_KEY}:`);
    const statusRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
    });

    const statusData = await statusRes.json();
    return new Response(JSON.stringify(statusData), {
      status: statusRes.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Create Snap Token: POST { orderId, grossAmount, customerName, ... }
  if (req.method === 'POST') {
    try {
      const data = await req.json();

      const rawAmount = Number(data.grossAmount);
      if (isNaN(rawAmount) || rawAmount <= 0) {
        return new Response(
          JSON.stringify({ error: true, message: 'Nominal transaksi tidak valid (harus lebih besar dari 0)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const sanitizedOrderId = String(data.orderId || `ORDER-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
      const sanitizedName = String(data.customerName || 'Pembeli').replace(/<[^>]*>/g, '').trim().slice(0, 100);
      const sanitizedPhone = String(data.customerPhone || '08123456789').replace(/[^0-9+]/g, '').slice(0, 20);
      const sanitizedEmail = String(data.customerEmail || 'customer@example.com').trim().slice(0, 100);

      const apiUrl = MIDTRANS_ENV === 'production'
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const payload: any = {
        transaction_details: {
          order_id: sanitizedOrderId,
          gross_amount: Math.round(rawAmount),
        },
        customer_details: {
          first_name: sanitizedName,
          phone: sanitizedPhone,
          email: sanitizedEmail,
        },
      };

      if (Array.isArray(data.enabledPayments) && data.enabledPayments.length > 0) {
        payload.enabled_payments = data.enabledPayments.map((p: string) => (p === 'mandiri_bill' ? 'echannel' : p));
      }

      if (Array.isArray(data.items) && data.items.length > 0) {
        payload.item_details = data.items.map((item: any) => ({
          id: String(item.id || 'item-1').slice(0, 50),
          price: Math.round(Number(item.price) || 0),
          quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
          name: String(item.name || 'Produk').slice(0, 50),
        }));
      }

      const basicAuth = btoa(`${MIDTRANS_SERVER_KEY}:`);
      const midtransRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify(payload),
      });

      const midtransData = await midtransRes.json();
      if (!midtransRes.ok) {
        return new Response(
          JSON.stringify({
            error: true,
            message: midtransData.error_messages ? midtransData.error_messages.join(', ') : 'Midtrans API Error',
            details: midtransData,
          }),
          { status: midtransRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          token: midtransData.token,
          redirectUrl: midtransData.redirect_url,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: true, message: err?.message || 'Internal Server Error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
