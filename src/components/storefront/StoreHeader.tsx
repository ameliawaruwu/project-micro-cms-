import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  MapPin,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Store as StoreType, StoreSectionOptions, NavMenuItem } from '../../types';
import { generateWhatsAppLink } from '../../utils/formatters';
import { DEFAULT_LANDING_NAV_ITEMS } from '../../utils/layoutConstants';

interface StoreHeaderProps {
  store: StoreType;
  cartCount: number;
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  showTopNotice?: boolean;
  topNoticeText?: string;
  headerOptions?: StoreSectionOptions;
  primaryAccent?: string;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onOpenCart: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  store,
  cartCount,
  categories,
  selectedCategory,
  searchQuery,
  showTopNotice = true,
  topNoticeText,
  headerOptions,
  primaryAccent = '#66000E',
  onSearchChange,
  onCategoryChange,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const opts: StoreSectionOptions = headerOptions || {};
  const sticky = opts.stickyHeader !== false;
  const style = opts.headerStyle || 'standard';
  const showLogo = opts.showLogo !== false;
  const showTagline = opts.showTagline !== false;
  const showNavMenu = opts.showNavMenu !== false;
  const navMenuType = opts.navMenuType || 'landing_style';
  const navItems: NavMenuItem[] =
    opts.navMenuItems && opts.navMenuItems.length > 0
      ? opts.navMenuItems
      : DEFAULT_LANDING_NAV_ITEMS;
  const showSearchBar = opts.showSearchBar !== false;
  const showCartBadge = opts.showCartBadge !== false;
  const showWhatsAppButton = opts.showWhatsAppButton !== false;

  const isBrandStyle = style === 'brand';
  const isMinimalStyle = style === 'minimal';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      const targetId = href.replace('#', '');
      const element =
        document.getElementById(targetId) ||
        document.getElementById(`preview-${targetId}`) ||
        document.querySelector(`[id*="${targetId}"]`);
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      id="beranda"
      className={`${
        sticky ? 'sticky top-0 z-30' : 'relative z-30'
      } font-sans transition-all duration-200 ${
        isBrandStyle
          ? 'text-white shadow-md'
          : isMinimalStyle
          ? 'bg-white/95 backdrop-blur-md border-b border-[#F0ECE9]'
          : 'bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] shadow-2xs'
      }`}
      style={isBrandStyle ? { backgroundColor: primaryAccent } : undefined}
    >
      {/* Top Banner / Store notice */}
      {showTopNotice && (
        <div
          className={`px-4 py-1.5 text-center text-xs font-medium flex items-center justify-center gap-2 ${
            isBrandStyle
              ? 'bg-black/25 text-white border-b border-white/10'
              : 'bg-[#66000E] text-white'
          }`}
          style={!isBrandStyle ? { backgroundColor: primaryAccent } : undefined}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate max-w-2xl">
            {topNoticeText || (
              <>
                Toko Online Resmi <strong>{store.name}</strong> • Pengiriman Aman Seluruh Indonesia
              </>
            )}
          </span>
        </div>
      )}

      {/* Main Header / Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 mr-4 lg:mr-8">
          {showLogo && (
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-2xs shrink-0 border ${
                isBrandStyle ? 'border-white/30 bg-white/10' : 'border-[#EAEAEA] bg-[#F7F7F7]'
              }`}
            >
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className="min-w-0">
            <a
              href="#beranda"
              onClick={(e) => handleNavClick(e, '#beranda')}
              className={`font-bold text-sm sm:text-base tracking-tight leading-tight line-clamp-1 block hover:opacity-85 transition whitespace-nowrap ${
                isBrandStyle ? 'text-white' : 'text-[#1F1F1F]'
              }`}
            >
              {store.name}
            </a>
            {showTagline && (
              <div
                className={`flex items-center gap-1 text-[11px] font-normal truncate max-w-[140px] sm:max-w-xs ${
                  isBrandStyle ? 'text-white/80' : 'text-[#777777]'
                }`}
              >
                <MapPin className={`w-3 h-3 shrink-0 ${isBrandStyle ? 'text-white' : 'text-[#66000E]'}`} />
                <span className="truncate">{store.city || store.tagline || 'Indonesia'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navbar Menu (Landing Page Links) */}
        {showNavMenu && (navMenuType === 'landing_style' || navMenuType === 'custom') && (
          <nav className="hidden lg:flex items-center justify-center flex-1 gap-1.5 xl:gap-3 px-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isBrandStyle
                    ? 'text-white/90 hover:bg-white/15 hover:text-white'
                    : 'text-[#4A4240] hover:text-[#66000E] hover:bg-[#FAF7F7]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}

        {/* Search Bar on Desktop */}
        {showSearchBar && (
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isBrandStyle ? 'text-white/60' : 'text-[#777777]'
              }`}
            />
            <input
              type="text"
              placeholder="Cari produk di toko..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs transition focus:outline-none focus:ring-2 ${
                isBrandStyle
                  ? 'bg-white/15 text-white placeholder-white/60 border border-white/20 focus:bg-white/25 focus:ring-white/40'
                  : 'bg-[#FAF7F7] text-[#1F1F1F] placeholder-[#888] border border-[#EAEAEA] focus:bg-white focus:ring-[#66000E]/20 focus:border-[#66000E]'
              }`}
            />
          </div>
        )}

