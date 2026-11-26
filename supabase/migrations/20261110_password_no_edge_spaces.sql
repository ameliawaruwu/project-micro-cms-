-- Password baru tidak boleh diawali/diakhiri spasi.
-- Halaman login membuang spasi di awal/akhir password sebelum dikirim, sehingga password
-- seperti ' Rahasia123' tersimpan tetapi tidak pernah bisa dipakai masuk (terjadi pada
-- super admin, 10 Nov 2026). Berlaku untuk register_merchant, change_my_password,
-- admin_upsert_user, dan complete_password_reset yang semuanya memanggil fungsi ini.
CREATE OR REPLACE FUNCTION app_private.valid_new_password(p text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF p IS NULL OR length(p) < 8 THEN
    RAISE EXCEPTION 'Kata sandi minimal 8 karakter.' USING ERRCODE = '22023';
  END IF;
  IF p <> btrim(p) THEN
    RAISE EXCEPTION 'Kata sandi tidak boleh diawali atau diakhiri spasi.' USING ERRCODE = '22023';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION app_private.valid_new_password(text) FROM PUBLIC, anon, authenticated;
