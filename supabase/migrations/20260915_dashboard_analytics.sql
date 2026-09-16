-- ============================================================================
-- MIGRATION: DASHBOARD ANALYTICS RPC & STARTER PRODUCTS
-- ============================================================================

-- 1. Create or Replace RPC function get_dashboard_analytics
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

    -- Fallback to 0 if store not found
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_dashboard_analytics(VARCHAR) TO anon, authenticated, service_role;

-- 2. Seed Default Products for store-andhika if not exists
INSERT INTO products (
    id, store_id, name, slug, description, price, stock, category, image_url, status
) VALUES 
(
    'prod-andhika-101', 
    'store-andhika', 
    'Kemeja Batik Tulis Modern Heritage Lengan Panjang', 
    'kemeja-batik-tulis-modern-heritage', 
    'Batik tulis handmade motif kontemporer dengan bahan katun primissima yang halus, sejuk, dan elegan untuk acara formal maupun santai.', 
    185000, 
    2, -- Low stock (< 5)
    'Fashion Pria', 
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80', 
    'Hampir Habis'
),
(
    'prod-andhika-102', 
    'store-andhika', 
    'Arabika Single Origin Gayo Winey Roast 250g', 
    'arabika-single-origin-gayo-winey-roast', 
    'Biji kopi pilihan dari dataran tinggi Gayo Aceh dengan proses wine fermentation menghasilkan aroma fruity yang kompleks dan acidity yang seimbang.', 
    98000, 
    24, 
    'Kopi & Minuman', 
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80', 
    'Tersedia'
),
(
    'prod-andhika-103', 
    'store-andhika', 
    'Dompet Kulit Sapi Asli Garut Minimalis', 
    'dompet-kulit-sapi-asli-garut', 
    'Dibuat dari 100% genuine pull-up leather Garut dengan jahitan tangan presisi, awet bertahun-tahun dengan patina yang semakin menawan.', 
    145000, 
    4, -- Low stock (< 5)
    'Kerajinan Kulit', 
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80', 
    'Hampir Habis'
),
(
    'prod-andhika-104', 
    'store-andhika', 
    'Bakpia Kukus Premium Cokelat Keju Isi 10', 
    'bakpia-kukus-premium-cokelat-keju', 
    'Oleh-oleh khas Yogyakarta dengan tekstur kue super lembut dan isian cokelat lumer berpadu keju gurih yang melimpah.', 
    48000, 
    40, 
    'Kuliner & Camilan', 
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80', 
    'Tersedia'
),
(
    'prod-andhika-105', 
    'store-andhika', 
    'Tas Totebag Tenun Lurik Tradisional Yogyakarta', 
    'tas-totebag-tenun-lurik-tradisional', 
    'Tas jinjing etnik ramah lingkungan dibuat dari kain tenun lurik ATBM asli dengan kompartemen luas untuk laptop dan belanjaan.', 
    125000, 
    3, -- Low stock (< 5)
    'Aksesoris & Kriya', 
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80', 
    'Hampir Habis'
)
ON CONFLICT (id) DO UPDATE SET
    stock = EXCLUDED.stock,
    price = EXCLUDED.price,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url;
