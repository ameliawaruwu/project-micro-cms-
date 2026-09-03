import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Lock,
  KeyRound,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateLanding?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateLanding,
}) => {
  const { forgotPassword } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmailValid = email.length > 3 && email.includes('@') && email.includes('.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Mohon masukkan alamat email yang valid.');
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email.trim());
      setIsSuccess(true);
    } catch {
      setError('Gagal mengirim tautan atur ulang kata sandi. Silakan periksa kembali email Anda.');
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
            title={t('auth_back_to_home', 'Halaman Utama Kroombox')}
            aria-label={t('auth_back_to_home', 'Kembali ke Halaman Utama')}
          >
            <div className="w-8 h-8 rounded-xl bg-[#66000E] text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-[#241A1A] tracking-tight group-hover:text-[#66000E] transition-colors leading-none">
                Kroombox
              </span>
              <span className="text-[10px] text-[#6B6260] mt-0.5">
                {t('landing_platform_badge', 'Platform Toko Online UMKM')}
              </span>
            </div>
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

        {isSuccess ? (
          /* SUCCESS STATE */
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16845B] border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#241A1A] tracking-tight">
                {t('auth_reset_link_sent', 'Tautan Berhasil Dikirim')}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6260] mt-1.5 leading-relaxed">
                {t('auth_reset_link_desc', 'Tautan atur ulang kata sandi telah dikirim ke')} <strong className="text-[#241A1A] font-semibold">{email}</strong>. {t('auth_check_spam', 'Silakan periksa kotak masuk atau folder spam email Anda.')}
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

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full py-2 text-xs font-semibold text-[#6B6260] hover:text-[#241A1A] text-center transition-colors cursor-pointer"
              >
                {t('auth_resend_diff_email', 'Kirim ulang dengan email lain')}
              </button>
            </div>
          </div>
        ) : (
          /* FORGOT PASSWORD FORM */
          <>
            {/* ICON & TITLE */}
            <div className="mb-5">
              <div className="w-11 h-11 rounded-xl bg-[#F9EDEF] text-[#66000E] border border-[#F5D0D6] flex items-center justify-center mb-3.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#241A1A] tracking-tight leading-snug">
                {t('auth_forgot_password_title', 'Lupa Kata Sandi?')}
              </h1>
              <p className="text-xs text-[#6B6260] mt-1">
                {t('auth_forgot_password_desc', 'Masukkan email terdaftar Anda untuk menerima tautan atur ulang kata sandi.')}
              </p>
            </div>

            {/* ERROR NOTIFICATION BANNER */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#F9EDEF] border border-[#F5D0D6] text-[#B42318] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B42318] mt-1.5 shrink-0" />
                <p className="leading-snug font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* PRIMARY SUBMIT CTA */}
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
                    <span>{t('auth_send_reset_link', 'Kirim Tautan Atur Ulang')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
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
