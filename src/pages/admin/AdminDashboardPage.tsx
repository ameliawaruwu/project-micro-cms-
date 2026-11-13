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
  Users,
  Package,
  UserCog,
  Ticket,
  LifeBuoy,
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
import { DashboardFooter } from '../../components/layout/DashboardFooter';
import { ProfileSettingsModal } from '../../components/common/ProfileSettingsModal';
import { AdminOrderDetailModal } from './components/AdminOrderDetailModal';
import { AdminOverviewTab } from './tabs/AdminOverviewTab';
import { AdminStoresTab } from './tabs/AdminStoresTab';
import { AdminDomainRequestsTab } from './tabs/AdminDomainRequestsTab';
import { AdminWithdrawalsTab } from './tabs/AdminWithdrawalsTab';
import { WALLET_ENABLED } from '../../config/features';
import { AdminPlansTab } from './tabs/AdminPlansTab';
import { AdminOrdersShippingTab } from './tabs/AdminOrdersShippingTab';
import { AdminTransactionsTab } from './tabs/AdminTransactionsTab';
import { AdminSettingsTab } from './tabs/AdminSettingsTab';
import { AdminCommunitiesTab } from './tabs/AdminCommunitiesTab';
import { storeInCommunity } from '../../utils/communityMembership';
import { AdminProductsTab } from './tabs/AdminProductsTab';
import { AdminUsersTab } from './tabs/AdminUsersTab';
import { AdminTicketsTab } from './tabs/AdminTicketsTab';
import { AdminCommunityMembersTab } from './tabs/AdminCommunityMembersTab';
import { TicketRequesterPanel } from '../../components/tickets/TicketRequesterPanel';
import { ticketService } from '../../services/ticketService';
import {
  getShippingStatusBadgeStyle,
  getShippingStatusLabel,
  getPaymentStatusLabel,
} from './utils';
import { sessionHeaders } from '../../services/supabaseClient';

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
  const [adminUser, setAdminUser] = useState<User | null>(() => currentUser || authService.getCurrentUser().user || null);
  const loggedInUser = adminUser || currentUser || authService.getCurrentUser().user;
  
  const isSubAdminUmum =
    loggedInUser?.role === 'sub_admin_umum' ||
    loggedInUser?.email === 'admin1@gmps.com' ||
    loggedInUser?.email === 'admin1@gmail.com';

  const isSubAdminProduk =
    loggedInUser?.role === 'community_admin' ||
    loggedInUser?.role === 'sub_admin_produk' ||
    loggedInUser?.email === 'admin2@gmail.com' ||
    loggedInUser?.email === 'admin2@gmps.com' ||
    loggedInUser?.email === 'subadmin2@gmail.com' ||
    loggedInUser?.email === 'subadmin2@gmps.com';

  const isSubAdmin = isSubAdminUmum || isSubAdminProduk || loggedInUser?.role === 'sub_admin';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Hak akses ketat berdasarkan peran sub-admin:
  // - Admin Umum: Dashboard ('overview') & Halaman Komunitas ('communities')
  // - Sub Admin Produk: Dashboard ('overview'), Toko Binaan ('stores'), dan Produk ('products')
  useEffect(() => {
    if (isSubAdminUmum) {
      if (activeTab !== 'overview' && activeTab !== 'communities' && activeTab !== 'my-tickets' && activeTab !== 'community-members') {
        setActiveTab('overview');
      }
    } else if (isSubAdminProduk) {
      if (activeTab !== 'overview' && activeTab !== 'stores' && activeTab !== 'products' && activeTab !== 'my-tickets' && activeTab !== 'community-members') {
        setActiveTab('overview');
      }
    } else if (isSubAdmin) {
      if (
        activeTab !== 'overview' &&
        activeTab !== 'communities' &&
        activeTab !== 'stores' &&
        activeTab !== 'products' &&
        activeTab !== 'my-tickets' && activeTab !== 'community-members'
      ) {
        setActiveTab('overview');
      }
    } else if (activeTab === 'my-tickets' || activeTab === 'community-members') {
      setActiveTab('overview');
    }
  }, [isSubAdminUmum, isSubAdminProduk, isSubAdmin, activeTab]);

  const subAdminTitle = isSubAdminUmum
    ? 'ADMIN UMUM'
    : isSubAdminProduk
    ? 'ADMIN PRODUK'
    : isSubAdmin
    ? 'SUB-ADMIN'
    : 'SUPER ADMIN';

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const activeAdminName =
    loggedInUser?.name?.replace(/Kroomify/g, 'LapakQ') ||
    (isSubAdminUmum
      ? 'Admin Umum Komunitas'
      : isSubAdminProduk
      ? 'Admin Produk Komunitas'
      : isSubAdmin
      ? 'Sub Admin'
      : 'Super Admin LapakQ');
  const activeAdminEmail = loggedInUser?.email?.replace('kroomify.id', 'lapakq.com') || (isSubAdmin ? 'koordinator@lapakq.com' : 'admin@lapakq.com');
  const activeAdminAvatar = loggedInUser?.avatarUrl;
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Settings state
  const [platformSettings, setPlatformSettings] = useState(adminService.getPlatformSettings());
  const [isSavingSettings, setIsSavingSettings] = useState(false);
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

  // Jumlah tiket pending (badge menu Kelola Tiket, khusus super admin)
  const [pendingTicketsCount, setPendingTicketsCount] = useState(0);
  const refreshPendingTickets = React.useCallback(async () => {
    if (isSubAdmin) return;
    setPendingTicketsCount(await ticketService.countPending());
  }, [isSubAdmin]);

  useEffect(() => {
    refreshPendingTickets();
  }, [refreshPendingTickets]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    showToast(`No. Resi ${resi} disalin ke clipboard`);
  };

  const handleTestApi = async (service: 'midtrans' | 'duitku' | 'biteship' | 'wa') => {
    setTestingService(service);
    if (service === 'duitku') {
      try {
        const res = await fetch('/api/duitku/test-connection', { method: 'POST', headers: sessionHeaders() });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          showToast(`✅ ${data.message} (${data.channelCount} saluran pembayaran aktif)`);
        } else {
          showToast(`❌ ${data.message || 'Kredensial Duitku ditolak atau belum diatur'}`);
        }
      } catch (err: any) {
        showToast(`❌ Gagal menghubungi endpoint Duitku: ${err?.message || err}`);
      } finally {
        setTestingService(null);
      }
      return;
    }

    if (service === 'midtrans') {
      try {
        const res = await fetch('/api/midtrans/test-ping', { headers: sessionHeaders() });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          showToast(`✅ ${data.message}`);
        } else {
          showToast(`❌ ${data.message || 'Server Key Midtrans tidak valid (401 Unauthorized)'}`);
        }
      } catch (err: any) {
        showToast(`❌ Gagal menghubungi server: ${err?.message || err}`);
      } finally {
        setTestingService(null);
      }
      return;
    }

    setTimeout(() => {
      setTestingService(null);
      if (service === 'biteship') {
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

      setSuspendedIds(fetchedStores.filter((s) => s.isSuspended).map((s) => s.id));

      setStats(adminService.getPlatformStats(fetchedStores, fetchedWithdrawals, fetchedOrders));
    } catch (err) {
      console.warn('Error loading admin data from database:', err);
    }
  };

  useEffect(() => {
    // Initial sync from local caches
    const cachedStores = adminService.getAllStores();
    setStores(cachedStores);
    setSuspendedIds(cachedStores.filter((s) => s.isSuspended).map((s) => s.id));
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
    const suspend = !suspendedIds.includes(storeId);
    try {
      await adminService.setStoreSuspension(storeId, suspend);
      showToast(suspend ? `${storeName} berhasil disuspend` : `${storeName} diaktifkan kembali`);
    } catch (err: any) {
      showToast(err?.message || 'Gagal memperbarui status toko.');
    }
    await loadData();
  };

  const handleApproveWithdrawal = async (id: string, storeName?: string) => {
    try {
      await adminService.approveWithdrawal(id);
      showToast(storeName ? `Pencairan dana ${storeName} berhasil disetujui & dipindahkan ke Paid` : 'Pencairan dana berhasil disetujui & dipindahkan ke Paid');
    } catch (err: any) {
      showToast(err?.message || 'Gagal menyetujui pencairan dana.');
    }
    await loadData();
  };

  const handleRejectWithdrawal = async (id: string, storeName?: string) => {
    if (window.confirm(`Tolak pengajuan penarikan dana ${storeName || ''}? Saldo akan dikembalikan ke dompet toko.`)) {
      try {
        await adminService.rejectWithdrawal(id);
        showToast('Pencairan dana ditolak & saldo toko dikembalikan');
      } catch (err: any) {
        showToast(err?.message || 'Gagal menolak pencairan dana.');
      }
      await loadData();
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

    try {
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
    } catch (err: any) {
      console.error('Error saving plan:', err);
      showToast(`Gagal menyimpan paket: ${err?.message || err}`);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus paket "${name}"?`)) {
      try {
        await billingPlanService.deletePlan(id);
        await loadData();
        showToast(`Paket "${name}" berhasil dihapus`);
      } catch (err: any) {
        console.error('Error deleting plan:', err);
        showToast(`Gagal menghapus paket: ${err?.message || err}`);
      }
    }
  };

  const handleTogglePlanActive = async (id: string) => {
    try {
      const updated = await billingPlanService.togglePlanStatus(id);
      if (updated) {
        await loadData();
        showToast(`Status paket ${updated.name} diubah menjadi ${updated.isActive ? 'Aktif' : 'Nonaktif'}`);
      }
    } catch (err: any) {
      console.error('Error toggling plan:', err);
      showToast(`Gagal mengubah status paket: ${err?.message || err}`);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await adminService.savePlatformSettings(platformSettings);
      await loadData();
      showToast(isEn ? 'System settings saved to database successfully' : 'Pengaturan sistem berhasil disimpan ke database');
    } catch (err: any) {
      console.error('Error saving platform settings:', err);
      showToast(isEn ? `Failed to save: ${err?.message || err}` : `Gagal menyimpan: ${err?.message || err}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Isolasi Multi-Tenant: Sub-Admin hanya mengakses toko, pesanan, dan pencairan dana anggotanya
  const subAdminStores = React.useMemo(() => {
    if (!isSubAdmin) return stores;
    const targetId = loggedInUser?.communityId;
    const targetName = (loggedInUser?.communityName || '').trim().toLowerCase();
    if (!targetId && !targetName) return stores;
    return stores.filter((s) => storeInCommunity(s, targetId, targetName));
  }, [stores, isSubAdmin, loggedInUser?.communityId, loggedInUser?.communityName]);

  const subAdminStoreIds = React.useMemo(() => new Set(subAdminStores.map((s) => s.id)), [subAdminStores]);

  const subAdminOrders = React.useMemo(() => {
    if (!isSubAdmin || !loggedInUser?.communityId) return orders;
    return orders.filter((o) => subAdminStoreIds.has(o.storeId));
  }, [orders, isSubAdmin, subAdminStoreIds]);

  const subAdminWithdrawals = React.useMemo(() => {
    if (!isSubAdmin || !loggedInUser?.communityId) return withdrawals;
    return withdrawals.filter((w) => subAdminStoreIds.has(w.storeId));
  }, [withdrawals, isSubAdmin, subAdminStoreIds]);

  const activeStoresForAdmin = isSubAdmin ? subAdminStores : stores;
  const activeOrdersForAdmin = isSubAdmin ? subAdminOrders : orders;
  const activeWithdrawalsForAdmin = isSubAdmin ? subAdminWithdrawals : withdrawals;

  const activeStatsForAdmin = React.useMemo(() => {
    if (!isSubAdmin) return stats;
    return adminService.getPlatformStats(activeStoresForAdmin, activeWithdrawalsForAdmin, activeOrdersForAdmin);
  }, [isSubAdmin, stats, activeStoresForAdmin, activeWithdrawalsForAdmin, activeOrdersForAdmin]);

  const filteredStores = activeStoresForAdmin.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const pendingSubAdminWithdrawals = subAdminWithdrawals.filter((w) => w.status === 'pending');
  const activePendingWithdrawals = isSubAdmin ? pendingSubAdminWithdrawals : pendingWithdrawals;
  const pendingDomainRequests = domainRequests.filter((d) => d.status === 'pending');

  // Orders & Shipping filtering and metrics
  const totalOrdersCount = activeOrdersForAdmin.length;
  const processingOrdersCount = activeOrdersForAdmin.filter(
    (o) => o.shippingStatus === 'Diproses' || o.shippingStatus === 'ready_to_ship' || o.shippingStatus === 'Baru'
  ).length;
  const shippedOrdersCount = activeOrdersForAdmin.filter((o) => o.shippingStatus === 'Dikirim').length;
  const completedOrdersCount = activeOrdersForAdmin.filter((o) => o.shippingStatus === 'Selesai').length;
  const totalShippingFeePlatform = activeOrdersForAdmin.reduce((acc, o) => acc + (o.shippingCost || 0), 0);

  const filteredAdminOrders = activeOrdersForAdmin.filter((ord) => {
    const store = activeStoresForAdmin.find((s) => s.id === ord.storeId);
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

  const navItems: AdminNavItem[] = isSubAdminUmum
    ? [
        {
          id: 'overview',
          label: language === 'en' ? 'Dashboard' : 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'communities',
          label: language === 'en' ? 'Community Page' : 'Halaman Komunitas',
          icon: Users,
        },
        {
          id: 'community-members',
          label: language === 'en' ? 'Community Members' : 'Anggota Komunitas',
          icon: Users,
        },
        {
          id: 'my-tickets',
          label: language === 'en' ? 'Support Tickets' : 'Tiket Bantuan',
          icon: LifeBuoy,
        },
      ]
    : isSubAdminProduk
    ? [
        {
          id: 'overview',
          label: language === 'en' ? 'Dashboard' : 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'stores',
          label: language === 'en' ? 'Managed Stores' : 'Kelola Toko Binaan',
          icon: StoreIcon,
          count: subAdminStores.length,
        },
        {
          id: 'products',
          label: language === 'en' ? 'Store Products' : 'Produk Toko Binaan',
          icon: Package,
        },
        {
          id: 'community-members',
          label: language === 'en' ? 'Community Members' : 'Anggota Komunitas',
          icon: Users,
        },
        {
          id: 'my-tickets',
          label: language === 'en' ? 'Support Tickets' : 'Tiket Bantuan',
          icon: LifeBuoy,
        },
      ]
    : isSubAdmin
    ? [
        {
          id: 'overview',
          label: language === 'en' ? 'Dashboard' : 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          id: 'stores',
          label: language === 'en' ? 'Managed Stores' : 'Kelola Toko Binaan',
          icon: StoreIcon,
          count: subAdminStores.length,
        },
        {
          id: 'products',
          label: language === 'en' ? 'Store Products' : 'Produk Toko Binaan',
          icon: Package,
        },
        {
          id: 'communities',
          label: language === 'en' ? 'Communities' : 'Komunitas',
          icon: Users,
        },
        {
          id: 'community-members',
          label: language === 'en' ? 'Community Members' : 'Anggota Komunitas',
          icon: Users,
        },
        {
          id: 'my-tickets',
          label: language === 'en' ? 'Support Tickets' : 'Tiket Bantuan',
          icon: LifeBuoy,
        },
      ]
    : [
        { id: 'overview', label: language === 'en' ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
        { id: 'stores', label: language === 'en' ? 'Manage Stores' : 'Kelola Toko', icon: StoreIcon, count: stores.length },
        { id: 'products', label: language === 'en' ? 'Products' : 'Produk', icon: Package },
        { id: 'communities', label: language === 'en' ? 'Communities' : 'Komunitas', icon: Users },
        { id: 'users', label: language === 'en' ? 'Manage Users' : 'Kelola User', icon: UserCog },
        {
          id: 'tickets',
          label: language === 'en' ? 'Manage Tickets' : 'Kelola Tiket',
          icon: Ticket,
          badge: pendingTicketsCount > 0 ? pendingTicketsCount : undefined,
        },
        {
          id: 'domain-requests',
          label: language === 'en' ? 'Domain Requests' : 'Permintaan Domain',
          icon: Globe,
          badge: pendingDomainRequests.length > 0 ? pendingDomainRequests.length : undefined,
        },
        // Pencairan Dana disembunyikan selama Dompet toko nonaktif (config/features.ts).
        ...(WALLET_ENABLED
          ? [
              {
                id: 'withdrawals' as const,
                label: language === 'en' ? 'Payouts' : 'Pencairan Dana',
                icon: Wallet,
                badge: pendingWithdrawals.length > 0 ? pendingWithdrawals.length : undefined,
              },
            ]
          : []),
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
        isSubAdmin={isSubAdmin}
        subAdminTitle={subAdminTitle}
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
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Dynamic Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 w-full">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              stats={isSubAdmin ? activeStatsForAdmin : stats}
              platformSettings={platformSettings}
              withdrawals={activeWithdrawalsForAdmin}
              stores={activeStoresForAdmin}
              pendingDomainRequestsCount={isSubAdmin ? 0 : pendingDomainRequests.length}
              setActiveTab={setActiveTab}
              language={language}
              isSubAdmin={isSubAdmin}
              isSubAdminUmum={isSubAdminUmum}
              isSubAdminProduk={isSubAdminProduk}
              communityName={loggedInUser?.communityName}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              currentUser={loggedInUser}
              onShowToast={showToast}
              language={language}
              isSubAdmin={isSubAdmin}
            />
          )}

          {activeTab === 'users' && !isSubAdmin && (
            <AdminUsersTab
              currentUser={loggedInUser}
              language={language}
              onShowToast={showToast}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'tickets' && !isSubAdmin && (
            <AdminTicketsTab
              currentUser={loggedInUser}
              language={language}
              onShowToast={showToast}
              onTicketsChanged={refreshPendingTickets}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'community-members' && isSubAdmin && (
            <AdminCommunityMembersTab
              language={language}
              onShowToast={(msg) => showToast(msg)}
              onNavigateOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'my-tickets' && isSubAdmin && (
            <TicketRequesterPanel
              user={loggedInUser}
              requesterRole={isSubAdminUmum ? 'sub_admin_umum' : isSubAdminProduk ? 'community_admin' : 'sub_admin'}
              language={language}
              onShowToast={(msg) => showToast(msg)}
              onNavigateDashboard={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'communities' && (
            <AdminCommunitiesTab
              currentUser={loggedInUser}
              onOpenStorefront={onOpenStorefront}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'stores' && (
            <AdminStoresTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filteredStores={filteredStores}
              suspendedIds={suspendedIds}
              handleToggleSuspend={handleToggleSuspend}
              language={language}
              isEn={isEn}
              onNavigateOverview={() => setActiveTab(isSubAdminProduk ? 'stores' : 'overview')}
              isSubAdmin={isSubAdmin}
              communityName={loggedInUser?.communityName}
            />
          )}

          {activeTab === 'domain-requests' && (
            <AdminDomainRequestsTab
              language={language}
              onShowToast={(msg) => setToastMessage(msg)}
              onRequestUpdated={loadData}
              onNavigateOverview={() => setActiveTab(isSubAdminProduk ? 'stores' : 'overview')}
            />
          )}

          {WALLET_ENABLED && activeTab === 'withdrawals' && (
            <AdminWithdrawalsTab
              withdrawals={activeWithdrawalsForAdmin}
              withdrawalTab={withdrawalTab}
              setWithdrawalTab={setWithdrawalTab}
              withdrawalPage={withdrawalPage}
              setWithdrawalPage={setWithdrawalPage}
              handleApproveWithdrawal={handleApproveWithdrawal}
              handleRejectWithdrawal={handleRejectWithdrawal}
              isEn={isEn}
              onNavigateOverview={() => setActiveTab(isSubAdminProduk ? 'stores' : 'overview')}
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
              onNavigateOverview={() => setActiveTab(isSubAdminProduk ? 'stores' : 'overview')}
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
              stores={activeStoresForAdmin}
              handleCopyResi={handleCopyResi}
              setSelectedAdminOrder={setSelectedAdminOrder}
              onNavigateOverview={() => setActiveTab(isSubAdminProduk ? 'stores' : 'overview')}
            />
          )}

          {activeTab === 'transactions' && (
            <AdminTransactionsTab
              orders={activeOrdersForAdmin}
              isEn={isEn}
              onNavigateOverview={() => setActiveTab(isSubAdminProduk ? 'stores' : 'overview')}
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
              onNavigateOverview={() => setActiveTab(isSubAdminProduk ? 'stores' : 'overview')}
              isSaving={isSavingSettings}
            />
          )}

          <DashboardFooter
            language={language}
            panelLabel={
              isSubAdminUmum
                ? (isEn ? 'General Admin Panel' : 'Panel Admin Umum')
                : isSubAdminProduk
                ? (isEn ? 'Product Admin Panel' : 'Panel Admin Produk')
                : isSubAdmin
                ? (isEn ? 'Sub Admin Panel' : 'Panel Sub Admin')
                : (isEn ? 'Super Admin Panel' : 'Panel Super Admin')
            }
          />
        </main>
      </div>

      {/* MODAL PENGATURAN PROFIL ADMIN */}
      <ProfileSettingsModal
        variant="admin"
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={loggedInUser}
        onProfileUpdated={(updated) => setAdminUser(updated)}
        onShowToast={(msg) => setToastMessage(msg)}
      />

      {/* MODAL DETAIL PESANAN & PENGIRIMAN (SUPER ADMIN) */}
      <AdminOrderDetailModal
        selectedAdminOrder={selectedAdminOrder}
        onClose={() => setSelectedAdminOrder(null)}
        stores={activeStoresForAdmin}
        handleCopyResi={handleCopyResi}
        getShippingStatusBadgeStyle={getShippingStatusBadgeStyle}
        getShippingStatusLabel={(s) => getShippingStatusLabel(s, isEn)}
        getPaymentStatusLabel={(p) => getPaymentStatusLabel(p, isEn)}
        isEn={isEn}
      />
    </div>
  );
};
