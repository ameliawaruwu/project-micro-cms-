import { User, Merchant, Store } from '../types';
import { initialStores } from './mockData';
import { storeService } from './storeService';
import { productService } from './productService';

const AUTH_USER_KEY = 'microcms_auth_user';
const AUTH_MERCHANT_KEY = 'microcms_auth_merchant';
const AUTH_STORE_KEY = 'microcms_active_store';
const ACCOUNTS_KEY = 'microcms_accounts_v1';
const ACTIVE_STORE_ID_KEY = 'microcms_active_store_id';

interface StoredAccount {
  id: string; // userId
  email: string;
  password?: string;
  user: User;
  merchant: Merchant;
  storeId: string;
}

const defaultAccounts: StoredAccount[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@kroombox.id',
    password: 'admin123',
    user: {
      id: 'usr-admin-1',
      name: 'Super Admin Kroombox',
      email: 'admin@kroombox.id',
      phoneWhatsApp: '081289201928',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00Z',
    },
    merchant: {
      id: 'merch-admin',
      userId: 'usr-admin-1',
      storeId: 'store-andhika',
      plan: 'premium',
      isVerified: true,
    },
    storeId: 'store-andhika',
  },
  {
    id: 'usr-andhika-01',
    email: 'andhika@gmail.com',
    password: 'password123',
    user: {
      id: 'usr-andhika-01',
      name: 'Andhika Pratama',
      email: 'andhika@gmail.com',
      phoneWhatsApp: '081234567890',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: 'merchant',
      createdAt: '2026-01-10T08:00:00Z',
    },
    merchant: {
      id: 'merch-usr-andhika-01',
      userId: 'usr-andhika-01',
      storeId: 'store-andhika',
      plan: 'starter',
      isVerified: true,
    },
    storeId: 'store-andhika',
  },
];

