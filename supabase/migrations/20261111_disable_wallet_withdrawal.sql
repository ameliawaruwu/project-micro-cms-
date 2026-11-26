-- =============================================================================
-- NONAKTIFKAN SEMENTARA PENARIKAN SALDO DOMPET TOKO
-- =============================================================================
-- Payment gateway belum aktif, jadi fitur Dompet & Tarik Saldo dimatikan
-- (frontend: src/config/features.ts → WALLET_ENABLED = false).
--
-- Sebelumnya: merchant bisa memanggil RPC public.request_withdrawal langsung dari browser.
-- Setelah migrasi ini: anon/authenticated tidak bisa lagi memanggilnya, walau tombolnya
-- dibuka paksa lewat devtools. Data dompet & fungsi lain tidak diubah.
--
-- Untuk menyalakan kembali:
--   GRANT EXECUTE ON FUNCTION public.request_withdrawal(text, bigint, text, text, text)
--     TO anon, authenticated;
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.request_withdrawal(text, bigint, text, text, text)
  FROM PUBLIC, anon, authenticated;
