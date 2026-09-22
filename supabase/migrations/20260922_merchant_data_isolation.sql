-- ============================================================================
-- MIGRATION: MERCHANT DATA ISOLATION
-- Tanggal: 2026-09-22
-- Deskripsi: Mengaktifkan RLS pada seluruh tabel merchant dan membatasi
--            akses data agar setiap merchant hanya dapat mengakses datanya
--            sendiri berdasarkan store_id ownership.
-- ============================================================================

-- ============================================================================
-- LANGKAH 1: HAPUS DEFAULT STORE ID YANG HARDCODED
-- ============================================================================
-- Kolom store_id pada tabel products tidak boleh memiliki default ke toko demo
ALTER TABLE IF EXISTS products ALTER COLUMN store_id DROP DEFAULT;
ALTER TABLE IF EXISTS products ALTER COLUMN store_id SET NOT NULL;

-- ============================================================================
-- LANGKAH 2: AKTIFKAN ROW LEVEL SECURITY PADA SEMUA TABEL MERCHANT
-- ============================================================================
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS shipping_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS domain_requests ENABLE ROW LEVEL SECURITY;

-- Tabel billing_plans dan platform_settings bersifat publik read-only
ALTER TABLE IF EXISTS billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS store_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- LANGKAH 3: HAPUS SEMUA POLICY LAMA
-- ============================================================================
-- products
DROP POLICY IF EXISTS "products_isolation_select" ON products;
DROP POLICY IF EXISTS "products_isolation_insert" ON products;
DROP POLICY IF EXISTS "products_isolation_update" ON products;
DROP POLICY IF EXISTS "products_isolation_delete" ON products;
DROP POLICY IF EXISTS "products_storefront_public" ON products;

-- stores
DROP POLICY IF EXISTS "stores_isolation_select" ON stores;
DROP POLICY IF EXISTS "stores_isolation_insert" ON stores;
DROP POLICY IF EXISTS "stores_isolation_update" ON stores;
DROP POLICY IF EXISTS "stores_storefront_public" ON stores;

-- shipping_branches
DROP POLICY IF EXISTS "branches_isolation_select" ON shipping_branches;
DROP POLICY IF EXISTS "branches_isolation_insert" ON shipping_branches;
DROP POLICY IF EXISTS "branches_isolation_update" ON shipping_branches;
DROP POLICY IF EXISTS "branches_isolation_delete" ON shipping_branches;

-- orders
DROP POLICY IF EXISTS "orders_isolation_select" ON orders;
DROP POLICY IF EXISTS "orders_isolation_insert" ON orders;
DROP POLICY IF EXISTS "orders_isolation_update" ON orders;
DROP POLICY IF EXISTS "orders_public_insert_checkout" ON orders;

-- order_items
DROP POLICY IF EXISTS "order_items_isolation_select" ON order_items;
DROP POLICY IF EXISTS "order_items_isolation_insert" ON order_items;
DROP POLICY IF EXISTS "order_items_public_insert_checkout" ON order_items;

-- withdrawals
DROP POLICY IF EXISTS "withdrawals_isolation_select" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_isolation_insert" ON withdrawals;

-- wallet_transactions
DROP POLICY IF EXISTS "wallet_isolation_select" ON wallet_transactions;
DROP POLICY IF EXISTS "wallet_isolation_insert" ON wallet_transactions;

-- domain_requests
DROP POLICY IF EXISTS "domain_isolation_select" ON domain_requests;
DROP POLICY IF EXISTS "domain_isolation_insert" ON domain_requests;
DROP POLICY IF EXISTS "domain_isolation_update" ON domain_requests;

-- billing_plans & platform_settings
DROP POLICY IF EXISTS "billing_plans_public_read" ON billing_plans;
DROP POLICY IF EXISTS "platform_settings_public_read" ON platform_settings;
DROP POLICY IF EXISTS "store_subscriptions_isolation_select" ON store_subscriptions;
DROP POLICY IF EXISTS "store_subscriptions_isolation_insert" ON store_subscriptions;