        {/* Action Buttons: WhatsApp, Cart, Mobile Menu Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {showWhatsAppButton && (
            <a
              href={generateWhatsAppLink(
                store.phoneWhatsApp,
                `Halo ${store.name}, saya ingin bertanya mengenai katalog produk online.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-xs transition border cursor-pointer ${
                isBrandStyle
                  ? 'bg-white/15 text-white hover:bg-white/25 border-white/20'
                  : 'bg-[#ECFDF3] hover:bg-[#D1FADF] text-[#027A48] border-[#ABEFC6]'
              }`}
              title="Chat Toko via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Toko</span>
            </a>
          )}

          {/* Cart Button */}
          {showCartBadge && (
            <button
              type="button"
              onClick={onOpenCart}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-2xs transition cursor-pointer relative ${
                isBrandStyle
                  ? 'bg-white text-[#241A1A] hover:bg-white/90'
                  : 'bg-[#66000E] text-white hover:bg-[#801010]'
              }`}
              style={!isBrandStyle ? { backgroundColor: primaryAccent } : undefined}
              title="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Keranjang</span>
              {cartCount > 0 && (
                <span
                  className={`w-4.5 h-4.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    isBrandStyle ? 'bg-[#66000E] text-white' : 'bg-white text-[#66000E]'
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Button (Hamburger) */}
          {showNavMenu && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl border transition cursor-pointer ${
                isBrandStyle
                  ? 'text-white border-white/20 hover:bg-white/15'
                  : 'text-[#4A4240] border-[#E5E0DD] hover:bg-[#FAF7F7]'
              }`}
              title="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar if active */}
      {showSearchBar && (
        <div className="md:hidden px-4 pb-2.5">
          <div className="relative">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isBrandStyle ? 'text-white/60' : 'text-[#777777]'
              }`}
            />
            <input
              type="text"
              placeholder="Cari produk di toko..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs transition focus:outline-none ${
                isBrandStyle
                  ? 'bg-white/15 text-white placeholder-white/60 border border-white/20'
                  : 'bg-[#FAF7F7] text-[#1F1F1F] placeholder-[#888] border border-[#EAEAEA]'
              }`}
            />
          </div>
        </div>
      )}

      {/* Mobile Dropdown Menu Drawer */}
      {showNavMenu && mobileMenuOpen && (
        <div
          className={`lg:hidden border-t px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150 ${
            isBrandStyle
              ? 'bg-black/30 border-white/15 text-white'
              : 'bg-[#FAF7F7] border-[#EAEAEA] text-[#241A1A]'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-1">
            Navigasi Halaman
          </div>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isBrandStyle
                  ? 'hover:bg-white/15 text-white'
                  : 'hover:bg-white text-[#241A1A] border border-transparent hover:border-[#E5E0DD]'
              }`}
            >
              <span>{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </a>
          ))}
          {showWhatsAppButton && (
            <div className="pt-2">
              <a
                href={generateWhatsAppLink(
                  store.phoneWhatsApp,
                  `Halo ${store.name}, saya ingin bertanya mengenai katalog produk online.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[#ECFDF3] text-[#027A48] font-bold text-xs border border-[#ABEFC6]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Categories Bar (when navMenuType is categories or when categories are enabled) */}
      {(navMenuType === 'categories' || !showNavMenu) && (
        <div
          className={`border-t px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto custom-scrollbar flex items-center gap-1.5 ${
            isBrandStyle
              ? 'border-white/15 bg-black/15'
              : 'border-[#EAEAEA] bg-[#FEFEFE]'
          }`}
        >
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? isBrandStyle
                  ? 'bg-white text-[#66000E] shadow-2xs font-bold'
                  : 'bg-[#66000E] text-white shadow-2xs'
                : isBrandStyle
                ? 'text-white/80 hover:bg-white/10'
                : 'text-[#555555] hover:bg-[#F7F7F7] hover:text-[#1F1F1F]'
            }`}
          >
            Semua Produk
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? isBrandStyle
                    ? 'bg-white text-[#66000E] shadow-2xs font-bold'
                    : 'bg-[#66000E] text-white shadow-2xs'
                  : isBrandStyle
                  ? 'text-white/80 hover:bg-white/10'
                  : 'text-[#555555] hover:bg-[#F7F7F7] hover:text-[#1F1F1F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};


