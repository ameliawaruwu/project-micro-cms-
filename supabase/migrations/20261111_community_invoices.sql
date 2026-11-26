-- =============================================================================
-- TAGIHAN OMSET KOMUNITAS — pindah dari localStorage ke database
-- =============================================================================
-- Prasyarat: keamanan tahap 2b-1 s.d. 2b-4 (session_user_id, is_platform_admin,
-- my_community_id, store_has_membership).
--
-- Sebelumnya:
--   * invoice tagihan omset komunitas hanya tersimpan di localStorage browser yang membuatnya,
--     jadi sub-admin komunitas dan merchant tidak pernah bisa melihatnya;
--   * siapa pun yang membuka tab Komunitas (termasuk sub-admin) bisa menerbitkan invoice dan
--     menandainya lunas.
--
-- Setelah migrasi ini:
--   * invoice disimpan di public.community_invoices; nominal tagihan dihitung database
--     (total_turnover × fee_percent / 100), nomor invoice & jatuh tempo dibuat database;
--   * hanya super admin yang bisa menerbitkan, mengubah (tandai lunas), atau menghapus invoice;
--   * sub-admin komunitas hanya bisa MELIHAT invoice komunitasnya;
--   * merchant hanya bisa MELIHAT invoice komunitas tempat tokonya terdaftar.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.community_invoices (
  id             text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  community_id   varchar NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE
                 DEFAULT 'INV-' || to_char(now() AT TIME ZONE 'Asia/Jakarta', 'YYYYMM') || '-'
                         || upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  period         text NOT NULL CHECK (length(btrim(period)) BETWEEN 1 AND 60),
  total_turnover bigint NOT NULL CHECK (total_turnover >= 0),
  fee_percent    numeric(5,2) NOT NULL CHECK (fee_percent >= 0 AND fee_percent <= 100),
  total_billed   bigint GENERATED ALWAYS AS (round(total_turnover * fee_percent / 100)::bigint) STORED,
  status         text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  due_date       timestamptz NOT NULL DEFAULT now() + interval '7 days',
  paid_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (community_id, period)
);

CREATE INDEX IF NOT EXISTS community_invoices_community_idx
  ON public.community_invoices (community_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- Siapa yang boleh melihat invoice sebuah komunitas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app_private.can_view_community_invoices(p_community_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT app_private.is_platform_admin()
      OR p_community_id = app_private.my_community_id()
      OR EXISTS (
           SELECT 1
             FROM public.stores s
            WHERE s.user_id = app_private.session_user_id()
              AND (s.community_id = p_community_id
                   OR app_private.store_has_membership(s.id, p_community_id))
         );
$$;

REVOKE ALL ON FUNCTION app_private.can_view_community_invoices(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.can_view_community_invoices(text) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- RLS: baca untuk pihak terkait, tulis hanya super admin
-- -----------------------------------------------------------------------------
ALTER TABLE public.community_invoices ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.community_invoices FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.community_invoices TO anon, authenticated;
-- Kolom yang boleh diubah hanya status pelunasan; nominal & komunitas tidak bisa diubah.
GRANT UPDATE (status, paid_at) ON public.community_invoices TO anon, authenticated;

DROP POLICY IF EXISTS community_invoices_select ON public.community_invoices;
CREATE POLICY community_invoices_select ON public.community_invoices
  FOR SELECT TO anon, authenticated
  USING (app_private.can_view_community_invoices(community_id));

DROP POLICY IF EXISTS community_invoices_insert_admin ON public.community_invoices;
CREATE POLICY community_invoices_insert_admin ON public.community_invoices
  FOR INSERT TO anon, authenticated
  WITH CHECK (app_private.is_platform_admin() AND status = 'unpaid' AND paid_at IS NULL);

DROP POLICY IF EXISTS community_invoices_update_admin ON public.community_invoices;
CREATE POLICY community_invoices_update_admin ON public.community_invoices
  FOR UPDATE TO anon, authenticated
  USING (app_private.is_platform_admin())
  WITH CHECK (app_private.is_platform_admin());

DROP POLICY IF EXISTS community_invoices_delete_admin ON public.community_invoices;
CREATE POLICY community_invoices_delete_admin ON public.community_invoices
  FOR DELETE TO anon, authenticated
  USING (app_private.is_platform_admin());
