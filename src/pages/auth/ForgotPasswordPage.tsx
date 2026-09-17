import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
  KeyRound,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';
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
  const { t } = useLanguage();
  
  const [step, setStep] = useState<'email' | 'token' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = email.length > 3 && email.includes('@') && email.includes('.');
  const isPasswordValid = newPassword.length >= 6;
  const isPasswordMatch = newPassword === confirmPassword;

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Mohon masukkan alamat email yang valid.');
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email.trim());
      setStep('token');
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim token atur ulang. Silakan periksa kembali email Anda.');
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
    <div className="min-h-[100svh] bg-[#FAF7F7] flex items-center justify-center p-3.5 sm:p-6 lg:p-8 font-sans antialiased relative">
      
      {/* Centered Authentication Card */}
      <div 
        className="w-full max-w-[480px] bg-white rounded-[22px] border border-[#E6DDDA] overflow-hidden p-6 sm:p-8 lg:p-9 text-left relative transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 duration-400"
        style={{
          boxShadow: '0 12px 35px rgba(36, 26, 26, 0.07)',
        }}
      >
        
        {/* TOP HEADER: Brand Logo on Left, Language Switcher & Back to Login on Right */}
        <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#E6DDDA] gap-2">
          
          {/* Brand Logo */}
          <button
            type="button"
            onClick={onNavigateLanding || onNavigateLogin}
            className="inline-flex items-center gap-2.5 text-left cursor-pointer group bg-transparent border-0 p-0 focus:outline-none"
            title={t('auth_back_to_home', 'Halaman Utama Kroomify')}
            aria-label={t('auth_back_to_home', 'Kembali ke Halaman Utama')}
          >
            <KroomifyLogo size="md" />
          </button>

          {/* Right actions: Language switcher + Back */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitchButton compact />

            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs font-bold text-[#66000E] hover:text-[#801010] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('auth_back_to_login', 'Kembali Masuk')}</span>
            </button>
          </div>

        </div>

        {step === 'success' ? (
          /* SUCCESS STATE */
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16845B] border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#241A1A] tracking-tight">
                Kata Sandi Berhasil Diubah
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6260] mt-1.5 leading-relaxed">
                Kata sandi untuk akun <strong className="text-[#241A1A] font-semibold">{email}</strong> telah berhasil diperbarui. Anda sekarang dapat masuk menggunakan kata sandi baru Anda.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full h-[50px] sm:h-[52px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('auth_back_to_login', 'Kembali ke Halaman Masuk')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* FORGOT PASSWORD FLOW */
          <>
            {/* ICON & TITLE */}
            <div className="mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#F9EDEF] text-[#66000E] border border-[#F5D0D6] flex items-center justify-center mb-3.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#241A1A] tracking-tight leading-snug">
                {step === 'email' ? t('auth_forgot_password_title', 'Lupa Kata Sandi?') : step === 'token' ? 'Verifikasi Kode Token' : 'Buat Kata Sandi Baru'}
              </h1>
              <p className="text-xs text-[#6B6260] mt-1">
                {step === 'email' 
                  ? t('auth_forgot_password_desc', 'Masukkan email terdaftar Anda untuk menerima token atur ulang kata sandi.')
                  : step === 'token'
                  ? `Masukkan 6-digit token yang telah dikirim ke email ${email}.`
                  : 'Silakan atur kata sandi baru untuk akun Anda.'}
              </p>
            </div>

            {/* ERROR NOTIFICATION BANNER */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#F9EDEF] border border-[#F5D0D6] text-[#B42318] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B42318] mt-1.5 shrink-0" />
                <p className="leading-snug font-medium">{error}</p>
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleRequestToken} className="space-y-4 animate-in fade-in">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label 
                      htmlFor="forgot-email" 
                      className="block text-xs font-semibold text-[#241A1A]"
                    >
                      {t('auth_email_label', 'Alamat Email')}
                    </label>
                    {isEmailValid && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-[#16845B] font-semibold">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        {t('auth_format_valid', 'Format Sesuai')}
                      </span>
                    )}
                  </div>

                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full px-3.5 py-3 h-[48px] sm:h-[50px] rounded-xl border border-[#DCD5D2] bg-white text-[#241A1A] text-sm placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full h-[50px] sm:h-[52px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-sm sm:text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('auth_sending_link', 'Mengirim Tautan...')}</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Token Verifikasi</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 'token' && (
              <form onSubmit={handleVerifyToken} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label 
                      htmlFor="forgot-token" 
                      className="block text-xs font-semibold text-[#241A1A]"
                    >
                      Token Verifikasi
                    </label>
                  </div>
                  <input
                    id="forgot-token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full px-3.5 py-3 h-[48px] sm:h-[50px] rounded-xl border border-[#DCD5D2] bg-white text-[#241A1A] text-center text-xl tracking-[0.5em] placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || token.length !== 6}
                  className="group w-full h-[50px] sm:h-[52px] rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-sm sm:text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Token...</span>
                    </>
                  ) : (
                    <>
                      <span>Verifikasi Token</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setToken('');
                    }}
                    className="text-xs font-semibold text-[#6B6260] hover:text-[#241A1A] cursor-pointer transition-colors"
                  >
                    Ganti Alamat Email
                  </button>
                </div>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="reset-password"
                    className="block text-xs font-semibold text-[#241A1A]"
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
                      className="w-full px-3.5 py-3 pr-12 h-[48px] sm:h-[50px] rounded-xl border border-[#DCD5D2] bg-white text-[#241A1A] text-sm placeholder:text-[#9A9290] focus:outline-none focus:border-[#66000E] focus:ring-3 focus:ring-[#66000E]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E7E88] hover:text-[#1A1110] transition-colors p-1.5 rounded-full hover:bg-black/5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-semibold text-[#241A1A]"
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
                      className={`w-full px-3.5 py-3 pr-12 h-[48px] sm:h-[50px] rounded-xl border bg-white text-[#241A1A] text-sm placeholder:text-[#9A9290] focus:outline-none focus:ring-3 transition-all ${
                        confirmPassword && !isPasswordMatch
                          ? 'border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]/10'
                          : confirmPassword && isPasswordMatch
                          ? 'border-[#16845B] focus:border-[#16845B] focus:ring-[#16845B]/10'
                          : 'border-[#DCD5D2] focus:border-[#66000E] focus:ring-[#66000E]/10'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || !isPasswordMatch}
                  className="group w-full h-[50px] sm:h-[52px] mt-2 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-sm sm:text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Kata Sandi Baru</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </>
        )}

        {/* BOTTOM TRUST SIGNAL */}
        <div className="mt-5 pt-3.5 border-t border-[#E6DDDA] flex items-center justify-center gap-1.5 text-[11px] text-[#6B6260]">
          <Lock className="w-3.5 h-3.5 text-[#16845B]" />
          <span>{t('auth_secure_notice', 'Data toko Anda tetap aman & terlindungi.')}</span>
        </div>

      </div>

    </div>
  );
};
