import React from 'react';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';

import { HeaderSection } from '../sections/HeaderSection';
import { ProductGridSection } from '../sections/ProductGridSection';
import { FooterSection } from '../sections/FooterSection';

interface ShopPageProps {
  themeData: ThemeSchema;
  products?: Product[];
}

export const ShopPage: React.FC<ShopPageProps> = ({ themeData, products }) => {
  const { settings, themeId, sections } = themeData;

  // We find the header and footer from the theme's sections if they exist, to reuse their settings
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  return (
    <div className="flex flex-col w-full min-h-screen">
      {headerSection && (
        <HeaderSection 
          settings={headerSection.settings} 
          themeSettings={settings} 
          themeId={themeId} 
        />
      )}

      {/* Generic spacing for inner pages so header doesn't overlap */}
      <div className="pt-24 pb-8 text-center" style={{ backgroundColor: settings.backgroundColor }}>
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest" style={{ color: settings.textColor, fontFamily: settings.fontFamily }}>
          Katalog Produk
        </h1>
      </div>

      <ProductGridSection 
        settings={{ title: '', columns: 4, maxItems: 100, showPrices: true }} 
        themeSettings={settings} 
        themeId={themeId} 
        products={products} 
      />

      {footerSection && (
        <FooterSection 
          settings={footerSection.settings} 
          themeSettings={settings} 
          themeId={themeId} 
        />
      )}
    </div>
  );
};
