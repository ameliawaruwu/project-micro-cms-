import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { EASE_SMOOTH, Reveal, RevealGroup, RevealItem } from './landingMotion';

export const FAQSection: React.FC = () => {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: t('faq_q1', 'Apakah saya perlu keahlian teknis atau bisa coding?'),
      a: t('faq_a1', 'Tidak sama sekali. LapakQ dirancang sangat sederhana sehingga siapa pun bisa membuat katalog produk dan melayani pesanan langsung lewat layar smartphone tanpa pengetahuan teknis.'),
    },
    {
      q: t('faq_q2', 'Berapa lama proses pembuatan toko online?'),
      a: t('faq_a2', 'Kurang dari 5 menit. Cukup daftarkan nama usaha Anda, masukkan foto produk pertama, dan tautan toko online (lapakq.com/toko-anda) langsung aktif dan siap disebarkan ke WhatsApp atau media sosial.'),
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

  return (
    <section
      id="faq"
      className="relative bg-white py-16 sm:py-20 lg:py-24 scroll-mt-16 sm:scroll-mt-20 font-sans"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-8 sm:mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#800C19]">
            {t('faq_section_badge', 'Tanya Jawab')}
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl lg:text-[44px] font-medium tracking-tight leading-[1.1] text-[#1A1414]">
            {t('faq_section_title', 'Pertanyaan Umum')}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5F5652]">
            {t('faq_section_desc', 'Jawaban untuk hal-hal yang sering ditanyakan seputar LapakQ.')}
          </p>
        </Reveal>

        <RevealGroup className="border-t border-[#E4DCDC]">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const answerId = `faq-answer-${idx}`;
            return (
              <RevealItem key={idx} className="border-b border-[#E4DCDC]">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="w-full py-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <span className="text-sm sm:text-base font-medium text-[#1A1414] leading-snug group-hover:text-[#800C19] transition-colors">
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen ? 'rotate-45 bg-[#66000E] text-white' : 'bg-[#F5E8EA] text-[#800C19]'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={answerId}
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pr-12 text-sm text-[#5F5652] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
};
