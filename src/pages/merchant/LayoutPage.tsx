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
} from '../../utils/layoutConstants';
import { EditorTopBar } from '../../components/layout-editor/EditorTopBar';
import { LeftPanelSections } from '../../components/layout-editor/LeftPanelSections';
import { CenterPreviewCanvas } from '../../components/layout-editor/CenterPreviewCanvas';
import { RightPanelSettings } from '../../components/layout-editor/RightPanelSettings';
import { AddSectionModal } from '../../components/layout-editor/AddSectionModal';
import { StoreLayoutSetupWizard } from '../../components/layout-editor/StoreLayoutSetupWizard';

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

  useEffect(() => {
    setCurrentStore(store);
  }, [store]);

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

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen) {
      onShowNotification('Mode Layar Penuh aktif. Tekan Esc atau tombol Layar Penuh untuk keluar.');
    }
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
      themeStyle: store.layoutSettings?.themeStyle || 'minimal',
      primaryAccent,
    };

    onSaveLayout(layoutSettings);
    setHasChanges(false);
    setTimeout(() => {
      setIsSaving(false);
      onShowNotification('Tata letak etalase toko berhasil disimpan!');
    }, 200);
  };

  return (
    <div
      id="merchant-visual-layout-editor"
      className={`flex flex-col ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen bg-[#FAF7F7]'
          : 'h-full w-full min-h-[640px] bg-[#FAF7F7]'
      } font-sans animate-in fade-in duration-200 overflow-hidden`}
    >
      {/* 1. TOP BAR */}
      <EditorTopBar
        store={currentStore}
        hasChanges={hasChanges}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        onSave={handleSave}
        onReset={handleReset}
        onOpenStorefront={onOpenStorefront}
        onBack={onBack ? onBack : () => onShowNotification('Navigasi kembali')}
        onOpenWizard={() => setIsWizardOpen(true)}
        activePreset={activePreset}
        onApplyPreset={handleApplyPreset}
        isSaving={isSaving}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* 2. THREE-PANEL WORKSPACE (Left: Sections, Center: Live Canvas, Right: Contextual Settings) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 relative">
        {/* Left Panel: Sections List & Reordering */}
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
        />

        {/* Center Panel: Live Responsive Storefront Preview Canvas */}
        <CenterPreviewCanvas
          store={currentStore}
          products={products}
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
        />

        {/* Right Panel: Contextual Inspector & Options Settings */}
        <RightPanelSettings
          store={currentStore}
          selectedSection={selectedSection}
          onUpdateSectionOptions={handleUpdateSectionOptions}
          onUpdateSectionTitle={handleUpdateSectionTitle}
          onToggleVisibility={handleToggleVisibility}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
          primaryAccent={primaryAccent}
          onChangePrimaryAccent={(col) => {
            setPrimaryAccent(col);
            setHasChanges(true);
          }}
        />
      </div>

      {/* Modal: Add Section from catalog */}
      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={handleAddSection}
      />

      {/* Wizard Modal: Store Identity, Template Selection, and Web Generator */}
      {isWizardOpen && (
        <StoreLayoutSetupWizard
          currentStore={currentStore}
          onComplete={handleWizardComplete}
          onCancel={() => setIsWizardOpen(false)}
        />
      )}
    </div>
  );
};
