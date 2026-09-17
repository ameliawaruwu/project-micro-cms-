import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { CuteProductCard } from './ProductCard';
import { InlineEditableText } from '../../layout-editor/InlineEditableText';

export const CuteFeaturedProducts: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey }) => {
  const allProducts = useCmsStore(state => state.products);
  const products = allProducts.filter(p => p.isFeatured).slice(0, 4);

  const title = sectionOptions.featuredTitle || sectionOptions.heading || "Produk Favorit";
  const subtitle = sectionOptions.featuredSubtitle || sectionOptions.subheading || "Paling Disukai 💖";
  const buttonText = sectionOptions.buttonLabel || sectionOptions.buttonText || "Lihat Lebih Banyak 🌸";

  if (products.length === 0) return null;

  return (
    <section className="w-full py-20 px-6 font-['Outfit',sans-serif] bg-white relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFF5F7] rounded-full -translate-y-1/2 translate-x-1/3"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          {sectionOptions.imageUrl && (
            <img 
              src={sectionOptions.imageUrl} 
              alt="Featured Products Banner" 
              className="w-full h-48 md:h-64 object-cover rounded-3xl mb-8 border-4 border-[#FFF5F7] shadow-sm"
            />
          )}
          <div className="inline-block px-4 py-1 bg-[#FFD1DC] text-[#FF85A1] font-bold rounded-full mb-4 rotate-2">
            <InlineEditableText
              tagName="span"
              value={subtitle}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { subheading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">
            <InlineEditableText
              tagName="span"
              value={title}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { heading: val })}
              readonly={!onUpdateSectionOptions}
            />
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <CuteProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a 
            href="/produk" 
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FF85A1] text-white text-lg font-black hover:bg-[#FF6B8B] hover:scale-105 transition-all duration-300 rounded-full border-4 border-[#FFF5F7] shadow-sm"
            onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
          >
            <InlineEditableText
              tagName="span"
              value={buttonText}
              onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val })}
              readonly={!onUpdateSectionOptions}
            />
          </a>
        </div>
      </div>
    </section>
  );
};
