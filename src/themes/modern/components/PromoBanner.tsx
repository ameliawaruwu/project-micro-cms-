import React from 'react';

export const ModernPromoBanner: React.FC<{ sectionOptions?: any; accentColor?: string }> = ({ sectionOptions = {}, accentColor = '#2563EB' }) => {
  const heading = sectionOptions.heading || "Diskon Spesial Minggu Ini";
  const desc = sectionOptions.description || "Dapatkan penawaran terbaik untuk produk pilihan, waktu terbatas.";
  const buttonLabel = sectionOptions.buttonLabel || "Lihat Promo";

  return (
    <section className="w-full px-4 md:px-8 py-6 font-['Outfit',sans-serif] bg-white">
      <div
        className="max-w-7xl mx-auto rounded-[2rem] py-16 md:py-24 px-6 text-center text-white relative overflow-hidden"
        style={{ backgroundColor: accentColor }}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/10"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{heading}</h2>
          <p className="text-sm md:text-base text-white/80 mb-8">{desc}</p>
          <button className="px-8 py-3.5 bg-white text-gray-900 font-bold rounded-full hover:scale-105 transition-transform">
            {buttonLabel}
          </button>
        </div>
      </div>
    </section>
  );
};
