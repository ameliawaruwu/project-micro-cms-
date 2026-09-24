import { WithdrawalRequest, WalletTransaction } from '../types';
import { adminService } from './adminService';
import { storeService } from './storeService';
import { supabase } from './supabaseClient';
import { idService } from './idService';

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

    // 2. Fetch balance dari toko yang spesifik (bukan semua toko)
    const currentStore = await storeService.getStoreById(storeId);
    const balance = currentStore ? (currentStore.balance || 0) : 0;

    if (amount > balance) {
      return { success: false, message: 'Saldo aktif tidak mencukupi untuk nominal penarikan ini' };
    }

    // 3. Deduct store balance
    const updatedBalance = balance - amount;
    await storeService.updateStore(storeId, { balance: updatedBalance });

    // 4. Create Withdrawal Request in Admin Service
    const allWithdrawals = adminService.getWithdrawals();
    const newId = await idService.generateNextId('withdrawals');
    const newWithdrawal: WithdrawalRequest = {
      id: newId,
      storeId,
      storeName,
      storeLogo,
      amount,
      bankName,
      accountNumber,
      accountHolder,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    localStorage.setItem('microcms_admin_withdrawals_v1', JSON.stringify([newWithdrawal, ...allWithdrawals]));

    // Sync to Supabase withdrawals table
    try {
      await supabase.from('withdrawals').insert([
        {
          id: newWithdrawal.id,
          store_id: newWithdrawal.storeId,
          store_name: newWithdrawal.storeName,
          store_logo: newWithdrawal.storeLogo,
          amount: newWithdrawal.amount,
          bank_name: newWithdrawal.bankName,
          account_number: newWithdrawal.accountNumber,
          account_holder: newWithdrawal.accountHolder,
          status: 'pending',
          requested_at: newWithdrawal.requestedAt,
        },
      ]);
    } catch (err) {
      console.warn('Failed to insert withdrawal to Supabase:', err);
    }

    // 5. Record in Wallet Transaction History (partisi per storeId)
    const allTxs = this.getStoredTransactions(storeId);
    const txId = await idService.generateNextId('wallet_transactions');
    const newTx: WalletTransaction = {
      id: txId,
      storeId,
      type: 'withdrawal',
      title: `Penarikan Dana ke ${bankName} (${accountNumber})`,
      amount,
      referenceId: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.saveTransactions(storeId, [newTx, ...allTxs]);

    // Sync to Supabase wallet_transactions table
    try {
      await supabase.from('wallet_transactions').insert([
        {
          id: newTx.id,
          store_id: newTx.storeId,
          type: newTx.type,
          title: newTx.title,
          amount: newTx.amount,
          reference_id: newTx.referenceId,
          status: 'pending',
          created_at: newTx.createdAt,
        },
      ]);
    } catch (err) {
      console.warn('Failed to insert wallet_transaction to Supabase:', err);
    }

    return { success: true, message: 'Permohonan penarikan dana berhasil diajukan dan sedang diproses admin!' };
  }
}

export const walletService = new WalletService();
