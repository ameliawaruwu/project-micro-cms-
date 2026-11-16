-- Pembatalan pesanan (pembeli tanpa login & penjual).
--
-- Kedua fungsi berada di app_private dan TIDAK di-GRANT ke anon/authenticated: hanya dipanggil
-- server (POST /api/orders/cancel) lewat koneksi DB tepercaya, setelah server memeriksa sesi/hak
-- kelola (penjual) atau nomor pesanan + nomor HP (pembeli).
--
-- * Pembeli: hanya bila pesanan masih "pending", belum lunas, dan pembeli belum mengirim
--   konfirmasi/bukti pembayaran. Pemeriksaan nomor HP memakai penguncian yang sama dengan
--   track_order (10 gagal / jam per nomor pesanan).
-- * Penjual: selama pesanan belum dikirim (pending/processing, belum ada resi / order kurir).
--   Bila pesanan lunas lewat payment gateway dan saldo toko sudah dikredit, saldo dikurangi
--   kembali dan transaksi pemasukan ditandai 'rejected'. Pengembalian dana ke pembeli dilakukan
--   penjual secara manual.
-- * Stok tidak dikurangi saat pesanan dibuat (place_order), jadi tidak ada stok yang dikembalikan.

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at  timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancel_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_by  text;

-- -----------------------------------------------------------------------------
-- 1. Pembatalan oleh pembeli
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.cancel_order_by_buyer(
  p_store_id text, p_order_number text, p_phone text, p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_number   text := upper(left(btrim(coalesce(p_order_number, '')), 32));
  v_phone    text := app_private.normalize_phone(left(coalesce(p_phone, ''), 32));
  v_reason   text := nullif(left(btrim(regexp_replace(coalesce(p_reason, ''), '[<>\r\n]', ' ', 'g')), 300), '');
  v_failures integer;
  v_order    public.orders%ROWTYPE;
BEGIN
  IF coalesce(p_store_id, '') !~ '^[A-Za-z0-9_-]{1,80}$'
     OR v_number !~ '^[A-Z0-9-]{4,32}$' OR length(v_phone) < 9 THEN
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
     AND app_private.normalize_phone(o.customer_phone) = v_phone
   FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO app_private.order_track_failures (order_number) VALUES (v_number);
    DELETE FROM app_private.order_track_failures WHERE failed_at < now() - interval '1 day';
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  IF v_order.order_status = 'cancelled' THEN
    RETURN jsonb_build_object('status', 'already_cancelled', 'order_id', v_order.id);
  END IF;
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('status', 'paid');
  END IF;
  IF v_order.payment_confirmed_at IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'payment_confirmed');
  END IF;
  IF v_order.order_status <> 'pending' THEN
    RETURN jsonb_build_object('status', 'processed');
  END IF;

  UPDATE public.orders
     SET order_status  = 'cancelled',
         cancelled_at  = now(),
         cancel_reason = v_reason,
         cancelled_by  = 'buyer',
         updated_at    = now()
   WHERE id = v_order.id;

  RETURN jsonb_build_object('status', 'cancelled', 'order_id', v_order.id);
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Pembatalan oleh penjual (hak kelola toko dicek server sebelum memanggil)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.cancel_order_by_merchant(p_order_id text, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_reason   text := nullif(left(btrim(regexp_replace(coalesce(p_reason, ''), '[<>\r\n]', ' ', 'g')), 300), '');
  v_order    public.orders%ROWTYPE;
  v_tx_id    text;
  v_tx_amt   numeric;
  v_reversed boolean := false;
  v_rows     integer;
BEGIN
  IF coalesce(p_order_id, '') !~ '^[A-Za-z0-9_-]{1,80}$' THEN
    RETURN jsonb_build_object('status', 'invalid');
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;
  IF v_order.order_status = 'cancelled' THEN
    RETURN jsonb_build_object('status', 'already_cancelled', 'order_id', v_order.id);
  END IF;
  IF v_order.order_status NOT IN ('pending', 'processing')
     OR coalesce(v_order.tracking_number, '') <> ''
     OR coalesce(v_order.shipping_order_id, '') <> '' THEN
    RETURN jsonb_build_object('status', 'shipped');
  END IF;

  -- Pemasukan dari payment gateway yang sudah dikredit ke saldo toko: tarik kembali.
  SELECT id, amount INTO v_tx_id, v_tx_amt
    FROM public.wallet_transactions
   WHERE store_id = v_order.store_id AND type = 'income'
     AND reference_id = v_order.order_number AND status = 'completed'
   LIMIT 1
   FOR UPDATE;

  IF v_tx_id IS NOT NULL THEN
    UPDATE public.stores
       SET balance = balance - v_tx_amt, updated_at = now()
     WHERE id = v_order.store_id AND coalesce(balance, 0) >= v_tx_amt;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN
      -- Saldo sudah ditarik: jangan biarkan saldo minus, minta penjual menghubungi admin.
      RETURN jsonb_build_object('status', 'insufficient_balance');
    END IF;
    UPDATE public.wallet_transactions
       SET status = 'rejected',
           title  = left(coalesce(title, '') || ' (dibatalkan)', 255)
     WHERE id = v_tx_id;
    v_reversed := true;
  END IF;

  UPDATE public.orders
     SET order_status  = 'cancelled',
         cancelled_at  = now(),
         cancel_reason = v_reason,
         cancelled_by  = 'merchant',
         updated_at    = now()
   WHERE id = v_order.id;

  RETURN jsonb_build_object(
    'status', 'cancelled',
    'order_id', v_order.id,
    'was_paid', v_order.payment_status = 'paid',
    'balance_reversed', v_reversed,
    'amount', v_order.total_amount
  );
END;
$$;

REVOKE ALL ON FUNCTION app_private.cancel_order_by_buyer(text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION app_private.cancel_order_by_merchant(text, text) FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Lacak pesanan ikut menampilkan info pembatalan
-- -----------------------------------------------------------------------------
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
      'cancelled_at',         v_order.cancelled_at,
      'cancel_reason',        v_order.cancel_reason,
      'cancelled_by',         v_order.cancelled_by,
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
