import { StoreSectionConfig, StoreLayoutSettings, StoreSectionType, TestimonialItem, NavMenuItem } from '../types';

export interface SectionTemplateDef {
  id: StoreSectionType;
  title: string;
  category: 'header_nav' | 'hero_banner' | 'products' | 'promotions' | 'social_info' | 'footer';
  categoryLabel: string;
  subtitle: string;
  badge?: string;
  defaultOptions: NonNullable<StoreSectionConfig['options']>;
}

export const DEFAULT_LANDING_NAV_ITEMS: NavMenuItem[] = [
  { id: 'nav-1', label: 'Beranda', href: '#beranda' },
  { id: 'nav-2', label: 'Katalog Produk', href: '#katalog' },
  { id: 'nav-3', label: 'Promo Spesial', href: '#promo' },
  { id: 'nav-4', label: 'Keunggulan Toko', href: '#keunggulan' },
  { id: 'nav-5', label: 'Ulasan Pelanggan', href: '#ulasan' },
  { id: 'nav-6', label: 'Hubungi Toko', href: '#kontak' },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'testi-1',
    name: 'Siti Rahmawati',
    location: 'Bandung, Jawa Barat',
    comment: 'Kualitas produk sangat memuaskan, kemasan rapi dan sampai dengan selamat. Pelayanan via WhatsApp sangat responsif!',
    rating: 5,
  },
  {
    id: 'testi-2',
    name: 'Budi Santoso',
    location: 'Surabaya, Jawa Timur',
    comment: 'Produk asli UMKM lokal tapi kualitas setara brand mall. Pengiriman cepat, recommended seller!',
    rating: 5,
  },
  {
    id: 'testi-3',
    name: 'Dewi Lestari',
    location: 'Yogyakarta',
    comment: 'Suka banget sama detail produknya. Sudah langganan 3 kali di toko ini dan selalu konsisten memuaskan.',
    rating: 5,
  },
];

export const CURATED_BANNER_PRESETS = [
  {
    id: 'batik-craft',
    name: 'Batik & Kain Tradisional',
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
    category: 'Kriya & Tekstil',
  },
  {
    id: 'food-culinary',
    name: 'Kuliner & Makanan Khas',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    category: 'Kuliner',
  },
  {
    id: 'coffee-cafe',
    name: 'Kopi & Roastery Lokal',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
    category: 'Kopi & Minuman',
  },
  {
    id: 'fashion-modern',
    name: 'Fashion & Pakaian Modern',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    category: 'Busana',
  },
  {
    id: 'handicraft-art',
    name: 'Kerajinan Tangan Kayu & Anyaman',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80',
    category: 'Kerajinan',
  },
  {
    id: 'herbal-beauty',
    name: 'Herbal & Perawatan Alami',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80',
    category: 'Kecantikan',
  },
];

