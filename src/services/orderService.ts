import { Order, ShippingStatus, CourierType, PaymentStatus } from '../types';
import { initialOrders } from './mockData';
import { supabase } from './supabaseClient';

const ORDERS_KEY = 'microcms_orders_v1';

class OrderService {
  private getStoredOrders(): Order[] {
    const data = localStorage.getItem(ORDERS_KEY);
    if (!data) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(initialOrders));
      return initialOrders;
    }
    try {
      const parsed: Order[] = JSON.parse(data);
      const orderMap = new Map<string, Order>();
      parsed.forEach((o) => {
        if (o && o.id) {
          orderMap.set(o.id, o);
        }
      });

      let modified = false;
      initialOrders.forEach((o) => {
        if (!orderMap.has(o.id)) {
          orderMap.set(o.id, o);
          modified = true;
        }
      });

      const uniqueOrders = Array.from(orderMap.values());
      if (modified || uniqueOrders.length !== parsed.length) {
        this.saveOrders(uniqueOrders);
      }
      return uniqueOrders;
    } catch {
      return initialOrders;
    }
  }

  private saveOrders(orders: Order[]) {
    const uniqueMap = new Map<string, Order>();
    orders.forEach((o) => {
      if (o && o.id) {
        uniqueMap.set(o.id, o);
      }
    });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(Array.from(uniqueMap.values())));
  }

  async getOrdersByStore(storeId: string): Promise<Order[]> {
    let orders = this.getStoredOrders();
    let storeOrders = orders.filter((o) => o.storeId === storeId);

    // If store has 0 orders, seed starter orders for this store
    if (storeOrders.length === 0) {
      const templateOrders = initialOrders.slice(0, 4).map((item, idx) => ({
        ...item,
        id: `ord-${storeId}-${idx + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        storeId,
        orderNumber: `KB-${Math.floor(8000 + Math.random() * 1900)}`,
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
      }));

      orders = [...templateOrders, ...orders];
      this.saveOrders(orders);
      return templateOrders;
    }

    return storeOrders;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const orders = this.getStoredOrders();
    return orders.find((o) => o.id === id);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
    const orders = this.getStoredOrders();
    const orderNumber = `MC-${Math.floor(1000 + Math.random() * 9000)}`;
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${uniqueSuffix}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, shippingStatus: ShippingStatus, resiNumber?: string): Promise<Order> {
    const orders = this.getStoredOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    orders[index] = {
      ...orders[index],
      shippingStatus,
      ...(resiNumber ? { resiNumber } : {}),
      ...(shippingStatus === 'Dikirim' ? { shippedAt: new Date().toISOString() } : {}),
    };
    this.saveOrders(orders);
    return orders[index];
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const orders = this.getStoredOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    orders[index] = {
      ...orders[index],
      paymentStatus,
    };
    this.saveOrders(orders);
    return orders[index];
  }

  async processShipment(orderId: string, courier: CourierType, resiNumber?: string): Promise<Order> {
    const autoResi = resiNumber || `${courier.toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const orders = this.getStoredOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    orders[index] = {
      ...orders[index],
      courier,
      resiNumber: autoResi,
      trackingNumber: autoResi,
      shippingStatus: 'Dikirim',
      shippedAt: new Date().toISOString(),
    };
    this.saveOrders(orders);
    return orders[index];
  }

  async processShipmentWithBiteship(params: {
    orderId: string;
    courier?: CourierType;
    courierCode?: string;
    courierService?: string;
    trackingNumber: string;
    shippingLabelUrl?: string;
    shippingMethod?: 'pickup' | 'drop_off';
    originBranchId?: string;
    pickupTime?: string;
  }): Promise<Order> {
    const orders = this.getStoredOrders();
    const index = orders.findIndex((o) => o.id === params.orderId);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    const current = orders[index];
    const updatedOrder: Order = {
      ...current,
      courier: params.courier || current.courier,
      courierCode: params.courierCode || current.courierCode || params.courier?.toLowerCase(),
      courierService: params.courierService || current.courierService,
      resiNumber: params.trackingNumber,
      trackingNumber: params.trackingNumber,
      shippingLabelUrl: params.shippingLabelUrl || current.shippingLabelUrl,
      shippingMethod: params.shippingMethod || current.shippingMethod || 'drop_off',
      originBranchId: params.originBranchId || current.originBranchId,
      pickupTime: params.pickupTime || current.pickupTime,
      shippingStatus: 'ready_to_ship',
      shippedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    this.saveOrders(orders);
    return updatedOrder;
  }

  async getDashboardMetrics(storeId: string): Promise<{
    pendingOrdersCount: number;
    todaySales: number;
    totalOrdersCount: number;
    shippedOrdersCount: number;
    lowStockCount: number;
  }> {
    const orders = await this.getOrdersByStore(storeId);
    
    // Pending orders need processing: Baru & Diproses
    const pendingOrders = orders.filter((o) => o.shippingStatus === 'Baru' || o.shippingStatus === 'Diproses');
    
    // Sum of paid orders
    const paidOrders = orders.filter((o) => o.paymentStatus === 'Sudah Dibayar');
    const todaySales = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    return {
      pendingOrdersCount: pendingOrders.length,
      todaySales,
      totalOrdersCount: orders.length,
      shippedOrdersCount: orders.filter((o) => o.shippingStatus === 'Dikirim').length,
      lowStockCount: 0,
    };
  }

  /**
   * Berlangganan (Subscribe) perubahan pesanan secara Real-Time via Supabase WebSocket
   */
  subscribeToOrderChanges(storeId: string, onUpdate: (updatedOrder: Order) => void): () => void {
    try {
      const channel = supabase
        .channel(`realtime:orders:${storeId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `store_id=eq.${storeId}`,
          },
          (payload: any) => {
            if (payload?.new && payload.new.id) {
              const row = payload.new;
              const stored = this.getStoredOrders();
              const idx = stored.findIndex((o) => o.id === row.id);
              if (idx !== -1) {
                const merged: Order = {
                  ...stored[idx],
                  shippingStatus: row.shipping_status || stored[idx].shippingStatus,
                  resiNumber: row.tracking_number || stored[idx].resiNumber,
                  trackingNumber: row.tracking_number || stored[idx].trackingNumber,
                  shippingLabelUrl: row.shipping_label_url || stored[idx].shippingLabelUrl,
                  shippingMethod: row.shipping_method || stored[idx].shippingMethod,
                  courierCode: row.courier_code || stored[idx].courierCode,
                  courierService: row.courier_service || stored[idx].courierService,
                  pickupTime: row.pickup_time || stored[idx].pickupTime,
                  shippedAt: row.shipped_at || stored[idx].shippedAt,
                };
                stored[idx] = merged;
                this.saveOrders(stored);
                onUpdate(merged);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription error in orderService:', err);
      return () => {};
    }
  }
}

export const orderService = new OrderService();

