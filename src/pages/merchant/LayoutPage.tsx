import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Store,
  StoreLayoutSettings,
  StoreSectionConfig,
  Product,
  StoreSectionOptions,
} from '../../types';
import {
  DEFAULT_STORE_LAYOUT,
  LAYOUT_PRESETS,
  getStoreSections,
  SectionTemplateDef,
  STORE_TEMPLATES,
} from '../../utils/layoutConstants';
import { EditorTopBar } from '../../components/layout-editor/EditorTopBar';
import { LeftPanelSections } from '../../components/layout-editor/LeftPanelSections';
import { CenterPreviewCanvas } from '../../components/layout-editor/CenterPreviewCanvas';
import { RightPanelSettings } from '../../components/layout-editor/RightPanelSettings';
import { AddSectionModal } from '../../components/layout-editor/AddSectionModal';
import { StoreLayoutSetupWizard } from '../../components/layout-editor/StoreLayoutSetupWizard';
import { ThemeLibraryView, TemplateGalleryItem, TEMPLATE_GALLERY_ITEMS } from '../../components/layout-editor/ThemeLibraryView';
import { PublishStoreModal } from '../../components/layout-editor/PublishStoreModal';
import { ArrowLeft, ArrowRight, Monitor, Tablet, Smartphone, Palette, Loader2 } from 'lucide-react';
import { useCmsStore } from '../../cms/useCmsStore';

interface LayoutPageProps {
  store: Store;
  products: Product[];
  onSaveLayout: (layoutSettings: StoreLayoutSettings) => void;
  onOpenStorefront: () => void;
  onOpenPhoneSimulator: () => void;
  onShowNotification: (msg: string) => void;
  onBack?: () => void;
}

