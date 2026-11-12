import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { InlineEditableText } from '../../../components/layout-editor/InlineEditableText';
import { getDeviceClass } from '../../../utils/responsivePreview';
import { getHeroContent, HeroActionLink } from '../../heroContent';
import { useThemeProductsSource } from '../../useSectionProducts';
import { STORE_ROUTES } from '../../storefrontLinks';

export const ModernHero: React.FC<{ sectionOptions?: any; onUpdateSectionOptions?: any; sectionKey?: string; accentColor?: string; isMobile?: boolean; isTablet?: boolean }> = ({ sectionOptions = {}, onUpdateSectionOptions, sectionKey, accentColor = '#2563EB', isMobile, isTablet }) => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const products = useThemeProductsSource('modern');
  // Gambar hero: unggahan merchant → banner toko → foto produk pertama → gambar dekoratif bawaan.
  const bgImage = sectionOptions?.imageUrl || sectionOptions?.bannerUrl || (storeInfo as any)?.bannerUrl || products.find((p) => p.image)?.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80";

  const title = sectionOptions.heading || storeInfo?.name || 'Selamat Datang di Toko Kami';
  const subtitle = sectionOptions.subheading || sectionOptions.subtitle || "Produk Pilihan";
  const description = sectionOptions.description || storeInfo?.description || 'Temukan produk terbaik dari toko kami dengan harga bersahabat.';
  const hero = getHeroContent(sectionOptions, { buttonLabel: 'Belanja Sekarang', buttonLink: STORE_ROUTES.catalog, secondaryButtonLink: STORE_ROUTES.promo });

  const flexDirClass = getDeviceClass(isMobile, isTablet, {
    mobile: 'flex-col',
    tablet: 'flex-col',
    desktop: 'flex-row',
    fallback: 'flex-col md:flex-row',
  });

  return (
    <section className="w-full px-4 md:px-8 py-6 md:py-10 font-['Outfit',sans-serif] bg-white">
      <div className={`max-w-7xl mx-auto rounded-[2rem] bg-gray-50 overflow-hidden flex ${flexDirClass} items-stretch`}>

        {/* Left: Content */}
        <div className="flex-1 min-w-0 p-6 sm:p-8 md:p-16 flex flex-col justify-center">
          {hero.badge && (
            <span className="inline-block w-fit text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded-md mb-3" style={{ backgroundColor: accentColor }}>
              {hero.badge}
            </span>
          )}
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

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-5 break-words">
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

          <div className="flex flex-wrap gap-3">
            <HeroActionLink
              action={hero.primary}
              className="inline-flex items-center justify-center px-7 py-3.5 text-white text-sm font-bold rounded-full w-fit shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: accentColor }}
              onClick={(e) => { if (onUpdateSectionOptions) e.preventDefault(); }}
            >
              <InlineEditableText
                tagName="span"
                value={hero.primary.label}
                onSave={(val) => onUpdateSectionOptions && sectionKey && onUpdateSectionOptions(sectionKey, { buttonLabel: val, buttonText: val })}
                readonly={!onUpdateSectionOptions}
              />
            </HeroActionLink>
            {hero.secondary && (
              <HeroActionLink
                action={hero.secondary}
                className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-bold rounded-full w-fit border-2 bg-white transition-transform hover:scale-105"
                style={{ borderColor: accentColor, color: accentColor }}
              />
            )}
          </div>
        </div>

        {/* Right: Image */}
        <div className="flex-1 min-h-[240px] sm:min-h-[280px] md:min-h-[420px] relative">
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>
      </div>
    </section>
  );
};
