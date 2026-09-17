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

// ─── MOCK DATA (Toko Alya Permata) ───────────────────────────────

export const mockStoreInfo: CmsStoreInfo = {
  name: "Alya Permata",
  description: "Menyediakan pakaian wanita premium dengan bahan berkualitas dan desain eksklusif yang tak lekang oleh waktu.",
  address: "Jl. Sudirman No. 123, Jakarta Selatan, 12190",
  email: "hello@alyapermata.com",
  phone: "+62 812 3456 7890",
  socials: {
    instagram: "@alyapermata",
    tiktok: "@alyapermata.official",
  }
};

export const mockCategories: CmsCategory[] = [
  { id: "c1", name: "Dress", slug: "dress", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80" },
  { id: "c2", name: "Atasan", slug: "atasan", image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=600&q=80" },
  { id: "c3", name: "Bawahan", slug: "bawahan", image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=600&q=80" },
  { id: "c4", name: "Outerwear", slug: "outerwear", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80" }
];

export const mockProducts: CmsProduct[] = [
  {
    id: "p1",
    name: "Amaryllis Floral Dress",
    slug: "amaryllis-floral-dress",
    price: 350000,
    image: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=800&q=80",
    categoryId: "c1",
    categoryName: "Dress",
    description: "Dress motif floral yang cantik dengan bahan rayon premium yang adem dan jatuh. Cocok untuk acara santai maupun semi-formal.",
    status: 'active',
    isFeatured: true,
    isNew: true,
    stock: 25
  },
  {
    id: "p2",
    name: "Classic White Blouse",
    slug: "classic-white-blouse",
    price: 180000,
    originalPrice: 200000,
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80",
    categoryId: "c2",
    categoryName: "Atasan",
    description: "Blus putih klasik dengan potongan loose. Bahan katun poplin yang menyerap keringat. Wajib ada di lemari Anda.",
    status: 'active',
    isFeatured: true,
    isNew: false,
    stock: 50
  },
  {
    id: "p3",
    name: "Cinnamon Knit Cardigan",
    slug: "cinnamon-knit-cardigan",
    price: 285000,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    categoryId: "c4",
    categoryName: "Outerwear",
    description: "Kardigan rajut halus dengan warna kayu manis yang hangat. Potongan oversized yang nyaman dipakai seharian.",
    status: 'active',
    isFeatured: true,
    isNew: true,
    stock: 15
  },
  {
    id: "p4",
    name: "Palazzo Wide Pants",
    slug: "palazzo-wide-pants",
    price: 220000,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    categoryId: "c3",
    categoryName: "Bawahan",
    description: "Celana panjang berpotongan lebar yang memberikan kesan jenjang dan elegan. Bahan scuba ringan yang melar.",
    status: 'active',
    isFeatured: false,
    isNew: false,
    stock: 30
  },
  {
    id: "p5",
    name: "Silk Slip Dress",
    slug: "silk-slip-dress",
    price: 420000,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80",
    categoryId: "c1",
    categoryName: "Dress",
    description: "Dress slip bahan silk satin premium. Tampak sangat mewah untuk acara malam hari.",
    status: 'active',
    isFeatured: true,
    isNew: false,
    stock: 10
  }
];

export const mockNews: CmsNews[] = [
  {
    id: "n1",
    title: "Tren Warna Pakaian Wanita di Tahun Ini",
    slug: "tren-warna-pakaian-wanita",
    thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
    date: "12 Okt 2026",
    content: "Tahun ini warna-warna earth tone seperti terracotta, olive, dan sand mendominasi panggung mode...",
    category: "Fashion Tips"
  },
  {
    id: "n2",
    title: "Cara Merawat Baju Berbahan Silk Agar Awet",
    slug: "cara-merawat-baju-silk",
    thumbnail: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    date: "05 Okt 2026",
    content: "Pakaian berbahan silk satin membutuhkan perawatan khusus agar kilapnya tidak hilang. Hindari mencuci dengan mesin...",
    category: "Perawatan"
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
    content: "Alya Permata dimulai dari sebuah garasi kecil pada tahun 2020. Misi kami adalah memberdayakan wanita melalui pakaian yang nyaman dan elegan..."
  },
  {
    id: "pg2",
    title: "Keunggulan Kami",
    slug: "keunggulan",
    content: "1. Bahan Premium\n2. Jahitan Rapi\n3. Desain Eksklusif"
  },
  {
    id: "pg3",
    title: "Hubungi Kami",
    slug: "kontak",
    content: "Alamat: Jl. Sudirman No. 123\nEmail: hello@alyapermata.com"
  }
];
