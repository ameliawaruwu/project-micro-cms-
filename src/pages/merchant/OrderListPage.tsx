import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { Order, ShippingStatus } from '../../types';
import { OrderFilterTabs } from '../../components/orders/OrderFilterTabs';
import { OrderCard } from '../../components/orders/OrderCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';

interface OrderListPageProps {
  orders: Order[];
  onProcessShipping: (order: Order) => void;
  onPrintReceipt: (order: Order) => void;
  onMarkCompleted: (orderId: string) => void;
  onSelectOrder: (order: Order) => void;
  onShowNotification: (msg: string) => void;
  onNavigateDashboard?: () => void;
}

export const OrderListPage: React.FC<OrderListPageProps> = ({
  orders,
  onProcessShipping,
  onPrintReceipt,
  onMarkCompleted,
  onSelectOrder,
  onShowNotification,
  onNavigateDashboard,
}) => {
  const { t } = useLanguage();
  const [activeStatus, setActiveStatus] = useState<ShippingStatus | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');

  const counts = useMemo(() => {
    return {
      Semua: orders.length,
      Baru: orders.filter((o) => o.shippingStatus === 'Baru').length,
      Diproses: orders.filter((o) => o.shippingStatus === 'Diproses').length,
      Dikirim: orders.filter((o) => o.shippingStatus === 'Dikirim').length,
      Selesai: orders.filter((o) => o.shippingStatus === 'Selesai').length,
      Dibatalkan: orders.filter((o) => o.shippingStatus === 'Dibatalkan').length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (activeStatus !== 'Semua') {
      result = result.filter((o) => o.shippingStatus === activeStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.resiNumber && o.resiNumber.toLowerCase().includes(q))
      );
    }

    if (paymentFilter !== 'all') {
      result = result.filter((o) => o.paymentMethod.toLowerCase().includes(paymentFilter.toLowerCase()));
    }

    if (courierFilter !== 'all') {
      result = result.filter((o) => o.courier.toLowerCase() === courierFilter.toLowerCase());
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeStatus, searchQuery, paymentFilter, courierFilter]);

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-200 font-poppins pb-24 lg:pb-8 text-left">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: t('nav_orders', 'Pesanan'), isActive: true },
        ]}
      />

      <div className="pb-3 border-b border-[#E5E0DD]">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
          <ShoppingBag className="w-5 h-5 text-[#66000E]" />
          <span>{t('nav_orders', 'Pesanan')}</span>
        </h1>
      </div>

      {/* Filter Tabs */}
      <OrderFilterTabs
        activeStatus={activeStatus}
        counts={counts}
        onSelectStatus={setActiveStatus}
      />

      {/* Search and Secondary Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E0DD] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#706866] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('search_orders_placeholder', 'Cari nomor pesanan, nama pembeli, atau resi...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-xs sm:text-sm text-[#241A1A] placeholder:text-[#706866] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] focus:bg-white transition"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          {/* Payment Method Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            aria-label="Filter metode pembayaran"
            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-[#E5E0DD] bg-white text-xs font-medium text-[#241A1A] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] truncate cursor-pointer"
          >
            <option value="all">{t('all_payments', 'Semua Bayar')}</option>
            <option value="QRIS">QRIS Instant</option>
            <option value="VA">Virtual Account</option>
            <option value="Transfer">Transfer Bank</option>
          </select>

          {/* Courier Filter */}
          <select
            value={courierFilter}
            onChange={(e) => setCourierFilter(e.target.value)}
            aria-label="Filter kurir ekspedisi"
            className="w-full sm:w-auto py-2 px-3 rounded-xl border border-[#E5E0DD] bg-white text-xs font-medium text-[#241A1A] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] truncate cursor-pointer"
          >
            <option value="all">{t('all_couriers', 'Semua Kurir')}</option>
            <option value="J&T">J&T Express</option>
            <option value="JNE">JNE</option>
            <option value="SiCepat">SiCepat</option>
            <option value="GoSend">GoSend</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-16 text-center shadow-xs">
          <ShoppingBag className="w-12 h-12 text-[#777777] mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-[#1F1F1F] text-base">{t('no_orders_found', 'Tidak ada pesanan ditemukan')}</h3>
          <p className="text-xs text-[#555555] mt-1 max-w-sm mx-auto font-normal">
            {t('no_orders_desc', 'Pesanan baru dari pembeli di toko online Anda akan otomatis masuk dan tampil di halaman ini.')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onProcessShipping={onProcessShipping}
              onPrintReceipt={onPrintReceipt}
              onMarkCompleted={onMarkCompleted}
              onSelectOrder={onSelectOrder}
              onShowNotification={onShowNotification}
            />
          ))}
        </div>
      )}
    </div>
  );
};

