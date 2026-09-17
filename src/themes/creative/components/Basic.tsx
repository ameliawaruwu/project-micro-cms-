import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const CreativeNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <nav className="w-full px-8 py-6 flex justify-between items-center bg-[#E11D48] text-white sticky top-0 z-50">
      <div className="flex-1 flex justify-start">
        {showLogo && (
          <a href="/" className="text-3xl font-extrabold tracking-tighter hover:text-yellow-300 transition-colors transform hover:-rotate-3">
            {storeInfo.name}
          </a>
        )}
      </div>
      
      {showNav && (
        <div className="hidden md:flex gap-8 flex-1 justify-center items-center">
          {navigation.map(nav => (
            <a key={nav.id} href={nav.route} className="text-sm font-bold uppercase tracking-widest hover:text-yellow-300 hover:scale-110 transition-transform">
              {nav.label}
            </a>
          ))}
        </div>
      )}
      
      <div className="flex-1 flex justify-end">
        <button className="w-12 h-12 rounded-full bg-yellow-300 text-[#E11D48] flex items-center justify-center font-bold hover:scale-110 transition-transform shadow-lg">
          0
        </button>
      </div>
    </nav>
  );
};

export const CreativeHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Where Art Meets Commerce";
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1600&q=80";

  return (
    <section className="relative w-full h-[85vh] bg-[#E11D48] flex flex-col md:flex-row items-center overflow-hidden">
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative z-10 flex flex-col justify-center px-12 md:px-24">
        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 mix-blend-difference z-20 transform -rotate-2">
          {heading}
        </h1>
        <div className="flex gap-4 z-20">
          <button className="px-8 py-4 bg-yellow-300 text-black font-bold uppercase tracking-wider rounded-full hover:bg-white transition-colors transform hover:scale-105 shadow-xl">
            View Gallery
          </button>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 h-1/2 md:h-full absolute md:relative bottom-0 right-0 z-0">
        <div className="absolute inset-0 bg-blue-600 mix-blend-color z-10 opacity-30"></div>
        <img 
          src={bgImage} 
          alt="Creative Hero" 
          className="w-full h-full object-cover scale-110 rotate-3 opacity-90 rounded-bl-[100px]"
        />
        <div className="absolute top-1/2 -left-12 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-screen blur-2xl animate-pulse delay-700"></div>
      </div>
    </section>
  );
};

export const CreativeFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name}`;

  return (
    <footer className="w-full px-8 py-20 bg-black text-white flex flex-col items-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#E11D48] via-yellow-300 to-blue-500"></div>
      
      <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-[#E11D48] mb-12 transform hover:scale-110 transition-transform cursor-default">
        {storeInfo.name}
      </h2>
      
      <div className="flex gap-8 mb-16 text-sm font-bold uppercase tracking-widest">
        <a href="#" className="hover:text-yellow-300 transition-colors">Behance</a>
        <a href="#" className="hover:text-blue-400 transition-colors">Dribbble</a>
        <a href="#" className="hover:text-pink-400 transition-colors">Instagram</a>
      </div>
      
      <p className="text-xs tracking-widest text-gray-500 font-medium">
        {copyrightText} — CREATIVE STUDIO
      </p>
    </footer>
  );
};
