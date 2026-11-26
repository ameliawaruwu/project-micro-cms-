-- ============================================================================
-- MIGRATION: TICKETING BANTUAN & KELOLA USER (SUPER ADMIN)
-- Tanggal: 2026-11-06
-- Deskripsi:
--   - support_tickets: tiket bantuan dari merchant, admin umum, dan admin produk.
--     Status: pending -> in_progress -> resolved. Dikelola oleh super admin.
--   - users: izinkan semua peran yang dipakai aplikasi + kebijakan hapus user
--     untuk menu Kelola User.
-- Aditif & idempotent: aman dijalankan ulang, tidak menghapus data.
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id              VARCHAR(64) PRIMARY KEY DEFAULT 'tkt_' || replace(gen_random_uuid()::text, '-', ''),
  ticket_number   VARCHAR(32) NOT NULL UNIQUE,
  requester_id    VARCHAR(64) NOT NULL,
  requester_name  VARCHAR(255) NOT NULL,
  requester_email VARCHAR(255),
  requester_role  VARCHAR(32) NOT NULL DEFAULT 'merchant',
  store_id        VARCHAR(64),
  store_name      VARCHAR(255),
  community_id    VARCHAR(64),
  community_name  VARCHAR(255),
  subject         VARCHAR(200) NOT NULL,
  category        VARCHAR(32) NOT NULL DEFAULT 'lainnya'
                  CHECK (category IN ('akun', 'toko', 'produk', 'pembayaran', 'teknis', 'lainnya')),
  priority        VARCHAR(16) NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('low', 'normal', 'high')),
  description     TEXT NOT NULL,
  status          VARCHAR(16) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'resolved')),
  admin_response  TEXT,
  handled_by      VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_requester ON support_tickets (requester_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status    ON support_tickets (status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created   ON support_tickets (created_at DESC);

-- updated_at & resolved_at otomatis mengikuti perubahan status
CREATE OR REPLACE FUNCTION support_tickets_touch()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.status = 'resolved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'resolved') THEN
    NEW.resolved_at := now();
  ELSIF NEW.status <> 'resolved' THEN
    NEW.resolved_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_support_tickets_touch ON support_tickets;
CREATE TRIGGER trg_support_tickets_touch
  BEFORE INSERT OR UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION support_tickets_touch();

-- Kebijakan mengikuti tabel lain: dashboard memakai klien anon Supabase,
-- isolasi data per pengaju dilakukan di service layer (filter requester_id).
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "support_tickets_select" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_insert" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_update" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_delete" ON support_tickets;
CREATE POLICY "support_tickets_select" ON support_tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "support_tickets_insert" ON support_tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "support_tickets_update" ON support_tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "support_tickets_delete" ON support_tickets FOR DELETE TO anon, authenticated USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON support_tickets TO anon, authenticated;
GRANT ALL ON support_tickets TO service_role;

-- ----------------------------------------------------------------------------
-- USERS: peran yang dipakai aplikasi + hapus user dari menu Kelola User
-- ----------------------------------------------------------------------------
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'merchant', 'buyer', 'sub_admin', 'sub_admin_umum', 'sub_admin_produk', 'community_admin'))
  NOT VALID;

DROP POLICY IF EXISTS "users_delete_policy" ON users;
CREATE POLICY "users_delete_policy" ON users FOR DELETE TO anon, authenticated, service_role USING (true);
GRANT DELETE ON users TO anon, authenticated;

-- Muat ulang cache skema PostgREST agar tabel baru langsung bisa dipakai klien Supabase.
NOTIFY pgrst, 'reload schema';
