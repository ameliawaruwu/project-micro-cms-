import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const FAQSection: React.FC = () => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: t('faq_q1', 'Apakah saya perlu keahlian teknis atau bisa coding?'),
      a: t('faq_a1', 'Tidak sama sekali. Kroomify dirancang sangat sederhana sehingga siapa pun bisa membuat katalog produk dan melayani pesanan langsung lewat layar smartphone tanpa pengetahuan teknis.'),
    },
    {
      q: t('faq_q2', 'Berapa lama proses pembuatan toko online?'),
      a: t('faq_a2', 'Kurang dari 5 menit. Cukup daftarkan nama usaha Anda, masukkan foto produk pertama, dan tautan toko online (kroomify.id/toko-anda) langsung aktif dan siap disebarkan ke WhatsApp atau media sosial.'),
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
      className="min-h-[calc(100svh-124px)] min-h-[calc(100dvh-124px)] lg:min-h-[calc(100vh-68px)] flex flex-col justify-center items-center py-6 sm:py-8 lg:py-4 xl:py-8 bg-white border-b border-[#E8DDDE] scroll-mt-16 sm:scroll-mt-20 font-sans relative"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start max-w-[1100px] xl:max-w-6xl mx-auto">
          
          {/* Left Column: Title, Subtitle, & WhatsApp Support Card */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F5E8EA] text-[#66000E] border border-[#E8DDDE] text-xs font-medium shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5 text-[#66000E]" />
              <span>{t('faq_section_badge', 'Tanya Jawab')}</span>
            </div>

            <h2 className="text-lg sm:text-2xl lg:text-2xl font-semibold text-[#241A1A] tracking-tight leading-snug">
              {t('faq_section_title', 'Pertanyaan Umum')}
            </h2>

            <p className="text-[#5F5652] text-xs sm:text-sm leading-relaxed font-normal max-w-md mx-auto lg:mx-0">
              {t('faq_section_desc', 'Jawaban untuk hal-hal yang sering ditanyakan seputar Kroomify.')}
            </p>

            {/* WhatsApp Quick Help Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF7F7] border border-[#E8DDDE] text-left space-y-2 mt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#241A1A]">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{t('faq_more_help', 'Butuh bantuan lebih lanjut?')}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#5F5652] leading-relaxed">
                Tim CS Kroomify siap membantu panduan setting toko dan pertanyaan teknis Anda.
              </p>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Kroomify,%20saya%20ingin%20tanya%20seputar%20pembuatan%20toko%20online"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer active:scale-[0.98] shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>{t('faq_cs_whatsapp', 'Hubungi CS WhatsApp')}</span>
              </a>
            </div>
          </div>

          {/* Right Column: 4 Accordions */}
          <div className="lg:col-span-7 space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#FAF7F7] border-[#66000E]/30 shadow-xs'
                      : 'bg-white border-[#E8DDDE] hover:border-[#66000E]/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full p-3 sm:p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer min-h-[42px]"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-xs sm:text-sm text-[#241A1A] leading-snug">
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
                    <div className="px-3 pb-3 sm:px-3.5 sm:pb-3.5 text-[11px] sm:text-xs text-[#5F5652] leading-relaxed font-normal border-t border-[#E8DDDE] pt-2 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};


