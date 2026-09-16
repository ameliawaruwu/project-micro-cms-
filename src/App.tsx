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
import { BillingPage } from './pages/merchant/BillingPage';
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
import { ThemeRenderer } from './themes/ThemeRenderer';

export default function App() {
  // Auth Context Hook
  const { user, store: authStore, isAuthenticated, logout } = useAuth();

  // State: Authentication View
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot_password' | null>(null);
  const [registeredEmailForLogin, setRegisteredEmailForLogin] = useState<string>('');

  useEffect(() => {
    const handleNavLogin = (e: any) => {
      setAuthView('login');
      if (e.detail?.email) {
        setRegisteredEmailForLogin(e.detail.email);
      }
    };
    window.addEventListener('auth_nav_login', handleNavLogin);
    return () => window.removeEventListener('auth_nav_login', handleNavLogin);
  }, []);

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
        const params = new URLSearchParams(window.location.search);
        const tokoParam = params.get('toko') || params.get('store');
        const allStores = await storeService.getStores();
        let selectedStore: Store;
        if (tokoParam) {
          selectedStore = await storeService.getStoreBySlug(tokoParam);
        } else {
          selectedStore = allStores[0] || initialStores[0];
        }

        setActiveStore(selectedStore);
        setStores(allStores.length > 0 ? allStores : initialStores);

        const [storeProducts, storeOrders, storeIntegrations] = await Promise.all([
          productService.getProductsByStore(selectedStore.id),
          orderService.getOrdersByStore(selectedStore.id),
          integrationService.getIntegrations(),
        ]);
        const initialCart = cartService.getCart(selectedStore.slug);

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
        const [storeProducts, storeOrders, storeIntegrations] = await Promise.all([
          productService.getProductsByStore(finalStore.id),
          orderService.getOrdersByStore(finalStore.id),
          integrationService.getIntegrations(),
        ]);
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

  // Direct URL routing for buyers/customers (e.g. localhost:3000/?toko=toko-andhikagonzales or ?mode=storefront)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokoParam = params.get('toko') || params.get('store');
    const modeParam = params.get('mode') || params.get('view');

    if (tokoParam || modeParam === 'storefront') {
      setViewMode('storefront-live');
      storeService.getStoreBySlug(tokoParam || '').then(async (targetStore) => {
        if (targetStore) {
          setActiveStore(targetStore);
          const [storeProducts, storeOrders] = await Promise.all([
            productService.getProductsByStore(targetStore.id),
            orderService.getOrdersByStore(targetStore.id),
          ]);
          const initialCart = cartService.getCart(targetStore.slug);
          setProducts(storeProducts);
          setOrders(storeOrders);
          setCartItems(initialCart);
        }
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [isAuthenticated, authStore, user?.id]);

  // Real-time synchronization for orders via Supabase WebSocket
  useEffect(() => {
    if (!activeStore?.id) return;

    const unsubscribe = orderService.subscribeToOrderChanges(activeStore.id, (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
      );
      addToast(`Status pesanan #${updatedOrder.orderNumber} terupdate secara real-time!`, 'info');
    });

    return () => {
      unsubscribe();
    };
  }, [activeStore?.id]);

  // Route Super Admin directly to Admin Dashboard
  useEffect(() => {
    if (user?.role === 'admin' && viewMode !== 'admin' && viewMode !== 'storefront' && viewMode !== 'storefront-live') {
      setViewMode('admin');
    }
  }, [user, viewMode]);

  // Route Merchant directly to Dashboard (e.g. after Google Auth Redirect)
  useEffect(() => {
    if (user?.role === 'merchant' && viewMode === 'landing') {
      setViewMode('merchant-desktop');
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
    const res = await productService.createProduct(activeStore.id, duplicatedData);
    const created = res.product;
    setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    addToast(`Produk "${created.name}" berhasil disalin.`);
  };

  const handleSyncProducts = async () => {
    if (!activeStore) return;
    addToast('Menyinkronkan produk ke database Supabase Cloud...');
    const res = await productService.syncAllLocalToCloud(activeStore.id);
    if (res.success) {
      addToast(`Berhasil! ${res.count} produk tersinkron ke database Supabase Cloud.`);
      await loadData();
    } else {
      addToast(`Gagal sinkron: ${res.error}`, 'error');
    }
  };

  const handleSaveProduct = async (data: any) => {
    if (!activeStore) return;
    if (productToEdit) {
      const updated = await productService.updateProduct(productToEdit.id, data);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      addToast(`Produk "${updated.name}" berhasil diperbarui.`);
    } else {
      const res = await productService.createProduct(activeStore.id, data);
      const created = res.product;
      setProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      if (res.syncedToCloud) {
        addToast(`Produk "${created.name}" berhasil disimpan & tersinkron ke Supabase Cloud!`);
      } else {
        addToast(`Produk "${created.name}" tersimpan di lokal (Supabase belum tersinkron: ${res.cloudError || 'RLS terkunci'})`, 'info');
      }
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
    setSelectedOrderDetail(null);
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
          onSuccess={(registeredEmail) => {
            if (registeredEmail) {
              setRegisteredEmailForLogin(registeredEmail);
            }
            setAuthView('login');
            addToast('Akun berhasil didaftarkan! Silakan masuk dengan kata sandi Anda.', 'success');
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
          initialEmail={registeredEmailForLogin}
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

  // Render Public Storefront Content (Using New Dynamic Theme Engine)
  const renderStorefrontContent = () => {
    return <ThemeRenderer store={currentStore} products={products} />;
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${storefrontDeviceMode === 'desktop'
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${storefrontDeviceMode === 'tablet'
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${storefrontDeviceMode === 'mobile'
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
            className={`flex-1 flex flex-col items-center justify-start overflow-y-auto ${storefrontDeviceMode === 'desktop'
                ? 'p-0 w-full bg-[#FAF7F7]'
                : 'p-3 sm:p-6 bg-[#0D1520]'
              }`}
          >
            <div
              className={`w-full transition-all duration-300 mx-auto ${storefrontDeviceMode === 'desktop'
                  ? 'w-full max-w-none'
                  : storefrontDeviceMode === 'tablet'
                    ? 'max-w-[768px]'
                    : 'max-w-[390px]'
                }`}
            >
              <div
                className={`bg-white transition-all overflow-hidden flex flex-col ${storefrontDeviceMode === 'mobile'
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
          currentUser={user}
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
            phoneWhatsApp: user.phoneWhatsApp || '',
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
                phoneWhatsApp: data.storeUpdates.phoneWhatsApp || user.phoneWhatsApp || '',
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
              className={`flex-1 ${activeTab === 'layout'
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
                    onSyncProducts={handleSyncProducts}
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
                <PaymentListPage onShowNotification={addToast} />
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
                <PaymentListPage onShowNotification={addToast} />
              )}

              {/* TAB 7: BILLING PLAN / LANGGANAN */}
              {activeTab === 'billing' && (
                <BillingPage
                  store={currentStore}
                  onUpdateStore={handleUpdateStore}
                  onShowNotification={addToast}
                />
              )}

              {/* TAB 8: PENGATURAN / PROFIL TOKO */}
              {activeTab === 'pengaturan' && (
                <SettingsPage
                  store={currentStore}
                  onUpdateStore={handleUpdateStore}
                  onOpenWithdraw={() => setWithdrawModalOpen(true)}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  onNavigateBilling={() => setActiveTab('billing')}
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

      {/* 4. Order Detail Modal with Stepper & Info (Base Modal z-50) */}
      <OrderDetailModal
        order={selectedOrderDetail}
        store={currentStore}
        isOpen={Boolean(selectedOrderDetail)}
        onClose={() => setSelectedOrderDetail(null)}
        onProcessShipping={handleOpenProcessShipping}
        onPrintReceipt={handlePrintReceipt}
        onMarkCompleted={handleMarkCompleted}
        onShowNotification={addToast}
      />

      {/* 5. Process Shipping & Resi Modal (z-[70], opens on top) */}
      <ShippingModal
        order={orderToShip}
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onSuccess={(updatedOrder) => {
          setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
        }}
        onShowNotification={addToast}
      />

      {/* 6. Thermal Receipt & Label Modal (z-[70], opens on top) */}
      <ReceiptModal
        order={orderToPrint}
        store={currentStore}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
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
