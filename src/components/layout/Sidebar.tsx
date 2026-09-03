import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Settings,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  Store,
  X,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { MerchantTab, Store as StoreType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface SidebarProps {
  activeTab: MerchantTab;
  pendingOrdersCount: number;
  activeStore: StoreType;
  userName?: string;
  isCollapsed: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onTabChange: (tab: MerchantTab) => void;
  onToggleCollapse: () => void;
  onOpenShareModal: () => void;
  onOpenStorefront: () => void;
  onOpenChatbot?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  pendingOrdersCount,
  activeStore,
  isCollapsed,
  isOpenMobile = false,
  onCloseMobile,
  onTabChange,
  onToggleCollapse,
  onOpenStorefront,
  onLogout,
}) => {
  const { t } = useLanguage();

  const navItems: { id: MerchantTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'beranda', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'produk', label: t('nav_products', 'Produk'), icon: Package },
    { id: 'pesanan', label: t('nav_orders', 'Pesanan'), icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'layout', label: t('nav_layout', 'Layout Toko'), icon: LayoutTemplate },
    { id: 'integrasi', label: t('nav_payments_shipping', 'Pembayaran & Pengiriman'), icon: Layers },
    { id: 'pengaturan', label: t('nav_settings', 'Pengaturan'), icon: Settings },
  ];

  const handleItemClick = (id: MerchantTab) => {
    onTabChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white text-[#241A1A] font-sans">
      {/* Top Header Logo */}
      <div className="p-4 flex items-center justify-between border-b border-[#E5E0DD] shrink-0">
        <button
          type="button"
          onClick={() => handleItemClick('beranda')}
          className="flex items-center gap-2.5 text-left cursor-pointer group bg-transparent border-0 p-0 focus:outline-none"
          title="Kroombox"
        >
          <div className="w-9 h-9 rounded-xl bg-[#66000E] flex items-center justify-center shadow-xs group-hover:bg-[#801010] transition-colors shrink-0">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          {(!isCollapsed || isOpenMobile) && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-[#241A1A] group-hover:text-[#66000E] transition-colors">
                  Kroombox
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FAF7F7] text-[#66000E] border border-[#E6DDDA]">
                  UMKM
                </span>
              </div>
            </div>
          )}
        </button>

        {/* Mobile/Tablet Close Button */}
        {isOpenMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl bg-[#FAF7F7] text-[#706866] hover:text-[#241A1A] hover:bg-[#E5E0DD] transition cursor-pointer"
            aria-label={t('open_menu', 'Tutup Menu')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showLabel = !isCollapsed || isOpenMobile;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors group relative cursor-pointer min-h-[44px] ${
                isActive
                  ? 'bg-[#F9EDEF] text-[#66000E] font-semibold'
                  : 'text-[#5A5250] hover:bg-[#FAF7F7] hover:text-[#241A1A]'
              }`}
              title={isCollapsed && !isOpenMobile ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-[#66000E]' : 'text-[#706866] group-hover:text-[#241A1A]'
                }`}
              />

              {showLabel && <span className="flex-1 text-left">{item.label}</span>}

              {/* Badges for pending orders */}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-[#66000E] text-white' : 'bg-[#FAF7F7] text-[#66000E] border border-[#E6DDDA]'
                  } ${isCollapsed && !isOpenMobile ? 'absolute -top-1 -right-1' : ''}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Store Info & "Lihat Toko" Action (Replacing Asisten Bantuan card) */}
      {(!isCollapsed || isOpenMobile) ? (
        <div className="p-3 mx-3 my-2 rounded-2xl bg-[#FAF7F7] border border-[#E5E0DD] text-xs shrink-0 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#66000E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <Store className="w-4 h-4" />
            </div>
            <div className="truncate flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs text-[#241A1A] truncate leading-tight">
                  {activeStore.name}
                </h4>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title={t('nav_store_active', 'Toko Online Aktif')}></span>
              </div>
              <p className="text-[10px] text-[#706866] font-mono truncate mt-0.5">
                kroombox.id/{activeStore.slug}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenStorefront();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#66000E] bg-white hover:bg-[#F9EDEF] border border-[#E5E0DD] hover:border-[#66000E]/40 py-2 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98"
            title={t('nav_view_store', 'Lihat Toko')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('nav_view_store', 'Lihat Toko')}</span>
          </button>
        </div>
      ) : (
        <div className="p-2 mx-auto my-2 shrink-0 flex justify-center">
          <button
            type="button"
            onClick={onOpenStorefront}
            className="w-10 h-10 rounded-xl bg-[#FAF7F7] hover:bg-[#F9EDEF] border border-[#E5E0DD] hover:border-[#66000E]/40 text-[#66000E] flex items-center justify-center transition shadow-2xs cursor-pointer"
            title={`${t('nav_view_store', 'Lihat Toko')} (${activeStore.name})`}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Logout Bottom Action */}
      <div className="p-3 border-t border-[#E5E0DD] shrink-0">
        {(!isCollapsed || isOpenMobile) ? (
          <button
            type="button"
            onClick={() => {
              if (onLogout) onLogout();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-[#FAF7F7] hover:bg-rose-50 border border-[#E5E0DD] hover:border-rose-200 transition duration-150 text-left cursor-pointer group shadow-2xs"
            title={t('nav_logout', 'Keluar (Logout)')}
          >
            <div className="w-7 h-7 rounded-lg bg-white border border-[#E5E0DD] group-hover:border-rose-200 text-rose-600 flex items-center justify-center shrink-0 transition-colors shadow-2xs">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <div className="truncate flex-1 min-w-0">
              <span className="block font-medium text-rose-600 text-xs leading-tight">{t('nav_logout', 'Keluar (Logout)')}</span>
            </div>
          </button>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onLogout}
              className="w-10 h-10 rounded-xl text-rose-600 hover:bg-rose-50 border border-[#E5E0DD] hover:border-rose-200 bg-[#FAF7F7] flex items-center justify-center transition cursor-pointer shadow-2xs"
              title={t('nav_logout', 'Keluar (Logout)')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP PERMANENT SIDEBAR (lg+) */}
      <aside
        id="sidebar-navigation-desktop"
        className={`hidden lg:flex relative h-full flex-col justify-between z-20 transition-all duration-300 border-r border-[#E5E0DD] shrink-0 bg-white ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}

        {/* Floating Right-Border Collapse Button (Image reference match) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-[#E5E0DD] text-[#706866] hover:text-[#66000E] hover:border-[#66000E] shadow-sm hover:shadow flex items-center justify-center transition-all duration-150 cursor-pointer z-30 hover:scale-110 active:scale-95 focus:outline-none"
          title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          aria-label={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      {/* 2. MOBILE & TABLET SLIDE-OVER DRAWER (< lg) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog">
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            id="sidebar-navigation-mobile"
            className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] h-full shadow-2xl z-50 animate-in slide-in-from-left duration-300 border-r border-[#E5E0DD] bg-white"
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
