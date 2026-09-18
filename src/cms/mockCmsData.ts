export interface CmsStoreInfo {
  name: string;
  logoUrl?: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  socials: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
  };
}

export interface CmsProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  categoryId: string;
  categoryName: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  isFeatured: boolean;
  isNew: boolean;
  stock: number;
}

export interface CmsCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface CmsNews {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  date: string;
  content: string;
  category: string;
}

export interface CmsNavigationItem {
  id: string;
  label: string;
  route: string; // e.g. '/', '/produk', '/berita'
  order: number;
  isActive: boolean;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string; // Can be rich text or blocks, but for now just string
}

// ─── MOCK DATA (Toko NEON//CORE Electronics) ───────────────────────────────

export const mockStoreInfo: CmsStoreInfo = {
  name: "NEON//CORE Electronics",
  description: "Pusat Komponen Komputer, PC Gaming High-End, GPU RTX Series, dan Perangkat Elektronik Futuristik Bergaransi Resmi.",
  address: "Mall Cyber Park Lt. 3 No. 88, Jakarta Selatan, 12190",
  email: "sales@neoncore.id",
  phone: "+62 812 8888 9999",
  socials: {
    instagram: "@neoncore.hardware",
    tiktok: "@neoncore.official",
  }
};

export const mockCategories: CmsCategory[] = [
  { id: "c1", name: "Graphics Card", slug: "graphics-card", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80" },
  { id: "c2", name: "Keyboard & Mouse", slug: "keyboard-mouse", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80" },
  { id: "c3", name: "Monitor & Display", slug: "monitor-display", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80" },
  { id: "c4", name: "Audio & Headset", slug: "audio-headset", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
  { id: "c5", name: "Storage & Components", slug: "storage-components", image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80" }
];

export const mockProducts: CmsProduct[] = [
  {
    id: "p1",
    name: "NVIDIA GeForce RTX 4090 OC 24GB",
    slug: "rtx-4090-oc-24gb",
    price: 28950000,
    originalPrice: 31000000,
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
    categoryId: "c1",
    categoryName: "Graphics Card",
    description: "Kartu grafis flagship arsitektur Ada Lovelace dengan VRAM 24GB GDDR6X, 16384 CUDA Cores, DLSS 3.5, dan sistem pendingin tri-fan vapor chamber untuk performa 4K gaming & AI rendering tanpa batas.",
    status: 'active',
    isFeatured: true,
    isNew: true,
    stock: 12
  },
  {
    id: "p2",
    name: "Cyber Matrix RGB Wireless Mechanical Keyboard",
    slug: "cyber-matrix-mech-keyboard",
    price: 2150000,
    originalPrice: 2400000,
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80",
    categoryId: "c2",
    categoryName: "Keyboard & Mouse",
    description: "Keyboard mekanikal nirkabel 75% translucent gasket mount dengan switch linear hot-swappable, piringan alumunium anodized, dan layar OLED mini yang dapat disesuaikan.",
    status: 'active',
    isFeatured: true,
    isNew: false,
    stock: 45
  },
  {
    id: "p3",
    name: "UltraWide Curved Gaming Monitor 34\" 175Hz OLED",
    slug: "ultrawide-curved-monitor-34",
    price: 9450000,
    originalPrice: 10500000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    categoryId: "c3",
    categoryName: "Monitor & Display",
    description: "Monitor gaming lengkung QD-OLED 34 inci UWQHD (3440x1440), response time 0.03ms GTG, refresh rate 175Hz, VESA DisplayHDR True Black 400 untuk warna hitam sempurna.",
    status: 'active',
    isFeatured: true,
    isNew: true,
    stock: 18
  },
  {
    id: "p4",
    name: "Quantum Wireless Gaming Headset 7.1 Surround",
    slug: "quantum-wireless-gaming-headset",
    price: 1650000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    categoryId: "c4",
    categoryName: "Audio & Headset",
    description: "Headset gaming nirkabel lossless 2.4GHz dengan driver Neodymium 50mm, mikrofon cardioid berperedam bising AI, dan daya tahan baterai hingga 50 jam.",
    status: 'active',
    isFeatured: false,
    isNew: false,
    stock: 35
  },
  {
    id: "p5",
    name: "NVMe M.2 Gen4 x4 SSD 2TB UltraSpeed",
    slug: "nvme-gen4-ssd-2tb",
    price: 2350000,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
    categoryId: "c5",
    categoryName: "Storage & Components",
    description: "Solid State Drive PCIe 4.0 NVMe M.2 2TB dengan kecepatan baca hingga 7.450 MB/s dan heatsink alumunium bawaan yang kompatibel untuk PC High-End & PS5.",
    status: 'active',
    isFeatured: true,
    isNew: false,
    stock: 50
  },
  {
    id: "p6",
    name: "Titanium Custom Water-Cooled PC Case",
    slug: "titanium-watercooled-pc-case",
    price: 4250000,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
    categoryId: "c5",
    categoryName: "Storage & Components",
    description: "Casing PC Dual-Chamber tempered glass berbahan alumunium titanium penerbangan dengan dukungan radiator 360mm ganda dan manajemen kabel tersembunyi.",
    status: 'active',
    isFeatured: true,
    isNew: true,
    stock: 10
  }
];

export const mockNews: CmsNews[] = [
  {
    id: "n1",
    title: "Panduan Memilih Kartu Grafis RTX Series untuk 4K Gaming & Rendering AI",
    slug: "panduan-memilih-vga-rtx",
    thumbnail: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
    date: "12 Okt 2026",
    content: "Memilih VGA card yang tepat sangat krusial untuk kestabilan framerate 4K serta akselerasi AI. Simak ulasan arsitektur Ada Lovelace terbaru...",
    category: "Hardware Review"
  },
  {
    id: "n2",
    title: "Tips Merawat Thermal Paste & Liquid Cooling System PC Gaming",
    slug: "tips-merawat-liquid-cooling",
    thumbnail: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80",
    date: "05 Okt 2026",
    content: "Suhu proccessor yang stabil menjaga performa boosting CPU tetap maksimal. Pelajari cara mengganti coolant dan memilih thermal paste kualitas tinggi...",
    category: "PC Maintenance"
  }
];

export const mockNavigation: CmsNavigationItem[] = [
  { id: "nav1", label: "Beranda", route: "/", order: 1, isActive: true },
  { id: "nav2", label: "Katalog Produk", route: "/produk", order: 2, isActive: true },
  { id: "nav3", label: "Tentang Kami", route: "/tentang", order: 3, isActive: true },
  { id: "nav4", label: "Berita", route: "/berita", order: 4, isActive: true },
  { id: "nav5", label: "Hubungi Kami", route: "/kontak", order: 5, isActive: true },
];

export const mockPages: CmsPage[] = [
  {
    id: "pg1",
    title: "Tentang Kami",
    slug: "tentang",
    content: "NEON//CORE Electronics berdiri sejak 2022 sebagai distributor utama komponen hardware PC, GPU gaming kelas atas, monitor OLED high-refresh, dan peripheral profesional bergaransi resmi di Indonesia."
  },
  {
    id: "pg2",
    title: "Keunggulan Kami",
    slug: "keunggulan",
    content: "1. 100% Produk Original & BNIB\n2. Garansi Resmi Distributor\n3. Layanan Konsultasi Rakit PC 24/7"
  },
  {
    id: "pg3",
    title: "Hubungi Kami",
    slug: "kontak",
    content: "Alamat: Mall Cyber Park Lt. 3 No. 88, Jakarta Selatan\nEmail: sales@neoncore.id"
  }
];
