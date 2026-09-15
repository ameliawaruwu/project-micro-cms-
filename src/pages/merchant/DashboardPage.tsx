import React from 'react';
import { Wallet, ArrowUpRight, RefreshCw } from 'lucide-react';
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
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  store,
  orders,
  products,
  onNavigateTab,
  onOpenWithdraw,
  onSelectOrder,
}) => {
  const { t } = useLanguage();

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
      
      {/* 1. Store Greeting & Real-Time Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-2 border-b border-[#E5E0DD]/60">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
            {t('dashboard_title', 'Dashboard')}
          </h1>
          {/* Live store badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{t('live_store_active', 'Toko Online Aktif')}</span>
          </div>
        </div>

        {/* Real-time date & quick refresh trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={refresh}
            title="Muat ulang metrik real-time"
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50/50 border border-[#E5E0DD] hover:border-rose-200 text-[#706866] hover:text-[#800000] text-xs font-medium shadow-2xs flex items-center gap-2 transition cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#800000] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('auto_update', 'Sinkronisasi Real-time')}</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Store Wallet Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8DDDE] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#800000]/30 transition">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-[#800000] border border-rose-200/60 flex items-center justify-center font-semibold shadow-2xs shrink-0">
            <Wallet className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs text-[#706866] font-normal block">Saldo Toko Aktif (Siap Ditarik)</span>
            <p className="text-xl sm:text-2xl font-semibold text-[#800000] tracking-tight">
              {formatRupiah(balance)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenWithdraw && (
            <button
              onClick={onOpenWithdraw}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#800000] hover:bg-[#7A0C0C] text-white text-xs font-medium transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Dompet & Tarik Dana</span>
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
          subtitle="Segera kemas & kirimkan resi"
          onClick={() => onNavigateTab('pesanan')}
          actionLabel="Lihat Pesanan"
        />

        {/* Metric 2: Today's Revenue */}
        <MetricCard
          type="sales"
          value={todaySales}
          subtitle="Total omset transaksi sukses"
          onClick={() => onNavigateTab('pesanan')}
          actionLabel="Lihat Rincian"
        />

        {/* Metric 3: Total Products in Catalog */}
        <MetricCard
          type="products"
          value={totalProductsCount}
          subtitle="Barang aktif di etalase"
          onClick={() => onNavigateTab('produk')}
          actionLabel="Lihat Katalog"
        />

        {/* Metric 4: Low Stock Alert (Unified Count) */}
        <MetricCard
          type="stock_alert"
          value={lowStockCount}
          subtitle={lowStockCount > 0 ? 'Segera lakukan restock barang' : 'Semua stok produk aman'}
          onClick={() => onNavigateTab('produk')}
          actionLabel="Cek Stok"
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

    </div>
  );
};
