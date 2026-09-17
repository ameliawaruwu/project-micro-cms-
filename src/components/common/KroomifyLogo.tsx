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
  // Dimensions for full logo (height set, width auto to maintain natural 2.5:1 ratio)
  const fullDimensions = {
    xs: { h: 'h-6', badge: 'text-[9px] px-1.5 py-0.5' },
    sm: { h: 'h-8 sm:h-[34px]', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { h: 'h-9 sm:h-10', badge: 'text-[10px] px-2 py-0.5' },
    lg: { h: 'h-11 sm:h-12', badge: 'text-[11px] px-2 py-0.5' },
    xl: { h: 'h-14 sm:h-16', badge: 'text-xs px-2.5 py-1' },
  };

  // Dimensions for collapsed / icon-only mode
  const iconDimensions = {
    xs: { box: 'w-6 h-6', imgH: 'h-[52px]', leftOffset: '-15px', topOffset: '-13px' },
    sm: { box: 'w-8 h-8', imgH: 'h-[68px]', leftOffset: '-20px', topOffset: '-18px' },
    md: { box: 'w-9 h-9', imgH: 'h-[76px]', leftOffset: '-23px', topOffset: '-20px' },
    lg: { box: 'w-11 h-11', imgH: 'h-[94px]', leftOffset: '-28px', topOffset: '-25px' },
    xl: { box: 'w-14 h-14', imgH: 'h-[120px]', leftOffset: '-36px', topOffset: '-32px' },
  };

  const currentFull = fullDimensions[size] || fullDimensions.md;
  const currentIcon = iconDimensions[size] || iconDimensions.md;

  // If collapsed or iconOnly requested
  if (iconOnly || !showText) {
    return (
      <div
        className={`${currentIcon.box} overflow-hidden rounded-lg relative shrink-0 flex items-center justify-center select-none ${className}`}
        title="Kroomify"
      >
        <img
          src="/Logo.png"
          alt="Kroomify"
          className={`absolute ${currentIcon.imgH} max-w-none object-contain pointer-events-none select-none`}
          style={{
            left: currentIcon.leftOffset,
            top: currentIcon.topOffset,
          }}
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
