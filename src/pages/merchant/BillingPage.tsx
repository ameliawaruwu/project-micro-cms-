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
  AlertCircle,
  Trash2,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Store as StoreType, BillingPlan, BillingSubscription } from '../../types';
import { storeService } from '../../services/storeService';
import { duitkuService } from '../../services/duitkuService';
import { billingPlanService, resolvePlanSlug, ALLOWED_PLAN_SLUGS } from '../../services/billingPlanService';
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
    status: 'Lunas (Duitku)',
  },
];

export interface DuitkuChannelOption {
  code: string;
  name: string;
  category: 'qris' | 'va';
  image: string;
  badge?: string;
  fee?: string;
}

export const DEFAULT_QRIS_CHANNELS: DuitkuChannelOption[] = [
  {
    code: 'SP',
    name: 'ShopeePay QRIS',
    category: 'qris',
    image: 'https://images.duitku.com/hotlink-ok/SHOPEEPAY.PNG',
    badge: 'Rekomendasi Instan',
  },
  {
    code: 'NQ',
    name: 'Nobu QRIS (Semua Bank & E-Wallet)',
    category: 'qris',
    image: 'https://images.duitku.com/hotlink-ok/NQ.PNG',
    badge: 'Scan Universal',
  },
  {
    code: 'DA',
    name: 'DANA E-Wallet',
    category: 'qris',
    image: 'https://images.duitku.com/hotlink-ok/DA.PNG',
    badge: 'Instan',
  },
  {
    code: 'OV',
    name: 'OVO E-Wallet',
    category: 'qris',
    image: 'https://images.duitku.com/hotlink-ok/OV.PNG',
    badge: 'Instan',
  },
];

export const DEFAULT_VA_CHANNELS: DuitkuChannelOption[] = [
  {
    code: 'BC',
    name: 'BCA Virtual Account',
    category: 'va',
    image: 'https://images.duitku.com/hotlink-ok/BCA.SVG',
    badge: 'Otomatis 24 Jam',
  },
  {
    code: 'M2',
    name: 'Mandiri Virtual Account',
    category: 'va',
    image: 'https://images.duitku.com/hotlink-ok/MV.PNG',
    badge: 'Otomatis 24 Jam',
  },
  {
    code: 'BR',
    name: 'BRI Virtual Account (BRIVA)',
    category: 'va',
    image: 'https://images.duitku.com/hotlink-ok/BR.PNG',
    badge: 'Otomatis 24 Jam',
  },
  {
    code: 'I1',
    name: 'BNI Virtual Account',
    category: 'va',
    image: 'https://images.duitku.com/hotlink-ok/I1.PNG',
    badge: 'Otomatis 24 Jam',
  },
  {
    code: 'BV',
    name: 'BSI Virtual Account (Syariah)',
    category: 'va',
    image: 'https://images.duitku.com/hotlink-ok/BSI.PNG',
    badge: 'Otomatis 24 Jam',
  },
  {
    code: 'BT',
    name: 'Permata Virtual Account',
    category: 'va',
    image: 'https://images.duitku.com/hotlink-ok/PERMATA.PNG',
    badge: 'Otomatis 24 Jam',
  },
  {
    code: 'B1',
    name: 'CIMB Niaga Virtual Account',
    category: 'va',
    image: 'https://images.duitku.com/hotlink-ok/B1.PNG',
    badge: 'Otomatis 24 Jam',
  },
  {
    code: 'VA',
    name: 'Maybank Virtual Account',
    category: 'va',
    image: 'https://images.duitku.com/hotlink-ok/VA.PNG',
    badge: 'Otomatis 24 Jam',
  },
];

const PLAN_NAME_MAP: Record<string, string> = {
  'Starter (Gratis)': 'Starter (Free)',
  'Pro UMKM': 'Pro MSME',
  'Bisnis Scale-Up': 'Business Scale-Up',
  'Paket Pro UMKM': 'Pro MSME Plan',
  'Paket Starter (Gratis)': 'Starter (Free) Plan',
  'Paket Bisnis Scale-Up': 'Business Scale-Up Plan',
  'Paket Free': 'Free Plan',
  'Personal Toko': 'Personal Store',
  'Community UMKM': 'Community MSME',
  'Bisnis Corporate': 'Corporate Business',
  'Startup Scale': 'Startup Scale',
};

const PLAN_TAGLINE_MAP: Record<string, string> = {
  'Cocok untuk toko baru yang baru mulai belajar online': 'Ideal for new stores starting to learn online selling',
  'Cocok untuk bisnis individu & toko retail mandiri': 'Ideal for individual businesses & independent retail shops',
  'Pilihan terbaik untuk UMKM & komunitas bisnis berkembang': 'Best choice for growing MSMEs & business communities',
  'Solusi perusahaan retail skala menengah dengan multi-cabang': 'Solution for mid-sized retail enterprises with multiple branches',
  'Infrastruktur cloud enterprise untuk brand skala nasional': 'Enterprise cloud infrastructure for national-scale brands',
  'Belajar & kelola katalog produk lokal secara gratis': 'Learn & manage local product catalogs for free',
  'Buka toko online mandiri & terima pembayaran instan': 'Open an independent online store & accept instant payments',
  'Solusi lengkap & paling laris untuk bisnis UMKM bertumbuh': 'Complete & best-selling solution for growing MSME businesses',
  'Cocok untuk toko baru yang mulai berjualan online': 'Suitable for new stores starting to sell online',
  'Fitur lengkap tanpa batas untuk meningkatkan omset toko': 'Full unlimited features to boost store revenue',
  'Untuk bisnis UMKM berkembang dengan tim & cabang': 'For growing businesses with teams & branches',
};

const PLAN_BADGE_MAP: Record<string, string> = {
  'Pilihan Terbaik UMKM': 'Best MSME Choice',
  'Pilihan Terbaik UMKM (Rekomendasi Utama)': 'Best MSME Choice (Top Recommendation)',
  'Populer': 'Popular',
  'Rekomendasi': 'Recommended',
};

