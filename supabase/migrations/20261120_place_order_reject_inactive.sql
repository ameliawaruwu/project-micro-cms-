-- Produk berstatus 'Nonaktif' (dinonaktifkan merchant / Sub-Admin Produk) tidak boleh dipesan.
-- Storefront sudah menyembunyikannya, tetapi keranjang lama atau request buatan bisa masih
-- mengirim ID produk tersebut; place_order kini menolaknya di database.
-- CREATE OR REPLACE mempertahankan REVOKE/GRANT dari 20261114_place_order_server_only.sql.

CREATE OR REPLACE FUNCTION public.place_order(p_store_id text, p_customer jsonb, p_items jsonb, p_shipping jsonb, p_payment_method text, p_notes text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;
