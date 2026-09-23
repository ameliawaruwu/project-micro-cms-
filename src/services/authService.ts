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

export function getWibIsoString(date: Date = new Date()): string {
  const pad = (n: number, digits: number = 2) => String(n).padStart(digits, '0');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const ms = pad(date.getMilliseconds(), 3);
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}.${ms}+07:00`;
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

  purgeLocalAccount(email: string): void {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const accounts = this.getStoredAccounts().filter((a) => a.email.toLowerCase() !== cleanEmail);
      this.saveAccounts(accounts);

      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.email?.toLowerCase() === cleanEmail) {
          localStorage.removeItem(AUTH_USER_KEY);
          localStorage.removeItem(AUTH_MERCHANT_KEY);
          localStorage.removeItem(AUTH_STORE_KEY);
          localStorage.removeItem(ACTIVE_STORE_ID_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to purge local account:', e);
    }
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
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (!error) {
        if (data) {
          return true;
        } else {
          // Database secara definitif mengonfirmasi akun tidak ada (telah dihapus)
          this.purgeLocalAccount(cleanEmail);
          return false;
        }
      }
    } catch (e) {
      console.warn('Supabase check account error:', e);
    }
    const accounts = this.getStoredAccounts();
    return accounts.some((a) => a.email.toLowerCase() === cleanEmail);
  }

  async login(email: string, _password?: string): Promise<{ user: User; merchant: Merchant; store: Store }> {
    await new Promise((res) => setTimeout(res, 350));

    if (!email || !email.includes('@')) {
      throw new Error('Format email tidak valid.');
    }

    localStorage.removeItem('microcms_explicit_logout');
    const cleanEmail = email.toLowerCase().trim();

    // 1. Coba verifikasi aman server-side via Supabase RPC verify_user_credentials
    let verifiedDbUser: any = null;
    if (_password && _password !== 'google-auth') {
      try {
        const hashedPass = await hashPassword(_password);
        let { data: rpcRes, error: rpcErr } = await supabase.rpc('verify_user_credentials', {
          p_email: cleanEmail,
          p_password: _password,
        });

        // Fallback retry dengan hash jika database belum termigrasi atau password disimpan sebagai hash
        if ((!rpcErr && rpcRes && !rpcRes.success) || (rpcRes && rpcRes.message === 'Kata sandi tidak sesuai')) {
          const retryRes = await supabase.rpc('verify_user_credentials', {
            p_email: cleanEmail,
            p_password: hashedPass,
          });
          if (!retryRes.error && retryRes.data && retryRes.data.success) {
            rpcRes = retryRes.data;
            rpcErr = null;
          }
        }

        if (!rpcErr && rpcRes) {
          if (rpcRes.success && rpcRes.user) {
            verifiedDbUser = rpcRes.user;
          } else if (rpcRes.message === 'Akun tidak ditemukan') {
            // User sudah dihapus dari database Supabase
            this.purgeLocalAccount(cleanEmail);
            throw new Error('Akun tidak terdaftar atau telah dihapus dari sistem.');
          } else if (rpcRes.message === 'Kata sandi tidak sesuai') {
            throw new Error('Kata sandi yang Anda masukkan salah.');
          } else {
            throw new Error(rpcRes.message || 'Gagal masuk ke akun.');
          }
        }
      } catch (rpcEx: any) {
        if (
          rpcEx.message === 'Kata sandi yang Anda masukkan salah.' ||
          rpcEx.message === 'Akun tidak terdaftar atau telah dihapus dari sistem.'
        ) {
          throw rpcEx;
        }
        console.warn('verify_user_credentials RPC notice:', rpcEx);
      }
    }

    // 2. Jika belum terverifikasi melalui RPC (misal login Google atau RPC error), cek langsung ke database users
    let dbUser: any = verifiedDbUser;
    if (!dbUser) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, phone, role, created_at')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!error) {
          if (!data) {
            // Database secara eksplisit mengonfirmasi bahwa user TIDAK ADA (sudah dihapus)
            this.purgeLocalAccount(cleanEmail);
            throw new Error('Akun tidak terdaftar atau telah dihapus dari sistem.');
          }
          dbUser = data;
        }
      } catch (e: any) {
        if (e.message === 'Akun tidak terdaftar atau telah dihapus dari sistem.') {
          throw e;
        }
        console.warn('Supabase query user warning:', e);
      }
    }

    // 3. Jika database masih tidak dapat dihubungi dan dbUser kosong:
    if (!dbUser) {
      const accounts = this.getStoredAccounts();
      const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
      if (!account) {
        throw new Error('Akun belum terdaftar. Silakan lakukan registrasi terlebih dahulu.');
      }
      // Khusus mode offline darurat untuk akun demo
      if (account.id === 'usr-admin-1' || account.id === 'usr-andhika-01') {
        dbUser = {
          id: account.id,
          name: account.user.name,
          email: account.email,
          phone: account.user.phoneWhatsApp,
          role: account.user.role,
          password_hash: account.password,
          created_at: account.user.createdAt,
        };
      } else {
        // Akun reguler tidak diizinkan login jika tidak terverifikasi di database
        this.purgeLocalAccount(cleanEmail);
        throw new Error('Akun tidak terdaftar atau telah dihapus dari sistem.');
      }
    }

    // 4. Verifikasi kata sandi jika belum diverifikasi oleh RPC
    if (!verifiedDbUser && _password && _password !== 'google-auth') {
      if (dbUser.password_hash) {
        const hashedInput = await hashPassword(_password);
        const isMatch =
          dbUser.password_hash === _password ||
          dbUser.password_hash === hashedInput;
        if (!isMatch) {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }
      } else {
        throw new Error('Verifikasi kata sandi gagal.');
      }
    }

    // 5. Bangun user, merchant, dan store dari data database yang valid
    const userId = dbUser.id;
    const userName = dbUser.name || cleanEmail.split('@')[0];
    const userRole = (dbUser.role as 'admin' | 'merchant') || 'merchant';

    const user: User = {
      id: userId,
      name: userName,
      email: cleanEmail,
      phoneWhatsApp: dbUser.phone || '',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1F4072&color=FFD358&bold=true`,
      role: userRole,
      createdAt: dbUser.created_at || new Date().toISOString(),
    };

    // Cari toko milik pengguna ini
    let storeToUse: Store | undefined;
    const userStores = await storeService.getStoresForUser(userId);
    if (userStores.length > 0) {
      storeToUse = userStores[0];
    }

    const merchant: Merchant = {
      id: `merch-${userId}`,
      userId: userId,
      storeId: storeToUse?.id || '',
      plan: 'free',
      isVerified: true,
    };

    // Sinkronkan cache akun lokal dengan kredensial yang valid dari database
    const accounts = this.getStoredAccounts().filter((a) => a.email.toLowerCase() !== cleanEmail);
    accounts.push({
      id: userId,
      email: cleanEmail,
      password: await hashPassword(_password || 'password123'),
      user,
      merchant,
      storeId: storeToUse?.id || '',
    });
    this.saveAccounts(accounts);

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
    phoneWhatsApp?: string;
    storeName?: string;
    storeSlug?: string;
    businessCategory?: string;
    password: string;
    autoLogin?: boolean;
  }): Promise<{ user: User; merchant: Merchant; store: Store | null }> {
    await new Promise((res) => setTimeout(res, 450));

    const cleanEmail = params.email.toLowerCase().trim();
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

    const user: User = {
      id: userId,
      name: params.fullName.trim(),
      email: cleanEmail,
      phoneWhatsApp: (params.phoneWhatsApp || '').trim(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(params.fullName)}&background=1F4072&color=FFD358&bold=true`,
      role: 'merchant',
      createdAt: new Date().toISOString(),
    };

    // User only registers their account/merchant. NO store or draft template is created automatically.
    const merchant: Merchant = {
      id: `merch-${userId}`,
      userId: userId,
      storeId: '',
      plan: 'free',
      isVerified: true,
    };

    const hashedPassword = await hashPassword(params.password);

    // 1. Sync User to Supabase Database with hashed password
    try {
      const nowWib = getWibIsoString();
      let registered = false;
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc('register_new_user', {
          p_id: userId,
          p_email: cleanEmail,
          p_password_hash: hashedPassword,
          p_name: params.fullName.trim(),
          p_phone: (params.phoneWhatsApp || '').trim() || null,
          p_role: 'merchant',
        });
        if (!rpcErr && rpcData && rpcData.success) {
          registered = true;
          console.log('✅ User berhasil didaftarkan via RPC Supabase:', cleanEmail);
        } else if (rpcErr) {
          console.warn('⚠️ Supabase register_new_user RPC notice:', rpcErr.message);
        }
      } catch (rpcEx) {
        console.warn('RPC register notice, fallback to direct upsert:', rpcEx);
      }

      if (!registered) {
        const { error: dbUserErr } = await supabase.from('users').upsert({
          id: userId,
          email: cleanEmail,
          password_hash: hashedPassword,
          name: params.fullName.trim(),
          phone: (params.phoneWhatsApp || '').trim() || null,
          role: 'merchant',
          created_at: nowWib,
          updated_at: nowWib,
        }).select('id');

        if (dbUserErr) {
          console.error('❌ Supabase users upsert error:', dbUserErr.message);
        } else {
          console.log('✅ User berhasil disimpan ke database Supabase:', cleanEmail);
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Supabase users connection notice:', err?.message || err);
    }

    // Save account into local accounts repository with hashed password
    const accounts = this.getStoredAccounts();
    const existingIndex = accounts.findIndex((a) => a.id === userId || a.email.toLowerCase() === cleanEmail);
    const newAccountRecord: StoredAccount = {
      id: userId,
      email: cleanEmail,
      password: hashedPassword,
      user,
      merchant,
      storeId: '',
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = newAccountRecord;
    } else {
      accounts.push(newAccountRecord);
    }
    this.saveAccounts(accounts);

    // Clean any prior active store session & draft keys so newly registered user starts 100% clean
    localStorage.removeItem(AUTH_STORE_KEY);
    localStorage.removeItem(ACTIVE_STORE_ID_KEY);
    try {
      localStorage.removeItem('microcms_preview_draft');
      sessionStorage.removeItem('microcms_preview_draft');
      localStorage.removeItem('microcms_cms_products');
      sessionStorage.removeItem('microcms_cms_products');
    } catch (e) {}

    // Set Active Session ONLY if autoLogin is true (clean of any store)
    if (params.autoLogin) {
      localStorage.removeItem('microcms_explicit_logout');
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(merchant));
    }

    return { user, merchant, store: null };
  }

  async registerWithGoogle(params: {
    googleEmail: string;
    fullName?: string;
    storeName?: string;
    avatarUrl?: string;
  }): Promise<{ user: User; merchant: Merchant; store: Store | null }> {
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

    // User will create their store explicitly when ready. Do NOT automatically create a dummy store.
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
      const nowWib = getWibIsoString();
      await supabase.from('users').upsert({
        id: userId,
        email: cleanEmail,
        password_hash: 'google-oauth-managed',
        name: finalName,
        phone: null,
        role: 'merchant',
        created_at: nowWib,
        updated_at: nowWib,
      }).select('id');
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

    // Save active session to localStorage so user is immediately logged in
    localStorage.removeItem('microcms_explicit_logout');
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(merchant));
    if (existingStore) {
      localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(existingStore));
      localStorage.setItem(ACTIVE_STORE_ID_KEY, existingStore.id);
    } else {
      localStorage.removeItem(AUTH_STORE_KEY);
      localStorage.removeItem(ACTIVE_STORE_ID_KEY);
      try {
        localStorage.removeItem('microcms_preview_draft');
        sessionStorage.removeItem('microcms_preview_draft');
        localStorage.removeItem('microcms_cms_products');
        sessionStorage.removeItem('microcms_cms_products');
      } catch (e) {}
    }

    return { user, merchant, store: (existingStore || null) as any };
  }


  async forgotPassword(email: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Alamat email tidak valid.');
    }

    // 1. Cek keberadaan user di database Supabase atau di stored accounts
    let userExists = false;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (!error && data) {
        userExists = true;
      }
    } catch (e) {
      console.warn('Supabase check user in forgotPassword notice:', e);
    }

    const accounts = this.getStoredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (account) {
      userExists = true;
    }

    if (!userExists) {
      throw new Error('Alamat email belum terdaftar di sistem.');
    }

    // 2. Generate token 6 digit
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Simpan token di session storage dan local storage untuk verifikasi
    sessionStorage.setItem(`reset_token_${cleanEmail}`, token);
    localStorage.setItem(`reset_token_latest_${cleanEmail}`, token);

    // Kirim notifikasi toast ke UI berisi kode verifikasi
    window.dispatchEvent(
      new CustomEvent('toast_notification', {
        detail: {
          message: `Kode Verifikasi Reset Password: ${token}`,
          type: 'info',
          duration: 15000,
        },
      })
    );

    // Coba kirimkan email jika server lokal tersedia
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

      if (response.ok) {
        console.log('Email sent successfully via local mail server');
      }
    } catch (err) {
      // Ignored since fallback toast and in-app display already active
    }

    return true;
  }

  async verifyResetToken(email: string, token: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 300));
    const cleanEmail = email.toLowerCase().trim();
    const storedToken =
      sessionStorage.getItem(`reset_token_${cleanEmail}`) ||
      localStorage.getItem(`reset_token_latest_${cleanEmail}`);
    
    if (!storedToken || storedToken !== token.trim()) {
      throw new Error('Token verifikasi tidak valid atau sudah kadaluarsa.');
    }
    return true;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    const cleanEmail = email.toLowerCase().trim();
    
    // Verifikasi token
    const storedToken =
      sessionStorage.getItem(`reset_token_${cleanEmail}`) ||
      localStorage.getItem(`reset_token_latest_${cleanEmail}`);
    if (!storedToken || storedToken !== token.trim()) {
      throw new Error('Token verifikasi tidak valid atau sudah kadaluarsa.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter.');
    }

    // 1. Hash kata sandi baru dengan salt Kroomify
    const hashedPass = await hashPassword(newPassword);

    // 2. Perbarui ke database Supabase (public.users)
    try {
      const { error: dbError } = await supabase
        .from('users')
        .update({
          password_hash: hashedPass,
          updated_at: new Date().toISOString(),
        })
        .eq('email', cleanEmail);

      if (dbError) {
        console.warn('Supabase password update error:', dbError);
      }
    } catch (e) {
      console.warn('Failed to update password in Supabase:', e);
    }

    // 3. Perbarui akun lokal di localStorage jika ada
    const accounts = this.getStoredAccounts();
    const accountIndex = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
    if (accountIndex !== -1) {
      accounts[accountIndex].password = newPassword;
      this.saveAccounts(accounts);
    }

    // 4. Bersihkan token setelah berhasil digunakan
    sessionStorage.removeItem(`reset_token_${cleanEmail}`);
    localStorage.removeItem(`reset_token_latest_${cleanEmail}`);

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
