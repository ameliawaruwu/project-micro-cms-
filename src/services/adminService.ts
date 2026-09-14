import { Store, WithdrawalRequest, AdminPlatformStats, Order, PlatformSettings } from '../types';
import { initialStores } from './mockData';
import { storeService } from './storeService';

const WITHDRAWALS_KEY = 'microcms_admin_withdrawals_v1';
const STORE_SUSPENSIONS_KEY = 'microcms_admin_suspended_stores_v1';

const initialWithdrawals: WithdrawalRequest[] = [
  {
    id: 'wd-001',
    storeId: 'store-andhika',
    storeName: 'Toko Batik Nusantara',
    storeLogo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&auto=format&fit=crop&q=80',
    amount: 1450000,
    bankName: 'BCA',
    accountNumber: '8820 1928 34',
    accountHolder: 'Andhika Pratama',
    status: 'pending',
    requestedAt: '2026-09-07T08:30:00Z',
  },
  {
    id: 'wd-002',
    storeId: 'store-1',
    storeName: 'Batik Kirana Solo',
    storeLogo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100&auto=format&fit=crop&q=80',
    amount: 2800000,
    bankName: 'Mandiri',
    accountNumber: '1370 0019 8271',
    accountHolder: 'Kirana Pramudita',
    status: 'pending',
    requestedAt: '2026-09-06T14:15:00Z',
  },
  {
    id: 'wd-003',
    storeId: 'store-2',
    storeName: 'Kopi Kenangan Senja',
    storeLogo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&auto=format&fit=crop&q=80',
    amount: 750000,
    bankName: 'BRI',
    accountNumber: '0206 0100 2938 504',
    accountHolder: 'Rian Barista',
    status: 'approved',
    requestedAt: '2026-09-05T09:00:00Z',
    processedAt: '2026-09-05T10:30:00Z',
  },
  {
    id: 'wd-004',
    storeId: 'store-3',
    storeName: 'Sepatu Kulit Garut',
    storeLogo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&auto=format&fit=crop&q=80',
    amount: 3200000,
    bankName: 'BCA',
    accountNumber: '4210 9812 33',
    accountHolder: 'Hendra Artisan',
    status: 'approved',
    requestedAt: '2026-09-04T16:00:00Z',
    processedAt: '2026-09-04T17:15:00Z',
  },
];

class AdminService {
  private getStoredWithdrawals(): WithdrawalRequest[] {
    const raw = localStorage.getItem(WITHDRAWALS_KEY);
    if (!raw) {
      localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(initialWithdrawals));
      return initialWithdrawals;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialWithdrawals;
    }
  }

  private saveWithdrawals(list: WithdrawalRequest[]) {
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(list));
  }

  getSuspendedStoreIds(): string[] {
    const raw = localStorage.getItem(STORE_SUSPENSIONS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  toggleStoreSuspension(storeId: string): boolean {
    const suspended = this.getSuspendedStoreIds();
    let updated: string[];
    const isCurrentlySuspended = suspended.includes(storeId);
    if (isCurrentlySuspended) {
      updated = suspended.filter((id) => id !== storeId);
    } else {
      updated = [...suspended, storeId];
    }
    localStorage.setItem(STORE_SUSPENSIONS_KEY, JSON.stringify(updated));
    return !isCurrentlySuspended;
  }

  getAllStores(): Store[] {
    const raw = localStorage.getItem('microcms_stores_v2');
    if (!raw) return initialStores;
    try {
      const parsed: Store[] = JSON.parse(raw);
      return parsed.length > 0 ? parsed : initialStores;
    } catch {
      return initialStores;
    }
  }

  getWithdrawals(): WithdrawalRequest[] {
    return this.getStoredWithdrawals();
  }

  approveWithdrawal(id: string): boolean {
    const list = this.getStoredWithdrawals();
    const target = list.find((w) => w.id === id);
    if (!target) return false;

    target.status = 'approved';
    target.processedAt = new Date().toISOString();
    this.saveWithdrawals(list);
    return true;
  }

  rejectWithdrawal(id: string): boolean {
    const list = this.getStoredWithdrawals();
    const target = list.find((w) => w.id === id);
    if (!target) return false;

    target.status = 'rejected';
    target.processedAt = new Date().toISOString();
    this.saveWithdrawals(list);
    return true;
  }

  updateStorePlan(storeId: string, newPlan: 'free' | 'starter' | 'premium'): boolean {
    const raw = localStorage.getItem('microcms_stores_v2');
    if (!raw) return false;
    try {
      const parsed: Store[] = JSON.parse(raw);
      const target = parsed.find((s) => s.id === storeId);
      if (!target) return false;
      target.plan = newPlan;
      localStorage.setItem('microcms_stores_v2', JSON.stringify(parsed));
      return true;
    } catch {
      return false;
    }
  }

  getAllOrders(): Order[] {
    const raw = localStorage.getItem('microcms_orders_v1');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  getPlatformSettings(): PlatformSettings {
    const defaultSettings: PlatformSettings = {
      midtransEnvironment: ((import.meta as any).env?.VITE_MIDTRANS_ENV as any) || 'sandbox',
      midtransMerchantId: (import.meta as any).env?.VITE_MIDTRANS_MERCHANT_ID || 'G477630600',
      midtransClientKey: (import.meta as any).env?.VITE_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-6qHzXwHC6yMvkJ9J',
      midtransServerKey: (import.meta as any).env?.MIDTRANS_SERVER_KEY || 'SB-Mid-server-n197M_KyR7is6x0Ag4cZEIAj',
      biteshipEnabled: true,
      biteshipApiKey: 'biteship_test.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiVGVzdGluZyBNaWNyb0NNUyIsInVzZXJJZCI6IjZhYTc0ZjBlZjQyZTNkMzE1NDY2YmI1YSIsImlhdCI6MTc4OTM1MDA1MX0.TEmKBLYc6Ei-L4FfuCSH2JtNBAxrWR_imx3P9WddciA',
      biteshipOriginCity: 'Jakarta Selatan',
      waGatewayEnabled: true,
      waGatewayApiKey: 'fonnte_token_88921xks9021',
      waSenderPhone: '081289201928',
      platformFeePercent: 1.5,
      payoutMinAmount: 50000,
      payoutBankFee: 2500,
      autoApprovePayoutUnder: 500000,
      maintenanceMode: false,
    };

    const raw = localStorage.getItem('microcms_admin_settings_v1');
    if (!raw) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return defaultSettings;
    }
  }

  savePlatformSettings(settings: PlatformSettings) {
    localStorage.setItem('microcms_admin_settings_v1', JSON.stringify(settings));
  }

  getPlatformStats(): AdminPlatformStats {
    const stores = this.getAllStores();
    const withdrawals = this.getStoredWithdrawals();
    const suspended = this.getSuspendedStoreIds();

    const activeStores = stores.filter((s) => !suspended.includes(s.id)).length;
    const proSubscribers = stores.filter((s) => s.plan === 'premium' || s.plan === 'starter').length;

    // Platform GMV estimation based on stores balance & sample sales
    const totalBalance = stores.reduce((acc, s) => acc + (s.balance || 0), 0);
    const totalGmv = totalBalance * 4 + 48500000;
    const totalRevenueFee = Math.round(totalGmv * 0.015) + (proSubscribers * 99000);

    const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
    const pendingWithdrawalsCount = pendingWithdrawals.length;
    const pendingWithdrawalsAmount = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0);

    return {
      totalStores: stores.length,
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

