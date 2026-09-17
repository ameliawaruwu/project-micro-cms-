import React from 'react';
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { AdminTab, AdminNavItem } from '../types';

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  navItems: AdminNavItem[];
  onBackToMerchant?: () => void;
  onLogout?: () => void;
  language: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  navItems,
  onBackToMerchant,
  onLogout,
  language,
}) => {
  return (
    <>
      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* SIDEBAR DRAWER (FIXED) */}
      <aside
        className={`h-screen bg-white border-r border-gray-200 flex flex-col justify-between z-40 transition-all duration-300 ease-in-out shrink-0 ${
          isSidebarOpen ? 'w-60' : 'w-16'
        }`}
      >
        <div className={`p-3 flex flex-col h-full overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-16'}`}>
          {/* Brand Header */}
          <div className={`flex items-center pb-3.5 border-b border-gray-100 ${isSidebarOpen ? 'justify-between' : 'justify-center flex-col gap-2'}`}>
            <div className={`flex items-center gap-2.5 ${!isSidebarOpen ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              {isSidebarOpen && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900 tracking-tight">Kroombox</span>
                    <span className="px-1 py-0.2 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
                      ADMIN
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 block leading-tight truncate">Super Admin Panel</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
              title={isSidebarOpen ? (language === 'en' ? 'Collapse Menu' : 'Ciutkan Menu') : (language === 'en' ? 'Expand Menu' : 'Perluas Menu')}
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-3 space-y-1 flex-1 overflow-y-auto font-poppins">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={!isSidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center rounded-md text-xs font-medium font-poppins transition cursor-pointer relative group ${
                    isSidebarOpen ? 'justify-between px-2.5 py-2' : 'justify-center p-2'
                  } ${
                    isActive
                      ? 'bg-rose-50 text-[#800000] font-semibold'
                      : 'text-gray-600 hover:bg-rose-50/50 hover:text-[#800000]'
                  }`}
                >
                  <div className={`flex items-center ${isSidebarOpen ? 'gap-2.5 min-w-0' : 'justify-center'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badge */}
                  {item.badge !== undefined && (
                    isSidebarOpen ? (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                          isActive ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1 right-1" />
                    )
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-gray-100 space-y-1">
            {onBackToMerchant && (
              <button
                onClick={onBackToMerchant}
                title={!isSidebarOpen ? (language === 'en' ? 'Merchant Mode' : 'Mode Merchant') : undefined}
                className={`w-full flex items-center rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200/80 transition cursor-pointer ${
                  isSidebarOpen ? 'gap-2 px-2.5 py-1.5' : 'justify-center p-2'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                {isSidebarOpen && <span>{language === 'en' ? 'Merchant Mode' : 'Mode Merchant'}</span>}
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                title={!isSidebarOpen ? (language === 'en' ? 'Logout' : 'Keluar') : undefined}
                className={`w-full flex items-center rounded-md text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition cursor-pointer ${
                  isSidebarOpen ? 'gap-2 px-2.5 py-1.5' : 'justify-center p-2'
                }`}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                {isSidebarOpen && <span>{language === 'en' ? 'Logout' : 'Keluar'}</span>}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
