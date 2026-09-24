import React, { useState, useRef } from 'react';
import {
  Sliders,
  Type,
  Image as ImageIcon,
  LayoutGrid,
  Sparkles,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Palette,
  Check,
  Plus,
  X,
  Smartphone,
  Code2,
  FolderOpen,
  Paintbrush,
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Upload,
} from 'lucide-react';
import { Store, StoreSectionConfig, StoreSectionOptions } from '../../types';
import { CURATED_BANNER_PRESETS, DEFAULT_LANDING_NAV_ITEMS } from '../../utils/layoutConstants';
import { GlobalThemeSettingsPanel } from './GlobalThemeSettingsPanel';
import { useCmsStore } from '../../cms/useCmsStore';

interface RightPanelSettingsProps {
  store: Store;
  selectedSection: StoreSectionConfig | null;
  onUpdateSectionOptions: (key: string, newOptions: Partial<StoreSectionOptions>) => void;
  onUpdateSectionTitle: (key: string, newTitle: string) => void;
  onToggleVisibility: (key: string) => void;
  onDuplicateSection: (key: string) => void;
  onDeleteSection: (key: string) => void;
  primaryAccent: string;
  onChangePrimaryAccent: (color: string) => void;
  onBack?: () => void;
  globalSettings?: any;
  onUpdateGlobalSettings?: (newSettings: any) => void;
  showGlobalSettings?: boolean;
}

