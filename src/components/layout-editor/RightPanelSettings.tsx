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
  const [activeTab, setActiveTab] = useState<'konten' | 'tampilan' | 'lanjutan'>('konten');
  const [showImagePresets, setShowImagePresets] = useState(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuHref, setNewMenuHref] = useState('');
  const [showAddMenuForm, setShowAddMenuForm] = useState(false);

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
                  className={`p-2 rounded-lg border flex items-center gap-2 transition cursor-pointer ${
                    primaryAccent === c.color
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    selectedSection.id === 'hero_banner' ||
    selectedSection.id === 'promo_banner' ||
    selectedSection.id === 'image_with_text' ||
    selectedSection.id === 'gallery' ||
    selectedSection.id === 'brand_philosophy' ||
    selectedSection.id === 'craftsmanship_story' ||
    selectedSection.id === 'lookbook' ||
    selectedSection.id === 'brand_story' ||
    selectedSection.id === 'ingredient_story' ||
    selectedSection.id === 'sustainability' ||
    selectedSection.id === 'latest_drop' ||
    selectedSection.id === 'floating_showcase';

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

        {/* Dynamic Segmented Tab Switcher */}
        <div className="flex items-center border-b-2 border-transparent">
          <button
            onClick={() => setActiveTab('konten')}
            className={`flex-1 pb-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'konten'
                ? 'text-[#202223] border-[#202223]'
                : 'text-[#8C9196] border-transparent hover:text-[#202223]'
            }`}
          >
            Konten
          </button>
          <button
            onClick={() => setActiveTab('tampilan')}
            className={`flex-1 pb-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'tampilan'
                ? 'text-[#202223] border-[#202223]'
                : 'text-[#8C9196] border-transparent hover:text-[#202223]'
            }`}
          >
            Tampilan
          </button>
          <button
            onClick={() => setActiveTab('lanjutan')}
            className={`flex-1 pb-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
              activeTab === 'lanjutan'
                ? 'text-[#202223] border-[#202223]'
                : 'text-[#8C9196] border-transparent hover:text-[#202223]'
            }`}
          >
            Lanjutan
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        
        {/* ========================================================================= */}
        {/* TAB 1: KONTEN */}
        {/* ========================================================================= */}
        {activeTab === 'konten' && (
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
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer truncate ${
                      showImagePresets ? 'border-[#202223] bg-[#202223] text-white' : 'border-[#E1E3E5] bg-white text-[#202223] hover:bg-[#F6F6F7]'
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
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition cursor-pointer truncate ${
                      showUrlInput ? 'border-[#202223] bg-[#202223] text-white' : 'border-[#E1E3E5] bg-white text-[#202223] hover:bg-[#F6F6F7]'
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
                    else if (selectedSection.id === 'featured_products') handleOptionChange({ featuredTitle: e.target.value });
                    else if (selectedSection.id === 'testimonials') handleOptionChange({ testimonialsTitle: e.target.value });
                    else if (selectedSection.id === 'newsletter') handleOptionChange({ newsletterTitle: e.target.value });
                    else handleOptionChange({ heading: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E1E3E5] text-[13px] text-[#202223] focus:border-[#2C6ECB] focus:ring-1 focus:ring-[#2C6ECB]"
                />
              </div>

              {(selectedSection.id === 'hero_banner' || selectedSection.id === 'promo_banner' || selectedSection.id === 'featured_products' || selectedSection.id === 'newsletter' || selectedSection.id === 'footer' || selectedSection.id === 'rich_text' || selectedSection.id === 'craftsmanship_story' || selectedSection.id === 'private_collection' || selectedSection.id === 'brand_story' || selectedSection.id === 'ingredient_story' || selectedSection.id === 'sustainability' || selectedSection.id === 'store_benefits' || selectedSection.id === 'community_board') && (
                <div className="space-y-1">
                  <label className="text-[12px] font-bold text-[#202223]">
                    {selectedSection.id === 'footer' ? 'Teks Footer' : 'Deskripsi'}
                  </label>
                  <textarea
                    rows={3}
                    value={selectedSection.id === 'footer' ? opts.copyrightText || '' : opts.subheading || opts.description || opts.featuredSubtitle || opts.newsletterSubtitle || ''}
                    onChange={(e) => {
                      if (selectedSection.id === 'featured_products') handleOptionChange({ featuredSubtitle: e.target.value });
                      else if (selectedSection.id === 'newsletter') handleOptionChange({ newsletterSubtitle: e.target.value });
                      else if (selectedSection.id === 'footer') handleOptionChange({ copyrightText: e.target.value });
                      else handleOptionChange({ subheading: e.target.value, description: e.target.value });
                    }}
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

            {/* ── BUTTONS / CTA ── */}
            {(selectedSection.id === 'hero_banner' || selectedSection.id === 'promo_banner' || selectedSection.id === 'newsletter' || selectedSection.id === 'signature_collection' || selectedSection.id === 'craftsmanship_story' || selectedSection.id === 'private_collection' || selectedSection.id === 'innovation_cta' || selectedSection.id === 'limited_release' || selectedSection.id === 'community_board' || selectedSection.id === 'latest_drop' || selectedSection.id === 'asymmetric_showcase') && (
              <div className="space-y-2 pt-4 border-t border-[#E1E3E5]">
                <label className="text-[12px] font-bold text-[#202223]">Tombol Utama</label>
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TAMPILAN */}
        {/* ========================================================================= */}
        {activeTab === 'tampilan' && (
          <div className="space-y-5">
            {/* Layout & Alignment */}
            <div className="space-y-2.5">
              <label className="text-[12px] font-bold text-[#202223]">Perataan Teks</label>
              <div className="flex bg-[#F6F6F7] p-1 rounded-lg border border-[#E1E3E5]">
                {[
                  { id: 'left', icon: AlignLeft, label: 'Kiri' },
                  { id: 'center', icon: AlignCenter, label: 'Tengah' },
                  { id: 'right', icon: AlignRight, label: 'Kanan' },
                ].map(align => (
                  <button
                    key={align.id}
                    onClick={() => handleOptionChange({ textAlignment: align.id as any })}
                    className={`flex-1 py-1.5 flex items-center justify-center rounded-md transition ${
                      (opts.textAlignment || 'left') === align.id
                        ? 'bg-white shadow-sm font-semibold'
                        : 'text-[#6D7175] hover:text-[#202223]'
                    }`}
                  >
                    <align.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Scheme/Background Color */}
            <div className="space-y-2.5">
              <label className="text-[12px] font-bold text-[#202223]">Skema Warna</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'scheme-1', label: 'Latar Putih', bg: 'bg-white border-[#E1E3E5]', text: 'text-black' },
                  { id: 'scheme-2', label: 'Latar Terang', bg: 'bg-[#F6F6F7] border-[#E1E3E5]', text: 'text-black' },
                  { id: 'scheme-3', label: 'Latar Gelap', bg: 'bg-[#1A1A1A] border-[#1A1A1A]', text: 'text-white' },
                  { id: 'scheme-4', label: 'Warna Aksen', bg: 'bg-[#2C6ECB] border-[#2C6ECB]', text: 'text-white' },
                ].map(scheme => (
                  <button
                    key={scheme.id}
                    onClick={() => handleOptionChange({ colorScheme: scheme.id as any })}
                    className={`p-2 rounded-lg border-2 flex flex-col items-start gap-1 transition ${
                      (opts.colorScheme || 'scheme-1') === scheme.id
                        ? 'border-[#202223] shadow-sm'
                        : 'border-transparent hover:border-[#E1E3E5]'
                    } ${scheme.bg} shadow-xs border`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`w-3 h-3 rounded-full ${scheme.text === 'text-white' ? 'bg-white' : 'bg-black'} opacity-20`}></span>
                      {(opts.colorScheme || 'scheme-1') === scheme.id && <Check className={`w-3 h-3 ${scheme.text}`} />}
                    </div>
                    <span className={`text-[10px] font-semibold ${scheme.text}`}>{scheme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay Opacity for Images */}
            {hasImage && (
              <div className="space-y-2.5 pt-4 border-t border-[#E1E3E5]">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-bold text-[#202223]">Opasitas Overlay Gambar</label>
                  <span className="text-[11px] font-semibold text-[#6D7175]">{opts.overlayOpacity || 50}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={opts.overlayOpacity || 50}
                  onChange={(e) => handleOptionChange({ overlayOpacity: parseInt(e.target.value) })}
                  className="w-full h-1 bg-[#E1E3E5] rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-[#8C9196]">Meningkatkan opasitas akan menggelapkan gambar agar teks lebih terbaca.</p>
              </div>
            )}
            
            {/* Products Layout */}
            {(selectedSection.id === 'featured_products' || selectedSection.id === 'product_grid') && (
              <div className="space-y-2.5 pt-4 border-t border-[#E1E3E5]">
                <label className="text-[12px] font-bold text-[#202223]">Jumlah Kolom (Desktop)</label>
                <div className="flex gap-2">
                  {[2, 3, 4].map(cols => (
                    <button
                      key={cols}
                      onClick={() => handleOptionChange({ gridColumns: cols as any })}
                      className={`flex-1 py-1.5 rounded-lg border text-[12px] font-semibold transition ${
                        (opts.gridColumns || 3) === cols
                          ? 'border-[#202223] bg-[#202223] text-white'
                          : 'border-[#E1E3E5] bg-white text-[#6D7175] hover:bg-[#F6F6F7]'
                      }`}
                    >
                      {cols} Kolom
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: LANJUTAN */}
        {/* ========================================================================= */}
        {activeTab === 'lanjutan' && (
          <div className="space-y-5">
            {/* Padding Controls */}
            <div className="space-y-3">
              <label className="text-[12px] font-bold text-[#202223]">Jarak Bagian (Padding)</label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] text-[#6D7175]">Jarak Atas (px)</label>
                  <input
                    type="number"
                    value={opts.paddingTop ?? ''}
                    onChange={(e) => handleOptionChange({ paddingTop: parseInt(e.target.value) || 0 })}
                    placeholder="Auto"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E1E3E5] text-[13px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-[#6D7175]">Jarak Bawah (px)</label>
                  <input
                    type="number"
                    value={opts.paddingBottom ?? ''}
                    onChange={(e) => handleOptionChange({ paddingBottom: parseInt(e.target.value) || 0 })}
                    placeholder="Auto"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E1E3E5] text-[13px]"
                  />
                </div>
              </div>
            </div>

            {/* Layout Options */}
            <div className="space-y-2 pt-4 border-t border-[#E1E3E5]">
              <label className="text-[12px] font-bold text-[#202223]">Opsi Tata Letak</label>
              
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#F6F6F7]">
                <input
                  type="checkbox"
                  checked={opts.enableContainer !== false}
                  onChange={(e) => handleOptionChange({ enableContainer: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E1E3E5] text-[#202223] focus:ring-[#202223]"
                />
                <span className="text-[12px] text-[#202223]">Gunakan Container Lebar Maksimal</span>
              </label>
              
              {hasImage && (
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#F6F6F7]">
                  <input
                    type="checkbox"
                    checked={opts.mobileStackImages !== false}
                    onChange={(e) => handleOptionChange({ mobileStackImages: e.target.checked })}
                    className="w-4 h-4 rounded border-[#E1E3E5] text-[#202223] focus:ring-[#202223]"
                  />
                  <span className="text-[12px] text-[#202223]">Susun Gambar Vertikal di Mobile</span>
                </label>
              )}
            </div>

            {/* Custom CSS */}
            <div className="space-y-2 pt-4 border-t border-[#E1E3E5]">
              <label className="text-[12px] font-bold text-[#202223] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                CSS Kustom (Opsional)
              </label>
              <textarea
                rows={4}
                value={opts.customCss || ''}
                onChange={(e) => handleOptionChange({ customCss: e.target.value })}
                placeholder=".section-container { ... }"
                className="w-full px-3 py-2 rounded-lg bg-[#1A1A1A] text-[#E1E3E5] font-mono text-[11px] border border-[#E1E3E5] focus:outline-none focus:border-[#2C6ECB]"
                spellCheck={false}
              />
              <p className="text-[10px] text-[#8C9196]">Tambahkan CSS class Tailwind tambahan atau kustom CSS.</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
