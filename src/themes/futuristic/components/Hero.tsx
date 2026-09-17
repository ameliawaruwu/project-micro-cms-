import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';

export const FuturisticHero: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const bgImage = sectionOptions?.imageUrl || sectionOptions?.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=80";

  const title = sectionOptions.heading || storeInfo.name;
  const subtitle = sectionOptions.subheading || sectionOptions.subtitle || "Sistem Diaktifkan";
  const description = sectionOptions.description || storeInfo.description;
  const buttonText = sectionOptions.buttonText || sectionOptions.buttonLabel || "Jelajahi Koleksi";

  return (
    <section className="relative w-full min-h-[500px] md:h-[90vh] md:min-h-[700px] py-16 md:py-0 flex items-center justify-center overflow-hidden bg-white font-['Space_Grotesk',sans-serif]">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgzOHYzOEgxVjF6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjIwLDM4LDM4LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-40"></div>

      {/* Cyberpunk Glitch Image */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 mix-blend-multiply filter contrast-125 saturate-150">
        <img 
          src={bgImage} 
          alt="Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-red-500/30 bg-red-50/80 backdrop-blur-md mb-6 sm:mb-8 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-red-600">
            <InlineEditableText
              tagName="span"
              value={subtitle}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-red-600 to-red-800 tracking-tighter leading-[1.1] sm:leading-[1] mb-4 sm:mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.1)]">
          <InlineEditableText
            tagName="span"
            value={title}
            onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
            readonly={!onUpdateSectionOptions}
          />
        </h1>
        
        <p className="text-sm sm:text-base md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          <InlineEditableText
            tagName="span"
            value={description}
            onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { description: val })}
            readonly={!onUpdateSectionOptions}
          />
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <a 
            href="/produk" 
            className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-transparent text-gray-900 text-xs sm:text-sm font-bold uppercase tracking-widest w-full sm:w-auto sm:min-w-[200px] overflow-hidden rounded-none border border-red-500/30 hover:border-red-600 transition-colors"
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 group-hover:text-white transition-colors">
              <InlineEditableText
                tagName="span"
                value={buttonText}
                onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonText: val })}
                readonly={!onUpdateSectionOptions}
              />
            </span>
          </a>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-8 hidden md:flex flex-col gap-1 opacity-50">
        <div className="w-12 h-0.5 bg-red-600"></div>
        <div className="w-8 h-0.5 bg-red-600"></div>
        <div className="w-4 h-0.5 bg-red-600"></div>
      </div>
      
      <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden md:flex flex-col gap-4 opacity-30">
        <span className="text-[10px] text-gray-400 tracking-[0.5em] rotate-90 origin-right">SYS.001</span>
      </div>
    </section>
  );
};
