import React from 'react';

interface AuthIllustrationProps {
  variant?: 'full' | 'desktop-only' | 'mobile-only';
}

export const AuthIllustration: React.FC<AuthIllustrationProps> = ({ variant = 'full' }) => {
  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MOBILE HEADER BACKGROUND (< md) - SIMPLE & MINIMAL BRAND RED GRADIENT  */}
      {/* ========================================================================= */}
      {variant !== 'desktop-only' && (
        <div
          id="auth-mobile-illustration-header"
          className="block md:hidden absolute top-0 left-0 right-0 h-[34vh] pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-[#4A000A] via-[#66000E] to-[#801010]"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full object-cover object-top"
            viewBox="0 0 800 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="mobSimpleSky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A000A" />
                <stop offset="60%" stopColor="#66000E" />
                <stop offset="100%" stopColor="#801010" />
              </linearGradient>
              <radialGradient id="mobSimpleAura" cx="80%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#66000E" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background */}
            <rect width="800" height="360" fill="url(#mobSimpleSky)" />
            <circle cx="650" cy="90" r="220" fill="url(#mobSimpleAura)" />

            {/* Minimal Geometric Waves */}
            <path
              d="M0,280 C200,240 450,320 800,260 L800,360 L0,360 Z"
              fill="#52000B"
              fillOpacity="0.6"
            />
            <path
              d="M0,310 C250,280 500,340 800,300 L800,360 L0,360 Z"
              fill="#3A0008"
              fillOpacity="0.8"
            />

            {/* Simple Storefront Minimal Icon Silhouette */}
            <g transform="translate(330, 160)" fill="#FFFFFF" fillOpacity="0.9">
              {/* Roof / Awning */}
              <path d="M70,0 L0,40 L140,40 Z" fillOpacity="0.95" />
              <rect x="15" y="44" width="110" height="75" rx="6" fillOpacity="0.15" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="52" y="65" width="36" height="54" rx="3" fillOpacity="0.9" />
              <rect x="25" y="65" width="20" height="25" rx="2" fillOpacity="0.4" />
              <rect x="95" y="65" width="20" height="25" rx="2" fillOpacity="0.4" />
            </g>
          </svg>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DESKTOP ARTWORK (md+) - CLEAN, MINIMAL & MATCHED BRAND RED PALETTE     */}
      {/* ========================================================================= */}
      {variant !== 'mobile-only' && (
        <div
          id="auth-illustration-desktop"
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Organic Curved Separation Boundary */}
              <clipPath id="simpleOrganicClip">
                <path d="M 690,0 C 780,200 810,400 780,580 C 740,720 680,810 630,900 L 1440,900 L 1440,0 Z" />
              </clipPath>

              {/* Exact App Red Gradients (#66000E & #801010) */}
              <linearGradient id="brandRedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#450009" />
                <stop offset="40%" stopColor="#66000E" />
                <stop offset="85%" stopColor="#801010" />
                <stop offset="100%" stopColor="#991515" />
              </linearGradient>

              {/* Soft Ambient Radial Light */}
              <radialGradient id="ambientSoftGlow" cx="65%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>

              {/* Storefront Wall & Glass Subtle Fills */}
              <linearGradient id="storeWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FAF7F7" />
                <stop offset="100%" stopColor="#EDE8E6" />
              </linearGradient>

              <linearGradient id="storeWarmInterior" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFF8F5" />
              </linearGradient>

              <linearGradient id="awningMaroon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#66000E" />
                <stop offset="50%" stopColor="#801010" />
                <stop offset="100%" stopColor="#66000E" />
              </linearGradient>

              {/* Subtle Ground Base */}
              <linearGradient id="cleanGround" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3A0007" />
                <stop offset="100%" stopColor="#250005" />
              </linearGradient>
            </defs>

            {/* Subtle Divider Shadow on the boundary curve */}
            <path
              d="M 690,0 C 780,200 810,400 780,580 C 740,720 680,810 630,900"
              fill="none"
              stroke="#66000E"
              strokeWidth="2"
              strokeOpacity="0.25"
            />

            {/* Illustration Content Inside Mask */}
            <g clipPath="url(#simpleOrganicClip)">
              {/* Background Canvas in App Red */}
              <rect x="0" y="0" width="1440" height="900" fill="url(#brandRedGradient)" />
              <circle cx="1150" cy="320" r="500" fill="url(#ambientSoftGlow)" />

              {/* Subtle Ambient Shapes */}
              <circle cx="1320" cy="180" r="180" fill="#FFFFFF" fillOpacity="0.04" />
              <circle cx="820" cy="140" r="90" fill="#FFFFFF" fillOpacity="0.03" />

              {/* Ground Line */}
              <rect x="600" y="720" width="840" height="180" fill="url(#cleanGround)" />
              <line x1="600" y1="720" x2="1440" y2="720" stroke="#801010" strokeWidth="2" />

              {/* ============================================================= */}
              {/* MAIN HERO: SIMPLE & ELEGANT UMKM STOREFRONT                   */}
              {/* ============================================================= */}
              <g id="clean-storefront-hero" transform="translate(850, 310)">
                {/* Store Main Structure */}
                <rect
                  x="40"
                  y="100"
                  width="440"
                  height="310"
                  rx="14"
                  fill="url(#storeWallGrad)"
                  stroke="#E5E0DD"
                  strokeWidth="2"
                />

                {/* Signboard Header */}
                <rect
                  x="65"
                  y="45"
                  width="390"
                  height="65"
                  rx="10"
                  fill="#66000E"
                  stroke="#801010"
                  strokeWidth="2"
                />
                <text
                  x="260"
                  y="84"
                  fill="#FFFFFF"
                  fontSize="18"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                  letterSpacing="2"
                >
                  🏪 TOKO UMKM DIGITAL
                </text>

                {/* Classic Minimal Awning / Kanopi */}
                <g id="minimal-awning" transform="translate(30, 105)">
                  {/* Awning Shadow */}
                  <polygon points="0,48 460,48 440,65 20,65" fill="#000000" fillOpacity="0.08" />
                  {/* Main Canopy */}
                  <polygon points="10,0 450,0 460,48 0,48" fill="#66000E" />
                  {/* Alternating Crisp White Stripes */}
                  <polygon points="40,0 80,0 72,48 32,48" fill="#FFFFFF" />
                  <polygon points="120,0 160,0 152,48 112,48" fill="#FFFFFF" />
                  <polygon points="200,0 240,0 232,48 192,48" fill="#FFFFFF" />
                  <polygon points="280,0 320,0 312,48 272,48" fill="#FFFFFF" />
                  <polygon points="360,0 400,0 392,48 352,48" fill="#FFFFFF" />
                  {/* Awning Bottom Trim */}
                  <rect x="0" y="46" width="460" height="6" rx="2" fill="#801010" />
                </g>

                {/* Showcase Window (Left) */}
                <g id="clean-window" transform="translate(70, 185)">
                  <rect
                    x="0"
                    y="0"
                    width="190"
                    height="190"
                    rx="8"
                    fill="url(#storeWarmInterior)"
                    stroke="#E5E0DD"
                    strokeWidth="2"
                  />
                  {/* Minimal Window Shelf & Products */}
                  <line x1="15" y1="125" x2="175" y2="125" stroke="#E5E0DD" strokeWidth="3" strokeLinecap="round" />
                  {/* Product 1: Box / Package */}
                  <rect x="30" y="75" width="34" height="48" rx="4" fill="#66000E" />
                  <rect x="37" y="86" width="20" height="12" rx="2" fill="#FFFFFF" fillOpacity="0.8" />
                  {/* Product 2: Bottle / Jar */}
                  <rect x="78" y="82" width="28" height="41" rx="6" fill="#801010" />
                  <rect x="85" y="74" width="14" height="8" rx="2" fill="#66000E" />
                  {/* Product 3: Artisan Bag / Pouch */}
                  <rect x="120" y="85" width="40" height="38" rx="6" fill="#A82020" />
                  <path d="M130,85 C130,73 150,73 150,85" stroke="#66000E" strokeWidth="3" fill="none" />

                  {/* Window Divider Frame */}
                  <line x1="95" y1="0" x2="95" y2="190" stroke="#E5E0DD" strokeWidth="1.5" />
                </g>

                {/* Entrance Door (Right) */}
                <g id="clean-door" transform="translate(290, 185)">
                  <rect
                    x="0"
                    y="0"
                    width="160"
                    height="225"
                    rx="6"
                    fill="url(#storeWarmInterior)"
                    stroke="#E5E0DD"
                    strokeWidth="2"
                  />
                  {/* Inner Glass Panel */}
                  <rect
                    x="16"
                    y="20"
                    width="128"
                    height="125"
                    rx="4"
                    fill="#FFFFFF"
                    stroke="#E5E0DD"
                    strokeWidth="1.5"
                  />
                  {/* Door Handle */}
                  <circle cx="32" cy="165" r="5" fill="#66000E" />
                  <line x1="32" y1="155" x2="32" y2="175" stroke="#66000E" strokeWidth="3" strokeLinecap="round" />

                  {/* "BUKA" Sign */}
                  <g transform="translate(48, 55)">
                    <rect x="0" y="0" width="64" height="24" rx="12" fill="#66000E" />
                    <text x="32" y="16" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      BUKA
                    </text>
                  </g>
                </g>
              </g>

              {/* ============================================================= */}
              {/* SINGLE CLEAN FLOATING CARD: STATUS TOKO AKTIF                 */}
              {/* ============================================================= */}
              <g id="simple-status-pill" transform="translate(930, 240)">
                <rect
                  x="0"
                  y="0"
                  width="280"
                  height="50"
                  rx="25"
                  fill="#FFFFFF"
                  stroke="#E5E0DD"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 10px 15px rgba(0,0,0,0.15))"
                />
                <circle cx="25" cy="25" r="14" fill="#66000E" />
                <path d="M19,25 L23,29 L31,21" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <text x="50" y="24" fill="#241A1A" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                  Toko Online Siap Jualan
                </text>
                <text x="50" y="38" fill="#706866" fontSize="10" fontWeight="500" fontFamily="sans-serif">
                  Katalog • Order WA • Pembayaran
                </text>
              </g>
            </g>
          </svg>
        </div>
      )}
    </>
  );
};
