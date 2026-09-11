-- ============================================================================
-- MIGRATION: SISTEM LOGISTIK PENGIRIMAN & MULTI-GUDANG (BITESHIP AGGREGATOR)
-- ============================================================================

-- 1. Buat Tabel Cabang / Gudang Asal (shipping_branches)
CREATE TABLE IF NOT EXISTS shipping_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id VARCHAR(64) REFERENCES stores(id) ON DELETE CASCADE,
    branch_name TEXT NOT NULL,
    pic_name TEXT NOT NULL,
    pic_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    subdistrict TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shipping_branches_store_id ON shipping_branches(store_id);
CREATE INDEX IF NOT EXISTS idx_shipping_branches_is_default ON shipping_branches(is_default);

-- 2. Tambahkan Kolom Logistik ke Tabel orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'origin_branch_id') THEN
        ALTER TABLE orders ADD COLUMN origin_branch_id UUID REFERENCES shipping_branches(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'destination_address') THEN
        ALTER TABLE orders ADD COLUMN destination_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'destination_postal_code') THEN
        ALTER TABLE orders ADD COLUMN destination_postal_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_weight') THEN
        ALTER TABLE orders ADD COLUMN total_weight INTEGER DEFAULT 1000;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_code') THEN
        ALTER TABLE orders ADD COLUMN courier_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'courier_service') THEN
        ALTER TABLE orders ADD COLUMN courier_service TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_method') THEN
        ALTER TABLE orders ADD COLUMN shipping_method TEXT DEFAULT 'drop_off' CHECK (shipping_method IN ('pickup', 'drop_off'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_order_id') THEN
        ALTER TABLE orders ADD COLUMN shipping_order_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_label_url') THEN
        ALTER TABLE orders ADD COLUMN shipping_label_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'pickup_time') THEN
        ALTER TABLE orders ADD COLUMN pickup_time TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Trigger Otomatis: Hanya 1 Cabang Default per Store
CREATE OR REPLACE FUNCTION set_single_default_branch()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE shipping_branches
        SET is_default = FALSE
        WHERE store_id = NEW.store_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_default_branch ON shipping_branches;
CREATE TRIGGER trg_single_default_branch
BEFORE INSERT OR UPDATE OF is_default ON shipping_branches
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION set_single_default_branch();

-- 4. Hak Akses (Permissions) & RLS
ALTER TABLE IF EXISTS shipping_branches DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE shipping_branches TO anon, authenticated, service_role;

-- 5. Seed Data Default Cabang Toko Andhika
INSERT INTO shipping_branches (
    id,
    store_id,
    branch_name,
    pic_name,
    pic_phone,
    address,
    subdistrict,
    city,
    province,
    postal_code,
    is_default,
    is_active
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'store-andhika',
    'Gudang Pusat Jakarta',
    'Andhika Pratama',
    '081298765432',
    'Jl. Kemang Raya No. 42, RT 04 / RW 02',
    'Bangka, Mampang Prapatan',
    'Jakarta Selatan',
    'DKI Jakarta',
    '12730',
    TRUE,
    TRUE
), (
    'a0000000-0000-0000-0000-000000000002',
    'store-andhika',
    'Cabang Logistik Surabaya',
    'Budi Santoso',
    '081377889900',
    'Jl. Rungkut Industri Raya No. 15',
    'Kali Rungkut',
    'Kota Surabaya',
    'Jawa Timur',
    '60293',
    FALSE,
    TRUE
)
ON CONFLICT (id) DO NOTHING;
