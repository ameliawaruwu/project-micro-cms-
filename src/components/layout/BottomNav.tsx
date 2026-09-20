import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  MoreHorizontal,
  LayoutTemplate,
  CreditCard,
  Settings,
  X,
  Store,
  ChevronRight,
} from 'lucide-react';
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // 4 Menu Utama Paling Penting untuk Operasional Sehari-hari
  const primaryItems = [
    { id: 'beranda' as MerchantTab, label: t('nav_dashboard', 'Beranda'), icon: LayoutDashboard },
    { id: 'pesanan' as MerchantTab, label: t('nav_orders', 'Pesanan'), icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'produk' as MerchantTab, label: t('nav_products', 'Produk'), icon: Package },
    { id: 'pengiriman' as MerchantTab, label: t('nav_shipping', 'Pengiriman'), icon: Truck },
  ];

  // Menu Pendukung yang dapat diakses via "Lainnya"
  const secondaryItems = [
    {
      id: 'layout' as MerchantTab,
      label: t('bottomnav_store_design', 'Desain & Layout Toko'),
      desc: t('bottomnav_store_design_desc', 'Atur banner, hero, & tampilan toko'),
      icon: LayoutTemplate,
    },
    {
      id: 'pembayaran' as MerchantTab,
      label: t('bottomnav_payment_methods', 'Metode Pembayaran'),
      desc: t('bottomnav_payment_methods_desc', 'Kelola QRIS, VA, dan rekening pencairan'),
      icon: CreditCard,
    },
    {
      id: 'pengaturan' as MerchantTab,
      label: t('bottomnav_store_settings', 'Pengaturan Toko'),
      desc: t('bottomnav_store_settings_desc', 'Nama toko, logo, kontak WA, & profil'),
      icon: Settings,
    },
  ];

  const isSecondaryActive = ['layout', 'pembayaran', 'pengaturan'].includes(activeTab);

  const handleSelectTab = (tab: MerchantTab) => {
    onTabChange(tab);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Sheet Menu Lainnya */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center lg:hidden font-poppins animate-in fade-in duration-150"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md p-5 pb-8 shadow-2xl border-t border-[#E5E0DD] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bottom Sheet */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E0DD]">
              <div className="flex items-center gap-2 text-[#241A1A]">
                <Store className="w-5 h-5 text-[#66000E]" />
                <h4 className="font-semibold text-sm">{t('bottomnav_more', 'Fitur & Pengaturan Toko')}</h4>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF7F7] text-[#706866] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Menu Pendukung */}
            <div className="mt-3 space-y-2 font-poppins">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition text-left cursor-pointer border ${
                      isActive
                        ? 'bg-[#F5E8EA] border-[#E8DDDE] text-[#66000E]'
                        : 'bg-white hover:bg-[#FAF7F7] border-[#E5E0DD] text-[#241A1A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-[#66000E] text-white' : 'bg-[#FAF7F7] text-[#706866]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${isActive ? 'text-[#66000E]' : 'text-[#241A1A]'}`}>
                          {item.label}
                        </p>
                        <p className="text-[11px] text-[#706866] line-clamp-1 font-normal">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-[#66000E]' : 'text-[#CCCCCC]'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Bottom Navigation Bar (5 Items Utama) */}
      <nav
        id="merchant-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E0DD] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.04)] lg:hidden font-poppins"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[56px] min-h-[46px] transition-all duration-150 relative cursor-pointer font-poppins ${
                isActive
                  ? 'text-[#66000E] font-semibold'
                  : 'text-[#706866] hover:text-[#241A1A] font-normal'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'text-[#66000E] stroke-[2.2] scale-105' : 'text-[#706866]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#66000E] text-white text-[9px] font-medium px-1.5 py-0.2 rounded-full border-2 border-white shadow-2xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-medium text-[#66000E]' : 'text-[#706866] font-normal'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-3.5 h-0.5 bg-[#66000E] rounded-full mt-0.5 animate-in fade-in duration-200"></span>
              )}
            </button>
          );
        })}

        {/* Tab Ke-5: Menu Lainnya (Lainnya / Pengaturan) */}
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl min-w-[56px] min-h-[46px] transition-all duration-150 relative cursor-pointer font-poppins ${
            isSecondaryActive
              ? 'text-[#66000E] font-semibold'
              : 'text-[#706866] hover:text-[#241A1A] font-normal'
          }`}
        >
          <div className="relative">
            <MoreHorizontal
              className={`w-5 h-5 transition-transform ${
                isSecondaryActive ? 'text-[#66000E] stroke-[2.2] scale-105' : 'text-[#706866]'
              }`}
            />
            {isSecondaryActive && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 bg-[#66000E] rounded-full border border-white"></span>
            )}
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-tight ${
              isSecondaryActive ? 'font-medium text-[#66000E]' : 'text-[#706866] font-normal'
            }`}
          >
            {t('bottomnav_more', 'Lainnya')}
          </span>
          {isSecondaryActive && (
            <span className="w-3.5 h-0.5 bg-[#66000E] rounded-full mt-0.5 animate-in fade-in duration-200"></span>
          )}
        </button>
      </nav>
    </>
  );
};
