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
  Mail,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';
import { AuthIllustration } from '../../components/auth/AuthIllustration';
import { KroomifyLogo } from '../../components/common/KroomifyLogo';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateLanding?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateLanding,
}) => {
  const { forgotPassword, verifyResetToken, resetPassword } = useAuth();
  const { t, isEn } = useLanguage();
  
  const [step, setStep] = useState<'email' | 'token' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const isInputValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const isPasswordValid = newPassword.length >= 8;
  const isPasswordMatch = newPassword === confirmPassword;

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isInputValid) {
      setError(isEn ? 'Please enter a valid email address.' : 'Mohon masukkan alamat email yang valid.');
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email.trim());
      setResendCooldown(30);
      setStep('token');
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Failed to send the reset token. Please check your email address.' : 'Gagal mengirim token atur ulang. Silakan periksa kembali alamat email Anda.'));
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
      setResendCooldown(30);
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Failed to resend the token. Please check your email address.' : 'Gagal mengirim ulang token. Periksa kembali alamat email Anda.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (token.trim().length !== 6) {
      setError(isEn ? 'Please enter the 6-digit token correctly.' : 'Mohon masukkan 6 digit token dengan benar.');
      return;
    }

    try {
      setIsLoading(true);
      await verifyResetToken(email.trim(), token.trim());
      setStep('password');
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Invalid token. Please check again.' : 'Token tidak valid. Silakan periksa kembali.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError(isEn ? 'New password must be at least 8 characters.' : 'Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (!isPasswordMatch) {
      setError(isEn ? 'Password confirmation does not match.' : 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email.trim(), token.trim(), newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Failed to reset password.' : 'Gagal mengatur ulang kata sandi.'));
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
          <div className="px-5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.25)] border border-white/60">
            <KroomifyLogo size="md" />
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
            <KroomifyLogo size="lg" />
          </div>

          {step === 'success' ? (
            /* SUCCESS STATE */
            <div className="space-y-4 animate-in fade-in duration-300 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16845B] border border-emerald-200 flex items-center justify-center mx-auto md:mx-0">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1110] tracking-tight">
                  {isEn ? 'Password Changed Successfully' : 'Kata Sandi Berhasil Diubah'}
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6260] mt-1.5 leading-relaxed">
                  {isEn ? 'The password for account ' : 'Kata sandi untuk akun '}<strong className="text-[#1A1110] font-semibold">{email}</strong>{isEn ? ' has been updated. You can now log in with your new password.' : ' telah berhasil diperbarui. Anda sekarang dapat masuk menggunakan kata sandi baru Anda.'}
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
                    ? (isEn ? 'Forgot Password?' : 'Lupa Kata Sandi?')
                    : step === 'token'
                    ? (isEn ? 'Verify Token Code' : 'Verifikasi Kode Token')
                    : (isEn ? 'Create New Password' : 'Buat Kata Sandi Baru')}
                </h1>
                <p className="text-xs sm:text-sm text-[#6B6260] mt-1.5 leading-relaxed">
                  {step === 'email'
                    ? (isEn ? 'Enter your registered email address to receive a password reset token.' : 'Masukkan alamat email terdaftar Anda untuk menerima token atur ulang kata sandi.')
                    : step === 'token'
                    ? (isEn ? `Enter the 6-digit token sent for account ${email}.` : `Masukkan 6-digit token yang telah dikirim untuk akun ${email}.`)
                    : (isEn ? 'Please set a new password for your account.' : 'Silakan atur kata sandi baru untuk akun Anda.')}
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
                        {isEn ? 'Email Address' : 'Alamat Email'}
                      </label>
                      {isInputValid && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-[#16845B] font-semibold">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          {isEn ? 'Valid Format' : 'Format Sesuai'}
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        id="forgot-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isEn ? 'name@email.com' : 'nama@email.com'}
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
                          <span>{isEn ? 'Sending Link...' : 'Mengirim Tautan...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isEn ? 'Send Verification Token' : 'Kirim Token Verifikasi'}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 'token' && (
                <form onSubmit={handleVerifyToken} className="space-y-4 w-full animate-in fade-in" noValidate>
                  <div className="p-3.5 bg-[#F9EDEF] border border-[#66000E]/20 rounded-2xl text-xs text-[#66000E] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#66000E]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-[#66000E]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1A1110]">{isEn ? 'A verification code has been sent to your email' : 'Kode verifikasi telah dikirim ke email'}</p>
                      <p className="text-[11px] text-[#6B6260] mt-0.5">{isEn ? 'Please check the Inbox or Spam folder of ' : 'Silakan periksa kotak masuk (Inbox) atau folder Spam pada email '}<strong>{email}</strong>.</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="forgot-token"
                      className="block text-xs sm:text-sm font-medium text-[#1A1110]"
                    >
                      {isEn ? 'Verification Token (6 Digits)' : 'Token Verifikasi (6 Digit)'}
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
                          <span>{isEn ? 'Verifying Token...' : 'Memverifikasi Token...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isEn ? 'Verify Token' : 'Verifikasi Token'}</span>
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
                      {resendCooldown > 0
                        ? (isEn ? `Resend Token (${resendCooldown}s)` : `Kirim Ulang Token (${resendCooldown}s)`)
                        : (isEn ? '⚡ Resend Token' : '⚡ Kirim Ulang Token')}
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
                      {isEn ? 'Change Email Address' : 'Ganti Alamat Email'}
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
                      {isEn ? 'New Password' : 'Kata Sandi Baru'}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={isEn ? 'At least 8 characters' : 'Minimal 8 karakter'}
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
                      {isEn ? 'Confirm New Password' : 'Konfirmasi Kata Sandi Baru'}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="reset-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={isEn ? 'Re-enter new password' : 'Masukkan ulang kata sandi baru'}
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
                          <span>{isEn ? 'Saving...' : 'Menyimpan...'}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{isEn ? 'Save New Password' : 'Simpan Kata Sandi Baru'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* NAVIGATION FOOTER */}
              <div className="pt-3 text-center text-xs sm:text-sm text-[#6B6260]">
                <span>{isEn ? 'Remember your password? ' : 'Ingat kata sandi Anda? '}</span>
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
            <span>{isEn ? 'Your store data stays safe & protected.' : 'Data toko Anda tetap aman & terlindungi.'}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

