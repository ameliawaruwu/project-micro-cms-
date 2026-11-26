-- Batas bayar 24 jam untuk pesanan dari halaman toko.
--
-- * Pesanan non-COD yang masih "pending" + "unpaid", belum ada konfirmasi/bukti bayar dari pembeli,
--   dan dibuat lebih dari N jam lalu dibatalkan otomatis: order_status = 'cancelled',
--   payment_status = 'expired', cancelled_by = 'system'.
-- * Dipanggil berkala oleh server (backend/orderController.ts → startOrderExpiryJob, tiap 5 menit)
--   lewat koneksi DB tepercaya. TIDAK di-GRANT ke anon/authenticated.
-- * Pesanan yang pembelinya sudah mengirim bukti transfer tidak kedaluwarsa; penjual yang memutuskan.
-- * Bila pembayaran gateway (Midtrans/Duitku) ternyata tetap masuk setelah pesanan kedaluwarsa,
--   mark_order_paid menghidupkan kembali pesanan itu (uang pembeli sudah diterima), lihat bagian 2.
-- * Stok tidak dikurangi saat pesanan dibuat, jadi tidak ada stok yang dikembalikan.

-- -----------------------------------------------------------------------------
-- 1. Pembatalan otomatis pesanan yang melewati batas bayar
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.expire_unpaid_orders(p_hours integer DEFAULT 24)
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_hours integer := least(greatest(coalesce(p_hours, 24), 1), 720);
  v_count integer;
BEGIN
  UPDATE public.orders
     SET order_status   = 'cancelled',
         payment_status = 'expired',
         cancelled_at   = now(),
         cancelled_by   = 'system',
         cancel_reason  = 'Batas waktu pembayaran ' || v_hours || ' jam habis',
         updated_at     = now()
   WHERE order_status = 'pending'
     AND payment_status = 'unpaid'
     AND payment_confirmed_at IS NULL
     AND paid_at IS NULL
     AND coalesce(payment_method, '') !~* '\mcod\M'
     AND created_at < now() - make_interval(hours => v_hours);
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION app_private.expire_unpaid_orders(integer) FROM PUBLIC, anon, authenticated;

-- Pencarian pesanan kedaluwarsa tetap ringan saat tabel membesar.
CREATE INDEX IF NOT EXISTS orders_pending_unpaid_created_idx
  ON public.orders (created_at)
  WHERE order_status = 'pending' AND payment_status = 'unpaid';

-- -----------------------------------------------------------------------------
-- 2. mark_order_paid: pembayaran gateway yang masuk terlambat menghidupkan kembali pesanan
--    yang dibatalkan otomatis oleh sistem (bukan yang dibatalkan pembeli/penjual).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.mark_order_paid(p_merchant_order_id text, p_amount bigint)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_order    public.orders%ROWTYPE;
  v_credited boolean := false;
  v_revive   boolean;
BEGIN
  SELECT * INTO v_order FROM public.orders
   WHERE order_number = p_merchant_order_id
      OR order_number = regexp_replace(p_merchant_order_id, '-[A-Za-z0-9]+$', '')
   ORDER BY (order_number = p_merchant_order_id) DESC
   LIMIT 1
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  IF p_amount IS DISTINCT FROM v_order.total_amount THEN
    RAISE WARNING 'mark_order_paid: nominal % tidak sama dengan total % (pesanan %)', p_amount, v_order.total_amount, v_order.order_number;
    RETURN NULL;
  END IF;

  v_revive := v_order.order_status = 'cancelled' AND v_order.cancelled_by = 'system';

  UPDATE public.orders
     SET payment_status = 'paid',
         paid_at = coalesce(paid_at, now()),
         order_status = CASE WHEN order_status = 'pending' OR v_revive THEN 'processing' ELSE order_status END,
         cancelled_at  = CASE WHEN v_revive THEN NULL ELSE cancelled_at END,
         cancelled_by  = CASE WHEN v_revive THEN NULL ELSE cancelled_by END,
         cancel_reason = CASE WHEN v_revive THEN NULL ELSE cancel_reason END,
         updated_at = now()
   WHERE id = v_order.id;

  IF NOT EXISTS (SELECT 1 FROM public.wallet_transactions
                  WHERE store_id = v_order.store_id AND type = 'income' AND reference_id = v_order.order_number) THEN
    UPDATE public.stores SET balance = coalesce(balance, 0) + v_order.total_amount, updated_at = now()
     WHERE id = v_order.store_id;
    INSERT INTO public.wallet_transactions (store_id, type, title, amount, reference_id, status)
    VALUES (v_order.store_id, 'income', left('Penjualan ' || v_order.order_number, 255), v_order.total_amount,
            v_order.order_number, 'completed');
    v_credited := true;
  END IF;

  RETURN jsonb_build_object('order_id', v_order.id, 'order_number', v_order.order_number,
                            'store_id', v_order.store_id, 'amount', v_order.total_amount, 'credited', v_credited);
END;
$function$;

REVOKE ALL ON FUNCTION app_private.mark_order_paid(text, bigint) FROM PUBLIC, anon, authenticated;
