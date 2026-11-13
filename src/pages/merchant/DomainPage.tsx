import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  XCircle,
  Lock,
  QrCode,
  Upload,
} from 'lucide-react';
import { domainService } from '../../services/domainService';
import { useStoreBaseDomain } from '../../utils/storeDomain';
import {
  domainRequestService,
  DomainRequest,
  DOMAIN_TLD_PRICES,
} from '../../services/domainRequestService';
import { formatRupiah } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { billingPlanService, resolvePlanSlug, ActiveSubscriptionInfo } from '../../services/billingPlanService';

interface DomainPageProps {
  store: Store;
  onUpdateStore?: (updated: Store) => void;
  onNavigateBilling?: () => void;
  onNavigateDashboard?: () => void;
}

export const DomainPage: React.FC<DomainPageProps> = ({
  store,
  onUpdateStore,
  onNavigateBilling,
  onNavigateDashboard,
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [subInfo, setSubInfo] = useState<ActiveSubscriptionInfo | null>(null);

  useEffect(() => {
    if (store?.id) {
      billingPlanService.getActiveSubscriptionForStore(store.id).then((info) => {
        setSubInfo(info);
        if (info.hasActivePaidPlan && onUpdateStore && (store.plan !== info.planSlug || store.planExpiresAt !== info.expiresAt)) {
          onUpdateStore({
            ...store,
            plan: info.planSlug,
            planExpiresAt: info.expiresAt,
            planSubscribedAt: info.subscribedAt,
          });
        }
      });
    }
  }, [store?.id]);

  const [domainType, setDomainType] = useState<'random' | 'custom'>(
    store.domainType || (store.customDomain ? 'custom' : 'random')
  );

  // Form input domain
  const [domainPrefix, setDomainPrefix] = useState('');
  const [selectedTld, setSelectedTld] = useState<string>('.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingRandom, setIsSettingRandom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Domain Request Data
  const [activeRequest, setActiveRequest] = useState<DomainRequest | null>(null);
  // Pembayaran manual: QRIS platform + bukti transfer diverifikasi super admin
  const [domainQrisUrl, setDomainQrisUrl] = useState('');
  const [isQrisLoaded, setIsQrisLoaded] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);
  const [isConnected, setIsConnected] = useState(store.domainStatus === 'connected' && !!store.customDomain);

  const hasStoreName = !!(
    store?.name &&
    store.name.trim() !== '' &&
    store.name !== 'Belum Memiliki Toko' &&
    store.name !== 'Toko Baru UMKM'
  );
  const { domain: baseDomain } = useStoreBaseDomain(store);
  const randomDomain = hasStoreName && store?.slug && store.slug.trim()
    ? `${store.slug}.${baseDomain}`
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
    if (activeRequest?.status !== 'approved' || isQrisLoaded) return;
    domainRequestService.getDomainQrisUrl().then((url) => {
      setDomainQrisUrl(url);
      setIsQrisLoaded(true);
    });
  }, [activeRequest?.status]);

  // Bebaskan object URL pratinjau bukti saat diganti / komponen dilepas.
  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  const clearProofSelection = () => {
    setProofFile(null);
    setProofPreview('');
  };

  const handleProofPicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setAlert({ type: 'error', message: isEn ? 'Proof must be a PNG, JPG, or WEBP image.' : 'Bukti bayar harus berupa gambar PNG, JPG, atau WEBP.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', message: isEn ? 'Maximum image size is 5MB.' : 'Ukuran gambar maksimal 5MB.' });
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmitProof = async () => {
    if (!proofFile || !activeRequest) return;
    setIsUploadingProof(true);
    const result = await domainRequestService.submitPaymentProof(activeRequest, proofFile);
    setIsUploadingProof(false);
    if (result.success) {
      clearProofSelection();
      setActiveRequest((prev) =>
        prev ? { ...prev, paymentProofUrl: result.proofUrl, paymentProofSubmittedAt: new Date().toISOString() } : prev
      );
      setAlert({
        type: 'success',
        message: isEn
          ? 'Payment proof sent. The admin will verify it and activate your domain.'
          : 'Bukti pembayaran terkirim. Admin akan memverifikasi lalu mengaktifkan domain Anda.',
      });
    } else {
      setAlert({ type: 'error', message: result.message });
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
    <div className="space-y-4 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 w-full text-left">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: t('domain_page_title', 'Domain Toko'), isActive: true },
        ]}
      />

      {/* 1. Page Title */}
      <div className="pb-3 border-b border-[#E5E0DD]">
        <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-[#66000E]" />
          <span>{t('domain_page_title', 'Domain Toko')}</span>
        </h1>
      </div>

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
                <p className="text-xs text-[#706866]">{t('domain_type_random_desc', 'Gratis selamanya dari sistem LapakQ')}</p>
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
            </div>

            {domainType === 'random' && (
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
                      <Loader2 className="w-4 h-4 animate-spin" /> {t('domain_saving', isEn ? 'Saving...' : 'Menyimpan...')}
                    </>
                  ) : (
                    <>
                      <span>{t('domain_btn_use', isEn ? 'Use Domain' : 'Gunakan Domain')}</span> <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
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
                        ? activeRequest.paymentProofUrl
                          ? (isEn ? 'Verifying Payment' : 'Verifikasi Pembayaran')
                          : (isEn ? 'Approved' : 'Disetujui Admin')
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

                  {/* KONDISI 2: APPROVED - tagihan dibayar via QRIS platform, lalu unggah bukti */}
                  {activeRequest.status === 'approved' && (
                    <div className="pt-2 border-t border-blue-200 space-y-3">
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-blue-700 block">
                            {isEn ? 'Total Domain Invoice (1 Year):' : 'Total Tagihan Domain (1 Tahun):'}
                          </span>
                          <span className="text-base font-black text-blue-950">{formatRupiah(activeRequest.price)}</span>
                        </div>
                        {activeRequest.invoiceNumber && (
                          <span className="text-[11px] text-blue-700">
                            {isEn ? 'Invoice:' : 'No. Invoice:'}{' '}
                            <span className="font-mono font-semibold">{activeRequest.invoiceNumber}</span>
                          </span>
                        )}
                      </div>

                      {!isQrisLoaded ? (
                        <div className="flex items-center gap-2 text-[11px] text-blue-800">
                          <Loader2 className="w-4 h-4 animate-spin" /> {isEn ? 'Loading payment QRIS...' : 'Memuat QRIS pembayaran...'}
                        </div>
                      ) : !domainQrisUrl ? (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/80 border border-blue-200 text-[11px] text-blue-900">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                          <span>
                            {isEn
                              ? 'The payment QRIS has not been set by the admin yet. Please contact the admin to complete the payment.'
                              : 'QRIS pembayaran belum diatur admin. Hubungi admin untuk menyelesaikan pembayaran.'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-3.5">
                          <a
                            href={domainQrisUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-center sm:self-start shrink-0 p-2 bg-white rounded-xl border border-blue-200 shadow-2xs"
                            title={isEn ? 'Open QRIS in full size' : 'Buka QRIS ukuran penuh'}
                          >
                            <img src={domainQrisUrl} alt="QRIS" className="w-40 h-40 object-contain" />
                          </a>
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="font-bold text-blue-950 flex items-center gap-1.5">
                              <QrCode className="w-4 h-4" /> {isEn ? 'Pay via QRIS' : 'Bayar via QRIS'}
                            </p>
                            <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-blue-800 leading-relaxed">
                              <li>
                                {isEn ? 'Scan the QRIS and pay exactly ' : 'Pindai QRIS dan bayar tepat '}
                                <span className="font-bold">{formatRupiah(activeRequest.price)}</span>.
                              </li>
                              <li>{isEn ? 'Upload a screenshot of the transfer proof below.' : 'Unggah tangkapan layar bukti transfer di bawah.'}</li>
                              <li>{isEn ? 'The admin verifies it and activates your domain.' : 'Admin memverifikasi lalu mengaktifkan domain Anda.'}</li>
                            </ol>
                          </div>
                        </div>
                      )}

                      {domainQrisUrl && (
                        <div className="p-3 rounded-xl bg-white border border-blue-200 space-y-2.5">
                          <p className="text-[11px] font-bold text-blue-950">
                            {isEn ? 'Payment Proof' : 'Bukti Pembayaran'}
                          </p>

                          {activeRequest.paymentProofUrl && !proofFile && (
                            <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
                              <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                              <span className="text-[11px] font-semibold text-blue-900 flex-1 min-w-[140px]">
                                {isEn ? 'Proof sent, waiting for admin verification.' : 'Bukti terkirim, menunggu verifikasi admin.'}
                              </span>
                              <a
                                href={activeRequest.paymentProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-bold text-blue-800 underline"
                              >
                                {isEn ? 'View proof' : 'Lihat bukti'}
                              </a>
                            </div>
                          )}

                          {proofFile ? (
                            <div className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 bg-gray-50">
                              <img src={proofPreview} alt="" className="w-14 h-14 rounded-md object-cover border border-gray-200 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-gray-900 truncate">{proofFile.name}</p>
                                <p className="text-[10px] text-gray-500">{(proofFile.size / 1024).toFixed(0)} KB</p>
                              </div>
                              <button
                                type="button"
                                disabled={isUploadingProof}
                                onClick={clearProofSelection}
                                className="text-gray-400 hover:text-gray-700 cursor-pointer disabled:opacity-50"
                                title={isEn ? 'Remove' : 'Hapus'}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => proofInputRef.current?.click()}
                              className="w-full flex flex-col items-center justify-center gap-1 px-3 py-4 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/60 text-blue-900 transition cursor-pointer"
                            >
                              <Upload className="w-5 h-5" />
                              <span className="text-xs font-bold">
                                {activeRequest.paymentProofUrl
                                  ? (isEn ? 'Choose a new proof image' : 'Pilih gambar bukti baru')
                                  : (isEn ? 'Choose proof image' : 'Pilih gambar bukti transfer')}
                              </span>
                              <span className="text-[10px] text-blue-700/80">PNG, JPG, WEBP · {isEn ? 'max' : 'maks.'} 5MB</span>
                            </button>
                          )}
                          <input
                            ref={proofInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleProofPicked}
                            className="hidden"
                          />

                          {proofFile && (
                            <div className="flex justify-end">
                              <button
                                type="button"
                                disabled={isUploadingProof}
                                onClick={handleSubmitProof}
                                className="px-4 py-2 bg-[#66000E] hover:bg-[#52000B] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-2xs transition cursor-pointer disabled:opacity-50 active:scale-98"
                              >
                                {isUploadingProof ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {isUploadingProof
                                  ? (isEn ? 'Sending...' : 'Mengirim...')
                                  : (isEn ? 'Send Payment Proof' : 'Kirim Bukti Bayar')}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* KONDISI 3: ACTIVE */}
                  {activeRequest.status === 'active' && (
                    <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                      <span className="text-emerald-800 font-semibold text-[11px]">
                        {isEn ? 'Connected to LapakQ Cloudflare Tunnel' : 'Terhubung ke Cloudflare Tunnel LapakQ'}
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
                        {isEn ? 'Includes DNS & SSL' : 'Termasuk DNS & SSL'}
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
                          <Loader2 className="w-4 h-4 animate-spin" /> {t('domain_btn_checking', isEn ? 'Checking...' : 'Memeriksa...')}
                        </>
                      ) : (
                        <>
                          <span>{t('domain_btn_check', isEn ? 'Check Availability' : 'Cek Ketersediaan')}</span> <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
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

