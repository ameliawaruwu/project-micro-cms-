import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Check,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  domainRequestService,
  DomainRequest,
  DOMAIN_TLD_PRICES,
} from '../../../services/domainRequestService';
import { formatRupiah } from '../../../utils/formatters';

import { Breadcrumb } from '../../../components/common/Breadcrumb';

interface AdminDomainRequestsTabProps {
  language: string;
  onShowToast?: (msg: string) => void;
  onRequestUpdated?: () => void;
  onNavigateOverview?: () => void;
}

export const AdminDomainRequestsTab: React.FC<AdminDomainRequestsTabProps> = ({
  language,
  onShowToast,
  onRequestUpdated,
  onNavigateOverview,
}) => {
  const isEn = language === 'en';

  const [requests, setRequests] = useState<DomainRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'active'>('all');
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<DomainRequest | null>(null);
  const [selectedRequestForApprove, setSelectedRequestForApprove] = useState<DomainRequest | null>(null);

  // Reject Modal State
  const [suggestion1, setSuggestion1] = useState('');
  const [suggestion2, setSuggestion2] = useState('');
  const [suggestion3, setSuggestion3] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Approve Modal State
  const [approvePrice, setApprovePrice] = useState<number>(250000);

  const loadRequests = async () => {
    const data = await domainRequestService.getAllRequests();
    setRequests(data);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved' || r.status === 'active').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.fullDomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenApproveModal = (req: DomainRequest) => {
    setSelectedRequestForApprove(req);
    setApprovePrice(req.price);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequestForApprove) return;
    await domainRequestService.approveRequest(selectedRequestForApprove.id, approvePrice);
    await loadRequests();
    if (onRequestUpdated) onRequestUpdated();
    setSelectedRequestForApprove(null);
    if (onShowToast) onShowToast(`Permintaan domain ${selectedRequestForApprove.fullDomain} berhasil disetujui!`);
  };

  const handleOpenRejectModal = (req: DomainRequest) => {
    setSelectedRequestForReject(req);
    // Berikan saran default cerdas berdasarkan nama domain
    const clean = req.domainName;
    setSuggestion1(`${clean}.id`);
    setSuggestion2(`${clean}.online`);
    setSuggestion3(`${clean}.top`);
    setAdminNotes(`Domain ${req.fullDomain} saat ini sudah tidak tersedia. Kami menyarankan domain alternatif berikut.`);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequestForReject) return;
    const suggestions = [suggestion1, suggestion2, suggestion3].filter((s) => s.trim().length > 0);
    await domainRequestService.rejectRequest(selectedRequestForReject.id, suggestions, adminNotes);
    await loadRequests();
    if (onRequestUpdated) onRequestUpdated();
    setSelectedRequestForReject(null);
    if (onShowToast) onShowToast(`Permintaan domain ${selectedRequestForReject.fullDomain} ditolak dengan saran.`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: isEn ? 'Dashboard' : 'Beranda', onClick: onNavigateOverview },
          { label: isEn ? 'Domain Requests' : 'Permintaan Domain', isActive: true },
        ]}
      />

      {/* 1. Header & Overview */}
      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#66000E]" />
            <span>{isEn ? 'Domain Requests' : 'Permintaan Domain'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEn
              ? 'Review custom domain requests from merchants, verify availability on IDCloudHost/Whois, approve, or provide alternative suggestions.'
              : 'Tinjau permohonan domain dari toko UMKM, cek ketersediaan di IDCloudHost/Whois, setujui, atau berikan saran domain alternatif.'}
          </p>
        </div>

        <a
          href="https://idcloudhost.com/domain/"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka IDCloudHost Domain</span>
        </a>
      </div>

      {/* 2. Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500 block">Menunggu Review</span>
            <span className="text-xl font-black text-amber-600">{pendingCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500 block">Disetujui / Aktif</span>
            <span className="text-xl font-black text-emerald-600">{approvedCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-gray-500 block">Ditolak / Beri Saran</span>
            <span className="text-xl font-black text-red-600">{rejectedCount}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search domain or store name...' : 'Cari nama domain atau toko...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected', 'active'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                statusFilter === st
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'all' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Nama Toko</th>
                <th className="px-4 py-3">Domain yang Diajukan</th>
                <th className="px-4 py-3">Biaya Tahunan</th>
                <th className="px-4 py-3">Tanggal Pengajuan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <span>Tidak ada permohonan domain yang sesuai filter.</span>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {req.storeName}
                      <span className="block text-[10px] text-gray-400 font-normal">ID: {req.storeId}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-sm text-gray-900">
                        <span>{req.fullDomain}</span>
                        <a
                          href={`https://idcloudhost.com/domain/?domain=${req.fullDomain}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Cek di IDCloudHost"
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <span className="text-[10px] text-gray-400">Ekstensi {req.tld}</span>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-gray-900">
                      {formatRupiah(req.price)}
                      <span className="text-[10px] text-gray-400 font-normal block">/ tahun</span>
                    </td>

                    <td className="px-4 py-3.5 text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : req.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {req.status === 'pending' && <Clock className="w-3 h-3" />}
                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {req.status === 'active' && <Check className="w-3 h-3" />}
                        <span>{req.status}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenApproveModal(req)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(req)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> Tolak & Saran
                            </button>
                          </>
                        )}
                        {req.status === 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(req)}
                            className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-xs font-medium cursor-pointer"
                          >
                            Edit Saran
                          </button>
                        )}
                        {req.status === 'approved' && (
                          <span className="text-[11px] text-blue-700 font-semibold">
                            Menunggu Pembayaran Toko
                          </span>
                        )}
                        {req.status === 'active' && (
                          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                            <Check className="w-3 h-3" /> Terhubung
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. APPROVE MODAL */}
      {selectedRequestForApprove && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Setujui Permintaan Domain
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequestForApprove(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Anda akan menyetujui ketersediaan domain <strong>{selectedRequestForApprove.fullDomain}</strong> untuk toko <strong>{selectedRequestForApprove.storeName}</strong>. Sistem akan menerbitkan invoice pembayaran Midtrans ke akun toko tersebut.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nominal Tagihan Domain (1 Tahun):
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500">Rp</span>
                <input
                  type="number"
                  value={approvePrice}
                  onChange={(e) => setApprovePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequestForApprove(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Konfirmasi Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. REJECT & SUGGEST MODAL */}
      {selectedRequestForReject && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                Tolak & Berikan Saran Alternatif
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequestForReject(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Jika domain <strong>{selectedRequestForReject.fullDomain}</strong> sudah terdaftar di IDCloudHost/Whois, masukkan rekomendasi alternatif domain yang masih tersedia agar merchant dapat langsung memilih.
            </p>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-gray-700">Rekomendasi Domain Tersedia:</label>
              <input
                type="text"
                value={suggestion1}
                onChange={(e) => setSuggestion1(e.target.value)}
                placeholder="Rekomendasi 1: contoh.id"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                value={suggestion2}
                onChange={(e) => setSuggestion2(e.target.value)}
                placeholder="Rekomendasi 2: contoh.online"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                value={suggestion3}
                onChange={(e) => setSuggestion3(e.target.value)}
                placeholder="Rekomendasi 3: contoh.top"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Catatan untuk Merchant:</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequestForReject(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                Kirim Saran ke Merchant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
