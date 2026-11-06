import { normalizeThemeId } from '../ThemeRegistry';

/**
 * Token gaya halaman Katalog untuk tema yang tidak punya layout katalog khusus
 * (minimalist, nature, cute, creative, modern, fashion, futuristic).
 * Diambil dari kartu produk asli tiap tema agar katalog terlihat menyatu dengan template,
 * bukan bergaya dashboard LapakQ.
 */
export interface ShopThemeStyle {
  page: string;
  eyebrow: string;
  title: string;
  description: string;
  divider: string;
  searchInput: string;
  select: string;
  pillActive: string;
  pillInactive: string;
  countText: string;
  card: string;
  imageWrap: string;
  image: string;
  badge: string;
  discount: string;
  category: string;
  name: string;
  price: string;
  comparePrice: string;
  button: string;
  loadMore: string;
}

const minimalist: ShopThemeStyle = {
  page: 'bg-white text-gray-900 font-light',
  eyebrow: 'text-[10px] uppercase tracking-[0.3em] text-gray-400',
  title: 'font-light tracking-tight text-gray-900',
  description: 'text-gray-500 font-light',
  divider: 'w-10 h-px bg-gray-900',
  searchInput: 'bg-transparent border-0 border-b border-gray-300 rounded-none focus:border-gray-900 text-gray-900 placeholder:text-gray-400',
  select: 'bg-transparent border-0 border-b border-gray-300 rounded-none text-gray-900',
  pillActive: 'bg-gray-900 text-white',
  pillInactive: 'text-gray-500 hover:text-gray-900 border border-gray-200',
  countText: 'text-gray-400 font-light',
  card: 'group',
  imageWrap: 'aspect-[3/4] bg-[#F6F6F6]',
  image: 'mix-blend-multiply group-hover:scale-105 duration-700',
  badge: 'bg-white/90 text-gray-900 text-[9px] uppercase tracking-widest px-2.5 py-1',
  discount: 'bg-gray-900 text-white text-[9px] tracking-widest px-2 py-1',
  category: 'text-[10px] uppercase tracking-[0.2em] text-gray-400',
  name: 'text-sm font-light text-gray-900',
  price: 'text-sm text-gray-600 font-light',
  comparePrice: 'text-xs text-gray-300 line-through font-light',
  button: 'w-full border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-[10px] uppercase tracking-[0.2em] py-2.5',
  loadMore: 'border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-[10px] uppercase tracking-[0.2em] px-8 py-3',
};

const nature: ShopThemeStyle = {
  page: 'bg-[#FBF9F5] text-[#2C3B2D] font-serif',
  eyebrow: 'inline-block px-3.5 py-1 bg-[#E8F5E9] text-[#166534] border border-[#C8E6C9] font-sans text-xs font-semibold rounded-full',
  title: 'font-serif font-bold text-[#2C3B2D] tracking-tight',
  description: 'text-[#706866] font-sans',
  divider: 'w-12 h-0.5 bg-[#166534] rounded-full',
  searchInput: 'bg-white border border-[#E8E4DB] rounded-full font-sans text-[#2C3B2D] placeholder:text-[#8C8481] focus:border-[#2C3B2D]',
  select: 'bg-white border border-[#E8E4DB] rounded-full font-sans text-[#2C3B2D]',
  pillActive: 'bg-[#2C3B2D] text-[#F9F6F0] rounded-full font-sans',
  pillInactive: 'bg-white border border-[#E8E4DB] text-[#3B4D3C] rounded-full font-sans hover:bg-[#F0F4EF]',
  countText: 'text-[#8C8481] font-sans',
  card: 'group bg-white rounded-2xl p-3 border border-[#E8E4DB] hover:shadow-md transition-shadow',
  imageWrap: 'aspect-square rounded-xl bg-[#F9F6F0] border border-[#E8E4DB]/60',
  image: 'group-hover:scale-105 duration-500',
  badge: 'bg-[#2C3B2D] text-[#F9F6F0] font-sans text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full',
  discount: 'bg-[#166534] text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded-full',
  category: 'inline-block bg-[#F0F4EF] text-[#3B4D3C] font-sans text-[10px] font-medium px-2.5 py-0.5 rounded-md border border-[#E0E8DF]',
  name: 'text-sm font-serif font-bold text-[#2C3B2D] group-hover:text-[#166534] transition-colors',
  price: 'font-sans font-bold text-sm text-[#166534]',
  comparePrice: 'font-sans text-xs text-[#8C8481] line-through',
  button: 'w-full py-2 bg-[#2C3B2D] hover:bg-[#1E2A1F] text-[#F9F6F0] font-sans text-xs font-medium rounded-xl',
  loadMore: 'bg-[#2C3B2D] hover:bg-[#1E2A1F] text-[#F9F6F0] font-sans text-sm font-medium rounded-full px-8 py-3',
};

