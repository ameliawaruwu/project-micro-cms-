import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const FuturisticFloatingShowcase: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const product = products[0]; // Just showing first product for showcase
  if (!product) return null;

  return (
    <section className="py-32 px-6 md:px-12 bg-[#050505] text-white overflow-hidden relative border-t border-gray-900">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 relative z-20 md:pr-12">
          <div className="inline-block px-3 py-1 bg-purple-900/40 border border-purple-500/50 text-purple-400 text-xs font-mono mb-6 uppercase tracking-widest backdrop-blur-sm">
            {sectionOptions.badgeText || "New Arrival"}
          </div>
          <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-6 text-white drop-shadow-lg">{product.name}</h2>
          <p className="text-gray-400 mb-10 font-mono leading-relaxed text-sm lg:text-base">{product.description}</p>
          <button className="px-8 py-4 bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            Analyze Spec
          </button>
        </div>
        <div className="w-full md:w-1/2 relative mt-20 md:mt-0">
          <div className="absolute w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <img src={product.image} alt={product.name} className="w-full h-[500px] object-contain relative z-20 mix-blend-screen drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-[float_6s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
};

export const FuturisticTechFeatures: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => (
  <section className="py-24 px-6 md:px-12 bg-[#080808] text-white border-y border-gray-900 relative">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-[#080808] to-[#080808]"></div>
    <div className="max-w-6xl mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {[
          { title: "Quantum Processing", desc: "Unparalleled speed for real-time rendering." },
          { title: "Neural Cooling", desc: "AI-driven temperature management system." },
          { title: "Holo Interface", desc: "True 3D projection for immersive control." }
        ].map((feature, i) => (
          <div key={i} className="border-l-2 border-purple-600 pl-8 py-2 relative group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#080808] border-2 border-purple-600 group-hover:bg-purple-600 transition-colors shadow-[0_0_10px_#A855F7]"></div>
            <h3 className="text-xl font-black uppercase tracking-widest mb-3 text-white">{feature.title}</h3>
            <p className="text-gray-500 font-mono text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const FuturisticProductComparison: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => (
  <section className="py-24 px-6 md:px-12 bg-[#050505] text-white text-center">
    <h2 className="text-3xl font-black uppercase tracking-widest mb-4">Spec Comparison</h2>
    <p className="text-purple-500 font-mono mb-16 tracking-widest text-sm">[ Data analysis complete ]</p>
    <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-gray-800 rounded-lg p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
       <div className="grid grid-cols-3 gap-4 font-mono text-xs md:text-sm uppercase text-purple-400 mb-6 border-b border-gray-800 pb-4 tracking-wider">
         <div className="text-left">Feature</div>
         <div>Model X</div>
         <div>Model Y</div>
       </div>
       {[
         { f: "Processing", x: "12 Cores", y: "16 Cores" },
         { f: "Memory", x: "32 GB DDR5", y: "64 GB DDR5" },
         { f: "Cooling", x: "Liquid", y: "Quantum" }
       ].map((row, i) => (
         <div key={i} className="grid grid-cols-3 gap-4 font-mono text-sm text-gray-400 py-6 border-b border-gray-800/50 last:border-0 hover:bg-white/[0.02] transition-colors">
           <div className="text-left text-gray-300">{row.f}</div>
           <div>{row.x}</div>
           <div>{row.y}</div>
         </div>
       ))}
    </div>
  </section>
);

export const FuturisticInnovationCta: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Upgrade Reality";
  const desc = sectionOptions.description || "Join the elite network of early adopters.";
  const buttonLabel = sectionOptions.buttonLabel || "Access Portal";
  
  return (
    <section className="py-40 px-6 md:px-12 bg-purple-600 text-white text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80')] mix-blend-overlay opacity-30 object-cover group-hover:scale-105 transition-transform duration-1000"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-80"></div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 drop-shadow-2xl">{heading}</h2>
        <p className="font-mono mb-12 text-gray-300 tracking-widest">{desc}</p>
        <button className="px-10 py-5 bg-white text-purple-900 font-bold uppercase tracking-widest hover:bg-gray-200 transition shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          {buttonLabel}
        </button>
      </div>
    </section>
  );
};
