import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthIllustration } from '../../components/auth/AuthIllustration';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';

interface LoginPageProps {
  onNavigateRegister?: () => void;
  onNavigateForgotPassword?: () => void;
  onNavigateLanding?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateRegister,
  onNavigateForgotPassword,
  onNavigateLanding,
  onSuccess,
}) => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('andhikagonzales@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    if (!email.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 350);
    } catch {
      setError('Email atau kata sandi tidak sesuai. Silakan periksa kembali.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      await login('google.merchant@kroombox.id', 'google-auth');
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 350);
    } catch {
      setError('Gagal masuk dengan Google. Silakan coba beberapa saat lagi.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      id="login-page-container"
      className="relative min-h-[100svh] w-full bg-[#1F0307] md:bg-white overflow-x-hidden font-sans select-none flex flex-col md:flex-row"
    >
      {/* BACKGROUND ARTWORK (Mobile Header + Desktop Curved Organic Illustration) */}
      <AuthIllustration variant="full" />

      {/* MOBILE TOP NAVIGATION BAR (Back Button + Language Switcher) */}
      <div className="md:hidden absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
        {onNavigateLanding ? (
          <button
            type="button"
            onClick={onNavigateLanding}
            className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-lg border border-white/10"
            title={t('auth_back_to_home', 'Kembali ke Beranda')}
            aria-label={t('auth_back_to_home', 'Kembali ke Beranda')}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        ) : <div />}

        <LanguageSwitchButton variant="dark" compact />
      </div>

      {/* ========================================================================= */}
      {/* 1. FORM CONTAINER (Mobile: Bottom Sheet | Laptop & Desktop: Left Half)    */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full md:w-[48%] lg:w-[45%] xl:w-[42%] min-h-[100svh] flex flex-col justify-end md:justify-center items-center bg-transparent p-0 md:p-10 xl:p-14">
        
        {/* MOBILE-ONLY FLOATING BRAND LOGO (< md) */}
        <div className="md:hidden relative z-20 -mb-7 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.25)] border border-white/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFA940] to-[#FFC53D] flex items-center justify-center text-[#5C0D20] font-black text-base shadow-xs">
              K
            </div>
            <span className="font-black text-2xl text-[#1A1110] tracking-tight">
              Kroombox
            </span>
          </div>
        </div>

        {/* MAIN FORM CONTAINER */}
        <div
          id="login-form-container"
          className="w-full max-w-md md:max-w-[400px] bg-white rounded-t-[36px] md:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.3)] md:shadow-none border-t border-white/60 md:border-none px-6 sm:px-8 md:px-0 pt-10 md:pt-0 pb-8 md:pb-0 flex flex-col justify-center my-0 md:my-auto"
        >
          {/* DESKTOP TOP BRAND BADGE & LANGUAGE SWITCHER (md+) */}
          <div className="hidden md:flex items-center justify-between gap-3 mb-6">
            <button
              type="button"
              onClick={onNavigateLanding}
              className="group inline-flex items-center gap-3 focus:outline-none text-left cursor-pointer"
              title={t('auth_back_to_home', 'Kembali ke Beranda')}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFA940] to-[#FFC53D] shadow-sm flex items-center justify-center text-[#5C0D20] font-black text-lg transition-transform group-hover:scale-105">
                  K
                </div>
                <div className="absolute -inset-1 rounded-full bg-[#FFA940]/25 blur-xs pointer-events-none" />
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-xl text-[#1A1110] tracking-tight group-hover:text-[#66000E] transition-colors leading-none">
                  Kroombox
                </span>
                <span className="text-[11px] text-[#6B6260] mt-0.5 font-medium tracking-wide">
                  {t('landing_platform_badge', 'Platform Toko Online UMKM')}
                </span>
              </div>
            </button>

            <LanguageSwitchButton compact />
          </div>

          {/* GREETING HEADING */}
          <div className="mb-6 text-center md:text-left">
            <h1
              id="login-title"
              className="text-2xl sm:text-3xl font-extrabold text-[#1A1110] tracking-tight"
            >
              {t('auth_login_title', 'Masuk ke Akun Toko')}
            </h1>
          </div>

          {/* ERROR NOTIFICATION */}
          {error && (
            <div
              id="login-error"
              className="mb-4 p-3 rounded-2xl bg-[#FFF1F0] border border-[#FFA39E] text-[#66000E] text-xs font-medium text-center animate-in fade-in duration-200"
            >
              {error}
            </div>
          )}

          {/* PILL CAPSULE FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 w-full" noValidate>
            {/* Input: Username / Email */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="login-email"
                className="block text-xs sm:text-sm font-medium text-[#1A1110]"
              >
                {t('auth_email_label', 'Email atau Username')}
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andhikagonzales@gmail.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 px-5 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7]"
                />
              </div>
            </div>

            {/* Input: Password */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="login-password"
                className="block text-xs sm:text-sm font-medium text-[#1A1110]"
              >
                {t('auth_password_label', 'Kata Sandi')}
              </label>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-5 pr-12 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7] tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E7E88] hover:text-[#1A1110] transition-colors p-1.5 rounded-full hover:bg-black/5 cursor-pointer focus:outline-none"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              {onNavigateForgotPassword && (
                <div className="text-right pt-0.5">
                  <button
                    type="button"
                    onClick={onNavigateForgotPassword}
                    className="text-xs sm:text-sm font-medium text-[#66000E] hover:text-[#801010] hover:underline cursor-pointer transition-colors"
                  >
                    {t('auth_forgot_password', 'Lupa Kata Sandi?')}
                  </button>
                </div>
              )}
            </div>

            {/* PRIMARY LOGIN BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                id="login-submit-button"
                disabled={isSubmitting || googleLoading}
                className="w-full h-12 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-medium text-sm sm:text-base shadow-[0_8px_20px_rgba(102,0,14,0.25)] hover:shadow-[0_10px_25px_rgba(102,0,14,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t('auth_logging_in', 'Sedang Masuk...')}</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t('auth_login_success', 'Berhasil Masuk')}</span>
                  </>
                ) : (
                  <span>{t('auth_login_button', 'Masuk')}</span>
                )}
              </button>
            </div>

            {/* GOOGLE SIGN IN BUTTON */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || isSubmitting}
                className="w-full h-12 rounded-full bg-[#F4F4F6] hover:bg-[#ECECEF] text-[#33333A] font-medium text-xs sm:text-sm border border-[#EAEAEE] flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-70"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#33333A]" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>{t('auth_login_google', 'Masuk dengan Google')}</span>
              </button>
            </div>

            {/* SIGN UP REDIRECT LINK */}
            <div className="pt-2 text-center text-xs sm:text-sm text-[#6B6260]">
              <span>{t('auth_dont_have_account', 'Belum punya akun?')} </span>
              <button
                type="button"
                id="login-signup-link"
                onClick={onNavigateRegister}
                className="font-medium text-[#66000E] hover:text-[#801010] hover:underline cursor-pointer transition-colors focus:outline-none p-1"
              >
                {t('auth_signup_now', 'Daftar sekarang')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
