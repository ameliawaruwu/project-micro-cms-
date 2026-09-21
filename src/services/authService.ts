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

export async function hashPassword(plain: string): Promise<string> {
  if (!plain) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`kroomify_salt_v1_${plain}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return plain;
  }
}

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
    email: 'admin@kroomify.id',
    password: 'admin123',
    user: {
      id: 'usr-admin-1',
      name: 'Super Admin Kroomify',
      email: 'admin@kroomify.id',
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
      const existingEmails = new Set(parsed.map((a) => a.email.toLowerCase()));
      let changed = false;
      defaultAccounts.forEach((def) => {
        if (!existingIds.has(def.id) && !existingEmails.has(def.email.toLowerCase())) {
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

    // 1. Coba verifikasi aman server-side via Supabase RPC verify_user_credentials
    let verifiedDbUser: any = null;
    if (_password && _password !== 'google-auth') {
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('verify_user_credentials', {
          p_email: cleanEmail,
          p_password: _password,
        });
        if (!rpcErr && rpcRes) {
          if (rpcRes.success && rpcRes.user) {
            verifiedDbUser = rpcRes.user;
          } else if (rpcRes.message === 'Kata sandi tidak sesuai') {
            throw new Error('Kata sandi yang Anda masukkan salah.');
          }
        }
      } catch (rpcEx: any) {
        if (rpcEx.message === 'Kata sandi yang Anda masukkan salah.') throw rpcEx;
        console.warn('verify_user_credentials RPC notice:', rpcEx);
      }
    }

    // 2. Jika belum terverifikasi melalui RPC, cek metadata profil tanpa mengekspos hash
    let dbUser: any = verifiedDbUser;
    if (!dbUser && !account) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, phone, role, created_at')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (!error && data) {
          dbUser = data;
        }
      } catch (e) {
        console.warn('Supabase query user warning:', e);
      }
    }

    // Jika akun tidak ditemukan baik di lokal maupun di database
    if (!account && !dbUser) {
      throw new Error('Akun belum terdaftar. Silakan lakukan registrasi terlebih dahulu.');
    }

    // 3. Verifikasi kata sandi untuk akun lokal / fallback
    if (!verifiedDbUser && _password && _password !== 'google-auth') {
      const hashedInput = await hashPassword(_password);
      const expectedPassword = account?.password;
      const isMatch = expectedPassword === _password || expectedPassword === hashedInput;
      if (expectedPassword && !isMatch) {
        throw new Error('Kata sandi yang Anda masukkan salah.');
      }
    }

    let user: User;
    let merchant: Merchant;
    let storeToUse: Store | undefined;

    if (account) {
      user = account.user;
      merchant = account.merchant;

      // Find store belonging to this user
      const userStores = await storeService.getStoresForUser(user.id);
      if (userStores.length > 0) {
        storeToUse = userStores.find((s) => s.id === account!.storeId) || userStores[0];
      } else {
        // Merchant has not created a store yet
        storeToUse = undefined;
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
        // Merchant has not created a store yet
        storeToUse = undefined;
      }

      merchant = {
        id: `merch-${userId}`,
        userId: userId,
        storeId: storeToUse?.id || '',
        plan: 'free',
        isVerified: true,
      };

      const newAccount: StoredAccount = {
        id: userId,
        email: cleanEmail,
        password: await hashPassword(_password || 'password123'),
        user,
        merchant,
        storeId: storeToUse?.id || '',
      };

      accounts.push(newAccount);
      this.saveAccounts(accounts);
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(merchant));
    if (storeToUse) {
      localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(storeToUse));
      localStorage.setItem(ACTIVE_STORE_ID_KEY, storeToUse.id);
    } else {
      localStorage.removeItem(AUTH_STORE_KEY);
      localStorage.removeItem(ACTIVE_STORE_ID_KEY);
    }

    return { user, merchant, store: (storeToUse || null) as any };
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
      isPublished: false,
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
      plan: 'free',
      isVerified: true,
    };

    const hashedPassword = await hashPassword(params.password);

    // 1. Sync User to Supabase Database with hashed password
    try {
      const { error: dbUserErr } = await supabase.from('users').upsert({
        id: userId,
        email: cleanEmail,
        password_hash: hashedPassword,
        name: params.fullName.trim(),
        phone: params.phoneWhatsApp.trim() || null,
        role: 'merchant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (dbUserErr) {
        console.warn('⚠️ Supabase users upsert notice:', dbUserErr.message);
      } else {
        console.log('✅ User berhasil disimpan ke database Supabase:', cleanEmail);
      }
    } catch (err: any) {
      console.warn('⚠️ Supabase users connection notice:', err?.message || err);
    }

    // 2. Sync Store to Supabase Database
    try {
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
        plan: 'free',
        balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (dbStoreErr) {
        console.warn('⚠️ Supabase stores upsert notice:', dbStoreErr.message);
      } else {
        console.log('✅ Toko berhasil disimpan ke database Supabase:', store.name);
      }
    } catch (err: any) {
      console.warn('⚠️ Supabase stores connection notice:', err?.message || err);
    }


    // Save newly created store to storeService
    await storeService.createStore(store);

    // New stores start clean with 0 products

    // Save account into accounts repository with hashed password
    const accounts = this.getStoredAccounts();
    const existingIndex = accounts.findIndex((a) => a.id === userId || a.email.toLowerCase() === cleanEmail);
    const newAccountRecord: StoredAccount = {
      id: userId,
      email: cleanEmail,
      password: hashedPassword,
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
    const hasCustomStoreName = !!params.storeName && params.storeName.trim().length > 0;
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

    const userStores = await storeService.getStoresForUser(userId);
    const existingStore = userStores.length > 0 ? userStores[0] : undefined;

    const merchant: Merchant = {
      id: `merch-${userId}`,
      userId: userId,
      storeId: existingStore?.id || '',
      plan: 'free',
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
    } catch (e) {
      console.warn('Supabase Google auth insert warning:', e);
    }

    const newAccountRecord: StoredAccount = {
      id: userId,
      email: cleanEmail,
      password: 'google-oauth-managed',
      user,
      merchant,
      storeId: merchant.storeId,
    };

    accounts.push(newAccountRecord);
    this.saveAccounts(accounts);

    return { user, merchant, store: existingStore };
  }


  async forgotPassword(email: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Alamat email tidak valid.');
    }

    const accounts = this.getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      // Don't throw error to prevent email enumeration, but return true anyway
      return true;
    }

    // Generate a 6-digit token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store token in session storage
    sessionStorage.setItem(`reset_token_${cleanEmail}`, token);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: cleanEmail,
          subject: 'Kroomify - Token Reset Password Anda',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #66000E;">Permintaan Reset Kata Sandi</h2>
              <p>Halo,</p>
              <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Kroomify Anda. Gunakan token 6 digit di bawah ini untuk melanjutkan:</p>
              <div style="background-color: #F9EDEF; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #66000E;">${token}</span>
              </div>
              <p>Token ini hanya berlaku selama sesi ini. Jika Anda tidak meminta reset kata sandi, abaikan email ini.</p>
              <br/>
              <p style="font-size: 12px; color: #666;">Tim Kroomify</p>
            </div>
          `
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error invoking local email server:', result.error);
        throw new Error(result.error || 'Gagal mengirim email. Pastikan server lokal berjalan.');
      }
    } catch (err) {
      console.error('Failed to send email:', err);
      // Fallback to toast if function fails in local dev without CLI
      window.dispatchEvent(
        new CustomEvent('toast_notification', {
          detail: {
            message: `[GAGAL MENGIRIM EMAIL] Token Reset Password Anda: ${token}`,
            type: 'error',
            duration: 10000,
          },
        })
      );
    }

    return true;
  }

  async verifyResetToken(email: string, token: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 300));
    const cleanEmail = email.toLowerCase().trim();
    const storedToken = sessionStorage.getItem(`reset_token_${cleanEmail}`);
    
    if (!storedToken || storedToken !== token.trim()) {
      throw new Error('Token tidak valid atau sudah kadaluarsa.');
    }
    return true;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    const cleanEmail = email.toLowerCase().trim();
    
    // Verify token one last time
    const storedToken = sessionStorage.getItem(`reset_token_${cleanEmail}`);
    if (!storedToken || storedToken !== token.trim()) {
      throw new Error('Token tidak valid atau sudah kadaluarsa.');
    }

    const accounts = this.getStoredAccounts();
    const accountIndex = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);

    if (accountIndex === -1) {
      throw new Error('Akun tidak ditemukan.');
    }

    // Update password
    accounts[accountIndex].password = newPassword;
    this.saveAccounts(accounts);

    // Clean up token
    sessionStorage.removeItem(`reset_token_${cleanEmail}`);

    return true;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_MERCHANT_KEY);
    localStorage.removeItem(AUTH_STORE_KEY);
    localStorage.removeItem(ACTIVE_STORE_ID_KEY);
    localStorage.setItem('microcms_explicit_logout', 'true');
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }

  async validateSessionWithDatabase(userId: string, email: string): Promise<boolean> {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error) {
        // Jika ada kendala koneksi, tetap izinkan fallback lokal
        return true;
      }

      // Jika user bernilai null di database Supabase (artinya user telah dihapus di DB)
      if (!data) {
        console.warn(`[authService] User ${email} tidak ditemukan di database Supabase (telah dihapus). Membersihkan sesi lokal...`);
        const accounts = this.getStoredAccounts().filter((a) => a.email.toLowerCase() !== cleanEmail && a.id !== userId);
        this.saveAccounts(accounts);
        await this.logout();
        return false;
      }

      return true;
    } catch {
      return true;
    }
  }

  async syncLocalAccountsToSupabase(): Promise<void> {
    // Tidak lagi melakukan auto-resurrect akun yang sudah dihapus di database
  }

  updateActiveStore(store: Store): void {
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(store));
    localStorage.setItem(ACTIVE_STORE_ID_KEY, store.id);
  }
}


export const authService = new AuthService();
