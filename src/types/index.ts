export interface User {
  id: string;
  name: string;
  email: string;
  phoneWhatsApp: string;
  avatarUrl?: string;
  role: 'merchant' | 'admin';
  createdAt: string;
}

export interface Merchant {
  id: string;
  userId: string;
  storeId: string;
  plan: 'free' | 'starter' | 'premium';
  isVerified: boolean;
}

export type StoreSectionType =
  | 'header'
  | 'announcement'
  | 'hero_banner'
  | 'search_category'
  | 'featured_products'
  | 'product_grid'
  | 'promo_banner'
  | 'store_benefits'
  | 'testimonials'
  | 'newsletter'
  | 'store_info'
  | 'footer';

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  comment: string;
  rating: number;
}

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface StoreSectionOptions {
  // Content
  heading?: string;
  subheading?: string;
  description?: string;
  badgeText?: string;
  buttonLabel?: string;
  buttonLink?: string;
  secondaryButtonLabel?: string;
  secondaryButtonLink?: string;

  // Media & Style
  imageUrl?: string;
  overlayOpacity?: number; // 0 - 100
  textAlignment?: 'left' | 'center' | 'right';
  sectionHeight?: 'compact' | 'normal' | 'tall';
  bannerStyle?: 'compact' | 'normal' | 'minimal';
  backgroundColor?: 'default' | 'white' | 'brand' | 'dark' | 'amber' | 'neutral';
  textColor?: 'light' | 'dark';

  // Appearance & Positioning (Shopify Style)
  contentPosition?: 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  animation?: 'none' | 'fade-in' | 'slide-up' | 'zoom-in';
  colorScheme?: 'scheme-1' | 'scheme-2' | 'scheme-3' | 'scheme-4' | 'scheme-5';
  enableContainer?: boolean;
  
  // Mobile Layout
  mobileStackImages?: boolean;
  mobileAlignment?: 'left' | 'center' | 'right';
  mobileContainer?: boolean;

  // Advanced & Custom Spacing
  customCss?: string;
  paddingTop?: number;
  paddingBottom?: number;

  // Announcement
  announcementText?: string;
  announcementLink?: string;
  showIcon?: boolean;

  // Products
  featuredTitle?: string;
  featuredSubtitle?: string;
  productCount?: number;
  gridColumns?: 2 | 3 | 4;
  showStockBadge?: boolean;
  showCategoryTabs?: boolean;
  showSearchBar?: boolean;

  // Promo Banner
  discountBadge?: string;
  highlightText?: string;

  // Testimonials
  testimonialsTitle?: string;
  testimonialsList?: TestimonialItem[];

  // Newsletter
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  newsletterPlaceholder?: string;
  incentiveBadge?: string;
  buttonText?: string;

  // Header / Navbar
  stickyHeader?: boolean;
  headerStyle?: 'standard' | 'brand' | 'minimal';
  showLogo?: boolean;
  showTagline?: boolean;
  showNavMenu?: boolean;
  navMenuType?: 'landing_style' | 'categories' | 'custom';
  navMenuItems?: NavMenuItem[];
  showCartBadge?: boolean;
  showWhatsAppButton?: boolean;

  // Footer
  copyrightText?: string;
  showSocialLinks?: boolean;
}

export interface StoreSectionConfig {
  key?: string;
  id: StoreSectionType;
  title: string;
  subtitle?: string;
  isVisible: boolean;
  order: number;
  options?: StoreSectionOptions;
}

export interface StoreLayoutSettings {
  sections: StoreSectionConfig[];
  primaryAccent?: string;
  themeStyle?: 'minimal' | 'modern' | 'compact';
}

export interface Store {
  id: string;
  merchantId?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  phoneWhatsApp: string;
  city: string;
  province?: string;
  district?: string;
  postalCode?: string;
  address: string;
  category: string;
  currency: string;
  balance: number;
  plan?: 'free' | 'starter' | 'premium';
  themeColor?: string;
  layoutSettings?: StoreLayoutSettings;
  onboarding: {
    storeNameSet: boolean;
    productUploaded: boolean;
    paymentConnected: boolean;
  };
  createdAt: string;
}

export type ProductStatus = 'Tersedia' | 'Hampir Habis' | 'Habis' | 'Nonaktif';

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier?: number;
  stock: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  imageUrl: string;
  images?: string[];
  status: ProductStatus;
  sku?: string;
  weightGrams?: number;
  variants?: ProductVariant[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
  salesCount?: number;
  createdAt: string;
}

