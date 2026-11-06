-- ============================================================================
-- MIGRATION: STANDARDIZE ID SEQUENCES (PREFIX + ANGKA URUT TANPA KARAKTER TAMBAHAN)
-- Format: Awalan singkatan tabel 3 huruf kapital + angka urut 3 digit/lebih (contoh: USR001, STR001, PRD001, TKT001, COM001)
-- ============================================================================

-- 1. Sequence untuk support_tickets dan communities
CREATE SEQUENCE IF NOT EXISTS seq_support_tickets_id;
CREATE SEQUENCE IF NOT EXISTS seq_communities_id;

-- 2. Perbarui fungsi get_next_id untuk mendukung support_tickets dan communities
CREATE OR REPLACE FUNCTION public.get_next_id(p_table text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_id text;
BEGIN
  CASE lower(trim(p_table))
    WHEN 'users' THEN v_id := format_prefixed_id('USR', nextval('seq_users_id'));
    WHEN 'stores' THEN v_id := format_prefixed_id('STR', nextval('seq_stores_id'));
    WHEN 'products' THEN v_id := format_prefixed_id('PRD', nextval('seq_products_id'));
    WHEN 'orders' THEN v_id := format_prefixed_id('ORD', nextval('seq_orders_id'));
    WHEN 'order_items' THEN v_id := format_prefixed_id('OIT', nextval('seq_order_items_id'));
    WHEN 'templates' THEN v_id := format_prefixed_id('TPL', nextval('seq_templates_id'));
    WHEN 'layouts' THEN v_id := format_prefixed_id('LYT', nextval('seq_layouts_id'));
    WHEN 'sections' THEN v_id := format_prefixed_id('SEC', nextval('seq_sections_id'));
    WHEN 'categories' THEN v_id := format_prefixed_id('CAT', nextval('seq_categories_id'));
    WHEN 'domain_requests' THEN v_id := format_prefixed_id('DMR', nextval('seq_domain_requests_id'));
    WHEN 'store_subscriptions' THEN v_id := format_prefixed_id('SUB', nextval('seq_store_subscriptions_id'));
    WHEN 'billing_plans' THEN v_id := format_prefixed_id('PLN', nextval('seq_billing_plans_id'));
    WHEN 'wallet_transactions' THEN v_id := format_prefixed_id('WLT', nextval('seq_wallet_transactions_id'));
    WHEN 'withdrawals' THEN v_id := format_prefixed_id('WDR', nextval('seq_withdrawals_id'));
    WHEN 'shipping_branches' THEN v_id := format_prefixed_id('SHP', nextval('seq_shipping_branches_id'));
    WHEN 'platform_settings' THEN v_id := format_prefixed_id('SET', nextval('seq_platform_settings_id'));
    WHEN 'support_tickets' THEN v_id := format_prefixed_id('TKT', nextval('seq_support_tickets_id'));
    WHEN 'communities' THEN v_id := format_prefixed_id('COM', nextval('seq_communities_id'));
    ELSE RAISE EXCEPTION 'Unknown table: %', p_table;
  END CASE;
  RETURN v_id;
END;
$function$;

-- 3. Set nilai default ID tabel support_tickets ke format TKT001
ALTER TABLE support_tickets ALTER COLUMN id SET DEFAULT format_prefixed_id('TKT', nextval('seq_support_tickets_id'));

-- 4. Muat ulang cache schema PostgREST Supabase
NOTIFY pgrst, 'reload schema';

