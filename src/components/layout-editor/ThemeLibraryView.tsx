import React, { useState, useMemo } from 'react';
import { Store, Product } from '../../types';
import { STORE_TEMPLATES, StoreTemplate } from '../../utils/layoutConstants';
import { CenterPreviewCanvas } from './CenterPreviewCanvas';
import {
  Search,
  Eye,
  Palette,
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Grid,
  LayoutTemplate,
  X,
  Star,
  Zap,
  Crown,
  Gem,
  Flame,
  BookOpen,
  TreePine,
  PenTool,
  Briefcase,
  Building2,
} from 'lucide-react';

// ─── Template Category Definitions ───────────────────────────────────
const TEMPLATE_CATEGORIES = [
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

// ─── 10 Template Definitions (Design-Identity Focused) ──────────────
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
}

export const TEMPLATE_GALLERY_ITEMS: TemplateGalleryItem[] = [
  {
    id: 'minimal_store',
    name: 'Minimal Store',
    category: 'minimalist',
    categories: ['minimalist'],
    description: 'Desain bersih dengan banyak whitespace, tipografi sederhana, dan fokus penuh pada produk.',
    sectionCount: 8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#1A1A1A',
    fontFamily: 'Inter',
    designTraits: ['Whitespace', 'Clean', 'Netral'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'minimalist_clean') || STORE_TEMPLATES[0],
  },
  {
    id: 'nova_commerce',
    name: 'Nova Commerce',
    category: 'modern',
    categories: ['modern'],
    description: 'Grid dinamis dengan rounded card, layout kontemporer, dan CTA yang menonjol.',
    sectionCount: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1555529733-0e670560f4e1?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#2563EB',
    fontFamily: 'Outfit',
    designTraits: ['Dinamis', 'Rounded', 'Vibrant'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'gadget_tech') || STORE_TEMPLATES[0],
  },
  {
    id: 'future_shop',
    name: 'Future Shop',
    category: 'futuristic',
    categories: ['futuristic'],
    description: 'Tema dark dengan kontras tinggi, gradient, geometric layout, dan aksen glow.',
    sectionCount: 9,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#8B5CF6',
    fontFamily: 'Space Grotesk',
    designTraits: ['Dark Mode', 'Gradient', 'Geometric'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'futuristic_dark') || STORE_TEMPLATES[0],
  },
  {
    id: 'maison',
    name: 'Maison',
    category: 'elegant',
    categories: ['elegant', 'luxury'],
    description: 'Tipografi premium, whitespace berlimpah, layout sophisticated, dan warna premium.',
    sectionCount: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#92400E',
    fontFamily: 'Cormorant Garamond',
    designTraits: ['Premium', 'Sophisticated', 'Serif'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'editorial_luxury') || STORE_TEMPLATES[0],
  },
  {
    id: 'bold_market',
    name: 'Bold Market',
    category: 'bold',
    categories: ['bold'],
    description: 'Tipografi besar, kontras tinggi, hero kuat, dan CTA agresif yang mencolok.',
    sectionCount: 9,
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#DC2626',
    fontFamily: 'Anton',
    designTraits: ['Kontras Tinggi', 'Bold Type', 'Agresif'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'bold_market') || STORE_TEMPLATES[0],
  },
  {
    id: 'editorial_commerce',
    name: 'Editorial Commerce',
    category: 'editorial',
    categories: ['editorial'],
    description: 'Layout majalah, asymmetric grid, storytelling sections, dan tipografi large serif.',
    sectionCount: 11,
    thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#66000E',
    fontFamily: 'Lora',
    designTraits: ['Magazine', 'Storytelling', 'Asymmetric'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'editorial_commerce') || STORE_TEMPLATES[0],
  },
  {
    id: 'green_market',
    name: 'Green Market',
    category: 'nature',
    categories: ['nature'],
    description: 'Warna earth tone, elemen organik, rounded shapes, dan image-driven layout.',
    sectionCount: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#059669',
    fontFamily: 'DM Sans',
    designTraits: ['Organik', 'Earth Tone', 'Rounded'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'nature_organic') || STORE_TEMPLATES[0],
  },
  {
    id: 'creative_studio',
    name: 'Creative Studio Store',
    category: 'creative',
    categories: ['creative'],
    description: 'Layout eksperimental, komposisi dinamis, visual storytelling, dan palet warna colorful.',
    sectionCount: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#E11D48',
    fontFamily: 'Sora',
    designTraits: ['Eksperimental', 'Colorful', 'Dynamic'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'creative_studio') || STORE_TEMPLATES[0],
  },
  {
    id: 'pro_commerce',
    name: 'Pro Commerce',
    category: 'professional',
    categories: ['professional'],
    description: 'Clean corporate commerce, struktur informasi jelas, dan fokus pada usability & conversion.',
    sectionCount: 11,
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#1E40AF',
    fontFamily: 'Inter',
    designTraits: ['Corporate', 'Structured', 'High Conversion'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'pro_corporate') || STORE_TEMPLATES[0],
  },
  {
    id: 'urban_collection',
    name: 'Urban Collection',
    category: 'modern',
    categories: ['modern', 'editorial'],
    description: 'Estetika urban, hybrid editorial-modern, monochrome dengan aksen warna kontras.',
    sectionCount: 10,
    thumbnailUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200&auto=format&fit=crop',
    primaryAccent: '#18181B',
    fontFamily: 'Instrument Sans',
    designTraits: ['Urban', 'Monochrome', 'Contemporary'],
    storeTemplate: STORE_TEMPLATES.find(t => t.id === 'chic_fashion') || STORE_TEMPLATES[0],
  },
];

