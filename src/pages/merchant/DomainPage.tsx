import React, { useState } from 'react';
import { Store } from '../../types';
import { Globe, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface DomainPageProps {
  store: Store;
}

export const DomainPage: React.FC<DomainPageProps> = ({ store }) => {
  const [domainType, setDomainType] = useState<'random' | 'custom'>('random');
  const [customDomain, setCustomDomain] = useState('');
  
  const randomDomain = `${store.slug || 'toko'}.kroombox.site`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Domain</h1>
          <p className="text-sm text-gray-500 mt-1">
            Atur alamat website untuk toko online Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RANDOM DOMAIN OPTION */}
        <div 
          onClick={() => setDomainType('random')}
          className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
            domainType === 'random' ? 'border-red-600 shadow-md ring-4 ring-red-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${domainType === 'random' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Random Domain</h3>
                <p className="text-xs text-gray-500">Gratis dari sistem</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              domainType === 'random' ? 'border-red-600' : 'border-gray-300'
            }`}>
              {domainType === 'random' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6">
            <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <span className="text-gray-400 font-normal">https://</span>{randomDomain}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersedia
            </div>
            {domainType === 'random' && (
              <button className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                Gunakan Domain <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CUSTOM DOMAIN OPTION */}
        <div 
          onClick={() => setDomainType('custom')}
          className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
            domainType === 'custom' ? 'border-red-600 shadow-md ring-4 ring-red-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${domainType === 'custom' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Custom Domain</h3>
                <p className="text-xs text-gray-500">Gunakan domain sendiri</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              domainType === 'custom' ? 'border-red-600' : 'border-gray-300'
            }`}>
              {domainType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
            </div>
          </div>

          {domainType === 'custom' ? (
            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="Contoh: www.namatoko.com"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs leading-relaxed border border-blue-100">
                <p className="font-semibold mb-1">Cara Menghubungkan:</p>
                <p>Arahkan DNS A Record domain Anda ke IP Address: <strong>192.168.1.100</strong> atau CNAME ke <strong>cname.kroombox.site</strong></p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                  Belum terhubung
                </div>
                <button className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Hubungkan
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-6 h-[42px] flex items-center">
              <p className="text-sm text-gray-400">www.namatoko.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
