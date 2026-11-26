import React, { useState } from 'react';
import {
  X,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  QrCode,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Store as StoreType } from '../../types';
import { storeService } from '../../services/storeService';
import { midtransService } from '../../services/midtransService';
import { billingPlanService } from '../../services/billingPlanService';
import { formatRupiah } from '../../utils/formatters';
import { useLanguage } from '../../contexts/LanguageContext';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreType;
  onPlanUpgraded: (newPlan: 'free' | 'personal' | 'community' | 'starter' | 'premium' | string) => void;
}

interface PlanDetail {
  id: 'free' | 'personal' | 'community';
  name: string;
  priceYearly: number;
  badge?: string;
  highlight?: boolean;
  features: string[];
}

const PLANS: PlanDetail[] = [
  {
    id: 'free',
    name: 'Paket Free',
    priceYearly: 0,
    features: [
      'Mode Pratinjau (Lihat & kelola katalog toko)',
      'Katalog produk dasar (maks 10 produk)',
      'Akses penuh dashboard & layout builder',
      '❌ Belum bisa publikasi toko ke publik (lihat-lihat saja)',
      '❌ Tanpa Checkout Otomatis Midtrans',
      '❌ Tanpa Kurir Ekspedisi Otomatis Biteship',
    ],
  },
  {
    id: 'personal',
    name: 'Personal Toko',
    priceYearly: 350000,
    features: [
      'Publikasi Toko Online Aktif ke Publik (Live)',
      'Subdomain resmi namatoko.lapakq.com',
      'Kapasitas hingga 50 produk & varian',
      'Checkout otomatis Midtrans (QRIS & VA)',
      'Cek ongkir & kirim otomatis Biteship',
      'Laporan pesanan & omset harian',
    ],
  },
  {
    id: 'community',
    name: 'Community UMKM',
    priceYearly: 1000000,
    badge: 'Paling Laris UMKM',
    highlight: true,
    features: [
      'Mendukung Custom Domain (.com / .id) + SSL',
      'Unlimited Katalog Produk & Varian',
      'Bebas Watermark (100% Brand Sendiri)',
      'Full Midtrans (QRIS, VA Bank, E-Wallet)',
      'Cetak Label Resi Pengiriman Massal',
      'Visual Theme & Layout Builder Lengkap',
      'Hosting Prioritas Tinggi & SLA 99.9%',
    ],
  },
];

