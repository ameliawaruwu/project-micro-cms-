import React from 'react';
import {
  Wallet,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { WithdrawalRequest } from '../../../types';
import { formatRupiah } from '../../../utils/formatters';

interface AdminWithdrawalsTabProps {
  withdrawals: WithdrawalRequest[];
  withdrawalTab: 'pending' | 'approved';
  setWithdrawalTab: (tab: 'pending' | 'approved') => void;
  withdrawalPage: number;
  setWithdrawalPage: React.Dispatch<React.SetStateAction<number>>;
  handleApproveWithdrawal: (id: string, storeName: string) => void;
  handleRejectWithdrawal: (id: string, storeName: string) => void;
  isEn: boolean;
}

export const AdminWithdrawalsTab: React.FC<AdminWithdrawalsTabProps> = ({
  withdrawals,
  withdrawalTab,
  setWithdrawalTab,
  withdrawalPage,
  setWithdrawalPage,
  handleApproveWithdrawal,
  handleRejectWithdrawal,
  isEn,
}) => {
  const pendingList = withdrawals.filter((w) => w.status === 'pending');
  const approvedList = withdrawals.filter((w) => w.status === 'approved' || w.status === 'rejected');
  const currentList = withdrawalTab === 'pending' ? pendingList : approvedList;

  const WITHDRAWALS_PER_PAGE = 10;
  const totalPages = Math.ceil(currentList.length / WITHDRAWALS_PER_PAGE) || 1;
  const currentPage = Math.min(withdrawalPage, totalPages);
  const startIndex = (currentPage - 1) * WITHDRAWALS_PER_PAGE;
  const endIndex = Math.min(startIndex + WITHDRAWALS_PER_PAGE, currentList.length);
  const paginatedList = currentList.slice(startIndex, endIndex);

  const totalPendingAmount = pendingList.reduce((acc, w) => acc + w.amount, 0);
  const totalApprovedAmount = approvedList
    .filter((w) => w.status === 'approved')
    .reduce((acc, w) => acc + w.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-red-600" />
            <h2 className="text-base font-bold text-gray-900">
              {isEn ? 'Store Payout Requests' : 'Pencairan Dana Toko'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEn
              ? 'Manage and verify wallet balance withdrawal requests from merchant stores'
              : 'Kelola dan verifikasi permohonan transfer saldo dompet dari toko merchant'}
          </p>
        </div>

        {/* 2 Tabs: Butuh Approval & Selesai (Paid) */}
        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setWithdrawalTab('pending');
              setWithdrawalPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              withdrawalTab === 'pending'
                ? 'bg-white text-gray-900 shadow-2xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{isEn ? 'Needs Approval' : 'Butuh Approval'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              pendingList.length > 0 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {pendingList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setWithdrawalTab('approved');
              setWithdrawalPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
              withdrawalTab === 'approved'
                ? 'bg-white text-gray-900 shadow-2xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEn ? 'Approved (Paid)' : 'Berhasil Approval (Paid)'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              {approvedList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500">
              {isEn ? 'Awaiting Approval' : 'Menunggu Approval'}
            </span>
            <p className="text-base font-extrabold text-amber-600 mt-0.5">
              {pendingList.length} {isEn ? 'Requests' : 'Pengajuan'}
            </p>
            <span className="text-[11px] font-bold text-gray-700">
              {formatRupiah(totalPendingAmount)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500">
              {isEn ? 'Approved (Paid)' : 'Berhasil Disetujui (Paid)'}
            </span>
            <p className="text-base font-extrabold text-emerald-600 mt-0.5">
              {approvedList.filter((w) => w.status === 'approved').length} {isEn ? 'Completed' : 'Selesai'}
            </p>
            <span className="text-[11px] font-bold text-gray-700">
              {formatRupiah(totalApprovedAmount)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500">
              {isEn ? 'Platform Balance Processed' : 'Total Dana Diproses'}
            </span>
            <p className="text-base font-extrabold text-gray-900 mt-0.5">
              {formatRupiah(totalPendingAmount + totalApprovedAmount)}
            </p>
            <span className="text-[10px] text-gray-400">
              {withdrawals.length} {isEn ? 'total submissions' : 'total pengajuan'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Vertical List View (Maksimal 10 Item per Halaman) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              {withdrawalTab === 'pending'
                ? (isEn ? 'Pending Approval Requests' : 'Daftar Pengajuan Butuh Approval')
                : (isEn ? 'Completed Payout History (Paid)' : 'Riwayat Pencairan Dana Selesai (Paid)')}
            </h3>
            <p className="text-[11px] text-gray-500">
              {withdrawalTab === 'pending'
                ? (isEn ? 'Review and approve store balance withdrawals before sending funds' : 'Tinjau dan setujui penarikan saldo toko sebelum ditransfer ke rekening tujuan')
                : (isEn ? 'List of withdrawal transactions that have been approved or processed by admin' : 'Daftar transaksi penarikan dana yang telah disetujui atau diproses admin')}
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-700">
            Total: {currentList.length} {isEn ? 'Requests' : 'Pengajuan'}
          </span>
        </div>

        {paginatedList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <Wallet className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-xs font-medium">
              {withdrawalTab === 'pending'
                ? (isEn ? 'No payout requests awaiting approval.' : 'Tidak ada pengajuan penarikan dana yang menunggu persetujuan.')
                : (isEn ? 'No completed payout history yet.' : 'Belum ada riwayat penarikan dana yang selesai / disetujui.')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginatedList.map((req) => (
              <div
                key={req.id}
                className="p-4 hover:bg-gray-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info Toko & Bank */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700 font-extrabold text-xs shrink-0 shadow-2xs">
                    {req.bankName}
                  </div>

                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 leading-tight">
                        {req.storeName}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                        {req.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">
                        {req.bankName} • {req.accountNumber}
                      </span>
                      <span>a.n. <strong className="text-gray-900">{req.accountHolder}</strong></span>
                      <span className="text-gray-400 text-[11px]">
                        {isEn ? 'Requested:' : 'Diajukan:'} {new Date(req.requestedAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nominal, Status, & Aksi */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-medium text-gray-400 block">
                      {isEn ? 'Withdrawal Amount' : 'Nominal Penarikan'}
                    </span>
                    <span className="text-base font-extrabold text-gray-900">
                      {formatRupiah(req.amount)}
                    </span>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRejectWithdrawal(req.id, req.storeName)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-red-700 text-xs font-semibold transition cursor-pointer"
                      >
                        {isEn ? 'Reject' : 'Tolak'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveWithdrawal(req.id, req.storeName)}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Approve (Paid)' : 'Setujui (Paid)'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-left md:text-right space-y-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {req.status === 'approved' ? (isEn ? 'COMPLETED (PAID)' : 'SELESAI (PAID)') : (isEn ? 'REJECTED' : 'DITOLAK')}
                      </span>
                      {req.processedAt && (
                        <span className="text-[10px] text-gray-400 block">
                          {isEn ? 'Approved:' : 'Disetujui:'} {new Date(req.processedAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {currentList.length > 0 && (
          <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-600">
            <div>
              Menampilkan <strong className="text-gray-900">{startIndex + 1}</strong> - <strong className="text-gray-900">{endIndex}</strong> dari <strong className="text-gray-900">{currentList.length}</strong> data
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setWithdrawalPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <span className="px-2.5 py-1 font-semibold text-gray-800">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setWithdrawalPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
