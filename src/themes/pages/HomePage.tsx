import React from 'react';
import { ThemeSchema } from '../schema';
import { Product } from '../../types';

// Components
import { HeaderSection } from '../sections/HeaderSection';
import { HeroSection } from '../sections/HeroSection';
import { ProductGridSection } from '../sections/ProductGridSection';
import { StoryBlockSection } from '../sections/StoryBlockSection';
import { FooterSection } from '../sections/FooterSection';

const sectionRegistry: Record<string, React.FC<any>> = {
  Header: HeaderSection,
  Hero: HeroSection,
  ProductGrid: ProductGridSection,
  StoryBlock: StoryBlockSection,
  Footer: FooterSection,
};

interface HomePageProps {
  themeData: ThemeSchema;
  products?: Product[];
}

export const HomePage: React.FC<HomePageProps> = ({ themeData, products }) => {
  const { settings, sectionsOrder, sections, themeId } = themeData;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {sectionsOrder.map((sectionId) => {
        const sectionConfig = sections[sectionId];
        if (!sectionConfig || sectionConfig.isHidden) return null;

        const Component = sectionRegistry[sectionConfig.type];
        if (!Component) return null;

        return (
          <Component
            key={sectionId}
            settings={sectionConfig.settings}
            themeSettings={settings}
            themeId={themeId}
            products={products}
          />
        );
      })}
    </div>
  );
};