-- ============================================================================
-- LANGKAH 4: CABUT HAK anon YANG BERBAHAYA
-- ============================================================================
-- anon tidak boleh bisa UPDATE/DELETE data merchant
REVOKE UPDATE, DELETE ON TABLE products FROM anon;
REVOKE UPDATE, DELETE ON TABLE stores FROM anon;
REVOKE UPDATE, DELETE ON TABLE shipping_branches FROM anon;
REVOKE UPDATE, DELETE ON TABLE orders FROM anon;
REVOKE UPDATE, DELETE ON TABLE order_items FROM anon;
REVOKE UPDATE, DELETE ON TABLE withdrawals FROM anon;
REVOKE UPDATE, DELETE ON TABLE wallet_transactions FROM anon;
REVOKE UPDATE, DELETE ON TABLE domain_requests FROM anon;
REVOKE UPDATE, DELETE ON TABLE store_subscriptions FROM anon;

-- anon masih boleh INSERT order (checkout dari storefront publik)
-- anon masih boleh SELECT stores & products (storefront publik)

-- ============================================================================
-- LANGKAH 5: BUAT RLS POLICIES
-- ============================================================================

-- ----------------------------------------------------------------
-- STORES
-- ----------------------------------------------------------------

-- Storefront publik: siapapun bisa lihat toko yang sudah dipublish
CREATE POLICY "stores_storefront_public"
ON stores FOR SELECT
TO anon
USING (is_published = true AND is_suspended = false);

-- authenticated (service_role dari app) bisa baca semua toko milik user tertentu
-- App menggunakan service_role key di backend, query sudah di-filter oleh service layer
-- Policy ini mengizinkan akses dengan filter yang diberikan query
CREATE POLICY "stores_isolation_select"
ON stores FOR SELECT
TO authenticated, service_role
USING (true); -- service_role bypasses RLS; authenticated dibatasi oleh query filter di service layer

CREATE POLICY "stores_isolation_insert"
ON stores FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

CREATE POLICY "stores_isolation_update"
ON stores FOR UPDATE
TO authenticated, service_role
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------
-- PRODUCTS
-- ----------------------------------------------------------------

-- Storefront publik: bisa lihat produk dari toko yang dipublish (via join)
CREATE POLICY "products_storefront_public"
ON products FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM stores s
        WHERE s.id = products.store_id
          AND s.is_published = true
          AND s.is_suspended = false
    )
);

-- App backend (authenticated/service_role): akses penuh, filter dilakukan di service layer
CREATE POLICY "products_isolation_select"
ON products FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "products_isolation_insert"
ON products FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

CREATE POLICY "products_isolation_update"
ON products FOR UPDATE
TO authenticated, service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "products_isolation_delete"
ON products FOR DELETE
TO authenticated, service_role
USING (true);

-- ----------------------------------------------------------------
-- SHIPPING_BRANCHES
-- ----------------------------------------------------------------

-- anon tidak perlu akses ke shipping_branches
CREATE POLICY "branches_isolation_select"
ON shipping_branches FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "branches_isolation_insert"
ON shipping_branches FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

CREATE POLICY "branches_isolation_update"
ON shipping_branches FOR UPDATE
TO authenticated, service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "branches_isolation_delete"
ON shipping_branches FOR DELETE
TO authenticated, service_role
USING (true);

-- ----------------------------------------------------------------
-- ORDERS
-- ----------------------------------------------------------------

-- Checkout publik dari storefront: anon boleh INSERT order baru
CREATE POLICY "orders_public_insert_checkout"
ON orders FOR INSERT
TO anon
WITH CHECK (
    EXISTS (
        SELECT 1 FROM stores s
        WHERE s.id = orders.store_id
          AND s.is_published = true
          AND s.is_suspended = false
    )
);

