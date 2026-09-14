import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { Store as StoreType, WalletTransaction, WithdrawalRequest } from '../../types';
import { walletService } from '../../services/walletService';
import { formatRupiah } from '../../utils/formatters';

interface MerchantWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreType;
  onBalanceUpdated?: () => void;
}

const POPULAR_BANKS = [
  { id: 'BCA', name: 'BCA (Bank Central Asia)' },
  { id: 'Mandiri', name: 'Bank Mandiri' },
  { id: 'BRI', name: 'BRI (Bank Rakyat Indonesia)' },
  { id: 'BNI', name: 'BNI (Bank Negara Indonesia)' },
  { id: 'BSI', name: 'Bank Syariah Indonesia (BSI)' },
  { id: 'CIMB', name: 'Bank CIMB Niaga' },
  { id: 'Permata', name: 'Bank Permata' },
  { id: 'Danamon', name: 'Bank Danamon' },
  { id: 'Bank Jago', name: 'Bank Jago' },
  { id: 'SeaBank', name: 'SeaBank' },
  { id: 'Blu', name: 'Blu by BCA Digital' },
  { id: 'Allo Bank', name: 'Allo Bank' },
  { id: 'Bank Lainnya', name: 'Bank Lainnya' },
];

export const MerchantWalletModal: React.FC<MerchantWalletModalProps> = ({
  isOpen,
  onClose,
  store,
  onBalanceUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [bankName, setBankName] = useState('BCA');
  const [accountNumber, setAccountNumber] = useState('8820 1928 34');
  const [accountHolder, setAccountHolder] = useState(store.name || 'Pemilik Toko');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500000');

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadWalletData = () => {
    setTransactions(walletService.getTransactions(store.id));
    setWithdrawals(walletService.getWithdrawalRequests(store.id));
  };

  useEffect(() => {
    if (isOpen) {
      loadWalletData();
      setFeedback(null);
    }
  }, [isOpen, store.id]);

  if (!isOpen) return null;

  const availableBalance = store.balance || 0;
  const pendingWithdrawalsAmount = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const amountNum = parseInt(withdrawAmount.replace(/\D/g, ''), 10);
    if (isNaN(amountNum) || amountNum < 50000) {
      setFeedback({ type: 'error', message: 'Minimal penarikan dana adalah Rp 50.000' });
      return;
    }

    if (amountNum > availableBalance) {
      setFeedback({ type: 'error', message: 'Saldo aktif tidak mencukupi untuk nominal penarikan ini.' });
      return;
    }

    try {
      setLoading(true);
      const res = await walletService.requestWithdrawal({
        storeId: store.id,
        storeName: store.name,
        storeLogo: store.logoUrl,
        amount: amountNum,
        bankName,
        accountNumber,
        accountHolder,
      });

      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        loadWalletData();
        if (onBalanceUpdated) onBalanceUpdated();
        setActiveTab('history');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan saat mengajukan penarikan dana.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (val: number) => {
    setWithdrawAmount(val.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] text-left">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900">Dompet Toko & Tarik Saldo</h2>
              <p className="text-[11px] text-gray-500">{store.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Card Banner */}
        <div className="p-4 bg-gray-900 text-white">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-gray-400 font-medium block mb-0.5">Saldo Aktif Tersedia</span>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">{formatRupiah(availableBalance)}</p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Siap dicairkan</span>
              </div>
            </div>

            <div className="border-l border-gray-800 pl-3 flex flex-col justify-center">
              <span className="text-[11px] text-gray-400 font-medium block mb-0.5">Dalam Proses</span>
              <p className="text-base sm:text-lg font-bold text-amber-300">{formatRupiah(pendingWithdrawalsAmount)}</p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                <Clock className="w-3 h-3" />
                <span>Menunggu persetujuan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 px-5 gap-3 pt-2 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('withdraw')}
            className={`pb-2 text-xs font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'withdraw'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Form Penarikan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2 text-xs font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Riwayat ({transactions.length})</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mx-5 mt-3 p-2.5 rounded-md text-xs font-medium flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          
          {/* TAB 1: FORM PENARIKAN DANA */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-3.5 text-xs">
              
              {/* Bank Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1">Pilih Bank Tujuan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full pl-8.5 pr-8 py-2 rounded-md border border-gray-200 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 appearance-none transition cursor-pointer shadow-2xs"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Account Number & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 8820 1928 34"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    required
                    placeholder="Sesuai buku tabungan"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-700">Nominal Penarikan (Rp)</label>
                  <span className="text-[10px] text-gray-400">Min. Rp 50.000</span>
                </div>
                
                <input
                  type="number"
                  required
                  min={50000}
                  max={availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="500000"
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:border-red-500"
                />

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[100000, 500000, 1000000, availableBalance].map((val, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-200 text-[10px] font-medium text-gray-600 transition cursor-pointer"
                    >
                      {val === availableBalance ? 'Tarik Semua' : formatRupiah(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || availableBalance < 50000}
                  className="w-full py-2.5 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{loading ? 'Mengajukan...' : 'Ajukan Penarikan Dana'}</span>
                </button>
                <p className="text-[10px] text-center text-gray-400 mt-1.5">
                  Ditransfer ke rekening Anda dalam waktu 1x24 jam kerja setelah persetujuan admin.
                </p>
              </div>

            </form>
          )}

          {/* TAB 2: RIWAYAT MUTASI DOMPET */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  Belum ada riwayat transaksi dompet.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-md bg-gray-50/70 border border-gray-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}>
                        {tx.type === 'income' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-gray-900 leading-tight">{tx.title}</p>
                        <span className="text-[10px] text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold text-xs ${
                        tx.type === 'income' ? 'text-emerald-700' : 'text-gray-900'
                      }`}>
                        {tx.type === 'income' ? `+${formatRupiah(tx.amount)}` : `-${formatRupiah(tx.amount)}`}
                      </p>
                      <span className={`inline-block px-1 py-0.2 rounded text-[9px] font-semibold capitalize ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : tx.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {tx.status === 'completed' ? 'Selesai' : tx.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
