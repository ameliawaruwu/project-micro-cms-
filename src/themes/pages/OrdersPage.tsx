import React from 'react';
import { ThemeSchema } from '../schema';
import { HeaderSection } from '../sections/HeaderSection';
import { FooterSection } from '../sections/FooterSection';
import { ThemeRegistry } from '../ThemeRegistry';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';

interface OrdersPageProps {
  themeData?: ThemeSchema;
  themeId?: string;
  store?: any;
  isDetailView?: boolean;
  onNavigate?: (pageId: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ themeData, themeId: propThemeId, store, isDetailView, onNavigate }) => {
  const activeThemeId = propThemeId || themeData?.themeId || store?.layoutSettings?.activeThemeId || 'minimalist';
  const settings = themeData?.settings || {
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A1A',
    primaryColor: '#1A1A1A',
    fontFamily: 'sans-serif'
  };

  const sections = themeData?.sections || {};
  const headerSection = Object.values(sections).find(s => s.type === 'Header');
  const footerSection = Object.values(sections).find(s => s.type === 'Footer');

  const CustomNavbar = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Navbar;
  const CustomFooter = ThemeRegistry[activeThemeId as keyof typeof ThemeRegistry]?.Footer;

  const mockOrders = [
    { id: 'ORD-98231', date: '17 Sep 2026', total: 165000, status: 'Dalam Pengiriman', statusColor: 'blue', items: 2 },
    { id: 'ORD-98104', date: '10 Aug 2026', total: 349000, status: 'Selesai', statusColor: 'green', items: 1 },
  ];

  const renderContent = () => {
    // 1. BOLD THEME
    if (activeThemeId === 'bold') {
      return (
        <div className="pt-24 pb-24 bg-white text-black min-h-screen border-b-8 border-black">
          <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8">
              RIWAYAT PESANAN
            </h1>
            <div className="space-y-6">
              {mockOrders.map(ord => (
                <div key={ord.id} className="bg-yellow-300 p-8 border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="px-4 py-1.5 bg-black text-white font-black text-sm uppercase border-2 border-black inline-block mb-2">
                      {ord.status}
                    </span>
                    <h3 className="font-black text-3xl uppercase">NO. PESANAN #{ord.id}</h3>
                    <p className="font-bold text-sm uppercase text-gray-800">{ord.date} • {ord.items} ITEM</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-3xl text-[#FF0000]">Rp {ord.total.toLocaleString('id-ID')}</p>
                    <button className="mt-2 px-6 py-2 bg-black text-white font-black uppercase border-2 border-black hover:bg-white hover:text-black">
                      RINCIAN
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 2. FUTURISTIC / MODERN THEME
    if (activeThemeId === 'futuristic' || activeThemeId === 'modern') {
      return (
        <div className="pt-28 pb-24 bg-[#0B0F19] text-white min-h-screen font-mono">
          <div className="max-w-5xl mx-auto px-6">
            <div className="border-b border-cyan-500/20 pb-6 mb-8">
              <span className="text-xs text-cyan-400 uppercase tracking-widest">[TRANSACTION_LOGS]</span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                ORDER HISTORY
              </h1>
            </div>
            <div className="space-y-4">
              {mockOrders.map(ord => (
                <div key={ord.id} className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-xs rounded">
                        [{ord.status.toUpperCase()}]
                      </span>
                      <span className="text-xs text-slate-400">{ord.date}</span>
                    </div>
                    <h3 className="font-bold text-xl text-slate-100">ID: #{ord.id}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-cyan-400">Rp {ord.total.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 3. DEFAULT / MINIMALIST / NATURE / CUTE / LUXURY / EDITORIAL ETC
    return (
      <div className="pt-28 pb-24 bg-gray-50 text-gray-900 min-h-screen font-sans">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan Pelanggan</h1>
          <div className="space-y-4">
            {mockOrders.map(ord => (
              <div key={ord.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="font-bold text-gray-900 text-base">#{ord.id}</span>
                    <span className="px-3 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{ord.date} • {ord.items} item</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">Rp {ord.total.toLocaleString('id-ID')}</p>
                  <button className="text-xs font-semibold text-black hover:underline">Lihat Rincian</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {CustomNavbar ? <CustomNavbar /> : headerSection && (
        <HeaderSection settings={headerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
      
      <div className="flex-1">{renderContent()}</div>

      {CustomFooter ? <CustomFooter /> : footerSection && (
        <FooterSection settings={footerSection.settings} themeSettings={settings} themeId={activeThemeId} />
      )}
    </div>
  );
};
