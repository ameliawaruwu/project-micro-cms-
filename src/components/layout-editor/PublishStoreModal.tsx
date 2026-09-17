import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Check,
  Share2,
  ShieldCheck,
  Server,
  Lock,
  Sparkles,
  CreditCard,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Store } from '../../types';
import { domainRequestService, DomainRequest } from '../../services/domainRequestService';
import { billingPlanService } from '../../services/billingPlanService';

interface PublishStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  onNavigateBilling?: () => void;
  onNavigateDomain?: () => void;
}

export const PublishStoreModal: React.FC<PublishStoreModalProps> = ({
  isOpen,
  onClose,
  store,
  onNavigateBilling,
  onNavigateDomain,
}) => {
  const [step, setStep] = useState<'checklist' | 'published'>('checklist');
  const [copied, setCopied] = useState(false);
  const [domainRequest, setDomainRequest] = useState<DomainRequest | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Load domain request status for this store
  useEffect(() => {
    if (!isOpen) return;
    setStep('checklist');
    domainRequestService.getRequestByStore(store.id).then((req) => {
      setDomainRequest(req);
    });
  }, [isOpen, store.id]);

  if (!isOpen) return null;

  const isFreePlan = !store.plan || store.plan === 'free' || store.plan === 'free_trial';
  const plans = billingPlanService.getPlans();
  const currentPlan = plans.find((p) => p.slug === store.plan) || plans[0];

  const hasActiveCustomDomain = !!(
    (store.customDomain && store.domainStatus === 'connected') ||
    domainRequest?.status === 'active' ||
    domainRequest?.status === 'paid'
  );

  const activeCustomDomainName =
    store.customDomain || domainRequest?.fullDomain || '';

  // Accessible URL for preview and publishing
  const liveStoreUrl = hasActiveCustomDomain
    ? `https://${activeCustomDomainName}`
    : `${window.location.origin}/${store.slug}`;

  const friendlyDisplayUrl = hasActiveCustomDomain
    ? activeCustomDomainName
    : `${store.slug}.kroomify.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveStoreUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo! Kunjungi toko online resmi kami "${store.name}" di: ${liveStoreUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleConfirmPublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setStep('published');
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200 text-left font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-[#E5E0DD] flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EBE5E2] bg-[#FAF7F7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              step === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#F5E8EA] text-[#66000E]'
            }`}>
              {step === 'published' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Globe className="w-5 h-5 text-[#66000E]" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#241A1A]">
                {step === 'published' ? 'Toko Berhasil Dipublikasikan' : 'Pemeriksaan Kesiapan & Publikasi'}
              </h2>
              <p className="text-[11px] text-[#706866]">
                {step === 'published'
                  ? 'Website toko Anda kini online dan dapat diakses pembeli'
                  : 'Verifikasi status paket langganan, domain, dan fitur transaksi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* ═══════════ STEP 1: CHECKLIST VERIFIKASI PRA-PUBLIKASI ═══════════ */}
          {step === 'checklist' && (
            <>
              {/* Intro banner */}
              {isFreePlan ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-900">
                      Publikasi &amp; Deploy Toko Terkunci pada Paket Free
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Toko Anda saat ini berada dalam mode editor/sandbox CMS. Untuk menerbitkan website toko online agar bisa diakses langsung oleh publik dan menerima transaksi, silakan upgrade ke <b>Paket Personal Toko</b> (Rp 350.000/tahun).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAF7F7] border border-[#EBE5E2] rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5F5652] leading-relaxed">
                    Sistem mengecek kelayakan toko Anda. Toko Anda siap dipublikasikan secara live ke internet.
                  </p>
                </div>
              )}

              {/* 3 Pillar Checklist Cards */}
              <div className="space-y-3">
                
                {/* 1. Paket Langganan Hosting & CMS */}
                <div className="p-3.5 rounded-xl border border-[#E5E0DD] bg-white shadow-2xs hover:border-[#66000E]/30 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isFreePlan ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[#241A1A]">
                            1. Paket Hosting &amp; CMS
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isFreePlan
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}>
                            {isFreePlan ? 'Paket Free (Gratis)' : `${currentPlan?.name} (Aktif)`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#706866] mt-0.5 leading-snug">
                          {isFreePlan
                            ? 'Shared hosting gratis Kroomify dengan watermark di footer. Tetap bisa live & berjualan via WhatsApp.'
                            : `Hosting server prioritas aktif (${currentPlan?.tagline}). Bebas watermark & white-label.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isFreePlan && onNavigateBilling && (
                    <div className="mt-2.5 pt-2.5 border-t border-dashed border-[#E5E0DD] flex items-center justify-between">
                      <span className="text-[10px] text-[#78350F] font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Tersedia Paket Personal (350k/thn) &amp; Community UMKM (1jt/thn)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateBilling();
                        }}
                        className="text-[11px] font-bold text-[#66000E] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>Upgrade</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Alamat Domain Toko */}
                <div className="p-3.5 rounded-xl border border-[#E5E0DD] bg-white shadow-2xs hover:border-[#66000E]/30 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-[#241A1A]">
                            2. Alamat Domain Toko
                          </h4>
                          {hasActiveCustomDomain ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              Custom Domain Aktif (SSL)
                            </span>
                          ) : domainRequest?.status === 'approved' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              Disetujui Admin - Menunggu Bayar
                            </span>
                          ) : domainRequest?.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                              Menunggu Review Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                              Subdomain Gratis (Siap Live)
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-[#706866] mt-0.5 leading-snug">
                          {hasActiveCustomDomain ? (
                            <span className="font-semibold text-emerald-700">
                              Domain https://{activeCustomDomainName} siap dikunjungi pelanggan.
                            </span>
                          ) : domainRequest?.status === 'approved' ? (
                            <span>
                              Domain <b>{domainRequest.fullDomain}</b> disetujui (Rp {domainRequest.price.toLocaleString('id-ID')}/thn). Toko sementara akan live di <b>{store.slug}.kroomify.com</b>.
                            </span>
                          ) : domainRequest?.status === 'pending' ? (
                            <span>
                              Domain <b>{domainRequest.fullDomain}</b> sedang dicek admin. Toko sementara live di <b>{store.slug}.kroomify.com</b>.
                            </span>
                          ) : (
                            <span>
                              Toko langsung live di subdomain <b>{store.slug}.kroomify.com</b> tanpa biaya tambahan.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {onNavigateDomain && (
                    <div className="mt-2.5 pt-2.5 border-t border-dashed border-[#E5E0DD] flex items-center justify-between">
                      <span className="text-[10px] text-[#706866]">
                        {hasActiveCustomDomain
                          ? 'Kelola pengaturan DNS domain toko'
                          : domainRequest?.status === 'approved'
                          ? 'Bayar invoice domain via Midtrans'
                          : 'Ingin domain sendiri (.com / .id / .online)?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateDomain();
                        }}
                        className="text-[11px] font-bold text-[#66000E] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>{domainRequest?.status === 'approved' ? 'Bayar Domain' : 'Menu Domain'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Integrasi Pembayaran & Ekspedisi */}
                <div className="p-3.5 rounded-xl border border-[#E5E0DD] bg-white shadow-2xs hover:border-[#66000E]/30 transition">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isFreePlan ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-[#241A1A]">
                          3. Transaksi &amp; Pengiriman
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isFreePlan
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isFreePlan ? 'Metode Manual (WhatsApp)' : 'Otomatis Siap (Midtrans & Biteship)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#706866] mt-0.5 leading-snug">
                        {isFreePlan
                          ? 'Pembeli memesan via tombol WhatsApp. Gateway otomatis QRIS/VA & cek ongkir terkunci pada Paket Free.'
                          : 'Gateway pembayaran otomatis QRIS/VA Bank & kalkulasi ongkir ekspedisi aktif di checkout pembeli.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Box URL Pratinjau Publikasi */}
              <div className="bg-[#FAF7F7] border border-[#EBE5E2] rounded-xl p-3.5 space-y-1.5">
                <span className="text-[10px] font-bold text-[#706866] uppercase tracking-wider block">
                  Link Publikasi Website Toko:
                </span>
                <div className="flex items-center justify-between bg-white border border-[#D5CEC8] rounded-lg p-2 gap-2 shadow-2xs">
                  <span className="text-xs font-semibold text-[#66000E] truncate select-all">
                    {liveStoreUrl}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 shrink-0">
                    Online
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ═══════════ STEP 2: SUKSES TERPUBLIKASIKAN ═══════════ */}
          {step === 'published' && (
            <div className="text-center space-y-5 py-2">
              {/* Animated Success Icon */}
              <div className="relative w-18 h-18 mx-auto">
                <div className="absolute inset-0 bg-emerald-100/80 rounded-full animate-ping opacity-30" />
                <div className="relative w-18 h-18 bg-emerald-50 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#241A1A]">
                  Selamat! Toko Online Anda Sudah Live
                </h3>
                <p className="text-xs text-[#706866] max-w-sm mx-auto leading-relaxed">
                  Perubahan tata letak terbaru untuk <span className="font-bold text-[#241A1A]">{store.name}</span> telah tersimpan di cloud dan dapat langsung dikunjungi oleh pembeli.
                </p>
              </div>

              {/* URL Box */}
              <div className="bg-[#FAF7F7] rounded-xl p-4 border border-[#EBE5E2] text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#706866] uppercase tracking-wider">
                    Alamat Link Toko
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hasActiveCustomDomain 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    {hasActiveCustomDomain ? 'Custom Domain' : 'Domain Default (Aktif)'}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white border border-[#D5CEC8] rounded-xl p-2.5 shadow-2xs gap-2">
                  <span className="text-xs font-semibold text-[#241A1A] truncate flex-1 select-all">
                    {liveStoreUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-[#241A1A]'
                    }`}
                    title="Salin Tautan"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#EBE5E2] bg-[#FAF7F7] shrink-0">
          {step === 'checklist' ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#706866] hover:text-[#241A1A] hover:bg-white rounded-xl transition cursor-pointer"
              >
                Batal
              </button>

              {isFreePlan ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateBilling) onNavigateBilling();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Upgrade Paket untuk Deploy Toko</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handleConfirmPublish}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mempublikasikan...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      <span>Konfirmasi &amp; Publikasikan Toko</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-800 text-xs font-bold transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Bagikan ke WhatsApp</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-[#706866] hover:text-[#241A1A] hover:bg-white rounded-xl transition cursor-pointer"
                >
                  Selesai
                </button>
                <a
                  href={liveStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] rounded-xl shadow-2xs transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kunjungi Toko</span>
                </a>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
