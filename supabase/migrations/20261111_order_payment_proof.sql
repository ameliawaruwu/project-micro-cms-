-- ============================================================================
-- MIGRATION: BUKTI PEMBAYARAN QRIS / TRANSFER LANGSUNG
-- Tanggal: 2026-11-11
-- Deskripsi:
--   - orders.payment_proof_url: URL CDN foto bukti transfer yang diunggah pembeli
--     saat checkout / lacak pesanan. Hanya diisi oleh server
--     (POST /api/media/payment-proof, koneksi DATABASE_URL) setelah ID + nomor pesanan
--     cocok dan pesanan belum lunas. Merchant membacanya lewat RLS orders yang sudah ada
--     untuk mencocokkan dengan mutasi sebelum menandai lunas.
-- Aditif & idempotent: aman dijalankan ulang, tidak menghapus data.
-- ============================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
