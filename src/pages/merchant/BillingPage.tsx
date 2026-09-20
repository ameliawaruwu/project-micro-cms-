import React, { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  CreditCard,
  QrCode,
  ArrowRight,
  FileText,
  Download,
  X,
  Clock,
  RefreshCw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Store as StoreType, BillingPlan, BillingSubscription } from '../../types';
import { storeService } from '../../services/storeService';
import { midtransService } from '../../services/midtransService';
import { billingPlanService } from '../../services/billingPlanService';
import { formatRupiah } from '../../utils/formatters';
import { BillingInvoiceModal } from '../../components/billing/BillingInvoiceModal';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { useLanguage } from '../../contexts/LanguageContext';

interface BillingPageProps {
  store: StoreType;
  onUpdateStore: (updated: StoreType) => void;
  onShowNotification?: (msg: string) => void;
  onNavigateDashboard?: () => void;
}

interface InvoiceItem {
  id: string;
  plan: string;
  cycle: string;
  date: string;
  amount: number;
  status: string;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'INV-2026-001',
    plan: 'Paket Pro UMKM',
    cycle: 'Bulanan',
    date: '11 Sep 2026',
    amount: 99000,
    status: 'Lunas (Midtrans)',
  },
];

const PLAN_NAME_MAP: Record<string, string> = {
  'Starter (Gratis)': 'Starter (Free)',
  'Pro UMKM': 'Pro UMKM',
  'Bisnis Scale-Up': 'Business Scale-Up',
  'Paket Pro UMKM': 'Pro UMKM Plan',
  'Paket Starter (Gratis)': 'Starter (Free) Plan',
  'Paket Bisnis Scale-Up': 'Business Scale-Up Plan',
};

const PLAN_TAGLINE_MAP: Record<string, string> = {
  'Cocok untuk toko baru yang mulai berjualan online': 'Suitable for new stores starting to sell online',
  'Fitur lengkap tanpa batas untuk meningkatkan omset toko': 'Full unlimited features to boost store revenue',
  'Untuk bisnis UMKM berkembang dengan tim & cabang': 'For growing businesses with teams & branches',
};

const PLAN_FEATURE_MAP: Record<string, string> = {
  'Katalog produk hingga 25 item': 'Product catalog up to 25 items',
  'Checkout otomatis via Midtrans (QRIS & VA)': 'Automated checkout via Midtrans (QRIS & VA)',
  'Cek ongkir otomatis ekspedisi (J&T, JNE)': 'Automated shipping rate check (J&T, JNE)',
  'Watermark resmi Kroomify di footer toko': 'Official Kroomify watermark in store footer',
  'Unlimited katalog produk & varian': 'Unlimited product catalog & variants',
  'Bebas watermark (white-label brand sendiri)': 'Watermark free (your own white-label brand)',
  'Semua metode pembayaran Midtrans (QRIS, VA Bank, Kartu Kredit)': 'All Midtrans payment methods (QRIS, VA Bank, Credit Card)',
  'Visual layout builder & kustomisasi banner toko': 'Visual layout builder & store banner customization',
  'Cetak label pengiriman thermal massal': 'Bulk thermal shipping label printing',
  'Laporan analitik penjualan & omset real-time': 'Real-time sales & turnover analytics report',
  'Prioritas bantuan customer support': 'Priority customer support assistance',
  'Semua fitur paket Pro UMKM': 'All features in Pro UMKM plan',
  'Akses multi-staf pengelola toko (hingga 5 admin)': 'Multi-staff store access (up to 5 admins)',
  'Dukungan custom domain toko (.com / .id)': 'Custom store domain support (.com / .id)',
  'Notifikasi otomatis WhatsApp bot ke pembeli': 'Automated WhatsApp bot notifications to buyers',
  'Dedicated Account Manager 24/7': 'Dedicated Account Manager 24/7',
};

