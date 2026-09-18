-- ============================================================================
-- MIGRATION: ADD STANDARDIZED STORE ADDRESS HIERARCHY FIELDS
-- ============================================================================
ALTER TABLE stores ADD COLUMN IF NOT EXISTS address_detail TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS village VARCHAR(128);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subdistrict VARCHAR(128);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

COMMENT ON COLUMN stores.address IS 'Alamat standar: Jalan, Nomor, RT/RW';
COMMENT ON COLUMN stores.address_detail IS 'Detail alamat: Patokan, Blok, Gedung, Unit';
COMMENT ON COLUMN stores.village IS 'Desa asal toko';
COMMENT ON COLUMN stores.subdistrict IS 'Kelurahan asal toko';
COMMENT ON COLUMN stores.district IS 'Kecamatan asal toko';
COMMENT ON COLUMN stores.city IS 'Kabupaten atau Kota asal toko';
COMMENT ON COLUMN stores.province IS 'Provinsi asal toko';
COMMENT ON COLUMN stores.postal_code IS 'Kode Pos toko';
