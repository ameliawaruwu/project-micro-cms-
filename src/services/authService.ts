import { User, Merchant, Store } from '../types';
import { storeService } from './storeService';
import { productService } from './productService';
import { supabase, setSessionToken } from './supabaseClient';
import { idService } from './idService';

const AUTH_USER_KEY = 'microcms_auth_user';
const AUTH_MERCHANT_KEY = 'microcms_auth_merchant';
const AUTH_STORE_KEY = 'microcms_active_store';
const ACCOUNTS_KEY = 'microcms_accounts_v1';
const ACTIVE_STORE_ID_KEY = 'microcms_active_store_id';

/**
 * Aturan password baru. Halaman login membuang spasi di awal/akhir, jadi password yang
 * diawali/diakhiri spasi tidak akan pernah bisa dipakai masuk — tolak sejak dibuat.
 */
export function passwordProblem(p: string | undefined | null): string | null {
  if (!p || p.length < 8) return 'Kata sandi minimal 8 karakter.';
  if (p !== p.trim()) return 'Kata sandi tidak boleh diawali atau diakhiri spasi.';
  return null;
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

// Akun TIDAK lagi punya data/password bawaan di kode. Semua verifikasi lewat database.
const defaultAccounts: StoredAccount[] = [];

/** Kredensial super admin di MEMORI saja (tidak pernah di storage) untuk konfirmasi aksi admin. */
let adminCredential: { email: string; password: string } | null = null;

/** Pesan error dari RPC Supabase dalam bahasa yang dipahami pengguna. */
const rpcErrorMessage = (err: any, fallback: string): string => {
  const msg = String(err?.message || '');
  if (/minimal 8 karakter|spasi|tidak valid|tidak dikenal|dikunci/i.test(msg)) return msg;
  return fallback;
};

class AuthService {
  /**
   * Cache akun lokal (hanya data profil untuk UI). Password TIDAK pernah disimpan; versi lama yang
   * masih menyimpan password/hash di localStorage dibersihkan di sini.
   */
  private getStoredAccounts(): StoredAccount[] {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (!raw) return [];
      const parsed: StoredAccount[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      let changed = false;
      const cleaned = parsed
        .filter((a) => a && typeof a.email === 'string')
        .map((a) => {
          if ('password' in a) {
            changed = true;
            const { password: _drop, ...rest } = a;
            return rest as StoredAccount;
          }
          return a;
        });
      if (changed) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(cleaned));
      return cleaned;
    } catch {
      return [];
    }
  }

  private saveAccounts(accounts: StoredAccount[]) {
    const safe = accounts.map(({ password: _drop, ...rest }) => rest);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(safe));
  }

  /** Perbarui kredensial admin di memori setelah super admin mengganti password akunnya sendiri. */
  refreshAdminCredential(email: string, newPassword: string): void {
    if (adminCredential && adminCredential.email === email.toLowerCase().trim()) {
      adminCredential = { email: adminCredential.email, password: newPassword };
    }
  }

  /** Kredensial super admin yang dikonfirmasi saat login (memori saja) untuk RPC admin. */
  getAdminCredential(): { email: string; password: string } {
    if (!adminCredential) {
      throw new Error('Demi keamanan, keluar lalu masuk ulang sebagai super admin sebelum membuat atau mengubah password akun.');
    }
    return adminCredential;
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
      // Data user tidak lagi terbaca bebas (tahap 2b-3); cek lewat RPC yang hanya menjawab ya/tidak.
      const { data, error } = await supabase.rpc('email_registered', { p_email: cleanEmail });
      if (!error) {
        if (data === true) {
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
    if (!email) {
      throw new Error('Format email tidak valid.');
    }

    let cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'admin' || cleanEmail === 'superadmin') {
      cleanEmail = 'admin@lapakq.com';
    }
    if (!cleanEmail.includes('@')) {
      throw new Error('Format email tidak valid.');
    }

    localStorage.removeItem('microcms_explicit_logout');
    const password = _password || '';
    let dbUser: any = null;

    if (password === 'google-auth') {
      // Login Google: identitas diambil dari sesi Supabase Auth (token Google asli), bukan dari klien.
      const { data, error } = await supabase.rpc('google_session_user', { p_name: null });
      if (error || !data?.success || !data.user) {
        throw new Error('Sesi Google tidak valid. Silakan masuk ulang dengan Google.');
      }
      if (String(data.user.email || '').toLowerCase() !== cleanEmail) {
        throw new Error('Akun Google tidak cocok dengan email yang diminta.');
      }
      dbUser = data.user;
      setSessionToken(data.session_token);
    } else {
      if (!password) {
        throw new Error('Kata sandi wajib diisi.');
      }
      // Password diverifikasi sepenuhnya di database (bcrypt); hash tidak pernah dikirim ke browser.
      const { data, error } = await supabase.rpc('verify_user_credentials', {
        p_email: cleanEmail,
        p_password: password,
      });
      if (error) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.');
      }
      if (!data?.success || !data.user) {
        if (data?.message === 'Akun tidak ditemukan') {
          this.purgeLocalAccount(cleanEmail);
          throw new Error('Akun belum terdaftar. Silakan lakukan registrasi terlebih dahulu.');
        }
        if (data?.message === 'Kata sandi tidak sesuai') {
          throw new Error('Kata sandi yang Anda masukkan salah.');
        }
        throw new Error(data?.message || 'Gagal masuk ke akun.');
      }
      dbUser = data.user;
      setSessionToken(data.session_token);
      // Simpan di memori untuk konfirmasi aksi super admin (buat/ubah password akun lain).
      adminCredential = dbUser.role === 'admin' ? { email: cleanEmail, password } : null;
    }

    // 5. Bangun user, merchant, dan store dari data database yang valid
    const userId = dbUser.id;
    const userName = dbUser.name || cleanEmail.split('@')[0];
    const defaultAcc = defaultAccounts.find((d) => d.email.toLowerCase() === cleanEmail);
    const userRole = (dbUser.role as User['role']) || defaultAcc?.user.role || 'merchant';
    const isSubAdmin =
      userRole === 'sub_admin' ||
      userRole === 'sub_admin_umum' ||
      userRole === 'community_admin' ||
      userRole === 'sub_admin_produk';

    const user: User = {
      id: userId,
      name: userName,
      email: cleanEmail,
      phoneWhatsApp: dbUser.phone || '',
      avatarUrl: dbUser.avatar_url || defaultAcc?.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1F4072&color=FFD358&bold=true`,
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

    let dbEmailRegistered = false;
    try {
      const { data } = await supabase.rpc('email_registered', { p_email: cleanEmail });
      dbEmailRegistered = data === true;
    } catch (e) {
      console.warn('Supabase check existing user notice:', e);
    }

    if (dbEmailRegistered || localExisting?.user?.id) {
      // Nama toko hanya dari cache perangkat ini — tidak dicari di database agar
      // pendaftar tidak bisa mengintip toko milik email orang lain.
      let existingStoreName = '';
      if (localExisting?.storeId) {
        const foundStore = storeService.getStoredStores().find((s) => s.id === localExisting.storeId);
        if (foundStore?.name) {
          existingStoreName = foundStore.name;
        }
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

    const pwProblem = passwordProblem(params.password);
    if (pwProblem) throw new Error(pwProblem);

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

    // 1. Buat akun di database. Password di-hash (bcrypt) oleh database; akun yang sudah ada
    //    tidak pernah ditimpa.
    const { data: regData, error: regErr } = await supabase.rpc('register_merchant', {
      p_email: cleanEmail,
      p_password: params.password,
      p_name: params.fullName.trim(),
      p_phone: (params.phoneWhatsApp || '').trim() || null,
      p_community_id: matchedCommunity?.id || null,
    });
    if (regErr) {
      throw new Error(rpcErrorMessage(regErr, 'Pendaftaran gagal. Periksa koneksi lalu coba lagi.'));
    }
    if (!regData?.success || !regData.user?.id) {
      throw new Error(regData?.message || 'Pendaftaran gagal. Silakan coba lagi.');
    }
    const userId: string = regData.user.id;
    // Sesi dipakai untuk menyimpan toko baru milik akun ini; dilepas lagi bila tidak auto-login.
    setSessionToken(regData.session_token);

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

    const nowWib = getWibIsoString();

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

    if (!params.autoLogin) {
      try {
        await supabase.rpc('end_session');
      } catch {}
      setSessionToken(null);
    }

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

    const defaultName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const requestedName = (params.fullName || defaultName).trim();

    // Akun Google dibuat/diambil oleh database dari token sesi Supabase Auth (email terverifikasi Google).
    const { data: gData, error: gErr } = await supabase.rpc('google_session_user', { p_name: requestedName });
    if (gErr || !gData?.success || !gData.user?.id) {
      throw new Error('Sesi Google tidak valid. Silakan masuk ulang dengan Google.');
    }
    if (String(gData.user.email || '').toLowerCase() !== cleanEmail) {
      throw new Error('Akun Google tidak cocok dengan email yang diminta.');
    }
    if (!gData.is_new) {
      // Sudah pernah terdaftar: langsung masuk.
      return this.login(cleanEmail, 'google-auth');
    }

    const userId: string = gData.user.id;
    const finalName = gData.user.name || requestedName;
    setSessionToken(gData.session_token);

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


    const newAccountRecord: StoredAccount = {
      id: userId,
      email: cleanEmail,
      user,
      merchant,
      storeId: merchant.storeId,
    };

    const accounts = this.getStoredAccounts().filter((a) => a.email.toLowerCase() !== cleanEmail);
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


  /**
   * Minta kode reset. Kode 6 digit dibuat & disimpan (ter-hash) oleh server, lalu dikirim ke email;
   * browser tidak pernah melihat kode tersebut.
   */
  async forgotPassword(email: string): Promise<boolean> {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Alamat email tidak valid.');
    }
    let res: Response;
    try {
      res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
    } catch {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || 'Gagal mengirim kode reset. Coba lagi beberapa saat.');
    }
    window.dispatchEvent(
      new CustomEvent('toast_notification', {
        detail: {
          message: `Jika ${cleanEmail} terdaftar, kode verifikasi telah dikirim. Cek kotak masuk atau folder spam.`,
          type: 'success',
          duration: 6000,
        },
      })
    );
    return true;
  }

  /** Periksa kode reset (tanpa mengganti password). Percobaan dibatasi di database. */
  async verifyResetToken(email: string, token: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('complete_password_reset', {
      p_email: email.toLowerCase().trim(),
      p_token: token.trim(),
      p_new_password: null,
    });
    if (error || !data?.success) {
      throw new Error(data?.message || 'Token verifikasi tidak valid atau sudah kadaluarsa.');
    }
    return true;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    const pwProblem = passwordProblem(newPassword);
    if (pwProblem) throw new Error(pwProblem);
    const { data, error } = await supabase.rpc('complete_password_reset', {
      p_email: email.toLowerCase().trim(),
      p_token: token.trim(),
      p_new_password: newPassword,
    });
    if (error) {
      throw new Error(rpcErrorMessage(error, 'Gagal mengganti kata sandi. Coba lagi.'));
    }
    if (!data?.success) {
      throw new Error(data?.message || 'Token verifikasi tidak valid atau sudah kadaluarsa.');
    }
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
    adminCredential = null;
    try {
      // Hapus sesi di database agar token lama tidak bisa dipakai lagi.
      await supabase.rpc('end_session');
    } catch (e) {}
    setSessionToken(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  }

  async validateSessionWithDatabase(userId: string, email: string): Promise<boolean> {
    // Sesi sah = token yang dikenali database (bukan sekadar data di localStorage).
    try {
      const { data, error } = await supabase.rpc('session_me');
      if (!error && data && data.success === false) {
        console.warn('[authService] Sesi tidak valid atau kedaluwarsa. Silakan masuk ulang.');
        await this.logout();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth_session_invalidated'));
        }
        return false;
      }
    } catch {
      // Jaringan bermasalah: lanjut ke pemeriksaan lama di bawah.
    }
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
  async updateProfile(
    userId: string,
    data: { name?: string; phoneWhatsApp?: string; avatarUrl?: string | null; newPassword?: string; currentPassword?: string }
  ): Promise<User> {
    // Ganti password wajib membuktikan password lama; diverifikasi & di-hash oleh database.
    if (data.newPassword) {
      const email = this.getCurrentUser().user?.email;
      if (!email) throw new Error('Sesi tidak valid. Silakan masuk ulang.');
      if (!data.currentPassword) throw new Error('Masukkan kata sandi saat ini untuk mengganti kata sandi.');
      const pwProblem = passwordProblem(data.newPassword);
      if (pwProblem) throw new Error(pwProblem);
      const { data: res, error } = await supabase.rpc('change_my_password', {
        p_email: email,
        p_old_password: data.currentPassword,
        p_new_password: data.newPassword,
      });
      if (error) throw new Error(rpcErrorMessage(error, 'Gagal mengganti kata sandi. Coba lagi.'));
      if (!res?.success) throw new Error(res?.message || 'Gagal mengganti kata sandi.');
      if (adminCredential && adminCredential.email === email.toLowerCase()) {
        adminCredential = { email: adminCredential.email, password: data.newPassword };
      }
    }

    // Simpan ke database lebih dulu (RLS: hanya baris milik sesi ini). Bila gagal, sesi lokal
    // tidak diubah agar tampilan tidak menunjukkan profil yang sebenarnya tidak tersimpan.
    const updatePayload: Record<string, string | null> = { updated_at: getWibIsoString() };
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.phoneWhatsApp !== undefined) updatePayload.phone = data.phoneWhatsApp;
    if (data.avatarUrl !== undefined) updatePayload.avatar_url = data.avatarUrl || null;
    let { data: savedRows, error: saveError } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('id');
    // ID sesi lokal bisa usang (ID akun pernah dimigrasikan); cocokkan lewat email sesi.
    // RLS tetap membatasi ke baris milik sesi ini, jadi tidak bisa mengubah akun lain.
    const sessionEmail = this.getCurrentUser().user?.email?.toLowerCase();
    if (!saveError && !savedRows?.length && sessionEmail) {
      ({ data: savedRows, error: saveError } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('email', sessionEmail)
        .select('id'));
    }
    if (saveError || !savedRows?.length) {
      if (saveError) console.warn('[authService] Error updating profile in Supabase:', saveError.message);
      throw new Error(data.newPassword
        ? 'Kata sandi sudah diganti, tetapi profil gagal disimpan. Coba lagi.'
        : 'Profil gagal disimpan. Silakan masuk ulang lalu coba lagi.');
    }

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

    return updatedUser;
  }
}


export const authService = new AuthService();