const PLAN_FEATURE_MAP: Record<string, string> = {
  // Plan Free
  'Subdomain gratis [slug].kroomify.com': 'Free subdomain [slug].kroomify.com',
  'Subdomain pratinjau: namatoko.kroombox.com': 'Preview subdomain: yourstore.kroombox.com',
  'Katalog produk hingga 15 item': 'Product catalog up to 15 items',
  'Katalog produk dasar (maksimal 10 produk)': 'Basic product catalog (maximum 10 products)',
  'Checkout katalog & order WhatsApp': 'Catalog checkout & WhatsApp ordering',
  'Watermark Kroomify di footer toko': 'Kroomify watermark in store footer',
  'Watermark resmi Kroomify di footer': 'Official Kroomify watermark in store footer',
  'Manual shipping & payment': 'Manual shipping & payment',
  'Tanpa Checkout Otomatis Duitku (Manual/WA saja)': 'No automated Duitku checkout (Manual/WA only)',
  'Tanpa Ekspedisi Kurir Otomatis Biteship': 'No automated Biteship couriers',
  'Tanpa Publikasi/Deploy Toko Online & Domain': 'No online store deployment & custom domain',

  // Personal Toko
  'Hosting Server: Rp 200.000 / tahun': 'Server Hosting: Rp 200,000 / year',
  'Jasa Micro CMS: Rp 150.000 / tahun': 'Micro CMS Service: Rp 150,000 / year',
  'Dukungan Custom Domain (.top, .online, .org, .com, .id)': 'Custom domain support (.top, .online, .org, .com, .id)',
  'Mendukung Custom Domain Sendiri (.com, .id, dll)': 'Supports custom domain (.com, .id, etc.)',
  'Katalog produk hingga 100 item': 'Product catalog up to 100 items',
  'Kapasitas hingga 50 produk & varian': 'Capacity up to 50 products & variants',
  'Deploy Toko Online Aktif (bisa diakses pembeli)': 'Live online store deployment (publicly accessible)',
  'Automated Duitku (QRIS, VA Bank, E-Wallet)': 'Automated Duitku (QRIS, VA Bank, E-Wallet)',
  'Checkout otomatis Duitku (QRIS & VA Bank)': 'Automated Duitku checkout (QRIS & VA Bank)',
  'Integrasi Ekspedisi Logistik (JNE, J&T via Biteship)': 'Logistics courier integration (JNE, J&T via Biteship)',
  'Cek ongkir & pengiriman otomatis Biteship': 'Automated shipping calculation & booking via Biteship',
  'Kapasitas Hosting Cloud Kroomify cepat': 'Fast Kroomify Cloud Hosting capacity',
  'Laporan penjualan & pesanan harian': 'Daily sales & order reporting',
  'White-label tanpa watermark': 'White-label without watermark',

  // Community UMKM
  'Hosting Server: Rp 700.000 / tahun': 'Server Hosting: Rp 700,000 / year',
  'Jasa Micro CMS: Rp 300.000 / tahun': 'Micro CMS Service: Rp 300,000 / year',
  'Pilihan Terbaik UMKM (Rekomendasi Utama)': 'Best Choice for MSMEs (Top Recommendation)',
  'Unlimited product catalog & variants': 'Unlimited product catalog & variants',
  'Unlimited katalog produk & varian': 'Unlimited product catalog & variants',
  'Unlimited katalog produk & varian tanpa batas': 'Unlimited product catalog & variants without limits',
  'Prioritas DNS setup & SSL otomatis': 'Priority DNS setup & automated SSL',
  'Semua channel Duitku & Biteship aktif': 'All Duitku & Biteship channels active',
  'Full checkout Duitku (QRIS, VA Bank, E-Wallet)': 'Full Duitku checkout (QRIS, VA Bank, E-Wallet)',
  'Multi-gudang & multi-cabang pengiriman': 'Multi-warehouse & multi-branch shipping',
  'Laporan analitik omset & export data': 'Revenue analytics report & data export',
  'Cetak label resi pengiriman thermal massal': 'Bulk thermal shipping label printing',
  'Visual layout builder (bebas kustom tema toko)': 'Visual layout builder (customizable store themes)',
  'Hosting Server UMKM prioritas tinggi': 'High priority MSME Server Hosting',
  'Bebas Watermark (100% White-label Brand Anda)': 'Watermark-free (100% White-label your brand)',

  // Corporate & Startup
  'Hosting Server: Rp 1.800.000 / tahun': 'Server Hosting: Rp 1,800,000 / year',
  'Jasa Micro CMS: Rp 700.000 / tahun': 'Micro CMS Service: Rp 700,000 / year',
  'Server dedicated cloud berkecepatan tinggi': 'High-speed dedicated cloud server',
  'Kustomisasi tema & visual layout builder tingkat lanjut': 'Advanced theme customization & visual layout builder',
  'Multi-cabang gudang tidak terbatas': 'Unlimited multi-branch warehouses',
  'Notifikasi otomatis WhatsApp bot ke pembeli': 'Automated WhatsApp bot notifications to buyers',
  'Dedicated Account Manager 24/7': 'Dedicated Account Manager 24/7',
  'Hosting Server: Rp 2.000.000 / tahun': 'Server Hosting: Rp 2,000,000 / year',
  'Jasa Micro CMS: Rp 1.000.000 / tahun': 'Micro CMS Service: Rp 1,000,000 / year',
  'Traffic kapasitas tinggi hingga ratusan ribu order/hari': 'High capacity traffic up to hundreds of thousands orders/day',
  'API akses webhook langsung & integrasi ERP': 'Direct webhook API access & ERP integration',
  'Prioritas domain deployment & DNS propagation': 'Priority domain deployment & DNS propagation',
  'Garansi uptime SLA 99.9%': '99.9% SLA uptime guarantee',
  'Prioritas engineering support': 'Priority engineering support',
  'Katalog produk hingga 25 item': 'Product catalog up to 25 items',
  'Checkout otomatis via Duitku (QRIS & VA)': 'Automated checkout via Duitku (QRIS & VA)',
  'Cek ongkir otomatis ekspedisi (J&T, JNE)': 'Automated shipping rate check (J&T, JNE)',
  'Bebas watermark (white-label brand sendiri)': 'Watermark free (your own white-label brand)',
  'Semua metode pembayaran Duitku (QRIS, VA Bank, Kartu Kredit)': 'All Duitku payment methods (QRIS, VA Bank, Credit Card)',
  'Visual layout builder & kustomisasi banner toko': 'Visual layout builder & store banner customization',
  'Cetak label pengiriman thermal massal': 'Bulk thermal shipping label printing',
  'Laporan analitik penjualan & omset real-time': 'Real-time sales & turnover analytics report',
  'Prioritas bantuan customer support': 'Priority customer support assistance',
  'Semua fitur paket Pro UMKM': 'All features in Pro UMKM plan',
  'Akses multi-staf pengelola toko (hingga 5 admin)': 'Multi-staff store access (up to 5 admins)',
  'Dukungan custom domain toko (.com / .id)': 'Custom store domain support (.com / .id)',
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
  const getPlanBadge = (badge?: string) => (!badge ? '' : (isEn && PLAN_BADGE_MAP[badge] ? PLAN_BADGE_MAP[badge] : badge));
  const getPlanFeature = (feat: string) => {
    if (!isEn) return feat;
    const clean = feat.trim();
    if (PLAN_FEATURE_MAP[clean]) return PLAN_FEATURE_MAP[clean];

    // Dynamic pattern translations
    if (/^Hosting Server:\s*(Rp\s*[\d\.\,]+)\s*\/\s*tahun/i.test(clean)) {
      return clean.replace(/^Hosting Server:\s*(Rp\s*[\d\.\,]+)\s*\/\s*tahun/i, 'Server Hosting: $1 / year');
    }
    if (/^Jasa Micro CMS:\s*(Rp\s*[\d\.\,]+)\s*\/\s*tahun/i.test(clean)) {
      return clean.replace(/^Jasa Micro CMS:\s*(Rp\s*[\d\.\,]+)\s*\/\s*tahun/i, 'Micro CMS Service: $1 / year');
    }
    if (/^Katalog produk hingga\s*(\d+)\s*item/i.test(clean)) {
      return clean.replace(/^Katalog produk hingga\s*(\d+)\s*item/i, 'Product catalog up to $1 items');
    }
    if (/^Kapasitas hingga\s*(\d+)\s*produk/i.test(clean)) {
      return clean.replace(/^Kapasitas hingga\s*(\d+)\s*produk/i, 'Capacity up to $1 products');
    }
    return clean;
  };

  const [plans, setPlans] = useState<BillingPlan[]>(billingPlanService.getActivePlans());
  const billingCycle = 'yearly';
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<BillingPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceItem | null>(null);

  // State: Payment Category & Provider Selection from Duitku
  const [paymentCategory, setPaymentCategory] = useState<'qris' | 'va'>('qris');
  const [selectedChannelCode, setSelectedChannelCode] = useState<string>('SP');
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [qrisChannels, setQrisChannels] = useState<DuitkuChannelOption[]>(DEFAULT_QRIS_CHANNELS);
  const [vaChannels, setVaChannels] = useState<DuitkuChannelOption[]>(DEFAULT_VA_CHANNELS);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // State: Celebration Confirmation Modal on Successful Subscription
  const [successSubscription, setSuccessSubscription] = useState<{
    planName: string;
    planSlug: string;
    expiryDate: string;
    invoiceNumber: string;
    amount: number;
    paymentMethod: string;
  } | null>(null);

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
        status: s.status === 'paid' ? (isEn ? 'Paid (Duitku)' : 'Lunas (Duitku)') : (s.status === 'cancelled' ? (isEn ? 'Cancelled' : 'Dibatalkan') : (isEn ? 'Pending Payment' : 'Menunggu Pembayaran')),
      }));
    }
    return [];
  });

  // Verify return from Duitku payment gateway (e.g. ?billing_return=true&merchantOrderId=BILL-...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const isBillingReturn = params.get('billing_return') === 'true';
    const returnOrderId = params.get('merchantOrderId') || params.get('order_id');

    if (isBillingReturn || returnOrderId?.startsWith('BILL-')) {
      const orderToCheck = returnOrderId || pendingSubscription?.orderId;
      if (orderToCheck) {
        setIsVerifying(true);
        duitkuService.checkTransactionStatus(orderToCheck).then(async (res) => {
          if (res.isPaid) {
            const targetSub =
              pendingSubscription ||
              billingPlanService.getStoreSubscriptions(store.id).find(
                (s) => s.orderId === orderToCheck || s.invoiceNumber === orderToCheck
              );

            if (targetSub) {
              await handleActivatePlan(targetSub);
            } else {
              const activeSub = await billingPlanService.getActiveSubscriptionForStore(store.id);
              if (activeSub.hasActivePaidPlan) {
                const updated = await storeService.updateStore(
                  store.id,
                  {
                    plan: activeSub.planSlug,
                    planExpiresAt: activeSub.expiresAt,
                    planSubscribedAt: activeSub.subscribedAt,
                  },
                  store.merchantId
                );
                onUpdateStore(updated);
                setSuccessSubscription({
                  planName: activeSub.planName,
                  planSlug: activeSub.planSlug,
                  expiryDate: new Date(activeSub.expiresAt || Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(
                    isEn ? 'en-US' : 'id-ID',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                  ),
                  invoiceNumber: activeSub.subscription?.invoiceNumber || orderToCheck,
                  amount: activeSub.subscription?.amount || 1000000,
                  paymentMethod: 'Duitku Payment Gateway',
                });
                confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
              }
            }
          }
        }).catch((err) => {
          console.warn('[Duitku Return Verification Error]', err);
        }).finally(() => {
          setIsVerifying(false);
          // Clean up search query params to keep URL clean and prevent repeated checks
          try {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } catch { /* ignore */ }
        });
      }
    }
  }, [store.id]);

  useEffect(() => {
    billingPlanService.fetchPlansFromDatabase().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setPlans(fetched.filter((p) => p.isActive && (ALLOWED_PLAN_SLUGS as readonly string[]).includes(p.slug)));
      }
    });

    // Check & sync real active subscription for this store from DB
    if (store.id) {
      billingPlanService.getActiveSubscriptionForStore(store.id).then((subInfo) => {
        if (subInfo.hasActivePaidPlan) {
          if (store.plan !== subInfo.planSlug || store.planExpiresAt !== subInfo.expiresAt) {
            storeService.updateStore(store.id, {
              plan: subInfo.planSlug,
              planExpiresAt: subInfo.expiresAt,
              planSubscribedAt: subInfo.subscribedAt,
            }, store.merchantId).then((updated) => {
              onUpdateStore(updated);
            });
          }
        } else if (subInfo.isExpired && store.plan && store.plan !== 'free') {
          storeService.updateStore(store.id, {
            plan: 'free',
          }, store.merchantId).then((updated) => {
            onUpdateStore(updated);
          });
        }
      });
    }
  }, [store.id]);

  // Auto-polling status from Duitku while an invoice is pending
  useEffect(() => {
    if (!pendingSubscription || !pendingSubscription.orderId) return;

    let isMounted = true;
    let isChecking = false;

    const checkStatus = async () => {
      if (isChecking || isVerifying) return;
      isChecking = true;
      try {
        const checkRes = await duitkuService.checkTransactionStatus(pendingSubscription.orderId!);
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
      if (store.id) {
        billingPlanService.getActiveSubscriptionForStore(store.id).then((subInfo) => {
          if (subInfo.hasActivePaidPlan && store.plan !== subInfo.planSlug) {
            storeService.updateStore(store.id, {
              plan: subInfo.planSlug,
              planExpiresAt: subInfo.expiresAt,
              planSubscribedAt: subInfo.subscribedAt,
            }, store.merchantId).then(onUpdateStore);
          }
        });
      }
    };
    window.addEventListener('focus', handleFocus);

    // Poll every 5 seconds
    const timer = setInterval(checkStatus, 5000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      clearInterval(timer);
    };
  }, [pendingSubscription?.id, pendingSubscription?.orderId, isVerifying, store.id]);

  const currentPlan = resolvePlanSlug(store.plan);

  const handleOpenUpgrade = async (plan: BillingPlan) => {
    const targetSlug = resolvePlanSlug(plan.slug);
    if (targetSlug === currentPlan) return;
    if (targetSlug === 'free' && currentPlan === 'free') return;
    setSelectedPlanForUpgrade(plan);
    setIsModalOpen(true);
    setChannelsLoading(true);

    try {
      const methods = await duitkuService.getPaymentMethods(plan.priceYearly);
      if (Array.isArray(methods) && methods.length > 0) {
        const dynamicQris: DuitkuChannelOption[] = [];
        const dynamicVa: DuitkuChannelOption[] = [];

        methods.forEach((m) => {
          const code = m.paymentMethod;
          const name = m.paymentName;
          const image = m.paymentImage;
          const fee = m.totalFee;

          const isQris = ['SP', 'NQ', 'SQ', 'OV', 'DA', 'LA', 'SA'].includes(code) || /qris|shopee|nobu|dana|ovo|linkaja/i.test(name);
          const isVa = ['BC', 'M2', 'BR', 'I1', 'BT', 'B1', 'BV', 'NC', 'VA', 'A1', 'AG', 'S1'].includes(code) || /va|virtual/i.test(name);

          if (isQris) {
            let cleanName = name;
            if (code === 'SP') cleanName = 'ShopeePay QRIS';
            if (code === 'NQ') cleanName = 'Nobu QRIS (Semua Bank & E-Wallet)';
            if (code === 'DA') cleanName = 'DANA E-Wallet';
            if (code === 'OV') cleanName = 'OVO E-Wallet';
            dynamicQris.push({
              code,
              name: cleanName,
              category: 'qris',
              image,
              fee,
              badge: code === 'SP' ? 'Instan Tercepat' : 'Scan Bebas Biaya',
            });
          } else if (isVa) {
            let cleanName = name;
            if (code === 'BC') cleanName = 'BCA Virtual Account';
            if (code === 'M2') cleanName = 'Mandiri Virtual Account';
            if (code === 'BR') cleanName = 'BRI Virtual Account (BRIVA)';
            if (code === 'I1') cleanName = 'BNI Virtual Account';
            if (code === 'BV') cleanName = 'BSI Virtual Account (Syariah)';
            if (code === 'BT') cleanName = 'Permata Virtual Account';
            if (code === 'B1') cleanName = 'CIMB Niaga Virtual Account';
            if (code === 'VA') cleanName = 'Maybank Virtual Account';
            dynamicVa.push({
              code,
              name: cleanName,
              category: 'va',
              image,
              fee,
              badge: 'Otomatis 24/7',
            });
          }
        });

        if (dynamicQris.length > 0) setQrisChannels(dynamicQris);
        if (dynamicVa.length > 0) setVaChannels(dynamicVa);

        if (paymentCategory === 'qris' && dynamicQris.length > 0) {
          setSelectedChannelCode(dynamicQris[0].code);
        } else if (paymentCategory === 'va' && dynamicVa.length > 0) {
          setSelectedChannelCode(dynamicVa[0].code);
        }
      }
    } catch (e) {
      console.warn('Error loading dynamic Duitku payment channels:', e);
    } finally {
      setChannelsLoading(false);
    }
  };

  const handleSelectCategory = (cat: 'qris' | 'va') => {
    setPaymentCategory(cat);
    if (cat === 'qris') {
      setSelectedChannelCode(qrisChannels[0]?.code || 'SP');
    } else {
      setSelectedChannelCode(vaChannels[0]?.code || 'BC');
    }
  };

  /**
   * Activate plan immediately on merchant store & mark subscription as paid for exactly 1 year (365 days)
   */
  const handleActivatePlan = async (sub: BillingSubscription) => {
    const planSlug = resolvePlanSlug(sub.planId || sub.planName);

    // Calculate 1 Year (365 Days) Expiration Date from actual payment time
    const now = new Date();
    const paidAtIso = sub.paidAt || now.toISOString();
    const paidTime = new Date(paidAtIso).getTime();
    const oneYearLater = new Date((isNaN(paidTime) ? now.getTime() : paidTime) + 365 * 24 * 60 * 60 * 1000);
    const expiresAtIso = oneYearLater.toISOString();

    // 1. Update store record & notify parent state (App.tsx)
    const updated = await storeService.updateStore(store.id, {
      plan: planSlug,
      planExpiresAt: expiresAtIso,
      planSubscribedAt: paidAtIso,
      layoutSettings: {
        ...(store.layoutSettings || {}),
        planExpiresAt: expiresAtIso,
        planSubscribedAt: paidAtIso,
      }
    }, store.merchantId);
    onUpdateStore(updated);

    // 2. Mark subscription as paid
    await billingPlanService.updateSubscriptionStatus(sub.id, 'paid', {
      paidAt: paidAtIso,
      expiresAt: expiresAtIso,
      orderId: sub.orderId,
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
        status: s.status === 'paid' ? (isEn ? 'Paid (Duitku)' : 'Lunas (Duitku)') : (s.status === 'cancelled' ? (isEn ? 'Cancelled' : 'Dibatalkan') : (isEn ? 'Pending Payment' : 'Menunggu Pembayaran')),
      }))
    );

    const formattedExpiryDate = oneYearLater.toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // 5. Open Celebration Confirmation Modal
    setSuccessSubscription({
      planName: sub.planName,
      planSlug,
      expiryDate: formattedExpiryDate,
      invoiceNumber: sub.invoiceNumber,
      amount: sub.amount,
      paymentMethod: sub.paymentMethod || 'Duitku Payment Gateway',
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
   * Query status from Duitku and activate plan if settlement is detected
   */
  const handleCheckPaymentStatus = async (sub: BillingSubscription, forceActivateDev = false) => {
    setIsVerifying(true);
    try {
      if (forceActivateDev) {
        await handleActivatePlan(sub);
        return;
      }

      if (!sub.orderId) {
        if (onShowNotification) {
          onShowNotification(isEn ? 'Order ID not found for status verification.' : 'ID pesanan tidak valid untuk pengecekan status.');
        }
        return;
      }

      const checkRes = await duitkuService.checkTransactionStatus(sub.orderId);
      if (checkRes.isPaid) {
        await handleActivatePlan(sub);
      } else {
        if (onShowNotification) {
          const msg = checkRes.statusMessage
            ? (isEn ? `Status Duitku: "${checkRes.statusMessage}". Pembayaran belum lunas.` : `Status transaksi Duitku: "${checkRes.statusMessage}". Pembayaran belum lunas.`)
            : (isEn ? 'Payment not detected yet. Please complete payment via Duitku.' : 'Pembayaran belum terdeteksi di Duitku. Silakan selesaikan pembayaran via Duitku.');
          onShowNotification(msg);
        }
      }
    } catch (err: any) {
      console.warn('Notice verifying payment:', err);
      if (onShowNotification) {
        onShowNotification(
          err?.message || (isEn ? 'Failed to connect to Duitku server.' : 'Gagal menghubungi server Duitku untuk verifikasi status.')
        );
      }
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Cancel pending subscription via custom confirmation modal
   */
  const handleConfirmCancelPayment = async () => {
    if (!pendingSubscription) return;
    setIsCancelling(true);
    try {
      await billingPlanService.updateSubscriptionStatus(pendingSubscription.id, 'cancelled');
      setPendingSubscription(null);
      const subs = billingPlanService.getStoreSubscriptions(store.id);
      setInvoices(
        subs.map((s) => ({
          id: s.invoiceNumber,
          plan: s.planName,
          cycle: s.cycle === 'yearly' ? (isEn ? 'Yearly' : 'Tahunan') : (isEn ? 'Monthly' : 'Bulanan'),
          date: new Date(s.paidAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: s.amount,
          status: s.status === 'paid' ? (isEn ? 'Paid (Duitku)' : 'Lunas (Duitku)') : (s.status === 'cancelled' ? (isEn ? 'Cancelled' : 'Dibatalkan') : (isEn ? 'Pending Payment' : 'Menunggu Pembayaran')),
        }))
      );
      setIsCancelModalOpen(false);
      if (onShowNotification) onShowNotification(isEn ? 'Pending payment cancelled.' : 'Tagihan pembayaran berhasil dibatalkan.');
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleExecuteUpgrade = async () => {
    if (!selectedPlanForUpgrade) return;
    setIsProcessing(true);

    const targetPlan = selectedPlanForUpgrade.slug;
    const price = targetPlan === 'free' ? 0 : selectedPlanForUpgrade.priceYearly;

    if (price === 0 || targetPlan === 'free') {
      // Set to Free
      const updated = await storeService.updateStore(store.id, { plan: 'free' }, store.merchantId);
      onUpdateStore(updated);
      setIsProcessing(false);
      setIsModalOpen(false);
      if (onShowNotification) onShowNotification('Paket toko dialihkan ke Paket Free (Gratis).');
      return;
    }

    const orderId = `BILL-${Date.now()}`;
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const activeChannelList = paymentCategory === 'qris' ? qrisChannels : vaChannels;
    const currentChannel =
      activeChannelList.find((c) => c.code === selectedChannelCode) ||
      activeChannelList[0] || {
        code: paymentCategory === 'qris' ? 'SP' : 'BC',
        name: paymentCategory === 'qris' ? 'ShopeePay QRIS' : 'BCA Virtual Account',
      };

    // Record subscription immediately so merchant has an invoice and orderId
    const recordedPending = await billingPlanService.recordSubscription({
      storeId: store.id,
      storeName: store.name,
      planId: selectedPlanForUpgrade.id,
      planName: selectedPlanForUpgrade.name,
      cycle: 'yearly',
      amount: price,
      status: 'pending',
      paymentMethod: `Duitku ${currentChannel.name}`,
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
      await duitkuService.payWithDuitku(
        {
          orderId,
          grossAmount: price,
          customerName: store.name,
          customerPhone: store.phoneWhatsApp,
          paymentMethod: currentChannel.code,
          productDetails: `Langganan ${selectedPlanForUpgrade.name} 1 Tahun`,
        },
        {
          onSuccess: async () => {
            setIsProcessing(false);
            setIsModalOpen(false);
            await handleActivatePlan(recordedPending);
          },
          onPending: async () => {
            setIsProcessing(false);
            setIsModalOpen(false);
            if (onShowNotification) {
              onShowNotification(
                isEn
                  ? 'Invoice created. Please complete payment.'
                  : 'Tagihan diterbitkan. Silakan selesaikan pembayaran.'
              );
            }
          },
          onError: (res) => {
            const errorMsg = isEn ? 'Duitku payment cancelled or failed.' : (res?.statusMessage || 'Pembayaran Duitku dibatalkan atau gagal.');
            if (onShowNotification) {
              onShowNotification(errorMsg);
            }
            setIsProcessing(false);
          },
          onClose: async () => {
            setIsProcessing(false);
            // On popup close, check if the payment was already settled
            const res = await duitkuService.checkTransactionStatus(orderId);
            if (res.isPaid) {
              setIsModalOpen(false);
              await handleActivatePlan(recordedPending);
            }
          },
        }
      );
    } catch (err: any) {
      console.error('Duitku payment error:', err);
      setIsProcessing(false);
      const errorMsg = isEn
        ? 'Failed to open Duitku payment: ' + (err?.message || 'Connection error.')
        : 'Gagal membuka pembayaran Duitku: ' + (err?.message || 'Terjadi kesalahan pada koneksi Duitku.');
      if (onShowNotification) {
        onShowNotification(errorMsg);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3.5 sm:space-y-4 animate-in fade-in duration-200 font-sans pb-16 lg:pb-8 text-left w-full">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav_dashboard', 'Dashboard'), onClick: onNavigateDashboard },
          { label: t('nav_billing', 'Paket Langganan'), isActive: true },
        ]}
      />

      {/* 1. Clean Page Header */}
      <div className="pb-2.5 border-b border-[#E5E0DD] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#1F1F1F] tracking-tight flex items-center gap-2">
            <Crown className="w-4.5 h-4.5 text-[#66000E]" />
            <span>{t('nav_billing', 'Paket Langganan')}</span>
          </h1>
        </div>

        {/* Top Controls: Current Plan Status & Riwayat Berlangganan Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
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
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F7] border border-[#E5E0DD] text-xs font-semibold text-[#241A1A] hover:text-[#66000E] hover:border-[#66000E] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#66000E]" />
            <span>{isEn ? 'Subscription History' : 'Riwayat Berlangganan'}</span>
          </button>
        </div>
      </div>

      {/* Active Annual Subscription Banner (When merchant has an active paid plan) */}
      {store.plan && store.plan !== 'free' && store.plan !== 'starter' && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 p-3.5 sm:p-4 shadow-2xs text-left transition hover:shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Crown className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    {isEn ? 'Active Plan (1 Year)' : 'Paket Aktif (1 Tahun)'}
                  </span>
                  {store.planExpiresAt && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                      {Math.max(0, Math.ceil((new Date(store.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} {isEn ? 'days remaining' : 'hari tersisa'}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <span>{store.plan === 'community' ? 'Community UMKM' : (store.plan === 'personal' ? 'Personal Toko' : store.plan)}</span>
                  <span className="text-xs font-normal text-gray-500">
                    • {isEn ? 'Active until' : 'Berlaku s/d'}{' '}
                    <strong className="text-gray-700 font-semibold">
                      {store.planExpiresAt
                        ? new Date(store.planExpiresAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : (isEn ? '1 Year Ahead' : '1 Tahun Penuh')}
                    </strong>
                  </span>
                </h3>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600/10 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isEn ? 'Live & Protected' : 'Toko Berlangganan Aktif'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pending Subscription Banner - Compact & Clean */}
      {pendingSubscription && (
        <div className="rounded-2xl border border-amber-300 border-l-[3.5px] border-l-amber-500 bg-amber-50/50 p-3 sm:p-3.5 shadow-2xs text-left transition hover:shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {isEn ? 'Payment Pending' : 'Menunggu Pembayaran'}
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-[#1F1F1F] flex items-center gap-1.5 flex-wrap">
                  <span>{getPlanName(pendingSubscription.planName)}</span>
                  <span className="text-[#66000E] font-black">
                    ({formatRupiah(pendingSubscription.amount === 35000 ? 350000 : (pendingSubscription.amount === 99000 ? 1000000 : pendingSubscription.amount))} / tahun)
                  </span>
                </h3>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap sm:flex-nowrap">
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => handleCheckPaymentStatus(pendingSubscription)}
                className="px-3.5 py-1.5 rounded-lg bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
                title={isEn ? 'Check latest payment status with Duitku' : 'Cek status pembayaran terbaru dengan Duitku'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? (isEn ? 'Checking...' : 'Memeriksa...') : (isEn ? 'Check Payment Status' : 'Cek Status Pembayaran')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCheckPaymentStatus(pendingSubscription, true)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-[11px] transition cursor-pointer shadow-2xs"
                title="Simulasi pelunasan instan untuk pengujian sandbox"
              >
                <span>{isEn ? '⚡ Simulate Paid (Dev)' : '⚡ Simulasi Lunas'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-gray-600 hover:text-red-700 border border-[#E5E0DD] hover:border-red-200 text-xs font-semibold transition cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pricing Cards Grid (Compact, Balanced SaaS Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch pt-1">
        {plans.map((plan) => {
          const targetPlanSlug = resolvePlanSlug(plan.slug);
          const isCurrent = targetPlanSlug === currentPlan;
          const isStorePaid = currentPlan !== 'free';
          const price = plan.priceYearly;

          // Filter out redundant breakdown items and limit to top 4 highlights to keep card squarish and compact
          const displayFeatures = plan.features.filter((feat) => {
            const clean = feat.trim();
            if (/^Hosting Server:/i.test(clean)) return false;
            if (/^Jasa Micro CMS:/i.test(clean)) return false;
            if (plan.badge && clean.toLowerCase().includes(plan.badge.toLowerCase())) return false;
            return true;
          }).slice(0, 4);

          return (
            <div
              key={plan.id}
              className={`rounded-2xl bg-white p-3.5 sm:p-4 border transition-all duration-200 flex flex-col justify-between relative shadow-2xs hover:shadow-xs ${
                isCurrent
                  ? 'border-2 border-[#66000E] ring-3 ring-[#66000E]/5'
                  : plan.badge
                    ? 'border-amber-400 ring-1 ring-amber-400/30'
                    : 'border-[#E5E0DD]'
              }`}
            >
              <div className="flex-1 flex flex-col">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 min-h-[32px]">
                  <div>
                    {plan.badge && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white shadow-2xs inline-block mb-1">
                        ★ {getPlanBadge(plan.badge)}
                      </span>
                    )}
                    <h3 className="font-bold text-sm sm:text-base text-[#241A1A] leading-tight">{getPlanName(plan.name)}</h3>
                  </div>
                  {isCurrent && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                        {isEn ? 'Active' : 'Aktif'}
                      </span>
                      {isStorePaid && plan.slug !== 'free' && store.planExpiresAt && (
                        <span className="text-[9px] text-gray-500 font-medium block mt-0.5">
                          s/d {new Date(store.planExpiresAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[#706866] mt-0.5 line-clamp-1">{getPlanTagline(plan.tagline)}</p>

                {/* Price */}
                <div className="py-2 border-y border-[#F0ECE9] my-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-[#241A1A] tracking-tight">
                      {price === 0 ? (isEn ? 'Free' : 'Gratis') : formatRupiah(price)}
                    </span>
                    <span className="text-[11px] text-[#706866]">
                      {price === 0 ? '' : isEn ? '/ year' : '/ tahun'}
                    </span>
                  </div>
                </div>

                {/* Compact Transparent Breakdown Tag */}
                {plan.hostingPriceYearly !== undefined && plan.cmsPriceYearly !== undefined && price > 0 ? (
                  <div className="flex items-center justify-between text-[10px] text-[#706866] bg-[#FAF7F7] px-2 py-1 rounded-md border border-[#E5E0DD]/70 mb-2.5">
                    <span>Hosting: <strong className="text-[#241A1A]">{formatRupiah(plan.hostingPriceYearly)}</strong></span>
                    <span className="text-gray-300">•</span>
                    <span>CMS: <strong className="text-[#241A1A]">{formatRupiah(plan.cmsPriceYearly)}</strong></span>
                  </div>
                ) : (
                  <div className="text-[10px] text-[#706866] bg-[#FAF7F7] px-2 py-1 rounded-md border border-[#E5E0DD]/70 mb-2.5 flex items-center justify-between">
                    <span>{isEn ? 'Community Hosting Free' : 'Hosting Komunitas Gratis'}</span>
                    <span className="text-emerald-700 font-bold">Rp 0</span>
                  </div>
                )}

                {/* Features List (Compact 4 Key Items) */}
                <ul className="space-y-1.5 text-[11px] text-[#241A1A] mb-3 flex-1">
                  {displayFeatures.map((feat, idx) => {
                    const isNegative = feat.startsWith('❌');
                    return (
                      <li key={idx} className={`flex items-start gap-1.5 leading-snug ${isNegative ? 'text-gray-400 line-through' : ''}`}>
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isNegative ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isNegative ? <X className="w-2 h-2 stroke-[3]" /> : <Check className="w-2 h-2 stroke-[3]" />}
                        </div>
                        <span className="line-clamp-1">{getPlanFeature(feat.replace(/^❌\s*/, ''))}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-1 mt-auto">
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => handleOpenUpgrade(plan)}
                  className={`w-full py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
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

      {/* Modal: Riwayat Berlangganan & Tagihan (Responsive, Constrained Height & Clean Layout) */}
      {isHistoryOpen && (
        <div
          onClick={() => setIsHistoryOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl p-4 sm:p-6 border border-[#E5E0DD] shadow-2xl flex flex-col animate-in zoom-in-95 duration-150 text-left"
          >
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between pb-3.5 border-b border-[#E5E0DD]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F5E8EA] border border-[#66000E]/20 text-[#66000E] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-[#1F1F1F]">{isEn ? 'Subscription History' : 'Riwayat Berlangganan'}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {invoices.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#706866] mt-0.5">{isEn ? 'Transaction history of your store subscription plan' : 'Catatan transaksi paket langganan toko Anda'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                title={isEn ? 'Close' : 'Tutup'}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Table */}
            <div className="flex-1 overflow-hidden my-3.5 flex flex-col min-h-0">
              {invoices.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2.5 my-auto">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-sm text-[#1F1F1F]">{isEn ? 'No subscription history yet' : 'Belum ada riwayat langganan'}</p>
                  <p className="text-xs text-[#706866] max-w-sm mx-auto">
                    {isEn ? 'Invoices for your plan upgrades will automatically appear here.' : 'Daftar invoice dan transaksi upgrade paket toko Anda akan otomatis tercatat di sini.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-auto border border-[#E5E0DD] rounded-2xl bg-white shadow-2xs max-h-[50vh] sm:max-h-[52vh]">
                  <table className="w-full text-xs text-left text-[#1F1F1F]">
                    <thead className="sticky top-0 z-10 bg-[#FAF7F7] text-[#706866] border-b border-[#E5E0DD] shadow-2xs">
                      <tr>
                        <th className="py-2.5 px-3.5 font-semibold whitespace-nowrap">{isEn ? 'Invoice No.' : 'No. Invoice'}</th>
                        <th className="py-2.5 px-3.5 font-semibold whitespace-nowrap">{isEn ? 'Plan' : 'Paket'}</th>
                        <th className="py-2.5 px-3.5 font-semibold whitespace-nowrap">{isEn ? 'Cycle' : 'Siklus'}</th>
                        <th className="py-2.5 px-3.5 font-semibold whitespace-nowrap">{isEn ? 'Date' : 'Tanggal'}</th>
                        <th className="py-2.5 px-3.5 font-semibold whitespace-nowrap">{isEn ? 'Total' : 'Total'}</th>
                        <th className="py-2.5 px-3.5 font-semibold whitespace-nowrap">{isEn ? 'Status' : 'Status'}</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right whitespace-nowrap">{isEn ? 'Action' : 'Aksi'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF7F7]">
                      {invoices.map((inv) => {
                        const isPaid = /lunas|paid/i.test(inv.status);
                        const isCancelled = /batal|cancel/i.test(inv.status);
                        const statusBadgeClass = isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isCancelled
                          ? 'bg-gray-100 text-gray-600 border-gray-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200';

                        return (
                          <tr key={inv.id} className="hover:bg-[#FAF7F7]/70 transition">
                            <td className="py-3 px-3.5 font-mono text-[11px] font-semibold text-gray-700 whitespace-nowrap">
                              <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md">
                                {inv.id}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 font-bold text-[#1F1F1F] whitespace-nowrap">{getPlanName(inv.plan)}</td>
                            <td className="py-3 px-3.5 text-[#706866] whitespace-nowrap">{inv.cycle}</td>
                            <td className="py-3 px-3.5 text-[#706866] whitespace-nowrap">{inv.date}</td>
                            <td className="py-3 px-3.5 font-bold text-[#66000E] whitespace-nowrap">{formatRupiah(inv.amount)}</td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${statusBadgeClass}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setViewingInvoice(inv)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F7] hover:bg-[#F5E8EA] text-[#66000E] hover:text-[#801010] border border-[#E5E0DD] hover:border-[#66000E]/30 font-semibold text-xs transition cursor-pointer"
                                title={isEn ? 'View & Download Official Invoice' : 'Lihat & Unduh Bukti Invoice Resmi'}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{isEn ? 'Download' : 'Unduh'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 pt-3 border-t border-[#E5E0DD] flex items-center justify-between gap-3">
              <span className="text-xs text-[#706866]">
                {isEn ? `Total: ${invoices.length} transaction records` : `Total: ${invoices.length} catatan transaksi`}
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E0DD] bg-white text-xs font-semibold text-[#706866] hover:bg-[#FAF7F7] hover:text-[#1F1F1F] transition cursor-pointer"
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

            {/* Category & Provider Selection from Duitku */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#241A1A] block">
                {isEn ? 'Select Payment Method:' : 'Pilih Metode Pembayaran:'}
              </label>

              {/* Category Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectCategory('qris')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer font-bold text-xs ${
                    paymentCategory === 'qris'
                      ? 'border-[#66000E] bg-[#F5E8EA]/60 text-[#66000E] shadow-2xs'
                      : 'border-[#E5E0DD] bg-white text-[#706866] hover:bg-[#FAF7F7]'
                  }`}
                >
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>{isEn ? 'Instant QRIS' : 'QRIS Instan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCategory('va')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer font-bold text-xs ${
                    paymentCategory === 'va'
                      ? 'border-[#66000E] bg-[#F5E8EA]/60 text-[#66000E] shadow-2xs'
                      : 'border-[#E5E0DD] bg-white text-[#706866] hover:bg-[#FAF7F7]'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>{isEn ? 'Virtual Account' : 'Virtual Account'}</span>
                </button>
              </div>

              {/* Sub-label for Provider Selection */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500">
                  {paymentCategory === 'qris'
                    ? (isEn ? 'Choose QRIS / E-Wallet Provider:' : 'Pilih Penyedia QRIS / E-Wallet:')
                    : (isEn ? 'Choose Bank Virtual Account:' : 'Pilih Bank Virtual Account:')}
                </span>
                {channelsLoading && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>{isEn ? 'Loading channels...' : 'Memuat saluran Duitku...'}</span>
                  </span>
                )}
              </div>

              {/* Provider List / Grid with Real Duitku Logos */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {(paymentCategory === 'qris' ? qrisChannels : vaChannels).map((channel) => {
                  const isSelected = selectedChannelCode === channel.code;
                  return (
                    <div
                      key={channel.code}
                      onClick={() => setSelectedChannelCode(channel.code)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'border-[#66000E] bg-[#F5E8EA]/40 ring-1 ring-[#66000E]'
                          : 'border-[#E5E0DD] bg-white hover:bg-[#FAF7F7] hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Channel Logo */}
                        <div className="w-9 h-6.5 rounded-md border border-[#E5E0DD] bg-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden shadow-2xs">
                          {channel.image ? (
                            <img
                              src={channel.image}
                              alt={channel.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="font-bold text-[9px] text-gray-600">{channel.code}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-bold text-xs text-[#241A1A] truncate">{channel.name}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1.5">
                            {channel.badge && (
                              <span className="text-emerald-700 font-medium">{channel.badge}</span>
                            )}
                            {channel.fee && Number(channel.fee) > 0 ? (
                              <span>• Biaya: {formatRupiah(Number(channel.fee))}</span>
                            ) : (
                              <span>• Bebas Biaya Admin</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Radio Selection Dot */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#66000E] bg-[#66000E] text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteUpgrade}
                className="w-full py-3 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isProcessing
                    ? (isEn ? 'Processing Transaction...' : 'Memproses Transaksi...')
                    : (isEn
                        ? `Pay Now via Duitku (${(paymentCategory === 'qris' ? qrisChannels : vaChannels).find((c) => c.code === selectedChannelCode)?.name || 'Duitku'})`
                        : `Bayar via Duitku (${(paymentCategory === 'qris' ? qrisChannels : vaChannels).find((c) => c.code === selectedChannelCode)?.name || 'Duitku'})`)}
                </span>
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

      {/* MODAL KONFIRMASI BERHASIL BERLANGGANAN (CELEBRATION CONFIRMATION MODAL) */}
      {successSubscription && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-left relative overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-[#66000E] to-amber-500" />

            {/* Header Icon & Title */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/25 ring-8 ring-emerald-50">
                <Crown className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isEn ? 'Payment Verified & Active' : 'Pembayaran Lunas & Terverifikasi'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1F1F1F] tracking-tight">
                {isEn ? '🎉 Subscription Activated Successfully!' : '🎉 Selamat! Toko Anda Berhasil Berlangganan!'}
              </h3>
              <p className="text-xs text-[#706866] max-w-sm mx-auto leading-relaxed">
                {isEn
                  ? 'Your store is now upgraded and all premium features are active for 1 full year.'
                  : 'Paket langganan tahunan toko Anda telah resmi aktif. Semua fitur unggulan siap digunakan.'}
              </p>
            </div>

            {/* Summary Detail Card */}
            <div className="bg-[#FAF7F7] p-4 rounded-2xl border border-[#E5E0DD] space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
                <span className="text-[#706866]">{isEn ? 'Store Name:' : 'Nama Toko:'}</span>
                <span className="font-bold text-[#1F1F1F]">{store.name}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
                <span className="text-[#706866]">{isEn ? 'Active Plan:' : 'Paket Langganan:'}</span>
                <span className="font-black text-[#66000E] text-sm bg-white px-2.5 py-0.5 rounded-lg border border-[#66000E]/20 shadow-2xs">
                  {getPlanName(successSubscription.planName)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
                <span className="text-[#706866]">{isEn ? 'Active Period:' : 'Masa Berlaku:'}</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {isEn ? '1 Full Year (365 Days)' : '1 Tahun Penuh (365 Hari)'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E0DD]">
                <span className="text-[#706866]">{isEn ? 'Valid Until:' : 'Berlaku Hingga:'}</span>
                <strong className="text-[#1F1F1F] font-bold">{successSubscription.expiryDate}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#706866]">{isEn ? 'Invoice Reference:' : 'No. Invoice:'}</span>
                <span className="font-mono font-semibold text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                  {successSubscription.invoiceNumber}
                </span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                {isEn ? 'Active Features Unlocked:' : 'Fitur Toko Yang Kini Aktif:'}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#241A1A]">
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[3]" />
                  <span className="font-medium line-clamp-1">{isEn ? 'Duitku QRIS & VA' : 'Checkout Duitku Otomatis'}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[3]" />
                  <span className="font-medium line-clamp-1">{isEn ? 'Biteship Shipping' : 'Ekspedisi Kurir Biteship'}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[3]" />
                  <span className="font-medium line-clamp-1">{isEn ? 'Custom Domain Ready' : 'Dukungan Custom Domain'}</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[3]" />
                  <span className="font-medium line-clamp-1">{isEn ? 'White-Label Branding' : 'Bebas Watermark 100%'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSuccessSubscription(null);
                  if (onNavigateDashboard) onNavigateDashboard();
                }}
                className="w-full py-3 rounded-xl bg-[#66000E] hover:bg-[#801010] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isEn ? 'Go to Store Dashboard' : 'Mulai Kelola Toko (Dashboard)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const foundInv = invoices.find((inv) => inv.id === successSubscription.invoiceNumber);
                    if (foundInv) {
                      setViewingInvoice(foundInv);
                    } else {
                      setViewingInvoice({
                        id: successSubscription.invoiceNumber,
                        plan: successSubscription.planName,
                        cycle: isEn ? 'Yearly (1 Year)' : 'Tahunan (1 Tahun)',
                        date: new Date().toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                        amount: successSubscription.amount,
                        status: isEn ? 'Paid (Duitku)' : 'Lunas (Duitku)',
                      });
                    }
                    setSuccessSubscription(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5E0DD] bg-white hover:bg-[#FAF7F7] text-xs font-semibold text-[#241A1A] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#66000E]" />
                  <span>{isEn ? 'View Invoice' : 'Lihat Invoice Resmi'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSuccessSubscription(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#706866] hover:text-[#1F1F1F] hover:bg-gray-100 transition cursor-pointer"
                >
                  {isEn ? 'Close' : 'Tutup'}
                </button>
              </div>
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

      {/* Modal: Konfirmasi Pembatalan Tagihan (Custom UI instead of browser dialog) */}
      {isCancelModalOpen && pendingSubscription && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E5E0DD] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-start justify-between pb-3 border-b border-[#FAF7F7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1F1F1F]">
                    {isEn ? 'Cancel Payment?' : 'Batalkan Tagihan Pembayaran?'}
                  </h3>
                  <p className="text-[11px] text-[#706866]">
                    {isEn ? 'Invoice cancellation confirmation' : 'Konfirmasi pembatalan tagihan'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#706866] leading-relaxed">
              {isEn
                ? 'Are you sure you want to cancel this pending payment? You can choose or re-subscribe to any plan anytime.'
                : 'Apakah Anda yakin ingin membatalkan tagihan pembayaran yang sedang menunggu ini? Anda tetap dapat memilih dan berlangganan paket kembali kapan saja.'}
            </p>

            <div className="bg-[#FAF7F7] p-3.5 rounded-2xl border border-[#E5E0DD] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#706866] text-[11px] block">{isEn ? 'Selected Plan:' : 'Paket Langganan:'}</span>
                <span className="font-bold text-[#1F1F1F] text-sm">{getPlanName(pendingSubscription.planName)}</span>
              </div>
              <div className="text-right">
                <span className="text-[#706866] text-[11px] block">{isEn ? 'Total Cost:' : 'Nominal:'}</span>
                <span className="font-black text-[#66000E] text-sm">
                  {formatRupiah(pendingSubscription.amount === 35000 ? 350000 : (pendingSubscription.amount === 99000 ? 1000000 : pendingSubscription.amount))}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E0DD] bg-white hover:bg-gray-50 text-xs font-semibold text-[#706866] hover:text-[#1F1F1F] transition cursor-pointer text-center disabled:opacity-50"
              >
                {isEn ? 'Keep Payment' : 'Kembali'}
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancelPayment}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isCancelling ? (isEn ? 'Cancelling...' : 'Membatalkan...') : (isEn ? 'Yes, Cancel' : 'Ya, Batalkan')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
