import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Share2, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { referralService, UserReferralInfo } from '../../services/referralService';
import { useLanguage } from '../../contexts/LanguageContext';

interface ReferralCardProps {
  userId?: string;
  userName?: string;
  storeName?: string;
  onShowNotification?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({
  userId,
  userName,
  storeName,
  onShowNotification,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState<UserReferralInfo>({
    referralCode: '',
    totalReferred: 0,
    referees: [],
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await referralService.getReferralStats(userId, userName);
        if (isMounted) {
          setStats(res);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [userId, userName]);

  const handleCopy = () => {
    if (!stats.referralCode) return;
    navigator.clipboard.writeText(stats.referralCode);
    setCopied(true);
    if (onShowNotification) {
      onShowNotification(
        isEn ? 'Referral code copied to clipboard!' : 'Kode referal berhasil disalin!',
        'success'
      );
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!stats.referralCode) return;
    const inviter = storeName || userName || 'Saya';
    const text = isEn
      ? `Hi! Start your free online store on Kroomify using my referral code: *${stats.referralCode}*. Register here: https://kroomify.kroombox.com/auth`
      : `Halo! Yuk buka toko online UMKM gratis di Kroomify menggunakan kode referal saya: *${stats.referralCode}*. Daftar sekarang di: https://kroomify.kroombox.com/auth`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading || !stats.referralCode) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-white to-[#FDF8F8] rounded-2xl p-4 sm:p-5 border border-[#E5E0DD] shadow-2xs hover:border-[#66000E]/30 transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info & Code */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#66000E]/10 text-[#66000E] border border-[#66000E]/20 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-[#1A1110]">
                {isEn ? 'Merchant Referral Code' : 'Kode Referal Toko Anda'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {isEn ? 'Active' : 'Aktif'}
              </span>
            </div>
            <p className="text-xs text-[#706866] mt-0.5 max-w-lg">
              {isEn
                ? 'Invite fellow merchants or friends to open a store on Kroomify using your referral code.'
                : 'Ajak sesama rekan UMKM atau teman membuka toko online di Kroomify menggunakan kode referal Anda.'}
            </p>

            {/* Referral Code Display */}
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">
                {isEn ? 'Your Code:' : 'Kode Anda:'}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E8DDDE] shadow-2xs font-mono font-bold text-sm sm:text-base text-[#66000E] tracking-wider">
                {stats.referralCode}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">{isEn ? 'Copied' : 'Tersalin'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isEn ? 'Copy' : 'Salin'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Actions & Stat Counter */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-[#706866]">
            <Users className="w-3.5 h-3.5 text-[#66000E]" />
            <span>
              {isEn ? 'Total Invited:' : 'Total Diajak:'}{' '}
              <strong className="text-[#1A1110] font-bold">{stats.totalReferred}</strong> {isEn ? 'Merchants' : 'Toko'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Share to WhatsApp' : 'Bagikan ke WhatsApp'}</span>
            </button>

            {stats.totalReferred > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title={isEn ? 'View list of invited merchants' : 'Lihat daftar merchant yang diajak'}
              >
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded: History of referee merchants */}
      {showHistory && stats.referees.length > 0 && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-2">
          <p className="text-xs font-semibold text-slate-700">
            {isEn ? 'Merchants who joined using your code:' : 'Daftar merchant yang bergabung lewat kode Anda:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {stats.referees.map((ref) => (
              <div
                key={ref.refereeUserId}
                className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs flex items-center justify-between shadow-2xs"
              >
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{ref.refereeName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{ref.refereeEmail}</p>
                </div>
                <span className="text-[9px] text-slate-400 shrink-0 ml-2">
                  {new Date(ref.redeemedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

