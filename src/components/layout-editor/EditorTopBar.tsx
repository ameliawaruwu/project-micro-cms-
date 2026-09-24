import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Maximize2,
  Minimize2,
  ChevronDown,
  Check,
  FileText,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { Store } from '../../types';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';

import {
  ShoppingCart,
  CheckCircle2,
  Key,
  Package,
  RefreshCw,
  User,
  Store as StoreIcon,
  ShoppingBag,
  Box,
  Info,
  Phone,
  Sparkles,
} from 'lucide-react';

// ── Page Definitions ─────────────────────────────────────────────────
export interface EditorPage {
  id: string;
  label: string;
  category: 'Checkout' | 'Pasca-pembelian' | 'Akun pelanggan' | 'Toko online';
  icon?: any;
}

export const DEFAULT_EDITOR_PAGES: EditorPage[] = [
  { id: 'homepage', label: 'Home / Beranda', category: 'Toko online', icon: StoreIcon },
  { id: 'catalog', label: 'Katalog Produk', category: 'Toko online', icon: ShoppingBag },
  { id: 'product', label: 'Detail Produk', category: 'Toko online', icon: Box },
  { id: 'about', label: 'Tentang Toko', category: 'Toko online', icon: Info },
  { id: 'promo', label: 'Promo Spesial', category: 'Toko online', icon: Sparkles },
  { id: 'contact', label: 'Kontak', category: 'Toko online', icon: Phone },
  { id: 'cart', label: 'Keranjang Belanja', category: 'Toko online', icon: ShoppingCart },
  { id: 'checkout', label: 'Checkout', category: 'Checkout', icon: ShoppingCart },
  { id: 'thank_you', label: 'Terima Kasih / Success', category: 'Pasca-pembelian', icon: CheckCircle2 },
  { id: 'login', label: 'Masuk (Login)', category: 'Akun pelanggan', icon: Key },
  { id: 'register', label: 'Daftar (Register)', category: 'Akun pelanggan', icon: User },
  { id: 'forgot_password', label: 'Lupa Password', category: 'Akun pelanggan', icon: RefreshCw },
  { id: 'orders', label: 'Riwayat Pesanan', category: 'Akun pelanggan', icon: Package },
  { id: 'order_detail', label: 'Detail Pesanan', category: 'Akun pelanggan', icon: FileText },
  { id: 'profile', label: 'Profil Saya', category: 'Akun pelanggan', icon: User },
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
  onPublish?: () => void;
  onUnpublish?: () => void;
  isUnpublishing?: boolean;
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
  onPublish,
  onUnpublish,
  isUnpublishing = false,
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

  const currentPage = pages.find(
    (p) =>
      p.id === activePage ||
      (activePage === 'katalog' && p.id === 'catalog') ||
      (activePage === 'catalog' && p.id === 'catalog') ||
      (activePage === 'produk' && p.id === 'catalog')
  ) || pages[0];

  const deviceModes = [
    { mode: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { mode: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { mode: 'mobile' as const, icon: Smartphone, label: 'Ponsel' },
  ];

  return (
    <header className="bg-white border-b border-[#E1E3E5] px-2 sm:px-4 h-[52px] flex items-center justify-between gap-1 sm:gap-2 shrink-0 z-40 font-sans shadow-xs select-none w-full max-w-full box-border relative">
      {/* ── LEFT: Back + Store Name + Status ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg text-[#5C5F62] hover:text-[#202223] hover:bg-[#F6F6F7] transition cursor-pointer shrink-0"
          title={t('back_to_dashboard', 'Kembali')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-px h-4 sm:h-5 bg-[#E1E3E5] shrink-0 hidden min-[360px]:block"></div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-xs sm:text-[13px] text-[#202223] truncate max-w-[68px] min-[360px]:max-w-[90px] min-[420px]:max-w-[130px] sm:max-w-[180px] md:max-w-[220px]">
            {store.name || 'Toko UMKM'}
          </span>
          {hasChanges ? (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0" title="Ada perubahan belum disimpan">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="hidden min-[480px]:inline">Draft</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0" title="Semua perubahan tersimpan">
              <Check className="w-2.5 h-2.5" />
              <span className="hidden min-[480px]:inline">Tersimpan</span>
            </span>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 ml-1 shrink-0">
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
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Page Selector Dropdown */}
        <div className="relative hidden sm:block" ref={pageDropdownRef}>
          <button
            type="button"
            onClick={() => setIsPageDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E1E3E5] hover:bg-[#F6F6F7] transition cursor-pointer text-xs sm:text-[13px] font-medium text-[#202223]"
          >
            <FileText className="w-3.5 h-3.5 text-[#8C9196]" />
            <span className="truncate max-w-[120px]">{currentPage?.label || 'Halaman Utama'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-[#8C9196] transition-transform duration-200 ${isPageDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPageDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl border border-[#E1E3E5] shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {(['Toko online', 'Akun pelanggan', 'Checkout', 'Pasca-pembelian'] as const).map((catName) => {
                const catPages = pages.filter(p => p.category === catName);
                if (catPages.length === 0) return null;

                return (
                  <div key={catName} className="mb-2 last:mb-0">
                    <div className="px-3.5 py-1 text-[11px] font-bold text-[#8C9196] uppercase tracking-wider">
                      {catName}
                    </div>
                    <div className="mt-0.5 space-y-0.5 px-1.5">
                      {catPages.map((page) => {
                        const Icon = page.icon || FileText;
                        const isActive =
                          activePage === page.id ||
                          (activePage === 'katalog' && page.id === 'catalog') ||
                          (activePage === 'catalog' && page.id === 'katalog') ||
                          (activePage === 'produk' && page.id === 'catalog');
                        return (
                          <button
                            key={page.id}
                            type="button"
                            onClick={() => {
                              onPageChange?.(page.id);
                              setIsPageDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition cursor-pointer ${
                              isActive
                                ? 'bg-[#F1F8FF] text-[#2C6ECB] font-semibold'
                                : 'text-[#202223] hover:bg-[#F6F6F7] font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-[#2C6ECB]' : 'text-[#6D7175]'}`} />
                              <span>{page.label}</span>
                            </div>
                            {isActive && <Check className="w-3.5 h-3.5 text-[#2C6ECB]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-[#E1E3E5] hidden sm:block"></div>

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

      {/* ── RIGHT: Language, Preview, Save, Publish ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <div className="hidden min-[360px]:block">
          <LanguageSwitchButton compact />
        </div>

        {/* Fullscreen Canvas Toggle Button */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              isFullscreen ? 'bg-[#202223] text-white border-[#202223]' : 'border-[#E1E3E5] text-[#5C5F62] hover:bg-[#F6F6F7]'
            }`}
            title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Layar Penuh Canvas'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Live Storefront Preview Button */}
        <button
          type="button"
          onClick={onOpenStorefront}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#E1E3E5] text-[#202223] hover:bg-[#F6F6F7] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
          title="Buka Pratinjau Website Toko (Tab Baru)"
        >
          <Eye className="w-3.5 h-3.5 text-[#5C5F62]" />
          <span className="hidden sm:inline">Pratinjau</span>
          <ExternalLink className="w-3 h-3 text-[#8C9196] hidden md:inline ml-0.5" />
        </button>

        {/* Publish / Unpublish Toggle Button */}
        {store.isPublished ? (
          <button
            type="button"
            onClick={onUnpublish}
            disabled={isUnpublishing}
            className="p-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Tarik publikasi website toko (kembalikan ke mode draf)"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isUnpublishing ? 'Memproses...' : 'Unpublish'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onPublish}
            className="p-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Publikasikan website toko ke publik"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Publikasikan</span>
          </button>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className={`p-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer ${
            hasChanges
              ? 'bg-[#008060] hover:bg-[#006e52] shadow-sm ring-1 ring-[#008060]/20'
              : 'bg-[#008060] hover:bg-[#006e52]'
          } ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
          title="Simpan Perubahan Layout"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
        </button>
      </div>
    </header>
  );
};
