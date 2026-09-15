import React from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  ChevronDown,
  Layers,
  Save,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { Store } from '../../types';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';

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
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  store,
  hasChanges,
  deviceMode,
  onDeviceModeChange,
  onSave,
  onReset,
  onOpenStorefront,
  onBack,
  onOpenWizard,
  isSaving = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-[#E5E0DD] px-3 sm:px-4 py-2 flex items-center justify-between gap-3 shrink-0 z-30 font-sans shadow-2xs select-none">
      {/* LEFT: Back, Store/Theme Title, Draft Status, Page Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] border border-[#E5E0DD] transition cursor-pointer shrink-0"
          title={t('back_to_dashboard', 'Kembali ke Dashboard')}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Store Theme & Draft Badge */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs sm:text-sm text-[#1F1F1F] tracking-tight truncate max-w-[140px] sm:max-w-[200px]">
            {store.name || 'Toko UMKM'}
          </span>

          {hasChanges ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Draft</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F6F4F3] text-[#706866] border border-[#E5E0DD]">
              <span>Tersimpan</span>
            </span>
          )}
        </div>

        {/* Wizard / Template Switcher Button */}
        {onOpenWizard && (
          <button
            type="button"
            onClick={onOpenWizard}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Ganti Template atau Atur Identitas Toko"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Ganti Template</span>
          </button>
        )}
      </div>

      {/* CENTER: Viewport Device Switcher (Desktop, Tablet, Mobile) */}
      <div className="flex items-center justify-center">
        <div className="bg-[#FAF7F7] p-0.5 sm:p-1 rounded-xl border border-[#E5E0DD] flex items-center gap-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onDeviceModeChange('desktop')}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${deviceMode === 'desktop'
                ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
                : 'text-[#706866] hover:text-[#241A1A]'
              }`}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px]">{t('mode_desktop', 'Desktop')}</span>
          </button>

          <button
            type="button"
            onClick={() => onDeviceModeChange('tablet')}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${deviceMode === 'tablet'
                ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
                : 'text-[#706866] hover:text-[#241A1A]'
              }`}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px]">{t('mode_tablet', 'Tablet')}</span>
          </button>

          <button
            type="button"
            onClick={() => onDeviceModeChange('mobile')}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${deviceMode === 'mobile'
                ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
                : 'text-[#706866] hover:text-[#241A1A]'
              }`}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden lg:inline text-[11px]">{t('mode_mobile', 'Ponsel')}</span>
          </button>
        </div>
      </div>

      {/* RIGHT: Language Switcher, Undo, Redo, Fullscreen, Preview Storefront, Save/Publish */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Language Switch */}
        <LanguageSwitchButton compact />

        {/* Undo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-1.5 sm:p-2 rounded-lg border transition ${canUndo
              ? 'text-[#241A1A] hover:bg-[#FAF7F7] border-[#E5E0DD] cursor-pointer'
              : 'text-[#C5BEBA] border-[#EAE5E2] cursor-not-allowed bg-[#FAF7F7]/50'
            }`}
          title={`${t('undo', 'Urungkan')} (Undo)`}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo */}
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-1.5 sm:p-2 rounded-lg border transition ${canRedo
              ? 'text-[#241A1A] hover:bg-[#FAF7F7] border-[#E5E0DD] cursor-pointer'
              : 'text-[#C5BEBA] border-[#EAE5E2] cursor-not-allowed bg-[#FAF7F7]/50'
            }`}
          title={`${t('redo', 'Ulangi')} (Redo)`}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle Button */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${isFullscreen
                ? 'bg-[#66000E] text-white border-[#66000E] shadow-2xs'
                : 'border-[#E5E0DD] text-[#241A1A] hover:bg-[#FAF7F7]'
              }`}
            title={isFullscreen ? `${t('exit_fullscreen', 'Keluar Layar Penuh')} (Esc)` : t('fullscreen', 'Layar Penuh')}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Normal</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#706866]" />
                <span className="hidden sm:inline">{t('fullscreen', 'Layar Penuh')}</span>
              </>
            )}
          </button>
        )}

        {/* Live Storefront Eye Button */}
        <button
          type="button"
          onClick={onOpenStorefront}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#E5E0DD] text-[#241A1A] hover:bg-[#FAF7F7] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          title={t('preview', 'Pratinjau')}
        >
          <Eye className="w-4 h-4 text-[#706866]" />
          <span className="hidden sm:inline">{t('preview', 'Pratinjau')}</span>
        </button>

        {/* Save / Publish Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-bold text-white transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${hasChanges
              ? 'bg-[#66000E] hover:bg-[#7D0012] ring-2 ring-[#66000E]/20'
              : 'bg-[#66000E] hover:bg-[#7D0012]'
            } ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? t('saving', 'Menyimpan...') : t('save', 'Simpan')}</span>
        </button>
      </div>
    </header>
  );
};
