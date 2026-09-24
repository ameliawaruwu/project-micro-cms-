import { Store, Product, Order, Integration } from '../types';

export const initialStores: Store[] = [];

export const initialProducts: Product[] = [];

export const initialOrders: Order[] = [];

export const initialIntegrations: Integration[] = [
  // Payments
  {
    id: 'int-midtrans',
    type: 'payment',
    provider: 'midtrans',
    name: 'Midtrans Payment Gateway',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
    description: 'Terima pembayaran otomatis dari 20+ bank via Virtual Account, GoPay, ShopeePay, dan Kartu Kredit.',
    isConnected: true,
    isPopular: true,
    statusText: 'Terhubung & Aktif',
    config: {
      merchantId: 'M0892819',
      clientKey: 'Mid-client-88192019',
      environment: 'production',
    },
  },
  {
    id: 'int-qris',
    type: 'payment',
    provider: 'qris',
    name: 'QRIS Statis & Dinamis Instant',
    logo: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&auto=format&fit=crop&q=80',
    description: 'Scan & bayar langsung dari semua e-wallet (BCA, Mandiri, GoPay, OVO, DANA, LinkAja) dengan MDR 0.7%.',
    isConnected: true,
    isPopular: true,
    statusText: 'Terhubung & Aktif',
  },
  {
    id: 'int-stripe',
    type: 'payment',
    provider: 'stripe',
    name: 'Stripe International Card',
    logo: 'https://images.unsplash.com/photo-1556742049-0a67e5572293?w=100&auto=format&fit=crop&q=80',
    description: 'Terima pembayaran kartu kredit & debit internasional (Visa, Mastercard, AMEX) untuk ekspor produk.',
    isConnected: true,
    statusText: 'Terhubung & Aktif',
    config: {
      apiKey: 'pk_live_51M089281928340192',
      environment: 'production',
    },
  },

  // Shipping (Biteship Aggregator Powered)
  {
    id: 'int-jnt',
    type: 'shipping',
    provider: 'jnt',
    name: 'J&T Express Auto Resi',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=80',
    description: 'Kirim paket dengan jemput gratis (pick-up) ke toko dan resi otomatis tanpa perlu input manual.',
    isConnected: true,
    isPopular: true,
    statusText: 'Terhubung (Auto Pick-up)',
    config: {
      enabledServices: ['ez', 'super', 'economy'],
      autoInsurance: false,
      defaultHandoff: 'pickup',
    },
  },
  {
    id: 'int-jne',
    type: 'shipping',
    provider: 'jne',
    name: 'JNE Express Logistics',
    logo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&auto=format&fit=crop&q=80',
    description: 'Jaringan pengiriman terluas ke pelosok Indonesia dengan layanan REG, YES (Yakin Esok Sampai), dan JTR Trucking.',
    isConnected: true,
    statusText: 'Terhubung (Drop & Pick-up)',
    config: {
      enabledServices: ['reg', 'yes', 'jtr'],
      autoInsurance: false,
      defaultHandoff: 'drop_off',
    },
  },
  {
    id: 'int-sicepat',
    type: 'shipping',
    provider: 'sicepat',
    name: 'SiCepat Ekspres',
    logo: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=100&auto=format&fit=crop&q=80',
    description: 'Pengiriman cepat dengan tarif flat HALU, SIUNTUNG, dan layanan BEST sameday untuk kota-kota besar.',
    isConnected: true,
    statusText: 'Terhubung (Pick-up Cepat)',
    config: {
      enabledServices: ['halu', 'siuntung', 'best'],
      autoInsurance: false,
      defaultHandoff: 'pickup',
    },
  },
  {
    id: 'int-gosend',
    type: 'shipping',
    provider: 'gosend',
    name: 'GoSend Instant & Sameday',
    logo: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=100&auto=format&fit=crop&q=80',
    description: 'Kurir motor instan sampai dalam 1-2 jam untuk pelanggan satu kota/wilayah.',
    isConnected: true,
    statusText: 'Terhubung (Instant)',
    config: {
      enabledServices: ['instant', 'sameday'],
      autoInsurance: true,
      defaultHandoff: 'pickup',
    },
  },
  {
    id: 'int-anteraja',
    type: 'shipping',
    provider: 'anteraja',
    name: 'Anteraja Regular Logistics',
    logo: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&auto=format&fit=crop&q=80',
    description: 'Layanan pengiriman terpercaya dengan jemput kurir Satria terintegrasi.',
    isConnected: true,
    statusText: 'Terhubung (Drop & Pick-up)',
    config: {
      enabledServices: ['reg'],
      autoInsurance: false,
      defaultHandoff: 'pickup',
    },
  },
  {
    id: 'int-biteship',
    type: 'shipping',
    provider: 'biteship',
    name: 'Biteship Aggregator API',
    logo: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=100&auto=format&fit=crop&q=80',
    description: 'Gateway terpusat untuk 25+ ekspedisi sekaligus (J&T, JNE, SiCepat, Anteraja, GoSend, POS, dll).',
    isConnected: true,
    statusText: 'Terhubung via .env',
    config: {
      environment: 'production',
    },
  },
];
