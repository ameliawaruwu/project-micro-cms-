import React from 'react';

interface KroomifyLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  badge?: string;
  imgOnly?: boolean;
  iconOnly?: boolean;
}

export const KroomifyLogo: React.FC<KroomifyLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  badge,
  imgOnly = false,
  iconOnly = false,
}) => {
  // Dimensions for full logo (height set, width auto to maintain natural 4.4:1 ratio)
  const fullDimensions = {
    xs: { h: 'h-6 sm:h-6.5', badge: 'text-[9px] px-1.5 py-0.5' },
    sm: { h: 'h-7.5 sm:h-8', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { h: 'h-8.5 sm:h-9', badge: 'text-[10px] px-2 py-0.5' },
    lg: { h: 'h-10 sm:h-11', badge: 'text-[11px] px-2 py-0.5' },
    xl: { h: 'h-13 sm:h-14', badge: 'text-xs px-2.5 py-1' },
  };

  // Dimensions for collapsed / icon-only mode
  const iconDimensions = {
    xs: { box: 'w-6 h-6' },
    sm: { box: 'w-7.5 h-7.5' },
    md: { box: 'w-8.5 h-8.5' },
    lg: { box: 'w-10 h-10' },
    xl: { box: 'w-12 h-12' },
  };

  const currentFull = fullDimensions[size] || fullDimensions.md;
  const currentIcon = iconDimensions[size] || iconDimensions.md;

  // If collapsed or iconOnly requested
  if (iconOnly || !showText) {
    return (
      <div
        className={`${currentIcon.box} overflow-hidden rounded-lg shrink-0 flex items-center justify-center select-none ${className}`}
        title="Kroomify"
      >
        <img
          src="/Logo-Icon.png"
          alt="Kroomify"
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-2xs"
          loading="eager"
        />
      </div>
    );
  }

  if (imgOnly) {
    return (
      <img
        src="/Logo.png"
        alt="Kroomify"
        className={`${currentFull.h} w-auto max-w-full object-contain shrink-0 ${className}`}
        loading="eager"
      />
    );
  }

  // Full Logo display: Red Logo contains the red store awning K and official red Kroomify wordmark
  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none shrink-0 ${className}`}>
      <img
        src="/Logo.png"
        alt="Kroomify"
        className={`${currentFull.h} w-auto max-w-full object-contain shrink-0 drop-shadow-2xs`}
        loading="eager"
      />
      {badge && (
        <span
          className={`inline-flex items-center font-bold uppercase tracking-wider ${currentFull.badge} rounded-md bg-[#F5E8EA] text-[#66000E] border border-[#E6DDDA] shadow-2xs shrink-0 select-none`}
        >
          {badge}
        </span>
      )}
    </div>
  );
};
