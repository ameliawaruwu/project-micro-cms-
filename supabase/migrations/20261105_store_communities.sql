-- ============================================================================
-- MIGRATION: KEANGGOTAAN TOKO DI BANYAK KOMUNITAS
-- Tanggal: 2026-11-05
-- Deskripsi: Satu toko boleh bernaung di lebih dari satu komunitas.
--   - stores.community_id tetap menjadi komunitas utama (fitur lama tidak berubah).
--   - store_communities menyimpan komunitas tambahan.
--   Toko termasuk komunitas X bila stores.community_id = X ATAU ada baris (toko, X) di sini.
-- Aditif: tidak mengubah atau menghapus data yang ada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS store_communities (
  store_id     VARCHAR NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  community_id VARCHAR NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  -- Asal keanggotaan: 'admin' (dashboard LapakQ) atau 'partner:<nama>' (partner API, mis. Portal GMPS)
  source       VARCHAR NOT NULL DEFAULT 'admin',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id, community_id)
);

CREATE INDEX IF NOT EXISTS idx_store_communities_community ON store_communities (community_id);

-- Kebijakan mengikuti tabel stores/communities: dashboard admin memakai klien anon Supabase.
ALTER TABLE store_communities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "store_communities_select" ON store_communities;
DROP POLICY IF EXISTS "store_communities_insert" ON store_communities;
DROP POLICY IF EXISTS "store_communities_delete" ON store_communities;
CREATE POLICY "store_communities_select" ON store_communities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "store_communities_insert" ON store_communities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "store_communities_delete" ON store_communities FOR DELETE TO anon, authenticated USING (true);

GRANT SELECT, INSERT, DELETE ON store_communities TO anon, authenticated;
GRANT ALL ON store_communities TO service_role;

-- Muat ulang cache skema PostgREST agar tabel baru langsung bisa dipakai klien Supabase.
NOTIFY pgrst, 'reload schema';
