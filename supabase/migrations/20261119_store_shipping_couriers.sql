-- Kurir aktif per toko (menu Pengiriman → Kurir & Ekspedisi).
-- NULL = belum pernah diatur (server memakai kurir reguler bawaan); array kosong = semua dimatikan.
-- Server (/api/shipping/quote & /api/shipping/route-couriers) membaca kolom ini, jadi pembeli
-- hanya bisa memilih kurir yang diaktifkan merchant, dan daftar kurir di "Atur Pengiriman" sama.
-- Hanya pemilik toko yang bisa mengubahnya (policy stores_update_owner_staff + guard_store_staff_columns).

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS shipping_couriers text[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stores_shipping_couriers_check'
  ) THEN
    ALTER TABLE public.stores
      ADD CONSTRAINT stores_shipping_couriers_check CHECK (
        shipping_couriers IS NULL
        OR (
          cardinality(shipping_couriers) <= 20
          AND (
            cardinality(shipping_couriers) = 0
            OR array_to_string(shipping_couriers, ',') ~ '^[a-z0-9_]{2,20}(,[a-z0-9_]{2,20})*$'
          )
        )
      );
  END IF;
END $$;
