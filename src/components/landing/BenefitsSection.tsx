import React from 'react';
import {
  PackagePlus,
  ClipboardCheck,
  CreditCard,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: PackagePlus,
      title: 'Kelola Produk',
      description: 'Upload foto barang dagangan, atur varian, dan pantau jumlah stok tanpa ribet langsung dari HP.',
      badge: 'Cepat & Praktis',
    },
    {
      icon: ClipboardCheck,
      title: 'Atur Pesanan',
      description: 'Terima notifikasi order baru otomatis dan cetak label alamat kurir (J&T, JNE, SiCepat) dalam 1-klik.',
      badge: 'Bebas Catat Manual',
    },
    {
      icon: CreditCard,
      title: 'Terima Pembayaran',
      description: 'Dukung QRIS Instan dan Transfer Bank resmi. Saldo penjualan aman dan dapat ditarik kapan saja.',
      badge: 'Langsung Masuk Rekening',
    },
  ];

  return (
    <section id="keunggulan" className="py-14 sm:py-16 lg:py-20 bg-white border-b border-[#E8DDDE] scroll-mt-20 font-sans">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#66000E]" />
            <span>Keunggulan Utama</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-snug mb-2">
            Mengapa Memilih Kroomify?
          </h2>
          <p className="text-[#5F5652] text-sm sm:text-base leading-relaxed font-normal max-w-lg mx-auto">
            Didesain khusus untuk menyederhanakan aktivitas harian pemilik UMKM di Indonesia.
          </p>
        </div>

        {/* 3 Cards Grid (Horizontal on Desktop, Stacked on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#FAF7F7] border border-[#E8DDDE] shadow-xs hover:shadow-md hover:border-[#66000E]/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#66000E] border border-[#E8DDDE]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#241A1A] mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5F5652] leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-5 border-t border-[#E8DDDE] flex items-center gap-1.5 text-xs font-semibold text-[#66000E]">
                  <ShieldCheck className="w-4 h-4 text-[#66000E]" />
                  <span>Jaminan Kemudahan UMKM</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

