import React, { useState } from 'react';
import {
  X,
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
  Check,
  Tag,
} from 'lucide-react';
import { StoreSectionType } from '../../types';
import { SECTION_TEMPLATES, SectionTemplateDef } from '../../utils/layoutConstants';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (template: SectionTemplateDef) => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'Semua Bagian' },
    { id: 'header_nav', label: 'Header & Pengumuman' },
    { id: 'hero_banner', label: 'Hero & Banner' },
    { id: 'products', label: 'Produk & Etalase' },
    { id: 'promotions', label: 'Promosi & Diskon' },
    { id: 'social_info', label: 'Bukti Sosial & Info' },
    { id: 'footer', label: 'Footer' },
  ];

  const getSectionIcon = (id: StoreSectionType) => {
    switch (id) {
      case 'announcement':
        return Sparkles;
      case 'header':
        return LayoutTemplate;
      case 'hero_banner':
        return LayoutTemplate;
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

  const filteredTemplates = SECTION_TEMPLATES.filter((t) => {
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#E5E0DD] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E0DD] flex items-center justify-between bg-[#FAF7F7]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#241A1A]">
              Tambah Bagian Baru ke Toko
            </h2>
            <p className="text-xs text-[#706866] mt-0.5">
              Pilih template bagian siap pakai untuk memperkaya etalase toko Anda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#706866] hover:text-[#241A1A] hover:bg-[#EAEAEA] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 border-b border-[#E5E0DD] space-y-3 bg-white">
          <input
            type="text"
            placeholder="Cari bagian (contoh: promo, ulasan, hero banner, produk)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] text-xs text-[#241A1A] placeholder-[#A8A09E] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-[#66000E] text-white shadow-2xs'
                    : 'bg-[#FAF7F7] text-[#706866] hover:bg-[#E5E0DD] hover:text-[#241A1A]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section List Grid */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2.5 bg-[#FAF7F7]">
          {filteredTemplates.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#706866] bg-white rounded-2xl border border-[#E5E0DD] p-6">
              Tidak ditemukan template bagian yang cocok dengan "{searchQuery}".
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const Icon = getSectionIcon(template.id);
              return (
                <div
                  key={template.id}
                  className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5E0DD] hover:border-[#66000E] hover:shadow-xs transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-[#241A1A]">
                          {template.title}
                        </h3>
                        {template.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAF7F7] text-[#66000E] border border-[#E6DDDA]">
                            {template.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-[#A8A09E] font-medium hidden sm:inline">
                          • {template.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#706866] mt-0.5 leading-relaxed">
                        {template.subtitle}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onAddSection(template);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF7F7] hover:bg-[#66000E] text-[#66000E] hover:text-white font-bold text-xs border border-[#E6DDDA] hover:border-[#66000E] transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#E5E0DD] bg-white flex items-center justify-between text-xs text-[#706866]">
          <span>Menampilkan {filteredTemplates.length} pilihan bagian</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#706866] hover:bg-[#FAF7F7] transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
