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
} from 'lucide-react';
import { domainService } from '../../services/domainService';
import {
  domainRequestService,
  DomainRequest,
  DOMAIN_TLD_PRICES,
} from '../../services/domainRequestService';
import { midtransService } from '../../services/midtransService';
import { formatRupiah } from '../../utils/formatters';
import confetti from 'canvas-confetti';

interface DomainPageProps {
  store: Store;
}

export const DomainPage: React.FC<DomainPageProps> = ({ store }) => {
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

  const randomDomain = `${store.slug || 'toko'}.kroomify.com`;

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
    navigator.clipboard.writeText(`https://${randomDomain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseRandomDomain = async () => {
    setIsSettingRandom(true);
    setAlert(null);
    try {
      const res = await domainService.useRandomDomain(store.id);
      if (res.success) {
        setDomainType('random');
        setAlert({
          type: 'success',
          message: `Berhasil menggunakan domain sistem: https://${randomDomain}`,
        });
      } else {
        setAlert({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || 'Terjadi kesalahan saat mengaktifkan random domain.',
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
        message: 'Silakan masukkan nama domain yang diinginkan (hanya huruf, angka, atau tanda minus).',
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
        message: err.message || 'Gagal mengajukan permintaan domain.',
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
              message: `Selamat! Pembayaran berhasil dan domain ${activeRequest.fullDomain} resmi aktif di toko Anda!`,
            });
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          },
          onPending: async () => {
            setIsPaying(false);
            setAlert({
              type: 'info',
              message: 'Pembayaran invoice domain sedang diverifikasi oleh sistem.',
            });
          },
          onError: () => {
            setIsPaying(false);
            setAlert({ type: 'error', message: 'Pembayaran dibatalkan atau gagal.' });
          },
          onClose: () => {
            setIsPaying(false);
          },
        }
      );
    } catch (err: any) {
      console.warn('Fallback simulated payment for domain:', err);
      await domainRequestService.markAsPaidAndActivate(activeRequest.id);
      await domainService.connectCustomDomain(store.id, activeRequest.fullDomain);
      await loadDomainRequest();
      setIsConnected(true);
      setIsPaying(false);
      setAlert({
        type: 'success',
        message: `Pembayaran berhasil disimulasikan! Domain ${activeRequest.fullDomain} aktif.`,
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
        setAlert({ type: 'success', message: res.message });
      } else {
        setAlert({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message || 'Gagal memutuskan domain.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-red-600" />
            Pengaturan Alamat Domain Toko
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gunakan domain gratis bawaan dari Kroomify atau ajukan custom domain profesional Anda sendiri.
          </p>
        </div>
      </div>

      {/* ALERT NOTIFICATION */}
      {alert && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start gap-3 border transition-all ${
            alert.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : alert.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          ) : alert.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{alert.message}</div>
        </div>
      )}

      {/* 2 MAIN CARDS: RANDOM VS CUSTOM DOMAIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* CARD 1: RANDOM DOMAIN (GRATIS) */}
        <div
          onClick={() => setDomainType('random')}
          className={`bg-white rounded-2xl border-2 p-6 transition-all cursor-pointer shadow-xs ${
            domainType === 'random'
              ? 'border-red-600 shadow-md ring-4 ring-red-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  domainType === 'random' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Random Subdomain</h3>
                <p className="text-xs text-gray-500">Gratis selamanya dari sistem</p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                domainType === 'random' ? 'border-red-600' : 'border-gray-300'
              }`}
            >
              {domainType === 'random' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              <span className="text-gray-400 font-normal">https://</span>
              {randomDomain}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyRandomDomain();
                }}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-md transition-colors"
                title="Salin tautan"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={`https://${randomDomain}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-md transition-colors"
                title="Buka toko"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              Tersedia & Siap Pakai
            </div>
            {domainType === 'random' && (
              <button
                type="button"
                disabled={isSettingRandom}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseRandomDomain();
                }}
                className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSettingRandom ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    Gunakan Domain <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: CUSTOM DOMAIN */}
        <div
          onClick={() => setDomainType('custom')}
          className={`bg-white rounded-2xl border-2 p-6 transition-all cursor-pointer shadow-xs ${
            domainType === 'custom'
              ? 'border-red-600 shadow-md ring-4 ring-red-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  domainType === 'custom' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Custom Domain</h3>
                <p className="text-xs text-gray-500">Miliki alamat brand sendiri (.com, .id, dll)</p>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                domainType === 'custom' ? 'border-red-600' : 'border-gray-300'
              }`}
            >
              {domainType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
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
                      ? 'bg-red-50/80 border-red-200 text-red-900'
                      : 'bg-green-50/80 border-green-200 text-green-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-sm">
                      <Globe className="w-4 h-4" /> {activeRequest.fullDomain}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold ${
                        activeRequest.status === 'pending'
                          ? 'bg-amber-200 text-amber-800'
                          : activeRequest.status === 'approved'
                          ? 'bg-blue-200 text-blue-800'
                          : activeRequest.status === 'rejected'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-green-200 text-green-800'
                      }`}
                    >
                      {activeRequest.status === 'pending'
                        ? 'Menunggu Review Admin'
                        : activeRequest.status === 'approved'
                        ? 'Disetujui Admin'
                        : activeRequest.status === 'rejected'
                        ? 'Tidak Tersedia'
                        : 'Domain Aktif'}
                    </span>
                  </div>

                  {activeRequest.adminNotes && (
                    <p className="leading-relaxed opacity-90">{activeRequest.adminNotes}</p>
                  )}

                  {/* KONDISI 1: REJECTED (Tampilkan Saran Domain Alternatif dari Admin) */}
                  {activeRequest.status === 'rejected' && activeRequest.adminSuggestions && activeRequest.adminSuggestions.length > 0 && (
                    <div className="pt-2 border-t border-red-200/70">
                      <p className="font-semibold mb-1.5 text-red-950">Saran Domain yang Tersedia:</p>
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
                            className="px-2.5 py-1 bg-white hover:bg-red-100/60 border border-red-300 rounded-lg text-red-800 font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                          >
                            <span>{sug}</span>
                            <ArrowRight className="w-3 h-3 text-red-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* KONDISI 2: APPROVED (Tampilkan Invoice & Tombol Bayar) */}
                  {activeRequest.status === 'approved' && (
                    <div className="pt-2 border-t border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[11px] text-blue-700 block">Total Tagihan Domain (1 Tahun):</span>
                        <span className="text-base font-black text-blue-950">
                          {formatRupiah(activeRequest.price)}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={isPaying}
                        onClick={handlePayDomainInvoice}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {isPaying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" /> Bayar via Midtrans
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* KONDISI 3: ACTIVE */}
                  {activeRequest.status === 'active' && (
                    <div className="pt-2 border-t border-green-200 flex justify-between items-center">
                      <span className="text-green-800 font-semibold text-[11px]">
                        Terhubung ke Cloudflare Tunnel Kroomify
                      </span>
                      <button
                        type="button"
                        onClick={handleDisconnectDomain}
                        className="text-xs text-red-600 hover:text-red-700 font-bold underline cursor-pointer"
                      >
                        Putuskan
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* FORM PENGAJUAN DOMAIN BARU */}
              <form onSubmit={handleRequestDomain} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Cari & Ajukan Nama Domain Toko
                  </label>
                  <div className="flex rounded-xl shadow-xs border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500">
                    <input
                      type="text"
                      value={domainPrefix}
                      onChange={(e) => setDomainPrefix(e.target.value.toLowerCase())}
                      placeholder="contoh: tokoroti-jaya"
                      className="flex-1 px-3.5 py-2.5 text-sm outline-none font-medium text-gray-900 bg-white"
                    />
                    <select
                      value={selectedTld}
                      onChange={(e) => setSelectedTld(e.target.value)}
                      className="px-3 py-2.5 text-sm font-bold bg-gray-100 text-gray-800 border-l border-gray-300 outline-none cursor-pointer hover:bg-gray-200/70"
                    >
                      {Object.entries(DOMAIN_TLD_PRICES).map(([tld, info]) => (
                        <option key={tld} value={tld}>
                          {tld} ({info.label})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* INFO HARGA DAN ESTIMASI */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Estimasi Biaya Domain:</span>
                    <span className="font-extrabold text-gray-900 text-sm">
                      {DOMAIN_TLD_PRICES[selectedTld]?.label || 'Rp 250.000 / thn'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Siklus: 1 Tahun Penuh</span>
                    <span className="text-[11px] text-green-700 font-bold">Include DNS & SSL</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting || !domainPrefix.trim()}
                    className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow hover:shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Mengajukan...
                      </>
                    ) : (
                      <>
                        Ajukan Permintaan Domain <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs text-gray-400">
              Pilih opsi ini untuk mengajukan domain resmi (.com, .id, .online, .org, .top).
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
