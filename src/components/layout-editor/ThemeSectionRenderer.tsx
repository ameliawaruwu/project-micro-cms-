import React from 'react';
import { StoreSectionConfig } from '../../types';
import { ThemeId } from '../../themes/ThemeRegistry';
import { getThemeSectionComponent } from '../../themes/sectionResolver';
import { ThemePreviewContext } from '../../themes/useSectionProducts';
import { ResponsivePreviewScope } from './ResponsivePreviewScope';

interface ThemeSectionRendererProps {
  themeId: ThemeId | string;
  section: StoreSectionConfig;
  onUpdateSectionOptions?: (key: string, newOptions: Partial<any>) => void;
  deviceMode?: 'desktop' | 'tablet' | 'mobile';
  readonly?: boolean;
  accentColor?: string;
}

export const ThemeSectionRenderer: React.FC<ThemeSectionRendererProps> = ({ 
  themeId, 
  section, 
  onUpdateSectionOptions, 
  deviceMode,
  readonly = false,
  accentColor,
}) => {
  const Component = getThemeSectionComponent(themeId as string, section.id);
  if (Component) {
    const secKey = section.key || `${section.id}-0`;
    return (
      // deviceMode undefined = storefront publik: isMobile/isTablet undefined agar kelas breakpoint asli dipakai.
      <ThemePreviewContext.Provider value={deviceMode !== undefined}>
        <ResponsivePreviewScope deviceMode={deviceMode}>
        <Component
          sectionOptions={section.options}
          onUpdateSectionOptions={onUpdateSectionOptions}
          sectionKey={secKey}
          deviceMode={deviceMode}
          isMobile={deviceMode ? deviceMode === 'mobile' : undefined}
          isTablet={deviceMode ? deviceMode === 'tablet' : undefined}
          readonly={readonly}
          accentColor={accentColor}
          themeId={themeId}
        />
        </ResponsivePreviewScope>
      </ThemePreviewContext.Provider>
    );
  }

  // Final fallback to original generic rendering if no custom component exists
  // For the sake of this mock, if the theme doesn't define it, just show nothing or a placeholder
  return null;
};
