import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';

export const ProfessionalNavbar: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo, navigation } = useCmsStore();
  const showLogo = sectionOptions.showLogo ?? true;
  const showNav = sectionOptions.showNavMenu ?? true;

  return (
    <nav className="w-full bg-[#1E40AF] text-white shadow-md sticky top-0 z-50">
      <div className="w-full bg-[#1e3a8a] py-2 px-6 md:px-16 flex justify-between text-xs font-medium text-blue-200">
        <div className="flex gap-6">
          <span>Enterprise Solutions</span>
          <span>Global Shipping</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <a href="#" className="hover:text-white transition-colors">Client Portal</a>
        </div>
      </div>
      <div className="w-full px-6 md:px-16 py-5 flex justify-between items-center">
        <div className="flex items-center gap-12">
          {showLogo && (
            <a href="/" className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-[#1E40AF] font-bold text-xl leading-none">P</span>
              </div>
              {storeInfo.name}
            </a>
          )}
          {showNav && (
            <div className="hidden md:flex gap-8">
              {navigation.map(nav => (
                <a key={nav.id} href={nav.route} className="text-sm font-semibold text-blue-50 hover:text-white transition-colors">
                  {nav.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <button className="px-5 py-2 text-sm font-semibold text-white border border-blue-400 rounded-md hover:bg-blue-800 transition-colors">
            Contact Sales
          </button>
          <button className="px-5 py-2 text-sm font-semibold bg-white text-[#1E40AF] rounded-md hover:bg-gray-100 transition-colors shadow-sm">
            Cart (0)
          </button>
        </div>
      </div>
    </nav>
  );
};

export const ProfessionalHero: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const heading = sectionOptions.heading || "Professional B2B Solutions";
  const subheading = sectionOptions.subheading || "Streamline your procurement process with our enterprise-grade supplies and dedicated account management.";
  const buttonLabel = sectionOptions.buttonLabel || "Request a Quote";
  const bgImage = sectionOptions.bannerUrl || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80";

  return (
    <section className="relative w-full min-h-[75vh] flex items-center bg-gray-50 border-b border-gray-200">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 pt-12 md:pt-0 z-10">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            Enterprise Ready
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
            {heading}
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
            {subheading}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3.5 bg-[#1E40AF] text-white font-semibold rounded-md hover:bg-[#1e3a8a] transition-colors shadow-md text-center">
              {buttonLabel}
            </button>
            <button className="px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors text-center">
              View Catalog
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 relative">
          <div className="absolute inset-0 bg-blue-600 rounded-2xl transform translate-x-4 translate-y-4 opacity-10"></div>
          <img 
            src={bgImage} 
            alt="Corporate" 
            className="w-full aspect-[4/3] object-cover rounded-2xl shadow-xl relative z-10"
          />
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg z-20 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-gray-900">99.8%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const ProfessionalFooter: React.FC<{ sectionOptions?: any }> = ({ sectionOptions = {} }) => {
  const { storeInfo } = useCmsStore();
  const copyrightText = sectionOptions.copyrightText || `© ${new Date().getFullYear()} ${storeInfo.name}. All rights reserved.`;

  return (
    <footer className="w-full bg-gray-900 text-gray-300 pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">P</span>
              </div>
              {storeInfo.name}
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {storeInfo.description || "Providing enterprise-grade solutions and dedicated support for businesses worldwide."}
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Solutions</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Enterprise Procurement</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bulk Ordering</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Custom Manufacturing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Logistics</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Company</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{storeInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>{storeInfo.email}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">{copyrightText}</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
