-- ============================================================================
-- MIGRATION: NOTIFIKASI IN-APP PER PERAN
-- Tanggal: 2026-11-16
-- Deskripsi: Tabel notifications + trigger yang mengisi notifikasi dari aktivitas
--   nyata di database. Penerima ditentukan dari peran & kepemilikan:
--     Pemilik toko (merchant) : pesanan baru, pembayaran lunas, produk ditambahkan
--                               pihak lain, toko masuk komunitas, permintaan gabung
--                               ditolak, balasan tiket, status domain & penarikan dana.
--     Sub-Admin Utama         : permintaan gabung komunitas baru, tagihan komunitas
--                               baru, balasan tiket.
--     Sub-Admin Produk        : toko binaan baru di komunitasnya, balasan tiket.
--     Super Admin             : pengguna/merchant baru, tiket baru, pengajuan domain &
--                               bukti bayarnya, penarikan dana baru, tagihan komunitas lunas.
--   Pelaku aksi tidak menerima notifikasi atas aksinya sendiri.
-- Keamanan: klien hanya bisa MEMBACA, menandai dibaca (kolom read_at) dan MENGHAPUS
--   notifikasi miliknya sendiri (RLS via app_private.session_user_id()). Tidak ada
--   hak INSERT untuk klien; baris hanya dibuat oleh trigger SECURITY DEFINER.
--   Kegagalan membuat notifikasi tidak pernah menggagalkan transaksi utama.
-- Aditif: tidak mengubah data yang ada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     VARCHAR NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        VARCHAR(48) NOT NULL,
  title       VARCHAR(160) NOT NULL,
  body        VARCHAR(500),
  link        VARCHAR(48),
  store_id    VARCHAR,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.notifications TO anon, authenticated;
GRANT UPDATE (read_at) ON public.notifications TO anon, authenticated;

DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT USING (user_id = app_private.session_user_id());

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE USING (user_id = app_private.session_user_id())
  WITH CHECK (user_id = app_private.session_user_id());

DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;
CREATE POLICY notifications_delete_own ON public.notifications
  FOR DELETE USING (user_id = app_private.session_user_id());

-- ---------------------------------------------------------------------------
-- Helper
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION app_private.fmt_rupiah(p_amount bigint)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 'Rp' || replace(to_char(coalesce(p_amount, 0), 'FM999,999,999,999,990'), ',', '.');
$$;

