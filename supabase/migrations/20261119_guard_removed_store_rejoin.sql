-- ============================================================================
-- MIGRATION: TOKO YANG DIKELUARKAN TIDAK BISA MASUK LAGI LEWAT TULIS LANGSUNG
-- Tanggal: 2026-11-19
-- Prasyarat: 20261119_community_store_removals.sql
--
-- Masalah: "Keluarkan" (DELETE /api/community/manage/members/:storeId) mencatat toko di
--   community_store_removals, tetapi browser masih bisa memasukkannya kembali lewat PostgREST:
--   * pemilik toko: setiap simpan Pengaturan Toko mengirim ulang community_id lama yang masih
--     tersimpan di state/localStorage browser;
--   * staf komunitas: tab "Halaman Komunitas" menulis stores.community_id / store_communities langsung.
--   Akibatnya toko yang dikeluarkan muncul lagi di komunitas (dan di portal GMPS) tanpa catatan
--   "dikeluarkan" dihapus. Contoh nyata: STR032 dikeluarkan 06:41 UTC, masuk lagi 07:29 UTC.
--
-- Setelah migrasi ini: selain koneksi server (DATABASE_URL) dan super admin, tidak ada yang bisa
--   memasukkan toko ke komunitas yang pernah mengeluarkannya. Jalur sah untuk memasukkan kembali:
--   POST /api/community/manage/members (Sub-Admin Utama), yang sekaligus menghapus catatan removal.
-- Aditif: tidak mengubah data yang ada.
-- ============================================================================

-- Dibaca dengan hak pemilik karena anon/authenticated tidak punya akses ke tabel removal.
CREATE OR REPLACE FUNCTION app_private.store_removed_from_community(p_store_id text, p_community_id text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_store_removals r
     WHERE r.store_id = p_store_id AND r.community_id = p_community_id
  );
$$;

REVOKE ALL ON FUNCTION app_private.store_removed_from_community(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.store_removed_from_community(text, text) TO anon, authenticated;

-- Bukan SECURITY DEFINER: is_trusted_writer() harus melihat role pemanggil (anon/authenticated).
CREATE OR REPLACE FUNCTION app_private.guard_removed_store_rejoin()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  IF app_private.is_trusted_writer() OR app_private.is_platform_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_TABLE_NAME = 'stores' THEN
    IF NEW.community_id IS NOT NULL
       AND NEW.community_id IS DISTINCT FROM OLD.community_id
       AND app_private.store_removed_from_community(NEW.id, NEW.community_id) THEN
      NEW.community_id := OLD.community_id;
      NEW.community_name := OLD.community_name;
    END IF;
    RETURN NEW;
  END IF;
  -- store_communities: baris untuk komunitas yang mengeluarkan toko ini dilewati.
  IF app_private.store_removed_from_community(NEW.store_id, NEW.community_id) THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stores_guard_removed_rejoin ON public.stores;
CREATE TRIGGER stores_guard_removed_rejoin
  BEFORE UPDATE OF community_id ON public.stores
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_removed_store_rejoin();

DROP TRIGGER IF EXISTS store_communities_guard_removed_rejoin ON public.store_communities;
CREATE TRIGGER store_communities_guard_removed_rejoin
  BEFORE INSERT ON public.store_communities
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_removed_store_rejoin();

NOTIFY pgrst, 'reload schema';
