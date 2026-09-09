-- ============================================================================
-- KROOMBOX (MICRO CMS) - SUPABASE / POSTGRESQL RELATIONAL DATABASE SCHEMA
-- ============================================================================
-- Kompatibel dengan Supabase Database & PostgreSQL 13+
-- Dilengkapi Foreign Key Constraints, Indexes, Cascading Deletes, dan Default Timestamp
-- Jalankan file ini di Supabase SQL Editor jika ingin sinkronisasi tabel cloud
-- ============================================================================

-- Ekstensi UUID & pgcrypto (opsional jika menggunakan uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
-- 3. TABEL: PRODUCTS (KATALOG PRODUK TOKO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'prd_' || replace(gen_random_uuid()::text, '-', ''),
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    price BIGINT NOT NULL CHECK (price >= 0),
    original_price BIGINT CHECK (original_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(128) DEFAULT 'Umum',
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif', 'Draft')),
    sku VARCHAR(64),
    weight_grams INTEGER DEFAULT 500,
    variants JSONB DEFAULT '[]'::jsonb,
    dimensions JSONB DEFAULT '{"length": 10, "width": 10, "height": 10}'::jsonb,
    seo_title VARCHAR(255),
    seo_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ============================================================================
-- 4. TABEL: ORDERS (PESANAN PEMBELI)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'ord_' || replace(gen_random_uuid()::text, '-', ''),
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT NOT NULL,
    customer_city VARCHAR(128) NOT NULL,
    customer_province VARCHAR(128),
    customer_district VARCHAR(128),
    customer_postal_code VARCHAR(16),
    subtotal BIGINT NOT NULL DEFAULT 0,
    shipping_cost BIGINT NOT NULL DEFAULT 0,
    discount BIGINT NOT NULL DEFAULT 0,
    grand_total BIGINT NOT NULL DEFAULT 0,
    payment_method VARCHAR(64) NOT NULL DEFAULT 'QRIS',
    payment_status VARCHAR(64) NOT NULL DEFAULT 'Belum Dibayar' CHECK (payment_status IN ('Sudah Dibayar', 'Belum Dibayar', 'Gagal')),
    courier VARCHAR(64) NOT NULL DEFAULT 'J&T',
    courier_service VARCHAR(128),
    resi_number VARCHAR(128),
    shipping_status VARCHAR(64) NOT NULL DEFAULT 'Baru' CHECK (shipping_status IN ('Baru', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_status ON orders(shipping_status);

-- ============================================================================
-- 5. TABEL: ORDER_ITEMS (RINCIAN BARANG PESANAN)
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY DEFAULT 'itm_' || replace(gen_random_uuid()::text, '-', ''),
    order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    price BIGINT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal BIGINT NOT NULL,
    variant_name VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ============================================================================
-- 6. TABEL: WITHDRAWALS (PENCAIRAN DANA MERCHANT KE BANK)
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
-- 7. TABEL: WALLET_TRANSACTIONS (MUTASI DOMPET TOKO)
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
-- 8. TABEL: PLATFORM_SETTINGS (KONFIGURASI MASTER ADMIN & API KEYS)
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
-- DATA AWAL (SEED DATA DEFAULT)
-- ============================================================================
INSERT INTO platform_settings (id) VALUES ('global_config') ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, password_hash, name, phone, role) VALUES
('usr-admin-1', 'admin@kroombox.id', 'admin123', 'Super Admin Kroombox', '081289201928', 'admin'),
('usr-andhika-1', 'andhika@gmail.com', 'password123', 'Andhika Pratama', '081298765432', 'merchant')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stores (id, user_id, name, slug, tagline, description, logo_url, banner_url, phone_whatsapp, city, province, address, category, plan, balance) VALUES
('store-andhika', 'usr-andhika-1', 'Toko Batik Nusantara', 'batik-nusantara', 'Koleksi Batik Tulis & Cap Asli Indonesia', 'Pusat belanja batik tulis dan cap warisan nusantara berkualitas tinggi.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=80', '6281298765432', 'Jakarta Selatan', 'DKI Jakarta', 'Jl. Kemang Raya No. 42', 'Fashion & Pakaian', 'starter', 1450000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, store_id, name, slug, description, price, original_price, stock, category, image_url, status, weight_grams, is_featured) VALUES
('prd-andhika-1', 'store-andhika', 'Kemeja Batik Tulis Sutra Parang', 'kemeja-batik-tulis-sutra-parang', 'Kemeja batik tulis halus motif parang dengan furing premium lembut.', 450000, 520000, 24, 'Kemeja', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 'Aktif', 500, true),
('prd-andhika-2', 'store-andhika', 'Kain Batik Cap Kawung Indigo', 'kain-batik-cap-kawung-indigo', 'Kain katun prima halus pewarnaan alami indigo cocok untuk kebaya dan kemeja.', 185000, 210000, 40, 'Kain Batik', 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&auto=format&fit=crop&q=80', 'Aktif', 400, true),
('prd-andhika-3', 'store-andhika', 'Dress Batik Modern Flora', 'dress-batik-modern-flora', 'Dress batik wanita siluet A-line elegan untuk pesta dan kasual.', 320000, 360000, 18, 'Dress & Wanita', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80', 'Aktif', 600, false)
ON CONFLICT (id) DO NOTHING;
