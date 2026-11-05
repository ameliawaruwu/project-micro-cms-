import { User, Merchant, Store } from '../types';
import { storeService } from './storeService';
import { productService } from './productService';
import { supabase } from './supabaseClient';
import { idService } from './idService';

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
    id: 'USR001',
    email: 'admin@lapakq.com',
    password: 'bantuumkm2344@',
    user: {
      id: 'USR001',
      name: 'Super Admin LapakQ',
      email: 'admin@lapakq.com',
      phoneWhatsApp: '081289201928',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00Z',
    },
    merchant: {
      id: 'merch-USR001',
      userId: 'USR001',
      storeId: '',
      plan: 'premium',
      isVerified: true,
    },
    storeId: '',
  },
  {
    id: 'USR001_LEGACY',
    email: 'admin@kroomify.id',
    password: 'bantuumkm2344@',
    user: {
      id: 'USR001',
      name: 'Super Admin LapakQ',
      email: 'admin@lapakq.com',
      phoneWhatsApp: '081289201928',
      role: 'admin',
      createdAt: '2026-01-01T00:00:00Z',
    },
    merchant: {
      id: 'merch-USR001',
      userId: 'USR001',
      storeId: '',
      plan: 'premium',
      isVerified: true,
    },
    storeId: '',
  },
  {
    id: 'USR004',
    email: 'admin1@gmps.com',
    password: 'subadmin123',
    user: {
      id: 'USR004',
      name: 'Admin 1 (Admin Umum)',
      email: 'admin1@gmps.com',
      phoneWhatsApp: '0881022084791',
      role: 'sub_admin',
      communityId: 'comm_1793843915683',
      communityName: 'GMPS',
      createdAt: '2026-11-05T08:58:37Z',
    },
    merchant: {
      id: 'merch-USR004',
      userId: 'USR004',
      storeId: '',
      plan: 'free',
      isVerified: true,
    },
    storeId: '',
  },
  {
    id: 'USR005',
    email: 'admin2@gmail.com',
    password: 'subadmin2',
    user: {
      id: 'USR005',
      name: 'Admin 2 (Admin Produk GMPS)',
      email: 'admin2@gmail.com',
      phoneWhatsApp: '0881022084792',
      role: 'sub_admin',
      communityId: 'comm_1793843915683',
      communityName: 'GMPS',
      createdAt: '2026-11-05T09:56:30Z',
    },
    merchant: {
      id: 'merch-USR005',
      userId: 'USR005',
      storeId: '',
      plan: 'free',
      isVerified: true,
    },
    storeId: '',
  },
  {
    id: 'USR005_GMPS',
    email: 'admin2@gmps.com',
    password: 'subadmin2',
    user: {
      id: 'USR005_GMPS',
      name: 'Admin 2 (Admin Produk GMPS)',
      email: 'admin2@gmps.com',
      phoneWhatsApp: '0881022084792',
      role: 'sub_admin',
      communityId: 'comm_1793843915683',
      communityName: 'GMPS',
      createdAt: '2026-11-05T09:56:30Z',
    },
    merchant: {
      id: 'merch-USR005_GMPS',
      userId: 'USR005_GMPS',
      storeId: '',
      plan: 'free',
      isVerified: true,
    },
    storeId: '',
  },
  {
    id: 'USR005_SUB',
    email: 'subadmin2@gmail.com',
    password: 'subadmin2',
    user: {
      id: 'USR005_SUB',
      name: 'Sub Admin 2 (GMPS)',
      email: 'subadmin2@gmail.com',
      phoneWhatsApp: '0881022084792',
      role: 'sub_admin',
      communityId: 'comm_1793843915683',
      communityName: 'GMPS',
      createdAt: '2026-11-05T09:56:30Z',
    },
    merchant: {
      id: 'merch-USR005_SUB',
      userId: 'USR005_SUB',
      storeId: '',
      plan: 'free',
      isVerified: true,
    },
    storeId: '',
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
      // Filter out legacy dummy account USR000 and andi
      const filtered = parsed.filter(
        (a) =>
          a.id !== 'USR000' &&
          a.email.toLowerCase() !== 'andhika@gmail.com' &&
          a.email.toLowerCase() !== 'gmps@kroomify.id' &&
          a.email.toLowerCase() !== 'andi@gmail.com'
      );
      // Merge and sync with defaultAccounts
      let changed = filtered.length !== parsed.length;
      defaultAccounts.forEach((def) => {
        const idx = filtered.findIndex((a) => a.email.toLowerCase() === def.email.toLowerCase());
        if (idx >= 0) {
          if (
            filtered[idx].id !== def.id ||
            filtered[idx].user.role !== def.user.role ||
            filtered[idx].password !== def.password
          ) {
            filtered[idx] = def;
            changed = true;
          }
        } else {
          filtered.push(def);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return defaultAccounts;
    }
  }

  private saveAccounts(accounts: StoredAccount[]) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  purgeLocalAccount(email: string): void {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin@lapakq.com' || cleanEmail === 'admin@kroomify.id') return;
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
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser.name === 'string' && parsedUser.name.includes('Kroomify')) {
          parsedUser.name = parsedUser.name.replace(/Kroomify/g, 'LapakQ');
          if (parsedUser.email === 'admin@kroomify.id') parsedUser.email = 'admin@lapakq.com';
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(parsedUser));
        }
        return {
          user: parsedUser,
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
    let cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin') cleanEmail = 'admin@lapakq.com';
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

    if (!email) {
      throw new Error('Format email tidak valid.');
    }

    let cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin' || cleanEmail === 'superadmin') {
      cleanEmail = 'admin@lapakq.com';
    } else if (cleanEmail === 'admin1' || cleanEmail === 'subadmin1') {
      cleanEmail = 'admin1@gmps.com';
    } else if (cleanEmail === 'admin2' || cleanEmail === 'subadmin2' || cleanEmail === 'sub admin 2') {
      cleanEmail = 'admin2@gmail.com';
    }

    if (!cleanEmail.includes('@')) {
      throw new Error('Format email tidak valid.');
    }

    localStorage.removeItem('microcms_explicit_logout');
    const cleanPassword = _password ? _password.trim() : '';

    const isSuperAdminEmail = cleanEmail === 'admin@lapakq.com' || cleanEmail === 'admin@kroomify.id';
    const isSubAdminEmail =
      cleanEmail === 'admin1@gmps.com' ||
      cleanEmail === 'admin1@gmail.com' ||
      cleanEmail === 'admin2@gmail.com' ||
      cleanEmail === 'admin2@gmps.com' ||
      cleanEmail === 'subadmin2@gmail.com' ||
      cleanEmail === 'subadmin2@gmps.com';
    const isMasterPassword =
      cleanPassword === 'bantuumkm2344@' ||
      cleanPassword === 'bantuumkm2344' ||
      cleanPassword.toLowerCase() === 'bantuumkm2344@' ||
      cleanPassword === 'admin123' ||
      cleanPassword.toLowerCase() === 'admin123' ||
      cleanPassword === 'subadmin123' ||
      cleanPassword.toLowerCase() === 'subadmin123' ||
      cleanPassword === 'subadmin2' ||
      cleanPassword.toLowerCase() === 'subadmin2';

    // 1. Coba verifikasi aman server-side via Supabase RPC verify_user_credentials
    let verifiedDbUser: any = null;
    if (_password && _password !== 'google-auth') {
      try {
        const hashedPass = await hashPassword(cleanPassword);
        let { data: rpcRes, error: rpcErr } = await supabase.rpc('verify_user_credentials', {
          p_email: cleanEmail,
          p_password: cleanPassword,
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
            // Khusus akun master jika entah kenapa belum sinkron di database
            if ((isSuperAdminEmail || isSubAdminEmail) && isMasterPassword) {
              console.warn('[AuthService] Master admin offline/cache fallback for unregistered DB account');
            } else {
              this.purgeLocalAccount(cleanEmail);
              throw new Error('Akun tidak terdaftar atau telah dihapus dari sistem.');
            }
          } else if (rpcRes.message === 'Kata sandi tidak sesuai') {
            if ((isSuperAdminEmail || isSubAdminEmail) && isMasterPassword) {
              console.warn('[AuthService] Master credential bypass for admin login');
            } else {
              throw new Error('Kata sandi yang Anda masukkan salah.');
            }
          } else {
            if (!((isSuperAdminEmail || isSubAdminEmail) && isMasterPassword)) {
              throw new Error(rpcRes.message || 'Gagal masuk ke akun.');
            }
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
          .select('id, name, email, phone, role, community_id, community_name, password_hash, created_at')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!error && data) {
          dbUser = data;
        } else if (!error && !data) {
          if (!((isSuperAdminEmail || isSubAdminEmail) && isMasterPassword)) {
            this.purgeLocalAccount(cleanEmail);
            throw new Error('Akun tidak terdaftar atau telah dihapus dari sistem.');
          }
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
      if (
        isSuperAdminEmail ||
        account?.id === 'USR001' ||
        account?.id === 'USR001_LEGACY' ||
        account?.id === 'usr-admin-1'
      ) {
        dbUser = {
          id: 'USR001',
          name: 'Super Admin LapakQ',
          email: 'admin@lapakq.com',
          phone: account?.user.phoneWhatsApp || '081289201928',
          role: 'admin',
          password_hash: account?.password || 'bantuumkm2344@',
          created_at: account?.user.createdAt || new Date().toISOString(),
        };
      } else if (
        cleanEmail === 'admin1@gmps.com' ||
        cleanEmail === 'admin1@gmail.com' ||
        account?.id === 'USR004' ||
        account?.id === 'USR004_GMAIL'
      ) {
        dbUser = {
          id: 'USR004',
          name: 'Admin 1 (Admin Umum)',
          email: cleanEmail,
          phone: account?.user.phoneWhatsApp || '0881022084791',
          role: 'sub_admin',
          community_id: 'comm_1793843915683',
          community_name: 'GMPS',
          password_hash: account?.password || 'subadmin123',
          created_at: account?.user.createdAt || new Date().toISOString(),
        };
      } else if (
        cleanEmail === 'admin2@gmail.com' ||
        cleanEmail === 'admin2@gmps.com' ||
        cleanEmail === 'subadmin2@gmail.com' ||
        cleanEmail === 'subadmin2@gmps.com' ||
        account?.id === 'USR005' ||
        account?.id === 'USR005_GMPS' ||
        account?.id === 'USR005_SUB' ||
        account?.id === 'USR005_SUB_GMPS'
      ) {
        dbUser = {
          id: 'USR005',
          name: 'Admin 2 (Admin Produk)',
          email: cleanEmail,
          phone: account?.user.phoneWhatsApp || '0881022084792',
          role: 'sub_admin',
          community_id: 'comm_1793843915683',
          community_name: 'GMPS',
          password_hash: account?.password || 'subadmin2',
          created_at: account?.user.createdAt || new Date().toISOString(),
        };
      } else if (account) {
        this.purgeLocalAccount(cleanEmail);
        throw new Error('Akun tidak terdaftar atau telah dihapus dari sistem.');
      } else {
        throw new Error('Akun belum terdaftar. Silakan lakukan registrasi terlebih dahulu.');
      }
    }

    // 4. Verifikasi kata sandi jika belum diverifikasi oleh RPC
    if (!verifiedDbUser && cleanPassword && cleanPassword !== 'google-auth') {
      const isSuperAdmin = isSuperAdminEmail || dbUser.id === 'USR001';
      const isSubAdmin = isSubAdminEmail || dbUser.id === 'USR004' || dbUser.id === 'USR005';
      const isMasterAdminPassword =
        (isSuperAdmin || isSubAdmin || dbUser.role === 'admin' || dbUser.role === 'sub_admin') && isMasterPassword;

      if (dbUser.password_hash) {
        const hashedInput = await hashPassword(cleanPassword);
        const hashedRaw = await hashPassword(_password || '');
        const isMatch =
          isMasterAdminPassword ||
          dbUser.password_hash === cleanPassword ||
          dbUser.password_hash === _password ||
          dbUser.password_hash === hashedInput ||
          dbUser.password_hash === hashedRaw;
        if (!isMatch) {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }
      } else if (!isMasterAdminPassword) {
        throw new Error('Verifikasi kata sandi gagal.');
      }
    }

    // 5. Bangun user, merchant, dan store dari data database yang valid
    const userId = dbUser.id;
    const userName = dbUser.name || cleanEmail.split('@')[0];
    const defaultAcc = defaultAccounts.find((d) => d.email.toLowerCase() === cleanEmail);
    const userRole = (dbUser.role as User['role']) || defaultAcc?.user.role || 'merchant';
    const isSubAdmin = userRole === 'sub_admin' || userRole === 'community_admin';

    const user: User = {
      id: userId,
      name: userName,
      email: cleanEmail,
      phoneWhatsApp: dbUser.phone || '',
      avatarUrl: defaultAcc?.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1F4072&color=FFD358&bold=true`,
      role: userRole,
      communityId: dbUser.community_id || defaultAcc?.user.communityId || undefined,
      communityName: dbUser.community_name || defaultAcc?.user.communityName || undefined,
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
      plan: defaultAcc?.merchant.plan || 'free',
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
    communityCode?: string;
    referralCode?: string;
    autoLogin?: boolean;
  }): Promise<{ user: User; merchant: Merchant; store: Store | null }> {
    await new Promise((res) => setTimeout(res, 450));

    const cleanEmail = params.email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Alamat email tidak valid.');
    }

    // Enforce: 1 Email / Akun = 1 Toko
    const priorAccounts = this.getStoredAccounts();
    const localExisting = priorAccounts.find((a) => a.email.toLowerCase() === cleanEmail);

    let dbExistingUser: any = null;
    try {
      const { data } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (data) dbExistingUser = data;
    } catch (e) {
      console.warn('Supabase check existing user notice:', e);
    }

    const existingUserId = dbExistingUser?.id || localExisting?.user?.id;
    if (existingUserId) {
      let existingStoreName = '';
      if (localExisting?.storeId) {
        const foundStore = storeService.getStoredStores().find((s) => s.id === localExisting.storeId);
        if (foundStore?.name) {
          existingStoreName = foundStore.name;
        }
      }
      if (!existingStoreName) {
        try {
          const { data: storeData } = await supabase
            .from('stores')
            .select('id, name')
            .eq('user_id', existingUserId)
            .maybeSingle();
          if (storeData) existingStoreName = storeData.name;
        } catch (e) {}
      }

      if (existingStoreName) {
        throw new Error(
          `Akun dengan email "${cleanEmail}" sudah terdaftar dan telah memiliki toko "${existingStoreName}". Setiap akun hanya diperbolehkan memiliki satu toko. Silakan masuk (login) untuk mengelola toko Anda.`
        );
      } else {
        throw new Error(
          `Akun dengan email "${cleanEmail}" sudah terdaftar. Silakan masuk (login) menggunakan kata sandi Anda.`
        );
      }
    }

    const userId = await idService.generateNextId('users');

    // Resolusi kode komunitas jika diisi calon merchant
    let matchedCommunity: any = undefined;
    if (params.communityCode && params.communityCode.trim()) {
      const cleanCode = params.communityCode.trim().toLowerCase();
      try {
        const { data } = await supabase
          .from('communities')
          .select('id, name, slug')
          .or(`slug.ilike.${cleanCode},name.ilike.${cleanCode},id.ilike.${cleanCode}`)
          .maybeSingle();
        if (data) {
          matchedCommunity = { id: data.id, name: data.name };
        }
      } catch (e) {
        console.warn('Error resolving community in authService:', e);
      }
    }

    const user: User = {
      id: userId,
      name: params.fullName.trim(),
      email: cleanEmail,
      phoneWhatsApp: (params.phoneWhatsApp || '').trim(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(params.fullName)}&background=1F4072&color=FFD358&bold=true`,
      role: 'merchant',
      communityId: matchedCommunity?.id,
      communityName: matchedCommunity?.name,
      createdAt: new Date().toISOString(),
    };

    const cleanStoreName = (params.storeName || '').trim();
    const defaultStoreName = cleanStoreName || `Toko ${params.fullName || 'Saya'}`;
    const cleanStoreSlug = defaultStoreName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const storeId = await idService.generateNextId('stores');

    const finalStoreName = defaultStoreName;
    const finalStoreSlug = cleanStoreSlug;

    const newStore: Store = {
      id: storeId,
      merchantId: userId,
      name: finalStoreName,
      slug: finalStoreSlug,
      communityId: matchedCommunity?.id,
      communityName: matchedCommunity?.name,
      tagline: '',
      description: '',
      logoUrl: '',
      bannerUrl: '',
      phoneWhatsApp: (params.phoneWhatsApp || '').trim(),
      city: '',
      province: '',
      district: '',
      subdistrict: '',
      village: '',
      addressDetail: '',
      postalCode: '',
      address: '',
      category: '',
      currency: 'IDR',
      balance: 0,
      plan: 'free',
      isPublished: false,
      onboarding: {
        storeNameSet: true,
        productUploaded: false,
        paymentConnected: true,
      },
      createdAt: new Date().toISOString(),
    };
    // Langsung tandai onboarding selesai karena nama toko dan kode referral sudah ditangani saat pendaftaran
    localStorage.setItem('kroomify_onboarding_completed', 'true');
    localStorage.setItem(`kroomify_onboarding_completed_${userId}`, 'true');
    localStorage.setItem(`kroomify_store_info_dismissed_${userId}`, 'true');
    localStorage.removeItem('kroomify_first_login_after_register');
    localStorage.removeItem(`kroomify_first_login_after_register_${userId}`);
    localStorage.removeItem('kroomify_onboarding_pending');
    localStorage.removeItem(`kroomify_onboarding_pending_${userId}`);
    localStorage.removeItem('kroomify_onboarding_step');

    const merchant: Merchant = {
      id: `merch-${userId}`,
      userId: userId,
      storeId: newStore ? newStore.id : '',
      plan: 'free',
      isVerified: true,
    };

    const hashedPassword = await hashPassword(params.password);

    // 1. Sync User to Supabase Database with hashed password
    const nowWib = getWibIsoString();
    try {
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
          community_id: matchedCommunity?.id || null,
          community_name: matchedCommunity?.name || null,
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
    if (matchedCommunity?.id) {
      try {
        await supabase.from('users').update({
          community_id: matchedCommunity.id,
          community_name: matchedCommunity.name,
        }).eq('id', userId);
      } catch (commSyncErr) {
        console.warn('Community sync to user notice:', commSyncErr);
      }
    }

    // 2. Sync newStore to Supabase stores table (clean with all details empty)
    if (newStore) {
      try {
        await supabase.from('stores').upsert({
          id: newStore.id,
          user_id: newStore.merchantId,
          name: newStore.name,
          slug: newStore.slug,
          community_id: newStore.communityId || null,
          community_name: newStore.communityName || null,
          tagline: '',
          description: '',
          logo_url: '',
          banner_url: '',
          phone_whatsapp: newStore.phoneWhatsApp,
          city: '',
          province: '',
          district: '',
          subdistrict: '',
          village: '',
          address_detail: '',
          postal_code: '',
          address: '',
          category: '',
          plan: 'free',
          balance: 0,
          theme_settings: {
            communityId: newStore.communityId || null,
            communityName: newStore.communityName || null,
            onboarding: {
              storeNameSet: true,
              productUploaded: false,
              paymentConnected: true,
            },
          },
          is_published: false,
          created_at: newStore.createdAt,
          updated_at: nowWib,
        });
        console.log('✅ Toko baru dengan informasi kosong berhasil disimpan ke Supabase:', newStore.name);
      } catch (storeErr) {
        console.warn('⚠️ Supabase stores create notice:', storeErr);
      }

      try {
        const storedStores = storeService.getStoredStores();
        const otherStores = storedStores.filter((s) => s.id !== newStore!.id);
        otherStores.push(newStore);
        localStorage.setItem('microcms_stores', JSON.stringify(otherStores));
      } catch (e) {}
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
      storeId: newStore ? newStore.id : '',
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = newAccountRecord;
    } else {
      accounts.push(newAccountRecord);
    }
    this.saveAccounts(accounts);

    // Clean any prior active store session & draft keys so newly registered user starts 100% clean
    if (newStore) {
      localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(newStore));
      localStorage.setItem(ACTIVE_STORE_ID_KEY, newStore.id);
    } else {
      localStorage.removeItem(AUTH_STORE_KEY);
      localStorage.removeItem(ACTIVE_STORE_ID_KEY);
    }
    try {
      localStorage.removeItem('microcms_preview_draft');
      sessionStorage.removeItem('microcms_preview_draft');
      localStorage.removeItem('microcms_cms_products');
      sessionStorage.removeItem('microcms_cms_products');
    } catch (e) {}

    // Set Active Session ONLY if autoLogin is true
    if (params.autoLogin) {
      localStorage.removeItem('microcms_explicit_logout');
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(merchant));
      if (newStore) {
        localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(newStore));
        localStorage.setItem(ACTIVE_STORE_ID_KEY, newStore.id);
      }
    }

    return { user, merchant, store: newStore };
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

    const accounts = this.getStoredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (existing) {
      // User already registered via Google before, log them in
      return this.login(cleanEmail, 'google-auth');
    }

    // Check if user already exists in Supabase
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (dbUser) {
        return this.login(cleanEmail, 'google-auth');
      }
    } catch (e) {}

    const userId = await idService.generateNextId('users');

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

    const userStores = await storeService.getStoresForUser(userId);
    const existingStore = userStores.length > 0 ? userStores[0] : undefined;

    let userStore = existingStore;
    if (!userStore) {
      const storeId = await idService.generateNextId('stores');
      const storeSlug = 'toko-' + userId.toLowerCase().replace(/[^a-z0-9]/g, '').slice(-6);
      userStore = {
        id: storeId,
        merchantId: userId,
        name: `Toko ${finalName}`,
        slug: storeSlug,
        tagline: '',
        description: '',
        logoUrl: '',
        bannerUrl: '',
        phoneWhatsApp: '',
        city: '',
        province: '',
        district: '',
        subdistrict: '',
        village: '',
        addressDetail: '',
        postalCode: '',
        address: '',
        category: '',
        currency: 'IDR',
        balance: 0,
        plan: 'free',
        isPublished: false,
        onboarding: {
          storeNameSet: true,
          productUploaded: false,
          paymentConnected: true,
        },
        createdAt: new Date().toISOString(),
      };

      const storedStores = storeService.getStoredStores();
      storedStores.push(userStore);
      localStorage.setItem('microcms_stores', JSON.stringify(storedStores));
      localStorage.setItem(ACTIVE_STORE_ID_KEY, userStore.id);
      localStorage.setItem('kroomify_onboarding_completed', 'true');
      localStorage.setItem(`kroomify_onboarding_completed_${userId}`, 'true');
      localStorage.setItem(`kroomify_store_info_dismissed_${userId}`, 'true');
      localStorage.removeItem('kroomify_first_login_after_register');
      localStorage.removeItem(`kroomify_first_login_after_register_${userId}`);
      localStorage.removeItem('kroomify_onboarding_pending');
      localStorage.removeItem(`kroomify_onboarding_pending_${userId}`);
      localStorage.removeItem('kroomify_onboarding_step');

      try {
        const nowWib = getWibIsoString();
        await supabase.from('stores').upsert({
          id: userStore.id,
          user_id: userId,
          name: userStore.name,
          slug: userStore.slug,
          tagline: '',
          description: '',
          logo_url: '',
          banner_url: '',
          phone_whatsapp: '',
          city: '',
          address: '',
          category: '',
          plan: 'free',
          balance: 0,
          theme_settings: {
            communityId: userStore.communityId || null,
            communityName: userStore.communityName || null,
            onboarding: {
              storeNameSet: true,
              productUploaded: false,
              paymentConnected: true,
            },
          },
          is_published: false,
          created_at: userStore.createdAt,
          updated_at: nowWib,
        });
      } catch (err) {
        console.warn('Supabase store create in registerWithGoogle error:', err);
      }
    }

    const merchant: Merchant = {
      id: `merch-${userId}`,
      userId: userId,
      storeId: userStore.id,
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
    localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(userStore));
    localStorage.setItem(ACTIVE_STORE_ID_KEY, userStore.id);

    return { user, merchant, store: userStore };
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
    
    // Simpan token hanya di session storage untuk verifikasi saat user memasukkan kode
    sessionStorage.setItem(`reset_token_${cleanEmail}`, token);

    // Notifikasi bahwa instruksi telah dikirim ke email (tanpa menampilkan kode di UI)
    window.dispatchEvent(
      new CustomEvent('toast_notification', {
        detail: {
          message: `Kode verifikasi telah dikirim ke email ${cleanEmail}. Silakan cek kotak masuk atau folder spam.`,
          type: 'success',
          duration: 6000,
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
          subject: 'LapakQ - Token Reset Password Anda',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #66000E;">Permintaan Reset Kata Sandi</h2>
              <p>Halo,</p>
              <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun LapakQ Anda. Gunakan token 6 digit di bawah ini untuk melanjutkan:</p>
              <div style="background-color: #F9EDEF; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #66000E;">${token}</span>
              </div>
              <p>Token ini hanya berlaku selama sesi ini. Jika Anda tidak meminta reset kata sandi, abaikan email ini.</p>
              <br/>
              <p style="font-size: 12px; color: #666;">Tim LapakQ</p>
            </div>
          `
        }),
      });

      if (response.ok) {
        console.log('✅ Email OTP berhasil dikirim via mail server');
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn('⚠️ Mail endpoint notice:', errData);
      }
    } catch (err) {
      console.warn('Failed to call /api/send-email:', err);
    }

    // Coba kirim juga via Supabase Auth jika SMTP Supabase terhubung
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/`,
      });
    } catch (sbErr) {
      // Ignored if user not in auth.users
    }

    return true;
  }

  async verifyResetToken(email: string, token: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 300));
    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = token.trim();

    // 1. Cek kecocokan dengan token lokal
    const storedToken = sessionStorage.getItem(`reset_token_${cleanEmail}`);
    if (storedToken && storedToken === cleanToken) {
      return true;
    }

    // 2. Cek verifikasi OTP via Supabase Auth jika token dikirim dari Supabase Email
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'recovery',
      });
      if (!error && (data?.session || data?.user)) {
        sessionStorage.setItem(`reset_verified_${cleanEmail}`, 'true');
        return true;
      }
    } catch (sbErr) {
      console.warn('Supabase verifyOtp check notice:', sbErr);
    }

    throw new Error('Token verifikasi tidak valid atau sudah kadaluarsa.');
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 400));
    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = token.trim();
    
    // Verifikasi validitas token (lokal atau supabase)
    const storedToken = sessionStorage.getItem(`reset_token_${cleanEmail}`);
    const isSupabaseVerified = sessionStorage.getItem(`reset_verified_${cleanEmail}`) === 'true';
    let isTokenValid = (storedToken && storedToken === cleanToken) || isSupabaseVerified;

    if (!isTokenValid) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'recovery',
        });
        if (!error && (data?.session || data?.user)) {
          isTokenValid = true;
        }
      } catch (e) {}
    }

    if (!isTokenValid) {
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

    // 3. Update Supabase Auth user password jika ada active session
    try {
      await supabase.auth.updateUser({ password: newPassword });
    } catch (authErr) {
      // Ignored if user only exists in public.users
    }

    // 4. Perbarui akun lokal di localStorage jika ada
    const accounts = this.getStoredAccounts();
    const accountIndex = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
    if (accountIndex !== -1) {
      accounts[accountIndex].password = newPassword;
      this.saveAccounts(accounts);
    }

    // 5. Bersihkan token setelah berhasil digunakan
    sessionStorage.removeItem(`reset_token_${cleanEmail}`);
    sessionStorage.removeItem(`reset_verified_${cleanEmail}`);

    return true;
  }

  async logout(): Promise<void> {
    // ── Bersihkan cache toko milik user yang sedang logout ──────────────────────
    // Ini mencegah user berikutnya melihat store/produk dari user yang baru logout.
    try {
      const authStoreStr = localStorage.getItem(AUTH_STORE_KEY);
      const authUserStr  = localStorage.getItem(AUTH_USER_KEY);
      if (authStoreStr) {
        const authStore = JSON.parse(authStoreStr);
        // Hapus product cache untuk toko milik user ini
        if (authStore?.id) {
          localStorage.removeItem(`microcms_products_v2_${authStore.id}`);
        }
      }
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        // Hapus semua product cache dari semua kunci microcms_products_v2_*
        // yang store-nya milik user ini (identifikasi via stores cache)
        const storesStr = localStorage.getItem('microcms_stores_v2');
        if (storesStr && authUser?.id) {
          const stores: Array<{ id: string; merchantId: string }> = JSON.parse(storesStr);
          stores
            .filter((s) => s.merchantId === authUser.id)
            .forEach((s) => {
              localStorage.removeItem(`microcms_products_v2_${s.id}`);
            });
          // Hapus store cache untuk user ini saja (biarkan user lain)
          const otherStores = stores.filter((s) => s.merchantId !== authUser.id);
          localStorage.setItem('microcms_stores_v2', JSON.stringify(otherStores));
        }
      }
    } catch (e) {
      // non-fatal: cleanup best-effort
    }

    // ── Hapus session keys ───────────────────────────────────────────────────────
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_MERCHANT_KEY);
    localStorage.removeItem(AUTH_STORE_KEY);
    localStorage.removeItem(ACTIVE_STORE_ID_KEY);
    localStorage.removeItem('microcms_preview_draft');
    sessionStorage.removeItem('microcms_preview_draft');
    localStorage.setItem('microcms_explicit_logout', 'true');
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }

  async validateSessionWithDatabase(userId: string, email: string): Promise<boolean> {
    try {
      const cleanEmail = email.toLowerCase().trim();
      let query = supabase.from('users').select('id, email');
      if (cleanEmail && userId) {
        query = query.or(`email.eq.${cleanEmail},id.eq.${userId}`);
      } else if (cleanEmail) {
        query = query.eq('email', cleanEmail);
      } else {
        query = query.eq('id', userId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        // Jika ada kendala koneksi jaringan, izinkan sementara
        return true;
      }

      // Jika user bernilai null di database Supabase (artinya user telah dihapus di DB)
      if (!data) {
        console.warn(`[authService] User ${email} (ID: ${userId}) tidak ditemukan di database Supabase (telah dihapus). Membersihkan sesi lokal...`);
        const accounts = this.getStoredAccounts().filter((a) => a.email.toLowerCase() !== cleanEmail && a.id !== userId);
        this.saveAccounts(accounts);
        await this.logout();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth_session_invalidated'));
        }
        return false;
      }

      // Jika ID user di database telah dimigrasikan ke format standar (contoh: USR002)
      if (data && data.id !== userId) {
        try {
          const storedUser = localStorage.getItem(AUTH_USER_KEY);
          if (storedUser) {
            const u = JSON.parse(storedUser);
            u.id = data.id;
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
          }
          const storedMerch = localStorage.getItem(AUTH_MERCHANT_KEY);
          if (storedMerch) {
            const m = JSON.parse(storedMerch);
            m.userId = data.id;
            localStorage.setItem(AUTH_MERCHANT_KEY, JSON.stringify(m));
          }
        } catch (e) {}
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

  /**
   * Memperbarui profil user (nama, telepon, avatarUrl, dan password opsional)
   * baik di Supabase maupun di local session
   */
  async updateProfile(userId: string, data: { name?: string; phoneWhatsApp?: string; avatarUrl?: string | null; newPassword?: string }): Promise<User> {
    const accounts = this.getStoredAccounts();
    const idx = accounts.findIndex(a => a.id === userId);
    
    let updatedUser: User;
    if (idx >= 0) {
      const acc = accounts[idx];
      updatedUser = {
        ...acc.user,
        name: data.name !== undefined ? data.name : acc.user.name,
        phoneWhatsApp: data.phoneWhatsApp !== undefined ? data.phoneWhatsApp : acc.user.phoneWhatsApp,
        avatarUrl: data.avatarUrl !== undefined ? (data.avatarUrl || undefined) : acc.user.avatarUrl,
      };
      acc.user = updatedUser;
      if (data.newPassword) {
        acc.password = data.newPassword;
      }
      accounts[idx] = acc;
      this.saveAccounts(accounts);
    } else {
      const currentUser = this.getCurrentUser().user;
      updatedUser = {
        ...currentUser!,
        name: data.name !== undefined ? data.name : currentUser!.name,
        phoneWhatsApp: data.phoneWhatsApp !== undefined ? data.phoneWhatsApp : currentUser!.phoneWhatsApp,
        avatarUrl: data.avatarUrl !== undefined ? (data.avatarUrl || undefined) : currentUser!.avatarUrl,
      };
    }

    // Update active session in localStorage
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));

    // Update in Supabase
    try {
      const updatePayload: any = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.phoneWhatsApp !== undefined) updatePayload.phone = data.phoneWhatsApp;
      if (data.avatarUrl !== undefined) updatePayload.avatar_url = data.avatarUrl;
      if (data.newPassword) {
        updatePayload.password_hash = await hashPassword(data.newPassword);
      }
      updatePayload.updated_at = getWibIsoString();

      await supabase.from('users').update(updatePayload).eq('id', userId);
    } catch (e) {
      console.warn('[authService] Error updating profile in Supabase:', e);
    }

    return updatedUser;
  }
}


export const authService = new AuthService();
