import React, { useState, useMemo } from 'react';
import { Store, Product } from '../../types';
import { Breadcrumb } from '../common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';
import { Search, X, Palette, Layers, Settings2 } from 'lucide-react';
import {
  TEMPLATE_CATEGORIES,
  TemplateGalleryItem,
  TEMPLATE_GALLERY_ITEMS,
} from './themeGalleryData';
import { TemplateCard } from './ThemeCard';

// Re-export for compatibility with LayoutPage and other consumers
export { TEMPLATE_CATEGORIES, TEMPLATE_GALLERY_ITEMS };
export type { TemplateGalleryItem };

// ─── Props ───────────────────────────────────────────────────────────
interface ThemeLibraryViewProps {
  store: Store;
  products: Product[];
  onCustomize: () => void;
  onSelectTheme: (themeId: string) => void;
  onPreviewTheme?: (themeId: string) => void;
  onApplyTemplate?: (template: TemplateGalleryItem) => void;
  onPreviewTemplate?: (template: TemplateGalleryItem) => void;
  onNavigateDashboard?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────
export const ThemeLibraryView: React.FC<ThemeLibraryViewProps> = ({
  store,
  onCustomize,
  onSelectTheme,
  onApplyTemplate,
  onPreviewTemplate,
  onNavigateDashboard,
}) => {
  const { t } = useLanguage();
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
    <div className="w-full h-full bg-[#FAF7F7] overflow-y-auto custom-scrollbar font-poppins">
      <div className="p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto space-y-3.5 sm:space-y-5 text-left">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
            { label: t('nav_template_website', 'Template Website'), isActive: true },
          ]}
        />

        {/* Page Header */}
        <div className="pb-3 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-[#66000E]" />
              <span>{t('nav_template_website', 'Template Website')}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            {currentTemplateId && (
              <button
                type="button"
                onClick={onCustomize}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#9A0602] hover:bg-[#7D0502] transition-colors shadow-2xs flex items-center gap-2 cursor-pointer"
              >
                <Settings2 className="w-4 h-4" />
                <span>Edit Template Aktif</span>
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#555555] shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-[#66000E]" />
              <span>{TEMPLATE_GALLERY_ITEMS.length} Template</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#EAEAEA] shadow-2xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari template berdasarkan nama, kategori, atau gaya desain..."
              className="w-full pl-9 pr-8 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] text-xs sm:text-sm text-[#1F1F1F] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#9A0602]/20 focus:border-[#9A0602] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#777777] hover:text-[#1F1F1F] hover:bg-[#EAEAEA] cursor-pointer transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === 'all'
                ? TEMPLATE_GALLERY_ITEMS.length
                : TEMPLATE_GALLERY_ITEMS.filter((t) => t.categories.includes(cat.id)).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#9A0602] to-[#B91C1C] text-white border-transparent shadow-md shadow-[#9A0602]/20'
                    : 'bg-white text-[#555555] border-[#EAEAEA] hover:border-[#9A0602]/40 hover:text-[#9A0602] shadow-2xs'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#777777]'}`} />
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-[#F4F4F5] text-[#555555] border-[#E4E4E7]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Template Grid */}
        <div>
          {filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EAEAEA] p-10 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-[#FFF1F0] text-[#9A0602] flex items-center justify-center mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-[#1F1F1F]">Tidak ada template ditemukan</h3>
              <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-sm">
                Coba ubah kata kunci pencarian atau pilih kategori lain.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-white text-[#1F1F1F] text-xs font-semibold border border-[#EAEAEA] hover:bg-[#FAF7F7] transition cursor-pointer shadow-2xs"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
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
      </div>
    </div>
  );
};
