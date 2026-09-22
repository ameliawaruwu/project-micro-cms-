import { Order, ShippingStatus, CourierType, PaymentStatus, OrderItem } from '../types';
import { initialOrders } from './mockData';
import { supabase } from './supabaseClient';

// ============================================================
// MERCHANT DATA ISOLATION: localStorage dipartisi per storeId
// Key format: microcms_orders_v2_{storeId}
// ============================================================
const ORDERS_KEY_PREFIX = 'microcms_orders_v2_';
// Hapus key global lama
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('microcms_orders_v1');
  } catch { /* ignore */ }
}

function mapSupabaseRowToOrder(row: any): Order {
  const items: OrderItem[] = Array.isArray(row.order_items)
    ? row.order_items.map((it: any) => ({
        productId: it.product_id || '',
        productName: it.product_name || 'Produk Toko',
        productImage: it.product_image || '',
        price: Number(it.price || 0),
        quantity: Number(it.quantity || 1),
        subtotal: Number(it.subtotal || 0),
        variantName: it.variant_info || undefined,
      }))
    : [];

  let shippingStatus: ShippingStatus = 'Baru';
  if (row.order_status === 'shipped') shippingStatus = 'Dikirim';
  else if (row.order_status === 'delivered') shippingStatus = 'Selesai';
  else if (row.order_status === 'cancelled') shippingStatus = 'Dibatalkan';
  else if (row.order_status === 'processing') shippingStatus = 'Diproses';

  let paymentStatus: PaymentStatus = 'Belum Dibayar';
  if (row.payment_status === 'paid') paymentStatus = 'Sudah Dibayar';
  else if (row.payment_status === 'expired' || row.payment_status === 'refunded') paymentStatus = 'Gagal';

  const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0) || Number(row.total_amount || 0);

  return {
    id: row.id,
    storeId: row.store_id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email || undefined,
    customerAddress: row.shipping_address || row.destination_address || '',
    customerCity: row.shipping_city || '',
    customerPostalCode: row.destination_postal_code || undefined,
    items,
    subtotal,
    shippingCost: Number(row.shipping_cost || 0),
    discount: 0,
    grandTotal: Number(row.total_amount || subtotal),
    paymentMethod: row.payment_method || 'Manual',
    paymentStatus,
    courier: (row.shipping_courier as CourierType) || 'J&T',
    courierCode: row.courier_code || undefined,
    courierService: row.shipping_service || row.courier_service || undefined,
    resiNumber: row.tracking_number || undefined,
    trackingNumber: row.tracking_number || undefined,
    shippingStatus,
    createdAt: row.created_at || new Date().toISOString(),
    shippedAt: row.shipped_at || undefined,
    notes: row.notes || undefined,
    shippingLabelUrl: row.shipping_label_url || undefined,
    shippingMethod: row.shipping_method || undefined,
  };
}

class OrderService {
  private storeKey(storeId: string): string {
    return `${ORDERS_KEY_PREFIX}${storeId}`;
  }

