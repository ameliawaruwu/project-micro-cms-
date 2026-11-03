import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';

export const ModernHero: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string; accentColor?: string }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey, accentColor = '#2563EB' }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const bgImage = sectionOptions?.imageUrl || sectionOptions?.bannerUrl || (storeInfo as any)?.bannerUrl || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80";

  const title = sectionOptions.heading || storeInfo.name;
  const subtitle = sectionOptions.subheading || sectionOptions.subtitle || "Koleksi Terbaru";
  const description = sectionOptions.description || storeInfo.description;
  const buttonText = sectionOptions.buttonText || sectionOptions.buttonLabel || "Belanja Sekarang";

  return (
    <section className="w-full px-4 md:px-8 py-6 md:py-10 font-['Outfit',sans-serif] bg-white">
      <div className="max-w-7xl mx-auto rounded-[2rem] bg-gray-50 overflow-hidden flex flex-col md:flex-row items-stretch">
        
        {/* Left: Content */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
          <span
            className="inline-block w-fit text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full mb-5"
            style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}
          >
            <InlineEditableText
              tagName="span"
              value={subtitle}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-5">
            <InlineEditableText
              tagName="span"
              value={title}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </h1>

          <p className="text-sm md:text-base text-gray-500 mb-8 max-w-md leading-relaxed">
            <InlineEditableText
              tagName="span"
              value={description}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { description: val })}
              readonly={!onUpdateSectionOptions}
            />
          </p>

          <a
            href="/produk"
            className="inline-flex items-center justify-center px-7 py-3.5 text-white text-sm font-bold rounded-full w-fit shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: accentColor }}
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <InlineEditableText
              tagName="span"
              value={buttonText}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonText: val })}
              readonly={!onUpdateSectionOptions}
            />
          </a>
        </div>

        {/* Right: Image */}
        <div className="flex-1 min-h-[280px] md:min-h-[420px] relative">
          <img
            src={bgImage}
            alt="Hero"
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>
      </div>
    </section>
  );
};
