import React from 'react';
import { User, Settings } from 'lucide-react';
import { LanguageSwitchButton } from '../../../contexts/LanguageContext';
import { AdminTab, AdminNavItem } from '../types';

interface AdminHeaderProps {
  activeTab: AdminTab;
  navItems: AdminNavItem[];
  language: string;
  activeAdminName: string;
  activeAdminEmail: string;
  activeAdminAvatar?: string;
  onOpenProfile?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  navItems,
  language,
  activeAdminName,
  activeAdminEmail,
  activeAdminAvatar,
  onOpenProfile,
}) => {
  const initials = (activeAdminName || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <header className="shrink-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
      {/* Left: Spacer */}
      <div className="flex items-center gap-2" />

      <div className="flex items-center gap-3 shrink-0">
        {/* Language Switcher Button */}
        <LanguageSwitchButton compact />

        <div className="h-4 w-px bg-gray-200" />

        {/* Logged in User Profile Info (Clickable to open Profile Settings) */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 px-2 py-1 -my-1 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition cursor-pointer text-left group"
          title={language === 'en' ? 'Profile Settings' : 'Pengaturan Profil Admin'}
        >
          {activeAdminAvatar ? (
            <img
              src={activeAdminAvatar}
              alt={activeAdminName}
              className="w-7 h-7 rounded-full object-cover border border-gray-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#66000E] to-[#8A0013] text-white flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0 tracking-wider">
              {initials || <User className="w-3.5 h-3.5" />}
            </div>
          )}
          <div className="flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-gray-900 max-w-[120px] sm:max-w-[180px] truncate flex items-center gap-1">
              <span>{activeAdminName}</span>
              <Settings className="w-3 h-3 text-gray-400 group-hover:text-[#66000E] transition shrink-0" />
            </span>
            <span className="text-[10px] text-gray-500 font-medium max-w-[120px] sm:max-w-[180px] truncate">
              {activeAdminEmail}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
