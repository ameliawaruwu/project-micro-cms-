// src/themes/schema.ts

// Global Theme Settings
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor?: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  containerWidth: 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'w-full';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

// Base configuration for any Section
export interface SectionConfig<T = any> {
  id: string; // Unique ID for the section instance (e.g., 'hero-1')
  type: 'Header' | 'Hero' | 'ProductGrid' | 'StoryBlock' | 'Footer';
  isHidden?: boolean;
  settings: T;
}

// Specific Section Settings Interfaces
export interface HeaderSettings {
  style: 'transparent' | 'solid' | 'sticky';
  showLogo: boolean;
  navLinks: { label: string; url: string }[];
}

export interface HeroSettings {
  layout: 'static' | 'split' | 'slider';
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  overlayOpacity?: number;
}

export interface ProductGridSettings {
  title: string;
  columns: 2 | 3 | 4 | 'carousel';
  maxItems: number;
  showPrices: boolean;
}

export interface StoryBlockSettings {
  layout: 'image-left' | 'image-right';
  title: string;
  content: string;
  imageUrl: string;
}

export interface FooterSettings {
  copyrightText: string;
  showSocials: boolean;
  showNewsletter: boolean;
  columns: { title: string; links: { label: string; url: string }[] }[];
}

// The root Theme JSON Schema
export interface ThemeSchema {
  themeId: string;
  name: string;
  settings: ThemeSettings;
  sectionsOrder: string[]; // Array of section IDs dictating the layout order
  sections: Record<string, SectionConfig>; // Map of section ID to its configuration
}
