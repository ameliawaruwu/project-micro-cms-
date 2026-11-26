-- =============================================================================
-- KEAMANAN TAHAP 2b-4 — Pesanan, saldo penjualan, domain berbayar, kontak komunitas, suspend
-- =============================================================================
-- Prasyarat: tahap 2b-1 (sesi), 2b-2 (owns_store / is_trusted_writer), 2b-3 (can_manage_store,
-- store_in_my_community, my_community_id).
--
-- Sebelumnya (lewat anon key):
--   * siapa pun bisa membaca SELURUH pesanan semua toko (nama, HP, alamat pembeli), mengubah
--     atau menghapusnya, dan membuat pesanan "paid" dengan total sembarang;
--   * saldo toko dinaikkan oleh browser pembeli setelah pembayaran (sejak 2b-2 diblokir, jadi
--     penjualan via payment gateway tidak menambah saldo sama sekali);
--   * merchant bisa menandai permintaan domain "active/paid" sendiri tanpa membayar;
--   * email & HP koordinator / sub-admin komunitas terbaca publik;
--   * sub-admin komunitas tidak bisa menangguhkan toko komunitasnya (diblokir 2b-2).
--
-- Setelah migrasi ini:
--   * pesanan dibuat lewat RPC public.place_order: harga dibaca dari tabel products, status
--     selalu "unpaid", nomor pesanan dibuat database;
--   * pesanan & item hanya terlihat/diubah oleh pengelola toko (pemilik, staf komunitas,
--     super admin); total, toko, dan nomor pesanan tidak bisa diubah dari browser;
--   * pembeli menandai "sudah transfer" lewat RPC public.buyer_confirm_payment;
--   * status lunas dari payment gateway + kenaikan saldo hanya oleh server
--     (app_private.mark_order_paid, nominal dicek & idempoten lewat wallet_transactions);
--   * domain berbayar diaktifkan hanya oleh server (app_private.mark_domain_paid);
--   * kolom kontak komunitas tidak lagi bisa dibaca publik; super admin / staf komunitas
--     membacanya lewat RPC public.community_contacts;
--   * staf komunitas boleh mengubah stores.is_suspended untuk toko di komunitasnya.
-- Kode server (DATABASE_URL, peran postgres) tidak terkena aturan ini.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Pesanan: buat lewat RPC (harga dari database)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.place_order(
  p_store_id text,
  p_customer jsonb,
  p_items jsonb,
  p_shipping jsonb,
  p_payment_method text,
  p_notes text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store     public.stores%ROWTYPE;
  v_item      jsonb;
  v_product   public.products%ROWTYPE;
  v_qty       integer;
  v_subtotal  bigint := 0;
  v_shipping  bigint;
  v_order_id  text;
  v_number    text;
  v_name      text := left(btrim(coalesce(p_customer->>'name', '')), 255);
  v_phone     text := left(regexp_replace(coalesce(p_customer->>'phone', ''), '[^0-9+]', '', 'g'), 32);
  v_address   text := left(btrim(coalesce(p_customer->>'address', '')), 2000);
  v_lines     jsonb := '[]'::jsonb;
  v_row       jsonb;
BEGIN
  SELECT * INTO v_store FROM public.stores WHERE id = p_store_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Toko tidak ditemukan.' USING ERRCODE = 'P0002';
  END IF;
  IF coalesce(v_store.is_suspended, false) THEN
    RAISE EXCEPTION 'Toko sedang ditangguhkan dan tidak menerima pesanan.' USING ERRCODE = '42501';
  END IF;
  IF v_name = '' OR length(v_phone) < 9 THEN
    RAISE EXCEPTION 'Nama dan nomor WhatsApp pembeli wajib diisi.' USING ERRCODE = '22023';
  END IF;
  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array'
     OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 100 THEN
    RAISE EXCEPTION 'Isi keranjang tidak valid.' USING ERRCODE = '22023';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := CASE WHEN (v_item->>'quantity') ~ '^[0-9]{1,4}$' THEN (v_item->>'quantity')::integer ELSE 0 END;
    IF v_qty < 1 OR v_qty > 1000 THEN
      RAISE EXCEPTION 'Jumlah produk tidak valid.' USING ERRCODE = '22023';
    END IF;
    SELECT * INTO v_product FROM public.products
     WHERE id = v_item->>'product_id' AND store_id = p_store_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk tidak ditemukan di toko ini.' USING ERRCODE = 'P0002';
    END IF;
    v_subtotal := v_subtotal + coalesce(v_product.price, 0) * v_qty;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'product_name', left(coalesce(v_product.name, 'Produk Toko'), 255),
      'product_image', v_product.image_url,
      'price', coalesce(v_product.price, 0),
      'quantity', v_qty,
      'subtotal', coalesce(v_product.price, 0) * v_qty,
      'variant_info', nullif(left(btrim(coalesce(v_item->>'variant_info', '')), 128), '')
    );
  END LOOP;

  v_shipping := CASE WHEN (p_shipping->>'cost') ~ '^[0-9]{1,9}$' THEN (p_shipping->>'cost')::bigint ELSE 0 END;
  IF v_shipping > 5000000 THEN
    RAISE EXCEPTION 'Ongkos kirim tidak valid.' USING ERRCODE = '22023';
  END IF;

  v_number := 'KB-' || upper(encode(extensions.gen_random_bytes(5), 'hex'));

  INSERT INTO public.orders (
    store_id, order_number, customer_name, customer_phone, customer_email,
    shipping_address, shipping_city, shipping_courier, shipping_service, shipping_cost,
    total_amount, payment_method, payment_status, order_status, notes,
    destination_address, destination_postal_code, courier_code, courier_service,
    origin_branch_id, created_at, updated_at
  ) VALUES (
    p_store_id, v_number, v_name, v_phone,
    nullif(left(btrim(coalesce(p_customer->>'email', '')), 255), ''),
    v_address,
    left(coalesce(nullif(btrim(p_shipping->>'city'), ''), 'Indonesia'), 128),
    left(coalesce(nullif(btrim(p_shipping->>'courier'), ''), 'Kurir Toko'), 64),
    left(coalesce(nullif(btrim(p_shipping->>'service'), ''), 'Reguler'), 64),
    v_shipping,
    v_subtotal + v_shipping,
    left(coalesce(nullif(btrim(p_payment_method), ''), 'Manual'), 64),
    'unpaid', 'pending',
    nullif(left(coalesce(p_notes, ''), 2000), ''),
    v_address,
    nullif(left(btrim(coalesce(p_shipping->>'postal_code', '')), 10), ''),
    nullif(left(btrim(coalesce(p_shipping->>'courier_code', '')), 32), ''),
    nullif(left(btrim(coalesce(p_shipping->>'service', '')), 64), ''),
    (SELECT b.id FROM public.shipping_branches b
      WHERE b.id = p_shipping->>'origin_branch_id' AND b.store_id = p_store_id),
    now(), now()
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal, variant_info)
  SELECT v_order_id, l->>'product_id', l->>'product_name', l->>'product_image',
         (l->>'price')::bigint, (l->>'quantity')::integer, (l->>'subtotal')::bigint, l->>'variant_info'
    FROM jsonb_array_elements(v_lines) l;

  SELECT to_jsonb(o) || jsonb_build_object(
           'order_items', coalesce((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.id) FROM public.order_items i WHERE i.order_id = o.id), '[]'::jsonb))
    INTO v_row
    FROM public.orders o WHERE o.id = v_order_id;
  RETURN v_row;