  private getStoredOrders(storeId?: string): Order[] {
    if (storeId) {
      const data = localStorage.getItem(this.storeKey(storeId));
      if (!data) return [];
      try {
        const parsed: Order[] = JSON.parse(data);
        return Array.isArray(parsed) ? parsed.filter((o) => o && o.id) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveOrders(storeId: string, orders: Order[]) {
    const uniqueMap = new Map<string, Order>();
    orders.forEach((o) => {
      if (o && o.id) uniqueMap.set(o.id, o);
    });
    localStorage.setItem(this.storeKey(storeId), JSON.stringify(Array.from(uniqueMap.values())));
  }

  async getOrdersByStore(storeId: string): Promise<Order[]> {
    let storeOrders = this.getStoredOrders(storeId);

    // 1. Fetch from Supabase PostgreSQL Database (selalu filter by store_id)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const dbOrders = data.map(mapSupabaseRowToOrder);
        const map = new Map<string, Order>();
        dbOrders.forEach((o) => map.set(o.id, o));
        storeOrders.forEach((o) => {
          if (!map.has(o.id)) map.set(o.id, o);
        });
        const combined = Array.from(map.values());
        this.saveOrders(storeId, combined);
        return combined;
      }
    } catch (err) {
      console.warn('[Supabase Database] Error fetching orders:', err);
    }

    // Demo order untuk toko bawaan saja
    const hasUtiy = storeOrders.some((o) => o.customerName.toLowerCase() === 'utiy');
    if (storeId === 'store-andhika' && !hasUtiy && storeOrders.length === 0) {
      const utiyOrder: Order = {
        id: `ord-${storeId}-utiy-${Date.now()}`,
        storeId,
        orderNumber: `KB-${Math.floor(9100 + Math.random() * 800)}`,
        customerName: 'utiy',
        customerPhone: '081223344556',
        customerEmail: 'utiy@telkomuniversity.ac.id',
        customerAddress: 'Gedung Asrama Putri / Gedung Pelangi, Telkom University, Jl. Telekomunikasi No. 1, Terusan Buahbatu, Sukapura, Kec. Dayeuhkolot',
        customerCity: 'Kab. Bandung, Jawa Barat',
        customerPostalCode: '40257',
        items: [
          {
            productId: 'prod-andhika-101',
            productName: 'Kemeja Batik Tulis Modern Heritage Lengan Panjang',
            productImage: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80',
            price: 185000,
            quantity: 1,
            subtotal: 185000,
            variantName: 'Size M',
          },
        ],
        subtotal: 185000,
        shippingCost: 14000,
        discount: 0,
        grandTotal: 199000,
        paymentMethod: 'QRIS',
        paymentStatus: 'Sudah Dibayar',
        courier: 'J&T',
        courierService: 'EZ Regular (1-2 Hari)',
        resiNumber: '',
        shippingStatus: 'Baru',
        createdAt: new Date().toISOString(),
        notes: 'Kirim ke pos satpam / lobi asrama Telkom University Bandung. Tolong hubungi WA sebelum sampai.',
      };
      const allOrders = [utiyOrder, ...storeOrders];
      this.saveOrders(storeId, allOrders);
      return allOrders;
    }

    return storeOrders;
  }

  async getOrderById(id: string, storeId?: string): Promise<Order | undefined> {
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id);
      // Validasi ownership jika storeId diberikan
      if (storeId) query = query.eq('store_id', storeId);
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return mapSupabaseRowToOrder(data);
      }
    } catch {
      // ignore
    }

    const orders = this.getStoredOrders(storeId);
    return orders.find((o) => o.id === id);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
    const orders = this.getStoredOrders(orderData.storeId);
    const orderNumber = `KB-${Math.floor(1000 + Math.random() * 9000)}`;
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord_${uniqueSuffix}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };

    // 1. Save locally for instantaneous response (partisi per storeId)
    orders.unshift(newOrder);
    this.saveOrders(orderData.storeId, orders);

    // 2. Persist to Supabase Database
    try {
      const dbPaymentStatus = newOrder.paymentStatus === 'Sudah Dibayar' ? 'paid' : 'unpaid';
      let dbOrderStatus = 'pending';
      if (newOrder.shippingStatus === 'Dikirim') dbOrderStatus = 'shipped';
      else if (newOrder.shippingStatus === 'Selesai') dbOrderStatus = 'delivered';
      else if (newOrder.shippingStatus === 'Dibatalkan') dbOrderStatus = 'cancelled';
      else if (newOrder.shippingStatus === 'Diproses') dbOrderStatus = 'processing';

      const { error: orderErr } = await supabase.from('orders').insert([
        {
          id: newOrder.id,
          store_id: newOrder.storeId,
          order_number: newOrder.orderNumber,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          customer_email: newOrder.customerEmail || null,
          shipping_address: newOrder.customerAddress,
          shipping_city: newOrder.customerCity || 'Indonesia',
          shipping_courier: newOrder.courier || 'Kurir Toko',
          shipping_service: newOrder.courierService || 'Reguler',
          shipping_cost: newOrder.shippingCost || 0,
          tracking_number: newOrder.resiNumber || newOrder.trackingNumber || null,
          total_amount: newOrder.grandTotal,
          payment_method: newOrder.paymentMethod || 'Manual',
          payment_status: dbPaymentStatus,
          order_status: dbOrderStatus,
          notes: newOrder.notes || null,
          destination_address: newOrder.customerAddress,
          destination_postal_code: newOrder.customerPostalCode || null,
          created_at: newOrder.createdAt,
          updated_at: new Date().toISOString(),
        },
      ]);

      if (orderErr) {
        console.warn('[Supabase Database] Error inserting order:', orderErr);
      } else {
        console.log(`[Supabase Database] Pesanan ${newOrder.orderNumber} tersimpan di cloud!`);
      }

      // Insert items
      if (newOrder.items && newOrder.items.length > 0) {
        const dbItems = newOrder.items.map((it, idx) => ({
          id: `itm_${newOrder.id}_${idx + 1}`,
          order_id: newOrder.id,
          product_id: it.productId || null,
          product_name: it.productName,
          product_image: it.productImage || null,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.subtotal,
          variant_info: it.variantName || null,
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(dbItems);
        if (itemsErr) {
          console.warn('[Supabase Database] Error inserting order_items:', itemsErr);
        } else {
          console.log(`[Supabase Database] ${dbItems.length} item pesanan tersimpan di cloud!`);
        }
      }
    } catch (err) {
      console.warn('[Supabase Database] Gagal sinkron pesanan ke cloud:', err);
    }

    return newOrder;
  }

  async updateOrderStatus(orderId: string, shippingStatus: ShippingStatus, resiNumber?: string, storeId?: string): Promise<Order> {
    const orders = this.getStoredOrders(storeId);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    // Validasi ownership
    if (storeId && orders[index].storeId !== storeId) {
      throw new Error('Tidak diizinkan mengubah pesanan milik toko lain');
    }

    const resolvedStoreId = storeId || orders[index].storeId;

    orders[index] = {
      ...orders[index],
      shippingStatus,
      ...(resiNumber ? { resiNumber } : {}),
      ...(shippingStatus === 'Dikirim' ? { shippedAt: new Date().toISOString() } : {}),
    };
    this.saveOrders(resolvedStoreId, orders);

    // Sync to Supabase dengan ownership check
    try {
      let dbOrderStatus = 'pending';
      if (shippingStatus === 'Dikirim') dbOrderStatus = 'shipped';
      else if (shippingStatus === 'Selesai') dbOrderStatus = 'delivered';
      else if (shippingStatus === 'Dibatalkan') dbOrderStatus = 'cancelled';
      else if (shippingStatus === 'Diproses') dbOrderStatus = 'processing';

      const updatePayload: any = {
        order_status: dbOrderStatus,
        updated_at: new Date().toISOString(),
      };
      if (resiNumber) updatePayload.tracking_number = resiNumber;
      if (shippingStatus === 'Dikirim') updatePayload.shipped_at = new Date().toISOString();

      let query = supabase.from('orders').update(updatePayload).eq('id', orderId);
      if (resolvedStoreId) query = query.eq('store_id', resolvedStoreId); // ownership check
      await query;
      console.log(`[Supabase Database] Status pesanan ${orderId} diupdate: ${dbOrderStatus}`);
    } catch (err) {
      console.warn('[Supabase Database] Update order status notice:', err);
    }

    return orders[index];
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, storeId?: string): Promise<Order> {
    const orders = this.getStoredOrders(storeId);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    // Validasi ownership
    if (storeId && orders[index].storeId !== storeId) {
      throw new Error('Tidak diizinkan mengubah pembayaran pesanan milik toko lain');
    }

    const resolvedStoreId = storeId || orders[index].storeId;

    orders[index] = {
      ...orders[index],
      paymentStatus,
    };
    this.saveOrders(resolvedStoreId, orders);

    // Sync to Supabase dengan ownership check
    try {
      const dbPaymentStatus = paymentStatus === 'Sudah Dibayar' ? 'paid' : 'unpaid';
      const updatePayload: any = {
        payment_status: dbPaymentStatus,
        updated_at: new Date().toISOString(),
      };
      if (paymentStatus === 'Sudah Dibayar') updatePayload.paid_at = new Date().toISOString();

      let query = supabase.from('orders').update(updatePayload).eq('id', orderId);
      if (resolvedStoreId) query = query.eq('store_id', resolvedStoreId); // ownership check
      await query;
      console.log(`[Supabase Database] Status pembayaran ${orderId} diupdate: ${dbPaymentStatus}`);
    } catch (err) {
      console.warn('[Supabase Database] Update payment status notice:', err);
    }

    return orders[index];
  }

  async processShipment(orderId: string, courier: CourierType, resiNumber?: string, storeId?: string): Promise<Order> {
    const autoResi = resiNumber || `${courier.toUpperCase()}${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const orders = this.getStoredOrders(storeId);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    const resolvedStoreId = storeId || orders[index].storeId;

    orders[index] = {
      ...orders[index],
      courier,
      resiNumber: autoResi,
      trackingNumber: autoResi,
      shippingStatus: 'Dikirim',
      shippedAt: new Date().toISOString(),
    };
    this.saveOrders(resolvedStoreId, orders);

    try {
      let query = supabase.from('orders').update({
        order_status: 'shipped',
        shipping_courier: courier,
        tracking_number: autoResi,
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', orderId);
      if (resolvedStoreId) query = query.eq('store_id', resolvedStoreId); // ownership check
      await query;
    } catch (err) {
      console.warn('[Supabase Database] processShipment sync notice:', err);
    }

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
    storeId?: string;
  }): Promise<Order> {
    const orders = this.getStoredOrders(params.storeId);
    const index = orders.findIndex((o) => o.id === params.orderId);
    if (index === -1) throw new Error('Pesanan tidak ditemukan');

    const current = orders[index];
    const resolvedStoreId = params.storeId || current.storeId;
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
    this.saveOrders(resolvedStoreId, orders);

    try {
      let query = supabase.from('orders').update({
        order_status: 'processing',
        tracking_number: params.trackingNumber,
        shipping_label_url: params.shippingLabelUrl || null,
        shipping_method: params.shippingMethod || 'drop_off',
        origin_branch_id: params.originBranchId || null,
        pickup_time: params.pickupTime || null,
        courier_code: params.courierCode || null,
        courier_service: params.courierService || null,
        updated_at: new Date().toISOString(),
      }).eq('id', params.orderId);
      if (resolvedStoreId) query = query.eq('store_id', resolvedStoreId); // ownership check
      await query;
    } catch (err) {
      console.warn('[Supabase Database] processShipmentWithBiteship sync notice:', err);
    }

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
    const pendingOrders = orders.filter((o) => o.shippingStatus === 'Baru' || o.shippingStatus === 'Diproses');
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
              // Pastikan hanya proses event untuk storeId yang benar
              if (row.store_id !== storeId) return;
              const stored = this.getStoredOrders(storeId);
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
                this.saveOrders(storeId, stored);
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
