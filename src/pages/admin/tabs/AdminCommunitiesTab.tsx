import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Edit3,
  AlertTriangle,
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
  KeyRound,
  Mail,
  Phone,
  Lock,
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
  const targetCommunityId = currentUser?.communityId || '';

  // Data states
  const [communities, setCommunities] = useState<Community[]>(() => communityService.getCommunities());
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(() => {
    if (isSubAdmin && targetCommunityId) return targetCommunityId;
    const comms = communityService.getCommunities();
    return comms[0]?.id || '';
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<CommunityTurnoverInvoice[]>(() =>
    communityService.getCommunityInvoices(isSubAdmin && targetCommunityId ? targetCommunityId : undefined)
  );

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'merchants' | 'invoices'>('overview');
  const [searchMerchant, setSearchMerchant] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStoreToAssign, setSelectedStoreToAssign] = useState('');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Modal: Edit Detail Organisasi (Update CRUD)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    coordinatorName: '',
    coordinatorPhone: '',
    turnoverFeePercent: 2.5,
    status: 'active' as 'active' | 'pending' | 'inactive',
  });

  // Alert Dialog: Custom in-app confirmation modal (No native localhost alert)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    isDanger?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Ya, Hapus',
    isDanger: true,
    onConfirm: async () => {},
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Modal: Daftarkan Sub-Admin Baru
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    password: '',
  });

  // Load communities, stores & orders
  useEffect(() => {
    let isMounted = true;
    communityService.fetchCommunitiesFromDatabase().then((dbComms) => {
      if (isMounted && dbComms && dbComms.length > 0) {
        setCommunities(dbComms);
        if (!selectedCommunityId || !dbComms.some((c) => c.id === selectedCommunityId)) {
          setSelectedCommunityId(dbComms[0].id);
        }
      }
    });
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
    if (isSubAdmin && targetCommunityId) {
      const found = communities.find((c) => c.id === targetCommunityId);
      if (found) return found;
    }
    const found = communities.find((c) => c.id === selectedCommunityId);
    if (found) return found;
    return communities[0] || null;
  }, [communities, selectedCommunityId, isSubAdmin, targetCommunityId]);

  // Stores associated with active community
  const communityStores = useMemo(() => {
    if (!activeCommunity?.id) return [];
    return stores.filter((s) => s.communityId === activeCommunity.id);
  }, [stores, activeCommunity?.id]);

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
    if (!activeCommunity?.id) return { totalTurnover: 0, completedOrdersCount: 0, activeStoresCount: 0 };
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
      if (onShowToast) {
        onShowToast('❌ Gagal mengaitkan toko: ' + (err?.message || ''));
      }
    }
  };

  // Trigger Alert Dialog untuk melepas toko dari naungan
  const promptRemoveStore = (storeId: string, storeName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Lepas Toko "${storeName}"?`,
      description: `Toko ini akan dikeluarkan dari naungan ${activeCommunity.name} dan beralih menjadi toko mandiri reguler.`,
      confirmText: 'Ya, Lepas Toko',
      isDanger: true,
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await storeService.updateStore(storeId, {
            communityId: undefined,
            communityName: undefined,
          });
          const refreshedStores = await storeService.getStores();
          setStores(refreshedStores);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          if (onShowToast) {
            onShowToast(`Toko "${storeName}" berhasil dilepas dari organisasi.`);
          }
        } catch (err: any) {
          if (onShowToast) {
            onShowToast('❌ Gagal melepas toko: ' + (err?.message || ''));
          }
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
  };

  // Generate Turnover Invoice
  const handleGenerateInvoice = () => {
    setIsGeneratingInvoice(true);
    try {
      const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
      communityService.createTurnoverInvoice(
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
      if (onShowToast) {
        onShowToast('❌ Gagal menerbitkan invoice: ' + (err?.message || ''));
      }
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

  // Handle submit create organization & sub-admin
  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.coordinatorEmail.trim()) {
      if (onShowToast) onShowToast('⚠️ Nama organisasi dan email koordinator wajib diisi.');
      return;
    }
    setIsSubmittingCreate(true);
    try {
      const res = await communityService.createOrganizationWithSubAdmin({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        coordinatorName: createForm.coordinatorName.trim() || `Koordinator ${createForm.name.trim()}`,
        coordinatorEmail: createForm.coordinatorEmail.trim(),
        coordinatorPhone: createForm.coordinatorPhone.trim(),
        password: createForm.password.trim() || 'subadmin123',
      });

      const updatedCommunities = await communityService.fetchCommunitiesFromDatabase();
      setCommunities(updatedCommunities);
      setSelectedCommunityId(res.community.id);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        description: '',
        coordinatorName: '',
        coordinatorEmail: '',
        coordinatorPhone: '',
        password: '',
      });

      if (onShowToast) {
        onShowToast(`Sub-Admin & organisasi "${res.community.name}" berhasil didaftarkan ke database!`);
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('❌ Gagal mendaftarkan Sub-Admin: ' + (err?.message || ''));
      }
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Buka Modal Edit Organisasi
  const handleOpenEditModal = () => {
    setEditForm({
      name: activeCommunity.name || '',
      description: activeCommunity.description || '',
      coordinatorName: activeCommunity.coordinatorName || '',
      coordinatorPhone: activeCommunity.coordinatorPhone || '',
      turnoverFeePercent: activeCommunity.turnoverFeePercent || 2.5,
      status: activeCommunity.status || 'active',
    });
    setIsEditModalOpen(true);
  };

  // Handle Save Edit Organisasi (Update CRUD)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      if (onShowToast) onShowToast('⚠️ Nama organisasi tidak boleh kosong.');
      return;
    }
    setIsSubmittingEdit(true);
    try {
      await communityService.updateCommunity(activeCommunity.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        coordinatorName: editForm.coordinatorName.trim(),
        coordinatorPhone: editForm.coordinatorPhone.trim(),
        turnoverFeePercent: Number(editForm.turnoverFeePercent) || 2.5,
        status: editForm.status,
      });

      const refreshedComms = await communityService.fetchCommunitiesFromDatabase();
      setCommunities(refreshedComms);
      const refreshedStores = await storeService.getStores();
      setStores(refreshedStores);
      setIsEditModalOpen(false);

      if (onShowToast) {
        onShowToast(`Organisasi "${editForm.name}" berhasil diperbarui di database!`);
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('❌ Gagal memperbarui organisasi: ' + (err?.message || ''));
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Trigger Alert Dialog untuk menghapus organisasi secara permanen (Delete CRUD)
  const promptDeleteCommunity = (commId: string, commName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Hapus Organisasi "${commName}"?`,
      description: `Tindakan ini akan menghapus organisasi secara permanen dari database Supabase. Seluruh lapak binaan (${communityStores.length} toko) akan dilepas menjadi toko mandiri, dan akun Sub-Admin koordinator (${activeCommunity.coordinatorEmail}) akan dihapus.`,
      confirmText: 'Ya, Hapus Organisasi',
      isDanger: true,
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await communityService.deleteCommunity(commId);
          const refreshedComms = await communityService.fetchCommunitiesFromDatabase();
          setCommunities(refreshedComms);
          if (refreshedComms.length > 0) {
            setSelectedCommunityId(refreshedComms[0].id);
          } else {
            setSelectedCommunityId('');
          }
          const refreshedStores = await storeService.getStores();
          setStores(refreshedStores);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          if (onShowToast) {
            onShowToast(`Organisasi "${commName}" berhasil dihapus dari database.`);
          }
        } catch (e: any) {
          if (onShowToast) {
            onShowToast('❌ Gagal menghapus organisasi: ' + (e?.message || ''));
          }
        } finally {
          setIsConfirmLoading(false);
        }
      },
    });
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
                {isSubAdmin ? `Portal Koordinator Lapak — ${activeCommunity?.name || ''}` : 'Kelola Komunitas & Organisasi Sub-Admin'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                {isSubAdmin ? 'Delegasi Sub-Admin' : 'Multi-Tenant Komunitas'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              {isSubAdmin
                ? (activeCommunity ? `Pusat koordinasi toko-toko binaan ${activeCommunity.name}. Pantau transaksi katalog anggota dan kelola tagihan layanan platform.` : 'Pusat koordinasi toko-toko binaan organisasi Anda.')
                : 'Pendelegasian manajemen lapak merchant ke koordinator organisasi mitra (paguyuban, yayasan, sentra bisnis). Organisasi mengatur lapak anggota secara terisolasi dengan skema bagi hasil omset.'}
            </p>
          </div>
        </div>

        {/* Actions for Super Admin */}
        {!isSubAdmin && (
          <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
            {communities.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Pilih Organisasi:</span>
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

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 bg-[#66000E] hover:bg-[#52000B] text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Daftarkan Sub-Admin</span>
            </button>
          </div>
        )}
      </div>

      {!activeCommunity ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8 text-[#66000E]" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-gray-900">Belum Ada Organisasi &amp; Sub-Admin</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Belum ada organisasi mitra atau komunitas yang terdaftar di sistem. Daftarkan organisasi baru untuk memberikan akses Sub-Admin dalam mengelola toko binaan mereka.
            </p>
          </div>
          {!isSubAdmin && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#66000E] hover:bg-[#52000B] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Daftarkan Sub-Admin Organisasi</span>
            </button>
          )}
        </div>
      ) : (
        <>
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
            <span className="text-xs font-medium text-gray-500">toko binaan</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {communityStores.filter((s) => s.isPublished).length} toko aktif tayang
          </p>
        </div>

        {/* Card 2: Total Omset Penjualan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total Omset Anggota</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              Rp {(turnoverStats.totalTurnover || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Dari {turnoverStats.completedOrdersCount} transaksi berhasil
          </p>
        </div>

        {/* Card 3: Skema Komisi / Tagihan Omset */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Skema Tagihan Platform</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900">
              {activeCommunity.turnoverFeePercent}%
            </span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
              Bagi Hasil Omset
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Ditagihkan di akhir periode omset
          </p>
        </div>

        {/* Card 4: Estimasi Tagihan Berjalan */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Estimasi Tagihan Berjalan</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-900">
              Rp {Math.round(turnoverStats.totalTurnover * (activeCommunity.turnoverFeePercent / 100)).toLocaleString('id-ID')}
            </span>
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
          <span>Profil Organisasi &amp; Sub-Admin</span>
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
      {/* SUB-TAB 1: PROFIL & DELEGASI SUB-ADMIN                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: Detail Organisasi */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeCommunity.logoUrl || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=200&auto=format&fit=crop'}
                  alt={activeCommunity.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shadow-2xs bg-gray-50"
                />
                <div>
                  <h3 className="text-base font-bold text-gray-900">{activeCommunity.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {activeCommunity.id} • Slug: /{activeCommunity.slug}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                Organisasi Aktif
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
                <p className="text-gray-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{activeCommunity.coordinatorEmail}</span>
                </p>
                {activeCommunity.coordinatorPhone && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{activeCommunity.coordinatorPhone}</span>
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl border border-gray-200 space-y-1 bg-amber-50/40">
                <span className="text-amber-800 font-medium">Model Bisnis Komisi Omset:</span>
                <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-amber-600" />
                  <span>Tarif {activeCommunity.turnoverFeePercent}% dari Total Omset</span>
                </p>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Lapak UMKM tidak dibebani biaya sewa hosting flat di muka. Tagihan hanya muncul proporsional dengan
                  penjualan riil merchant binaan.
                </p>
              </div>
            </div>

            {/* Action buttons for Super Admin */}
            {!isSubAdmin && (
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tautkan Toko</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <span>Edit Organisasi</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => promptDeleteCommunity(activeCommunity.id, activeCommunity.name)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Organisasi</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Sub-Admin Privileges Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Wewenang Sub-Admin Organisasi</span>
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Melihat dan memantau katalog lapak anggota organisasinya secara terpusat.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Membantu onboarding merchant baru ke naungan paguyuban/organisasi.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Menerima rekap omset dan faktur invoice bagi hasil per periode.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Terisolasi dari data toko di luar organisasinya demi keamanan tenant.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              <p>
                Akun koordinator Sub-Admin terdaftar dengan email{' '}
                <strong className="text-gray-800 font-mono">{activeCommunity.coordinatorEmail}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DAFTAR LAPAK BINAAN                                            */}
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
              <span>Tautkan Toko ke {activeCommunity.name}</span>
            </button>
          </div>

          {/* Merchants Table */}
          {filteredCommunityStores.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <StoreIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-800">Belum Ada Lapak Anggota</p>
              <p className="text-xs mt-1">
                Gunakan tombol &quot;Tautkan Toko&quot; di atas untuk memasukkan merchant binaan ke dalam organisasi ini.
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
                    <th className="py-3 px-4">Status Tayang</th>
                    <th className="py-3 px-4 text-right">Saldo / Omset</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCommunityStores.map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {st.logoUrl && !st.logoUrl.includes('unsplash.com') ? (
                            <img
                              src={st.logoUrl}
                              alt={st.name}
                              className="w-9 h-9 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-600 shrink-0">
                              <StoreIcon className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
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
                            onClick={() => promptRemoveStore(st.id, st.name)}
                            title="Lepas dari Organisasi"
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
              className="px-4 py-2 bg-linear-to-r from-[#66000E] to-[#990014] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
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
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {inv.status === 'paid' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span>Total Omset Toko: <strong>Rp {inv.totalTurnover.toLocaleString('id-ID')}</strong></span>
                      <span>Tarif Komisi: <strong>{inv.feePercent}%</strong></span>
                      {inv.dueDate && <span>Jatuh Tempo: {new Date(inv.dueDate).toLocaleDateString('id-ID')}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-gray-500 block">Total Ditagihkan</span>
                      <span className="text-base font-extrabold text-[#66000E]">
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
    </>
  )}

      {/* ========================================================================= */}
      {/* MODAL 1: DAFTARKAN SUB-ADMIN ORGANISASI                                   */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-gray-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0 border border-[#E5E0DD]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Daftarkan Sub-Admin Organisasi</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Akun koordinator untuk mengelola lapak-lapak binaan. Fee omset platform ditagihkan di akhir periode.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreateOrganization} className="space-y-4 text-xs">
              {/* Bagian 1: Detail Organisasi */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span>1. Detail Organisasi / Komunitas Mitra</span>
                </h4>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nama Organisasi / Komunitas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paguyuban Pengrajin Kulit Garut"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    placeholder="Wadah paguyuban dan pembinaan lapak UMKM..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                  />
                </div>
              </div>

              {/* Bagian 2: Kredensial Sub-Admin */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <span>2. Akun Koordinator (Sub-Admin)</span>
                </h4>
                <p className="text-[11px] text-blue-800">
                  Akun ini akan otomatis didaftarkan ke Supabase dengan role <strong>Sub-Admin</strong> dan mengelola seluruh lapak di bawah naungannya.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nama Koordinator *</label>
                    <input
                      type="text"
                      required
                      placeholder="Budi Santoso"
                      value={createForm.coordinatorName}
                      onChange={(e) => setCreateForm({ ...createForm, coordinatorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      placeholder="081234567890"
                      value={createForm.coordinatorPhone}
                      onChange={(e) => setCreateForm({ ...createForm, coordinatorPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Email Login Sub-Admin *</label>
                    <input
                      type="email"
                      required
                      placeholder="koordinator@garut.id"
                      value={createForm.coordinatorEmail}
                      onChange={(e) => setCreateForm({ ...createForm, coordinatorEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Kata Sandi Awal *</label>
                    <input
                      type="text"
                      required
                      placeholder="subadmin123"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#66000E]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-4 py-2 rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSubmittingCreate ? 'Mendaftarkan...' : 'Daftarkan Sub-Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAUTKAN TOKO KE ORGANISASI                                       */}
      {/* ========================================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Tautkan Lapak ke {activeCommunity.name}</h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Pilih salah satu toko yang sudah terdaftar di platform untuk dimasukkan ke dalam naungan organisasi{' '}
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
                      {s.name} ({s.slug}.kroombox.com) {s.communityName ? `[Pindah dari: ${s.communityName}]` : '[Toko Mandiri]'}
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
                Simpan &amp; Tautkan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* ALERT DIALOG: KONFIRMASI HAPUS / LEPAS DENGAN TAMPILAN MODERN             */}
      {/* ========================================================================= */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-2xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">{confirmDialog.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{confirmDialog.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={isConfirmLoading}
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isConfirmLoading}
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isConfirmLoading ? 'Memproses...' : confirmDialog.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT DETAIL ORGANISASI & KOORDINATOR (UPDATE CRUD)               */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-gray-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0 border border-[#E5E0DD]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Edit Detail Organisasi</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Perbarui profil organisasi mitra dan kontak koordinator Sub-Admin.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <span>Detail Organisasi</span>
                </h4>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nama Organisasi / Komunitas *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Status Organisasi</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Fee Omset (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={editForm.turnoverFeePercent}
                      onChange={(e) => setEditForm({ ...editForm, turnoverFeePercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-700" />
                  <span>Kontak Koordinator Sub-Admin</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nama Koordinator *</label>
                    <input
                      type="text"
                      required
                      value={editForm.coordinatorName}
                      onChange={(e) => setEditForm({ ...editForm, coordinatorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      value={editForm.coordinatorPhone}
                      onChange={(e) => setEditForm({ ...editForm, coordinatorPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#66000E]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};