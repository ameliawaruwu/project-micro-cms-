-- =============================================================================
-- KEAMANAN TAHAP 2b-2 — Uang (saldo, penarikan, wallet, langganan, paket) & role akun
-- =============================================================================
-- Prasyarat: 20261110_security_phase2b1_sessions.sql (sesi via header x-lapakq-session).
--
-- Sebelumnya siapa pun bisa (lewat anon key):
--   * mengubah stores.balance toko mana pun lalu mengajukan penarikan dana;
--   * menyetujui penarikan sendiri / mengubah wallet_transactions;
--   * menandai langganan "paid" & menaikkan paket toko tanpa membayar;
--   * mengubah/menghapus billing_plans;
--   * menjadikan akunnya sendiri super admin (users.role).
--
-- Setelah migrasi ini:
--   * stores.balance hanya berubah lewat fungsi resmi (penarikan / penolakan / server);
--     stores.plan & stores.is_suspended hanya oleh super admin atau server;
--   * users.role hanya oleh super admin (RPC admin_upsert_user / sesi admin) atau server;
--   * penarikan dana lewat request_withdrawal (pemilik toko, saldo dicek atomik) dan
--     admin_process_withdrawal (super admin; penolakan mengembalikan saldo);
--   * wallet_transactions & withdrawals hanya terlihat oleh pemilik toko & super admin;
--   * billing_plans hanya diubah super admin; store_subscriptions dibuat pemilik dengan
--     status 'pending', status 'paid' hanya oleh server (callback pembayaran) / super admin.
-- Kode server (koneksi DATABASE_URL, peran postgres) tidak terkena aturan ini.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Helper sesi boleh dipakai di aturan RLS (schema tidak terekspos lewat API)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA app_private TO anon, authenticated;

CREATE OR REPLACE FUNCTION app_private.owns_store(p_store_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.stores s
     WHERE s.id = p_store_id AND s.user_id = app_private.session_user_id()
  );
$$;

-- Konteks tepercaya: koneksi server (DATABASE_URL) atau fungsi resmi SECURITY DEFINER
-- (request_withdrawal, admin_*), yang berjalan sebagai pemilik fungsi, bukan anon/authenticated.
-- PENTING: fungsi ini & trigger yang memakainya harus SECURITY INVOKER; di dalam fungsi
-- SECURITY DEFINER current_user selalu pemilik fungsi sehingga pemeriksaan selalu lolos.
CREATE OR REPLACE FUNCTION app_private.is_trusted_writer()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT current_user NOT IN ('anon', 'authenticated');
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.session_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.session_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_platform_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.owns_store(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_trusted_writer() TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 1. stores: kolom uang/status dijaga trigger (klien lama yang mengirim seluruh baris tetap jalan)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.guard_store_money_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF app_private.is_trusted_writer() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.balance := 0;
    IF NOT app_private.is_platform_admin() THEN
      NEW.plan := 'free';
      NEW.is_suspended := false;
    END IF;
  ELSE
    NEW.balance := OLD.balance;
    IF NOT app_private.is_platform_admin() THEN
      NEW.plan := OLD.plan;
      NEW.is_suspended := OLD.is_suspended;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS stores_guard_money ON public.stores;
CREATE TRIGGER stores_guard_money
  BEFORE INSERT OR UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_store_money_columns();

-- -----------------------------------------------------------------------------
-- 2. users.role hanya oleh super admin / server
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.guard_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND NOT app_private.is_trusted_writer()
     AND NOT app_private.is_platform_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS users_guard_role ON public.users;
CREATE TRIGGER users_guard_role
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION app_private.guard_user_role();

-- Hapus akun hanya oleh super admin.
DROP POLICY IF EXISTS users_delete_policy ON public.users;
CREATE POLICY users_delete_admin ON public.users FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin());

-- -----------------------------------------------------------------------------
-- 3. withdrawals & wallet_transactions: baca pemilik/admin, tulis lewat fungsi resmi
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS withdrawals_all_policy ON public.withdrawals;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.withdrawals FROM anon, authenticated;
CREATE POLICY withdrawals_select_owner_admin ON public.withdrawals FOR SELECT TO anon, authenticated
  USING (app_private.is_platform_admin() OR app_private.owns_store(store_id));

DROP POLICY IF EXISTS wallet_transactions_all_policy ON public.wallet_transactions;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.wallet_transactions FROM anon, authenticated;
CREATE POLICY wallet_tx_select_owner_admin ON public.wallet_transactions FOR SELECT TO anon, authenticated
  USING (app_private.is_platform_admin() OR app_private.owns_store(store_id));

CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_store_id text,
  p_amount bigint,
  p_bank_name text,
  p_account_number text,
  p_account_holder text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store public.stores;
  v_min bigint;
  v_wd_id text;
  v_tx_id text;
