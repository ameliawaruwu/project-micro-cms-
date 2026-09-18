import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Settings,
  CreditCard,
  Truck,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  LogOut,
  Crown,
} from 'lucide-react';
import { MerchantTab, Store as StoreType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { KroomifyLogo } from '../common/KroomifyLogo';

interface SidebarProps {
  activeTab: MerchantTab;
  pendingOrdersCount: number;
  activeStore?: StoreType;
  userName?: string;
  isCollapsed: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onTabChange: (tab: MerchantTab) => void;
  onToggleCollapse: () => void;
  onOpenShareModal: () => void;
  onOpenStorefront?: () => void;
  onOpenChatbot?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  pendingOrdersCount,
  isCollapsed,
  isOpenMobile = false,
  onCloseMobile,
  onTabChange,
  onToggleCollapse,
  onLogout,
}) => {
  const { t } = useLanguage();

  const navItems = [
    { id: 'beranda' as MerchantTab, label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'produk' as MerchantTab, label: t('nav_products', 'Produk'), icon: Package },
    { id: 'pesanan' as MerchantTab, label: t('nav_orders', 'Pesanan'), icon: ShoppingBag, badge: pendingOrdersCount },
    { 
      id: 'website', 
      label: 'Website', 
      icon: LayoutTemplate,
      isParent: true,
      children: [
        { id: 'layout' as MerchantTab, label: t('nav_layout', 'Layout Toko') },
        { id: 'domain' as MerchantTab, label: 'Domain' }
      ]
    },
    { id: 'pembayaran' as MerchantTab, label: t('nav_payment', 'Pembayaran'), icon: CreditCard },
    { id: 'pengiriman' as MerchantTab, label: t('nav_shipping', 'Pengiriman'), icon: Truck },
    { id: 'billing' as MerchantTab, label: t('nav_billing', 'Billing Plan'), icon: Crown },
    { id: 'pengaturan' as MerchantTab, label: t('nav_settings', 'Pengaturan'), icon: Settings },
  ];

  const [isWebsiteMenuExpanded, setIsWebsiteMenuExpanded] = useState(
    activeTab === 'layout' || activeTab === 'domain'
  );

  useEffect(() => {
    if (activeTab === 'layout' || activeTab === 'domain') {
      setIsWebsiteMenuExpanded(true);
    }
  }, [activeTab]);

  const handleItemClick = (id: MerchantTab) => {
    onTabChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-gray-900 font-poppins">
      {/* Top Header Logo */}
      <div className="p-3.5 flex items-center justify-between border-b border-gray-100 shrink-0">
        <button
          type="button"
          onClick={() => handleItemClick('beranda')}
          className="flex items-center gap-2.5 text-left cursor-pointer group bg-transparent border-0 p-0 focus:outline-none"
          title="Kroomify"
        >
          <KroomifyLogo
            size="sm"
            showText={!isCollapsed || isOpenMobile}
          />
        </button>

        {/* Mobile Close Button */}
        {isOpenMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label={t('open_menu', 'Tutup Menu')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto font-poppins">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isParent 
            ? item.children?.some(child => child.id === activeTab)
            : activeTab === item.id;
          const showLabel = !isCollapsed || isOpenMobile;
          
          if (item.isParent) {
            return (
              <div key={item.id} className="space-y-0.5">
                <button
                  onClick={() => setIsWebsiteMenuExpanded(!isWebsiteMenuExpanded)}
                  className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors group relative cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed && !isOpenMobile ? item.label : undefined}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-700'
                      }`}
                    />
                    {showLabel && <span className="flex-1 text-left truncate">{item.label}</span>}
                  </div>
                  {showLabel && (
                    isWebsiteMenuExpanded ? <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  )}
                </button>
                
                {showLabel && isWebsiteMenuExpanded && item.children && (
                  <div className="ml-6 space-y-0.5 mt-1">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => handleItemClick(child.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          activeTab === child.id
                            ? 'text-red-700 font-semibold bg-red-50/50'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex-1 text-left truncate">{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id as MerchantTab)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium font-poppins transition-colors group relative cursor-pointer ${
                isActive
                  ? 'bg-rose-50 text-[#800000] font-semibold'
                  : 'text-gray-600 hover:bg-rose-50/50 hover:text-[#800000]'
              }`}
              title={isCollapsed && !isOpenMobile ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#800000]' : 'text-gray-400 group-hover:text-[#800000]'
                }`}
              />

              {showLabel && <span className="flex-1 text-left">{item.label}</span>}

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.2 rounded shrink-0 ${
                    isActive ? 'bg-[#800000] text-white' : 'bg-rose-100 text-[#800000]'
                  } ${isCollapsed && !isOpenMobile ? 'absolute -top-1 -right-1' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>



      {/* Logout Bottom Action */}
      <div className="p-2.5 border-t border-gray-100 shrink-0 font-poppins">
        {(!isCollapsed || isOpenMobile) ? (
          <button
            type="button"
            onClick={() => {
              if (onLogout) onLogout();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-gray-600 hover:text-[#800000] hover:bg-rose-50/50 transition cursor-pointer"
            title={t('nav_logout', 'Keluar')}
          >
            <LogOut className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{t('nav_logout', 'Keluar')}</span>
          </button>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onLogout}
              className="w-8 h-8 rounded-md text-gray-400 hover:text-[#800000] hover:bg-rose-50/50 flex items-center justify-center transition cursor-pointer"
              title={t('nav_logout', 'Keluar')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT SIDEBAR */}
      <aside
        id="sidebar-navigation-desktop"
        className={`hidden lg:flex relative h-full flex-col justify-between z-30 transition-all duration-200 border-r border-gray-200 shrink-0 bg-white ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}

        {/* Collapse Button (Centered Vertically) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-xs hover:shadow-sm flex items-center justify-center transition-all cursor-pointer z-40 focus:outline-none hover:scale-105"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* 2. MOBILE SLIDE-OVER DRAWER */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog">
          <div
            className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          <aside
            id="sidebar-navigation-mobile"
            className="fixed top-0 left-0 bottom-0 w-64 max-w-[80vw] h-full shadow-xl z-50 animate-in slide-in-from-left duration-200 border-r border-gray-200 bg-white"
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
