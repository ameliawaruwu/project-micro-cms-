import React from 'react';
import { Star, Sparkles } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote: 'Sekarang tidak perlu mencatat pesanan di banyak buku. Semuanya rapi dan otomatis tercatat dalam satu aplikasi.',
      name: 'Sari Rahmawati',
      role: 'Toko Batik Sekar',
      city: 'Yogyakarta',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    },
    {
      quote: 'Tambah produk gampang banget langsung dari kamera HP sambil mengurus anak di rumah.',
      name: 'Rina Kusuma',
      role: 'Fashion Hijab Online',
      city: 'Bandung',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
    {
      quote: 'Toko online jadi kelihatan sangat profesional dan pembeli lebih percaya saat bayar pakai QRIS.',
      name: 'Andi Pratama',
      role: 'Kerajinan Kayu',
      city: 'Jepara',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
  ];

  const partners = [
    'QRIS Nasional',
    'BCA & Mandiri',
    'BRI & BNI',
    'J&T Express',
    'JNE Express',
    'SiCepat',
  ];

  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-[#FAF7F7] border-b border-[#E8DDDE] font-sans">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#66000E]" />
            <span>Cerita Nyata</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A1A] tracking-tight leading-snug mb-2">
            Sudah Dipakai UMKM
          </h2>
          <p className="text-[#5F5652] text-sm sm:text-base leading-relaxed font-normal max-w-lg mx-auto">
            Cerita nyata dari pemilik usaha lokal di berbagai kota di Indonesia.
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto mb-10">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-[#E8DDDE] shadow-xs hover:shadow-md hover:border-[#66000E]/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars rating */}
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-[#241A1A] text-xs sm:text-sm leading-relaxed italic font-normal mb-5">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-3.5 border-t border-[#E8DDDE] flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E8DDDE] shrink-0"
                />
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#241A1A]">{item.name}</h3>
                  <p className="text-[11px] text-[#5F5652] font-normal">{item.role} • {item.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Integration Badges */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DDDE] max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#241A1A]">Terhubung dengan Ekosistem Pembayaran & Ekspedisi Resmi</p>
              <p className="text-[11px] text-[#5F5652]">Transaksi aman dan pengiriman terintegrasi langsung</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {partners.map((p, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F7] border border-[#E8DDDE] text-[11px] font-semibold text-[#241A1A]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

