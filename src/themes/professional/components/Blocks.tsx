import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const ProfessionalStoreBenefits: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Why Partner With Us";
  
  const benefits = sectionOptions.features || [
    { title: "Dedicated Account Manager", desc: "A single point of contact for all your business needs." },
    { title: "Volume Discounts", desc: "Tiered pricing structures tailored for enterprise procurement." },
    { title: "SLA Guarantee", desc: "99.9% uptime and guaranteed delivery timeframes." },
    { title: "Net-30 Terms", desc: "Flexible payment options for qualified business accounts." }
  ];

  return (
    <section className="py-24 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{heading}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">We provide the infrastructure and support necessary to scale your operations efficiently.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit: any, i: number) => (
            <div key={i} className="p-6 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ProfessionalProductGrid: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { products } = useCmsStore();
  const heading = sectionOptions.heading || "Product Catalog";

  return (
    <section className="py-24 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{heading}</h2>
            <p className="text-gray-600">Browse our comprehensive selection of business-grade products.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <input type="text" placeholder="Search by SKU or Name..." className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" />
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Filter</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded">In Stock</div>
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-500 mb-1 font-mono">SKU: {Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                <h3 className="font-bold text-gray-900 mb-2 truncate">{product.name}</h3>
                <p className="text-lg font-bold text-[#1E40AF] mb-4">Rp {product.price.toLocaleString('id-ID')}</p>
                <button className="w-full py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                  Add to Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ProfessionalTestimonials: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Trusted by Industry Leaders";
  
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">{heading}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-left">
              <div className="flex gap-1 text-yellow-400 mb-6">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                ))}
              </div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                "The platform has fundamentally transformed how we handle our procurement. The enterprise features and dedicated support are unmatched in the industry."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-gray-900">Jane Doe</h4>
                  <p className="text-sm text-gray-500">Director of Operations, TechCorp</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
