import { User, Merchant, Store } from '../types';
import { initialStores } from './mockData';
import { storeService } from './storeService';
import { productService } from './productService';
import { supabase } from './supabaseClient';

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

  async checkAccountExists(email: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    const accounts = this.getStoredAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return true;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (!error && data) {
        return true;
      }
    } catch (e) {
      console.warn('Supabase check account error:', e);
    }
    return false;
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

    // Also check Supabase DB
    let dbUser: any = null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (!error && data) {
        dbUser = data;
      }
    } catch (e) {
      console.warn('Supabase query user warning:', e);
    }

    // If account doesn't exist in local accounts AND not in Supabase DB:
    if (!account && !dbUser) {
      throw new Error('Akun belum terdaftar. Silakan lakukan registrasi terlebih dahulu.');
    }

    // Password validation:
    const expectedPassword = account?.password || dbUser?.password_hash;
    if (_password && _password !== 'google-auth' && expectedPassword && _password !== expectedPassword) {
      throw new Error('Kata sandi yang Anda masukkan salah.');
    }

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
            phoneWhatsApp: user.phoneWhatsApp || '',
            city: 'Indonesia',
            address: 'Pusat Usaha UMKM',
            category: 'Bisnis UMKM',
            currency: 'IDR',
          });
        }
      }
    } else {
      // Account exists in Supabase DB but not yet in localStorage
      const userId = dbUser.id || `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      const userName = dbUser.name || cleanEmail.split('@')[0];
      const userRole = (dbUser.role as 'admin' | 'merchant') || 'merchant';

      user = {
        id: userId,
        name: userName,
        email: cleanEmail,
        phoneWhatsApp: dbUser.phone || '',
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1F4072&color=FFD358&bold=true`,
        role: userRole,
        createdAt: dbUser.created_at || new Date().toISOString(),
      };

      // Check stores for this user
      let userStores = await storeService.getStoresForUser(userId);
      if (userStores.length > 0) {
        storeToUse = userStores[0];
      } else {
        const storeName = `Toko ${userName}`;
        const storeSlug = `toko-${cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '')}`;
        storeToUse = await storeService.createStore({
          merchantId: userId,
          name: storeName,
          slug: storeSlug,
          tagline: `Katalog Resmi ${storeName}`,
          description: 'Pusat belanja online praktis dan cepat.',
          logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=FFD358&color=002A45&bold=true`,
          bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
          phoneWhatsApp: dbUser.phone || '',
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
        password: dbUser.password_hash || _password || 'password123',
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
    autoLogin?: boolean;
  }): Promise<{ user: User; merchant: Merchant; store: Store }> {
    await new Promise((res) => setTimeout(res, 450));

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

    // 1. Sync User to Supabase Database
    const { error: dbUserErr } = await supabase.from('users').upsert({
      id: userId,
      email: cleanEmail,
      password_hash: params.password,
      name: params.fullName.trim(),
      phone: params.phoneWhatsApp.trim() || null,
      role: 'merchant',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (dbUserErr) {
      console.error('❌ Supabase users upsert error:', dbUserErr);
      throw new Error(`Gagal menyimpan akun ke database: ${dbUserErr.message}`);
    }
    console.log('✅ User berhasil disimpan ke database Supabase:', cleanEmail);

    // 2. Sync Store to Supabase Database
    const { error: dbStoreErr } = await supabase.from('stores').upsert({
      id: store.id,
      user_id: userId,
      name: store.name,
      slug: store.slug,
      tagline: store.tagline,
      description: store.description,
      logo_url: store.logoUrl,
      banner_url: store.bannerUrl,
      phone_whatsapp: store.phoneWhatsApp,
      city: store.city || 'Indonesia',
      category: store.category,
      plan: 'starter',
      balance: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (dbStoreErr) {
      console.error('❌ Supabase stores upsert error:', dbStoreErr);
      throw new Error(`Gagal menyimpan toko ke database: ${dbStoreErr.message}`);
    }
    console.log('✅ Toko berhasil disimpan ke database Supabase:', store.name);


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

    // Set Active Session ONLY if autoLogin is true
    if (params.autoLogin) {
      localStorage.removeItem('microcms_explicit_logout');
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(merchant));
      localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(store));
      localStorage.setItem(ACTIVE_STORE_ID_KEY, store.id);
    }

    return { user, merchant, store };
  }

  async registerWithGoogle(params: {
    googleEmail: string;
    fullName?: string;
    storeName?: string;
    avatarUrl?: string;
  }): Promise<{ user: User; merchant: Merchant; store: Store }> {
    await new Promise((res) => setTimeout(res, 450));

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
      phoneWhatsApp: '',
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
      phoneWhatsApp: '',
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

    // Sync to Supabase Database
    try {
      await supabase.from('users').upsert({
        id: userId,
        email: cleanEmail,
        password_hash: 'google-oauth-managed',
        name: finalName,
        phone: null,
        role: 'merchant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await supabase.from('stores').upsert({
        id: store.id,
        user_id: userId,
        name: finalStoreName,
        slug: storeSlug,
        tagline: `Toko Resmi ${finalStoreName}`,
        description: store.description,
        phone_whatsapp: '',
        category: 'Bisnis UMKM',
        city: 'Indonesia',
        address: 'Pusat Usaha UMKM',
        plan: 'starter',
        balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase Google auth insert warning:', e);
    }

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

    return { user, merchant, store };
  }


  async forgotPassword(identifier: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    const cleanInput = identifier.toLowerCase().trim();
    if (!cleanInput || cleanInput.length < 2) {
      throw new Error('Mohon masukkan email atau username yang valid.');
    }

    const accounts = this.getStoredAccounts();
    let account = accounts.find((a) =>
      a.email.toLowerCase() === cleanInput ||
      a.user.name.toLowerCase() === cleanInput ||
      a.user.id.toLowerCase() === cleanInput ||
      (a.user.phoneWhatsApp && a.user.phoneWhatsApp.replace(/[^0-9]/g, '') === cleanInput.replace(/[^0-9]/g, ''))
    );

    // If account not in local memory repository, check Supabase DB
    if (!account) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, email, name, role, created_at, phone')
          .or(`email.eq.${cleanInput},name.ilike.%${cleanInput}%`)
          .maybeSingle();

        if (!error && data) {
          account = {
            id: data.id,
            email: data.email,
            user: {
              id: data.id,
              name: data.name || data.email.split('@')[0],
              email: data.email,
              phoneWhatsApp: data.phone || '',
              role: (data.role as any) || 'merchant',
              createdAt: data.created_at || new Date().toISOString(),
            },
            merchant: {
              id: `merch-${data.id}`,
              userId: data.id,
              storeId: `store-${data.id}`,
              plan: 'starter',
              isVerified: true,
            },
            storeId: `store-${data.id}`,
          };
          accounts.push(account);
          this.saveAccounts(accounts);
        }
      } catch (e) {
        console.warn('Supabase query user warning in forgotPassword:', e);
      }
    }

    // If account is still not found anywhere:
    if (!account) {
      throw new Error('Akun dengan email atau username tersebut belum terdaftar.');
    }

    const targetEmail = account.email.toLowerCase().trim();

    // Always generate a FRESH 6-digit random token on EVERY SINGLE REQUEST!
    const token = Math.floor(100000 + Math.random() * 900000).toString();

    // Store token by both targetEmail AND input cleanInput
    sessionStorage.setItem(`reset_token_${targetEmail}`, token);
    sessionStorage.setItem(`reset_token_${cleanInput}`, token);
    localStorage.setItem(`reset_token_${targetEmail}`, token);
    localStorage.setItem(`reset_token_${cleanInput}`, token);
    localStorage.setItem(`reset_token_latest_${targetEmail}`, token);
    localStorage.setItem(`reset_token_latest_${cleanInput}`, token);
    localStorage.setItem(`reset_token_time_${targetEmail}`, Date.now().toString());

    console.log(`[AUTH RESET TOKEN] Email Target: ${targetEmail} | Kode Token OTP: ${token}`);

    // Dispatch email notification via /api/send-email
    try {
      const emailSubject = 'Kode Token Verifikasi Reset Password Kroombox';
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 26px; font-weight: 900; color: #66000E;">Kroombox</span>
          </div>
          <h2 style="font-size: 18px; font-weight: bold; color: #1A1110; margin-bottom: 8px;">Atur Ulang Kata Sandi</h2>
          <p style="font-size: 14px; color: #4a5568; line-height: 1.5; margin-bottom: 16px;">
            Halo <strong>${account.user.name || targetEmail}</strong>,<br/>
            Kami menerima permintaan untuk mengatur ulang kata sandi akun Kroombox Anda. Masukkan kode token verifikasi 6-digit berikut pada halaman verifikasi:
          </p>
          <div style="background-color: #FFF1F0; border: 1px dashed #FFA39E; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #66000E; font-family: monospace;">${token}</span>
          </div>
          <p style="font-size: 12px; color: #718096; line-height: 1.4; margin-bottom: 20px;">
            Kode token ini bersifat rahasia dan berlaku selama 15 menit. Jika Anda tidak melakukan permintaan ini, abaikan pesan ini.
          </p>
          <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
          <p style="font-size: 11px; color: #a0aec0; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} Kroombox Platform. All rights reserved.
          </p>
        </div>
      `;

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: emailSubject,
          html: emailHtml,
        }),
      }).catch((err) => {
        console.warn('[EmailService] API send-email fetch warning:', err);
      });
    } catch (e) {
      console.warn('[EmailService] Gagal mengirim email reset password:', e);
    }

    return true;
  }

  async verifyResetToken(identifier: string, token: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 300));
    const cleanInput = identifier.toLowerCase().trim();
    const cleanToken = token.trim();

    const accounts = this.getStoredAccounts();
    const account = accounts.find((a) =>
      a.email.toLowerCase() === cleanInput ||
      a.user.name.toLowerCase() === cleanInput ||
      a.user.id.toLowerCase() === cleanInput
    );
    const targetEmail = account ? account.email.toLowerCase().trim() : cleanInput;

    const storedToken =
      sessionStorage.getItem(`reset_token_${targetEmail}`) ||
      sessionStorage.getItem(`reset_token_${cleanInput}`) ||
      localStorage.getItem(`reset_token_${targetEmail}`) ||
      localStorage.getItem(`reset_token_${cleanInput}`) ||
      localStorage.getItem(`reset_token_latest_${targetEmail}`);

    if (!storedToken || storedToken !== cleanToken) {
      throw new Error('Token tidak valid atau sudah kadaluarsa. Silakan minta token baru.');
    }
    return true;
  }

  async resetPassword(identifier: string, token: string, newPassword: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    const cleanInput = identifier.toLowerCase().trim();
    const cleanToken = token.trim();

    const accounts = this.getStoredAccounts();
    let accountIndex = accounts.findIndex((a) =>
      a.email.toLowerCase() === cleanInput ||
      a.user.name.toLowerCase() === cleanInput ||
      a.user.id.toLowerCase() === cleanInput
    );

    const targetEmail = accountIndex !== -1 ? accounts[accountIndex].email.toLowerCase().trim() : cleanInput;

    // Verify token one last time
    const storedToken =
      sessionStorage.getItem(`reset_token_${targetEmail}`) ||
      sessionStorage.getItem(`reset_token_${cleanInput}`) ||
      localStorage.getItem(`reset_token_${targetEmail}`) ||
      localStorage.getItem(`reset_token_${cleanInput}`) ||
      localStorage.getItem(`reset_token_latest_${targetEmail}`);

    if (!storedToken || storedToken !== cleanToken) {
      throw new Error('Token tidak valid atau sudah kadaluarsa. Silakan periksa kembali token Anda.');
    }

    if (accountIndex === -1) {
      // Check if user exists in Supabase
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .or(`email.eq.${cleanInput},name.ilike.%${cleanInput}%`)
          .maybeSingle();

        if (data) {
          const newAccountRecord: StoredAccount = {
            id: data.id,
            email: data.email,
            password: newPassword,
            user: {
              id: data.id,
              name: data.name || data.email.split('@')[0],
              email: data.email,
              phoneWhatsApp: data.phone || '',
              role: data.role || 'merchant',
              createdAt: data.created_at || new Date().toISOString(),
            },
            merchant: {
              id: `merch-${data.id}`,
              userId: data.id,
              storeId: `store-${data.id}`,
              plan: 'starter',
              isVerified: true,
            },
            storeId: `store-${data.id}`,
          };
          accounts.push(newAccountRecord);
          accountIndex = accounts.length - 1;
        }
      } catch (e) {
        console.warn('Supabase query user warning during password reset:', e);
      }
    }

    if (accountIndex !== -1) {
      accounts[accountIndex].password = newPassword;
      this.saveAccounts(accounts);
    }

    // Also update Supabase database users table
    try {
      await supabase.from('users').update({
        password_hash: newPassword,
        updated_at: new Date().toISOString(),
      }).or(`email.eq.${targetEmail},name.ilike.%${cleanInput}%`);
    } catch (e) {
      console.warn('Supabase password update warning:', e);
    }

    // Clean up tokens
    sessionStorage.removeItem(`reset_token_${targetEmail}`);
    sessionStorage.removeItem(`reset_token_${cleanInput}`);
    localStorage.removeItem(`reset_token_${targetEmail}`);
    localStorage.removeItem(`reset_token_${cleanInput}`);
    localStorage.removeItem(`reset_token_latest_${targetEmail}`);

    return true;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_MERCHANT_KEY);
    localStorage.removeItem(AUTH_STORE_KEY);
    localStorage.removeItem(ACTIVE_STORE_ID_KEY);
    localStorage.setItem('microcms_explicit_logout', 'true');
  }

  async syncLocalAccountsToSupabase(): Promise<void> {
    const accounts = this.getStoredAccounts();
    for (const acc of accounts) {
      if (acc.email === 'admin@kroombox.id' || acc.email === 'andhika@gmail.com') continue;
      try {
        const { error: uErr } = await supabase.from('users').upsert({
          id: acc.id,
          email: acc.email,
          password_hash: acc.password || 'password123',
          name: acc.user.name,
          phone: acc.user.phoneWhatsApp || null,
          role: acc.user.role || 'merchant',
          created_at: acc.user.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (!uErr) {
          console.log('🔄 Synced local user to Supabase:', acc.email);
        }
      } catch (e) {
        console.warn('Sync local user warning:', e);
      }
    }
  }

  updateActiveStore(store: Store): void {
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(store));
    localStorage.setItem(ACTIVE_STORE_ID_KEY, store.id);
  }
}


export const authService = new AuthService();
