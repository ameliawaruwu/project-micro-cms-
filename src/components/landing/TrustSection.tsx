import React from 'react';
import { HeartHandshake, Smartphone, Code2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const TrustSection: React.FC = () => {
  const { isEn } = useLanguage();
  const trustItems = [
    {
      icon: HeartHandshake,
      title: isEn ? 'SME Friendly' : 'Ramah UMKM',
      desc: isEn ? 'Indonesian language and practical flows built for local businesses' : 'Bahasa Indonesia dan alur praktis ramah pengusaha lokal',
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      desc: isEn ? 'Run your whole store right from your phone' : 'Kelola penuh toko langsung dari layar HP Anda',
    },
    {
      icon: Code2,
      title: isEn ? 'No Coding' : 'Tanpa Coding',
      desc: isEn ? 'Start selling instantly, no technical skills needed' : 'Siap jualan instan tanpa perlu skill teknis',
    },
    {
      icon: Sparkles,
      title: isEn ? 'Easy to Use' : 'Mudah Digunakan',
      desc: isEn ? 'Clean design focused on growing your sales' : 'Desain bersih dan fokus meningkatkan transaksi',
    },
  ];

  return (
    <section className="py-12 bg-[#FAF7F7] border-y border-[#E8DDDE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#66000E]">
            {isEn ? 'Built to help Indonesian SMEs grow more easily' : 'Dibuat untuk membantu UMKM Indonesia tumbuh lebih mudah'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#E8DDDE] hover:border-[#66000E]/40 hover:shadow-xs transition-all text-center flex flex-col items-center"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5E8EA] text-[#66000E] flex items-center justify-center mb-3 border border-[#E8DDDE]">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#241A1A] mb-1">
                  {item.title}
                </h2>
                <p className="text-xs text-[#5F5652] font-normal leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

