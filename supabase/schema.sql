-- ============================================================================
-- KROOMBOX (MICRO CMS) - SUPABASE / POSTGRESQL CLEAN DATABASE SCHEMA
-- ============================================================================
-- Kompatibel dengan Supabase Database & PostgreSQL 13+
-- Mendukung Multi-Store UMKM, Katalog Produk, Midtrans Payment Gateway,
-- Billing Plans Langganan, dan Sistem Logistik Pengiriman & Multi-Gudang (Biteship Aggregator)
-- Tanpa Data Dummy Produk (Clean State)
-- Sudah termasuk perizinan akses publik/anon untuk frontend & Supabase Realtime
-- ============================================================================

-- Ekstensi UUID & pgcrypto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- OPSI RESET TOTAL: HAPUS TABEL LAMA (UNCOMMENT JIKA INGIN BERSIHKAN DARI AWAL)
-- ============================================================================
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS shipping_branches CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS store_subscriptions CASCADE;
DROP TABLE IF EXISTS billing_plans CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;

-- ============================================================================
-- 1. TABEL: USERS (PENGGUNA PLATFORM - ADMIN & MERCHANT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'usr_' || replace(gen_random_uuid()::text, '-', ''),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    role VARCHAR(32) NOT NULL DEFAULT 'merchant' CHECK (role IN ('admin', 'merchant', 'buyer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- 2. TABEL: STORES (TOKO ONLINE UMKM)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'str_' || replace(gen_random_uuid()::text, '-', ''),
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    phone_whatsapp VARCHAR(32) NOT NULL,
    city VARCHAR(128) NOT NULL DEFAULT 'Jakarta Selatan',
    province VARCHAR(128) DEFAULT 'DKI Jakarta',
    district VARCHAR(128),
    postal_code VARCHAR(16),
    address TEXT,
    category VARCHAR(64) DEFAULT 'Fashion & Retail',
    plan VARCHAR(32) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'premium')),
    balance BIGINT DEFAULT 0,
    theme_settings JSONB DEFAULT '{}'::jsonb,
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_plan ON stores(plan);

-- ============================================================================
-- 3. TABEL: PRODUCTS (KATALOG PRODUK TOKO - 1:1 SESUAI FORM FRONT-END)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'prd_' || replace(gen_random_uuid()::text, '-', ''),
    store_id VARCHAR(64) NOT NULL DEFAULT 'store-andhika',
    name VARCHAR(255) NOT NULL,                           -- 1. Nama Produk
    category VARCHAR(128) DEFAULT 'Umum',                 -- 2. Kategori Produk
    price BIGINT NOT NULL DEFAULT 0,                      -- 3. Harga Produk (Rp)
    stock INTEGER NOT NULL DEFAULT 0,                     -- 4. Jumlah Stok
    sku VARCHAR(64),                                      -- 5. Kode SKU (Opsional)
    weight_grams INTEGER DEFAULT 250,                     -- 6. Berat Barang (Gram)
    description TEXT,                                     -- 7. Deskripsi Lengkap Produk
    image_url TEXT,                                       -- 8. Foto Sampul Utama
    images JSONB DEFAULT '[]'::jsonb,                     -- 9. Galeri Foto Produk (Maks 5)
    status VARCHAR(32) DEFAULT 'Aktif',                   -- 10. Status Produk (Aktif / Habis)
    slug VARCHAR(255),                                    -- Link URL Produk
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ============================================================================
-- 4. TABEL: SHIPPING_BRANCHES (GUDANG / CABANG ASAL PENGIRIMAN MULTI-GUDANG)
-- ============================================================================
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

-- Trigger Otomatis: Hanya 1 Cabang Default per Store
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

-- ============================================================================
-- 5. TABEL: ORDERS (PESANAN PEMBELI & LOGISTIK PENGIRIMAN)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'ord_' || replace(gen_random_uuid()::text, '-', ''),
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    customer_email VARCHAR(255),
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(128) NOT NULL,
    shipping_courier VARCHAR(64) NOT NULL,
    shipping_service VARCHAR(64) NOT NULL,
    shipping_cost BIGINT NOT NULL DEFAULT 0,
    tracking_number VARCHAR(128),
    total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(64) NOT NULL,
    payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'expired', 'refunded')),
    order_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    paid_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    -- Kolom Integrasi Logistik & Multi-Gudang (Biteship Aggregator)
    origin_branch_id UUID REFERENCES shipping_branches(id) ON DELETE SET NULL,
    destination_address TEXT,
    destination_postal_code TEXT,
    total_weight INTEGER DEFAULT 1000,
    courier_code TEXT,
    courier_service TEXT,
    shipping_method TEXT DEFAULT 'drop_off' CHECK (shipping_method IN ('pickup', 'drop_off')),
    shipping_order_id TEXT,
    shipping_label_url TEXT,
    pickup_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_origin_branch ON orders(origin_branch_id);

