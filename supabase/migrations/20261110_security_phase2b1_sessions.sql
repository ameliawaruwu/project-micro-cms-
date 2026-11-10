-- =============================================================================
-- KEAMANAN TAHAP 2b-1 — Sesi login yang diverifikasi database
-- =============================================================================
-- Sebelumnya status "sudah login" hanya tersimpan di localStorage dan bisa dipalsukan.
-- Mulai sekarang login/daftar/Google membuat token sesi acak (256-bit). Database hanya
-- menyimpan hash SHA-256-nya. Browser mengirim token lewat header `x-lapakq-session`
-- (lihat src/services/supabaseClient.ts) dan app_private.session_user_id() membacanya.
-- Fondasi ini dipakai aturan RLS per pemilik di tahap 2b berikutnya; migrasi ini sendiri
-- BELUM mengunci tabel apa pun.
-- =============================================================================

CREATE TABLE IF NOT EXISTS app_private.sessions (
  token_hash   text PRIMARY KEY,
  user_id      varchar(64) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL DEFAULT now() + interval '30 days',
  last_used_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON app_private.sessions (user_id);
REVOKE ALL ON TABLE app_private.sessions FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION app_private.hash_token(p_token text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = extensions, public
AS $$
  SELECT encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

-- Buat sesi baru untuk user; mengembalikan token polos (hanya sekali, ke pemilik).
CREATE OR REPLACE FUNCTION app_private.create_session(p_user_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = extensions, public
AS $$
DECLARE
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
BEGIN
  -- Bersihkan sesi kedaluwarsa milik user ini agar tabel tidak menumpuk.
  DELETE FROM app_private.sessions WHERE user_id = p_user_id AND expires_at < now();
  INSERT INTO app_private.sessions (token_hash, user_id) VALUES (app_private.hash_token(v_token), p_user_id);
  RETURN v_token;
END;
$$;

-- Token dari header permintaan (PostgREST mengisi request.headers; nama header huruf kecil).
CREATE OR REPLACE FUNCTION app_private.request_session_token()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(btrim(coalesce(
    (nullif(current_setting('request.headers', true), '')::json) ->> 'x-lapakq-session', ''
  )), '');
$$;

-- ID user dari sesi yang valid pada permintaan ini, atau NULL.
CREATE OR REPLACE FUNCTION app_private.session_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.user_id
    FROM app_private.sessions s
   WHERE s.token_hash = app_private.hash_token(app_private.request_session_token())
     AND s.expires_at > now()
   LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION app_private.session_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.role FROM public.users u WHERE u.id = app_private.session_user_id();
$$;

CREATE OR REPLACE FUNCTION app_private.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(app_private.session_role() = 'admin', false);
$$;

-- -----------------------------------------------------------------------------
-- Login / daftar / Google kini juga mengembalikan session_token
-- -----------------------------------------------------------------------------
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
  RETURN jsonb_build_object('success', true, 'user', app_private.user_json(v_user),
                            'session_token', app_private.create_session(v_user.id));
EXCEPTION WHEN SQLSTATE 'P0001' THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

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
  RETURN jsonb_build_object('success', true, 'user', app_private.user_json(v_user),
                            'session_token', app_private.create_session(v_user.id));
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
  RETURN jsonb_build_object('success', true, 'is_new', v_is_new, 'user', app_private.user_json(v_user),
                            'session_token', app_private.create_session(v_user.id));
END;
$$;

-- -----------------------------------------------------------------------------
-- Cek & akhiri sesi
-- -----------------------------------------------------------------------------
-- Profil user dari sesi pada header permintaan (dipakai saat aplikasi dibuka ulang).
CREATE OR REPLACE FUNCTION public.session_me()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE id = app_private.session_user_id();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false);
  END IF;
  UPDATE app_private.sessions SET last_used_at = now()
   WHERE token_hash = app_private.hash_token(app_private.request_session_token());
  RETURN jsonb_build_object('success', true, 'user', app_private.user_json(v_user));
END;
$$;

CREATE OR REPLACE FUNCTION public.end_session()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM app_private.sessions WHERE token_hash = app_private.hash_token(app_private.request_session_token())
  RETURNING jsonb_build_object('success', true);
$$;

-- Ganti password mengakhiri semua sesi lain milik user tersebut.
CREATE OR REPLACE FUNCTION app_private.revoke_other_sessions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.password_hash IS DISTINCT FROM OLD.password_hash AND OLD.password_hash LIKE '$2%' THEN
    DELETE FROM app_private.sessions
     WHERE user_id = NEW.id
       AND token_hash IS DISTINCT FROM app_private.hash_token(app_private.request_session_token());
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS users_revoke_sessions_on_password ON public.users;
CREATE TRIGGER users_revoke_sessions_on_password
  AFTER UPDATE OF password_hash ON public.users
  FOR EACH ROW EXECUTE FUNCTION app_private.revoke_other_sessions();

-- -----------------------------------------------------------------------------
-- Hak akses
-- -----------------------------------------------------------------------------
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.session_me() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.end_session() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.session_me() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.end_session() TO anon, authenticated;
-- verify_user_credentials, register_merchant, google_session_user: hak akses dari tahap 1 tetap berlaku.
