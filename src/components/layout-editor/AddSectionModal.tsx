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
import { HIDDEN_SECTION_IDS } from '../../themes/sectionResolver';
import { useLanguage } from '../../contexts/LanguageContext';

// Teks English untuk template bagian bawaan (teks Indonesia tetap dari SECTION_TEMPLATES).
const SECTION_TEMPLATE_EN: Partial<
  Record<string, { title: string; subtitle: string; categoryLabel: string; badge?: string }>
> = {
  announcement: {
    title: 'Announcement Bar',
    categoryLabel: 'Header & Notifications',
    subtitle: 'Promo & free shipping notification bar at the very top',
    badge: 'Conversion',
  },
  header: {
    title: 'Store Header & Navbar',
    categoryLabel: 'Header & Navigation',
    subtitle: 'Store logo, landing page / catalog navigation menu, quick search & cart',
    badge: 'Navigation',
  },
  hero_banner: {
    title: 'Main Hero Banner',
    categoryLabel: 'Banner & Main Display',
    subtitle: 'Opening visual banner with title, tagline, photo & action button',
    badge: 'Most Popular',
  },
  featured_products: {
    title: 'Featured Products',
    categoryLabel: 'Products & Collections',
    subtitle: 'Highlight best sellers, special promos, or seasonal collections',
    badge: 'Recommended',
  },
  product_grid: {
    title: 'Product Catalog (Product Grid)',
    categoryLabel: 'Products & Collections',
    subtitle: 'Main storefront with the full product list, category filter & search',
    badge: 'Main',
  },
  promo_banner: {
    title: 'Promotional Banner (Discounts & Flash Sale)',
    categoryLabel: 'Promotions & Offers',
    subtitle: 'Eye-catching promo banner with discount code, voucher & CTA button',
    badge: 'Sales',
  },
  store_benefits: {
    title: 'Store Benefits',
    categoryLabel: 'Info & Social Proof',
    subtitle: '3 guarantee pillars: 100% Genuine Products, Fast Shipping, and Trusted Service',
    badge: 'Trust',
  },
  testimonials: {
    title: 'Customer Reviews (Testimonials)',
    categoryLabel: 'Info & Social Proof',
    subtitle: 'Show real buyer testimonials and 5-star satisfaction',
    badge: 'Trust',
  },
  newsletter: {
    title: 'Newsletter & Promo Bulletin',
    categoryLabel: 'Promotions & Offers',
    subtitle: 'Subscription form for discount info, vouchers, and the latest catalog',
    badge: 'Lead Magnet',
  },
  store_info: {
    title: 'Store Info & Location',
    categoryLabel: 'Info & Social Proof',
    subtitle: 'Physical address, opening hours, contacts, and WhatsApp chat button',
    badge: 'Contact',
  },
  footer: {
    title: 'Store Footer',
    categoryLabel: 'Footer',
    subtitle: 'Copyright, important links, official courier info & payment methods',
    badge: 'Bottom',
  },
};

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
  const { isEn } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: isEn ? 'All Sections' : 'Semua Bagian' },
    { id: 'header_nav', label: isEn ? 'Header & Announcements' : 'Header & Pengumuman' },
    { id: 'hero_banner', label: 'Hero & Banner' },
    { id: 'products', label: isEn ? 'Products & Storefront' : 'Produk & Etalase' },
    { id: 'promotions', label: isEn ? 'Promotions & Discounts' : 'Promosi & Diskon' },
    { id: 'social_info', label: isEn ? 'Social Proof & Info' : 'Bukti Sosial & Info' },
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

  const localized = (t: SectionTemplateDef) => {
    const en = isEn ? SECTION_TEMPLATE_EN[t.id] : undefined;
    return en
      ? { title: en.title, subtitle: en.subtitle, categoryLabel: en.categoryLabel, badge: t.badge ? en.badge ?? t.badge : t.badge }
      : { title: t.title, subtitle: t.subtitle, categoryLabel: t.categoryLabel, badge: t.badge };
  };

  const filteredTemplates = SECTION_TEMPLATES.filter((t) => {
    if (HIDDEN_SECTION_IDS.has(t.id)) return false;
    const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const shown = localized(t);
    const matchSearch =
      shown.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shown.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shown.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-[#E5E0DD] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E0DD] flex items-center justify-between bg-[#FAF7F7]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#241A1A]">
              {isEn ? 'Add a New Section to the Store' : 'Tambah Bagian Baru ke Toko'}
            </h2>
            <p className="text-xs text-[#706866] mt-0.5">
              {isEn ? 'Pick a ready-made section template to enrich your storefront' : 'Pilih template bagian siap pakai untuk memperkaya etalase toko Anda'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : 'Tutup'}
            className="p-2 rounded-xl text-[#706866] hover:text-[#241A1A] hover:bg-[#EAEAEA] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 border-b border-[#E5E0DD] space-y-3 bg-white">
          <input
            type="text"
            placeholder={isEn ? 'Search sections (e.g. promo, reviews, hero banner, products)...' : 'Cari bagian (contoh: promo, ulasan, hero banner, produk)...'}
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
              {isEn
                ? `No section templates match "${searchQuery}".`
                : `Tidak ditemukan template bagian yang cocok dengan "${searchQuery}".`}
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const Icon = getSectionIcon(template.id);
              const shown = localized(template);
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
                          {shown.title}
                        </h3>
                        {shown.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAF7F7] text-[#66000E] border border-[#E6DDDA]">
                            {shown.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-[#A8A09E] font-medium hidden sm:inline">
                          • {shown.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#706866] mt-0.5 leading-relaxed">
                        {shown.subtitle}
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
                    <span>{isEn ? 'Add' : 'Tambahkan'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[#E5E0DD] bg-white flex items-center justify-between text-xs text-[#706866]">
          <span>{isEn ? `Showing ${filteredTemplates.length} section options` : `Menampilkan ${filteredTemplates.length} pilihan bagian`}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#706866] hover:bg-[#FAF7F7] transition cursor-pointer"
          >
            {isEn ? 'Close' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};
