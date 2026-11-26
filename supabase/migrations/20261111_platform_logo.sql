-- ============================================================================
-- MIGRATION: LOGO PLATFORM DAPAT DIATUR SUPER ADMIN
-- Tanggal: 2026-11-11
-- Deskripsi:
--   - platform_settings.logo_url      : URL logo lengkap (gambar + wordmark).
--   - platform_settings.logo_icon_url : URL ikon logo (sidebar ciut, avatar kecil).
--   Keduanya URL CDN hasil POST /api/media/upload (kind 'platform', khusus admin).
--   NULL = pakai logo bawaan /Logo.png dan /Logo-Icon.png.
--   - Kolom boleh dibaca publik (logo tampil di landing & halaman login).
--   - Ditulis hanya lewat RPC admin_update_platform_settings (verifikasi super admin),
--     hanya menerima URL https:// tanpa karakter berbahaya, atau string kosong untuk reset.
-- Aditif & idempotent: aman dijalankan ulang, tidak menghapus data.
-- ============================================================================

ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_icon_url TEXT;

GRANT SELECT (logo_url, logo_icon_url) ON public.platform_settings TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_platform_settings(p_admin_email text, p_admin_password text, p_settings jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_admin public.users;
  s jsonb := coalesce(p_settings, '{}'::jsonb);
  v_logo text := nullif(btrim(s->>'logo_url'), '');
  v_logo_icon text := nullif(btrim(s->>'logo_icon_url'), '');
BEGIN
  v_admin := app_private.require_admin(p_admin_email, p_admin_password);
  IF v_admin.id IS NULL THEN
    -- RETURN (bukan RAISE) agar penghitung percobaan gagal tetap tersimpan.
    RETURN jsonb_build_object('success', false, 'message', 'Verifikasi super admin gagal. Masuk ulang lalu coba lagi.');
  END IF;
  IF s ? 'midtrans_environment' AND s->>'midtrans_environment' NOT IN ('sandbox', 'production') THEN
    RAISE EXCEPTION 'Mode Midtrans tidak valid.' USING ERRCODE = '22023';
  END IF;
  IF (v_logo IS NOT NULL AND (length(v_logo) > 500 OR v_logo !~ '^https://[^\s"''<>()\\]+$'))
     OR (v_logo_icon IS NOT NULL AND (length(v_logo_icon) > 500 OR v_logo_icon !~ '^https://[^\s"''<>()\\]+$')) THEN
    RAISE EXCEPTION 'URL logo harus berupa alamat https:// yang valid.' USING ERRCODE = '22023';
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
    logo_url                  = CASE WHEN s ? 'logo_url'                  THEN v_logo ELSE logo_url END,
    logo_icon_url             = CASE WHEN s ? 'logo_icon_url'             THEN v_logo_icon ELSE logo_icon_url END,
    updated_at = now()
  WHERE id = (SELECT id FROM public.platform_settings ORDER BY id LIMIT 1);

  RETURN jsonb_build_object('success', true);
END;
$function$;