export const SECTION_TEMPLATES: SectionTemplateDef[] = [
  {
    id: 'announcement',
    title: 'Announcement Bar (Bilah Pengumuman)',
    category: 'header_nav',
    categoryLabel: 'Header & Notifikasi',
    subtitle: 'Bilah notifikasi promo & gratis ongkir di paling atas',
    badge: 'Konversi',
    defaultOptions: {
      announcementText: '✨ Toko Online Resmi UMKM • Pengiriman Aman & Cepat Seluruh Indonesia',
      showIcon: true,
      backgroundColor: 'brand',
    },
  },
  {
    id: 'header',
    title: 'Header & Navbar Toko',
    category: 'header_nav',
    categoryLabel: 'Header & Navigasi',
    subtitle: 'Logo toko, menu navigasi landing page / katalog, pencarian cepat & keranjang',
    badge: 'Navigasi',
    defaultOptions: {
      stickyHeader: true,
      headerStyle: 'standard',
      showLogo: true,
      showTagline: true,
      showNavMenu: true,
      navMenuType: 'landing_style',
      navMenuItems: DEFAULT_LANDING_NAV_ITEMS,
      showSearchBar: true,
      showCartBadge: true,
      showWhatsAppButton: true,
    },
  },
  {
    id: 'hero_banner',
    title: 'Hero Banner Utama',
    category: 'hero_banner',
    categoryLabel: 'Banner & Tampilan Utama',
    subtitle: 'Spanduk visual pembuka dengan judul, slogan, foto & tombol aksi',
    badge: 'Paling Populer',
    defaultOptions: {
      heading: 'Koleksi Produk UMKM Pilihan Berkualitas',
      subheading: 'Langsung dari pengrajin & produsen lokal terpercaya se-Indonesia',
      buttonLabel: 'Jelajahi Produk',
      buttonLink: '#katalog',
      secondaryButtonLabel: 'Hubungi WhatsApp',
      secondaryButtonLink: '#kontak',
      badgeText: 'Katalog Resmi UMKM',
      sectionHeight: 'normal',
      bannerStyle: 'normal',
      textAlignment: 'left',
      overlayOpacity: 35,
      textColor: 'light',
    },
  },
  {
    id: 'featured_products',
    title: 'Produk Unggulan (Featured Products)',
    category: 'products',
    categoryLabel: 'Produk & Koleksi',
    subtitle: 'Soroti produk terlaris, promo spesial, atau koleksi musiman',
    badge: 'Rekomendasi',
    defaultOptions: {
      featuredTitle: '⭐ Produk Pilihan & Terlaris',
      featuredSubtitle: 'Rekomendasi terbaik dengan rating dan ulasan tertinggi pelanggan',
      productCount: 4,
      gridColumns: 4,
      showStockBadge: true,
    },
  },
  {
    id: 'product_grid',
    title: 'Koleksi Semua Produk (Product Grid)',
    category: 'products',
    categoryLabel: 'Produk & Koleksi',
    subtitle: 'Etalase utama daftar produk lengkap dengan filter kategori & pencarian',
    badge: 'Utama',
    defaultOptions: {
      heading: 'Semua Koleksi Etalase',
      subheading: 'Temukan produk kebutuhan Anda dengan harga terbaik',
      gridColumns: 4,
      showStockBadge: true,
      showCategoryTabs: true,
      showSearchBar: true,
    },
  },
  {
    id: 'promo_banner',
    title: 'Promotional Banner (Diskon & Flash Sale)',
    category: 'promotions',
    categoryLabel: 'Promosi & Penawaran',
    subtitle: 'Banner promo menarik dengan kode diskon, voucher & tombol CTA',
    badge: 'Penjualan',
    defaultOptions: {
      heading: 'Penawaran Spesial Terbatas',
      description: 'Dapatkan potongan harga eksklusif untuk pesanan Anda hari ini dengan pengiriman kilat.',
      discountBadge: 'DISKON HINGGA 30%',
      buttonLabel: 'Klaim Promo Sekarang',
      buttonLink: '#katalog',
      backgroundColor: 'brand',
      textAlignment: 'center',
    },
  },
  {
    id: 'store_benefits',
    title: 'Keunggulan Toko (Store Benefits)',
    category: 'social_info',
    categoryLabel: 'Informasi & Bukti Sosial',
    subtitle: '3 pilar jaminan: 100% Produk Asli, Pengiriman Cepat, dan Layanan Amanah',
    badge: 'Trust',
    defaultOptions: {
      heading: 'Mengapa Belanja di Toko Kami?',
    },
  },
  {
    id: 'testimonials',
    title: 'Ulasan Pelanggan (Testimonials)',
    category: 'social_info',
    categoryLabel: 'Informasi & Bukti Sosial',
    subtitle: 'Tampilkan testimoni pembeli nyata dan kepuasan bintang 5',
    badge: 'Kepercayaan',
    defaultOptions: {
      testimonialsTitle: 'Ulasan & Kepuasan Pelanggan',
      testimonialsList: DEFAULT_TESTIMONIALS,
    },
  },
  {
    id: 'newsletter',
    title: 'Newsletter & Buletin Promo',
    category: 'promotions',
    categoryLabel: 'Promosi & Penawaran',
    subtitle: 'Formulir berlangganan info diskon, voucher, dan katalog terbaru',
    badge: 'Lead Magnet',
    defaultOptions: {
      newsletterTitle: 'Dapatkan Info Promo & Voucher Spesial',
      newsletterSubtitle: 'Daftarkan email atau nomor WA Anda untuk menerima update diskon dan rilis produk baru.',
      newsletterPlaceholder: 'Masukkan alamat email Anda...',
      incentiveBadge: '🎁 Bonus Diskon 10% untuk Member Baru',
      buttonText: 'Berlangganan',
    },
  },
  {
    id: 'store_info',
    title: 'Informasi Toko & Lokasi',
    category: 'social_info',
    categoryLabel: 'Informasi & Bukti Sosial',
    subtitle: 'Alamat fisik, jam kerja, kontak, dan integrasi tombol chat WhatsApp',
    badge: 'Kontak',
    defaultOptions: {
      heading: 'Kunjungi & Hubungi Toko Kami',
      showWhatsAppButton: true,
    },
  },
  {
    id: 'footer',
    title: 'Footer Toko',
    category: 'footer',
    categoryLabel: 'Footer',
    subtitle: 'Hak cipta, tautan penting, info kurir resmi & metode pembayaran',
    badge: 'Bawah',
    defaultOptions: {
      copyrightText: 'Hak Cipta Dilindungi Undang-Undang • Didukung oleh UMKM Indonesia',
      showSocialLinks: true,
      showWhatsAppButton: true,
    },
  },
];

