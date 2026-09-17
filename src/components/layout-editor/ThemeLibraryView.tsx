import React, { useState, useMemo } from 'react';
import { Store, Product, ThemeTemplate } from '../../types';
import { STORE_TEMPLATES, StoreTemplate } from '../../utils/layoutConstants';
import {
  Search,
  X,
  Sparkles,
  Grid,
  LayoutTemplate,
  Zap,
  Crown,
  Flame,
  BookOpen,
  TreePine,
  PenTool,
  Briefcase,
  Gem,
  Eye,
  Wand2,
  ChevronRight,
  Palette,
  Layers,
  Settings2,
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

// ─── 10 Template Gallery Items ──────────────────────────────────────
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1200&auto=format&fit=crop',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop',
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

  const currentTemplateId = store.layoutSettings?.activeTemplateId;

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

  const handleUseTemplate = (template: TemplateGalleryItem) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    } else {
      onSelectTheme(template.storeTemplate.id);
    }
  };

  return (
    <div className="w-full h-full bg-[#F6F6F7] overflow-y-auto custom-scrollbar flex flex-col font-sans">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-[#E1E3E5] px-6 sm:px-10 pt-8 pb-6 shrink-0">
        <div className="max-w-[1400px] mx-auto">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
                Template Website
              </h1>
              <p className="text-[#6D7175] text-sm sm:text-[15px] mt-1.5 max-w-xl leading-relaxed">
                Pilih desain yang sesuai dengan karakter bisnis Anda. Setiap template bisa dikustomisasi sepenuhnya di visual editor.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {currentTemplateId && (
                <button
                  onClick={onCustomize}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1A1A1A] hover:bg-black transition-colors cursor-pointer shadow-sm"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Edit Template Aktif</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-[#F6F6F7] px-3.5 py-2 rounded-xl border border-[#E1E3E5] text-xs text-[#6D7175]">
                <Layers className="w-3.5 h-3.5 text-[#8C9196]" />
                <span className="font-semibold">{TEMPLATE_GALLERY_ITEMS.length} Template</span>
              </div>
            </div>
          </div>

          {/* ── SEARCH BAR ── */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8C9196]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari template berdasarkan nama, kategori, atau gaya desain..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-[#F6F6F7] border border-[#E1E3E5] text-sm text-[#202223] placeholder:text-[#8C9196] focus:outline-none focus:ring-2 focus:ring-[#2C6ECB]/30 focus:border-[#2C6ECB] transition font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#8C9196] hover:text-[#202223] hover:bg-[#E1E3E5] cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── CATEGORY FILTERS ── */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = cat.id === 'all'
                ? TEMPLATE_GALLERY_ITEMS.length
                : TEMPLATE_GALLERY_ITEMS.filter(t => t.categories.includes(cat.id)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#202223] text-white border-[#202223] shadow-sm'
                      : 'bg-white text-[#6D7175] border-[#E1E3E5] hover:border-[#8C9196] hover:text-[#202223]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  {count > 0 && !isActive && (
                    <span className="text-[11px] text-[#8C9196] ml-0.5">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TEMPLATE GRID ── */}
      <div className="flex-1 px-6 sm:px-10 py-8">
        <div className="max-w-[1400px] mx-auto">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E1E3E5] flex items-center justify-center mb-5 shadow-sm">
                <Search className="w-7 h-7 text-[#8C9196]" />
              </div>
              <h3 className="text-lg font-bold text-[#202223]">Tidak ada template ditemukan</h3>
              <p className="text-sm text-[#6D7175] mt-1.5 max-w-sm">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-white text-[#202223] text-sm font-semibold border border-[#E1E3E5] hover:bg-[#F6F6F7] transition cursor-pointer shadow-xs"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isActive={currentTemplateId === template.storeTemplate.id}
                  onPreview={() => onPreviewTemplate?.(template)}
                  onUse={() => handleUseTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="h-16"></div>
      </div>
    </div>
  );
};

// ─── Template Card ───────────────────────────────────────────────────
const TemplateCard: React.FC<{
  template: TemplateGalleryItem;
  isActive: boolean;
  onPreview: () => void;
  onUse: () => void;
}> = ({ template, isActive, onPreview, onUse }) => {
  return (
    <div className="group font-sans">
      {/* Thumbnail */}
      <div
        className={`relative aspect-[4/3] bg-[#F6F6F7] overflow-hidden cursor-pointer rounded-2xl border-2 transition-all duration-200 ${
          isActive
            ? 'border-[#2C6ECB] ring-2 ring-[#2C6ECB]/20'
            : 'border-transparent hover:border-[#AEB4B9]'
        }`}
        onClick={onPreview}
      >
        <img
          src={template.thumbnailUrl}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Active badge */}
        {isActive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2C6ECB] text-white text-[11px] font-bold shadow-md">
            <Palette className="w-3 h-3" />
            <span>Template Aktif</span>
          </div>
        )}

        {/* Badge Free */}
        {!isActive && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[11px] font-bold text-[#202223] shadow-sm border border-white/50">
            Gratis
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex items-center gap-2.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm text-[#202223] text-[13px] font-bold shadow-lg hover:bg-white transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Pratinjau
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onUse(); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#202223] text-white text-[13px] font-bold shadow-lg hover:bg-black transition cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Gunakan
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-[15px] text-[#202223] leading-tight truncate">
              {template.name}
            </h3>
            <p className="text-[13px] text-[#6D7175] mt-0.5 line-clamp-2 leading-relaxed">
              {template.description}
            </p>
          </div>
        </div>

        {/* Design traits */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {template.designTraits.map((trait) => (
            <span
              key={trait}
              className="px-2 py-0.5 rounded-md bg-[#F6F6F7] text-[11px] font-medium text-[#6D7175] border border-[#E1E3E5]"
            >
              {trait}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-md bg-[#F6F6F7] text-[11px] font-medium text-[#6D7175] border border-[#E1E3E5]">
            {template.sectionCount} bagian
          </span>
        </div>

        {/* Pages list */}
        <div className="flex items-center gap-1 mt-2 text-[11px] text-[#8C9196]">
          <Layers className="w-3 h-3 shrink-0" />
          <span className="truncate">{template.pageNames.join(' · ')}</span>
        </div>
      </div>
    </div>
  );
};