export type PaymentStatus = 'Sudah Dibayar' | 'Belum Dibayar' | 'Gagal';
export type ShippingStatus = 'Baru' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Dibatalkan';
export type CourierType = 'J&T' | 'JNE' | 'SiCepat' | 'GoSend';
export type PaymentMethod = 'QRIS' | 'BCA_VA' | 'MANDIRI_VA' | 'STRIPE' | 'COD' | string;

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
  variantName?: string;
}

export interface Order {
  id: string;
  storeId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerProvince?: string;
  customerCity: string;
  customerDistrict?: string;
  customerPostalCode?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  courier: CourierType;
  courierService?: string;
  resiNumber?: string;
  shippingStatus: ShippingStatus;
  createdAt: string;
  shippedAt?: string;
  notes?: string;
  // Integrasi Logistik & Multi-Gudang (Biteship Aggregator)
  originBranchId?: string;
  destinationAddress?: string;
  destinationPostalCode?: string;
  totalWeight?: number;
  courierCode?: string;
  shippingMethod?: 'pickup' | 'drop_off';
  shippingOrderId?: string;
  shippingLabelUrl?: string;
  pickupTime?: string;
}

export interface ShippingBranch {
  id: string;
  store_id: string;
  branch_name: string;
  pic_name: string;
  pic_phone: string;
  address: string;
  subdistrict?: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Integration {
  id: string;
  type: 'payment' | 'shipping';
  provider: 'midtrans' | 'stripe' | 'qris' | 'jnt' | 'jne' | 'sicepat' | 'gosend' | 'biteship';
  name: string;
  logo: string;
  description: string;
  isConnected: boolean;
  isPopular?: boolean;
  statusText?: string;
  config?: {
    apiKey?: string;
    merchantId?: string;
    clientKey?: string;
    environment?: 'sandbox' | 'production';
    originCity?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  variantName?: string;
}

export type ViewMode = 'landing' | 'merchant-desktop' | 'merchant-mobile' | 'storefront' | 'storefront-live' | 'storefront-phone' | 'admin';
export type MerchantTab =
  | 'beranda'
  | 'produk'
  | 'pesanan'
  | 'layout'
  | 'pembayaran'
  | 'pengiriman'
  | 'billing'
  | 'pengaturan'
  | 'profil'
  | 'integrasi';

export type TimeFilter = 'Hari Ini' | '7 Hari' | '30 Hari' | 'Tahun Ini';

export interface SalesAnalytics {
  period: TimeFilter;
  totalSales: number;
  salesGrowth: number;
  orderCount: number;
  averageOrderValue: number;
  chartData: {
    label: string;
    sales: number;
    orders: number;
  }[];
}

export interface WithdrawalRequest {
  id: string;
  storeId: string;
  storeName: string;
  storeLogo?: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface WalletTransaction {
  id: string;
  storeId: string;
  type: 'income' | 'withdrawal';
  title: string;
  amount: number;
  referenceId?: string;
  status: 'completed' | 'pending' | 'rejected';
  createdAt: string;
}

export interface AdminPlatformStats {
  totalStores: number;
  activeStores: number;
  totalGmv: number;
  totalRevenueFee: number;
  proSubscribers: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
}

export interface PlatformSettings {
  // Midtrans Payment Gateway
  midtransEnvironment: 'sandbox' | 'production';
  midtransMerchantId: string;
  midtransClientKey: string;
  midtransServerKey: string;

  // Biteship / RajaOngkir Courier API
  biteshipEnabled: boolean;
  biteshipApiKey: string;
  biteshipOriginCity: string;

  // WhatsApp Gateway API
  waGatewayEnabled: boolean;
  waGatewayApiKey: string;
  waSenderPhone: string;

  // Platform Commission & Payout Rules
  platformFeePercent: number;
  payoutMinAmount: number;
  payoutBankFee: number;
  autoApprovePayoutUnder: number;
  maintenanceMode: boolean;
}

export interface BillingPlan {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillingSubscription {
  id: string;
  storeId: string;
  storeName?: string;
  planId: string;
  planName: string;
  cycle: 'monthly' | 'yearly';
  amount: number;
  status: 'paid' | 'pending' | 'expired' | 'failed';
  paymentMethod: string;
  invoiceNumber: string;
  paidAt: string;
  expiresAt?: string;
  createdAt: string;
}
