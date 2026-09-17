import React, { useState } from 'react';
import {
  ChevronDown,
  Menu,
  User as UserIcon,
} from 'lucide-react';
import { Store as StoreType, ViewMode, User } from '../../types';
import { useLanguage, LanguageSwitchButton } from '../../contexts/LanguageContext';

interface TopBarProps {
  stores?: StoreType[];
  activeStore?: StoreType;
  viewMode?: ViewMode;
  pendingOrdersCount?: number;
  user: User | null;
  onSelectStore?: (storeId: string) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onOpenShareModal?: () => void;
  onToggleSidebar?: () => void;
  onCreateNewStore?: () => void;
  onLogout?: () => void;
  onNavigateAuth?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onToggleSidebar,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header 
      id="topbar-main" 
      className="sticky top-0 z-30 bg-white border-b border-[#E5E0DD] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between shadow-2xs font-poppins transition-all w-full max-w-full"
    >
      {/* Left side: Mobile Hamburger Toggle */}
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#706866] hover:text-[#241A1A] hover:bg-[#FAF7F7] transition cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 border border-[#E5E0DD]"
            aria-label={t('open_menu', 'Buka Menu')}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Right side: Language Switcher & User Profile (Pemilik Toko) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Switch Button (ID / EN) */}
        <LanguageSwitchButton />

        <div className="relative shrink-0">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E5E0DD] bg-[#FAF7F7] hover:bg-white hover:border-[#66000E]/40 transition text-left cursor-pointer min-h-[36px] shadow-2xs"
            aria-label={t('store_owner', 'Pemilik Toko')}
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#66000E] text-white flex items-center justify-center font-medium text-xs shrink-0 shadow-2xs">
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[120px]">
              <span className="font-medium text-[#241A1A] text-xs truncate leading-tight">
                {user?.name || t('store_owner', 'Pemilik Toko')}
              </span>
              <span className="text-[10px] text-[#706866] font-normal leading-tight truncate">
                {t('store_owner', 'Pemilik Toko')}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#706866] ml-0.5" />
          </button>

          {userDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E5E0DD] p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E5E0DD]">
                  <div className="w-9 h-9 rounded-full bg-[#66000E] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-xs text-[#241A1A] truncate">
                        {user?.name || t('store_owner', 'Pemilik Toko')}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF7F7] text-[#66000E] font-medium border border-[#E6DDDA]">
                        UMKM
                      </span>
                    </div>
                    <p className="text-[11px] text-[#706866] truncate font-normal mt-0.5">{user?.email || 'merchant@kroomify.id'}</p>
                  </div>
                </div>

                <div className="pt-2.5 px-1 text-[11px] text-[#706866] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>{t('account_role', 'Peran Akun:')}</span>
                    <span className="font-medium text-[#241A1A]">{user?.role === 'admin' ? 'Super Admin' : t('store_owner', 'Pemilik Toko')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('account_status', 'Status Akun:')}</span>
                    <span className="font-medium text-emerald-700">{t('verified', 'Terverifikasi')}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
