import React from 'react';

interface KroomifyLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  badge?: string;
  imgOnly?: boolean;
}

export const KroomifyLogo: React.FC<KroomifyLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-gray-900',
  badge,
  imgOnly = false,
}) => {
  const dimensions = {
    xs: { img: 'w-5 h-5', text: 'text-xs', badge: 'text-[9px]' },
    sm: { img: 'w-7 h-7', text: 'text-sm', badge: 'text-[10px]' },
    md: { img: 'w-8 h-8', text: 'text-base', badge: 'text-[10px]' },
    lg: { img: 'w-10 h-10', text: 'text-lg', badge: 'text-[11px]' },
    xl: { img: 'w-12 h-12', text: 'text-xl', badge: 'text-xs' },
  };

  const current = dimensions[size] || dimensions.md;

  if (imgOnly) {
    return (
      <img
        src="/Logo.png"
        alt="Kroomify"
        className={`${current.img} object-contain rounded-lg shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/Logo.png"
        alt="Kroomify"
        className={`${current.img} object-contain rounded-lg shrink-0 shadow-2xs`}
      />
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`font-black ${current.text} ${textColor} tracking-tight font-poppins`}>
            Kroomify
          </span>
          {badge && (
            <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${current.badge} bg-[#F5E8EA] text-[#66000E] border border-[#E6DDDA]`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