const cute: ShopThemeStyle = {
  page: "bg-white text-gray-800 font-['Outfit',sans-serif]",
  eyebrow: 'inline-block px-4 py-1 bg-[#FFD1DC] text-[#FF85A1] font-bold rounded-full rotate-2 text-xs',
  title: 'font-black text-gray-800 tracking-tight',
  description: 'text-gray-500 font-medium',
  divider: 'w-12 h-1.5 bg-[#FFD1DC] rounded-full',
  searchInput: 'bg-[#FFF5F7] border-2 border-[#FFE4EA] rounded-full text-gray-800 placeholder:text-[#FFA3B8] focus:border-[#FF85A1]',
  select: 'bg-[#FFF5F7] border-2 border-[#FFE4EA] rounded-full text-gray-800 font-bold',
  pillActive: 'bg-[#FF85A1] text-white rounded-full font-black',
  pillInactive: 'bg-[#FFF5F7] text-[#FF85A1] rounded-full font-bold hover:bg-[#FFE4EA]',
  countText: 'text-gray-400 font-bold',
  card: 'group bg-white rounded-[2rem] p-3 border-4 border-[#FFF5F7] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
  imageWrap: 'aspect-square rounded-3xl bg-[#FFF5F7]',
  image: 'group-hover:scale-105 duration-500',
  badge: 'bg-[#FFD1DC] text-[#FF85A1] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-white rotate-[-5deg]',
  discount: 'bg-[#FF85A1] text-white text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-white',
  category: 'inline-block bg-[#FFF5F7] text-[#FF85A1] text-[10px] font-bold px-2.5 py-1 rounded-full',
  name: 'text-sm font-black text-gray-800',
  price: 'text-base font-black text-[#FF85A1]',
  comparePrice: 'text-xs text-gray-300 line-through font-bold',
  button: 'w-full py-2 bg-[#FF85A1] hover:bg-[#FF6B8B] text-white font-black text-xs rounded-full',
  loadMore: 'bg-[#FF85A1] hover:bg-[#FF6B8B] text-white font-black text-sm rounded-full px-8 py-3 border-4 border-[#FFF5F7]',
};

const modern: ShopThemeStyle = {
  page: "bg-white text-gray-900 font-['Outfit',sans-serif]",
  eyebrow: 'text-sm font-semibold text-gray-500',
  title: 'font-extrabold text-gray-900 tracking-tight',
  description: 'text-gray-500',
  divider: 'w-12 h-1 bg-gray-900 rounded-full',
  searchInput: 'bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:border-gray-900',
  select: 'bg-white border border-gray-200 rounded-full text-gray-900 font-semibold',
  pillActive: 'bg-gray-900 text-white rounded-full font-semibold',
  pillInactive: 'border border-gray-200 text-gray-700 rounded-full font-semibold hover:border-gray-300',
  countText: 'text-gray-400',
  card: 'group',
  imageWrap: 'aspect-square rounded-2xl bg-gray-100 shadow-sm group-hover:shadow-xl transition-shadow duration-300',
  image: 'group-hover:scale-105 duration-500',
  badge: 'bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full',
  discount: 'bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full',
  category: 'text-[11px] uppercase tracking-wide text-gray-400 font-medium',
  name: 'text-sm font-semibold text-gray-900 line-clamp-2',
  price: 'text-base font-bold text-gray-900',
  comparePrice: 'text-xs text-gray-400 line-through',
  button: 'w-full py-2 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-xs font-semibold text-gray-700',
  loadMore: 'rounded-full border border-gray-200 hover:border-gray-900 text-sm font-semibold text-gray-700 px-8 py-3',
};

