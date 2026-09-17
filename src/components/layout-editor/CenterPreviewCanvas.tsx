import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Search,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  HeartHandshake,
  MessageCircle,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  ArrowUp,
  ArrowDown,
  EyeOff,
  Trash2,
  Edit3,
  Menu,
  X,
  ChevronRight,
  Globe,
  Lock,
  Home,
  Grid,
  Maximize2,
  Minimize2,
  ShoppingCart,
  Check,
} from 'lucide-react';
import { Store, StoreSectionConfig, Product, StoreSectionOptions, NavMenuItem } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { DEFAULT_LANDING_NAV_ITEMS } from '../../utils/layoutConstants';
import { InlineEditableText } from './InlineEditableText';
import { InlineEditableImage } from './InlineEditableImage';
import { InlineEditableButton } from './InlineEditableButton';
import { ThemeId, ThemeRegistry, normalizeThemeId } from '../../themes/ThemeRegistry';
import { ThemeSectionRenderer } from './ThemeSectionRenderer';
import { ShopPage, ProductDetailPage, CartPage, AboutPage, CheckoutPage, OrdersPage, ProfilePage, LoginPage, ContactPage } from '../../themes/pages';

const hasThemeComponent = (themeId: any, sectionId: string) => {
  const normalizedId = normalizeThemeId(themeId);
  const theme = ThemeRegistry[normalizedId] || ThemeRegistry[themeId as ThemeId];
  if (!theme) return false;
  const specialMap: Record<string, string> = {
    'header': 'Navbar',
    'hero_banner': 'Hero',
    'footer': 'Footer',
    'featured_products': 'FeaturedProducts',
    'product_grid': 'FeaturedProducts',
  };
  const toPascalCase = (str: string) => str.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toUpperCase());
  const componentName = specialMap[sectionId] || toPascalCase(sectionId);
  return !!theme[componentName];
};

interface CenterPreviewCanvasProps {
  store: Store;
  products: any[];
  sections: StoreSectionConfig[];
  selectedSectionKey: string | null;
  onSelectSection: (key: string) => void;
  deviceMode: 'desktop' | 'tablet' | 'mobile';
  onDeviceModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  primaryAccent: string;
  onMoveSection?: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility?: (key: string) => void;
  onDeleteSection?: (key: string) => void;
  onUpdateSectionOptions?: (key: string, newOptions: Partial<StoreSectionOptions>) => void;
  onUpdateStore?: (updates: Partial<Store>) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  readonly?: boolean;
  activeThemeId?: ThemeId;
  activePage?: string;
  onPageChange?: (page: string) => void;
}

