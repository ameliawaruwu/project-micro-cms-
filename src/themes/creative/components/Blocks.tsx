import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const CreativeLookbook: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const heading = sectionOptions.heading || "Visual Diary";
  
  return (
    <section className="py-32 px-6 md:px-12 bg-white relative">
      <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-300 rounded-br-[100px] z-0"></div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-8 mb-20">
          <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter">{heading}</h2>
          <div className="h-2 flex-1 bg-black rounded-full"></div>
        </div>
        
        <div className="columns-1 md:columns-3 gap-8 space-y-8">
          {products.map((p, i) => (
            <div key={p.id} className="break-inside-avoid group cursor-pointer">
              <div className="relative overflow-hidden rounded-3xl mb-4">
                <div className={`absolute inset-0 bg-gradient-to-br from-black/0 to-black/60 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className={`w-full ${i % 2 === 0 ? 'aspect-square' : 'aspect-[3/4]'} object-cover transform group-hover:scale-110 transition-transform duration-700`} 
                />
                <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 text-white">
                  <p className="font-bold text-xl mb-1">{p.name}</p>
                  <p className="text-yellow-300 font-bold">Rp {p.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const CreativeFloatingShowcase: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Interactive Showcase";
  
  return (
    <section className="py-32 bg-blue-600 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:24px_24px]"></div>
      <h2 className="text-6xl md:text-9xl font-black text-center opacity-20 whitespace-nowrap overflow-hidden leading-none absolute top-10 left-0 right-0 pointer-events-none select-none">
        DESIGN IN MOTION DESIGN IN MOTION
      </h2>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20">
        <h2 className="text-4xl md:text-6xl font-black mb-12">{heading}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="h-[400px] bg-white rounded-[40px] transform -rotate-3 hover:rotate-0 transition-transform duration-500 p-2 shadow-2xl relative">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-yellow-300 rounded-full z-20 animate-bounce"></div>
            <img src="https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80" className="w-full h-full object-cover rounded-[32px]" alt="Showcase" />
          </div>
          <div className="text-left">
            <h3 className="text-3xl font-bold mb-6 text-yellow-300">Pushing Boundaries</h3>
            <p className="text-lg leading-relaxed font-medium opacity-90 mb-8">
              We believe in creating digital experiences that challenge the status quo. 
              By blending vibrant aesthetics with seamless functionality, we build platforms that leave a lasting impression.
            </p>
            <button className="px-8 py-4 border-2 border-white rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-blue-600 transition-colors">
              Read Manifesto
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
