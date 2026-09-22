import React from 'react';

/**
 * Animated Vector Illustration: Kurir Sepeda Motor (Motorcycle Rider)
 */
export const MotorDeliveryIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Road & Speed lines */}
    <path d="M10 108 H150" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
    <path d="M6 100 H32" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" className="animate-pulse" />
    <path d="M16 92 H40" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 84 H26" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />

    {/* Wheels */}
    <circle cx="46" cy="94" r="17" fill="#1F2937" />
    <circle cx="46" cy="94" r="11" fill="#E5E7EB" />
    <circle cx="46" cy="94" r="5" fill="#4B5563" />
    <circle cx="122" cy="94" r="17" fill="#1F2937" />
    <circle cx="122" cy="94" r="11" fill="#E5E7EB" />
    <circle cx="122" cy="94" r="5" fill="#4B5563" />

    {/* Motorcycle Body Frame */}
    <path d="M46 94 L68 76 H96 L110 60 H120 L122 94" stroke="#66000E" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M68 76 L82 94 H105 L118 78" stroke="#66000E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Exhaust Pipe */}
    <path d="M44 98 H80" stroke="#6B7280" strokeWidth="4.5" strokeLinecap="round" />
    {/* Mudguard */}
    <path d="M30 84 Q46 72 62 84" stroke="#52000B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M108 82 Q122 72 136 84" stroke="#52000B" strokeWidth="3.5" strokeLinecap="round" fill="none" />

    {/* Delivery Cargo Box on Rear Rack */}
    <rect x="24" y="44" width="34" height="32" rx="4" fill="#66000E" stroke="#52000B" strokeWidth="2" />
    <rect x="29" y="52" width="24" height="16" rx="2" fill="#FFFFFF" opacity="0.95" />
    <path d="M34 60 H48" stroke="#66000E" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M37 56 L41 60 L45 56" stroke="#66000E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Scooter Headlight & Windshield */}
    <path d="M118 58 L126 50" stroke="#66000E" strokeWidth="4" strokeLinecap="round" />
    <polygon points="125,56 138,58 127,68" fill="#FCD34D" />
    <polygon points="138,58 158,50 158,68" fill="#FDE68A" opacity="0.4" />

    {/* Courier Rider */}
    <path d="M72 74 L84 48 Q92 48 98 56 L108 60" stroke="#66000E" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M88 54 L106 62 L116 58" stroke="#52000B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="86" cy="32" r="14" fill="#1E293B" />
    <path d="M88 28 Q98 28 100 36 H88 Z" fill="#38BDF8" opacity="0.85" />
    <path d="M74 34 Q86 20 98 34" stroke="#66000E" strokeWidth="3" fill="none" />
  </svg>
);

/**
 * Animated Vector Illustration: Mobil Box / Van Ekspedisi (Delivery Van / Car)
 */
export const MobilDeliveryIllustration: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 160 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Road & Speed lines */}
    <path d="M10 108 H150" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
    <path d="M4 100 H28" stroke="#FCA5A5" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" className="animate-pulse" />
    <path d="M12 92 H36" stroke="#F87171" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 84 H22" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />

    {/* Wheels */}
    <circle cx="44" cy="96" r="15" fill="#1F2937" />
    <circle cx="44" cy="96" r="9" fill="#E5E7EB" />
    <circle cx="44" cy="96" r="4" fill="#4B5563" />
    <circle cx="120" cy="96" r="15" fill="#1F2937" />
    <circle cx="120" cy="96" r="9" fill="#E5E7EB" />
    <circle cx="120" cy="96" r="4" fill="#4B5563" />

    {/* Main Cargo Box Container */}
    <rect x="22" y="38" width="76" height="56" rx="4" fill="#66000E" stroke="#52000B" strokeWidth="2" />
    <rect x="22" y="58" width="76" height="12" fill="#52000B" />
    <rect x="36" y="44" width="46" height="10" rx="2" fill="#FFFFFF" opacity="0.95" />
    <path d="M42 49 H74" stroke="#66000E" strokeWidth="2" strokeLinecap="round" />
    <circle cx="39" cy="49" r="1.5" fill="#66000E" />

    {/* Van Front Cab */}
    <path d="M98 48 H118 L136 68 V94 H98 V48 Z" fill="#66000E" stroke="#52000B" strokeWidth="2" strokeLinejoin="round" />
    <path d="M102 52 H116 L130 68 H102 V52 Z" fill="#BAE6FD" opacity="0.85" />
    <circle cx="110" cy="62" r="4" fill="#1F2937" />
    <path d="M106 68 Q110 64 116 68" fill="#1F2937" />

    {/* Headlight */}
    <rect x="132" y="76" width="6" height="8" rx="2" fill="#FCD34D" />
    <polygon points="138,76 156,70 156,86 138,84" fill="#FDE68A" opacity="0.4" />
    <rect x="134" y="86" width="6" height="8" rx="1" fill="#374151" />
    <path d="M102 68 V92" stroke="#7F1D1D" strokeWidth="1.5" />
    <circle cx="106" cy="74" r="1.5" fill="#FFFFFF" />

    {/* Wheel Well Arches */}
    <path d="M28 96 C28 86 60 86 60 96" stroke="#4B5563" strokeWidth="3" fill="none" />
    <path d="M104 96 C104 86 136 86 136 96" stroke="#4B5563" strokeWidth="3" fill="none" />
  </svg>
);
