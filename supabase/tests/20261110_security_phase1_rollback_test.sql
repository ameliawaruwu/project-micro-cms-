-- UJI MIGRASI KEAMANAN TAHAP 1 (AMAN: selalu ROLLBACK).
-- Jalankan di Supabase SQL Editor. Hasil uji muncul sebagai pesan error "TESTRESULT: ...";
-- error itu disengaja agar seluruh perubahan dibatalkan dan database tidak berubah.
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '60s';
CREATE TEMP TABLE zz_seq ON COMMIT DROP AS SELECT last_value, is_called FROM public.seq_users_id;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locked_until timestamptz;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.users ALTER COLUMN reset_token TYPE varchar(255);
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app_private REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION app_private.hash_password(p_plain text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
  SELECT extensions.crypt(p_plain, extensions.gen_salt('bf', 10));
$$;
CREATE OR REPLACE FUNCTION app_private.check_password(p_stored text, p_plain text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
BEGIN
  IF p_stored IS NULL OR p_plain IS NULL OR p_plain = '' THEN
    RETURN false;
  END IF;
  IF p_stored LIKE '$2%' THEN
    RETURN extensions.crypt(p_plain, p_stored) = p_stored;
  END IF;
  IF p_stored ~ '^[0-9a-f]{64}$' THEN
    RETURN p_stored = encode(extensions.digest('kroomify_salt_v1_' || p_plain, 'sha256'), 'hex')
        OR p_stored = encode(extensions.digest('kroomify_salt_v1_' || btrim(p_plain), 'sha256'), 'hex');
  END IF;
  RETURN false;
END;
$$;
CREATE OR REPLACE FUNCTION app_private.user_json(u public.users)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'name', u.name,
    'phone', u.phone,
    'role', u.role,
    'community_id', u.community_id,
    'community_name', u.community_name,
    'avatar_url', u.avatar_url,
    'created_at', u.created_at
  );
$$;
CREATE OR REPLACE FUNCTION app_private.authenticate(p_email text, p_password text)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  v_user public.users;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE lower(email) = lower(btrim(coalesce(p_email, ''))) LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  IF v_user.locked_until IS NOT NULL AND v_user.locked_until > now() THEN
    RAISE EXCEPTION 'Akun dikunci sementara karena terlalu banyak percobaan login. Coba lagi dalam 15 menit.'
      USING ERRCODE = 'P0001';
  END IF;
  IF NOT app_private.check_password(v_user.password_hash, p_password) THEN
    UPDATE public.users
       SET failed_login_count = failed_login_count + 1,
           locked_until = CASE WHEN failed_login_count + 1 >= 10 THEN now() + interval '15 minutes' ELSE locked_until END
     WHERE id = v_user.id;
    RETURN NULL;
  END IF;
  UPDATE public.users
     SET failed_login_count = 0,
         locked_until = NULL,
         password_hash = CASE WHEN password_hash LIKE '$2%' THEN password_hash ELSE app_private.hash_password(p_password) END
   WHERE id = v_user.id
  RETURNING * INTO v_user;
  RETURN v_user;
END;
$$;
CREATE OR REPLACE FUNCTION app_private.require_admin(p_admin_email text, p_admin_password text)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin public.users;
BEGIN
  v_admin := app_private.authenticate(p_admin_email, p_admin_password);
  IF v_admin.id IS NULL OR v_admin.role <> 'admin' THEN
    RETURN NULL;
  END IF;
  RETURN v_admin;
END;
$$;
CREATE OR REPLACE FUNCTION app_private.valid_new_password(p text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p IS NULL OR length(p) < 8 THEN
    RAISE EXCEPTION 'Kata sandi minimal 8 karakter.' USING ERRCODE = '22023';
  END IF;
END;
$$;
DROP FUNCTION IF EXISTS public.verify_user_credentials(character varying, character varying);
CREATE OR REPLACE FUNCTION public.verify_user_credentials(p_email text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users;
  v_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.users WHERE lower(email) = lower(btrim(coalesce(p_email, '')))) INTO v_exists;
  IF NOT v_exists THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akun tidak ditemukan');
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE lower(email) = lower(btrim(p_email)) AND password_hash LIKE 'google%') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akun ini terdaftar dengan Google. Silakan masuk dengan tombol Google.');
  END IF;
  v_user := app_private.authenticate(p_email, p_password);
  IF v_user.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kata sandi tidak sesuai');
  END IF;
  RETURN jsonb_build_object('success', true, 'user', app_private.user_json(v_user));
EXCEPTION WHEN SQLSTATE 'P0001' THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
DROP FUNCTION IF EXISTS public.register_new_user(character varying, character varying, character varying, character varying, character varying, character varying);
CREATE OR REPLACE FUNCTION public.register_merchant(
  p_email text,
  p_password text,
  p_name text,
  p_phone text DEFAULT NULL,
  p_community_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_user public.users;
  v_comm_name text;
BEGIN
  IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Alamat email tidak valid.' USING ERRCODE = '22023';
  END IF;
  PERFORM app_private.valid_new_password(p_password);
  IF EXISTS (SELECT 1 FROM public.users WHERE lower(email) = v_email) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email sudah terdaftar. Silakan masuk.');
  END IF;
  IF p_community_id IS NOT NULL THEN
    SELECT name INTO v_comm_name FROM public.communities WHERE id = p_community_id AND status = 'active';
  END IF;
  INSERT INTO public.users (email, password_hash, name, phone, role, community_id, community_name, created_at, updated_at)
  VALUES (
    v_email,
    app_private.hash_password(p_password),
    coalesce(nullif(btrim(p_name), ''), split_part(v_email, '@', 1)),
    nullif(btrim(coalesce(p_phone, '')), ''),
    'merchant',
    CASE WHEN v_comm_name IS NOT NULL THEN p_community_id END,
    v_comm_name,
    now(), now()
  )
  RETURNING * INTO v_user;
  RETURN jsonb_build_object('success', true, 'user', app_private.user_json(v_user));
END;
$$;
CREATE OR REPLACE FUNCTION public.google_session_user(p_name text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_user public.users;
  v_is_new boolean := false;
BEGIN
  IF auth.uid() IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Sesi Google tidak valid. Silakan masuk ulang.' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.users (email, password_hash, name, role, created_at, updated_at)
    VALUES (v_email, 'google-oauth-managed',
            coalesce(nullif(btrim(p_name), ''), auth.jwt() -> 'user_metadata' ->> 'full_name', split_part(v_email, '@', 1)),
            'merchant', now(), now())
    RETURNING * INTO v_user;
    v_is_new := true;
  END IF;
  RETURN jsonb_build_object('success', true, 'is_new', v_is_new, 'user', app_private.user_json(v_user));
END;
$$;
CREATE OR REPLACE FUNCTION public.change_my_password(p_email text, p_old_password text, p_new_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users;
BEGIN
  PERFORM app_private.valid_new_password(p_new_password);
  v_user := app_private.authenticate(p_email, p_old_password);
  IF v_user.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kata sandi saat ini salah.');
  END IF;
  UPDATE public.users SET password_hash = app_private.hash_password(p_new_password), updated_at = now() WHERE id = v_user.id;
  RETURN jsonb_build_object('success', true);
END;
$$;
CREATE OR REPLACE FUNCTION public.admin_upsert_user(
  p_admin_email text,
  p_admin_password text,
  p_email text,
  p_name text,
  p_role text,
  p_password text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_community_id text DEFAULT NULL,
  p_community_name text DEFAULT NULL,
  p_user_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_user public.users;
  v_admin public.users;
BEGIN
  v_admin := app_private.require_admin(p_admin_email, p_admin_password);
  IF v_admin.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Verifikasi super admin gagal. Masuk ulang lalu coba lagi.');
  END IF;
  IF p_role NOT IN ('merchant', 'admin', 'sub_admin', 'sub_admin_umum', 'sub_admin_produk', 'community_admin') THEN
    RAISE EXCEPTION 'Peran akun tidak dikenal.' USING ERRCODE = '22023';
  END IF;
  IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Alamat email tidak valid.' USING ERRCODE = '22023';
  END IF;
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  ELSE
    SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email;
  END IF;
  IF v_user.id IS NULL THEN
    PERFORM app_private.valid_new_password(p_password);
    INSERT INTO public.users (email, password_hash, name, phone, role, community_id, community_name, created_at, updated_at)
    VALUES (v_email, app_private.hash_password(p_password), coalesce(nullif(btrim(p_name), ''), split_part(v_email, '@', 1)),
            nullif(btrim(coalesce(p_phone, '')), ''), p_role, p_community_id, p_community_name, now(), now())
    RETURNING * INTO v_user;
  ELSE
    IF p_password IS NOT NULL AND p_password <> '' THEN
      PERFORM app_private.valid_new_password(p_password);
    END IF;
    UPDATE public.users SET
      email = v_email,
      name = coalesce(nullif(btrim(p_name), ''), name),
      phone = CASE WHEN p_phone IS NULL THEN phone ELSE nullif(btrim(p_phone), '') END,
      role = p_role,
      community_id = p_community_id,
      community_name = p_community_name,
      password_hash = CASE WHEN p_password IS NOT NULL AND p_password <> '' THEN app_private.hash_password(p_password) ELSE password_hash END,
      failed_login_count = 0,
      locked_until = NULL,
      updated_at = now()
    WHERE id = v_user.id
    RETURNING * INTO v_user;
  END IF;
  RETURN jsonb_build_object('success', true, 'user', app_private.user_json(v_user));
END;
$$;
CREATE OR REPLACE FUNCTION public.request_password_reset(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  v_user public.users;
  v_token text;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE lower(email) = lower(btrim(coalesce(p_email, ''))) LIMIT 1;
  IF NOT FOUND OR v_user.password_hash LIKE 'google%' THEN
    RETURN jsonb_build_object('success', true, 'token', NULL);
  END IF;
  v_token := lpad((abs(('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::int) % 1000000)::text, 6, '0');
  UPDATE public.users
     SET reset_token = app_private.hash_password(v_token),
         reset_token_expires_at = now() + interval '15 minutes',
         reset_attempts = 0
   WHERE id = v_user.id;
  RETURN jsonb_build_object('success', true, 'token', v_token, 'name', v_user.name);
END;
$$;
CREATE OR REPLACE FUNCTION public.complete_password_reset(p_email text, p_token text, p_new_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  v_user public.users;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE lower(email) = lower(btrim(coalesce(p_email, ''))) LIMIT 1;
  IF NOT FOUND OR v_user.reset_token IS NULL OR v_user.reset_token_expires_at IS NULL
     OR v_user.reset_token_expires_at < now() OR v_user.reset_attempts >= 5 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Token verifikasi tidak valid atau sudah kadaluarsa.');
  END IF;
  IF extensions.crypt(btrim(coalesce(p_token, '')), v_user.reset_token) <> v_user.reset_token THEN
    UPDATE public.users SET reset_attempts = reset_attempts + 1 WHERE id = v_user.id;
    RETURN jsonb_build_object('success', false, 'message', 'Token verifikasi tidak valid atau sudah kadaluarsa.');
  END IF;
  IF p_new_password IS NULL THEN
    RETURN jsonb_build_object('success', true, 'verified', true);
  END IF;
  PERFORM app_private.valid_new_password(p_new_password);
  UPDATE public.users
     SET password_hash = app_private.hash_password(p_new_password),
         reset_token = NULL, reset_token_expires_at = NULL, reset_attempts = 0,
         failed_login_count = 0, locked_until = NULL, updated_at = now()
   WHERE id = v_user.id;
  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.verify_user_credentials(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.register_merchant(text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.google_session_user(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.change_my_password(text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_upsert_user(text, text, text, text, text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.request_password_reset(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_password_reset(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_credentials(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_merchant(text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.google_session_user(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_my_password(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_user(text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_password_reset(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_password_reset(text, text, text) TO anon, authenticated, service_role;
REVOKE ALL ON TABLE public.users FROM anon, authenticated;
GRANT SELECT (id, email, name, phone, role, created_at, updated_at, community_id, community_name, avatar_url)
  ON TABLE public.users TO anon, authenticated;
GRANT UPDATE (name, phone, avatar_url, role, community_id, community_name, updated_at)
  ON TABLE public.users TO anon, authenticated;
GRANT DELETE ON TABLE public.users TO anon, authenticated;
DO $t$
DECLARE r jsonb; out text := ''; v text; n int; leaked text := '';
BEGIN
  r := public.register_merchant('zz_t1@test.local','Password123','Tes Satu'); out := out || ' reg1=' || (r->>'success');
  r := public.register_merchant('zz_t1@test.local','Password999','X'); out := out || ' reg_dup=' || (r->>'success') || ':' || (r->>'message');
  r := public.verify_user_credentials('zz_t1@test.local','Password123'); out := out || ' login_ok=' || (r->>'success');
  r := public.verify_user_credentials('zz_t1@test.local','salah'); out := out || ' login_bad=' || (r->>'success');
  INSERT INTO public.users(email,password_hash,name,role) VALUES ('zz_legacy@test.local', encode(extensions.digest('kroomify_salt_v1_Legacy123','sha256'),'hex'),'L','merchant');
  r := public.verify_user_credentials('zz_legacy@test.local','Legacy123'); out := out || ' legacy_ok=' || (r->>'success');
  SELECT left(password_hash,4) INTO v FROM public.users WHERE email='zz_legacy@test.local'; out := out || ' legacy_upgraded=' || v;
  r := public.verify_user_credentials('zz_legacy@test.local','Legacy123'); out := out || ' bcrypt_ok=' || (r->>'success');
  INSERT INTO public.users(email,password_hash,name,role) VALUES ('zz_g@test.local','google-oauth-managed','G','merchant');
  r := public.verify_user_credentials('zz_g@test.local','google-oauth-managed'); out := out || ' google_marker=' || (r->>'success');
  FOR n IN 1..10 LOOP r := public.verify_user_credentials('zz_t1@test.local','wrong' || n); END LOOP;
  r := public.verify_user_credentials('zz_t1@test.local','Password123'); out := out || ' locked=' || (r->>'success') || ':' || left(r->>'message',20);
  UPDATE public.users SET locked_until=NULL, failed_login_count=0 WHERE email='zz_t1@test.local';
  r := public.change_my_password('zz_t1@test.local','wrongold','NewPass123'); out := out || ' chg_bad=' || (r->>'success');
  SELECT failed_login_count INTO n FROM public.users WHERE email='zz_t1@test.local'; out := out || ' fail_cnt_kept=' || n;
  r := public.change_my_password('zz_t1@test.local','Password123','NewPass123'); out := out || ' chg_ok=' || (r->>'success');
  r := public.verify_user_credentials('zz_t1@test.local','NewPass123'); out := out || ' login_new=' || (r->>'success');
  r := public.admin_upsert_user('zz_t1@test.local','NewPass123','zz_x@test.local','X','admin','Password123'); out := out || ' admin_by_merchant=' || (r->>'success');
  r := public.request_password_reset('zz_t1@test.local'); v := r->>'token'; out := out || ' tok_len=' || length(v);
  r := public.complete_password_reset('zz_t1@test.local','000000x',NULL); out := out || ' tok_bad=' || (r->>'success');
  r := public.complete_password_reset('zz_t1@test.local',v,NULL); out := out || ' tok_verify=' || (r->>'success');
  r := public.complete_password_reset('zz_t1@test.local',v,'Reset12345'); out := out || ' tok_reset=' || (r->>'success');
  r := public.verify_user_credentials('zz_t1@test.local','Reset12345'); out := out || ' login_reset=' || (r->>'success');
  r := public.complete_password_reset('zz_t1@test.local',v,'Again12345'); out := out || ' tok_reuse=' || (r->>'success');
  out := out || ' anon_sel_hash=' || has_column_privilege('anon','public.users','password_hash','SELECT');
  out := out || ' anon_upd_hash=' || has_column_privilege('anon','public.users','password_hash','UPDATE');
  out := out || ' anon_sel_name=' || has_column_privilege('anon','public.users','name','SELECT');
  out := out || ' anon_insert=' || has_table_privilege('anon','public.users','INSERT');
  out := out || ' anon_req_reset=' || has_function_privilege('anon','public.request_password_reset(text)','EXECUTE');
  out := out || ' anon_verify=' || has_function_privilege('anon','public.verify_user_credentials(text,text)','EXECUTE');
  out := out || ' anon_private=' || has_function_privilege('anon','app_private.hash_password(text)','EXECUTE');
  SELECT string_agg(u.email || '(' || u.role || ')', ',') INTO leaked FROM public.users u
   WHERE u.email NOT LIKE 'zz_%' AND EXISTS (SELECT 1 FROM unnest(ARRAY['bantuumkm2344@','bantuumkm2344','admin123','subadmin123','subadmin2','password123','Password123']) k WHERE app_private.check_password(u.password_hash, k));
  out := out || ' LEAKED_PW_ACCOUNTS=' || coalesce(leaked,'none');
  -- setval tidak ikut di-rollback: kembalikan sequence agar nomor ID user tidak terlewati.
  PERFORM setval('public.seq_users_id', (SELECT last_value FROM zz_seq), (SELECT is_called FROM zz_seq));
  RAISE EXCEPTION 'TESTRESULT:%', out;
END $t$;
