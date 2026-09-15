import { useState, useEffect, useMemo, useCallback } from 'react';
import { Store, Order, Product, TimeFilter, SalesAnalytics } from '../types';
import { supabase } from '../services/supabaseClient';
import { merchantService } from '../services/merchantService';

interface UseDashboardDataOptions {
  store: Store;
  orders: Order[];
  products: Product[];
  period?: TimeFilter;
}

export interface DashboardMetrics {
  balance: number;
  incomingOrdersCount: number;
  todaySales: number;
  totalProductsCount: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  analytics: (SalesAnalytics & { peakLabel?: string; peakAmount?: number }) | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export const useDashboardData = ({
  store,
  orders,
  products,
  period = 'Hari Ini',
}: UseDashboardDataOptions): DashboardMetrics => {
  const [rpcData, setRpcData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<(SalesAnalytics & { peakLabel?: string; peakAmount?: number }) | null>(null);

  // 1. Fetch from Supabase RPC if connected
  const fetchRpcAnalytics = useCallback(async () => {
    if (!store?.id) return;
    try {
      const { data, error } = await supabase.rpc('get_dashboard_analytics', {
        p_store_id: store.id,
      });
      if (!error && data) {
        setRpcData(data);
      }
    } catch {
      // Graceful fallback to client calculation
    }
  }, [store?.id]);

  // 2. Fetch or compute period analytics
  const fetchPeriodAnalytics = useCallback(async () => {
    if (!store?.id) return;
    setIsLoading(true);
    try {
      const data = await merchantService.getDashboardAnalytics(store.id, period, orders);
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching period analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [store?.id, period, orders]);

  useEffect(() => {
    fetchRpcAnalytics();
  }, [fetchRpcAnalytics]);

  useEffect(() => {
    fetchPeriodAnalytics();
  }, [fetchPeriodAnalytics]);

  // 3. Unified Single Sources of Truth with Zero Race Conditions
  
  // A. Balance
  const balance = useMemo(() => {
    if (rpcData && typeof rpcData.balance === 'number') {
      return rpcData.balance;
    }
    return store?.balance || 0;
  }, [rpcData, store?.balance]);

  // B. Incoming Orders (Paid and needing processing / ready to ship / not yet finished)
  const incomingOrdersCount = useMemo(() => {
    if (rpcData && typeof rpcData.incoming_orders === 'number') {
      return rpcData.incoming_orders;
    }
    return orders.filter((o) => {
      const isUnfulfilled = o.shippingStatus === 'Baru' || o.shippingStatus === 'Diproses';
      const isPaid = o.paymentStatus === 'Sudah Dibayar' || (o as any).payment_status === 'paid';
      return isUnfulfilled || (isPaid && o.shippingStatus !== 'Selesai');
    }).length;
  }, [rpcData, orders]);

  // C. Today's Revenue (Transactions created today with paid status)
  const todaySales = useMemo(() => {
    if (rpcData && typeof rpcData.today_sales === 'number') {
      return rpcData.today_sales;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    return orders
      .filter((o) => {
        const orderDateStr = o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '';
        const isPaid = o.paymentStatus === 'Sudah Dibayar' || (o as any).payment_status === 'paid';
        return isPaid && orderDateStr === todayStr;
      })
      .reduce((sum, o) => sum + (o.grandTotal || (o as any).total_amount || 0), 0);
  }, [rpcData, orders]);

  // D. Products count for current store
  const totalProductsCount = useMemo(() => {
    if (rpcData && typeof rpcData.total_products === 'number' && rpcData.total_products > 0) {
      return rpcData.total_products;
    }
    const storeProducts = products.filter((p) => p.storeId === store.id || !p.storeId);
    return storeProducts.length;
  }, [rpcData, products, store.id]);

  // E. Low Stock Count & Items List (Stock <= 5)
  const lowStockProducts = useMemo<Product[]>(() => {
    const storeProducts = products.filter((p) => p.storeId === store.id || !p.storeId);
    const lowFromLocal = storeProducts.filter((p) => Number(p.stock) <= 5);

    if (lowFromLocal.length > 0) {
      return lowFromLocal;
    }

    if (rpcData && Array.isArray(rpcData.low_stock_items) && rpcData.low_stock_items.length > 0) {
      return rpcData.low_stock_items.map((item: any) => ({
        id: item.id,
        storeId: store.id,
        name: item.name,
        slug: item.id,
        description: '',
        price: Number(item.price),
        stock: Number(item.stock),
        category: item.category || 'Umum',
        imageUrl: item.image_url || '',
        images: [],
        status: 'Hampir Habis',
        createdAt: new Date().toISOString(),
      }));
    }

    return [];
  }, [rpcData, products, store.id]);

  const lowStockCount = useMemo(() => {
    if (lowStockProducts.length > 0) {
      return lowStockProducts.length;
    }
    if (rpcData && typeof rpcData.low_stock_count === 'number') {
      return rpcData.low_stock_count;
    }
    return 0;
  }, [rpcData, lowStockProducts]);

  // F. Recent Orders
  const recentOrders = useMemo<Order[]>(() => {
    if (orders.length > 0) {
      return orders.slice(0, 5);
    }
    return [];
  }, [orders]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchRpcAnalytics(), fetchPeriodAnalytics()]);
  }, [fetchRpcAnalytics, fetchPeriodAnalytics]);

  return {
    balance,
    incomingOrdersCount,
    todaySales,
    totalProductsCount,
    lowStockCount,
    lowStockProducts,
    recentOrders,
    analytics,
    isLoading,
    refresh,
  };
};
