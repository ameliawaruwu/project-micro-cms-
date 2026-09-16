import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const FashionNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <nav className="w-full bg-[#18181B] text-white border-b border-white/10 sticky top-0 z-50">
      <div className="w-full py-2 bg-black text-center text-[10px] uppercase tracking-[0.3em] text-gray-400">
        Free Global Shipping on Orders Over $500
      </div>
      <div className="w-full px-6 md:px-12 py-5 flex justify-between items-center">
        <div className="w-1/3 flex justify-start">
          <button className="text-white hover:text-gray-400 transition-colors flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        
        <div className="w-1/3 flex justify-center">
          {showLogo && (
            <a href="/" className="text-3xl md:text-4xl font-serif italic tracking-wider hover:opacity-80 transition-opacity">
              {storeInfo.name}
            </a>
          )}
        </div>
        
        <div className="w-1/3 flex justify-end gap-6 items-center">
          <button className="text-white hover:text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
          <button className="text-white hover:text-gray-400 transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export const FashionHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "CHIC & URBAN";
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&q=80";

  return (
    <section className="relative w-full h-[90vh] bg-[#18181B] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt="Fashion Campaign" 
          className="w-full h-full object-cover object-top opacity-70 grayscale-[20%] mix-blend-luminosity scale-105 hover:scale-100 transition-transform duration-[15s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent"></div>
      </div>
      
      <div className="z-10 text-center relative mt-32">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-gray-300 mb-6">New Season</p>
        <h1 className="text-6xl md:text-9xl font-serif italic text-white drop-shadow-2xl mb-12">
          {heading}
        </h1>
        <button className="px-10 py-4 border border-white text-white text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-colors duration-500">
          Shop The Collection
        </button>
      </div>
    </section>
  );
};

export const FashionFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name}`;

  return (
    <footer className="w-full bg-[#18181B] text-white pt-24 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-serif italic mb-6">{storeInfo.name}</h2>
            <p className="text-sm text-gray-400 leading-loose max-w-md mb-8">
              {storeInfo.description || "Defining the modern silhouette with a blend of chic urban aesthetics and timeless elegance. Designed for the bold and the beautiful."}
            </p>
            <div className="flex gap-6">
              <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                Ig
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                Fb
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                Pt
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">Customer Care</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6">Explore</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Journal</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 uppercase tracking-widest">
          <p>{copyrightText}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
