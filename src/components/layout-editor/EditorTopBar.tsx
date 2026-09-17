import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  Save,
  Maximize2,
  Minimize2,
  ChevronDown,
  Check,
  FileText,
} from 'lucide-react';
import { Store } from '../../types';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';

// ── Page Definitions ─────────────────────────────────────────────────
export interface EditorPage {
  id: string;
  label: string;
  sectionCount?: number;
}

export const DEFAULT_EDITOR_PAGES: EditorPage[] = [
  { id: 'homepage', label: 'Halaman Utama' },
  { id: 'catalog', label: 'Katalog Produk' },
  { id: 'product', label: 'Detail Produk' },
  { id: 'about', label: 'Tentang Toko' },
  { id: 'contact', label: 'Kontak' },
];

interface EditorTopBarProps {
  store: Store;
  hasChanges: boolean;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  onDeviceModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onSave: () => void;
  onReset: () => void;
  onOpenStorefront: () => void;
  onBack: () => void;
  onOpenWizard?: () => void;
  activePreset?: string;
  onApplyPreset?: (presetId: string) => void;
  isSaving?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  activePage?: string;
  onPageChange?: (pageId: string) => void;
  pages?: EditorPage[];
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  store,
  hasChanges,
  deviceMode,
  onDeviceModeChange,
  onSave,
  onOpenStorefront,
  onBack,
  isSaving = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isFullscreen = false,
  onToggleFullscreen,
  activePage = 'homepage',
  onPageChange,
  pages = DEFAULT_EDITOR_PAGES,
}) => {
  const { t } = useLanguage();
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const pageDropdownRef = useRef<HTMLDivElement>(null);

  // Close page dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pageDropdownRef.current && !pageDropdownRef.current.contains(e.target as Node)) {
        setIsPageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPage = pages.find(p => p.id === activePage) || pages[0];

  const deviceModes = [
    { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { mode: 'mobile' as const, icon: Smartphone, label: 'Ponsel' },
  ];

  return (
    <header className="bg-white border-b border-[#E1E3E5] px-3 sm:px-4 h-[52px] flex items-center justify-between gap-2 shrink-0 z-30 font-sans shadow-xs select-none">
      {/* ── LEFT: Back + Store Name + Status ── */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg text-[#5C5F62] hover:text-[#202223] hover:bg-[#F6F6F7] transition cursor-pointer shrink-0"
          title={t('back_to_dashboard', 'Kembali')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[#E1E3E5] shrink-0 hidden sm:block"></div>

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-[13px] text-[#202223] truncate max-w-[120px] sm:max-w-[180px]">
            {store.name || 'Toko UMKM'}
          </span>
          {hasChanges ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Draft
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              <Check className="w-2.5 h-2.5" />
              Tersimpan
            </span>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 ml-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition ${canUndo
              ? 'text-[#5C5F62] hover:text-[#202223] hover:bg-[#F6F6F7] cursor-pointer'
              : 'text-[#C9CCCF] cursor-not-allowed'
            }`}
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition ${canRedo
              ? 'text-[#5C5F62] hover:text-[#202223] hover:bg-[#F6F6F7] cursor-pointer'
              : 'text-[#C9CCCF] cursor-not-allowed'
            }`}
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── CENTER: Device Switcher + Page Selector ── */}
      <div className="flex items-center gap-3">
        {/* Page Selector Dropdown */}
        <div className="relative hidden md:block" ref={pageDropdownRef}>
          <button
            onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E1E3E5] hover:bg-[#F6F6F7] transition cursor-pointer text-[13px] font-medium text-[#202223]"
          >
            <FileText className="w-3.5 h-3.5 text-[#8C9196]" />
            <span>{currentPage?.label || 'Halaman Utama'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8C9196] transition-transform ${isPageDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPageDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl border border-[#E1E3E5] shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8C9196] uppercase tracking-wider">
                Halaman
              </div>
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    onPageChange?.(page.id);
                    setIsPageDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[13px] transition cursor-pointer ${
                    activePage === page.id
                      ? 'bg-[#F1F8FF] text-[#2C6ECB] font-semibold'
                      : 'text-[#202223] hover:bg-[#F6F6F7] font-medium'
                  }`}
                >
                  <span>{page.label}</span>
                  {activePage === page.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-[#E1E3E5] hidden md:block"></div>

        {/* Device Mode Switcher */}
        <div className="bg-[#F6F6F7] p-0.5 rounded-xl border border-[#E1E3E5] flex items-center gap-0.5">
          {deviceModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onDeviceModeChange(mode)}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                deviceMode === mode
                  ? 'bg-white text-[#202223] shadow-xs border border-[#E1E3E5]'
                  : 'text-[#8C9196] hover:text-[#202223]'
              }`}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Language, Preview, Fullscreen, Save ── */}
      <div className="flex items-center gap-1.5">
        <LanguageSwitchButton compact />

        {/* Preview Button */}
        <button
          type="button"
          onClick={onOpenStorefront}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#E1E3E5] text-[#202223] hover:bg-[#F6F6F7] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title={t('preview', 'Pratinjau')}
        >
          <Eye className="w-3.5 h-3.5 text-[#8C9196]" />
          <span className="hidden sm:inline">{t('preview', 'Pratinjau')}</span>
        </button>

        {/* Fullscreen */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isFullscreen
                ? 'bg-[#202223] text-white border-[#202223]'
                : 'border-[#E1E3E5] text-[#5C5F62] hover:bg-[#F6F6F7]'
            }`}
            title={isFullscreen ? 'Normal' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer ${
            hasChanges
              ? 'bg-[#008060] hover:bg-[#006e52] shadow-sm ring-1 ring-[#008060]/20'
              : 'bg-[#008060] hover:bg-[#006e52]'
          } ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
        </button>
      </div>
    </header>
  );
};
