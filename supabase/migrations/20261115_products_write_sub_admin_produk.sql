-- Hak tulis produk: pemilik toko, super admin, dan HANYA Sub-Admin Produk
-- (community_admin / sub_admin_produk) untuk toko binaan komunitasnya.
-- Sub-Admin Utama (sub_admin / sub_admin_umum) tidak lagi bisa menambah/mengubah/menghapus
-- produk toko binaan; tugasnya menambah toko binaan ke komunitas (lewat backend
-- /api/community/manage/members).
--
-- Terapkan SETELAH kode frontend baru live (tab Produk tidak lagi tampil untuk Sub-Admin Utama).

CREATE OR REPLACE FUNCTION app_private.can_write_store_products(p_store_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT app_private.is_platform_admin()
      OR app_private.owns_store(p_store_id)
      OR (
        app_private.session_role() IN ('community_admin', 'sub_admin_produk')
        AND app_private.store_in_my_community(p_store_id)
      );
$$;

REVOKE ALL ON FUNCTION app_private.can_write_store_products(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.can_write_store_products(text) TO anon, authenticated;

DROP POLICY IF EXISTS products_insert_manager ON public.products;
CREATE POLICY products_insert_manager ON public.products
  FOR INSERT
  WITH CHECK (app_private.can_write_store_products(store_id::text));

DROP POLICY IF EXISTS products_update_manager ON public.products;
CREATE POLICY products_update_manager ON public.products
  FOR UPDATE
  USING (app_private.can_write_store_products(store_id::text))
  WITH CHECK (app_private.can_write_store_products(store_id::text));

DROP POLICY IF EXISTS products_delete_manager ON public.products;
CREATE POLICY products_delete_manager ON public.products
  FOR DELETE
  USING (app_private.can_write_store_products(store_id::text));
