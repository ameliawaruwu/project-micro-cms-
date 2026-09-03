import React from 'react';
import { LayoutDashboard, Package, ShoppingBag, LayoutTemplate, Layers, Settings } from 'lucide-react';
import { MerchantTab } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface BottomNavProps {
  activeTab: MerchantTab;
  pendingOrdersCount: number;
  onTabChange: (tab: MerchantTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  pendingOrdersCount,
  onTabChange,
}) => {
  const { t } = useLanguage();

  const items: { id: MerchantTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'beranda', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'produk', label: t('nav_products', 'Produk'), icon: Package },
    { id: 'pesanan', label: t('nav_orders', 'Pesanan'), icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'layout', label: t('nav_layout', 'Layout'), icon: LayoutTemplate },
    { id: 'integrasi', label: t('nav_payments_shipping', 'Bayar & Kirim'), icon: Layers },
    { id: 'pengaturan', label: t('nav_settings', 'Pengaturan'), icon: Settings },
  ];

  return (
    <nav
      id="merchant-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#E5E0DD] px-1 sm:px-2 py-1 flex items-center justify-around shadow-lg lg:hidden font-sans"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1 sm:px-1.5 rounded-xl min-w-[48px] sm:min-w-[56px] min-h-[44px] transition-all duration-150 relative cursor-pointer ${
              isActive
                ? 'text-[#66000E] font-bold bg-[#FAF7F7]'
                : 'text-[#706866] hover:text-[#241A1A] font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? 'text-[#66000E] stroke-[2.4] scale-105' : 'text-[#706866]'}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#66000E] text-white text-[9px] font-bold px-1 py-0.2 rounded-full border border-white shadow-2xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] sm:text-[10px] mt-0.5 truncate max-w-[52px] ${isActive ? 'font-bold text-[#66000E]' : 'text-[#706866]'}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="w-3 h-0.5 bg-[#66000E] rounded-full mt-0.5 animate-in fade-in duration-200"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
