import React, { useState } from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { Key, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { THEME_DATA_MAP } from '../themeData';

interface LoginPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  onNavigate?: (pageId: string) => void;
  isRegister?: boolean;
  mode?: 'login' | 'register' | 'forgot_password';
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  themeData, 
  themeId: propThemeId, 
  store, 
  onNavigate, 
  isRegister = false,
  mode: propMode
}) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const themeDataObj = THEME_DATA_MAP[activeThemeId] || THEME_DATA_MAP['minimalist'];
  const brandName = store?.name || themeDataObj?.storeInfo?.name || 'STORE';

  const viewMode = propMode || (isRegister ? 'register' : 'login');
  const [resetSent, setResetSent] = useState(false);

  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const renderContent = () => {
    // 1. BOLD THEME (STREETWEAR BRUTALIST)
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-zinc-950 text-white min-h-screen border-b-8 border-black font-sans flex items-center justify-center">
          <div className="w-full max-w-md px-6">
            <div className="text-center mb-6">
              <span className="bg-red-600 text-white font-black text-xs px-3 py-1 uppercase tracking-widest border-2 border-black inline-block mb-3">
                {brandName} AUTH SYSTEM
              </span>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white">
                {viewMode === 'register' ? 'DAFTAR AKUN' : viewMode === 'forgot_password' ? 'LUPA PASSWORD' : 'MASUK AKUN'}
              </h1>
            </div>

            <div className="bg-[#FF0000] p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] space-y-5">
              {viewMode === 'forgot_password' ? (
                <>
                  {resetSent ? (
                    <div className="p-4 bg-white border-4 border-black text-black font-black uppercase text-center text-sm">
                      ✅ Link reset password telah dikirim ke email Anda!
                    </div>
                  ) : (
                    <>
                      <p className="text-white font-black uppercase text-xs">Masukkan email terdaftar untuk reset kata sandi:</p>
                      <input type="email" defaultValue="pelanggan@example.com" placeholder="EMAIL TERDAFTAR" className="w-full p-4 bg-white border-4 border-black text-black font-black uppercase text-sm focus:bg-yellow-300 focus:outline-none" />
                      <button 
                        onClick={() => setResetSent(true)}
                        className="w-full py-5 bg-black text-white text-lg font-black uppercase border-4 border-black hover:bg-yellow-300 hover:text-black transition shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer"
                      >
                        KIRIM LINK RESET ⚡
                      </button>
                    </>
                  )}
                  <div className="text-center pt-2">
                    <button onClick={() => onNavigate?.('login')} className="font-black text-xs uppercase bg-white text-black px-3 py-1.5 border-2 border-black hover:bg-yellow-300 cursor-pointer">
                      ← KEMBALI KE LOGIN
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {viewMode === 'register' && (
                    <input type="text" defaultValue="Alya Permata" placeholder="NAMA LENGKAP" className="w-full p-4 bg-white border-4 border-black text-black font-black uppercase text-sm focus:bg-yellow-300 focus:outline-none" />
                  )}
                  <input type="email" defaultValue="pelanggan@example.com" placeholder="EMAIL" className="w-full p-4 bg-white border-4 border-black text-black font-black uppercase text-sm focus:bg-yellow-300 focus:outline-none" />
                  <input type="password" defaultValue="••••••••" placeholder="KATA SANDI" className="w-full p-4 bg-white border-4 border-black text-black font-black uppercase text-sm focus:bg-yellow-300 focus:outline-none" />
                  
                  <button 
                    onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'profile')}
                    className="w-full py-5 bg-black text-white text-xl font-black uppercase border-4 border-black hover:bg-yellow-300 hover:text-black transition shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    {viewMode === 'register' ? 'DAFTAR SEKARANG 📝' : 'MASUK SEKARANG 🔑'}
                  </button>

                  <div className="flex justify-between items-center pt-2 text-xs">
                    <button onClick={() => onNavigate?.('forgot_password')} className="font-black text-xs uppercase bg-white text-black px-2.5 py-1 border-2 border-black hover:bg-yellow-300 cursor-pointer">
                      Lupa Password?
                    </button>
                    <button 
                      onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'register')}
                      className="font-black text-xs uppercase bg-white text-black px-2.5 py-1 border-2 border-black hover:bg-yellow-300 cursor-pointer"
                    >
                      {viewMode === 'register' ? 'Sudah Punya Akun' : 'Daftar Akun Baru'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 2. FUTURISTIC / MODERN THEME (CYBERPUNK NEON TECH)
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#050505] text-white min-h-screen font-mono flex items-center justify-center relative overflow-hidden">
          {/* Cyber ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="w-full max-w-md px-6 relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/60 border border-red-500/30 rounded-full text-red-500 text-[10px] uppercase tracking-[0.3em] mb-3 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {brandName} // AUTH_GATEWAY
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase drop-shadow-md">
                {viewMode === 'register' ? 'SYS_REGISTRATION' : viewMode === 'forgot_password' ? 'SYS_PASSWORD_RESET' : 'SYS_AUTHENTICATION'}
              </h1>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-5">
              {viewMode === 'forgot_password' ? (
                <>
                  {resetSent ? (
                    <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-red-400 text-xs font-mono text-center">
                      ⚡ Security token generated & dispatched to email.
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400">Enter registered terminal email address:</p>
                      <input type="email" defaultValue="sys@neonlab.io" placeholder="TERMINAL_EMAIL" className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-red-400 text-sm focus:border-red-500 focus:outline-none" />
                      <button 
                        onClick={() => setResetSent(true)}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                      >
                        GENERATE RESET TOKEN ⚡
                      </button>
                    </>
                  )}
                  <div className="text-center pt-2 text-xs text-zinc-500">
                    <button onClick={() => onNavigate?.('login')} className="hover:text-red-400 cursor-pointer">
                      ← RETURN TO AUTHENTICATION
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {viewMode === 'register' && (
                    <input type="text" defaultValue="Alya Permata" placeholder="USER_FULL_NAME" className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-red-400 text-sm focus:border-red-500 focus:outline-none" />
                  )}
                  <input type="email" defaultValue="user@neonlab.io" placeholder="USER_EMAIL" className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-red-400 text-sm focus:border-red-500 focus:outline-none" />
                  <input type="password" defaultValue="••••••••" placeholder="SECURITY_KEY" className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-red-400 text-sm focus:border-red-500 focus:outline-none" />
                  
                  <button 
                    onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'profile')}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all cursor-pointer"
                  >
                    {viewMode === 'register' ? 'INITIATE ACCOUNT ⚡' : 'AUTHORIZE SYSTEM ACCESS ⚡'}
                  </button>

                  <div className="flex justify-between items-center pt-2 text-xs text-zinc-400">
                    <button onClick={() => onNavigate?.('forgot_password')} className="hover:text-red-400 cursor-pointer">
                      Forgot Key?
                    </button>
                    <button onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'register')} className="hover:text-red-400 cursor-pointer font-bold">
                      {viewMode === 'register' ? 'Existing System User' : 'New System Registration'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 3. LUXURY / ELEGANT THEME (MAISON GOLD & OBSIDIAN)
    if (activeThemeId === 'luxury' || activeThemeId === 'elegant') {
      return (
        <div className="pt-28 pb-24 bg-[#09090b] text-amber-50 min-h-screen font-serif flex items-center justify-center">
          <div className="w-full max-w-md px-6">
            <div className="text-center mb-8">
              <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-amber-400 block mb-2">{brandName} CONCIERGE</span>
              <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight italic">
                {viewMode === 'register' ? 'Create a Boutique Account' : viewMode === 'forgot_password' ? 'Reset Your Key' : 'Welcome Back'}
              </h1>
            </div>

            <div className="bg-zinc-900/90 border border-amber-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-md space-y-6 font-sans">
              {viewMode === 'forgot_password' ? (
                <>
                  {resetSent ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-center">
                      ✨ A password reset link has been dispatched to your email address.
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-zinc-400">Enter your registered email address to receive concierge instructions:</p>
                      <input type="email" defaultValue="concierge@maisonelan.com" placeholder="Email Address" className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 text-sm focus:border-amber-500 focus:outline-none" />
                      <button 
                        onClick={() => setResetSent(true)}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 rounded-xl font-bold text-xs uppercase tracking-widest text-zinc-950 shadow-lg transition-all cursor-pointer"
                      >
                        Send Reset Link ✨
                      </button>
                    </>
                  )}
                  <div className="text-center pt-2 text-xs text-amber-400/80">
                    <button onClick={() => onNavigate?.('login')} className="hover:underline cursor-pointer">
                      ← Return to Sign In
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {viewMode === 'register' && (
                    <input type="text" defaultValue="Alya Permata" placeholder="Full Name" className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 text-sm focus:border-amber-500 focus:outline-none" />
                  )}
                  <input type="email" defaultValue="client@maisonelan.com" placeholder="Email Address" className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 text-sm focus:border-amber-500 focus:outline-none" />
                  <input type="password" defaultValue="••••••••" placeholder="Password" className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-100 text-sm focus:border-amber-500 focus:outline-none" />
                  
                  <button 
                    onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'profile')}
                    className="w-full py-4 bg-amber-400 hover:bg-amber-300 rounded-xl font-bold text-xs uppercase tracking-widest text-zinc-950 shadow-lg shadow-amber-400/10 transition-all cursor-pointer"
                  >
                    {viewMode === 'register' ? 'Register Account ✨' : 'Sign In To Concierge ✨'}
                  </button>

                  <div className="flex justify-between items-center pt-2 text-xs text-amber-400/80">
                    <button onClick={() => onNavigate?.('forgot_password')} className="hover:underline cursor-pointer">
                      Forgot Password?
                    </button>
                    <button onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'register')} className="hover:underline cursor-pointer font-semibold text-amber-300">
                      {viewMode === 'register' ? 'Already Have Account' : 'Create New Account'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 4. NATURE THEME (ORGANIC BOTANICAL SAGE GREEN)
    if (activeThemeId === 'nature') {
      return (
        <div className="pt-28 pb-24 bg-[#F4F6F0] text-emerald-950 min-h-screen font-sans flex items-center justify-center">
          <div className="w-full max-w-md px-6">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">🌿 {brandName}</span>
              <h1 className="text-3xl font-bold text-emerald-950">
                {viewMode === 'register' ? 'Daftar Akun Natural' : viewMode === 'forgot_password' ? 'Reset Kata Sandi' : 'Selamat Datang Kembali'}
              </h1>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl space-y-5">
              {viewMode === 'forgot_password' ? (
                <>
                  {resetSent ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs text-center font-medium">
                      🌿 Instruksi reset kata sandi telah dikirim ke email Anda.
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-emerald-700">Masukkan alamat email terdaftar Anda:</p>
                      <input type="email" defaultValue="hello@rimbabotanicals.com" placeholder="Email Terdaftar" className="w-full p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                      <button 
                        onClick={() => setResetSent(true)}
                        className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md cursor-pointer"
                      >
                        Kirim Link Reset 🌿
                      </button>
                    </>
                  )}
                  <div className="text-center pt-2 text-xs text-emerald-700">
                    <button onClick={() => onNavigate?.('login')} className="hover:underline cursor-pointer font-semibold">
                      ← Kembali ke Halaman Masuk
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {viewMode === 'register' && (
                    <input type="text" defaultValue="Alya Permata" placeholder="Nama Lengkap" className="w-full p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                  )}
                  <input type="email" defaultValue="pelanggan@rimbabotanicals.com" placeholder="Email Anda" className="w-full p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                  <input type="password" defaultValue="••••••••" placeholder="Kata Sandi" className="w-full p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                  
                  <button 
                    onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'profile')}
                    className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md cursor-pointer"
                  >
                    {viewMode === 'register' ? 'Daftar Sekarang 🌿' : 'Masuk Akun 🌿'}
                  </button>

                  <div className="flex justify-between items-center pt-2 text-xs text-emerald-700">
                    <button onClick={() => onNavigate?.('forgot_password')} className="hover:underline cursor-pointer">
                      Lupa Kata Sandi?
                    </button>
                    <button onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'register')} className="hover:underline cursor-pointer font-bold text-emerald-900">
                      {viewMode === 'register' ? 'Sudah Punya Akun' : 'Daftar Akun Baru'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 5. CUTE THEME (PASTEL SOFT PINK)
    if (activeThemeId === 'cute') {
      return (
        <div className="pt-28 pb-24 bg-[#FFF5F7] text-gray-800 min-h-screen font-['Outfit',sans-serif] flex items-center justify-center">
          <div className="w-full max-w-md px-6">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1 bg-[#FFD1DC] text-[#FF85A1] text-xs font-black rounded-full mb-3 rotate-2">💖 {brandName}</span>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-800">
                {viewMode === 'register' ? 'Daftar Member Cutie 🌸' : viewMode === 'forgot_password' ? 'Lupa Password 🥺' : 'Masuk Member 💖'}
              </h1>
            </div>

            <div className="bg-white p-8 rounded-3xl border-4 border-[#FFF5F7] shadow-lg space-y-5">
              {viewMode === 'forgot_password' ? (
                <>
                  {resetSent ? (
                    <div className="p-4 bg-[#FFF5F7] rounded-2xl border-2 border-[#FFD1DC] text-[#FF85A1] text-xs font-bold text-center">
                      🌸 Link reset kata sandi sudah dikirim ke email kamu!
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 font-semibold">Ketik email terdaftar kamu di bawah ya:</p>
                      <input type="email" defaultValue="cutie@fuzzycute.com" placeholder="Email Terdaftar" className="w-full p-4 bg-[#FAF7F7] border-2 border-[#FFD1DC] rounded-2xl text-gray-800 text-sm font-semibold focus:outline-none focus:border-[#FF85A1]" />
                      <button 
                        onClick={() => setResetSent(true)}
                        className="w-full py-4 bg-[#FF85A1] hover:bg-[#FF6B8B] text-white rounded-2xl font-black text-sm transition-all shadow-sm cursor-pointer"
                      >
                        Kirim Link Reset 🌸
                      </button>
                    </>
                  )}
                  <div className="text-center pt-2 text-xs">
                    <button onClick={() => onNavigate?.('login')} className="font-bold text-[#FF85A1] hover:underline cursor-pointer">
                      ← Kembali ke Log In
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {viewMode === 'register' && (
                    <input type="text" defaultValue="Alya Permata" placeholder="Nama Lengkap Kamu" className="w-full p-4 bg-[#FAF7F7] border-2 border-[#FFD1DC] rounded-2xl text-gray-800 text-sm font-semibold focus:outline-none focus:border-[#FF85A1]" />
                  )}
                  <input type="email" defaultValue="cutie@fuzzycute.com" placeholder="Alamat Email" className="w-full p-4 bg-[#FAF7F7] border-2 border-[#FFD1DC] rounded-2xl text-gray-800 text-sm font-semibold focus:outline-none focus:border-[#FF85A1]" />
                  <input type="password" defaultValue="••••••••" placeholder="Password Cantik" className="w-full p-4 bg-[#FAF7F7] border-2 border-[#FFD1DC] rounded-2xl text-gray-800 text-sm font-semibold focus:outline-none focus:border-[#FF85A1]" />
                  
                  <button 
                    onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'profile')}
                    className="w-full py-4 bg-[#FF85A1] hover:bg-[#FF6B8B] text-white rounded-2xl font-black text-sm transition-all shadow-sm cursor-pointer"
                  >
                    {viewMode === 'register' ? 'Daftar Member Cutie 🌸' : 'Masuk Sekarang 💖'}
                  </button>

                  <div className="flex justify-between items-center pt-2 text-xs font-bold text-gray-500">
                    <button onClick={() => onNavigate?.('forgot_password')} className="hover:text-[#FF85A1] cursor-pointer">
                      Lupa Password?
                    </button>
                    <button onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'register')} className="text-[#FF85A1] hover:underline cursor-pointer">
                      {viewMode === 'register' ? 'Sudah Ada Akun' : 'Daftar Akun Baru'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 6. DEFAULT / MINIMALIST / EDITORIAL / CREATIVE / PROFESSIONAL
    return (
      <div className="pt-28 pb-24 bg-gray-50 text-gray-900 min-h-screen font-sans flex items-center justify-center">
        <div className="w-full max-w-md px-6">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">{brandName}</span>
            <h1 className="text-3xl font-bold text-gray-900">
              {viewMode === 'register' ? 'Buat Akun Baru' : viewMode === 'forgot_password' ? 'Reset Kata Sandi' : 'Masuk ke Akun Anda'}
            </h1>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            {viewMode === 'forgot_password' ? (
              <>
                {resetSent ? (
                  <div className="p-4 bg-gray-100 rounded-xl text-gray-800 text-xs font-medium text-center">
                    ✅ Link petunjuk reset password telah dikirim ke alamat email Anda.
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-600">Masukkan email yang terdaftar di akun Anda:</p>
                    <input type="email" defaultValue="pelanggan@example.com" placeholder="Email Anda" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    <button 
                      onClick={() => setResetSent(true)}
                      className="w-full py-3.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition shadow-md cursor-pointer"
                    >
                      Kirim Link Reset
                    </button>
                  </>
                )}
                <div className="text-center pt-2 text-xs text-gray-500">
                  <button onClick={() => onNavigate?.('login')} className="hover:underline cursor-pointer font-semibold text-black">
                    ← Kembali ke Masuk
                  </button>
                </div>
              </>
            ) : (
              <>
                {viewMode === 'register' && (
                  <input type="text" defaultValue="Alya Permata" placeholder="Nama Lengkap" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                )}
                <input type="email" defaultValue="pelanggan@example.com" placeholder="Email Anda" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                <input type="password" defaultValue="••••••••" placeholder="Kata Sandi" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                
                <button 
                  onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'profile')}
                  className="w-full py-3.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition shadow-md cursor-pointer"
                >
                  {viewMode === 'register' ? 'Daftar Sekarang' : 'Masuk'}
                </button>

                <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span onClick={() => onNavigate?.('forgot_password')} className="hover:underline cursor-pointer">
                    Lupa Password?
                  </span>
                  <span onClick={() => onNavigate?.(viewMode === 'register' ? 'login' : 'register')} className="hover:underline cursor-pointer font-semibold text-black">
                    {viewMode === 'register' ? 'Sudah Punya Akun' : 'Belum Punya Akun'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {CustomNavbar ? <CustomNavbar /> : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