-- Migrasi Idempoten: Tambahkan kolom logistik jika tabel orders sudah ada sebelumnya di DB
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

-- ============================================================================
-- 6. TABEL: ORDER_ITEMS (RINCIAN PRODUK DALAM PESANAN)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'itm_' || replace(gen_random_uuid()::text, '-', ''),
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    price BIGINT NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
    variant_info VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================================================
-- 7. TABEL: WITHDRAWALS (PENARIKAN DANA OLEH MERCHANT)
-- ============================================================================
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'wd_' || replace(gen_random_uuid()::text, '-', ''),
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    store_logo TEXT,
    amount BIGINT NOT NULL CHECK (amount > 0),
    bank_name VARCHAR(64) NOT NULL,
    account_number VARCHAR(64) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_store_id ON withdrawals(store_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- ============================================================================
-- 8. TABEL: WALLET_TRANSACTIONS (MUTASI DOMPET TOKO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'tx_' || replace(gen_random_uuid()::text, '-', ''),
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('income', 'withdrawal')),
    title VARCHAR(255) NOT NULL,
    amount BIGINT NOT NULL,
    reference_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_store_id ON wallet_transactions(store_id);

-- ============================================================================
-- 9. TABEL: PLATFORM_SETTINGS (KONFIGURASI MASTER ADMIN & API KEYS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
    id VARCHAR(32) PRIMARY KEY DEFAULT 'global_config',
    midtrans_environment VARCHAR(32) DEFAULT 'sandbox' CHECK (midtrans_environment IN ('sandbox', 'production')),
    midtrans_merchant_id VARCHAR(128) DEFAULT 'G182930491',
    midtrans_client_key VARCHAR(255) DEFAULT 'SB-Mid-client-8Yp9X1v2wQzL4a7k',
    midtrans_server_key VARCHAR(255) DEFAULT 'SB-Mid-server-zR9u3M2vX8pLk1A0yW4t',
    biteship_enabled BOOLEAN DEFAULT TRUE,
    biteship_api_key VARCHAR(255) DEFAULT 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElkIjoiNjU0MyJ9',
    biteship_origin_city VARCHAR(128) DEFAULT 'Jakarta Selatan',
    wa_gateway_enabled BOOLEAN DEFAULT TRUE,
    wa_gateway_api_key VARCHAR(255) DEFAULT 'fonnte_token_88921xks9021',
    wa_sender_phone VARCHAR(32) DEFAULT '081289201928',
    platform_fee_percent NUMERIC(4,2) DEFAULT 1.50,
    payout_min_amount BIGINT DEFAULT 50000,
    payout_bank_fee BIGINT DEFAULT 2500,
    auto_approve_payout_under BIGINT DEFAULT 500000,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. TABEL: BILLING_PLANS (MASTER PAKET LANGGANAN SUPER ADMIN)
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_plans (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'plan_' || replace(gen_random_uuid()::text, '-', ''),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) UNIQUE NOT NULL,
    tagline TEXT,
    price_monthly BIGINT NOT NULL DEFAULT 0,
    price_yearly BIGINT NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_plans_slug ON billing_plans(slug);
CREATE INDEX IF NOT EXISTS idx_billing_plans_active ON billing_plans(is_active);

-- ============================================================================
-- 11. TABEL: STORE_SUBSCRIPTIONS (RIWAYAT TRANSAKSI & INVOICE LANGGANAN)
-- ============================================================================
CREATE TABLE IF NOT EXISTS store_subscriptions (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'sub_' || replace(gen_random_uuid()::text, '-', ''),
    store_id VARCHAR(64) REFERENCES stores(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) REFERENCES billing_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(255) NOT NULL,
    cycle VARCHAR(32) NOT NULL DEFAULT 'monthly' CHECK (cycle IN ('monthly', 'yearly')),
    amount BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'expired', 'failed')),
    payment_method VARCHAR(64) DEFAULT 'Midtrans (QRIS & VA)',
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_store_subscriptions_store_id ON store_subscriptions(store_id);
CREATE INDEX IF NOT EXISTS idx_store_subscriptions_status ON store_subscriptions(status);

-- ============================================================================
-- DATA INISIALISASI DASAR (AKUN, TOKO, GUDANG, & MASTER BILLING PLANS)
-- ============================================================================
INSERT INTO platform_settings (id) VALUES ('global_config') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, name, phone, role) VALUES
('usr-admin-1', 'admin@kroombox.id', 'admin123', 'Super Admin Kroombox', '081289201928', 'admin'),
('usr-andhika-1', 'andhika@gmail.com', 'password123', 'Andhika Pratama', '081298765432', 'merchant')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stores (id, user_id, name, slug, tagline, description, phone_whatsapp, city, province, address, category, plan, balance) VALUES
('store-andhika', 'usr-andhika-1', 'Toko Andhika', 'toko-andhika', 'Toko Online Andhika', 'Pusat belanja produk berkualitas', '6281298765432', 'Jakarta Selatan', 'DKI Jakarta', 'Jl. Kemang Raya No. 42', 'Fashion & Retail', 'starter', 0)
ON CONFLICT (id) DO NOTHING;

