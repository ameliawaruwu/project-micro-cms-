import { WithdrawalRequest, WalletTransaction } from '../types';
import { adminService } from './adminService';
import { storeService } from './storeService';
import { supabase } from './supabaseClient';

const TRANSACTIONS_KEY = 'microcms_wallet_transactions_v1';

const initialTransactions: WalletTransaction[] = [
  {
    id: 'tx-001',
    storeId: 'store-andhika',
    type: 'income',
    title: 'Penjualan Pesanan #ORD-2026-1024',
    amount: 350000,
    referenceId: 'ORD-2026-1024',
    status: 'completed',
    createdAt: '2026-09-07T09:15:00Z',
  },
  {
    id: 'tx-002',
    storeId: 'store-andhika',
    type: 'income',
    title: 'Penjualan Pesanan #ORD-2026-1023',
    amount: 700000,
    referenceId: 'ORD-2026-1023',
    status: 'completed',
    createdAt: '2026-09-06T17:40:00Z',
  },
  {
    id: 'tx-003',
    storeId: 'store-andhika',
    type: 'income',
    title: 'Penjualan Pesanan #ORD-2026-1022',
    amount: 400000,
    referenceId: 'ORD-2026-1022',
    status: 'completed',
    createdAt: '2026-09-06T11:20:00Z',
  },
  {
    id: 'tx-004',
    storeId: 'store-andhika',
    type: 'withdrawal',
    title: 'Penarikan Dana ke BCA (8820 1928 34)',
    amount: 500000,
    referenceId: 'wd-prev-001',
    status: 'completed',
    createdAt: '2026-09-03T10:00:00Z',
  },
];

class WalletService {
  private getStoredTransactions(): WalletTransaction[] {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(initialTransactions));
      return initialTransactions;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialTransactions;
    }
  }

  private saveTransactions(list: WalletTransaction[]) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
  }

  getTransactions(storeId: string): WalletTransaction[] {
    const all = this.getStoredTransactions();
    return all.filter((t) => t.storeId === storeId);
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

    // 2. Fetch current store balance
    const stores = await storeService.getStores();
    const currentStore = stores.find((s) => s.id === storeId);
    const balance = currentStore ? (currentStore.balance || 0) : 0;

    if (amount > balance) {
      return { success: false, message: 'Saldo aktif tidak mencukupi untuk nominal penarikan ini' };
    }

    // 3. Deduct store balance
    const updatedBalance = balance - amount;
    await storeService.updateStore(storeId, { balance: updatedBalance });

    // 4. Create Withdrawal Request in Admin Service
    const allWithdrawals = adminService.getWithdrawals();
    const newId = `wd-${Date.now().toString().slice(-6)}`;
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

    // 5. Record in Wallet Transaction History
    const allTxs = this.getStoredTransactions();
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      storeId,
      type: 'withdrawal',
      title: `Penarikan Dana ke ${bankName} (${accountNumber})`,
      amount,
      referenceId: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.saveTransactions([newTx, ...allTxs]);

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