END;
$$;

-- Pembeli menandai "sudah transfer" (QRIS / transfer langsung). Butuh id + nomor pesanan.
CREATE OR REPLACE FUNCTION public.buyer_confirm_payment(p_order_id text, p_order_number text)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_at timestamptz;
BEGIN
  UPDATE public.orders
     SET payment_confirmed_at = coalesce(payment_confirmed_at, now()), updated_at = now()
   WHERE id = p_order_id AND order_number = p_order_number AND payment_status = 'unpaid'
  RETURNING payment_confirmed_at INTO v_at;
  IF v_at IS NULL THEN
    RAISE EXCEPTION 'Pesanan tidak ditemukan atau sudah dibayar.' USING ERRCODE = 'P0002';
  END IF;
  RETURN v_at;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text, jsonb, jsonb, jsonb, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.buyer_confirm_payment(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(text, jsonb, jsonb, jsonb, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.buyer_confirm_payment(text, text) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2. Lunas via payment gateway + saldo (khusus server)
-- -----------------------------------------------------------------------------
-- p_merchant_order_id = nomor pesanan, atau nomor pesanan + '-<sufiks percobaan>'.
-- Saldo hanya ditambah sekali per pesanan (dicek lewat wallet_transactions).
CREATE OR REPLACE FUNCTION app_private.mark_order_paid(p_merchant_order_id text, p_amount bigint)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_order    public.orders%ROWTYPE;
  v_credited boolean := false;
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

  UPDATE public.orders
     SET payment_status = 'paid',
         paid_at = coalesce(paid_at, now()),
         order_status = CASE WHEN order_status = 'pending' THEN 'processing' ELSE order_status END,
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
$$;

-- p_merchant_order_id = 'DOM-<id permintaan>-<sufiks>' atau invoice_number yang dibuat admin.
CREATE OR REPLACE FUNCTION app_private.mark_domain_paid(p_merchant_order_id text, p_amount bigint)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_req    public.domain_requests%ROWTYPE;
  v_domain text;
BEGIN
  SELECT * INTO v_req FROM public.domain_requests
   WHERE invoice_number = p_merchant_order_id
      OR (p_merchant_order_id LIKE 'DOM-%'
          AND id = regexp_replace(substr(p_merchant_order_id, 5), '-[A-Za-z0-9]+$', ''))
   LIMIT 1
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  v_domain := lower(coalesce(v_req.requested_domain, '') || coalesce(v_req.tld, ''));

  IF v_req.status = 'active' AND v_req.payment_status = 'paid' THEN
    RETURN jsonb_build_object('request_id', v_req.id, 'store_id', v_req.store_id, 'domain', v_domain, 'already', true);
  END IF;
  IF v_req.status <> 'approved' OR p_amount IS DISTINCT FROM v_req.tld_price THEN
    RAISE WARNING 'mark_domain_paid: status % / nominal % vs tagihan % (permintaan %)', v_req.status, p_amount, v_req.tld_price, v_req.id;
    RETURN NULL;
  END IF;

  UPDATE public.domain_requests
     SET status = 'active', payment_status = 'paid', activated_at = now(),
         invoice_number = p_merchant_order_id, updated_at = now()
   WHERE id = v_req.id;
  UPDATE public.stores SET custom_domain = v_domain, updated_at = now() WHERE id = v_req.store_id;

  RETURN jsonb_build_object('request_id', v_req.id, 'store_id', v_req.store_id, 'domain', v_domain, 'already', false);
END;
$$;

REVOKE ALL ON FUNCTION app_private.mark_order_paid(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION app_private.mark_domain_paid(text, bigint) FROM PUBLIC, anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. orders & order_items: hanya pengelola toko
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.guard_order_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF app_private.is_trusted_writer() OR app_private.is_platform_admin() THEN
    RETURN NEW;
  END IF;
  NEW.id := OLD.id;
  NEW.store_id := OLD.store_id;
  NEW.order_number := OLD.order_number;
  NEW.total_amount := OLD.total_amount;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS orders_guard_columns ON public.orders;
CREATE TRIGGER orders_guard_columns
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_order_columns();

DROP POLICY IF EXISTS orders_all ON public.orders;
CREATE POLICY orders_select_manager ON public.orders
  FOR SELECT TO anon, authenticated
  USING (app_private.can_manage_store(store_id));
CREATE POLICY orders_update_manager ON public.orders
  FOR UPDATE TO anon, authenticated
  USING (app_private.can_manage_store(store_id))
  WITH CHECK (app_private.can_manage_store(store_id));
CREATE POLICY orders_insert_admin ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin());
CREATE POLICY orders_delete_admin ON public.orders
  FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin());

DROP POLICY IF EXISTS order_items_all ON public.order_items;
CREATE POLICY order_items_select_manager ON public.order_items
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o
                  WHERE o.id = order_id AND app_private.can_manage_store(o.store_id)));