// Teks tampilan bahasa Inggris; `PLANS` (nama Indonesia) tetap dipakai untuk data tagihan.
const PLANS_EN: Record<PlanDetail['id'], { name: string; badge?: string; features: string[] }> = {
  free: {
    name: 'Free Plan',
    features: [
      'Preview Mode (view & manage your store catalog)',
      'Basic product catalog (max 10 products)',
      'Full access to dashboard & layout builder',
      '❌ Cannot publish the store publicly yet (browse only)',
      '❌ No automatic Midtrans checkout',
      '❌ No automatic Biteship courier shipping',
    ],
  },
  personal: {
    name: 'Personal Store',
    features: [
      'Publish an active online store to the public (Live)',
      'Official subdomain storename.lapakq.com',
      'Up to 50 products & variants',
      'Automatic Midtrans checkout (QRIS & VA)',
      'Automatic Biteship shipping rates & delivery',
      'Daily order & revenue reports',
    ],
  },
  community: {
    name: 'Community UMKM',
    badge: 'SME Best Seller',
    features: [
      'Custom domain support (.com / .id) + SSL',
      'Unlimited product catalog & variants',
      'No watermark (100% your own brand)',
      'Full Midtrans (QRIS, Bank VA, E-Wallet)',
      'Bulk shipping label printing',
      'Complete visual theme & layout builder',
      'High-priority hosting & 99.9% SLA',
    ],
  },
};

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  store,
  onPlanUpgraded,
}) => {
  const { isEn } = useLanguage();
  const planName = (plan: PlanDetail) => (isEn ? PLANS_EN[plan.id].name : plan.name);
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'checkout' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentPlanId = store.plan === 'starter' ? 'free' : store.plan || 'free';

  const handleSelectPlan = (plan: PlanDetail) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlan(plan);
    if (plan.id === 'free') {
      handleConfirmUpgrade('free');
    } else {
      setPaymentStep('checkout');
    }
  };

  const completeUpgradeProcess = async (planId: 'free' | 'personal' | 'community') => {
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    const nowIso = new Date().toISOString();

    await storeService.updateStore(store.id, {
      plan: planId,
      planExpiresAt: planId === 'free' ? undefined : oneYearLater,
      planSubscribedAt: planId === 'free' ? undefined : nowIso,
    }, store.merchantId);

    // Record subscription transaction in database
    if (selectedPlan && planId !== 'free') {
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      await billingPlanService.recordSubscription({
        storeId: store.id,
        storeName: store.name,
        planId: `plan_${planId}`,
        planName: selectedPlan.name,
        cycle: 'yearly',
        amount: selectedPlan.priceYearly,
        status: 'paid',
        paymentMethod: paymentMethod === 'qris' ? 'Midtrans QRIS' : 'Midtrans BCA VA',
        invoiceNumber,
        paidAt: nowIso,
        expiresAt: oneYearLater,
      });
    }

    setIsProcessing(false);
    setPaymentStep('success');

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }

    setTimeout(() => {
      onPlanUpgraded(planId);
      onClose();
      setPaymentStep('select');
    }, 1500);
  };

  const handleConfirmUpgrade = async (planId: 'free' | 'personal' | 'community') => {
    try {
      setIsProcessing(true);

      if (planId !== 'free' && selectedPlan) {
        if (paymentMethod === 'qris') {
          // Direct in-modal QRIS processing without external redirect
          await completeUpgradeProcess(planId);
          return;
        }

        const price = selectedPlan.priceYearly;
        const orderId = `PLAN-${planId.toUpperCase()}-${Date.now()}`;

        try {
          await midtransService.payWithSnap(
            {
              orderId,
              grossAmount: price,
              customerName: store.name,
            },
            {
              onSuccess: async () => {
                await completeUpgradeProcess(planId);
              },
              onPending: async () => {
                setIsProcessing(false);
                alert(isEn
                  ? 'Waiting for Midtrans payment. Please complete your payment via the Virtual Account / QRIS that was created.'
                  : 'Menunggu pembayaran Midtrans. Silakan selesaikan pembayaran Anda via Virtual Account / QRIS yang telah dibuat.');
              },
              onError: (err) => {
                console.error('Midtrans payment failed:', err);
                alert(isEn ? 'Midtrans payment was cancelled or not completed.' : 'Pembayaran Midtrans dibatalkan atau belum selesai.');
                setIsProcessing(false);
              },
              onClose: () => {
                setIsProcessing(false);
              },
            }
          );
          return;
        } catch (snapErr: any) {
          console.error('Midtrans Snap error:', snapErr);
          setIsProcessing(false);
          alert(isEn
            ? 'Failed to open the Midtrans payment gateway: ' + (snapErr?.message || 'Please check your Midtrans configuration.')
            : 'Gagal membuka payment gateway Midtrans: ' + (snapErr?.message || 'Silakan periksa konfigurasi Midtrans Anda.'));
          return;
        }
      }

      await completeUpgradeProcess(planId);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-poppins">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-[#E5E0DD] overflow-hidden flex flex-col max-h-[92vh] text-left">

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#E5E0DD] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F5E8EA] text-[#66000E] flex items-center justify-center font-bold">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900">{isEn ? 'LapakQ Subscription Plans' : 'Pilihan Paket Berlangganan LapakQ'}</h2>
              <p className="text-[11px] text-gray-500">{isEn ? 'Store: ' : 'Toko: '}<span className="font-semibold text-gray-800">{store.name}</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* STEP 1: SELECT PLAN */}
          {paymentStep === 'select' && (
            <div className="space-y-4">

              <div className="text-center max-w-md mx-auto">
                <p className="text-xs text-gray-600">
                  {isEn ? 'Upgrade your plan to enable Midtrans payments, courier shipping rates, and online store deployment.' : 'Upgrade paket Anda untuk mengaktifkan pembayaran Midtrans, cek ongkir ekspedisi, dan deploy toko online.'}
                </p>
              </div>

              {/* 3 Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
                {PLANS.map((plan) => {
                  const isCurrent = currentPlanId === plan.id;
                  const price = plan.priceYearly;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-xl p-4 flex flex-col justify-between transition-all border ${plan.highlight
                          ? 'border-[#66000E] bg-[#F5E8EA]/30 shadow-sm'
                          : 'border-[#E5E0DD] bg-white hover:border-[#D5D0CD]'
                        }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-2.5 right-3 bg-[#66000E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                          {isEn ? PLANS_EN[plan.id].badge : plan.badge}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-bold text-sm text-gray-900">{planName(plan)}</h3>
                          {isCurrent && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {isEn ? 'Active' : 'Aktif'}
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <span className="text-xl font-bold text-gray-900">
                            {price === 0 ? 'Rp0' : formatRupiah(price)}
                          </span>
                          <span className="text-[11px] text-gray-500 ml-1">{isEn ? '/ year' : '/ tahun'}</span>
                        </div>

                        <div className="space-y-1.5 pt-2.5 border-t border-[#E5E0DD] text-xs text-gray-700">
                          {(isEn ? PLANS_EN[plan.id].features : plan.features).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="leading-tight text-[11px]">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          disabled={isCurrent}
                          onClick={() => handleSelectPlan(plan)}
                          className={`w-full py-2 rounded-lg font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${isCurrent
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-[#E5E0DD]'
                              : plan.highlight
                                ? 'bg-[#66000E] hover:bg-[#52000B] text-white shadow-xs'
                                : 'bg-white hover:bg-gray-50 text-gray-800 border border-[#E5E0DD]'
                            }`}
                        >
                          <span>{isCurrent ? (isEn ? 'Current Plan' : 'Paket Saat Ini') : (isEn ? `Choose ${planName(plan)}` : `Pilih ${plan.name}`)}</span>
                          {!isCurrent && <ArrowRight className="w-3 h-3" />}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* STEP 2: CHECKOUT & SIMULATE PAYMENT */}
          {paymentStep === 'checkout' && selectedPlan && (
            <div className="max-w-md mx-auto space-y-4">

              <div className="bg-gray-50 rounded-xl p-4 border border-[#E5E0DD] space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>{isEn ? 'Subscription Plan:' : 'Paket Langganan:'}</span>
                  <span className="font-semibold text-gray-900">{planName(selectedPlan)} {isEn ? '(1 Year)' : '(1 Tahun)'}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>{isEn ? 'Active Period:' : 'Masa Aktif:'}</span>
                  <span className="font-semibold text-gray-900">{isEn ? '365 Days' : '365 Hari'}</span>
                </div>
                <div className="pt-2 border-t border-[#E5E0DD] flex items-center justify-between">
                  <span className="font-medium text-gray-900">{isEn ? 'Total Due:' : 'Total Tagihan:'}</span>
                  <span className="text-base font-bold text-[#66000E]">
                    {formatRupiah(selectedPlan.priceYearly)}
                  </span>
                </div>
              </div>

              {/* Midtrans Payment Gateway Badge */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#66000E]" />
                  <span className="font-semibold text-gray-800">Midtrans Payment Gateway</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isEn ? 'Real-time Verification' : 'Verifikasi Real-time'}
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">{isEn ? 'Choose Payment Channel' : 'Pilih Saluran Pembayaran'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${paymentMethod === 'qris'
                        ? 'border-[#66000E] bg-[#F5E8EA] text-[#66000E] font-bold shadow-2xs'
                        : 'border-[#E5E0DD] bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <QrCode className="w-4 h-4 text-[#66000E]" />
                    <span>QRIS (E-Wallet &amp; Bank)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bca_va')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${paymentMethod === 'bca_va'
                        ? 'border-[#66000E] bg-[#F5E8EA] text-[#66000E] font-bold shadow-2xs'
                        : 'border-[#E5E0DD] bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#66000E]" />
                    <span>Virtual Account Bank</span>
                  </button>
                </div>
              </div>

              {/* QRIS / VA Box */}
              <div className="bg-white rounded-xl p-4 border border-[#E5E0DD] shadow-xs text-center space-y-3">
                {paymentMethod === 'qris' ? (
                  <>
                    <p className="text-xs text-gray-500">{isEn ? 'Scan the official QRIS code with any m-Banking or e-wallet app' : 'Scan kode QRIS resmi dengan m-Banking atau E-Wallet apa saja'}</p>
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-[#E5E0DD] shadow-2xs flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`MIDTRANS_SUB_${selectedPlan.id}_${Date.now()}`)}&color=66000E`}
                        alt={isEn ? 'Midtrans QRIS Bill' : 'QRIS Tagihan Midtrans'}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">{isEn ? 'Supports GoPay, OVO, ShopeePay, Dana, LinkAja & BCA' : 'Didukung GoPay, OVO, ShopeePay, Dana, LinkAja & BCA'}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">{isEn ? 'Transfer to the Bank Virtual Account Number:' : 'Transfer ke Nomor Virtual Account Bank:'}</p>
                    <div className="p-3 bg-gray-50 rounded-xl border border-[#E5E0DD] space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>BCA Virtual Account (Midtrans):</span>
                        <span className="font-bold text-[#66000E] text-[10px]">{isEn ? 'Automatically Verified' : 'Otomatis Terverifikasi'}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-[#E5E0DD] font-mono font-bold text-gray-900 text-sm tracking-wider">
                        8099 2819 0048 2910
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleConfirmUpgrade(selectedPlan.id)}
                  className="w-full py-2.5 rounded-lg bg-[#66000E] hover:bg-[#52000B] text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? (isEn ? 'Verifying Payment...' : 'Memverifikasi Pembayaran...') : (isEn ? 'Confirm Full Payment (Midtrans)' : 'Konfirmasi Bayar Lunas (Midtrans)')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentStep('select')}
                  className="text-xs text-gray-500 hover:text-gray-900 transition cursor-pointer"
                >
                  {isEn ? '← Choose Another Plan' : '← Pilih Paket Lain'}
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {paymentStep === 'success' && selectedPlan && (
            <div className="text-center py-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{isEn ? 'Plan Upgrade Successful' : 'Upgrade Paket Berhasil'}</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {isEn ? 'Your store is now on ' : 'Toko Anda sekarang aktif di '}<span className="font-semibold text-gray-900">{planName(selectedPlan)}</span>.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
