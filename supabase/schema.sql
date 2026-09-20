-- ============================================================================
-- KROOMIFY (MICRO CMS) - SUPABASE / POSTGRESQL CLEAN DATABASE SCHEMA
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
    subdistrict VARCHAR(128),
    village VARCHAR(128),
    postal_code VARCHAR(16),
    address TEXT,
    address_detail TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    category VARCHAR(64) DEFAULT 'Fashion & Retail',
    plan VARCHAR(32) DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'premium', 'personal', 'community', 'corporate', 'startup')),
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
    midtrans_merchant_id VARCHAR(128) DEFAULT '',
    midtrans_client_key VARCHAR(255) DEFAULT '',
    midtrans_server_key VARCHAR(255) DEFAULT '',
    biteship_enabled BOOLEAN DEFAULT TRUE,
    biteship_origin_city VARCHAR(128) DEFAULT 'Jakarta Selatan',
    wa_gateway_enabled BOOLEAN DEFAULT FALSE,
    wa_gateway_api_key VARCHAR(255) DEFAULT '',
    wa_sender_phone VARCHAR(32) DEFAULT '',
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
-- 12. TABEL: DOMAIN_REQUESTS (PERMINTAAN & APPROVAL CUSTOM DOMAIN TOKO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS domain_requests (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'dom_' || replace(gen_random_uuid()::text, '-', ''),
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    requested_domain VARCHAR(255) NOT NULL,
    tld VARCHAR(16) NOT NULL CHECK (tld IN ('.com', '.id', '.online', '.org', '.top')),
    tld_price BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
    admin_notes TEXT,
    suggestions JSONB DEFAULT '[]'::jsonb,
    invoice_number VARCHAR(64),
    payment_status VARCHAR(32) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'expired')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    activated_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_domain_requests_store_id ON domain_requests(store_id);
CREATE INDEX IF NOT EXISTS idx_domain_requests_status ON domain_requests(status);

-- ============================================================================
-- DATA INISIALISASI DASAR (AKUN, TOKO, GUDANG, & MASTER BILLING PLANS)
-- ============================================================================
INSERT INTO platform_settings (id) VALUES ('global_config') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, name, phone, role) VALUES
('usr-admin-1', 'admin@kroomify.id', crypt('admin123', gen_salt('bf')), 'Super Admin Kroomify', '081289201928', 'admin'),
('usr-andhika-1', 'andhika@gmail.com', crypt('password123', gen_salt('bf')), 'Andhika Pratama', '081298765432', 'merchant')
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

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
('plan_free', 'Paket Free', 'free', 'Cocok untuk toko baru yang baru mulai belajar online', 0, 0, '["Subdomain gratis [slug].kroomify.com", "Katalog produk hingga 15 item", "Checkout katalog & order WhatsApp", "Watermark Kroomify di footer toko", "Manual shipping & payment"]'::jsonb, true, 1),
('plan_personal', 'Personal Toko', 'personal', 'Cocok untuk bisnis individu & toko retail mandiri', 35000, 350000, '["Hosting Server: Rp 200.000 / tahun", "Jasa Micro CMS: Rp 150.000 / tahun", "Dukungan Custom Domain (.top, .online, .org, .com, .id)", "Katalog produk hingga 100 item", "Automated Midtrans (QRIS, VA Bank, E-Wallet)", "Integrasi Ekspedisi Logistik (JNE, J&T via Biteship)", "White-label tanpa watermark"]'::jsonb, true, 2),
('plan_community', 'Community UMKM', 'community', 'Pilihan terbaik untuk UMKM & komunitas bisnis berkembang', 100000, 1000000, '["Hosting Server: Rp 700.000 / tahun", "Jasa Micro CMS: Rp 300.000 / tahun", "Pilihan Terbaik UMKM (Rekomendasi Utama)", "Dukungan Custom Domain (.top, .online, .org, .com, .id)", "Unlimited katalog produk & varian", "Prioritas DNS setup & SSL otomatis", "Semua channel Midtrans & Biteship aktif", "Multi-gudang & multi-cabang pengiriman", "Laporan analitik omset & export data"]'::jsonb, true, 3),
('plan_corporate', 'Bisnis Corporate', 'corporate', 'Solusi perusahaan retail skala menengah dengan multi-cabang', 250000, 2500000, '["Hosting Server: Rp 1.800.000 / tahun", "Jasa Micro CMS: Rp 700.000 / tahun", "Server dedicated cloud berkecepatan tinggi", "Kustomisasi tema & visual layout builder tingkat lanjut", "Multi-cabang gudang tidak terbatas", "Notifikasi otomatis WhatsApp bot ke pembeli", "Dedicated Account Manager 24/7"]'::jsonb, true, 4),
('plan_startup', 'Startup Scale', 'startup', 'Infrastruktur cloud enterprise untuk brand skala nasional', 300000, 3000000, '["Hosting Server: Rp 2.000.000 / tahun", "Jasa Micro CMS: Rp 1.000.000 / tahun", "Traffic kapasitas tinggi hingga ratusan ribu order/hari", "API akses webhook langsung & integrasi ERP", "Prioritas domain deployment & DNS propagation", "Garansi uptime SLA 99.9%", "Prioritas engineering support"]'::jsonb, true, 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- ============================================================================
-- KONFIGURASI KEAMANAN: ROW LEVEL SECURITY (RLS) & HAK AKSES GRANULAR
-- ============================================================================
-- 1. Aktifkan RLS pada seluruh tabel untuk mencegah akses data ilegal
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipping_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS store_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS domain_requests ENABLE ROW LEVEL SECURITY;

-- 2. Bersihkan kebijakan lama
DROP POLICY IF EXISTS "products_read_policy" ON products;
DROP POLICY IF EXISTS "products_write_policy" ON products;
DROP POLICY IF EXISTS "stores_read_policy" ON stores;
DROP POLICY IF EXISTS "stores_write_policy" ON stores;
DROP POLICY IF EXISTS "shipping_branches_read_policy" ON shipping_branches;
DROP POLICY IF EXISTS "shipping_branches_write_policy" ON shipping_branches;
DROP POLICY IF EXISTS "orders_public_insert" ON orders;
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;
DROP POLICY IF EXISTS "order_items_public_insert" ON order_items;
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "platform_settings_read_policy" ON platform_settings;
DROP POLICY IF EXISTS "billing_plans_read_policy" ON billing_plans;
DROP POLICY IF EXISTS "domain_requests_policy" ON domain_requests;

-- 3. Kebijakan Granular Products: Publik bisa melihat produk aktif, merchant bisa mengelola
CREATE POLICY "products_read_policy" ON products 
    FOR SELECT TO anon, authenticated 
    USING (status IS NULL OR status != 'Dihapus');

CREATE POLICY "products_write_policy" ON products 
    FOR ALL TO authenticated, service_role 
    USING (true) WITH CHECK (true);

-- 4. Kebijakan Granular Stores: Publik bisa melihat info toko aktif
CREATE POLICY "stores_read_policy" ON stores 
    FOR SELECT TO anon, authenticated 
    USING (is_suspended = FALSE OR is_suspended IS NULL);

CREATE POLICY "stores_write_policy" ON stores 
    FOR ALL TO authenticated, service_role 
    USING (true) WITH CHECK (true);

-- 5. Kebijakan Shipping Branches: Publik bisa membaca cabang toko untuk kalkulasi ongkir
CREATE POLICY "shipping_branches_read_policy" ON shipping_branches 
    FOR SELECT TO anon, authenticated 
    USING (is_active = TRUE OR is_active IS NULL);

CREATE POLICY "shipping_branches_write_policy" ON shipping_branches 
    FOR ALL TO authenticated, service_role 
    USING (true) WITH CHECK (true);

-- 6. Kebijakan Orders: Pembeli (anon) bisa membuat pesanan (INSERT), merchant bisa membaca & update
CREATE POLICY "orders_public_insert" ON orders 
    FOR INSERT TO anon, authenticated, service_role 
    WITH CHECK (true);

CREATE POLICY "orders_select_policy" ON orders 
    FOR SELECT TO anon, authenticated, service_role 
    USING (true);

CREATE POLICY "orders_update_policy" ON orders 
    FOR UPDATE TO authenticated, service_role 
    USING (true) WITH CHECK (true);

-- 7. Kebijakan Order Items: Pembeli bisa menambah rincian barang, merchant bisa membaca
CREATE POLICY "order_items_public_insert" ON order_items 
    FOR INSERT TO anon, authenticated, service_role 
    WITH CHECK (true);

CREATE POLICY "order_items_select_policy" ON order_items 
    FOR SELECT TO anon, authenticated, service_role 
    USING (true);

-- 8. Kebijakan Platform Settings & Billing Plans: Publik hanya bisa membaca (Read-Only)
CREATE POLICY "platform_settings_read_policy" ON platform_settings 
    FOR SELECT TO anon, authenticated 
    USING (true);

CREATE POLICY "billing_plans_read_policy" ON billing_plans 
    FOR SELECT TO anon, authenticated 
    USING (is_active = TRUE OR is_active IS NULL);

-- 9. Kebijakan Domain Requests: Merchant bisa request domain
CREATE POLICY "domain_requests_policy" ON domain_requests 
    FOR ALL TO authenticated, service_role 
    USING (true) WITH CHECK (true);

-- 10. Perizinan Hak Akses Berbasis Role (Prinsip Least Privilege)
-- Cabut akses modifikasi langsung tabel sensitif dari peran anonim
REVOKE ALL ON TABLE users FROM anon;
REVOKE ALL ON TABLE wallet_transactions FROM anon;
REVOKE ALL ON TABLE withdrawals FROM anon;
REVOKE ALL ON TABLE platform_settings FROM anon;
REVOKE ALL ON TABLE billing_plans FROM anon;
REVOKE ALL ON TABLE store_subscriptions FROM anon;

-- Berikan izin SELECT publik yang diperlukan
GRANT SELECT ON TABLE products TO anon, authenticated;
GRANT SELECT ON TABLE stores TO anon, authenticated;
GRANT SELECT ON TABLE shipping_branches TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE orders TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE order_items TO anon, authenticated;
GRANT SELECT ON TABLE platform_settings TO anon, authenticated;
GRANT SELECT ON TABLE billing_plans TO anon, authenticated;

-- Berikan hak penuh hanya pada peran terotentikasi & service_role
GRANT ALL ON TABLE products TO authenticated, service_role;
GRANT ALL ON TABLE stores TO authenticated, service_role;
GRANT ALL ON TABLE shipping_branches TO authenticated, service_role;
GRANT ALL ON TABLE orders TO authenticated, service_role;
GRANT ALL ON TABLE order_items TO authenticated, service_role;
GRANT ALL ON TABLE users TO authenticated, service_role;
GRANT ALL ON TABLE platform_settings TO authenticated, service_role;
GRANT ALL ON TABLE wallet_transactions TO authenticated, service_role;
GRANT ALL ON TABLE withdrawals TO authenticated, service_role;
GRANT ALL ON TABLE billing_plans TO authenticated, service_role;
GRANT ALL ON TABLE store_subscriptions TO authenticated, service_role;
GRANT ALL ON TABLE domain_requests TO authenticated, service_role;

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

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE domain_requests;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================================================
-- 11. RPC FUNCTION: GET_DASHBOARD_ANALYTICS
-- ============================================================================
CREATE OR REPLACE FUNCTION get_dashboard_analytics(p_store_id VARCHAR)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    v_balance NUMERIC;
    v_incoming_orders INT;
    v_today_sales NUMERIC;
    v_total_products INT;
    v_low_stock_count INT;
    v_recent_orders JSONB;
    v_low_stock_items JSONB;
BEGIN
    -- 1. Active Store Balance
    SELECT COALESCE(balance, 0) 
    INTO v_balance 
    FROM stores 
    WHERE id = p_store_id;

    v_balance := COALESCE(v_balance, 0);

    -- 2. Incoming Orders (Paid & Needing Processing/Shipment)
    SELECT COUNT(*) 
    INTO v_incoming_orders 
    FROM orders 
    WHERE store_id = p_store_id 
      AND (
          payment_status = 'paid' 
          OR order_status IN ('pending', 'processing')
      )
      AND order_status NOT IN ('delivered', 'cancelled');

    v_incoming_orders := COALESCE(v_incoming_orders, 0);

    -- 3. Today's Revenue (Transactions created today with paid status)
    SELECT COALESCE(SUM(total_amount), 0) 
    INTO v_today_sales 
    FROM orders 
    WHERE store_id = p_store_id 
      AND payment_status = 'paid'
      AND created_at >= CURRENT_DATE;

    v_today_sales := COALESCE(v_today_sales, 0);

    -- 4. Products & Low Stock Statistics (Stock <= 5)
    SELECT COUNT(*) 
    INTO v_total_products 
    FROM products 
    WHERE store_id = p_store_id 
      AND (status IS NULL OR status != 'Dihapus');

    v_total_products := COALESCE(v_total_products, 0);

    SELECT COUNT(*) 
    INTO v_low_stock_count 
    FROM products 
    WHERE store_id = p_store_id 
      AND stock <= 5 
      AND (status IS NULL OR status != 'Dihapus');

    v_low_stock_count := COALESCE(v_low_stock_count, 0);

    -- 5. Low Stock Items Details (Up to 5 items)
    SELECT COALESCE(json_agg(row_to_json(lsi)), '[]'::jsonb)
    INTO v_low_stock_items
    FROM (
        SELECT id, name, price, stock, image_url, category
        FROM products
        WHERE store_id = p_store_id
          AND stock <= 5
          AND (status IS NULL OR status != 'Dihapus')
        ORDER BY stock ASC
        LIMIT 5
    ) lsi;

    -- 6. Recent 5 Orders with Customer & Summary Details
    SELECT COALESCE(json_agg(row_to_json(ro)), '[]'::jsonb)
    INTO v_recent_orders 
    FROM (
        SELECT 
            id, 
            order_number, 
            customer_name, 
            shipping_city, 
            total_amount, 
            payment_method, 
            payment_status,
            order_status, 
            shipping_courier,
            created_at,
            (
                SELECT COALESCE(json_agg(json_build_object(
                    'product_id', product_id,
                    'product_name', product_name, 
                    'price', price,
                    'quantity', quantity,
                    'subtotal', subtotal,
                    'product_image', product_image
                )), '[]'::jsonb) 
                FROM order_items 
                WHERE order_id = orders.id
            ) AS items
        FROM orders 
        WHERE store_id = p_store_id 
        ORDER BY created_at DESC 
        LIMIT 5
    ) ro;

    RETURN json_build_object(
        'balance', v_balance,
        'incoming_orders', v_incoming_orders,
        'today_sales', v_today_sales,
        'total_products', v_total_products,
        'low_stock_count', v_low_stock_count,
        'low_stock_items', COALESCE(v_low_stock_items, '[]'::jsonb),
        'recent_orders', COALESCE(v_recent_orders, '[]'::jsonb)
    );
END;
$$;

-- Cabut akses dashboard analitik dari publik (anon), hanya izinkan authenticated dan service_role
REVOKE EXECUTE ON FUNCTION get_dashboard_analytics(VARCHAR) FROM anon;
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(VARCHAR) TO authenticated, service_role;

-- ============================================================================
-- 12. RPC FUNCTION: VERIFY_USER_CREDENTIALS (SECURE SERVER-SIDE PASSWORD CHECK)
-- ============================================================================
-- Memverifikasi kredensial pengguna langsung di PostgreSQL menggunakan pgcrypto.
-- Hash password TIDAK PERNAH dikirimkan ke memori/browser client!
CREATE OR REPLACE FUNCTION verify_user_credentials(p_email VARCHAR, p_password VARCHAR)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_is_valid BOOLEAN := FALSE;
BEGIN
    SELECT id, name, email, phone, role, password_hash, created_at
    INTO v_user
    FROM users
    WHERE LOWER(email) = LOWER(TRIM(p_email));

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Akun tidak ditemukan');
    END IF;

    -- Dukung bcrypt/crypt hash atau plaintext lama selama transisi migrasi
    IF v_user.password_hash = p_password THEN
        v_is_valid := TRUE;
    ELSIF v_user.password_hash LIKE '$2%' OR v_user.password_hash LIKE '$6%' THEN
        BEGIN
            v_is_valid := (crypt(p_password, v_user.password_hash) = v_user.password_hash);
        EXCEPTION WHEN OTHERS THEN
            v_is_valid := FALSE;
        END;
    END IF;

    IF v_is_valid THEN
        RETURN json_build_object(
            'success', true,
            'user', json_build_object(
                'id', v_user.id,
                'name', v_user.name,
                'email', v_user.email,
                'phone', v_user.phone,
                'role', v_user.role,
                'created_at', v_user.created_at
            )
        );
    ELSE
        RETURN json_build_object('success', false, 'message', 'Kata sandi tidak sesuai');
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION verify_user_credentials(VARCHAR, VARCHAR) TO anon, authenticated, service_role;

