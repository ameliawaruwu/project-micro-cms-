// Kroombox Global Design System Tokens
export const theme = {
  colors: {
    primary: '#9A0602',
    primaryHover: '#7D0502',
    primaryLight: '#FFF1F0',
    primaryBorder: '#FECDCA',
    bg: '#FEFEFE',
    surface: '#FFFFFF',
    surfaceMuted: '#F7F7F7',
    textPrimary: '#1F1F1F',
    textSecondary: '#555555',
    textMuted: '#777777',
    border: '#EAEAEA',
    borderLight: '#F0F0F0',
  },
  classes: {
    // Buttons (Min 48px height touch target)
    btnPrimary: 'min-h-[48px] px-6 py-3 rounded-xl bg-[#9A0602] hover:bg-[#7D0502] text-white font-semibold text-sm transition shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
    btnSecondary: 'min-h-[48px] px-6 py-3 rounded-xl bg-white hover:bg-[#FFF1F0] text-[#9A0602] border border-[#9A0602] font-semibold text-sm transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer',
    btnOutline: 'min-h-[48px] px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#1F1F1F] border border-[#EAEAEA] font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer',
    btnGhost: 'min-h-[44px] px-4 py-2 rounded-xl text-[#555555] hover:text-[#9A0602] hover:bg-[#FFF1F0] text-sm font-medium transition flex items-center justify-center gap-2 cursor-pointer',
    
    // Inputs
    input: 'w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-white border border-[#EAEAEA] text-sm text-[#1F1F1F] placeholder-[#777777] focus:outline-none focus:border-[#9A0602] focus:ring-1 focus:ring-[#9A0602] transition',
    select: 'w-full min-h-[48px] px-3.5 py-2.5 rounded-xl bg-white border border-[#EAEAEA] text-sm text-[#1F1F1F] focus:outline-none focus:border-[#9A0602] focus:ring-1 focus:ring-[#9A0602] transition cursor-pointer',
    
    // Cards
    card: 'bg-white rounded-2xl border border-[#EAEAEA] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]',
    cardInteractive: 'bg-white rounded-2xl border border-[#EAEAEA] hover:border-[#9A0602]/40 hover:shadow-sm transition-all duration-200 p-5 sm:p-6',
    
    // Badges / Tags
    badgePrimary: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F0] text-[#9A0602] text-xs font-semibold border border-[#FECDCA]',
    badgeNeutral: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F7F7] text-[#555555] text-xs font-medium border border-[#EAEAEA]',
    badgeSuccess: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200',
    badgeWarning: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200',
  }
};
