import { supabase } from './supabaseClient';

export interface UserReferralInfo {
  referralCode: string;
  totalReferred: number;
  referees: Array<{
    refereeUserId: string;
    refereeName: string;
    refereeEmail: string;
    redeemedAt: string;
  }>;
}

class ReferralService {
  /**
   * Menghasilkan kode referral acak yang ramah pengguna (Nama Panggilan + 3 Karakter Alfanumerik).
   * Menghindari karakter ambigu seperti 0, O, 1, I, l.
   */
  public generateCodeFromName(name: string): string {
    let clean = (name || 'USER')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    if (!clean || clean.length < 2) {
      clean = 'KRM';
    } else {
      clean = clean.slice(0, 5);
    }

    const safeChars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let suffix = '';
    for (let i = 0; i < 3; i++) {
      suffix += safeChars.charAt(Math.floor(Math.random() * safeChars.length));
    }

    return `${clean}${suffix}`;
  }

  /**
   * Mengambil kode referral milik user.
   * Jika user belum memilikinya di database, buatkan secara otomatis dan simpan ke user_referral_codes.
   */
  public async getUserReferralCode(userId: string, userName?: string): Promise<string> {
    if (!userId) return '';

    try {
      // 1. Cek apakah sudah terdaftar di database
      const { data, error } = await supabase
        .from('user_referral_codes')
        .select('referral_code')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data?.referral_code) {
        return data.referral_code;
      }

      // 2. Jika belum ada, buatkan kode baru
      return await this.assignUserReferralCode(userId, userName || 'USER');
    } catch (err) {
      console.warn('[referralService] Gagal mengambil kode referral user:', err);
      return '';
    }
  }

  /**
   * Menetapkan dan menyimpan kode referral baru untuk user ke database
   */
  public async assignUserReferralCode(userId: string, name: string): Promise<string> {
    if (!userId) return '';

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateCodeFromName(name);

      const { data, error } = await supabase
        .from('user_referral_codes')
        .insert({
          user_id: userId,
          referral_code: code,
        })
        .select('referral_code')
        .single();

      if (!error && data?.referral_code) {
        return data.referral_code;
      }

      // Jika error karena kode duplikat (unique constraint), loop akan mengulang generate kode baru
    }

    // Fallback jika tabrakan berulang: gunakan timestamp
    const fallbackCode = `KRM${Date.now().toString().slice(-5)}`;
    try {
      await supabase.from('user_referral_codes').insert({
        user_id: userId,
        referral_code: fallbackCode,
      });
      return fallbackCode;
    } catch (e) {
      console.error('[referralService] Fallback assignUserReferralCode error:', e);
      return fallbackCode;
    }
  }

  /**
   * Mencari pemilik kode referral (case-insensitive)
   */
  public async findReferrerByCode(
    code: string
  ): Promise<{ userId: string; referralCode: string; name?: string } | null> {
    if (!code || !code.trim()) return null;
    const cleanCode = code.trim().toUpperCase();

    try {
      const { data, error } = await supabase
        .from('user_referral_codes')
        .select('user_id, referral_code')
        .ilike('referral_code', cleanCode)
        .maybeSingle();

      if (error || !data) return null;

      // Ambil nama user pemilik
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', data.user_id)
        .maybeSingle();

      return {
        userId: data.user_id,
        referralCode: data.referral_code,
        name: userData?.name || 'Merchant Kroomify',
      };
    } catch (err) {
      console.warn('[referralService] Error validating referral code:', err);
      return null;
    }
  }

  /**
   * Mencatat pemakaian kode referral saat pendaftaran akun baru
   */
  public async redeemReferral(
    code: string,
    refereeUserId: string
  ): Promise<{ success: boolean; message: string; referrerUserId?: string; referrerName?: string }> {
    if (!code || !code.trim() || !refereeUserId) {
      return { success: false, message: 'Kode atau ID pendaftar tidak valid' };
    }

    try {
      const referrer = await this.findReferrerByCode(code);
      if (!referrer) {
        return { success: false, message: 'Kode rujukan (referral) tidak ditemukan' };
      }

      // Cegah referral diri sendiri
      if (referrer.userId === refereeUserId) {
        return { success: false, message: 'Tidak dapat menggunakan kode referral milik sendiri' };
      }

      // Cek apakah pendaftar sudah pernah memakai referral sebelumnya
      const { data: existing } = await supabase
        .from('referral_redemptions')
        .select('id')
        .eq('referee_user_id', refereeUserId)
        .maybeSingle();

      if (existing) {
        return { success: false, message: 'Akun ini sudah pernah mengklaim referral' };
      }

      // Catat ke tabel referral_redemptions
      const { error: insertErr } = await supabase
        .from('referral_redemptions')
        .insert({
          referrer_user_id: referrer.userId,
          referee_user_id: refereeUserId,
          referral_code: referrer.referralCode,
        });

      if (insertErr) {
        console.warn('[referralService] Gagal menyimpan riwayat referral:', insertErr.message);
        return { success: false, message: insertErr.message };
      }

      return {
        success: true,
        message: `Berhasil terhubung dengan rujukan dari ${referrer.name}`,
        referrerUserId: referrer.userId,
        referrerName: referrer.name,
      };
    } catch (err: any) {
      console.error('[referralService] Error in redeemReferral:', err);
      return { success: false, message: err?.message || 'Gagal memproses referral' };
    }
  }

  /**
   * Mengambil statistik referral user (kode milik sendiri, jumlah merchant yang diajak, dan daftarnya)
   */
  public async getReferralStats(userId: string, userName?: string): Promise<UserReferralInfo> {
    const referralCode = await this.getUserReferralCode(userId, userName);

    try {
      const { data, error } = await supabase
        .from('referral_redemptions')
        .select('referee_user_id, redeemed_at')
        .eq('referrer_user_id', userId)
        .order('redeemed_at', { ascending: false });

      if (error || !data) {
        return {
          referralCode,
          totalReferred: 0,
          referees: [],
        };
      }

      // Ambil detail nama & email merchant yang diajak
      const refereeIds = data.map((d) => d.referee_user_id);
      let userMap: Record<string, { name: string; email: string }> = {};

      if (refereeIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, email')
          .in('id', refereeIds);

        if (usersData) {
          userMap = usersData.reduce((acc, u) => {
            acc[u.id] = { name: u.name, email: u.email };
            return acc;
          }, {} as Record<string, { name: string; email: string }>);
        }
      }

      const referees = data.map((row) => ({
        refereeUserId: row.referee_user_id,
        refereeName: userMap[row.referee_user_id]?.name || 'Merchant',
        refereeEmail: userMap[row.referee_user_id]?.email || '-',
        redeemedAt: row.redeemed_at,
      }));

      return {
        referralCode,
        totalReferred: referees.length,
        referees,
      };
    } catch (err) {
      console.warn('[referralService] Error fetching stats:', err);
      return {
        referralCode,
        totalReferred: 0,
        referees: [],
      };
    }
  }
}

export const referralService = new ReferralService();
