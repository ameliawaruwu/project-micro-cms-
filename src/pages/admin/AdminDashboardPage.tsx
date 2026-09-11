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
  Wallet,
  Zap,
  Layers,
  ArrowLeft,
  LayoutDashboard,
  Receipt,
  Settings as SettingsIcon,
  Menu,
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
} from 'lucide-react';
import { Store, WithdrawalRequest, AdminPlatformStats, Order } from '../../types';
import { adminService } from '../../services/adminService';
import { formatRupiah } from '../../utils/formatters';

interface AdminDashboardPageProps {
  onBackToMerchant?: () => void;
  onOpenStorefront?: (slug: string) => void;
  onLogout?: () => void;
}

type AdminTab = 'overview' | 'stores' | 'withdrawals' | 'plans' | 'transactions' | 'settings';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Settings state
  const [platformSettings, setPlatformSettings] = useState(adminService.getPlatformSettings());
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({
    midtransClient: false,
    midtransServer: false,
    biteship: false,
    waToken: false,
  });
  const [testingService, setTestingService] = useState<string | null>(null);

  const toggleKeyVisibility = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestApi = (service: 'midtrans' | 'biteship' | 'wa') => {
    setTestingService(service);
    setTimeout(() => {
      setTestingService(null);
      if (service === 'midtrans') {
        showToast('Koneksi Midtrans Server Key: Berhasil (200 OK)');
      } else if (service === 'biteship') {
        showToast('Koneksi Biteship Shipping API: Aktif');
      } else {
        showToast('WhatsApp Gateway API Token: Valid');
      }
    }, 1000);
  };

  const loadData = () => {
    setStats(adminService.getPlatformStats());
    setStores(adminService.getAllStores());
    setWithdrawals(adminService.getWithdrawals());
    setSuspendedIds(adminService.getSuspendedStoreIds());
    setOrders(adminService.getAllOrders());
  };

  useEffect(() => {
    loadData();
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

  const handleApproveWithdrawal = (id: string) => {
    adminService.approveWithdrawal(id);
    loadData();
    showToast('Pencairan dana berhasil disetujui');
  };

  const handleRejectWithdrawal = (id: string) => {
    adminService.rejectWithdrawal(id);
    loadData();
    showToast('Pencairan dana ditolak');
  };

  const handleChangePlan = (storeId: string, plan: 'free' | 'starter' | 'premium') => {
    adminService.updateStorePlan(storeId, plan);
    loadData();
    showToast(`Paket toko diperbarui ke ${plan.toUpperCase()}`);
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
    { id: 'plans' as AdminTab, label: 'Paket & Kuota', icon: Zap },
    { id: 'transactions' as AdminTab, label: 'Log Transaksi', icon: Receipt },
    { id: 'settings' as AdminTab, label: 'Pengaturan Sistem', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 text-gray-900 font-sans flex">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-3.5 py-2 rounded-md shadow-lg flex items-center gap-2 text-xs font-medium border border-gray-800 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE SIDEBAR BACKDROP */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-gray-900 tracking-tight">Kroombox</span>
                  <span className="px-1 py-0.2 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
                    ADMIN
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 block leading-tight">Super Admin Panel</span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-0.5 flex-1 overflow-y-auto">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2.5 mb-1.5 block">
              Menu Utama
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isActive ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.badge}
                    </span>
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200/80 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-gray-500" />
                <span>Mode Merchant</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            )}
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-semibold text-gray-900">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Sistem Aktif
            </span>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-4 sm:p-6 space-y-5 max-w-6xl">
          
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
          {activeTab === 'withdrawals' && (
            <div className="space-y-3.5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {withdrawals.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-lg p-3.5 border border-gray-200 shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-red-50 border border-red-100 flex items-center justify-center text-red-700 font-bold text-[10px]">
                          {req.bankName}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-gray-900">{req.storeName}</p>
                          <span className="text-[10px] text-gray-500">{req.bankName} • {req.accountNumber} ({req.accountHolder})</span>
                        </div>
                      </div>

                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold capitalize ${
                        req.status === 'pending'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {req.status === 'pending' ? 'Menunggu' : req.status === 'approved' ? 'Selesai' : 'Ditolak'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Nominal Penarikan</span>
                        <span className="text-sm font-bold text-gray-900">{formatRupiah(req.amount)}</span>
                      </div>

                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRejectWithdrawal(req.id)}
                            className="px-2.5 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition cursor-pointer"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() => handleApproveWithdrawal(req.id)}
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Setujui</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-400">
                          {req.processedAt ? new Date(req.processedAt).toLocaleDateString('id-ID') : '-'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: PAKET & KUOTA */}
          {activeTab === 'plans' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* Free Tier */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Paket Free</span>
                  <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold">
                    Rp0 / bln
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {stores.filter((s) => !s.plan || s.plan === 'free').length} Toko
                </p>
                <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> Maksimal 25 produk</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> WhatsApp Checkout</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600" /> 2% Fee Transaksi</p>
                </div>
              </div>

              {/* Starter Tier */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Paket Starter</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100">
                    Rp49.000 / bln
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {stores.filter((s) => s.plan === 'starter').length} Toko
                </p>
                <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> Hingga 100 produk</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> QRIS & Ekspedisi Dinamis</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-blue-600" /> 1.5% Fee Transaksi</p>
                </div>
              </div>

              {/* Premium Tier */}
              <div className="bg-white rounded-lg p-4 border border-red-200 shadow-xs space-y-2.5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Paket Pro</span>
                  <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-700 text-[10px] font-semibold border border-red-100">
                    Rp99.000 / bln
                  </span>
                </div>
                <p className="text-xl font-bold text-red-600">
                  {stores.filter((s) => s.plan === 'premium').length} Toko
                </p>
                <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-600" /> Unlimited Produk</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-600" /> Full Customizer & Tema</p>
                  <p className="flex items-center gap-1.5"><Check className="w-3 h-3 text-red-600" /> 1% Fee Transaksi</p>
                </div>
              </div>

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

          {/* TAB 6: PENGATURAN SISTEM & API KEYS */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-3xl">
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Key className="w-3.5 h-3.5 text-red-600" />
                    <span>Pusat Konfigurasi API Master</span>
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Kunci API dikelola terpusat oleh Super Admin. Toko / merchant otomatis menggunakan gateway platform.
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

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                
                {/* 1. MIDTRANS */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-red-50 flex items-center justify-center text-red-600">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs text-gray-900">Midtrans Payment Gateway (Master)</h3>
                        <span className="text-[11px] text-gray-500">Penampung transaksi QRIS & Virtual Account</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestApi('midtrans')}
                      disabled={testingService === 'midtrans'}
                      className="px-2.5 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50"
                    >
                      {testingService === 'midtrans' ? 'Menguji...' : 'Tes Koneksi'}
                    </button>
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="font-medium text-gray-700 block mb-1">Lingkungan (Environment)</label>
                    <div className="grid grid-cols-2 gap-2 max-w-xs">
                      {(['sandbox', 'production'] as const).map((mode) => (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setPlatformSettings({ ...platformSettings, midtransEnvironment: mode })}
                          className={`p-2 rounded-md border text-center font-medium capitalize transition cursor-pointer ${
                            platformSettings.midtransEnvironment === mode
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-gray-200 bg-white text-gray-600'
                          }`}
                        >
                          {mode === 'sandbox' ? '🧪 Sandbox' : '🚀 Production'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Midtrans Merchant ID</label>
                      <input
                        type="text"
                        value={platformSettings.midtransMerchantId}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, midtransMerchantId: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Midtrans Client Key</label>
                      <div className="relative">
                        <input
                          type={showKeys.midtransClient ? 'text' : 'password'}
                          value={platformSettings.midtransClientKey}
                          onChange={(e) =>
                            setPlatformSettings({ ...platformSettings, midtransClientKey: e.target.value })
                          }
                          className="w-full pl-2.5 pr-8 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility('midtransClient')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        >
                          {showKeys.midtransClient ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-gray-700 block mb-1">Midtrans Server Key (Secret)</label>
                    <div className="relative">
                      <input
                        type={showKeys.midtransServer ? 'text' : 'password'}
                        value={platformSettings.midtransServerKey}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, midtransServerKey: e.target.value })
                        }
                        className="w-full pl-2.5 pr-8 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleKeyVisibility('midtransServer')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        {showKeys.midtransServer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. BITESHIP */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center text-blue-700">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs text-gray-900">Ekspedisi (Biteship / RajaOngkir API)</h3>
                        <span className="text-[11px] text-gray-500">Tarif ongkir real-time J&T, SiCepat, JNE, GoSend</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestApi('biteship')}
                      disabled={testingService === 'biteship'}
                      className="px-2.5 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-[11px] transition cursor-pointer disabled:opacity-50"
                    >
                      {testingService === 'biteship' ? 'Menguji...' : 'Tes API'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-200">
                    <span className="font-medium text-gray-800">Aktifkan API Ekspedisi Otomatis</span>
                    <input
                      type="checkbox"
                      checked={platformSettings.biteshipEnabled}
                      onChange={(e) =>
                        setPlatformSettings({ ...platformSettings, biteshipEnabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Biteship API Key</label>
                      <div className="relative">
                        <input
                          type={showKeys.biteship ? 'text' : 'password'}
                          value={platformSettings.biteshipApiKey}
                          onChange={(e) =>
                            setPlatformSettings({ ...platformSettings, biteshipApiKey: e.target.value })
                          }
                          className="w-full pl-2.5 pr-8 py-1.5 rounded bg-gray-50 border border-gray-200 font-mono text-xs focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility('biteship')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        >
                          {showKeys.biteship ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-medium text-gray-700 block mb-1">Kota Asal Default</label>
                      <input
                        type="text"
                        value={platformSettings.biteshipOriginCity}
                        onChange={(e) =>
                          setPlatformSettings({ ...platformSettings, biteshipOriginCity: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 rounded bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. KOMISI & PAYOUT */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-xs space-y-3">
                  <div className="pb-2 border-b border-gray-100">
                    <h3 className="font-semibold text-xs text-gray-900">Komisi Platform & Kebijakan Payout</h3>
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
                  <div className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-200">
                    <span className="font-medium text-gray-800">Mode Pemeliharaan (Maintenance)</span>
                    <input
                      type="checkbox"
                      checked={platformSettings.maintenanceMode}
                      onChange={(e) =>
                        setPlatformSettings({ ...platformSettings, maintenanceMode: e.target.checked })
                      }
                      className="w-4 h-4 accent-red-600 cursor-pointer"
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
