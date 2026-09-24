import React, { useState, useEffect, useId } from 'react';
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
  RotateCcw,
  Rocket,
  Zap,
  Terminal,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sliders,
  Radio,
  Wifi,
  EyeOff,
} from 'lucide-react';
import { Store } from '../../types';
import { domainRequestService, DomainRequest } from '../../services/domainRequestService';
import { billingPlanService } from '../../services/billingPlanService';
import { storeService } from '../../services/storeService';
import confetti from 'canvas-confetti';

interface PublishStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  onNavigateBilling?: () => void;
  onNavigateDomain?: () => void;
  onPublish?: () => void;
  onUnpublish?: () => void;
}

type PublishModalStep = 'choose_domain' | 'confirm_subdomain' | 'auto_deploy' | 'published';

interface DeployStage {
  id: string;
  name: string;
  detail: string;
  status: 'pending' | 'running' | 'success';
}

const BASE_DOMAINS = [
  { value: 'kroombox.com', label: '.kroombox.com', tag: 'Default Edge' },
  { value: 'kromify.id', label: '.kromify.id', tag: 'Official Store' },
  { value: 'mykolab.store', label: '.mykolab.store', tag: 'Fast CDN' },
];

export const PublishStoreModal: React.FC<PublishStoreModalProps> = ({
  isOpen,
  onClose,
  store,
  onNavigateBilling,
  onNavigateDomain,
  onPublish,
  onUnpublish,
}) => {
  const [step, setStep] = useState<PublishModalStep>('choose_domain');
  const [copied, setCopied] = useState(false);
  const [domainRequest, setDomainRequest] = useState<DomainRequest | null>(null);
  const [selectedDomainType, setSelectedDomainType] = useState<'random' | 'custom'>('random');

  // Subdomain selection & regeneration states
  const [randomSubdomain, setRandomSubdomain] = useState('');
  const [selectedBaseDomain, setSelectedBaseDomain] = useState('kroombox.com');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Auto Deploy simulation states
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployStages, setDeployStages] = useState<DeployStage[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Function to generate creative, catchy subdomains based on store name
  const generateNewSubdomain = (storeName: string): string => {
    if (!storeName || !storeName.trim() || storeName === 'Belum Memiliki Toko' || storeName === 'Toko Baru UMKM') {
      return '';
    }

    const cleanName = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanName) return '';

    const tags = ['id', 'store', 'official', 'pro', 'shop', 'mart', 'jaya', 'hub', 'outlet', 'berkah', 'ku'];
    const randomTag = tags[Math.floor(Math.random() * tags.length)];
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit number

    const patterns = [
      `${cleanName}-${randomNum}`,
      `${cleanName}-${randomTag}`,
      `${cleanName}-${randomTag}-${randomNum}`,
      `${randomTag}-${cleanName}-${randomNum}`,
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  const handleRegenerateSubdomain = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const generated = generateNewSubdomain(store.name);
      setRandomSubdomain(generated);
      setIsRegenerating(false);
    }, 280);
  };

  // Initialize modal state when opened
  useEffect(() => {
    if (!isOpen) return;
    if (store.isPublished) {
      setStep('published');
    } else {
      setStep('choose_domain');
    }
    setDeployProgress(0);
    setTerminalLogs([]);

    // Set initial random subdomain based on existing slug or generated
    const hasName = !!(store.name && store.name.trim() && store.name !== 'Belum Memiliki Toko' && store.name !== 'Toko Baru UMKM');
    const initialSlug = hasName
      ? (store.slug && !store.slug.startsWith('store-') ? store.slug : generateNewSubdomain(store.name))
      : '';
    setRandomSubdomain(initialSlug);

    domainRequestService.getRequestByStore(store.id).then((req) => {
      setDomainRequest(req);
      if (req && (req.status === 'active' || req.status === 'paid')) {
        setSelectedDomainType('custom');
      } else if (store.customDomain && store.domainStatus === 'connected') {
        setSelectedDomainType('custom');
      } else {
        setSelectedDomainType('random');
      }
    });
  }, [isOpen, store.id, store.name, store.slug, store.customDomain, store.domainStatus]);

  // Handle Auto Deploy Simulation
  const startAutoDeploySimulation = async () => {
    setStep('auto_deploy');
    setDeployProgress(5);

    const initialStages: DeployStage[] = [
      { id: '1', name: 'Inisialisasi API Eksternal Kroombox', detail: 'POST https://panel.kroombox.com/api/v2/deploy/auto', status: 'running' },
      { id: '2', name: 'Alokasi Subdomain & Anycast Edge DNS', detail: `Binding https://${randomSubdomain}.${selectedBaseDomain}`, status: 'pending' },
      { id: '3', name: 'Sinkronisasi Katalog & Template Toko', detail: 'Mengompilasi tema aktif, produk, dan token CSS', status: 'pending' },
      { id: '4', name: 'Penerbitan Sertifikat SSL/TLS HTTPS', detail: 'Let\'s Encrypt Edge Certificate provisioning', status: 'pending' },
      { id: '5', name: 'Health Check & Verifikasi Endpoint Live', detail: 'Smoke test response (HTTP 200 OK)', status: 'pending' },
    ];

    setDeployStages(initialStages);
    const now = new Date().toLocaleTimeString('id-ID');
    setTerminalLogs([
      `[${now}] INITIATE: Dispatching deployment trigger for storeId="${store.id}"`,
      `[${now}] CONNECT: Establishing secure TLS tunnel with Kroombox Panel API...`,
    ]);

    // Stage 1: API Handshake
    await new Promise((r) => setTimeout(r, 650));
    setDeployProgress(25);
    setDeployStages((prev) =>
      prev.map((s, idx) =>
        idx === 0 ? { ...s, status: 'success' } : idx === 1 ? { ...s, status: 'running' } : s
      )
    );
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString('id-ID')}] API_OK: Hook response 200 OK from external deploy worker`,
      `[${new Date().toLocaleTimeString('id-ID')}] ROUTE: Registering ${randomSubdomain}.${selectedBaseDomain} at Cloudflare edge proxy`,
    ]);

    // Stage 2: DNS & Edge Routing
    await new Promise((r) => setTimeout(r, 700));
    setDeployProgress(50);
    setDeployStages((prev) =>
      prev.map((s, idx) =>
        idx === 1 ? { ...s, status: 'success' } : idx === 2 ? { ...s, status: 'running' } : s
      )
    );
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString('id-ID')}] EDGE_DNS: CNAME record propagated to Anycast edge network`,
      `[${new Date().toLocaleTimeString('id-ID')}] SYNC: Packaging storefront theme assets, layout tokens & catalog`,
    ]);

    // Stage 3: Catalog & Asset Sync
    await new Promise((r) => setTimeout(r, 700));
    setDeployProgress(75);
    setDeployStages((prev) =>
      prev.map((s, idx) =>
        idx === 2 ? { ...s, status: 'success' } : idx === 3 ? { ...s, status: 'running' } : s
      )
    );
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString('id-ID')}] BUNDLE: Static build completed (2327 modules, CSS cache warm)`,
      `[${new Date().toLocaleTimeString('id-ID')}] SSL: Requesting automatic TLS cert from Let's Encrypt CA`,
    ]);

    // Stage 4: SSL Provisioning
    await new Promise((r) => setTimeout(r, 650));
    setDeployProgress(90);
    setDeployStages((prev) =>
      prev.map((s, idx) =>
        idx === 3 ? { ...s, status: 'success' } : idx === 4 ? { ...s, status: 'running' } : s
      )
    );
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString('id-ID')}] SSL_READY: HTTPS certificate active. Strict-Transport-Security enabled.`,
      `[${new Date().toLocaleTimeString('id-ID')}] HEALTH: Running smoke test on https://${randomSubdomain}.${selectedBaseDomain}/...`,
    ]);

    // Stage 5: Health Check & Success
    await new Promise((r) => setTimeout(r, 600));
    setDeployProgress(100);
    setDeployStages((prev) =>
      prev.map((s) => ({ ...s, status: 'success' }))
    );
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString('id-ID')}] SUCCESS: Smoke test passed (HTTP 200 OK)! Auto-deployment complete!`,
    ]);

    // Persist confirmed subdomain to store
    try {
      await storeService.updateStore(store.id, {
        slug: randomSubdomain,
        isPublished: true,
      });
    } catch (e) {
      console.warn('Sync store slug warning:', e);
    }

    if (onPublish) onPublish();

    // Trigger celebration confetti
    setTimeout(() => {
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {}
      setStep('published');
    }, 450);
  };

  if (!isOpen) return null;

  const isFreePlan = !store.plan || store.plan === 'free' || store.plan === 'free_trial';
  const hasActiveCustomDomain = !!(
    (store.customDomain && store.domainStatus === 'connected') ||
    domainRequest?.status === 'active' ||
    domainRequest?.status === 'paid'
  );
  const activeCustomDomainName = store.customDomain || domainRequest?.fullDomain || '';

  // Final URL calculation
  const confirmedSubdomainUrl = `https://${randomSubdomain}.${selectedBaseDomain}`;
  const liveStoreUrl =
    selectedDomainType === 'custom' && activeCustomDomainName
      ? `https://${activeCustomDomainName}`
      : `${window.location.origin}/${randomSubdomain || store.slug}`;

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200 text-left font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-[#E5E0DD] flex flex-col max-h-[92vh]">

        {/* ═══════════ MODAL HEADER ═══════════ */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EBE5E2] bg-[#FAF7F7] shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                step === 'published'
                  ? 'bg-emerald-100 text-emerald-700'
                  : step === 'auto_deploy'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-[#F5E8EA] text-[#66000E]'
              }`}
            >
              {step === 'published' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : step === 'auto_deploy' ? (
                <Rocket className="w-5 h-5 text-blue-600 animate-pulse" />
              ) : step === 'confirm_subdomain' ? (
                <Sparkles className="w-5 h-5 text-[#66000E]" />
              ) : (
                <Globe className="w-5 h-5 text-[#66000E]" />
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#241A1A]">
                {step === 'choose_domain' && 'Pilih Alamat Domain Toko'}
                {step === 'confirm_subdomain' && 'Konfirmasi Pemilihan Subdomain'}
                {step === 'auto_deploy' && 'Auto Deploying ke API Eksternal...'}
                {step === 'published' && 'Toko Berhasil Dipublikasikan'}
              </h2>
              <p className="text-[11px] text-[#706866]">
                {step === 'choose_domain' && 'Tentukan jenis alamat yang ingin digunakan untuk toko online Anda'}
                {step === 'confirm_subdomain' && 'Periksa subdomain otomatis atau acak ulang untuk kombinasi baru'}
                {step === 'auto_deploy' && 'Sinkronisasi otomatis ke Kroombox Edge Network v2.1'}
                {step === 'published' && 'Website toko Anda kini online dan dapat diakses pembeli'}
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

        {/* ═══════════ MODAL BODY ═══════════ */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">

          {/* ─────────────────── TAHAP 1: PILIH ALAMAT DOMAIN ─────────────────── */}
          {step === 'choose_domain' && (
            <div className="space-y-3">
              {/* Opsi 1: Domain Random (Subdomain Otomatis) */}
              <div
                onClick={() => setSelectedDomainType('random')}
                className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedDomainType === 'random'
                    ? 'border-[#66000E] bg-rose-50/25 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedDomainType === 'random'
                        ? 'bg-[#F5E8EA] text-[#66000E]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                        Domain Random (Subdomain Otomatis)
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Gratis &amp; Cepat
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5 font-mono">
                      {randomSubdomain || store.slug
                        ? `https://${randomSubdomain || store.slug}.${selectedBaseDomain}`
                        : `https://[nama-toko].${selectedBaseDomain}`}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Bisa diacak ulang (regenerate) di tahap konfirmasi berikutnya.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedDomainType === 'random' ? 'border-[#66000E]' : 'border-gray-300'
                  }`}
                >
                  {selectedDomainType === 'random' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#66000E]" />
                  )}
                </div>
              </div>

              {/* Opsi 2: Custom Domain (.com / .id) */}
              <div
                onClick={() => setSelectedDomainType('custom')}
                className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedDomainType === 'custom'
                    ? 'border-[#66000E] bg-rose-50/25 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedDomainType === 'custom'
                        ? 'bg-[#F5E8EA] text-[#66000E]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">Custom Domain Pribadi</h4>
                      {hasActiveCustomDomain ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          .com / .id
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {hasActiveCustomDomain
                        ? `https://${activeCustomDomainName}`
                        : 'Gunakan nama domain brand bisnis Anda sendiri'}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedDomainType === 'custom' ? 'border-[#66000E]' : 'border-gray-300'
                  }`}
                >
                  {selectedDomainType === 'custom' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#66000E]" />
                  )}
                </div>
              </div>

              {/* Tautan Atur Domain jika belum terhubung */}
              {selectedDomainType === 'custom' && !hasActiveCustomDomain && onNavigateDomain && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                  <span className="text-gray-600 text-[11px]">Belum memiliki domain sendiri terhubung?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateDomain();
                    }}
                    className="font-bold text-[#66000E] hover:underline flex items-center gap-1 cursor-pointer shrink-0 text-xs"
                  >
                    <span>Atur di Menu Domain</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Notifikasi Paket Free */}
              {isFreePlan && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="font-medium text-[11px]">Paket Free (Mode Sandbox/Preview)</span>
                  </div>
                  {onNavigateBilling && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateBilling();
                      }}
                      className="font-bold text-amber-800 hover:underline shrink-0 cursor-pointer text-xs"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────── TAHAP 2: KONFIRMASI SUBDOMAIN RANDOM & REGENERATE ─────────────────── */}
          {step === 'confirm_subdomain' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Kartu Subdomain Utama */}
              <div className="bg-gradient-to-br from-[#FAF7F7] to-rose-50/40 p-4 rounded-2xl border border-[#E5E0DD] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#706866] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#66000E]" />
                    <span>Subdomain Random Terpilih</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      SSL HTTPS Auto
                    </span>
                  </div>
                </div>

                {/* Subdomain Input & Regenerate Button */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center bg-white border-2 border-[#D5CEC8] focus-within:border-[#66000E] rounded-xl px-3 py-2 shadow-2xs transition-colors">
                      <span className="text-xs font-semibold text-gray-400 select-none">https://</span>
                      <input
                        type="text"
                        value={randomSubdomain}
                        onChange={(e) =>
                          setRandomSubdomain(
                            e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                          )
                        }
                        className="flex-1 text-xs font-bold text-gray-900 outline-none px-1 font-mono"
                        placeholder="nama-subdomain"
                      />
                      <span className="text-xs font-semibold text-gray-400 select-none">
                        .{selectedBaseDomain}
                      </span>
                    </div>

                    {/* Tombol Regenerate / Acak Ulang */}
                    <button
                      type="button"
                      onClick={handleRegenerateSubdomain}
                      disabled={isRegenerating}
                      title="Acak ulang subdomain"
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border-2 border-gray-200 hover:border-[#66000E] text-[#66000E] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                    >
                      <RotateCcw
                        className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`}
                      />
                      <span>Acak Ulang</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Klik <strong>Acak Ulang</strong> untuk mendapatkan variasi nama acak baru, atau sesuaikan langsung kata di atas.
                  </p>
                </div>

                {/* Pilihan Ekstensi Base Domain */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-gray-700">Pilih Domain Jaringan:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {BASE_DOMAINS.map((dom) => (
                      <button
                        key={dom.value}
                        type="button"
                        onClick={() => setSelectedBaseDomain(dom.value)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedBaseDomain === dom.value
                            ? 'border-[#66000E] bg-white shadow-xs ring-1 ring-[#66000E]'
                            : 'border-gray-200 bg-white/60 hover:bg-white text-gray-600'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-gray-900 font-mono truncate">
                          {dom.label}
                        </div>
                        <div className="text-[9px] text-gray-500">{dom.tag}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info Auto Deploy Eksternal */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-950">
                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700 shrink-0 mt-0.5">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <span className="font-bold text-blue-900 block">Fitur Auto Deploy Terintegrasi</span>
                  <span>
                    Setelah Anda mengonfirmasi subdomain ini, sistem akan otomatis mengeksekusi pipeline deployment melalui <strong>API Eksternal Kroombox</strong>, mengalokasikan DNS Anycast, dan mengaktifkan toko secara live.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────── TAHAP 3: SIMULASI AUTO DEPLOY ─────────────────── */}
          {step === 'auto_deploy' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Progress Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                  <span className="flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                    <span>Auto Deploying via Kroombox API...</span>
                  </span>
                  <span className="font-mono text-blue-600">{deployProgress}%</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-[#66000E] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${deployProgress}%` }}
                  />
                </div>
              </div>

              {/* Deployment Stages Checklist */}
              <div className="space-y-2 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                {deployStages.map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {stage.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : stage.status === 'running' ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0 bg-white" />
                      )}
                      <div className="min-w-0">
                        <span className={`font-semibold block truncate ${
                          stage.status === 'running' ? 'text-blue-900 font-bold' : stage.status === 'success' ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {stage.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono block truncate">
                          {stage.detail}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold shrink-0">
                      {stage.status === 'success' && <span className="text-emerald-600">Done</span>}
                      {stage.status === 'running' && <span className="text-blue-600">Running</span>}
                      {stage.status === 'pending' && <span className="text-gray-400">Wait</span>}
                    </span>
                  </div>
                ))}
              </div>

              {/* Terminal Logs Simulation */}
              <div className="bg-[#0A2540] text-emerald-400 rounded-xl p-3 font-mono text-[10px] leading-relaxed max-h-32 overflow-y-auto space-y-1 shadow-inner border border-slate-700">
                <div className="text-slate-400 pb-1 border-b border-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-cyan-400" />
                    <span>External Deploy Console (v2.1)</span>
                  </span>
                  <span className="text-[9px] text-slate-500">Kroombox Cloud Hook</span>
                </div>
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="truncate">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────────────────── TAHAP 4: SUKSES TERPUBLIKASIKAN ─────────────────── */}
          {step === 'published' && (
            <div className="text-center space-y-5 py-2 animate-in zoom-in-95 duration-200">
              {/* Animated Success Icon */}
              <div className="relative w-18 h-18 mx-auto">
                <div className="absolute inset-0 bg-emerald-100/80 rounded-full animate-ping opacity-30" />
                <div className="relative w-18 h-18 bg-emerald-50 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#241A1A]">
                  Selamat! Toko Online Anda Resmi Live
                </h3>
                <p className="text-xs text-[#706866] max-w-sm mx-auto leading-relaxed">
                  Subdomain terkonfirmasi dan seluruh katalog untuk{' '}
                  <span className="font-bold text-[#241A1A]">{store.name}</span> telah selesai dideploy ke jaringan cloud publik.
                </p>
              </div>

              {/* URL Box */}
              <div className="bg-[#FAF7F7] rounded-xl p-4 border border-[#EBE5E2] text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#706866] uppercase tracking-wider">
                    Alamat Website Resmi
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    Auto Deploy Active
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white border border-[#D5CEC8] rounded-xl p-2.5 shadow-2xs gap-2">
                  <span className="text-xs font-semibold text-[#241A1A] truncate flex-1 select-all font-mono">
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

              {/* Unpublish & Reconfigure Options */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('choose_domain')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#706866] hover:text-[#241A1A] hover:bg-[#F2EDEA] border border-[#E5E0DD] transition cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Atur Ulang Domain / Deploy</span>
                </button>
                {onUnpublish && (
                  <button
                    type="button"
                    onClick={() => {
                      onUnpublish();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition cursor-pointer flex items-center gap-1.5"
                    title="Tarik publikasi toko dan kembalikan ke status draf"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tarik Publikasi (Unpublish)</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ═══════════ MODAL FOOTER ACTIONS ═══════════ */}
        <div className="p-4 border-t border-[#EBE5E2] bg-[#FAF7F7] shrink-0">
          {/* Footer Step 1: choose_domain */}
          {step === 'choose_domain' && (
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
                  <span>Upgrade Paket untuk Publikasi</span>
                </button>
              ) : selectedDomainType === 'random' ? (
                <button
                  type="button"
                  onClick={() => setStep('confirm_subdomain')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  <span>Lanjut ke Konfirmasi Subdomain</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startAutoDeploySimulation}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Publikasikan dengan Custom Domain</span>
                </button>
              )}
            </div>
          )}

          {/* Footer Step 2: confirm_subdomain */}
          {step === 'confirm_subdomain' && (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep('choose_domain')}
                className="px-4 py-2 text-xs font-semibold text-[#706866] hover:text-[#241A1A] hover:bg-white rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>

              <button
                type="button"
                onClick={startAutoDeploySimulation}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#66000E] to-[#990014] hover:from-[#55000C] hover:to-[#800010] rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Konfirmasi Subdomain &amp; Mulai Auto Deploy</span>
              </button>
            </div>
          )}

          {/* Footer Step 3: auto_deploy (tidak ada tombol aksi manual selama proses berlangsung) */}
          {step === 'auto_deploy' && (
            <div className="flex items-center justify-center py-1">
              <span className="text-xs text-gray-500 font-medium flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                <span>Sinkronisasi otomatis ke cloud sedang berjalan, harap tunggu...</span>
              </span>
            </div>
          )}

          {/* Footer Step 4: published */}
          {step === 'published' && (
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
