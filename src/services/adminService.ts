import { Store, WithdrawalRequest, AdminPlatformStats, Order, PlatformSettings } from '../types';
import { supabase } from './supabaseClient';
import { storeService } from './storeService';

const WITHDRAWALS_KEY = 'microcms_admin_withdrawals_v2';
const STORE_SUSPENSIONS_KEY = 'microcms_admin_suspended_stores_v1';
const STORES_CACHE_KEY = 'microcms_admin_stores_v2';
const ORDERS_CACHE_KEY = 'microcms_admin_orders_v2';
const SETTINGS_KEY = 'microcms_admin_settings_v1';

class AdminService {
  private getStoredWithdrawals(): WithdrawalRequest[] {
    const raw = localStorage.getItem(WITHDRAWALS_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveWithdrawals(list: WithdrawalRequest[]) {
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(list));
  }

  getSuspendedStoreIds(): string[] {
    const raw = localStorage.getItem(STORE_SUSPENSIONS_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async toggleStoreSuspension(storeId: string): Promise<boolean> {
    const suspended = this.getSuspendedStoreIds();
    let updated: string[];
    const isCurrentlySuspended = suspended.includes(storeId);
    if (isCurrentlySuspended) {
      updated = suspended.filter((id) => id !== storeId);
    } else {
      updated = [...suspended, storeId];
    }
    localStorage.setItem(STORE_SUSPENSIONS_KEY, JSON.stringify(updated));

    // Update in Supabase
    try {
      await supabase
        .from('stores')
        .update({ is_suspended: !isCurrentlySuspended })
        .eq('id', storeId);
    } catch (err) {
      console.warn('Failed to sync store suspension in Supabase:', err);
    }

    return !isCurrentlySuspended;
  }

  getAllStores(): Store[] {
    const raw = localStorage.getItem(STORES_CACHE_KEY);
    if (!raw) return [];
    try {
      const parsed: Store[] = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async fetchStoresFromDatabase(): Promise<Store[]> {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch stores error:', error.message);
        return this.getAllStores();
      }

      const mapped: Store[] = (data || []).map((s: any) => ({
        id: s.id,
        merchantId: s.user_id,
        name: s.name,
        slug: s.slug,
        tagline: s.tagline || '',
        description: s.description || '',
        logoUrl: s.logo_url || '',
        bannerUrl: s.banner_url || '',
        phoneWhatsApp: s.phone_whatsapp || '',
        address: s.address || '',
        addressDetail: s.address_detail || '',
        city: s.city || '',
        province: s.province || '',
        district: s.district || '',
        subdistrict: s.subdistrict || '',
        village: s.village || '',
        postalCode: s.postal_code || '',
        category: s.category || '',
        currency: 'IDR',
        balance: Number(s.balance || 0),
        plan: s.plan || 'free',
        isPublished: s.is_published ?? true,
        isSuspended: Boolean(s.is_suspended),
        onboarding: {
          storeNameSet: Boolean(s.name),
          productUploaded: false,
          paymentConnected: true,
        },
        createdAt: s.created_at || new Date().toISOString(),
      }));

      // Sync suspended list with DB state
      const suspendedFromDb = mapped.filter((s) => s.isSuspended).map((s) => s.id);
      if (suspendedFromDb.length > 0) {
        localStorage.setItem(STORE_SUSPENSIONS_KEY, JSON.stringify(suspendedFromDb));
      }

      localStorage.setItem(STORES_CACHE_KEY, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.warn('Network error fetching stores:', err);
      return this.getAllStores();
    }
  }

  getWithdrawals(): WithdrawalRequest[] {
    return this.getStoredWithdrawals();
  }

  async fetchWithdrawalsFromDatabase(): Promise<WithdrawalRequest[]> {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch withdrawals error:', error.message);
        return this.getWithdrawals();
      }

      const mapped: WithdrawalRequest[] = (data || []).map((r: any) => ({
        id: r.id,
        storeId: r.store_id,
        storeName: r.store_name,
        storeLogo: r.store_logo || '',
        amount: Number(r.amount || 0),
        bankName: r.bank_name || '',
        accountNumber: r.account_number || '',
        accountHolder: r.account_holder || '',
        status: r.status,
        requestedAt: r.requested_at,
        processedAt: r.processed_at,
      }));

      this.saveWithdrawals(mapped);
      return mapped;
    } catch (err) {
      console.warn('Network error fetching withdrawals:', err);
      return this.getWithdrawals();
    }
  }

  async approveWithdrawal(id: string): Promise<boolean> {
    const list = this.getStoredWithdrawals();
    const target = list.find((w) => w.id === id);
    const processedAt = new Date().toISOString();

    if (target) {
      target.status = 'approved';
      target.processedAt = processedAt;
      this.saveWithdrawals(list);
    }

    // Sync to Supabase
    try {
      await supabase
        .from('withdrawals')
        .update({ status: 'approved', processed_at: processedAt })
        .eq('id', id);

      await supabase
        .from('wallet_transactions')
        .update({ status: 'completed' })
        .eq('reference_id', id);
    } catch (err) {
      console.warn('Failed to update approved withdrawal in Supabase:', err);
    }

    return true;
  }

  async rejectWithdrawal(id: string): Promise<boolean> {
    const list = this.getStoredWithdrawals();
    const target = list.find((w) => w.id === id);
    const processedAt = new Date().toISOString();

    if (target) {
      target.status = 'rejected';
      target.processedAt = processedAt;
      this.saveWithdrawals(list);

      // Refund store balance
      try {
        const { data: storeData } = await supabase
          .from('stores')
          .select('balance')
          .eq('id', target.storeId)
          .single();

        if (storeData) {
          const newBalance = Number(storeData.balance || 0) + target.amount;
          await supabase
            .from('stores')
            .update({ balance: newBalance })
            .eq('id', target.storeId);
        }
      } catch (err) {
        console.warn('Failed to refund store balance in Supabase:', err);
      }
    }

    // Sync to Supabase
    try {
      await supabase
        .from('withdrawals')
        .update({ status: 'rejected', processed_at: processedAt })
        .eq('id', id);

      await supabase
        .from('wallet_transactions')
        .update({ status: 'rejected' })
        .eq('reference_id', id);
    } catch (err) {
      console.warn('Failed to update rejected withdrawal in Supabase:', err);
    }

    return true;
  }

  async updateStorePlan(storeId: string, newPlan: string): Promise<boolean> {
    const cached = this.getAllStores();
    const target = cached.find((s) => s.id === storeId);
    if (target) {
      target.plan = newPlan;
      localStorage.setItem(STORES_CACHE_KEY, JSON.stringify(cached));
    }

    try {
      await supabase
        .from('stores')
        .update({ plan: newPlan })
        .eq('id', storeId);
      return true;
    } catch (err) {
      console.warn('Failed to update store plan in Supabase:', err);
      return false;
    }
  }

  getAllOrders(): Order[] {
    const raw = localStorage.getItem(ORDERS_CACHE_KEY);
    if (!raw) return [];
    try {
      const parsed: Order[] = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async fetchOrdersFromDatabase(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch admin orders error:', error.message);
        return this.getAllOrders();
      }

      const mapped: Order[] = (data || []).map((row: any) => {
        const items = Array.isArray(row.order_items)
          ? row.order_items.map((it: any) => ({
              productId: it.product_id || '',
              productName: it.product_name || 'Produk',
              productImage: it.product_image || '',
              price: Number(it.price || 0),
              quantity: Number(it.quantity || 1),
              subtotal: Number(it.subtotal || 0),
              variantName: it.variant_info || undefined,
            }))
          : [];

        let shippingStatus = 'Baru';
        if (row.order_status === 'shipped') shippingStatus = 'Dikirim';
        else if (row.order_status === 'delivered') shippingStatus = 'Selesai';
        else if (row.order_status === 'cancelled') shippingStatus = 'Dibatalkan';
        else if (row.order_status === 'processing') shippingStatus = 'Diproses';

        let paymentStatus = 'Belum Dibayar';
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
          paymentStatus: paymentStatus as any,
          courier: row.shipping_courier || 'J&T',
          courierCode: row.courier_code || undefined,
          courierService: row.shipping_service || row.courier_service || undefined,
          resiNumber: row.tracking_number || undefined,
          trackingNumber: row.tracking_number || undefined,
          shippingStatus: shippingStatus as any,
          createdAt: row.created_at || new Date().toISOString(),
          shippedAt: row.shipped_at || undefined,
          notes: row.notes || undefined,
          shippingLabelUrl: row.shipping_label_url || undefined,
          shippingMethod: row.shipping_method || undefined,
        };
      });

      localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.warn('Network error fetching admin orders:', err);
      return this.getAllOrders();
    }
  }

  getPlatformSettings(): PlatformSettings {
    const defaultSettings: PlatformSettings = {
      midtransEnvironment: ((import.meta as any).env?.VITE_MIDTRANS_ENV as any) || 'sandbox',
      midtransMerchantId: (import.meta as any).env?.VITE_MIDTRANS_MERCHANT_ID || '',
      midtransClientKey: (import.meta as any).env?.VITE_MIDTRANS_CLIENT_KEY || '',
      midtransServerKey: (import.meta as any).env?.MIDTRANS_SERVER_KEY || '',
      biteshipEnabled: true,
      biteshipApiKey: (import.meta as any).env?.VITE_BITESHIP_API_KEY || (import.meta as any).env?.BITESHIP_API_KEY || '',
      biteshipOriginCity: 'Jakarta Selatan',
      waGatewayEnabled: false,
      waGatewayApiKey: (import.meta as any).env?.VITE_FONNTE_TOKEN || '',
      waSenderPhone: '',
      platformFeePercent: 1.5,
      payoutMinAmount: 50000,
      payoutBankFee: 2500,
      autoApprovePayoutUnder: 500000,
      maintenanceMode: false,
    };

    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return defaultSettings;
    }
  }