class AuthService {
  private getStoredAccounts(): StoredAccount[] {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
      return defaultAccounts;
    }
    try {
      const parsed: StoredAccount[] = JSON.parse(raw);
      // Merge with defaultAccounts if missing
      const existingIds = new Set(parsed.map((a) => a.id));
      let changed = false;
      defaultAccounts.forEach((def) => {
        if (!existingIds.has(def.id)) {
          parsed.push(def);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return defaultAccounts;
    }
  }

  private saveAccounts(accounts: StoredAccount[]) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  getCurrentUser(): { user: User | null; merchant: Merchant | null; store: Store | null } {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const storedMerchant = localStorage.getItem(AUTH_MERCHANT_KEY);
      const storedStore = localStorage.getItem(AUTH_STORE_KEY);

      if (storedUser && storedMerchant) {
        return {
          user: JSON.parse(storedUser),
          merchant: JSON.parse(storedMerchant),
          store: storedStore ? JSON.parse(storedStore) : null,
        };
      }

      return {
        user: null,
        merchant: null,
        store: null,
      };
    } catch {
      return {
        user: null,
        merchant: null,
        store: null,
      };
    }
  }

  async login(email: string, _password?: string): Promise<{ user: User; merchant: Merchant; store: Store }> {
    await new Promise((res) => setTimeout(res, 350));

    if (!email || !email.includes('@')) {
      throw new Error('Format email tidak valid.');
    }

    localStorage.removeItem('microcms_explicit_logout');
    const cleanEmail = email.toLowerCase().trim();
    const accounts = this.getStoredAccounts();

    let account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    let user: User;
    let merchant: Merchant;
    let storeToUse: Store;

    if (account) {
      user = account.user;
      merchant = account.merchant;

      // Find store belonging to this user
      const userStores = await storeService.getStoresForUser(user.id);
      if (userStores.length > 0) {
        storeToUse = userStores.find((s) => s.id === account!.storeId) || userStores[0];
      } else {
        // Find in all stores or create fresh
        const fallbackStore = await storeService.getStoreById(account.storeId);
        if (fallbackStore) {
          storeToUse = { ...fallbackStore, merchantId: user.id };
          await storeService.createStore(storeToUse);
        } else {
          storeToUse = await storeService.createStore({
            merchantId: user.id,
            name: `Toko ${user.name}`,
            slug: `toko-${user.id.slice(-6)}`,
            tagline: `Toko Resmi ${user.name}`,
            description: 'Katalog online dan pemesanan praktis via WhatsApp.',
            logoUrl: user.avatarUrl,
            bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
            phoneWhatsApp: user.phoneWhatsApp || '081234567890',
            city: 'Indonesia',
            address: 'Pusat Usaha UMKM',
            category: 'Bisnis UMKM',
            currency: 'IDR',
          });
        }
      }
    } else {
      // Create new account entry for this email
      const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      const userName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const storeName = `Toko ${userName}`;
      const storeSlug = `toko-${cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '')}`;

      user = {
        id: userId,
        name: userName,
        email: cleanEmail,
        phoneWhatsApp: '081234567890',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1F4072&color=FFD358&bold=true`,
        role: 'merchant',
        createdAt: new Date().toISOString(),
      };

      // Check if user already had a store previously
      let userStores = await storeService.getStoresForUser(userId);
      if (userStores.length > 0) {
        storeToUse = userStores[0];
      } else {
        storeToUse = await storeService.createStore({
          merchantId: userId,
          name: storeName,
          slug: storeSlug,
          tagline: `Katalog Resmi ${storeName}`,
          description: 'Pusat belanja online praktis dan cepat.',
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=FFD358&color=002A45&bold=true`,
          bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
          phoneWhatsApp: '081234567890',
          city: 'Indonesia',
          address: 'Pusat Usaha UMKM',
          category: 'Bisnis UMKM',
          currency: 'IDR',
        });
      }

      merchant = {
        id: `merch-${userId}`,
        userId: userId,
        storeId: storeToUse.id,
        plan: 'starter',
        isVerified: true,
      };

      const newAccount: StoredAccount = {
        id: userId,
        email: cleanEmail,
        password: _password || 'password123',
        user,
        merchant,
        storeId: storeToUse.id,
      };

      accounts.push(newAccount);
      this.saveAccounts(accounts);
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(merchant));
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(storeToUse));
    localStorage.setItem(ACTIVE_STORE_ID_KEY, storeToUse.id);

    return { user, merchant, store: storeToUse };
  }

  async register(params: {
    fullName: string;
    email: string;
    phoneWhatsApp: string;
    storeName: string;
    storeSlug: string;
    businessCategory: string;
    password: string;
  }): Promise<{ user: User; merchant: Merchant; store: Store }> {
    await new Promise((res) => setTimeout(res, 450));

    localStorage.removeItem('microcms_explicit_logout');

    const cleanEmail = params.email.toLowerCase().trim();
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const storeId = `store_${Date.now()}`;
    const rawSlug = params.storeSlug || params.storeName;
    const slug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const user: User = {
      id: userId,
      name: params.fullName.trim(),
      email: cleanEmail,
      phoneWhatsApp: params.phoneWhatsApp.trim(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(params.fullName)}&background=1F4072&color=FFD358&bold=true`,
      role: 'merchant',
      createdAt: new Date().toISOString(),
    };

    const store: Store = {
      id: storeId,
      merchantId: userId,
      name: params.storeName.trim(),
      slug: slug || `toko-${userId.slice(-6)}`,
      tagline: `Toko Resmi ${params.storeName.trim()}`,
      description: `Menyediakan produk ${params.businessCategory} pilihan berkualitas dengan respon cepat via WhatsApp.`,
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(params.storeName)}&background=FFD358&color=002A45&bold=true`,
      bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      phoneWhatsApp: params.phoneWhatsApp.trim(),
      city: 'Indonesia',
      address: 'Pusat Usaha UMKM',
      category: params.businessCategory,
      currency: 'IDR',
      balance: 0,
      onboarding: {
        storeNameSet: true,
        productUploaded: false,
        paymentConnected: false,
      },
      createdAt: new Date().toISOString(),
    };

    const merchant: Merchant = {
      id: `merch-${userId}`,
      userId: userId,
      storeId: storeId,
      plan: 'starter',
      isVerified: true,
    };

    // Save newly created store to storeService
    await storeService.createStore(store);

    // Create initial starter sample products for this brand category
    try {
      await productService.createProduct(store.id, {
        name: `Paket Pilihan ${params.storeName}`,
        price: 95000,
        originalPrice: 120000,
        stock: 25,
        sku: 'PROD-001',
        category: params.businessCategory,
        description: `Produk unggulan berkualitas dari ${params.storeName}. Dibuat dengan standar terbaik dan siap kirim ke seluruh Indonesia.`,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        weightGrams: 350,
      });

      await productService.createProduct(store.id, {
        name: `Koleksi Spesial ${params.businessCategory}`,
        price: 150000,
        originalPrice: 185000,
        stock: 15,
        sku: 'PROD-002',
        category: params.businessCategory,
        description: `Varian eksklusif terfavorit dengan jaminan kepuasan pelanggan dan garansi original.`,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        weightGrams: 500,
      });
    } catch (e) {
      console.warn('Could not seed initial products for new store:', e);
    }

    // Save account into accounts repository
    const accounts = this.getStoredAccounts();
    const existingIndex = accounts.findIndex((a) => a.id === userId || a.email.toLowerCase() === cleanEmail);
    const newAccountRecord: StoredAccount = {
      id: userId,
      email: cleanEmail,
      password: params.password,
      user,
      merchant,
      storeId: store.id,
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = newAccountRecord;
    } else {
      accounts.push(newAccountRecord);
    }
    this.saveAccounts(accounts);

    // Set Active Session
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(merchant));
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(store));
    localStorage.setItem(ACTIVE_STORE_ID_KEY, store.id);

    return { user, merchant, store };
  }

  async registerWithGoogle(params: {
    googleEmail: string;
    fullName?: string;
    storeName?: string;
    avatarUrl?: string;
  }): Promise<{ user: User; merchant: Merchant; store: Store }> {
    await new Promise((res) => setTimeout(res, 450));

    localStorage.removeItem('microcms_explicit_logout');

    const cleanEmail = params.googleEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Alamat Google Account tidak valid.');
    }

    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const accounts = this.getStoredAccounts();
    const existing = accounts.find((a) => a.id === userId || a.email.toLowerCase() === cleanEmail);

    if (existing) {
      // User already registered via Google before, log them in
      return this.login(cleanEmail, 'google-auth');
    }

    const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const finalName = (params.fullName || defaultName).trim();
    const finalStoreName = (params.storeName || `Toko ${finalName}`).trim();
    const storeSlug = `toko-${cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '')}`;
    const storeId = `store_${Date.now()}`;

    const userAvatar =
      params.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=66000E&color=FFFFFF&bold=true`;

    const user: User = {
      id: userId,
      name: finalName,
      email: cleanEmail,
      phoneWhatsApp: '081234567890',
      avatarUrl: userAvatar,
      role: 'merchant',
      createdAt: new Date().toISOString(),
    };

    const store: Store = {
      id: storeId,
      merchantId: userId,
      name: finalStoreName,
      slug: storeSlug,
      tagline: `Toko Resmi ${finalStoreName}`,
      description: 'Pusat belanja produk berkualitas dengan pemesanan mudah dan cepat.',
      logoUrl: userAvatar,
      bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      phoneWhatsApp: '081234567890',
      city: 'Indonesia',
      address: 'Pusat Usaha UMKM',
      category: 'Bisnis UMKM',
      currency: 'IDR',
      balance: 0,
      onboarding: {
        storeNameSet: true,
        productUploaded: false,
        paymentConnected: false,
      },
      createdAt: new Date().toISOString(),
    };

    const merchant: Merchant = {
      id: `merch-${userId}`,
      userId: userId,
      storeId: storeId,
      plan: 'starter',
      isVerified: true,
    };

    // Save newly created store to storeService
    await storeService.createStore(store);

    // Create initial starter sample products
    try {
      await productService.createProduct(store.id, {
        name: `Paket Perdana ${finalStoreName}`,
        price: 85000,
        originalPrice: 110000,
        stock: 30,
        sku: 'PROD-001',
        category: 'Produk Unggulan',
        description: `Produk pilihan berkualitas dari ${finalStoreName}. Siap dikirim ke seluruh Indonesia.`,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        weightGrams: 350,
      });

      await productService.createProduct(store.id, {
        name: 'Koleksi Spesial UMKM',
        price: 135000,
        originalPrice: 165000,
        stock: 20,
        sku: 'PROD-002',
        category: 'Produk Unggulan',
        description: 'Varian eksklusif dengan mutu terjamin dan respon cepat.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
        weightGrams: 450,
      });
    } catch (e) {
      console.warn('Could not seed initial products for new Google user:', e);
    }

    const newAccountRecord: StoredAccount = {
      id: userId,
      email: cleanEmail,
      password: 'google-oauth-managed',
      user,
      merchant,
      storeId: store.id,
    };

    accounts.push(newAccountRecord);
    this.saveAccounts(accounts);

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(merchant));
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(store));
    localStorage.setItem(ACTIVE_STORE_ID_KEY, store.id);

    return { user, merchant, store };
  }

  async forgotPassword(email: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    if (!email || !email.includes('@')) {
      throw new Error('Alamat email tidak valid.');
    }
    return true;
  }

  async resetPassword(_token: string, _newPassword: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    return true;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_MERCHANT_KEY);
    localStorage.removeItem(AUTH_STORE_KEY);
    localStorage.removeItem(ACTIVE_STORE_ID_KEY);
    localStorage.setItem('microcms_explicit_logout', 'true');
  }

  updateActiveStore(store: Store): void {
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(store));
    localStorage.setItem(ACTIVE_STORE_ID_KEY, store.id);
  }
}

export const authService = new AuthService();
