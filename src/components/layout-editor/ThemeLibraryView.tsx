import React, { useState, useMemo } from 'react';
import { Store, Product } from '../../types';
import { STORE_TEMPLATES, StoreTemplate } from '../../utils/layoutConstants';
import { CenterPreviewCanvas } from './CenterPreviewCanvas';
import { Breadcrumb } from '../common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';
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
  RotateCcw,
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
  onNavigateDashboard?: () => void;
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
  onNavigateDashboard,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: TEMPLATE_GALLERY_ITEMS.length,
    };
    TEMPLATE_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        counts[cat.id] = TEMPLATE_GALLERY_ITEMS.filter(
          (t) => t.category === cat.id || t.categories.includes(cat.id)
        ).length;
      }
    });
    return counts;
  }, []);

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
      <div className="bg-white border-b border-[#E5E0DD] px-4 sm:px-8 py-4 sm:py-6 shrink-0">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
              { label: t('nav_template_website', 'Template Website'), isActive: true },
            ]}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E5E0DD]">
            <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
              <LayoutTemplate className="w-5 h-5 text-[#66000E]" />
              <span>{t('nav_template_website', 'Template Website')}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-[#706866]">
              <div className="flex items-center gap-1.5 bg-[#F6F4F3] px-3 py-1.5 rounded-lg border border-[#E5E0DD]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold">{TEMPLATE_GALLERY_ITEMS.length} {t('templates_available', 'Template Tersedia')}</span>
              </div>
            </div>
          </div>

          {/* ── CATEGORY FILTER DOCK CONTAINER (Consistent Segmented Dock Design) ── */}
          <div className="relative p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[#F8F9FA] border border-[#EAEAEA] shadow-2xs">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                const label = cat.id === 'all' ? t('filter_all', 'Semua') : cat.label;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    title={`Filter: ${label} (${count})`}
                    className={`group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[42px] rounded-lg sm:rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-out shrink-0 cursor-pointer select-none active:scale-[0.97] ${
                      isActive
                        ? 'bg-gradient-to-r from-[#9A0602] to-[#B91C1C] text-white shadow-xs font-bold z-10'
                        : 'bg-white text-[#555555] hover:bg-white/95 border border-[#EAEAEA] hover:border-[#9A0602]/40 hover:text-[#9A0602]'
                    }`}
                  >
                    {/* Icon */}
                    <span className={`transition-transform duration-300 ${isActive ? 'scale-105' : 'group-hover:scale-110'}`}>
                      <Icon
                        className={`w-3.5 h-3.5 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-[#777777] group-hover:text-[#9A0602]'
                        }`}
                      />
                    </span>

                    {/* Tab Label */}
                    <span className="tracking-tight text-[11px] sm:text-xs">{label}</span>

                    {/* Interactive Counter Badge */}
                    <span
                      className={`text-[10px] sm:text-[11px] min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 rounded-full font-mono font-bold flex items-center justify-center border transition-all duration-200 ${
                        isActive
                          ? 'bg-white/25 text-white border-white/30'
                          : 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7] group-hover:bg-[#FFF1F0] group-hover:text-[#9A0602] group-hover:border-[#FECDCA]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Quick Clear Filter Button */}
              {activeCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] sm:min-h-[42px] rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-[#777777] hover:text-[#9A0602] hover:bg-white border border-dashed border-[#D4D4D8] hover:border-[#9A0602]/50 whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ml-auto active:scale-95 group"
                  title="Reset Filter"
                >
                  <RotateCcw className="w-3 h-3 text-[#777777] group-hover:text-[#9A0602] group-hover:-rotate-90 transition-transform duration-300" />
                  <span>{t('reset_filter', 'Reset')}</span>
                </button>
              )}
            </div>
          </div>

          {/* ── SEARCH BAR CARD (Consistent Secondary Filter Box) ── */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#EAEAEA] shadow-2xs flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_template_placeholder', 'Cari template berdasarkan nama, kategori, atau gaya desain...')}
                className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] text-xs sm:text-sm text-[#1F1F1F] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602] focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TEMPLATE GRID ── */}
      <div className="flex-1 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#EAEAEA] shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-[#FBF9F9] border border-[#EBE5E2] flex items-center justify-center mb-4 text-[#66000E]">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1F1F1F]">{t('no_templates_found', 'Tidak ada template ditemukan')}</h3>
              <p className="text-xs sm:text-sm text-[#706866] mt-1">{t('try_different_search', 'Coba ubah kata kunci pencarian atau filter kategori.')}</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-4 px-4 py-2 rounded-xl bg-white border border-[#EAEAEA] text-xs sm:text-sm font-semibold text-[#1F1F1F] hover:bg-[#F9F9F9] hover:border-[#9A0602]/40 hover:text-[#9A0602] transition cursor-pointer shadow-2xs"
              >
                {t('reset_filter', 'Reset Filter')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
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
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-[#EAEAEA] p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:border-[#9A0602]/30 transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Thumbnail */}
        <div
          className="relative aspect-[4/3] sm:aspect-[16/11] bg-gray-100 overflow-hidden cursor-pointer rounded-xl border border-[#EAEAEA] group-hover:border-[#9A0602]/30 transition-all duration-200"
          onClick={onPreview}
        >
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Section count badge */}
          <div className="absolute top-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10">
            {template.sectionCount} {t('sections_count', 'Seksi')}
          </div>

          {/* Hover overlay with Pratinjau button */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="bg-white/95 backdrop-blur-sm text-[#1F1F1F] font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-all duration-300">
              <Eye className="w-3.5 h-3.5 text-[#9A0602]" />
              <span>{t('btn_preview', 'Pratinjau')}</span>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-[#1F1F1F] truncate group-hover:text-[#9A0602] transition-colors">
              {template.name}
            </h3>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium shrink-0">
              {t('badge_free', 'Gratis')}
            </span>
          </div>
          <p className="text-xs text-[#706866] mt-1 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
          {/* Design Traits tags */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {template.designTraits.map((trait, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-[#555555] bg-[#F4F4F5] border border-[#E4E4E7] px-2 py-0.5 rounded-md"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-3 border-t border-[#F0EDED] flex items-center gap-2">
        <button
          onClick={onPreview}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#555555] bg-white border border-[#EAEAEA] hover:bg-[#F9F9F9] hover:text-[#1F1F1F] transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('btn_view_demo', 'Lihat Demo')}</span>
        </button>
        <button
          onClick={onUse}
          className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#9A0602] to-[#B91C1C] hover:from-[#800000] hover:to-[#9A0602] transition cursor-pointer shadow-xs active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <span>{t('btn_use_template', 'Gunakan')}</span>
        </button>
      </div>
    </div>
  );
};
