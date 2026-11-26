/**
 * Utility for dynamically loading Google Fonts into the DOM
 */
const loadedFonts = new Set<string>();

export const AVAILABLE_FONTS = [
  { name: 'Inter', category: 'Modern Sans' },
  { name: 'Poppins', category: 'Geometric Sans' },
  { name: 'Plus Jakarta Sans', category: 'Modern Sans' },
  { name: 'Space Grotesk', category: 'Tech / Futuristic' },
  { name: 'Outfit', category: 'Clean Sans' },
  { name: 'Roboto', category: 'Neutral Sans' },
  { name: 'DM Sans', category: 'Contemporary Sans' },
  { name: 'Sora', category: 'Digital Sans' },
  { name: 'Montserrat', category: 'Editorial Sans' },
  { name: 'Work Sans', category: 'Functional Sans' },
  { name: 'Cormorant Garamond', category: 'Luxury Serif' },
  { name: 'Playfair Display', category: 'Classic Serif' },
  { name: 'Lora', category: 'Editorial Serif' },
  { name: 'Merriweather', category: 'Readable Serif' },
  { name: 'Cinzel', category: 'Artistic Serif' },
  { name: 'Anton', category: 'Bold Display' },
  { name: 'Oswald', category: 'Condensed Display' },
];

export function loadGoogleFont(fontName?: string) {
  if (!fontName || typeof document === 'undefined') return;

  const cleanName = fontName.split(',')[0].replace(/['"]/g, '').trim();
  if (!cleanName || cleanName === 'sans-serif' || cleanName === 'serif' || cleanName === 'monospace') return;

  const fontId = `google-font-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  if (loadedFonts.has(fontId) || document.getElementById(fontId)) {
    return;
  }

  try {
    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanName)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap`;
    document.head.appendChild(link);
    loadedFonts.add(fontId);
  } catch (e) {
    console.warn(`[fontLoader] Failed to load font ${cleanName}:`, e);
  }
}
