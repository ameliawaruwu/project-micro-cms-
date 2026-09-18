import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';
import { AuthIllustration } from '../../components/auth/AuthIllustration';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateLanding?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateLanding,
}) => {
  const { forgotPassword, verifyResetToken, resetPassword } = useAuth();
  const { t } = useLanguage();
  
  const [step, setStep] = useState<'email' | 'token' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devToken, setDevToken] = useState<string | null>(null);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const isInputValid = email.trim().length >= 2;
  const isPasswordValid = newPassword.length >= 6;
  const isPasswordMatch = newPassword === confirmPassword;

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || email.trim().length < 2) {
      setError('Mohon masukkan alamat email atau username yang valid.');
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email.trim());
      const cleanInput = email.trim().toLowerCase();
      const latestToken = localStorage.getItem(`reset_token_latest_${cleanInput}`) || localStorage.getItem(`reset_token_${cleanInput}`);
      if (latestToken) setDevToken(latestToken);
      setResendCooldown(30);
      setStep('token');
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim token atur ulang. Silakan periksa kembali email/username Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendToken = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setError(null);

    try {
      setIsLoading(true);
      await forgotPassword(email.trim());
      const cleanInput = email.trim().toLowerCase();
      const latestToken = localStorage.getItem(`reset_token_latest_${cleanInput}`) || localStorage.getItem(`reset_token_${cleanInput}`);
      if (latestToken) setDevToken(latestToken);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim ulang token. Periksa kembali email/username Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (token.trim().length !== 6) {
      setError('Mohon masukkan 6 digit token dengan benar.');
      return;
    }

    try {
      setIsLoading(true);
      await verifyResetToken(email.trim(), token.trim());
      setStep('password');
    } catch (err: any) {
      setError(err?.message || 'Token tidak valid. Silakan periksa kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (!isPasswordMatch) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email.trim(), token.trim(), newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Gagal mengatur ulang kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="forgot-password-page-container"
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
          id="forgot-form-container"
          className="w-full max-w-md md:max-w-[400px] bg-white rounded-t-[36px] md:rounded-none shadow-[0_-12px_40px_rgba(0,0,0,0.3)] md:shadow-none border-t border-white/60 md:border-none px-6 sm:px-8 md:px-0 pt-10 md:pt-0 pb-8 md:pb-0 flex flex-col justify-center my-0 md:my-auto"
        >
          {/* DESKTOP TOP BAR: BACK TO LOGIN / HOME & LANGUAGE SWITCHER (md+) */}
          <div className="hidden md:flex items-center justify-between gap-3 mb-5">
            <button
              type="button"
              onClick={onNavigateLanding || onNavigateLogin}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F7] hover:bg-[#F5E8EA] border border-[#E8DDDE] text-xs font-semibold text-[#5F5652] hover:text-[#66000E] transition-all cursor-pointer active:scale-95 shadow-2xs"
              title={t('auth_back_to_home', 'Kembali ke Beranda')}
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{t('auth_back_to_home', 'Kembali ke Beranda')}</span>
            </button>

            <LanguageSwitchButton compact />
          </div>

          {/* DESKTOP BRAND BADGE */}
          <div className="hidden md:flex items-center gap-3 mb-6">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFA940] to-[#FFC53D] shadow-sm flex items-center justify-center text-[#5C0D20] font-black text-lg">
                K
              </div>
              <div className="absolute -inset-1 rounded-full bg-[#FFA940]/25 blur-xs pointer-events-none" />
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-xl text-[#1A1110] tracking-tight leading-none">
                Kroombox
              </span>
              <span className="text-[11px] text-[#6B6260] mt-0.5 font-medium tracking-wide">
                {t('landing_platform_badge', 'Platform Toko Online UMKM')}
              </span>
            </div>
          </div>

          {step === 'success' ? (
            /* SUCCESS STATE */
            <div className="space-y-4 animate-in fade-in duration-300 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16845B] border border-emerald-200 flex items-center justify-center mx-auto md:mx-0">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1110] tracking-tight">
                  Kata Sandi Berhasil Diubah
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6260] mt-1.5 leading-relaxed">
                  Kata sandi untuk akun <strong className="text-[#1A1110] font-semibold">{email}</strong> telah berhasil diperbarui. Anda sekarang dapat masuk menggunakan kata sandi baru Anda.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="w-full h-12 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-medium text-sm sm:text-base shadow-[0_8px_20px_rgba(102,0,14,0.25)] hover:shadow-[0_10px_25px_rgba(102,0,14,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('auth_back_to_login', 'Kembali ke Halaman Masuk')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* FORGOT PASSWORD FLOW */
            <>
              {/* GREETING HEADING */}
              <div className="mb-6 text-center md:text-left">
                <h1
                  id="forgot-title"
                  className="text-2xl sm:text-3xl font-extrabold text-[#1A1110] tracking-tight"
                >
                  {step === 'email'
                    ? t('auth_forgot_password_title', 'Lupa Kata Sandi?')
                    : step === 'token'
                    ? 'Verifikasi Kode Token'
                    : 'Buat Kata Sandi Baru'}
                </h1>
                <p className="text-xs sm:text-sm text-[#6B6260] mt-1.5 leading-relaxed">
                  {step === 'email'
                    ? t('auth_forgot_password_desc', 'Masukkan email atau username terdaftar Anda untuk menerima token atur ulang kata sandi.')
                    : step === 'token'
                    ? `Masukkan 6-digit token yang telah dikirim untuk akun ${email}.`
                    : 'Silakan atur kata sandi baru untuk akun Anda.'}
                </p>
              </div>

              {/* ERROR NOTIFICATION */}
              {error && (
                <div
                  id="forgot-error"
                  className="mb-4 p-3 rounded-2xl bg-[#FFF1F0] border border-[#FFA39E] text-[#66000E] text-xs font-semibold text-center animate-in fade-in duration-200"
                >
                  {error}
                </div>
              )}

              {step === 'email' && (
                <form onSubmit={handleRequestToken} className="space-y-4 w-full" noValidate>
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="forgot-email"
                        className="block text-xs sm:text-sm font-medium text-[#1A1110]"
                      >
                        Email atau Username
                      </label>
                      {isInputValid && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-[#16845B] font-semibold">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          {t('auth_format_valid', 'Format Sesuai')}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        id="forgot-email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                        className="w-full h-12 px-5 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group w-full h-12 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-medium text-sm sm:text-base shadow-[0_8px_20px_rgba(102,0,14,0.25)] hover:shadow-[0_10px_25px_rgba(102,0,14,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>{t('auth_sending_link', 'Mengirim Tautan...')}</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Token Verifikasi</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 'token' && (
                <form onSubmit={handleVerifyToken} className="space-y-4 w-full animate-in fade-in" noValidate>


                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="forgot-token"
                      className="block text-xs sm:text-sm font-medium text-[#1A1110]"
                    >
                      Token Verifikasi
                    </label>
                    <input
                      id="forgot-token"
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                      placeholder="123456"
                      required
                      maxLength={6}
                      className="w-full h-12 px-5 rounded-full bg-[#F4F4F6] text-[#1A1110] text-center text-xl tracking-[0.5em] placeholder:text-[#9E9EA7] border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all font-mono font-bold"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || token.length !== 6}
                      className="group w-full h-12 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-medium text-sm sm:text-base shadow-[0_8px_20px_rgba(102,0,14,0.25)] hover:shadow-[0_10px_25px_rgba(102,0,14,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Memverifikasi Token...</span>
                        </>
                      ) : (
                        <>
                          <span>Verifikasi Token</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={handleResendToken}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-[#66000E] hover:underline disabled:text-gray-400 disabled:no-underline cursor-pointer transition-colors"
                    >
                      {resendCooldown > 0 ? `Kirim Ulang Token (${resendCooldown}s)` : '⚡ Kirim Ulang Token'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setToken('');
                        setError(null);
                      }}
                      className="text-[#6B6260] hover:text-[#1A1110] cursor-pointer transition-colors"
                    >
                      Ganti Alamat Email
                    </button>
                  </div>
                </form>
              )}

              {step === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-4 w-full animate-in fade-in" noValidate>
                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="reset-password"
                      className="block text-xs sm:text-sm font-medium text-[#1A1110]"
                    >
                      Kata Sandi Baru
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        className="w-full h-12 pl-5 pr-12 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border border-transparent focus:border-[#66000E] focus:bg-white focus:ring-2 focus:ring-[#66000E]/15 focus:outline-none transition-all placeholder:text-[#9E9EA7] tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E7E88] hover:text-[#1A1110] transition-colors p-1.5 rounded-full hover:bg-black/5 cursor-pointer focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="reset-confirm-password"
                      className="block text-xs sm:text-sm font-medium text-[#1A1110]"
                    >
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="reset-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Masukkan ulang kata sandi baru"
                        required
                        className={`w-full h-12 pl-5 pr-12 rounded-full bg-[#F4F4F6] text-[#1A1110] text-sm sm:text-base border focus:bg-white focus:ring-2 focus:outline-none transition-all placeholder:text-[#9E9EA7] tracking-wider ${
                          confirmPassword && !isPasswordMatch
                            ? 'border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]/15'
                            : confirmPassword && isPasswordMatch
                            ? 'border-[#16845B] focus:border-[#16845B] focus:ring-[#16845B]/15'
                            : 'border-transparent focus:border-[#66000E] focus:ring-[#66000E]/15'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || !isPasswordValid || !isPasswordMatch}
                      className="group w-full h-12 rounded-full bg-[#66000E] hover:bg-[#801010] text-white font-medium text-sm sm:text-base shadow-[0_8px_20px_rgba(102,0,14,0.25)] hover:shadow-[0_10px_25px_rgba(102,0,14,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Simpan Kata Sandi Baru</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* NAVIGATION FOOTER */}
              <div className="pt-3 text-center text-xs sm:text-sm text-[#6B6260]">
                <span>Ingat kata sandi Anda? </span>
                <button
                  type="button"
                  id="forgot-login-link"
                  onClick={onNavigateLogin}
                  className="font-medium text-[#66000E] hover:text-[#801010] hover:underline cursor-pointer transition-colors focus:outline-none p-1"
                >
                  {t('auth_login_button', 'Masuk')}
                </button>
              </div>
            </>
          )}

          {/* BOTTOM TRUST SIGNAL */}
          <div className="mt-6 pt-4 border-t border-[#E6DDDA]/60 flex items-center justify-center gap-1.5 text-[11px] text-[#6B6260]">
            <Lock className="w-3.5 h-3.5 text-[#16845B]" />
            <span>{t('auth_secure_notice', 'Data toko Anda tetap aman & terlindungi.')}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