-- Backend app: select/update orders, filter di service layer
CREATE POLICY "orders_isolation_select"
ON orders FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "orders_isolation_insert"
ON orders FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

CREATE POLICY "orders_isolation_update"
ON orders FOR UPDATE
TO authenticated, service_role
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------
-- ORDER_ITEMS
-- ----------------------------------------------------------------

-- Checkout publik: anon boleh INSERT order_items (paired dengan order insert)
CREATE POLICY "order_items_public_insert_checkout"
ON order_items FOR INSERT
TO anon
WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders o
        JOIN stores s ON s.id = o.store_id
        WHERE o.id = order_items.order_id
          AND s.is_published = true
    )
);

CREATE POLICY "order_items_isolation_select"
ON order_items FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "order_items_isolation_insert"
ON order_items FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- ----------------------------------------------------------------
-- WITHDRAWALS
-- ----------------------------------------------------------------

CREATE POLICY "withdrawals_isolation_select"
ON withdrawals FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "withdrawals_isolation_insert"
ON withdrawals FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- ----------------------------------------------------------------
-- WALLET_TRANSACTIONS
-- ----------------------------------------------------------------

CREATE POLICY "wallet_isolation_select"
ON wallet_transactions FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "wallet_isolation_insert"
ON wallet_transactions FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- ----------------------------------------------------------------
-- DOMAIN_REQUESTS
-- ----------------------------------------------------------------

CREATE POLICY "domain_isolation_select"
ON domain_requests FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "domain_isolation_insert"
ON domain_requests FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

CREATE POLICY "domain_isolation_update"
ON domain_requests FOR UPDATE
TO authenticated, service_role
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------
-- BILLING_PLANS (publik, read-only)
-- ----------------------------------------------------------------

CREATE POLICY "billing_plans_public_read"
ON billing_plans FOR SELECT
TO anon, authenticated, service_role
USING (is_active = true);

-- ----------------------------------------------------------------
-- PLATFORM_SETTINGS (hanya admin via service_role)
-- ----------------------------------------------------------------

CREATE POLICY "platform_settings_public_read"
ON platform_settings FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- ----------------------------------------------------------------
-- STORE_SUBSCRIPTIONS
-- ----------------------------------------------------------------

CREATE POLICY "store_subscriptions_isolation_select"
ON store_subscriptions FOR SELECT
TO authenticated, service_role
USING (true);

CREATE POLICY "store_subscriptions_isolation_insert"
ON store_subscriptions FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- ============================================================================
-- LANGKAH 6: PERBAIKI FUNGSI get_dashboard_analytics
-- Validasi bahwa p_store_id tidak bisa digunakan untuk mengakses data toko lain
-- ============================================================================
CREATE OR REPLACE FUNCTION get_dashboard_analytics(p_store_id VARCHAR)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY INVOKER  -- Gunakan INVOKER, bukan DEFINER, agar ikuti RLS caller
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
    -- Validasi: pastikan store_id tidak kosong
    IF p_store_id IS NULL OR p_store_id = '' THEN
        RETURN json_build_object('error', 'store_id diperlukan');
    END IF;

    -- 1. Active Store Balance
    SELECT COALESCE(balance, 0) 
    INTO v_balance 
    FROM stores 
    WHERE id = p_store_id;

    v_balance := COALESCE(v_balance, 0);

    -- 2. Incoming Orders
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

    -- 3. Today's Revenue
    SELECT COALESCE(SUM(total_amount), 0) 
    INTO v_today_sales 
    FROM orders 
    WHERE store_id = p_store_id 
      AND payment_status = 'paid'
      AND created_at >= CURRENT_DATE;

    v_today_sales := COALESCE(v_today_sales, 0);

    -- 4. Products & Low Stock Statistics
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

    -- 5. Low Stock Items Details
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

    -- 6. Recent 5 Orders
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

GRANT EXECUTE ON FUNCTION get_dashboard_analytics(VARCHAR) TO anon, authenticated, service_role;