export const LayoutPage: React.FC<LayoutPageProps> = ({
  store,
  products,
  onSaveLayout,
  onOpenStorefront,
  onOpenPhoneSimulator,
  onShowNotification,
  onBack,
}) => {
  const [currentStore, setCurrentStore] = useState<Store>(store);
  const cmsProducts = useCmsStore(state => state.products);
  useEffect(() => {
    setCurrentStore(store);
  }, [store]);

  // Check URL for previewTheme to automatically open preview overlay (like Canva)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const themeId = params.get('previewTheme');
    if (themeId) {
      const template = TEMPLATE_GALLERY_ITEMS.find((t) => t.storeTemplate.id === themeId);
      if (template) {
        setPreviewTemplate(template);
        
        const mappedThemeId = {
          'minimalist_clean': 'minimalist',
          'gadget_tech': 'modern',
          'futuristic_dark': 'futuristic',
          'editorial_luxury': 'luxury',
          'bold_market': 'bold',
          'editorial_commerce': 'editorial',
          'nature_organic': 'nature',
          'creative_studio': 'creative',
          'pro_corporate': 'professional',
          'chic_fashion': 'fashion',
        }[template.storeTemplate.id] || 'minimalist';
        useCmsStore.getState().loadThemeData(mappedThemeId);
        setActiveThemeId(mappedThemeId);
        
        setPreviewDevice('desktop');
        setPageMode('preview');
        // Clean up URL so it doesn't get stuck in preview mode on reload
        const newUrl = window.location.pathname + '?toko=' + (currentStore.slug || '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [currentStore.slug]);

  const initialSections = useMemo(
    () => getStoreSections(store.layoutSettings),
    [store.layoutSettings]
  );

  const [sections, setSections] = useState<StoreSectionConfig[]>(initialSections);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(
    initialSections.length > 0 ? (initialSections[0].key || `${initialSections[0].id}-0`) : null
  );
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePreset, setActivePreset] = useState<string>('standard');
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalCategoryFilter, setAddModalCategoryFilter] = useState<string | undefined>(undefined);
  const [primaryAccent, setPrimaryAccent] = useState<string>(
    store.layoutSettings?.primaryAccent || '#66000E'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeLeftPane, setActiveLeftPane] = useState<'sections' | 'settings'>('sections');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  
  // Theme Library vs Editor Mode
  const [pageMode, setPageMode] = useState<'library' | 'preview' | 'loading' | 'editor'>('library');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateGalleryItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTemplateName, setLoadingTemplateName] = useState('');
  const [activePage, setActivePage] = useState('homepage');
  const [activeThemeId, setActiveThemeId] = useState<any>(
    (store.layoutSettings as any)?.activeThemeId || store.layoutSettings?.themeStyle || 'minimalist'
  );
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<any>(
    store.layoutSettings?.globalThemeSettings || {
      colors: { primary: '#2C6ECB', secondary: '#1E40AF', background: '#FFFFFF', surface: '#F6F6F7', text: '#202223', mutedText: '#6D7175', border: '#E1E3E5' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', headingSize: 'md', bodySize: 'md' },
      buttons: { radius: 'md', style: 'solid' },
      cards: { radius: 'lg', shadow: 'sm', border: true },
      layout: { contentWidth: 'normal', sectionSpacing: 'normal' }
    }
  );

  const displayProducts = (pageMode === 'preview' || !products || products.length === 0) 
    ? cmsProducts 
    : products;

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen) {
      onShowNotification('Mode Layar Penuh aktif. Tekan Esc atau tombol Layar Penuh untuk keluar.');
    }
  };

  const handleOpenPreviewTab = () => {
    const draftStore = {
      ...currentStore,
      layoutSettings: {
        ...currentStore.layoutSettings,
        sections,
        primaryAccent,
        globalThemeSettings: globalSettings,
        activeThemeId,
        themeStyle: activeThemeId,
      }
    };
    sessionStorage.setItem('microcms_preview_draft', JSON.stringify(draftStore));
    window.open(`/${currentStore.slug}?preview=true`, '_blank');
  };

  // Handle clicking a template card → redirect to new tab like Canva
  const handlePreviewTemplate = (template: TemplateGalleryItem) => {
    window.open(`/?previewTheme=${template.storeTemplate.id}&toko=${currentStore.slug}`, '_blank');
  };

  // Handle "Coba tema" → show loading then go to editor
  const handleApplyAndEdit = (template: TemplateGalleryItem) => {
    setLoadingTemplateName(template.name);
    setLoadingProgress(0);
    setPageMode('loading');

    // Apply template sections and styling
    const storeTemplate = template.storeTemplate;
    const newSections = storeTemplate.sections.map((s, idx) => ({
      ...s,
      key: s.key || `${s.id}-${idx}`,
      order: s.order !== undefined ? s.order : idx,
    }));
    setSections(newSections);
    setSelectedSectionKey(newSections[0]?.key || null);
    setPrimaryAccent(template.primaryAccent);
    
    const themeMap: Record<string, any> = {
      'minimalist_clean': 'minimalist',
      'gadget_tech': 'modern',
      'futuristic_dark': 'futuristic',
      'editorial_luxury': 'luxury',
      'bold_market': 'bold',
      'editorial_commerce': 'editorial',
      'nature_organic': 'nature',
      'creative_studio': 'creative',
      'pro_corporate': 'professional',
      'chic_fashion': 'fashion',
      'brand': 'minimalist', // legacy
      'classic': 'elegant' // legacy
    };
    const mappedThemeId = themeMap[template.storeTemplate.id] || 'minimalist';
    setActiveThemeId(mappedThemeId);
    
    // Load dynamic theme dummy data if available
    useCmsStore.getState().loadThemeData(mappedThemeId);

    handleUpdateStore({
      bannerUrl: storeTemplate.bannerUrl,
      tagline: storeTemplate.tagline,
    });

    onSaveLayout({
      ...store.layoutSettings,
      primaryAccent: template.primaryAccent,
      sections: newSections,
    });
    setHistory([newSections]);
    setHistoryIndex(0);
    setHasChanges(false);

    // Animate progress bar over ~2.5 seconds, then switch to editor
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 8;
      if (progress >= 100) {
        progress = 100;
        setLoadingProgress(100);
        clearInterval(interval);
        setTimeout(() => {
          setPageMode('editor');
          setPreviewTemplate(null);
        }, 400);
      } else {
        setLoadingProgress(Math.min(progress, 95));
      }
    }, 300);
  };

  // Keyboard shortcut listener for Esc to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleUpdateStore = (updates: Partial<Store>) => {
    setCurrentStore((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleWizardComplete = (data: {
    storeUpdates: Partial<Store>;
    layoutSettings: StoreLayoutSettings;
  }) => {
    const updated = { ...currentStore, ...data.storeUpdates };
    setCurrentStore(updated);
    const newSections = getStoreSections(data.layoutSettings);
    setSections(newSections);
    setSelectedSectionKey(newSections.length > 0 ? (newSections[0].key || `${newSections[0].id}-0`) : null);
    if (data.layoutSettings.primaryAccent) {
      setPrimaryAccent(data.layoutSettings.primaryAccent);
    }
    setHistory([newSections]);
    setHistoryIndex(0);
    setHasChanges(false);
    setIsWizardOpen(false);

    // Persist layout
    onSaveLayout(data.layoutSettings);
    onShowNotification(`🎉 Website toko "${updated.name}" berhasil di-generate!`);
  };

  // Undo / Redo History Stack
  const [history, setHistory] = useState<StoreSectionConfig[][]>([initialSections]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Push to history helper
  const pushToHistory = useCallback((newSections: StoreSectionConfig[]) => {
    setHistory((prevHistory) => {
      const nextHistory = prevHistory.slice(0, historyIndex + 1);
      nextHistory.push(newSections);
      // Cap history length to 30
      if (nextHistory.length > 30) {
        nextHistory.shift();
      }
      return nextHistory;
    });
    setHistoryIndex((prevIdx) => prevIdx + 1);
    setHasChanges(true);
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const newIdx = historyIndex - 1;
    setHistoryIndex(newIdx);
    const targetSections = history[newIdx];
    setSections(targetSections);
    onShowNotification('Perubahan diurungkan (Undo).');
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const newIdx = historyIndex + 1;
    setHistoryIndex(newIdx);
    const targetSections = history[newIdx];
    setSections(targetSections);
    onShowNotification('Perubahan diulangi (Redo).');
  };

  // Selected section object
  const selectedSection = useMemo(() => {
    if (!selectedSectionKey) return null;
    return (
      sections.find(
        (s, idx) => (s.key || `${s.id}-${idx}`) === selectedSectionKey
      ) || null
    );
  }, [sections, selectedSectionKey]);

  // Select section handler
  const handleSelectSection = (key: string) => {
    setSelectedSectionKey(key);
    setActiveLeftPane('settings');
  };

  // Move section (reorder)
  const handleMoveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length || fromIndex === toIndex) return;

    const updated = [...sections];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    // Re-index orders
    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);
    pushToHistory(reordered);
    setActivePreset('custom');
  };

  // Toggle visibility of a section
  const handleToggleVisibility = (key: string) => {
    const updated = sections.map((sec, idx) => {
      const currentKey = sec.key || `${sec.id}-${idx}`;
      if (currentKey === key) {
        return { ...sec, isVisible: !sec.isVisible };
      }
      return sec;
    });
    setSections(updated);
    pushToHistory(updated);
    setActivePreset('custom');
  };

  // Duplicate a section
  const handleDuplicateSection = (key: string) => {
    const targetIdx = sections.findIndex(
      (s, idx) => (s.key || `${s.id}-${idx}`) === key
    );
    if (targetIdx === -1) return;

    const target = sections[targetIdx];
    const newKey = `${target.id}-copy-${Date.now()}`;
    const duplicated: StoreSectionConfig = {
      ...target,
      key: newKey,
      title: `${target.title} (Salinan)`,
      order: targetIdx + 1,
      options: target.options ? JSON.parse(JSON.stringify(target.options)) : {},
    };

    const updated = [...sections];
    updated.splice(targetIdx + 1, 0, duplicated);

    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);
    setSelectedSectionKey(newKey);
    pushToHistory(reordered);
    setActivePreset('custom');
    onShowNotification(`Bagian "${target.title}" berhasil diduplikasi.`);
  };

  // Rename a section
  const handleRenameSection = (key: string, newTitle: string) => {
    const updated = sections.map((sec, idx) => {
      const currentKey = sec.key || `${sec.id}-${idx}`;
      if (currentKey === key) {
        return { ...sec, title: newTitle };
      }
      return sec;
    });
    setSections(updated);
    pushToHistory(updated);
    onShowNotification('Nama bagian berhasil diubah.');
  };

  // Delete a section
  const handleDeleteSection = (key: string) => {
    if (sections.length <= 1) {
      onShowNotification('Minimal harus ada 1 bagian pada toko.');
      return;
    }

    const updated = sections.filter(
      (s, idx) => (s.key || `${s.id}-${idx}`) !== key
    );
    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);

    if (selectedSectionKey === key) {
      setSelectedSectionKey(
        reordered.length > 0 ? (reordered[0].key || `${reordered[0].id}-0`) : null
      );
    }

    pushToHistory(reordered);
    setActivePreset('custom');
    onShowNotification('Bagian berhasil dihapus dari etalase toko.');
  };

  // Add section from template
  const handleAddSection = (template: SectionTemplateDef) => {
    const newKey = `${template.id}-${Date.now()}`;
    const newSection: StoreSectionConfig = {
      key: newKey,
      id: template.id,
      title: template.title,
      subtitle: template.subtitle,
      isVisible: true,
      order: sections.length,
      options: JSON.parse(JSON.stringify(template.defaultOptions)),
    };

    const updated = [...sections, newSection];
    setSections(updated);
    setSelectedSectionKey(newKey);
    pushToHistory(updated);
    setActivePreset('custom');
    onShowNotification(`Bagian "${template.title}" berhasil ditambahkan ke tata letak.`);
  };

  // Update specific section options
  const handleUpdateSectionOptions = (
    key: string,
    newOptions: Partial<StoreSectionOptions>
  ) => {
    const updated = sections.map((sec, idx) => {
      const currentKey = sec.key || `${sec.id}-${idx}`;
      if (currentKey === key) {
        return {
          ...sec,
          options: {
            ...sec.options,
            ...newOptions,
          },
        };
      }
      return sec;
    });
    setSections(updated);
    pushToHistory(updated);
    setActivePreset('custom');
  };

  // Update section title
  const handleUpdateSectionTitle = (key: string, newTitle: string) => {
    handleRenameSection(key, newTitle);
  };

  // Apply layout preset
  const handleApplyPreset = (presetId: string) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      const cloned = preset.sections.map((s, idx) => ({
        ...s,
        key: s.key || `${s.id}-${idx}`,
        order: idx,
      }));
      setSections(cloned);
      setSelectedSectionKey(cloned[0].key || `${cloned[0].id}-0`);
      setActivePreset(presetId);
      pushToHistory(cloned);
      onShowNotification(`Preset "${preset.name}" berhasil diterapkan!`);
    }
  };

  // Reset to default
  const handleReset = () => {
    const defaults = DEFAULT_STORE_LAYOUT.sections.map((s, idx) => ({
      ...s,
      key: s.key || `${s.id}-${idx}`,
      order: idx,
    }));
    setSections(defaults);
    setSelectedSectionKey(defaults[0].key || `${defaults[0].id}-0`);
    setActivePreset('standard');
    setPrimaryAccent('#66000E');
    pushToHistory(defaults);
    onShowNotification('Pengaturan tata letak dikembalikan ke bawaan.');
  };

  // Save layout
  const handleSave = () => {
    setIsSaving(true);
    const layoutSettings: StoreLayoutSettings = {
      sections,
      themeStyle: activeThemeId,
      primaryAccent,
      ...( { activeThemeId, globalThemeSettings: globalSettings } as any ),
    };

    onSaveLayout(layoutSettings);
    setHasChanges(false);
    setTimeout(() => {
      setIsSaving(false);
      onShowNotification('Tata letak etalase toko berhasil disimpan!');
    }, 200);
  };
  return (
    <>
      {/* ═══ MODE 1: LIBRARY (inside dashboard, with sidebar visible) ═══ */}
      {pageMode === 'library' && (
        <div className="h-full w-full bg-[#FAF7F7] font-sans animate-in fade-in duration-200 overflow-hidden">
          <ThemeLibraryView
            store={currentStore}
            products={products}
            onCustomize={() => setPageMode('editor')}
            onSelectTheme={(themeId) => {
              const storeTemplate = STORE_TEMPLATES.find(t => t.id === themeId);
              if (storeTemplate) {
                const newSections = storeTemplate.sections.map((s, idx) => ({
                  ...s,
                  key: s.key || `${s.id}-${idx}`,
                  order: s.order !== undefined ? s.order : idx,
                }));
                setSections(newSections);
                setSelectedSectionKey(newSections[0]?.key || null);
                setPrimaryAccent(storeTemplate.primaryAccent);
                handleUpdateStore({
                  bannerUrl: storeTemplate.bannerUrl,
                  tagline: storeTemplate.tagline,
                });
                onSaveLayout({
                  ...store.layoutSettings,
                  primaryAccent: storeTemplate.primaryAccent,
                  sections: newSections,
                });
                setHistory([newSections]);
                setHistoryIndex(0);
                const themeMap: Record<string, any> = {
                  'minimalist_clean': 'minimalist',
                  'gadget_tech': 'modern',
                  'futuristic_dark': 'futuristic',
                  'editorial_luxury': 'luxury',
                  'bold_market': 'bold',
                  'editorial_commerce': 'editorial',
                  'nature_organic': 'nature',
                  'creative_studio': 'creative',
                  'pro_corporate': 'professional',
                  'chic_fashion': 'fashion',
                };
                const mappedThemeId = themeMap[themeId] || themeId || 'minimalist';
                useCmsStore.getState().loadThemeData(mappedThemeId);
                onShowNotification(`Template "${storeTemplate.name}" berhasil diterapkan!`);
              }
            }}
            onPreviewTheme={(themeId) => {
              console.log('Previewing theme:', themeId);
            }}
            onPreviewTemplate={handlePreviewTemplate}
            onApplyTemplate={(template: TemplateGalleryItem) => {
              handleApplyAndEdit(template);
            }}
          />
        </div>
      )}

      {/* ═══ MODE 2: PREVIEW (fullscreen overlay, separate page) ═══ */}
      {pageMode === 'preview' && previewTemplate && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col font-sans animate-in fade-in duration-200">
          {/* Shopify Theme Store Top Bar */}
          {/* Preview Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0 z-50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setPageMode('library'); setPreviewTemplate(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-500 hover:text-gray-900"
                title="Kembali"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-200"></div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-none">{previewTemplate.name}</h2>
                <span className="text-xs text-gray-500 font-medium">Gratis • Multi-Page</span>
              </div>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              {([
                { mode: 'desktop' as const, icon: Monitor },
                { mode: 'tablet' as const, icon: Tablet },
                { mode: 'mobile' as const, icon: Smartphone },
              ]).map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setPreviewDevice(mode)}
                  className={`p-2 rounded-md transition cursor-pointer ${
                    previewDevice === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Action Buttons in Header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setPageMode('library'); setPreviewTemplate(null); }}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleApplyAndEdit(previewTemplate)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-black hover:bg-gray-800 transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>Coba & Edit Tema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODE 3: LOADING (fullscreen overlay with progress bar) ═══ */}
      {pageMode === 'loading' && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col font-sans">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-sm">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900">MicroCMS</span>
            </div>
          </div>

          {/* Loading Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="max-w-xl w-full text-center space-y-6">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto" />
              <p className="text-lg font-semibold text-gray-700">
                Menambahkan "{loadingTemplateName}" ke tema toko online Anda...
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${loadingProgress}%`,
                    background: 'linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)',
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-8 bg-[#66000E] text-white/70 text-sm">
            <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <h4 className="font-bold text-white mb-2">MicroCMS</h4>
                <p className="text-xs">Platform toko online #1 Indonesia</p>
              </div>
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Bantuan</h4>
                <p className="text-xs hover:text-white transition-colors cursor-pointer">Pusat Bantuan</p>
                <p className="text-xs hover:text-white transition-colors cursor-pointer mt-1">Dokumentasi API</p>
              </div>
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Kategori</h4>
                <p className="text-xs hover:text-white transition-colors cursor-pointer">Semua Tema</p>
                <p className="text-xs hover:text-white transition-colors cursor-pointer mt-1">Tema Gratis</p>
              </div>
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Tentang</h4>
                <p className="text-xs hover:text-white transition-colors cursor-pointer">Tim Kami</p>
                <p className="text-xs hover:text-white transition-colors cursor-pointer mt-1">Syarat Layanan</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODE 4: EDITOR (fullscreen overlay) ═══ */}
      {pageMode === 'editor' && (
        <div
          id="merchant-visual-layout-editor"
          className="fixed inset-0 z-[60] flex flex-col h-screen w-screen bg-[#FAF7F7] font-sans animate-in fade-in duration-200 overflow-hidden"
        >
          {/* 1. TOP BAR */}
          {/* 1. TOP BAR */}
          <EditorTopBar
            store={currentStore}
            hasChanges={hasChanges}
            deviceMode={deviceMode}
            onDeviceModeChange={setDeviceMode}
            onSave={handleSave}
            onReset={handleReset}
            onOpenStorefront={handleOpenPreviewTab}
            onBack={() => setPageMode('library')}
            isSaving={isSaving}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            activePage={activePage}
            onPageChange={setActivePage}
            onPublish={() => setIsPublishModalOpen(true)}
          />

          {/* 2. THREE-PANEL WORKSPACE */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 relative bg-[#F6F6F7]">
            {/* Left Panel: Sections List */}
            <div className={`lg:block ${selectedSectionKey && !isFullscreen ? 'hidden' : 'block'} h-full shrink-0 z-10`}>
              <LeftPanelSections
                sections={sections}
                selectedSectionKey={selectedSectionKey}
                onSelectSection={handleSelectSection}
                onToggleVisibility={handleToggleVisibility}
                onDuplicateSection={handleDuplicateSection}
                onDeleteSection={handleDeleteSection}
                onMoveSection={handleMoveSection}
                onRenameSection={handleRenameSection}
                onOpenAddModal={(cat) => {
                  setAddModalCategoryFilter(cat);
                  setIsAddModalOpen(true);
                }}
                activePage={activePage}
                onOpenThemeSettings={() => {
                  setShowGlobalSettings(true);
                  setSelectedSectionKey(null);
                }}
              />
            </div>

            {/* Center Panel: Live Responsive Storefront Preview Canvas */}
            <div className="flex-1 min-w-0 h-full flex flex-col relative z-0">
              <CenterPreviewCanvas
                store={currentStore}
                products={displayProducts}
                sections={sections}
                selectedSectionKey={selectedSectionKey}
                onSelectSection={handleSelectSection}
                deviceMode={deviceMode}
                onDeviceModeChange={setDeviceMode}
                primaryAccent={primaryAccent}
                onMoveSection={handleMoveSection}
                onToggleVisibility={handleToggleVisibility}
                onDeleteSection={handleDeleteSection}
                onUpdateSectionOptions={handleUpdateSectionOptions}
                onUpdateStore={handleUpdateStore}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                activeThemeId={activeThemeId}
                activePage={activePage}
                onPageChange={setActivePage}
              />
            </div>

            {/* Right Panel: Section Settings */}
            <div className={`lg:block ${(selectedSectionKey || showGlobalSettings) && !isFullscreen ? 'block absolute lg:relative right-0 inset-y-0 shadow-2xl lg:shadow-none' : 'hidden'} h-full shrink-0 z-20 w-[320px] bg-white border-l border-[#E1E3E5]`}>
              <RightPanelSettings
                store={currentStore}
                selectedSection={selectedSectionKey ? sections.find((s) => s.key === selectedSectionKey) || null : null}
                onUpdateSectionOptions={handleUpdateSectionOptions}
                onUpdateSectionTitle={handleRenameSection}
                onToggleVisibility={handleToggleVisibility}
                onDuplicateSection={handleDuplicateSection}
                onDeleteSection={handleDeleteSection}
                primaryAccent={primaryAccent}
                onChangePrimaryAccent={(color) => {
                  setPrimaryAccent(color);
                  setHasChanges(true);
                  setGlobalSettings({
                    ...globalSettings,
                    colors: { ...globalSettings.colors, primary: color }
                  });
                }}
                onBack={() => {
                  if (showGlobalSettings) {
                    setShowGlobalSettings(false);
                  } else {
                    setSelectedSectionKey(null);
                  }
                }}
                showGlobalSettings={showGlobalSettings}
                globalSettings={globalSettings}
                onUpdateGlobalSettings={(newSettings) => {
                  setGlobalSettings(newSettings);
                  setHasChanges(true);
                }}
              />
            </div>
          </div>

          {/* Modal: Add Section from catalog */}
          <AddSectionModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAddSection={handleAddSection}
          />

          {/* Wizard Modal */}
          {isWizardOpen && (
            <StoreLayoutSetupWizard
              currentStore={currentStore}
              onComplete={handleWizardComplete}
              onCancel={() => setIsWizardOpen(false)}
            />
          )}

          {/* Publish Store Modal */}
          <PublishStoreModal
            isOpen={isPublishModalOpen}
            onClose={() => setIsPublishModalOpen(false)}
            store={currentStore}
          />
        </div>
      )}
    </>
  );
};