export const BillingPage: React.FC<BillingPageProps> = ({
  store,
  onUpdateStore,
  onShowNotification,
  onNavigateDashboard,
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const getPlanName = (name: string) => (isEn && PLAN_NAME_MAP[name] ? PLAN_NAME_MAP[name] : name);
  const getPlanTagline = (tagline: string) => (isEn && PLAN_TAGLINE_MAP[tagline] ? PLAN_TAGLINE_MAP[tagline] : tagline);
  const getPlanFeature = (feat: string) => (isEn && PLAN_FEATURE_MAP[feat] ? PLAN_FEATURE_MAP[feat] : feat);

  const [plans, setPlans] = useState<BillingPlan[]>(billingPlanService.getActivePlans());
  const billingCycle = 'yearly';
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<BillingPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Active Pending Subscription if merchant has an unpaid bill
  const [pendingSubscription, setPendingSubscription] = useState<BillingSubscription | null>(() => {
    return billingPlanService.getPendingSubscription(store.id) || null;
  });

  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    const subs = billingPlanService.getSubscriptions().filter((s) => s.storeId === store.id);
    if (subs.length > 0) {
      return subs.map((s) => ({
        id: s.invoiceNumber,
        plan: s.planName,
        cycle: isEn ? 'Yearly' : 'Tahunan',
        date: new Date(s.paidAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: s.amount,
        status: s.status === 'paid' ? (isEn ? 'Paid (Midtrans)' : 'Lunas (Midtrans)') : (s.status === 'cancelled' ? (isEn ? 'Cancelled' : 'Dibatalkan') : (isEn ? 'Pending Payment' : 'Menunggu Pembayaran')),
      }));
    }
    return [];
  });

  useEffect(() => {
    billingPlanService.fetchPlansFromDatabase().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setPlans(fetched.filter((p) => p.isActive));
      }
    });
  }, []);

  // Auto-polling status from Midtrans while an invoice is pending
  useEffect(() => {
    if (!pendingSubscription || !pendingSubscription.orderId) return;

    let isMounted = true;
    let isChecking = false;

    const checkStatus = async () => {
      if (isChecking || isVerifying) return;
      isChecking = true;
      try {
        const checkRes = await midtransService.checkTransactionStatus(pendingSubscription.orderId!);
        if (checkRes.isPaid && isMounted) {
          await handleActivatePlan(pendingSubscription);
        }
      } catch (err) {
        // Silently skip background polling errors
      } finally {
        isChecking = false;
      }
    };

    // Auto-check immediately when merchant refocuses the window
    const handleFocus = () => {
      checkStatus();
    };
    window.addEventListener('focus', handleFocus);

    // Poll every 5 seconds
    const timer = setInterval(checkStatus, 5000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      clearInterval(timer);
    };
  }, [pendingSubscription?.id, pendingSubscription?.orderId, isVerifying]);

  const currentPlan = store.plan || 'free';

  const handleOpenUpgrade = (plan: BillingPlan) => {
    if (plan.slug === currentPlan || (plan.slug === 'free' && (!store.plan || store.plan === 'free' || store.plan === 'starter'))) return;
    setSelectedPlanForUpgrade(plan);
    setIsModalOpen(true);
  };

  /**
   * Activate plan immediately on merchant store & mark subscription as paid for 1 year
   */
  const handleActivatePlan = async (sub: BillingSubscription) => {
    const planSlug = sub.planId.replace(/^plan_/, '');
    
    // Calculate 1 Year (365 Days) Expiration Date
    const now = new Date();
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const expiresAtIso = oneYearLater.toISOString();
    const paidAtIso = now.toISOString();

    // 1. Update store record & notify parent state (App.tsx)
    const updated = await storeService.updateStore(store.id, { 
      plan: planSlug as any,
      planExpiresAt: expiresAtIso,
      planSubscribedAt: paidAtIso,
      layoutSettings: {
        ...(store.layoutSettings || {}),
        planExpiresAt: expiresAtIso,
        planSubscribedAt: paidAtIso,
      }
    });
    onUpdateStore(updated);

    // 2. Mark subscription as paid
    await billingPlanService.updateSubscriptionStatus(sub.id, 'paid', {
      paidAt: paidAtIso,
      expiresAt: expiresAtIso,
    });

    // 3. Clear pending state
    setPendingSubscription(null);

    // 4. Refresh invoice list
    const subs = billingPlanService.getStoreSubscriptions(store.id);
    setInvoices(
      subs.map((s) => ({
        id: s.invoiceNumber,
        plan: s.planName,
        cycle: isEn ? 'Yearly (1 Year)' : 'Tahunan (1 Tahun)',
        date: new Date(s.paidAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: s.amount,
        status: s.status === 'paid' ? (isEn ? 'Paid (Midtrans)' : 'Lunas (Midtrans)') : (s.status === 'cancelled' ? (isEn ? 'Cancelled' : 'Dibatalkan') : (isEn ? 'Pending Payment' : 'Menunggu Pembayaran')),
      }))
    );

    const formattedExpiryDate = oneYearLater.toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (onShowNotification) {
      onShowNotification(
        isEn
          ? `🎉 Congratulations! Your store is now active on ${sub.planName} plan for 1 Year (valid until ${formattedExpiryDate})!`
          : `🎉 Selamat! Paket ${sub.planName} toko Anda sudah AKTIF selama 1 TAHUN (berlaku hingga ${formattedExpiryDate})!`
      );
    }
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  };

  /**
   * Query status from Midtrans and activate plan if settlement is detected
   */
  const handleCheckPaymentStatus = async (sub: BillingSubscription, forceActivateDev = false) => {
    setIsVerifying(true);
    try {
      if (forceActivateDev) {
        await handleActivatePlan(sub);
        return;
      }

      if (!sub.orderId) {
        if (import.meta.env.DEV || (import.meta.env.VITE_MIDTRANS_ENV as string) === 'sandbox') {
          await handleActivatePlan(sub);
          return;
        }
        if (onShowNotification) {
          onShowNotification(isEn ? 'Order ID not found for status verification.' : 'ID pesanan tidak valid untuk pengecekan status.');
        }
        return;
      }

      const checkRes = await midtransService.checkTransactionStatus(sub.orderId);
      if (checkRes.isPaid) {
        await handleActivatePlan(sub);
      } else if (checkRes.isTimeout) {
        if (onShowNotification) {
          onShowNotification(
            isEn 
              ? 'Midtrans Sandbox is slow to respond. You can click "Instant Test (Sandbox)" to activate immediately.' 
              : 'Koneksi ke Midtrans Sandbox sedang lambat. Silakan klik "⚡ Aktifkan Langsung (Sandbox)" untuk langsung mengaktifkan paket.'
          );
        }
      } else {
        if (onShowNotification) {
          const msg = checkRes.transactionStatus
            ? (isEn ? `Status Midtrans: "${checkRes.transactionStatus}". Pembayaran belum lunas.` : `Status transaksi Midtrans: "${checkRes.transactionStatus}". Pembayaran belum lunas.`)
            : (isEn ? 'Payment not detected yet. If you have paid or are testing in Sandbox, click "Instant Test (Sandbox)".' : 'Pembayaran belum terdeteksi di Midtrans Sandbox. Silakan selesaikan di simulator atau klik tombol "⚡ Aktifkan Langsung (Sandbox)".');
          onShowNotification(msg);
        }
      }
    } catch (err: any) {
      console.warn('Notice verifying payment:', err);
      if (onShowNotification) {
        onShowNotification(
          'Koneksi Midtrans lambat. Silakan klik tombol "⚡ Aktifkan Langsung (Sandbox)" untuk mengaktifkan paket tanpa menunggu.'
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Cancel pending subscription
   */
  const handleCancelPendingSubscription = async (sub: BillingSubscription) => {
    if (!window.confirm(isEn ? 'Cancel this pending invoice?' : 'Batalkan tagihan yang sedang menunggu pembayaran ini?')) return;
    await billingPlanService.updateSubscriptionStatus(sub.id, 'cancelled');
    setPendingSubscription(null);
    const subs = billingPlanService.getStoreSubscriptions(store.id);
    setInvoices(
      subs.map((s) => ({
        id: s.invoiceNumber,
        plan: s.planName,
        cycle: s.cycle === 'yearly' ? (isEn ? 'Yearly' : 'Tahunan') : (isEn ? 'Monthly' : 'Bulanan'),
        date: new Date(s.paidAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: s.amount,
        status: s.status === 'paid' ? (isEn ? 'Paid (Midtrans)' : 'Lunas (Midtrans)') : (s.status === 'cancelled' ? (isEn ? 'Cancelled' : 'Dibatalkan') : (isEn ? 'Pending Payment' : 'Menunggu Pembayaran')),
      }))
    );
    if (onShowNotification) onShowNotification(isEn ? 'Pending invoice cancelled.' : 'Tagihan berhasil dibatalkan.');
  };

  const handleExecuteUpgrade = async () => {
    if (!selectedPlanForUpgrade) return;
    setIsProcessing(true);

    const targetPlan = selectedPlanForUpgrade.slug;
    const price = targetPlan === 'free' ? 0 : selectedPlanForUpgrade.priceYearly;

    if (price === 0 || targetPlan === 'free') {
      // Set to Free
      const updated = await storeService.updateStore(store.id, { plan: 'free' });
      onUpdateStore(updated);
      setIsProcessing(false);
      setIsModalOpen(false);
      if (onShowNotification) onShowNotification('Paket toko dialihkan ke Paket Free (Gratis).');
      return;
    }

    const orderId = `BILL-${Date.now()}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Record subscription immediately so merchant has an invoice and orderId
    const recordedPending = await billingPlanService.recordSubscription({
      storeId: store.id,
      storeName: store.name,
      planId: `plan_${targetPlan}`,
      planName: selectedPlanForUpgrade.name,
      cycle: 'yearly',
      amount: price,
      status: 'pending',
      paymentMethod: paymentMethod === 'qris' ? 'Midtrans QRIS' : 'Midtrans VA',
      invoiceNumber,
      orderId,
      paidAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    setPendingSubscription(recordedPending);
    setInvoices((prev) => [
      {
        id: invoiceNumber,
        plan: selectedPlanForUpgrade.name,
        cycle: isEn ? 'Yearly' : 'Tahunan',
        date: new Date().toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: price,
        status: isEn ? 'Pending Payment' : 'Menunggu Pembayaran',
      },
      ...prev,
    ]);

    try {
      await midtransService.payWithSnap(
        {
          orderId,
          grossAmount: price,
          customerName: store.name,
          customerPhone: store.phoneWhatsApp,
          enabledPayments: paymentMethod === 'qris'
            ? ['gopay', 'qris', 'shopeepay']
            : ['bca_va', 'bni_va', 'bri_va', 'echannel', 'permata_va', 'other_va'],
        },
        {
          onSuccess: async () => {
            await handleActivatePlan(recordedPending);
            setIsProcessing(false);
            setIsModalOpen(false);
          },
          onPending: async () => {
            setIsProcessing(false);
            setIsModalOpen(false);
            if (onShowNotification) {
              onShowNotification(
                isEn 
                  ? 'Invoice created. Complete payment and click "Check Status & Activate" button.' 
                  : 'Kode pembayaran Midtrans diterbitkan. Selesaikan pembayaran lalu klik "Cek Status & Aktifkan Paket".'
              );
            }
          },
          onError: () => {
            alert(isEn ? 'Midtrans payment cancelled or failed.' : 'Pembayaran Midtrans dibatalkan atau gagal.');
            setIsProcessing(false);
          },
          onClose: async () => {
            setIsProcessing(false);
            // On popup close, check if the payment was already settled
            const res = await midtransService.checkTransactionStatus(orderId);
            if (res.isPaid) {
              await handleActivatePlan(recordedPending);
            }
          },
        }
      );
    } catch (err: any) {
      console.error('Midtrans payment error:', err);
      setIsProcessing(false);
      alert('Gagal membuka pembayaran Midtrans: ' + (err?.message || 'Terjadi kesalahan.'));
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans pb-24 lg:pb-8 text-left w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: onNavigateDashboard },
          { label: t('nav_billing', 'Paket Langganan'), isActive: true },
        ]}
      />

      {/* 1. Clean Page Header */}
      <div className="pb-3 border-b border-[#E5E0DD] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1F1F1F] tracking-tight flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-[#66000E]" />
            <span>{t('nav_billing', 'Paket Langganan')}</span>
          </h1>
          <p className="text-xs text-[#706866] mt-0.5">
            Pilih paket langganan tahunan terbaik untuk toko online Anda. Seluruh paket berbayar sudah termasuk biaya hosting server & platform Micro CMS.
          </p>
        </div>

        {/* Top Controls: Current Plan Status & Riwayat Berlangganan Button */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">

          <button
            type="button"
            onClick={() => {
              const subs = billingPlanService.getSubscriptions().filter((s) => s.storeId === store.id);
              if (subs.length > 0) {
                setInvoices(
                  subs.map((s) => ({
                    id: s.invoiceNumber,
                    plan: s.planName,
                    cycle: isEn ? 'Yearly' : 'Tahunan',
                    date: new Date(s.paidAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    amount: s.amount,
                    status: s.status === 'paid' ? (isEn ? 'Paid (Midtrans)' : 'Lunas (Midtrans)') : s.status,
                  }))
                );
              }
              setIsHistoryOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F7] border border-[#E5E0DD] text-xs font-semibold text-[#241A1A] hover:text-[#66000E] hover:border-[#66000E] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#66000E]" />
            <span>{isEn ? 'Subscription History' : 'Riwayat Berlangganan'}</span>
          </button>
        </div>
      </div>

      {/* Active Annual Subscription Banner (When merchant has an active paid plan) */}
      {store.plan && store.plan !== 'free' && store.plan !== 'starter' && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 p-5 shadow-2xs text-left transition hover:shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Crown className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Check className="w-3 h-3 stroke-[3]" />
                    {isEn ? 'Active Plan (1 Year)' : 'Paket Aktif (1 Tahun)'}
                  </span>
                  {store.planExpiresAt && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                      {Math.max(0, Math.ceil((new Date(store.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} {isEn ? 'days remaining' : 'hari tersisa'}
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-gray-900">
                  {store.plan === 'community' ? 'Community UMKM' : (store.plan === 'personal' ? 'Personal Toko' : store.plan)}
                </h3>
                <p className="text-xs text-gray-600">
                  {isEn ? 'Subscription active until' : 'Masa langganan aktif berlaku hingga'}:{' '}
                  <strong className="text-emerald-950 font-bold">
                    {store.planExpiresAt
                      ? new Date(store.planExpiresAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : (isEn ? '1 Year Ahead' : '1 Tahun Penuh')}
                  </strong>
                  . {isEn ? 'All premium features, automated checkout & logistics are active.' : 'Semua fitur checkout otomatis Midtrans, kurir ekspedisi logistik Biteship, dan publikasi toko online aktif penuh.'}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-600/10 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isEn ? 'Live & Protected' : 'Toko Berlangganan Aktif'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pending Subscription Banner */}
      {pendingSubscription && (
        <div className="rounded-2xl border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50/40 p-5 shadow-2xs text-left transition hover:shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Clock className="w-5 h-5 animate-pulse text-amber-700" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    {isEn ? 'Payment Pending' : 'Menunggu Pembayaran'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-gray-600 bg-white border border-amber-200 px-2 py-0.5 rounded-md">
                    {pendingSubscription.invoiceNumber}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-md">
                    {isEn ? '1 Year (Annual)' : '1 Tahun (Tahunan)'}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#1F1F1F] flex items-center gap-2 flex-wrap">
                  <span>{pendingSubscription.planName}</span>
                  <span className="text-[#66000E] font-black text-base">
                    ({formatRupiah(pendingSubscription.amount === 35000 ? 350000 : (pendingSubscription.amount === 99000 ? 1000000 : pendingSubscription.amount))} / tahun)
                  </span>
                </h3>
                <p className="text-xs text-[#706866] leading-relaxed">
                  Metode: <strong className="text-[#1F1F1F]">{pendingSubscription.paymentMethod}</strong> • Selesaikan pembayaran agar paket langsung aktif selama <strong>1 Tahun Penuh</strong>. Sistem secara otomatis mengecek pelunasan Midtrans di latar belakang.
                </p>
                <div className="flex items-center gap-2 pt-0.5 text-[11px] text-amber-800 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                  <span>Mengecek status pembayaran otomatis setiap beberapa detik...</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0 pt-2 lg:pt-0">
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleCheckPaymentStatus(pendingSubscription)}
                className="px-4 py-2.5 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? (isEn ? 'Verifying...' : 'Memverifikasi...') : (isEn ? 'Check Status & Activate' : 'Cek Status & Aktifkan Paket')}</span>
              </button>

              {/* Dev / Sandbox instant activation button */}
              {(import.meta.env.DEV || (import.meta.env.VITE_MIDTRANS_ENV as string) === 'sandbox') && (
                <button
                  type="button"
                  title="Aktivasi langsung untuk pengujian Sandbox tanpa menunggu simulasi bank"
                  onClick={() => handleCheckPaymentStatus(pendingSubscription, true)}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-700 fill-current" />
                  <span>{isEn ? 'Instant Test (Sandbox)' : '⚡ Aktifkan Langsung (Sandbox)'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCancelPendingSubscription(pendingSubscription)}
                className="px-3 py-2.5 rounded-xl bg-white hover:bg-red-50 text-gray-600 hover:text-red-700 border border-[#E5E0DD] hover:border-red-200 text-xs font-semibold transition cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {plans.map((plan) => {
          const isCurrent =
            plan.slug === store.plan ||
            (plan.slug === 'free' && (!store.plan || store.plan === 'free' || store.plan === 'starter')) ||
            (plan.slug === 'community' && store.plan === 'premium');
          const isStorePaid = store.plan && store.plan !== 'free' && store.plan !== 'starter';
          const price = plan.priceYearly;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl bg-white p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between relative shadow-2xs hover:shadow-md ${
                isCurrent
                  ? 'border-2 border-[#66000E] ring-4 ring-[#66000E]/5'
                  : plan.badge
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : 'border-[#E5E0DD]'
              }`}
            >
              <div>
                {/* Top Badge */}
                {plan.badge && (
                  <div className="mb-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs inline-block">
                      ★ {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#241A1A]">{getPlanName(plan.name)}</h3>
                  {isCurrent && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                        {isStorePaid && plan.slug !== 'free' ? (isEn ? 'Active (1 Year)' : 'Aktif (1 Tahun)') : (isEn ? 'Active' : 'Aktif')}
                      </span>
                      {isStorePaid && plan.slug !== 'free' && store.planExpiresAt && (
                        <span className="text-[9px] text-gray-500 font-medium block mt-0.5">
                          s/d {new Date(store.planExpiresAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#706866] mt-1 min-h-[32px]">{getPlanTagline(plan.tagline)}</p>

                {/* Price */}
                <div className="py-3 border-y border-[#FAF7F7] my-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#241A1A]">
                      {price === 0 ? (isEn ? 'Free' : 'Gratis') : formatRupiah(price)}
                    </span>
                    <span className="text-xs text-[#706866]">
                      {price === 0 ? '' : isEn ? '/ year' : '/ tahun'}
                    </span>
                  </div>
                </div>

                {/* Transparent Breakdown (Hosting Server + Jasa Micro CMS) */}
                {plan.hostingPriceYearly !== undefined && plan.cmsPriceYearly !== undefined && price > 0 && (
                  <div className="bg-[#FAF7F7] p-2.5 rounded-xl border border-[#E5E0DD]/80 mb-4 text-[11px] space-y-1">
                    <div className="flex justify-between text-[#706866]">
                      <span>Biaya Hosting Server:</span>
                      <span className="font-semibold text-[#241A1A]">{formatRupiah(plan.hostingPriceYearly)}</span>
                    </div>
                    <div className="flex justify-between text-[#706866]">
                      <span>Biaya Jasa Micro CMS:</span>
                      <span className="font-semibold text-[#241A1A]">{formatRupiah(plan.cmsPriceYearly)}</span>
                    </div>
                  </div>
                )}

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-[#241A1A] pb-4">
                  {plan.features.map((feat, idx) => {
                    const isNegative = feat.startsWith('❌');
                    return (
                      <li key={idx} className={`flex items-start gap-2 leading-snug ${isNegative ? 'text-gray-400 line-through' : ''}`}>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isNegative ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isNegative ? <X className="w-2.5 h-2.5 stroke-[3]" /> : <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span>{getPlanFeature(feat.replace(/^❌\s*/, ''))}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => handleOpenUpgrade(plan)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[#FAF7F7] text-[#706866] border border-[#E5E0DD] cursor-default'
                      : 'bg-[#66000E] hover:bg-[#801010] text-white shadow-xs active:scale-95'
                  }`}
                >
                  {isCurrent ? (
                    <span>{isEn ? 'Current Active Plan' : 'Paket Sedang Aktif'}</span>
                  ) : (
                    <>
                      <span>{plan.slug === 'free' ? (isEn ? 'Select Free Plan' : 'Pilih Paket Starter') : (isEn ? `Upgrade to ${getPlanName(plan.name)}` : `Beralih ke ${plan.name}`)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Riwayat Berlangganan & Tagihan */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-[#E5E0DD] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F7]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#66000E]" />
                <div>
                  <h3 className="font-bold text-base text-[#241A1A]">{isEn ? 'Subscription History' : 'Riwayat Berlangganan'}</h3>
                  <p className="text-xs text-[#706866]">{isEn ? 'Transaction history of your store subscription plan' : 'Catatan transaksi paket langganan toko Anda'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[#241A1A]">
                <thead className="bg-[#FAF7F7] text-[#706866] border-b border-[#E5E0DD]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">{isEn ? 'Invoice No.' : 'No. Invoice'}</th>
                    <th className="py-2.5 px-3 font-semibold">{isEn ? 'Plan' : 'Paket'}</th>
                    <th className="py-2.5 px-3 font-semibold">{isEn ? 'Cycle' : 'Siklus'}</th>
                    <th className="py-2.5 px-3 font-semibold">{isEn ? 'Date' : 'Tanggal'}</th>
                    <th className="py-2.5 px-3 font-semibold">{isEn ? 'Total' : 'Total'}</th>
                    <th className="py-2.5 px-3 font-semibold">{isEn ? 'Status' : 'Status'}</th>
                    <th className="py-2.5 px-3 font-semibold text-right">{isEn ? 'Action' : 'Aksi'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF7F7]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FAF7F7]/60 transition">
                      <td className="py-3 px-3 font-mono font-semibold">{inv.id}</td>
                      <td className="py-3 px-3 font-bold">{getPlanName(inv.plan)}</td>
                      <td className="py-3 px-3 text-[#706866]">{inv.cycle}</td>
                      <td className="py-3 px-3 text-[#706866]">{inv.date}</td>
                      <td className="py-3 px-3 font-bold text-[#66000E]">{formatRupiah(inv.amount)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          inv.status.includes('Lunas') || inv.status.includes('Paid')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingInvoice(inv)}
                          className="text-[#66000E] hover:underline font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                          title={isEn ? 'View & Download Official Invoice' : 'Lihat & Unduh Bukti Invoice Resmi'}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Download' : 'Unduh'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#706866] hover:bg-[#FAF7F7] transition cursor-pointer"
              >
                {isEn ? 'Close' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Checkout / Konfirmasi Upgrade */}
      {isModalOpen && selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E5E0DD] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F7]">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#66000E]" />
                <h3 className="font-bold text-sm text-[#241A1A]">{isEn ? 'Subscription Confirmation' : 'Konfirmasi Berlangganan'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF7F7] p-3.5 rounded-2xl border border-[#E5E0DD] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#706866]">{isEn ? 'Target Plan:' : 'Paket Tujuan:'}</span>
                <span className="font-bold text-[#241A1A]">{getPlanName(selectedPlanForUpgrade.name)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#706866]">{isEn ? 'Billing Cycle:' : 'Siklus Tagihan:'}</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {isEn ? '1 Year (Annual)' : '1 Tahun (Tahunan)'}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E5E0DD] flex items-center justify-between">
                <span className="font-bold text-[#241A1A]">{isEn ? 'Total Cost:' : 'Total Biaya:'}</span>
                <span className="text-base font-black text-[#66000E]">
                  {formatRupiah(selectedPlanForUpgrade.slug === 'free' ? 0 : selectedPlanForUpgrade.priceYearly)}
                  <span className="text-xs font-normal text-[#706866] ml-1">
                    {selectedPlanForUpgrade.slug === 'free' ? '' : (isEn ? '/ year' : '/ tahun')}
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-[#241A1A] block">{isEn ? 'Payment Method:' : 'Metode Pembayaran:'}</label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'border-[#66000E] bg-[#F5E8EA]/40 font-bold text-[#66000E]'
                      : 'border-[#E5E0DD] bg-white text-[#706866]'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isEn ? 'Instant QRIS' : 'QRIS Instan'}</span>
                </div>

                <div
                  onClick={() => setPaymentMethod('bca_va')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer ${
                    paymentMethod === 'bca_va'
                      ? 'border-[#66000E] bg-[#F5E8EA]/40 font-bold text-[#66000E]'
                      : 'border-[#E5E0DD] bg-white text-[#706866]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isEn ? 'Virtual Account' : 'Virtual Account'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteUpgrade}
                className="w-full py-3 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isProcessing ? (isEn ? 'Processing Transaction...' : 'Memproses Transaksi...') : (isEn ? 'Pay Now via Midtrans' : 'Bayar Sekarang via Midtrans')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 text-xs text-[#706866] hover:text-[#241A1A] transition cursor-pointer text-center"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bukti Resmi Invoice Langganan */}
      <BillingInvoiceModal
        invoice={viewingInvoice}
        store={store}
        isOpen={Boolean(viewingInvoice)}
        onClose={() => setViewingInvoice(null)}
      />
    </div>
  );
};
