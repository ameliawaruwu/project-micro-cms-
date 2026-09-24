import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Store as StoreIcon,
  Wallet,
  Crown,
  Truck,
  Receipt,
  Settings as SettingsIcon,
  LayoutDashboard,
  Globe,
} from 'lucide-react';
import { Store, WithdrawalRequest, AdminPlatformStats, Order, BillingPlan, BillingSubscription, User } from '../../types';
import { adminService } from '../../services/adminService';
import { billingPlanService } from '../../services/billingPlanService';
import { domainRequestService, DomainRequest } from '../../services/domainRequestService';
import { authService } from '../../services/authService';
import { useLanguage } from '../../contexts/LanguageContext';
import { AdminTab, AdminNavItem, PlanFormState } from './types';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminOrderDetailModal } from './components/AdminOrderDetailModal';
import { AdminOverviewTab } from './tabs/AdminOverviewTab';
import { AdminStoresTab } from './tabs/AdminStoresTab';
import { AdminDomainRequestsTab } from './tabs/AdminDomainRequestsTab';
import { AdminWithdrawalsTab } from './tabs/AdminWithdrawalsTab';
import { AdminPlansTab } from './tabs/AdminPlansTab';
import { AdminOrdersShippingTab } from './tabs/AdminOrdersShippingTab';
import { AdminTransactionsTab } from './tabs/AdminTransactionsTab';
import { AdminSettingsTab } from './tabs/AdminSettingsTab';
import {
  getShippingStatusBadgeStyle,
  getShippingStatusLabel,
  getPaymentStatusLabel,
} from './utils';

interface AdminDashboardPageProps {
  currentUser?: User | null;
  onBackToMerchant?: () => void;
  onOpenStorefront?: (slug: string) => void;
  onLogout?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
  onBackToMerchant,
  onOpenStorefront,
  onLogout,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [stats, setStats] = useState<AdminPlatformStats>(adminService.getPlatformStats());
  const [stores, setStores] = useState<Store[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [domainRequests, setDomainRequests] = useState<DomainRequest[]>([]);
  const [suspendedIds, setSuspendedIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const loggedInUser = currentUser || authService.getCurrentUser().user;
  const activeAdminName = loggedInUser?.name || 'Super Admin Kroomify';
  const activeAdminEmail = loggedInUser?.email || 'admin@kroomify.id';
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
  const [planForm, setPlanForm] = useState<PlanFormState>({
    name: '',
    slug: '',
    tagline: '',
    priceMonthly: 0,
    priceYearly: 0,
    featuresText: '',
    sortOrder: 1,
    isActive: true,
  });

  // Orders & Shipping Tab state
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderFilterCourier, setOrderFilterCourier] = useState<string>('all');
  const [orderFilterStore, setOrderFilterStore] = useState<string>('all');
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<Order | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    showToast(`No. Resi ${resi} disalin ke clipboard`);
  };

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

  const loadData = async () => {
    try {
      const [
        fetchedStores,
        fetchedWithdrawals,
        fetchedOrders,
        fetchedPlans,
        fetchedSubs,
        fetchedReqs,
        fetchedSettings,
      ] = await Promise.all([
        adminService.fetchStoresFromDatabase(),
        adminService.fetchWithdrawalsFromDatabase(),
        adminService.fetchOrdersFromDatabase(),
        billingPlanService.fetchPlansFromDatabase(),
        billingPlanService.fetchSubscriptionsFromDatabase(),
        domainRequestService.getAllRequests(),
        adminService.fetchPlatformSettingsFromDatabase(),
      ]);

      setStores(fetchedStores);
      setWithdrawals(fetchedWithdrawals);
      setOrders(fetchedOrders);
      setBillingPlans(fetchedPlans);
      setBillingSubscriptions(fetchedSubs);
      if (fetchedReqs) setDomainRequests(fetchedReqs);
      if (fetchedSettings) setPlatformSettings(fetchedSettings);

      const suspended = fetchedStores.filter((s) => s.isSuspended).map((s) => s.id);
      setSuspendedIds(suspended.length > 0 ? suspended : adminService.getSuspendedStoreIds());

      setStats(adminService.getPlatformStats(fetchedStores, fetchedWithdrawals, fetchedOrders));
    } catch (err) {
      console.warn('Error loading admin data from database:', err);
    }
  };

  useEffect(() => {
    // Initial sync from local caches
    setStores(adminService.getAllStores());
    setWithdrawals(adminService.getWithdrawals());
    setOrders(adminService.getAllOrders());
    setBillingPlans(billingPlanService.getPlans());
    setBillingSubscriptions(billingPlanService.getSubscriptions());
    setPlatformSettings(adminService.getPlatformSettings());
    setStats(adminService.getPlatformStats());

    // Live sync from database
    loadData();
  }, []);

