import React, { useState } from 'react';
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
} from 'lucide-react';
import { Store, StoreSectionConfig, StoreSectionOptions } from '../../types';
import { CURATED_BANNER_PRESETS, DEFAULT_LANDING_NAV_ITEMS } from '../../utils/layoutConstants';

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
}) => {
  const [activeTab, setActiveTab] = useState<'konten' | 'tampilan' | 'lanjutan'>('konten');
  const [showImagePresets, setShowImagePresets] = useState(false);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuHref, setNewMenuHref] = useState('');
  const [showAddMenuForm, setShowAddMenuForm] = useState(false);

  // If no section is selected, show Global Theme Settings
  if (!selectedSection) {
    return (
      <aside className="w-full lg:w-80 xl:w-88 bg-white border-l border-[#E5E0DD] flex flex-col h-full shrink-0 font-sans select-none">
        <div className="p-3.5 border-b border-[#E5E0DD] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#241A1A]">Tema Toko</h2>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-xs">
          {/* Brand Accent Color */}
          <div className="space-y-2.5 bg-[#FAF7F7] p-3.5 rounded-2xl border border-[#E5E0DD]">
            <label className="font-bold text-[#241A1A] flex items-center gap-1.5">
              <Paintbrush className="w-3.5 h-3.5 text-[#66000E]" />
              <span>Aksen Warna Toko</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Maroon', color: '#66000E' },
                { name: 'Navy', color: '#0F172A' },
                { name: 'Emerald', color: '#027A48' },
                { name: 'Amber', color: '#B54708' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => onChangePrimaryAccent(c.color)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                    primaryAccent === c.color
                      ? 'border-[#66000E] bg-white ring-2 ring-[#66000E]/20 shadow-xs'
                      : 'border-[#E5E0DD] bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: c.color }}
                  >
                    {primaryAccent === c.color && <Check className="w-2.5 h-2.5" />}
                  </span>
                  <span className="text-[11px] font-semibold text-[#241A1A]">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Canvas Tip */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[#5A5250] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] text-[#706866]">
              Klik elemen di kanvas tengah atau daftar kiri untuk mengedit.
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

  const hasImage =
    selectedSection.id === 'hero_banner' ||
    selectedSection.id === 'promo_banner';

  const currentImageUrl =
    opts.imageUrl ||
    (selectedSection.id === 'hero_banner'
      ? store.bannerUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80'
      : '');

  return (
    <aside className="w-full lg:w-80 xl:w-88 bg-white border-r border-[#E5E0DD] flex flex-col h-full shrink-0 font-sans shadow-2xs select-none">
      {/* 1. COMPACT SECTION HEADER WITH BACK BUTTON */}
      <div className="p-3 border-b border-[#E5E0DD] bg-[#FAF7F7] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0 gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#E5E0DD] shrink-0 flex items-center justify-center cursor-pointer text-[#706866] hover:text-[#241A1A]"
                title="Kembali ke Daftar Section"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-sm font-bold text-[#241A1A] truncate flex items-center gap-1.5">
              <span>{selectedSection.title}</span>
            </h2>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDuplicateSection(sectionKey)}
              className="p-1.5 rounded-lg text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] border border-[#E5E0DD] transition cursor-pointer"
              title="Duplikasi"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onToggleVisibility(sectionKey)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                selectedSection.isVisible
                  ? 'text-emerald-700 bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
                  : 'text-[#706866] bg-[#FAF7F7] border-[#E5E0DD] hover:text-[#241A1A]'
              }`}
              title={selectedSection.isVisible ? 'Sembunyikan' : 'Tampilkan'}
            >
              {selectedSection.isVisible ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Segmented Tab Switcher */}
        <div className="flex items-center bg-[#F4F0EE] p-0.5 rounded-xl border border-[#E5E0DD]">
          <button
            type="button"
            onClick={() => setActiveTab('konten')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'konten'
                ? 'bg-white text-[#66000E] shadow-2xs font-bold'
                : 'text-[#706866] hover:text-[#241A1A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Konten</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tampilan')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'tampilan'
                ? 'bg-white text-[#66000E] shadow-2xs font-bold'
                : 'text-[#706866] hover:text-[#241A1A]'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Tampilan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lanjutan')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'lanjutan'
                ? 'bg-white text-[#66000E] shadow-2xs font-bold'
                : 'text-[#706866] hover:text-[#241A1A]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Lanjutan</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-3.5 text-xs">
        
        {/* ========================================================================= */}
        {/* TAB 1: KONTEN */}
        {/* ========================================================================= */}
        {activeTab === 'konten' && (
          <div className="space-y-3.5">
            {/* Banner Image Preview */}
            {hasImage && (
              <div className="space-y-2 bg-[#FAF7F7] p-3 rounded-2xl border border-[#E5E0DD]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#241A1A] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#66000E]" />
                    <span>Gambar Banner</span>
                  </span>
                  {currentImageUrl && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>

                {currentImageUrl && (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-[#E5E0DD] bg-black/5 shadow-2xs">
                    <img
                      src={currentImageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowImagePresets(!showImagePresets)}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E0DD] text-[#241A1A] font-semibold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#66000E]" />
                    <span>Galeri UMKM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E0DD] text-[#241A1A] font-semibold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-[#706866]" />
                    <span>Ganti URL</span>
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="url"
                      value={customImageUrlInput}
                      onChange={(e) => setCustomImageUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#E5E0DD] text-xs text-[#241A1A] focus:outline-none focus:border-[#66000E]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrlInput.trim()) {
                          handleOptionChange({ imageUrl: customImageUrlInput.trim() });
                          setShowUrlInput(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#66000E] text-white font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Pakai
                    </button>
                  </div>
                )}

                {showImagePresets && (
                  <div className="pt-2 border-t border-[#E5E0DD] space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                      {CURATED_BANNER_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            handleOptionChange({ imageUrl: preset.url });
                            setShowImagePresets(false);
                          }}
                          className="group relative rounded-lg overflow-hidden aspect-video border border-[#E5E0DD] hover:border-[#66000E] transition text-left cursor-pointer"
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-150"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-end p-1">
                            <span className="text-[9px] font-semibold text-white truncate">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Title / Heading Input */}
            <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-[#E5E0DD]">
              <label className="font-bold text-[#241A1A] flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#66000E]" />
                <span>Teks Judul</span>
              </label>
              <input
                type="text"
                value={opts.heading || opts.featuredTitle || opts.announcementText || opts.testimonialsTitle || opts.newsletterTitle || ''}
                onChange={(e) => {
                  if (selectedSection.id === 'announcement') {
                    handleOptionChange({ announcementText: e.target.value });
                  } else if (selectedSection.id === 'featured_products') {
                    handleOptionChange({ featuredTitle: e.target.value });
                  } else if (selectedSection.id === 'testimonials') {
                    handleOptionChange({ testimonialsTitle: e.target.value });
                  } else if (selectedSection.id === 'newsletter') {
                    handleOptionChange({ newsletterTitle: e.target.value });
                  } else {
                    handleOptionChange({ heading: e.target.value });
                  }
                }}
                placeholder="Masukkan judul..."
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E]"
              />
            </div>

            {/* Subtitle / Description */}
            {(selectedSection.id === 'hero_banner' ||
              selectedSection.id === 'promo_banner' ||
              selectedSection.id === 'featured_products' ||
              selectedSection.id === 'newsletter' ||
              selectedSection.id === 'footer') && (
              <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-[#E5E0DD]">
                <label className="font-bold text-[#241A1A]">
                  {selectedSection.id === 'footer' ? 'Hak Cipta' : 'Deskripsi'}
                </label>
                <textarea
                  rows={2}
                  value={
                    selectedSection.id === 'footer'
                      ? opts.copyrightText || ''
                      : opts.subheading || opts.description || opts.featuredSubtitle || opts.newsletterSubtitle || ''
                  }
                  onChange={(e) => {
                    if (selectedSection.id === 'featured_products') {
                      handleOptionChange({ featuredSubtitle: e.target.value });
                    } else if (selectedSection.id === 'newsletter') {
                      handleOptionChange({ newsletterSubtitle: e.target.value });
                    } else if (selectedSection.id === 'footer') {
                      handleOptionChange({ copyrightText: e.target.value });
                    } else {
                      handleOptionChange({ subheading: e.target.value, description: e.target.value });
                    }
                  }}
                  placeholder={selectedSection.id === 'footer' ? 'Hak Cipta Dilindungi...' : 'Tulis keterangan...'}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E]"
                />
              </div>
            )}

            {/* Badge Highlight */}
            {(selectedSection.id === 'hero_banner' ||
              selectedSection.id === 'promo_banner' ||
              selectedSection.id === 'newsletter') && (
              <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-[#E5E0DD]">
                <label className="font-bold text-[#241A1A]">Label Sorotan (Badge)</label>
                <input
                  type="text"
                  value={opts.badgeText || opts.discountBadge || opts.incentiveBadge || ''}
                  onChange={(e) => {
                    if (selectedSection.id === 'promo_banner') {
                      handleOptionChange({ discountBadge: e.target.value });
                    } else if (selectedSection.id === 'newsletter') {
                      handleOptionChange({ incentiveBadge: e.target.value });
                    } else {
                      handleOptionChange({ badgeText: e.target.value });
                    }
                  }}
                  placeholder="Contoh: PROMO SPESIAL"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs text-[#241A1A] focus:bg-white focus:outline-none focus:border-[#66000E]"
                />
              </div>
            )}

            {/* Action Buttons (CTA) */}
            {(selectedSection.id === 'hero_banner' ||
              selectedSection.id === 'promo_banner' ||
              selectedSection.id === 'newsletter') && (
              <div className="space-y-2 bg-white p-3 rounded-2xl border border-[#E5E0DD]">
                <span className="font-bold text-[#241A1A] flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#66000E]" />
                  <span>Tombol Utama</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={opts.buttonLabel || opts.buttonText || ''}
                    onChange={(e) => handleOptionChange({ buttonLabel: e.target.value, buttonText: e.target.value })}
                    placeholder="Teks Tombol"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs text-[#241A1A] focus:bg-white"
                  />
                  <input
                    type="text"
                    value={opts.buttonLink || '#katalog'}
                    onChange={(e) => handleOptionChange({ buttonLink: e.target.value })}
                    placeholder="Tautan (#katalog)"
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs text-[#241A1A] focus:bg-white"
                  />
                </div>

                {/* Secondary Button for Hero */}
                {selectedSection.id === 'hero_banner' && (
                  <div className="pt-2 border-t border-[#F2ECE9] space-y-1.5">
                    <span className="text-[11px] font-semibold text-[#5A5250]">Tombol Kedua</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={opts.secondaryButtonLabel || ''}
                        onChange={(e) => handleOptionChange({ secondaryButtonLabel: e.target.value })}
                        placeholder="WhatsApp Toko"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs text-[#241A1A] focus:bg-white"
                      />
                      <input
                        type="text"
                        value={opts.secondaryButtonLink || '#kontak'}
                        onChange={(e) => handleOptionChange({ secondaryButtonLink: e.target.value })}
                        placeholder="#kontak"
                        className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs text-[#241A1A] focus:bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Header / Navbar specific content */}
            {selectedSection.id === 'header' && (
              <div className="space-y-3 bg-white p-3 rounded-2xl border border-[#E5E0DD]">
                <span className="font-bold text-xs text-[#241A1A] block">Menu & Fitur Navbar</span>

                {/* Navbar links list */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#5A5250]">Daftar Menu Navigasi</span>
                    <button
                      type="button"
                      onClick={() => setShowAddMenuForm(!showAddMenuForm)}
                      className="text-[11px] font-bold text-[#66000E] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah</span>
                    </button>
                  </div>

                  {showAddMenuForm && (
                    <div className="p-2.5 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] space-y-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          value={newMenuLabel}
                          onChange={(e) => setNewMenuLabel(e.target.value)}
                          placeholder="Label Menu"
                          className="px-2 py-1 text-xs rounded-lg bg-white border border-[#E5E0DD]"
                        />
                        <input
                          type="text"
                          value={newMenuHref}
                          onChange={(e) => setNewMenuHref(e.target.value)}
                          placeholder="Link (#promo)"
                          className="px-2 py-1 text-xs rounded-lg bg-white border border-[#E5E0DD]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (newMenuLabel.trim()) {
                            const current = opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS;
                            handleOptionChange({
                              navMenuItems: [...current, { id: `nav-${Date.now()}`, label: newMenuLabel.trim(), href: newMenuHref.trim() || '#' }],
                            });
                            setNewMenuLabel('');
                            setNewMenuHref('');
                            setShowAddMenuForm(false);
                          }
                        }}
                        className="w-full py-1.5 bg-[#66000E] text-white font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        Simpan Menu
                      </button>
                    </div>
                  )}

                  <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                    {(opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs"
                      >
                        <span className="font-semibold text-[#241A1A]">{item.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = (opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS).filter((n) => n.id !== item.id);
                            handleOptionChange({ navMenuItems: filtered });
                          }}
                          className="text-[#706866] hover:text-red-600 p-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Toggle Switches */}
                <div className="space-y-2 pt-2 border-t border-[#F2ECE9]">
                  {[
                    { label: 'Kolom Pencarian', key: 'showSearchBar', current: opts.showSearchBar !== false },
                    { label: 'Keranjang Belanja', key: 'showCartBadge', current: opts.showCartBadge !== false },
                    { label: 'Chat WhatsApp', key: 'showWhatsAppButton', current: opts.showWhatsAppButton !== false },
                  ].map((t) => (
                    <div key={t.key} className="flex items-center justify-between py-1">
                      <span className="text-[11px] text-[#5A5250]">{t.label}</span>
                      <button
                        type="button"
                        onClick={() => handleOptionChange({ [t.key]: !t.current })}
                        className={`w-8 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                          t.current ? 'bg-[#66000E] justify-end' : 'bg-slate-300 justify-start'
                        }`}
                      >
                        <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcement toggle */}
            {selectedSection.id === 'announcement' && (
              <div className="bg-white p-3 rounded-2xl border border-[#E5E0DD] flex items-center justify-between">
                <span className="font-bold text-[#241A1A]">Ikon Berkilau</span>
                <button
                  type="button"
                  onClick={() => handleOptionChange({ showIcon: opts.showIcon === false ? true : false })}
                  className={`w-8 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    opts.showIcon !== false ? 'bg-[#66000E] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TAMPILAN & GAYA */}
        {/* ========================================================================= */}
        {activeTab === 'tampilan' && (
          <div className="space-y-3.5">
            {/* Visual Color Scheme Selector */}
            <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#E5E0DD]">
              <label className="font-bold text-[#241A1A] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#66000E]" />
                <span>Skema Warna</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'scheme-1', name: 'Terang', bg: 'bg-white', border: 'border-slate-300' },
                  { id: 'scheme-2', name: 'Gelap', bg: 'bg-slate-900', border: 'border-slate-800' },
                  { id: 'scheme-3', name: 'Aksen Marun', bg: 'bg-[#66000E]', border: 'border-[#66000E]' },
                  { id: 'scheme-4', name: 'Amber', bg: 'bg-amber-50', border: 'border-amber-200' },
                ].map((sc) => {
                  const isSelected = (opts.colorScheme || 'scheme-1') === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleOptionChange({ colorScheme: sc.id as any })}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'border-[#66000E] bg-[#FAF7F7] ring-2 ring-[#66000E]/20 shadow-xs'
                          : 'border-[#E5E0DD] bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border ${sc.bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                        {isSelected && <span className={`w-1.5 h-1.5 rounded-full ${sc.id === 'scheme-2' || sc.id === 'scheme-3' ? 'bg-white' : 'bg-[#66000E]'}`} />}
                      </span>
                      <span className="text-[11px] font-semibold text-[#241A1A]">
                        {sc.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#E5E0DD]">
              <label className="font-bold text-[#241A1A]">Perataan Teks</label>
              <div className="grid grid-cols-3 gap-1 bg-[#FAF7F7] p-1 rounded-xl border border-[#E5E0DD]">
                <button
                  type="button"
                  onClick={() => handleOptionChange({ textAlignment: 'left' })}
                  className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                    (opts.textAlignment || 'left') === 'left'
                      ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
                      : 'text-[#706866] hover:text-[#241A1A]'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Kiri</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOptionChange({ textAlignment: 'center' })}
                  className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                    opts.textAlignment === 'center'
                      ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
                      : 'text-[#706866] hover:text-[#241A1A]'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                  <span>Tengah</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOptionChange({ textAlignment: 'right' })}
                  className={`py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
                    opts.textAlignment === 'right'
                      ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
                      : 'text-[#706866] hover:text-[#241A1A]'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                  <span>Kanan</span>
                </button>
              </div>
            </div>

            {/* Section Height (Hero / Promo) */}
            {(selectedSection.id === 'hero_banner' || selectedSection.id === 'promo_banner') && (
              <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#E5E0DD]">
                <label className="font-bold text-[#241A1A]">Tinggi Banner</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'compact', label: 'Ringkas' },
                    { id: 'normal', label: 'Standar' },
                    { id: 'tall', label: 'Tinggi' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleOptionChange({ sectionHeight: h.id as any })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                        (opts.sectionHeight || 'normal') === h.id
                          ? 'border-[#66000E] bg-[#F5E8EA] text-[#66000E] font-bold shadow-2xs'
                          : 'border-[#E5E0DD] bg-[#FAF7F7] text-[#5A5250] hover:bg-white'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Animation Selector */}
            <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#E5E0DD]">
              <label className="font-bold text-[#241A1A]">Efek Animasi</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'none', label: 'Tanpa Animasi' },
                  { id: 'fade-in', label: 'Pudar Masuk' },
                  { id: 'slide-up', label: 'Geser Naik' },
                  { id: 'zoom-in', label: 'Zoom Halus' },
                ].map((an) => (
                  <button
                    key={an.id}
                    type="button"
                    onClick={() => handleOptionChange({ animation: an.id as any })}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                      (opts.animation || 'none') === an.id
                        ? 'border-[#66000E] bg-[#F5E8EA] text-[#66000E] font-bold shadow-2xs'
                        : 'border-[#E5E0DD] bg-[#FAF7F7] text-[#5A5250] hover:bg-white'
                    }`}
                  >
                    {an.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Overlay Opacity (if Image) */}
            {hasImage && (
              <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#E5E0DD]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#241A1A]">Gelap Overlay</label>
                  <span className="font-mono text-xs text-[#66000E] font-bold">
                    {opts.overlayOpacity !== undefined ? opts.overlayOpacity : 35}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={5}
                  value={opts.overlayOpacity !== undefined ? opts.overlayOpacity : 35}
                  onChange={(e) => handleOptionChange({ overlayOpacity: parseInt(e.target.value) })}
                  className="w-full accent-[#66000E] cursor-pointer"
                />
              </div>
            )}

            {/* Clean Toggles */}
            <div className="space-y-2 bg-white p-3.5 rounded-2xl border border-[#E5E0DD]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#241A1A]">Bingkai Kontainer</span>
                <button
                  type="button"
                  onClick={() => handleOptionChange({ enableContainer: !opts.enableContainer })}
                  className={`w-8 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    opts.enableContainer ? 'bg-[#66000E] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE9]">
                <span className="font-bold text-[#241A1A]">Tumpuk Vertikal di HP</span>
                <button
                  type="button"
                  onClick={() => handleOptionChange({ mobileStackImages: !opts.mobileStackImages })}
                  className={`w-8 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    opts.mobileStackImages ? 'bg-[#66000E] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md"></span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PENGATURAN LANJUTAN */}
        {/* ========================================================================= */}
        {activeTab === 'lanjutan' && (
          <div className="space-y-3.5">
            {/* Spacing Padding */}
            <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-[#E5E0DD]">
              <span className="font-bold text-[#241A1A] block">Jarak Spasi (Padding)</span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5A5250]">Atas</span>
                    <span className="font-mono text-[#66000E] font-bold">
                      {opts.paddingTop !== undefined ? opts.paddingTop : 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={4}
                    value={opts.paddingTop !== undefined ? opts.paddingTop : 0}
                    onChange={(e) => handleOptionChange({ paddingTop: parseInt(e.target.value) })}
                    className="w-full accent-[#66000E] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5A5250]">Bawah</span>
                    <span className="font-mono text-[#66000E] font-bold">
                      {opts.paddingBottom !== undefined ? opts.paddingBottom : 0}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={4}
                    value={opts.paddingBottom !== undefined ? opts.paddingBottom : 0}
                    onChange={(e) => handleOptionChange({ paddingBottom: parseInt(e.target.value) })}
                    className="w-full accent-[#66000E] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E5E0DD] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#241A1A] block">Visibilitas Bagian</span>
                <span className="text-[10px] text-[#706866]">Tampilkan di etalase</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleVisibility(sectionKey)}
                className={`w-9 h-5.5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                  selectedSection.isVisible ? 'bg-[#66000E] justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="bg-white w-4.5 h-4.5 rounded-full shadow-md"></span>
              </button>
            </div>

            {/* Custom CSS */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-2xl border border-[#E5E0DD]">
              <label className="font-bold text-[#241A1A] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[#66000E]" />
                <span>Custom CSS</span>
              </label>
              <textarea
                rows={3}
                value={opts.customCss || ''}
                onChange={(e) => handleOptionChange({ customCss: e.target.value })}
                placeholder=".section-custom { border-radius: 20px; }"
                className="w-full font-mono text-[11px] p-2.5 rounded-xl bg-slate-900 text-emerald-400 border border-slate-700 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. FOOTER: Red "Hapus section" button */}
      <div className="p-3 border-t border-[#E5E0DD] bg-white shrink-0">
        <button
          type="button"
          onClick={() => onDeleteSection(sectionKey)}
          className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus Section</span>
        </button>
      </div>
    </aside>
  );
};
