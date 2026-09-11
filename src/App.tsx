import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Settings,
  Plus,
  Share2,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Wallet,
  Save,
  Sparkles,
  ArrowRight,
  Truck,
  CheckCircle2,
  LogOut,
  User as UserIcon,
  LogIn,
  LayoutTemplate,
  Star,
  ShieldCheck,
  MessageCircle,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import {
  Store,
  Product,
  Order,
  Integration,
  MerchantTab,
  ViewMode,
  ShippingStatus,
  CourierType,
  CartItem,
  StoreLayoutSettings,
} from './types';
import { useAuth } from './contexts/AuthContext';
import { authService } from './services/authService';
import { storeService } from './services/storeService';
import { productService } from './services/productService';
import { orderService } from './services/orderService';
import { integrationService } from './services/integrationService';
import { cartService } from './services/cartService';
import { initialStores } from './services/mockData';
import { formatRupiah, generateWhatsAppLink } from './utils/formatters';
import { getStoreSections } from './utils/layoutConstants';

// Layout & Common Components
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomNav } from './components/layout/BottomNav';
import { Toast, ToastMessage } from './components/common/Toast';
import { ShareStoreModal } from './components/common/ShareStoreModal';
import { SupportChatbotModal } from './components/common/SupportChatbotModal';
import { DeviceSimulatorFrame } from './components/common/DeviceSimulatorFrame';

// Merchant Pages
import { DashboardPage } from './pages/merchant/DashboardPage';
import { ProductListPage } from './pages/merchant/ProductListPage';
import { ProductFormPage } from './pages/merchant/ProductFormPage';
import { OrderListPage } from './pages/merchant/OrderListPage';
import { PaymentListPage } from './pages/merchant/PaymentListPage';
import { ShippingListPage } from './pages/merchant/ShippingListPage';
import { IntegrationListPage } from './pages/merchant/IntegrationListPage';
import { SettingsPage } from './pages/merchant/SettingsPage';
import { LayoutPage } from './pages/merchant/LayoutPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LandingPage } from './pages/LandingPage';

// Modals
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { ProductDetailModal as MerchantProductDetailModal } from './components/products/ProductDetailModal';
import { ShippingModal } from './components/shipping/ShippingModal';
import { ReceiptModal } from './components/orders/ReceiptModal';
import { OrderDetailModal } from './components/orders/OrderDetailModal';
import { MerchantWalletModal } from './components/wallet/MerchantWalletModal';
import { UpgradePlanModal } from './components/billing/UpgradePlanModal';
import { StoreLayoutSetupWizard } from './components/layout-editor/StoreLayoutSetupWizard';