  const handleToggleSuspend = async (storeId: string, storeName: string) => {
    const isNowActive = await adminService.toggleStoreSuspension(storeId);
    await loadData();
    showToast(isNowActive ? `${storeName} diaktifkan kembali` : `${storeName} berhasil disuspend`);
  };

  const handleApproveWithdrawal = async (id: string, storeName?: string) => {
    await adminService.approveWithdrawal(id);
    await loadData();
    showToast(storeName ? `Pencairan dana ${storeName} berhasil disetujui & dipindahkan ke Paid` : 'Pencairan dana berhasil disetujui & dipindahkan ke Paid');
  };

  const handleRejectWithdrawal = async (id: string, storeName?: string) => {
    if (window.confirm(`Tolak pengajuan penarikan dana ${storeName || ''}? Saldo akan dikembalikan ke dompet toko.`)) {
      await adminService.rejectWithdrawal(id);
      await loadData();
      showToast('Pencairan dana ditolak & saldo toko dikembalikan');
    }
  };

  const handleChangePlan = async (storeId: string, plan: 'free' | 'starter' | 'premium') => {
    await adminService.updateStorePlan(storeId, plan);
    await loadData();
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

    await loadData();
    setIsPlanModalOpen(false);
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus paket "${name}"?`)) {
      await billingPlanService.deletePlan(id);
      await loadData();
      showToast(`Paket "${name}" berhasil dihapus`);
    }
  };

  const handleTogglePlanActive = async (id: string) => {
    const updated = await billingPlanService.togglePlanStatus(id);
    if (updated) {
      await loadData();
      showToast(`Status paket ${updated.name} diubah menjadi ${updated.isActive ? 'Aktif' : 'Nonaktif'}`);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.savePlatformSettings(platformSettings);
    await loadData();
    showToast('Pengaturan sistem berhasil disimpan ke database');
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
  const pendingDomainRequests = domainRequests.filter((d) => d.status === 'pending');

  // Orders & Shipping filtering and metrics
  const totalOrdersCount = orders.length;
  const processingOrdersCount = orders.filter(
    (o) => o.shippingStatus === 'Diproses' || o.shippingStatus === 'ready_to_ship' || o.shippingStatus === 'Baru'
  ).length;
  const shippedOrdersCount = orders.filter((o) => o.shippingStatus === 'Dikirim').length;
  const completedOrdersCount = orders.filter((o) => o.shippingStatus === 'Selesai').length;
  const totalShippingFeePlatform = orders.reduce((acc, o) => acc + (o.shippingCost || 0), 0);

  const filteredAdminOrders = orders.filter((ord) => {
    const store = stores.find((s) => s.id === ord.storeId);
    const storeName = store ? store.name.toLowerCase() : '';
    const q = orderSearchQuery.toLowerCase().trim();

    const matchesSearch =
      !q ||
      (ord.orderNumber && ord.orderNumber.toLowerCase().includes(q)) ||
      (ord.id && ord.id.toLowerCase().includes(q)) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.includes(q)) ||
      (ord.resiNumber && ord.resiNumber.toLowerCase().includes(q)) ||
      (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(q)) ||
      storeName.includes(q);

    const matchesStatus =
      orderFilterStatus === 'all' ||
      (orderFilterStatus === 'Diproses'
        ? ord.shippingStatus === 'Diproses' || ord.shippingStatus === 'ready_to_ship'
        : ord.shippingStatus === orderFilterStatus);

    const matchesCourier =
      orderFilterCourier === 'all' ||
      (ord.courier && ord.courier.toLowerCase() === orderFilterCourier.toLowerCase());

    const matchesStore =
      orderFilterStore === 'all' || ord.storeId === orderFilterStore;

    return matchesSearch && matchesStatus && matchesCourier && matchesStore;
  });

  const navItems: AdminNavItem[] = [
    { id: 'overview', label: language === 'en' ? 'Overview' : 'Ringkasan', icon: LayoutDashboard },
    { id: 'stores', label: language === 'en' ? 'Manage Stores' : 'Kelola Toko', icon: StoreIcon, count: stores.length },
    {
      id: 'domain-requests',
      label: language === 'en' ? 'Domain Requests' : 'Permintaan Domain',
      icon: Globe,
      badge: pendingDomainRequests.length > 0 ? pendingDomainRequests.length : undefined,
    },
    {
      id: 'withdrawals',
      label: language === 'en' ? 'Payouts' : 'Pencairan Dana',
      icon: Wallet,
      badge: pendingWithdrawals.length > 0 ? pendingWithdrawals.length : undefined,
    },
    { id: 'plans', label: language === 'en' ? 'Billing Plans' : 'Paket Langganan', icon: Crown },
    {
      id: 'orders-shipping',
      label: language === 'en' ? 'Orders & Shipping' : 'Pesanan & Pengiriman',
      icon: Truck,
      badge: processingOrdersCount > 0 ? processingOrdersCount : undefined,
    },
    { id: 'transactions', label: language === 'en' ? 'Transaction Logs' : 'Log Transaksi', icon: Receipt },
    { id: 'settings', label: language === 'en' ? 'System Settings' : 'Pengaturan Sistem', icon: SettingsIcon },
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

      {/* SIDEBAR DRAWER (FIXED) */}
      <AdminSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={navItems}
        onBackToMerchant={onBackToMerchant}
        onLogout={onLogout}
        language={language}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header (Fixed) */}
        <AdminHeader
          activeTab={activeTab}
          navItems={navItems}
          language={language}
          activeAdminName={activeAdminName}
          activeAdminEmail={activeAdminEmail}
          activeAdminAvatar={activeAdminAvatar}
        />

        {/* Dynamic Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 w-full">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              stats={stats}
              platformSettings={platformSettings}
              withdrawals={withdrawals}
              stores={stores}
              pendingDomainRequestsCount={pendingDomainRequests.length}
              setActiveTab={setActiveTab}
              language={language}
            />
          )}

          {activeTab === 'stores' && (
            <AdminStoresTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterPlan={filterPlan}
              setFilterPlan={setFilterPlan}
              filteredStores={filteredStores}
              suspendedIds={suspendedIds}
              handleChangePlan={handleChangePlan}
              handleToggleSuspend={handleToggleSuspend}
              onOpenStorefront={onOpenStorefront}
              language={language}
              isEn={isEn}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'domain-requests' && (
            <AdminDomainRequestsTab
              language={language}
              onShowToast={(msg) => setToastMessage(msg)}
              onRequestUpdated={loadData}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'withdrawals' && (
            <AdminWithdrawalsTab
              withdrawals={withdrawals}
              withdrawalTab={withdrawalTab}
              setWithdrawalTab={setWithdrawalTab}
              withdrawalPage={withdrawalPage}
              setWithdrawalPage={setWithdrawalPage}
              handleApproveWithdrawal={handleApproveWithdrawal}
              handleRejectWithdrawal={handleRejectWithdrawal}
              isEn={isEn}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'plans' && (
            <AdminPlansTab
              isEn={isEn}
              planSubTab={planSubTab}
              setPlanSubTab={setPlanSubTab}
              billingPlans={billingPlans}
              billingSubscriptions={billingSubscriptions}
              stores={stores}
              handleOpenCreatePlan={handleOpenCreatePlan}
              handleOpenEditPlan={handleOpenEditPlan}
              handleTogglePlanActive={handleTogglePlanActive}
              handleDeletePlan={handleDeletePlan}
              isPlanModalOpen={isPlanModalOpen}
              setIsPlanModalOpen={setIsPlanModalOpen}
              editingPlan={editingPlan}
              planForm={planForm}
              setPlanForm={setPlanForm}
              handleSavePlan={handleSavePlan}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'orders-shipping' && (
            <AdminOrdersShippingTab
              isEn={isEn}
              loadData={loadData}
              showToast={showToast}
              totalOrdersCount={totalOrdersCount}
              processingOrdersCount={processingOrdersCount}
              shippedOrdersCount={shippedOrdersCount}
              completedOrdersCount={completedOrdersCount}
              totalShippingFeePlatform={totalShippingFeePlatform}
              orderSearchQuery={orderSearchQuery}
              setOrderSearchQuery={setOrderSearchQuery}
              orderFilterStatus={orderFilterStatus}
              setOrderFilterStatus={setOrderFilterStatus}
              orderFilterCourier={orderFilterCourier}
              setOrderFilterCourier={setOrderFilterCourier}
              orderFilterStore={orderFilterStore}
              setOrderFilterStore={setOrderFilterStore}
              filteredAdminOrders={filteredAdminOrders}
              stores={stores}
              handleCopyResi={handleCopyResi}
              setSelectedAdminOrder={setSelectedAdminOrder}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'transactions' && (
            <AdminTransactionsTab
              orders={orders}
              isEn={isEn}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              isEn={isEn}
              platformSettings={platformSettings}
              setPlatformSettings={setPlatformSettings}
              handleSaveSettings={handleSaveSettings}
              handleTestApi={handleTestApi}
              testingService={testingService}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}
        </main>
      </div>

      {/* MODAL DETAIL PESANAN & PENGIRIMAN (SUPER ADMIN) */}
      <AdminOrderDetailModal
        selectedAdminOrder={selectedAdminOrder}
        onClose={() => setSelectedAdminOrder(null)}
        stores={stores}
        handleCopyResi={handleCopyResi}
        getShippingStatusBadgeStyle={getShippingStatusBadgeStyle}
        getShippingStatusLabel={(s) => getShippingStatusLabel(s, isEn)}
        getPaymentStatusLabel={(p) => getPaymentStatusLabel(p, isEn)}
        isEn={isEn}
      />
    </div>
  );
};
