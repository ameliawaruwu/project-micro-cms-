import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const FAQSection: React.FC = () => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: t('faq_q1', 'Apakah saya perlu keahlian teknis atau bisa coding?'),
      a: t('faq_a1', 'Tidak sama sekali. Kroombox dirancang sangat sederhana sehingga siapa pun bisa membuat katalog produk dan melayani pesanan langsung lewat layar smartphone tanpa pengetahuan teknis.'),
    },
    {
      q: t('faq_q2', 'Berapa lama proses pembuatan toko online?'),
      a: t('faq_a2', 'Kurang dari 5 menit. Cukup daftarkan nama usaha Anda, masukkan foto produk pertama, dan tautan toko online (kroombox.id/toko-anda) langsung aktif dan siap disebarkan ke WhatsApp atau media sosial.'),
    },
    {
      q: t('faq_q3', 'Bagaimana cara pembeli membayar pesanan?'),
      a: t('faq_a3', 'Tersedia pembayaran otomatis menggunakan QRIS Instan (bisa di-scan dari GoPay, OVO, Dana, ShopeePay, serta seluruh mobile banking) dan Transfer Virtual Account Bank resmi.'),
    },
    {
      q: t('faq_q4', 'Apakah uang dan saldo hasil jualan saya aman?'),
      a: t('faq_a4', 'Sangat aman. Seluruh dana transaksi diproses melalui jalur perbankan terverifikasi dan saldo dompet dapat ditarik langsung ke rekening bank lokal Anda kapan saja tanpa potongan tersembunyi.'),
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section 
      id="faq" 
      className="min-h-[calc(100svh-124px)] min-h-[calc(100dvh-124px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center py-10 sm:py-14 lg:py-20 bg-white border-b border-[#E8DDDE] scroll-mt-16 sm:scroll-mt-20 font-sans relative"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-medium mb-2 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#66000E]" />
            <span>{t('faq_section_badge', 'Tanya Jawab')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#241A1A] tracking-tight leading-snug mb-1.5">
            {t('faq_section_title', 'Pertanyaan Umum')}
          </h2>
          <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal max-w-md mx-auto">
            {t('faq_section_desc', 'Jawaban untuk hal-hal yang sering ditanyakan seputar Kroombox.')}
          </p>
        </div>

        {/* 4 Accordions in max-w-3xl */}
        <div className="max-w-3xl mx-auto space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#FAF7F7] border-[#66000E]/30 shadow-xs'
                    : 'bg-white border-[#E8DDDE] hover:border-[#66000E]/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 cursor-pointer min-h-[44px]"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-xs sm:text-sm text-[#241A1A] leading-snug">
                    {faq.q}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#F5E8EA] text-[#66000E]' : 'bg-[#FAF7F7] text-[#857C76]'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs sm:text-sm text-[#5F5652] leading-relaxed font-normal border-t border-[#E8DDDE] pt-2.5 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom WhatsApp Support */}
        <div className="mt-8 sm:mt-10 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF7F7] border border-[#E8DDDE] text-xs text-[#5F5652]">
            <span>{t('faq_more_help', 'Butuh bantuan lebih lanjut?')}</span>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Kroombox,%20saya%20ingin%20tanya%20seputar%20pembuatan%20toko%20online"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[#66000E] hover:text-[#801010] hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('faq_cs_whatsapp', 'Hubungi CS WhatsApp')}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};


