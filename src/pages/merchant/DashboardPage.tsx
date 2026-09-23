import React from 'react';
import { Wallet, ArrowUpRight, RefreshCw, LayoutDashboard, ExternalLink, Store as StoreIcon, Plus } from 'lucide-react';
import { Store as StoreType, Order, Product, MerchantTab } from '../../types';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { SalesAnalyticsSection } from '../../components/dashboard/SalesAnalyticsSection';
import { StockAlertCard } from '../../components/dashboard/StockAlertCard';
import { RecentOrdersSection } from '../../components/dashboard/RecentOrdersSection';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatRupiah } from '../../utils/formatters';
import { useDashboardData } from '../../hooks/useDashboardData';

interface DashboardPageProps {
  store: StoreType;
  orders: Order[];
  products: Product[];
  onNavigateTab: (tab: MerchantTab) => void;
  onOpenAddProduct?: () => void;
  onOpenStorefront?: () => void;
  onOpenShareStore?: () => void;
  onOpenWithdraw?: () => void;
  onSelectOrder: (order: Order) => void;
  onCreateStore?: () => void;
  onPublishStore?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  store,
  orders,
  products,
  onNavigateTab,
  onOpenWithdraw,
  onOpenStorefront,
  onSelectOrder,
  onCreateStore,
  onPublishStore,
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  // Coordinated Single Source of Truth Hook for Dashboard Metrics
  const {
    balance,
    incomingOrdersCount,
    todaySales,
    totalProductsCount,
    lowStockCount,
    lowStockProducts,
    recentOrders,
    refresh,
    isLoading,
  } = useDashboardData({
    store,
    orders,
    products,
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300 font-sans pb-24 lg:pb-6 relative text-left">


      {/* NORMAL DASHBOARD (always shown) */}
      {(
        <>
      {/* 1. Store Greeting & Real-Time Status Header */}
      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
              <LayoutDashboard className="w-5 h-5 text-[#66000E]" />
              <span>{t('dashboard_title', 'Dashboard')}</span>
            </h1>
            {/* Store Status Badge */}
            {!store.id ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium shadow-2xs">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
                <span>Belum Memiliki Toko</span>
              </div>
            ) : !store.isPublished ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium shadow-2xs">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                <span>Toko Belum Publikasi (Draf)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-medium shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{t('live_store_active', 'Toko Online Aktif')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time date, Buka Web Toko (jika sudah dipublikasikan), & quick refresh trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {store.slug && store.id && Boolean(store.isPublished) && (
            <a
              href={store.customDomain ? `https://${store.customDomain}` : `${window.location.origin}/?toko=${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#F5E8EA] hover:bg-[#F9EDEF] border border-[#E8DDDE] text-[#66000E] text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title={isEn ? "Open your store website in new tab" : "Buka Website Toko Anda di Tab Baru"}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('nav_view_store', 'Buka Web Toko')}</span>
            </a>
          )}
          <button
            onClick={refresh}
            title={isEn ? 'Reload real-time metrics' : 'Muat ulang metrik real-time'}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F7] border border-[#E5E0DD] hover:border-[#66000E]/40 text-[#706866] hover:text-[#66000E] text-xs font-medium shadow-2xs flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#66000E] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('auto_update', 'Auto Update')}</span>
          </button>
        </div>
      </div>

      {/* Onboarding Call-to-Action for new merchants without a store */}
      {!store.id && (
        <div className="bg-gradient-to-r from-[#66000E] to-[#8A0013] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <StoreIcon className="w-5 h-5 text-white/90" />
              <span>{isEn ? 'Open Your Online Store Now' : 'Buka Toko Online Anda Sekarang'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              {isEn
                ? 'Your account is active. Create your first online store to set up your business details, address, and upload your products.'
                : 'Akun Anda telah aktif. Silakan buat toko pertama Anda untuk melengkapi nama usaha, kategori, alamat pengiriman, dan mulai mengunggah produk.'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('pengaturan')}
            className="px-4 py-2.5 rounded-xl bg-white text-[#66000E] hover:bg-[#FAF7F7] text-xs font-semibold shadow-xs flex items-center justify-center gap-2 shrink-0 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isEn ? 'Create Store Now' : 'Buat Toko Baru'}</span>
          </button>
        </div>
      )}

      {/* QUICK STORE WALLET BANNER (Saldo Toko Aktif) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E0DD] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#66000E]/30 transition min-h-[90px]">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center font-semibold shadow-2xs shrink-0">
            <Wallet className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs text-[#706866] font-normal block">{t('wallet_active_balance', 'Saldo Toko Aktif (Siap Ditarik)')}</span>
            <p className="text-xl sm:text-2xl font-semibold text-[#66000E] tracking-tight">
              {formatRupiah(balance)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenWithdraw && (
            <button
              onClick={onOpenWithdraw}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white text-xs font-medium transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{t('wallet_and_withdraw', 'Dompet & Tarik Dana')}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. 4 Core Metric Cards (Unified Live Single Source of Truth) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Incoming Orders */}
        <MetricCard
          type="orders"
          value={incomingOrdersCount}
          subtitle={isEn ? 'Pack & ship tracking number' : 'Segera kemas & kirimkan resi'}
          onClick={() => onNavigateTab('pesanan')}
          actionLabel={isEn ? 'View Orders' : 'Lihat Pesanan'}
        />

        {/* Metric 2: Today's Revenue */}
        <MetricCard
          type="sales"
          value={todaySales}
          subtitle={isEn ? 'Total completed transaction revenue' : 'Total omset transaksi sukses'}
          onClick={() => onNavigateTab('pesanan')}
          actionLabel={isEn ? 'View Details' : 'Lihat Rincian'}
        />

        {/* Metric 3: Total Products in Catalog */}
        <MetricCard
          type="products"
          value={totalProductsCount}
          subtitle={isEn ? 'Active items in storefront' : 'Barang aktif di etalase'}
          onClick={() => onNavigateTab('produk')}
          actionLabel={isEn ? 'View Catalog' : 'Lihat Katalog'}
        />

        {/* Metric 4: Low Stock Alert (Unified Count) */}
        <MetricCard
          type="stock_alert"
          value={lowStockCount}
          subtitle={
            lowStockCount > 0
              ? (isEn ? 'Restock items soon' : 'Segera lakukan restock barang')
              : (isEn ? 'All product stock is safe' : 'Semua stok produk aman')
          }
          onClick={() => onNavigateTab('produk')}
          actionLabel={isEn ? 'Check Stock' : 'Cek Stok'}
        />
      </div>

      {/* 4. Sales Analytics Chart Section */}
      <SalesAnalyticsSection
        storeId={store.id}
        orders={orders}
        onNavigateTab={onNavigateTab}
      />

      {/* 5. Two Column Section: Recent Orders & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersSection
            orders={recentOrders.length > 0 ? recentOrders : orders}
            onViewAllOrders={() => onNavigateTab('pesanan')}
            onSelectOrder={onSelectOrder}
          />
        </div>

        <div className="lg:col-span-1">
          <StockAlertCard
            products={products}
            lowStockItems={lowStockProducts}
            count={lowStockCount}
            onManageStock={() => onNavigateTab('produk')}
          />
        </div>
      </div>

      </> )} {/* end !!store.id conditional */}

    </div>
  );
};
