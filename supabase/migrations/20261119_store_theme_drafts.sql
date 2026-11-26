-- ============================================================================
-- MIGRATION: DRAF TEMA EDITOR LAYOUT DISIMPAN DI DATABASE
-- Tanggal: 2026-11-19
-- Deskripsi: Pustaka tema (daftar draf di menu Layout) sebelumnya hanya ada di
--   localStorage browser, sehingga draf & statusnya hilang bila akun dibuka di
--   perangkat lain. Tabel ini menyimpan daftar draf per toko (satu baris/toko).
-- Keamanan:
--   * Hanya yang boleh mengelola toko (super admin, pemilik, staf komunitas toko
--     itu; app_private.can_manage_store) yang bisa membaca & menulis. Tidak ada
--     akses anon, jadi draf yang belum terbit tidak terlihat publik.
--   * Isi hanya data tampilan (tata letak/section); tidak ada nominal uang atau
--     status yang dipercaya server. Ukuran dibatasi agar tidak disalahgunakan.
-- Aditif: tidak mengubah data yang ada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.store_theme_drafts (
  store_id    VARCHAR PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
  drafts      JSONB NOT NULL DEFAULT '[]'::jsonb
              CHECK (jsonb_typeof(drafts) = 'array'
                     AND jsonb_array_length(drafts) <= 50
                     AND octet_length(drafts::text) <= 2000000),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_theme_drafts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.store_theme_drafts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_theme_drafts TO authenticated;

DROP POLICY IF EXISTS store_theme_drafts_select_manager ON public.store_theme_drafts;
CREATE POLICY store_theme_drafts_select_manager ON public.store_theme_drafts
  FOR SELECT TO authenticated USING (app_private.can_manage_store(store_id));

DROP POLICY IF EXISTS store_theme_drafts_insert_manager ON public.store_theme_drafts;
CREATE POLICY store_theme_drafts_insert_manager ON public.store_theme_drafts
  FOR INSERT TO authenticated WITH CHECK (app_private.can_manage_store(store_id));

DROP POLICY IF EXISTS store_theme_drafts_update_manager ON public.store_theme_drafts;
CREATE POLICY store_theme_drafts_update_manager ON public.store_theme_drafts
  FOR UPDATE TO authenticated USING (app_private.can_manage_store(store_id))
  WITH CHECK (app_private.can_manage_store(store_id));

DROP POLICY IF EXISTS store_theme_drafts_delete_manager ON public.store_theme_drafts;
CREATE POLICY store_theme_drafts_delete_manager ON public.store_theme_drafts
  FOR DELETE TO authenticated USING (app_private.can_manage_store(store_id));

-- updated_at selalu dari server, bukan dari browser.
CREATE OR REPLACE FUNCTION app_private.trg_store_theme_drafts_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.trg_store_theme_drafts_touch() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_store_theme_drafts_touch ON public.store_theme_drafts;
CREATE TRIGGER trg_store_theme_drafts_touch
  BEFORE INSERT OR UPDATE ON public.store_theme_drafts
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_store_theme_drafts_touch();
