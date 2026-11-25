-- ============================================================================
-- MIGRATION: VOUCHER PROMO TOKO
-- Tanggal: 2026-11-25
-- Deskripsi:
--   Merchant membuat voucher (kode promo) untuk tokonya. Pembeli memasukkan kode di
--   checkout; potongan dihitung ULANG di database (place_order) dari harga produk di
--   database, bukan dari browser (AGENTS.md §6.1).
--
--   1. Tabel store_vouchers + RLS (pemilik toko & admin platform mengelola; publik hanya
--      membaca voucher aktif yang ditandai tampil di halaman Promo).
--   2. Kolom orders.discount_amount & orders.voucher_code (dijaga guard_order_columns).
--   3. preview_store_voucher(): cek kode + perkiraan potongan untuk keranjang (anon boleh).
--   4. place_order(..., p_voucher_code DEFAULT NULL): validasi, kunci baris voucher, potong
--      kuota, simpan potongan. Signature 6 argumen lama diganti; pemanggilan 6 argumen
--      (backend lama) tetap jalan karena argumen ke-7 punya DEFAULT.
--   5. Pesanan dibatalkan → kuota voucher dikembalikan.
--
-- URUTAN PENERAPAN: terapkan migrasi ini SEBELUM frontend/backend baru di-deploy
-- (backend baru mengirim argumen ke-7 hanya bila pembeli memakai voucher).
-- ============================================================================

-- 1. Tabel voucher ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_vouchers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id       varchar NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code           varchar(32) NOT NULL CHECK (code ~ '^[A-Z0-9_-]{3,32}$'),
  title          varchar(120),
  discount_type  text NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value bigint NOT NULL CHECK (discount_value > 0),
  max_discount   bigint CHECK (max_discount IS NULL OR max_discount > 0),
  min_purchase   bigint NOT NULL DEFAULT 0 CHECK (min_purchase >= 0),
  quota          integer CHECK (quota IS NULL OR quota > 0),
  used_count     integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  starts_at      timestamptz,
  ends_at        timestamptz,
  is_active      boolean NOT NULL DEFAULT true,
  is_public      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_vouchers_percent_range CHECK (discount_type <> 'percent' OR discount_value <= 100),
  CONSTRAINT store_vouchers_fixed_range CHECK (discount_value <= 100000000),
  CONSTRAINT store_vouchers_period CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at),
  CONSTRAINT store_vouchers_code_unique UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS store_vouchers_store_idx ON public.store_vouchers (store_id);

-- Hanya server/database yang mengubah used_count; kode selalu huruf besar.
CREATE OR REPLACE FUNCTION app_private.guard_store_voucher_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.code := upper(btrim(NEW.code));
  NEW.updated_at := now();
  IF app_private.is_trusted_writer() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.used_count := 0;
  ELSE
    NEW.store_id := OLD.store_id;
    NEW.used_count := OLD.used_count;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS store_vouchers_guard ON public.store_vouchers;
CREATE TRIGGER store_vouchers_guard
  BEFORE INSERT OR UPDATE ON public.store_vouchers
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_store_voucher_columns();

