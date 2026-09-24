import React from 'react';
import { LanguageSwitchButton } from '../../../contexts/LanguageContext';
import { AdminTab, AdminNavItem } from '../types';

interface AdminHeaderProps {
  activeTab: AdminTab;
  navItems: AdminNavItem[];
  language: string;
  activeAdminName: string;
  activeAdminEmail: string;
  activeAdminAvatar?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  navItems,
  language,
  activeAdminName,
  activeAdminEmail,
  activeAdminAvatar,
}) => {
  return (
    <header className="shrink-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Left: Spacer */}
      <div className="flex items-center gap-2" />

      <div className="flex items-center gap-3 shrink-0">
        {/* Language Switcher Button */}
        <LanguageSwitchButton compact />

        <div className="h-4 w-px bg-gray-200" />

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {language === 'en' ? 'System Active' : 'Sistem Aktif'}
        </span>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        {/* Logged in User Profile Info */}
        <div className="flex items-center gap-2.5">
          {activeAdminAvatar ? (
            <img
              src={activeAdminAvatar}
              alt={activeAdminName}
              className="w-7 h-7 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-linear-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {activeAdminName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-gray-900 max-w-[120px] sm:max-w-[180px] truncate">
              {activeAdminName}
            </span>
            <span className="text-[10px] text-gray-500 font-medium max-w-[120px] sm:max-w-[180px] truncate">
              {activeAdminEmail}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