// Storefront Components
import { StoreHeader } from './components/storefront/StoreHeader';
import { StoreProductCard } from './components/storefront/StoreProductCard';
import { ProductDetailModal as StorefrontProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/storefront/CartDrawer';

export default function App() {
  // Auth Context Hook
  const { user, store: authStore, isAuthenticated, logout } = useAuth();

  // State: Authentication View
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot_password' | null>(null);

  // State: Navigation & Multi-tenant Store
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [activeTab, setActiveTab] = useState<MerchantTab>('beranda');
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // State: Core Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // State: Storefront Search & Filters
  const [storefrontCategory, setStorefrontCategory] = useState('all');
  const [storefrontSearchQuery, setStorefrontSearchQuery] = useState('');
  const [storefrontDeviceMode, setStorefrontDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // State: Modals & Drawers
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [productSubView, setProductSubView] = useState<'list' | 'add' | 'edit'>('list');
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [selectedMerchantProduct, setSelectedMerchantProduct] = useState<Product | null>(null);
  const [selectedStorefrontProduct, setSelectedStorefrontProduct] = useState<Product | null>(null);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [orderToShip, setOrderToShip] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [isUpgradePlanModalOpen, setIsUpgradePlanModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('500000');
  const [bankAccount, setBankAccount] = useState('BCA - 8920192811');

  // State: Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentStore = activeStore || initialStores[0];

  // Initial Data Loading
  const loadData = async (targetStoreId?: string) => {
    try {
      if (!user) {
        const allStores = await storeService.getStores();
        const defaultStore = allStores[0] || initialStores[0];
        setActiveStore(defaultStore);
        setStores(allStores.length > 0 ? allStores : initialStores);

        const storeProducts = await productService.getProductsByStore(defaultStore.id);
        const storeOrders = await orderService.getOrdersByStore(defaultStore.id);
        const storeIntegrations = await integrationService.getIntegrations();
        const initialCart = cartService.getCart(defaultStore.slug);

        setProducts(storeProducts);
        setOrders(storeOrders);
        setIntegrations(storeIntegrations);
        setCartItems(initialCart);
        return;
      }

      let userStores = await storeService.getStoresForUser(user.id);
      setStores(userStores);

      if (userStores.length === 0) {
        setActiveStore(null);
        setProducts([]);
        setOrders([]);
        setIntegrations([]);
        return;
      }

      let current: Store | undefined;
      if (targetStoreId) {
        current = userStores.find((s) => s.id === targetStoreId);
      }
      if (!current) {
        current = await storeService.getActiveStore(user.id);
      }
      if (!current && userStores.length > 0) {
        current = userStores[0];
      }

      const finalStore = current || userStores[0];
      setActiveStore(finalStore || null);

      if (finalStore) {
        const storeProducts = await productService.getProductsByStore(finalStore.id);
        const storeOrders = await orderService.getOrdersByStore(finalStore.id);
        const storeIntegrations = await integrationService.getIntegrations();
        const initialCart = cartService.getCart(finalStore.slug);

        setProducts(storeProducts);
        setOrders(storeOrders);
        setIntegrations(storeIntegrations);
        setCartItems(initialCart);
      }
    } catch (err) {
      console.error('Error loading store data:', err);
    }
  };

  // Direct URL routing for buyers/customers (e.g. localhost:3000/?toko=batik-nusantara or ?mode=storefront)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokoParam = params.get('toko') || params.get('store');
    const modeParam = params.get('mode') || params.get('view');

    if (tokoParam || modeParam === 'storefront') {
      storeService.getStores().then((all) => {
        if (tokoParam) {
          const match = all.find((s) => s.slug === tokoParam || s.id === tokoParam);
          if (match) {
            setActiveStore(match);
          }
        }
        setViewMode('storefront-live');
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [isAuthenticated, authStore, user?.id, viewMode]);

  // Route Super Admin directly to Admin Dashboard
  useEffect(() => {
    if (user?.role === 'admin' && viewMode !== 'admin' && viewMode !== 'storefront' && viewMode !== 'storefront-live') {
      setViewMode('admin');
    }
  }, [user, viewMode]);

  // Store Switching
  const handleSelectStore = async (storeId: string) => {
    if (!user) return;
    const userStores = await storeService.getStoresForUser(user.id);
    const target = userStores.find((s) => s.id === storeId);
    if (!target) {
      addToast('Anda tidak memiliki izin mengakses toko ini.', 'error');
      return;
    }

    const store = await storeService.setActiveStore(storeId);
    setActiveStore(store);
    const storeProducts = await productService.getProductsByStore(store.id);
    const storeOrders = await orderService.getOrdersByStore(store.id);
    const initialCart = cartService.getCart(store.slug);

    setProducts(storeProducts);
    setOrders(storeOrders);
    setCartItems(initialCart);
    addToast(`Berpindah ke toko ${store.name}`);
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setAuthView('login');
    addToast('Anda telah keluar dari akun merchant.', 'info');
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Storefront Filtered Products
  const storefrontFilteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        storefrontCategory === 'all' || p.category.toLowerCase() === storefrontCategory.toLowerCase();
      const matchSearch =
        !storefrontSearchQuery ||
        p.name.toLowerCase().includes(storefrontSearchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(storefrontSearchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [products, storefrontCategory, storefrontSearchQuery]);

  // Order Counts
  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.shippingStatus === 'Baru' || o.shippingStatus === 'Diproses').length;
  }, [orders]);

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setProductSubView('add');
    setActiveTab('produk');
  };

  const handleOpenEditProduct = (prod: Product) => {
    setSelectedMerchantProduct(null);
    setProductToEdit(prod);
    setProductSubView('edit');
    setActiveTab('produk');
  };

  const handleDuplicateProduct = async (prod: Product) => {
    if (!activeStore) return;
    const duplicatedData = {
      name: `${prod.name} (Salinan)`,
      price: prod.price,
      originalPrice: prod.originalPrice,
      stock: prod.stock,
      sku: `${prod.sku || 'SKU'}-COPY`,
      category: prod.category,
      description: prod.description,
      imageUrl: prod.imageUrl,
      status: prod.status,
    };
    const created = await productService.createProduct(activeStore.id, duplicatedData);
    setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    addToast(`Produk "${created.name}" berhasil disalin.`);
  };

  const handleSaveProduct = async (data: any) => {
    if (!activeStore) return;
    if (productToEdit) {
      const updated = await productService.updateProduct(productToEdit.id, data);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      addToast(`Produk "${updated.name}" berhasil diperbarui.`);
    } else {
      const created = await productService.createProduct(activeStore.id, data);
      setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      addToast(`Produk baru "${created.name}" berhasil ditambahkan.`);
    }
    setProductSubView('list');
    setProductToEdit(null);
  };

  const handleDeleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setProductToDelete(prod);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      if (selectedMerchantProduct?.id === productToDelete.id) {
        setSelectedMerchantProduct(null);
      }
      addToast(`Produk "${productToDelete.name}" berhasil dihapus.`);
      setProductToDelete(null);
    } catch (err: any) {
      addToast(`Gagal menghapus produk: ${err.message}`, 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleQuickStockChange = async (id: string, delta: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    const updated = await productService.updateStock(id, newStock);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    addToast(`Stok ${prod.name} diperbarui menjadi ${newStock}.`);
  };

  // Handlers for Orders
  const handleOpenProcessShipping = (order: Order) => {
    setSelectedOrderDetail(null);
    setOrderToShip(order);
    setIsShippingModalOpen(true);
  };

  const handleConfirmShipping = async (orderId: string, courier: CourierType, resi: string) => {
    const updated = await orderService.processShipment(orderId, courier, resi);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    addToast(`Pesanan #${updated.orderNumber} berhasil diproses dengan resi ${updated.resiNumber}.`);
  };

  const handlePrintReceipt = (order: Order) => {
    setOrderToPrint(order);
    setIsReceiptModalOpen(true);
  };

  const handleMarkCompleted = async (orderId: string) => {
    const updated = await orderService.updateOrderStatus(orderId, 'Selesai');
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    addToast(`Pesanan #${updated.orderNumber} telah ditandai Selesai.`);
  };

  // Handlers for Store Settings & Wallet
  const handleUpdateStore = async (updated: Store) => {
    await storeService.updateStore(updated.id, updated);
    setActiveStore(updated);
    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleSaveLayout = async (layoutSettings: StoreLayoutSettings) => {
    if (!activeStore) return;
    const updated = await storeService.updateStore(activeStore.id, { layoutSettings });
    setActiveStore(updated);
    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    addToast('Tata letak halaman toko berhasil disimpan!');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore) return;
    const amt = Number(withdrawAmount) || 0;
    if (amt <= 0 || amt > activeStore.balance) {
      alert('Jumlah penarikan tidak valid atau melebihi saldo aktif.');
      return;
    }
    const { newBalance } = await storeService.withdrawBalance(activeStore.id, amt);
    setActiveStore({ ...activeStore, balance: newBalance });
    setWithdrawModalOpen(false);
    addToast(`Penarikan dana ${formatRupiah(amt)} berhasil diproses ke rekening!`);
  };

  // Handlers for Cart & Public Storefront
  const handleAddToCart = (product: Product, quantity = 1) => {
    if (!activeStore) return;
    const newItems = cartService.addToCart(activeStore.slug, product, quantity);
    setCartItems([...newItems]);
    addToast(`${quantity}x ${product.name} dimasukkan ke keranjang!`);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    if (!activeStore) return;
    const newItems = cartService.addToCart(activeStore.slug, product, quantity);
    setCartItems([...newItems]);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (!activeStore) return;
    const newItems = cartService.updateQuantity(activeStore.slug, productId, quantity);
    setCartItems([...newItems]);
  };

  const handleRemoveCartItem = (productId: string) => {
    if (!activeStore) return;
    const newItems = cartService.removeFromCart(activeStore.slug, productId);
    setCartItems([...newItems]);
    addToast('Item dihapus dari keranjang.');
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    addToast(`Pesanan #${newOrder.orderNumber} berhasil dibuat!`);
  };

  // Handlers for Integrations
  const handleToggleIntegration = async (id: string) => {
    const updated = await integrationService.toggleIntegration(id);
    setIntegrations((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const handleSaveIntegrationConfig = async (id: string, config: Record<string, string>) => {
    const updated = await integrationService.updateIntegrationConfig(id, config);
    setIntegrations((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  // Handlers for Demo Mode & Landing Page Interactivity
  const handleLaunchDemo = async () => {
    const allStores = await storeService.getStores();
    const demoStore = allStores[0] || initialStores[0];
    setActiveStore(demoStore);
    setStores(allStores.length > 0 ? allStores : initialStores);
    const storeProducts = await productService.getProductsByStore(demoStore.id);
    const storeOrders = await orderService.getOrdersByStore(demoStore.id);
    const storeIntegrations = await integrationService.getIntegrations();
    setProducts(storeProducts);
    setOrders(storeOrders);
    setIntegrations(storeIntegrations);
    setAuthView(null);
    setViewMode('merchant-desktop');
    addToast('Mode Demo Toko Interaktif MicroCMS Aktif!', 'info');
  };

  const handleLaunchStorefrontDemo = async () => {
    const allStores = await storeService.getStores();
    const demoStore = allStores[0] || initialStores[0];
    setActiveStore(demoStore);
    setStores(allStores.length > 0 ? allStores : initialStores);
    const storeProducts = await productService.getProductsByStore(demoStore.id);
    const storeOrders = await orderService.getOrdersByStore(demoStore.id);
    const initialCart = cartService.getCart(demoStore.slug);
    setProducts(storeProducts);
    setOrders(storeOrders);
    setCartItems(initialCart);
    setAuthView(null);
    setViewMode('storefront');
    addToast('Mode Toko Online Pembeli (Storefront) Aktif!', 'info');
  };

  // LANDING PAGE VIEW
  if (viewMode === 'landing' && authView === null) {
    return (
      <>
        <LandingPage
          onNavigateLogin={() => {
            setAuthView('login');
          }}
          onNavigateRegister={() => {
            setAuthView('register');
          }}
          onLaunchDemo={handleLaunchDemo}
          onViewStorefrontDemo={handleLaunchStorefrontDemo}
          isAuthenticated={isAuthenticated}
        />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // AUTHENTICATION FLOW VIEWS
  if (authView === 'register') {
    return (
      <>
        <RegisterPage
          onSuccess={() => {
            setAuthView(null);
            setViewMode('merchant-desktop');
            loadData();
            addToast('Akun Toko UMKM baru berhasil dibuat!');
          }}
          onNavigateLogin={() => setAuthView('login')}
          onNavigateLanding={() => {
            setAuthView(null);
            setViewMode('landing');
          }}
        />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  if (authView === 'login') {
    return (
      <>
        <LoginPage
          onSuccess={() => {
            setAuthView(null);
            const currentUser = authService.getCurrentUser().user;
            if (currentUser?.role === 'admin') {
              setViewMode('admin');
              addToast('Selamat datang di Super Admin Panel!');
            } else {
              setViewMode('merchant-desktop');
              loadData();
              addToast('Berhasil masuk ke Dashboard Toko!');
            }
          }}
          onNavigateRegister={() => setAuthView('register')}
          onNavigateForgotPassword={() => setAuthView('forgot_password')}
          onNavigateLanding={() => {
            setAuthView(null);
            setViewMode('landing');
          }}
        />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  if (authView === 'forgot_password') {
    return (
      <>
        <ForgotPasswordPage
          onNavigateLogin={() => setAuthView('login')}
          onNavigateLanding={() => {
            setAuthView(null);
            setViewMode('landing');
          }}
        />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Render Public Storefront Content (used in Desktop Storefront and Phone Simulator)
  const renderStorefrontContent = () => {
    const sections = getStoreSections(currentStore.layoutSettings);
    const visibleSections = sections.filter((s) => s.isVisible);
    const announcementSec = sections.find((s) => s.id === 'announcement' && s.isVisible);
    const headerSec = sections.find((s) => s.id === 'header' && s.isVisible);
    const featuredProds = products.filter((p) => p.isFeatured && p.status !== 'Nonaktif');

    return (
      <div className="min-h-full flex flex-col bg-[#FAF7F7] text-[#241A1A] font-sans">
        <StoreHeader
          store={currentStore}
          cartCount={cartService.getCount(cartItems)}
          categories={categories}
          selectedCategory={storefrontCategory}
          searchQuery={storefrontSearchQuery}
          showTopNotice={!!announcementSec}
          topNoticeText={announcementSec?.options?.announcementText}
          headerOptions={headerSec?.options}
          primaryAccent={currentStore.layoutSettings?.primaryAccent || '#66000E'}
          onSearchChange={setStorefrontSearchQuery}
          onCategoryChange={setStorefrontCategory}
          onOpenCart={() => setIsCartOpen(true)}
        />

        <div className="w-full flex-1 pb-16">
          {visibleSections.map((sec) => {
            if (sec.id === 'announcement' || sec.id === 'header') {
              return null;
            }

            if (sec.id === 'hero_banner') {
              const isCompact = sec.options?.bannerStyle === 'compact';
              return (
                <div key={sec.id} id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
                  <div
                    className={`relative rounded-3xl overflow-hidden shadow-2xs border border-[#E5E0DD] bg-[#1C1414] text-white flex items-center p-5 sm:p-8 ${
                      isCompact ? 'min-h-[140px] sm:min-h-[160px]' : 'min-h-[180px] sm:min-h-[220px]'
                    }`}
                  >
                    <img
                      src={currentStore.bannerUrl}
                      alt={currentStore.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-10 max-w-xl">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#66000E] text-white font-bold text-[10px] uppercase tracking-wider mb-2 border border-[#801010]">
                        Katalog Resmi UMKM
                      </span>
                      <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                        {currentStore.name}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed max-w-md">
                        {currentStore.tagline || currentStore.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (sec.id === 'search_category') {
              return (
                <div key={sec.id} id="katalog-filter" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 w-full">
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E5E0DD] shadow-2xs space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#706866] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari produk di etalase toko..."
                        value={storefrontSearchQuery}
                        onChange={(e) => setStorefrontSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-[#241A1A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E] transition"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
                      <button
                        onClick={() => setStorefrontCategory('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          storefrontCategory === 'all'
                            ? 'bg-[#66000E] text-white shadow-2xs'
                            : 'text-[#706866] hover:bg-[#FAF7F7] hover:text-[#241A1A]'
                        }`}
                      >
                        Semua Produk
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setStorefrontCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                            storefrontCategory === cat
                              ? 'bg-[#66000E] text-white shadow-2xs'
                              : 'text-[#706866] hover:bg-[#FAF7F7] hover:text-[#241A1A]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (sec.id === 'featured_products') {
              const displayFeatured = (featuredProds.length > 0 ? featuredProds : products.slice(0, 4)).filter(
                (p) => p.status !== 'Nonaktif'
              );
              if (displayFeatured.length === 0) return null;

              return (
                <div key={sec.id} id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E5E0DD] shadow-2xs">
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
                          <Star className="w-3.5 h-3.5 fill-[#66000E]" />
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-[#241A1A]">
                          {sec.options?.featuredTitle || 'Produk Unggulan Pilihan'}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-[#66000E]">
                        Rekomendasi Terbaik
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {displayFeatured.map((prod) => (
                        <StoreProductCard
                          key={`featured-${prod.id}`}
                          product={prod}
                          onSelectProduct={setSelectedStorefrontProduct}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (sec.id === 'store_benefits') {
              return (
                <div key={sec.id} id="keunggulan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0DD] shadow-2xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#241A1A]">100% Produk UMKM Asli</h4>
                        <p className="text-[11px] text-[#706866]">Kualitas teruji dari produsen lokal</p>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0DD] shadow-2xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#241A1A]">Pengiriman Cepat</h4>
                        <p className="text-[11px] text-[#706866]">Ekspedisi resmi se-Indonesia</p>
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0DD] shadow-2xs flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#241A1A]">Layanan Responsif</h4>
                        <p className="text-[11px] text-[#706866]">Konfirmasi pesanan via WhatsApp</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (sec.id === 'product_grid') {
              return (
                <div key={sec.id} id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
                  <div className="flex items-center justify-between mb-3.5">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-[#241A1A]">
                        {storefrontCategory === 'all' ? 'Semua Produk' : storefrontCategory}
                      </h3>
                      <p className="text-xs text-[#706866]">
                        Menampilkan {storefrontFilteredProducts.length} produk pilihan
                      </p>
                    </div>
                  </div>

                  {storefrontFilteredProducts.length === 0 ? (
                    <div className="py-14 text-center bg-white rounded-3xl border border-[#E5E0DD] p-8">
                      <Package className="w-10 h-10 text-[#A8A09E] mx-auto mb-2" />
                      <h4 className="font-bold text-[#241A1A] text-sm">Tidak ada produk ditemukan</h4>
                      <p className="text-xs text-[#706866] mt-1">
                        Coba pilih kategori lain atau ubah kata kunci pencarian.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {storefrontFilteredProducts.map((prod) => (
                        <StoreProductCard
                          key={`main-${prod.id}`}
                          product={prod}
                          onSelectProduct={setSelectedStorefrontProduct}
                          onAddToCart={handleAddToCart}
                          onBuyNow={handleBuyNow}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (sec.id === 'testimonials') {
              return (
                <div key={sec.id} id="ulasan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E5E0DD] shadow-2xs">
                    <div className="flex items-center justify-between mb-3.5">
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-[#241A1A]">
                          Ulasan & Testimoni Pelanggan
                        </h3>
                        <p className="text-xs text-[#706866]">
                          Pengalaman belanja nyata dari konsumen terverifikasi
                        </p>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        ⭐ 4.9 / 5.0
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] space-y-1.5 text-xs">
                        <div className="flex text-amber-500 text-xs">⭐⭐⭐⭐⭐</div>
                        <p className="text-[#241A1A] italic">
                          "Packing rapi, barang asli berkualitas tinggi sesuai foto. Pengiriman sangat cepat!"
                        </p>
                        <div className="text-[11px] font-semibold text-[#241A1A] pt-1">
                          — Rina Safitri <span className="text-emerald-700 font-normal">(Yogyakarta)</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] space-y-1.5 text-xs">
                        <div className="flex text-amber-500 text-xs">⭐⭐⭐⭐⭐</div>
                        <p className="text-[#241A1A] italic">
                          "Respon penjual via WA sangat ramah dan pesanan sampai tepat waktu. Recommended!"
                        </p>
                        <div className="text-[11px] font-semibold text-[#241A1A] pt-1">
                          — Budi Hartono <span className="text-emerald-700 font-normal">(Jakarta)</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] space-y-1.5 text-xs">
                        <div className="flex text-amber-500 text-xs">⭐⭐⭐⭐⭐</div>
                        <p className="text-[#241A1A] italic">
                          "Kualitas produk UMKM lokal rasa premium. Bangga pakai buatan dalam negeri."
                        </p>
                        <div className="text-[11px] font-semibold text-[#241A1A] pt-1">
                          — Maya Anggraini <span className="text-emerald-700 font-normal">(Surabaya)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (sec.id === 'promo_banner') {
              return (
                <div key={sec.id} id="promo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
                  <div
                    className="p-6 sm:p-8 rounded-3xl text-white text-center space-y-2 relative overflow-hidden shadow-2xs"
                    style={{
                      backgroundColor:
                        sec.options?.backgroundColor === 'amber'
                          ? '#B54708'
                          : sec.options?.backgroundColor === 'dark'
                          ? '#18181B'
                          : '#66000E',
                    }}
                  >
                    {sec.options?.discountBadge && (
                      <span className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full bg-white text-[#241A1A] shadow-xs">
                        {sec.options.discountBadge}
                      </span>
                    )}
                    <h3 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                      {sec.options?.heading || 'Penawaran Spesial Terbatas'}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 max-w-md mx-auto">
                      {sec.options?.description || 'Dapatkan potongan harga eksklusif untuk pesanan Anda hari ini.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStorefrontCategory('all')}
                      className="mt-2 px-5 py-2 rounded-xl bg-white text-[#241A1A] font-bold text-xs hover:bg-[#FAF7F7] transition shadow-xs cursor-pointer"
                    >
                      {sec.options?.buttonLabel || 'Klaim Promo Sekarang'}
                    </button>
                  </div>
                </div>
              );
            }

            if (sec.id === 'newsletter') {
              return (
                <div key={sec.id} id="newsletter" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
                  <div className="bg-[#F5E8EA]/50 border border-[#E5E0DD] p-6 sm:p-8 rounded-3xl text-center space-y-2.5">
                    {sec.options?.incentiveBadge && (
                      <span className="inline-block text-[10px] font-bold text-[#66000E] bg-white px-2.5 py-0.5 rounded-full border border-[#E6DDDA]">
                        {sec.options.incentiveBadge}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-[#241A1A]">
                      {sec.options?.newsletterTitle || 'Dapatkan Info Promo & Voucher Spesial'}
                    </h3>
                    <p className="text-xs text-[#706866] max-w-md mx-auto">
                      {sec.options?.newsletterSubtitle || 'Daftarkan email atau kontak Anda untuk menerima rilis diskon.'}
                    </p>
                    <div className="flex items-center gap-2 max-w-sm mx-auto pt-1">
                      <input
                        type="email"
                        placeholder="Masukkan alamat email..."
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#E5E0DD] text-xs text-[#241A1A] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => addToast('Terima kasih telah berlangganan newsletter!')}
                        className="px-4 py-2 rounded-xl bg-[#66000E] text-white font-bold text-xs shadow-2xs hover:bg-[#801010] transition cursor-pointer shrink-0"
                      >
                        {sec.options?.buttonText || 'Berlangganan'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            if (sec.id === 'footer') {
              return (
                <footer key={sec.id} id="footer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
                  <div className="bg-[#1F1918] text-white p-5 rounded-2xl text-center space-y-1.5">
                    <div className="font-bold text-xs tracking-tight">{currentStore.name}</div>
                    <p className="text-[10px] text-[#A8A09E]">
                      {sec.options?.copyrightText || 'Hak Cipta Dilindungi Undang-Undang • Katalog Resmi UMKM'}
                    </p>
                  </div>
                </footer>
              );
            }

            if (sec.id === 'store_info') {
              return (
                <div key={sec.id} id="kontak" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E5E0DD] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-[#241A1A] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#66000E]" />
                        {currentStore.name} — {currentStore.city}
                      </h4>
                      <p className="text-xs text-[#706866] max-w-lg">
                        {currentStore.address}
                      </p>
                      <p className="text-[11px] text-[#706866] pt-0.5">
                        Jam Operasional: Senin - Sabtu (08:00 - 17:00 WIB)
                      </p>
                    </div>
                    <a
                      href={generateWhatsAppLink(currentStore.phoneWhatsApp, `Halo ${currentStore.name}, saya ingin bertanya mengenai toko dan produk Anda.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#ECFDF3] hover:bg-[#D1FADF] text-[#027A48] font-bold text-xs border border-[#ABEFC6] transition flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat Toko via WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Floating Cart Button for Mobile View */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#66000E] text-white font-extrabold text-sm shadow-xl flex items-center justify-between border-2 border-white transition active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white text-[#66000E] font-bold text-xs flex items-center justify-center">
                  {cartService.getCount(cartItems)}
                </span>
                <span>Lihat Keranjang Belanja</span>
              </div>
              <span className="text-white font-black">{formatRupiah(cartService.getTotal(cartItems))}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F7] text-[#241A1A] font-sans antialiased flex flex-col selection:bg-[#F5E8EA] selection:text-[#66000E]">
      {/* 1. PUBLIC STOREFRONT VIEW (WITH RESPONSIVE DEVICE SWITCHER) */}
      {viewMode === 'storefront' && (
        <div className="min-h-screen bg-[#EBE5E1] flex flex-col font-sans">
          {/* Top Bar Switcher back to Admin */}
          <div className="bg-[#002A45] text-white px-3 sm:px-4 py-2 flex items-center justify-between text-xs border-b border-[#1F4072] sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">
                Pratinjau: <strong>{currentStore.name}</strong>
              </span>
            </div>

            {/* Viewport device switcher */}
            <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => setStorefrontDeviceMode('desktop')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  storefrontDeviceMode === 'desktop'
                    ? 'bg-[#FFD358] text-[#002A45] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Mode Desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setStorefrontDeviceMode('tablet')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  storefrontDeviceMode === 'tablet'
                    ? 'bg-[#FFD358] text-[#002A45] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Mode Tablet"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setStorefrontDeviceMode('mobile')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  storefrontDeviceMode === 'mobile'
                    ? 'bg-[#FFD358] text-[#002A45] shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
                title="Mode Ponsel"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Ponsel</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('storefront-live')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer text-xs transition"
                title="Buka toko penuh tanpa frame simulator"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Layar Penuh</span>
              </button>

              <button
                onClick={() => setViewMode('merchant-desktop')}
                className="px-3 py-1.5 rounded-lg bg-[#FFD358] hover:bg-[#FFB915] text-[#002A45] font-extrabold flex items-center gap-1 shadow-xs cursor-pointer text-xs"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            </div>
          </div>

          {/* Canvas Container */}
          <div
            className={`flex-1 flex flex-col items-center justify-start overflow-y-auto ${
              storefrontDeviceMode === 'desktop'
                ? 'p-0 w-full bg-[#FAF7F7]'
                : 'p-3 sm:p-6 bg-[#0D1520]'
            }`}
          >
            <div
              className={`w-full transition-all duration-300 mx-auto ${
                storefrontDeviceMode === 'desktop'
                  ? 'w-full max-w-none'
                  : storefrontDeviceMode === 'tablet'
                  ? 'max-w-[768px]'
                  : 'max-w-[390px]'
              }`}
            >
              <div
                className={`bg-white transition-all overflow-hidden flex flex-col ${
                  storefrontDeviceMode === 'mobile'
                    ? 'rounded-[40px] border-[8px] border-slate-900 ring-1 ring-slate-800 shadow-slate-900/30 min-h-[680px]'
                    : storefrontDeviceMode === 'tablet'
                    ? 'rounded-[28px] border-[8px] border-slate-800 ring-1 ring-slate-700 shadow-slate-900/25 min-h-[680px]'
                    : 'w-full min-h-screen rounded-none border-0 shadow-none'
                }`}
              >
                {/* Device Status Bar */}
                {storefrontDeviceMode === 'mobile' && (
                  <div className="bg-slate-900 pt-2 pb-1.5 px-6 flex items-center justify-between text-white text-[10px]">
                    <span className="font-semibold">09:41</span>
                    <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 absolute right-2.5"></div>
                    </div>
                    <span>5G 100%</span>
                  </div>
                )}

                {storefrontDeviceMode === 'tablet' && (
                  <div className="bg-slate-800 pt-2 pb-1.5 px-6 flex items-center justify-between text-white text-[10px]">
                    <span className="font-semibold">09:41</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-700"></div>
                    <span>Wi-Fi 100%</span>
                  </div>
                )}

                {renderStorefrontContent()}

                {/* Mobile Bottom Home Bar */}
                {storefrontDeviceMode === 'mobile' && (
                  <div className="bg-slate-900 py-2 flex items-center justify-center">
                    <div className="w-28 h-1 bg-white/40 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PURE STANDALONE STOREFRONT (100% FULL SCREEN - NO PREVIEW / NO FRAMES) */}
      {viewMode === 'storefront-live' && (
        <div className="min-h-screen w-full bg-white text-[#241A1A] font-sans relative">
          {/* Subtle Floating Switcher back to Dashboard */}
          <div className="fixed bottom-4 left-4 z-50">
            <button
              onClick={() => setViewMode('merchant-desktop')}
              className="px-3 py-2 rounded-xl bg-[#241A1A]/80 hover:bg-[#241A1A] backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl transition cursor-pointer border border-white/10 opacity-40 hover:opacity-100"
              title="Kembali ke Dashboard Merchant"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </div>
          {renderStorefrontContent()}
        </div>
      )}

      {/* 3. PUBLIC STOREFRONT PHONE SIMULATOR */}
      {viewMode === 'storefront-phone' && (
        <DeviceSimulatorFrame
          title={`Toko Online ${currentStore.name}`}
          urlPath={`microcms.id/${currentStore.slug}`}
          onClose={() => setViewMode('merchant-desktop')}
        >
          {renderStorefrontContent()}
        </DeviceSimulatorFrame>
      )}

      {/* 4. SUPER ADMIN DASHBOARD VIEW */}
      {viewMode === 'admin' && (
        <AdminDashboardPage
          onOpenStorefront={(slug) => {
            const targetStore = stores.find((s) => s.slug === slug);
            if (targetStore) setActiveStore(targetStore);
            setViewMode('storefront');
          }}
          onLogout={handleLogout}
        />
      )}

      {/* 4. ONBOARDING STORE CREATION (IF MERCHANT HAS NO STORE YET) */}
      {(viewMode === 'merchant-desktop' || viewMode === 'merchant-mobile') && user && user.role !== 'admin' && !activeStore && (
        <StoreLayoutSetupWizard
          currentStore={{
            id: '',
            merchantId: user.id,
            name: user.name ? `Toko ${user.name}` : '',
            slug: user.name ? `toko-${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '',
            tagline: 'Katalog online resmi dan pemesanan praktis via WhatsApp.',
            description: '',
            logoUrl: user.avatarUrl,
            bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
            phoneWhatsApp: user.phoneWhatsApp || '081234567890',
            city: 'Indonesia',
            category: 'Kuliner & Minuman',
            currency: 'IDR',
          } as Store}
          onComplete={async (data) => {
            try {
              const newStore = await storeService.createStore({
                merchantId: user.id,
                name: data.storeUpdates.name || `Toko ${user.name || 'UMKM'}`,
                slug: data.storeUpdates.slug || `toko-${user.id.slice(-6)}`,
                tagline: data.storeUpdates.tagline || 'Katalog resmi UMKM.',
                description: data.storeUpdates.tagline || 'Pusat belanja online praktis dan cepat.',
                logoUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&auto=format&fit=crop&q=80',
                bannerUrl: data.storeUpdates.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
                phoneWhatsApp: data.storeUpdates.phoneWhatsApp || user.phoneWhatsApp || '081234567890',
                city: 'Indonesia',
                category: data.storeUpdates.category || 'Kuliner & Minuman',
                currency: 'IDR',
                layoutSettings: data.layoutSettings,
              });

              setActiveStore(newStore);
              setStores([newStore]);
              setActiveTab('layout');
              addToast(`🎉 Selamat! Toko "${newStore.name}" berhasil dibuat dan siap diatur.`);
            } catch (err) {
              console.error('Error creating store:', err);
              addToast('Gagal membuat toko. Silakan coba lagi.', 'error');
            }
          }}
        />
      )}

      {/* 5. MERCHANT DASHBOARD VIEW (Desktop & Mobile Admin) */}
      {(viewMode === 'merchant-desktop' || viewMode === 'merchant-mobile') && (!user || user.role === 'admin' || !!activeStore) && (
        <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#FAF7F7]">
          {/* Desktop Left Sidebar & Mobile/Tablet Drawer */}
          <Sidebar
            activeTab={activeTab}
            pendingOrdersCount={pendingOrdersCount}
            activeStore={currentStore}
            userName={user?.name || 'Pemilik Toko'}
            isCollapsed={isSidebarCollapsed}
            isOpenMobile={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab !== 'produk') setProductSubView('list');
            }}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenStorefront={() => setViewMode('storefront')}
            onOpenChatbot={() => setIsChatbotOpen(true)}
            onLogout={handleLogout}
          />

          {/* Main Content Pane */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FAF7F7]">
            {/* Top Navigation Bar */}
            <TopBar
              stores={stores}
              activeStore={currentStore}
              viewMode={viewMode}
              pendingOrdersCount={pendingOrdersCount}
              user={user}
              onSelectStore={handleSelectStore}
              onViewModeChange={setViewMode}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onCreateNewStore={() => setAuthView('register')}
              onLogout={handleLogout}
              onNavigateAuth={() => setAuthView('login')}
            />

            {/* Main Content Area */}
            <main
              className={`flex-1 ${
                activeTab === 'layout'
                  ? 'w-full h-full p-0 m-0 overflow-hidden'
                  : 'p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar'
              }`}
            >
              {/* TAB 1: BERANDA / DASHBOARD */}
              {activeTab === 'beranda' && (
                <DashboardPage
                  store={currentStore}
                  orders={orders}
                  products={products}
                  onNavigateTab={setActiveTab}
                  onOpenAddProduct={handleOpenAddProduct}
                  onOpenStorefront={() => setViewMode('storefront')}
                  onOpenShareStore={() => setIsShareModalOpen(true)}
                  onOpenWithdraw={() => setWithdrawModalOpen(true)}
                  onSelectOrder={(ord) => setSelectedOrderDetail(ord)}
                />
              )}

              {/* TAB 2: PRODUK */}
              {activeTab === 'produk' && (
                productSubView === 'list' ? (
                  <ProductListPage
                    products={products}
                    categories={categories}
                    onAddProduct={handleOpenAddProduct}
                    onViewProduct={(p) => setSelectedMerchantProduct(p)}
                    onEditProduct={handleOpenEditProduct}
                    onDuplicateProduct={handleDuplicateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onQuickStockChange={handleQuickStockChange}
                    onNavigateDashboard={() => setActiveTab('beranda')}
                  />
                ) : (
                  <ProductFormPage
                    productToEdit={productToEdit}
                    categories={categories}
                    onBack={() => {
                      setProductSubView('list');
                      setProductToEdit(null);
                    }}
                    onSave={handleSaveProduct}
                  />
                )
              )}

              {/* TAB 3: PESANAN */}
              {activeTab === 'pesanan' && (
                <OrderListPage
                  orders={orders}
                  onProcessShipping={handleOpenProcessShipping}
                  onPrintReceipt={handlePrintReceipt}
                  onMarkCompleted={handleMarkCompleted}
                  onSelectOrder={(ord) => setSelectedOrderDetail(ord)}
                  onShowNotification={addToast}
                />
              )}

              {/* TAB 4: LAYOUT STORE */}
              {activeTab === 'layout' && (
                <LayoutPage
                  store={currentStore}
                  products={products}
                  onSaveLayout={handleSaveLayout}
                  onOpenStorefront={() => setViewMode('storefront')}
                  onOpenPhoneSimulator={() => setViewMode('storefront-phone')}
                  onShowNotification={addToast}
                  onBack={() => setActiveTab('beranda')}
                />
              )}

              {/* TAB 5: PEMBAYARAN */}
              {activeTab === 'pembayaran' && (
                <PaymentListPage
                  integrations={integrations}
                  onToggleIntegration={handleToggleIntegration}
                  onSaveConfig={handleSaveIntegrationConfig}
                  onShowNotification={addToast}
                />
              )}

              {/* TAB 6: PENGIRIMAN */}
              {activeTab === 'pengiriman' && (
                <ShippingListPage
                  integrations={integrations}
                  onToggleIntegration={handleToggleIntegration}
                  onSaveConfig={handleSaveIntegrationConfig}
                  onShowNotification={addToast}
                />
              )}

              {/* TAB FALLBACK: INTEGRASI */}
              {activeTab === 'integrasi' && (
                <PaymentListPage
                  integrations={integrations}
                  onToggleIntegration={handleToggleIntegration}
                  onSaveConfig={handleSaveIntegrationConfig}
                  onShowNotification={addToast}
                />
              )}

              {/* TAB 6: PENGATURAN / PROFIL TOKO */}
              {activeTab === 'pengaturan' && (
                <SettingsPage
                  store={currentStore}
                  onUpdateStore={handleUpdateStore}
                  onOpenWithdraw={() => setWithdrawModalOpen(true)}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  onOpenUpgradePlan={() => setIsUpgradePlanModalOpen(true)}
                  onShowNotification={addToast}
                />
              )}
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav
              activeTab={activeTab}
              pendingOrdersCount={pendingOrdersCount}
              onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab !== 'produk') setProductSubView('list');
              }}
            />
          </div>
        </div>
      )}

      {/* GLOBAL MODALS */}
      {/* 1. Share Store Modal */}
      <ShareStoreModal
        store={currentStore}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowNotification={addToast}
      />

      {/* 2. Custom Alert Dialog: Confirm Delete Product */}
      <ConfirmDeleteModal
        isOpen={Boolean(productToDelete)}
        title="Hapus Produk?"
        itemName={productToDelete?.name}
        isDeleting={isDeletingProduct}
        onConfirm={handleConfirmDeleteProduct}
        onClose={() => setProductToDelete(null)}
      />

      {/* 3. Merchant Product Detail & Management Modal */}
      <MerchantProductDetailModal
        product={selectedMerchantProduct}
        isOpen={Boolean(selectedMerchantProduct)}
        onClose={() => setSelectedMerchantProduct(null)}
        onEdit={handleOpenEditProduct}
        onDuplicate={handleDuplicateProduct}
        onDelete={handleDeleteProduct}
        onToggleStatus={async (id, newStatus) => {
          const updated = await productService.updateProduct(id, { status: newStatus });
          setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
          setSelectedMerchantProduct(updated);
          addToast(`Status produk diubah menjadi "${newStatus}".`);
        }}
      />

      {/* 4. Process Shipping & Resi Modal (Shopee Seller Centre Style) */}
      <ShippingModal
        order={orderToShip}
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onSuccess={(updatedOrder) => {
          setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
        }}
        onShowNotification={addToast}
      />

      {/* 5. Thermal Receipt & Label Modal */}
      <ReceiptModal
        order={orderToPrint}
        store={currentStore}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      {/* 6. Order Detail Modal with Stepper & Info */}
      <OrderDetailModal
        order={selectedOrderDetail}
        isOpen={Boolean(selectedOrderDetail)}
        onClose={() => setSelectedOrderDetail(null)}
        onProcessShipping={handleOpenProcessShipping}
        onPrintReceipt={handlePrintReceipt}
        onMarkCompleted={handleMarkCompleted}
        onShowNotification={addToast}
      />

      {/* 7. Storefront Product Detail Modal */}
      <StorefrontProductDetailModal
        product={selectedStorefrontProduct}
        isOpen={Boolean(selectedStorefrontProduct)}
        onClose={() => setSelectedStorefrontProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* 8. Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        store={currentStore}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Support Chatbot In-App Modal */}
      <SupportChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        activeStore={currentStore}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsChatbotOpen(false);
        }}
        onOpenAddProduct={handleOpenAddProduct}
        onOpenWithdraw={() => setWithdrawModalOpen(true)}
        onOpenShareStore={() => setIsShareModalOpen(true)}
        onOpenStorefront={() => setViewMode('storefront')}
      />

      {/* 9. Merchant Wallet & Payout Modal */}
      <MerchantWalletModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        store={currentStore}
        onBalanceUpdated={() => loadData(currentStore.id)}
      />

      {/* 10. Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={isUpgradePlanModalOpen}
        onClose={() => setIsUpgradePlanModalOpen(false)}
        store={currentStore}
        onPlanUpgraded={async (newPlan) => {
          await loadData(currentStore.id);
          addToast(`Toko berhasil di-upgrade ke Paket ${newPlan.toUpperCase()}!`);
        }}
      />

      {/* Global Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
