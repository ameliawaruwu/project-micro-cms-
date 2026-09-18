import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'id' | 'en';

export interface Translations {
  [key: string]: {
    id: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation & Menu
  nav_dashboard: { id: 'Beranda', en: 'Dashboard' },
  nav_products: { id: 'Produk', en: 'Products' },
  nav_orders: { id: 'Pesanan', en: 'Orders' },
  nav_layout: { id: 'Layout Toko', en: 'Store Layout' },
  nav_payments_shipping: { id: 'Pembayaran & Pengiriman', en: 'Payment & Shipping' },
  nav_payment: { id: 'Pembayaran', en: 'Payment' },
  nav_shipping: { id: 'Pengiriman', en: 'Shipping' },
  nav_billing: { id: 'Paket Langganan', en: 'Billing Plan' },
  nav_template_website: { id: 'Template Website', en: 'Website Templates' },
  nav_settings: { id: 'Pengaturan Toko', en: 'Store Settings' },
  integrations_title: { id: 'Integrasi', en: 'Integrations' },
  payment_title: { id: 'Pembayaran', en: 'Payment' },
  nav_logout: { id: 'Keluar', en: 'Logout' },
  nav_view_store: { id: 'Lihat Toko', en: 'View Store' },
  nav_store_active: { id: 'Toko Online Aktif', en: 'Store Online' },
  nav_switch_lang: { id: 'Ganti Bahasa', en: 'Switch Language' },

  // TopBar & User
  store_owner: { id: 'Pemilik Toko', en: 'Store Owner' },
  account_role: { id: 'Peran Akun:', en: 'Account Role:' },
  account_status: { id: 'Status Akun:', en: 'Account Status:' },
  verified: { id: 'Terverifikasi', en: 'Verified' },
  open_menu: { id: 'Buka Menu', en: 'Open Menu' },

  // Dashboard
  dashboard_title: { id: 'Beranda', en: 'Dashboard' },
  live_store_active: { id: 'Toko Online Aktif', en: 'Online Store Active' },
  auto_update: { id: 'Auto Update', en: 'Auto Update' },
  wallet_active_balance: { id: 'Saldo Toko Aktif (Siap Ditarik)', en: 'Active Store Balance (Ready to Withdraw)' },
  wallet_and_withdraw: { id: 'Dompet & Tarik Dana', en: 'Wallet & Withdraw' },
  stat_incoming_orders: { id: 'Pesanan Masuk', en: 'Incoming Orders' },
  stat_today_sales: { id: 'Penjualan Hari Ini', en: 'Today\'s Sales' },
  stat_total_products: { id: 'Total Produk', en: 'Total Products' },
  stat_low_stock: { id: 'Stok Menipis', en: 'Low Stock Alert' },
  stat_orders_helper: { id: 'Segera kemas & kirimkan resi', en: 'Pack & ship tracking number' },
  stat_sales_helper: { id: 'Total omset transaksi sukses', en: 'Total completed transaction revenue' },
  stat_products_helper: { id: 'Barang aktif di etalase', en: 'Active items in storefront' },
  stat_stock_alert_helper: { id: 'Segera lakukan restock barang', en: 'Restock items soon' },
  stat_stock_safe_helper: { id: 'Semua stok produk aman', en: 'All product stock is safe' },
  unit_orders: { id: 'Pesanan', en: 'Orders' },
  unit_products: { id: 'Produk', en: 'Products' },
  unit_transactions: { id: 'Transaksi', en: 'Transactions' },
  sales_summary: { id: 'Ringkasan Penjualan', en: 'Sales Summary' },
  realtime_data: { id: 'Data Real-time', en: 'Real-time Data' },
  recent_orders: { id: 'Pesanan Terbaru', en: 'Recent Orders' },
  view_all: { id: 'Lihat Semua', en: 'View All' },
  period_today: { id: 'Hari Ini', en: 'Today' },
  period_7days: { id: '7 Hari', en: '7 Days' },
  period_30days: { id: '30 Hari', en: '30 Days' },
  period_this_year: { id: 'Tahun Ini', en: 'This Year' },
  period_prefix: { id: 'Periode:', en: 'Period:' },
  total_turnover: { id: 'Total Omset', en: 'Total Revenue' },
  total_successful_orders: { id: 'Total Pesanan Sukses', en: 'Total Completed Orders' },
  aov_label: { id: 'Rata-rata Nilai Order (AOV)', en: 'Average Order Value (AOV)' },
  chart_revenue_title: { id: 'Grafik Omset Transaksi', en: 'Transaction Revenue Chart' },
  sales_activity: { id: 'Aktivitas Penjualan', en: 'Sales Activity' },
  sales_nominal: { id: 'Nominal Penjualan', en: 'Sales Revenue' },
  successful_orders: { id: 'pesanan sukses', en: 'completed orders' },
  select_sales_period: { id: 'Pilih Periode Penjualan', en: 'Select Sales Period' },
  no_orders_yet: { id: 'Belum ada pesanan masuk', en: 'No incoming orders yet' },
  no_orders_today: { id: 'Belum ada pesanan masuk hari ini.', en: 'No incoming orders today.' },
  all_stock_safe: { id: 'Semua stok produk aman', en: 'All product stock is safe' },
  no_stock_below_5: { id: 'Tidak ada produk dengan stok di bawah 5', en: 'No products with stock below 5' },
  stock_remaining: { id: 'Sisa', en: 'Left' },
  manage_stock_restock: { id: 'Kelola Stok & Restock', en: 'Manage Stock & Restock' },
  table_order_no: { id: 'No. Pesanan', en: 'Order No.' },
  table_customer: { id: 'Pembeli', en: 'Customer' },
  table_product: { id: 'Produk', en: 'Product' },
  table_total: { id: 'Total', en: 'Total' },
  table_payment_method: { id: 'Metode Bayar', en: 'Payment Method' },
  table_status: { id: 'Status', en: 'Status' },
  table_action: { id: 'Aksi', en: 'Action' },
  details: { id: 'Rincian', en: 'Details' },
  manage_order: { id: 'Kelola Pesanan', en: 'Manage Order' },
  other_items: { id: 'item lainnya', en: 'other items' },
  manage_products: { id: 'Ubah Produk', en: 'Edit Product' },
  stock_label: { id: 'Stok:', en: 'Stock:' },

  // Products Page
  products_title: { id: 'Produk', en: 'Products' },
  add_product: { id: 'Tambah Produk', en: 'Add Product' },
  search_product_placeholder: { id: 'Cari nama produk, SKU, atau kategori...', en: 'Search product name, SKU, or category...' },
  all_categories: { id: 'Semua Kategori', en: 'All Categories' },
  product_name: { id: 'Nama Produk', en: 'Product Name' },
  category: { id: 'Kategori', en: 'Category' },
  price: { id: 'Harga', en: 'Price' },
  stock: { id: 'Stok', en: 'Stock' },
  status: { id: 'Status', en: 'Status' },
  actions: { id: 'Aksi', en: 'Actions' },
  active: { id: 'Aktif', en: 'Active' },
  inactive: { id: 'Nonaktif', en: 'Inactive' },
  edit: { id: 'Ubah', en: 'Edit' },
  delete: { id: 'Hapus', en: 'Delete' },
  no_products_found: { id: 'Tidak ada produk yang cocok', en: 'No products found' },

  // Orders Page
  orders_title: { id: 'Daftar Pesanan Masuk', en: 'Incoming Orders' },
  filter_all: { id: 'Semua', en: 'All' },
  filter_new: { id: 'Baru', en: 'New' },
  filter_processing: { id: 'Diproses', en: 'Processing' },
  filter_shipped: { id: 'Dikirim', en: 'Shipped' },
  filter_completed: { id: 'Selesai', en: 'Completed' },
  filter_cancelled: { id: 'Dibatalkan', en: 'Cancelled' },
  search_orders_placeholder: { id: 'Cari nomor pesanan, nama pembeli, nomor WA, atau resi...', en: 'Search order number, customer name, WhatsApp, or tracking...' },
  all_payments: { id: 'Semua Pembayaran', en: 'All Payments' },
  all_couriers: { id: 'Semua Kurir', en: 'All Couriers' },
  contact_buyer: { id: 'Hubungi Pembeli', en: 'Contact Buyer' },
  process_shipping: { id: 'Proses Pengiriman', en: 'Process Shipping' },
  total_payment: { id: 'Total Pembayaran', en: 'Total Payment' },
  buyer_note: { id: 'Catatan Pembeli:', en: 'Buyer Note:' },
  order_paid: { id: 'Sudah Dibayar', en: 'Paid' },
  order_unpaid: { id: 'Belum Dibayar', en: 'Unpaid' },
  chat_buyer: { id: 'Chat Pembeli', en: 'Chat Buyer' },
  copy_resi: { id: 'Salin Resi', en: 'Copy Tracking' },
  copied: { id: 'Tersalin', en: 'Copied' },
  check_tracking: { id: 'Cek Tracking', en: 'Track Order' },
  label_pdf: { id: 'Label PDF', en: 'PDF Label' },
  detail_and_track: { id: 'Detail & Lacak', en: 'Details & Track' },
  detail_short: { id: 'Detail', en: 'Detail' },
  arrange_shipping: { id: 'Atur Pengiriman', en: 'Arrange Shipment' },
  mark_completed: { id: 'Tandai Selesai', en: 'Mark Completed' },
  order_completed: { id: 'Pesanan Selesai', en: 'Order Completed' },
  no_orders_found: { id: 'Tidak ada pesanan ditemukan', en: 'No orders found' },
  no_orders_desc: { id: 'Pesanan baru dari pembeli di toko online Anda akan otomatis masuk dan tampil di halaman ini.', en: 'New orders from buyers in your online store will automatically appear on this page.' },
  items_count: { id: 'produk', en: 'items' },
  courier_colon: { id: 'Kurir:', en: 'Courier:' },
  resi_colon: { id: 'Resi', en: 'Tracking' },
  close: { id: 'Tutup', en: 'Close' },
  label_and_receipt: { id: 'Label Pengiriman & Struk', en: 'Shipping Label & Receipt' },
  print_thermal_receipt: { id: 'Cetak Struk Thermal', en: 'Print Thermal Receipt' },

  // Payment & Shipping Page
  payments_shipping_title: { id: 'Pembayaran & Pengiriman', en: 'Payment & Shipping' },
  payment_gateways: { id: 'Metode Pembayaran', en: 'Payment Methods' },
  shipping_services: { id: 'Kurir Ekspedisi', en: 'Shipping Couriers' },
  connect_service: { id: 'Sambungkan', en: 'Connect' },
  connected: { id: 'Terhubung', en: 'Connected' },

  // Settings Page
  settings_title: { id: 'Pengaturan', en: 'Settings' },
  store_information: { id: 'Informasi Toko', en: 'Store Information' },
  store_name: { id: 'Nama Toko', en: 'Store Name' },
  store_slug: { id: 'Domain / URL Toko', en: 'Store URL / Slug' },
  store_phone: { id: 'Nomor WhatsApp Pemilik', en: 'Owner WhatsApp Number' },
  store_address: { id: 'Alamat Toko', en: 'Store Address' },
  save_changes: { id: 'Simpan Perubahan', en: 'Save Changes' },
  saving: { id: 'Menyimpan...', en: 'Saving...' },

  // Layout Editor
  fullscreen: { id: 'Layar Penuh', en: 'Fullscreen' },
  exit_fullscreen: { id: 'Keluar Layar Penuh', en: 'Exit Fullscreen' },
  preview: { id: 'Pratinjau', en: 'Preview' },
  save: { id: 'Simpan', en: 'Save' },
  undo: { id: 'Urungkan', en: 'Undo' },
  redo: { id: 'Ulangi', en: 'Redo' },
  mode_desktop: { id: 'Desktop', en: 'Desktop' },
  mode_tablet: { id: 'Tablet', en: 'Tablet' },
  mode_mobile: { id: 'Ponsel', en: 'Mobile' },
  back_to_dashboard: { id: 'Kembali ke Beranda', en: 'Back to Dashboard' },
  sections_heading: { id: 'Halaman Utama', en: 'Homepage' },
  add_section: { id: 'Tambah Section', en: 'Add Section' },
  theme_settings: { id: 'Tema Toko', en: 'Store Theme' },
  accent_color: { id: 'Warna Aksen', en: 'Accent Color' },
  content_tab: { id: 'Konten', en: 'Content' },
  style_tab: { id: 'Tampilan', en: 'Style' },
  live_preview: { id: 'Live Pratinjau', en: 'Live Preview' },
  templates_available: { id: 'Template Tersedia', en: 'Templates Available' },
  search_template_placeholder: { id: 'Cari template berdasarkan nama, kategori, atau gaya desain...', en: 'Search templates by name, category, or design style...' },
  btn_view_demo: { id: 'Lihat Demo', en: 'View Demo' },
  btn_use_template: { id: 'Gunakan', en: 'Use Template' },
  btn_preview: { id: 'Pratinjau', en: 'Preview' },
  badge_free: { id: 'Gratis', en: 'Free' },
  by_microcms: { id: 'oleh MicroCMS', en: 'by MicroCMS' },
  sections_count: { id: 'Seksi', en: 'Sections' },
  no_templates_found: { id: 'Tidak ada template ditemukan', en: 'No templates found' },
  try_different_search: { id: 'Coba ubah kata kunci pencarian atau filter kategori.', en: 'Try changing search keywords or category filter.' },
  payment_methods_title: { id: 'Pilihan Metode Pembayaran', en: 'Payment Methods' },
  payment_active_count: { id: 'metode pembayaran aktif di etalase toko Anda', en: 'active payment methods on your storefront' },
  all_payments_active: { id: 'Semua metode pembayaran Midtrans diaktifkan', en: 'All Midtrans payment methods enabled' },
  all_payments_inactive: { id: 'Semua metode pembayaran Midtrans dinonaktifkan', en: 'All Midtrans payment methods disabled' },
  edit_product_title: { id: 'Edit Produk', en: 'Edit Product' },
  add_product_title: { id: 'Tambah Produk Baru', en: 'Add New Product' },

  // Landing Page Navbar & Sections
  landing_nav_home: { id: 'Beranda', en: 'Home' },
  landing_nav_product: { id: 'Produk', en: 'Products' },
  landing_nav_how_it_works: { id: 'Cara Kerja', en: 'How It Works' },
  landing_nav_features: { id: 'Fitur', en: 'Features' },
  landing_nav_faq: { id: 'FAQ', en: 'FAQ' },
  landing_view_demo: { id: 'Lihat Demo', en: 'View Demo' },
  landing_start_free: { id: 'Mulai Gratis', en: 'Start for Free' },
  landing_login: { id: 'Masuk Akun', en: 'Log In' },
  landing_main_nav: { id: 'Navigasi Utama', en: 'Main Navigation' },
  landing_platform_badge: { id: 'Platform Toko Online UMKM', en: 'MSME Online Store Platform' },

  // Hero Section
  hero_umkm_badge: { id: 'Solusi Toko Online UMKM', en: 'MSME Online Store Solution' },
  hero_title_p1: { id: 'Bikin Toko Online,', en: 'Build Your Online Store,' },
  hero_title_highlight: { id: 'Semudah Mengelola', en: 'As Effortless As Managing' },
  hero_title_p2: { id: 'Toko Sendiri', en: 'Your Own Shop' },
  hero_subtitle: { id: 'Kelola produk, pesanan, dan pembayaran otomatis dalam satu aplikasi.', en: 'Manage products, orders, and automated payments all in one application.' },
  hero_cta_primary: { id: 'Mulai Gratis', en: 'Start for Free' },
  hero_cta_how: { id: 'Lihat Cara Kerja', en: 'See How It Works' },
  hero_cta_demo: { id: 'Coba Demo', en: 'Try Demo' },
  hero_trust_easy: { id: 'Mudah digunakan', en: 'Easy to use' },
  hero_trust_hasslefree: { id: 'Tanpa ribet', en: 'No complexity' },
  hero_trust_umkm: { id: 'Siap untuk UMKM', en: 'Ready for MSMEs' },
  hero_active_stores: { id: '10.000+ Toko Aktif', en: '10,000+ Active Stores' },
  hero_setup_time: { id: 'Setup 5 Menit', en: '5-Minute Setup' },
  hero_badge_new_orders: { id: '+8 Pesanan Baru', en: '+8 New Orders' },
  hero_badge_ready_process: { id: 'Siap diproses', en: 'Ready to ship' },
  hero_badge_payment_success: { id: 'Pembayaran Berhasil', en: 'Payment Confirmed' },
  hero_badge_qris_bank: { id: 'QRIS & Bank', en: 'QRIS & Bank' },
  hero_dash_title: { id: 'Kroomify Dashboard', en: 'Kroomify Dashboard' },
  hero_dash_status_online: { id: 'Online', en: 'Online' },
  hero_dash_tab_overview: { id: 'Ringkasan', en: 'Summary' },
  hero_dash_tab_orders: { id: 'Pesanan', en: 'Orders' },
  hero_dash_tab_products: { id: 'Produk', en: 'Products' },
  hero_dash_sales_today: { id: 'Penjualan Hari Ini', en: 'Today\'s Sales' },
  hero_dash_growth_week: { id: '↑ 24% minggu ini', en: '↑ 24% this week' },
  hero_dash_orders_in: { id: 'Pesanan Masuk', en: 'Incoming Orders' },
  hero_dash_ready_ship: { id: '3 siap kirim', en: '3 ready to ship' },
  hero_dash_active_catalog: { id: 'Katalog Aktif', en: 'Active Catalog' },
  hero_dash_low_stock_notice: { id: '3 stok menipis', en: '3 low in stock' },
  hero_dash_sales_act: { id: 'Aktivitas Penjualan', en: 'Sales Activity' },
  hero_dash_today_plus: { id: '+Rp 1.450.000 hari ini', en: '+$110 today' },
  hero_dash_paid_ship: { id: 'Lunas • Kirim', en: 'Paid • Ship' },
  hero_dash_auto_receipt: { id: 'Resi Otomatis', en: 'Auto Tracking' },
  hero_dash_need_process: { id: 'Perlu Diproses', en: 'Needs Processing' },

  // Product Showcase Section
  product_section_badge: { id: 'Manajemen Produk', en: 'Product Management' },
  product_section_title: { id: 'Kelola Produk Tanpa Ribet', en: 'Effortless Product Management' },
  product_section_desc: { id: 'Upload foto produk, tentukan harga, dan atur stok barang langsung dari HP.', en: 'Upload photos, set prices, and manage inventory right from your phone.' },
  product_bullet_1: { id: 'Upload foto produk langsung dari kamera HP', en: 'Upload photos straight from your phone camera' },
  product_bullet_2: { id: 'Atur varian warna, ukuran, dan harga promo', en: 'Set color variants, sizing, and promotional discounts' },
  product_bullet_3: { id: 'Stok otomatis berkurang saat pesanan dibayar', en: 'Inventory auto-updates immediately when orders are paid' },
  product_cta_add: { id: 'Mulai Tambah Produk', en: 'Start Adding Products' },
  product_cta_simulate: { id: 'Simulasi Produk', en: 'Simulate Product' },
  product_catalog_card_title: { id: 'Katalog Produk Anda', en: 'Your Product Catalog' },
  product_catalog_card_active: { id: 'produk aktif di etalase', en: 'active items on display' },
  product_status_available: { id: 'Tersedia', en: 'In Stock' },
  product_status_low: { id: 'Stok Menipis', en: 'Low Stock' },
  product_storefront_online: { id: 'Etalase Toko Otomatis Online', en: 'Storefront Automatically Online' },
  product_synced_link: { id: 'Tersinkronisasi ke Link Toko', en: 'Synced to Store Link' },
  product_modal_title: { id: 'Simulasi Tambah Produk', en: 'Simulate Add Product' },
  product_modal_photo: { id: 'Foto Produk', en: 'Product Photo' },
  product_modal_photo_hint: { id: 'Foto terisi otomatis dari galeri/kamera', en: 'Auto-filled from camera or gallery' },
  product_modal_name: { id: 'Nama Produk', en: 'Product Name' },
  product_modal_price: { id: 'Harga (Rp)', en: 'Price' },
  product_modal_stock: { id: 'Jumlah Stok', en: 'Stock Quantity' },
  product_modal_cancel: { id: 'Batal', en: 'Cancel' },
  product_modal_save: { id: 'Simpan Produk', en: 'Save Product' },
  product_modal_success: { id: 'Produk baru berhasil ditambahkan ke etalase!', en: 'New product successfully added to your store!' },

  // How It Works Section
  how_section_badge: { id: 'Alur Praktis', en: 'Simple Process' },
  how_section_title: { id: 'Mulai Jualan dalam 3 Langkah', en: 'Start Selling in 3 Steps' },
  how_section_desc: { id: 'Sederhana dan langsung siap pakai tanpa perlu keahlian teknis.', en: 'Simple and ready to use without needing any technical skills.' },
  how_step_1_title: { id: 'Buat Toko', en: 'Create Store' },
  how_step_1_desc: { id: 'Atur nama usaha dan nomor WhatsApp toko Anda dalam hitungan menit.', en: 'Set your business name and store WhatsApp number in minutes.' },
  how_step_1_badge: { id: 'Cukup 1 Menit', en: 'Just 1 Minute' },
  how_step_2_title: { id: 'Tambah Produk', en: 'Add Products' },
  how_step_2_desc: { id: 'Upload foto dari HP, tentukan harga, dan atur varian barang.', en: 'Upload photos from mobile, set pricing, and configure item variants.' },
  how_step_2_badge: { id: 'Langsung dari Kamera HP', en: 'Direct from Phone Camera' },
  how_step_3_title: { id: 'Terima Pesanan', en: 'Receive Orders' },
  how_step_3_desc: { id: 'Bagikan link toko, terima pembayaran otomatis lewat QRIS & Bank.', en: 'Share your store link, receive automated payments via QRIS & Banks.' },
  how_step_3_badge: { id: 'QRIS & Resi Otomatis', en: 'Instant QRIS & Tracking' },
  how_step_label: { id: 'Langkah', en: 'Step' },
  how_cta_register: { id: 'Buat Toko Sekarang — Gratis', en: 'Create Store Now — Free' },
  how_preview_instant: { id: 'Aktif Instan', en: 'Active Instantly' },
  how_preview_biz_name: { id: 'Nama Usaha Anda', en: 'Your Business Name' },
  how_preview_store_link: { id: 'Tautan Toko Online', en: 'Online Store Link' },
  how_preview_store_wa: { id: 'Nomor WhatsApp Usaha', en: 'Business WhatsApp Number' },
  how_preview_wa_note: { id: 'Aktif untuk notifikasi pesanan', en: 'Active for order alerts' },
  how_preview_dns_note: { id: 'Domain & server langsung aktif tanpa perlu setting DNS atau hosting', en: 'Domain & hosting are ready instantly without manual DNS setup' },
  how_preview_shipping_calc: { id: 'Otomatis hitung ongkir kurir berdasarkan berat (gram)', en: 'Automatic courier shipping calculation by weight (grams)' },
  how_preview_multi_img: { id: 'Bisa tambah foto detail produk hingga 5 gambar', en: 'Upload up to 5 detailed product gallery images' },
  how_preview_qris_paid: { id: 'Pembayaran QRIS Berhasil', en: 'QRIS Payment Verified' },
  how_preview_wa_alert: { id: 'Notifikasi order otomatis terkirim ke WhatsApp Anda & pembeli', en: 'Automated order notifications sent to you and your customer via WhatsApp' },
  how_footer_ready: { id: 'Toko siap dalam 5 menit', en: 'Store ready in 5 minutes' },

  // Features Section
  features_section_badge: { id: 'Fitur Lengkap', en: 'Full Features' },
  features_section_title: { id: 'Semua yang Dibutuhkan untuk Jualan', en: 'Everything You Need to Sell Online' },
  features_section_desc: { id: 'Satu dashboard terpadu untuk mengelola seluruh operasional toko.', en: 'One unified dashboard to run your entire online store operations.' },
  features_tab_products: { id: 'Produk', en: 'Products' },
  features_tab_products_sub: { id: 'Atur harga dan stok dengan mudah.', en: 'Manage prices and stock effortlessly.' },
  features_tab_products_badge: { id: 'Katalog Cepat', en: 'Fast Catalog' },
  features_tab_orders: { id: 'Pesanan', en: 'Orders' },
  features_tab_orders_sub: { id: 'Proses order dan cetak resi otomatis.', en: 'Process orders & print auto shipping labels.' },
  features_tab_orders_badge: { id: 'Auto Resi', en: 'Auto Tracking' },
  features_tab_payments: { id: 'Pembayaran', en: 'Payments' },
  features_tab_payments_sub: { id: 'Terima QRIS dan transfer bank langsung.', en: 'Accept QRIS & direct bank transfers.' },
  features_tab_payments_badge: { id: 'QRIS & Bank', en: 'QRIS & Bank' },
  features_tab_store: { id: 'Toko Online', en: 'Online Store' },
  features_tab_store_sub: { id: 'Etalase toko modern siap disebar ke WhatsApp.', en: 'Modern storefront ready to share on WhatsApp.' },
  features_tab_store_badge: { id: 'Link Bio Siap', en: 'Bio Link Ready' },
  features_sync_realtime: { id: 'Sinkron Real-time', en: 'Real-time Sync' },
  features_top_seller: { id: 'Produk Terlaris', en: 'Best Selling Item' },
  features_stock_warning: { id: 'Peringatan Stok', en: 'Stock Warning' },
  features_sold_count: { id: 'terjual minggu ini', en: 'sold this week' },
  features_restock_soon: { id: 'Segera restok', en: 'Restock soon' },
  features_print_label: { id: 'Cetak Label Alamat 1-Klik', en: '1-Click Address Label Print' },
  features_whatsapp_tracking: { id: 'Auto Kirim Resi ke WhatsApp', en: 'Auto-Send Tracking to WhatsApp' },
  features_payout_anytime: { id: 'Tarik Kapan Saja ke Rekening Bank', en: 'Withdraw Anytime to Local Bank Account' },
  features_payout_label: { id: 'Pencairan Dana Dompet:', en: 'Wallet Balance Payout:' },
  features_mobile_optimized: { id: 'Tampilan ringan dan cepat dibuka dari browser smartphone pembeli tanpa install aplikasi', en: 'Fast, lightweight mobile storefront without requiring customer app installs' },
  features_no_monthly_fee: { id: 'Gratis Tanpa Biaya Langganan Bulanan', en: 'Free with No Monthly Subscription Fees' },

  // FAQ Section
  faq_section_badge: { id: 'Tanya Jawab', en: 'Q & A' },
  faq_section_title: { id: 'Pertanyaan Umum', en: 'Frequently Asked Questions' },
  faq_section_desc: { id: 'Jawaban untuk hal-hal yang sering ditanyakan seputar Kroomify.', en: 'Clear answers to common questions about Kroomify.' },
  faq_need_more_help: { id: 'Butuh bantuan lebih lanjut?', en: 'Need further assistance?' },
  faq_contact_cs: { id: 'Hubungi CS WhatsApp', en: 'Contact WhatsApp Support' },
  faq_q1: { id: 'Apakah saya perlu keahlian teknis atau bisa coding?', en: 'Do I need coding skills or technical background?' },
  faq_a1: { id: 'Tidak sama sekali. Kroomify dirancang sangat sederhana sehingga siapa pun bisa membuat katalog produk dan melayani pesanan langsung lewat layar smartphone tanpa pengetahuan teknis.', en: 'Not at all. Kroomify is built simply so anyone can create a product catalog and process incoming orders straight from their smartphone.' },
  faq_q2: { id: 'Berapa lama proses pembuatan toko online?', en: 'How long does it take to create an online store?' },
  faq_a2: { id: 'Kurang dari 5 menit. Cukup daftarkan nama usaha Anda, masukkan foto produk pertama, dan tautan toko online (kroomify.id/toko-anda) langsung aktif dan siap disebarkan ke WhatsApp atau media sosial.', en: 'Less than 5 minutes. Simply register your store name, add your first product photo, and your store link is instantly live and ready to share.' },
  faq_q3: { id: 'Bagaimana cara pembeli membayar pesanan?', en: 'How do customers pay for orders?' },
  faq_a3: { id: 'Tersedia pembayaran otomatis menggunakan QRIS Instan (bisa di-scan dari GoPay, OVO, Dana, ShopeePay, serta seluruh mobile banking) dan Transfer Virtual Account Bank resmi.', en: 'Automatic payment methods include instant QRIS (scannable from GoPay, OVO, Dana, ShopeePay, and all banking apps) as well as bank Virtual Accounts.' },
  faq_q4: { id: 'Apakah uang dan saldo hasil jualan saya aman?', en: 'Is my store revenue and wallet balance safe?' },
  faq_a4: { id: 'Sangat aman. Seluruh dana transaksi diproses melalui jalur perbankan terverifikasi dan saldo dompet dapat ditarik langsung ke rekening bank lokal Anda kapan saja tanpa potongan tersembunyi.', en: 'Completely safe. All transaction funds are processed through verified banking channels and can be withdrawn to your bank account anytime without hidden deductions.' },

  // Final CTA Section
  cta_badge: { id: 'Daftar Gratis', en: 'Free Registration' },
  cta_title: { id: 'Mulai Buka Toko Online Anda Sekarang', en: 'Launch Your Online Store Today' },
  cta_desc: { id: 'Jualan online praktis dan siap digunakan dalam hitungan menit.', en: 'Practical online selling, ready to launch in minutes.' },
  cta_button_primary: { id: 'Buka Toko Gratis', en: 'Open Store Free' },
  cta_button_whatsapp: { id: 'Konsultasi WhatsApp', en: 'WhatsApp Consultation' },
  cta_trust_1: { id: 'Tanpa biaya awal', en: 'No upfront cost' },
  cta_trust_2: { id: 'Siap terima order', en: 'Ready for orders' },
  cta_trust_3: { id: 'Panduan UMKM', en: 'MSME guidance' },
  cta_card_your_store: { id: 'Toko Anda', en: 'Your Store' },
  cta_card_active_badge: { id: 'Toko Online Aktif', en: 'Store Online & Active' },
  cta_card_payment_ready: { id: 'QRIS & Bank Siap', en: 'QRIS & Banks Ready' },

  // Footer Section
  footer_brand_desc: { id: 'Kelola produk, pesanan, dan pembayaran tanpa ribet.', en: 'Manage products, orders, and payments without the hassle.' },
  footer_tag_indonesia: { id: '🇮🇩 100% Karya Anak Bangsa', en: '🇮🇩 Empowering Local Businesses' },
  footer_col_product: { id: 'Produk', en: 'Products' },
  footer_link_storefront: { id: 'Beranda Toko', en: 'Storefront' },
  footer_link_catalog: { id: 'Katalog Produk', en: 'Product Catalog' },
  footer_link_orders: { id: 'Manajemen Pesanan', en: 'Order Management' },
  footer_link_courier: { id: 'Integrasi Kurir & QRIS', en: 'Courier & QRIS Integration' },
  footer_col_company: { id: 'Perusahaan', en: 'Company' },
  footer_link_about: { id: 'Tentang Kami', en: 'About Us' },
  footer_link_blog: { id: 'Blog & Edukasi UMKM', en: 'Blog & MSME Tips' },
  footer_link_contact: { id: 'Kontak Kemitraan', en: 'Partnership Contact' },
  footer_link_career: { id: 'Karier', en: 'Careers' },
  footer_col_help: { id: 'Bantuan', en: 'Support' },
  footer_link_faq: { id: 'FAQ & Tanya Jawab', en: 'FAQ & Help' },
  footer_link_helpdesk: { id: 'Pusat Bantuan', en: 'Help Center' },
  footer_link_whatsapp: { id: 'WhatsApp CS 24/7', en: 'WhatsApp CS 24/7' },
  footer_col_legal: { id: 'Legal', en: 'Legal' },
  footer_link_privacy: { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
  footer_link_terms: { id: 'Syarat & Ketentuan', en: 'Terms & Conditions' },
  footer_link_security: { id: 'Keamanan Data', en: 'Data Security' },
  footer_copyright: { id: '© 2026 Kroomify. Dibuat untuk UMKM Indonesia.', en: '© 2026 Kroomify. Crafted for Entrepreneurs.' },
  footer_privacy_safe: { id: 'Privasi Terjaga', en: 'Privacy Protected' },
  footer_server_secure: { id: 'Server Cepat & Aman', en: 'Fast & Secure Servers' },

  // Demo Modal & Preview
  demo_modal_title: { id: 'Demo Interaktif Kroomify', en: 'Kroomify Interactive Demo' },
  demo_modal_subtitle: { id: 'Jelajahi fitur dashboard toko online dalam mode uji coba', en: 'Explore online store dashboard features in trial mode' },
  demo_modal_launch_btn: { id: 'Masuk ke Live Demo Dashboard', en: 'Enter Live Dashboard Demo' },
  demo_modal_register_btn: { id: 'Daftar Akun Toko Baru', en: 'Register New Store Account' },

  // Authentication (Login / Register / Forgot Password)
  auth_login_title: { id: 'Masuk ke Akun Toko', en: 'Log In to Store Account' },
  auth_login_subtitle: { id: 'Kelola toko online dan pesanan Anda', en: 'Manage your online store and orders' },
  auth_email_label: { id: 'Email atau Username', en: 'Email or Username' },
  auth_password_label: { id: 'Kata Sandi', en: 'Password' },
  auth_forgot_password: { id: 'Lupa Kata Sandi?', en: 'Forgot Password?' },
  auth_login_button: { id: 'Masuk', en: 'Log In' },
  auth_logging_in: { id: 'Sedang Masuk...', en: 'Logging in...' },
  auth_login_success: { id: 'Berhasil Masuk', en: 'Logged In Successfully' },
  auth_login_google: { id: 'Masuk dengan Google', en: 'Sign in with Google' },
  auth_dont_have_account: { id: 'Belum punya akun?', en: 'Don\'t have an account?' },
  auth_signup_now: { id: 'Daftar sekarang', en: 'Register now' },
  auth_back_to_home: { id: 'Kembali ke Beranda', en: 'Back to Home' },
  auth_back_to_login: { id: 'Kembali Masuk', en: 'Back to Login' },

  auth_register_title: { id: 'Buat Akun Toko Baru', en: 'Create New Store Account' },
  auth_register_subtitle: { id: 'Mulai jualan online profesional dalam 3 menit', en: 'Start selling online professionally in 3 minutes' },
  auth_store_name_label: { id: 'Nama Toko (Opsional)', en: 'Store Name (Optional)' },
  auth_fullname_label: { id: 'Nama Lengkap Anda', en: 'Your Full Name' },
  auth_register_button: { id: 'Daftar dengan Google', en: 'Register with Google' },
  auth_quick_register: { id: 'Daftar Langsung', en: 'Instant Register' },
  auth_already_have_account: { id: 'Sudah punya akun?', en: 'Already have an account?' },
  auth_reset_password_title: { id: 'Atur Ulang Kata Sandi', en: 'Reset Password' },
  auth_reset_password_desc: { id: 'Masukkan email Anda untuk menerima tautan pemulihan kata sandi.', en: 'Enter your email to receive a password reset recovery link.' },
  auth_send_reset_link: { id: 'Kirim Tautan Pemulihan', en: 'Send Recovery Link' },
  auth_reset_sent_title: { id: 'Tautan Berhasil Dikirim', en: 'Link Sent Successfully' },
  auth_reset_sent_desc: { id: 'Tautan atur ulang kata sandi telah dikirim ke email Anda.', en: 'The password reset link has been sent to your email.' },

  // Shipping & Logistics Page
  shipping_subtitle: {
    id: 'Kelola cabang gudang asal pengiriman (origin) dan konfigurasi kurir ekspedisi otomatis (Biteship).',
    en: 'Manage origin dispatch warehouses/branches and automated courier logistics settings (Biteship).'
  },
  shipping_of: { id: 'dari', en: 'of' },
  shipping_active_badge: { id: 'Ekspedisi Aktif', en: 'Active Couriers' },
  tab_branches: { id: 'Cabang & Gudang Asal', en: 'Branches & Origin Warehouses' },
  tab_branches_short: { id: 'Cabang Gudang', en: 'Branches' },
  tab_couriers: { id: 'Pilihan Kurir & Ekspedisi', en: 'Courier & Carrier Options' },
  tab_couriers_short: { id: 'Kurir & Ekspedisi', en: 'Couriers' },
  calc_biteship_title: { id: 'Kalkulasi Ongkir & Biteship Aggregator', en: 'Shipping Rate Calculation & Biteship Aggregator' },
  calc_biteship_desc: {
    id: 'Ekspedisi yang aktif akan langsung muncul saat pembeli melakukan checkout di etalase toko. Ongkos kirim dihitung akurat berdasarkan lokasi cabang gudang asal dan kode pos tujuan.',
    en: 'Active couriers will appear directly during buyer checkout. Shipping fees are accurately computed based on origin branch warehouse location and destination postal code.'
  },
  available_couriers_heading: { id: 'Pilihan Ekspedisi & Kurir Logistik', en: 'Available Shipping Carriers & Logistics' },
  couriers_active_count: { id: 'aktif', en: 'active' },

  // Branch & Origin Warehouse Management
  branch_management_title: { id: 'Manajemen Cabang & Gudang Asal', en: 'Branch & Origin Warehouse Management' },
  branch_management_desc: {
    id: 'Lokasi cabang/gudang digunakan oleh kurir (Biteship) sebagai titik penjemputan (origin) dan dasar kalkulasi ongkir.',
    en: 'Warehouse branch locations are used by couriers (Biteship) as pickup origins and the baseline for shipping fee calculations.'
  },
  branch_add_button: { id: 'Tambah Cabang / Gudang', en: 'Add Branch / Warehouse' },
  branch_search_placeholder: {
    id: 'Cari nama gudang, kota, nama PIC, atau kode pos...',
    en: 'Search warehouse name, city, PIC name, or postal code...'
  },
  branch_count_label: { id: 'Cabang', en: 'Branches' },
  branch_loading: { id: 'Memuat data cabang gudang...', en: 'Loading branch warehouse data...' },
  branch_empty_title: { id: 'Tidak ada cabang yang cocok dengan pencarian', en: 'No branches match your search' },
  branch_empty_desc: {
    id: 'Tambahkan cabang baru untuk mengaktifkan titik penjemputan logistik.',
    en: 'Add a new branch to activate logistics pickup points.'
  },
  branch_default_badge: { id: 'Cabang Utama', en: 'Primary Branch' },
  branch_active: { id: 'Aktif', en: 'Active' },
  branch_inactive: { id: 'Nonaktif', en: 'Inactive' },
  branch_pic_label: { id: 'PIC', en: 'PIC' },
  branch_postal_code: { id: 'Kode Pos', en: 'Postal Code' },
  branch_set_default: { id: 'Jadikan Utama', en: 'Set as Primary' },
  branch_main_origin: { id: 'Gudang Utama', en: 'Primary Origin' },
  branch_deactivate: { id: 'Nonaktifkan', en: 'Deactivate' },
  branch_activate: { id: 'Aktifkan', en: 'Activate' },
  branch_edit: { id: 'Ubah Cabang', en: 'Edit Branch' },
  branch_delete: { id: 'Hapus Cabang', en: 'Delete Branch' },
  branch_modal_add_title: { id: 'Tambah Cabang / Gudang Asal', en: 'Add Origin Branch / Warehouse' },
  branch_modal_edit_title: { id: 'Edit Cabang / Gudang', en: 'Edit Branch / Warehouse' },
  branch_form_name: { id: 'Nama Cabang / Gudang', en: 'Branch / Warehouse Name' },
  branch_form_name_placeholder: {
    id: 'Contoh: Gudang Pusat Jakarta, Cabang Bandung',
    en: 'Example: Jakarta Central Warehouse, Bandung Branch'
  },
  branch_form_pic: { id: 'Nama Penanggung Jawab (PIC)', en: 'Person in Charge (PIC) Name' },
  branch_form_pic_placeholder: { id: 'Nama PIC penyerahan paket', en: 'PIC name for parcel handover' },
  branch_form_phone: { id: 'No. Handphone PIC', en: 'PIC Phone Number' },
  branch_form_phone_placeholder: { id: '0812xxxxxxxx (untuk kurir)', en: '0812xxxxxxxx (for courier)' },
  branch_form_address: { id: 'Alamat Lengkap Gudang', en: 'Full Warehouse Address' },
  branch_form_address_placeholder: {
    id: 'Nama jalan, nomor gudang/ruko, RT/RW, patokan lokasi...',
    en: 'Street name, unit number, district, landmarks...'
  },
  branch_form_subdistrict: { id: 'Kecamatan', en: 'Subdistrict' },
  branch_form_city: { id: 'Kota / Kab', en: 'City / Regency' },
  branch_form_postal_code: { id: 'Kode Pos', en: 'Postal Code' },
  branch_form_province: { id: 'Provinsi', en: 'Province' },
  branch_form_default_checkbox: { id: 'Jadikan Cabang Utama', en: 'Set as Primary Branch' },
  branch_form_default_hint: {
    id: 'Cabang utama otomatis terpilih sebagai origin saat checkout dan perhitungan ongkir pembeli.',
    en: 'Primary branch is automatically selected as origin during checkout and shipping calculation.'
  },
  branch_form_active_checkbox: { id: 'Status Aktif', en: 'Active Status' },
  branch_form_active_hint: {
    id: 'Cabang aktif dapat digunakan untuk proses booking pengiriman dan penjemputan paket.',
    en: 'Active branches can be used for shipping bookings and parcel pickups.'
  },
  branch_form_cancel: { id: 'Batal', en: 'Cancel' },
  branch_form_saving: { id: 'Menyimpan...', en: 'Saving...' },
  branch_form_submit_add: { id: 'Simpan Cabang', en: 'Save Branch' },
  branch_form_submit_edit: { id: 'Perbarui Cabang', en: 'Update Branch' },
  branch_delete_confirm: {
    id: 'Apakah Anda yakin ingin menghapus cabang "{name}"?',
    en: 'Are you sure you want to delete branch "{name}"?'
  },
  branch_deleted_success: {
    id: 'Cabang "{name}" berhasil dihapus.',
    en: 'Branch "{name}" was successfully deleted.'
  },
  branch_delete_error: { id: 'Gagal menghapus cabang', en: 'Failed to delete branch' },
  branch_status_updated: { id: 'Status cabang berhasil diperbarui.', en: 'Branch status successfully updated.' },
  branch_status_error: { id: 'Gagal mengubah status cabang', en: 'Failed to change branch status' },
  branch_default_updated: { id: '"{name}" sekarang menjadi cabang utama.', en: '"{name}" is now the primary branch.' },
  branch_default_error: { id: 'Gagal mengatur cabang utama', en: 'Failed to set primary branch' },
  branch_created_success: { id: 'Cabang baru berhasil ditambahkan.', en: 'New branch successfully added.' },
  branch_updated_success: { id: 'Data cabang berhasil diperbarui.', en: 'Branch details successfully updated.' },
  branch_postal_required: { id: 'Kode pos harus 5 digit angka.', en: 'Postal code must be a 5-digit number.' },

  // Courier Card Integrations
  courier_badge_popular: { id: 'Populer', en: 'Popular' },
  courier_badge_aggregator: { id: 'Aggregator Terpusat', en: 'Centralized Aggregator' },
  courier_badge_master_api: { id: 'Master API', en: 'Master API' },
  courier_connected_env: { id: 'Terhubung via .env', en: 'Connected via .env' },
  courier_status_active: { id: 'Aktif', en: 'Active' },
  courier_status_inactive: { id: 'Nonaktif', en: 'Inactive' },
  courier_btn_settings: { id: 'Atur', en: 'Configure' },
  courier_title_settings: { id: 'Atur Preferensi Layanan', en: 'Configure Service Preferences' },
  courier_title_api_settings: { id: 'Atur Kunci API', en: 'Configure API Keys' },
  btn_save_settings: { id: 'Simpan Pengaturan', en: 'Save Settings' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'kroomify_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'id' || saved === 'en') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Crisp SVG Vector Flags to fix Windows/cross-platform emoji rendering issues
 */
const IndonesiaFlagSvg = () => (
  <svg className="w-3.5 h-3.5 rounded-full overflow-hidden border border-black/10 shrink-0 shadow-2xs" viewBox="0 0 24 24">
    <rect width="24" height="12" fill="#E11D48" />
    <rect y="12" width="24" height="12" fill="#FFFFFF" />
  </svg>
);

const UkFlagSvg = () => (
  <svg className="w-3.5 h-3.5 rounded-full overflow-hidden border border-black/10 shrink-0 shadow-2xs" viewBox="0 0 60 30">
    <clipPath id="lang_uk_clip">
      <path d="M0,0 v30 h60 v-30 z"/>
    </clipPath>
    <clipPath id="lang_uk_cross">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
    </clipPath>
    <g clipPath="url(#lang_uk_clip)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#lang_uk_cross)" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

/**
 * Reusable Language Switch Toggle Component
 */
export const LanguageSwitchButton: React.FC<{
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'dark' | 'glass';
}> = ({
  className = '',
  compact = false,
  variant = 'default',
}) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'dark') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 shadow-md font-sans select-none ${className}`}
        role="group"
        aria-label="Switch Language / Ganti Bahasa"
      >
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
            language === 'id'
              ? 'bg-white text-[#66000E] shadow-sm font-bold'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title="Bahasa Indonesia"
        >
          <IndonesiaFlagSvg />
          <span className={compact ? 'text-[11px]' : 'text-xs'}>ID</span>
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
            language === 'en'
              ? 'bg-white text-[#66000E] shadow-sm font-bold'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title="English"
        >
          <UkFlagSvg />
          <span className={compact ? 'text-[11px]' : 'text-xs'}>EN</span>
        </button>
      </div>
    );
  }

  if (variant === 'glass') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-xl bg-white/70 backdrop-blur-md border border-[#E5E0DD] shadow-2xs font-sans select-none ${className}`}
        role="group"
        aria-label="Switch Language / Ganti Bahasa"
      >
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
            language === 'id'
              ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]/80 font-bold'
              : 'text-[#706866] hover:text-[#241A1A] hover:bg-white/50'
          }`}
          title="Bahasa Indonesia"
        >
          <IndonesiaFlagSvg />
          <span className={compact ? 'text-[11px]' : 'text-xs'}>ID</span>
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
            language === 'en'
              ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]/80 font-bold'
              : 'text-[#706866] hover:text-[#241A1A] hover:bg-white/50'
          }`}
          title="English"
        >
          <UkFlagSvg />
          <span className={compact ? 'text-[11px]' : 'text-xs'}>EN</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] shadow-2xs font-sans select-none ${className}`}
      role="group"
      aria-label="Switch Language / Ganti Bahasa"
    >
      <button
        type="button"
        onClick={() => setLanguage('id')}
        className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
          language === 'id'
            ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]/80 font-bold'
            : 'text-[#706866] hover:text-[#241A1A] hover:bg-white/50'
        }`}
        title="Bahasa Indonesia"
      >
        <IndonesiaFlagSvg />
        <span className={compact ? 'text-[11px]' : 'text-xs'}>ID</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
          language === 'en'
            ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]/80 font-bold'
            : 'text-[#706866] hover:text-[#241A1A] hover:bg-white/50'
        }`}
        title="English"
      >
        <UkFlagSvg />
        <span className={compact ? 'text-[11px]' : 'text-xs'}>EN</span>
      </button>
    </div>
  );
};