CREATE POLICY order_items_insert_admin ON public.order_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin());
CREATE POLICY order_items_update_admin ON public.order_items
  FOR UPDATE TO anon, authenticated
  USING (app_private.is_platform_admin())
  WITH CHECK (app_private.is_platform_admin());
CREATE POLICY order_items_delete_admin ON public.order_items
  FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin());

-- -----------------------------------------------------------------------------
-- 4. domain_requests: merchant hanya mengajukan / mengubah permintaan yang masih pending
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.guard_domain_request_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF app_private.is_trusted_writer() OR app_private.is_platform_admin() THEN
    RETURN NEW;
  END IF;
  NEW.status := 'pending';
  NEW.payment_status := 'unpaid';
  NEW.invoice_number := NULL;
  NEW.approved_at := NULL;
  NEW.activated_at := NULL;
  IF TG_OP = 'INSERT' THEN
    NEW.admin_notes := NULL;
  ELSE
    NEW.admin_notes := OLD.admin_notes;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS domain_requests_guard_columns ON public.domain_requests;
CREATE TRIGGER domain_requests_guard_columns
  BEFORE INSERT OR UPDATE ON public.domain_requests
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_domain_request_columns();

DROP POLICY IF EXISTS domain_requests_update_owner_admin ON public.domain_requests;
CREATE POLICY domain_requests_update_owner_admin ON public.domain_requests
  FOR UPDATE TO anon, authenticated
  USING (app_private.is_platform_admin() OR (app_private.owns_store(store_id) AND status = 'pending'))
  WITH CHECK (app_private.is_platform_admin() OR (app_private.owns_store(store_id) AND status = 'pending'));

