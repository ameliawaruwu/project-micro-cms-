-- Pesanan hanya boleh dibuat lewat backend (POST /api/orders/place).
--
-- Sebelumnya browser memanggil RPC place_order langsung dan menentukan ongkir sendiri
-- (p_shipping.cost), sehingga ongkir bisa dibuat Rp 0. Kini backend memverifikasi tarif ongkir
-- bertanda tangan server lalu memanggil place_order dengan koneksi database tepercaya.
--
-- URUTAN PENERAPAN: terapkan migrasi ini SETELAH frontend & backend baru (yang memakai
-- /api/orders/place dan /api/shipping/quote) sudah live. Bila diterapkan lebih dulu, checkout
-- versi lama akan gagal membuat pesanan.

REVOKE EXECUTE ON FUNCTION public.place_order(text, jsonb, jsonb, jsonb, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.place_order(text, jsonb, jsonb, jsonb, text, text) FROM anon, authenticated;
