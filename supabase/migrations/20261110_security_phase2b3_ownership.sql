-- =============================================================================
-- KEAMANAN TAHAP 2b-3 — Kepemilikan data toko, produk, komunitas & data pribadi user
-- =============================================================================
-- Prasyarat: tahap 2b-1 (sesi) dan 2b-2 (helper app_private.owns_store / is_trusted_writer).
--
-- Sebelumnya siapa pun (anon key) bisa mengubah/menghapus toko, produk, cabang pengiriman,
-- permintaan domain, komunitas & anggota komunitas milik siapa pun, membuat baris user baru,
-- mengubah profil user lain, dan membaca email + nomor HP seluruh user.
--
-- Setelah migrasi ini:
--   * toko: dibuat untuk diri sendiri; diubah/dihapus pemilik atau super admin. Staf komunitas
--     (sub_admin, sub_admin_umum, community_admin, sub_admin_produk) hanya boleh mengubah
--     keanggotaan komunitas toko (community_id/community_name) untuk komunitasnya;
--   * produk: pemilik toko, super admin, atau staf komunitas untuk toko di komunitasnya;
--   * cabang pengiriman: pemilik toko atau super admin;
--   * permintaan domain: hanya terlihat & diubah pemilik toko atau super admin;
--   * komunitas: dibuat/dihapus super admin; diubah super admin atau staf komunitas itu sendiri
--     (status & persentase biaya tetap hanya oleh super admin);
--   * anggota komunitas (store_communities): super admin atau staf komunitas itu;
--   * users: baris hanya terlihat oleh pemiliknya, super admin, dan staf untuk user di
--     komunitasnya; baris baru hanya lewat RPC resmi / super admin.
-- Baca publik untuk etalase (toko, produk, komunitas, cabang) tetap seperti semula.
-- Kode server (DATABASE_URL, peran postgres) tidak terkena aturan ini.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Helper
-- -----------------------------------------------------------------------------
-- ID komunitas yang dikelola user sesi ini (hanya untuk peran staf komunitas), atau NULL.
CREATE OR REPLACE FUNCTION app_private.my_community_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.community_id
    FROM public.users u
   WHERE u.id = app_private.session_user_id()
     AND u.role IN ('sub_admin', 'sub_admin_umum', 'community_admin', 'sub_admin_produk')
     AND u.community_id IS NOT NULL;
$$;

-- Toko termasuk komunitas yang dikelola user sesi ini (komunitas utama atau keanggotaan tambahan).
CREATE OR REPLACE FUNCTION app_private.store_in_my_community(p_store_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.stores s
     WHERE s.id = p_store_id
       AND app_private.my_community_id() IS NOT NULL
       AND (
         s.community_id = app_private.my_community_id()
         OR EXISTS (SELECT 1 FROM public.store_communities sc
                     WHERE sc.store_id = s.id AND sc.community_id = app_private.my_community_id())
       )
  );
$$;

-- Boleh mengelola isi toko (produk): super admin, pemilik, atau staf komunitas toko itu.
CREATE OR REPLACE FUNCTION app_private.can_manage_store(p_store_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_private.is_platform_admin()
      OR app_private.owns_store(p_store_id)
      OR app_private.store_in_my_community(p_store_id);
$$;

-- Toko tercatat sebagai anggota komunitas tertentu (tabel store_communities).
CREATE OR REPLACE FUNCTION app_private.store_has_membership(p_store_id text, p_community_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.store_communities
                  WHERE store_id = p_store_id AND community_id = p_community_id);
$$;

REVOKE ALL ON FUNCTION app_private.my_community_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.store_in_my_community(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.can_manage_store(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.store_has_membership(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.my_community_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.store_in_my_community(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.can_manage_store(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.store_has_membership(text, text) TO anon, authenticated;

-- Pengganti pencarian users?email=eq... dari browser (cek email sudah terdaftar saat daftar).
CREATE OR REPLACE FUNCTION public.email_registered(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE lower(email) = lower(btrim(coalesce(p_email, ''))));
$$;
REVOKE ALL ON FUNCTION public.email_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.email_registered(text) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 1. stores
-- -----------------------------------------------------------------------------
-- Staf komunitas yang bukan pemilik toko hanya boleh mengubah kolom keanggotaan komunitas.
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
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS stores_guard_staff ON public.stores;
CREATE TRIGGER stores_guard_staff
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_store_staff_columns();

DROP POLICY IF EXISTS stores_insert ON public.stores;
DROP POLICY IF EXISTS stores_update_owner ON public.stores;
DROP POLICY IF EXISTS stores_delete_owner ON public.stores;
-- stores_select_owner / stores_select_public (baca) tetap.

CREATE POLICY stores_insert_self ON public.stores
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin() OR user_id = app_private.session_user_id());

CREATE POLICY stores_update_owner_staff ON public.stores
  FOR UPDATE TO anon, authenticated
  USING (
    app_private.is_platform_admin()
    OR user_id = app_private.session_user_id()
    OR (app_private.my_community_id() IS NOT NULL
        AND (community_id IS NULL OR app_private.store_in_my_community(id)))
  )
  WITH CHECK (
    app_private.is_platform_admin()
    OR user_id = app_private.session_user_id()
    OR (app_private.my_community_id() IS NOT NULL
        AND (community_id IS NULL
             OR community_id = app_private.my_community_id()
             OR app_private.store_has_membership(id, community_id)))
  );

CREATE POLICY stores_delete_owner_admin ON public.stores
  FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin() OR user_id = app_private.session_user_id());

-- -----------------------------------------------------------------------------
-- 2. products
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS products_insert ON public.products;
DROP POLICY IF EXISTS products_update ON public.products;
DROP POLICY IF EXISTS products_delete ON public.products;
-- products_select (baca publik) tetap.

CREATE POLICY products_insert_manager ON public.products
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.can_manage_store(store_id));

CREATE POLICY products_update_manager ON public.products
  FOR UPDATE TO anon, authenticated
  USING (app_private.can_manage_store(store_id))
  WITH CHECK (app_private.can_manage_store(store_id));

CREATE POLICY products_delete_manager ON public.products
  FOR DELETE TO anon, authenticated
  USING (app_private.can_manage_store(store_id));

-- -----------------------------------------------------------------------------
-- 3. shipping_branches
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS shipping_branches_all_policy ON public.shipping_branches;

CREATE POLICY shipping_branches_select_all ON public.shipping_branches
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY shipping_branches_insert_owner ON public.shipping_branches
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin() OR app_private.owns_store(store_id));

CREATE POLICY shipping_branches_update_owner ON public.shipping_branches
  FOR UPDATE TO anon, authenticated
  USING (app_private.is_platform_admin() OR app_private.owns_store(store_id))
  WITH CHECK (app_private.is_platform_admin() OR app_private.owns_store(store_id));

CREATE POLICY shipping_branches_delete_owner ON public.shipping_branches
  FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin() OR app_private.owns_store(store_id));

-- -----------------------------------------------------------------------------
-- 4. domain_requests
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS domain_requests_all_policy ON public.domain_requests;

CREATE POLICY domain_requests_select_owner_admin ON public.domain_requests
  FOR SELECT TO anon, authenticated
  USING (app_private.is_platform_admin() OR app_private.owns_store(store_id));

CREATE POLICY domain_requests_insert_owner ON public.domain_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    app_private.is_platform_admin()
    OR (app_private.owns_store(store_id) AND coalesce(status, 'pending') = 'pending')
  );