-- -----------------------------------------------------------------------------
-- 5. communities: kontak koordinator / sub-admin tidak lagi publik
-- -----------------------------------------------------------------------------
REVOKE SELECT ON public.communities FROM anon, authenticated;
GRANT SELECT (id, name, slug, description, coordinator_name, turnover_fee_percent, logo_url, status,
              created_at, updated_at, base_domain, sub_admin_name)
  ON public.communities TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.community_contacts()
RETURNS TABLE (id text, coordinator_email text, coordinator_phone text, sub_admin_email text, sub_admin_phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id::text, c.coordinator_email::text, c.coordinator_phone::text,
         c.sub_admin_email::text, c.sub_admin_phone::text
    FROM public.communities c
   WHERE app_private.is_platform_admin()
      OR c.id::text = app_private.my_community_id();
$$;
REVOKE ALL ON FUNCTION public.community_contacts() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_contacts() TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 6. stores.is_suspended: super admin atau staf komunitas toko itu
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.guard_store_money_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF app_private.is_trusted_writer() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.balance := 0;
    IF NOT app_private.is_platform_admin() THEN
      NEW.plan := 'free';
      NEW.is_suspended := false;
    END IF;
  ELSE
    NEW.balance := OLD.balance;
    IF NOT app_private.is_platform_admin() THEN
      NEW.plan := OLD.plan;
      IF NOT app_private.store_in_my_community(OLD.id) THEN
        NEW.is_suspended := OLD.is_suspended;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION app_private.guard_store_staff_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_cid   varchar := NEW.community_id;
  v_cname varchar := NEW.community_name;
  v_upd   timestamptz := NEW.updated_at;
  v_susp  boolean := NEW.is_suspended;
BEGIN
  IF app_private.is_trusted_writer()
     OR app_private.is_platform_admin()
     OR OLD.user_id IS NOT DISTINCT FROM app_private.session_user_id() THEN
    RETURN NEW;
  END IF;
  NEW := OLD;
  NEW.community_id := v_cid;
  NEW.community_name := v_cname;
  NEW.updated_at := v_upd;
  NEW.is_suspended := v_susp; -- sudah disaring stores_guard_money (hanya staf komunitas toko ini)
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.guard_order_columns() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION app_private.guard_domain_request_columns() FROM PUBLIC, anon, authenticated;
