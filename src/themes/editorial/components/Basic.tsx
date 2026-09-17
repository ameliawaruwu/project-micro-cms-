import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const EditorialNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  
  return (
    <nav className="w-full px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center bg-[#fafafa] border-b border-gray-200">
      <div className="w-full md:w-1/3 flex justify-center md:justify-start mb-6 md:mb-0">
        <div className="text-xs font-medium tracking-[0.2em] uppercase text-gray-500">
          The Journal
        </div>
      </div>
      
      <div className="w-full md:w-1/3 flex justify-center mb-6 md:mb-0">
        {showLogo && (
          <a href="/" className="text-3xl md:text-5xl font-serif italic tracking-tight text-gray-900">
            {storeInfo.name}
          </a>
        )}
      </div>

      <div className="w-full md:w-1/3 flex justify-center md:justify-end gap-6 md:gap-8">
        {navigation.map(nav => (
          <a key={nav.id} href={nav.route} className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors">
            {nav.label}
          </a>
        ))}
        <button className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-900 hover:text-gray-500 transition-colors">
          Search
        </button>
      </div>
    </nav>
  );
};

export const EditorialHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Autumn / Winter";
  const announcementText = sectionOptions.announcementText || "The New Collection";
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80";

  return (
    <section className="relative w-full h-[85vh] flex flex-col items-center justify-center bg-[#fafafa] overflow-hidden">
      <div className="absolute inset-0 p-4 md:p-8">
        <div className="w-full h-full relative overflow-hidden bg-gray-200">
          <img 
            src={bgImage} 
            alt="Editorial Campaign" 
            className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>
      
      <div className="z-10 text-center text-white mix-blend-difference mt-auto mb-24 pointer-events-none">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] mb-6 md:mb-8 font-medium">
          {announcementText}
        </p>
        <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-serif italic leading-none">
          {heading}
        </h1>
      </div>
    </section>
  );
};

export const EditorialFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name}`;

  return (
    <footer className="w-full px-6 md:px-12 py-24 bg-gray-900 text-white flex flex-col items-center">
      <h2 className="text-4xl md:text-5xl font-serif italic mb-12">{storeInfo.name}</h2>
      <div className="flex flex-col md:flex-row gap-8 md:gap-16 text-center mb-16">
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-4">Headquarters</p>
          <p className="text-xs uppercase tracking-widest text-gray-300 max-w-xs">{storeInfo.address}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-4">Inquiries</p>
          <p className="text-xs uppercase tracking-widest text-gray-300">{storeInfo.email}</p>
        </div>
      </div>
      <div className="w-full max-w-lg h-[1px] bg-gray-800 mb-8"></div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{copyrightText}</p>
    </footer>
  );
};
