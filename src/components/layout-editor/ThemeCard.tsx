import React from 'react';
import { THEME_DATA_MAP } from '../../themes/themeData';
import { TemplateGalleryItem } from './themeGalleryData';

// ─── Mini Template Preview ─────────────────────────────────────────────
export const MiniTemplatePreview: React.FC<{
  template: TemplateGalleryItem;
  themeData: any;
}> = ({ template, themeData }) => {
  const sections = template.storeTemplate.sections || [];
  const products = themeData?.products || [];

  const headerSection = sections.find((s) => s.id === 'header');
  const heroSection = sections.find((s) => s.id === 'hero_banner');
  const productSection = sections.find((s) =>
    ['product_grid', 'featured_products', 'collection_grid', 'lookbook', 'signature_collection', 'asymmetric_showcase', 'latest_drop'].includes(s.id)
  );

  const headerStyle = headerSection?.options?.headerStyle || 'standard';
  const heroStyle = heroSection?.options?.bannerStyle || 'normal';
  
  let productLayout = 'grid';
  let gridCols = 3;
  if (productSection) {
    if (
      productSection.options?.layout === 'masonry' ||
      productSection.options?.layout === 'asymmetric' ||
      productSection.id === 'asymmetric_showcase' ||
      productSection.id === 'lookbook'
    ) {
      productLayout = 'asymmetric';
    } else {
      productLayout = 'grid';
      gridCols = productSection.options?.gridColumns || 3;
      if (gridCols > 4) gridCols = 4;
      if (gridCols < 2) gridCols = 2;
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-white pointer-events-none transition-transform duration-700 group-hover:scale-[1.03]">
      {/* Dynamic Header */}
      {headerStyle === 'brand' ? (
        <div className="h-6 flex items-center justify-center shrink-0" style={{ backgroundColor: template.primaryAccent }}>
          <div className="w-12 h-1.5 bg-white/80 rounded-full"></div>
        </div>
      ) : headerStyle === 'minimal' ? (
        <div className="h-7 border-b border-gray-100 flex items-center px-4 justify-between shrink-0">
          <div className="flex gap-2">
            <div className="w-5 h-1 bg-gray-200 rounded-full"></div>
            <div className="w-5 h-1 bg-gray-200 rounded-full"></div>
          </div>
          <div className="w-10 h-1.5 bg-gray-300 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
        </div>
      ) : (
        <div className="h-7 border-b border-gray-100 flex items-center px-4 gap-3 shrink-0">
          <div className="w-4 h-4 rounded-full bg-gray-200"></div>
          <div className="flex gap-2.5 ml-auto">
            <div className="w-6 h-1 bg-gray-100 rounded-full"></div>
            <div className="w-6 h-1 bg-gray-100 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Dynamic Hero */}
      {heroStyle === 'split' ? (
        <div className="h-[40%] shrink-0 flex">
          <div className="w-1/2 h-full bg-[#F6F6F7] flex flex-col justify-center px-4 gap-2 border-r border-white relative overflow-hidden">
            <div className="w-4/5 h-2.5 bg-gray-300 rounded-sm"></div>
            <div className="w-3/5 h-1.5 bg-gray-200 rounded-sm"></div>
            <div className="w-1/3 h-2 mt-1 rounded-sm" style={{ backgroundColor: template.primaryAccent }}></div>
          </div>
          <div className="w-1/2 h-full">
            <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      ) : heroStyle === 'typographic' ? (
        <div className="h-[40%] relative shrink-0 bg-[#FAFAFA] flex flex-col items-center justify-center p-4 text-center overflow-hidden">
          <img src={template.thumbnailUrl} alt={template.name} className="absolute inset-0 w-full h-full object-cover opacity-20" loading="lazy" />
          <h4 
            className="relative z-10 font-extrabold text-2xl md:text-3xl uppercase tracking-tighter leading-none"
            style={{ fontFamily: template.fontFamily, color: template.primaryAccent }}
          >
            {template.name}
          </h4>
          <div className="relative z-10 w-1/2 h-1.5 bg-gray-300 rounded-full mt-3"></div>
        </div>
      ) : heroStyle === 'compact' ? (
        <div className="h-[25%] relative shrink-0">
          <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/30 flex items-center px-5">
            <h4 className="text-white font-bold text-lg" style={{ fontFamily: template.fontFamily }}>
              {template.name}
            </h4>
          </div>
        </div>
      ) : (
        /* Normal, Full, Editorial, Campaign */
        <div className="h-[45%] relative shrink-0">
          <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center p-4">
            <h4 
              className="text-white font-bold text-xl md:text-2xl tracking-wide drop-shadow-md text-center"
              style={{ fontFamily: template.fontFamily }}
            >
              {template.name}
            </h4>
          </div>
        </div>
      )}

      {/* Dynamic Content / Products */}
      <div className="flex-1 p-4 flex flex-col bg-white">
        {productLayout === 'asymmetric' ? (
          <div className="flex gap-3 h-full">
            <div className="w-[55%] h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
              {products[0] && <img src={products[0].image} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="w-[45%] flex flex-col gap-3">
              <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                {products[1] && <img src={products[1].image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="h-[35%] bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                {products[2] && <img src={products[2].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                <div className="absolute inset-0 p-2.5 flex flex-col gap-1.5 justify-end bg-gradient-to-t from-black/30 to-transparent">
                  <div className="w-full h-1.5 bg-white/90 rounded-full"></div>
                  <div className="w-1/2 h-1.5 bg-white/70 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-3">
            <div className="w-20 h-1.5 bg-gray-200 rounded-full self-center"></div>
            <div 
              className="grid gap-3 flex-1" 
              style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
              {products.slice(0, gridCols).map((p: any, i: number) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1 items-center">
                    <div className="h-1.5 w-4/5 bg-gray-200 rounded-full"></div>
                    <div className="h-1 w-1/2 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Template Card ───────────────────────────────────────────────────
export const TemplateCard: React.FC<{
  template: TemplateGalleryItem;
  isActive: boolean;
  onPreview: () => void;
  onUse: () => void;
}> = ({ template, isActive, onPreview, onUse }) => {
  const themeData = THEME_DATA_MAP[template.storeTemplate.id] || THEME_DATA_MAP['minimalist'];

  return (
    <div className="group font-poppins flex flex-col gap-3.5 bg-white p-3.5 rounded-2xl border border-[#E5E0DD] shadow-2xs hover:shadow-md hover:border-[#D5D0CD] transition-all">
      {/* Thumbnail */}
      <div
        className={`relative aspect-[4/3] sm:aspect-[16/12] bg-[#FAF7F7] overflow-hidden cursor-pointer rounded-xl border border-[#E5E0DD] transition-all duration-300 ${
          isActive ? 'ring-2 ring-[#66000E] border-transparent shadow-xs' : 'group-hover:border-[#D5D0CD]'
        }`}
        onClick={onPreview}
      >
        <MiniTemplatePreview template={template} themeData={themeData} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
      </div>

      {/* Info Row (Title + Button) */}
      <div className="flex items-center justify-between px-1 gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-[#1F1F1F] leading-tight truncate">
            {template.name}
          </h3>
          <p className="text-xs text-[#777777] mt-0.5 truncate">
            oleh MicroCMS • {template.sectionCount} Seksi
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUse();
          }}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer ${
            isActive 
              ? 'bg-[#66000E] text-white border-[#66000E] shadow-sm hover:bg-[#52000B]' 
              : 'bg-white border-[#E5E0DD] text-[#1F1F1F] hover:bg-[#F5E8EA] hover:text-[#66000E] hover:border-[#E8DDDE]'
          }`}
        >
          {isActive ? 'Aktif' : 'Tambahkan'}
        </button>
      </div>
    </div>
  );
};
