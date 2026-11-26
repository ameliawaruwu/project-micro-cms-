-- Lacak pesanan untuk pembeli tanpa login.
--
-- Pembeli membuktikan pesanan miliknya dengan nomor pesanan (acak, "KB-" + 10 hex) + nomor WhatsApp
-- yang dipakai saat checkout. Fungsi hanya mengembalikan data yang aman ditampilkan: status,
-- kurir/resi, dan isi pesanan. Alamat, email, dan nomor HP pembeli tidak pernah dikembalikan.
--
-- Perlindungan tebak-tebakan: percobaan gagal dicatat per nomor pesanan; setelah 10 kali gagal
-- dalam 1 jam, nomor pesanan itu dikunci sementara.

CREATE TABLE IF NOT EXISTS app_private.order_track_failures (
  id           bigserial PRIMARY KEY,
  order_number text        NOT NULL,
  failed_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_track_failures_lookup_idx
  ON app_private.order_track_failures (order_number, failed_at);
REVOKE ALL ON app_private.order_track_failures FROM PUBLIC, anon, authenticated;

-- Samakan format nomor HP: hanya angka, awalan 62 / 8 diubah menjadi 0.
CREATE OR REPLACE FUNCTION app_private.normalize_phone(p_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN d LIKE '62%' THEN '0' || substr(d, 3)
    WHEN d LIKE '8%'  THEN '0' || d
    ELSE d
  END
  FROM (SELECT regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g') AS d) s;
$$;

CREATE OR REPLACE FUNCTION public.track_order(p_store_id text, p_order_number text, p_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_number   text := upper(left(btrim(coalesce(p_order_number, '')), 32));
  v_phone    text := app_private.normalize_phone(left(coalesce(p_phone, ''), 32));
  v_failures integer;
  v_order    public.orders%ROWTYPE;
BEGIN
  IF v_number !~ '^[A-Z0-9-]{4,32}$' OR length(v_phone) < 9 THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  SELECT count(*) INTO v_failures
    FROM app_private.order_track_failures
   WHERE order_number = v_number AND failed_at > now() - interval '1 hour';
  IF v_failures >= 10 THEN
    RETURN jsonb_build_object('status', 'locked');
  END IF;

  SELECT * INTO v_order
    FROM public.orders o
   WHERE o.order_number = v_number
     AND o.store_id = p_store_id
     AND app_private.normalize_phone(o.customer_phone) = v_phone;

  IF NOT FOUND THEN
    INSERT INTO app_private.order_track_failures (order_number) VALUES (v_number);
    DELETE FROM app_private.order_track_failures WHERE failed_at < now() - interval '1 day';
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  RETURN jsonb_build_object(
    'status', 'found',
    'order', jsonb_build_object(
      'order_number',         v_order.order_number,
      'created_at',           v_order.created_at,
      'updated_at',           v_order.updated_at,
      'payment_method',       v_order.payment_method,
      'payment_status',       v_order.payment_status,
      'payment_confirmed_at', v_order.payment_confirmed_at,
      'paid_at',              v_order.paid_at,
      'order_status',         v_order.order_status,
      'shipped_at',           v_order.shipped_at,
      'shipping_courier',     v_order.shipping_courier,
      'courier_code',         v_order.courier_code,
      'courier_service',      coalesce(v_order.courier_service, v_order.shipping_service),
      'tracking_number',      v_order.tracking_number,
      'shipping_city',        v_order.shipping_city,
      'shipping_cost',        v_order.shipping_cost,
      'total_amount',         v_order.total_amount,
      'items', coalesce((
        SELECT jsonb_agg(jsonb_build_object(
                 'product_name',  i.product_name,
                 'product_image', i.product_image,
                 'variant_info',  i.variant_info,
                 'price',         i.price,
                 'quantity',      i.quantity,
                 'subtotal',      i.subtotal
               ) ORDER BY i.id)
          FROM public.order_items i
         WHERE i.order_id = v_order.id
      ), '[]'::jsonb)
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.track_order(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(text, text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION app_private.normalize_phone(text) FROM PUBLIC, anon, authenticated;
