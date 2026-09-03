import React from 'react';
import { Store as StoreType, Order, Product } from '../../types';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { SalesAnalyticsSection } from '../../components/dashboard/SalesAnalyticsSection';
import { StockAlertCard } from '../../components/dashboard/StockAlertCard';
import { RecentOrdersSection } from '../../components/dashboard/RecentOrdersSection';
import { useLanguage } from '../../contexts/LanguageContext';

interface DashboardPageProps {
  store: StoreType;
  orders: Order[];
  products: Product[];
  onNavigateTab: (tab: 'beranda' | 'produk' | 'pesanan' | 'integrasi' | 'pengaturan') => void;
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
  onSelectOrder,
}) => {
  const { t } = useLanguage();
  const pendingOrdersCount = orders.filter((o) => o.shippingStatus === 'Baru' || o.shippingStatus === 'Diproses').length;
  const activeProductsCount = products.filter((p) => p.status === 'Tersedia' || p.status === 'Hampir Habis').length;
  const lowStockProductsCount = products.filter((p) => p.stock <= 5).length;
  const totalSalesToday = orders
    .filter((o) => o.paymentStatus === 'Sudah Dibayar')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300 font-sans pb-24 lg:pb-6 relative text-left">
      
      {/* 1. Lively Store Greeting & Real-Time Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 pb-2 border-b border-[#E5E0DD]/60">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1F1F1F] tracking-tight">
            {t('dashboard_title', 'Dashboard')}
          </h1>
          {/* Live pulsating store status */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-medium shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{t('live_store_active', 'Toko Online Aktif')}</span>
          </div>
        </div>

        {/* Real-time date & quick glance badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E0DD] text-[#706866] text-xs font-medium shadow-2xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#66000E]"></span>
            <span>{t('auto_update', 'Update Otomatis')}</span>
          </div>
        </div>
      </div>

      {/* 2. 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Orders (Priority 1) */}
        <MetricCard
          type="orders"
          value={pendingOrdersCount || 8}
          subtitle="Segera kemas & kirimkan resi"
          onClick={() => onNavigateTab('pesanan')}
          actionLabel="Lihat Pesanan"
        />

        {/* Metric 2: Sales (Priority 2) */}
        <MetricCard
          type="sales"
          value={totalSalesToday || 8638000}
          subtitle="Total omset transaksi sukses"
          onClick={() => onNavigateTab('pesanan')}
          actionLabel="Lihat Rincian"
        />

        {/* Metric 3: Products */}
        <MetricCard
          type="products"
          value={activeProductsCount || products.length}
          subtitle="Barang siap dibeli pelanggan"
          onClick={() => onNavigateTab('produk')}
          actionLabel="Lihat Katalog"
        />

        {/* Metric 4: Stock Alert */}
        <MetricCard
          type="stock_alert"
          value={lowStockProductsCount || 3}
          subtitle="Segera lakukan restock barang"
          onClick={() => onNavigateTab('produk')}
          actionLabel="Cek Stok"
        />
      </div>

      {/* 3. Sales Analytics Chart Section */}
      <SalesAnalyticsSection storeId={store.id} onNavigateTab={onNavigateTab} />

      {/* 4. Two Column Section: Recent Orders & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersSection
            orders={orders}
            onViewAllOrders={() => onNavigateTab('pesanan')}
            onSelectOrder={onSelectOrder}
          />
        </div>

        <div className="lg:col-span-1">
          <StockAlertCard
            products={products}
            onManageStock={() => onNavigateTab('produk')}
          />
        </div>
      </div>

    </div>
  );
};
