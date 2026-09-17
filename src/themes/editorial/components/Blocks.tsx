import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const EditorialLookbook: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const heading = sectionOptions.heading || "Lookbook";
  const desc = sectionOptions.description || "Discover the latest silhouettes designed for the modern metropolitan. A blend of classic tailoring and avant-garde details.";
  
  return (
    <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto bg-[#fafafa]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-center">
        <div className="md:col-span-4 order-2 md:order-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-6">Volume I</p>
          <h2 className="text-5xl md:text-6xl font-serif italic mb-8 text-gray-900">{heading}</h2>
          <p className="text-gray-600 leading-loose mb-12 font-light text-sm md:text-base">{desc}</p>
          <button className="border-b border-gray-900 pb-1 uppercase tracking-[0.2em] text-[10px] font-medium hover:text-gray-500 hover:border-gray-500 transition-colors">
            View Gallery
          </button>
        </div>
        <div className="md:col-span-8 order-1 md:order-2">
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {products.slice(0, 2).map((p, i) => (
              <div key={p.id} className={`overflow-hidden ${i === 1 ? 'mt-16 md:mt-24' : ''}`}>
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full aspect-[3/4] object-cover grayscale-[20%] hover:grayscale-0 hover:scale-105 transition-all duration-1000" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const EditorialCampaign: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "The Nocturne Campaign";
  const desc = sectionOptions.description || "Explore the dark, romantic tension of our newest evening wear collection shot in Paris.";
  
  return (
    <section className="w-full min-h-[70vh] bg-gray-900 text-white flex flex-col items-center justify-center text-center p-8 relative overflow-hidden my-12">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
        <img src={sectionOptions.imageUrl || sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"} alt="Campaign Background" className="w-full h-full object-cover object-center grayscale" />
      </div>
      <div className="relative z-10 max-w-2xl px-6 py-20 bg-gray-900/40 backdrop-blur-sm border border-white/10">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif italic mb-10 drop-shadow-lg">{heading}</h2>
        <p className="uppercase tracking-[0.3em] text-[10px] md:text-xs text-gray-300 leading-loose">
          {desc}
        </p>
      </div>
    </section>
  );
};

export const EditorialAsymmetricShowcase: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const product = products[2] || products[0];
  if (!product) return null;
  
  return (
    <section className="py-24 md:py-40 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col md:flex-row items-end gap-16 md:gap-24">
      <div className="w-full md:w-7/12 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gray-900/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
        <img src={product.image} alt={product.name} className="w-full aspect-[4/5] object-cover mix-blend-multiply" />
      </div>
      <div className="w-full md:w-5/12 pb-12 md:pb-24 pr-4 md:pr-12">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 mb-8 font-medium">Featured Piece</p>
        <h3 className="text-4xl md:text-5xl font-serif mb-8 text-gray-900 leading-tight">{product.name}</h3>
        <p className="text-sm text-gray-600 leading-loose mb-12 font-light">{product.description}</p>
        <p className="font-medium tracking-widest text-gray-900">Rp {product.price.toLocaleString('id-ID')}</p>
        <button className="mt-12 w-full py-4 bg-gray-900 text-white text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
          View Details
        </button>
      </div>
    </section>
  );
};

export const EditorialBrandStory: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Our Heritage";
  const desc = sectionOptions.description || "Born from a desire to merge timeless elegance with contemporary edge, we craft pieces that transcend seasons. Every garment is a testament to meticulous tailoring and an unapologetic approach to style.";
  
  return (
    <section className="py-32 md:py-48 px-6 text-center max-w-4xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-serif italic mb-12 text-gray-900">{heading}</h2>
      <p className="text-lg md:text-xl leading-[2.5] text-gray-600 font-light">
        {desc}
      </p>
      <div className="w-px h-24 bg-gray-300 mx-auto mt-20"></div>
    </section>
  );
};

export const EditorialJournal: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "The Journal";
  
  return (
    <section className="py-32 bg-white px-6 md:px-12 border-t border-gray-100">
      <h2 className="text-center text-4xl md:text-5xl font-serif italic mb-20 text-gray-900">{heading}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-[1400px] mx-auto">
        {[1, 2, 3].map(i => (
          <article key={i} className="cursor-pointer group">
            <div className="w-full aspect-[4/5] bg-gray-100 mb-8 overflow-hidden relative">
              <img 
                src={`https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&q=80&sig=${i}`} 
                alt="Journal" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s] ease-out grayscale-[10%]" 
              />
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500 mb-4">Editorial</p>
              <h3 className="text-2xl font-serif group-hover:text-gray-500 transition-colors">Behind the Scenes: Chapter {i}</h3>
            </div>
          </article>
        ))}
      </div>
      <div className="flex justify-center mt-20">
        <button className="border border-gray-900 px-12 py-4 text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-gray-900 hover:text-white transition-colors">
          Read All Entries
        </button>
      </div>
    </section>
  );
};
