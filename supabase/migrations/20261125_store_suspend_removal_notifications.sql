-- ============================================================================
-- MIGRATION: NOTIFIKASI TOKO DITANGGUHKAN / DIAKTIFKAN / DIKELUARKAN DARI KOMUNITAS
-- Tanggal: 2026-11-25
-- Deskripsi: Pemilik toko kini diberi tahu saat
--   1. Sub-Admin Utama / admin platform menangguhkan (suspend) tokonya  → 'store_suspended'
--   2. tokonya diaktifkan kembali                                       → 'store_unsuspended'
--   3. tokonya dikeluarkan dari komunitas (community_store_removals)     → 'community_removed'
--   Teks dua bahasa disusun di frontend (src/utils/notificationText.ts) dari type + data.
-- Aditif: hanya menambah fungsi & trigger; tidak mengubah data.
-- ============================================================================

-- 1 & 2. stores.is_suspended berubah → pemilik toko.
CREATE OR REPLACE FUNCTION app_private.trg_notify_store_suspension()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role text;
BEGIN
  BEGIN
    IF coalesce(NEW.is_suspended, false) IS DISTINCT FROM coalesce(OLD.is_suspended, false) THEN
      v_role := app_private.session_role();
      IF coalesce(NEW.is_suspended, false) THEN
        PERFORM app_private.notify_user(NEW.user_id, 'store_suspended',
          'Toko Anda ditangguhkan',
          '"' || coalesce(NEW.name, '-') || '" ditangguhkan dan tidak bisa diakses pembeli. Hubungi pengelola komunitas atau ajukan tiket bantuan.',
          'beranda', NEW.id,
          jsonb_build_object('store', NEW.name, 'actor_role', v_role));
      ELSE
        PERFORM app_private.notify_user(NEW.user_id, 'store_unsuspended',
          'Toko Anda aktif kembali',
          '"' || coalesce(NEW.name, '-') || '" sudah diaktifkan kembali dan bisa diakses pembeli.',
          'beranda', NEW.id,
          jsonb_build_object('store', NEW.name, 'actor_role', v_role));
      END IF;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify store suspension gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_store_suspension ON public.stores;
CREATE TRIGGER trg_notify_store_suspension
  AFTER UPDATE OF is_suspended ON public.stores
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_store_suspension();

-- 3. Toko dikeluarkan dari komunitas → pemilik toko.
--    Backend menulis community_store_removals dengan INSERT ... ON CONFLICT DO UPDATE,
--    jadi trigger dipasang untuk INSERT dan UPDATE.
CREATE OR REPLACE FUNCTION app_private.trg_notify_community_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_store record;
  v_community text;
BEGIN
  BEGIN
    SELECT s.user_id, s.name INTO v_store FROM public.stores s WHERE s.id = NEW.store_id;
    SELECT c.name INTO v_community FROM public.communities c WHERE c.id = NEW.community_id;
    IF v_store.user_id IS NOT NULL THEN
      PERFORM app_private.notify_user(v_store.user_id, 'community_removed',
        'Toko Anda dikeluarkan dari komunitas',
        '"' || coalesce(v_store.name, '-') || '" tidak lagi menjadi toko binaan komunitas ' || coalesce(v_community, '-') || '. Toko tetap terbit di alamatnya sendiri.',
        'beranda', NEW.store_id,
        jsonb_build_object('store', v_store.name, 'community', v_community));
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify community removal gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_community_removal ON public.community_store_removals;
CREATE TRIGGER trg_notify_community_removal
  AFTER INSERT OR UPDATE ON public.community_store_removals
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_community_removal();

REVOKE ALL ON FUNCTION app_private.trg_notify_store_suspension() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_community_removal() FROM PUBLIC;