  async fetchPlatformSettingsFromDatabase(): Promise<PlatformSettings> {
    const current = this.getPlatformSettings();
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return current;
      }

      const mapped: PlatformSettings = {
        midtransEnvironment: (data.midtrans_environment as any) || current.midtransEnvironment,
        midtransMerchantId: data.midtrans_merchant_id || current.midtransMerchantId,
        midtransClientKey: data.midtrans_client_key || current.midtransClientKey,
        midtransServerKey: data.midtrans_server_key || current.midtransServerKey,
        biteshipEnabled: data.biteship_enabled ?? current.biteshipEnabled,
        biteshipApiKey: current.biteshipApiKey,
        biteshipOriginCity: data.biteship_origin_city || current.biteshipOriginCity,
        waGatewayEnabled: data.wa_gateway_enabled ?? current.waGatewayEnabled,
        waGatewayApiKey: current.waGatewayApiKey,
        waSenderPhone: data.wa_sender_phone || current.waSenderPhone,
        platformFeePercent: Number(data.platform_fee_percent || current.platformFeePercent),
        payoutMinAmount: Number(data.payout_min_amount || current.payoutMinAmount),
        payoutBankFee: Number(data.payout_bank_fee || current.payoutBankFee),
        autoApprovePayoutUnder: Number(data.auto_approve_payout_under || current.autoApprovePayoutUnder),
        maintenanceMode: Boolean(data.maintenance_mode),
      };