-- Pemilik: hanya status pending/active/cancelled (persetujuan & penolakan oleh super admin).
CREATE POLICY domain_requests_update_owner_admin ON public.domain_requests
  FOR UPDATE TO anon, authenticated
  USING (app_private.is_platform_admin() OR app_private.owns_store(store_id))
  WITH CHECK (
    app_private.is_platform_admin()
    OR (app_private.owns_store(store_id) AND status IN ('pending', 'active', 'cancelled'))
  );

CREATE POLICY domain_requests_delete_admin ON public.domain_requests
  FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin());

-- -----------------------------------------------------------------------------
-- 5. store_communities (keanggotaan tambahan)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS store_communities_insert ON public.store_communities;
DROP POLICY IF EXISTS store_communities_delete ON public.store_communities;
-- store_communities_select (baca) tetap.

CREATE POLICY store_communities_insert_staff ON public.store_communities
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin() OR community_id = app_private.my_community_id());

CREATE POLICY store_communities_delete_staff ON public.store_communities
  FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin() OR community_id = app_private.my_community_id());

-- -----------------------------------------------------------------------------
-- 6. communities
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.guard_community_admin_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NOT app_private.is_trusted_writer() AND NOT app_private.is_platform_admin() THEN
    NEW.status := OLD.status;
    NEW.turnover_fee_percent := OLD.turnover_fee_percent;
    NEW.id := OLD.id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS communities_guard_admin ON public.communities;
CREATE TRIGGER communities_guard_admin
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_community_admin_columns();

DROP POLICY IF EXISTS communities_insert_policy ON public.communities;
DROP POLICY IF EXISTS communities_update_policy ON public.communities;
DROP POLICY IF EXISTS communities_delete_policy ON public.communities;
-- communities_select_policy (baca) tetap.

CREATE POLICY communities_insert_admin ON public.communities
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin());

CREATE POLICY communities_update_admin_staff ON public.communities
  FOR UPDATE TO anon, authenticated
  USING (app_private.is_platform_admin() OR id = app_private.my_community_id())
  WITH CHECK (app_private.is_platform_admin() OR id = app_private.my_community_id());

CREATE POLICY communities_delete_admin ON public.communities
  FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin());

-- -----------------------------------------------------------------------------
-- 7. users (email & nomor HP tidak lagi terbaca bebas)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_insert_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;
-- users_delete_admin (tahap 2b-2) tetap.

CREATE POLICY users_select_self_admin_staff ON public.users
  FOR SELECT TO anon, authenticated
  USING (
    id = app_private.session_user_id()
    OR app_private.is_platform_admin()
    OR (community_id IS NOT NULL AND community_id = app_private.my_community_id())
  );

-- Daftar akun lewat RPC register_merchant / google_session_user / admin_upsert_user.
CREATE POLICY users_insert_admin ON public.users
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin());

CREATE POLICY users_update_self_admin_staff ON public.users
  FOR UPDATE TO anon, authenticated
  USING (
    id = app_private.session_user_id()
    OR app_private.is_platform_admin()
    OR (community_id IS NOT NULL AND community_id = app_private.my_community_id())
  )
  WITH CHECK (
    id = app_private.session_user_id()
    OR app_private.is_platform_admin()
    OR (community_id IS NOT NULL AND community_id = app_private.my_community_id())
  );
