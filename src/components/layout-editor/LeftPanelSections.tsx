import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Sparkles,
  LayoutTemplate,
  Star,
  Grid,
  ShieldCheck,
  MessageSquare,
  Mail,
  MapPin,
  Flame,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Edit2,
  Tag,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { StoreSectionConfig, StoreSectionType } from '../../types';

interface LeftPanelSectionsProps {
  sections: StoreSectionConfig[];
  selectedSectionKey: string | null;
  onSelectSection: (key: string) => void;
  onToggleVisibility: (key: string) => void;
  onDuplicateSection: (key: string) => void;
  onDeleteSection: (key: string) => void;
  onMoveSection: (fromIndex: number, toIndex: number) => void;
  onRenameSection?: (key: string, newTitle: string) => void;
  onOpenAddModal: (categoryFilter?: string) => void;
}

export const LeftPanelSections: React.FC<LeftPanelSectionsProps> = ({
  sections,
  selectedSectionKey,
  onSelectSection,
  onToggleVisibility,
  onDuplicateSection,
  onDeleteSection,
  onMoveSection,
  onRenameSection,
  onOpenAddModal,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [editingTitleKey, setEditingTitleKey] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuKey(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSectionIcon = (id: StoreSectionType) => {
    switch (id) {
      case 'announcement':
        return Sparkles;
      case 'header':
        return LayoutTemplate;
      case 'hero_banner':
        return LayoutTemplate;
      case 'search_category':
        return Grid;
      case 'featured_products':
        return Star;
      case 'product_grid':
        return Grid;
      case 'promo_banner':
        return Flame;
      case 'store_benefits':
        return ShieldCheck;
      case 'testimonials':
        return MessageSquare;
      case 'newsletter':
        return Mail;
      case 'store_info':
        return MapPin;
      case 'footer':
        return Tag;
      default:
        return LayoutTemplate;
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      onMoveSection(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Categorize sections for Shopify-style grouping (Header, Template, Footer)
  const headerSectionIds = ['announcement', 'header'];
  const footerSectionIds = ['store_info', 'footer'];

  const headerSections = sections.filter((s) => headerSectionIds.includes(s.id));
  const templateSections = sections.filter(
    (s) => !headerSectionIds.includes(s.id) && !footerSectionIds.includes(s.id)
  );
  const footerSections = sections.filter((s) => footerSectionIds.includes(s.id));

  // Render a single section item
  const renderSectionItem = (sec: StoreSectionConfig, globalIndex: number) => {
    const sectionKey = sec.key || `${sec.id}-${globalIndex}`;
    const isSelected = selectedSectionKey === sectionKey;
    const isDragging = draggedIndex === globalIndex;
    const isDragOver = dragOverIndex === globalIndex;
    const isMenuOpen = openMenuKey === sectionKey;
    const isEditing = editingTitleKey === sectionKey;
    const Icon = getSectionIcon(sec.id);

    return (
      <div
        key={sectionKey}
        draggable
        onDragStart={(e) => handleDragStart(e, globalIndex)}
        onDragOver={(e) => handleDragOver(e, globalIndex)}
        onDrop={(e) => handleDrop(e, globalIndex)}
        onDragEnd={handleDragEnd}
        onClick={() => onSelectSection(sectionKey)}
        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition select-none cursor-pointer ${
          isSelected
            ? 'bg-[#F2ECE9] text-[#241A1A] font-semibold border-l-3 border-[#66000E] shadow-2xs'
            : 'text-[#5A5250] hover:bg-[#FAF7F7] hover:text-[#241A1A]'
        } ${!sec.isVisible ? 'opacity-55 line-through decoration-[#A8A09E]' : ''} ${
          isDragging ? 'opacity-30 border border-dashed border-[#66000E]' : ''
        } ${isDragOver ? 'border-t-2 border-[#66000E]' : ''}`}
      >
        {/* Left icon & title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Drag grip handle */}
          <div
            className="cursor-grab text-[#A8A09E] hover:text-[#241A1A] active:cursor-grabbing p-0.5"
            title="Tarik untuk mengubah urutan"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
              isSelected ? 'text-[#66000E]' : 'text-[#706866]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>

          {/* Section title (or inline rename input) */}
          {isEditing ? (
            <input
              type="text"
              value={tempTitle}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (onRenameSection && tempTitle.trim()) {
                    onRenameSection(sectionKey, tempTitle.trim());
                  }
                  setEditingTitleKey(null);
                } else if (e.key === 'Escape') {
                  setEditingTitleKey(null);
                }
              }}
              onBlur={() => {
                if (onRenameSection && tempTitle.trim()) {
                  onRenameSection(sectionKey, tempTitle.trim());
                }
                setEditingTitleKey(null);
              }}
              className="px-1.5 py-0.5 text-xs bg-white border border-[#66000E] rounded text-[#241A1A] w-full focus:outline-none"
            />
          ) : (
            <span className="truncate text-xs tracking-tight">
              {sec.title}
            </span>
          )}
        </div>

        {/* Right actions: Eye visibility & Three-dot menu */}
        <div
          className="flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Visibility Eye Toggle */}
          <button
            type="button"
            onClick={() => onToggleVisibility(sectionKey)}
            className={`p-1 rounded-md transition ${
              sec.isVisible
                ? 'text-[#706866] hover:text-[#241A1A] hover:bg-white/80 opacity-0 group-hover:opacity-100'
                : 'text-amber-700 bg-amber-50 opacity-100'
            }`}
            title={sec.isVisible ? 'Sembunyikan Bagian' : 'Tampilkan Bagian'}
          >
            {sec.isVisible ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Three-dot dropdown menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenuKey(isMenuOpen ? null : sectionKey)}
              className="p-1 rounded-md text-[#706866] hover:text-[#241A1A] hover:bg-white/80 transition opacity-0 group-hover:opacity-100"
              title="Opsi Bagian"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Context Dropdown Menu */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-[#E5E0DD] py-1 z-50 text-xs text-[#241A1A] animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Rename */}
                <button
                  type="button"
                  onClick={() => {
                    setTempTitle(sec.title);
                    setEditingTitleKey(sectionKey);
                    setOpenMenuKey(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#FAF7F7] text-[#241A1A]"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#706866]" />
                  <span>Ubah Nama</span>
                </button>

                {/* Move Up */}
                {globalIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onMoveSection(globalIndex, globalIndex - 1);
                      setOpenMenuKey(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#FAF7F7] text-[#241A1A]"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-[#706866]" />
                    <span>Pindah ke Atas</span>
                  </button>
                )}

                {/* Move Down */}
                {globalIndex < sections.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      onMoveSection(globalIndex, globalIndex + 1);
                      setOpenMenuKey(null);
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#FAF7F7] text-[#241A1A]"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-[#706866]" />
                    <span>Pindah ke Bawah</span>
                  </button>
                )}

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => {
                    onDuplicateSection(sectionKey);
                    setOpenMenuKey(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#FAF7F7] text-[#241A1A]"
                >
                  <Copy className="w-3.5 h-3.5 text-[#706866]" />
                  <span>Duplikasi</span>
                </button>

                <div className="border-t border-[#F2ECE9] my-1" />

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => {
                    onDeleteSection(sectionKey);
                    setOpenMenuKey(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Section</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-72 xl:w-80 bg-white border-r border-[#E5E0DD] flex flex-col h-full shrink-0 font-sans shadow-2xs select-none">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-[#E5E0DD] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-[#241A1A] tracking-tight uppercase">
            Halaman Utama
          </h2>
          <span className="text-[10px] font-semibold text-[#706866] bg-[#FAF7F7] px-2 py-0.5 rounded-full border border-[#E5E0DD]">
            {sections.length} Bagian
          </span>
        </div>
      </div>

      {/* Sections List */}
      <div className="p-3 space-y-4 overflow-y-auto custom-scrollbar flex-1">
        {/* GROUP 1: Header Group */}
        {headerSections.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-[#706866] uppercase tracking-wider flex items-center justify-between">
              <span>Header</span>
            </div>
            <div className="space-y-0.5">
              {headerSections.map((sec) => {
                const globalIndex = sections.findIndex(
                  (s, idx) => (s.key || `${s.id}-${idx}`) === (sec.key || `${sec.id}-${idx}`)
                );
                return renderSectionItem(sec, globalIndex !== -1 ? globalIndex : 0);
              })}
            </div>
          </div>
        )}

        {/* GROUP 2: Template / Main Content Group */}
        <div className="space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold text-[#706866] uppercase tracking-wider flex items-center justify-between">
            <span>Template</span>
          </div>

          <div className="space-y-0.5">
            {templateSections.map((sec) => {
              const globalIndex = sections.findIndex(
                (s, idx) => (s.key || `${s.id}-${idx}`) === (sec.key || `${sec.id}-${idx}`)
              );
              return renderSectionItem(sec, globalIndex !== -1 ? globalIndex : 0);
            })}
          </div>

          {/* Add Section Button inside Template */}
          <button
            type="button"
            onClick={() => onOpenAddModal('main')}
            className="w-full mt-2.5 py-2.5 px-3 rounded-xl border border-dashed border-[#D5CEC9] hover:border-[#66000E] text-[#66000E] hover:bg-[#FAF7F7] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Section</span>
          </button>
        </div>

        {/* GROUP 3: Footer Group */}
        {footerSections.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-[#F2ECE9]">
            <div className="px-2 py-1 text-[11px] font-bold text-[#706866] uppercase tracking-wider flex items-center justify-between">
              <span>Footer</span>
            </div>
            <div className="space-y-0.5">
              {footerSections.map((sec) => {
                const globalIndex = sections.findIndex(
                  (s, idx) => (s.key || `${s.id}-${idx}`) === (sec.key || `${sec.id}-${idx}`)
                );
                return renderSectionItem(sec, globalIndex !== -1 ? globalIndex : 0);
              })}
            </div>
          </div>
        )}
      </div>

      {/* Global Add Section Bottom Bar */}
      <div className="p-3 border-t border-[#E5E0DD] bg-[#FAF7F7]">
        <button
          type="button"
          onClick={() => onOpenAddModal()}
          className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#F2ECE9] border border-[#E5E0DD] text-[#241A1A] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 text-[#66000E]" />
          <span>Tambah Bagian Baru</span>
        </button>
      </div>
    </aside>
  );
};
