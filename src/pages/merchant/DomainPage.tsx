import React, { useState, useEffect } from 'react';
import { Store } from '../../types';
import { Globe, ArrowRight, CheckCircle2, Clock, Copy, Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { domainService } from '../../services/domainService';

interface DomainPageProps {
  store: Store;
}

export const DomainPage: React.FC<DomainPageProps> = ({ store }) => {
  const [domainType, setDomainType] = useState<'random' | 'custom'>(
    store.domainType || (store.customDomain ? 'custom' : 'random')
  );
  const [customDomain, setCustomDomain] = useState(store.customDomain || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSettingRandom, setIsSettingRandom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isConnected, setIsConnected] = useState(store.domainStatus === 'connected' && !!store.customDomain);

  const randomDomain = `${store.slug || 'toko'}.kroombox.site`;

  // Cek apakah domain custom yang sudah tersimpan aktif di Cloudflare Tunnel
  useEffect(() => {
    if (store.customDomain) {
      domainService.checkDomainStatus(store.customDomain).then((res) => {
        if (res.connected) {
          setIsConnected(true);
        }
      });
    }
  }, [store.customDomain]);

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
        setAlert({
          type: 'error',
          message: res.message,
        });
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

  const handleConnectCustomDomain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customDomain.trim()) {
      setAlert({
        type: 'error',
        message: 'Silakan masukkan nama domain Anda (contoh: www.tokosaya.com)',
      });
      return;
    }

    setIsConnecting(true);
    setAlert(null);

    try {
      const res = await domainService.connectCustomDomain(store.id, customDomain);
      if (res.success) {
        setIsConnected(true);
        setAlert({
          type: 'success',
          message: res.message,
        });
      } else {
        setAlert({
          type: 'error',
          message: res.message,
        });
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || 'Gagal menghubungkan domain ke Cloudflare Tunnel.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectDomain = async () => {
    if (!customDomain) return;
    setIsConnecting(true);
    setAlert(null);
    try {
      const res = await domainService.disconnectCustomDomain(store.id, customDomain);
      if (res.success) {
        setIsConnected(false);
        setCustomDomain('');
        setDomainType('random');
        setAlert({
          type: 'success',
          message: res.message,
        });
      } else {
        setAlert({
          type: 'error',
          message: res.message,
        });
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        message: err.message || 'Gagal memutuskan domain.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pengaturan Domain</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur alamat website toko online Anda agar pembeli dapat berkunjung dengan mudah.
          </p>
        </div>
      </div>

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
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{alert.message}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* RANDOM DOMAIN OPTION */}
        <div
          onClick={() => setDomainType('random')}
          className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
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
                <h3 className="font-semibold text-gray-900">Random Domain</h3>
                <p className="text-xs text-gray-500">Gratis dari sistem Kroombox</p>
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

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/70 mb-4 flex items-center justify-between gap-2">
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
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 rounded-md transition-colors"
                title="Salin tautan"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href={`https://${randomDomain}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200/60 rounded-md transition-colors"
                title="Buka toko"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              Tersedia & Aktif
            </div>
            {domainType === 'random' && (
              <button
                type="button"
                disabled={isSettingRandom}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseRandomDomain();
                }}
                className="text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors disabled:opacity-50"
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

        {/* CUSTOM DOMAIN OPTION */}
        <div
          onClick={() => setDomainType('custom')}
          className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
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
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Custom Domain</h3>
                <p className="text-xs text-gray-500">Gunakan domain sendiri (Contoh: toko.id)</p>
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
            <form onSubmit={handleConnectCustomDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Domain Anda</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => {
                    setCustomDomain(e.target.value);
                    setIsConnected(false);
                  }}
                  placeholder="Contoh: amelia.id atau www.namatoko.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm"
                />
              </div>

              <div className="bg-blue-50/80 text-blue-900 p-3.5 rounded-xl text-xs leading-relaxed border border-blue-200/70">
                <p className="font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" /> Panduan DNS Cloudflare:
                </p>
                <p className="text-blue-800">
                  Tambahkan record di penyedia domain Anda (Niagahoster, Domainesia, Cloudflare):
                </p>
                <div className="mt-2 font-mono bg-white/80 p-2 rounded border border-blue-200 text-[11px] text-blue-900">
                  <strong>Type:</strong> CNAME &nbsp;|&nbsp; <strong>Name:</strong> www atau @ &nbsp;|&nbsp; <strong>Target:</strong> deploy.kroombox.online
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  {isConnected ? (
                    <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Terhubung ke Cloudflare
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Belum terhubung
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isConnected && (
                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={handleDisconnectDomain}
                      className="text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Putuskan
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="bg-gray-900 hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow hover:shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Menghubungkan...
                      </>
                    ) : isConnected ? (
                      'Perbarui'
                    ) : (
                      'Hubungkan'
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 mb-6 h-[46px] flex items-center">
              <p className="text-sm text-gray-400 font-normal">
                {customDomain || 'Contoh: www.namatoko.com'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