// ─── Props ───────────────────────────────────────────────────────────
interface ThemeLibraryViewProps {
  store: Store;
  products: Product[];
  onCustomize: () => void;
  onSelectTheme: (themeId: string) => void;
  onPreviewTheme: (themeId: string) => void;
  onApplyTemplate?: (template: TemplateGalleryItem) => void;
  onPreviewTemplate?: (template: TemplateGalleryItem) => void;
}

// ─── Component ───────────────────────────────────────────────────────
export const ThemeLibraryView: React.FC<ThemeLibraryViewProps> = ({
  store,
  products,
  onCustomize,
  onSelectTheme,
  onPreviewTheme,
  onApplyTemplate,
  onPreviewTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return TEMPLATE_GALLERY_ITEMS.filter((t) => {
      const matchCategory = activeCategory === 'all' || t.categories.includes(activeCategory);
      const matchSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.designTraits.some((trait) => trait.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Handle "Gunakan Template" (directly from card button)
  const handleUseTemplate = (template: TemplateGalleryItem) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    } else {
      onSelectTheme(template.storeTemplate.id);
    }
  };

  // ── GALLERY MODE ─────────────────────────────────────────────────
  return (
    <div className="w-full h-full bg-[#FAF7F7] overflow-y-auto custom-scrollbar flex flex-col font-sans">
      <div className="bg-white border-b border-[#E5E0DD] px-6 sm:px-8 py-6 sm:py-8 shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-sm">
                  <LayoutTemplate className="w-4.5 h-4.5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241A1A] tracking-tight">Template Website</h1>
              </div>
              <p className="text-[#706866] text-sm sm:text-base mt-1 max-w-xl">
                Pilih template desain yang sesuai dengan karakter bisnis Anda, lalu sesuaikan konten dan tampilannya di visual editor.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#706866]">
              <div className="flex items-center gap-1.5 bg-[#F6F4F3] px-3 py-1.5 rounded-lg border border-[#E5E0DD]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">{TEMPLATE_GALLERY_ITEMS.length} Template Tersedia</span>
              </div>
            </div>
          </div>

          {/* ── SEARCH BAR ── */}
          <div className="mt-5 relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B5AEAC]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari template berdasarkan nama, kategori, atau gaya desain..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-sm text-[#241A1A] placeholder:text-[#B5AEAC] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]/40 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ── CATEGORY FILTERS ── */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    isActive
                      ? 'bg-[#66000E] text-white border-[#66000E] shadow-sm'
                      : 'bg-white text-[#706866] border-[#E5E0DD] hover:border-[#66000E]/30 hover:text-[#66000E]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TEMPLATE GRID ── */}
      <div className="flex-1 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Tidak ada template ditemukan</h3>
              <p className="text-sm text-gray-500 mt-1">Coba ubah kata kunci pencarian atau filter kategori.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => onPreviewTemplate?.(template)}
                  onUse={() => handleUseTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className="h-12"></div>
      </div>
    </div>
  );
};

const TemplateCard: React.FC<{
  template: TemplateGalleryItem;
  onPreview: () => void;
  onUse: () => void;
}> = ({ template, onPreview, onUse }) => {
  return (
    <div className="bg-white group font-sans">
      {/* Thumbnail */}
      <div
        className="relative aspect-[4/3] sm:aspect-[16/11] bg-gray-100 overflow-hidden cursor-pointer rounded-2xl border-2 border-transparent group-hover:border-[#2271B1] transition-all duration-200"
        onClick={onPreview}
      >
        <img
          src={template.thumbnailUrl}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover overlay with Pratinjau button */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/90 backdrop-blur-sm text-[#241A1A] font-bold text-sm px-6 py-2.5 rounded-lg shadow-md flex items-center justify-center transform scale-95 group-hover:scale-100 transition-all duration-300">
            Pratinjau
          </span>
        </div>
      </div>

      {/* Info & Action */}
      <div className="pt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[15px] text-gray-900 leading-tight">
            {template.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">oleh MicroCMS</p>
        </div>
        <button
          onClick={onUse}
          className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-colors cursor-pointer shadow-xs"
        >
          Tambahkan
        </button>
      </div>
    </div>
  );
};
