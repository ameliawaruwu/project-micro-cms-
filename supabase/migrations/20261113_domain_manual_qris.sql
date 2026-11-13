-- ============================================================================
-- MIGRATION: PEMBAYARAN DOMAIN MANUAL VIA QRIS PLATFORM
-- Tanggal: 2026-11-13
-- Deskripsi:
--   1. platform_settings.domain_qris_url : gambar QRIS milik platform untuk membayar invoice
--      domain. Diatur super admin lewat RPC admin_update_platform_settings, dibaca publik
--      (hanya merchant yang permintaannya disetujui yang menampilkannya).
--   2. domain_requests.payment_proof_url / payment_proof_submitted_at : bukti transfer
--      yang diunggah merchant. payment_status tetap 'unpaid' sampai super admin menyetujui;
--      "menunggu verifikasi" = payment_proof_submitted_at terisi & status 'approved'.
--   3. RPC submit_domain_payment_proof : satu-satunya jalur merchant mengirim bukti
--      (cek pemilik toko + status 'approved' + URL https).
--   4. Trigger guard_domain_request_columns ikut menjaga kolom bukti dari update langsung.
--   Persetujuan pembayaran memakai alur admin yang sudah ada (status 'active', payment_status
--   'paid', custom_domain toko). Penolakan bukti oleh admin mengosongkan kedua kolom bukti.
-- Aditif & idempotent: aman dijalankan ulang, tidak menghapus data.
-- ============================================================================

-- 1. QRIS platform ------------------------------------------------------------
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS domain_qris_url TEXT;

GRANT SELECT (domain_qris_url) ON public.platform_settings TO anon, authenticated;

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
  v_qris text := nullif(btrim(s->>'domain_qris_url'), '');
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
  IF v_qris IS NOT NULL AND (length(v_qris) > 500 OR v_qris !~ '^https://[^\s"''<>()\\]+$') THEN
    RAISE EXCEPTION 'URL QRIS harus berupa alamat https:// yang valid.' USING ERRCODE = '22023';
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
    domain_qris_url           = CASE WHEN s ? 'domain_qris_url'           THEN v_qris ELSE domain_qris_url END,
    updated_at = now()
  WHERE id = (SELECT id FROM public.platform_settings ORDER BY id LIMIT 1);

  RETURN jsonb_build_object('success', true);
END;
$function$;

-- 2. Kolom bukti bayar --------------------------------------------------------
ALTER TABLE public.domain_requests
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_submitted_at TIMESTAMPTZ;

-- 3. Guard: merchant tidak bisa mengisi kolom bukti lewat update langsung ------
CREATE OR REPLACE FUNCTION app_private.guard_domain_request_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF app_private.is_trusted_writer() OR app_private.is_platform_admin() THEN
    RETURN NEW;
  END IF;
  NEW.status := 'pending';
  NEW.payment_status := 'unpaid';
  NEW.invoice_number := NULL;
  NEW.approved_at := NULL;
  NEW.activated_at := NULL;
  IF TG_OP = 'INSERT' THEN
    NEW.admin_notes := NULL;
    NEW.payment_proof_url := NULL;
    NEW.payment_proof_submitted_at := NULL;
  ELSE
    NEW.admin_notes := OLD.admin_notes;
    NEW.payment_proof_url := OLD.payment_proof_url;
    NEW.payment_proof_submitted_at := OLD.payment_proof_submitted_at;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.guard_domain_request_columns() FROM PUBLIC, anon, authenticated;

-- 4. RPC merchant: kirim bukti bayar ------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_domain_payment_proof(p_request_id text, p_proof_url text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req public.domain_requests%ROWTYPE;
  v_url text := nullif(btrim(p_proof_url), '');
BEGIN
  IF v_url IS NULL OR length(v_url) > 500 OR v_url !~ '^https://[^\s"''<>()\\]+$' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bukti pembayaran tidak valid. Unggah ulang gambarnya.');
  END IF;

  SELECT * INTO v_req FROM public.domain_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR NOT app_private.owns_store(v_req.store_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Permintaan domain tidak ditemukan.');
  END IF;
  IF v_req.status <> 'approved' OR v_req.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Permintaan domain ini tidak sedang menunggu pembayaran.');
  END IF;

  UPDATE public.domain_requests
     SET payment_proof_url = v_url,
         payment_proof_submitted_at = now(),
         updated_at = now()
   WHERE id = p_request_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
REVOKE ALL ON FUNCTION public.submit_domain_payment_proof(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_domain_payment_proof(text, text) TO anon, authenticated;
