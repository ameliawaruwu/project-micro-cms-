import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const MinimalistBrandPhilosophy: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  
  const heading = sectionOptions.heading || "Our Philosophy";
  const content = sectionOptions.description || `"At ${storeInfo.name}, we believe in the beauty of simplicity. Our objects are designed not just to occupy space, but to enhance your daily rituals. Every curve, every material is thoughtfully chosen to bring calm and purpose to your living environment."`;
  
  return (
    <section className="py-32 px-6 max-w-4xl mx-auto text-center bg-white">
      <h2 className="text-sm tracking-[0.2em] uppercase text-gray-400 mb-8">{heading}</h2>
      <p className="text-2xl md:text-3xl leading-[1.6] text-gray-800 font-light max-w-3xl mx-auto">
        {content}
      </p>
      <div className="w-12 h-[1px] bg-gray-300 mx-auto mt-12"></div>
    </section>
  );
};