export const DEFAULT_STORE_SECTIONS: StoreSectionConfig[] = [
  {
    key: 'announcement-1',
    id: 'announcement',
    title: 'Pengumuman / Promo',
    subtitle: 'Pesan berjalan atau promo di bagian paling atas',
    isVisible: true,
    order: 0,
    options: {
      announcementText: '✨ Toko Online Resmi UMKM • Pengiriman Aman ke Seluruh Indonesia',
      showIcon: true,
      backgroundColor: 'brand',
    },
  },
  {
    key: 'header-1',
    id: 'header',
    title: 'Header & Navbar Toko',
    subtitle: 'Logo, menu navigasi landing page, pencarian dan keranjang',
    isVisible: true,
    order: 1,
    options: {
      stickyHeader: true,
      headerStyle: 'standard',
      showLogo: true,
      showTagline: true,
      showNavMenu: true,
      navMenuType: 'landing_style',
      navMenuItems: DEFAULT_LANDING_NAV_ITEMS,
      showSearchBar: true,
      showCartBadge: true,
      showWhatsAppButton: true,
    },
  },
  {
    key: 'hero_banner-1',
    id: 'hero_banner',
    title: 'Hero Banner Utama',
    subtitle: 'Foto banner cover, nama toko & slogan resmi',
    isVisible: true,
    order: 2,
    options: {
      heading: 'Koleksi Produk UMKM Berkualitas',
      subheading: 'Langsung dari pengrajin & produsen lokal terpercaya',
      badgeText: 'Katalog Resmi UMKM',
      buttonLabel: 'Lihat Semua Produk',
      buttonLink: '#katalog',
      secondaryButtonLabel: 'Tanya via WhatsApp',
      secondaryButtonLink: '#kontak',
      bannerStyle: 'normal',
      sectionHeight: 'normal',
      textAlignment: 'left',
      overlayOpacity: 35,
    },
  },
  {
    key: 'search_category-1',
    id: 'search_category',
    title: 'Pencarian & Kategori',
    subtitle: 'Kolom cari dan filter tombol kategori produk',
    isVisible: true,
    order: 3,
  },
  {
    key: 'featured_products-1',
    id: 'featured_products',
    title: 'Produk Unggulan',
    subtitle: 'Koleksi produk rekomendasi & terlaris',
    isVisible: true,
    order: 4,
    options: {
      featuredTitle: '⭐ Koleksi Pilihan & Rekomendasi Toko',
      featuredSubtitle: 'Produk dengan penjualan tertinggi dan ulasan terbaik pelanggan',
      productCount: 4,
      gridColumns: 4,
      showStockBadge: true,
    },
  },
  {
    key: 'store_benefits-1',
    id: 'store_benefits',
    title: 'Keunggulan Layanan',
    subtitle: 'Jaminan 100% original, kirim cepat & CS responsif',
    isVisible: true,
    order: 5,
    options: {
      heading: 'Keunggulan Belanja di Toko Kami',
    },
  },
  {
    key: 'product_grid-1',
    id: 'product_grid',
    title: 'Katalog Semua Produk',
    subtitle: 'Grid utama daftar seluruh produk yang dijual',
    isVisible: true,
    order: 6,
    options: {
      gridColumns: 4,
      showStockBadge: true,
      showCategoryTabs: true,
      showSearchBar: true,
    },
  },
  {
    key: 'promo_banner-1',
    id: 'promo_banner',
    title: 'Banner Promo & Diskon',
    subtitle: 'Spanduk promosi diskon spesial hari ini',
    isVisible: false,
    order: 7,
    options: {
      heading: 'Spesial Promo Hari Ini: Diskon 20%',
      description: 'Gunakan kesempatan promo untuk belanja produk UMKM favorit Anda.',
      discountBadge: 'PROMO TERBATAS',
      buttonLabel: 'Belanja Sekarang',
      buttonLink: '#katalog',
      backgroundColor: 'brand',
      textAlignment: 'center',
    },
  },
  {
    key: 'testimonials-1',
    id: 'testimonials',
    title: 'Ulasan & Testimoni',
    subtitle: 'Rating kepuasan & ulasan pelanggan asli',
    isVisible: true,
    order: 8,
    options: {
      testimonialsTitle: 'Apa Kata Pelanggan Kami?',
      testimonialsList: DEFAULT_TESTIMONIALS,
    },
  },
  {
    key: 'newsletter-1',
    id: 'newsletter',
    title: 'Newsletter & Kupon Promo',
    subtitle: 'Langganan promo via email untuk voucher diskon',
    isVisible: false,
    order: 9,
    options: {
      newsletterTitle: 'Dapatkan Voucher Diskon 10%',
      newsletterSubtitle: 'Daftarkan email Anda untuk menerima info diskon dan produk terbaru.',
      newsletterPlaceholder: 'Masukkan alamat email Anda...',
      incentiveBadge: '🎁 Kupon Khusus Member Baru',
      buttonText: 'Dapatkan Voucher',
    },
  },
  {
    key: 'store_info-1',
    id: 'store_info',
    title: 'Informasi & Kontak',
    subtitle: 'Alamat toko, jam operasional & tombol WhatsApp',
    isVisible: true,
    order: 10,
    options: {
      showWhatsAppButton: true,
    },
  },
  {
    key: 'footer-1',
    id: 'footer',
    title: 'Footer Toko',
    subtitle: 'Hak cipta, info ekspedisi resmi & bantuan',
    isVisible: true,
    order: 11,
    options: {
      copyrightText: 'Hak Cipta Dilindungi Undang-Undang • Toko Resmi UMKM',
      showSocialLinks: true,
      showWhatsAppButton: true,
    },
  },
];

