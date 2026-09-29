import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const NatureNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  const rawName = sectionOptions.heading || sectionOptions.storeName || storeInfo?.name;
  const storeName = (!rawName || rawName === 'NEON//CORE Electronics') ? 'Green Market' : rawName;

  const navList = (navigation && navigation.length > 0) ? navigation : [
    { id: 'nn1', label: 'Pasar Segar', route: '/katalog' },
    { id: 'nn2', label: 'Mitra Petani', route: '/tentang' },
    { id: 'nn3', label: 'Edukasi Organik', route: '/berita' },
  ];

  return (
    <nav className="w-full px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center bg-[#F9F6F0] border-b border-[#E8E4DB] sticky top-0 z-50 font-serif">
      <div className="w-full md:w-1/3 flex justify-center md:justify-start mb-6 md:mb-0">
        {showNav && (
          <div className="flex gap-8">
            {navList.map(nav => (
              <a key={nav.id} href={nav.route} className="text-[13px] tracking-wide font-medium text-[#5C6B5D] hover:text-[#2C3B2D] transition-colors relative group font-sans">
                {nav.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#2C3B2D] group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0">
        {showLogo && (
          <a href="/" className="text-3xl md:text-4xl font-serif text-[#2C3B2D] tracking-wider hover:opacity-80 transition-opacity font-bold">
            {storeName}
          </a>
        )}
      </div>

      <div className="w-full md:w-1/3 flex justify-center md:justify-end gap-6">
        <button className="text-[13px] tracking-wide text-[#5C6B5D] hover:text-[#2C3B2D] transition-colors flex items-center gap-2 cursor-pointer font-sans">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          Keranjang (0)
        </button>
      </div>
    </nav>
  );
};

export const NatureHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const rawStoreName = sectionOptions.storeName || storeInfo?.name;
  const storeName = (!rawStoreName || rawStoreName === 'NEON//CORE Electronics') ? 'Green Market' : rawStoreName;
  const heading = sectionOptions.heading || storeName || "Pasar Segar Organik";
  const rawSub = sectionOptions.subheading || sectionOptions.description || storeInfo?.description;
  const subheading = (!rawSub || rawSub.includes("Komponen Komputer") || rawSub.includes("PC Gaming") || rawSub.includes("GPU RTX"))
    ? "Pilihan sayur, buah segar, dan produk pangan organik langsung dari mitra petani lokal."
    : rawSub;
  const buttonLabel = sectionOptions.buttonLabel || "Jelajahi Produk Segar";
  const bgImage = sectionOptions.imageUrl || sectionOptions.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=80";

  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center bg-[#F9F6F0] p-4 md:p-8">
      <div className="absolute inset-0 w-full h-full p-4 md:p-8">
        <div className="w-full h-full relative overflow-hidden rounded-[40px] shadow-sm">
          <img 
            src={bgImage} 
            alt="Green Market Organic" 
            className="w-full h-full object-cover rounded-[40px] scale-105 hover:scale-100 transition-transform duration-[20s] ease-out"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      </div>
      
      <div className="z-10 text-center text-white bg-black/20 p-8 sm:p-12 md:p-16 max-w-3xl mx-4 rounded-[32px] backdrop-blur-md border border-white/10 shadow-2xl transform hover:-translate-y-1 transition-transform duration-500">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold mb-3 sm:mb-4 leading-tight drop-shadow-md tracking-tight">
          {heading}
        </h1>
        {subheading && (
          <p className="text-sm sm:text-base md:text-lg text-[#F9F6F0]/90 font-light italic max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed drop-shadow-sm font-serif">
            {subheading}
          </p>
        )}
        <button className="px-8 sm:px-10 py-3 sm:py-3.5 bg-[#F9F6F0] text-[#2C3B2D] rounded-full text-xs sm:text-sm font-medium hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer font-sans">
          {buttonLabel}
        </button>
      </div>
    </section>
  );
};

export const NatureFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const rawStoreName = sectionOptions.heading || sectionOptions.storeName || storeInfo?.name;
  const storeName = (!rawStoreName || rawStoreName === 'NEON//CORE Electronics') ? 'Green Market' : rawStoreName;

  const rawDesc = sectionOptions.description || storeInfo?.description;
  const description = (!rawDesc || rawDesc.includes("Komponen Komputer") || rawDesc.includes("PC Gaming") || rawDesc.includes("GPU RTX Series"))
    ? "Pasar pangan segar dan produk organik langsung dari mitra petani lokal binaan. Sayuran hidroponik, buah pilihan, madu murni, dan bahan pangan alami berkualitas tinggi."
    : rawDesc;

  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeName.toUpperCase()}. ALL RIGHTS RESERVED.`;

  const footerLinks = (navigation && navigation.length > 0) ? navigation : [
    { id: "fn1", label: "Pasar Segar", route: "/katalog" },
    { id: "fn2", label: "Mitra Petani", route: "/tentang" },
    { id: "fn3", label: "Edukasi Organik", route: "/berita" },
    { id: "fn4", label: "Kontak Kami", route: "/kontak" }
  ];

  return (
    <footer className="w-full px-8 md:px-16 py-24 bg-[#2C3B2D] text-[#E8E4DB] rounded-t-[40px] mt-12 flex flex-col items-center shadow-inner font-serif">
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center">
        <svg className="w-12 h-12 mb-8 text-[#E8E4DB]/50" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        </svg>
        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">{storeName}</h2>
        <p className="text-sm md:text-base leading-relaxed tracking-wide mb-12 max-w-xl mx-auto opacity-80 font-light font-sans">
          {description}
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-14 text-sm font-sans tracking-wider opacity-85">
          {footerLinks.map(link => (
            <a key={link.id} href={link.route} className="hover:text-white hover:opacity-100 transition-opacity">
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="w-full h-px bg-[#E8E4DB]/20 mb-8"></div>
        <div className="text-[10px] uppercase font-sans tracking-widest opacity-50 font-medium">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
};
