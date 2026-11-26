-- ============================================================================
-- MIGRATION: PERMINTAAN GABUNG KOMUNITAS (fitur "Komunitas")
-- Tanggal: 2026-11-12
-- Deskripsi: Pemilik toko dapat meminta toko mereka masuk ke sebuah komunitas;
--   sub-admin komunitas itu menyetujui atau menolak. Persetujuan memakai jalur
--   keanggotaan yang sama dengan yang sudah ada:
--     - toko tanpa komunitas  -> stores.community_id (komunitas utama)
--     - toko sudah berkomunitas -> baris di store_communities (source = 'request')
--   Jalur otomatis (email portal = email akun LapakQ, via partner API) tidak berubah.
-- Aditif: tidak mengubah atau menghapus data yang ada.
-- Akses: hanya lewat server (DATABASE_URL, peran postgres). Klien anon/authenticated
--   tidak punya hak sama sekali; pemeriksaan sesi & kepemilikan ada di
--   backend/communityMembershipController.ts.
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_join_requests (
  id            VARCHAR(64) PRIMARY KEY DEFAULT 'cjr_' || replace(gen_random_uuid()::text, '-', ''),
  community_id  VARCHAR NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  store_id      VARCHAR NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id       VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        VARCHAR(16) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  message       VARCHAR(500),
  decision_note VARCHAR(500),
  decided_by    VARCHAR(64),
  decided_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Satu permintaan aktif per (toko, komunitas): mencegah permintaan ganda.
CREATE UNIQUE INDEX IF NOT EXISTS uq_cjr_pending_store_community
  ON community_join_requests (store_id, community_id) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_cjr_community_status ON community_join_requests (community_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cjr_user ON community_join_requests (user_id, created_at DESC);

ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON community_join_requests FROM PUBLIC, anon, authenticated;
GRANT ALL ON community_join_requests TO service_role;

NOTIFY pgrst, 'reload schema';