-- Satu notifikasi untuk satu pengguna. Lewati bila penerima kosong atau pelaku sendiri.
CREATE OR REPLACE FUNCTION app_private.notify_user(
  p_user_id text, p_type text, p_title text, p_body text, p_link text, p_store_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_user_id IS NULL OR p_user_id = app_private.session_user_id() THEN
    RETURN;
  END IF;
  INSERT INTO public.notifications (user_id, type, title, body, link, store_id)
  VALUES (p_user_id, left(p_type, 48), left(p_title, 160), left(p_body, 500), left(p_link, 48), p_store_id);
  -- Retensi 90 hari per pengguna.
  DELETE FROM public.notifications
   WHERE user_id = p_user_id AND created_at < now() - interval '90 days';
END;
$$;

-- Notifikasi ke semua pengguna dengan peran tertentu (opsional: dalam satu komunitas).
CREATE OR REPLACE FUNCTION app_private.notify_roles(
  p_roles text[], p_community_id text, p_type text, p_title text, p_body text, p_link text, p_store_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT u.id FROM public.users u
     WHERE u.role = ANY (p_roles)
       AND (p_community_id IS NULL OR u.community_id = p_community_id)
  LOOP
    PERFORM app_private.notify_user(r.id, p_type, p_title, p_body, p_link, p_store_id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION app_private.store_owner(p_store_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT s.user_id FROM public.stores s WHERE s.id = p_store_id;
$$;

REVOKE ALL ON FUNCTION app_private.fmt_rupiah(bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.notify_user(text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.notify_roles(text[], text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.store_owner(text) FROM PUBLIC;

-- ---------------------------------------------------------------------------
-- Pesanan (merchant)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_owner text;
BEGIN
  BEGIN
    v_owner := app_private.store_owner(NEW.store_id);
    IF TG_OP = 'INSERT' THEN
      PERFORM app_private.notify_user(v_owner, 'order_new',
        'Pesanan baru ' || coalesce(NEW.order_number, ''),
        'Total ' || app_private.fmt_rupiah(NEW.total_amount) || ' · menunggu pembayaran/proses.',
        'pesanan', NEW.store_id);
      IF NEW.payment_status = 'paid' THEN
        PERFORM app_private.notify_user(v_owner, 'order_paid',
          'Pembayaran diterima ' || coalesce(NEW.order_number, ''),
          'Pesanan sebesar ' || app_private.fmt_rupiah(NEW.total_amount) || ' sudah lunas. Segera proses pengiriman.',
          'pesanan', NEW.store_id);
      END IF;
    ELSIF NEW.payment_status = 'paid' AND OLD.payment_status IS DISTINCT FROM 'paid' THEN
      PERFORM app_private.notify_user(v_owner, 'order_paid',
        'Pembayaran diterima ' || coalesce(NEW.order_number, ''),
        'Pesanan sebesar ' || app_private.fmt_rupiah(NEW.total_amount) || ' sudah lunas. Segera proses pengiriman.',
        'pesanan', NEW.store_id);
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify orders gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_orders ON public.orders;
CREATE TRIGGER trg_notify_orders
  AFTER INSERT OR UPDATE OF payment_status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_orders();

-- ---------------------------------------------------------------------------
-- Produk ditambahkan oleh pihak lain (Sub-Admin Produk / Super Admin) → pemilik toko
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_products()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor text := app_private.session_user_id();
  v_owner text;
  v_actor_name text;
BEGIN
  BEGIN
    IF v_actor IS NOT NULL THEN
      v_owner := app_private.store_owner(NEW.store_id);
      IF v_owner IS NOT NULL AND v_owner <> v_actor THEN
        SELECT coalesce(nullif(btrim(u.name), ''), 'Admin komunitas') INTO v_actor_name
          FROM public.users u WHERE u.id = v_actor;
        PERFORM app_private.notify_user(v_owner, 'product_added',
          'Produk baru ditambahkan ke toko Anda',
          '"' || coalesce(NEW.name, '-') || '" ditambahkan oleh ' || coalesce(v_actor_name, 'admin') || '.',
          'produk', NEW.store_id);
      END IF;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify products gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_products ON public.products;
CREATE TRIGGER trg_notify_products
  AFTER INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_products();

-- ---------------------------------------------------------------------------
-- Keanggotaan komunitas: toko masuk komunitas → pemilik toko & Sub-Admin Produk
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.notify_store_joined(p_store_id text, p_community_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_store record;
  v_community text;
BEGIN
  SELECT s.user_id, s.name INTO v_store FROM public.stores s WHERE s.id = p_store_id;
  SELECT c.name INTO v_community FROM public.communities c WHERE c.id = p_community_id;
  IF v_store IS NULL OR v_community IS NULL THEN
    RETURN;
  END IF;
  PERFORM app_private.notify_user(v_store.user_id, 'community_joined',
    'Toko Anda bergabung dengan komunitas',
    '"' || coalesce(v_store.name, '-') || '" kini menjadi toko binaan komunitas ' || v_community || '.',
    'komunitas', p_store_id);
  PERFORM app_private.notify_roles(ARRAY['community_admin', 'sub_admin_produk'], p_community_id,
    'community_store_added',
    'Toko binaan baru',
    '"' || coalesce(v_store.name, '-') || '" bergabung dengan komunitas ' || v_community || '. Anda bisa menambahkan produknya.',
    'stores', p_store_id);
END;
$$;

REVOKE ALL ON FUNCTION app_private.notify_store_joined(text, text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION app_private.trg_notify_store_community()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    IF TG_TABLE_NAME = 'stores' THEN
      IF NEW.community_id IS NOT NULL
         AND (TG_OP = 'INSERT' OR NEW.community_id IS DISTINCT FROM OLD.community_id) THEN
        PERFORM app_private.notify_store_joined(NEW.id, NEW.community_id);
      END IF;
    ELSE
      PERFORM app_private.notify_store_joined(NEW.store_id, NEW.community_id);
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify store community gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_stores_community ON public.stores;
CREATE TRIGGER trg_notify_stores_community
  AFTER INSERT OR UPDATE OF community_id ON public.stores
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_store_community();

DROP TRIGGER IF EXISTS trg_notify_store_communities ON public.store_communities;
CREATE TRIGGER trg_notify_store_communities
  AFTER INSERT ON public.store_communities
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_store_community();

-- ---------------------------------------------------------------------------
-- Permintaan gabung komunitas
--   baru → Sub-Admin Utama komunitas; ditolak → pemohon.
--   (Disetujui sudah tercakup oleh notifikasi keanggotaan di atas.)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_join_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_store_name text;
  v_community text;
BEGIN
  BEGIN
    SELECT s.name INTO v_store_name FROM public.stores s WHERE s.id = NEW.store_id;
    SELECT c.name INTO v_community FROM public.communities c WHERE c.id = NEW.community_id;
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
      PERFORM app_private.notify_roles(ARRAY['sub_admin', 'sub_admin_umum'], NEW.community_id,
        'join_request_new',
        'Permintaan gabung komunitas',
        '"' || coalesce(v_store_name, '-') || '" ingin bergabung dengan ' || coalesce(v_community, 'komunitas Anda') || '.',
        'community-members', NEW.store_id);
    ELSIF TG_OP = 'UPDATE' AND NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' THEN
      PERFORM app_private.notify_user(NEW.user_id, 'join_request_rejected',
        'Permintaan gabung ditolak',
        'Permintaan "' || coalesce(v_store_name, '-') || '" ke ' || coalesce(v_community, 'komunitas') || ' ditolak'
          || CASE WHEN nullif(btrim(NEW.decision_note), '') IS NOT NULL THEN ': ' || NEW.decision_note ELSE '.' END,
        'komunitas', NEW.store_id);
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify join requests gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_join_requests ON public.community_join_requests;
CREATE TRIGGER trg_notify_join_requests
  AFTER INSERT OR UPDATE OF status ON public.community_join_requests
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_join_requests();

-- ---------------------------------------------------------------------------
-- Tiket bantuan: baru → Super Admin; status/balasan berubah → pembuat tiket
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_tickets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role text;
  v_link text;
  v_status text;
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      PERFORM app_private.notify_roles(ARRAY['admin'], NULL, 'ticket_new',
        'Tiket bantuan baru ' || coalesce(NEW.ticket_number, ''),
        coalesce(NEW.requester_name, 'Pengguna') || ': ' || coalesce(NEW.subject, '-'),
        'tickets', NEW.store_id);
    ELSIF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.admin_response IS DISTINCT FROM OLD.admin_response THEN
      SELECT u.role INTO v_role FROM public.users u WHERE u.id = NEW.requester_id;
      v_link := CASE WHEN v_role IN ('sub_admin', 'sub_admin_umum', 'community_admin', 'sub_admin_produk')
                     THEN 'my-tickets' ELSE 'tiket' END;
      v_status := CASE NEW.status
                    WHEN 'resolved' THEN 'selesai'
                    WHEN 'in_progress' THEN 'sedang diproses'
                    ELSE 'menunggu' END;
      PERFORM app_private.notify_user(NEW.requester_id, 'ticket_update',
        'Tiket ' || coalesce(NEW.ticket_number, '') || ' diperbarui',
        '"' || coalesce(NEW.subject, '-') || '" kini ' || v_status
          || CASE WHEN NEW.admin_response IS DISTINCT FROM OLD.admin_response
                       AND nullif(btrim(NEW.admin_response), '') IS NOT NULL
                  THEN ' · ada balasan baru dari admin.' ELSE '.' END,
        v_link, NEW.store_id);
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify tickets gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_tickets ON public.support_tickets;
CREATE TRIGGER trg_notify_tickets
  AFTER INSERT OR UPDATE OF status, admin_response ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_tickets();

-- ---------------------------------------------------------------------------
-- Domain: pengajuan & bukti bayar → Super Admin; status berubah → pemilik toko
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_domain_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_status text;
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      PERFORM app_private.notify_roles(ARRAY['admin'], NULL, 'domain_request_new',
        'Pengajuan domain baru',
        coalesce(NEW.store_name, 'Toko') || ' mengajukan ' || coalesce(NEW.requested_domain, '-') || '.',
        'domain-requests', NEW.store_id);
    ELSE
      IF NEW.payment_proof_url IS NOT NULL AND OLD.payment_proof_url IS DISTINCT FROM NEW.payment_proof_url THEN
        PERFORM app_private.notify_roles(ARRAY['admin'], NULL, 'domain_payment_proof',
          'Bukti bayar domain masuk',
          coalesce(NEW.store_name, 'Toko') || ' mengirim bukti bayar untuk ' || coalesce(NEW.requested_domain, '-') || '.',
          'domain-requests', NEW.store_id);
      END IF;
      IF NEW.status IS DISTINCT FROM OLD.status THEN
        v_status := CASE NEW.status
                      WHEN 'approved' THEN 'disetujui, silakan lakukan pembayaran'
                      WHEN 'active' THEN 'sudah aktif'
                      WHEN 'rejected' THEN 'ditolak'
                      ELSE NEW.status END;
        PERFORM app_private.notify_user(app_private.store_owner(NEW.store_id), 'domain_status',
          'Status domain ' || coalesce(NEW.requested_domain, ''),
          'Pengajuan domain ' || coalesce(NEW.requested_domain, '-') || ' ' || coalesce(v_status, '-') || '.',
          'domain', NEW.store_id);
      END IF;
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify domain requests gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_domain_requests ON public.domain_requests;
CREATE TRIGGER trg_notify_domain_requests
  AFTER INSERT OR UPDATE OF status, payment_proof_url ON public.domain_requests
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_domain_requests();

-- ---------------------------------------------------------------------------
-- Penarikan dana: baru → Super Admin; status berubah → pemilik toko
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_withdrawals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    IF TG_OP = 'INSERT' THEN
      PERFORM app_private.notify_roles(ARRAY['admin'], NULL, 'withdrawal_new',
        'Permintaan penarikan dana',
        coalesce(NEW.store_name, 'Toko') || ' meminta penarikan ' || app_private.fmt_rupiah(NEW.amount) || '.',
        'withdrawals', NEW.store_id);
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
      PERFORM app_private.notify_user(app_private.store_owner(NEW.store_id), 'withdrawal_status',
        'Status penarikan dana',
        'Penarikan ' || app_private.fmt_rupiah(NEW.amount) || ' kini berstatus ' || coalesce(NEW.status, '-') || '.',
        'beranda', NEW.store_id);
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify withdrawals gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_withdrawals ON public.withdrawals;
CREATE TRIGGER trg_notify_withdrawals
  AFTER INSERT OR UPDATE OF status ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_withdrawals();

-- ---------------------------------------------------------------------------
-- Pengguna baru → Super Admin
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  BEGIN
    IF NEW.role IS DISTINCT FROM 'admin' THEN
      PERFORM app_private.notify_roles(ARRAY['admin'], NULL, 'user_new',
        'Pengguna baru terdaftar',
        coalesce(nullif(btrim(NEW.name), ''), 'Pengguna') || ' mendaftar sebagai '
          || CASE WHEN NEW.role = 'merchant' THEN 'pemilik toko' ELSE coalesce(NEW.role, '-') END || '.',
        'users', NULL);
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify users gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_users ON public.users;
CREATE TRIGGER trg_notify_users
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_users();

-- ---------------------------------------------------------------------------
-- Tagihan komunitas: terbit → Sub-Admin Utama; lunas → Super Admin
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.trg_notify_community_invoices()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_community text;
BEGIN
  BEGIN
    SELECT c.name INTO v_community FROM public.communities c WHERE c.id = NEW.community_id;
    IF TG_OP = 'INSERT' THEN
      PERFORM app_private.notify_roles(ARRAY['sub_admin', 'sub_admin_umum'], NEW.community_id,
        'community_invoice_new',
        'Tagihan komunitas ' || coalesce(NEW.period, ''),
        'Tagihan ' || coalesce(NEW.invoice_number, '') || ' sebesar ' || app_private.fmt_rupiah(NEW.total_billed) || ' telah terbit.',
        'communities', NULL);
    ELSIF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
      PERFORM app_private.notify_roles(ARRAY['admin'], NULL, 'community_invoice_paid',
        'Tagihan komunitas lunas',
        coalesce(v_community, 'Komunitas') || ' melunasi ' || coalesce(NEW.invoice_number, '') || ' ('
          || app_private.fmt_rupiah(NEW.total_billed) || ').',
        'communities', NULL);
    END IF;
  EXCEPTION WHEN others THEN
    RAISE WARNING 'notify community invoices gagal: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_community_invoices ON public.community_invoices;
CREATE TRIGGER trg_notify_community_invoices
  AFTER INSERT OR UPDATE OF status ON public.community_invoices
  FOR EACH ROW EXECUTE FUNCTION app_private.trg_notify_community_invoices();

-- Fungsi trigger tidak boleh dipanggil langsung oleh klien.
REVOKE ALL ON FUNCTION app_private.trg_notify_orders() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_products() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_store_community() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_join_requests() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_tickets() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_domain_requests() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_withdrawals() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.trg_notify_community_invoices() FROM PUBLIC;