-- Seed Data Default Cabang Toko Andhika (Multi-Gudang Biteship)
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

INSERT INTO billing_plans (id, name, slug, tagline, price_monthly, price_yearly, features, is_active, sort_order) VALUES
('plan_free', 'Starter (Gratis)', 'free', 'Cocok untuk toko baru yang mulai berjualan online', 0, 0, '["Katalog produk hingga 25 item", "Checkout otomatis via Midtrans (QRIS & VA)", "Cek ongkir otomatis ekspedisi (J&T, JNE)", "Watermark resmi Kroombox di footer toko"]'::jsonb, true, 1),
('plan_pro', 'Pro UMKM', 'premium', 'Fitur lengkap tanpa batas untuk meningkatkan omset toko', 99000, 950000, '["Unlimited katalog produk & varian", "Bebas watermark (white-label brand sendiri)", "Semua metode pembayaran Midtrans (QRIS, VA Bank, Kartu Kredit)", "Visual layout builder & kustomisasi banner toko", "Cetak label pengiriman thermal massal", "Laporan analitik penjualan & omset real-time", "Prioritas bantuan customer support"]'::jsonb, true, 2),
('plan_scaleup', 'Bisnis Scale-Up', 'business', 'Untuk bisnis UMKM berkembang dengan tim & cabang', 249000, 2400000, '["Semua fitur paket Pro UMKM", "Akses multi-staf pengelola toko (hingga 5 admin)", "Dukungan custom domain toko (.com / .id)", "Notifikasi otomatis WhatsApp bot ke pembeli", "Dedicated Account Manager 24/7"]'::jsonb, true, 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- KONFIGURASI PERIZINAN ROW LEVEL SECURITY (RLS) UNTUK FRONTEND
-- ============================================================================
ALTER TABLE IF EXISTS products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipping_branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS withdrawals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS billing_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS store_subscriptions DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE products TO anon, authenticated, service_role;
GRANT ALL ON TABLE stores TO anon, authenticated, service_role;
GRANT ALL ON TABLE shipping_branches TO anon, authenticated, service_role;
GRANT ALL ON TABLE orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE order_items TO anon, authenticated, service_role;
GRANT ALL ON TABLE users TO anon, authenticated, service_role;
GRANT ALL ON TABLE platform_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE wallet_transactions TO anon, authenticated, service_role;
GRANT ALL ON TABLE withdrawals TO anon, authenticated, service_role;
GRANT ALL ON TABLE billing_plans TO anon, authenticated, service_role;
GRANT ALL ON TABLE store_subscriptions TO anon, authenticated, service_role;

-- ============================================================================
-- KONFIGURASI SUPABASE REALTIME (WEBSOCKET) UNTUK ORDERS & SHIPPING_BRANCHES
-- ============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE shipping_branches;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;
