import React, { useState, useEffect } from 'react';
import { Store } from '../../types';
import {
  Globe,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  CreditCard,
  ShieldCheck,
  XCircle,
  Lock,
} from 'lucide-react';
import { domainService } from '../../services/domainService';
import {
  domainRequestService,
  DomainRequest,
  DOMAIN_TLD_PRICES,
} from '../../services/domainRequestService';
import { midtransService } from '../../services/midtransService';
import { formatRupiah } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';
import confetti from 'canvas-confetti';

interface DomainPageProps {
  store: Store;
  onNavigateBilling?: () => void;
}

export const DomainPage: React.FC<DomainPageProps> = ({ store, onNavigateBilling }) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const isFreePlan = !store?.plan || store.plan === 'free' || store.plan === 'free_trial';
  const [domainType, setDomainType] = useState<'random' | 'custom'>(
    store.domainType || (store.customDomain ? 'custom' : 'random')
  );

  // Form input domain
  const [domainPrefix, setDomainPrefix] = useState('');
  const [selectedTld, setSelectedTld] = useState<string>('.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingRandom, setIsSettingRandom] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Domain Request Data
  const [activeRequest, setActiveRequest] = useState<DomainRequest | null>(null);
  const [isConnected, setIsConnected] = useState(store.domainStatus === 'connected' && !!store.customDomain);

  const hasStoreName = !!(
    store?.name &&
    store.name.trim() !== '' &&
    store.name !== 'Belum Memiliki Toko' &&
    store.name !== 'Toko Baru UMKM'
  );
  const randomDomain = hasStoreName && store?.slug && store.slug.trim()
    ? `${store.slug}.kroombox.com`
    : '';

  // Fetch request domain dari Supabase / service
  const loadDomainRequest = async () => {
    const req = await domainRequestService.getRequestByStore(store.id);
    setActiveRequest(req);
    if (req && req.status === 'active') {
      setIsConnected(true);
    }
  };

  useEffect(() => {
    loadDomainRequest();

    if (store.customDomain) {
      domainService.checkDomainStatus(store.customDomain).then((res) => {
        if (res.connected) {
          setIsConnected(true);
        }
      });
    }
  }, [store.id, store.customDomain]);

  const handleCopyRandomDomain = () => {
    if (!randomDomain) {
      setAlert({
        type: 'error',
        message: isEn
          ? 'Please fill in your store name first in Store Settings.'
          : 'Silakan isi nama toko Anda terlebih dahulu di Pengaturan Toko.',
      });
      return;
    }
    navigator.clipboard.writeText(`https://${randomDomain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseRandomDomain = async () => {
    if (!hasStoreName || !randomDomain) {
      setAlert({
        type: 'error',
        message: isEn
          ? 'Please fill in your store name first in Store Settings.'
          : 'Silakan isi nama toko Anda terlebih dahulu di Pengaturan Toko.',
      });
      return;
    }

    if (isFreePlan) {
      setAlert({
        type: 'error',
        message: isEn
          ? 'Domain access is locked on Free Plan. Please upgrade to unlock and activate this domain.'
          : 'Akses domain terkunci pada Paket Free. Silakan upgrade ke paket berbayar untuk mengaktifkan domain ini.',
      });
      return;
    }

    setIsSettingRandom(true);
    setAlert(null);
    try {
      const res = await domainService.useRandomDomain(store.id);
      if (res.success) {
        setDomainType('random');
        setAlert({
          type: 'success',
          message: isEn
            ? `Successfully active with system domain: https://${randomDomain}`
            : `Berhasil menggunakan domain sistem: https://${randomDomain}`,
        });
      } else {
        setAlert({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || (isEn ? 'An error occurred while enabling random domain.' : 'Terjadi kesalahan saat mengaktifkan random domain.'),
      });
    } finally {
      setIsSettingRandom(false);
    }
  };

  // Submit pengajuan domain baru
  const handleRequestDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrefix = domainPrefix.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (!cleanPrefix) {
      setAlert({
        type: 'error',
        message: isEn
          ? 'Please enter your desired domain name (letters, numbers, or dashes only).'
          : 'Silakan masukkan nama domain yang diinginkan (hanya huruf, angka, atau tanda minus).',
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const result = await domainRequestService.createRequest(
        store.id,
        store.name,
        cleanPrefix,
        selectedTld
      );

      if (result.success && result.request) {
        setActiveRequest(result.request);
        setAlert({
          type: 'success',
          message: result.message,
        });
        setDomainPrefix('');
      } else {
        setAlert({ type: 'error', message: result.message });
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || (isEn ? 'Failed to submit domain request.' : 'Gagal mengajukan permintaan domain.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bayar invoice domain yang sudah di-approve Admin
  const handlePayDomainInvoice = async () => {
    if (!activeRequest || activeRequest.status !== 'approved') return;

    setIsPaying(true);
    const orderId = `DOM-${Date.now()}`;

    try {
      await midtransService.payWithSnap(
        {
          orderId,
          grossAmount: activeRequest.price,
          customerName: store.name,
          customerPhone: store.phoneWhatsApp,
        },
        {
          onSuccess: async () => {
            await domainRequestService.markAsPaidAndActivate(activeRequest.id);
            await domainService.connectCustomDomain(store.id, activeRequest.fullDomain);
            await loadDomainRequest();
            setIsConnected(true);
            setIsPaying(false);
            setAlert({
              type: 'success',
              message: isEn
                ? `Congratulations! Payment succeeded and ${activeRequest.fullDomain} is now officially active!`
                : `Selamat! Pembayaran berhasil dan domain ${activeRequest.fullDomain} resmi aktif di toko Anda!`,
            });
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          },
          onPending: async () => {
            setIsPaying(false);
            setAlert({
              type: 'info',
              message: isEn
                ? 'Domain payment is currently being verified by the system.'
                : 'Pembayaran invoice domain sedang diverifikasi oleh sistem.',
            });
          },
          onError: () => {
            setIsPaying(false);
            setAlert({
              type: 'error',
              message: isEn ? 'Payment was cancelled or failed.' : 'Pembayaran dibatalkan atau gagal.',
            });
          },
          onClose: () => {
            setIsPaying(false);
          },
        }
      );
    } catch (err: any) {
      console.error('Payment error for domain invoice:', err);
      setIsPaying(false);
      setAlert({
        type: 'error',
        message: (isEn ? 'Failed to launch Midtrans checkout: ' : 'Gagal membuka pembayaran Midtrans: ') + (err?.message || ''),
      });
    }
  };

  // Putuskan custom domain
  const handleDisconnectDomain = async () => {
    const domainToDisconnect = activeRequest?.fullDomain || store.customDomain;
    if (!domainToDisconnect) return;

    setIsSubmitting(true);
    setAlert(null);

    try {
      const res = await domainService.disconnectCustomDomain(store.id, domainToDisconnect);
      if (res.success) {
        setIsConnected(false);
        setActiveRequest(null);
        setDomainType('random');
        setAlert({
          type: 'success',
          message: res.message || (isEn ? 'Domain successfully disconnected.' : 'Domain berhasil diputuskan.'),
        });
      } else {
        setAlert({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || (isEn ? 'Failed to disconnect domain.' : 'Gagal memutuskan domain.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 w-full text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E0DD] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#241A1A] tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#66000E]" />
            <span>{t('domain_page_title', 'Domain Toko')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#706866] mt-1">
            {t('domain_page_subtitle', 'Atur alamat web toko online Anda agar profesional dan mudah diingat pelanggan')}
          </p>
        </div>
      </div>

      {/* FREE PLAN SANDBOX NOTICE */}
      {isFreePlan && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950">
                {isEn ? 'Free Plan: Sandbox Preview Mode' : 'Paket Free: Toko Berstatus Sandbox Preview'}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {isEn
                  ? 'Live deployment and custom domains (.com / .id) unlock with Starter or Pro plan.'
                  : 'Fitur deploy publikasi live dan Custom Domain (.com / .id) terbuka di paket Personal Toko & Community UMKM.'}
              </p>
            </div>
          </div>
          {onNavigateBilling && (
            <button
              type="button"
              onClick={onNavigateBilling}
              className="px-3.5 py-1.5 bg-[#66000E] hover:bg-[#52000B] text-white rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{t('domain_upgrade_cta', 'Lihat Paket Langganan')}</span>
            </button>
          )}
        </div>
      )}

      {/* ALERT NOTIFICATION */}
      {alert && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 border transition-all ${
            alert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : alert.type === 'error'
              ? 'bg-[#F5E8EA] border-[#E8DDDE] text-[#66000E]'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : alert.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[#66000E] shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{alert.message}</div>
        </div>
      )}

      {/* 2 MAIN CARDS: RANDOM VS CUSTOM DOMAIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* CARD 1: RANDOM DOMAIN (GRATIS) */}
        <div
          onClick={() => setDomainType('random')}
          className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all cursor-pointer shadow-2xs ${
            domainType === 'random'
              ? 'border-[#66000E] ring-2 ring-[#66000E]/20 shadow-xs'
              : 'border-[#E5E0DD] hover:border-[#66000E]/40'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  domainType === 'random' ? 'bg-[#F5E8EA] text-[#66000E]' : 'bg-[#FAF7F7] text-[#706866]'
                }`}
              >
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#241A1A]">{t('domain_type_random', 'Random Subdomain')}</h3>
                <p className="text-xs text-[#706866]">{t('domain_type_random_desc', 'Gratis selamanya dari sistem Kroomify')}</p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                domainType === 'random' ? 'border-[#66000E]' : 'border-[#E5E0DD]'
              }`}
            >
              {domainType === 'random' && <div className="w-2.5 h-2.5 rounded-full bg-[#66000E]" />}
            </div>
          </div>

          <div className="bg-[#FAF7F7] p-3 rounded-xl border border-[#E5E0DD] mb-4 flex items-center justify-between gap-2">
            {randomDomain ? (
              <p className="text-xs sm:text-sm font-medium text-[#241A1A] truncate">
                <span className="text-[#706866] font-normal">https://</span>
                {randomDomain}
              </p>
            ) : (
              <p className="text-xs sm:text-sm font-medium text-[#999999] italic truncate">
                {isEn ? 'Domain will appear once store name is filled' : 'Domain belum dibuat (Isi nama toko terlebih dahulu)'}
              </p>
            )}
            {randomDomain ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyRandomDomain();
                  }}
                  className="p-1.5 text-[#706866] hover:text-[#241A1A] hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#E5E0DD]"
                  title={t('actions_copy', 'Salin')}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={`https://${randomDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-[#706866] hover:text-[#241A1A] hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#E5E0DD]"
                  title={t('actions_open_store', 'Buka Toko')}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              {hasStoreName ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('domain_available', 'Tersedia')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>{isEn ? 'Store name not set' : 'Nama toko belum diisi'}</span>
                </div>
              )}
              {isFreePlan && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>{t('domain_locked_free', 'Terkunci (Paket Free)')}</span>
                </div>
              )}
            </div>

            {domainType === 'random' && (
              isFreePlan ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateBilling) {
                      onNavigateBilling();
                    } else {
                      setAlert({
                        type: 'error',
                        message: isEn
                          ? 'Domain access is locked on Free Plan. Please upgrade your subscription.'
                          : 'Akses domain terkunci pada Paket Free. Silakan upgrade paket langganan Anda.',
                      });
                    }
                  }}
                  className="text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Terkunci: Upgrade paket untuk mengaktifkan domain ini"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-800" />
                  <span>{t('domain_unlock_btn', 'Buka Kunci Domain')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-800" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSettingRandom}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseRandomDomain();
                  }}
                  className="text-xs sm:text-sm font-bold text-[#66000E] hover:text-[#52000B] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSettingRandom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> {t('domain_saving', 'Menyimpan...')}
                    </>
                  ) : (
                    <>
                      <span>{t('domain_btn_use', 'Gunakan Domain')}</span> <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* CARD 2: CUSTOM DOMAIN */}
        <div
          onClick={() => setDomainType('custom')}
          className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all cursor-pointer shadow-2xs ${
            domainType === 'custom'
              ? 'border-[#66000E] ring-2 ring-[#66000E]/20 shadow-xs'
              : 'border-[#E5E0DD] hover:border-[#66000E]/40'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  domainType === 'custom' ? 'bg-[#F5E8EA] text-[#66000E]' : 'bg-[#FAF7F7] text-[#706866]'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#241A1A]">{t('domain_type_custom', 'Custom Domain')}</h3>
                <p className="text-xs text-[#706866]">{t('domain_type_custom_desc', 'Gunakan nama domain brand sendiri (.com, .id, dll)')}</p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                domainType === 'custom' ? 'border-[#66000E]' : 'border-[#E5E0DD]'
              }`}
            >
              {domainType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-[#66000E]" />}
            </div>
          </div>

          {domainType === 'custom' ? (
            <div className="space-y-4">
              {/* STATUS TRACKER CARD JIKA SUDAH ADA REQUEST */}
              {activeRequest && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    activeRequest.status === 'pending'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : activeRequest.status === 'approved'
                      ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                      : activeRequest.status === 'rejected'
                      ? 'bg-[#F5E8EA] border-[#E8DDDE] text-[#66000E]'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                      <Globe className="w-4 h-4" /> {activeRequest.fullDomain}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${
                        activeRequest.status === 'pending'
                          ? 'bg-amber-200 text-amber-800'
                          : activeRequest.status === 'approved'
                          ? 'bg-blue-200 text-blue-800'
                          : activeRequest.status === 'rejected'
                          ? 'bg-[#F5E8EA] text-[#66000E]'
                          : 'bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {activeRequest.status === 'pending'
                        ? (isEn ? 'Pending Review' : 'Menunggu Review Admin')
                        : activeRequest.status === 'approved'
                        ? (isEn ? 'Approved' : 'Disetujui Admin')
                        : activeRequest.status === 'rejected'
                        ? (isEn ? 'Unavailable' : 'Tidak Tersedia')
                        : (isEn ? 'Domain Active' : 'Domain Aktif')}
                    </span>
                  </div>

                  {activeRequest.adminNotes && (
                    <p className="leading-relaxed opacity-90">{activeRequest.adminNotes}</p>
                  )}

                  {/* KONDISI 1: REJECTED (Tampilkan Saran Domain Alternatif dari Admin) */}
                  {activeRequest.status === 'rejected' && activeRequest.adminSuggestions && activeRequest.adminSuggestions.length > 0 && (
                    <div className="pt-2 border-t border-[#E5E0DD]">
                      <p className="font-semibold mb-1.5 text-[#66000E]">
                        {isEn ? 'Suggested Available Domains:' : 'Saran Domain yang Tersedia:'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeRequest.adminSuggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const parts = sug.split('.');
                              if (parts.length >= 2) {
                                setDomainPrefix(parts[0]);
                                setSelectedTld(`.${parts.slice(1).join('.')}`);
                              }
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-[#F5E8EA] border border-[#E5E0DD] rounded-lg text-[#66000E] font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                          >
                            <span>{sug}</span>
                            <ArrowRight className="w-3 h-3 text-[#66000E]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* KONDISI 2: APPROVED (Tampilkan Invoice & Tombol Bayar) */}
                  {activeRequest.status === 'approved' && (
                    <div className="pt-2 border-t border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[11px] text-blue-700 block">
                          {isEn ? 'Total Domain Invoice (1 Year):' : 'Total Tagihan Domain (1 Tahun):'}
                        </span>
                        <span className="text-base font-black text-blue-950">
                          {formatRupiah(activeRequest.price)}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={isPaying}
                        onClick={handlePayDomainInvoice}
                        className="px-4 py-2 bg-[#66000E] hover:bg-[#52000B] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-50 active:scale-98"
                      >
                        {isPaying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> {t('domain_saving', 'Memproses...')}
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" /> {isEn ? 'Pay via Midtrans' : 'Bayar via Midtrans'}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* KONDISI 3: ACTIVE */}
                  {activeRequest.status === 'active' && (
                    <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                      <span className="text-emerald-800 font-semibold text-[11px]">
                        {isEn ? 'Connected to Kroomify Cloudflare Tunnel' : 'Terhubung ke Cloudflare Tunnel Kroomify'}
                      </span>
                      <button
                        type="button"
                        onClick={handleDisconnectDomain}
                        className="text-xs text-[#66000E] hover:text-[#52000B] font-bold underline cursor-pointer"
                      >
                        {isEn ? 'Disconnect' : 'Putuskan'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {isFreePlan ? (
                <div className="p-5 rounded-2xl bg-[#FAF7F7] border border-dashed border-[#E5E0DD] text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#F5E8EA] text-[#66000E] flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#241A1A]">
                      {t('domain_premium_required', 'Fitur Custom Domain Membutuhkan Paket Langganan')}
                    </h4>
                    <p className="text-xs text-[#706866] mt-1 max-w-sm mx-auto leading-relaxed">
                      {t('domain_upgrade_hint', 'Upgrade ke paket Starter atau Pro untuk mengaktifkan custom domain nama toko Anda.')}
                    </p>
                  </div>
                  {onNavigateBilling && (
                    <button
                      type="button"
                      onClick={onNavigateBilling}
                      className="px-4 py-2 bg-[#66000E] hover:bg-[#52000B] text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer inline-flex items-center gap-2 active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>{t('domain_upgrade_cta', 'Lihat Paket Langganan')}</span>
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRequestDomain} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#241A1A] mb-1">
                      {t('domain_custom_title', 'Cari & Beli Domain Kustom Baru')}
                    </label>
                    <div className="flex rounded-xl shadow-2xs border border-[#E5E0DD] overflow-hidden focus-within:ring-2 focus-within:ring-[#66000E]/20 focus-within:border-[#66000E]">
                      <input
                        type="text"
                        value={domainPrefix}
                        onChange={(e) => setDomainPrefix(e.target.value.toLowerCase())}
                        placeholder={t('domain_input_placeholder', 'nama-brand-kamu')}
                        className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm outline-none font-medium text-[#241A1A] bg-white placeholder:text-[#706866]"
                      />
                      <select
                        value={selectedTld}
                        onChange={(e) => setSelectedTld(e.target.value)}
                        className="px-3 py-2.5 text-xs sm:text-sm font-bold bg-[#FAF7F7] text-[#241A1A] border-l border-[#E5E0DD] outline-none cursor-pointer hover:bg-white transition"
                      >
                        {Object.keys(DOMAIN_TLD_PRICES).map((tld) => (
                          <option key={tld} value={tld}>
                            {tld}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* KETERANGAN BIAYA DOMAIN */}
                  <div className="bg-[#FAF7F7] p-3.5 rounded-xl border border-[#E5E0DD] text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2 text-[#706866]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>
                        {isEn ? 'Domain price depends on selected TLD extension.' : 'Biaya pendaftaran domain tergantung pada ekstensi domain yang dipilih.'}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Include DNS & SSL
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting || !domainPrefix.trim()}
                      className="bg-[#66000E] hover:bg-[#52000B] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-2xs disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-98"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> {t('domain_btn_checking', 'Memeriksa...')}
                        </>
                      ) : (
                        <>
                          <span>{t('domain_btn_check', 'Cek Ketersediaan')}</span> <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-[#FAF7F7] p-3.5 rounded-xl border border-[#E5E0DD] text-xs text-[#706866]">
              {isEn
                ? 'Select this option to request an official domain (.com, .id, .online, .org, etc).'
                : 'Pilih opsi ini untuk mengajukan domain resmi (.com, .id, .online, .org, .top).'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