const fashion: ShopThemeStyle = {
  page: 'bg-[#F9F9F9] text-[#18181B]',
  eyebrow: 'text-[10px] uppercase tracking-[0.3em] text-gray-500',
  title: 'font-serif italic text-[#18181B]',
  description: 'text-gray-500',
  divider: 'w-10 h-px bg-black',
  searchInput: 'bg-transparent border-0 border-b border-black/30 rounded-none text-[#18181B] placeholder:text-gray-400 focus:border-black',
  select: 'bg-transparent border-0 border-b border-black/30 rounded-none text-[10px] uppercase tracking-[0.2em]',
  pillActive: 'border-b border-black text-black uppercase tracking-[0.2em] text-[10px]',
  pillInactive: 'text-gray-400 hover:text-black uppercase tracking-[0.2em] text-[10px]',
  countText: 'text-gray-400 uppercase tracking-[0.2em] text-[10px]',
  card: 'group',
  imageWrap: 'aspect-[3/4] bg-gray-100',
  image: 'group-hover:scale-105 duration-700',
  badge: 'bg-white text-black text-[9px] uppercase tracking-[0.2em] px-2.5 py-1',
  discount: 'bg-black text-white text-[9px] uppercase tracking-[0.2em] px-2 py-1',
  category: 'text-[10px] uppercase tracking-[0.2em] text-gray-500',
  name: 'text-sm font-medium text-[#18181B] group-hover:text-gray-500 transition-colors',
  price: 'text-sm text-gray-700',
  comparePrice: 'text-xs text-gray-400 line-through',
  button: 'text-[10px] uppercase tracking-[0.2em] font-medium border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500',
  loadMore: 'text-[10px] uppercase tracking-[0.2em] font-medium border-b border-black pb-1 hover:text-gray-500',
};

const futuristic: ShopThemeStyle = {
  page: "bg-[#050505] text-white font-['Space_Grotesk',sans-serif]",
  eyebrow: 'inline-block px-4 py-1.5 border border-red-500/40 text-red-400 rounded-full text-[10px] font-mono uppercase tracking-widest',
  title: 'font-black uppercase tracking-tighter text-white',
  description: 'text-gray-400 font-mono',
  divider: 'w-16 h-px bg-gradient-to-r from-red-500 to-transparent',
  searchInput: 'bg-white/5 border border-white/15 rounded text-white placeholder:text-gray-500 focus:border-red-500 font-mono',
  select: 'bg-[#0d0d0d] border border-white/15 rounded text-gray-200 font-mono',
  pillActive: 'bg-red-600 text-white rounded uppercase tracking-widest text-[10px] font-bold',
  pillInactive: 'border border-white/15 text-gray-300 rounded uppercase tracking-widest text-[10px] hover:border-red-500/60',
  countText: 'text-gray-500 font-mono',
  card: 'group bg-[#0D0D0D] border border-white/10 rounded-xl p-3 hover:border-red-500/60 transition-colors',
  imageWrap: 'aspect-square rounded-lg bg-[#111111]',
  image: 'group-hover:scale-105 duration-500',
  badge: 'bg-red-500/10 border border-red-500 text-red-400 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded',
  discount: 'bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded',
  category: 'text-[10px] text-red-500 uppercase tracking-widest font-bold',
  name: 'text-sm text-white font-medium line-clamp-2',
  price: 'text-base font-bold text-white',
  comparePrice: 'text-xs text-gray-500 line-through decoration-red-500/50',
  button: 'w-full py-2 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white uppercase tracking-widest text-[10px] font-bold rounded',
  loadMore: 'border border-red-500 text-red-400 hover:bg-red-600 hover:text-white uppercase tracking-widest text-[10px] font-bold rounded px-8 py-3',
};

const STYLES: Record<string, ShopThemeStyle> = {
  minimalist,
  nature,
  cute,
  creative: cute,
  modern,
  fashion,
  futuristic,
};

export function getShopThemeStyle(themeId?: string): ShopThemeStyle {
  return STYLES[normalizeThemeId(themeId)] || minimalist;
}
