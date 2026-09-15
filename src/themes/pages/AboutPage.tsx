import React from 'react';
import { ThemeSchema } from '../schema';

import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { StoryBlockSection } from '../sections/StoryBlockSection';

interface AboutPageProps {
  themeData: ThemeSchema;
}

export const AboutPage: React.FC<AboutPageProps> = ({ themeData }) => {
  const { settings, themeId, sections } = themeData;

  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  return (
    <div className="flex flex-col w-full min-h-screen">
      {headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={themeId} />
      )}

      {/* Basic Hero/Title */}
      <div className="pt-24 pb-8 text-center" style={{ backgroundColor: settings.backgroundColor }}>
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest" style={{ color: settings.textColor, fontFamily: settings.fontFamily }}>
          Tentang Kami
        </h1>
      </div>

      <StoryBlockSection 
        settings={{ 
          layout: 'image-left', 
          title: 'Kisah Perjalanan Kami', 
          content: 'Kami bermula dari sebuah ide kecil untuk memberikan produk terbaik bagi masyarakat. Setiap desain, setiap jahitan, dan setiap detail dirancang dengan cermat dan penuh cinta. Kami percaya bahwa kualitas tidak pernah bohong, dan dedikasi kami terlihat pada setiap produk yang sampai ke tangan Anda.',
          imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?w=1200&auto=format&fit=crop'
        }} 
        themeSettings={settings} 
        themeId={themeId} 
      />

      {footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={themeId} />
      )}
    </div>
  );
};
