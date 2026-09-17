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
  Settings,
  Image,
  Type,
  Play,
  Megaphone,
  Search,
  Columns,
  Minus,
  AlignLeft,
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
  onOpenThemeSettings?: () => void;
  activePage?: string;
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
  onOpenThemeSettings,
  activePage = 'homepage',
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [editingTitleKey, setEditingTitleKey] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const menuRef = useRef<HTMLDivElement>(null);

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
    const iconMap: Record<string, any> = {
      'announcement': Megaphone,
      'header': LayoutTemplate,
      'hero_banner': Image,
      'search_category': Search,
      'featured_products': Star,
      'product_grid': Grid,
      'promo_banner': Flame,
      'store_benefits': ShieldCheck,
      'testimonials': MessageSquare,
      'newsletter': Mail,
      'store_info': MapPin,
      'footer': Tag,
      'rich_text': AlignLeft,
      'image_with_text': Image,
      'gallery': Image,
      'video': Play,
      'cta': Flame,
      'countdown': Sparkles,
      'spacer': Minus,
      'divider': Minus,
      'columns': Columns,
      'contact': MapPin,
    };
    return iconMap[id] || LayoutTemplate;
  };

  const getSectionLabel = (sec: StoreSectionConfig) => {
    if (sec.title) return sec.title;
    const labelMap: Record<string, string> = {
      'announcement': 'Pengumuman',
      'header': 'Header & Navbar',
      'hero_banner': 'Hero Banner',
      'search_category': 'Pencarian & Kategori',
      'featured_products': 'Produk Unggulan',
      'product_grid': 'Katalog Produk',
      'promo_banner': 'Banner Promo',
      'store_benefits': 'Keunggulan Toko',
      'testimonials': 'Ulasan Pelanggan',
      'newsletter': 'Newsletter',
      'store_info': 'Info Toko',
      'footer': 'Footer',
      'rich_text': 'Teks Kaya',
      'image_with_text': 'Gambar & Teks',
      'gallery': 'Galeri',
      'video': 'Video',
      'cta': 'Call to Action',
      'countdown': 'Countdown',
      'spacer': 'Spacer',
      'divider': 'Divider',
      'columns': 'Kolom',
      'contact': 'Kontak',
    };
    return labelMap[sec.id] || sec.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Categorize sections
  const headerSectionIds = ['announcement', 'header'];
  const footerSectionIds = ['store_info', 'footer'];

  const headerSections = sections.filter((s) => headerSectionIds.includes(s.id));
  const contentSections = sections.filter(
    (s) => !headerSectionIds.includes(s.id) && !footerSectionIds.includes(s.id)
  );
  const footerSections = sections.filter((s) => footerSectionIds.includes(s.id));

  // Render section item
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
        className={`group relative flex items-center gap-1.5 px-2 py-[7px] rounded-lg text-[13px] transition select-none cursor-pointer ${
          isSelected
            ? 'bg-[#F1F8FF] text-[#2C6ECB] font-semibold'
            : 'text-[#202223] hover:bg-[#F6F6F7]'
        } ${!sec.isVisible ? 'opacity-40' : ''} ${
          isDragging ? 'opacity-20' : ''
        } ${isDragOver ? 'ring-1 ring-[#2C6ECB] ring-offset-1' : ''}`}
      >
        {/* Drag handle */}
        <div
          className="cursor-grab active:cursor-grabbing text-[#C9CCCF] hover:text-[#8C9196] p-0.5 opacity-0 group-hover:opacity-100 transition shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3" />
        </div>

        {/* Icon */}
        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
          isSelected ? 'text-[#2C6ECB]' : 'text-[#8C9196]'
        }`}>
          <Icon className="w-3.5 h-3.5" />
        </div>

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={tempTitle}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setTempTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (onRenameSection && tempTitle.trim()) onRenameSection(sectionKey, tempTitle.trim());
                setEditingTitleKey(null);
              } else if (e.key === 'Escape') {
                setEditingTitleKey(null);
              }
            }}
            onBlur={() => {
              if (onRenameSection && tempTitle.trim()) onRenameSection(sectionKey, tempTitle.trim());
              setEditingTitleKey(null);
            }}
            className="flex-1 px-1.5 py-0.5 text-[13px] bg-white border border-[#2C6ECB] rounded text-[#202223] focus:outline-none min-w-0"
          />
        ) : (
          <span className={`flex-1 truncate text-[13px] ${!sec.isVisible ? 'line-through' : ''}`}>
            {getSectionLabel(sec)}
          </span>
        )}

        {/* Right: visibility + menu */}
        <div className="flex items-center gap-0 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onToggleVisibility(sectionKey)}
            className={`p-1 rounded transition ${
              sec.isVisible
                ? 'text-[#C9CCCF] hover:text-[#202223] opacity-0 group-hover:opacity-100'
                : 'text-amber-600 opacity-100'
            }`}
            title={sec.isVisible ? 'Sembunyikan' : 'Tampilkan'}
          >
            {sec.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenuKey(isMenuOpen ? null : sectionKey)}
              className="p-1 rounded text-[#C9CCCF] hover:text-[#202223] transition opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-[#E1E3E5] py-1 z-50 text-[13px] text-[#202223] animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  onClick={() => { setTempTitle(sec.title || getSectionLabel(sec)); setEditingTitleKey(sectionKey); setOpenMenuKey(null); }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-[#F6F6F7]"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8C9196]" /> Ubah Nama
                </button>
                {globalIndex > 0 && (
                  <button
                    onClick={() => { onMoveSection(globalIndex, globalIndex - 1); setOpenMenuKey(null); }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-[#F6F6F7]"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-[#8C9196]" /> Pindah ke Atas
                  </button>
                )}
                {globalIndex < sections.length - 1 && (
                  <button
                    onClick={() => { onMoveSection(globalIndex, globalIndex + 1); setOpenMenuKey(null); }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-[#F6F6F7]"
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-[#8C9196]" /> Pindah ke Bawah
                  </button>
                )}
                <button
                  onClick={() => { onDuplicateSection(sectionKey); setOpenMenuKey(null); }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-[#F6F6F7]"
                >
                  <Copy className="w-3.5 h-3.5 text-[#8C9196]" /> Duplikasi
                </button>
                <div className="border-t border-[#E1E3E5] my-1" />
                <button
                  onClick={() => { onDeleteSection(sectionKey); setOpenMenuKey(null); }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render group
  const renderGroup = (groupId: string, label: string, groupSections: StoreSectionConfig[]) => {
    if (groupSections.length === 0) return null;
    const isCollapsed = collapsedGroups[groupId];

    return (
      <div key={groupId}>
        <button
          onClick={() => toggleGroup(groupId)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold text-[#8C9196] uppercase tracking-wider hover:text-[#202223] transition cursor-pointer"
        >
          <span>{label}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
        </button>

        {!isCollapsed && (
          <div className="space-y-0.5">
            {groupSections.map((sec) => {
              const globalIndex = sections.indexOf(sec);
              return renderSectionItem(sec, globalIndex !== -1 ? globalIndex : 0);
            })}
          </div>
        )}
      </div>
    );
  };

  const pageLabel = activePage === 'homepage' ? 'Halaman Utama' :
    activePage === 'catalog' ? 'Katalog Produk' :
    activePage === 'product' ? 'Detail Produk' :
    activePage === 'about' ? 'Tentang Toko' : 'Halaman';

  return (
    <aside className="w-full lg:w-[280px] bg-white border-r border-[#E1E3E5] flex flex-col h-full shrink-0 font-sans select-none">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E1E3E5]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-bold text-[#202223]">{pageLabel}</h2>
            <p className="text-[11px] text-[#8C9196] mt-0.5">
              {sections.filter(s => s.isVisible).length} dari {sections.length} bagian aktif
            </p>
          </div>
          {onOpenThemeSettings && (
            <button
              onClick={onOpenThemeSettings}
              className="p-1.5 rounded-lg text-[#8C9196] hover:text-[#202223] hover:bg-[#F6F6F7] transition cursor-pointer"
              title="Pengaturan Tema"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-3">
        {renderGroup('header', 'Header', headerSections)}
        {renderGroup('content', 'Konten', contentSections)}
        {renderGroup('footer', 'Footer', footerSections)}
      </div>

      {/* Add Section Button */}
      <div className="p-3 border-t border-[#E1E3E5] bg-[#FAFAFA]">
        <button
          type="button"
          onClick={() => onOpenAddModal()}
          className="w-full py-2.5 rounded-lg border border-dashed border-[#C9CCCF] hover:border-[#2C6ECB] text-[#2C6ECB] hover:bg-[#F1F8FF] text-[13px] font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Bagian
        </button>
      </div>
    </aside>
  );
};
