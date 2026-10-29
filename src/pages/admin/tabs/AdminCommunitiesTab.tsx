import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Building2,
  Store as StoreIcon,
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  DollarSign,
  Percent,
  Shield,
  ExternalLink,
  FileText,
  Filter,
  Sparkles,
  AlertCircle,
  Save,
  Trash2,
  Check,
  UserCheck,
} from 'lucide-react';
import { Community, CommunityTurnoverInvoice, Store, Order, User } from '../../../types';
import { communityService } from '../../../services/communityService';
import { storeService } from '../../../services/storeService';
import { adminService } from '../../../services/adminService';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AdminCommunitiesTabProps {
  currentUser?: User | null;
  onOpenStorefront?: (slug: string) => void;
  onShowToast?: (msg: string) => void;
}

export const AdminCommunitiesTab: React.FC<AdminCommunitiesTabProps> = ({
  currentUser,
  onOpenStorefront,
  onShowToast,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const isSubAdmin = currentUser?.role === 'sub_admin' || currentUser?.role === 'community_admin';
  const targetCommunityId = currentUser?.communityId || 'comm_gmps';

  // Data states
  const [communities, setCommunities] = useState<Community[]>(() => communityService.getCommunities());
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(targetCommunityId);
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<CommunityTurnoverInvoice[]>(() =>
    communityService.getCommunityInvoices(isSubAdmin ? targetCommunityId : undefined)
  );

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'merchants' | 'invoices' | 'settings'>('overview');
  const [searchMerchant, setSearchMerchant] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStoreToAssign, setSelectedStoreToAssign] = useState('');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Load stores & orders
  useEffect(() => {
    let isMounted = true;
    storeService.getStores().then((allStores) => {
      if (isMounted) setStores(allStores);
    });
    adminService.fetchOrdersFromDatabase().then((allOrders) => {
      if (isMounted) setOrders(allOrders);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCommunity = useMemo(() => {
    return (
      communities.find((c) => c.id === selectedCommunityId) ||
      communities[0] || {
        id: 'comm_gmps',
        name: 'Komunitas GMPS',
        slug: 'gmps',
        coordinatorName: 'Koordinator GMPS',
        coordinatorEmail: 'gmps@kroomify.id',
        coordinatorPhone: '081234567890',
        turnoverFeePercent: 2.5,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
      }
    );
  }, [communities, selectedCommunityId]);

  // Stores associated with active community
  const communityStores = useMemo(() => {
    return stores.filter(
      (s) =>
        s.communityId === activeCommunity.id ||
        (activeCommunity.id === 'comm_gmps' && (!s.communityId || s.communityId === 'comm_gmps'))
    );
  }, [stores, activeCommunity.id]);

  // Filtered stores based on search
  const filteredCommunityStores = useMemo(() => {
    if (!searchMerchant.trim()) return communityStores;
    const q = searchMerchant.toLowerCase();
    return communityStores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.phoneWhatsApp && s.phoneWhatsApp.includes(q))
    );
  }, [communityStores, searchMerchant]);

  // Calculate turnover metrics
  const turnoverStats = useMemo(() => {
    return communityService.calculateCommunityTurnover(activeCommunity.id, communityStores, orders);
  }, [activeCommunity.id, communityStores, orders]);

  // Community invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.communityId === activeCommunity.id);
  }, [invoices, activeCommunity.id]);

  // Handle assigning a store to community
  const handleAssignStore = async () => {
    if (!selectedStoreToAssign) return;
    try {
      await communityService.assignStoreToCommunity(
        selectedStoreToAssign,
        activeCommunity.id,
        activeCommunity.name
      );

      const refreshedStores = await storeService.getStores();
      setStores(refreshedStores);
      setIsAssignModalOpen(false);
      setSelectedStoreToAssign('');
      if (onShowToast) {
        onShowToast(`Toko berhasil ditambahkan ke naungan ${activeCommunity.name}!`);
      }
    } catch (err: any) {
      alert('Gagal mengaitkan toko: ' + (err?.message || ''));
    }
  };

  // Handle unassigning a store
  const handleRemoveStoreFromCommunity = async (storeId: string) => {
    if (!confirm('Apakah Anda yakin ingin melepas toko ini dari keanggotaan komunitas?')) return;
    try {
      await storeService.updateStore(storeId, {
        communityId: undefined,
        communityName: undefined,
      });
      const refreshedStores = await storeService.getStores();
      setStores(refreshedStores);
      if (onShowToast) {
        onShowToast('Toko dilepas dari komunitas.');
      }
    } catch (err: any) {
      alert('Gagal melepas toko: ' + (err?.message || ''));
    }
  };

  // Generate Turnover Invoice
  const handleGenerateInvoice = () => {
    setIsGeneratingInvoice(true);
    try {
      const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
      const newInv = communityService.createTurnoverInvoice(
        activeCommunity.id,
        currentMonth,
        turnoverStats.totalTurnover,
        activeCommunity.turnoverFeePercent
      );
      setInvoices(communityService.getCommunityInvoices(isSubAdmin ? targetCommunityId : undefined));
      if (onShowToast) {
        onShowToast(`Invoice tagihan omset periode ${currentMonth} berhasil diterbitkan!`);
      }
    } catch (err: any) {
      alert('Gagal menerbitkan invoice: ' + (err?.message || ''));
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Mark invoice paid
  const handleMarkPaid = (invId: string) => {
    communityService.markInvoicePaid(invId);
    setInvoices(communityService.getCommunityInvoices(isSubAdmin ? targetCommunityId : undefined));
    if (onShowToast) {
      onShowToast('Status invoice diperbarui menjadi LUNAS.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans pb-16 text-left">
      {/* 1. Header Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0 border border-[#E5E0DD] shadow-2xs">
            <Users className="w-6 h-6 text-[#66000E]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                {isSubAdmin ? `Portal Koordinator Lapak — ${activeCommunity.name}` : 'Kelola Komunitas & Sub-Admin (GMPS)'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                {isSubAdmin ? 'Delegasi Sub-Admin' : 'Multi-Tenant Komunitas'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              Pendelegasian manajemen lapak merchant ke komunitas mitra (<strong>GMPS</strong>). Komunitas mengatur lapak
              anggota secara mandiri dan ditagihkan biaya layanan berbasis <strong>persentase omset penjualan</strong>.
            </p>
          </div>
        </div>

        {/* Community Selector (if Super Admin has multiple communities) */}
        {!isSubAdmin && communities.length > 1 && (
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Pilih Komunitas:</span>
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#66000E] cursor-pointer"
            >
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Lapak / Merchant */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total Lapak Anggota</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <StoreIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">{communityStores.length}</span>
            <span className="text-xs font-semibold text-emerald-600">
              ({turnoverStats.activeStoresCount} Aktif Tayang)
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Lapak UMKM terdaftar di {activeCommunity.slug.toUpperCase()}</p>
        </div>

        {/* Card 2: Total Omset Komunitas (GMV) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total Omset Komunitas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">
            Rp {turnoverStats.totalTurnover.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Dari {turnoverStats.completedOrdersCount} pesanan selesai
          </p>
        </div>

        {/* Card 3: Skema Komisi Omset */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Tarif Biaya Omset</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {activeCommunity.turnoverFeePercent}%
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-1">
            Ditagihkan sesuai omset penjualan
          </p>
        </div>

        {/* Card 4: Estimasi Tagihan Layanan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs bg-gradient-to-br from-white via-white to-[#F5E8EA]/30">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Estimasi Tagihan Komisi</span>
            <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#66000E] truncate">
            Rp {Math.round(turnoverStats.totalTurnover * (activeCommunity.turnoverFeePercent / 100)).toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {turnoverStats.totalTurnover > 0 ? 'Siap diterbitkan invoice' : 'Belum ada transaksi'}
          </p>
        </div>
      </div>

      {/* 3. Sub-Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-[#66000E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Profil Komunitas &amp; Sub-Admin</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('merchants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'merchants'
              ? 'bg-[#66000E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>Daftar Lapak Binaan ({communityStores.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'invoices'
              ? 'bg-[#66000E] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Tagihan &amp; Invoice Omset ({filteredInvoices.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PROFIL & DELEGASI SUB-ADMIN GMPS                               */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: Detail Komunitas */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeCommunity.logoUrl || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=200&auto=format&fit=crop'}
                  alt={activeCommunity.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-2xs"
                />
                <div>
                  <h3 className="text-base font-bold text-gray-900">{activeCommunity.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {activeCommunity.id} • Slug: /{activeCommunity.slug}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                Komunitas Aktif
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {activeCommunity.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1">
                <span className="text-gray-500 font-medium">Koordinator / Sub-Admin Delegasi:</span>
                <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>{activeCommunity.coordinatorName}</span>
                </p>
                <p className="text-gray-600">{activeCommunity.coordinatorEmail}</p>
                <p className="text-gray-600">{activeCommunity.coordinatorPhone}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1 bg-amber-50/40">
                <span className="text-amber-800 font-medium">Model Bisnis Komisi Omset:</span>
                <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-600" />
                  <span>Tarif {activeCommunity.turnoverFeePercent}% dari Total Omset</span>
                </p>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Lapak UMKM tidak dibebani biaya sewa hosting flat di muka. Tagihan hanya muncul proporsional dengan
                  penjualan riil merchant.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Sub-Admin Privileges Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Wewenang Sub-Admin Komunitas</span>
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Melihat dan memantau katalog lapak anggota GMPS secara terpusat.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Membantu onboarding merchant baru ke naungan paguyuban GMPS.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Menerima rekap omset dan tagihan invoice bagi hasil per periode.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Terisolasi dari data toko di luar komunitas GMPS demi keamanan tenant.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              <p>
                Akun koordinator Sub-Admin dapat login menggunakan email{' '}
                <strong className="text-gray-800 font-mono">gmps@kroomify.id</strong> (password:{' '}
                <strong className="text-gray-800 font-mono">gmps123</strong>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DAFTAR LAPAK BINAAN GMPS                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'merchants' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari lapak anggota (nama toko, slug, whatsapp)..."
                value={searchMerchant}
                onChange={(e) => setSearchMerchant(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#66000E]"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="px-4 py-2 bg-[#66000E] hover:bg-[#55000C] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Afiliasikan Toko ke {activeCommunity.slug.toUpperCase()}</span>
            </button>
          </div>

          {/* Merchants Table */}
          {filteredCommunityStores.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <StoreIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">Belum Ada Lapak Anggota</p>
              <p className="text-xs mt-1">
                Gunakan tombol &quot;Afiliasikan Toko&quot; di atas untuk memasukkan merchant binaan ke dalam komunitas ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Toko &amp; Lapak</th>
                    <th className="py-3 px-4">Subdomain / URL</th>
                    <th className="py-3 px-4">Kontak WhatsApp</th>
                    <th className="py-3 px-4">Paket / Status</th>
                    <th className="py-3 px-4 text-right">Saldo / Omset</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCommunityStores.map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.logoUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop'}
                            alt={st.name}
                            className="w-9 h-9 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block">{st.name}</span>
                            <span className="text-[11px] text-gray-500">{st.category || 'UMKM Retail'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-blue-700">
                        {st.slug}.kroombox.com
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {st.phoneWhatsApp || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            st.isPublished
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {st.isPublished ? 'Tayang (Published)' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-gray-900">
                        Rp {(st.balance || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenStorefront && onOpenStorefront(st.slug)}
                            title="Buka Toko Online"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveStoreFromCommunity(st.id)}
                            title="Lepas dari Komunitas"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: TAGIHAN & INVOICE BERBASIS OMSET                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Faktur &amp; Tagihan Biaya Omset — {activeCommunity.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Tagihan otomatis dihitung dari omset penjualan riil toko binaan sebesar{' '}
                <strong>{activeCommunity.turnoverFeePercent}%</strong>.
              </p>
            </div>

            <button
              type="button"
              disabled={isGeneratingInvoice}
              onClick={handleGenerateInvoice}
              className="px-4 py-2 bg-gradient-to-r from-[#66000E] to-[#990014] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Terbitkan Invoice Periode Ini</span>
            </button>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">Belum Ada Tagihan Diterbitkan</p>
              <p className="text-xs mt-1">Klik tombol &quot;Terbitkan Invoice Periode Ini&quot; untuk membuat tagihan baru.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm text-gray-900">{inv.invoiceNumber}</span>
                      <span className="text-xs font-semibold text-gray-600 bg-white px-2.5 py-0.5 rounded-lg border border-gray-200">
                        Periode: {inv.period}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {inv.status === 'paid' ? 'LUNAS (Terbayar)' : 'MENUNGGU PEMBAYARAN'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Total Omset Penjualan: <strong>Rp {inv.totalTurnover.toLocaleString('id-ID')}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Tarif Layanan: <strong>{inv.feePercent}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-gray-500 block">Total Ditagihkan</span>
                      <span className="text-base sm:text-lg font-extrabold text-[#66000E]">
                        Rp {inv.totalBilled.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {inv.status !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(inv.id)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        Tandai Lunas
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AFILIASIKAN TOKO KE KOMUNITAS                                      */}
      {/* ========================================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Afiliasikan Lapak ke {activeCommunity.name}</h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Pilih salah satu toko yang sudah terdaftar di platform untuk dimasukkan ke dalam naungan komunitas{' '}
              <strong>{activeCommunity.name}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Toko / Lapak *</label>
              <select
                value={selectedStoreToAssign}
                onChange={(e) => setSelectedStoreToAssign(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-[#66000E] cursor-pointer"
              >
                <option value="">-- Pilih Toko --</option>
                {stores
                  .filter((s) => s.communityId !== activeCommunity.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.slug}.kroombox.com)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!selectedStoreToAssign}
                onClick={handleAssignStore}
                className="px-4 py-2 rounded-xl bg-[#66000E] hover:bg-[#55000C] text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Simpan &amp; Afiliasikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
