import { WithdrawalRequest, WalletTransaction } from '../types';
import { adminService } from './adminService';
import { storeService } from './storeService';
import { supabase } from './supabaseClient';

// ============================================================
// MERCHANT DATA ISOLATION: localStorage dipartisi per storeId
// Key format: microcms_wallet_v2_{storeId}
// ============================================================
const TRANSACTIONS_KEY_PREFIX = 'microcms_wallet_v2_';
// Hapus key global lama
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('microcms_wallet_transactions_v1');
  } catch { /* ignore */ }
}

class WalletService {
  private storeKey(storeId: string): string {
    return `${TRANSACTIONS_KEY_PREFIX}${storeId}`;
  }

  private getStoredTransactions(storeId: string): WalletTransaction[] {
    const raw = localStorage.getItem(this.storeKey(storeId));
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private saveTransactions(storeId: string, list: WalletTransaction[]) {
    localStorage.setItem(this.storeKey(storeId), JSON.stringify(list));
  }

  getTransactions(storeId: string): WalletTransaction[] {
    return this.getStoredTransactions(storeId);
  }

  getWithdrawalRequests(storeId: string): WithdrawalRequest[] {
    const all = adminService.getWithdrawals();
    return all.filter((w) => w.storeId === storeId);
  }

  async requestWithdrawal(params: {
    storeId: string;
    storeName: string;
    storeLogo?: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }): Promise<{ success: boolean; message: string }> {
    const { storeId, storeName, storeLogo, amount, bankName, accountNumber, accountHolder } = params;

    // 1. Validate minimal amount
    if (amount < 50000) {
      return { success: false, message: 'Minimal penarikan dana adalah Rp 50.000' };
    }

    // 2. Saldo dicek & dikurangi secara atomik oleh database (bukan oleh browser), lalu penarikan
    //    dan riwayat wallet dicatat dalam satu transaksi. Wajib sesi login pemilik toko.
    const { data, error } = await supabase.rpc('request_withdrawal', {
      p_store_id: storeId,
      p_amount: Math.round(amount),
      p_bank_name: bankName,
      p_account_number: accountNumber,
      p_account_holder: accountHolder,
    });
    if (error) {
      return { success: false, message: 'Tidak dapat terhubung ke server. Coba lagi beberapa saat.' };
    }
    if (!data?.success) {
      return { success: false, message: data?.message || 'Penarikan dana gagal diajukan.' };
    }

    // 3. Perbarui cache lokal untuk tampilan (sumber kebenaran tetap database)
    const requestedAt = new Date().toISOString();
    const newWithdrawal: WithdrawalRequest = {
      id: data.withdrawal_id,
      storeId,
      storeName,
      storeLogo,
      amount,
      bankName,
      accountNumber,
      accountHolder,
      status: 'pending',
      requestedAt,
    };
    localStorage.setItem('microcms_admin_withdrawals_v1', JSON.stringify([newWithdrawal, ...adminService.getWithdrawals()]));
    const newTx: WalletTransaction = {
      id: data.transaction_id,
      storeId,
      type: 'withdrawal',
      title: `Penarikan Dana ke ${bankName} (${accountNumber})`,
      amount,
      referenceId: data.withdrawal_id,
      status: 'pending',
      createdAt: requestedAt,
    };
    this.saveTransactions(storeId, [newTx, ...this.getStoredTransactions(storeId)]);
    try {
      const current = await storeService.getStoreById(storeId);
      if (current) await storeService.updateStore(storeId, { balance: Number(data.balance ?? current.balance) });
    } catch { /* tampilan saja */ }

    return { success: true, message: 'Permohonan penarikan dana berhasil diajukan dan sedang diproses admin!' };
  }
}

export const walletService = new WalletService();
