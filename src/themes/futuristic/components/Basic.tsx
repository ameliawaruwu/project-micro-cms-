import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { useThemeProductsSource } from '../../useSectionProducts';
import { getNavMenuItems, getHeaderDisplay, getHeaderSubtitle } from '../../navMenu';
import { NavSearchButton } from '../../NavSearchButton';
import { StoreLogo } from '../../StoreLogo';
import { CartCount, CartCountBadge, NavCartButton } from '../../storefrontCart';
import { ShoppingBag as CartBagIcon } from 'lucide-react';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { NavTrackOrderButton } from '../../NavTrackOrderButton';

export const FuturisticNavbar: React.FC<{ sectionOptions?: any; accentColor?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, accentColor = '#A855F7', isMobile, isTablet }) => {
  const { storeInfo } = useCmsStore();
  const header = getHeaderDisplay(sectionOptions);

  const showLogo = sectionOptions.showLogo ?? true;
  const showNavMenu = sectionOptions.showNavMenu ?? true;
  const storeTitle = sectionOptions.heading || sectionOptions.storeName || sectionOptions.title || storeInfo?.name;
  const storeSubtitle = getHeaderSubtitle(sectionOptions, storeInfo?.description);

  const showDesktopNav = getDeviceClass(isMobile, isTablet, {
    mobile: 'hidden',
    tablet: 'hidden',
    desktop: 'flex',
    fallback: 'hidden md:flex',
  });

  return (
    <nav className={`w-full px-4 sm:px-6 md:px-12 py-4 md:py-5 flex flex-wrap md:flex-nowrap justify-between items-center gap-x-4 gap-y-3 bg-[#050505]/80 border-b backdrop-blur-md ${header.positionClass}`} style={{ borderColor: `${accentColor}4D` }}>
      <div className="flex flex-col min-w-0 flex-1 md:flex-none">
        <div className="text-lg sm:text-xl font-black tracking-[0.15em] sm:tracking-[0.2em] text-white truncate">
          {showLogo && <StoreLogo sectionOptions={sectionOptions} name={storeTitle} imgClassName="h-9 sm:h-11"><><span className="mr-2" style={{ color: accentColor }}>/</span>{storeTitle}</></StoreLogo>}
        </div>
        {storeSubtitle && (
          <span className="text-[10px] font-mono tracking-widest mt-0.5 line-clamp-1" style={{ color: `${accentColor}CC` }}>
            {storeSubtitle}
          </span>
        )}
      </div>
      {showNavMenu && (
        <div className={`${showDesktopNav} gap-5 lg:gap-8 shrink-0`}>
          {getNavMenuItems(sectionOptions).map(nav => (
            <a
              key={nav.id}
              href={nav.route}
              className="text-xs uppercase tracking-widest text-gray-400 transition-all duration-300"
              onMouseEnter={(e) => { e.currentTarget.style.color = accentColor; e.currentTarget.style.textShadow = `0 0 10px ${accentColor}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ''; e.currentTarget.style.textShadow = ''; }}
            >
              {nav.label}
            </a>
          ))}
        </div>
      )}
      <div className="shrink-0 flex items-center gap-3">
        {header.showSearch && (
          <NavSearchButton className="p-2 text-gray-400 hover:text-white transition-colors" />
        )}
        <NavTrackOrderButton className="p-2 text-gray-400 hover:text-white transition-colors" />
        {header.showCart && (
          <button
            type="button"
            data-href="/keranjang" aria-label="Buka keranjang belanja"
            className="px-3 sm:px-5 py-2 bg-transparent border text-xs uppercase tracking-widest font-bold rounded transition-all duration-300 cursor-pointer flex items-center gap-2 whitespace-nowrap"
            style={{ borderColor: accentColor, color: accentColor }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = accentColor; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = `0 0 15px ${accentColor}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = accentColor; e.currentTarget.style.boxShadow = ''; }}
          >
            <CartBagIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Keranjang</span>
            <span>[<CartCount />]</span>
          </button>
        )}
      </div>
      {showNavMenu && (
        <div className="md:hidden w-full flex gap-6 overflow-x-auto [scrollbar-width:none] whitespace-nowrap">
          {getNavMenuItems(sectionOptions).map(nav => (
            <a key={nav.id} href={nav.route} className="text-[11px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors">{nav.label}</a>
          ))}
        </div>
      )}
    </nav>
  );
};

export const FuturisticHero: React.FC<{ sectionOptions?: any; accentColor?: string }> = ({ sectionOptions = {}, accentColor = '#A855F7' }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const heading = sectionOptions.heading || "Next Gen Hardware";
  const subheading = sectionOptions.subheading || sectionOptions.subtitle || sectionOptions.description || sectionOptions.content || storeInfo?.description || "Engineered for the future. Equip your battle station with uncompromising technology.";
  const hero = getHeroContent(sectionOptions, { badge: 'SYS.v2.0_ONLINE', buttonLabel: 'Initialize Sequence' });
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=80";

  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-[#050505] overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity">
        <img src={bgImage} alt="Hero" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b to-transparent" style={{ backgroundImage: `linear-gradient(to bottom, ${accentColor}33, transparent)` }}></div>
      <div className="absolute w-[60vw] h-[60vw] rounded-full blur-[120px] -top-1/4 -left-1/4 animate-pulse" style={{ backgroundColor: `${accentColor}1A` }}></div>
      <div className="absolute w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px] bottom-0 right-0 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 text-center text-white px-6 w-full max-w-5xl mx-auto">
        {hero.badge && (
          <div
            className="inline-block px-4 py-1.5 border rounded-full text-xs font-mono mb-8 uppercase tracking-widest backdrop-blur-sm"
            style={{ borderColor: `${accentColor}4D`, backgroundColor: `${accentColor}33`, color: accentColor, boxShadow: `0 0 15px ${accentColor}33` }}
          >
            {hero.badge}
          </div>
        )}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 uppercase leading-tight" style={{ filter: `drop-shadow(0 0 30px ${accentColor}4D)` }}>
          {heading}
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto mb-12 font-mono text-sm md:text-base leading-relaxed">
          {subheading}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <HeroActionLink
            action={hero.primary}
            className="inline-block px-10 py-5 text-white font-bold uppercase tracking-widest transition-all duration-300 rounded-sm"
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 25px ${accentColor}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
          />
          {hero.secondary && (
            <HeroActionLink
              action={hero.secondary}
              className="inline-block px-10 py-5 font-bold uppercase tracking-widest transition-all duration-300 rounded-sm border bg-transparent"
              style={{ borderColor: accentColor, color: accentColor }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export const FuturisticFeaturedProducts: React.FC<{ sectionOptions?: any; accentColor?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, accentColor = '#A855F7', isMobile, isTablet }) => {
  const allProducts = useThemeProductsSource('futuristic');
  const title = sectionOptions.featuredTitle || "Featured Hardware";
  const desiredCols = [2, 3, 4].includes(sectionOptions.gridColumns) ? sectionOptions.gridColumns : 3;
  const products = allProducts.filter(p => p.isFeatured).slice(0, 3); // match gridColumns default usually

  const desktopColsMap: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };
  const fallbackColsMap: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };
  const gridColsClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'grid-cols-2',
    tablet: 'grid-cols-3',
    desktop: desktopColsMap[desiredCols],
    fallback: fallbackColsMap[desiredCols],
  });

  return (
    <section className="py-32 px-6 md:px-12 bg-[#050505] text-white border-t" style={{ borderColor: `${accentColor}33` }}>
      <h2 className="text-3xl font-black uppercase tracking-widest mb-16 text-center text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #60A5FA)` }}>
        {title}
      </h2>
      <div className={`grid ${gridColsClass} gap-8 max-w-7xl mx-auto`}>
        {products.map((product, i) => (
          <div
            key={product.id}
            className="group relative bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden transition-all duration-500"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accentColor}80`; e.currentTarget.style.boxShadow = `0 0 30px ${accentColor}26`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div className="absolute top-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #2563EB)` }}></div>
            <div className="h-[300px] overflow-hidden p-8 relative bg-gradient-to-b from-gray-900 to-[#0a0a0a]">
              <div className="absolute inset-0 z-10 transition-colors" style={{ backgroundColor: `${accentColor}0D` }}></div>
              <img src={product.image} alt={product.name} className="w-full h-full object-contain relative z-20 mix-blend-screen group-hover:scale-110 transition duration-700 ease-out drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            </div>
            <div className="p-8 relative z-20 border-t border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: accentColor }}>{product.categoryName}</div>
                <div className="text-[10px] text-gray-500 font-mono">0{i+1}</div>
              </div>
              <h3 className="font-bold text-xl mb-3 text-white truncate">{product.name}</h3>
              <p className="font-mono text-gray-400 text-sm">Rp {product.price.toLocaleString('id-ID')}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const FuturisticFooter: React.FC<{ sectionOptions?: any; accentColor?: string }> = ({ sectionOptions = {}, accentColor = '#A855F7' }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `SYS_CORE_TERMINATED. © ${new Date().getFullYear()} ${storeInfo.name}`;

  return (
    <footer className="w-full px-8 py-16 bg-[#020202] border-t text-center relative overflow-hidden" style={{ borderColor: `${accentColor}33` }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] blur-[80px]" style={{ backgroundColor: `${accentColor}33` }}></div>
      <div className="relative z-10">
        <div className="text-3xl font-black tracking-[0.3em] mb-6 text-white uppercase"><span style={{ color: accentColor }}>/</span>{storeInfo.name}</div>
        <p className="text-xs text-gray-600 font-mono tracking-widest">{copyrightText}</p>
      </div>
    </footer>
  );
};
