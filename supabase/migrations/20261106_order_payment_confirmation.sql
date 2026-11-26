-- ============================================================================
-- MIGRATION: KONFIRMASI PEMBAYARAN QRIS / TRANSFER LANGSUNG
-- Tanggal: 2026-11-06
-- Deskripsi:
--   - orders.payment_confirmed_at: diisi saat pembeli menekan tombol
--     "Saya Sudah Bayar" (menggantikan konfirmasi via WhatsApp).
--     Merchant lalu mengecek mutasi dan menandai pesanan lunas (payment_status = 'paid').
-- Aditif & idempotent: aman dijalankan ulang, tidak menghapus data.
-- ============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP WITH TIME ZONE;
