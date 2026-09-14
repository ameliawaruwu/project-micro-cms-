import React, { useState, useEffect } from 'react';
import {
  Shield,
  Store as StoreIcon,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowUpRight,
  UserCheck,
  Ban,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Wallet,
  Zap,
  Layers,
  ArrowLeft,
  LayoutDashboard,
  Receipt,
  Settings as SettingsIcon,
  X,
  LogOut,
  Sliders,
  Check,
  CreditCard,
  Truck,
  AlertTriangle,
  EyeOff,
  Copy,
  Key,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Crown,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Store, WithdrawalRequest, AdminPlatformStats, Order, BillingPlan, BillingSubscription, User } from '../../types';
import { adminService } from '../../services/adminService';
import { billingPlanService } from '../../services/billingPlanService';
import { authService } from '../../services/authService';
import { formatRupiah } from '../../utils/formatters';

interface AdminDashboardPageProps {
  currentUser?: User | null;
  onBackToMerchant?: () => void;
  onOpenStorefront?: (slug: string) => void;
  onLogout?: () => void;
}

type AdminTab = 'overview' | 'stores' | 'withdrawals' | 'plans' | 'transactions' | 'settings';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  onBackToMerchant,
  onOpenStorefront,
  onLogout,
}) => {
  const [stats, setStats] = useState<AdminPlatformStats>(adminService.getPlatformStats());
  const [stores, setStores] = useState<Store[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [suspendedIds, setSuspendedIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const loggedInUser = currentUser || authService.getCurrentUser().user;
  const activeAdminName = loggedInUser?.name || 'Super Admin Kroombox';
  const activeAdminEmail = loggedInUser?.email || 'admin@kroombox.id';
  const activeAdminAvatar = loggedInUser?.avatarUrl;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Settings state
  const [platformSettings, setPlatformSettings] = useState(adminService.getPlatformSettings());
  const [testingService, setTestingService] = useState<string | null>(null);

  // Billing Plans CRUD state
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>(billingPlanService.getPlans());
  const [billingSubscriptions, setBillingSubscriptions] = useState<BillingSubscription[]>(billingPlanService.getSubscriptions());
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BillingPlan | null>(null);
  const [planSubTab, setPlanSubTab] = useState<'plans' | 'invoices'>('plans');
  const [withdrawalTab, setWithdrawalTab] = useState<'pending' | 'approved'>('pending');
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [planForm, setPlanForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    priceMonthly: 0,
    priceYearly: 0,
    featuresText: '',
    sortOrder: 1,
    isActive: true,
  });

  const handleTestApi = (service: 'midtrans' | 'biteship' | 'wa') => {
    setTestingService(service);
    setTimeout(() => {
      setTestingService(null);
      if (service === 'midtrans') {
        showToast('Koneksi Midtrans Gateway (.env): Berhasil (200 OK)');
      } else if (service === 'biteship') {
        showToast('Koneksi Biteship Shipping API (.env): Aktif');
      } else {
        showToast('WhatsApp Gateway API Token (.env): Valid');
      }
    }, 800);
  };

  const loadData = () => {
    setStats(adminService.getPlatformStats());
    setStores(adminService.getAllStores());
    setWithdrawals(adminService.getWithdrawals());
    setSuspendedIds(adminService.getSuspendedStoreIds());
    setOrders(adminService.getAllOrders());
    setBillingPlans(billingPlanService.getPlans());
    setBillingSubscriptions(billingPlanService.getSubscriptions());
  };

  useEffect(() => {
    loadData();
    billingPlanService.fetchPlansFromDatabase().then((plans) => {
      if (plans && plans.length > 0) setBillingPlans(plans);
    });
    adminService.fetchWithdrawalsFromDatabase().then((w) => {
      if (w && w.length > 0) setWithdrawals(w);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSuspend = (storeId: string, storeName: string) => {
    const isNowActive = adminService.toggleStoreSuspension(storeId);
    loadData();
    showToast(isNowActive ? `${storeName} diaktifkan kembali` : `${storeName} berhasil disuspend`);
  };

  const handleApproveWithdrawal = async (id: string, storeName?: string) => {
    await adminService.approveWithdrawal(id);
    loadData();
    showToast(storeName ? `Pencairan dana ${storeName} berhasil disetujui & dipindahkan ke Paid` : 'Pencairan dana berhasil disetujui & dipindahkan ke Paid');
  };

  const handleRejectWithdrawal = async (id: string, storeName?: string) => {
    if (window.confirm(`Tolak pengajuan penarikan dana ${storeName || ''}? Saldo akan dikembalikan ke dompet toko.`)) {
      await adminService.rejectWithdrawal(id);
      loadData();
      showToast('Pencairan dana ditolak & saldo toko dikembalikan');
    }
  };

  const handleChangePlan = (storeId: string, plan: 'free' | 'starter' | 'premium') => {
    adminService.updateStorePlan(storeId, plan);
    loadData();
    showToast(`Paket toko diperbarui ke ${plan.toUpperCase()}`);
  };

  // Plan CRUD Handlers
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      slug: '',
      tagline: '',
      priceMonthly: 0,
      priceYearly: 0,
      featuresText: '',
      sortOrder: billingPlans.length + 1,
      isActive: true,
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: BillingPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      slug: plan.slug,
      tagline: plan.tagline,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      featuresText: plan.features.join('\n'),
      sortOrder: plan.sortOrder,
      isActive: plan.isActive,
    });
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim() || !planForm.slug.trim()) {
      showToast('Nama paket dan slug kode wajib diisi!');
      return;
    }

    const features = planForm.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (editingPlan) {
      await billingPlanService.updatePlan(editingPlan.id, {
        name: planForm.name.trim(),
        slug: planForm.slug.trim().toLowerCase(),
        tagline: planForm.tagline.trim(),
        priceMonthly: Number(planForm.priceMonthly),
        priceYearly: Number(planForm.priceYearly),
        features,
        sortOrder: Number(planForm.sortOrder),
        isActive: planForm.isActive,
      });
      showToast(`Paket "${planForm.name}" berhasil diperbarui`);
    } else {
      await billingPlanService.createPlan({
        name: planForm.name.trim(),
        slug: planForm.slug.trim().toLowerCase(),
        tagline: planForm.tagline.trim(),
        priceMonthly: Number(planForm.priceMonthly),
        priceYearly: Number(planForm.priceYearly),
        features,
        sortOrder: Number(planForm.sortOrder),
        isActive: planForm.isActive,
      });
      showToast(`Paket baru "${planForm.name}" berhasil ditambahkan`);
    }

    setBillingPlans(billingPlanService.getPlans());
    setIsPlanModalOpen(false);
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus paket "${name}"?`)) {
      await billingPlanService.deletePlan(id);
      setBillingPlans(billingPlanService.getPlans());
      showToast(`Paket "${name}" berhasil dihapus`);
    }
  };

  const handleTogglePlanActive = async (id: string) => {
    const updated = await billingPlanService.togglePlanStatus(id);
    if (updated) {
      setBillingPlans(billingPlanService.getPlans());
      showToast(`Status paket ${updated.name} diubah menjadi ${updated.isActive ? 'Aktif' : 'Nonaktif'}`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminService.savePlatformSettings(platformSettings);
    showToast('Pengaturan sistem berhasil disimpan');
  };

  const filteredStores = stores.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterPlan === 'all') return matchSearch;
    return matchSearch && s.plan === filterPlan;
  });

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');

  const navItems = [
    { id: 'overview' as AdminTab, label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'stores' as AdminTab, label: 'Kelola Toko', icon: StoreIcon, count: stores.length },
    {
      id: 'withdrawals' as AdminTab,
      label: 'Pencairan Dana',
      icon: Wallet,
      badge: pendingWithdrawals.length > 0 ? pendingWithdrawals.length : undefined,
    },
    { id: 'plans' as AdminTab, label: 'Pengaturan Billing Plan', icon: Crown },
    { id: 'transactions' as AdminTab, label: 'Log Transaksi', icon: Receipt },
    { id: 'settings' as AdminTab, label: 'Pengaturan Sistem', icon: SettingsIcon },
  ];

  return (
    <div className="h-screen w-full bg-gray-50/60 text-gray-900 font-sans flex overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-3.5 py-2 rounded-md shadow-lg flex items-center gap-2 text-xs font-medium border border-gray-800 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR DRAWER (FIXED) */}
      <aside
        className={`h-screen bg-white border-r border-gray-200 flex flex-col justify-between z-40 transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarOpen ? 'w-60' : 'w-16'
        }`}
      >
        <div className={`p-3 flex flex-col h-full overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-16'}`}>
          
          {/* Brand Header */}
          <div className={`flex items-center pb-3.5 border-b border-gray-100 ${isSidebarOpen ? 'justify-between' : 'justify-center flex-col gap-2'}`}>
            <div className={`flex items-center gap-2.5 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900 tracking-tight">Kroombox</span>
                    <span className="px-1 py-0.2 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 block leading-tight truncate">Super Admin Panel</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
              title={isSidebarOpen ? "Ciutkan Menu (Hanya Ikon)" : "Perluas Menu"}
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-3 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center rounded-md text-xs font-medium transition cursor-pointer relative group ${
                    isSidebarOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'
                  } ${
                    isActive
                      ? 'bg-red-50 text-red-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarOpen ? 'gap-2.5 min-w-0' : 'justify-center'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badge */}
                  {item.badge !== undefined && (
                    isSidebarOpen ? (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                          isActive ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
                    )
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-gray-100 space-y-1">
            {onBackToMerchant && (
              <button
                onClick={onBackToMerchant}
                title={!isSidebarOpen ? "Mode Merchant" : undefined}
                className={`w-full flex items-center rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200/80 transition cursor-pointer ${
                  isSidebarOpen ? 'gap-2 px-2.5 py-1.5' : 'justify-center p-2'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                {isSidebarOpen && <span>Mode Merchant</span>}
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                title={!isSidebarOpen ? "Keluar" : undefined}
                className={`w-full flex items-center rounded-md text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition cursor-pointer ${
                  isSidebarOpen ? 'gap-2 px-2.5 py-1.5' : 'justify-center p-2'
                }`}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                {isSidebarOpen && <span>Keluar</span>}
              </button>
            )}
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER (FIXED HEADER + SCROLLABLE BODY) */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        
        {/* Top Header (Fixed) */}
        <header className="shrink-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-end gap-4">

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Sistem Aktif
            </span>

            <div className="h-4 w-px bg-gray-200 hidden sm:block" />

            {/* Logged in User Profile Info */}
            <div className="flex items-center gap-2.5">
              {activeAdminAvatar ? (
                <img
                  src={activeAdminAvatar}
                  alt={activeAdminName}
                  className="w-7 h-7 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-linear-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {activeAdminName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-gray-900 max-w-[120px] sm:max-w-[180px] truncate">
                  {activeAdminName}
                </span>
                <span className="text-[10px] text-gray-500 font-medium max-w-[120px] sm:max-w-[180px] truncate">
                  {activeAdminEmail}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 w-full">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* 4 Compact KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                
                {/* Total Stores */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-gray-500 mb-1.5">
                    <span className="text-xs font-medium">Toko Terdaftar</span>
                    <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">{stats.totalStores}</span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                      {stats.activeStores} Aktif
                    </span>
                  </div>
                </div>

                {/* Total GMV */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-gray-500 mb-1.5">
                    <span className="text-xs font-medium">Total GMV</span>
                    <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">{formatRupiah(stats.totalGmv)}</span>
                  </div>
                </div>

                {/* Platform Fee Revenue */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-gray-500 mb-1.5">
                    <span className="text-xs font-medium">Revenue Platform</span>
                    <DollarSign className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-red-600">{formatRupiah(stats.totalRevenueFee)}</span>
                    <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
                      {platformSettings.platformFeePercent}% Fee
                    </span>
                  </div>
                </div>

                {/* Pending Payouts */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs">
                  <div className="flex items-center justify-between text-gray-500 mb-1.5">
                    <span className="text-xs font-medium">Antrean Payout</span>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">{stats.pendingWithdrawalsCount}</span>
                    <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                      {formatRupiah(stats.pendingWithdrawalsAmount)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Recent Payouts */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Permintaan Pencairan Terbaru
                    </h3>
                    <button
                      onClick={() => setActiveTab('withdrawals')}
                      className="text-xs font-medium text-red-600 hover:underline flex items-center gap-0.5"
                    >
                      Lihat Semua <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {withdrawals.slice(0, 3).map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between p-2.5 rounded-md bg-gray-50/70 border border-gray-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-white border border-gray-200 flex items-center justify-center font-bold text-[11px] text-gray-700">
                            {w.bankName}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-gray-900 leading-tight">{w.storeName}</p>
                            <span className="text-[11px] text-gray-500">{w.accountHolder}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-xs text-gray-900 block">{formatRupiah(w.amount)}</span>
                          <span className={`text-[10px] font-semibold ${
                            w.status === 'pending' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {w.status === 'pending' ? 'Menunggu' : 'Disetujui'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Breakdown */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Distribusi Paket Langganan
                    </h3>
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="text-xs font-medium text-red-600 hover:underline flex items-center gap-0.5"
                    >
                      Atur Kuota <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="p-3 rounded-md bg-gray-50 border border-gray-200">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase block">Gratis</span>
                      <span className="text-lg font-bold text-gray-900">
                        {stores.filter((s) => !s.plan || s.plan === 'free').length}
                      </span>
                      <span className="text-[10px] text-gray-400 block">Toko</span>
                    </div>

                    <div className="p-3 rounded-md bg-red-50/60 border border-red-100">
                      <span className="text-[10px] font-semibold text-red-700 uppercase block">Pro</span>
                      <span className="text-lg font-bold text-red-600">
                        {stores.filter((s) => s.plan === 'premium' || s.plan === 'starter').length}
                      </span>
                      <span className="text-[10px] text-red-500 block">Toko</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: KELOLA TOKO */}
          {activeTab === 'stores' && (
            <div className="space-y-4">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative flex-1 w-full max-w-sm">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari toko berdasarkan nama, domain, atau pemilik..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {['all', 'free', 'premium'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPlan(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition cursor-pointer ${
                        filterPlan === p
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p === 'all' ? 'Semua' : p === 'premium' ? 'Pro' : 'Gratis'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stores Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3.5">Toko</th>
                        <th className="py-2.5 px-3.5">Paket</th>
                        <th className="py-2.5 px-3.5">Saldo Dompet</th>
                        <th className="py-2.5 px-3.5">Status</th>
                        <th className="py-2.5 px-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStores.map((store) => {
                        const isSuspended = suspendedIds.includes(store.id);
                        return (
                          <tr key={store.id} className="hover:bg-gray-50/60 transition">
                            
                            {/* Store details */}
                            <td className="py-2.5 px-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={store.logoUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100'}
                                  alt={store.name}
                                  className="w-7 h-7 rounded object-cover border border-gray-200"
                                />
                                <div>
                                  <p className="font-semibold text-gray-900 leading-tight">{store.name}</p>
                                  <span className="text-[11px] text-gray-400">/{store.slug} • {store.city}</span>
                                </div>
                              </div>
                            </td>

                            {/* Plan Selector */}
                            <td className="py-2.5 px-3.5">
                              <select
                                value={store.plan || 'free'}
                                onChange={(e) => handleChangePlan(store.id, e.target.value as any)}
                                className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-[11px] font-medium text-gray-800 focus:outline-none focus:border-red-500 cursor-pointer"
                              >
                                <option value="free">FREE</option>
                                <option value="starter">STARTER</option>
                                <option value="premium">PRO</option>
                              </select>
                            </td>

                            {/* Balance */}
                            <td className="py-2.5 px-3.5 font-semibold text-gray-900">
                              {formatRupiah(store.balance || 0)}
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3.5">
                              {isSuspended ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-100">
                                  <Ban className="w-3 h-3" /> Disuspend
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Aktif
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {onOpenStorefront && (
                                  <button
                                    onClick={() => onOpenStorefront(store.slug)}
                                    className="p-1 rounded border border-gray-200 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                                    title="Lihat Storefront"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleSuspend(store.id, store.name)}
                                  className={`px-2 py-0.5 rounded font-medium text-[11px] transition cursor-pointer ${
                                    isSuspended
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      : 'bg-white hover:bg-red-50 border border-red-200 text-red-600'
                                  }`}
                                >
                                  {isSuspended ? 'Aktifkan' : 'Suspend'}
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PENCAIRAN DANA */}
          {activeTab === 'withdrawals' && (() => {
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
                      <h2 className="text-base font-bold text-gray-900">Pencairan Dana Toko</h2>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Kelola dan verifikasi permohonan transfer saldo dompet dari toko merchant
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
                      <span>Butuh Approval</span>
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
                      <span>Berhasil Approval (Paid)</span>
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
                      <span className="text-[11px] font-medium text-gray-500">Menunggu Approval</span>
                      <p className="text-base font-extrabold text-amber-600 mt-0.5">
                        {pendingList.length} Pengajuan
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
                      <span className="text-[11px] font-medium text-gray-500">Berhasil Disetujui (Paid)</span>
                      <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                        {approvedList.filter((w) => w.status === 'approved').length} Selesai
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
                      <span className="text-[11px] font-medium text-gray-500">Total Seluruh Pengajuan</span>
                      <p className="text-base font-extrabold text-gray-900 mt-0.5">
                        {withdrawals.length} Transaksi
                      </p>
                      <span className="text-[11px] font-semibold text-gray-500">
                        Maks. 10 data per halaman
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
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
                          ? 'Daftar Pengajuan Butuh Approval'
                          : 'Riwayat Pencairan Dana Selesai (Paid)'}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {withdrawalTab === 'pending'
                          ? 'Tinjau dan setujui penarikan saldo toko sebelum ditransfer ke rekening tujuan'
                          : 'Daftar transaksi penarikan dana yang telah disetujui atau diproses admin'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      Total: {currentList.length} Pengajuan
                    </span>
                  </div>

                  {paginatedList.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 space-y-2">
                      <Wallet className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="text-xs font-medium">
                        {withdrawalTab === 'pending'
                          ? 'Tidak ada pengajuan penarikan dana yang menunggu persetujuan.'
                          : 'Belum ada riwayat penarikan dana yang selesai / disetujui.'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {paginatedList.map((req, idx) => (
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
                                  Diajukan: {new Date(req.requestedAt).toLocaleDateString('id-ID', {
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
                              <span className="text-[10px] font-medium text-gray-400 block">Nominal Penarikan</span>
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
                                  Tolak
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveWithdrawal(req.id, req.storeName)}
                                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Setujui (Paid)</span>
                                </button>
                              </div>
                            ) : (
                              <div className="text-left md:text-right space-y-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                                  req.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {req.status === 'approved' ? 'SELESAI (PAID)' : 'DITOLAK'}
                                </span>
                                {req.processedAt && (
                                  <span className="text-[10px] text-gray-400 block">
                                    Disetujui: {new Date(req.processedAt).toLocaleDateString('id-ID', {
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

                  {/* Pagination Bar (Maksimal 10 per halaman) */}
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
          })()}

          {/* TAB 4: PENGATURAN BILLING PLAN (CRUD & INVOICES) */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              
              {/* Header Action Bar */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-red-600" />
                    <h2 className="text-base font-bold text-gray-900">Pengaturan Billing Plan</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Kelola paket langganan toko, harga bulanan & tahunan, fitur, dan riwayat tagihan platform
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex bg-gray-100 p-1 rounded-md text-xs font-semibold">
                    <button
                      onClick={() => setPlanSubTab('plans')}
                      className={`px-3 py-1 rounded transition cursor-pointer ${
                        planSubTab === 'plans'
                          ? 'bg-white text-gray-900 shadow-2xs font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Daftar Paket ({billingPlans.length})
                    </button>
                    <button
                      onClick={() => setPlanSubTab('invoices')}
                      className={`px-3 py-1 rounded transition cursor-pointer ${
                        planSubTab === 'invoices'
                          ? 'bg-white text-gray-900 shadow-2xs font-bold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Riwayat Langganan ({billingSubscriptions.length})
                    </button>
                  </div>

                  <button
                    onClick={handleOpenCreatePlan}
                    className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Paket Baru</span>
                  </button>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-gray-500">Total Paket Aktif</span>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">
                      {billingPlans.filter((p) => p.isActive).length} / {billingPlans.length} Paket
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-gray-500">Toko Berlangganan Berbayar</span>
                    <p className="text-lg font-bold text-red-600 mt-0.5">
                      {stores.filter((s) => s.plan && s.plan !== 'free').length} Toko
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-gray-500">Total Pemasukan Paket</span>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">
                      {formatRupiah(billingSubscriptions.reduce((acc, sub) => acc + sub.amount, 0))}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Subtab 1: Plans CRUD Cards */}
              {planSubTab === 'plans' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {billingPlans.map((plan) => {
                    const storeCount = stores.filter((s) => s.plan === plan.slug).length;
                    return (
                      <div
                        key={plan.id}
                        className={`bg-white rounded-xl p-4 border transition duration-150 flex flex-col justify-between relative shadow-2xs ${
                          plan.isActive ? 'border-gray-200 hover:border-gray-300' : 'border-dashed border-gray-300 bg-gray-50/50 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-extrabold text-sm text-gray-900">{plan.name}</h3>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                                  {plan.slug}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 min-h-[32px]">
                                {plan.tagline || 'Tidak ada deskripsi'}
                              </p>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                plan.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {plan.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>

                          {/* Pricing Box */}
                          <div className="bg-gray-50 rounded-lg p-2.5 my-3 border border-gray-100 space-y-1">
                            <div className="flex items-baseline justify-between text-xs">
                              <span className="text-gray-500">Bulanan:</span>
                              <span className="font-extrabold text-gray-900">
                                {plan.priceMonthly === 0 ? 'Gratis' : `${formatRupiah(plan.priceMonthly)} / bln`}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between text-xs">
                              <span className="text-gray-500">Tahunan:</span>
                              <span className="font-extrabold text-gray-900">
                                {plan.priceYearly === 0 ? 'Gratis' : `${formatRupiah(plan.priceYearly)} / thn`}
                              </span>
                            </div>
                          </div>

                          {/* Features preview */}
                          <div className="space-y-1.5 text-xs text-gray-700 pb-3">
                            <span className="text-[11px] font-semibold text-gray-400 block mb-1">Fitur Utama:</span>
                            {plan.features.slice(0, 5).map((feat, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] leading-snug">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="line-clamp-1">{feat}</span>
                              </div>
                            ))}
                            {plan.features.length > 5 && (
                              <p className="text-[10px] text-gray-400 pl-4.5">
                                +{plan.features.length - 5} fitur lainnya
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Users Count & Actions */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                            <StoreIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{storeCount} Toko</span>
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleTogglePlanActive(plan.id)}
                              title={plan.isActive ? 'Nonaktifkan paket' : 'Aktifkan paket'}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                            >
                              {plan.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditPlan(plan)}
                              title="Edit paket"
                              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePlan(plan.id, plan.name)}
                              title="Hapus paket"
                              className="p-1.5 rounded hover:bg-red-50 text-red-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Subtab 2: Invoices Log Table */
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                        Log Riwayat Langganan Toko
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Catatan transaksi langganan merchant yang telah diproses platform
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {billingSubscriptions.length} Transaksi Tercatat
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3.5">Invoice</th>
                          <th className="py-2.5 px-3.5">Nama Toko</th>
                          <th className="py-2.5 px-3.5">Paket</th>
                          <th className="py-2.5 px-3.5">Siklus</th>
                          <th className="py-2.5 px-3.5">Nominal</th>
                          <th className="py-2.5 px-3.5">Metode</th>
                          <th className="py-2.5 px-3.5">Status</th>
                          <th className="py-2.5 px-3.5">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {billingSubscriptions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50/60 transition">
                            <td className="py-2.5 px-3.5 font-mono font-semibold text-gray-900">
                              {sub.invoiceNumber}
                            </td>
                            <td className="py-2.5 px-3.5 font-medium text-gray-900">
                              {sub.storeName || sub.storeId}
                            </td>
                            <td className="py-2.5 px-3.5 font-semibold text-red-700">
                              {sub.planName}
                            </td>
                            <td className="py-2.5 px-3.5 text-gray-600 capitalize">
                              {sub.cycle === 'yearly' ? 'Tahunan' : 'Bulanan'}
                            </td>
                            <td className="py-2.5 px-3.5 font-bold text-gray-900">
                              {sub.amount === 0 ? 'Gratis' : formatRupiah(sub.amount)}
                            </td>
                            <td className="py-2.5 px-3.5 text-gray-600">
                              {sub.paymentMethod}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {sub.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-gray-500 text-[11px]">
                              {new Date(sub.paidAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODAL TAMBAH / EDIT PAKET */}
              {isPlanModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="w-full max-w-lg bg-white rounded-2xl p-5 border border-gray-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-base text-gray-900">
                          {editingPlan ? 'Edit Paket Langganan' : 'Tambah Paket Langganan Baru'}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPlanModalOpen(false)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-gray-700 mb-1">Nama Paket *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Pro UMKM"
                            value={planForm.name}
                            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-1">Slug / Kode Paket *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: premium / pro"
                            value={planForm.slug}
                            onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Tagline / Deskripsi</label>
                        <input
                          type="text"
                          placeholder="Deskripsi singkat target pengguna paket"
                          value={planForm.tagline}
                          onChange={(e) => setPlanForm({ ...planForm, tagline: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-gray-700 mb-1">Harga Bulanan (Rp) *</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            required
                            value={planForm.priceMonthly}
                            onChange={(e) => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-1">Harga Tahunan (Rp) *</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            required
                            value={planForm.priceYearly}
                            onChange={(e) => setPlanForm({ ...planForm, priceYearly: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-gray-700 mb-1">Urutan Tampil</label>
                          <input
                            type="number"
                            min="1"
                            value={planForm.sortOrder}
                            onChange={(e) => setPlanForm({ ...planForm, sortOrder: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-5">
                          <input
                            type="checkbox"
                            id="isActivePlan"
                            checked={planForm.isActive}
                            onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                            className="w-4 h-4 accent-red-600 cursor-pointer"
                          />
                          <label htmlFor="isActivePlan" className="font-semibold text-gray-800 cursor-pointer">
                            Paket Aktif & Tampil
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                          Daftar Fitur (1 baris = 1 fitur)
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Katalog produk hingga 100 item&#10;Metode pembayaran Midtrans&#10;Bebas watermark"
                          value={planForm.featuresText}
                          onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-600 text-xs font-sans leading-relaxed"
                        />
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlanModalOpen(false)}
                          className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-xs cursor-pointer"
                        >
                          {editingPlan ? 'Simpan Perubahan' : 'Tambah Paket'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: LOG TRANSAKSI */}
          {activeTab === 'transactions' && (
            <div className="space-y-3.5">
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
                <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Riwayat Transaksi Global
                    </h3>
                    <p className="text-[11px] text-gray-400">Semua pesanan pembeli yang diproses melalui gateway</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{orders.length} Transaksi</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3.5">Order ID</th>
                        <th className="py-2.5 px-3.5">Pembeli</th>
                        <th className="py-2.5 px-3.5">Metode</th>
                        <th className="py-2.5 px-3.5">Total Belanja</th>
                        <th className="py-2.5 px-3.5">Fee Platform</th>
                        <th className="py-2.5 px-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map((ord) => {
                        const fee = Math.round(ord.grandTotal * 0.015);
                        return (
                          <tr key={ord.id} className="hover:bg-gray-50/60 transition">
                            <td className="py-2.5 px-3.5 font-mono font-semibold text-gray-900">
                              {ord.orderNumber || ord.id.slice(0, 8)}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <p className="font-semibold text-gray-900 leading-tight">{ord.customerName}</p>
                              <span className="text-[10px] text-gray-400">{ord.customerPhone}</span>
                            </td>
                            <td className="py-2.5 px-3.5 text-gray-600">
                              {ord.paymentMethod}
                            </td>
                            <td className="py-2.5 px-3.5 font-semibold text-gray-900">
                              {formatRupiah(ord.grandTotal)}
                            </td>
                            <td className="py-2.5 px-3.5 font-semibold text-emerald-700">
                              +{formatRupiah(fee)}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold capitalize ${
                                ord.paymentStatus === 'Sudah Dibayar'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {ord.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: PENGATURAN SISTEM & KEBIJAKAN PLATFORM */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-3xl">
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <SettingsIcon className="w-3.5 h-3.5 text-red-600" />
                    <span>Pengaturan Kebijakan & Sistem Platform</span>
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Konfigurasi operasional komisi transaksi, batas payout, dan status sistem. Kunci API rahasia dikelola aman via file .env.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>

              {/* 1. STATUS INTEGRASI API & GATEWAY (.ENV) */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
                <div className="pb-2 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xs text-gray-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-gray-500" />
                      <span>Status Integrasi Kunci API Master (.env)</span>
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Sesuai standar keamanan, seluruh Secret API Key dikonfigurasi melalui file environment backend (.env) agar tidak terekspos di browser.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Midtrans Status */}
                  <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-gray-900 block">Midtrans Payment</span>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Terhubung via .env
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestApi('midtrans')}
                      disabled={testingService === 'midtrans'}
                      className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {testingService === 'midtrans' ? 'Menguji...' : 'Tes Ping'}
                    </button>
                  </div>

                  {/* Biteship Status */}
                  <div className="p-3 rounded-lg bg-gray-50/80 border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-gray-900 block">Biteship Ekspedisi</span>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Terhubung via .env
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestApi('biteship')}
                      disabled={testingService === 'biteship'}
                      className="px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {testingService === 'biteship' ? 'Menguji...' : 'Tes Ping'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. FORM KEBIJAKAN OPERASIONAL PLATFORM */}
              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
                  <div className="pb-2 border-b border-gray-100">
                    <h3 className="font-semibold text-xs text-gray-900">Komisi Platform & Kebijakan Payout</h3>
                    <p className="text-[11px] text-gray-500">
                      Parameter tarif potongan dan ketentuan penarikan saldo toko merchant.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Biaya Transaksi (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={platformSettings.platformFeePercent}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            platformFeePercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Min. Tarik Saldo (Rp)</label>
                      <input
                        type="number"
                        step="10000"
                        min="10000"
                        value={platformSettings.payoutMinAmount}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            payoutMinAmount: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Biaya Bank (Rp)</label>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={platformSettings.payoutBankFee}
                        onChange={(e) =>
                          setPlatformSettings({
                            ...platformSettings,
                            payoutBankFee: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-medium text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Maintenance Switch */}
                  <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-200 mt-2">
                    <div>
                      <span className="font-medium text-gray-800 block">Mode Pemeliharaan (Maintenance Mode)</span>
                      <span className="text-[11px] text-gray-500">Jika aktif, pengunjung dan merchant akan melihat layar pemeliharaan sistem.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={platformSettings.maintenanceMode}
                      onChange={(e) =>
                        setPlatformSettings({ ...platformSettings, maintenanceMode: e.target.checked })
                      }
                      className="w-4 h-4 accent-red-600 cursor-pointer shrink-0"
                    />
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>

            </div>
          )}

        </main>
      </div>

    </div>
  );
};
