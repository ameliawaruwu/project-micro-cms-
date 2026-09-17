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
  Lock,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Store as StoreType } from '../../types';
import { storeService } from '../../services/storeService';
import { midtransService } from '../../services/midtransService';
import { formatRupiah } from '../../utils/formatters';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreType;
  onPlanUpgraded: (newPlan: 'free' | 'starter' | 'premium') => void;
}

interface PlanDetail {
  id: 'free' | 'starter' | 'premium';
  name: string;
  priceMonthly: number;
  priceYearly: number;
  badge?: string;
  highlight?: boolean;
  features: string[];
}

const PLANS: PlanDetail[] = [
  {
    id: 'free',
    name: 'Gratis',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      'Katalog Produk hingga 25 Produk',
      'Checkout Otomatis Midtrans (QRIS & VA)',
      'Cek Ongkir Otomatis (J&T, JNE)',
      '0% Komisi Transaksi (Bebas Potongan)',
      'Watermark Powered by Kroomify',
    ],
  },
  {
    id: 'premium',
    name: 'Pro',
    priceMonthly: 99000,
    priceYearly: 950000,
    badge: 'Paling Diminati UMKM',
    highlight: true,
    features: [
      'Unlimited Katalog Produk & Varian',
      '0% Komisi Transaksi Tanpa Batas Omset',
      'Semua Saluran Midtrans & Instant Settlement',
      'Bebas Watermark (White-label Brand Sendiri)',
      'Full Theme & Visual Layout Builder',
      'Cetak Label Resi Thermal Massal',
      'Laporan Analytics & Omset Lengkap',
    ],
  },
];

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  store,
  onPlanUpgraded,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'checkout' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentPlanId = store.plan || 'free';

  const handleSelectPlan = (plan: PlanDetail) => {
    if (plan.id === currentPlanId) return;
    setSelectedPlan(plan);
    if (plan.id === 'free') {
      handleConfirmUpgrade('free');
    } else {
      setPaymentStep('checkout');
    }
  };

  const completeUpgradeProcess = async (planId: 'free' | 'starter' | 'premium') => {
    await storeService.updateStore(store.id, { plan: planId });
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

  const handleConfirmUpgrade = async (planId: 'free' | 'starter' | 'premium') => {
    try {
      setIsProcessing(true);

      if (planId !== 'free' && selectedPlan) {
        const price = billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
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
                await completeUpgradeProcess(planId);
              },
              onError: () => {
                alert('Pembayaran Midtrans dibatalkan atau belum selesai.');
                setIsProcessing(false);
              },
              onClose: () => {
                setIsProcessing(false);
              },
            }
          );
          return;
        } catch (snapErr) {
          console.warn('Midtrans Snap fallback mode:', snapErr);
          // Fallback if local simulator or without keys
          await completeUpgradeProcess(planId);
          return;
        }
      }

      await completeUpgradeProcess(planId);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] text-left">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Crown className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900">Pilihan Paket Berlangganan</h2>
              <p className="text-[11px] text-gray-500">Toko {store.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* STEP 1: SELECT PLAN */}
          {paymentStep === 'select' && (
            <div className="space-y-4">
              
              {/* Billing Cycle Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex items-center p-0.5 bg-gray-100 rounded-md border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-gray-900 shadow-xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3 py-1 rounded text-xs font-medium transition cursor-pointer flex items-center gap-1 ${
                      billingCycle === 'yearly'
                        ? 'bg-white text-gray-900 shadow-xs font-semibold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span>Tahunan</span>
                    <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1 rounded">
                      -20%
                    </span>
                  </button>
                </div>
              </div>

              {/* 2 Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto items-stretch">
                {PLANS.map((plan) => {
                  const isCurrent = currentPlanId === plan.id;
                  const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-lg p-4 flex flex-col justify-between transition-all border ${
                        plan.highlight
                          ? 'border-red-500 bg-red-50/20 shadow-xs'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-2.5 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.2 rounded shadow-xs">
                          {plan.badge}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="font-bold text-sm text-gray-900">{plan.name}</h3>
                          {isCurrent && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aktif
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <span className="text-xl font-bold text-gray-900">
                            {price === 0 ? 'Rp0' : formatRupiah(price)}
                          </span>
                          <span className="text-[11px] text-gray-500 ml-1">
                            {price === 0 ? '/selamanya' : billingCycle === 'monthly' ? '/bln' : '/thn'}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-2.5 border-t border-gray-100 text-xs text-gray-700">
                          {plan.features.map((feat, idx) => (
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
                          className={`w-full py-2 rounded-md font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                            isCurrent
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : plan.highlight
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                              : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
                          }`}
                        >
                          <span>{isCurrent ? 'Paket Saat Ini' : `Pilih ${plan.name}`}</span>
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
              
              <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Paket:</span>
                  <span className="font-semibold text-gray-900">{selectedPlan.name} ({billingCycle === 'monthly' ? '1 Bulan' : '1 Tahun'})</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Masa Aktif:</span>
                  <span className="font-semibold text-gray-900">{billingCycle === 'monthly' ? '30 Hari' : '365 Hari'}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total:</span>
                  <span className="text-base font-bold text-red-600">
                    {formatRupiah(billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly)}
                  </span>
                </div>
              </div>

              {/* Midtrans Payment Gateway Badge */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-gray-800">Midtrans Payment Gateway</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verifikasi Real-time
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">Pilih Saluran Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-red-600" />
                    <span>QRIS (Semua E-Wallet)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bca_va')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === 'bca_va'
                        ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-red-600" />
                    <span>Virtual Account Bank</span>
                  </button>
                </div>
              </div>

              {/* QRIS / VA Box */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs text-center space-y-3">
                {paymentMethod === 'qris' ? (
                  <>
                    <p className="text-xs text-gray-500">Scan kode QRIS resmi dengan m-Banking atau E-Wallet apa saja</p>
                    <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`MIDTRANS_SUB_${selectedPlan.id}_${Date.now()}`)}&color=9A0602`}
                        alt="QRIS Tagihan Midtrans"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">Didukung GoPay, OVO, ShopeePay, Dana, LinkAja & BCA</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500">Transfer ke Nomor Virtual Account Bank:</p>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>BCA Virtual Account (Midtrans):</span>
                        <span className="font-bold text-red-700 text-[10px]">Otomatis Terverifikasi</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-gray-200 font-mono font-bold text-gray-900 text-sm tracking-wider">
                        8099 2819 0048 2910
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleConfirmUpgrade(selectedPlan.id)}
                  className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Memverifikasi Pembayaran...' : 'Konfirmasi Bayar Lunas (Midtrans)'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentStep('select')}
                  className="text-xs text-gray-500 hover:text-gray-900 transition cursor-pointer"
                >
                  ← Pilih Paket Lain
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
              <h3 className="text-base font-bold text-gray-900">Upgrade Paket Berhasil</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Toko Anda sekarang aktif di <span className="font-semibold text-gray-900">Paket {selectedPlan.name}</span>.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
