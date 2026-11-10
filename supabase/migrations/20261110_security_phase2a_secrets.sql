-- =============================================================================
-- KEAMANAN TAHAP 2a — Kunci rahasia platform & kunci API partner
-- =============================================================================
-- Sebelumnya siapa pun yang memegang anon key bisa:
--   * MEMBACA platform_settings.midtrans_server_key & wa_gateway_api_key;
--   * MENGUBAH platform_settings (mis. mengganti kunci Midtrans / biaya platform / maintenance);
--   * MEMBACA partner_api_keys.api_key (kunci Partner API komunitas, mis. Portal GMPS).
--
-- Setelah migrasi ini:
--   * browser hanya bisa membaca kolom publik platform_settings;
--   * platform_settings hanya bisa diubah lewat admin_update_platform_settings (kredensial super admin);
--   * partner_api_keys tidak bisa diakses anon/authenticated sama sekali (hanya server via DATABASE_URL).
-- Server membaca kunci rahasia lewat koneksi DATABASE_URL (backend/platformSettings.ts).
--
-- SETELAH DITERAPKAN: kunci yang sempat terbaca publik harus dianggap bocor —
-- ganti Midtrans Server Key di dashboard Midtrans dan buat ulang kunci Partner API.
-- =============================================================================

-- 1. partner_api_keys: hanya server
DROP POLICY IF EXISTS partner_api_keys_select ON public.partner_api_keys;
REVOKE ALL ON TABLE public.partner_api_keys FROM anon, authenticated;

-- 2. platform_settings: baca kolom publik saja, tulis lewat RPC admin
REVOKE ALL ON TABLE public.platform_settings FROM anon, authenticated;
GRANT SELECT (id, midtrans_environment, midtrans_merchant_id, midtrans_client_key, biteship_enabled,
              biteship_origin_city, wa_gateway_enabled, wa_sender_phone, platform_fee_percent,
              payout_min_amount, payout_bank_fee, auto_approve_payout_under, maintenance_mode,
              updated_at, payment_gateway_enabled)
  ON TABLE public.platform_settings TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_platform_settings(
  p_admin_email text,
  p_admin_password text,
  p_settings jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin public.users;
  s jsonb := coalesce(p_settings, '{}'::jsonb);
BEGIN
  v_admin := app_private.require_admin(p_admin_email, p_admin_password);
  IF v_admin.id IS NULL THEN
    -- RETURN (bukan RAISE) agar penghitung percobaan gagal tetap tersimpan.
    RETURN jsonb_build_object('success', false, 'message', 'Verifikasi super admin gagal. Masuk ulang lalu coba lagi.');
  END IF;
  IF s ? 'midtrans_environment' AND s->>'midtrans_environment' NOT IN ('sandbox', 'production') THEN
    RAISE EXCEPTION 'Mode Midtrans tidak valid.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.platform_settings SET
    payment_gateway_enabled   = CASE WHEN s ? 'payment_gateway_enabled'   THEN (s->>'payment_gateway_enabled')::boolean ELSE payment_gateway_enabled END,
    platform_fee_percent      = CASE WHEN s ? 'platform_fee_percent'      THEN (s->>'platform_fee_percent')::numeric ELSE platform_fee_percent END,
    payout_min_amount         = CASE WHEN s ? 'payout_min_amount'         THEN (s->>'payout_min_amount')::numeric::bigint ELSE payout_min_amount END,
    payout_bank_fee           = CASE WHEN s ? 'payout_bank_fee'           THEN (s->>'payout_bank_fee')::numeric::bigint ELSE payout_bank_fee END,
    auto_approve_payout_under = CASE WHEN s ? 'auto_approve_payout_under' THEN (s->>'auto_approve_payout_under')::numeric::bigint ELSE auto_approve_payout_under END,
    maintenance_mode          = CASE WHEN s ? 'maintenance_mode'          THEN (s->>'maintenance_mode')::boolean ELSE maintenance_mode END,
    biteship_enabled          = CASE WHEN s ? 'biteship_enabled'          THEN (s->>'biteship_enabled')::boolean ELSE biteship_enabled END,
    biteship_origin_city      = CASE WHEN s ? 'biteship_origin_city'      THEN s->>'biteship_origin_city' ELSE biteship_origin_city END,
    wa_gateway_enabled        = CASE WHEN s ? 'wa_gateway_enabled'        THEN (s->>'wa_gateway_enabled')::boolean ELSE wa_gateway_enabled END,
    wa_sender_phone           = CASE WHEN s ? 'wa_sender_phone'           THEN s->>'wa_sender_phone' ELSE wa_sender_phone END,
    wa_gateway_api_key        = CASE WHEN nullif(btrim(s->>'wa_gateway_api_key'), '') IS NOT NULL THEN btrim(s->>'wa_gateway_api_key') ELSE wa_gateway_api_key END,
    midtrans_environment      = CASE WHEN s ? 'midtrans_environment'      THEN s->>'midtrans_environment' ELSE midtrans_environment END,
    midtrans_merchant_id      = CASE WHEN s ? 'midtrans_merchant_id'      THEN s->>'midtrans_merchant_id' ELSE midtrans_merchant_id END,
    midtrans_client_key       = CASE WHEN s ? 'midtrans_client_key'       THEN s->>'midtrans_client_key' ELSE midtrans_client_key END,
    midtrans_server_key       = CASE WHEN nullif(btrim(s->>'midtrans_server_key'), '') IS NOT NULL THEN btrim(s->>'midtrans_server_key') ELSE midtrans_server_key END,
    updated_at = now()
  WHERE id = (SELECT id FROM public.platform_settings ORDER BY id LIMIT 1);

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_platform_settings(text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_platform_settings(text, text, jsonb) TO anon, authenticated;