BEGIN
  IF app_private.session_user_id() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Sesi berakhir. Silakan masuk ulang.');
  END IF;
  IF NOT app_private.owns_store(p_store_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Toko ini bukan milik akun Anda.');
  END IF;
  IF nullif(btrim(p_bank_name), '') IS NULL OR nullif(btrim(p_account_number), '') IS NULL
     OR nullif(btrim(p_account_holder), '') IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Data rekening wajib diisi lengkap.');
  END IF;
  SELECT coalesce(nullif(payout_min_amount, 0), 50000) INTO v_min FROM public.platform_settings ORDER BY id LIMIT 1;
  v_min := coalesce(v_min, 50000);
  IF p_amount IS NULL OR p_amount < v_min THEN
    RETURN jsonb_build_object('success', false, 'message', 'Minimal penarikan dana adalah Rp ' || to_char(v_min, 'FM999G999G999'));
  END IF;

  -- Kurangi saldo secara atomik: gagal bila saldo tidak cukup (aman dari klik ganda).
  UPDATE public.stores SET balance = balance - p_amount, updated_at = now()
   WHERE id = p_store_id AND balance >= p_amount
  RETURNING * INTO v_store;
  IF v_store.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Saldo aktif tidak mencukupi untuk nominal penarikan ini');
  END IF;

  v_wd_id := public.get_next_id('withdrawals');
  INSERT INTO public.withdrawals (id, store_id, store_name, store_logo, amount, bank_name, account_number,
                                  account_holder, status, requested_at)
  VALUES (v_wd_id, v_store.id, v_store.name, v_store.logo_url, p_amount, btrim(p_bank_name),
          btrim(p_account_number), btrim(p_account_holder), 'pending', now());

  v_tx_id := public.get_next_id('wallet_transactions');
  INSERT INTO public.wallet_transactions (id, store_id, type, title, amount, reference_id, status, created_at)
  VALUES (v_tx_id, v_store.id, 'withdrawal',
          'Penarikan Dana ke ' || btrim(p_bank_name) || ' (' || btrim(p_account_number) || ')',
          p_amount, v_wd_id, 'pending', now());

  RETURN jsonb_build_object('success', true, 'withdrawal_id', v_wd_id, 'transaction_id', v_tx_id,
                            'balance', v_store.balance);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_process_withdrawal(p_withdrawal_id text, p_approve boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wd public.withdrawals;
BEGIN
  IF NOT app_private.is_platform_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Hanya super admin yang dapat memproses penarikan.');
  END IF;
  -- Hanya penarikan berstatus pending yang bisa diproses (aman dari proses ganda).
  UPDATE public.withdrawals
     SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END, processed_at = now()
   WHERE id = p_withdrawal_id AND status = 'pending'
  RETURNING * INTO v_wd;
  IF v_wd.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Penarikan tidak ditemukan atau sudah diproses.');
  END IF;

  UPDATE public.wallet_transactions
     SET status = CASE WHEN p_approve THEN 'completed' ELSE 'rejected' END
   WHERE reference_id = v_wd.id;
  IF NOT p_approve THEN
    UPDATE public.stores SET balance = balance + v_wd.amount, updated_at = now() WHERE id = v_wd.store_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'status', v_wd.status);
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. billing_plans: semua boleh baca, ubah hanya super admin
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS billing_plans_all_policy ON public.billing_plans;
CREATE POLICY billing_plans_select_all ON public.billing_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY billing_plans_insert_admin ON public.billing_plans FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin());
CREATE POLICY billing_plans_update_admin ON public.billing_plans FOR UPDATE TO anon, authenticated
  USING (app_private.is_platform_admin()) WITH CHECK (app_private.is_platform_admin());
CREATE POLICY billing_plans_delete_admin ON public.billing_plans FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin());

-- -----------------------------------------------------------------------------
-- 5. store_subscriptions: pemilik membuat 'pending' / membatalkan; 'paid' hanya server/admin
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS store_subscriptions_all_policy ON public.store_subscriptions;
CREATE POLICY store_subs_select_owner_admin ON public.store_subscriptions FOR SELECT TO anon, authenticated
  USING (app_private.is_platform_admin() OR app_private.owns_store(store_id));
CREATE POLICY store_subs_insert_owner_pending ON public.store_subscriptions FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin()
              OR (app_private.owns_store(store_id) AND status = 'pending' AND paid_at IS NULL));
CREATE POLICY store_subs_update_owner_admin ON public.store_subscriptions FOR UPDATE TO anon, authenticated
  USING (app_private.is_platform_admin() OR app_private.owns_store(store_id))
  WITH CHECK (app_private.is_platform_admin()
              OR (app_private.owns_store(store_id) AND status IN ('pending', 'cancelled', 'failed', 'expired')));
CREATE POLICY store_subs_delete_admin ON public.store_subscriptions FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin());

-- -----------------------------------------------------------------------------
-- 6. Hak akses fungsi baru
-- -----------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.request_withdrawal(text, bigint, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_process_withdrawal(text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(text, bigint, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_process_withdrawal(text, boolean) TO anon, authenticated;
