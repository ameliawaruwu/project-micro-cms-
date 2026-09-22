import { StoreTemplate, STORE_TEMPLATES } from '../../utils/layoutConstants';
import {
  Grid,
  LayoutTemplate,
  Zap,
  Sparkles,
  Crown,
  Flame,
  BookOpen,
  Gem,
  PenTool,
  TreePine,
  Briefcase,
} from 'lucide-react';

// ─── Template Category Definitions ───────────────────────────────────
export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'Semua', icon: Grid },
  { id: 'minimalist', label: 'Minimalist', icon: LayoutTemplate },
  { id: 'modern', label: 'Modern', icon: Zap },
  { id: 'futuristic', label: 'Futuristic', icon: Sparkles },
  { id: 'elegant', label: 'Elegant', icon: Crown },
  { id: 'bold', label: 'Bold', icon: Flame },
  { id: 'editorial', label: 'Editorial', icon: BookOpen },
  { id: 'luxury', label: 'Luxury', icon: Gem },
  { id: 'creative', label: 'Creative', icon: PenTool },
  { id: 'nature', label: 'Nature', icon: TreePine },
  { id: 'professional', label: 'Professional', icon: Briefcase },
] as const;

// ─── Template Gallery Item Interface ─────────────────────────────────
export interface TemplateGalleryItem {
  id: string;
  name: string;
  category: string;
  categories: string[];
  description: string;
  sectionCount: number;
  thumbnailUrl: string;
  primaryAccent: string;
  fontFamily: string;
  designTraits: string[];
  storeTemplate: StoreTemplate;
  pageNames: string[];
}

// ─── 10 Template Gallery Items ──────────────────────────────────────
export const TEMPLATE_GALLERY_ITEMS: TemplateGalleryItem[] = [
  {
    id: 'minimal_store',
    name: 'Minimal Store',
    category: 'minimalist',
    categories: ['minimalist'],
    description: 'Desain bersih dengan whitespace berlimpah, tipografi sederhana, dan fokus penuh pada produk Anda.',
    sectionCount: 7,
    thumbnailUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#1A1A1A',
    fontFamily: 'Inter',
    designTraits: ['Whitespace', 'Clean', 'Netral'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'minimalist_clean') || STORE_TEMPLATES[0],
    pageNames: ['Beranda', 'Katalog', 'Produk', 'Tentang', 'Kontak'],
  },
  {
    id: 'nova_commerce',
    name: 'Nova Commerce',
    category: 'modern',
    categories: ['modern'],
    description: 'Grid dinamis dengan rounded card, layout kontemporer, dan CTA yang menonjol untuk toko teknologi.',
    sectionCount: 7,
    thumbnailUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#2563EB',
    fontFamily: 'Outfit',
    designTraits: ['Dinamis', 'Rounded', 'Vibrant'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'gadget_tech') || STORE_TEMPLATES[0],
    pageNames: ['Beranda', 'Gadget', 'Promo', 'Support'],
  },
  {
    id: 'future_shop',
    name: 'Future Shop',
    category: 'futuristic',
    categories: ['futuristic'],
    description: 'Tema dark dengan kontras tinggi, gradient neon, geometric layout, dan aksen glow futuristik.',
    sectionCount: 6,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#8B5CF6',
    fontFamily: 'Space Grotesk',
    designTraits: ['Dark Mode', 'Gradient', 'Geometric'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'futuristic_dark') || STORE_TEMPLATES[0],
    pageNames: ['Beranda', 'Explore', 'Produk', 'Teknologi'],
  },
  {
    id: 'maison',
    name: 'Maison',
    category: 'elegant',
    categories: ['elegant', 'luxury'],
    description: 'Tipografi premium serif, whitespace berlimpah, layout sophisticated untuk brand luxury.',
    sectionCount: 6,
    thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#92400E',
    fontFamily: 'Cormorant Garamond',
    designTraits: ['Premium', 'Sophisticated', 'Serif'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'editorial_luxury') || STORE_TEMPLATES[0],
    pageNames: ['Beranda', 'Koleksi', 'Lookbook', 'Brand Story'],
  },
  {
    id: 'bold_market',
    name: 'Bold Market',
    category: 'bold',
    categories: ['bold'],
    description: 'Tipografi besar dan tebal, kontras tinggi, hero kuat, dan CTA agresif yang mencolok.',
    sectionCount: 5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#DC2626',
    fontFamily: 'Anton',
    designTraits: ['Kontras Tinggi', 'Bold Type', 'Agresif'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'bold_market') || STORE_TEMPLATES[0],
    pageNames: ['Beranda', 'Best Seller', 'Flash Sale'],
  },
  {
    id: 'editorial_commerce',
    name: 'Editorial',
    category: 'editorial',
    categories: ['editorial'],
    description: 'Layout majalah, asymmetric grid, storytelling sections, dan tipografi large serif yang elegan.',
    sectionCount: 6,
    thumbnailUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#66000E',
    fontFamily: 'Lora',
    designTraits: ['Magazine', 'Storytelling', 'Asymmetric'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'editorial_commerce') || STORE_TEMPLATES[0],
    pageNames: ['Beranda', 'Stories', 'Koleksi', 'Journal'],
  },
  {
    id: 'green_market',
    name: 'Green Market',
    category: 'nature',
    categories: ['nature'],
    description: 'Warna earth tone hangat, elemen organik, rounded shapes, dan image-driven layout untuk produk alam.',
    sectionCount: 7,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#059669',
    fontFamily: 'DM Sans',
    designTraits: ['Organik', 'Earth Tone', 'Rounded'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'nature_organic') || STORE_TEMPLATES[0],
    pageNames: ['Beranda', 'Produk Segar', 'Kisah Kami', 'Resep'],
  },
  {
    id: 'creative_studio',
    name: 'Creative Studio',
    category: 'creative',
    categories: ['creative'],
    description: 'Layout eksperimental, komposisi dinamis, visual storytelling, dan palet warna colorful.',
    sectionCount: 5,
    thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#E11D48',
    fontFamily: 'Sora',
    designTraits: ['Eksperimental', 'Colorful', 'Dynamic'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'creative_studio') || STORE_TEMPLATES[0],
    pageNames: ['Portfolio', 'Galeri', 'Workshop', 'Tentang'],
  },
  {
    id: 'pro_commerce',
    name: 'Pro Commerce',
    category: 'professional',
    categories: ['professional'],
    description: 'Clean corporate commerce, struktur informasi jelas, dan fokus pada usability & conversion.',
    sectionCount: 7,
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#1E40AF',
    fontFamily: 'Inter',
    designTraits: ['Corporate', 'Structured', 'High Conversion'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'pro_corporate') || STORE_TEMPLATES[0],
    pageNames: ['Beranda', 'Layanan B2B', 'Katalog', 'Studi Kasus'],
  },
];
