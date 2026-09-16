import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const FuturisticNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  
  const showLogo = sectionOptions.showLogo ?? true;
  const showNavMenu = sectionOptions.showNavMenu ?? true;

  return (
    <nav className="w-full px-6 md:px-12 py-5 flex justify-between items-center bg-[#050505]/80 border-b border-purple-900/30 backdrop-blur-md sticky top-0 z-50">
      <div className="text-xl font-black tracking-[0.2em] text-white">
        {showLogo && <><span className="text-purple-500 mr-2">/</span>{storeInfo.name}</>}
      </div>
      {showNavMenu && (
        <div className="hidden md:flex gap-8">
          {navigation.map(nav => (
            <a key={nav.id} href={nav.route} className="text-xs uppercase tracking-widest text-gray-400 hover:text-purple-400 hover:shadow-[0_0_10px_#A855F7] transition-all duration-300">
              {nav.label}
            </a>
          ))}
        </div>
      )}
      <button className="px-5 py-2 bg-transparent border border-purple-500 text-purple-400 text-xs uppercase tracking-widest font-bold rounded hover:bg-purple-500 hover:text-white hover:shadow-[0_0_15px_#A855F7] transition-all duration-300">
        System Access
      </button>
    </nav>
  );
};

export const FuturisticHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Next Gen Hardware";
  const subheading = sectionOptions.subheading || "Engineered for the future. Equip your battle station with uncompromising technology.";
  const buttonLabel = sectionOptions.buttonLabel || "Initialize Sequence";
  
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center bg-[#050505] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent"></div>
      <div className="absolute w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[120px] -top-1/4 -left-1/4 animate-pulse"></div>
      <div className="absolute w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px] bottom-0 right-0 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 text-center text-white px-6 w-full max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1.5 border border-purple-500/30 bg-purple-900/20 rounded-full text-purple-400 text-xs font-mono mb-8 uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)] backdrop-blur-sm">
          SYS.v2.0_ONLINE
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 uppercase leading-tight drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          {heading}
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto mb-12 font-mono text-sm md:text-base leading-relaxed">
          {subheading}
        </p>
        <button className="px-10 py-5 bg-purple-600 text-white font-bold uppercase tracking-widest hover:bg-purple-500 hover:shadow-[0_0_25px_#A855F7] transition-all duration-300 rounded-sm">
          {buttonLabel}
        </button>
      </div>
    </section>
  );
};

export const FuturisticFeaturedProducts: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const allProducts = useCmsStore(state => state.products);
  const title = sectionOptions.featuredTitle || "Featured Hardware";
  const gridColumns = sectionOptions.gridColumns || 3;
  const products = allProducts.filter(p => p.isFeatured).slice(0, 3); // match gridColumns default usually

  return (
    <section className="py-32 px-6 md:px-12 bg-[#050505] text-white border-t border-purple-900/20">
      <h2 className="text-3xl font-black uppercase tracking-widest mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        {title}
      </h2>
      <div className={`grid grid-cols-1 md:grid-cols-${gridColumns} gap-8 max-w-7xl mx-auto`}>
        {products.map((product, i) => (
          <div key={product.id} className="group relative bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20"></div>
            <div className="h-[300px] overflow-hidden p-8 relative bg-gradient-to-b from-gray-900 to-[#0a0a0a]">
              <div className="absolute inset-0 bg-purple-900/5 z-10 group-hover:bg-purple-900/10 transition-colors"></div>
              <img src={product.image} alt={product.name} className="w-full h-full object-contain relative z-20 mix-blend-screen group-hover:scale-110 transition duration-700 ease-out drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            </div>
            <div className="p-8 relative z-20 border-t border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[10px] text-purple-400 font-mono uppercase tracking-wider">{product.categoryName}</div>
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

export const FuturisticFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `SYS_CORE_TERMINATED. © ${new Date().getFullYear()} ${storeInfo.name}`;
  
  return (
    <footer className="w-full px-8 py-16 bg-[#020202] border-t border-purple-900/20 text-center relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-purple-600/20 blur-[80px]"></div>
      <div className="relative z-10">
        <div className="text-3xl font-black tracking-[0.3em] mb-6 text-white uppercase"><span className="text-purple-500">/</span>{storeInfo.name}</div>
        <p className="text-xs text-gray-600 font-mono tracking-widest">{copyrightText}</p>
      </div>
    </footer>
  );
};
