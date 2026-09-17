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

// ─── Mini Template Preview ─────────────────────────────────────────────
const MiniTemplatePreview: React.FC<{
  template: TemplateGalleryItem;
  themeData: any;
}> = ({ template, themeData }) => {
  const products = themeData?.products || [
    { name: 'Produk Premium A', price: 150000, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
    { name: 'Produk Premium B', price: 299000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
    { name: 'Produk Premium C', price: 189000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
  ];

  const isDark = template.category === 'futuristic' || template.id === 'future_shop';

  return (
    <div className={`w-full h-full flex flex-col pointer-events-none transition-transform duration-500 group-hover:scale-[1.02] ${
      isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Sleek Header Mockup */}
      <div className={`h-8 px-3.5 flex items-center justify-between shrink-0 border-b ${
        isDark ? 'bg-[#0D1117] border-cyan-500/20' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center gap-1.5">
          <span className={`font-black text-[11px] uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-gray-900'}`} style={{ fontFamily: template.fontFamily }}>
            {template.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-gray-400'}`} />
          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
            isDark ? 'border-cyan-500/40 text-cyan-400' : 'border-gray-300 text-gray-500'
          }`}>
            <span className="text-[8px] font-bold">🛒</span>
          </div>
        </div>
      </div>

      {/* Hero Preview Section */}
      <div className="h-[42%] relative shrink-0 overflow-hidden bg-slate-900">
        <img 
          src={template.thumbnailUrl} 
          alt={template.name} 
          className="w-full h-full object-cover transition duration-700 group-hover:scale-105" 
          loading="lazy" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3.5">
          <span className="text-[9px] uppercase tracking-widest text-white/80 font-semibold mb-0.5">
            {template.designTraits.join(' • ')}
          </span>
          <h4 
            className="text-white font-black text-lg leading-tight tracking-tight drop-shadow-md"
            style={{ fontFamily: template.fontFamily }}
          >
            {template.name}
          </h4>
        </div>
      </div>

      {/* Product Items Preview Section */}
      <div className={`flex-1 p-3 flex flex-col ${isDark ? 'bg-[#0B0F19]' : 'bg-gray-50/50'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-gray-500'}`}>
            Koleksi Terbaru
          </span>
          <span className="text-[9px] text-gray-400">Lihat Semua →</span>
        </div>
        <div className="grid grid-cols-3 gap-2 flex-1">
          {products.slice(0, 3).map((p: any, i: number) => (
            <div key={i} className={`flex flex-col rounded-lg overflow-hidden border p-1 transition-all ${
              isDark ? 'bg-slate-900/80 border-cyan-500/20' : 'bg-white border-gray-100 shadow-2xs'
            }`}>
              <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-1">
                <img src={p.image || p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <p className={`text-[9px] font-bold truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                {p.name}
              </p>
              <p className={`text-[9px] font-semibold ${isDark ? 'text-cyan-400' : 'text-gray-500'}`}>
                Rp {(p.price || 150000).toLocaleString('id-ID')}
              </p>
            </div>
          ))}
        </div>
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
    <div className={`group font-sans bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col ${
      isActive ? 'border-[#2C6ECB] ring-2 ring-[#2C6ECB]/20 shadow-md' : 'border-[#E1E3E5] hover:border-gray-400 hover:shadow-xl'
    }`}>
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/11] bg-gray-100 overflow-hidden cursor-pointer" onClick={onPreview}>
        <MiniTemplatePreview template={template} themeData={themeData} />

        {/* Active Badge on Top Left */}
        {isActive && (
          <div className="absolute top-3 left-3 z-20 px-3 py-1 bg-emerald-500 text-white rounded-full text-[11px] font-bold shadow-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Template Aktif</span>
          </div>
        )}

        {/* Category Pill Tag on Top Right */}
        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
          {template.category}
        </div>

        {/* Hover Overlay with Action Buttons */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 p-4 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="px-4 py-2.5 rounded-xl bg-white/90 text-gray-900 text-xs font-bold shadow-lg hover:bg-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pratinjau</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onUse(); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5 cursor-pointer ${
              isActive 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{isActive ? 'Gunakan' : 'Pilih Template'}</span>
          </button>
        </div>
      </div>

      {/* Info Row Below Thumbnail */}
      <div className="p-5 flex flex-col gap-3 flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {template.name}
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              {template.sectionCount} Seksi
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Design Traits Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {template.designTraits.map((trait, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-md">
              #{trait}
            </span>
          ))}
        </div>

        {/* Action Bar Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">
            Oleh MicroCMS
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onUse(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-900 text-white hover:bg-black shadow-xs'
            }`}
          >
            {isActive ? '✓ Aktif' : 'Gunakan'}
          </button>
        </div>
      </div>
    </div>
  );
};