export const DEFAULT_STORE_LAYOUT: StoreLayoutSettings = {
  sections: DEFAULT_STORE_SECTIONS,
  themeStyle: 'minimal',
  primaryAccent: '#66000E',
};

export const LAYOUT_PRESETS: {
  id: string;
  name: string;
  badge: string;
  description: string;
  sections: StoreSectionConfig[];
}[] = [
  {
    id: 'standard',
    name: 'Standar Lengkap (Shopify Style)',
    badge: 'Rekomendasi',
    description: 'Tata letak e-commerce profesional lengkap dengan header navbar, hero, promo, testimoni, dan info toko.',
    sections: DEFAULT_STORE_SECTIONS,
  },
  {
    id: 'minimalist',
    name: 'Katalog Bersih & Ringkas',
    badge: 'Cepat & Bersih',
    description: 'Fokus langsung pada navbar dan etalase katalog produk tanpa banyak ornamen banner.',
    sections: [
      {
        key: 'header-min',
        id: 'header',
        title: 'Header & Navbar Toko',
        isVisible: true,
        order: 0,
        options: {
          stickyHeader: true,
          headerStyle: 'minimal',
          showLogo: true,
          showNavMenu: true,
          navMenuType: 'landing_style',
          navMenuItems: DEFAULT_LANDING_NAV_ITEMS,
          showCartBadge: true,
        },
      },
      {
        key: 'hero-min',
        id: 'hero_banner',
        title: 'Hero Banner Utama',
        isVisible: true,
        order: 1,
        options: { bannerStyle: 'compact', sectionHeight: 'compact', textAlignment: 'left' },
      },
      {
        key: 'search-min',
        id: 'search_category',
        title: 'Pencarian & Kategori',
        isVisible: true,
        order: 2,
      },
      {
        key: 'grid-min',
        id: 'product_grid',
        title: 'Katalog Semua Produk',
        isVisible: true,
        order: 3,
        options: { gridColumns: 4, showStockBadge: true, showCategoryTabs: true },
      },
      {
        key: 'info-min',
        id: 'store_info',
        title: 'Informasi & Kontak',
        isVisible: true,
        order: 4,
        options: { showWhatsAppButton: true },
      },
      {
        key: 'footer-min',
        id: 'footer',
        title: 'Footer Toko',
        isVisible: true,
        order: 5,
        options: { showSocialLinks: true },
      },
    ],
  },
  {
    id: 'promo_focused',
    name: 'Fokus Promo & Konversi',
    badge: 'Konversi Tinggi',
    description: 'Menonjolkan pengumuman promo, navbar lengkap, banner diskon besar, flash sale, dan jaminan layanan.',
    sections: [
      {
        key: 'announcement-promo',
        id: 'announcement',
        title: 'Pengumuman / Promo',
        isVisible: true,
        order: 0,
        options: {
          announcementText: '🔥 DISKON SPESIAL HARI INI • GRATIS ONGKIR SE-INDONESIA',
          showIcon: true,
          backgroundColor: 'brand',
        },
      },
      {
        key: 'header-promo',
        id: 'header',
        title: 'Header & Navbar Toko',
        isVisible: true,
        order: 1,
        options: {
          stickyHeader: true,
          headerStyle: 'standard',
          showLogo: true,
          showNavMenu: true,
          navMenuType: 'landing_style',
          navMenuItems: DEFAULT_LANDING_NAV_ITEMS,
          showCartBadge: true,
          showWhatsAppButton: true,
        },
      },
      {
        key: 'hero-promo',
        id: 'hero_banner',
        title: 'Hero Banner Utama',
        isVisible: true,
        order: 2,
        options: {
          heading: 'Flash Sale & Produk Unggulan Minggu Ini',
          subheading: 'Dapatkan diskon terbaik dengan kualitas terjamin produsen lokal',
          badgeText: 'PROMO TERBATAS',
          buttonLabel: 'Beli Sekarang',
          sectionHeight: 'normal',
          textAlignment: 'center',
        },
      },
      {
        key: 'featured-promo',
        id: 'featured_products',
        title: 'Produk Unggulan',
        isVisible: true,
        order: 3,
        options: {
          featuredTitle: '🔥 Flash Sale & Produk Terlaris',
          featuredSubtitle: 'Stok terbatas dengan diskon langsung',
          productCount: 4,
          gridColumns: 4,
          showStockBadge: true,
        },
      },
      {
        key: 'banner-promo',
        id: 'promo_banner',
        title: 'Banner Promo & Diskon',
        isVisible: true,
        order: 4,
        options: {
          heading: 'Kupon Tambahan Hemat Ongkir',
          discountBadge: 'KODE: HEMATONGKIR',
          buttonLabel: 'Gunakan Voucher',
          backgroundColor: 'amber',
        },
      },
      {
        key: 'benefits-promo',
        id: 'store_benefits',
        title: 'Keunggulan Layanan',
        isVisible: true,
        order: 5,
      },
      {
        key: 'grid-promo',
        id: 'product_grid',
        title: 'Katalog Semua Produk',
        isVisible: true,
        order: 6,
        options: { gridColumns: 4, showStockBadge: true },
      },
      {
        key: 'testi-promo',
        id: 'testimonials',
        title: 'Ulasan & Testimoni',
        isVisible: true,
        order: 7,
        options: { testimonialsList: DEFAULT_TESTIMONIALS },
      },
      {
        key: 'newsletter-promo',
        id: 'newsletter',
        title: 'Newsletter & Kupon',
        isVisible: true,
        order: 8,
      },
      {
        key: 'info-promo',
        id: 'store_info',
        title: 'Informasi & Kontak',
        isVisible: true,
        order: 9,
      },
      {
        key: 'footer-promo',
        id: 'footer',
        title: 'Footer Toko',
        isVisible: true,
        order: 10,
      },
    ],
  },
];

export const getStoreSections = (layoutSettings?: StoreLayoutSettings): StoreSectionConfig[] => {
  if (!layoutSettings || !layoutSettings.sections || layoutSettings.sections.length === 0) {
    return DEFAULT_STORE_SECTIONS;
  }

  // Ensure unique keys and default navMenuItems if missing on header
  return layoutSettings.sections
    .map((sec, idx) => {
      let options = sec.options;
      if (sec.id === 'header') {
        options = {
          stickyHeader: true,
          showLogo: true,
          showNavMenu: true,
          navMenuType: 'landing_style',
          navMenuItems: DEFAULT_LANDING_NAV_ITEMS,
          showSearchBar: true,
          showCartBadge: true,
          showWhatsAppButton: true,
          ...options,
        };
      }
      return {
        ...sec,
        key: sec.key || `${sec.id}-${idx}`,
        order: sec.order !== undefined ? sec.order : idx,
        options,
      };
    })
    .sort((a, b) => a.order - b.order);
};
