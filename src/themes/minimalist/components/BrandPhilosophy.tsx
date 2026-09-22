import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const MinimalistBrandPhilosophy: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  
  const heading = sectionOptions.heading || "Our Philosophy";
  const content = sectionOptions.description || `"At ${storeInfo.name}, we believe in the beauty of simplicity. Our objects are designed not just to occupy space, but to enhance your daily rituals. Every curve, every material is thoughtfully chosen to bring calm and purpose to your living environment."`;
  
  return (
    <section className="w-full max-w-full py-10 sm:py-16 md:py-28 px-4 sm:px-6 max-w-4xl mx-auto text-center bg-white box-border overflow-hidden">
      <h2 className="text-[11px] sm:text-xs tracking-[0.2em] uppercase text-gray-400 mb-4 sm:mb-6">{heading}</h2>
      <p className="text-sm sm:text-lg md:text-2xl lg:text-3xl leading-relaxed text-gray-800 font-light max-w-3xl mx-auto break-words">
        {content}
      </p>
      <div className="w-10 sm:w-12 h-[1px] bg-gray-300 mx-auto mt-6 sm:mt-10"></div>
    </section>
  );
};
