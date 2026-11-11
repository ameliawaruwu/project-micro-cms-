import { Order, ShippingStatus, CourierType, PaymentStatus, OrderItem } from '../types';
import { supabase, getSessionToken } from './supabaseClient';

/** Data pesanan yang boleh dilihat pembeli lewat halaman Lacak Pesanan (tanpa alamat / kontak). */
export interface TrackedOrder {
  orderNumber: string;
  createdAt: string;
  updatedAt?: string;
  paymentMethod: string;
  isPaid: boolean;
  paymentConfirmedAt?: string;
  paidAt?: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippedAt?: string;
  courier: string;
  courierService?: string;
  trackingNumber?: string;
  shippingCity?: string;
  shippingCost: number;
  totalAmount: number;
  items: Array<{ name: string; image?: string; variant?: string; price: number; quantity: number; subtotal: number }>;
}

export type TrackOrderResult =
  | { status: 'found'; order: TrackedOrder }
  | { status: 'not_found' | 'locked' | 'invalid' };

// ============================================================
// MERCHANT DATA ISOLATION: localStorage dipartisi per storeId
// Key format: microcms_orders_v2_{storeId}
// ============================================================
const ORDERS_KEY_PREFIX = 'microcms_orders_v2_';
// Hapus key global lama & data pesanan dummy legacy
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('microcms_orders_v1');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(ORDERS_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw && (raw.includes('utiy') || raw.includes('KB-9298') || raw.includes('ord-utiy'))) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const cleaned = list.filter(
                (o: any) =>
                  o &&
                  o.customerName?.toLowerCase() !== 'utiy' &&
                  !o.id?.includes('utiy') &&
                  !o.id?.includes('andhika')
              );
              localStorage.setItem(key, JSON.stringify(cleaned));
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      }
    }
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
    paymentConfirmedAt: row.payment_confirmed_at || undefined,
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
        return Array.isArray(parsed)
          ? parsed.filter(
              (o) =>
                o &&
                o.id &&
                o.customerName?.toLowerCase() !== 'utiy' &&
                !o.id.includes('utiy') &&
                !o.id.includes('ord-utiy')
            )
          : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveOrders(storeId: string, orders: Order[]) {
    const uniqueMap = new Map<string, Order>();
    orders.forEach((o) => {
      if (
        o &&
        o.id &&
        o.customerName?.toLowerCase() !== 'utiy' &&
        !o.id.includes('utiy') &&
        !o.id.includes('ord-utiy')
      ) {
        uniqueMap.set(o.id, o);
      }
    });
    localStorage.setItem(this.storeKey(storeId), JSON.stringify(Array.from(uniqueMap.values())));
  }

  async getOrdersByStore(storeId: string): Promise<Order[]> {
    if (!storeId) return [];

    let storeOrders = this.getStoredOrders(storeId);

    // Pesanan hanya bisa dibaca pengelola toko yang login (RLS). Pengunjung tanpa sesi
    // memakai salinan lokal agar cache-nya tidak terhapus oleh hasil kosong.
    if (!getSessionToken()) return storeOrders;

    // Fetch from Supabase PostgreSQL Database (filter by store_id)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (!error) {
        const dbOrders = (data || []).map(mapSupabaseRowToOrder);
        this.saveOrders(storeId, dbOrders);
        return dbOrders;
      }
    } catch (err) {
      console.warn('[Supabase Database] Error fetching orders:', err);
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

  /**
   * Buat pesanan lewat RPC `place_order`: harga, total, nomor pesanan, dan status (selalu
   * belum dibayar) ditentukan database. Status lunas & saldo toko hanya diubah server
   * setelah gateway pembayaran mengonfirmasi (lihat confirmGatewayPayment).
   */
  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> {
    const { data, error } = await supabase.rpc('place_order', {
      p_store_id: orderData.storeId,
      p_customer: {
        name: orderData.customerName,
        phone: orderData.customerPhone,
        email: orderData.customerEmail || null,
        address: orderData.customerAddress,
      },
      p_items: (orderData.items || []).map((it) => ({
        product_id: it.productId,
        quantity: it.quantity,
        variant_info: it.variantName || null,
      })),
      p_shipping: {
        cost: Math.max(0, Math.round(Number(orderData.shippingCost || 0))),
        city: orderData.customerCity || null,
        courier: orderData.courier || null,
        service: orderData.courierService || null,
        courier_code: orderData.courierCode || null,
        postal_code: orderData.customerPostalCode || null,
        origin_branch_id: orderData.originBranchId || null,
      },
      p_payment_method: orderData.paymentMethod || 'Manual',
      p_notes: orderData.notes || null,
    });
    if (error || !data) {
      console.error('[Supabase Database] Gagal membuat pesanan:', error);
      throw new Error(error?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    }

    const newOrder = mapSupabaseRowToOrder(data);
    // Simpan di perangkat pembeli agar halaman status pesanan tetap bisa menampilkannya.
    const orders = this.getStoredOrders(orderData.storeId);
    orders.unshift(newOrder);
    this.saveOrders(orderData.storeId, orders);
    return newOrder;
  }

  /**
   * Minta server memeriksa status transaksi ke payment gateway; bila lunas, server menandai
   * pesanan dibayar dan menambah saldo toko (sekali saja).
   */
  async confirmGatewayPayment(order: Order, merchantOrderId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/orders/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, merchantOrderId }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result?.paid) return false;
    } catch (err) {
      console.warn('[orderService] confirm-payment gagal:', err);
      return false;
    }
    const orders = this.getStoredOrders(order.storeId);
    const index = orders.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      orders[index] = { ...orders[index], paymentStatus: 'Sudah Dibayar', shippingStatus: 'Diproses' };
      this.saveOrders(order.storeId, orders);
    }
    return true;
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

  /**
   * Dipanggil pembeli setelah membayar via QRIS / transfer langsung ke rekening toko.
   * Hanya menandai "sudah konfirmasi"; status lunas tetap ditentukan merchant setelah cek mutasi.
   */
  async confirmPaymentByBuyer(orderId: string, storeId: string, orderNumber: string): Promise<string> {
    const { data, error } = await supabase.rpc('buyer_confirm_payment', {
      p_order_id: orderId,
      p_order_number: orderNumber,
    });
    if (error) {
      console.error('[Supabase Database] Gagal menyimpan konfirmasi pembayaran:', error);
      throw new Error('Gagal mengirim konfirmasi pembayaran. Silakan coba lagi.');
    }
    const confirmedAt = String(data || new Date().toISOString());

    const orders = this.getStoredOrders(storeId);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], paymentConfirmedAt: confirmedAt };
      this.saveOrders(storeId, orders);
    }
    return confirmedAt;
  }

  /** Pesanan yang pernah dibuat dari perangkat ini (salinan lokal), terbaru lebih dulu. */
  getLocalOrders(storeId: string): Order[] {
    if (!storeId) return [];
    return [...this.getStoredOrders(storeId)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  /**
   * Lacak pesanan tanpa login: nomor pesanan + nomor WhatsApp saat checkout harus cocok.
   * Server hanya mengembalikan status, kurir/resi, dan isi pesanan (tanpa alamat / kontak).
   */
  async trackOrder(storeId: string, orderNumber: string, phone: string): Promise<TrackOrderResult> {
    const { data, error } = await supabase.rpc('track_order', {
      p_store_id: storeId,
      p_order_number: orderNumber,
      p_phone: phone,
    });
    if (error) {
      console.error('[Supabase Database] Gagal melacak pesanan:', error);
      throw new Error('Gagal memuat status pesanan. Silakan coba lagi.');
    }
    const result = (data || {}) as { status?: string; order?: any };
    if (result.status !== 'found' || !result.order) {
      const status = result.status === 'locked' || result.status === 'invalid' ? result.status : 'not_found';
      return { status };
    }

    const row = result.order;
    const tracked: TrackedOrder = {
      orderNumber: String(row.order_number || ''),
      createdAt: row.created_at,
      updatedAt: row.updated_at || undefined,
      paymentMethod: String(row.payment_method || ''),
      isPaid: row.payment_status === 'paid',
      paymentConfirmedAt: row.payment_confirmed_at || undefined,
      paidAt: row.paid_at || undefined,
      orderStatus: (row.order_status || 'pending') as TrackedOrder['orderStatus'],
      shippedAt: row.shipped_at || undefined,
      courier: String(row.shipping_courier || row.courier_code || ''),
      courierService: row.courier_service || undefined,
      trackingNumber: row.tracking_number || undefined,
      shippingCity: row.shipping_city || undefined,
      shippingCost: Number(row.shipping_cost) || 0,
      totalAmount: Number(row.total_amount) || 0,
      items: (Array.isArray(row.items) ? row.items : []).map((item: any) => ({
        name: String(item.product_name || ''),
        image: item.product_image || undefined,
        variant: item.variant_info || undefined,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0,
        subtotal: Number(item.subtotal) || 0,
      })),
    };

    this.syncLocalStatus(storeId, tracked);
    return { status: 'found', order: tracked };
  }

  /** Perbarui salinan lokal pembeli agar halaman riwayat ikut menampilkan status terbaru. */
  private syncLocalStatus(storeId: string, tracked: TrackedOrder) {
    const orders = this.getStoredOrders(storeId);
    const index = orders.findIndex((o) => o.orderNumber === tracked.orderNumber);
    if (index === -1) return;
    const shippingStatus: Record<TrackedOrder['orderStatus'], ShippingStatus> = {
      pending: 'Baru',
      processing: 'Diproses',
      shipped: 'Dikirim',
      delivered: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    orders[index] = {
      ...orders[index],
      paymentStatus: tracked.isPaid ? 'Sudah Dibayar' : orders[index].paymentStatus,
      paymentConfirmedAt: tracked.paymentConfirmedAt || orders[index].paymentConfirmedAt,
      shippingStatus: shippingStatus[tracked.orderStatus] || orders[index].shippingStatus,
      resiNumber: tracked.trackingNumber || orders[index].resiNumber,
      trackingNumber: tracked.trackingNumber || orders[index].trackingNumber,
      shippedAt: tracked.shippedAt || orders[index].shippedAt,
    };
    this.saveOrders(storeId, orders);
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
