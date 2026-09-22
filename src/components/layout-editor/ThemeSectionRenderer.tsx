import React from 'react';
import { StoreSectionConfig } from '../../types';
import { ThemeRegistry, ThemeId, normalizeThemeId } from '../../themes/ThemeRegistry';

interface ThemeSectionRendererProps {
  themeId: ThemeId | string;
  section: StoreSectionConfig;
  onUpdateSectionOptions?: (key: string, newOptions: Partial<any>) => void;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
}

export const ThemeSectionRenderer: React.FC<ThemeSectionRendererProps> = ({ themeId, section, onUpdateSectionOptions, deviceMode = 'desktop' }) => {
  const normalizedId = normalizeThemeId(themeId);
  const themeComponents = ThemeRegistry[normalizedId] || ThemeRegistry[themeId as ThemeId];

  if (!themeComponents) {
    return <div className="p-4 bg-red-100 text-red-600">Theme not found: {themeId}</div>;
  }

  // Convert snake_case or kebab-case to PascalCase
  const toPascalCase = (str: string) => {
    return str
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  };

  // Special mappings for existing standard sections
  const specialMap: Record<string, string> = {
    'header': 'Navbar',
    'hero_banner': 'Hero',
    'footer': 'Footer',
    'featured_products': 'FeaturedProducts',
    'product_grid': 'FeaturedProducts', // fallback mapping
  };

  const componentName = specialMap[section.id] || toPascalCase(section.id);
  const Component = themeComponents[componentName] as React.FC<any>;

  if (Component) {
    const secKey = section.key || `${section.id}-0`;
    return (
      <Component 
        sectionOptions={section.options} 
        onUpdateSectionOptions={onUpdateSectionOptions} 
        sectionKey={secKey}
        deviceMode={deviceMode}
        isMobile={deviceMode === 'mobile'}
        isTablet={deviceMode === 'tablet'}
      />
    );
  }

  // Final fallback to original generic rendering if no custom component exists
  // For the sake of this mock, if the theme doesn't define it, just show nothing or a placeholder
  return null;
};
