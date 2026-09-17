import React from 'react';
import { useCmsStore } from '../../../cms/useCmsStore';
import { Hexagon } from 'lucide-react';

export const FuturisticFooter: React.FC = () => {
  const storeInfo = useCmsStore(state => state.storeInfo);
  const navigation = useCmsStore(state => state.navigation);

  return (
    <footer className="w-full bg-white pt-24 pb-12 px-6 md:px-12 font-['Space_Grotesk',sans-serif] border-t border-gray-200 relative overflow-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgzOHYzOEgxVjF6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjIwLDM4LDM4LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50"></div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
        
        {/* Brand */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3 mb-6">
            <Hexagon className="w-8 h-8 text-red-600" />
            <h3 className="text-2xl font-bold tracking-[0.2em] uppercase text-gray-900 drop-shadow-[0_0_8px_rgba(220,38,38,0.2)]">
              {storeInfo.name}
            </h3>
          </div>
          <p className="text-gray-600 text-sm max-w-sm leading-relaxed mb-8">
            {storeInfo.description}
          </p>
          <div className="flex items-center gap-4">
            {storeInfo.socials.instagram && (
              <a href="#" className="w-10 h-10 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-600 transition-all shadow-[0_0_10px_rgba(220,38,38,0)] hover:shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                IG
              </a>
            )}
            {storeInfo.socials.tiktok && (
              <a href="#" className="w-10 h-10 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-600 transition-all shadow-[0_0_10px_rgba(220,38,38,0)] hover:shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                TK
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500"></span> Navigasi
          </h4>
          <ul className="space-y-3">
            {navigation.map(nav => (
              <li key={nav.id}>
                <a href={nav.route} className="text-gray-600 hover:text-red-600 text-sm transition-colors flex items-center gap-2 group">
                  <span className="text-red-600/0 group-hover:text-red-600 transition-colors">&gt;</span>
                  {nav.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="md:col-span-4">
          <h4 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500"></span> Terminal Kontak
          </h4>
          <ul className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded border border-gray-200">
            <li className="flex gap-3">
              <span className="text-red-600 font-mono">LOC:</span>
              <span>{storeInfo.address}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-mono">NET:</span>
              <span>{storeInfo.email}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-mono">COM:</span>
              <span>{storeInfo.phone}</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-gray-200 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500 font-mono">
          &copy; {new Date().getFullYear()} {storeInfo.name} // ALL SYSTEMS NORMAL.
        </p>
      </div>
    </footer>
  );
};
