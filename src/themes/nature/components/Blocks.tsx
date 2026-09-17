import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const NatureIngredientStory: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Powered by Nature";
  const desc = sectionOptions.description || "Our formulations rely on the potent healing properties of cold-pressed botanicals and mineral-rich clays. Sourced ethically and blended in small batches to preserve their organic integrity.";

  return (
    <section className="py-24 md:py-40 px-6 md:px-12 bg-[#F9F6F0]">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
        <div className="w-full md:w-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-[#E8E4DB] rounded-t-full translate-x-4 translate-y-4"></div>
            <img 
              src="https://images.unsplash.com/photo-1541535881962-3bb3ec24564c?w=800&q=80" 
              alt="Ingredients" 
              className="relative w-full aspect-[3/4] object-cover rounded-t-full rounded-b-3xl shadow-lg hover:scale-[1.02] transition-transform duration-700 ease-out" 
            />
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#5C6B5D] mb-6 font-medium">The Origin</p>
          <h2 className="text-4xl md:text-5xl font-serif text-[#2C3B2D] mb-8 leading-tight">{heading}</h2>
          <p className="text-[#5C6B5D] leading-loose text-base md:text-lg mb-12 font-light">
            {desc}
          </p>
          <ul className="space-y-6">
            {['Wildcrafted Herbs', 'Cold-pressed Oils', 'Volcanic Clay', 'Distilled Floral Waters'].map(item => (
              <li key={item} className="flex items-center gap-4 text-[#2C3B2D] text-lg">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E8E4DB] text-[#5C6B5D]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </span>
                <span className="font-medium tracking-wide">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export const NatureSustainability: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Our Commitment to the Earth";
  
  const pillars = sectionOptions.features || [
    { title: "Zero Waste", desc: "100% recyclable glass and aluminum packaging." },
    { title: "Ethical Harvest", desc: "Working directly with local farmers." },
    { title: "Carbon Neutral", desc: "Offsetting our footprint on every shipment." }
  ];

  return (
    <section className="py-24 md:py-40 px-6 md:px-12 text-center bg-white">
      <div className="max-w-5xl mx-auto">
        <svg className="w-12 h-12 mx-auto mb-8 text-[#5C6B5D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-4xl md:text-5xl font-serif text-[#2C3B2D] mb-16">{heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-12">
          {pillars.map((item: any, i: number) => (
            <div key={i} className="p-10 bg-[#F9F6F0] rounded-[32px] hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-md border border-[#E8E4DB]">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#2C3B2D] text-xl font-serif mb-6 mx-auto shadow-sm">
                0{i + 1}
              </div>
              <h3 className="font-serif text-2xl text-[#2C3B2D] mb-4">{item.title}</h3>
              <p className="text-[#5C6B5D] leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