export const CenterPreviewCanvas: React.FC<CenterPreviewCanvasProps> = ({
  store,
  products,
  sections,
  selectedSectionKey,
  onSelectSection,
  deviceMode,
  onDeviceModeChange,
  primaryAccent,
  onMoveSection,
  onToggleVisibility,
  onDeleteSection,
  onUpdateSectionOptions,
  onUpdateStore,
  isFullscreen = false,
  onToggleFullscreen,
  readonly = false,
  activeThemeId,
  activePage = 'homepage',
  onPageChange,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('Semua');
  const [searchPreviewQuery, setSearchPreviewQuery] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const isMobile = deviceMode === 'mobile';
  const isTablet = deviceMode === 'tablet';
  const isDesktop = deviceMode === 'desktop';

  const visibleSections = sections.filter((s) => s.isVisible);

  // Derive unique categories from product list
  const categories = ['Semua', ...Array.from(new Set(products.map((p: any) => p.category || p.categoryName).filter(Boolean)))];

  const filteredProducts = products.filter((p: any) => {
    const pCategory = p.category || p.categoryName;
    const matchCat = activeCategoryFilter === 'Semua' || pCategory === activeCategoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(searchPreviewQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchPreviewQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleNavClick = (href: string, anchorText?: string) => {
    const cleanHref = (href || '').toLowerCase().trim();
    const text = (anchorText || '').toLowerCase().trim();

    // 1. Homepage / Beranda
    if (cleanHref === '/' || cleanHref === '/beranda' || cleanHref === '#beranda' || text === 'beranda' || text === 'home') {
      if (onPageChange) onPageChange('homepage');
      const el = document.getElementById('preview-hero_banner');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // 2. Katalog / Shop / Products / Collection / Drops / Gadget / Wearables / Fine Necklaces
    if (
      cleanHref.includes('/katalog') || cleanHref.includes('/products') || cleanHref.includes('/catalog') || cleanHref === '#katalog' ||
      text.includes('shop') || text.includes('katalog') || text.includes('produk') || text.includes('collection') || text.includes('drop') || 
      text.includes('gadget') || text.includes('jewelry') || text.includes('new arrival') || text.includes('explore') || text.includes('koleksi') || text.includes('etalase')
    ) {
      if (onPageChange) onPageChange('katalog');
      return;
    }

    // 3. Product Detail
    if (cleanHref.includes('/product/')) {
      if (onPageChange) onPageChange('product');
      return;
    }

    // 4. About / Philosophy / Brand Story / Story / Archive / Kisah Kami / B2B / Craftsmanship
    if (
      cleanHref.includes('/about') || cleanHref.includes('/tentang') || cleanHref.includes('/archive') || cleanHref === '#about' ||
      text.includes('about') || text.includes('tentang') || text.includes('philosophy') || text.includes('story') || text.includes('archive') || 
      text.includes('kisah kami') || text.includes('b2b') || text.includes('craftsmanship') || text.includes('behind the scenes') || text.includes('brand')
    ) {
      if (onPageChange) onPageChange('about');
      return;
    }

    // 5. Contact / Support / Bantuan / Store Locator / Private Fitting
    if (
      cleanHref.includes('/contact') || cleanHref.includes('/kontak') || cleanHref === '#kontak' ||
      text.includes('kontak') || text.includes('contact') || text.includes('support') || text.includes('bantuan') || 
      text.includes('store locator') || text.includes('fitting')
    ) {
      if (onPageChange) onPageChange('contact');
      return;
    }

    // 6. Cart / Keranjang
    if (
      cleanHref.includes('/cart') || cleanHref.includes('/keranjang') || cleanHref === '#cart' ||
      text.includes('cart') || text.includes('keranjang')
    ) {
      if (onPageChange) onPageChange('cart');
      return;
    }

    // 7. Checkout / Bayar
    if (
      cleanHref.includes('/checkout') || cleanHref === '#checkout' ||
      text.includes('checkout') || text.includes('bayar')
    ) {
      if (onPageChange) onPageChange('checkout');
      return;
    }

    // 8. Orders / Pesanan / Status
    if (
      cleanHref.includes('/orders') || cleanHref.includes('/pesanan') || cleanHref === '#orders' ||
      text.includes('orders') || text.includes('pesanan')
    ) {
      if (onPageChange) onPageChange('orders');
      return;
    }

    // 9. Profile / Profil / Account / User
    if (
      cleanHref.includes('/profile') || cleanHref.includes('/profil') || cleanHref === '#profile' ||
      text.includes('profile') || text.includes('profil') || text.includes('akun')
    ) {
      if (onPageChange) onPageChange('profile');
      return;
    }

    // 10. Login / Masuk
    if (
      cleanHref.includes('/login') || cleanHref === '#login' ||
      text.includes('login') || text.includes('masuk')
    ) {
      if (onPageChange) onPageChange('login');
      return;
    }

    // 11. Journal / Berita / Stories / Lookbook / Resep
    if (
      cleanHref.includes('/berita') || cleanHref.includes('/lookbook') || cleanHref.includes('/journal') ||
      text.includes('journal') || text.includes('berita') || text.includes('lookbook') || text.includes('resep')
    ) {
      const lookbookSec = sections.find(s => s.id === 'lookbook' || s.id === 'journal');
      if (lookbookSec) {
        if (onPageChange && activePage !== 'homepage') onPageChange('homepage');
        const idx = sections.indexOf(lookbookSec);
        const secKey = lookbookSec.key || `${lookbookSec.id}-${idx}`;
        setTimeout(() => {
          const el = document.getElementById(`preview-${secKey}`);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
      if (onPageChange) onPageChange('about');
      return;
    }

    // Hash section scroll fallback
    if (cleanHref.startsWith('#')) {
      const targetId = cleanHref.replace('#', '');
      const targetSec = sections.find(s => s.id === targetId || (s.id && s.id.includes(targetId)));
      if (targetSec) {
        const idx = sections.indexOf(targetSec);
        const secKey = targetSec.key || `${targetSec.id}-${idx}`;
        const el = document.getElementById(`preview-${secKey}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }

    // Default fallback: navigate to katalog
    if (onPageChange) onPageChange('katalog');
  };

  // Intercept anchor and button clicks to fake routing
  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    const button = target.closest('button');

    if (anchor) {
      e.preventDefault();
      const href = anchor.getAttribute('href') || '';
      const text = anchor.textContent || '';
      handleNavClick(href, text);
      return;
    }

    if (button) {
      const href = button.getAttribute('data-href') || button.getAttribute('href') || '';
      const text = button.textContent || '';
      handleNavClick(href, text);
      return;
    }
  };

  const handleUpdateOption = (sectionKey: string, partial: Partial<StoreSectionOptions>) => {
    if (onUpdateSectionOptions) {
      onUpdateSectionOptions(sectionKey, partial);
    }
  };

  const renderPageCustomContent = (pageId: string) => {
    if (pageId === 'homepage') return null;

    if (pageId === 'catalog' || pageId === 'katalog') {
      return (
        <ShopPage 
          themeId={activeThemeId}
          store={store}
          products={products}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    if (pageId === 'product') {
      return (
        <ProductDetailPage 
          themeId={activeThemeId}
          store={store}
          products={products}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    if (pageId === 'cart') {
      return (
        <CartPage 
          themeId={activeThemeId}
          store={store}
          products={products}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    if (pageId === 'about') {
      return (
        <AboutPage 
          themeId={activeThemeId}
          store={store}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    if (pageId === 'checkout' || pageId === 'thank_you') {
      return (
        <CheckoutPage 
          themeId={activeThemeId}
          store={store}
          products={products}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    if (pageId === 'orders' || pageId === 'order_status') {
      return (
        <OrdersPage 
          themeId={activeThemeId}
          store={store}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    if (pageId === 'profile') {
      return (
        <ProfilePage 
          themeId={activeThemeId}
          store={store}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    if (pageId === 'login') {
      return (
        <LoginPage 
          themeId={activeThemeId}
          store={store}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    if (pageId === 'contact') {
      return (
        <ContactPage 
          themeId={activeThemeId}
          store={store}
          onNavigate={(p) => onPageChange && onPageChange(p)}
        />
      );
    }

    return null;
  };

  // If readonly, we skip the device chrome and just render the content container
  if (readonly) {
    const customContent = renderPageCustomContent(activePage);

    return (
      <div className="flex-1 w-full bg-white relative pb-32" onClick={handleCanvasClick}>
        {customContent ? (
          customContent
        ) : activePage === 'katalog' ? (
           <div className="flex flex-col min-h-full pb-32">
             <div>
               {ThemeRegistry[activeThemeId!]?.Navbar && React.createElement(ThemeRegistry[activeThemeId!].Navbar)}
             </div>
             
             <div className="flex-1 py-16 px-6">
               <div className="max-w-7xl mx-auto">
                 <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Katalog Produk</h1>
                 
                 {/* Search & Categories */}
                 <div className="mb-12 space-y-6">
                   <div className="max-w-md mx-auto relative">
                     <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                     <input
                       type="text"
                       value={searchPreviewQuery}
                       onChange={(e) => setSearchPreviewQuery(e.target.value)}
                       placeholder="Cari produk..."
                       className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                     />
                   </div>
                   
                   <div className="flex flex-wrap justify-center gap-2">
                     {categories.map((cat) => (
                       <button
                         key={cat}
                         onClick={() => setActiveCategoryFilter(cat)}
                         className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                           activeCategoryFilter === cat 
                             ? 'bg-black text-white' 
                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                         }`}
                       >
                         {cat}
                       </button>
                     ))}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                   {filteredProducts.map(p => {
                     // Normalize product to handle both Product and CmsProduct structures
                     const normalizedProduct = {
                       ...p,
                       image: p.imageUrl || (p as any).image,
                       categoryName: p.category || (p as any).categoryName,
                     };
                     
                     const CustomCard = ThemeRegistry[activeThemeId!]?.ProductCard;
                     
                     return (
                       <div key={p.id} onClick={() => onPageChange && onPageChange('product')}>
                         {CustomCard ? (
                           <CustomCard product={normalizedProduct} />
                         ) : (
                           /* Generic Fallback Product Card */
                           <div className="group cursor-pointer">
                             <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-3">
                               <img src={normalizedProduct.image} alt={normalizedProduct.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                             </div>
                             <h3 className="font-semibold text-gray-900 truncate">{normalizedProduct.name}</h3>
                             <p className="text-gray-500 text-sm">Rp {normalizedProduct.price.toLocaleString('id-ID')}</p>
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>
             </div>

             <div className="mt-auto">
               {ThemeRegistry[activeThemeId!]?.Footer && React.createElement(ThemeRegistry[activeThemeId!].Footer)}
             </div>
           </div>
        ) : visibleSections.length === 0 ? (
          <div className="py-24 text-center text-xs text-[#706866] p-6 space-y-2">
            <p className="font-bold text-[#241A1A]">Toko sedang dalam perbaikan</p>
          </div>
        ) : (
          visibleSections.map((section, idx) => {
            const sectionKey = section.key || `${section.id}-${idx}`;
            const opts = section.options || {};
            
            const customPaddingStyle: React.CSSProperties = {
              paddingTop: opts.paddingTop !== undefined ? `${opts.paddingTop}px` : undefined,
              paddingBottom: opts.paddingBottom !== undefined ? `${opts.paddingBottom}px` : undefined,
            };

            return (
              <div
                key={sectionKey}
                id={`preview-${sectionKey}`}
                className="relative"
                style={customPaddingStyle}
              >
                {activeThemeId && hasThemeComponent(activeThemeId, section.id) ? (
                  <div>
                    <ThemeSectionRenderer themeId={activeThemeId} section={section} />
                  </div>
                ) : (
                  <>
                    {/* 1. ANNOUNCEMENT BAR */}
                {section.id === 'announcement' && (
                  <div
                    className={`text-center py-2 px-3 sm:px-4 font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isMobile ? 'text-[11px]' : 'text-xs'
                    } ${
                      opts.backgroundColor === 'amber'
                        ? 'bg-amber-600 text-white'
                        : opts.backgroundColor === 'dark'
                        ? 'bg-slate-900 text-white'
                        : opts.backgroundColor === 'neutral'
                        ? 'bg-stone-800 text-white'
                        : 'bg-[#66000E] text-white'
                    }`}
                    style={{
                      backgroundColor:
                        opts.backgroundColor === 'brand' || !opts.backgroundColor
                          ? primaryAccent
                          : undefined,
                    }}
                  >
                    {opts.showIcon !== false && (
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
                    )}
                    <InlineEditableText
                      value={opts.announcementText || '✨ Toko Online Resmi UMKM • Pengiriman Aman ke Seluruh Indonesia'}
                      onSave={() => {}}
                      className={`font-semibold text-center truncate ${isMobile ? 'text-[11px] max-w-[280px]' : 'text-xs max-w-xl'}`}
                      readonly={true}
                    />
                  </div>
                )}

                {/* 2. HEADER & NAVBAR SECTION (RESPONSIVE) */}
                {section.id === 'header' && (
                  <div
                    className={`transition-all duration-200 ${
                      opts.headerStyle === 'brand'
                        ? 'text-white shadow-xs'
                        : opts.headerStyle === 'minimal'
                        ? 'bg-white border-b border-[#F0ECE9]'
                        : 'bg-white border-b border-[#EAEAEA] shadow-2xs'
                    }`}
                    style={opts.headerStyle === 'brand' ? { backgroundColor: primaryAccent } : undefined}
                  >
                    <div className={`flex items-center justify-between gap-2.5 ${isMobile ? 'px-3.5 py-2.5' : isTablet ? 'px-5 py-3' : 'px-6 py-3'}`}>
                      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
                        {opts.showLogo !== false && (
                          <div
                            className={`rounded-xl overflow-hidden shadow-2xs shrink-0 border ${
                              isMobile ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'
                            } ${
                              opts.headerStyle === 'brand'
                                ? 'border-white/30 bg-white/10'
                                : 'border-[#EAEAEA] bg-[#F7F7F7]'
                            }`}
                          >
                            <InlineEditableImage
                              src={store.logoUrl}
                              alt={store.name}
                              className="w-full h-full object-cover"
                              containerClassName="w-full h-full"
                              onUpdateImage={() => {}}
                              readonly={true}
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <InlineEditableText
                            value={store.name}
                            onSave={() => {}}
                            className={`font-bold tracking-tight leading-tight block truncate ${
                              isMobile ? 'text-xs max-w-[150px]' : isTablet ? 'text-sm max-w-[180px]' : 'text-sm sm:text-base'
                            } ${
                              opts.headerStyle === 'brand' ? 'text-white' : 'text-[#1F1F1F]'
                            }`}
                            readonly={true}
                          />
                          {opts.showTagline !== false && (
                            <div
                              className={`flex items-center gap-1 font-normal truncate ${
                                isMobile ? 'text-[10px] max-w-[130px]' : 'text-[11px] max-w-[160px]'
                              } ${
                                opts.headerStyle === 'brand' ? 'text-white/80' : 'text-[#777777]'
                              }`}
                            >
                              <MapPin
                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${
                                  opts.headerStyle === 'brand' ? 'text-white' : 'text-[#66000E]'
                                }`}
                              />
                              <span className="truncate">{store.city || store.tagline || 'Indonesia'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {isDesktop && opts.showNavMenu !== false && (opts.navMenuType === 'landing_style' || opts.navMenuType === 'custom' || !opts.navMenuType) && (
                        <nav className="hidden md:flex items-center gap-1">
                          {(opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS).map((item, mIdx) => (
                            <span
                              key={item.id || mIdx}
                              onClick={() => handleNavClick(item.href)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                opts.headerStyle === 'brand'
                                  ? 'text-white/90 hover:bg-white/15 hover:text-white'
                                  : 'text-[#4A4240] hover:text-[#66000E] hover:bg-[#FAF7F7]'
                              }`}
                            >
                              {item.label}
                            </span>
                          ))}
                        </nav>
                      )}

                      {!isMobile && opts.showSearchBar !== false && (
                        <div className={`relative transition-all ${isTablet ? 'w-44' : 'flex-1 max-w-xs'}`}>
                          <Search
                            className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                              opts.headerStyle === 'brand' ? 'text-white/60' : 'text-[#777777]'
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="Cari produk..."
                            value={searchPreviewQuery}
                            onChange={(e) => setSearchPreviewQuery(e.target.value)}
                            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl transition ${
                              opts.headerStyle === 'brand'
                                ? 'bg-white/15 text-white placeholder-white/60 border border-white/20'
                                : 'bg-[#FAF7F7] text-[#1F1F1F] placeholder-[#888] border border-[#EAEAEA]'
                            }`}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {!isMobile && opts.showWhatsAppButton !== false && (
                          <div
                            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold text-xs border ${
                              opts.headerStyle === 'brand'
                                ? 'bg-white/15 text-white border-white/20'
                                : 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                            }`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className={isTablet ? 'hidden' : 'inline'}>Chat Toko</span>
                          </div>
                        )}

                        {opts.showCartBadge !== false && (
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-xs shadow-2xs ${
                              opts.headerStyle === 'brand'
                                ? 'bg-white text-[#241A1A]'
                                : 'bg-[#66000E] text-white'
                            }`}
                            style={opts.headerStyle !== 'brand' ? { backgroundColor: primaryAccent } : undefined}
                          >
                            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                            {isDesktop && <span>Keranjang</span>}
                            <span
                              className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                opts.headerStyle === 'brand'
                                  ? 'bg-[#66000E] text-white'
                                  : 'bg-white text-[#66000E]'
                              }`}
                            >
                              0
                            </span>
                          </div>
                        )}

                        {(isMobile || isTablet) && opts.showNavMenu !== false && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileMenuOpen(!mobileMenuOpen);
                            }}
                            className={`p-1.5 rounded-xl border transition cursor-pointer ${
                              opts.headerStyle === 'brand'
                                ? 'text-white border-white/30 hover:bg-white/15'
                                : 'text-[#4A4240] border-[#E5E0DD] hover:bg-[#FAF7F7]'
                            }`}
                          >
                            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {isMobile && opts.showSearchBar !== false && (
                      <div className="px-3.5 pb-2.5">
                        <div className="relative">
                          <Search
                            className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                              opts.headerStyle === 'brand' ? 'text-white/60' : 'text-[#777777]'
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="Cari produk di toko..."
                            value={searchPreviewQuery}
                            onChange={(e) => setSearchPreviewQuery(e.target.value)}
                            className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs ${
                              opts.headerStyle === 'brand'
                                ? 'bg-white/15 text-white placeholder-white/60 border border-white/20'
                                : 'bg-[#FAF7F7] text-[#1F1F1F] placeholder-[#888] border border-[#EAEAEA]'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {(isMobile || isTablet) && mobileMenuOpen && (
                      <div
                        className={`border-t px-4 py-3 space-y-1 ${
                          opts.headerStyle === 'brand'
                            ? 'bg-black/35 border-white/15 text-white'
                            : 'bg-[#FAF7F7] border-[#EAEAEA] text-[#241A1A]'
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                          Menu Navigasi Mobile
                        </div>
                        {(opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS).map((item, mIdx) => (
                          <div
                            key={item.id || mIdx}
                            onClick={() => {
                              handleNavClick(item.href);
                              setMobileMenuOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              opts.headerStyle === 'brand'
                                ? 'hover:bg-white/15 text-white'
                                : 'hover:bg-white text-[#241A1A] border border-transparent hover:border-[#E5E0DD]'
                            }`}
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. HERO BANNER */}
                {section.id === 'hero_banner' && (
                  <div
                    className={`relative text-white overflow-hidden flex items-center ${
                      isMobile
                        ? 'min-h-[200px] py-6 px-4'
                        : isTablet
                        ? 'min-h-[260px] py-8 px-6'
                        : opts.sectionHeight === 'compact'
                        ? 'min-h-[200px] py-8 px-8'
                        : opts.sectionHeight === 'tall'
                        ? 'min-h-[380px] py-14 px-10'
                        : 'min-h-[280px] py-10 px-8'
                    } ${
                      opts.contentPosition === 'top-left' || opts.contentPosition === 'top-center' || opts.contentPosition === 'top-right'
                        ? 'items-start'
                        : opts.contentPosition === 'bottom-left' || opts.contentPosition === 'bottom-center' || opts.contentPosition === 'bottom-right'
                        ? 'items-end'
                        : 'items-center'
                    }`}
                    style={{ backgroundColor: '#1E1E24' }}
                  >
                    <div className="absolute inset-0 w-full h-full">
                      <InlineEditableImage
                        src={opts.imageUrl || store.bannerUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80'}
                        alt={store.name}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full absolute inset-0"
                        onUpdateImage={() => {}}
                        readonly={true}
                      />
                    </div>
                    <div
                      className="absolute inset-0 bg-black pointer-events-none"
                      style={{ opacity: (opts.overlayOpacity !== undefined ? opts.overlayOpacity : 35) / 100 }}
                    ></div>
                    <div
                      className={`relative z-10 w-full space-y-2 ${
                        isMobile ? 'max-w-xs' : 'max-w-2xl'
                      } ${
                        opts.enableContainer
                          ? 'bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/20'
                          : ''
                      } ${
                        opts.textAlignment === 'center'
                          ? 'mx-auto text-center'
                          : opts.textAlignment === 'right'
                          ? 'ml-auto text-right'
                          : 'text-left'
                      }`}
                    >
                      {opts.badgeText !== undefined && (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-amber-300">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                            <InlineEditableText
                              value={opts.badgeText || 'PROMO SPESIAL'}
                              onSave={() => {}}
                              className="text-amber-300"
                              readonly={true}
                            />
                          </span>
                        </div>
                      )}
                      <InlineEditableText
                        tagName="h1"
                        value={opts.heading || store.name}
                        onSave={() => {}}
                        className={`font-extrabold tracking-tight text-white leading-tight drop-shadow-sm block ${
                          isMobile ? 'text-lg leading-snug' : isTablet ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                        }`}
                        readonly={true}
                      />
                      <InlineEditableText
                        tagName="p"
                        value={
                          opts.subheading ||
                          opts.description ||
                          store.tagline ||
                          'Koleksi produk berkualitas langsung dari UMKM lokal Indonesia.'
                        }
                        onSave={() => {}}
                        className={`text-slate-100 leading-relaxed drop-shadow-xs block ${
                          isMobile ? 'text-[11px] line-clamp-2' : 'text-xs sm:text-sm max-w-xl'
                        }`}
                        readonly={true}
                      />
                      <div
                        className={`pt-1 flex items-center gap-2 ${
                          isMobile ? 'flex-col sm:flex-row w-full' : 'flex-row flex-wrap'
                        } ${
                          opts.textAlignment === 'center'
                            ? 'justify-center'
                            : opts.textAlignment === 'right'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <InlineEditableButton
                          label={opts.buttonLabel || 'Jelajahi Produk'}
                          onSaveLabel={() => {}}
                          icon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
                          className={`rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center transition ${
                            isMobile ? 'w-full py-2' : 'px-4 py-2'
                          }`}
                          style={{ backgroundColor: primaryAccent }}
                          readonly={true}
                        />
                        {opts.secondaryButtonLabel && (
                          <InlineEditableButton
                            label={opts.secondaryButtonLabel || 'Hubungi Kami'}
                            onSaveLabel={() => {}}
                            icon={<MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />}
                            iconPosition="left"
                            className={`rounded-xl font-semibold text-xs text-white bg-white/15 hover:bg-white/25 backdrop-blur-xs border border-white/30 transition flex items-center justify-center ${
                              isMobile ? 'w-full py-1.5 text-[11px]' : 'px-3.5 py-2'
                            }`}
                            readonly={true}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SEARCH & CATEGORIES */}
                {section.id === 'search_category' && (
                  <div className={`bg-[#FAF7F7] border-b border-[#E5E0DD] space-y-2.5 ${isMobile ? 'p-3' : 'p-4 sm:p-5'}`}>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#706866] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchPreviewQuery}
                          onChange={(e) => setSearchPreviewQuery(e.target.value)}
                          placeholder="Cari produk pilihan Anda..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E5E0DD] text-xs text-[#241A1A] placeholder-[#A8A09E] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCategoryFilter(cat);
                          }}
                          className={`rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                            isMobile ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1 text-xs'
                          } ${
                            activeCategoryFilter === cat
                              ? 'bg-[#66000E] text-white shadow-2xs'
                              : 'bg-white border border-[#E5E0DD] text-[#5A5250] hover:bg-[#FAF7F7]'
                          }`}
                          style={{
                            backgroundColor:
                              activeCategoryFilter === cat ? primaryAccent : undefined,
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. FEATURED PRODUCTS */}
                {section.id === 'featured_products' && (
                  <div className={`bg-amber-50/40 border-b border-amber-200/60 space-y-3 ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <InlineEditableText
                            tagName="h3"
                            value={opts.featuredTitle || '⭐ Produk Unggulan & Pilihan Toko'}
                            onSave={(val) => onUpdateSectionOptions(section.key || section.id, { featuredTitle: val })}
                            className={`font-bold text-[#241A1A] block ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                          />
                        </div>
                        <InlineEditableText
                          tagName="p"
                          value={opts.featuredSubtitle || 'Produk pilihan terbaik dengan kualitas terjamin'}
                          onSave={(val) => onUpdateSectionOptions(section.key || section.id, { featuredSubtitle: val })}
                          className="text-[10px] sm:text-[11px] text-[#706866] mt-0.5 font-normal block"
                        />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-[#66000E] hover:underline flex items-center gap-0.5 shrink-0">
                        <span>Lihat Semua</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div
                      className={`grid ${
                        isMobile
                          ? 'grid-cols-2 gap-2.5'
                          : isTablet
                          ? 'grid-cols-3 gap-3'
                          : opts.gridColumns === 2
                          ? 'grid-cols-2 gap-4'
                          : opts.gridColumns === 3
                          ? 'grid-cols-3 gap-4'
                          : 'grid-cols-4 gap-4'
                      }`}
                    >
                      {products.slice(0, isMobile ? 4 : opts.productCount || 4).map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl border border-amber-200/80 p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition"
                        >
                          <div className="space-y-1 sm:space-y-1.5">
                            <div className="relative rounded-xl overflow-hidden aspect-square bg-[#FAF7F7]">
                                <img
                                  src={p.imageUrl || (p as any).image}
                                  alt={p.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                                Unggulan
                              </span>
                            </div>
                            <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] line-clamp-1">
                              {p.name}
                            </h4>
                            <div className="text-[11px] sm:text-xs font-extrabold text-[#66000E]">
                              {formatRupiah(p.price)}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="w-full mt-1.5 sm:mt-2 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold bg-[#FAF7F7] hover:bg-[#66000E] text-[#66000E] hover:text-white border border-[#E6DDDA] transition cursor-pointer"
                          >
                            + Keranjang
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. STORE BENEFITS */}
                {section.id === 'store_benefits' && (
                  <div className={`bg-white border-b border-[#E5E0DD] ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                    <div
                      className={`grid ${
                        isMobile
                          ? 'grid-cols-1 gap-2'
                          : isTablet
                          ? 'grid-cols-3 gap-2.5'
                          : 'grid-cols-3 gap-3.5'
                      }`}
                    >
                      <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] truncate">100% Produk Asli</h4>
                          <p className="text-[9px] sm:text-[10px] text-[#706866] truncate">Jaminan kualitas UMKM</p>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] truncate">Pengiriman Cepat</h4>
                          <p className="text-[9px] sm:text-[10px] text-[#706866] truncate">Ekspedisi aman se-Indonesia</p>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] flex items-center gap-2.5 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                          <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] truncate">Layanan Amanah</h4>
                          <p className="text-[9px] sm:text-[10px] text-[#706866] truncate">CS responsif via WA</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. PRODUCT GRID */}
                {section.id === 'product_grid' && (
                  <div className={`bg-white border-b border-[#E5E0DD] space-y-3 sm:space-y-4 ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <InlineEditableText
                          tagName="h3"
                          value={opts.heading || 'Katalog Semua Produk'}
                          onSave={() => {}}
                          className={`font-bold text-[#241A1A] block ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                          readonly={true}
                        />
                        <p className="text-[10px] sm:text-[11px] text-[#706866]">
                          {filteredProducts.length} produk siap dipesan
                        </p>
                      </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#706866] bg-[#FAF7F7] rounded-2xl border border-[#E5E0DD] p-4">
                        Tidak ada produk pada kategori ini.
                      </div>
                    ) : (
                      <div
                        className={`grid ${
                          isMobile
                            ? 'grid-cols-2 gap-2.5'
                            : isTablet
                            ? 'grid-cols-3 gap-3'
                            : opts.gridColumns === 2
                            ? 'grid-cols-2 gap-4'
                            : opts.gridColumns === 3
                            ? 'grid-cols-3 gap-4'
                            : 'grid-cols-4 gap-4'
                        }`}
                      >
                        {filteredProducts.map((p) => (
                          <div
                            key={p.id}
                            className="bg-white rounded-2xl border border-[#E5E0DD] p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition"
                          >
                            <div className="space-y-1 sm:space-y-1.5">
                              <div className="relative rounded-xl overflow-hidden aspect-square bg-[#FAF7F7]">
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {opts.showStockBadge !== false && (
                                  <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-semibold px-1.5 py-0.5 rounded">
                                    Stok {p.stock}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] line-clamp-1">
                                {p.name}
                              </h4>
                              <div className="text-[11px] sm:text-xs font-extrabold text-[#66000E]">
                                {formatRupiah(p.price)}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="w-full mt-1.5 sm:mt-2 py-1.5 rounded-xl text-[10px] font-bold bg-[#66000E] text-white hover:bg-[#801010] transition cursor-pointer"
                              style={{ backgroundColor: primaryAccent }}
                            >
                              Beli Sekarang
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 8. PROMOTIONAL BANNER */}
                {section.id === 'promo_banner' && (
                  <div
                    className={`text-white relative overflow-hidden flex flex-col items-center justify-center text-center border-b border-[#E5E0DD] ${
                      isMobile ? 'p-4 py-6 space-y-1.5' : isTablet ? 'p-6 py-8 space-y-2' : 'p-6 sm:p-8 space-y-2.5'
                    }`}
                    style={{
                      backgroundColor:
                        opts.backgroundColor === 'amber'
                          ? '#B54708'
                          : opts.backgroundColor === 'dark'
                          ? '#18181B'
                          : primaryAccent,
                    }}
                  >
                    {opts.discountBadge !== undefined && (
                      <span className="text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-[#241A1A] shadow-xs">
                        <InlineEditableText
                          value={opts.discountBadge || 'DISKON HINGGA 50%'}
                          onSave={() => {}}
                          className="text-[#241A1A]"
                          readonly={true}
                        />
                      </span>
                    )}

                    <InlineEditableText
                      tagName="h3"
                      value={opts.heading || 'Penawaran Spesial Promo Hari Ini'}
                      onSave={() => {}}
                      className={`font-extrabold tracking-tight block ${
                        isMobile ? 'text-sm sm:text-base leading-tight' : 'text-base sm:text-xl'
                      }`}
                      readonly={true}
                    />

                    <InlineEditableText
                      tagName="p"
                      value={opts.description || 'Dapatkan potongan harga eksklusif untuk pesanan Anda hari ini.'}
                      onSave={() => {}}
                      className={`text-white/90 block ${isMobile ? 'text-[11px] max-w-xs' : 'text-xs max-w-md'}`}
                      readonly={true}
                    />

                    <InlineEditableButton
                      label={opts.buttonLabel || 'Klaim Promo Sekarang'}
                      onSaveLabel={() => {}}
                      className={`mt-1.5 rounded-xl bg-white text-[#241A1A] font-bold text-xs hover:bg-[#FAF7F7] transition shadow-md ${
                        isMobile ? 'w-full py-2' : 'px-5 py-2'
                      }`}
                      readonly={true}
                    />
                  </div>
                )}

                {/* 9. TESTIMONIALS */}
                {section.id === 'testimonials' && (
                  <div className={`bg-[#FAF7F7] border-b border-[#E5E0DD] space-y-3 ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[#241A1A] ml-1 text-[11px]">4.9 / 5.0</span>
                      </div>
                      <InlineEditableText
                        tagName="h3"
                        value={opts.testimonialsTitle || 'Ulasan & Kepuasan Pelanggan'}
                        onSave={() => {}}
                        className={`font-bold text-[#241A1A] block ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                        readonly={true}
                      />
                    </div>

                    <div
                      className={`grid ${
                        isMobile
                          ? 'grid-cols-1 gap-2.5'
                          : isTablet
                          ? 'grid-cols-2 gap-3'
                          : 'grid-cols-3 gap-3.5'
                      }`}
                    >
                      {(opts.testimonialsList || []).slice(0, isMobile ? 2 : 3).map((t: any, tIdx: number) => (
                        <div
                          key={t.id || tIdx}
                          className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E5E0DD] shadow-2xs space-y-2 flex flex-col justify-between"
                        >
                          <InlineEditableText
                            tagName="p"
                            value={t.comment}
                            onSave={() => {}}
                            className="text-[10px] sm:text-[11px] text-[#5A5250] italic leading-relaxed block"
                            readonly={true}
                          />
                          <div className="pt-2 border-t border-[#FAF7F7] flex items-center justify-between">
                            <div>
                              <InlineEditableText
                                tagName="div"
                                value={t.name}
                                onSave={() => {}}
                                className="font-bold text-[11px] sm:text-xs text-[#241A1A] block"
                                readonly={true}
                              />
                              <InlineEditableText
                                tagName="div"
                                value={t.location}
                                onSave={() => {}}
                                className="text-[9px] text-[#A8A09E] block"
                                readonly={true}
                              />
                            </div>
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                              Verified
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. NEWSLETTER */}
                {section.id === 'newsletter' && (
                  <div className={`bg-[#F5E8EA]/40 border-b border-[#E5E0DD] text-center space-y-2 ${isMobile ? 'p-4 py-6' : 'p-5 sm:p-8'}`}>
                    {opts.incentiveBadge !== undefined && (
                      <span className="inline-block text-[9px] sm:text-[10px] font-bold text-[#66000E] bg-white px-2.5 py-0.5 rounded-full border border-[#E6DDDA]">
                        <InlineEditableText
                          value={opts.incentiveBadge || 'DISCOUNT VOUCHER 10%'}
                          onSave={() => {}}
                          className="text-[#66000E]"
                          readonly={true}
                        />
                      </span>
                    )}
                    <InlineEditableText
                      tagName="h3"
                      value={opts.newsletterTitle || 'Dapatkan Voucher & Info Promo'}
                      onSave={() => {}}
                      className={`font-bold text-[#241A1A] block ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                      readonly={true}
                    />
                    <InlineEditableText
                      tagName="p"
                      value={
                        opts.newsletterSubtitle ||
                        'Daftarkan email Anda untuk menerima info diskon dan produk terbaru.'
                      }
                      onSave={() => {}}
                      className="text-[11px] sm:text-xs text-[#706866] max-w-md mx-auto block"
                      readonly={true}
                    />
                    <div className={`pt-1 ${isMobile ? 'flex flex-col gap-2 w-full max-w-xs mx-auto' : 'flex items-center gap-2 max-w-sm mx-auto'}`}>
                      <input
                        type="email"
                        placeholder={opts.newsletterPlaceholder || 'Masukkan email Anda...'}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E5E0DD] text-xs text-[#241A1A] focus:outline-none"
                      />
                      <InlineEditableButton
                        label={opts.buttonText || 'Daftar'}
                        onSaveLabel={() => {}}
                        className={`rounded-xl text-xs font-bold text-white shadow-2xs cursor-pointer shrink-0 ${
                          isMobile ? 'w-full py-2' : 'px-4 py-2'
                        }`}
                        style={{ backgroundColor: primaryAccent }}
                        readonly={true}
                      />
                    </div>
                  </div>
                )}

                {/* 11. STORE INFO / LOCATION */}
                {section.id === 'store_info' && (
                  <div className={`bg-white border-b border-[#E5E0DD] ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                    <div
                      className={`bg-[#FAF7F7] rounded-2xl border border-[#E5E0DD] ${
                        isMobile
                          ? 'p-3.5 flex flex-col gap-3'
                          : 'p-3.5 sm:p-4 flex flex-row items-center justify-between gap-3'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#241A1A] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#66000E]" />
                          <span>Lokasi & Kontak Toko</span>
                        </h4>
                        <p className="text-[11px] text-[#5A5250]">
                          {store.address ? `${store.address}, ${store.city}` : store.city}
                        </p>
                        <p className="text-[10px] text-[#706866] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Buka Setiap Hari: 08:00 - 20:00 WIB</span>
                        </p>
                      </div>

                      {opts.showWhatsAppButton !== false && (
                        <button
                          type="button"
                          className={`rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer ${
                            isMobile ? 'w-full py-2' : 'px-4 py-2'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat WhatsApp Toko</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 12. FOOTER */}
                {section.id === 'footer' && (
                  <footer className={`bg-[#1F1918] text-white text-center space-y-1.5 ${isMobile ? 'p-3.5 py-4' : 'p-4 sm:p-6'}`}>
                    <div className="font-bold text-xs tracking-tight">{store.name}</div>
                    <InlineEditableText
                      tagName="p"
                      value={opts.copyrightText || 'Hak Cipta Dilindungi Undang-Undang • Katalog Resmi UMKM Indonesia'}
                      onSave={() => {}}
                      className={`text-[#A8A09E] block max-w-xl mx-auto ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}
                      readonly={true}
                    />
                  </footer>
                )}
                      </>
                    )}
                  </div>
                );
              })
            )}
      </div>
    );
  }

  return (
    <main className={`flex-1 bg-[#EBE5E1] ${isDesktop ? 'p-1.5 sm:p-2.5 md:p-3' : 'p-2 sm:p-4 md:p-5'} overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col items-center justify-start min-h-0 font-sans select-none`}>
      {/* Realistic Device Canvas Frame */}
      <div
        className={`transition-all duration-300 w-full mx-auto ${
          isDesktop
            ? 'max-w-full'
            : isTablet
            ? 'max-w-[768px]'
            : 'max-w-[390px]'
        }`}
        data-theme={store.layoutSettings?.themeStyle || 'minimalist-01'}
      >
        {/* Device Outer Frame */}
        <div
          className={`bg-white transition-all overflow-hidden flex flex-col ${
            isMobile
              ? 'rounded-[44px] border-[10px] border-slate-900 ring-1 ring-slate-800 shadow-slate-900/30'
              : isTablet
              ? 'rounded-[32px] border-[10px] border-slate-800 ring-1 ring-slate-700 shadow-slate-900/25 shadow-xl'
              : 'rounded-none border-none shadow-none'
          }`}
        >

          {/* Tablet Status Bar */}
          {isTablet && (
            <div className="bg-slate-800 pt-2 pb-1.5 px-6 flex items-center justify-between text-white text-[10px]">
              <span className="font-semibold text-[10px]">09:41</span>
              {/* Front Camera Dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-700"></div>
              <div className="flex items-center gap-1.5 text-[9px] text-slate-300">
                <span>Wi-Fi</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Phone Dynamic Island Status Bar (Mobile only) */}
          {isMobile && (
            <div className="bg-slate-900 pt-2.5 pb-2 px-6 flex items-center justify-between text-white text-[10px]">
              <span className="font-semibold text-[10px]">09:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-24 h-4.5 bg-black rounded-full flex items-center justify-center relative">
                <div className="w-2 h-2 rounded-full bg-slate-800 absolute right-2.5"></div>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-300">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* STOREFRONT PREVIEW SCROLLABLE CONTENT */}
          <div className="bg-white min-h-[620px] max-h-[calc(100vh-130px)] overflow-y-auto custom-scrollbar relative selection:bg-[#F5E8EA]" onClick={handleCanvasClick}>
            {renderPageCustomContent(activePage) ? (
              renderPageCustomContent(activePage)
            ) : activePage === 'katalog' ? (
               <div className="flex flex-col min-h-full pb-32">
                 <div>
                   {ThemeRegistry[activeThemeId!]?.Navbar && React.createElement(ThemeRegistry[activeThemeId!].Navbar)}
                 </div>
                 
                 <div className="flex-1 py-16 px-6">
                   <div className="max-w-7xl mx-auto">
                     <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Katalog Produk</h1>
                     
                     {/* Search & Categories */}
                     <div className="mb-12 space-y-6">
                       <div className="max-w-md mx-auto relative">
                         <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                         <input
                           type="text"
                           value={searchPreviewQuery}
                           onChange={(e) => setSearchPreviewQuery(e.target.value)}
                           placeholder="Cari produk..."
                           className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                         />
                       </div>
                       
                       <div className="flex flex-wrap justify-center gap-2">
                         {categories.map((cat) => (
                           <button
                             key={cat}
                             onClick={() => setActiveCategoryFilter(cat)}
                             className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                               activeCategoryFilter === cat 
                                 ? 'bg-black text-white' 
                                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                             }`}
                           >
                             {cat}
                           </button>
                         ))}
                       </div>
                     </div>
    
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                       {filteredProducts.map(p => {
                         // Normalize product to handle both Product and CmsProduct structures
                         const normalizedProduct = {
                           ...p,
                           image: p.imageUrl || (p as any).image,
                           categoryName: p.category || (p as any).categoryName,
                         };
                         
                         const CustomCard = ThemeRegistry[activeThemeId!]?.ProductCard;
                         
                         return (
                           <div key={p.id}>
                             {CustomCard ? (
                               <CustomCard product={normalizedProduct} />
                             ) : (
                               /* Generic Fallback Product Card */
                               <div className="group cursor-pointer">
                                 <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-3">
                                   <img src={normalizedProduct.image} alt={normalizedProduct.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                 </div>
                                 <h3 className="font-semibold text-gray-900 truncate">{normalizedProduct.name}</h3>
                                 <p className="text-gray-500 text-sm">Rp {normalizedProduct.price.toLocaleString('id-ID')}</p>
                               </div>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 </div>

                 <div className="mt-auto">
                   {ThemeRegistry[activeThemeId!]?.Footer && React.createElement(ThemeRegistry[activeThemeId!].Footer)}
                 </div>
               </div>
            ) : visibleSections.length === 0 ? (
              <div className="py-24 text-center text-xs text-[#706866] p-6 space-y-2">
                <p className="font-bold text-[#241A1A]">Semua Bagian Sedang Disembunyikan</p>
                <p>Aktifkan kembali bagian toko pada panel kiri untuk menampilkan pratinjau.</p>
              </div>
            ) : (
              visibleSections.map((section, idx) => {
                const sectionKey = section.key || `${section.id}-${idx}`;
                const isSelected = selectedSectionKey === sectionKey;
                const opts = section.options || {};
                const globalIndex = sections.findIndex(
                  (s, sIdx) => (s.key || `${s.id}-${sIdx}`) === sectionKey
                );

                // Custom inline styles for padding
                const customPaddingStyle: React.CSSProperties = {
                  paddingTop: opts.paddingTop !== undefined ? `${opts.paddingTop}px` : undefined,
                  paddingBottom: opts.paddingBottom !== undefined ? `${opts.paddingBottom}px` : undefined,
                };

                return (
                  <div
                    key={sectionKey}
                    id={`preview-${sectionKey}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSection(sectionKey);
                    }}
                    className="relative group transition-all duration-150 cursor-pointer"
                    style={customPaddingStyle}
                  >
                    {/* Universal Selection Overlay to prevent child backgrounds from covering the ring */}
                    <div className={`absolute inset-0 z-[100] pointer-events-none transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-[#2271B1] ring-inset bg-[#2271B1]/5 shadow-xs'
                        : 'group-hover:ring-2 group-hover:ring-[#2271B1]/50 group-hover:ring-inset'
                    }`} />

                    {/* Shopify-style Floating Label Badge on Top Left */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 z-[110] bg-[#2271B1] text-white px-2.5 py-0.5 rounded-br-md text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>{section.title}</span>
                      </div>
                    )}

                    {/* Shopify-style Floating Action Toolbar at Bottom Center */}
                    {isSelected && (
                      <div
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 text-white backdrop-blur-xs px-2 py-1 rounded-xl shadow-xl flex items-center gap-1 border border-white/20 animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Move Up */}
                        {globalIndex > 0 && onMoveSection && (
                          <button
                            type="button"
                            onClick={() => onMoveSection(globalIndex, globalIndex - 1)}
                            className="p-1 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
                            title="Pindah ke Atas"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Move Down */}
                        {globalIndex < sections.length - 1 && onMoveSection && (
                          <button
                            type="button"
                            onClick={() => onMoveSection(globalIndex, globalIndex + 1)}
                            className="p-1 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
                            title="Pindah ke Bawah"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Hide */}
                        {onToggleVisibility && (
                          <button
                            type="button"
                            onClick={() => onToggleVisibility(sectionKey)}
                            className="p-1 rounded-lg hover:bg-white/20 text-white transition cursor-pointer"
                            title="Sembunyikan Bagian"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        {onDeleteSection && (
                          <button
                            type="button"
                            onClick={() => onDeleteSection(sectionKey)}
                            className="p-1 rounded-lg hover:bg-red-500/40 text-red-300 transition cursor-pointer"
                            title="Hapus Bagian"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {activeThemeId && hasThemeComponent(activeThemeId, section.id) ? (
                      <div>
                        <ThemeSectionRenderer 
                          themeId={activeThemeId} 
                          section={section} 
                          onUpdateSectionOptions={onUpdateSectionOptions}
                        />
                      </div>
                    ) : (
                      <>
                        {/* 1. ANNOUNCEMENT BAR */}
                    {section.id === 'announcement' && (
                      <div
                        className={`text-center py-2 px-3 sm:px-4 font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                          isMobile ? 'text-[11px]' : 'text-xs'
                        } ${
                          opts.backgroundColor === 'amber'
                            ? 'bg-amber-600 text-white'
                            : opts.backgroundColor === 'dark'
                            ? 'bg-slate-900 text-white'
                            : opts.backgroundColor === 'neutral'
                            ? 'bg-stone-800 text-white'
                            : 'bg-[#66000E] text-white'
                        }`}
                        style={{
                          backgroundColor:
                            opts.backgroundColor === 'brand' || !opts.backgroundColor
                              ? primaryAccent
                              : undefined,
                        }}
                      >
                        {opts.showIcon !== false && (
                          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
                        )}
                        <InlineEditableText
                          value={opts.announcementText || '✨ Toko Online Resmi UMKM • Pengiriman Aman ke Seluruh Indonesia'}
                          placeholder="Teks pengumuman di sini..."
                          onSave={(newText) => handleUpdateOption(sectionKey, { announcementText: newText })}
                          className={`font-semibold text-center truncate ${isMobile ? 'text-[11px] max-w-[280px]' : 'text-xs max-w-xl'}`}
                          isSelected={isSelected}
                        />
                      </div>
                    )}

                    {/* 2. HEADER & NAVBAR SECTION (RESPONSIVE) */}
                    {section.id === 'header' && (
                      <div
                        className={`transition-all duration-200 ${
                          opts.headerStyle === 'brand'
                            ? 'text-white shadow-xs'
                            : opts.headerStyle === 'minimal'
                            ? 'bg-white border-b border-[#F0ECE9]'
                            : 'bg-white border-b border-[#EAEAEA] shadow-2xs'
                        }`}
                        style={opts.headerStyle === 'brand' ? { backgroundColor: primaryAccent } : undefined}
                      >
                        {/* Main Navbar Bar */}
                        <div className={`flex items-center justify-between gap-2.5 ${isMobile ? 'px-3.5 py-2.5' : isTablet ? 'px-5 py-3' : 'px-6 py-3'}`}>
                          {/* Brand Logo & Name */}
                          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
                            {opts.showLogo !== false && (
                              <div
                                className={`rounded-xl overflow-hidden shadow-2xs shrink-0 border ${
                                  isMobile ? 'w-8 h-8' : 'w-9 h-9 sm:w-10 sm:h-10'
                                } ${
                                  opts.headerStyle === 'brand'
                                    ? 'border-white/30 bg-white/10'
                                    : 'border-[#EAEAEA] bg-[#F7F7F7]'
                                }`}
                              >
                                <InlineEditableImage
                                  src={store.logoUrl}
                                  alt={store.name}
                                  className="w-full h-full object-cover"
                                  containerClassName="w-full h-full"
                                  title="Ganti Logo Toko"
                                  onUpdateImage={(newLogo) => {
                                    if (onUpdateStore) onUpdateStore({ logoUrl: newLogo });
                                  }}
                                  isSelected={isSelected}
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <InlineEditableText
                                value={store.name}
                                placeholder="Nama Toko..."
                                onSave={(newName) => {
                                  if (onUpdateStore) onUpdateStore({ name: newName });
                                }}
                                className={`font-bold tracking-tight leading-tight block truncate ${
                                  isMobile ? 'text-xs max-w-[150px]' : isTablet ? 'text-sm max-w-[180px]' : 'text-sm sm:text-base'
                                } ${
                                  opts.headerStyle === 'brand' ? 'text-white' : 'text-[#1F1F1F]'
                                }`}
                                isSelected={isSelected}
                              />
                              {opts.showTagline !== false && (
                                <div
                                  className={`flex items-center gap-1 font-normal truncate ${
                                    isMobile ? 'text-[10px] max-w-[130px]' : 'text-[11px] max-w-[160px]'
                                  } ${
                                    opts.headerStyle === 'brand' ? 'text-white/80' : 'text-[#777777]'
                                  }`}
                                >
                                  <MapPin
                                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 ${
                                      opts.headerStyle === 'brand' ? 'text-white' : 'text-[#66000E]'
                                    }`}
                                  />
                                  <span className="truncate">{store.city || store.tagline || 'Indonesia'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Desktop Navbar Menu (Shown ONLY on Desktop mode) */}
                          {isDesktop && opts.showNavMenu !== false && (opts.navMenuType === 'landing_style' || opts.navMenuType === 'custom' || !opts.navMenuType) && (
                            <nav className="hidden md:flex items-center gap-1">
                              {(opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS).map((item, mIdx) => (
                                <span
                                  key={item.id || mIdx}
                                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                    opts.headerStyle === 'brand'
                                      ? 'text-white/90 hover:bg-white/15 hover:text-white'
                                      : 'text-[#4A4240] hover:text-[#66000E] hover:bg-[#FAF7F7]'
                                  }`}
                                >
                                  <InlineEditableText
                                    value={item.label}
                                    placeholder="Menu..."
                                    onSave={(newLabel) => {
                                      const currentItems = opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS;
                                      const updated = currentItems.map((it, idx) =>
                                        idx === mIdx ? { ...it, label: newLabel } : it
                                      );
                                      handleUpdateOption(sectionKey, { navMenuItems: updated });
                                    }}
                                    isSelected={isSelected}
                                  />
                                </span>
                              ))}
                            </nav>
                          )}

                          {/* Search Bar on Desktop & Tablet */}
                          {!isMobile && opts.showSearchBar !== false && (
                            <div className={`relative transition-all ${isTablet ? 'w-44' : 'flex-1 max-w-xs'}`}>
                              <Search
                                className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                                  opts.headerStyle === 'brand' ? 'text-white/60' : 'text-[#777777]'
                                }`}
                              />
                              <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchPreviewQuery}
                                onChange={(e) => setSearchPreviewQuery(e.target.value)}
                                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-xl transition ${
                                  opts.headerStyle === 'brand'
                                    ? 'bg-white/15 text-white placeholder-white/60 border border-white/20'
                                    : 'bg-[#FAF7F7] text-[#1F1F1F] placeholder-[#888] border border-[#EAEAEA]'
                                }`}
                              />
                            </div>
                          )}

                          {/* Action Buttons: WhatsApp, Cart, and Mobile/Tablet Hamburger */}
                          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            {/* WhatsApp Button (Shown on Desktop & Tablet) */}
                            {!isMobile && opts.showWhatsAppButton !== false && (
                              <div
                                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold text-xs border ${
                                  opts.headerStyle === 'brand'
                                    ? 'bg-white/15 text-white border-white/20'
                                    : 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
                                }`}
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className={isTablet ? 'hidden' : 'inline'}>Chat Toko</span>
                              </div>
                            )}

                            {/* Cart Button */}
                            {opts.showCartBadge !== false && (
                              <div
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-semibold text-xs shadow-2xs ${
                                  opts.headerStyle === 'brand'
                                    ? 'bg-white text-[#241A1A]'
                                    : 'bg-[#66000E] text-white'
                                }`}
                                style={opts.headerStyle !== 'brand' ? { backgroundColor: primaryAccent } : undefined}
                              >
                                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                                {isDesktop && <span>Keranjang</span>}
                                <span
                                  className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                    opts.headerStyle === 'brand'
                                      ? 'bg-[#66000E] text-white'
                                      : 'bg-white text-[#66000E]'
                                  }`}
                                >
                                  0
                                </span>
                              </div>
                            )}

                            {/* Hamburger Toggle Button (Shown on Mobile & Tablet) */}
                            {(isMobile || isTablet) && opts.showNavMenu !== false && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMobileMenuOpen(!mobileMenuOpen);
                                }}
                                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                                  opts.headerStyle === 'brand'
                                    ? 'text-white border-white/30 hover:bg-white/15'
                                    : 'text-[#4A4240] border-[#E5E0DD] hover:bg-[#FAF7F7]'
                                }`}
                                title="Menu Navigasi Mobile"
                              >
                                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Search on mobile screen */}
                        {isMobile && opts.showSearchBar !== false && (
                          <div className="px-3.5 pb-2.5">
                            <div className="relative">
                              <Search
                                className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                                  opts.headerStyle === 'brand' ? 'text-white/60' : 'text-[#777777]'
                                }`}
                              />
                              <input
                                type="text"
                                placeholder="Cari produk di toko..."
                                value={searchPreviewQuery}
                                onChange={(e) => setSearchPreviewQuery(e.target.value)}
                                className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs ${
                                  opts.headerStyle === 'brand'
                                    ? 'bg-white/15 text-white placeholder-white/60 border border-white/20'
                                    : 'bg-[#FAF7F7] text-[#1F1F1F] placeholder-[#888] border border-[#EAEAEA]'
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        {/* Mobile & Tablet Dropdown Navigation Drawer */}
                        {(isMobile || isTablet) && mobileMenuOpen && (
                          <div
                            className={`border-t px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150 ${
                              opts.headerStyle === 'brand'
                                ? 'bg-black/35 border-white/15 text-white'
                                : 'bg-[#FAF7F7] border-[#EAEAEA] text-[#241A1A]'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                              Menu Navigasi Mobile
                            </div>
                            {(opts.navMenuItems || DEFAULT_LANDING_NAV_ITEMS).map((item, mIdx) => (
                              <div
                                key={item.id || mIdx}
                                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                  opts.headerStyle === 'brand'
                                    ? 'hover:bg-white/15 text-white'
                                    : 'hover:bg-white text-[#241A1A] border border-transparent hover:border-[#E5E0DD]'
                                }`}
                              >
                                <span>{item.label}</span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                              </div>
                            ))}
                            {opts.showWhatsAppButton !== false && (
                              <div className="pt-2">
                                <div className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-[#ECFDF3] text-[#027A48] font-bold text-xs border border-[#ABEFC6]">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Hubungi via WhatsApp</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. HERO BANNER (RESPONSIVE) */}
                    {section.id === 'hero_banner' && (
                      <div
                        className={`relative text-white overflow-hidden flex items-center ${
                          isMobile
                            ? 'min-h-[200px] py-6 px-4'
                            : isTablet
                            ? 'min-h-[260px] py-8 px-6'
                            : opts.sectionHeight === 'compact'
                            ? 'min-h-[200px] py-8 px-8'
                            : opts.sectionHeight === 'tall'
                            ? 'min-h-[380px] py-14 px-10'
                            : 'min-h-[280px] py-10 px-8'
                        } ${
                          opts.contentPosition === 'top-left' || opts.contentPosition === 'top-center' || opts.contentPosition === 'top-right'
                            ? 'items-start'
                            : opts.contentPosition === 'bottom-left' || opts.contentPosition === 'bottom-center' || opts.contentPosition === 'bottom-right'
                            ? 'items-end'
                            : 'items-center'
                        }`}
                        style={{
                          backgroundColor: '#1E1E24',
                        }}
                      >
                        {/* Background Image with Inline Editing */}
                        <div className="absolute inset-0 w-full h-full">
                          <InlineEditableImage
                            src={opts.imageUrl || store.bannerUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80'}
                            alt={store.name}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full absolute inset-0"
                            title="Ganti Background Banner"
                            onUpdateImage={(newImg) => handleUpdateOption(sectionKey, { imageUrl: newImg })}
                            isSelected={isSelected}
                          />
                        </div>

                        {/* Dark Overlay with customizable opacity */}
                        <div
                          className="absolute inset-0 bg-black pointer-events-none"
                          style={{
                            opacity: (opts.overlayOpacity !== undefined ? opts.overlayOpacity : 35) / 100,
                          }}
                        ></div>

                        {/* Banner Content Container */}
                        <div
                          className={`relative z-10 w-full space-y-2 ${
                            isMobile ? 'max-w-xs' : 'max-w-2xl'
                          } ${
                            opts.enableContainer
                              ? 'bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-white/20'
                              : ''
                          } ${
                            opts.textAlignment === 'center'
                              ? 'mx-auto text-center'
                              : opts.textAlignment === 'right'
                              ? 'ml-auto text-right'
                              : 'text-left'
                          }`}
                        >
                          {opts.badgeText !== undefined && (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 text-amber-300">
                                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                                <InlineEditableText
                                  value={opts.badgeText || 'PROMO SPESIAL'}
                                  placeholder="Teks Badge"
                                  onSave={(newBadge) => handleUpdateOption(sectionKey, { badgeText: newBadge })}
                                  className="text-amber-300"
                                  isSelected={isSelected}
                                />
                              </span>
                            </div>
                          )}

                          <InlineEditableText
                            tagName="h1"
                            value={opts.heading || store.name}
                            placeholder="Judul Utama Banner..."
                            onSave={(newHeading) => handleUpdateOption(sectionKey, { heading: newHeading })}
                            className={`font-extrabold tracking-tight text-white leading-tight drop-shadow-sm block ${
                              isMobile ? 'text-lg leading-snug' : isTablet ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                            }`}
                            isSelected={isSelected}
                          />

                          <InlineEditableText
                            tagName="p"
                            value={
                              opts.subheading ||
                              opts.description ||
                              store.tagline ||
                              'Koleksi produk berkualitas langsung dari UMKM lokal Indonesia.'
                            }
                            placeholder="Deskripsi atau subjudul banner..."
                            multiline
                            onSave={(newSub) => handleUpdateOption(sectionKey, { subheading: newSub, description: newSub })}
                            className={`text-slate-100 leading-relaxed drop-shadow-xs block ${
                              isMobile ? 'text-[11px] line-clamp-2' : 'text-xs sm:text-sm max-w-xl'
                            }`}
                            isSelected={isSelected}
                          />

                          {/* CTA Buttons (Stack on mobile, row on tablet/desktop) */}
                          <div
                            className={`pt-1 flex items-center gap-2 ${
                              isMobile ? 'flex-col sm:flex-row w-full' : 'flex-row flex-wrap'
                            } ${
                              opts.textAlignment === 'center'
                                ? 'justify-center'
                                : opts.textAlignment === 'right'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <InlineEditableButton
                              label={opts.buttonLabel || 'Jelajahi Produk'}
                              onSaveLabel={(newLabel) => handleUpdateOption(sectionKey, { buttonLabel: newLabel })}
                              icon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
                              className={`rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center transition ${
                                isMobile ? 'w-full py-2' : 'px-4 py-2'
                              }`}
                              style={{ backgroundColor: primaryAccent }}
                              isSelected={isSelected}
                            />

                            {opts.secondaryButtonLabel && (
                              <InlineEditableButton
                                label={opts.secondaryButtonLabel || 'Hubungi Kami'}
                                onSaveLabel={(newSec) => handleUpdateOption(sectionKey, { secondaryButtonLabel: newSec })}
                                icon={<MessageCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />}
                                iconPosition="left"
                                className={`rounded-xl font-semibold text-xs text-white bg-white/15 hover:bg-white/25 backdrop-blur-xs border border-white/30 transition flex items-center justify-center ${
                                  isMobile ? 'w-full py-1.5 text-[11px]' : 'px-3.5 py-2'
                                }`}
                                isSelected={isSelected}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. SEARCH & CATEGORIES (RESPONSIVE) */}
                    {section.id === 'search_category' && (
                      <div className={`bg-[#FAF7F7] border-b border-[#E5E0DD] space-y-2.5 ${isMobile ? 'p-3' : 'p-4 sm:p-5'}`}>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="w-4 h-4 text-[#706866] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={searchPreviewQuery}
                              onChange={(e) => setSearchPreviewQuery(e.target.value)}
                              placeholder="Cari produk pilihan Anda..."
                              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E5E0DD] text-xs text-[#241A1A] placeholder-[#A8A09E] focus:outline-none focus:ring-2 focus:ring-[#66000E]/20 focus:border-[#66000E]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCategoryFilter(cat);
                              }}
                              className={`rounded-xl font-semibold whitespace-nowrap transition cursor-pointer ${
                                isMobile ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1 text-xs'
                              } ${
                                activeCategoryFilter === cat
                                  ? 'bg-[#66000E] text-white shadow-2xs'
                                  : 'bg-white border border-[#E5E0DD] text-[#5A5250] hover:bg-[#FAF7F7]'
                              }`}
                              style={{
                                backgroundColor:
                                  activeCategoryFilter === cat ? primaryAccent : undefined,
                              }}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. FEATURED PRODUCTS (RESPONSIVE GRID) */}
                    {section.id === 'featured_products' && (
                      <div className={`bg-amber-50/40 border-b border-amber-200/60 space-y-3 ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <InlineEditableText
                                tagName="h3"
                                value={opts.featuredTitle || '⭐ Produk Unggulan & Pilihan Toko'}
                                placeholder="Judul Bagian Unggulan"
                                onSave={(newTitle) => handleUpdateOption(sectionKey, { featuredTitle: newTitle })}
                                className={`font-bold text-[#241A1A] block ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                                isSelected={isSelected}
                              />
                            </div>
                            <InlineEditableText
                              tagName="p"
                              value={opts.featuredSubtitle || 'Produk pilihan terbaik dengan kualitas terjamin'}
                              placeholder="Subjudul Bagian Unggulan"
                              onSave={(newSub) => handleUpdateOption(sectionKey, { featuredSubtitle: newSub })}
                              className="text-[10px] sm:text-[11px] text-[#706866] mt-0.5 font-normal block"
                              isSelected={isSelected}
                            />
                          </div>
                          <span className="text-[11px] sm:text-xs font-bold text-[#66000E] hover:underline flex items-center gap-0.5 shrink-0">
                            <span>Lihat Semua</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>

                        {/* Responsive Grid: Mobile = 2 cols, Tablet = 3 cols, Desktop = 4 cols */}
                        <div
                          className={`grid ${
                            isMobile
                              ? 'grid-cols-2 gap-2.5'
                              : isTablet
                              ? 'grid-cols-3 gap-3'
                              : opts.gridColumns === 2
                              ? 'grid-cols-2 gap-4'
                              : opts.gridColumns === 3
                              ? 'grid-cols-3 gap-4'
                              : 'grid-cols-4 gap-4'
                          }`}
                        >
                          {products.slice(0, isMobile ? 4 : opts.productCount || 4).map((p) => (
                            <div
                              key={p.id}
                              className="bg-white rounded-2xl border border-amber-200/80 p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition"
                            >
                              <div className="space-y-1 sm:space-y-1.5">
                                <div className="relative rounded-xl overflow-hidden aspect-square bg-[#FAF7F7]">
                                    <img
                                      src={p.imageUrl || (p as any).image}
                                      alt={p.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                                    Unggulan
                                  </span>
                                </div>
                                <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] line-clamp-1">
                                  {p.name}
                                </h4>
                                <div className="text-[11px] sm:text-xs font-extrabold text-[#66000E]">
                                  {formatRupiah(p.price)}
                                </div>
                              </div>

                              <button
                                type="button"
                                className="w-full mt-1.5 sm:mt-2 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold bg-[#FAF7F7] hover:bg-[#66000E] text-[#66000E] hover:text-white border border-[#E6DDDA] transition cursor-pointer"
                              >
                                + Keranjang
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 6. STORE BENEFITS (RESPONSIVE: STACK ON MOBILE, 3 COLS ON DESKTOP/TABLET) */}
                    {section.id === 'store_benefits' && (
                      <div className={`bg-white border-b border-[#E5E0DD] ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                        <div
                          className={`grid ${
                            isMobile
                              ? 'grid-cols-1 gap-2'
                              : isTablet
                              ? 'grid-cols-3 gap-2.5'
                              : 'grid-cols-3 gap-3.5'
                          }`}
                        >
                          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] flex items-center gap-2.5 sm:gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] truncate">100% Produk Asli</h4>
                              <p className="text-[9px] sm:text-[10px] text-[#706866] truncate">Jaminan kualitas UMKM</p>
                            </div>
                          </div>

                          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] flex items-center gap-2.5 sm:gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] truncate">Pengiriman Cepat</h4>
                              <p className="text-[9px] sm:text-[10px] text-[#706866] truncate">Ekspedisi aman se-Indonesia</p>
                            </div>
                          </div>

                          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] flex items-center gap-2.5 sm:gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center shrink-0">
                              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] truncate">Layanan Amanah</h4>
                              <p className="text-[9px] sm:text-[10px] text-[#706866] truncate">CS responsif via WA</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 7. PRODUCT GRID / COLLECTION (RESPONSIVE GRID) */}
                    {section.id === 'product_grid' && (
                      <div className={`bg-white border-b border-[#E5E0DD] space-y-3 sm:space-y-4 ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <InlineEditableText
                              tagName="h3"
                              value={opts.heading || 'Katalog Semua Produk'}
                              placeholder="Judul Katalog Produk"
                              onSave={(newHeading) => handleUpdateOption(sectionKey, { heading: newHeading })}
                              className={`font-bold text-[#241A1A] block ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                              isSelected={isSelected}
                            />
                            <p className="text-[10px] sm:text-[11px] text-[#706866]">
                              {filteredProducts.length} produk siap dipesan
                            </p>
                          </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                          <div className="py-8 text-center text-xs text-[#706866] bg-[#FAF7F7] rounded-2xl border border-[#E5E0DD] p-4">
                            Tidak ada produk pada kategori ini.
                          </div>
                        ) : (
                          <div
                            className={`grid ${
                              isMobile
                                ? 'grid-cols-2 gap-2.5'
                                : isTablet
                                ? 'grid-cols-3 gap-3'
                                : opts.gridColumns === 2
                                ? 'grid-cols-2 gap-4'
                                : opts.gridColumns === 3
                                ? 'grid-cols-3 gap-4'
                                : 'grid-cols-4 gap-4'
                            }`}
                          >
                            {filteredProducts.map((p) => (
                              <div
                                key={p.id}
                                className="bg-white rounded-2xl border border-[#E5E0DD] p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition"
                              >
                                <div className="space-y-1 sm:space-y-1.5">
                                  <div className="relative rounded-xl overflow-hidden aspect-square bg-[#FAF7F7]">
                                      <img
                                        src={p.imageUrl || (p as any).image}
                                        alt={p.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    {opts.showStockBadge !== false && (
                                      <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-semibold px-1.5 py-0.5 rounded">
                                        Stok {p.stock}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-[11px] sm:text-xs font-bold text-[#241A1A] line-clamp-1">
                                    {p.name}
                                  </h4>
                                  <div className="text-[11px] sm:text-xs font-extrabold text-[#66000E]">
                                    {formatRupiah(p.price)}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  className="w-full mt-1.5 sm:mt-2 py-1.5 rounded-xl text-[10px] font-bold bg-[#66000E] text-white hover:bg-[#801010] transition cursor-pointer"
                                  style={{ backgroundColor: primaryAccent }}
                                >
                                  Beli Sekarang
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 8. PROMOTIONAL BANNER (RESPONSIVE) */}
                    {section.id === 'promo_banner' && (
                      <div
                        className={`text-white relative overflow-hidden flex flex-col items-center justify-center text-center border-b border-[#E5E0DD] ${
                          isMobile ? 'p-4 py-6 space-y-1.5' : isTablet ? 'p-6 py-8 space-y-2' : 'p-6 sm:p-8 space-y-2.5'
                        }`}
                        style={{
                          backgroundColor:
                            opts.backgroundColor === 'amber'
                              ? '#B54708'
                              : opts.backgroundColor === 'dark'
                              ? '#18181B'
                              : primaryAccent,
                        }}
                      >
                        {opts.discountBadge !== undefined && (
                          <span className="text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white text-[#241A1A] shadow-xs">
                            <InlineEditableText
                              value={opts.discountBadge || 'DISKON HINGGA 50%'}
                              placeholder="Badge Diskon"
                              onSave={(newBadge) => handleUpdateOption(sectionKey, { discountBadge: newBadge })}
                              className="text-[#241A1A]"
                              isSelected={isSelected}
                            />
                          </span>
                        )}

                        <InlineEditableText
                          tagName="h3"
                          value={opts.heading || 'Penawaran Spesial Promo Hari Ini'}
                          placeholder="Judul Banner Promo"
                          onSave={(newHeading) => handleUpdateOption(sectionKey, { heading: newHeading })}
                          className={`font-extrabold tracking-tight block ${
                            isMobile ? 'text-sm sm:text-base leading-tight' : 'text-base sm:text-xl'
                          }`}
                          isSelected={isSelected}
                        />

                        <InlineEditableText
                          tagName="p"
                          value={opts.description || 'Dapatkan potongan harga eksklusif untuk pesanan Anda hari ini.'}
                          placeholder="Deskripsi promo..."
                          multiline
                          onSave={(newDesc) => handleUpdateOption(sectionKey, { description: newDesc })}
                          className={`text-white/90 block ${isMobile ? 'text-[11px] max-w-xs' : 'text-xs max-w-md'}`}
                          isSelected={isSelected}
                        />

                        <InlineEditableButton
                          label={opts.buttonLabel || 'Klaim Promo Sekarang'}
                          onSaveLabel={(newBtn) => handleUpdateOption(sectionKey, { buttonLabel: newBtn })}
                          className={`mt-1.5 rounded-xl bg-white text-[#241A1A] font-bold text-xs hover:bg-[#FAF7F7] transition shadow-md ${
                            isMobile ? 'w-full py-2' : 'px-5 py-2'
                          }`}
                          isSelected={isSelected}
                        />
                      </div>
                    )}

                    {/* 9. TESTIMONIALS (RESPONSIVE: 1 COL MOBILE, 2 COLS TABLET, 3 COLS DESKTOP) */}
                    {section.id === 'testimonials' && (
                      <div className={`bg-[#FAF7F7] border-b border-[#E5E0DD] space-y-3 ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                        <div className="text-center space-y-1">
                          <div className="inline-flex items-center gap-1 text-amber-500 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-[#241A1A] ml-1 text-[11px]">4.9 / 5.0</span>
                          </div>
                          <InlineEditableText
                            tagName="h3"
                            value={opts.testimonialsTitle || 'Ulasan & Kepuasan Pelanggan'}
                            placeholder="Judul Testimoni"
                            onSave={(newTitle) => handleUpdateOption(sectionKey, { testimonialsTitle: newTitle })}
                            className={`font-bold text-[#241A1A] block ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                            isSelected={isSelected}
                          />
                        </div>

                        <div
                          className={`grid ${
                            isMobile
                              ? 'grid-cols-1 gap-2.5'
                              : isTablet
                              ? 'grid-cols-2 gap-3'
                              : 'grid-cols-3 gap-3.5'
                          }`}
                        >
                          {(opts.testimonialsList || []).slice(0, isMobile ? 2 : 3).map((t, tIdx) => (
                            <div
                              key={t.id || tIdx}
                              className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E5E0DD] shadow-2xs space-y-2 flex flex-col justify-between"
                            >
                              <InlineEditableText
                                tagName="p"
                                value={t.comment}
                                placeholder="Tuliskan testimoni pembeli..."
                                multiline
                                onSave={(newComment) => {
                                  const updatedList = [...(opts.testimonialsList || [])];
                                  if (updatedList[tIdx]) {
                                    updatedList[tIdx] = { ...updatedList[tIdx], comment: newComment };
                                    handleUpdateOption(sectionKey, { testimonialsList: updatedList });
                                  }
                                }}
                                className="text-[10px] sm:text-[11px] text-[#5A5250] italic leading-relaxed block"
                                isSelected={isSelected}
                              />
                              <div className="pt-2 border-t border-[#FAF7F7] flex items-center justify-between">
                                <div>
                                  <InlineEditableText
                                    tagName="div"
                                    value={t.name}
                                    placeholder="Nama Pembeli"
                                    onSave={(newName) => {
                                      const updatedList = [...(opts.testimonialsList || [])];
                                      if (updatedList[tIdx]) {
                                        updatedList[tIdx] = { ...updatedList[tIdx], name: newName };
                                        handleUpdateOption(sectionKey, { testimonialsList: updatedList });
                                      }
                                    }}
                                    className="font-bold text-[11px] sm:text-xs text-[#241A1A] block"
                                    isSelected={isSelected}
                                  />
                                  <InlineEditableText
                                    tagName="div"
                                    value={t.location}
                                    placeholder="Kota / Asal"
                                    onSave={(newLoc) => {
                                      const updatedList = [...(opts.testimonialsList || [])];
                                      if (updatedList[tIdx]) {
                                        updatedList[tIdx] = { ...updatedList[tIdx], location: newLoc };
                                        handleUpdateOption(sectionKey, { testimonialsList: updatedList });
                                      }
                                    }}
                                    className="text-[9px] text-[#A8A09E] block"
                                    isSelected={isSelected}
                                  />
                                </div>
                                <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                                  Verified
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 10. NEWSLETTER (RESPONSIVE) */}
                    {section.id === 'newsletter' && (
                      <div className={`bg-[#F5E8EA]/40 border-b border-[#E5E0DD] text-center space-y-2 ${isMobile ? 'p-4 py-6' : 'p-5 sm:p-8'}`}>
                        {opts.incentiveBadge !== undefined && (
                          <span className="inline-block text-[9px] sm:text-[10px] font-bold text-[#66000E] bg-white px-2.5 py-0.5 rounded-full border border-[#E6DDDA]">
                            <InlineEditableText
                              value={opts.incentiveBadge || 'DISCOUNT VOUCHER 10%'}
                              placeholder="Badge Insentif"
                              onSave={(newBadge) => handleUpdateOption(sectionKey, { incentiveBadge: newBadge })}
                              className="text-[#66000E]"
                              isSelected={isSelected}
                            />
                          </span>
                        )}
                        <InlineEditableText
                          tagName="h3"
                          value={opts.newsletterTitle || 'Dapatkan Voucher & Info Promo'}
                          placeholder="Judul Newsletter"
                          onSave={(newTitle) => handleUpdateOption(sectionKey, { newsletterTitle: newTitle })}
                          className={`font-bold text-[#241A1A] block ${isMobile ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}`}
                          isSelected={isSelected}
                        />
                        <InlineEditableText
                          tagName="p"
                          value={
                            opts.newsletterSubtitle ||
                            'Daftarkan email Anda untuk menerima info diskon dan produk terbaru.'
                          }
                          placeholder="Subjudul newsletter..."
                          multiline
                          onSave={(newSub) => handleUpdateOption(sectionKey, { newsletterSubtitle: newSub })}
                          className="text-[11px] sm:text-xs text-[#706866] max-w-md mx-auto block"
                          isSelected={isSelected}
                        />
                        <div className={`pt-1 ${isMobile ? 'flex flex-col gap-2 w-full max-w-xs mx-auto' : 'flex items-center gap-2 max-w-sm mx-auto'}`}>
                          <input
                            type="email"
                            placeholder={opts.newsletterPlaceholder || 'Masukkan email Anda...'}
                            className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E5E0DD] text-xs text-[#241A1A] focus:outline-none"
                          />
                          <InlineEditableButton
                            label={opts.buttonText || 'Daftar'}
                            onSaveLabel={(newBtn) => handleUpdateOption(sectionKey, { buttonText: newBtn })}
                            className={`rounded-xl text-xs font-bold text-white shadow-2xs cursor-pointer shrink-0 ${
                              isMobile ? 'w-full py-2' : 'px-4 py-2'
                            }`}
                            style={{ backgroundColor: primaryAccent }}
                            isSelected={isSelected}
                          />
                        </div>
                      </div>
                    )}

                    {/* 11. STORE INFO / LOCATION (RESPONSIVE) */}
                    {section.id === 'store_info' && (
                      <div className={`bg-white border-b border-[#E5E0DD] ${isMobile ? 'p-3.5' : 'p-4 sm:p-6'}`}>
                        <div
                          className={`bg-[#FAF7F7] rounded-2xl border border-[#E5E0DD] ${
                            isMobile
                              ? 'p-3.5 flex flex-col gap-3'
                              : 'p-3.5 sm:p-4 flex flex-row items-center justify-between gap-3'
                          }`}
                        >
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-[#241A1A] flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#66000E]" />
                              <span>Lokasi & Kontak Toko</span>
                            </h4>
                            <p className="text-[11px] text-[#5A5250]">
                              {store.address ? `${store.address}, ${store.city}` : store.city}
                            </p>
                            <p className="text-[10px] text-[#706866] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Buka Setiap Hari: 08:00 - 20:00 WIB</span>
                            </p>
                          </div>

                          {opts.showWhatsAppButton !== false && (
                            <button
                              type="button"
                              className={`rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer ${
                                isMobile ? 'w-full py-2' : 'px-4 py-2'
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>Chat WhatsApp Toko</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 12. FOOTER (RESPONSIVE) */}
                    {section.id === 'footer' && (
                      <footer className={`bg-[#1F1918] text-white text-center space-y-1.5 ${isMobile ? 'p-3.5 py-4' : 'p-4 sm:p-6'}`}>
                        <div className="font-bold text-xs tracking-tight">{store.name}</div>
                        <InlineEditableText
                          tagName="p"
                          value={opts.copyrightText || 'Hak Cipta Dilindungi Undang-Undang • Katalog Resmi UMKM Indonesia'}
                          placeholder="Teks Hak Cipta Footer..."
                          onSave={(newCopy) => handleUpdateOption(sectionKey, { copyrightText: newCopy })}
                          className={`text-[#A8A09E] block max-w-xl mx-auto ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}
                          isSelected={isSelected}
                        />
                      </footer>
                    )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Mobile Bottom Navigation Bar (Shown on Mobile device mode) */}
          {isMobile && (
            <div className="bg-white border-t border-[#EAEAEA] px-3 py-1.5 flex items-center justify-around text-[#706866] shrink-0 shadow-xs z-30">
              <div className="flex flex-col items-center gap-0.5 text-[#66000E] cursor-pointer">
                <Home className="w-4 h-4 stroke-[2.5]" />
                <span className="text-[9px] font-bold">Beranda</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 hover:text-[#241A1A] transition cursor-pointer">
                <Grid className="w-4 h-4" />
                <span className="text-[9px] font-medium">Katalog</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 hover:text-[#241A1A] transition cursor-pointer">
                <Search className="w-4 h-4" />
                <span className="text-[9px] font-medium">Cari</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 hover:text-[#241A1A] transition cursor-pointer relative">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-[9px] font-medium">Keranjang</span>
                <span className="absolute -top-1 right-2 w-3.5 h-3.5 rounded-full bg-[#66000E] text-white text-[8px] font-bold flex items-center justify-center">
                  0
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5 text-emerald-600 hover:text-emerald-700 transition cursor-pointer">
                <MessageCircle className="w-4 h-4" />
                <span className="text-[9px] font-medium">Chat WA</span>
              </div>
            </div>
          )}

          {/* Mobile Bottom Home Bar Indicator */}
          {isMobile && (
            <div className="bg-slate-900 py-2 flex items-center justify-center">
              <div className="w-32 h-1 bg-white/40 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