export const RightPanelSettings: React.FC<RightPanelSettingsProps> = ({
  store,
  selectedSection,
  onUpdateSectionOptions,
  onToggleVisibility,
  onDuplicateSection,
  onDeleteSection,
  primaryAccent,
  onChangePrimaryAccent,
  onBack,
  globalSettings,
  onUpdateGlobalSettings,
  showGlobalSettings,
}) => {
  const cmsProducts = useCmsStore(state => state.products);
  const updateProduct = useCmsStore(state => state.updateProduct);
  const [showImagePresets, setShowImagePresets] = useState(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuHref, setNewMenuHref] = useState('');
  const [showAddMenuForm, setShowAddMenuForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If no section is selected, show Global Theme Settings
  if (!selectedSection || showGlobalSettings) {
    if (showGlobalSettings && globalSettings && onUpdateGlobalSettings) {
      return (
        <GlobalThemeSettingsPanel
          settings={globalSettings}
          onUpdate={onUpdateGlobalSettings}
          onClose={onBack}
        />
      );
    }

    // Fallback if no specific panel is created yet
    return (
      <aside className="w-full lg:w-[320px] bg-white border-l border-[#E1E3E5] flex flex-col h-full shrink-0 font-sans select-none shadow-2xs">
        <div className="p-3 border-b border-[#E1E3E5] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded flex items-center justify-center bg-[#F1F8FF] text-[#2C6ECB]">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-[13px] font-bold text-[#202223]">Pengaturan Tema</h2>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Brand Accent Color */}
          <div className="space-y-2.5">
            <label className="text-[13px] font-bold text-[#202223] flex items-center gap-1.5">
              <Paintbrush className="w-3.5 h-3.5" />
              Aksen Warna Utama
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Biru (Default)', color: '#2C6ECB' },
                { name: 'Maroon', color: '#66000E' },
                { name: 'Emerald', color: '#027A48' },
                { name: 'Amber', color: '#B54708' },
                { name: 'Hitam', color: '#1A1A1A' },
                { name: 'Ungu', color: '#7C3AED' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => onChangePrimaryAccent(c.color)}
                  className={`p-2 rounded-lg border flex items-center gap-2 transition cursor-pointer ${primaryAccent === c.color
                      ? 'border-[#2C6ECB] bg-[#F1F8FF] shadow-xs'
                      : 'border-[#E1E3E5] bg-white hover:bg-[#F6F6F7]'
                    }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: c.color }}
                  >
                    {primaryAccent === c.color && <Check className="w-2.5 h-2.5" />}
                  </span>
                  <span className="text-[11px] font-semibold text-[#202223]">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2.5 pt-4 border-t border-[#E1E3E5]">
            <label className="text-[13px] font-bold text-[#202223] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              Tipografi
            </label>
            <div className="p-3 rounded-xl bg-[#F6F6F7] border border-[#E1E3E5] text-center">
              <p className="text-[11px] text-[#8C9196]">Tipografi diatur secara global pada level tema.</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F1F8FF] border border-[#BAE0FF] flex gap-2">
            <Sparkles className="w-4 h-4 text-[#2C6ECB] shrink-0 mt-0.5" />
            <span className="text-[11px] text-[#202223] leading-relaxed">
              Pilih sebuah section dari panel kiri atau klik di kanvas untuk menyesuaikan konten spesifik.
            </span>
          </div>
        </div>
      </aside>
    );
  }

  const sectionKey = selectedSection.key || `${selectedSection.id}-0`;
  const opts = selectedSection.options || {};

  const handleOptionChange = (newOpts: Partial<StoreSectionOptions>) => {
    onUpdateSectionOptions(sectionKey, newOpts);
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          handleOptionChange({ imageUrl: dataUrl, bannerUrl: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const hasImage =
    Boolean(opts.imageUrl || opts.bannerUrl) ||
    [
      'hero_banner',
      'promo_banner',
      'image_with_text',
      'gallery',
      'brand_philosophy',
      'craftsmanship_story',
      'lookbook',
      'brand_story',
      'ingredient_story',
      'sustainability',
      'latest_drop',
      'floating_showcase',
      'signature_collection',
      'private_collection',
      'asymmetric_showcase',
      'tech_features',
      'innovation_cta',
      'journal',
    ].includes(selectedSection.id);

  const currentImageUrl =
    opts.imageUrl ||
    opts.bannerUrl ||
    (selectedSection.id === 'hero_banner'
      ? store.bannerUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80'
      : '');

  return (
    <aside className="w-full lg:w-[320px] bg-white border-l border-[#E1E3E5] flex flex-col h-full shrink-0 font-sans shadow-2xs select-none">
      {/* 1. COMPACT SECTION HEADER WITH BACK BUTTON */}
      <div className="px-3 pt-3 pb-0 border-b border-[#E1E3E5] bg-white shrink-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center min-w-0 gap-1.5">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1 rounded text-[#8C9196] hover:text-[#202223] hover:bg-[#F6F6F7] transition cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-[13px] font-bold text-[#202223] truncate">
              {selectedSection.title || selectedSection.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onDuplicateSection(sectionKey)}
              className="p-1.5 rounded text-[#8C9196] hover:text-[#202223] hover:bg-[#F6F6F7] transition cursor-pointer"
              title="Duplikasi"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteSection(sectionKey)}
              className="p-1.5 rounded text-[#8C9196] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Hapus"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 2. CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="space-y-4">

            {/* ── IMAGE SECTION ── */}
            {hasImage && (
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#202223]">Gambar Utama</label>

                {currentImageUrl ? (
                  <div className="relative rounded-lg overflow-hidden aspect-video border border-[#E1E3E5] bg-[#F6F6F7]">
                    <img
                      src={currentImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <button
                        onClick={() => handleOptionChange({ imageUrl: '', bannerUrl: '' })}
                        className="p-2 bg-white rounded-full text-red-600 hover:scale-105 transition cursor-pointer"
                        title="Hapus Gambar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-lg border-2 border-dashed border-[#E1E3E5] bg-[#F6F6F7] hover:bg-[#F1F8FF] hover:border-[#2C6ECB] transition cursor-pointer flex flex-col items-center justify-center gap-2 p-3 text-center"
                  >
                    <Upload className="w-6 h-6 text-[#2C6ECB]" />
                    <span className="text-[11px] font-bold text-[#2C6ECB]">Upload Foto dari Perangkat / Galeri</span>
                    <span className="text-[10px] text-[#8C9196]">Atau klik tombol Upload di bawah</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLocalFileUpload}
                  className="hidden"
                />

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-1.5 px-2 rounded-lg border border-[#2C6ECB] bg-[#F1F8FF] text-[11px] font-bold text-[#2C6ECB] hover:bg-[#BAE0FF]/40 transition cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    title="Upload gambar dari galeri HP atau komputer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImagePresets(!showImagePresets);
                      setShowUrlInput(false);
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer truncate ${showImagePresets ? 'border-[#202223] bg-[#202223] text-white' : 'border-[#E1E3E5] bg-white text-[#202223] hover:bg-[#F6F6F7]'
                      }`}
                  >
                    Pilih Galeri
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUrlInput(!showUrlInput);
                      setShowImagePresets(false);
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer truncate ${showUrlInput ? 'border-[#202223] bg-[#202223] text-white' : 'border-[#E1E3E5] bg-white text-[#202223] hover:bg-[#F6F6F7]'
                      }`}
                  >
                    Input URL
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="url"
                      value={customImageUrlInput}
                      onChange={(e) => setCustomImageUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#E1E3E5] text-[12px] focus:border-[#2C6ECB] focus:ring-1 focus:ring-[#2C6ECB]"
                    />
                    <button
                      onClick={() => {
                        if (customImageUrlInput.trim()) {
                          handleOptionChange({ imageUrl: customImageUrlInput.trim(), bannerUrl: customImageUrlInput.trim() });
                          setShowUrlInput(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#202223] text-white font-semibold rounded-lg text-[12px] cursor-pointer"
                    >
                      Ok
                    </button>
                  </div>
                )}

                {showImagePresets && (
                  <div className="space-y-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-[#2C6ECB]/40 bg-[#F1F8FF] hover:bg-[#2C6ECB]/10 text-[11px] font-bold text-[#2C6ECB] flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>+ Upload Foto Sendiri dari Perangkat</span>
                    </button>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                      {CURATED_BANNER_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            handleOptionChange({ imageUrl: preset.url, bannerUrl: preset.url });
                            setShowImagePresets(false);
                          }}
                          className="group relative rounded-lg overflow-hidden aspect-video border border-[#E1E3E5] hover:border-[#2C6ECB] transition cursor-pointer"
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TEXT CONTENT ── */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-[#202223]">Teks Judul</label>
                <input
                  type="text"
                  value={opts.heading || opts.featuredTitle || opts.announcementText || opts.testimonialsTitle || opts.newsletterTitle || ''}
                  onChange={(e) => {
                    if (selectedSection.id === 'announcement') handleOptionChange({ announcementText: e.target.value });
                    else if (selectedSection.id === 'featured_products') handleOptionChange({ featuredTitle: e.target.value, heading: e.target.value });
                    else if (selectedSection.id === 'testimonials') handleOptionChange({ testimonialsTitle: e.target.value, heading: e.target.value });
                    else if (selectedSection.id === 'newsletter') handleOptionChange({ newsletterTitle: e.target.value, heading: e.target.value });
                    else handleOptionChange({ heading: e.target.value });
                  }}
                  placeholder={selectedSection.title || 'Teks Judul...'}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E1E3E5] text-[13px] text-[#202223] focus:border-[#2C6ECB] focus:ring-1 focus:ring-[#2C6ECB]"
                />
              </div>

              {selectedSection.id !== 'announcement' && selectedSection.id !== 'search_category' && (
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#202223]">
                    {selectedSection.id === 'footer'
                      ? 'Teks Footer / Hak Cipta'
                      : selectedSection.id === 'brand_philosophy'
                      ? 'Isi Teks Filosofi'
                      : 'Deskripsi / Subjudul'}
                  </label>
                  <textarea
                    rows={selectedSection.id === 'brand_philosophy' ? 4 : 3}
                    value={
                      selectedSection.id === 'footer'
                        ? opts.copyrightText || ''
                        : opts.description || opts.subheading || opts.featuredSubtitle || opts.newsletterSubtitle || (opts as any).content || ''
                    }
                    onChange={(e) => {
                      if (selectedSection.id === 'featured_products') handleOptionChange({ featuredSubtitle: e.target.value, subheading: e.target.value });
                      else if (selectedSection.id === 'newsletter') handleOptionChange({ newsletterSubtitle: e.target.value });
                      else if (selectedSection.id === 'footer') handleOptionChange({ copyrightText: e.target.value });
                      else handleOptionChange({ subheading: e.target.value, description: e.target.value, content: e.target.value });
                    }}
                    placeholder={selectedSection.id === 'brand_philosophy' ? 'Tuliskan filosofi, visi atau kisah brand Anda...' : 'Deskripsi konten bagian ini...'}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E1E3E5] text-[13px] text-[#202223] focus:border-[#2C6ECB] focus:ring-1 focus:ring-[#2C6ECB]"
                  />
                </div>
              )}

              {(selectedSection.id === 'hero_banner' || selectedSection.id === 'promo_banner' || selectedSection.id === 'newsletter') && (
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#202223]">Label Badge</label>
                  <input
                    type="text"
                    value={opts.badgeText || opts.discountBadge || opts.incentiveBadge || ''}
                    onChange={(e) => {
                      if (selectedSection.id === 'promo_banner') handleOptionChange({ discountBadge: e.target.value });
                      else if (selectedSection.id === 'newsletter') handleOptionChange({ incentiveBadge: e.target.value });
                      else handleOptionChange({ badgeText: e.target.value });
                    }}
                    placeholder="Contoh: PROMO SPESIAL"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E1E3E5] text-[13px] text-[#202223] focus:border-[#2C6ECB]"
                  />
                </div>
              )}
            </div>

            {/* ── COLLECTION GRID SPECIFIC SETTINGS ── */}
            {selectedSection.id === 'collection_grid' && (
              <div className="space-y-3 pt-4 border-t border-[#E1E3E5]">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#202223]">Jumlah Kolom Tampilan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => handleOptionChange({ gridColumns: cols })}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          (opts.gridColumns || 3) === cols
                            ? 'border-[#2C6ECB] bg-[#F1F8FF] text-[#2C6ECB]'
                            : 'border-[#E1E3E5] bg-white text-[#202223] hover:bg-[#F6F6F7]'
                        }`}
                      >
                        {cols} Kolom
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── BUTTONS / CTA ── */}
            {(selectedSection.id === 'hero_banner' || selectedSection.id === 'promo_banner' || selectedSection.id === 'newsletter' || selectedSection.id === 'signature_collection' || selectedSection.id === 'craftsmanship_story' || selectedSection.id === 'private_collection' || selectedSection.id === 'innovation_cta' || selectedSection.id === 'limited_release' || selectedSection.id === 'community_board' || selectedSection.id === 'latest_drop' || selectedSection.id === 'asymmetric_showcase' || selectedSection.id === 'collection_grid' || selectedSection.id === 'lookbook' || selectedSection.id === 'tech_features' || selectedSection.id === 'floating_showcase') && (
              <div className="space-y-2 pt-4 border-t border-[#E1E3E5]">
                <label className="text-[12px] font-bold text-[#202223]">Tombol Utama / Aksi</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={opts.buttonLabel || opts.buttonText || ''}
                    onChange={(e) => handleOptionChange({ buttonLabel: e.target.value, buttonText: e.target.value })}
                    placeholder="Teks Tombol"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E1E3E5] text-[13px]"
                  />
                  <input
                    type="text"
                    value={opts.buttonLink || '#'}
                    onChange={(e) => handleOptionChange({ buttonLink: e.target.value })}
                    placeholder="Link Tujuan (URL atau #id)"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E1E3E5] text-[13px]"
                  />
                </div>

                {selectedSection.id === 'hero_banner' && (
                  <div className="pt-3 space-y-2">
                    <label className="text-[12px] font-bold text-[#202223]">Tombol Sekunder</label>
                    <input
                      type="text"
                      value={opts.secondaryButtonLabel || ''}
                      onChange={(e) => handleOptionChange({ secondaryButtonLabel: e.target.value })}
                      placeholder="Teks Tombol Kedua"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E1E3E5] text-[13px]"
                    />
                    <input
                      type="text"
                      value={opts.secondaryButtonLink || '#'}
                      onChange={(e) => handleOptionChange({ secondaryButtonLink: e.target.value })}
                      placeholder="Link Tujuan (URL atau #id)"
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E1E3E5] text-[13px]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── HEADER / NAVBAR SPECIFIC SETTINGS ── */}
            {selectedSection.id === 'header' && (
              <div className="space-y-4 pt-4 border-t border-[#E1E3E5]">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#202223]">Pengaturan Header & Logo</label>
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded bg-[#F6F6F7] hover:bg-[#EAEAEA]">
                    <span className="text-[12px] text-[#202223]">Tampilkan Logo</span>
                    <input
                      type="checkbox"
                      checked={opts.showLogo !== false}
                      onChange={(e) => handleOptionChange({ showLogo: e.target.checked })}
                      className="w-4 h-4 rounded text-[#202223]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded bg-[#F6F6F7] hover:bg-[#EAEAEA]">
                    <span className="text-[12px] text-[#202223]">Header Sticky / Melayang</span>
                    <input
                      type="checkbox"
                      checked={opts.stickyHeader !== false}
                      onChange={(e) => handleOptionChange({ stickyHeader: e.target.checked })}
                      className="w-4 h-4 rounded text-[#202223]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded bg-[#F6F6F7] hover:bg-[#EAEAEA]">
                    <span className="text-[12px] text-[#202223]">Bar Pencarian Produk</span>
                    <input
                      type="checkbox"
                      checked={opts.showSearchBar !== false}
                      onChange={(e) => handleOptionChange({ showSearchBar: e.target.checked })}
                      className="w-4 h-4 rounded text-[#202223]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded bg-[#F6F6F7] hover:bg-[#EAEAEA]">
                    <span className="text-[12px] text-[#202223]">Icon Keranjang Belanja</span>
                    <input
                      type="checkbox"
                      checked={opts.showCartBadge !== false}
                      onChange={(e) => handleOptionChange({ showCartBadge: e.target.checked })}
                      className="w-4 h-4 rounded text-[#202223]"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded bg-[#F6F6F7] hover:bg-[#EAEAEA]">
                    <span className="text-[12px] text-[#202223]">Tombol Kontak WhatsApp</span>
                    <input
                      type="checkbox"
                      checked={opts.showWhatsAppButton !== false}
                      onChange={(e) => handleOptionChange({ showWhatsAppButton: e.target.checked })}
                      className="w-4 h-4 rounded text-[#202223]"
                    />
                  </label>
                </div>

                {/* Navigation Menu Editor */}
                <div className="space-y-2 pt-3 border-t border-[#E1E3E5]">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-bold text-[#202223]">Menu Navigasi</label>
                    <button
                      type="button"
                      onClick={() => setShowAddMenuForm(!showAddMenuForm)}
                      className="text-[11px] font-bold text-[#2C6ECB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Menu
                    </button>
                  </div>

                  {showAddMenuForm && (
                    <div className="p-2.5 bg-[#F1F8FF] border border-[#BAE0FF] rounded-lg space-y-2">
                      <input
                        type="text"
                        placeholder="Nama Menu (mis: Katalog)"
                        value={newMenuLabel}
                        onChange={(e) => setNewMenuLabel(e.target.value)}
                        className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#E1E3E5] rounded"
                      />
                      <input
                        type="text"
                        placeholder="Link Tujuan (mis: #katalog atau /produk)"
                        value={newMenuHref}
                        onChange={(e) => setNewMenuHref(e.target.value)}
                        className="w-full px-2.5 py-1 text-[12px] bg-white border border-[#E1E3E5] rounded"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowAddMenuForm(false)}
                          className="px-2.5 py-1 text-[11px] border border-[#E1E3E5] bg-white rounded"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (newMenuLabel.trim()) {
                              const currentItems = opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS;
                              const updatedItems = [
                                ...currentItems,
                                { id: `nav-${Date.now()}`, label: newMenuLabel.trim(), href: newMenuHref.trim() || '#' }
                              ];
                              handleOptionChange({ navMenuItems: updatedItems });
                              setNewMenuLabel('');
                              setNewMenuHref('');
                              setShowAddMenuForm(false);
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-[#202223] text-white rounded"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {(opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS).map((item: any, idx: number) => (
                      <div key={item.id || idx} className="flex items-center justify-between p-2 rounded border border-[#E1E3E5] bg-white text-[12px]">
                        <span className="font-semibold text-[#202223] truncate">{item.label}</span>
                        <span className="text-[10px] text-[#8C9196] truncate max-w-[80px]">{item.href}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const currentItems = opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS;
                            const updatedItems = currentItems.filter((_: any, i: number) => i !== idx);
                            handleOptionChange({ navMenuItems: updatedItems });
                          }}
                          className="text-red-500 hover:text-red-700 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── KATALOG PRODUK / FEATURED PRODUCTS SPECIFIC SETTINGS (TAB KONTEN) ── */}
            {(selectedSection.id === 'featured_products' || selectedSection.id === 'product_grid') && (
              <div className="space-y-4 pt-4 border-t border-[#E1E3E5]">
                {/* Filter Kategori */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#202223]">Filter Kategori Produk</label>
                  <select
                    value={opts.selectedCategoryId || 'all'}
                    onChange={(e) => handleOptionChange({ selectedCategoryId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E1E3E5] text-[13px] text-[#202223] focus:border-[#2C6ECB]"
                  >
                    <option value="all">Semua Kategori Produk</option>
                    {Array.from(new Set(cmsProducts.map(p => (p as any).category || p.categoryName).filter(Boolean))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Jumlah Produk Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-bold text-[#202223]">Jumlah Produk Ditampilkan</label>
                    <span className="text-[11px] font-bold text-[#2C6ECB] bg-[#F1F8FF] px-2 py-0.5 rounded">
                      {opts.productCount || 4} Produk
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={opts.productCount || 4}
                    onChange={(e) => handleOptionChange({ productCount: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-[#E1E3E5] rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Urutan Produk */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#202223]">Urutan Produk</label>
                  <select
                    value={opts.sortOrder || 'default'}
                    onChange={(e) => handleOptionChange({ sortOrder: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E1E3E5] text-[13px] text-[#202223] focus:border-[#2C6ECB]"
                  >
                    <option value="default">Default (Sesuai Urutan Store)</option>
                    <option value="price-asc">Harga: Termurah ke Termahal</option>
                    <option value="price-desc">Harga: Termahal ke Termurah</option>
                    <option value="name-asc">Nama Produk: A - Z</option>
                    <option value="newest">Produk Terbaru</option>
                  </select>
                </div>

                {/* Manual Product Selection (Pick Specific Products) */}
                <div className="space-y-2 pt-3 border-t border-[#E1E3E5]">
                  <label className="text-[12px] font-bold text-[#202223]">Pilih Produk Spesifik (Manual)</label>
                  <p className="text-[10px] text-[#8C9196]">Centang produk yang ingin ditampilkan khusus pada section ini:</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar p-2 bg-[#F6F6F7] border border-[#E1E3E5] rounded-lg">
                    {cmsProducts.map(product => {
                      const selectedIds = opts.selectedProductIds || [];
                      const isChecked = selectedIds.length === 0 || selectedIds.includes(product.id);
                      return (
                        <label key={product.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-white transition cursor-pointer text-[11px] text-[#202223]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let newIds = [...(opts.selectedProductIds || cmsProducts.map(p => p.id))];
                              if (e.target.checked) {
                                if (!newIds.includes(product.id)) newIds.push(product.id);
                              } else {
                                newIds = newIds.filter(id => id !== product.id);
                              }
                              handleOptionChange({ selectedProductIds: newIds });
                            }}
                            className="w-3.5 h-3.5 rounded text-[#202223]"
                          />
                          <span className="truncate flex-1 font-medium">{product.name}</span>
                          <span className="text-[#8C9196] font-mono shrink-0">Rp {product.price.toLocaleString('id-ID')}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Data Produk Direct Editor */}
                <div className="space-y-3 pt-4 border-t border-[#E1E3E5]">
                  <div className="flex items-center justify-between">
                    <label className="text-[12px] font-bold text-[#202223]">Data Produk (Edit Teks & Gambar)</label>
                    <span className="text-[10px] text-[#2C6ECB] bg-[#F1F8FF] px-2 py-0.5 rounded font-semibold">Real-time CMS</span>
                  </div>
                  <div className="space-y-3 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                    {cmsProducts.map(product => (
                      <div key={product.id} className="p-3 bg-[#F6F6F7] border border-[#E1E3E5] rounded-lg space-y-2">
                        <div className="flex gap-2">
                          <div className="relative group w-12 h-12 shrink-0 cursor-pointer">
                            <img
                              src={product.image || 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=300'}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md border border-[#E1E3E5]"
                              referrerPolicy="no-referrer"
                            />
                            <label
                              htmlFor={`product-img-upload-${product.id}`}
                              className="absolute inset-0 bg-black/50 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                              title="Ganti Foto dari Perangkat"
                            >
                              <Upload className="w-4 h-4" />
                            </label>
                          </div>

                          <div className="flex-1 space-y-1.5 min-w-0">
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => updateProduct({ ...product, name: e.target.value })}
                              className="w-full px-2 py-1 text-[12px] font-semibold text-[#202223] bg-white border border-[#E1E3E5] rounded-md focus:border-[#2C6ECB]"
                              placeholder="Nama Produk"
                            />
                            <input
                              type="number"
                              value={product.price}
                              onChange={(e) => updateProduct({ ...product, price: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-[12px] text-[#202223] bg-white border border-[#E1E3E5] rounded-md focus:border-[#2C6ECB]"
                              placeholder="Harga"
                            />
                          </div>
                        </div>

                        {/* Upload Button + URL Input Combo */}
                        <div className="flex items-center gap-1.5">
                          <label
                            htmlFor={`product-img-upload-${product.id}`}
                            className="py-1 px-2 rounded border border-[#2C6ECB] bg-[#F1F8FF] text-[11px] font-bold text-[#2C6ECB] hover:bg-[#BAE0FF]/40 transition cursor-pointer flex items-center gap-1 shrink-0"
                            title="Upload foto dari galeri HP atau komputer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Foto</span>
                          </label>

                          <input
                            type="file"
                            id={`product-img-upload-${product.id}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const dataUrl = event.target?.result as string;
                                  if (dataUrl) {
                                    updateProduct({ ...product, image: dataUrl } as any);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />

                          <input
                            type="text"
                            value={product.image || ''}
                            onChange={(e) => updateProduct({ ...product, image: e.target.value } as any)}
                            className="flex-1 min-w-0 px-2 py-1 text-[11px] text-[#6D7175] bg-white border border-[#E1E3E5] rounded-md focus:border-[#2C6ECB]"
                            placeholder="Atau Tempel URL Gambar"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </aside>
  );
};
