-- ============================================================================
-- MIGRATION: KOTAK MASUK MERCHANT (PESAN "HUBUNGI KAMI")
-- Tanggal: 2026-11-18
-- Deskripsi: Pesan dari formulir "Hubungi Kami" di storefront disimpan ke
--   public.store_messages dan pemilik toko mendapat notifikasi in-app.
-- Keamanan:
--   * Tidak ada hak INSERT untuk klien (anon/authenticated). Pesan hanya dibuat
--     oleh server (POST /api/store-messages, koneksi DATABASE_URL) yang
--     memvalidasi input, membatasi frekuensi per IP, dan memastikan toko terbit.
--   * Hanya PEMILIK toko yang bisa membaca, menandai dibaca (kolom is_read) dan
--     menghapus pesan tokonya (RLS via app_private.owns_store). Staf komunitas
--     tidak ikut membaca karena pesan berisi data pribadi pengunjung.
--   * Kegagalan membuat notifikasi tidak pernah menggagalkan penyimpanan pesan.
-- Aditif: tidak mengubah data yang ada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.store_messages (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  store_id      VARCHAR NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sender_name   VARCHAR(100) NOT NULL CHECK (char_length(btrim(sender_name)) BETWEEN 2 AND 100),
  sender_email  VARCHAR(254) NOT NULL CHECK (sender_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  message       VARCHAR(2000) NOT NULL CHECK (char_length(btrim(message)) BETWEEN 5 AND 2000),
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_messages_store_created_idx
  ON public.store_messages (store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS store_messages_store_unread_idx
  ON public.store_messages (store_id) WHERE is_read = false;

ALTER TABLE public.store_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.store_messages FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.store_messages TO anon, authenticated;
GRANT UPDATE (is_read) ON public.store_messages TO anon, authenticated;

DROP POLICY IF EXISTS store_messages_select_owner ON public.store_messages;
CREATE POLICY store_messages_select_owner ON public.store_messages
  FOR SELECT USING (app_private.owns_store(store_id));

DROP POLICY IF EXISTS store_messages_update_owner ON public.store_messages;
CREATE POLICY store_messages_update_owner ON public.store_messages
  FOR UPDATE USING (app_private.owns_store(store_id))
  WITH CHECK (app_private.owns_store(store_id));

DROP POLICY IF EXISTS store_messages_delete_owner ON public.store_messages;
CREATE POLICY store_messages_delete_owner ON public.store_messages
  FOR DELETE USING (app_private.owns_store(store_id));

-- ---------------------------------------------------------------------------
-- Notifikasi pesan baru → pemilik toko (tipe 'store_message', link 'pesan')
-- `data` hanya berisi nama pengirim; isi pesan & email tetap di tabel ini.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_store_messages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    PERFORM app_private.notify_user(app_private.store_owner(NEW.store_id), 'store_message',
      'Pesan baru dari ' || left(NEW.sender_name, 60),
      'Pengunjung mengirim pesan lewat halaman Hubungi Kami.',
      'pesan', NEW.store_id,
      jsonb_build_object('sender', left(NEW.sender_name, 60)));
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify store_messages gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION app_private.trg_notify_store_messages() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_notify_store_messages ON public.store_messages;
CREATE TRIGGER trg_notify_store_messages
  AFTER INSERT ON public.store_messages
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_store_messages();
