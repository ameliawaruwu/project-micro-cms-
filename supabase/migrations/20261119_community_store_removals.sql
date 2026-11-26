-- ============================================================================
-- MIGRATION: TOKO YANG DIKELUARKAN DARI KOMUNITAS
-- Tanggal: 2026-11-19
-- Deskripsi: Sub-Admin Utama dapat mengeluarkan toko dari komunitasnya
--   (DELETE /api/community/manage/members/:storeId). Keanggotaan dihapus dari
--   stores.community_id / store_communities, sehingga produk toko itu tidak lagi
--   muncul di API publik komunitas (landing page portal GMPS).
--   Tabel ini mencatat toko yang dikeluarkan agar jalur otomatis partner API
--   (email portal = email akun LapakQ) tidak memasukkannya kembali. Baris dihapus
--   bila Sub-Admin Utama menambahkan toko itu lagi.
-- Aditif: tidak mengubah atau menghapus data yang ada.
-- Akses: hanya lewat server (DATABASE_URL). Klien anon/authenticated tidak punya hak.
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_store_removals (
  community_id VARCHAR NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  store_id     VARCHAR NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  removed_by   VARCHAR(64),
  removed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, store_id)
);

ALTER TABLE community_store_removals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON community_store_removals FROM PUBLIC, anon, authenticated;
GRANT ALL ON community_store_removals TO service_role;

NOTIFY pgrst, 'reload schema';
