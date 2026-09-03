import React from 'react';
import {
  Layers,
  Code,
  FileQuestion,
  SlidersHorizontal,
  AlertCircle,
  XCircle,
  Shuffle,
} from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: Shuffle,
      title: 'Terlalu Banyak Aplikasi',
      description: 'Harus berpindah-pindah platform untuk mengelola toko, catat chat, cek mutasi bank, dan order kurir.',
      tag: 'Bikin Pusing',
    },
    {
      icon: Code,
      title: 'Pembuatan Rumit & Mahal',
      description: 'Sistem e-commerce di pasaran terasa terlalu teknis, mahal, dan butuh keahlian coding.',
      tag: 'Terlalu Teknis',
    },
    {
      icon: FileQuestion,
      title: 'Pesanan Tercecer',
      description: 'Pesanan dari berbagai chat WhatsApp dan media sosial tercecer dan sulit dipantau statusnya.',
      tag: 'Rentan Terlewat',
    },
    {
      icon: SlidersHorizontal,
      title: 'Pengelolaan Membingungkan',
      description: 'Fitur berbelit-belit dan menu yang rumit membuat waktu Anda habis hanya untuk setting toko.',
      tag: 'Boros Waktu',
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-4 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Tantangan Nyata Jualan Online</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-snug mb-3">
            Jualan Online Seharusnya Tidak Serumit Itu.
          </h2>
          <p className="text-[#5F5652] text-sm sm:text-base leading-relaxed font-normal">
            Banyak pemilik UMKM terbebani oleh sistem e-commerce yang rumit dan membingungkan sebelum sempat menghasilkan transaksi optimal.
          </p>
        </div>

        {/* 4 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#E8DDDE] shadow-xs hover:border-[#66000E]/40 hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center border border-[#E8DDDE]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F7] text-[#5F5652] border border-[#E8DDDE]">
                      {prob.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#241A1A] mb-2 group-hover:text-[#66000E] transition-colors">
                    {prob.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5F5652] leading-relaxed font-normal">
                    {prob.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E8DDDE]/60 flex items-center gap-1.5 text-xs text-[#66000E] font-medium">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Sering dialami UMKM</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

