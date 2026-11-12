import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { scrollToLandingSection } from '../../utils/scroll';
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
      a: t('faq_a2', 'Kurang dari 5 menit. Cukup daftarkan nama usaha Anda, masukkan foto produk pertama, dan tautan toko online (toko-anda.lapakq.com) langsung aktif dan siap disebarkan ke WhatsApp atau media sosial.'),
    },
    {
      q: t('faq_q3', 'Bagaimana cara pembeli membayar pesanan?'),
      a: t('faq_a3', 'Tersedia pembayaran otomatis menggunakan QRIS Instan (bisa di-scan dari GoPay, OVO, Dana, ShopeePay, serta seluruh mobile banking) dan Transfer Virtual Account Bank resmi.'),
    },
    {
      q: t('faq_q4', 'Apakah uang dan saldo hasil jualan saya aman?'),
      a: t('faq_a4', 'Sangat aman. Seluruh dana transaksi diproses melalui jalur perbankan terverifikasi dan saldo dompet dapat ditarik langsung ke rekening bank lokal Anda kapan saja tanpa potongan tersembunyi.'),
    },
    {
      q: t('faq_q5', 'Bisakah toko saya memakai domain sendiri?'),
      a: t('faq_a5', 'Bisa. Setiap toko langsung mendapat alamat namatoko.lapakq.com, dan Anda dapat menghubungkan domain milik sendiri dari menu pengaturan toko kapan saja.'),
    },
    {
      q: t('faq_q6', 'Apakah toko bisa dikelola sepenuhnya dari HP?'),
      a: t('faq_a6', 'Ya. Dashboard LapakQ ringan dan responsif, jadi menambah produk, memproses pesanan, hingga mengatur tampilan toko bisa dilakukan dari browser HP tanpa install aplikasi.'),
    },
  ];

  return (
    <section
      id="faq"
      className="relative bg-white py-16 sm:py-20 lg:py-24 scroll-mt-16 sm:scroll-mt-20 font-sans"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Kolom kiri: judul & kartu bantuan (menempel saat digulir di desktop) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 space-y-8">
            <Reveal className="text-center lg:text-left">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#800C19]">
                {t('faq_section_badge', 'Tanya Jawab')}
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl lg:text-[44px] font-medium tracking-tight leading-[1.1] text-[#1A1414]">
                {t('faq_section_title', 'Pertanyaan Umum')}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#5F5652] max-w-md mx-auto lg:mx-0">
                {t('faq_section_desc', 'Jawaban untuk hal-hal yang sering ditanyakan seputar LapakQ.')}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="hidden lg:block">
              <div className="relative overflow-hidden rounded-[28px] bg-[#FFC2D1] p-7 text-[#1A1414]">
                <motion.img
                  src="/assets/3d/clean/green_mug.webp"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  animate={{ y: [0, -6, 0], rotate: [0, 4, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="pointer-events-none absolute right-4 top-4 w-24 drop-shadow-[0_14px_18px_rgba(0,0,0,0.2)]"
                />
                <p className="relative max-w-[65%] text-xl font-medium tracking-tight leading-snug">
                  {t('faq_help_title', 'Masih bingung harus mulai dari mana?')}
                </p>
                <p className="relative mt-2 max-w-[75%] text-sm text-[#1A1414]/70">
                  {t('faq_help_desc', 'Lihat alur singkat membuat toko sampai menerima pesanan pertama.')}
                </p>
                <button
                  type="button"
                  onClick={() => scrollToLandingSection('cara-kerja', 0)}
                  className="group relative mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  {t('hero_cta_how', 'Lihat Cara Kerja')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Kolom kanan: daftar pertanyaan bernomor */}
        <RevealGroup className="lg:col-span-7 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const buttonId = `faq-question-${idx}`;
            const answerId = `faq-answer-${idx}`;
            return (
              <RevealItem
                key={idx}
                className={`rounded-2xl border transition-colors duration-300 ${
                  isOpen ? 'border-transparent bg-[#FAF7F7]' : 'border-[#E4DCDC] bg-white hover:border-[#D9C9CB]'
                }`}
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="w-full px-4 sm:px-5 py-4 sm:py-5 text-left flex items-center gap-3 sm:gap-4 cursor-pointer group"
                >
                  <span
                    className={`shrink-0 text-xs font-semibold tabular-nums transition-colors ${
                      isOpen ? 'text-[#800C19]' : 'text-[#B5A9A6]'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-sm sm:text-base font-medium text-[#1A1414] leading-snug group-hover:text-[#800C19] transition-colors">
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
                      role="region"
                      aria-labelledby={buttonId}
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_SMOOTH }}
                      className="overflow-hidden"
                    >
                      <p className="pl-11 sm:pl-[52px] pr-5 sm:pr-14 pb-5 text-sm text-[#5F5652] leading-relaxed">{faq.a}</p>
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
