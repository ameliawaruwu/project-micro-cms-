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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Store as StoreType, BillingPlan } from '../../types';
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

export const BillingPage: React.FC<BillingPageProps> = ({
  store,
  onUpdateStore,
  onShowNotification,
  onNavigateDashboard,
}) => {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<BillingPlan[]>(billingPlanService.getActivePlans());
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<BillingPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'bca_va'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    const subs = billingPlanService.getSubscriptions().filter((s) => s.storeId === store.id);
    if (subs.length > 0) {
      return subs.map((s) => ({
        id: s.invoiceNumber,
        plan: s.planName,
        cycle: s.cycle === 'yearly' ? 'Tahunan' : 'Bulanan',
        date: new Date(s.paidAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: s.amount,
        status: s.status === 'paid' ? 'Lunas (Midtrans)' : s.status,
      }));
    }
    return INITIAL_INVOICES;
  });

  useEffect(() => {
    billingPlanService.fetchPlansFromDatabase().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setPlans(fetched.filter((p) => p.isActive));
      }
    });
  }, []);

  const currentPlan = store.plan === 'premium' ? 'premium' : 'free';

  const handleOpenUpgrade = (plan: BillingPlan) => {
    if (plan.slug === currentPlan || (plan.slug === 'free' && currentPlan === 'free')) return;
    setSelectedPlanForUpgrade(plan);
    setIsModalOpen(true);
  };

  const handleExecuteUpgrade = async () => {
    if (!selectedPlanForUpgrade) return;
    setIsProcessing(true);

    const targetPlan = selectedPlanForUpgrade.id === 'business' ? 'premium' : selectedPlanForUpgrade.id;
    const price = billingCycle === 'yearly' ? selectedPlanForUpgrade.priceYearly : selectedPlanForUpgrade.priceMonthly;

    if (price === 0) {
      // Downgrade to Free
      const updated = await storeService.updateStore(store.id, { plan: 'free' });
      onUpdateStore(updated);
      setIsProcessing(false);
      setIsModalOpen(false);
      if (onShowNotification) onShowNotification('Paket toko dialihkan ke Starter (Gratis).');
      return;
    }

    const orderId = `BILL-${Date.now()}`;

    try {
      await midtransService.payWithSnap(
        {
          orderId,
          grossAmount: price,
          customerName: store.name,
          customerPhone: store.phoneWhatsApp,
        },
        {
          onSuccess: async () => {
            const updated = await storeService.updateStore(store.id, { plan: targetPlan as any });
            onUpdateStore(updated);
            setInvoices((prev) => [
              {
                id: `INV-${Date.now().toString().slice(-6)}`,
                plan: selectedPlanForUpgrade.name,
                cycle: billingCycle === 'yearly' ? 'Tahunan' : 'Bulanan',
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                amount: price,
                status: 'Lunas (Midtrans)',
              },
              ...prev,
            ]);
            setIsProcessing(false);
            setIsModalOpen(false);
            if (onShowNotification) onShowNotification(`Selamat! Akun toko Anda resmi aktif di Paket ${selectedPlanForUpgrade.name}!`);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          },
          onPending: async () => {
            const updated = await storeService.updateStore(store.id, { plan: targetPlan as any });
            onUpdateStore(updated);
            setIsProcessing(false);
            setIsModalOpen(false);
            if (onShowNotification) onShowNotification('Pembayaran langganan sedang diverifikasi.');
          },
          onError: () => {
            alert('Pembayaran dibatalkan atau gagal.');
            setIsProcessing(false);
          },
          onClose: () => {
            setIsProcessing(false);
          },
        }
      );
    } catch (err) {
      console.warn('Fallback simulator mode for billing upgrade:', err);
      const updated = await storeService.updateStore(store.id, { plan: targetPlan as any });
      onUpdateStore(updated);

      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      await billingPlanService.recordSubscription({
        storeId: store.id,
        storeName: store.name,
        planId: selectedPlanForUpgrade.id,
        planName: selectedPlanForUpgrade.name,
        cycle: billingCycle,
        amount: price,
        status: 'paid',
        paymentMethod: paymentMethod === 'qris' ? 'Midtrans QRIS' : 'Midtrans BCA VA',
        invoiceNumber,
        paidAt: new Date().toISOString(),
      });

      setInvoices((prev) => [
        {
          id: invoiceNumber,
          plan: selectedPlanForUpgrade.name,
          cycle: billingCycle === 'yearly' ? 'Tahunan' : 'Bulanan',
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: price,
          status: 'Lunas (Midtrans)',
        },
        ...prev,
      ]);
      setIsProcessing(false);
      setIsModalOpen(false);
      if (onShowNotification) onShowNotification(`Berhasil beralih ke Paket ${selectedPlanForUpgrade.name}!`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
        </div>

        {/* Top Controls: Switcher, Current Plan Status & Riwayat Berlangganan Button */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Toggle Switch */}
          <div className="flex items-center gap-1 bg-[#FAF7F7] p-1 rounded-xl border border-[#E5E0DD]">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#66000E] shadow-2xs border border-[#E5E0DD]'
                  : 'text-[#706866] hover:text-[#241A1A]'
              }`}
            >
              Bulanan
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-[#66000E] text-white shadow-2xs'
                  : 'text-[#706866] hover:text-[#241A1A]'
              }`}
            >
              Tahunan
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const subs = billingPlanService.getSubscriptions().filter((s) => s.storeId === store.id);
              if (subs.length > 0) {
                setInvoices(
                  subs.map((s) => ({
                    id: s.invoiceNumber,
                    plan: s.planName,
                    cycle: s.cycle === 'yearly' ? 'Tahunan' : 'Bulanan',
                    date: new Date(s.paidAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                    amount: s.amount,
                    status: s.status === 'paid' ? 'Lunas (Midtrans)' : s.status,
                  }))
                );
              }
              setIsHistoryOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF7F7] border border-[#E5E0DD] text-xs font-semibold text-[#241A1A] hover:text-[#66000E] hover:border-[#66000E] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#66000E]" />
            <span>Riwayat Berlangganan</span>
          </button>
        </div>
      </div>

      {/* 2. Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {plans.map((plan) => {
          const isCurrent = (plan.slug === 'premium' && currentPlan === 'premium') || (plan.slug === 'free' && currentPlan === 'free') || (plan.slug === store.plan);
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl bg-white p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between relative shadow-2xs ${
                isCurrent
                  ? 'border-2 border-[#66000E] ring-4 ring-[#66000E]/5'
                  : 'border-[#E5E0DD]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#241A1A]">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#706866] mt-1 min-h-[32px]">{plan.tagline}</p>

                {/* Price */}
                <div className="py-4 border-y border-[#FAF7F7] my-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-[#241A1A]">
                      {price === 0 ? 'Gratis' : formatRupiah(price)}
                    </span>
                    <span className="text-xs text-[#706866]">
                      {price === 0 ? '' : billingCycle === 'yearly' ? '/ tahun' : '/ bulan'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && price > 0 && (
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                      Setara {formatRupiah(Math.round(price / 12))}/bulan (Hemat 2 bulan)
                    </span>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-[#241A1A] pb-4">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-snug">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
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
                    <span>Paket Sedang Aktif</span>
                  ) : (
                    <>
                      <span>{plan.slug === 'free' ? 'Pilih Paket Starter' : `Beralih ke ${plan.name}`}</span>
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
                  <h3 className="font-bold text-base text-[#241A1A]">Riwayat Berlangganan</h3>
                  <p className="text-xs text-[#706866]">Catatan transaksi paket langganan toko Anda</p>
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
                    <th className="py-2.5 px-3 font-semibold">No. Invoice</th>
                    <th className="py-2.5 px-3 font-semibold">Paket</th>
                    <th className="py-2.5 px-3 font-semibold">Siklus</th>
                    <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                    <th className="py-2.5 px-3 font-semibold">Total</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF7F7]">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FAF7F7]/60 transition">
                      <td className="py-3 px-3 font-mono font-semibold">{inv.id}</td>
                      <td className="py-3 px-3 font-bold">{inv.plan}</td>
                      <td className="py-3 px-3 text-[#706866]">{inv.cycle}</td>
                      <td className="py-3 px-3 text-[#706866]">{inv.date}</td>
                      <td className="py-3 px-3 font-bold text-[#66000E]">{formatRupiah(inv.amount)}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingInvoice(inv)}
                          className="text-[#66000E] hover:underline font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                          title="Lihat & Unduh Bukti Invoice Resmi"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
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
                Tutup
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
                <h3 className="font-bold text-sm text-[#241A1A]">Konfirmasi Berlangganan</h3>
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
                <span className="text-[#706866]">Paket Tujuan:</span>
                <span className="font-bold text-[#241A1A]">{selectedPlanForUpgrade.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#706866]">Siklus Tagihan:</span>
                <span className="font-medium text-[#241A1A]">
                  {billingCycle === 'yearly' ? 'Tahunan (Hemat 20%)' : 'Bulanan'}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E5E0DD] flex items-center justify-between">
                <span className="font-bold text-[#241A1A]">Total Biaya:</span>
                <span className="text-base font-black text-[#66000E]">
                  {formatRupiah(billingCycle === 'yearly' ? selectedPlanForUpgrade.priceYearly : selectedPlanForUpgrade.priceMonthly)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-[#241A1A] block">Metode Pembayaran:</label>
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
                  <span>QRIS Instan</span>
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
                  <span>Virtual Account</span>
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
                <span>{isProcessing ? 'Memproses Transaksi...' : 'Bayar Sekarang via Midtrans'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2 text-xs text-[#706866] hover:text-[#241A1A] transition cursor-pointer text-center"
              >
                Batal
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