      localStorage.setItem(SETTINGS_KEY, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.warn('Network error fetching platform settings:', err);
      return current;
    }
  }

  async savePlatformSettings(settings: PlatformSettings): Promise<void> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    try {
      await supabase
        .from('platform_settings')
        .update({
          midtrans_environment: settings.midtransEnvironment,
          midtrans_merchant_id: settings.midtransMerchantId,
          midtrans_client_key: settings.midtransClientKey,
          midtrans_server_key: settings.midtransServerKey,
          biteship_enabled: settings.biteshipEnabled,
          biteship_origin_city: settings.biteshipOriginCity,
          wa_gateway_enabled: settings.waGatewayEnabled,
          wa_sender_phone: settings.waSenderPhone,
          platform_fee_percent: settings.platformFeePercent,
          payout_min_amount: settings.payoutMinAmount,
          payout_bank_fee: settings.payoutBankFee,
          auto_approve_payout_under: settings.autoApprovePayoutUnder,
          maintenance_mode: settings.maintenanceMode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'SET001');
    } catch (err) {
      console.warn('Failed to sync platform settings to Supabase:', err);
    }
  }

  getPlatformStats(stores?: Store[], withdrawals?: WithdrawalRequest[], orders?: Order[]): AdminPlatformStats {
    const currentStores = stores || this.getAllStores();
    const currentWithdrawals = withdrawals || this.getStoredWithdrawals();
    const currentOrders = orders || this.getAllOrders();
    const suspended = this.getSuspendedStoreIds();

    const activeStores = currentStores.filter((s) => !suspended.includes(s.id) && !s.isSuspended).length;
    const proSubscribers = currentStores.filter((s) => s.plan && s.plan !== 'free').length;

    // GMV from real paid orders, or aggregate balance of real stores
    const paidOrdersTotal = currentOrders
      .filter((o) => o.paymentStatus === 'Sudah Dibayar')
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const totalBalance = currentStores.reduce((acc, s) => acc + (s.balance || 0), 0);
    const totalGmv = paidOrdersTotal > 0 ? paidOrdersTotal : totalBalance;

    const settings = this.getPlatformSettings();
    const feePercent = (settings.platformFeePercent || 1.5) / 100;
    const totalRevenueFee = Math.round(totalGmv * feePercent);

    const pendingWithdrawals = currentWithdrawals.filter((w) => w.status === 'pending');
    const pendingWithdrawalsCount = pendingWithdrawals.length;
    const pendingWithdrawalsAmount = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0);

    return {
      totalStores: currentStores.length,
      activeStores,
      totalGmv,
      totalRevenueFee,
      proSubscribers,
      pendingWithdrawalsCount,
      pendingWithdrawalsAmount,
    };
  }
}

export const adminService = new AdminService();
