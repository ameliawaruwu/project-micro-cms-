import React, { useState } from 'react';
import {
  Loader2,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthIllustration } from '../../components/auth/AuthIllustration';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';
import { KroomifyLogo } from '../../components/common/KroomifyLogo';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onNavigateLanding?: () => void;
  onSuccess: (registeredEmail?: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateLogin,
  onNavigateLanding,
  onSuccess,
}) => {
  const { register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  // Form states
  const [storeName, setStoreName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Silakan masukkan nama pemilik toko.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError('Kata sandi harus minimal 6 karakter.');
      return;
    }

    try {
      setIsSubmitting(true);
      const finalName = fullName.trim();
      const finalStoreName = storeName.trim() || `Toko ${finalName}`;
      const storeSlug = finalStoreName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      await register({
        fullName: finalName,
        email: email.trim().toLowerCase(),
        phoneWhatsApp: phone.trim(),
        storeName: finalStoreName,
        storeSlug: storeSlug || `toko-${Date.now()}`,
        businessCategory: 'UMKM & Retail',
        password: password.trim(),
        autoLogin: false,
      });

      onSuccess(email.trim().toLowerCase());
    } catch (err: any) {
      setError(err?.message || 'Gagal mendaftar. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartGoogleFlow = async () => {
    try {
      setIsGoogleSubmitting(true);
      setError(null);
      sessionStorage.setItem('oauth_intent', 'register');
      await loginWithGoogle();
    } catch {
      setError('Gagal menghubungkan ke Google. Pastikan Google Provider sudah aktif di Supabase.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };


  return (
    <div
      id="register-page-container"
      className="relative min-h-[100svh] w-full bg-[#1F0307] md:bg-white overflow-x-hidden font-sans select-none flex flex-col md:flex-row"
    >
      {/* BACKGROUND ARTWORK (Mobile Header + Desktop Organic Curved Illustration) */}
      <AuthIllustration variant="full" />

      {/* MOBILE TOP NAVIGATION BAR (Back Button + Language Switcher) */}
      <div className="md:hidden absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={onNavigateLanding || onNavigateLogin}
          className="w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer shadow-lg border border-white/10"
          title={t('auth_back_to_home', 'Kembali')}
          aria-label={t('auth_back_to_home', 'Kembali')}
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <LanguageSwitchButton variant="dark" compact />
      </div>

      {/* ========================================================================= */}
      {/* 1. FORM CONTAINER (Mobile: Bottom Sheet | Laptop & Desktop: Left Half)    */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full md:w-[48%] lg:w-[45%] xl:w-[42%] min-h-[100svh] flex flex-col justify-end md:justify-center items-center bg-transparent p-0 md:p-10 xl:p-14">
        
        {/* MOBILE-ONLY FLOATING BRAND LOGO (< md) */}
        <div className="md:hidden relative z-20 -mb-7 flex flex-col items-center justify-center">
          <div className="px-5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.25)] border border-white/60">
            <KroomifyLogo size="md" />
          </div>
        </div>

        {/* MAIN FORM CONTAINER */}
        <div
          id="register-form-container"
          className="w-full max-w-md md:max-w-[400px] bg-white rounded-t-[36px] md:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.3)] md:shadow-none border-t border-white/60 md:border-none px-6 sm:px-8 md:px-0 pt-10 md:pt-0 pb-8 md:pb-0 flex flex-col justify-center my-0 md:my-auto"
        >
          {/* DESKTOP TOP BAR: BACK TO HOME & LANGUAGE SWITCHER (md+) */}
          <div className="hidden md:flex items-center justify-between gap-3 mb-5">
            {onNavigateLanding && (
              <button
                type="button"
                onClick={onNavigateLanding}
                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F7] hover:bg-[#F5E8EA] border border-[#E8DDDE] text-xs font-semibold text-[#5F5652] hover:text-[#66000E] transition-all cursor-pointer active:scale-95 shadow-2xs"
                title={t('auth_back_to_home', 'Kembali ke Beranda')}
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>{t('auth_back_to_home', 'Kembali ke Beranda')}</span>
              </button>
            )}

            <LanguageSwitchButton compact />
          </div>

          {/* DESKTOP BRAND BADGE */}
          <div className="hidden md:flex items-center gap-3 mb-6">
            <KroomifyLogo size="lg" />
          </div>

          {/* GREETING HEADING */}
          <div className="mb-6 text-center md:text-left">
            <h1
              id="register-title"
              className="text-2xl sm:text-3xl font-extrabold text-[#1A1110] tracking-tight"
            >
              {t('auth_register_title', 'Buat Akun Toko Baru')}
            </h1>
          </div>

          {/* ERROR NOTIFICATION */}
          {error && (
            <div
              id="register-error"
              className="mb-4 p-3 rounded-2xl bg-[#FFF1F0] border border-[#FFA39E] text-[#66000E] text-xs font-semibold text-center animate-in fade-in duration-200"
            >
              {error}
            </div>
          )}

          {/* PILL CAPSULE REGISTER FORM */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4 w-full" noValidate>
            {/* Input 1: Store Name (Opsional) */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reg-storename"
                  className="block text-xs sm:text-sm font-medium text-[#1A1110]"
                >
                  {t('auth_store_name_label', 'Nama Toko')}
                </label>
                <span className="text-[11px] text-[#8C8280]">Opsional</span>
              </div>
              <div className="relative">
                <input
                  id="reg-storename"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: Kopi Senja Nusantara"
                  className="w-full h-12 px-5 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7]"
                />
              </div>
            </div>

            {/* Input 2: Full Name / Owner Name */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="reg-fullname"
                className="block text-xs sm:text-sm font-medium text-[#1A1110]"
              >
                {t('auth_fullname_label', 'Nama Pemilik Toko')}
              </label>
              <div className="relative">
                <input
                  id="reg-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Andhika Gonzales"
                  className="w-full h-12 px-5 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7]"
                />
              </div>
            </div>

            {/* Input 3: Username / Email */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="reg-email"
                className="block text-xs sm:text-sm font-medium text-[#1A1110]"
              >
                {t('auth_email_label', 'Alamat Email')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 px-5 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7]"
                />
              </div>
            </div>

            {/* Input 4: WhatsApp Phone Number */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reg-phone"
                  className="block text-xs sm:text-sm font-medium text-[#1A1110]"
                >
                  Nomor WhatsApp
                </label>
                <span className="text-[11px] text-[#8C8280]">Opsional</span>
              </div>
              <div className="relative">
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full h-12 px-5 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7]"
                />
              </div>
            </div>

            {/* Input 5: Password */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="reg-password"
                className="block text-xs sm:text-sm font-medium text-[#1A1110]"
              >
                {t('auth_password_label', 'Kata Sandi')} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  autoComplete="new-password"
                  className="w-full h-12 pl-5 pr-12 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7] tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E7E88] hover:text-[#1A1110] transition-colors p-1.5 rounded-full hover:bg-black/5 cursor-pointer focus:outline-none"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>


            {/* PRIMARY REGISTER BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                id="register-submit-button"
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full h-12 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-medium text-sm sm:text-base shadow-[0_8px_20px_rgba(102,0,14,0.25)] hover:shadow-[0_10px_25px_rgba(102,0,14,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t('saving', 'Mendaftarkan akun...')}</span>
                  </>
                ) : (
                  <span>{t('auth_signup_now', 'Daftar Sekarang')}</span>
                )}
              </button>
            </div>

            {/* GOOGLE SIGN UP BUTTON */}
            <div className="pt-1">
              <button
                type="button"
                id="btn-register-google"
                onClick={handleStartGoogleFlow}
                disabled={isGoogleSubmitting || isSubmitting}
                className="w-full h-12 rounded-full bg-[#F4F4F6] hover:bg-[#ECECEF] text-[#33333A] font-medium text-xs sm:text-sm border border-[#EAEAEE] flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-70"
              >
                {isGoogleSubmitting ? (
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
                <span>{t('auth_register_button', 'Daftar dengan Google')}</span>
              </button>
            </div>

            {/* NAVIGATION FOOTER */}
            <div className="pt-2 text-center text-xs sm:text-sm text-[#6B6260]">
              <span>{t('auth_already_have_account', 'Sudah punya akun?')} </span>
              <button
                type="button"
                id="register-login-link"
                onClick={onNavigateLogin}
                className="font-medium text-[#66000E] hover:text-[#801010] hover:underline cursor-pointer transition-colors focus:outline-none p-1"
              >
                {t('auth_login_button', 'Masuk')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
