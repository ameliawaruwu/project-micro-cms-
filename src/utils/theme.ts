// Kroomify Global Design System Tokens
export const theme = {
  colors: {
    primary: '#66000E',
    primaryHover: '#52000B',
    primaryLight: '#F5E8EA',
    primaryBorder: '#E5E0DD',
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceMuted: '#FAF7F7',
    textPrimary: '#241A1A',
    textSecondary: '#706866',
    textMuted: '#948C8A',
    border: '#E5E0DD',
    borderLight: '#F0ECEB',
  },
  classes: {
    // Buttons (Min 42px - 48px height touch target)
    btnPrimary: 'min-h-[42px] px-5 py-2.5 rounded-xl bg-[#66000E] hover:bg-[#52000B] text-white font-semibold text-xs sm:text-sm transition shadow-2xs active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    btnSecondary: 'min-h-[42px] px-5 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F7] text-[#66000E] border border-[#E5E0DD] hover:border-[#66000E] font-semibold text-xs sm:text-sm transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer',
    btnOutline: 'min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-[#FAF7F7] text-[#241A1A] border border-[#E5E0DD] font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer',
    btnGhost: 'min-h-[40px] px-3.5 py-2 rounded-xl text-[#706866] hover:text-[#66000E] hover:bg-[#F5E8EA] text-xs sm:text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer',
    
    // Inputs
    input: 'w-full min-h-[42px] px-3.5 py-2.5 rounded-xl bg-[#FAF7F7] focus:bg-white border border-[#E5E0DD] text-xs sm:text-sm text-[#241A1A] placeholder-[#706866] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/20 transition',
    select: 'w-full min-h-[42px] px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E0DD] text-xs sm:text-sm text-[#241A1A] focus:outline-none focus:border-[#66000E] focus:ring-2 focus:ring-[#66000E]/20 transition cursor-pointer',
    
    // Cards
    card: 'bg-white rounded-2xl border border-[#E5E0DD] p-4 sm:p-5 lg:p-6 shadow-2xs',
    cardInteractive: 'bg-white rounded-2xl border border-[#E5E0DD] hover:border-[#66000E]/40 hover:shadow-xs transition-all duration-200 p-4 sm:p-5 lg:p-6',
    
    // Badges / Tags
    badgePrimary: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] text-xs font-semibold border border-[#E8DDDE]',
    badgeNeutral: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF7F7] text-[#706866] text-xs font-medium border border-[#E5E0DD]',
    badgeSuccess: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200',
    badgeWarning: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200',
  }
};