CREATE OR REPLACE FUNCTION app_private.can_manage_store_vouchers(p_store_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT app_private.is_platform_admin() OR app_private.owns_store(p_store_id);
$$;

REVOKE ALL ON FUNCTION app_private.can_manage_store_vouchers(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.can_manage_store_vouchers(text) TO anon, authenticated;

ALTER TABLE public.store_vouchers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.store_vouchers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.store_vouchers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.store_vouchers TO authenticated;
GRANT ALL ON public.store_vouchers TO service_role;

-- Storefront: voucher aktif yang ditampilkan di halaman Promo (toko tidak ditangguhkan).
DROP POLICY IF EXISTS store_vouchers_public_read ON public.store_vouchers;
CREATE POLICY store_vouchers_public_read ON public.store_vouchers
  FOR SELECT
  USING (
    is_active AND is_public
    AND (ends_at IS NULL OR ends_at > now())
    AND EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND NOT coalesce(s.is_suspended, false))
  );

DROP POLICY IF EXISTS store_vouchers_manager_read ON public.store_vouchers;
CREATE POLICY store_vouchers_manager_read ON public.store_vouchers
  FOR SELECT
  USING (app_private.can_manage_store_vouchers(store_id::text));

DROP POLICY IF EXISTS store_vouchers_manager_insert ON public.store_vouchers;
CREATE POLICY store_vouchers_manager_insert ON public.store_vouchers
  FOR INSERT
  WITH CHECK (app_private.can_manage_store_vouchers(store_id::text));

DROP POLICY IF EXISTS store_vouchers_manager_update ON public.store_vouchers;
CREATE POLICY store_vouchers_manager_update ON public.store_vouchers
  FOR UPDATE
  USING (app_private.can_manage_store_vouchers(store_id::text))
  WITH CHECK (app_private.can_manage_store_vouchers(store_id::text));

DROP POLICY IF EXISTS store_vouchers_manager_delete ON public.store_vouchers;
CREATE POLICY store_vouchers_manager_delete ON public.store_vouchers
  FOR DELETE
  USING (app_private.can_manage_store_vouchers(store_id::text));

-- 2. Kolom potongan di pesanan --------------------------------------------------
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount bigint NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS voucher_code varchar(32);

CREATE OR REPLACE FUNCTION app_private.guard_order_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF app_private.is_trusted_writer() OR app_private.is_platform_admin() THEN
    RETURN NEW;
  END IF;
  NEW.id := OLD.id;
  NEW.store_id := OLD.store_id;
  NEW.order_number := OLD.order_number;
  NEW.total_amount := OLD.total_amount;
  NEW.discount_amount := OLD.discount_amount;
  NEW.voucher_code := OLD.voucher_code;
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$function$;

-- 3. Aturan voucher (dipakai preview & place_order) -----------------------------
-- Alasan penolakan sebagai kode (teks dua bahasa disusun di frontend); NULL = sah.
CREATE OR REPLACE FUNCTION app_private.voucher_reject_reason(v public.store_vouchers, p_subtotal bigint)
RETURNS text
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN NOT v.is_active THEN 'inactive'
    WHEN v.starts_at IS NOT NULL AND v.starts_at > now() THEN 'not_started'
    WHEN v.ends_at IS NOT NULL AND v.ends_at <= now() THEN 'expired'
    WHEN v.quota IS NOT NULL AND v.used_count >= v.quota THEN 'quota'
    WHEN p_subtotal < v.min_purchase THEN 'min_purchase'
    ELSE NULL
  END;
$$;

-- Potongan untuk subtotal produk (ongkir tidak dipotong), tidak melebihi subtotal.
CREATE OR REPLACE FUNCTION app_private.voucher_amount(v public.store_vouchers, p_subtotal bigint)
RETURNS bigint
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT greatest(0, least(
    p_subtotal,
    CASE WHEN v.discount_type = 'percent'
         THEN least(floor(p_subtotal * v.discount_value / 100.0)::bigint, coalesce(v.max_discount, p_subtotal))
         ELSE v.discount_value
    END
  ));
$$;

REVOKE ALL ON FUNCTION app_private.voucher_reject_reason(public.store_vouchers, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.voucher_amount(public.store_vouchers, bigint) FROM PUBLIC;

-- Pratinjau di checkout: subtotal dihitung dari harga produk di database.
-- Hasil: { valid, reason?, code, title, discount_type, discount_value, max_discount,
--          min_purchase, subtotal, discount }
CREATE OR REPLACE FUNCTION public.preview_store_voucher(p_store_id text, p_code text, p_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v        public.store_vouchers%ROWTYPE;
  v_code   text := upper(btrim(coalesce(p_code, '')));
  v_sub    bigint := 0;
  v_item   jsonb;
  v_qty    integer;
  v_price  bigint;
  v_reason text;
BEGIN
  IF v_code !~ '^[A-Z0-9_-]{3,32}$' THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;
  SELECT * INTO v FROM public.store_vouchers WHERE store_id = p_store_id AND code = v_code;
  IF NOT FOUND OR EXISTS (SELECT 1 FROM public.stores s WHERE s.id = p_store_id AND coalesce(s.is_suspended, false)) THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'not_found');
  END IF;

  IF jsonb_typeof(p_items) = 'array' AND jsonb_array_length(p_items) <= 100 THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
      v_qty := CASE WHEN (v_item->>'quantity') ~ '^[0-9]{1,4}$' THEN (v_item->>'quantity')::integer ELSE 0 END;
      IF v_qty BETWEEN 1 AND 1000 THEN
        SELECT coalesce(p.price, 0) INTO v_price FROM public.products p
         WHERE p.id = v_item->>'product_id' AND p.store_id = p_store_id
           AND coalesce(p.status, '') <> 'Nonaktif';
        v_sub := v_sub + coalesce(v_price, 0) * v_qty;
        v_price := NULL;
      END IF;
    END LOOP;
  END IF;

  v_reason := app_private.voucher_reject_reason(v, v_sub);
  RETURN jsonb_strip_nulls(jsonb_build_object(
    'valid', v_reason IS NULL,
    'reason', v_reason,
    'code', v.code,
    'title', v.title,
    'discount_type', v.discount_type,
    'discount_value', v.discount_value,
    'max_discount', v.max_discount,
    'min_purchase', v.min_purchase,
    'subtotal', v_sub,
    'discount', CASE WHEN v_reason IS NULL THEN app_private.voucher_amount(v, v_sub) ELSE 0 END
  ));
END;
$$;

REVOKE ALL ON FUNCTION public.preview_store_voucher(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.preview_store_voucher(text, text, jsonb) TO anon, authenticated;

-- 4. place_order dengan voucher ---------------------------------------------------
DROP FUNCTION IF EXISTS public.place_order(text, jsonb, jsonb, jsonb, text, text);

CREATE OR REPLACE FUNCTION public.place_order(
  p_store_id text, p_customer jsonb, p_items jsonb, p_shipping jsonb, p_payment_method text, p_notes text,
  p_voucher_code text DEFAULT NULL
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_store     public.stores%ROWTYPE;
  v_item      jsonb;
  v_product   public.products%ROWTYPE;
  v_voucher   public.store_vouchers%ROWTYPE;
  v_qty       integer;
  v_subtotal  bigint := 0;
  v_shipping  bigint;
  v_discount  bigint := 0;
  v_vcode     text := nullif(upper(btrim(coalesce(p_voucher_code, ''))), '');
  v_reason    text;
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
    IF v_product.status = 'Nonaktif' THEN
      -- ERRCODE default P0001: backend /api/orders/place meneruskan pesan ini ke pembeli.
      RAISE EXCEPTION 'Produk "%" sedang tidak dijual. Hapus dari keranjang lalu coba lagi.', left(coalesce(v_product.name, '-'), 120);
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

  -- Voucher: baris dikunci agar kuota tidak terpakai melebihi batas oleh pesanan bersamaan.
  IF v_vcode IS NOT NULL THEN
    IF v_vcode !~ '^[A-Z0-9_-]{3,32}$' THEN
      RAISE EXCEPTION 'Kode voucher tidak ditemukan.';
    END IF;
    SELECT * INTO v_voucher FROM public.store_vouchers
     WHERE store_id = p_store_id AND code = v_vcode
     FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Kode voucher tidak ditemukan.';
    END IF;
    v_reason := app_private.voucher_reject_reason(v_voucher, v_subtotal);
    IF v_reason = 'min_purchase' THEN
      RAISE EXCEPTION 'Voucher % berlaku untuk belanja minimal %.', v_vcode, app_private.fmt_rupiah(v_voucher.min_purchase);
    ELSIF v_reason = 'quota' THEN
      RAISE EXCEPTION 'Kuota voucher % sudah habis.', v_vcode;
    ELSIF v_reason = 'not_started' THEN
      RAISE EXCEPTION 'Voucher % belum berlaku.', v_vcode;
    ELSIF v_reason IS NOT NULL THEN
      RAISE EXCEPTION 'Voucher % sudah tidak berlaku.', v_vcode;
    END IF;
    v_discount := app_private.voucher_amount(v_voucher, v_subtotal);
    UPDATE public.store_vouchers SET used_count = used_count + 1 WHERE id = v_voucher.id;
  END IF;

  v_number := 'KB-' || upper(encode(extensions.gen_random_bytes(5), 'hex'));

  INSERT INTO public.orders (
    store_id, order_number, customer_name, customer_phone, customer_email,
    shipping_address, shipping_city, shipping_courier, shipping_service, shipping_cost,
    total_amount, discount_amount, voucher_code, payment_method, payment_status, order_status, notes,
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
    v_subtotal - v_discount + v_shipping,
    v_discount,
    CASE WHEN v_discount > 0 OR v_vcode IS NOT NULL THEN v_vcode END,
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
$function$;

-- Sama seperti 20261114_place_order_server_only.sql: hanya backend (koneksi tepercaya).
REVOKE EXECUTE ON FUNCTION public.place_order(text, jsonb, jsonb, jsonb, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.place_order(text, jsonb, jsonb, jsonb, text, text, text) FROM anon, authenticated;

-- 5. Pesanan dibatalkan → kuota voucher kembali -------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_release_order_voucher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.voucher_code IS NOT NULL
     AND NEW.order_status = 'cancelled'
     AND OLD.order_status IS DISTINCT FROM 'cancelled' THEN
    UPDATE public.store_vouchers
       SET used_count = greatest(used_count - 1, 0)
     WHERE store_id = NEW.store_id AND code = NEW.voucher_code;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_release_voucher ON public.orders;
CREATE TRIGGER trg_orders_release_voucher
  AFTER UPDATE OF order_status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_release_order_voucher();

REVOKE ALL ON FUNCTION app_private.trg_release_order_voucher() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.guard_store_voucher_columns() FROM PUBLIC;

NOTIFY pgrst, 'reload schema';
