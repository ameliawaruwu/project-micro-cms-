import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight, Sparkles, Store, PackagePlus, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { Store as StoreType, MerchantTab } from '../../types';

interface OnboardingCardProps {
  store: StoreType;
  onNavigateTab: (tab: MerchantTab) => void;
  onOpenAddProductModal: () => void;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  store,
  onNavigateTab,
  onOpenAddProductModal,
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const steps = [
    {
      id: 'store-name',
      title: 'Beri Nama Toko',
      desc: 'Nama toko dan alamat tautan toko online Anda.',
      detail: 'Tentukan identitas dan link toko agar pelanggan mudah mengingat tokomu.',
      isDone: store.onboarding?.storeNameSet ?? true,
      icon: Store,
      cta: 'Ubah Nama',
      action: () => onNavigateTab('pengaturan'),
    },
    {
      id: 'upload-product',
      title: 'Upload Produk Pertama',
      desc: 'Masukkan foto, harga, dan stok barang dagangan.',
      detail: 'Tambahkan minimal 1 produk siap jual lengkap dengan varian dan deskripsi.',
      isDone: store.onboarding?.productUploaded ?? true,
      icon: PackagePlus,
      cta: 'Upload Produk',
      action: () => onOpenAddProductModal(),
    },
    {
      id: 'connect-payment',
      title: 'Hubungkan Pembayaran',
      desc: 'Aktifkan QRIS & Virtual Account otomatis terima uang.',
      detail: 'Terima pembayaran otomatis langsung masuk ke saldo toko Anda.',
      isDone: store.onboarding?.paymentConnected ?? false,
      icon: CreditCard,
      cta: 'Hubungkan QRIS/Bank',
      action: () => onNavigateTab('pembayaran'),
    },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div id="card-onboarding" className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-[#E5E0DD] shadow-2xs font-sans text-left">
      
      {/* Card Header & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E5E0DD]">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-[#241A1A]">
            Panduan Memulai Toko
          </h3>
          <p className="text-xs text-[#706866] mt-0.5 font-normal">
            Selesaikan langkah berikut agar toko Anda siap berjualan dan menerima pesanan.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2.5 bg-[#FAF7F7] px-3 py-1.5 rounded-xl border border-[#E5E0DD] shrink-0">
          <div className="text-right">
            <span className="text-xs font-medium text-[#241A1A]">{completedCount} dari {steps.length} Selesai</span>
            <span className="text-[10px] text-[#706866] block font-normal">({progressPercent}%)</span>
          </div>
          <div className="w-16 h-2 bg-[#E5E0DD] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#66000E] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Steps Grid: Horizontal on Desktop, Vertical on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isExpanded = expandedStep === step.id;

          return (
            <div
              key={step.id}
              onClick={step.action}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                step.isDone
                  ? 'bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-300'
                  : 'bg-white border-[#E5E0DD] hover:border-[#66000E] shadow-2xs hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center ${
                      step.isDone ? 'bg-emerald-100 text-emerald-700 font-medium' : 'bg-[#FAF7F7] text-[#66000E] border border-[#E5E0DD]'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-normal text-[#706866]">Langkah {idx + 1}</span>
                  </div>

                  {step.isDone ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#66000E] bg-[#F9EDEF] border border-[#F5D0D6] px-2 py-0.5 rounded-full">
                      <Circle className="w-2.5 h-2.5 fill-current" />
                      <span>Perlu Aksi</span>
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-medium text-[#241A1A] mt-1">{step.title}</h4>
                <p className="text-xs text-[#706866] mt-0.5 leading-relaxed font-normal">{step.desc}</p>
                
                {isExpanded && (
                  <p className="text-[11px] text-[#241A1A] mt-2 p-2 rounded bg-white/80 border border-[#E5E0DD] font-normal animate-in fade-in duration-150">
                    {step.detail}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-xs font-medium text-[#66000E] group-hover:text-[#801010]">
                <span>{step.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
