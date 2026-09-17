import React, { useState, useMemo } from 'react';
import { Store, Product, ThemeTemplate } from '../../types';
import { STORE_TEMPLATES, StoreTemplate } from '../../utils/layoutConstants';
import { THEME_DATA_MAP } from '../../themes/themeData';
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

// ─── Props ───────────────────────────────────────────────────────────
interface ThemeLibraryViewProps {
  store: Store;
  products: Product[];
  onCustomize: () => void;
  onSelectTheme: (themeId: string) => void;
  onPreviewTheme: (themeId: string) => void;
  onApplyTemplate?: (template: TemplateGalleryItem) => void;
  onPreviewTemplate?: (template: TemplateGalleryItem) => void;
  savedThemes?: TemplateGalleryItem[];
  onAddSavedTheme?: (template: TemplateGalleryItem) => void;
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
  savedThemes = [],
  onAddSavedTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAllDrafts, setShowAllDrafts] = useState(false);

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
    if (onAddSavedTheme) {
      onAddSavedTheme(template);
      // Removed onApplyTemplate so it just adds to draft list without forcing the user into the editor
    } else if (onApplyTemplate) {
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

          {/* ── PUSTAKA TEMA TERSIMPAN (SAVED DRAFT THEMES) ── */}
          {savedThemes.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 px-1">
                <h3 className="font-bold text-[16px] text-[#202223]">Pustaka tema</h3>
              </div>
              
              <div className="bg-white border border-[#E1E3E5] rounded-xl shadow-xs overflow-hidden">
                <div className="flex flex-col">
                  {(showAllDrafts ? savedThemes : savedThemes.slice(0, 3)).map((savedTmpl, idx) => {
                    const isCurrentActive = currentTemplateId === savedTmpl.storeTemplate.id;
                    const isLast = idx === (showAllDrafts ? savedThemes.length : Math.min(3, savedThemes.length)) - 1;
                    return (
                      <div key={savedTmpl.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FAFB] transition ${!isLast ? 'border-b border-[#E1E3E5]' : ''}`}>
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[#E1E3E5] bg-gray-50 flex items-center justify-center shadow-inner">
                            <img src={savedTmpl.thumbnailUrl} alt={savedTmpl.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="font-bold text-[15px] text-[#202223] truncate">{savedTmpl.name}</h4>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.5 bg-[#E4F8EB] text-[#008060] text-[10px] font-bold rounded uppercase tracking-wider hidden sm:inline-block">Baru ditambahkan</span>
                              )}
                            </div>
                            <div className="text-[13px] text-[#6D7175] flex items-center gap-1.5">
                              {isCurrentActive ? (
                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#008060] shadow-[0_0_0_2px_#E4F8EB]"></span> Tema sedang digunakan</span>
                              ) : (
                                <span>
                                  {(() => {
                                    if (idx === 0) return 'Tersimpan: Baru saja';
                                    const d = new Date();
                                    if (idx === 1) {
                                      d.setHours(d.getHours() - 2);
                                      return `Tersimpan: ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}`;
                                    }
                                    if (idx === 2) {
                                      d.setDate(d.getDate() - 1);
                                      return `Tersimpan: Kemarin pukul ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}`;
                                    }
                                    d.setDate(d.getDate() - idx);
                                    return `Tersimpan: ${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                                  })()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button
                            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#202223] bg-white border border-[#C9CCCF] hover:bg-[#F6F6F7] hover:border-[#8C9196] transition cursor-pointer shadow-xs"
                          >
                            Tindakan
                          </button>
                          <button
                            onClick={() => onApplyTemplate?.(savedTmpl)}
                            className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-[#202223] hover:bg-black text-white transition cursor-pointer shadow-xs"
                          >
                            {isCurrentActive ? 'Sesuaikan' : 'Sesuaikan draf'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {savedThemes.length > 3 && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setShowAllDrafts(!showAllDrafts)}
                    className="text-[14px] font-semibold text-[#2C6ECB] hover:text-[#1F5199] hover:underline transition-colors"
                  >
                    {showAllDrafts ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── EXPLORE TEMPLATES ── */}
          <div className="mb-6 px-1">
            <h3 className="font-bold text-[20px] text-[#202223]">Jelajahi template</h3>
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
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold border transition-all cursor-pointer ${isActive
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

// ─── Mini Template Preview ─────────────────────────────────────────────
const MiniTemplatePreview: React.FC<{
  template: TemplateGalleryItem;
  themeData: any;
}> = ({ template, themeData }) => {
  const sections = template.storeTemplate.sections || [];
  const products = themeData?.products || [];

  const headerSection = sections.find((s) => s.id === 'header');
  const heroSection = sections.find((s) => s.id === 'hero_banner');
  const productSection = sections.find((s) =>
    ['product_grid', 'featured_products', 'collection_grid', 'lookbook', 'signature_collection', 'asymmetric_showcase', 'latest_drop'].includes(s.id)
  );

  const headerStyle = headerSection?.options?.headerStyle || 'standard';
  const heroStyle = heroSection?.options?.bannerStyle || 'normal';

  let productLayout = 'grid';
  let gridCols = 3;
  if (productSection) {
    if (
      (productSection.options as any)?.layout === 'masonry' ||
      (productSection.options as any)?.layout === 'asymmetric' ||
      productSection.id === 'asymmetric_showcase' ||
      productSection.id === 'lookbook'
    ) {
      productLayout = 'asymmetric';
    } else {
      productLayout = 'grid';
      gridCols = productSection.options?.gridColumns || 3;
      // Ensure gridCols is 2, 3, or 4 for preview rendering
      if (gridCols > 4) gridCols = 4;
      if (gridCols < 2) gridCols = 2;
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-white pointer-events-none transition-transform duration-700 group-hover:scale-[1.03]">

      {/* Dynamic Header */}
      {headerStyle === 'brand' ? (
        <div className="h-6 flex items-center justify-center shrink-0" style={{ backgroundColor: template.primaryAccent }}>
          <div className="w-12 h-1.5 bg-white/80 rounded-full"></div>
        </div>
      ) : headerStyle === 'minimal' ? (
        <div className="h-7 border-b border-gray-100 flex items-center px-4 justify-between shrink-0">
          <div className="flex gap-2">
            <div className="w-5 h-1 bg-gray-200 rounded-full"></div>
            <div className="w-5 h-1 bg-gray-200 rounded-full"></div>
          </div>
          <div className="w-10 h-1.5 bg-gray-300 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
        </div>
      ) : (
        <div className="h-7 border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
          <div className="w-4 h-4 rounded-full bg-gray-200"></div>
          <div className="flex gap-2.5 ml-auto">
            <div className="w-6 h-1 bg-gray-100 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Dynamic Hero */}
      {(heroStyle as string) === 'split' ? (
        <div className="h-[40%] shrink-0 flex">
          <div className="w-1/2 h-full bg-[#F6F6F7] flex flex-col justify-center px-4 gap-2 border-r border-white relative overflow-hidden">
            <div className="w-4/5 h-2.5 bg-gray-300 rounded-sm"></div>
            <div className="w-3/5 h-1.5 bg-gray-200 rounded-sm"></div>
            <div className="w-1/3 h-2 mt-1 rounded-sm" style={{ backgroundColor: template.primaryAccent }}></div>
          </div>
          <div className="w-1/2 h-full">
            <img src={template.thumbnailUrl} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      ) : (heroStyle as string) === 'typographic' ? (
        <div className="h-[40%] relative shrink-0 bg-[#FAFAFA] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
          <img src={template.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-20" loading="lazy" />
          <h4
            className="relative z-10 font-extrabold text-2xl md:text-3xl uppercase tracking-tighter leading-none"
            style={{ fontFamily: template.fontFamily, color: template.primaryAccent }}
          >
            {template.name}
          </h4>
          <div className="relative z-10 w-1/2 h-1.5 bg-gray-300 rounded-full mt-3"></div>
        </div>
      ) : heroStyle === 'compact' ? (
        <div className="h-[25%] relative shrink-0">
          <img src={template.thumbnailUrl} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/30 flex items-center px-5">
            <h4 className="text-white font-bold text-lg" style={{ fontFamily: template.fontFamily }}>
              {template.name}
            </h4>
          </div>
        </div>
      ) : (
        /* Normal, Full, Editorial, Campaign */
        <div className="h-[45%] relative shrink-0">
          <img src={template.thumbnailUrl} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center p-4">
            <h4
              className="text-white font-bold text-xl md:text-2xl tracking-wide drop-shadow-md text-center"
              style={{ fontFamily: template.fontFamily }}
            >
              {template.name}
            </h4>
          </div>
        </div>
      )}

      {/* Dynamic Content / Products */}
      <div className="flex-1 p-4 flex flex-col bg-white">
        {productLayout === 'asymmetric' ? (
          <div className="flex gap-3 h-full">
            <div className="w-[55%] h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
              {products[0] && <img src={products[0].image} className="w-full h-full object-cover" />}
            </div>
            <div className="w-[45%] flex flex-col gap-3">
              <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                {products[1] && <img src={products[1].image} className="w-full h-full object-cover" />}
              </div>
              <div className="h-[35%] bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                {products[2] && <img src={products[2].image} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <div className="absolute inset-0 p-2.5 flex flex-col gap-1.5 justify-end bg-gradient-to-t from-black/30 to-transparent">
                  <div className="w-full h-1.5 bg-white/90 rounded-full"></div>
                  <div className="w-1/2 h-1.5 bg-white/70 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-3">
            <div className="w-20 h-1.5 bg-gray-200 rounded-full self-center"></div>
            <div
              className="grid gap-3 flex-1"
              style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
              {products.slice(0, gridCols).map((p: any, i: number) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    <img src={p.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <div className="h-1.5 w-4/5 bg-gray-200 rounded-full"></div>
                    <div className="h-1 w-1/2 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
  const themeData = THEME_DATA_MAP[template.storeTemplate.id] || THEME_DATA_MAP['minimalist'];

  return (
    <div className="group font-sans flex flex-col gap-4">
      {/* Thumbnail */}
      <div
        className={`relative aspect-[4/3] sm:aspect-[16/12] bg-white overflow-hidden cursor-pointer rounded-2xl border border-[#E1E3E5] shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-[#C9CCCF] ${isActive ? 'ring-2 ring-[#2C6ECB] border-transparent' : ''
          }`}
        onClick={onPreview}
      >
        <MiniTemplatePreview template={template} themeData={themeData} />

        {/* Hover overlay - Subtle */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
      </div>

      {/* Info Row (Title + Button) */}
      <div className="flex items-start justify-between px-1">
        <div>
          <h3 className="font-bold text-[16px] text-[#202223] leading-tight">
            {template.name}
          </h3>
          <p className="text-[14px] text-[#6D7175] mt-1">
            oleh MicroCMS
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onUse(); }}
          className={`px-4 py-2 rounded-xl border text-[13px] font-semibold shadow-sm transition-colors cursor-pointer ${isActive
              ? 'bg-[#202223] text-white border-[#202223]'
              : 'bg-white border-[#E1E3E5] text-[#202223] hover:bg-[#F6F6F7]'
            }`}
        >
          {isActive ? 'Aktif' : 'Tambahkan'}
        </button>
      </div>
    </div>
  );
};
